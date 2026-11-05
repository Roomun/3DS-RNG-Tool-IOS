// Independent reference for Gen 7 wild-type generation, written from Wild7.cs / RNGPool.cs / MainForm_Core.cs Search7_Normal (BigInt, class-based)
window.REF = function (P) {
  const sf = new SFMT(P.seed >>> 0);
  const NR = P.max + P.min + 20000, R = [];
  for (let i = 0; i < NR; i++) { const lo = BigInt(sf.u32() >>> 0), hi = BigInt(sf.u32() >>> 0); R.push(lo | (hi << 32n)); }
  const pool = { ptr: 0, n: 0, rf: [], phase: false, raining: P.raining, base: 0 };
  const g64 = () => R[++pool.ptr];
  const adv = k => { pool.ptr += k; };
  const te7 = n => {
    for (let t = 0; t < n; t++) {
      for (let i = 0; i < pool.n; i++) {
        if (pool.rf[i] > 1) { pool.rf[i]--; continue; }
        if (pool.rf[i] < 0) { if (++pool.rf[i] === 0) pool.rf[i] = g64() % 3n === 0n ? 36 : 30; continue; }
        if (Number(g64() & 0x7fn) === 0) pool.rf[i] = -5;
      }
      if (pool.raining) { pool.phase = !pool.phase; if (pool.phase) adv(2); }
    }
  };
  const normalDelay = () => te7(P.delayTime);
  const resetModel = () => { pool.rf = new Array(pool.n).fill(0); pool.phase = false; };
  const wildDelay = () => {
    switch (P.dtype) {
      case 1: normalDelay(); break;
      case 2: { const fd = Number(g64() % 60n) + P.bite; adv(1); te7(fd); pool.isPokemon = P.suction || Number(g64() % 100n) < 50; te7(P.plat); normalDelay(); break; }
      case 3: adv(2); normalDelay(); if (P.cry) adv(1); break;
      case 4: te7(2); adv(2); te7(P.delayTime - 2); if (P.cry) adv(1); break;
      default: normalDelay(); resetModel(); if (P.ultrawild) adv(1); if (pool.raining) adv(2); te7(1); adv(P.corr - pool.n + 1); te7(P.honeyDelay);
    }
  };
  const inline = () => { if (P.d2 === 1) { te7(P.dt2 - 2); pool.n--; te7(2); } else te7(P.dt2); };
  const slotget = (r, sp) => { for (let i = 1; i < sp.length; i++) { r -= sp[i - 1]; if (r < 0) return i; } return sp.length; };
  const gen = () => {
    const res = { pokemon: true };
    let special = false, slot = 0, level = 0;
    if (P.mode === 'fish') {
      special = Number(g64() % 100n) >= P.rate; te7(12);
      if (special) { res.hooked = true; }
    } else if (P.rate > 0) special = Number(g64() % 100n) < P.rate;
    let r100;
    const normalSlot = !special || P.mode === 'fish';
    if (P.mode === 'crab') { r100 = Number(g64() % 100n); slot = 1; level = P.clevel; }
    else if (normalSlot) {
      r100 = Number(g64() % 100n);
      slot = slotget(Number(g64() % 100n), P.slots);
      level = Number(g64() % BigInt(P.lmax - P.lmin + 1)) + P.lmin;
      g64(); // flute boost draw
    } else { slot = 0; te7(7); r100 = Number(g64() % 100n); te7(3); level = P.slvl; }
    const inf = special && P.mode !== 'fish' ? P.sinfo : P.info[slot];
    if (P.dt2 > 0 && P.mode === 'misc') inline();
    adv(60);
    res.ec = Number(g64() & 0xffffffffn);
    const locked = P.ub && special && P.mode !== 'fish' && P.locked;
    let pid = 0, shiny = false;
    for (let i = (P.charm && !locked ? 3 : 1); i > 0; i--) {
      pid = Number(g64() & 0xffffffffn) >>> 0;
      const psv = ((pid >>> 16) ^ (pid & 0xffff)) >>> 4;
      if (psv === P.tsv) { if (locked) pid = (pid ^ 0x10000000) >>> 0; else shiny = true; break; }
    }
    const iv = [0, 0, 0, 0, 0, 0];
    const iv3 = P.ub && special ? true : inf.iv3;
    for (let i = iv3 ? 3 : 0; i > 0;) { const t = Number(g64() % 6n); if (iv[t] === 0) { i--; iv[t] = 31; } }
    for (let i = 0; i < 6; i++) if (iv[i] === 0) iv[i] = Number(g64() & 0x1fn);
    res.ability = P.ub && special ? 1 : Number(g64() & 1n) + 1;
    res.nature = Number(g64() % 25n);
    res.gender = inf.rnd ? (Number(g64() % 252n) >= inf.gp ? 1 : 2) : inf.gp;
    res.item = normalSlot ? Number(g64() % 100n) : 100;
    res.pid = pid; res.shiny = shiny; res.iv = iv; res.slot = slot; res.level = level; res.special = special;
    return res;
  };
  // Search7_Normal
  const out = {};
  let q = P.min; const gs = () => R[q++];
  // ModelStatus clone (own read pointer)
  const mk = () => ({ rf: new Array(P.models).fill(0), phase: false });
  const status = mk(), stmp = mk();
  const nextState = () => {
    let cnt = 0;
    for (let i = 0; i < P.models; i++) {
      if (status.rf[i] > 1) { status.rf[i]--; continue; }
      if (status.rf[i] < 0) { if (++status.rf[i] === 0) { cnt++; status.rf[i] = gs() % 3n === 0n ? 36 : 30; } continue; }
      cnt++; if (Number(gs() & 0x7fn) === 0) status.rf[i] = -5;
    }
    if (P.raining) { status.phase = !status.phase; if (status.phase) { q += 2; cnt += 2; } }
    return cnt;
  };
  let i = P.min;
  while (i <= P.max) {
    let fa;
    do { fa = nextState(); } while (fa === 0);
    do {
      pool.ptr = i - 1; pool.n = P.models; pool.rf = stmp.rf.slice(); pool.phase = stmp.phase;
      pool.isPokemon = true; if (P.consider) wildDelay(); else resetModel();
      let r = gen();
      fa--; i++;
      if (i > P.max + 1) continue;
      const bad = P.mode === 'fish' && (!pool.isPokemon || r.hooked === true);
      if (!bad) { r.frame = i - 1; out[r.frame] = r; }
    } while (fa > 0);
    stmp.rf = status.rf.slice(); stmp.phase = status.phase;
  }
  return out;
};
