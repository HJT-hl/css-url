const html = require( '@rollup/plugin-html');

const {cssUrl,importLoader} = require( '../src/index');
const postcss = require( 'rollup-plugin-postcss')
const path = require('path');
module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
   
    postcss({
        plugins: [
          cssUrl({
            imgOutput: 'dist/imgs',
            fontOutput: 'dist/font',
            cssOutput: 'dist/style',
            imgExtensions : /\.(png|jpg|jpeg|gif|svg)$/,
            fontExtensions : /\.(ttf|woff|woff2|eot)$/,
            limit : 8192,
            hash : false,
            slash : false
          })
        ],
        use: ['less'],
        extract: path.resolve('dist/style/my-css.css'),
        loaders: []
    }),
    html()
  ]
}