import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// `defineConfig`/`globalIgnores` (imported from 'eslint/config') only exist in
// ESLint v9+, but this project pins eslint@8.57 — use typescript-eslint's own
// `tseslint.config()` helper instead, which supports the same `extends` sugar
// and works with the installed ESLint 8.57 flat-config support.
export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactRefresh.configs.vite,
    ],
    // eslint-plugin-react-hooks@4.6.2 predates flat-config support (no
    // `configs.flat` export) — register its legacy eslintrc-shaped
    // `configs.recommended.rules` manually instead.
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
    languageOptions: {
      globals: globals.browser,
    },
  },
)
