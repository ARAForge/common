// @ts-check
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import noNull from 'eslint-plugin-no-null';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const createNestJsConfig = (customPlugin, tsconfigRootDir) => {
  return tseslint.config(
    {
      ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    stylistic.configs.customize({
      flat: true,
    }),
    eslintPluginPrettierRecommended,
    {
      plugins: {
        'no-null': noNull,
        ...(customPlugin ? { 'custom': customPlugin } : {}),
      },
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'commonjs',
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {
            accessibility: 'explicit',
          },
        ],
        '@typescript-eslint/parameter-properties': [
          'error',
          {
            prefer: 'parameter-property',
          },
        ],
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: false,
            allowTypedFunctionExpressions: false,
            allowHigherOrderFunctions: false,
            allowDirectConstAssertionInArrowFunctions: false,
            allowConciseArrowFunctionExpressionsStartingWithVoid: false,
          },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        'no-restricted-syntax': [
          'error',
          {
            selector: 'FunctionDeclaration',
            message: 'Function declarations are not allowed. Use class methods instead.',
          },
          {
            selector: 'VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
            message: 'Standalone arrow functions are not allowed. Use class methods instead.',
          },
          {
            selector: 'VariableDeclaration > VariableDeclarator > FunctionExpression',
            message: 'Standalone function expressions are not allowed. Use class methods instead.',
          },
          {
            selector: 'ExportDefaultDeclaration',
            message: 'Default exports are not allowed. Use named exports instead.',
          },
          {
            selector: 'TSNullKeyword',
            message: 'Use undefined instead of null in type annotations.',
          },
        ],
        'curly': ['error', 'all'],
        'arrow-body-style': ['error', 'always'],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
          },
        ],
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/promise-function-async': 'off',
        'no-null/no-null': 'error',
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['../*', './*'],
                message:
                  'Relative imports are not allowed. Use absolute imports with src/ prefix instead.',
              },
            ],
          },
        ],
        '@stylistic/padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: '*', next: 'if' },
          { blankLine: 'always', prev: 'if', next: '*' },
          { blankLine: 'always', prev: '*', next: 'for' },
          { blankLine: 'always', prev: 'for', next: '*' },
          { blankLine: 'always', prev: '*', next: 'while' },
          { blankLine: 'always', prev: 'while', next: '*' },
          { blankLine: 'always', prev: '*', next: 'do' },
          { blankLine: 'always', prev: 'do', next: '*' },
          { blankLine: 'always', prev: '*', next: 'switch' },
          { blankLine: 'always', prev: 'switch', next: '*' },
          { blankLine: 'always', prev: '*', next: 'try' },
          { blankLine: 'always', prev: 'try', next: '*' },
          { blankLine: 'always', prev: '*', next: 'throw' },
          { blankLine: 'always', prev: 'throw', next: '*' },
          { blankLine: 'always', prev: '*', next: 'return' },
        ],
        '@stylistic/brace-style': ['error', '1tbs'],
        '@stylistic/lines-between-class-members': [
          'error',
          'always',
          { exceptAfterSingleLine: false },
        ],
        'prettier/prettier': ['error', { endOfLine: 'lf' }],
        ...(customPlugin ? { 'custom/member-order-with-override': 'error' } : {}),
      },
    },
  );
};

