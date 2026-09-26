import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    // Vrstvy: app/ (routing) smí importovat features/, features/ a components/ nesmí sahat do app/.
    files: ['src/features/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*'],
              message:
                'features/ a components/ nesmí importovat z app/ — routing je nejvyšší vrstva.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'storage/**',
      '**/*.config.mjs',
      '**/*.config.ts',
      'next-env.d.ts',
    ],
  },
)
