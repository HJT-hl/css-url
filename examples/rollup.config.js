const html = require( '@rollup/plugin-html');

const {cssUrl,importLoader} = require( '../src');
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
            imgExtensions : /\.(png|jpg|jpeg|gif)$/,
            fontExtensions : /\.(ttf|woff|woff2|eot|svg)$/,
            limit : 8192,
            hash : true,
            slash : true,
          })
        ],
        use: ['less', 'import-url'],
        extract: path.resolve('dist/style/my-css.css'),
        loaders: [importLoader]
    }),
    html()
  ]
}