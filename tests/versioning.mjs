import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const {PLAYER_VERSION}=await import('../src/export/player-version.js');
const legacy=JSON.parse(await readFile('players/legacy.json','utf8'));
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const base=process.env.BASE_URL||'http://127.0.0.1:8000';
try{
 const editor=await browser.newPage();await editor.goto(base);
 const hash=await editor.evaluate(async()=>{const {defaults}=await import('/src/game/model.js'),{shareCode}=await import('/src/export/share.js');const p=defaults();p.screens.title.enabled=false;p.elevator.motion=false;p.rules.lives=2;p.floors.mode='fixed';p.floors.target=1;p.tasks[0].prompt=String.raw`Сколько будет $\frac{24}{2}$?`;p.buttons.check.background='#123456';return new URL((await shareCode(p)).url).hash;});await editor.close();
 for(const [path,version] of [[`/players/${PLAYER_VERSION}/play.html`,PLAYER_VERSION],['/play.html',legacy.version]]){
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[],activeRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Simulate an incompatible future editor: none of its current assets can load.
  await context.route('**/*',route=>{const path=new URL(route.request().url()).pathname;if(path.startsWith('/src/')||path.startsWith('/public/')){activeRequests.push(path);return route.abort();}return route.continue();});
  await page.goto(base+path+hash);await page.waitForSelector('.enter-control');assert.equal(new URL(page.url()).pathname,`/players/${version}/play.html`);assert.equal(new URL(page.url()).hash,hash);
  await page.locator('.enter-control').click();await page.locator('.start-task').click();assert.equal(await page.locator('#question-heading math').count(),1);assert.equal(await page.locator('[data-action="check"]').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(18, 52, 86)');
  await page.locator('.answer input[value="0"]').check();await page.locator('[data-action="check"]').click();assert.equal(await page.locator('.hud-pill b').first().textContent(),'1');assert.equal(await page.locator('.display-number').textContent(),'00');
  await page.locator('.answer input[value="1"]').check();await page.locator('[data-action="check"]').click();await page.waitForSelector('#game.win');assert.deepEqual(activeRequests,[]);assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS pinned and legacy Genially links play independently of all current editor assets, with preserved formulas, colours, lives and victory');
}finally{await browser.close();}
