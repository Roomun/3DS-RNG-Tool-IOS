// Menu placement on the Results step + iPhone-style haptics: node tools/smoke31.js [index.html]
const { chromium } = require('playwright'), path = require('path'), url = require('url');
const URL = url.pathToFileURL(path.resolve(process.argv[2] || 'index.html')).href;
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); fails += !c; };
(async () => {
  const b = await chromium.launch();
  for (const [vw, vh] of [[390, 844], [375, 667], [320, 568]]) {
    const c = await b.newContext({ viewport: { width: vw, height: vh }, hasTouch: true, isMobile: true });
    await c.addInitScript(() => { delete Navigator.prototype.vibrate; window.__ticks = 0; window.__fwd = 0;
      // a "tick" = a real tap landing on the switch inside the button; __fwd counts the menu button's own handler runs
      document.addEventListener('click', e => { if (e.isTrusted && e.target.classList && e.target.classList.contains('hapSw')) window.__ticks++; }, true);
      document.addEventListener('DOMContentLoaded', () => { const f = document.getElementById('toolFab'), o = f && f.onclick; }); });
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
    ok(await p.evaluate(() => [...document.querySelectorAll('button,summary')].every(b => b.querySelector(':scope>.hapSw'))), '  every button and summary has its switch');
    ok(await p.evaluate(() => [...document.querySelectorAll('.hapSw')].every(sw => { const b = sw.parentNode.getBoundingClientRect(), q = sw.getBoundingClientRect(); return !q.width || (q.left >= b.left - 1 && q.right <= b.right + 1 && q.top >= b.top - 1 && q.bottom <= b.bottom + 1); })), '  every switch stays inside its button');
    // section headers (summary) open/close with one tap
    await p.evaluate(() => setStep(2)); await p.waitForTimeout(400);
    const sm = await p.evaluate(() => { const d = [...document.querySelectorAll('details.sec')].find(x => x.offsetParent); return d ? (d.id || (d.id = 'tmpSec')) : null; });
    const tapSum = async () => { const r = await p.evaluate(id => { const e = document.querySelector('#' + id + ' > summary'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.x + 30, r.y + r.height / 2]; }, sm); await p.waitForTimeout(150); await p.touchscreen.tap(r[0], r[1]); await p.waitForTimeout(200); };
    const o0 = await p.evaluate(id => document.getElementById(id).open, sm); await tapSum();
    const o1 = await p.evaluate(id => document.getElementById(id).open, sm); await tapSum();
    ok(o1 === !o0 && await p.evaluate(id => document.getElementById(id).open, sm) === o0, '  section header toggles on a single tap');
    await p.evaluate(() => setStep(4)); await p.waitForTimeout(400);
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
