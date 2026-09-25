import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  // O banco e as funções ficam em São Paulo. Ver vercel.json e
  // docs/plano-de-migracao.md achado nº 1.
  experimental: {
    typedRoutes: true,
  },
}

export default config
