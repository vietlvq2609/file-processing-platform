import js from '@eslint/js'
import ts from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettierConfig from 'eslint-config-prettier'

export default ts.config(
  // Ignored paths
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/drizzle/**',
      '**/uploads/**',
      '**/*.js',
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules for all TS/TSX files
  ...ts.configs.recommended,

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
