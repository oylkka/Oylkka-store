import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js and TypeScript recommended settings
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Basic conventions and code quality rules
      curly: 'error', // Enforce consistent brace style for control statements
      eqeqeq: ['error', 'always'], // Enforce strict equality operators
      'no-var': 'error', // Disallow var declarations to encourage let/const
      'prefer-const': 'error', // Prefer const declarations for variables that are never reassigned
      'no-duplicate-imports': 'error', // Disallow duplicate module imports
      'no-unreachable': 'error', // Disallow unreachable code after return/throw statements

      // React-specific rules
      'react/jsx-pascal-case': 'warn', // Enforce PascalCase in React component filenames
      'react/self-closing-comp': 'warn', // Encourage self-closing tags for components without children
      'react/jsx-curly-brace-presence': [
        'warn',
        { props: 'never', children: 'never' },
      ], // Consistent usage of JSX curly braces
      'react-hooks/rules-of-hooks': 'error', // Ensure hooks are used correctly
      'react-hooks/exhaustive-deps': 'warn', // Check effect dependency lists

      // Import order and grouping (requires eslint-plugin-import)
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // Accessibility rules (requires eslint-plugin-jsx-a11y)
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/alt-text': 'warn',

      // Debugging and logging
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Security & reliability rules
      'no-eval': 'error', // Disallow eval() for security reasons
      'no-implied-eval': 'error', // Disallow the use of implied eval()
    },
  },

  // Override for test files to allow dev dependency usage and other test-specific settings
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
];

export default eslintConfig;
