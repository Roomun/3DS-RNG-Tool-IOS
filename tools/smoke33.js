// Check a miss for Gen 6 stationary/gifts (Latios, Omega Ruby) + Target star state on iPhone: node tools/smoke33.js [index.html]
const { chromium } = require('playwright'), path = require('path'), url = require('url');
const URL = url.pathToFileURL(path.resolve(process.argv[2] || 'index.html')).href;
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); fails += !c; };
const set = (p, id, v) => p.evaluate(([id, v]) => { const e = document.getElementById(id); if (e.type === 'checkbox') e.checked = v; else e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, v]);
(async () => {
  const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  if (process.env.IOS) await c.addInitScript('delete Navigator.prototype.vibrate');
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('rng-layout-v1', 'all'); }); await p.reload(); await p.waitForTimeout(600);
  await set(p, 'game', '6'); await set(p, 'kind', 'stat'); await set(p, 'seed', '1A2B3C4D');
  // pick Latios (Omega Ruby gift)
  const picked = await p.evaluate(() => { const sv = document.getElementById('sver'), sc = document.getElementById('scat'), sp = document.getElementById('spoke');
    for (const v of [...sv.options].map(o => o.value)) { sv.value = v; sv.dispatchEvent(new Event('change', { bubbles: true }));
      for (const ci of [...sc.options].map(o => o.value)) { sc.value = ci; sc.dispatchEvent(new Event('change', { bubbles: true }));
        for (const pi of [...sp.options].map(o => o.value)) { sp.value = pi; sp.dispatchEvent(new Event('change', { bubbles: true })); const it = curPoke(); if (it && it.s === 381 && it.gift) return [v, it.c, it.ver]; } } } return null; });
  ok(picked, 'picked ' + JSON.stringify(picked));
  const truth = (frame, o2) => p.evaluate(([frame, o2]) => { const cf = stat6Cfg(), o = Object.assign({}, cf.o, o2 || {}); const m = new MT(); m.seed(cf.seed); const buf = []; for (let i = 0; i < frame + cf.delay + 300; i++) buf.push(m.next());
    const e = genStat6(buf, frame + cf.delay + 1, o); return { nature: e.nature, iv: e.iv, delay: cf.delay }; }, [frame, o2]);
  const B = [80, 90, 80, 130, 110, 110], NMI = [1, 2, 5, 3, 4]; // Latios base stats, page order HP Atk Def SpA SpD Spe
  const stats = (t, lv) => { const up = NMI[Math.floor(t.nature / 5)], dn = NMI[t.nature % 5]; return B.map((bs, i) => i === 0 ? Math.floor((2 * bs + t.iv[i]) * lv / 100) + lv + 10 : Math.floor((Math.floor((2 * bs + t.iv[i]) * lv / 100) + 5) * (up === dn ? 10 : i === up ? 11 : i === dn ? 9 : 10) / 10)); };
  await set(p, 'from', '995'); await set(p, 'to', '1005'); await set(p, 'ext', false);
  await p.evaluate(() => run()); await p.waitForTimeout(800);
  ok(await p.evaluate(() => document.querySelectorAll('#out .mxb').length > 0), 'stationary results have a Missed? button');
  // the frame actually hit is 1005, aimed at 1000
  const t = await truth(1005);
  await p.evaluate(() => { document.querySelectorAll('details.sec').forEach(d => d.open = true); const b = [...document.querySelectorAll('#out .mxb')].find(x => x.dataset.f === '1000'); b.click(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /Latios/.test(pBody.innerText) && mxS.value === 'Latios' && mxT.value === '1000'), 'Check a miss opens for Latios, species and target filled in');
  await set(p, 'mxN', String(t.nature)); await set(p, 'mxL', '30');
  await p.evaluate(st => { mxSt.open = true; document.querySelectorAll('#mxSt .iv input').forEach((x, i) => x.value = st[i]); }, stats(t, 30));
  await p.evaluate(() => mxGo.click()); await p.waitForTimeout(400);
  let out = await p.evaluate(() => mxOut.innerText);
  ok(/Frame 1005/.test(out) && /\+5/.test(out) && new RegExp('set Delay to ' + (t.delay + 5)).test(out), 'Latios from Lv 30 stats: frame 1005 (+5) and delay advice');
  // Synchronize set (Adamant) but the result had a random nature
  await set(p, 'ssync', '3');
  const t2 = await truth(1012, { syncNat: 255 });
  await p.evaluate(() => openMiss(1000, 0)); await p.waitForTimeout(200);
  await set(p, 'mxN', String(t2.nature)); await p.evaluate(iv => document.querySelectorAll('#mxI input').forEach((x, i) => x.value = iv[i]), t2.iv);
  await p.evaluate(() => mxGo.click()); await p.waitForTimeout(400); out = await p.evaluate(() => mxOut.innerText);
  ok(/Frame 1012/.test(out) && /Synchronize didn’t apply/.test(out), 'Sync set but not applied: found with that note');
  await set(p, 'ssync', '255'); await p.tap('#pClose'); await p.waitForTimeout(500);
  // Target star on a result card shows its state (tap lands on the haptic switch on iPhone)
  await p.evaluate(() => run()); await p.waitForTimeout(800);
  await p.evaluate(() => document.querySelector('#out .card .ct').scrollIntoView({ block: 'center' })); await p.waitForTimeout(200);
  await p.tap('#out .card .ct'); await p.waitForTimeout(200);
  const st = await p.evaluate(() => { const b = document.querySelector('#out .card .ct'); return [b.textContent.trim(), b.classList.contains('on'), getComputedStyle(b).backgroundColor, !!b.querySelector('.hapSw') === !!window.__noVib]; });
  ok(st[0] === '★ Target' && st[1], 'star turns on: ' + JSON.stringify(st.slice(0, 3)));
  await p.tap('#out .card .ct'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => { const b = document.querySelector('#out .card .ct'); return b.textContent.trim() === '☆ Target' && !b.classList.contains('on'); }), 'star turns off again');
  if (process.env.IOS) ok(await p.evaluate(() => !!document.querySelector('#out .card .ct > .hapSw')), 'haptic switch kept after the label changes');
  await p.tap('#out .card .cc'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.querySelector('#out .card .cc').textContent.trim() === 'Copied'), 'Copy shows Copied');
  ok(await p.evaluate(() => !/Missed\\?/.test(document.querySelector('#out .card').dataset.txt)), 'copied text leaves out the Missed? button');
  ok(!errs.length, 'no page errors ' + errs);
  await b.close(); console.log('FAILS', fails); process.exit(fails ? 1 : 0);
})();
