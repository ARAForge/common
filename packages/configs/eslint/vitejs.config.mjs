// @ts-check
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const createViteJsConfig = (tsconfigRootDir) => {
  return tseslint.config(
    {
      ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**', 'build/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    stylistic.configs.customize({
      flat: true,
    }),
    eslintPluginPrettierRecommended,
    {
      plugins: {
        'react': reactPlugin,
        'react-hooks': reactHooksPlugin,
      },
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.es2021,
        },
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ExportDefaultDeclaration',
            message: 'Default exports are not allowed. Use named exports instead.',
          },
        ],
        'curly': ['error', 'all'],
        'arrow-body-style': ['error', 'as-needed'],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
          },
        ],
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/require-await': 'error',
        '@stylistic/padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: '*', next: 'if' },
          { blankLine: 'always', prev: 'if', next: '*' },
          { blankLine: 'always', prev: '*', next: 'for' },
          { blankLine: 'always', prev: 'for', next: '*' },
          { blankLine: 'always', prev: '*', next: 'while' },
          { blankLine: 'always', prev: 'while', next: '*' },
          { blankLine: 'always', prev: '*', next: 'return' },
        ],
        '@stylistic/brace-style': ['error', '1tbs'],
        'prettier/prettier': ['error', { endOfLine: 'lf' }],
        'react/react-in-jsx-scope': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
  );
};

