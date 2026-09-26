import {readFile,writeFile} from 'node:fs/promises';
import {defaults} from '../src/game/model.js';
import {gameHTML} from '../src/export/export.js';
const nativeFetch=globalThis.fetch;
globalThis.fetch=async url=>url.protocol==='file:'?new Response(await readFile(url)):nativeFetch(url);
const p=defaults(),locales={ru:JSON.parse(await readFile(new URL('../src/locales/ru.json',import.meta.url),'utf8'))};
await writeFile('demo.html',await gameHTML(p,locales,true));
