// Menu open/close regression test: node tools/smoke27.js [index.html]
// Runs with and without navigator.vibrate. iOS Safari has no vibrate, so the
// haptics script falls back to lab.click() on a hidden switch; that synthetic
// click used to hit the menu's outside-tap listener and re-open the menu (v43-v46).
const { chromium } = require('playwright'), path = require('path'), url = require('url');
const URL = url.pathToFileURL(path.resolve(process.argv[2] || 'index.html')).href;
(async () => {
  let fails = 0;
  for (const novib of [false, true]) for (const rm of ['no-preference', 'reduce']) {
    const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true, reducedMotion: rm });
    if (process.env.IOS) await c.addInitScript('delete Navigator.prototype.vibrate');
    if (novib) await c.addInitScript('delete Navigator.prototype.vibrate');
    const pg = await c.newPage(), errs = []; pg.on('pageerror', e => errs.push(String(e)));
    await pg.goto(URL); await pg.waitForTimeout(700);
    const on = () => pg.evaluate("getComputedStyle(fabm).display!=='none'"), res = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { await pg.tap('#toolFab'); await pg.waitForTimeout(700); res.push(await on()); }
    await pg.tap('#toolFab'); await pg.waitForTimeout(700); await pg.tap('#setB'); await pg.waitForTimeout(600);
    const item = !(await on()) && await pg.evaluate("pnl.classList.contains('on')");
    await pg.tap('#pClose'); await pg.waitForTimeout(600);
    await pg.tap('#toolFab'); await pg.waitForTimeout(700); await pg.touchscreen.tap(200, 200); await pg.waitForTimeout(700);
    const outside = !(await on());
    const ok = JSON.stringify(res) === JSON.stringify([true, false, true, false, true, false]) && item && outside && !errs.length;
    fails += !ok;
    console.log(novib ? 'no-vibrate(iOS-like)' : 'vibrate', rm, ok ? 'OK' : 'FAIL', JSON.stringify(res), 'item->panel', item, 'outside-close', outside, errs);
    await b.close();
  }
  console.log('FAILS', fails); process.exit(fails ? 1 : 0);
})();
