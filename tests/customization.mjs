import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{
 await mkdir('test-results',{recursive:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
 await page.locator('[data-tab="buttons"]').click();
 for(const [key,selector] of [['begin','[data-action="begin"]'],['enter','.enter-control'],['ready','.start-task'],['check','[data-action="check"]']]){
  await page.locator(`[data-path="buttons.${key}.background"]`).fill('#123456');await page.locator(`[data-path="buttons.${key}.color"]`).fill('#ffeedd');await page.locator(`[data-path="buttons.${key}.glowColor"]`).fill('#cc00ff');await page.locator(`[data-path="buttons.${key}.glow"]`).fill('18');
  const css=await page.locator('#game '+selector).evaluate(el=>({bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,shadow:getComputedStyle(el).boxShadow}));assert.equal(css.bg,'rgb(18, 52, 86)');assert.equal(css.color,'rgb(255, 238, 221)');assert.match(css.shadow,/204, 0, 255/);
 }
 await page.locator('[data-tab="display"]').click();await page.locator('[data-path="displayStyle.background"]').fill('#102030');await page.locator('[data-path="displayStyle.color"]').fill('#ff9900');await page.locator('[data-path="displayStyle.digits"]').selectOption('segments');assert.equal(await page.locator('.segment-digits svg').count(),2);assert.equal(await page.locator('.lift-sign').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(16, 32, 48)');
 await page.locator('[data-tab="style"]').click();assert.ok(await page.locator('[data-path="theme.font"] option').count()>=30);await page.locator('[data-path="theme.font"]').selectOption('Courier New');
 await page.locator('[data-tab="floors"]').click();await page.locator('[data-path="floors.goalText"]').fill('Поднимись на этаж {floor}!');assert.match(await page.locator('.goal-badge').textContent(),/Поднимись на этаж 4!/);
 await page.locator('[data-tab="tasks"]').click();await page.locator('[data-path="tasks.0.prompt"]').fill(String.raw`Вычисли $\frac{1}{2}+\sqrt{9}$ и $$\begin{cases}x+y=5\\x-y=1\end{cases}$$`);await page.locator('[data-path="tasks.0.answers.0"]').fill(String.raw`$\frac{7}{2}$`);assert.equal(await page.locator('#question-heading math').count(),2);assert.equal(await page.locator('.answer math').count(),1);assert.equal(await page.locator('.math-error').count(),0);await page.locator('#game').screenshot({path:'test-results/math-question.png'});await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#game').screenshot({path:'test-results/math-mobile.png'});await page.setViewportSize({width:1440,height:1000});
 const result=await page.evaluate(async()=>{
  const {defaults,submit,initialGame}=await import('/src/game/model.js'),{migrate}=await import('/src/storage/schema.js');
  const p=defaults();p.elevator.motion=false;p.rules.lives=1;p.screens.title.enabled=false;p.floors.target=1;p.floors.mode='fixed';p.tasks[0].prompt=String.raw`$\frac{3}{4}$ и $\sqrt[n]{a}$`;p.buttons.check={background:'#123456',color:'#ffeedd',glowColor:'#cc00ff',glow:18};
  const {gameHTML}=await import('/src/export/export.js'),locales={ru:await(await fetch('/src/locales/ru.json')).json()};
  const old=defaults();delete old.buttons;old.theme.buttonColor='#abcdef';const migrated=migrate(old);
  return {normal:await gameHTML(p,locales),light:await gameHTML(p,locales,true),legacy:migrated.buttons.begin.background};
 });assert.equal(result.legacy,'#abcdef');
 await writeFile('test-results/math-export.html',result.normal);await writeFile('test-results/math-light.html',result.light);
 const exported=await browser.newPage({reducedMotion:'reduce'}),requests=[];exported.on('pageerror',e=>errors.push(e.message));exported.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))requests.push(r.url());});await exported.context().setOffline(true);
 for(const filename of ['math-export.html','math-light.html']){
  await exported.goto('file://'+process.cwd()+'/test-results/'+filename);await exported.locator('.enter-control').click();await exported.locator('.start-task').click();assert.equal(await exported.locator('#question-heading math').count(),2);assert.equal(await exported.locator('[data-action="check"]').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(18, 52, 86)');
  await exported.locator('.answer input[value="1"]').check();await exported.locator('[data-action="check"]').click();await exported.waitForSelector('#game.win');assert.equal(await exported.locator('.hud-pill b').first().textContent(),'1');assert.equal(await exported.locator('#question-heading').count(),0);
  await exported.locator('[data-action="replay"]').click();await exported.locator('.enter-control').click();await exported.locator('.start-task').click();await exported.locator('.answer input[value="0"]').check();await exported.locator('[data-action="check"]').click();await exported.waitForSelector('#game.lose');
 }
 assert.deepEqual(requests,[]);await exported.close();assert.deepEqual(errors,[]);console.log('PASS per-button colours, glow, fonts, goal, display, LaTeX and both offline exports; one-life victory and defeat');
}finally{await browser.close();}
