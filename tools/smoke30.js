// Horde encounters per route: node tools/smoke30.js [index.html]
const { chromium } = require('playwright'), path = require('path'), url = require('url');
const URL = url.pathToFileURL(path.resolve(process.argv[2] || 'index.html')).href;
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); fails += !c; };
const set = (p, id, v) => p.evaluate(([id, v]) => { const e = document.getElementById(id); if (e.type === 'checkbox') e.checked = v; else e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, [id, v]);
const cards = p => p.evaluate(() => [...document.querySelectorAll('#hlist .htb')].map(b => b.innerText.replace(/\s+/g, ' ').trim()));
(async () => {
  const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await c.addInitScript("if(!sessionStorage.getItem('x')){localStorage.clear();sessionStorage.setItem('x','1')} localStorage.setItem('rng-layout-v1','all')");
  const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL); await p.waitForTimeout(600);
  await set(p, 'game', '6'); await set(p, 'kind', 'horde');
  await set(p, 'hver', 'x'); await set(p, 'harea', '28:0');
  let cs = await cards(p); console.log('   X Route 5:', cs.join(' | '));
  ok(cs.length === 3 && /Horde 1 · 60%/.test(cs[0]) && /Gulpin ×5/.test(cs[0]) && /Plusle ×4 \+ Minun ×1/.test(cs[2]) && /5%/.test(cs[2]), 'X Route 5: three hordes, rates, mixed Plusle horde');
  await set(p, 'hver', 'y'); cs = await cards(p);
  ok(/Minun ×4 \+ Plusle ×1/.test(cs[2]) && await p.evaluate(() => harea.value === '28:0'), 'Y swaps Plusle/Minun, route kept');
  await set(p, 'hver', 'as'); ok(await p.evaluate(() => harea.value === '' && hlist.innerHTML === ''), 'switching to OR/AS clears an X/Y route');
  await set(p, 'harea', '230:0'); cs = await cards(p);
  ok(/Lotad ×4 \+ Swablu ×1/.test(cs[1]), 'AS Route 114: Lotad horde with a Swablu ' + cs[1]);
  // X Route 11, Nidoran♂ horde with one Nidoran♀ in position 5: gender per position
  await set(p, 'hver', 'x'); await set(p, 'harea', '54:0');
  await p.tap('#hlist .htb[data-t="1"]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => hratio.disabled && /set by the horde/.test(hratioL.textContent)), 'picking a horde locks the gender ratio');
  await set(p, 'seed', '1A2B3C4D'); await set(p, 'from', '0'); await set(p, 'to', '200'); await set(p, 'hpos', '0');
  await p.evaluate(() => run()); await p.waitForTimeout(800);
  const g = await p.evaluate(() => [...document.querySelectorAll('#out .card')].map(c => c.innerText));
  const pos5 = g.filter(t => /position 5/.test(t)), pos1 = g.filter(t => /position 1/.test(t));
  ok(pos5.length && pos5.every(t => /Nidoran♀/.test(t) && /♀/.test(t) && !/♂ ·/.test(t)) && pos1.every(t => /Nidoran♂ · Lv 11/.test(t) && /♂/.test(t)), 'Route 11: positions 1-4 ♂ Nidoran♂, position 5 ♀ Nidoran♀ (' + pos5.length + ' cards)');
  // X Reflection Cave: Mime Jr. horde has 3 perfect IVs
  await p.evaluate(() => document.querySelectorAll('details.sec').forEach(d => d.open = true));
  await set(p, 'harea', '56:0'); await p.tap('#hlist .htb[data-t="1"]'); await p.waitForTimeout(200);
  ok(/3 perfect IVs/.test((await cards(p))[0]), 'Mime Jr. horde marked 3 perfect IVs');
  await p.evaluate(() => run()); await p.waitForTimeout(800);
  const iv31 = await p.evaluate(() => [...document.querySelectorAll('#out .card')].map(c => [...c.querySelectorAll('.stats div')].filter(d => /\b31$/.test(d.innerText.trim())).length));
  ok(iv31.length && iv31.every(n => n >= 3), 'every Mime Jr. result has at least three 31s (' + iv31.length + ' cards)');
  // remembered after reload
  await p.reload(); await p.waitForTimeout(800);
  ok(await p.evaluate(() => hver.value === 'x' && harea.value === '56:0' && htype.value === '1' && document.querySelector('#hlist .htb.on') && hratio.disabled), 'game, route and horde restored after reload');
  // unpick -> back to one ratio
  await p.evaluate(() => document.querySelectorAll('details.sec').forEach(d => d.open = true)); await p.tap('#hlist .htb.on'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => htype.value === '0' && !hratio.disabled), 'tapping the picked horde again unpicks it');
  // per-version positions (checked against PKHeX): Y Route 11 Nidoran♀ in position 2, Y Route 12 Miltank in 4, OR Route 110 Plusle in 4
  const pv = await p.evaluate(() => { const a = (gm, loc) => HORDE6[gm].find(x => x[0] === loc);
    return [hordeSpecies('xy', true, a('xy', 54), 0).indexOf(29), hordeSpecies('xy', false, a('xy', 54), 0).indexOf(29), hordeSpecies('xy', true, a('xy', 62), 2).indexOf(241), hordeSpecies('oras', false, a('oras', 222), 2).indexOf(311)]; });
  ok(JSON.stringify(pv) === '[1,4,3,3]', 'per-version mixed positions ' + JSON.stringify(pv));
  ok(await p.evaluate(() => [...document.querySelectorAll('#hlist .htb')].every(b => b.querySelector('img'))), 'horde cards have sprites');
  ok(!errs.length, 'no page errors ' + errs);
  await b.close(); console.log('FAILS', fails); process.exit(fails ? 1 : 0);
})();
