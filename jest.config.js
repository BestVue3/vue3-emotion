/**
 * default test will use built files
 */

const usingSorce = !!process.env.SOURCE
const __DEV__ = process.env.__DEV__ === false ? false : true

module.exports = {
    testMatch: ['**/__tests__/**/*.+(js|jsx)'],
    transform: {
        // '\\.js$': './jest-transformer.js',
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.jsx?$': 'babel-jest',
    },
    moduleNameMapper: {
        '^@$': !usingSorce
            ? '<rootDir>/dist/emotion-box.cjs.js'
            : '<rootDir>/lib',
    },
    snapshotSerializers: ['<rootDir>/node_modules/@emotion/jest/serializer'],
    globals: {
        __DEV__,
        'ts-jest': {
            babelConfig: {
                // presets: [['@babel/preset-env']],
                plugins: [
                    'babel-plugin-dev-expression',
                    '@vue/babel-plugin-jsx',
                ],
            },
        },
    },
}
