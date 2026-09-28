import {unpackShared} from '../export/share.js';
import {createGame} from './game.js';
import {validate} from './model.js';
async function start(){const p=await unpackShared(location.hash),errors=validate(p);if(errors.length)throw Error(errors.join('\n'));const names=[...new Set([p.project.locale,p.project.fallback,'ru'])];const locales={};await Promise.all(names.map(async name=>{if(!/^[a-z]{2}$/.test(name))return;const r=await fetch(new URL('../locales/'+name+'.json',import.meta.url));if(r.ok)locales[name]=await r.json();}));document.documentElement.lang=p.project.locale;document.title=p.project.title||'Лифт';createGame(document.getElementById('game'),p,locales);}
start().catch(e=>{const area=document.getElementById('loading');area.textContent='Не удалось открыть игру. '+e.message;const p=document.createElement('p'),a=document.createElement('a');a.href='./';a.textContent='Открыть редактор';p.append(a);area.append(p);});
