# css-url
postcss 插件 , 用与处理 css 中 url 加载 图片和字体问题 。

## 安装

```sh
yarn add @sixian/css-url -D
```

or

```sh
npm i @sixian/css-url -D
```

## 使用

```js
import { cssUrl } from 'css-url'
export default {
  plugins: [
    postcss({
        plugins: [
          cssUrl({
            imgOutput: 'dist/imgs',
            fontOutput: 'dist/font',
            cssOutput: 'dist/style'
          }),
        ],
        extract: path.resolve('dist/style/my-css.css')  
    })
  ]
}
```

运行结果

```css
@font-face {
　　font-family: "test";
　　src: url('./font/iconfont.ttf');
}

div {
    color : red;
    background : url(./testimg.png);
    font-family : "test";
}
```

转换为

```css
@font-face {
　　font-family: "test";
　　src: url('../font/iconfont.ttf');
}

div {
    color : red;
    background : url(../imgs/testimg.png);
    font-family : "test";
}
```

## 配置参数

### `imgOutput`

作用 : 图片生成路径

参数类型 : string  

### `fontOuput`

作用 : 字体生成路径

参数类型 : string  

### `cssOuput`

作用 :  由于无法直接获取 css 输出路径 , 导致 url 路径修改错误 。 您需要手动配置该选项 ，该选项请与你的 css 输出路径保持一致 。

参数类型 ： string 

### `imgExtensions`

作用 : 图片扩展名

参数类型 : RegExp

默认参数 ：/\.(png|jpg|jpeg|gif|svg)$/

### `fontExtensions`

作用 ：字体扩展名

参数类型 : RegExp

默认参数 ：/\.(ttf|woff|woff2|eot)$/

### `limit`

作用 ：限制文件大小 ，低于此数值的文件转换成 base64 编码嵌套在文件中 。

参数类型 : number 

默认参数 : 8192 

### `hash`

作用 ：文件名是否 hash 

参数类型 : boolean

默认参数 : false

### `slash`

作用 : url 路径前缀是否加上 ./ 

参数类型 : boolean

默认参数 : false



demo 

```js
import {cssUrl} from '@sixian/css-url');  
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
    })
```

### v1.0.0新增功能 
使用 less/sass 等预处理器 @import 时，可导入 loader : importLoader 进行使用
dome 
```js
import {cssUrl,importLoader} from '@sixian/css-url');
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
      use: ['less', 'import-url'],
      extract: path.resolve('dist/style/my-css.css'),
      loaders: [importLoader]
  }),


```



## License

MIT







