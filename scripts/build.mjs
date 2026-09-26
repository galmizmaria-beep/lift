import {mkdir,cp,rm,readFile,writeFile} from 'node:fs/promises';
const {minify}=await import(process.env.TERSER_MODULE||'terser');
const source=((await Promise.all(['model','lifts','audio','game'].map(name=>readFile('src/game/'+name+'.js','utf8')))).join('\n')).replace(/^import .*;\n/gm,'').replace(/^export /gm,'')+'\nwindow.LiftGame=createGame;';
const {code}=await minify(source,{toplevel:true,compress:{passes:2},format:{comments:false}});
await writeFile('public/game-runtime.min.js',code);
await import('./demo.mjs');
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});for(const path of ['index.html','play.html','demo.html','src','public'])await cp(path,'dist/'+path,{recursive:true});console.log('Static build ready: dist/');
