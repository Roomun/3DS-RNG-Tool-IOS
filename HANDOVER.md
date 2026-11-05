# Handover: Gen 6/7 RNG web app (for Claude Code)

Date: 2026-11-05. Current version: v46 (artifact https://claude.ai/artifact/EzphK1k2THhSaXtpHEe7Ru, source = index.html here). Owner writes English or Dutch; reply in English by default, short and mobile-friendly.

## 1. Goal
Mobile-first (iPhone) single-file HTML port of the open-source 3DS RNG Tool (github.com/wwwwwwzx/3DSRNGTool, MIT) for Gen 6/7 Pokémon RNG: eggs, Gen 7 wild (honey), SOS, fishing, special encounters (UB, Island Scan, ambush, Crabrawler), stationary/gifts incl. Link/Transporter, Gen 6 DexNav/hordes/wild, ID RNG. Installable offline as a home-screen web app (hosted over https, service worker).

## 2. State: what exists and works (all tested only in headless Chromium)
- Engines (TinyMT, MT, SFMT) and generators; Gen 7 results verified against an independent BigInt reference (tools/ref7.js, verify7*.py): wild, UB, scan, ambush, Crabrawler, fishing, leads, shiny lock all matched. NOT verified: Minior forme draw; nothing compared with a real 3DS or the original tool binary.
- UI: 4 steps (Target, Setup, Filters, Results) with target cards (random category-appropriate Pokémon icons; Hordes card shows 5), summary bar, profiles, recent searches, targets, compare, help (EN/NL), settings (theme, time format, layout steps/all, haptics), progress + cancel on searches, camera seed scan (artifact-only, needs `sample` capability), embedded offline pixel font.
- Header: small app icon + title, description hidden behind tap on title/ⓘ.
- Polish added last: slide transitions between steps, swipe left/right between steps, press scale feedback, pop animation on the 4 step buttons, bottom-sheet panels slide in/out, ☰ Menu dropdown staggered in/out, haptics (navigator.vibrate on Android; hidden `<input type=checkbox switch>` label-click hack for iOS 17.4+, setting rng-haptics-v1). All respect prefers-reduced-motion.
- Offline package (offline/ + steps in CLAUDE.md), icon is my own original design (white handheld, "RNG" top screen, Poké Ball outline bottom screen). Owner asked to make it resemble a reference 3DS icon image more closely; I declined to copy that specific artwork/console design, so keep the icon original.

## 3. MENU BUG — FIXED in v47, awaiting iPhone confirmation (do this first)
**Root cause found (v47):** iOS has no `navigator.vibrate`, so the haptics capture click listener calls `lab.click()` on the hidden switch (#hapL) during the real tap. That synthetic click hit the menu's outside-tap listener (target #hapL is outside #fabm) → `close()` → state `closing`; then the real click reached `fb.onclick`, saw state ≠ open and called `open()`. Chromium has `vibrate`, so it never reproduced. Fix: the outside-tap listener ignores `#hapL`. Reproduced and verified in Chromium with `Navigator.prototype.vibrate` deleted: `node tools/smoke27.js`. Still to confirm on the real iPhone (bump the cache, sw.js is now `rng-v47`).

Symptom (owner, real iPhone): with the ☰ Menu dropdown (#fabm) showing, tapping ☰ Menu (#toolFab) to close it does not close it — the items "just reappear". Owner said "It should be able to open and close the menu". Reported unchanged after v43, v44, v45 and v46. Unknown whether he tested the artifact link or the installed home-screen copy (the latter keeps a cached older version until the service worker updates — rule this out first: ask, or bump cache name and test fresh).
Not reproducible in headless Chromium (touch emulation, fast/slow taps, tap during open/close animation, reduce-motion on/off): all pass. WebKit could not be installed in the sandbox (download blocked), so it was never tested in Safari engine.
Attempts: v43 animated close by monkey-patching `classList.remove/add/toggle` on #fabm (suspect on Safari); v46 replaced with a state machine (`state` open/closing/closed in the last script, `window.fabOpen/fabClose`, `fb.onclick`, 120 ms double-fire guard, outside-tap close, dropdown positioned from the bar's rect). Original code (pre-animation) was `$('toolFab').onclick = () => $('fabm').classList.toggle('on')` and worked per owner before animations.
Suspects to check: (a) other handlers that reopen it — search `fabm`, `toolFab`, `openP`; haptics script (capture `click` listener calls `tap()` → `lab.click()` on a hidden switch; label click may re-dispatch clicks); swipe `touchstart/touchend` handlers on `main`; `button:active` transform; (b) iOS double click dispatch / ghost click; (c) service worker serving stale HTML; (d) the closing animation (`fabOut`, `animation-fill-mode both`, `!important` delays with calc/var) behaving differently in WebKit so the element stays visible and looks like it "reappears"; (e) overlap of #fabm over the ☰ Menu button on devices with safe-area padding (fixed in v46 by measuring the bar).
Suggested method: run Playwright WebKit locally (or a real device with Safari Web Inspector); add a temporary on-screen event log (timestamps of click/touch, state transitions); bisect by disabling the haptics script, then the swipe script, then the animations. Safest fallback to ship: no animation for the dropdown, plain show/hide, state machine kept.
Done when: on the owner's iPhone, tap Menu → items appear; tap Menu again → they close; repeat works; items and panels still open.

## 4. Owner's standing rules
Always keep replies short; state honestly what is untested; no timer feature; no manual Gen 6 timeline; keep one artifact URL (update in place, don't create new); before any release: `node --check` on each extracted script + Playwright smoke (tools/smoke*.py). Keep the icon original (don't copy the 3DS reference art).

## 5. Files
index.html (source of truth), offline/ (manifest, sw.js — bump `rng-vNN` each release —, icons, icon SVGs), tools/ (reference engine + verification + smoke tests + data extraction), reference/LocationTable6.cs, CLAUDE.md (architecture, storage keys, build steps for the offline zip).

## 6. Later ideas (not requested)
Self-hosting for the installable app (owner will use Netlify Drop or GitHub Pages), verify Minior, check against a real 3DS, more sprites for fishing/special-encounter cards, Gen 7 extra trigger variants (ask which are missing).

## 7. Starter prompt to give Claude Code
"Read HANDOVER.md and CLAUDE.md in this folder. First fix the open iPhone menu bug described in section 3, reproducing it in WebKit if possible. Keep the single-file architecture. Run node --check and the Playwright smoke tests, then tell me what you changed and what you could not test."
