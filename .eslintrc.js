const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'eslint:recommended',
        '@vue/typescript/recommended',
        '@vue/prettier',
        '@vue/prettier/@typescript-eslint',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
    ],
    plugins: ['react', 'import'],
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        'no-console': isProd ? 'error' : 'warn',
        'no-debugger': isProd ? 'error' : 'warn',
        // 'no-unused-vars': isProd ? 'warn' : 'error',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        // jsx
        'react/no-array-index-key': 'warn',
        'react/jsx-key': 'error',
        'react/jsx-no-duplicate-props': 'error',
        'react/jsx-sort-props': 'warn',
        'react/jsx-tag-spacing': 'error',
        // import
        'import/no-self-import': 'error',
        'import/newline-after-import': 'error',
        'import/no-unresolved': 'off',
    },

    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)',
            ],
            env: {
                jest: true,
            },
            globals: {
                document: true,
            },
            rules: {
                'no-console': 'off',
            },
        },
    ],
}
