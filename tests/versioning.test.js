import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {verifyPlayers} from '../scripts/player-release.mjs';
import {PLAYER_VERSION} from '../src/export/player-version.js';
import {shareCode} from '../src/export/share.js';
import {defaults} from '../src/game/model.js';
test('all published player files and the legacy address retain their hashes',async()=>{await verifyPlayers();});
test('new Genially codes pin the player version and preserve project settings',async()=>{const p=defaults();const r=await shareCode(p);assert.equal(new URL(r.url).pathname,`/lift/players/${PLAYER_VERSION}/play.html`);const manifest=JSON.parse(await readFile(`players/${PLAYER_VERSION}/manifest.json`));assert.equal(manifest.version,PLAYER_VERSION);for(const path of ['src/game/game.js','src/game/model.js','src/game/math.js','src/storage/schema.js','src/styles/game.css','public/vendor/katex.min.js','src/locales/ru.json'])assert.ok(manifest.files[path]);const reader=await readFile(`players/${PLAYER_VERSION}/src/export/share.js`,'utf8');assert.ok(!reader.includes('player-version'));assert.ok(!reader.includes('export.js'));});
test('a future runtime change creates a new release without rewriting existing games',async()=>{
 const {mkdtemp,cp,rm,appendFile}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path'),{execFileSync}=await import('node:child_process');
 const dir=await mkdtemp(join(tmpdir(),'lift-release-')),script=new URL('../scripts/player-release.mjs',import.meta.url).href;
 try{
  for(const path of ['src','public','players','play.html'])await cp(path,join(dir,path),{recursive:true});
  const run=()=>execFileSync(process.execPath,['--input-type=module','-e',`import {releasePlayer,verifyPlayers} from ${JSON.stringify(script)}; await releasePlayer(); await verifyPlayers();`],{cwd:dir,encoding:'utf8',stdio:['ignore','pipe','pipe']});
  const before=await readFile(join(dir,'play.html'),'utf8');await appendFile(join(dir,'src/editor/editor.js'),'\n// future editor-only change\n');run();assert.equal(await readFile(join(dir,'src/export/player-version.js'),'utf8'),await readFile('src/export/player-version.js','utf8'));
  await appendFile(join(dir,'src/styles/game.css'),'\n/* simulated future editor update */\n');run();assert.notEqual(await readFile(join(dir,'src/export/player-version.js'),'utf8'),await readFile('src/export/player-version.js','utf8'));assert.equal(await readFile(join(dir,'play.html'),'utf8'),before);
  assert.equal(await readFile(join(dir,`players/${PLAYER_VERSION}/src/styles/game.css`),'utf8'),await readFile(`players/${PLAYER_VERSION}/src/styles/game.css`,'utf8'));
  await appendFile(join(dir,`players/${PLAYER_VERSION}/src/styles/game.css`),'changed');assert.throws(run,/Published player was changed/);
 }finally{await rm(dir,{recursive:true,force:true});}
});
