import {projectBlob,readProject} from '../storage/storage.js';
import {validate,clone} from '../game/model.js';
import {embedCode} from './export.js';
import {PLAYER_VERSION} from './player-version.js';
const DEFAULT_PLAYER=`https://galmizmaria-beep.github.io/lift/players/${PLAYER_VERSION}/play.html`;
export async function shareCode(project,{compact=true,playerURL=DEFAULT_PLAYER}={}){
 const errors=validate(project);if(errors.length)throw Error(errors.join('\n'));
 const p=clone(project);p.project.author='';p.project.url='';p.project.autosave=false;
 const refs=new Set([p.theme.backgroundImage,p.player.media,p.rules.lifeMedia,...Object.values(p.screens).map(x=>x.media),...p.tasks.map(t=>t.media)]);p.assets=p.assets.filter(a=>refs.has(a.id));
 const bytes=new Uint8Array(await projectBlob(p,compact?9:0).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const packed=btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const url=new URL(playerURL);url.hash='project='+packed;
 const code=embedCode(url.href,p.project.title);return {code,url:url.href,bytes:new Blob([code]).size,large:code.length>60000};
}
export async function unpackShared(hash){const value=new URLSearchParams(hash.replace(/^#/, '')).get('project');if(!value)throw Error('В ссылке нет игры. Скопируйте код из редактора.');if(value.length>140*1024*1024||!/^[\w-]+$/.test(value))throw Error('Недопустимые данные игры');const binary=atob(value.replace(/-/g,'+').replace(/_/g,'/'));return readProject(new Blob([Uint8Array.from(binary,c=>c.charCodeAt(0))]));}
