import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPerf from 'eslint-plugin-react-perf';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config([
    {
        ignores: ['dist/**', 'node_modules/**', '.vite/**', 'public/**'],
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        plugins: {
            react: react,
            'react-hooks': reactHooks,
            'react-perf': reactPerf,
            'react-refresh': reactRefresh,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn',

            // Empty line rules - require empty lines before/after certain statements
            'padding-line-between-statements': [
                'error',
                // Empty line before return statements
                { blankLine: 'always', prev: '*', next: 'return' },
                // Empty line before if statements
                { blankLine: 'always', prev: '*', next: 'if' },
                // Empty line before for/while loops
                { blankLine: 'always', prev: '*', next: ['for', 'while', 'do'] },
                // Empty line before try/catch blocks
                { blankLine: 'always', prev: '*', next: ['try', 'throw'] },
                // Empty line before switch statements
                { blankLine: 'always', prev: '*', next: 'switch' },
                // Empty line before function declarations
                { blankLine: 'always', prev: '*', next: 'function' },
                // Empty line before block statements (but not inside blocks)
                { blankLine: 'always', prev: '*', next: 'block-like' },
                // Empty line before variable declarations (const/let/var)
                { blankLine: 'always', prev: '*', next: ['const', 'let', 'var'] },
                // Allow consecutive const declarations without empty lines
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
                // Allow consecutive expressions without empty lines
                { blankLine: 'any', prev: 'expression', next: 'expression' },
                // Empty line after imports
                { blankLine: 'always', prev: 'import', next: '*' },
                { blankLine: 'any', prev: 'import', next: 'import' },
            ],

            // Functional programming rules
            'prefer-const': 'error', // Prefer const over let when variables aren't reassigned
            'no-var': 'error', // Disallow var declarations
            'no-let': 'off', // We'll use prefer-const instead, which is more flexible
            'no-param-reassign': ['error', { props: true }], // Don't mutate function parameters

            // Encourage immutable patterns
            'no-array-constructor': 'error', // Disallow Array constructor
            'prefer-spread': 'error', // Prefer spread over .apply()
            'prefer-rest-params': 'error', // Prefer rest parameters over arguments object
            'prefer-template': 'error', // Prefer template literals over string concatenation
            'no-nested-ternary': 'error', // Disallow nested ternary expressions
            'no-unneeded-ternary': 'error', // Disallow ternary operators when simpler alternatives exist
            'no-else-return': 'error', // Disallow else blocks after return statements in if statements
            'consistent-return': 'error', // Require return statements to either always or never specify values

            // Discourage mutation-prone patterns
            'no-implicit-coercion': 'error', // Disallow shorthand type conversions
            'no-multi-assign': 'error', // Disallow multiple assignments in a single statement
            'no-plusplus': ['error', { allowForLoopAfterthoughts: true }], // Disallow ++ and -- operators
            'no-sequences': 'error', // Disallow comma operators
            'no-implicit-globals': 'error', // Disallow variable declarations at the global scope
            'prefer-object-spread': 'error', // Prefer object spread over Object.assign()

            // TypeScript-specific functional rules
            '@typescript-eslint/prefer-as-const': 'error', // Prefer as const for literal types

            // React performance rules - discourage inline functions
            'react-hooks/exhaustive-deps': 'error', // Ensure useCallback/useMemo deps are correct
            'react-perf/jsx-no-new-object-as-prop': 'warn',
            'react-perf/jsx-no-new-array-as-prop': 'warn', // No new arrays as props
            'react-perf/jsx-no-new-function-as-prop': 'warn', // No inline functions as props
            'react-perf/jsx-no-jsx-as-prop': 'error', // No JSX as props (use render props pattern)
            'prefer-arrow-callback': 'error', // Prefer arrow functions in callbacks
            'func-style': ['error', 'expression'], // Prefer function expressions over declarations
        },
    },
]);
