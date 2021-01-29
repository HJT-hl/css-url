const { extname, basename, relative,resolve  } = require( 'path')
const { statSync, readFileSync, createReadStream, createWriteStream, existsSync, mkdirSync } = require( 'fs')
const hasha = require('hasha')

const mimeMap = {
	'.jpg':  'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png':  'image/png',
	'.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.webp': 'image/webp',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
}

const startUrlReg = /^\s*url\(\s*('|")(.*?)\1\s*\)/
const startUrlReg2 = /(^\s*)url\(([^'"]*?)\)/
const startHttp = /^\s*http/
// Exclude font file url ? and # suffixes
const fontFileSuffixes = /[\?#].*$/
function handleOptions({
    limit,
    hash,
    slash,
    cssOutput
}){
    return function(file,output,extensions){
        return function(rule){
            const urlList = rule.nodes.filter(item=>item.value &&  item.value.match(startUrlReg) || item.value.match(startUrlReg2))
            urlList.forEach(item=>{
                let urlRPath = RegExp.$2
                if(urlRPath.match(startHttp)) return null;
                
                
                urlRPath = urlRPath.replace(fontFileSuffixes,'')
                const ext = extname(urlRPath);
                if (!extensions.test(ext)) return null; 
                
                const urlAPath = resolve(file,'..',urlRPath)
                if (statSync(urlAPath).size <= limit) { 
    
                    const ImgBase64 =  `data:${mimeMap[ext]};base64,${readFileSync(urlAPath, 'base64')}`; // use base64
    
                    item.value = `url('${ImgBase64}')`
    
                } else {
                    
                    let outputPath = relative('./', output) || '';
                    outputPath = outputPath.replace(/\\/g,'/')
                    if (!existsSync(outputPath)) {
                        const dirs = outputPath.split('/');
                        for (let i = 0, dir = dirs[0]; i < dirs.length; i++, dir += `/${dirs[i]}`) {
                        if (dir !== '' && !existsSync(dir)) {
                            mkdirSync(dir)
                        }
                        }
                    }
    
                    let name = basename(urlAPath);
                    if (hash) {
                        const code = readFileSync(urlAPath).toString();
                        const hash = hasha(code, { algorithm: 'md5' });
                        name =  `${basename(urlAPath, ext)}-${hash}${ext}`;
                    }
                    const outputFile = `${outputPath}/${name}`;
                    createReadStream(urlAPath).pipe(createWriteStream(outputFile));
                    
                    if(cssOutput){
                        let relativePath = relative(cssOutput,outputFile);
                        relativePath = relativePath.replace(/\\/g,'/');
                        item.value = item.value.replace(urlRPath,`${slash ? './' : ''}${relativePath}`)
                    }else {
                        let baseIndex = outputFile.indexOf('/');
                        baseIndex = baseIndex !== -1 ? baseIndex + 1 : 0;
                        item.value = item.value.replace(urlRPath,`${slash ? './' : ''}${outputFile.slice(baseIndex)}`)
                    }

                    
                }
            })
        }
    }
}
function rootRulesHandle(root,rule){
    root.walkAtRules(rule)
    root.walkRules(rule)
}

module.exports.cssUrl = ({
    imgOutput,
    fontOutput,
    cssOutput,
    imgExtensions = /\.(png|jpg|jpeg|gif|svg)$/,
    fontExtensions = /\.(ttf|woff|woff2|eot)$/,
    limit = 8192,
    hash = false,
    slash = false
}) => {
    const handlefile = handleOptions({limit,hash,slash,cssOutput})
    return {
        postcssPlugin: 'css-url',
        Once (root) {
            const file = root.source.input.file
            const ruleImg = handlefile(file,imgOutput,imgExtensions)
            const ruleFont = handlefile(file,fontOutput,fontExtensions)
            rootRulesHandle(root,ruleImg)
            rootRulesHandle(root,ruleFont)
        }
    }
   
}

module.exports.postcss = true