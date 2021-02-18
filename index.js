'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var worker_threads = require('worker_threads');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);
var worker_threads__default = /*#__PURE__*/_interopDefaultLegacy(worker_threads);

const isStream = stream =>
	stream !== null &&
	typeof stream === 'object' &&
	typeof stream.pipe === 'function';

isStream.writable = stream =>
	isStream(stream) &&
	stream.writable !== false &&
	typeof stream._write === 'function' &&
	typeof stream._writableState === 'object';

isStream.readable = stream =>
	isStream(stream) &&
	stream.readable !== false &&
	typeof stream._read === 'function' &&
	typeof stream._readableState === 'object';

isStream.duplex = stream =>
	isStream.writable(stream) &&
	isStream.readable(stream);

isStream.transform = stream =>
	isStream.duplex(stream) &&
	typeof stream._transform === 'function' &&
	typeof stream._transformState === 'object';

var isStream_1 = isStream;

const {Worker} = (() => {
	try {
		return worker_threads__default['default'];
	} catch (_) {
		return {};
	}
})();

let worker; // Lazy
let taskIdCounter = 0;
const tasks = new Map();

const recreateWorkerError = sourceError => {
	const error = new Error(sourceError.message);

	for (const [key, value] of Object.entries(sourceError)) {
		if (key !== 'message') {
			error[key] = value;
		}
	}

	return error;
};

const createWorker = () => {
	worker = new Worker(path__default['default'].join(__dirname, 'thread.js'));

	worker.on('message', message => {
		const task = tasks.get(message.id);
		tasks.delete(message.id);

		if (tasks.size === 0) {
			worker.unref();
		}

		if (message.error === undefined) {
			task.resolve(message.value);
		} else {
			task.reject(recreateWorkerError(message.error));
		}
	});

	worker.on('error', error => {
		// Any error here is effectively an equivalent of segfault, and have no scope, so we just throw it on callback level
		throw error;
	});
};

const taskWorker = (method, args, transferList) => new Promise((resolve, reject) => {
	const id = taskIdCounter++;
	tasks.set(id, {resolve, reject});

	if (worker === undefined) {
		createWorker();
	}

	worker.ref();
	worker.postMessage({id, method, args}, transferList);
});

const hasha = (input, options = {}) => {
	let outputEncoding = options.encoding || 'hex';

	if (outputEncoding === 'buffer') {
		outputEncoding = undefined;
	}

	const hash = crypto__default['default'].createHash(options.algorithm || 'sha512');

	const update = buffer => {
		const inputEncoding = typeof buffer === 'string' ? 'utf8' : undefined;
		hash.update(buffer, inputEncoding);
	};

	if (Array.isArray(input)) {
		input.forEach(update);
	} else {
		update(input);
	}

	return hash.digest(outputEncoding);
};

hasha.stream = (options = {}) => {
	let outputEncoding = options.encoding || 'hex';

	if (outputEncoding === 'buffer') {
		outputEncoding = undefined;
	}

	const stream = crypto__default['default'].createHash(options.algorithm || 'sha512');
	stream.setEncoding(outputEncoding);
	return stream;
};

hasha.fromStream = async (stream, options = {}) => {
	if (!isStream_1(stream)) {
		throw new TypeError('Expected a stream');
	}

	return new Promise((resolve, reject) => {
		// TODO: Use `stream.pipeline` and `stream.finished` when targeting Node.js 10
		stream
			.on('error', reject)
			.pipe(hasha.stream(options))
			.on('error', reject)
			.on('finish', function () {
				resolve(this.read());
			});
	});
};

if (Worker === undefined) {
	hasha.fromFile = async (filePath, options) => hasha.fromStream(fs__default['default'].createReadStream(filePath), options);
	hasha.async = async (input, options) => hasha(input, options);
} else {
	hasha.fromFile = async (filePath, {algorithm = 'sha512', encoding = 'hex'} = {}) => {
		const hash = await taskWorker('hashFile', [algorithm, filePath]);

		if (encoding === 'buffer') {
			return Buffer.from(hash);
		}

		return Buffer.from(hash).toString(encoding);
	};

	hasha.async = async (input, {algorithm = 'sha512', encoding = 'hex'} = {}) => {
		if (encoding === 'buffer') {
			encoding = undefined;
		}

		const hash = await taskWorker('hash', [algorithm, input]);

		if (encoding === undefined) {
			return Buffer.from(hash);
		}

		return Buffer.from(hash).toString(encoding);
	};
}

hasha.fromFileSync = (filePath, options) => hasha(fs__default['default'].readFileSync(filePath), options);

var hasha_1 = hasha;

const importReg = /@import\s+('|")(.*?)\1\s*;/;    
const flagStart = 'start sixian-css-url import path:';
const flagEnd = 'end sixian-css-url';
var importUrl =  {
    name : 'import-url',
    test: /\.(sass|scss|less|styl|stylus|css)$/,
    process({code,map}){
        let index = 0, match = null, str = code;
        while (match = str.match(importReg)){
            const path = match[2];
            const matchStrLength = match[0].length;
          
            index += match['index'];
            code = code.slice(0,index) + comment(flagStart + path) + code.slice(index);
            index += comment(flagStart + path).length + matchStrLength;
            code = code.slice(0,index) + comment(flagEnd) + code.slice(index);
            index += comment(flagEnd).length;
            str = code.slice(index);
        }
        return {
            code : code,
            map : map
        }
    }
};
var flagStartReg = new RegExp(`${flagStart}(.*)`);
var flagEndReg = new RegExp(`${flagEnd}(.*)`);

function comment(str){
    return `/*${str}*/`
}

var importLoader = {
	importUrl: importUrl,
	flagStartReg: flagStartReg,
	flagEndReg: flagEndReg
};

const { extname, basename, relative,resolve ,dirname,join } = path__default['default'];
const { statSync, readFileSync, createReadStream, createWriteStream, existsSync, mkdirSync } = fs__default['default'];

const {importUrl: importUrl$1,flagStartReg: flagStartReg$1,flagEndReg: flagEndReg$1} = importLoader;
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
};

const startUrlReg = /^\s*url\(\s*('|")(.*?)\1\s*\)/;
const startUrlReg2 = /(^\s*)url\(([^'"]*?)\)/;
const startHttp = /^\s*http/;
// Exclude font file url ? and # suffixes
const fontFileSuffixes = /[\?#].*$/;


function handleOptions({
    limit,
    hash,
    slash,
    cssOutput
},root,file){
    handleImportComment(root);
    return function(output,extensions){
        root.nodes.forEach(item=>{
            if(!(item.type === 'rule' || item.type === 'atrule')) return
            const urlList = item.nodes.filter(item=>item.value &&  (item.value.match(startUrlReg) || item.value.match(startUrlReg2)));
            urlList.forEach(item=>{
                let urlRPath = RegExp.$2;
                if(urlRPath.match(startHttp)) return null;
                urlRPath = urlRPath.replace(fontFileSuffixes,'');
                const ext = extname(urlRPath);
                if (!extensions.test(ext)) return null; 
                
                const urlAPath = resolve(file,'..',urlRPath);
                if (statSync(urlAPath).size <= limit) { 
    
                    const ImgBase64 =  `data:${mimeMap[ext]};base64,${readFileSync(urlAPath, 'base64')}`; // use base64
    
                    item.value = `url('${ImgBase64}')`;
    
                } else {
                    
                    let outputPath = relative('./', output) || '';
                    outputPath = outputPath.replace(/\\/g,'/');
                    if (!existsSync(outputPath)) {
                        const dirs = outputPath.split('/');
                        for (let i = 0, dir = dirs[0]; i < dirs.length; i++, dir += `/${dirs[i]}`) {
                        if (dir !== '' && !existsSync(dir)) {
                            mkdirSync(dir);
                        }
                        }
                    }
    
                    let name = basename(urlAPath);
                    if (hash) {
                        const code = readFileSync(urlAPath).toString();
                        const hash = hasha_1(code, { algorithm: 'md5' });
                        name =  `${basename(urlAPath, ext)}-${hash}${ext}`;
                    }
                    const outputFile = `${outputPath}/${name}`;
                    createReadStream(urlAPath).pipe(createWriteStream(outputFile));
                    
                    if(cssOutput){
                        let relativePath = relative(cssOutput,outputFile);
                        relativePath = relativePath.replace(/\\/g,'/');
                        item.value = item.value.replace(urlRPath,`${slash ? './' : ''}${relativePath}`);
                    }else {
                        let baseIndex = outputFile.indexOf('/');
                        baseIndex = baseIndex !== -1 ? baseIndex + 1 : 0;
                        item.value = item.value.replace(urlRPath,`${slash ? './' : ''}${outputFile.slice(baseIndex)}`);
                    }

                    
                }
            });
        });
    }
}


var cssUrl = ({
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
            const file = root.source.input.file;
            const handlefile = handleOptions({limit,hash,slash,cssOutput},root,file);
            handlefile(imgOutput,imgExtensions);
            handlefile(fontOutput,fontExtensions);
   
        }
    }
   
};

function handleImportComment(root){
    const nodes = root.nodes;
    const deleteNodes = [];
    for(let i=0;i<nodes.length;i++){
        let flagStartMatch = null;
        if(nodes[i].type === 'comment' && (flagStartMatch = nodes[i].text.match(flagStartReg$1))){
            deleteNodes.push(i);
            for(i++;!(nodes[i].text && nodes[i].text.match(flagEndReg$1));i++){
                if(!nodes[i].nodes) continue;
                const urlList = nodes[i].nodes.filter(item=>item.value &&  (item.value.match(startUrlReg) || item.value.match(startUrlReg2)));
                urlList.forEach(item=>{
                    let urlRPath = RegExp.$2;
                    if(urlRPath.match(startHttp)) return null
                    urlRPath = urlRPath.replace(fontFileSuffixes,'');
                    item.value = item.value.replace(urlRPath,join(dirname(flagStartMatch[1]),urlRPath).replace('\\','/'));
                });
            }
            deleteNodes.push(i);
        }
    }
    root.nodes = root.nodes.filter((item,index)=>!deleteNodes.includes(index));
    

}

var postcss = true;

var importLoader$1 = importUrl$1;

var src = {
	cssUrl: cssUrl,
	postcss: postcss,
	importLoader: importLoader$1
};

exports.cssUrl = cssUrl;
exports.default = src;
exports.importLoader = importLoader$1;
exports.postcss = postcss;
