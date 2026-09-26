import {mkdir,cp,rm,readFile,writeFile} from 'node:fs/promises';
const {minify}=await import(process.env.TERSER_MODULE||'terser');
const source=(await readFile('src/game/model.js','utf8')+'\n'+await readFile('src/game/game.js','utf8')).replace(/^import .*;\n/gm,'').replace(/^export /gm,'')+'\nwindow.LiftGame=createGame;';
const {code}=await minify(source,{toplevel:true,compress:{passes:2},format:{comments:false}});
await writeFile('public/game-runtime.min.js',code);
await import('./demo.mjs');
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});for(const path of ['index.html','demo.html','src','public'])await cp(path,'dist/'+path,{recursive:true});console.log('Static build ready: dist/');
