import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'bruto/**',
      'qa/**',
      'design/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // CLAUDE.md regra 4: service_role nunca sai do servidor.
    // tela.tsx e dialogo.tsx são componentes cliente por convenção
    // (specs/03-plano-de-construcao.md §3.5); componentes/ é compartilhado.
    files: ['**/tela.tsx', '**/dialogo.tsx', 'componentes/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/lib/supabase/admin', '@/lib/supabase/admin'],
              message:
                'admin.ts usa service_role e só pode ser importado no servidor (CLAUDE.md regra 4). Use uma server action em acoes.ts.',
            },
          ],
        },
      ],
    },
  },
]

export default config
