const fs = require('fs'), p = fs.readFileSync('index.html', 'utf8');
const seg = p.slice(p.indexOf('const DEX6 = '), p.indexOf('const hGame'));
const H = new Function(seg.replace(/\$\(/g, 'X(') + '; return { HORDE6, hordeSpecies, DEX6 };')();
const pk = JSON.parse(fs.readFileSync(process.argv[2]));
const nm = s => H.DEX6.n[s - 1] || s;
let bad = 0;
for (const [g, gm, alt] of [['x', 'xy', false], ['y', 'xy', true], ['or', 'oras', false], ['as', 'oras', true]]) {
  const mine = H.HORDE6[gm].map(a => ({ loc: a[0], name: a[2] + (a[1] ? ' area ' + a[1] : ''), lv: a[4], sp: [0, 1, 2].flatMap(t => H.hordeSpecies(gm, alt, a, t)) }));
  const theirs = pk[g].map(([loc, sp, lv]) => ({ loc, sp, lv }));
  const used = new Set();
  for (const m of mine) {
    const i = theirs.findIndex((t, k) => !used.has(k) && t.loc === m.loc && t.sp.join() === m.sp.join());
    if (i > -1) { used.add(i); if (!theirs[i].lv.includes(m.lv)) console.log(g, m.name, 'level', m.lv, 'PKHeX', theirs[i].lv.join('-')); continue; }
    bad++; const cand = theirs.filter((t, k) => !used.has(k) && t.loc === m.loc);
    console.log('DIFF', g, m.name, '\n   app  :', m.sp.map(nm).join(','), '\n   PKHeX:', cand.map(t => t.sp.map(nm).join(',')).join(' || ') || 'no horde area here');
  }
  theirs.forEach((t, k) => { if (!used.has(k) && !mine.some(m => m.loc === t.loc)) { bad++; console.log('MISSING in app', g, 'location', t.loc, t.sp.map(nm).join(',')); } });
}
console.log('differences:', bad);
