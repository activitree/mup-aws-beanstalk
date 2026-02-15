import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2024
      }
    },
    rules: {
      // Style rules (from previous standard config)
      'comma-dangle': ['error', 'never'],
      'no-plusplus': 'off',
      'no-param-reassign': 'off',
      'no-console': 'off',
      'no-mixed-operators': 'off',
      'consistent-return': 'off',
      'no-use-before-define': ['error', { functions: false }],
      'prefer-const': 'warn',

      // TypeScript specific adjustments
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'warn'
    }
  },
  {
    ignores: [
      'node_modules/**',
      'lib/**',
      'dist/**',
      'coverage/**',
      '**/*.js',
      '**/*.cjs',
      'tests/**',
      'docs/examples/**'
    ]
  }
);
