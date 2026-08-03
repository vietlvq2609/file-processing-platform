import js from '@eslint/js'
import ts from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import prettierConfig from 'eslint-config-prettier'

export default ts.config(
  // Ignored paths — removed blanket '**/*.js' to allow linting of config files
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/drizzle/**',
      '**/uploads/**',
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript type-aware rules for backend and shared packages.
  // Enables no-floating-promises, no-misused-promises, await-thenable.
  {
    files: [
      'apps/api/src/**/*.ts',
      'apps/worker/src/**/*.ts',
      'packages/db/src/**/*.ts',
      'packages/types/src/**/*.ts',
    ],
    extends: [...ts.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: [
          'apps/api/tsconfig.json',
          'apps/worker/tsconfig.json',
          'packages/db/tsconfig.json',
          'packages/types/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // TypeScript recommended (non-type-checked) for the frontend.
  // Using 'recommended' instead of 'recommendedTypeChecked' here because
  // type-aware rules produce excessive noise on JSX files and slow down lint.
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    extends: [...ts.configs.recommended],
  },

  // Global rules applied to all app/package source files
  {
    files: ['apps/**/src/**/*.{ts,tsx}', 'packages/**/src/**/*.ts'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'no-console': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // Honour the _prefix convention for intentionally unused parameters (e.g. Fastify preHandlers)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  // React rules — web app only
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+ (new JSX transform)
      'react/prop-types': 'off',         // TypeScript handles prop typing
    },
  },

  // Disable ESLint formatting rules that conflict with Prettier
  prettierConfig,
)
