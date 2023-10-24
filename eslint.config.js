import eslintJs from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import path from 'path';
import prettierConfig from 'eslint-config-prettier';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import reactJsxRuntimeConfig from 'eslint-plugin-react/configs/jsx-runtime.js';

import { fileURLToPath } from 'url';

// mimic CommonJS variables
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname,
});

/**
 * 1. airbnb config plugs in jsx-a11y, import, react & react-hooks
 * 2. eslint-config-prettier disables all conflicting lint rules defined in eslint & above mentioned plugins.,
 * 3. check prettier conflicted rules: npx eslint-config-prettier eslint.config.js
 */
export default [
  {
    ignores: ['dist', 'eslint.config.js', 'vite.config.js'],
  },
  {
    files: ['**/*.{js,jsx}'],
  },
  eslintJs.configs.recommended,
  ...compat.extends('airbnb'),
  prettierConfig,
  {
    settings: {
      react: { version: 'detect' },
      // https://github.com/import-js/eslint-plugin-import/issues/2556
      'import/parsers': {
        espree: ['.js', '.jsx'],
      },
      'import/resolver': {
        alias: [
          ['@', './src'],
          ['', './public'],
        ],
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        // flat config doesn't supply ecmaVersion in `parser.js` `context.parserOptions`
        // This is required to avoid ecmaVersion < 2015 error or 'import' / 'export' error
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: { ...globals.browser, ...globals.es2021, ...globals.node },
    },
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: true,
    },
  },
  // prettier compliant lint configs
  {
    rules: {
      // can-not be multi-line/multi-or-nest
      curly: ['error', 'multi'],
      // with allowIndentationTabs as true, no-tabs takes care of tabs while Prettier takes care of indentation
      'no-tabs': ['error', { allowIndentationTabs: true }],
      // singleQuote on prettier must match with this config
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: false,
        },
      ],
      // deny all confusing sequenced expressions
      'no-restricted-syntax': [
        'error',
        {
          selector: 'SequenceExpression',
          message:
            "The comma operator is confusing and a common mistake. Don't use it!",
        },
      ],
    },
  },
  // JSX Runtime
  {
    rules: reactJsxRuntimeConfig.rules,
  },
  // react refresh
  {
    plugins: {
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // overwrites
  {
    rules: {
      // vite requires public paths to be accessed via absolute paths
      'import/no-absolute-path': 0,
    },
  },
];
