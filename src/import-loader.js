const importReg = /@import\s+('|")(.*?)\1\s*;/    
const flagStart = 'start sixian-css-url import path:';
const flagEnd = 'end sixian-css-url'
module.exports.importUrl =  {
    name : 'import-url',
    test: /\.(sass|scss|less|styl|stylus|css)$/,
    process({code,map}){
        let index = 0, match = null, str = code;
        while (match = str.match(importReg)){
            const path = match[2];
            const matchStrLength = match[0].length;
          
            index += match['index'];
            code = code.slice(0,index) + comment(flagStart + path) + code.slice(index)
            index += comment(flagStart + path).length + matchStrLength
            code = code.slice(0,index) + comment(flagEnd) + code.slice(index)
            index += comment(flagEnd).length
            str = code.slice(index)
        }
        return {
            code : code,
            map : map
        }
    }
}
module.exports.flagStartReg = new RegExp(`${flagStart}(.*)`);
module.exports.flagEndReg = new RegExp(`${flagEnd}(.*)`);

function comment(str){
    return `/*${str}*/`
}