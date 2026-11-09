// Menu placement on the Results step + iPhone-style haptics: node tools/smoke31.js [index.html]
const { chromium } = require('playwright'), path = require('path'), url = require('url');
const URL = url.pathToFileURL(path.resolve(process.argv[2] || 'index.html')).href;
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); fails += !c; };
(async () => {
  const b = await chromium.launch();
  for (const [vw, vh] of [[390, 844], [375, 667], [320, 568]]) {
    const c = await b.newContext({ viewport: { width: vw, height: vh }, hasTouch: true, isMobile: true });
    await c.addInitScript(() => { delete Navigator.prototype.vibrate; window.__ticks = 0; window.__fwd = 0;
      // a "tick" = a real tap landing on the switch that the haptics script moves under the finger
      document.addEventListener('click', e => { if (e.target.id === 'hapOv' && e.isTrusted) window.__ticks++; else if (!e.isTrusted && window.__hapFwd) window.__fwd++; }, true); });
    const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto(URL); await p.waitForTimeout(500);
    await p.evaluate(() => { const s = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }; s('game', '6'); s('kind', 'horde'); s('seed', '1A2B3C4D'); });
    await p.evaluate(() => run()); await p.waitForTimeout(1000); await p.evaluate(() => { setStep(4); scrollTo(0, 0); }); await p.waitForTimeout(500);
    const inView = () => p.evaluate(() => ([...fabm.querySelectorAll('button')].every(x => { const r = x.getBoundingClientRect(), f = fabm.getBoundingClientRect(); return r.top >= f.top - 1 && r.bottom <= f.bottom + 1; }) || fabm.scrollHeight > fabm.clientHeight) && (() => { const f = fabm.getBoundingClientRect(); return f.top >= 0 && f.bottom <= innerHeight; })());
    await p.tap('#toolFab'); await p.waitForTimeout(600);
    ok(await p.evaluate(() => fabm.classList.contains('down')) && await inView(), vw + 'x' + vh + ' results step: menu opens downward, on screen (scrolls if the screen is too short)');
    for (const id of ['hlpB', 'mxB', 'setB']) ok(await p.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(), f = fabm.getBoundingClientRect(); return r.height > 0 && r.top >= f.top - 1 && r.bottom <= Math.min(f.bottom, innerHeight) + 1 || (fabm.scrollHeight > fabm.clientHeight); }, id), '  ' + id + ' reachable');
    await p.evaluate(() => scrollBy(0, 150)); await p.waitForTimeout(200);
    const fl = await p.evaluate(() => { const a = fabm.getBoundingClientRect(), r = toolFab.closest('.bar').getBoundingClientRect(); return [Math.round(a.top), Math.round(r.top), Math.round(r.bottom)]; });
    ok(fl[0] >= 0, '  menu stays on screen after scrolling ' + JSON.stringify(fl));
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(150);
    await p.tap('#setB'); await p.waitForTimeout(500);
    ok(await p.evaluate(() => pnl.classList.contains('on') && !fabm.classList.contains('on')), '  Settings opens from the downward menu');
    await p.tap('#pClose'); await p.waitForTimeout(500);
    // menu still toggles with haptics firing (the v47 bug must not come back)
    const t0 = await p.evaluate(() => window.__ticks), r = [];
    for (let i = 0; i < 4; i++) { await p.tap('#toolFab'); await p.waitForTimeout(600); r.push(await p.evaluate(() => getComputedStyle(fabm).display !== 'none')); }
    const t1 = await p.evaluate(() => window.__ticks);
    ok(JSON.stringify(r) === '[true,false,true,false]' && t1 - t0 === 4, '  toggles open/close, one switch tap per tap ' + JSON.stringify(r) + ' ticks ' + (t1 - t0));
    ok(await p.evaluate(() => getComputedStyle(hapOv).display === 'none'), '  finger switch hidden again after the taps');
    ok(await p.evaluate(() => window.__fwd) >= 4, '  taps were passed on to the buttons');
    // setup step (bar at the bottom): opens upward as before
    await p.evaluate(() => setStep(2)); await p.waitForTimeout(500);
    await p.tap('#toolFab'); await p.waitForTimeout(600);
    ok(await p.evaluate(() => !fabm.classList.contains('down')) && await inView(), '  setup step: menu opens upward');
    await p.tap('#toolFab'); await p.waitForTimeout(600);
    // settings test button + diagnostics
    await p.tap('#toolFab'); await p.waitForTimeout(500); await p.tap('#setB'); await p.waitForTimeout(500);
    const t2 = await p.evaluate(() => window.__ticks); await p.evaluate(() => hapX.scrollIntoView()); await p.tap('#hapX'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => window.__ticks) - t2 === 1 && /switch under your finger/.test(await p.evaluate(() => hapD.textContent)), '  Test haptic button: one switch tap, info: ' + await p.evaluate(() => hapD.textContent));
    // haptics off: no switch under the finger, buttons still work
    await p.evaluate(() => { hapT.value = '0'; hapT.dispatchEvent(new Event('change')); }); await p.tap('#pClose'); await p.waitForTimeout(500);
    const t3 = await p.evaluate(() => window.__ticks), ro = [];
    for (let i = 0; i < 2; i++) { await p.tap('#toolFab'); await p.waitForTimeout(600); ro.push(await p.evaluate(() => getComputedStyle(fabm).display !== 'none')); }
    ok(await p.evaluate(() => window.__ticks) === t3 && JSON.stringify(ro) === '[true,false]', '  haptics off: menu works without the switch');
    await p.evaluate(() => localStorage.setItem('rng-haptics-v1', '1'));
    ok(!errs.length, '  no page errors ' + errs);
    await c.close();
  }
  await b.close(); console.log('FAILS', fails); process.exit(fails ? 1 : 0);
})();
