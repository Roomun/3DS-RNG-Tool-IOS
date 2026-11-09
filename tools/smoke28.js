// Offline scan (Live Text / paste) + Claude scan path with a mocked window.claude: node tools/smoke28.js [index.html]
const { chromium } = require('playwright'), path = require('path'), url = require('url');
const URL = url.pathToFileURL(path.resolve(process.argv[2] || 'index.html')).href;
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); fails += !c; };
(async () => {
  const b = await chromium.launch();
  // --- offline: no window.claude ---
  let c = await b.newContext({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true });
  if (process.env.IOS) await c.addInitScript('delete Navigator.prototype.vibrate');
  await c.addInitScript("localStorage.setItem('rng-layout-v1','all')");
  let p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL); await p.waitForTimeout(600);
  await p.evaluate("kind.value='stat';kind.dispatchEvent(new Event('change',{bubbles:true}))"); await p.waitForTimeout(300); // Gen 7 Eggs takes the egg seed instead
  await p.tap('#toolFab'); await p.waitForTimeout(500); await p.tap('#scB'); await p.waitForTimeout(500);
  ok(await p.evaluate("pnl.classList.contains('on') && /Scan Text/.test(pBody.textContent) && !!document.getElementById('scSeed')"), 'menu Scan opens Live Text form');
  await p.evaluate("document.querySelector('#pBody details').open=true");
  await p.fill('#scTxt', 'Initial Seed: 1a2b3c4O\nMT Advances: 1,234\nTID: 12345  SID: 54321\nTSV: 0777');
  const v = await p.evaluate("['scSeed','scFrame','scTid','scSid','scTsv'].map(i=>document.getElementById(i).value)");
  ok(JSON.stringify(v) === JSON.stringify(['1A2B3C40', '1234', '12345', '54321', '0777']), 'paste parsed ' + JSON.stringify(v) + ' / ' + await p.textContent('#scTxtS'));
  await p.fill('#scSeed', 'Seed: 0xDEADBEEF'); await p.dispatchEvent('#scSeed', 'change');
  ok(await p.inputValue('#scSeed') === 'DEADBEEF', 'Live-Text-style line cleaned to value');
  await p.fill('#scFrame', 'Frames 5O0');
  await p.tap('#scApply'); await p.waitForTimeout(500);
  const f = await p.evaluate("[seed.value, from.value, tid.value, sid.value, pnl.classList.contains('on'), msg.textContent]");
  ok(f[0] === 'DEADBEEF' && f[1] === '500' && f[2] === '12345' && f[3] === '54321' && !f[4], 'apply fills form ' + JSON.stringify(f));
  await p.tap('#seedCam'); await p.waitForTimeout(500);
  ok(await p.evaluate("pnl.classList.contains('on') && !!document.getElementById('scTxt')"), '📷 Scan button opens Live Text form offline');
  ok(await p.evaluate("JSON.stringify(scanParse('Egg Seed: 11111111,22222222,33333333,44444444'))") === JSON.stringify({ eggSeed: '11111111,22222222,33333333,44444444', initSeed: null, frame: null, tid: null, sid: null, tsv: null }), 'egg seed label not taken as initial seed');
  ok(!errs.length, 'no page errors ' + errs); await c.close();
  // --- Claude path (mocked) still shows the photo flow ---
  c = await b.newContext({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true });
  if (process.env.IOS) await c.addInitScript('delete Navigator.prototype.vibrate');
  await c.addInitScript("window.claude={use:async()=>({limits:async()=>({images:true}),json:async()=>({initSeed:'ABCDEF12',frame:42,note:'mock'})})}");
  p = await c.newPage(); errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(URL); await p.waitForTimeout(600);
  await p.tap('#toolFab'); await p.waitForTimeout(500); await p.tap('#scB'); await p.waitForTimeout(500);
  ok(await p.evaluate("!!document.getElementById('scCam') && !document.getElementById('scTxt')"), 'Claude path: Take photo / Choose photo shown');
  await p.setInputFiles('#scIn', { name: 'x.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') });
  await p.waitForTimeout(600);
  ok(await p.evaluate("scSeed.value==='ABCDEF12' && scFrame.value==='42' && !!document.querySelector('#scBox img') && scAgain.textContent==='Retake'"), 'Claude path: result form with photo');
  ok(!errs.length, 'no page errors ' + errs);
  await b.close(); console.log('FAILS', fails); process.exit(fails ? 1 : 0);
})();
