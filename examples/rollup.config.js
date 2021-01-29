const html = require( '@rollup/plugin-html');
const {cssUrl} = require( '../src/index');
const postcss = require( 'rollup-plugin-postcss')
const path = require( 'path')
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
            hash: true,
          }),
        ],

        inject: false,
        // sourceMap: true,
        extensions: ['.css'],
        extract: path.resolve('dist/my-custom-file-name.css') // 输出路径
    }),
    html()
  ]
}