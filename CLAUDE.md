# Gen 6 / 7 RNG — mobile web port of 3DSRNGTool

Single-file HTML app (index.html, ~730 KB, vanilla JS, no build step, no external requests) porting wwwwwwzx/3DSRNGTool (MIT) for Gen 6/7 Pokémon RNG. Target: iPhone Safari / home-screen web app. Default language English.

## Layout of index.html
Three main script blocks plus small trailing scripts:
- c0: engines (TinyMT, MT, SFMT), Gen 6/7 generators and searches, UI state, `widen()` async search with progress/cancel, `run()`.
- c1: floating menu panel (`openP`, `#pnl`), Final Screen, camera scan (`sample` capability, artifact only).
- c2: extras (help, settings, recent, targets, compare), summary bar, steps + target cards (`renderCards`, POOLS of sprite keys), layout setting.
- Trailing scripts: header toggle, haptics (`rng-haptics-v1`), swipe between steps, pop/sheet animations, menu dropdown controller (`#fabm` / `#toolFab`, `window.fabOpen/fabClose`).
Embedded assets: pixel font (base64 woff), sprites `PS`, `PSS`, `PS6`, `PSS6` (base64 PNG), apple-touch-icon.
Storage keys: eggrng-v1, eggrng-profiles-v1, rng-layout-v1, rng-settings-v1, rng-recent-v1, rng-targets-v1, rng-haptics-v1.

## Working rules the owner wants
- Short, mobile-friendly replies; be honest about what is untested (nothing has been tested on a real iPhone or against a real 3DS).
- No timer feature, no manual Gen 6 timeline.
- Before shipping: `node --check` on each extracted script, then a headless Playwright smoke test (tools/smoke*.py; set localStorage `rng-layout-v1`='all' and use force=True for selects when needed).
- Engine verification: tools/ref7.js is an independent BigInt reference built from the C# source; tools/verify7*.py compare it with the page (Gen 7 wild, UB, scan, ambush, Crabrawler, fishing, leads, shiny lock all matched). Not verified: Minior forme draw.

## OPEN BUG (top priority)
On the owner's iPhone, tapping `☰ Menu` (#toolFab) while the dropdown (#fabm: Help, Recent, Targets, Settings, Final Screen, Scan) is already showing does NOT close it: the items "just reappear". Opening works. Reproduced NEVER in headless Chromium (touch emulation, fast/slow taps, reduce-motion on/off all pass) — only reported on the real iPhone (Safari or installed home-screen app; unclear which). WebKit is not available in the cloud sandbox where this was built, so it was never reproduced.
History of attempts: v43 animated close via monkey-patched `classList.remove/add/toggle` on #fabm (suspected culprit on Safari); v46 replaced that with a plain state machine (open/closing/closed), 120 ms double-tap guard, outside-tap close, dropdown positioned above the bar. Still reported broken after v46 (though the owner may have been running a cached copy).
Ideas to try next: test with real WebKit (Playwright webkit or a device) and `--webkit` touch; check whether another handler re-opens it (search for `fabm`, `toolFab`, `openP`, haptics capture click listener, `lab.click()` hidden switch-input haptics hack, swipe touch handlers); check iOS ghost click / double dispatch; check whether the service worker serves a stale index.html; add on-screen debug log of click events with timestamps; simplest fallback: make the dropdown a plain show/hide with no animation to rule out animation/timing causes.

## Offline package
offline/ holds manifest.webmanifest, sw.js (cache name `rng-vNN`, bump each release), icons. Build: copy index.html, add `<link rel="manifest" href="manifest.webmanifest">` in head and a service-worker registration script before </body> (skipped on file://), zip with the offline files, host over https (Netlify Drop / GitHub Pages), then Add to Home Screen. Camera scan (needs the Claude artifact `sample` capability) does not work outside the artifact.

## Roadmap (unrequested)
Gen 7 extra trigger variants (unknown which), Minior forme test, check against real 3DS, more sprites for categories with few species (fishing, special encounters).

## Reference data
reference/LocationTable6.cs = Gen 6 encounter tables from the original tool (the full original repo is at github.com/wwwwwwzx/3DSRNGTool).
tools/pools.py, tools/gen/* = scripts that extracted data tables / sprite pools from index.html.
