"""Checksum do mapeamento: todo workflow do mapa aparece em alguma spec?

Compara os ids `#### WF <id>` de cada arquivo de mapa/ com os ids citados em
qualquer arquivo de specs/paginas/. Paginas de backup sao fora de escopo.
"""

import os
import re
from collections import defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, "mapa")
SPECS = os.path.join(RAIZ, "specs", "paginas")

FORA_DE_ESCOPO = {
    "pagina-vendas_bkp.md",
    "pagina-vendas_bkp2.md",
    "pagina-metas_bkp.md",
    "pagina-cadastros_old.md",
    "pagina-testes.md",
}

RE_WF = re.compile(r"^#### WF ([A-Za-z0-9]+)", re.M)


def ler(caminho):
    with open(caminho, encoding="utf-8") as fh:
        return fh.read()


# 1. todos os WF do mapa em escopo
por_arquivo = {}
for nome in sorted(os.listdir(MAPA)):
    if not nome.endswith(".md"):
        continue
    if nome in FORA_DE_ESCOPO or nome in ("LEIA-ME.md", "00-inventario.md"):
        continue
    if not (nome.startswith("pagina-") or nome.startswith("reusable-")):
        continue
    ids = RE_WF.findall(ler(os.path.join(MAPA, nome)))
    if ids:
        por_arquivo[nome] = ids

# 2. todos os ids citados nas specs
texto_specs = {}
for nome in sorted(os.listdir(SPECS)):
    if nome.endswith(".md"):
        texto_specs[nome] = ler(os.path.join(SPECS, nome))

todos_specs = "\n".join(texto_specs.values())
citados = set(re.findall(r"\b([a-zA-Z][A-Za-z0-9]{3,})\b", todos_specs))

# 3. confronto
total = 0
faltando = defaultdict(list)
for nome, ids in por_arquivo.items():
    total += len(ids)
    for i in ids:
        if i not in citados:
            faltando[nome].append(i)

print(f"Workflows no mapa (em escopo): {total}")
print(f"Nao citados em nenhuma spec:   {sum(len(v) for v in faltando.values())}")
print()
if faltando:
    print("== ARQUIVOS COM WORKFLOW NAO COBERTO ==")
    for nome in sorted(faltando):
        ids = faltando[nome]
        print(f"{nome}: {len(ids)} de {len(por_arquivo[nome])} sem citacao")
        print("   ", " ".join(ids[:25]) + (" ..." if len(ids) > 25 else ""))
else:
    print("Todo workflow do mapa aparece em alguma spec.")

print()
print("== ARQUIVOS DE MAPA SEM SPEC DEDICADA (tabela §11 propria) ==")
for nome, ids in sorted(por_arquivo.items()):
    n_falta = len(faltando.get(nome, []))
    if n_falta == 0:
        continue
    if n_falta == len(ids):
        print(f"  {nome}: nenhum dos {len(ids)} workflows citado")
