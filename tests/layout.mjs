import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000');
 await page.locator('[data-tab="layers"]').click();await page.locator('[data-layer="player"]').click();assert.equal(await page.locator('.hero.chosen').count(),1);
 await page.locator('[data-path="layout.player.scale"]').fill('1.5');assert.equal(await page.locator('.hero').evaluate(el=>el.style.getPropertyValue('--object-scale')),'1.5');
 await page.locator('#selection-scale').fill('1.25');assert.equal(await page.locator('[data-path="layout.player.scale"]').inputValue(),'1.25');assert.equal(await page.locator('#selection-scale-value').textContent(),'125%');await page.locator('[data-action="undo"]').click();assert.equal(await page.locator('#selection-scale').inputValue(),'1.5');
 const before=await page.locator('.hero').evaluate(el=>+el.style.zIndex);await page.locator('[data-layer-order="player"][data-delta="1"]').click();assert.ok(await page.locator('.hero').evaluate(el=>+el.style.zIndex)>before);
 await page.locator('[data-tab="frame"]').click();await page.locator('[data-path="sceneFrame.style"]').selectOption('dashed');await page.locator('[data-path="sceneFrame.width"]').fill('6');await page.locator('[data-path="sceneFrame.glow"]').fill('20');assert.equal(await page.locator('#game').evaluate(el=>getComputedStyle(el,':after').borderTopStyle),'dashed');
 await page.locator('[data-view="cabin"]').click();assert.equal(await page.locator('.cabin-shell .portal').evaluate(el=>getComputedStyle(el).display),'none');await page.locator('#game').screenshot({path:'test-results/new-cabin.png'});
 await page.locator('[data-view="lobby"]').click();assert.notEqual(await page.locator('.exterior-shell .portal').evaluate(el=>getComputedStyle(el).display),'none');await page.locator('#game').screenshot({path:'test-results/new-lobby.png'});
 await page.waitForTimeout(800);await page.reload();await page.locator('#restore').click();await page.locator('[data-tab="frame"]').click();assert.equal(await page.locator('[data-path="sceneFrame.width"]').inputValue(),'6');await page.locator('[data-tab="layers"]').click();await page.locator('[data-layer="player"]').click();assert.equal(await page.locator('[data-path="layout.player.scale"]').inputValue(),'1.5');
 await page.setViewportSize({width:390,height:844});await page.locator('#selection-tools').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'test-results/mobile-scale.png'});
 await page.locator('[data-action="test"]').click();assert.equal(await page.locator('#selection-tools').isVisible(),false);await page.locator('[data-action="edit"]').click();assert.equal(await page.locator('#selection-tools').isVisible(),true);
 assert.deepEqual(errors,[]);console.log('PASS layers, scale, frame, distinct cabin and lobby, draft persistence');
}finally{await browser.close();}
