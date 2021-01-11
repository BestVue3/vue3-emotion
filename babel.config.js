const isTest = process.env.NODE_ENV === 'test'

module.exports = isTest
    ? {
          presets: [['@babel/preset-env', { modules: 'cjs' }]],
          plugins: ['@vue/babel-plugin-jsx'],
      }
    : {
          plugins: [
              [
                  '@emotion',
                  {
                      autoLabel: 'dev-only',
                      labelFormat: '[local]',
                      cssPropOptimization: false,
                  },
              ],
          ],
      }
