const { extname, basename, relative,resolve ,dirname,join } = require( 'path')
const { statSync, readFileSync, createReadStream, createWriteStream } = require( 'fs')
const hasha = require('hasha')
const {importUrl,flagStartReg,flagEndReg} = require('./import-loader')
const { mkdir, extToOutput} = require('./utils')
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

const startUrlReg = /\s*url\(\s*('|")(.*?)\1\s*\)/
const startUrlReg2 = /(\s*)url\(([^'"]*?)\)/
const startHttp = /^\s*http/
// Exclude font file url ? and # suffixes
const fontFileSuffixes = /[\?#].*$/




function handleOptions({
    limit,
    hash,
    slash,
    cssOutput,
    imgOutput,
    imgExtensions,
    fontOutput,
    fontExtensions
},root,file){

    function writeFile(urlRPath,nodeMap,originalValue,originalValueDeleteSuf){
        const output = extToOutput(extname(urlRPath), imgOutput,imgExtensions,fontOutput,fontExtensions)
        if(!output) return null;
        
        const urlAPath = resolve(file,'..',urlRPath)
        if (statSync(urlAPath).size <= limit) { 
    
            const ImgBase64 =  `data:${mimeMap[ext]};base64,${readFileSync(urlAPath, 'base64')}`; // use base64
    
            nodeMap.value = `url('${ImgBase64}')`
    
        } else {
            
            let outputPath = relative('./', output) || '';
            outputPath = outputPath.replace(/\\/g,'/')
            mkdir(outputPath)
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
                const urlIn = originalValue.replace(originalValueDeleteSuf,`${slash ? './' : ''}${relativePath}`)
                nodeMap.value = nodeMap.value.replace(originalValue,urlIn)
              
            }else {
                let baseIndex = outputFile.indexOf('/');
                baseIndex = baseIndex !== -1 ? baseIndex + 1 : 0;
                const urlIn = originalValue.replace(originalValueDeleteSuf,`${slash ? './' : ''}${outputFile.slice(baseIndex)}`)
                nodeMap.value = nodeMap.value.replace(originalValue,urlIn)
            }
    
            
        }
    }

    const nodes = root.nodes
    const deleteNodes = [];
    for(let i=0;i<nodes.length;i++){
        let flagStartMatch = null
        if(nodes[i].type === 'comment' && (flagStartMatch = nodes[i].text.match(flagStartReg))){
            deleteNodes.push(i)
            
            for(i++;!(nodes[i].text && nodes[i].text.match(flagEndReg));i++){
                if(!nodes[i].nodes) continue;

                cycleFun(nodes[i].nodes,(urlRPathImport,nodeMap)=>{
                    const urlRPathImportDeleteSuf = urlRPathImport.replace(fontFileSuffixes,'')

                    const urlRPath = join(dirname(flagStartMatch[1]),urlRPathImportDeleteSuf).replace('\\','/')
                    writeFile(urlRPath,nodeMap,urlRPathImport,urlRPathImportDeleteSuf)
                })
               
            }
            deleteNodes.push(i)
        }

        if(nodes[i].type === 'rule' || nodes[i].type === 'atrule'){
            cycleFun(nodes[i].nodes,(urlRPath,nodeMap)=>{
                const urlRPathImportDeleteSuf = urlRPath.replace(fontFileSuffixes,'')
                writeFile(urlRPath,nodeMap,urlRPath,urlRPathImportDeleteSuf)
            })
        }

       

    }
    root.nodes = root.nodes.filter((item,index)=>!deleteNodes.includes(index))


  
}




function cycleFun(nodes,callback) {
    const urlList = nodes.filter(item=>item.value && (item.value.match(startUrlReg) || item.value.match(startUrlReg2)))
    urlList.forEach(item=>{
        let nextStr = null;
        for(
            let match = (item.value.match(startUrlReg) || item.value.match(startUrlReg2));
            match != null;
            match = nextStr.match(startUrlReg) || nextStr.match(startUrlReg2)){
                
                nextStr = match['input'].slice(match['index']+match[0].length)
                let urlRPath = match[2]

                if(urlRPath.match(startHttp)) return null;
                
                callback(urlRPath,item)

        }

    })
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
    return {
        postcssPlugin: 'css-url',
        Once (root) {
            const file = root.source.input.file
            handleOptions({limit,hash,slash,cssOutput,imgOutput,imgExtensions,fontOutput,fontExtensions},root,file) 
        }
    }
   
}



module.exports.postcss = true

module.exports.importLoader = importUrl