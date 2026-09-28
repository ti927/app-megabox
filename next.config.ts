import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  // O banco e as funções ficam em São Paulo. Ver vercel.json e
  // docs/plano-de-migracao.md achado nº 1.
  experimental: {
    typedRoutes: true,
  },
  // Formulário público: o token de uso único está no caminho da URL. Cabeçalho HTTP de verdade
  // (e não só a <meta> da página), para valer também em resposta de erro e antes de qualquer
  // HTML: não vaza por Referer, não entra em índice de busca, não fica em cache intermediário.
  async headers() {
    return [
      {
        source: '/formulario/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
}

export default config
