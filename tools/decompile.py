#!/usr/bin/env python3
"""Decompila o export .bubble em markdown legível, uma página/reusable por arquivo.

Determinístico: tudo que existe no JSON sai no markdown (elementos, estados
condicionais, workflows, ações). É a base "nada se perde" do mapeamento; os
agentes escrevem a spec funcional em cima disto.

  python3 tools/decompile.py bruto/grupomegabox.bubble mapa/
"""
import json, sys, os, re, collections

SRC, OUT = sys.argv[1], sys.argv[2]
D = json.load(open(SRC))
os.makedirs(OUT, exist_ok=True)

# ------------------------------------------------------------------ dicionários
TYPES = {k: v for k, v in D.get('user_types', {}).items() if isinstance(v, dict)}
FIELD = {}                     # field_id -> display
for tk, t in TYPES.items():
    for fk, f in (t.get('fields') or {}).items():
        if isinstance(f, dict):
            FIELD[fk] = f.get('display', fk)
TYPE_NAME = {('custom.' + k): v.get('display', k) for k, v in TYPES.items()}
TYPE_NAME['user'] = 'User'
OPTS = {k: v for k, v in D.get('option_sets', {}).items() if isinstance(v, dict)}
OPT_NAME = {('option.' + k): v.get('display', k) for k, v in OPTS.items()}

def optval(setk, valk):
    s = OPTS.get(setk.replace('option.', ''), {})
    for v in (s.get('values') or {}).values():
        if isinstance(v, dict) and v.get('db_value') == valk:
            return v.get('display', valk)
    return valk

PLUGINS = {}
for pk, pv in (D.get('settings', {}).get('client_safe', {}).get('plugins') or {}).items():
    if isinstance(pv, dict):
        PLUGINS[pk] = pv.get('name') or pv.get('display') or pk

def plugin_label(t):
    if not t:
        return 'SEM_TIPO'
    m = re.match(r'^(\d+x\d+)-(\w+)$', t or '')
    if not m:
        return t
    return f"Plugin[{PLUGINS.get(m.group(1), m.group(1))}]/{m.group(2)}"

# nomes de todos os elementos do app (para GetElement)
EL_NAME = {}
def index_elements(node, owner):
    if not isinstance(node, dict):
        return
    for k, e in (node.get('elements') or {}).items():
        if isinstance(e, dict):
            EL_NAME[e.get('id', k)] = (e.get('name') or e.get('default_name') or e.get('id'), owner)
            index_elements(e, owner)
for coll in ('pages', 'element_definitions'):
    for pk, p in D.get(coll, {}).items():
        if isinstance(p, dict):
            EL_NAME[p.get('id', pk)] = (p.get('name'), p.get('name'))
            index_elements(p, p.get('name'))

for _id, _path in (D.get('_index', {}).get('id_to_path') or {}).items():
    parts = _path.split('.')
    if len(parts) == 2 and parts[0] in ('%p3', '%ed'):
        coll = 'pages' if parts[0] == '%p3' else 'element_definitions'
        node = D.get(coll, {}).get(parts[1])
        if isinstance(node, dict):
            EL_NAME[_id] = (('Página ' if coll == 'pages' else 'Reusable ') + str(node.get('name')), node.get('name'))

# ações/eventos: id -> rótulo (para PreviousStep)
def fname(n):
    return FIELD.get(n, n)

# ------------------------------------------------------------------ expressões
def lit(v):
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    return str(v)

def expr(x, depth=0):
    """Renderiza uma expressão Bubble como texto."""
    if depth > 60:
        return '…'
    if x is None:
        return '∅'
    if not isinstance(x, dict):
        return lit(x)
    t = x.get('type')
    p = x.get('properties') or {}
    if t == 'TextExpression':
        ents = x.get('entries') or {}
        parts = []
        for k in sorted(ents, key=lambda s: int(s) if str(s).isdigit() else 0):
            v = ents[k]
            parts.append(v if isinstance(v, str) else '{' + expr(v, depth + 1) + '}')
        s = ''.join(parts)
        return '"' + s.replace('\n', '⏎') + '"'
    if t == 'Empty':
        base = '∅'
    elif t == 'GetElement':
        n = EL_NAME.get(p.get('element_id'), (p.get('element_id'), None))[0]
        base = f"El[{n}]"
    elif t == 'ElementParent':
        base = 'Parent'
    elif t == 'ElementAncestor':
        base = f"Ancestor[{p.get('ancestor_type', '')}]"
    elif t == 'ThisElement':
        base = 'This'
    elif t == 'CurrentUser':
        base = 'CurrentUser'
    elif t == 'PageData':
        base = f"Page.{p.get('name')}"
    elif t in ('OneOptionValue', 'OptionValue'):
        base = f"{OPT_NAME.get(p.get('option_set'), p.get('option_set'))}.{optval(p.get('option_set', ''), p.get('option_value'))}"
    elif t == 'AllOptionValue':
        base = f"All({OPT_NAME.get(p.get('option_set'), p.get('option_set'))})"
    elif t == 'GetParamFromUrl':
        base = f"UrlParam({expr(p.get('parameter_name'), depth + 1)} as {p.get('value')})"
    elif t == 'ArbitraryText':
        base = f"Text({expr(p.get('arbitrary_text'), depth + 1)})"
    elif t == 'APIEventParameter':
        base = f"Param.{p.get('param_name')}"
    elif t == 'CurrentWorkflowItem':
        base = f"WFParam.{p.get('param_name')}"
    elif t == 'PreviousStep':
        base = f"ResultOfStep[{p.get('action_id')}]"
    elif t == 'CurrentCellsIndex':
        base = 'CellIndex'
    elif t == 'DateTime':
        base = f"Date({p.get('parsed_date')})"
    elif t == 'Breakpoint':
        base = f"Breakpoint({p.get('breakpoint_id')})"
    elif t == 'InjectedValue':
        base = 'InjectedValue'
    elif t == 'GetDataFromAPI':
        base = f"API({p.get('api_call') or p.get('call_id') or compact(p)})"
    elif t == 'Search':
        cons = []
        for c in (p.get('constraints') or {}).values():
            if isinstance(c, dict):
                cons.append(f"{fname(c.get('key'))} {c.get('constraint_type', '=')} {expr(c.get('value'), depth + 1)}")
        extra = []
        sf = p.get('sort_field') or p.get('sorted_by')
        if sf:
            extra.append(f"sort {fname(sf)}{' desc' if p.get('descending') else ''}")
        if p.get('dynamic_sort_field'):
            extra.append(f"sort dinâmico {expr(p.get('dynamic_sort_field'), depth + 1)}")
        if p.get('ignore_empty_constraints'):
            extra.append('ignore empty')
        base = f"Search({TYPE_NAME.get(p.get('type_to_find'), p.get('type_to_find'))}{': ' + ' AND '.join(cons) if cons else ''}{'; ' + ', '.join(extra) if extra else ''})"
    elif t == 'Message':
        base = None
    else:
        base = f"{t}({compact(p)})" if p else t
    s = base or ''
    nxt = x.get('next') if t != 'Message' else x
    while isinstance(nxt, dict):
        if nxt.get('type') != 'Message':
            s += ' → ' + expr(nxt, depth + 1)
            break
        name = fname(nxt.get('name'))
        args = nxt.get('args')
        props = nxt.get('properties')
        a = []
        if args is not None:
            a.append(expr(args, depth + 1))
        if props:
            a.append(render_props(props, depth + 1))
        s += f":{name}" + (f"({', '.join(a)})" if a else '')
        nxt = nxt.get('next')
    return s

def render_props(props, depth=0):
    out = []
    for k, v in props.items():
        if isinstance(v, dict) and 'type' in v:
            out.append(f"{fname(k)}={expr(v, depth + 1)}")
        elif isinstance(v, dict):
            out.append(f"{fname(k)}={{{render_props(v, depth + 1)}}}")
        else:
            out.append(f"{fname(k)}={lit(v)}")
    return ', '.join(out)

def compact(p):
    try:
        return json.dumps(p, ensure_ascii=False)[:300]
    except Exception:
        return str(p)[:300]

# ------------------------------------------------------------------ elementos
LAYOUT = {'height', 'left', 'top', 'width', 'zindex', 'order', 'row_gap', 'column_gap', 'use_gap',
          'margin_top', 'margin_bottom', 'margin_left', 'margin_right', 'padding_top', 'padding_left',
          'padding_right', 'padding_bottom', 'vert_alignment', 'horiz_alignment', 'container_layout',
          'container_horiz_alignment', 'container_vert_alignment', 'single_height', 'single_width',
          'min_height_css', 'max_height_css', 'min_width_css', 'max_width_css', 'fixed_width', 'fixed_height',
          'fit_width', 'fit_height', 'collapse_when_hidden', 'collapse_animation', 'bgcolor', 'font_color',
          'font_size', 'font_face', 'border_roundness', 'border_width', 'border_color', 'border_style',
          'border_roundness_top', 'border_roundness_bottom', 'boxshadow_style', 'boxshadow_horizontal',
          'boxshadow_vertical', 'boxshadow_blur', 'boxshadow_spread', 'boxshadow_color', 'font_weight',
          'bold', 'italic', 'text_align', 'line_height', 'letter_spacing', 'responsive_version',
          'auto_binding_undoable', 'center_horiz', 'center_vert', 'fixed_position', 'min_height', 'max_height',
          'min_width', 'max_width', 'icon_color', 'hover_color', 'background_style', 'is_visible', 'is_hidden_in_editor'}

def el_line(e):
    p = e.get('properties') or {}
    t = plugin_label(e.get('type'))
    name = e.get('name') or e.get('default_name') or ''
    bits = []
    if p.get('is_visible') is False:
        bits.append('oculto ao carregar')
    for k in ('type_of_content', 'data_source', 'text', 'placeholder', 'initial_content', 'choices_source',
              'option_caption', 'button_text', 'label', 'content', 'image', 'link', 'default_value',
              'html', 'thing_type', 'list_type', 'auto_binding', 'auto_binding_field', 'number_of_rows',
              'number_of_columns', 'content_format', 'is_required'):
        if k in p:
            v = p[k]
            if k == 'html' and isinstance(v, dict):
                txt = expr(v)
                bits.append(f"html({len(txt)} chars)")
                continue
            if isinstance(v, dict) and 'type' in v:
                bits.append(f"{k}: {expr(v)}")
            elif k in ('type_of_content', 'thing_type', 'list_type'):
                bits.append(f"{k}: {TYPE_NAME.get(v, OPT_NAME.get(v, v))}")
            else:
                bits.append(f"{k}: {lit(v)}")
    rest = {k: v for k, v in p.items() if k not in LAYOUT and k not in (
        'type_of_content', 'data_source', 'text', 'placeholder', 'initial_content', 'choices_source',
        'option_caption', 'button_text', 'label', 'content', 'image', 'link', 'default_value', 'html',
        'thing_type', 'list_type', 'auto_binding', 'auto_binding_field', 'number_of_rows',
        'number_of_columns', 'content_format', 'is_required')}
    if rest:
        bits.append('props: ' + render_props(rest))
    if e.get('type') == 'CustomElement' and p.get('custom_id'):
        bits.insert(0, 'USA ' + str(EL_NAME.get(p.get('custom_id'), (p.get('custom_id'),))[0]))
    return f"**{t}** `{name}` ({e.get('id')})" + (' — ' + ' · '.join(bits) if bits else '')

def states_lines(e):
    out = []
    st = e.get('states') or {}
    for k in sorted(st, key=lambda s: int(s) if str(s).isdigit() else 0):
        s = st[k]
        if not isinstance(s, dict):
            continue
        cond = expr(s.get('condition'))
        if cond.startswith('Page.Current Page Width') or cond.startswith('Breakpoint'):
            continue  # responsivo: não é regra de negócio
        props = {kk: vv for kk, vv in (s.get('properties') or {}).items()}
        out.append(f"quando {cond} → {render_props(props)}")
    return out

def custom_states(e):
    cs = e.get('custom_states') or {}
    out = []
    for k, v in cs.items():
        if isinstance(v, dict):
            out.append(f"`{v.get('name', k)}` : {TYPE_NAME.get(v.get('value'), OPT_NAME.get(v.get('value'), v.get('value')))}"
                       + (' (lista)' if str(v.get('value', '')).startswith('list.') else ''))
    return out

def tree(node, depth, lines, stats):
    els = node.get('elements') or {}
    items = [e for e in els.values() if isinstance(e, dict)]
    items.sort(key=lambda e: ((e.get('properties') or {}).get('order', 0), (e.get('properties') or {}).get('top', 0)))
    for e in items:
        stats['elementos'] += 1
        stats['tipo:' + plugin_label(e.get('type'))] += 1
        pad = '  ' * depth
        lines.append(f"{pad}- {el_line(e)}")
        for c in custom_states(e):
            lines.append(f"{pad}  - estado customizado {c}")
            stats['custom_states'] += 1
        for s in states_lines(e):
            lines.append(f"{pad}  - ⟂ {s}")
            stats['condicionais'] += 1
        tree(e, depth + 1, lines, stats)

# ------------------------------------------------------------------ workflows
def action_line(a, i):
    t = plugin_label(a.get('type'))
    p = dict(a.get('properties') or {})
    bits = []
    if 'element_id' in p:
        bits.append(f"alvo El[{(lambda _i: EL_NAME.get(_i, (_i,))[0])(p.pop('element_id'))}]")
    if 'thing_type' in p:
        bits.append(f"tipo {TYPE_NAME.get(p.get('thing_type'), p.get('thing_type'))}")
        p.pop('thing_type')
    if 'condition' in p:
        bits.append(f"SÓ SE {expr(p.pop('condition'))}")
    if 'changes' in p and isinstance(p['changes'], dict):
        ch = []
        for c in p.pop('changes').values():
            if isinstance(c, dict):
                ch.append(f"{fname(c.get('key'))} = {expr(c.get('value'))}")
        bits.append('campos: ' + '; '.join(ch))
    if 'initial_values' in p and isinstance(p['initial_values'], dict):
        ch = []
        for c in p.pop('initial_values').values():
            if isinstance(c, dict):
                ch.append(f"{fname(c.get('key'))} = {expr(c.get('value'))}")
        bits.append('campos: ' + '; '.join(ch))
    if p:
        bits.append(render_props(p))
    return f"{i}. **{t}** [{a.get('id')}] " + ' · '.join(bits)

def workflows(node, lines, stats):
    wfs = node.get('workflows') or {}
    items = [w for w in wfs.values() if isinstance(w, dict)]
    for w in items:
        stats['workflows'] += 1
        p = dict(w.get('properties') or {})
        head = plugin_label(w.get('type'))
        if 'element_id' in p:
            head += f" em El[{(lambda _i: EL_NAME.get(_i, (_i,))[0])(p.pop('element_id'))}]"
        cond = p.pop('condition', None)
        wname = p.pop('wf_name', None) or w.get('name')
        extra = render_props(p) if p else ''
        lines.append(f"\n#### WF {w.get('id')} — {head}" + (f" «{wname}»" if wname else ''))
        if cond:
            lines.append(f"- condição: {expr(cond)}")
        if extra:
            lines.append(f"- props: {extra}")
        acts = w.get('actions') or {}
        for k in sorted([k for k in acts if str(k).isdigit()], key=int):
            a = acts[k]
            if isinstance(a, dict):
                stats['acoes'] += 1
                stats['acao:' + plugin_label(a.get('type'))] += 1
                lines.append(action_line(a, int(k) + 1))
        if w.get('disabled') or (w.get('properties') or {}).get('disabled'):
            lines.append('- (DESATIVADO)')

# ------------------------------------------------------------------ saída
def dump(node, kind):
    name = node.get('name')
    stats = collections.Counter()
    lines = []
    tree(node, 0, lines, stats)
    wl = []
    workflows(node, wl, stats)
    cs = custom_states(node)
    head = [f"# {kind}: `{name}` ({node.get('id')})", '']
    pp = node.get('properties') or {}
    if pp.get('type_of_content'):
        head.append(f"Tipo de dado da página/reusable: {TYPE_NAME.get(pp['type_of_content'], pp['type_of_content'])}")
    if cs:
        head.append('Estados customizados: ' + '; '.join(cs))
    head.append(f"\nResumo: {stats['elementos']} elementos · {stats['workflows']} workflows · {stats['acoes']} ações · "
                f"{stats['condicionais']} condicionais · {stats['custom_states'] + len(cs)} estados customizados")
    tipos = {k[5:]: v for k, v in stats.items() if k.startswith('tipo:')}
    head.append('Elementos por tipo: ' + ', '.join(f"{k} {v}" for k, v in sorted(tipos.items(), key=lambda kv: -kv[1])))
    body = head + ['', '## Árvore de elementos', ''] + lines + ['', '## Workflows'] + wl
    fn = os.path.join(OUT, f"{kind.lower()}-{name.replace(' ', '_').replace('/', '_')}.md")
    open(fn, 'w').write('\n'.join(body) + '\n')
    return name, stats, fn

inv = []
for pk, p in D['pages'].items():
    if isinstance(p, dict):
        inv.append(('Página',) + dump(p, 'Pagina'))
for pk, p in D['element_definitions'].items():
    if isinstance(p, dict):
        inv.append(('Reusable',) + dump(p, 'Reusable'))

# backend workflows
bl = ['# Backend workflows (API workflows)', '']
bstats = collections.Counter()
for k, w in D.get('api', {}).items():
    if not isinstance(w, dict):
        continue
    bstats['workflows'] += 1
    p = w.get('properties') or {}
    bl.append(f"\n#### {w.get('type')} `{p.get('wf_name') or w.get('name') or k}` ({w.get('id', k)})")
    params = p.get('parameters') or {}
    if params:
        ps = [f"{v.get('key')}: {TYPE_NAME.get(v.get('value'), OPT_NAME.get(v.get('value'), v.get('value')))}{' (lista)' if v.get('is_list') else ''}"
              for v in params.values() if isinstance(v, dict)]
        bl.append('- parâmetros: ' + ', '.join(ps))
    rest = {kk: vv for kk, vv in p.items() if kk not in ('parameters', 'wf_name')}
    if rest:
        bl.append('- props: ' + render_props(rest))
    acts = w.get('actions') or {}
    for kk in sorted([x for x in acts if str(x).isdigit()], key=int):
        a = acts[kk]
        if isinstance(a, dict):
            bstats['acoes'] += 1
            bl.append(action_line(a, int(kk) + 1))
open(os.path.join(OUT, 'backend-workflows.md'), 'w').write('\n'.join(bl) + '\n')

# data types e option sets
dl = ['# Data types (todos, inclusive os não expostos na Data API)', '']
for tk, t in sorted(TYPES.items(), key=lambda kv: kv[1].get('display', kv[0]).lower()):
    fields = {k: v for k, v in (t.get('fields') or {}).items() if isinstance(v, dict)}
    dl.append(f"\n## {t.get('display')} (`{tk}`) — {len(fields)} campos" + (' · exposto na API' if t.get('exposed_api') else ' · NÃO exposto na API'))
    dl.append('| Campo | id | Tipo | Excluído |\n|---|---|---|---|')
    for fk, f in fields.items():
        dl.append(f"| {f.get('display')} | `{fk}` | `{f.get('value')}` | {'sim' if f.get('deleted') else ''} |")
    pr = t.get('privacy_role') or t.get('privacy_roles')
    if pr:
        dl.append('\nPrivacy rules:')
        for rk, r in pr.items():
            if isinstance(r, dict):
                dl.append(f"- `{r.get('display', rk)}` — condição: {expr(r.get('condition')) if r.get('condition') else 'todos'} · permissões: {compact(r.get('permissions'))}")
open(os.path.join(OUT, 'data-types.md'), 'w').write('\n'.join(dl) + '\n')

ol = ['# Option sets', '']
for ok, o in sorted(OPTS.items(), key=lambda kv: kv[1].get('display', kv[0]).lower()):
    vals = [v for v in (o.get('values') or {}).values() if isinstance(v, dict)]
    ol.append(f"\n## {o.get('display')} (`{ok}`) — {len(vals)} opções")
    attrs = o.get('attributes') or {}
    if attrs:
        ol.append('Atributos: ' + ', '.join(f"{a.get('display', k)} ({a.get('value')})" for k, a in attrs.items() if isinstance(a, dict)))
    for v in sorted(vals, key=lambda v: v.get('sort_factor', 0)):
        extra = {k: x for k, x in v.items() if k not in ('display', 'db_value', 'sort_factor')}
        ol.append(f"- {v.get('display')} (`{v.get('db_value')}`)" + (f" — {compact(extra)}" if extra else '') + (' **(excluída)**' if v.get('deleted') else ''))
open(os.path.join(OUT, 'option-sets.md'), 'w').write('\n'.join(ol) + '\n')

# inventário (checksum)
il = ['# Inventário — checksum do mapeamento', '', 'Gerado de `grupomegabox.bubble`. Toda spec de página tem de cobrir estes números.', '',
      '| Tipo | Nome | Elementos | Workflows | Ações | Condicionais | Popups | Repeating groups | Tabelas | HTML |', '|---|---|---|---|---|---|---|---|---|---|']
tot = collections.Counter()
for kind, name, s, fn in sorted(inv, key=lambda r: (r[0], -r[2]['elementos'])):
    il.append(f"| {kind} | `{name}` | {s['elementos']} | {s['workflows']} | {s['acoes']} | {s['condicionais']} | {s['tipo:Popup']} | {s['tipo:RepeatingGroup']} | {s['tipo:Table']} | {s['tipo:HTML']} |")
    tot.update({k: v for k, v in s.items() if not k.startswith(('tipo:', 'acao:'))})
il.append(f"| **Total** | | {tot['elementos']} | {tot['workflows']} | {tot['acoes']} | {tot['condicionais']} | | | | |")
il.append(f"\nBackend workflows: {bstats['workflows']} ({bstats['acoes']} ações) · Data types: {len(TYPES)} · Option sets: {len(OPTS)}")
open(os.path.join(OUT, '00-inventario.md'), 'w').write('\n'.join(il) + '\n')
json.dump([{'tipo': k, 'nome': n, 'arquivo': f, **{kk: vv for kk, vv in s.items()}} for k, n, s, f in inv],
          open(os.path.join(OUT, 'inventario.json'), 'w'), ensure_ascii=False, indent=1)
print('\n'.join(il))
