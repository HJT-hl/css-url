const { existsSync, mkdirSync} = require('fs');
module.exports.mkdir = function(outputPath) {
    if (!existsSync(outputPath)) {
        const dirs = outputPath.split('/');
        for (let i = 0, dir = dirs[0]; i < dirs.length; i++, dir += `/${dirs[i]}`) {
            if (dir !== '' && !existsSync(dir)) {
                mkdirSync(dir)
            }
        }
    }
}

module.exports.extToOutput = function(ext, imgOutput,imgExtensions,fontOutput,fontExtensions) {
    let output = null;
    if(imgExtensions.test(ext)){
        output = imgOutput
    }else if(fontExtensions.test(ext) ) {
        output = fontOutput
    }
    return output
}