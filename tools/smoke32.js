// A scroll that starts on a button must not press it (Final Screen list, iPhone switch path): node tools/smoke32.js [index.html]
const { chromium } = require('playwright'), path = require('path'), url = require('url');
const URL = url.pathToFileURL(path.resolve(process.argv[2] || 'index.html')).href;
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); fails += !c; };
(async () => {
  const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await c.addInitScript('delete Navigator.prototype.vibrate');
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e))); const cdp = await c.newCDPSession(p);
  await p.goto(URL); await p.waitForTimeout(500);
  const openFS = async () => { await p.tap('#toolFab'); await p.waitForTimeout(500); await p.tap('#fsB'); await p.waitForTimeout(500); };
  const row = () => p.evaluate(() => { const r = [...document.querySelectorAll('#fsL .frow')].map(e => e.getBoundingClientRect()).find(r => r.top > 300 && r.bottom < 700); return r ? [r.x + r.width / 2, r.y + r.height / 2] : null; });
  const picked = () => p.evaluate(() => !!document.getElementById('fsBack'));
  await openFS();
  ok(await p.evaluate(() => document.querySelectorAll('#fsL .frow .hapSw').length > 10), 'Final Screen rows carry haptic switches');
  // 1) finger drags up 120 px on a row (scroll), then a click arrives at the end: must be dropped
  let [x, y] = await row(); const st0 = await p.evaluate(() => document.querySelector('#pnl .sheet').scrollTop);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 6; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 20 }] }); await p.waitForTimeout(16); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(100);
  const st1 = await p.evaluate(() => document.querySelector('#pnl .sheet').scrollTop);
  await p.mouse.click(x, y - 120); await p.waitForTimeout(300); // the click iOS fires after dragging a switch
  ok(!(await picked()), 'drag-to-scroll then click: no target picked (list scrolled ' + (st1 - st0) + ' px)');
  // 2) a normal tap still picks a target
  [x, y] = await row(); await p.touchscreen.tap(x, y); await p.waitForTimeout(400);
  ok(await picked(), 'normal tap picks a target');
  // 3) tap after a pause still works (old movement forgotten)
  await p.tap('#fsBack'); await p.waitForTimeout(400); [x, y] = await row(); await p.touchscreen.tap(x, y); await p.waitForTimeout(400);
  ok(await picked(), 'tap after going back picks again');
  ok(!errs.length, 'no page errors ' + errs);
  await b.close(); console.log('FAILS', fails); process.exit(fails ? 1 : 0);
})();
