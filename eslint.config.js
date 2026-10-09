import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.ts', '**/*.tsx'], rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] }, languageOptions: { globals: { process: 'readonly', console: 'readonly', document: 'readonly', window: 'readonly', fetch: 'readonly', FormData: 'readonly', URL: 'readonly', setTimeout: 'readonly' } } },
);
