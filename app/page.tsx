/**
 * Placeholder da Fase A. A primeira tela de verdade é a fatia 0 (login e
 * sessão), conforme specs/03-plano-de-construcao.md §6.
 */
export default function Inicio() {
  return (
    <main style={{ padding: 'var(--e6)', maxWidth: '40rem' }}>
      <h1>MegaBox</h1>
      <p data-teste="fase-a" style={{ color: 'var(--texto-2)' }}>
        Fundação do projeto no ar. Próximo passo: fatia 0 — perfis, permissões e
        sessão.
      </p>
    </main>
  )
}
