import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// ESLint config focused on catching bugs, not formatting
// Guardrails for AI-assisted development
export default tseslint.config([
  { ignores: ['dist', 'public', 'node_modules', '.astro'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // === BUG PREVENTION (strict) ===

      // Catch unused code - common AI mistake is leaving dead code
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Prevent implicit any - AI often skips types
      '@typescript-eslint/no-explicit-any': 'warn',

      // React hooks must follow rules - prevents subtle bugs
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': [
        'warn',
        {
          additionalHooks: '(useAnimationFrame|useInterval)',
        },
      ],

      // Prevent common JS bugs
      'no-undef': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'warn',

      // === SECURITY ===

      // Prevent dangerous patterns
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // === ALLOWED PATTERNS ===

      // Allow empty functions for event handlers
      '@typescript-eslint/no-empty-function': 'off',

      // Allow non-null assertions (trust developer judgment)
      '@typescript-eslint/no-non-null-assertion': 'off',

      // === ACCESSIBILITY (warnings) ===
      // Good practices but don't block development
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
    },
  },
]);
