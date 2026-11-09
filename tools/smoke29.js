// "Check a miss" (Gen 6 egg + horde): node tools/smoke29.js [index.html]
// Builds Pokémon at known frames with the page's own generators, enters them, and checks the reported offset.
const { chromium } = require('playwright'), path = require('path'), url = require('url');
const URL = url.pathToFileURL(path.resolve(process.argv[2] || 'index.html')).href;
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); fails += !c; };
const set = (p, id, v) => p.evaluate(([id, v]) => { const e = document.getElementById(id); if (e.type === 'checkbox') e.checked = v; else e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, v]);
(async () => {
  const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true });
  await c.addInitScript("localStorage.setItem('rng-layout-v1','all')");
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL); await p.waitForTimeout(600);
  // ---------- horde ----------
  await set(p, 'game', '6'); await set(p, 'kind', 'horde'); await set(p, 'seed', '1A2B3C4D'); await set(p, 'tsv', '');
  const truth = (frame, pos, ha) => p.evaluate(([frame, pos, ha]) => {
    const m = new MT(); m.seed(0x1A2B3C4D); const buf = []; for (let i = 0; i < frame + 174 + 300; i++) buf.push(m.next());
    const ratio = +hratio.value, o = { assume: false, charm: false, tsv: -1, trv: 0, ha, gp: gpOf(ratio), rnd: ratio > 0x0f && ratio < 0xef, syncNat: 255, pos: 0 };
    const e = genHorde6(buf, frame + 174 + 1, o)[pos - 1]; return { nature: e.nature, iv: e.iv, gender: e.gender, ec: e.ec };
  }, [frame, pos, ha]);
  const open = async (T, pos) => { await p.evaluate(([T, pos]) => openMiss(T, pos), [T, pos]); await p.waitForTimeout(200); };
  const fill = async (t, opts = {}) => {
    await set(p, 'mxN', String(t.nature));
    if (!opts.noIv) await p.evaluate(iv => document.querySelectorAll('#mxI input').forEach((x, i) => x.value = iv[i]), t.iv);
    await p.tap('#mxGo'); await p.waitForTimeout(400);
    return p.evaluate(() => document.getElementById('mxOut').innerText);
  };
  let t = await truth(1003, 2, 0); await open(1000, 2);
  let out = await fill(t);
  ok(/Frame 1003\s*\n?\s*\+3/.test(out) && /set Delay to 177 \(now 174\)/.test(out), 'horde +3 found, delay advice 177');
  // unexpected Hidden Ability in position 3, checking position 5 (draws shifted)
  t = await truth(2000, 5, 3); await open(2000, 5); out = await fill(t);
  ok(/Frame 2000/.test(out) && /Hidden Ability in position 3/.test(out), 'horde with HA in position 3 found as that variant');
  // stats instead of IVs: Lucario Lv 30, computed independently here
  t = await truth(1500, 1, 0);
  const B = [70, 110, 70, 115, 70, 90], NMI = [1, 2, 5, 3, 4], up = NMI[Math.floor(t.nature / 5)], dn = NMI[t.nature % 5];
  const stats = B.map((b, i) => i === 0 ? Math.floor((2 * b + t.iv[i]) * 30 / 100) + 40 : Math.floor((Math.floor((2 * b + t.iv[i]) * 30 / 100) + 5) * (up === dn ? 1 : i === up ? 1.1 : i === dn ? 0.9 : 1) + 1e-9));
  await open(1490, 1); await set(p, 'mxS', 'Lucario'); await set(p, 'mxL', '30');
  await p.evaluate(st => { document.getElementById('mxSt').open = true; document.querySelectorAll('#mxSt .iv input').forEach((x, i) => x.value = st[i]); }, stats);
  out = await fill(t, { noIv: true });
  ok(/Frame 1500/.test(out) && /\+10/.test(out), 'horde from Lv30 Lucario stats: frame 1500 (+10) listed');
  ok(await p.evaluate(() => [...document.getElementById('mxA').options].map(o => o.text).join('|')) === 'Don’t know|Steadfast|Inner Focus|Justified (Hidden)', 'ability names follow species');
  // nothing matches -> nearest shown
  await open(1000, 1); await set(p, 'mxN', '0'); await p.evaluate(() => document.querySelectorAll('#mxI input').forEach(x => x.value = '31'));
  await p.tap('#mxGo'); await p.waitForTimeout(400);
  ok(/No frame within ±300/.test(await p.evaluate(() => mxOut.innerText)), 'no-match message');
  // ---------- egg (accept, PID from main RNG) ----------
  await set(p, 'kind', 'egg'); await set(p, 'acc', '1'); await set(p, 'charm', false); await set(p, 'mm', false); await set(p, 'delay', '16'); await set(p, 'seed', '1A2B3C4D');
  const te = await p.evaluate(() => {
    const fd = document.getElementById('fd').checked;
    const o = { gp: GP[+ratio.value] || 0, nido: nido.checked, mi: +mi.value, fi: +fi.value, inhAb: fd ? +mab.value : +fab.value, mIV: ivs('mIVs'), fIV: ivs('fIVs'), homog: homog.checked, fDitto: fd, tsv: -1, trv: 0, charm: false, mm: false, main: true };
    const m = new MT(); m.seed(0x1A2B3C4D); const buf = []; for (let i = 0; i < 900; i++) buf.push(m.next());
    const bb = 798 + 16 + 1, e = genEgg6(o, [buf[bb + 1], buf[bb + 2]], buf[bb]); return { nature: e.nature, iv: e.iv, ch: missCharOf(e.ec, e.iv) };
  });
  await p.tap('#pClose'); await p.waitForTimeout(500); await p.tap('#toolFab'); await p.waitForTimeout(400); await p.tap('#mxB'); await p.waitForTimeout(300);
  await set(p, 'mxT', '800'); await set(p, 'mxC', String(te.ch));
  out = await fill(te);
  ok(/Frame 798/.test(out) && /−2/.test(out) && /set Delay to 14 \(now 16\)/.test(out), 'egg −2 found via menu button, delay advice 14');
  // wrong kind -> friendly message
  await set(p, 'game', '7'); await p.evaluate(() => openMiss(-1, 0)); await p.waitForTimeout(200);
  ok(/works for Gen 6 eggs and hordes/.test(await p.evaluate(() => pBody.innerText)), 'Gen 7 shows explanation');
  // "Missed?" button on a real horde result card
  await set(p, 'game', '6'); await set(p, 'kind', 'horde'); await set(p, 'seed', '1A2B3C4D'); await set(p, 'from', '500'); await set(p, 'to', '600');
  await p.evaluate(() => run()); await p.waitForTimeout(800);
  const cb = await p.evaluate(() => { const b = document.querySelector('#out .mxb'); if (!b) return null; const r = [b.dataset.f, b.dataset.p]; b.click(); return r; });
  await p.waitForTimeout(300);
  ok(cb && await p.evaluate(cb => mxT.value === cb[0] && mxP.value === cb[1], cb), 'card button prefills frame ' + (cb && cb.join(' pos ')));
  ok(!errs.length, 'no page errors ' + errs);
  await b.close(); console.log('FAILS', fails); process.exit(fails ? 1 : 0);
})();
