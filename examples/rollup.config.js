const html = require( '@rollup/plugin-html');
const {cssUrl} = require( '../src/index');
const postcss = require( 'rollup-plugin-postcss')
const path = require('path');
module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es',
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
          }),
        ],
        extract: path.resolve('dist/style/my-css.css') 
    }),
    html()
  ]
}