# Gen 6 / 7 RNG — mobile web port of 3DSRNGTool

Single-file HTML app (index.html, ~730 KB, vanilla JS, no build step, no external requests) porting wwwwwwzx/3DSRNGTool (MIT) for Gen 6/7 Pokémon RNG. Target: iPhone Safari / home-screen web app. Default language English.

## Layout of index.html
Three main script blocks plus small trailing scripts:
- c0: engines (TinyMT, MT, SFMT), Gen 6/7 generators and searches, UI state, `widen()` async search with progress/cancel, `run()`.
- c1: floating menu panel (`openP`, `#pnl`), Final Screen, camera scan (Claude `sample` capability in the artifact; Live Text / paste fallback offline).
- c2: extras (help, settings, recent, targets, compare), summary bar, steps + target cards (`renderCards`, POOLS of sprite keys), layout setting.
- Trailing scripts: header toggle, haptics (`rng-haptics-v1`), swipe between steps, pop/sheet animations, menu dropdown controller (`#fabm` / `#toolFab`, `window.fabOpen/fabClose`), Check a miss (v49, last script: `DEX6` table + `openMiss`).
- Check a miss (Gen 6 egg + horde): recalculates every frame in target ± window with the current settings (hordes also every Synchronize pass/fail and Hidden Ability position, since those come from TinyMT), matches what the user got (nature, gender, ability, IVs or ranges, stats→IVs via `DEX6` base stats with 0 EVs, characteristic from EC%6, shiny) and reports the offset plus delay advice. `DEX6` = species 1-721 names, base stats, abilities, gender from the original tool's personal_ao (tools/build_dex6.py, inputs in reference/). Tests: `node tools/smoke29.js`.
Embedded assets: pixel font (base64 woff), sprites `PS`, `PSS`, `PS6`, `PSS6` (base64 PNG), apple-touch-icon.
Storage keys: eggrng-v1, eggrng-profiles-v1, rng-layout-v1, rng-settings-v1, rng-recent-v1, rng-targets-v1, rng-haptics-v1.

## Working rules the owner wants
- Short, mobile-friendly replies; be honest about what is untested (nothing has been tested on a real iPhone or against a real 3DS).
- No timer feature, no manual Gen 6 timeline.
- Before shipping: `node --check` on each extracted script, then the headless Playwright smoke tests `node tools/smoke27.js` … `smoke31.js`, also with `IOS=1`. (The older tools/smoke10-26.py need Python Playwright and old artifact paths; not run since v46.)
- Gen 6 egg and horde code was reviewed line by line against the C# source (Egg6.cs, Wild6.Generate_Horde, RNGPool.Generate6/GenerateHorde6, delays 16/0 egg and 174 horde) in v49: same draw order and frame/delay mapping. Not run against the original binary.
- Engine verification: tools/ref7.js is an independent BigInt reference built from the C# source; tools/verify7*.py compare it with the page (Gen 7 wild, UB, scan, ambush, Crabrawler, fishing, leads, shiny lock all matched). Not verified: Minior forme draw.

## Menu dropdown and haptics (v47, v52)
- v47: on iOS (no `navigator.vibrate`) the haptics fallback click reached the menu's outside-tap listener and re-opened the menu. Both document click listeners (haptics and menu) now ignore untrusted (synthetic) clicks, and the menu also ignores `#hapL`. Test: `node tools/smoke27.js`.
- v52: the dropdown (`#fabm`) opens above the bar when the items fit, otherwise below it (`.down`, reversed stagger and `fabInD/fabOutD`), is capped to the screen (scrolls on very short screens) and follows the bar while scrolling. Needed on the Results step, where the bar sits near the top.
- Haptics (v55, owner-confirmed method): iOS 27 has no `navigator.vibrate` and plays the switch haptic only when a finger toggles a real `<input type=checkbox switch>`; toggling one from code is silent (v52-v53 attempts A/B/C failed on the owner's iPhone). So on touch devices without vibrate, a capture `touchstart` moves one nearly invisible switch (`#hapOv`, opacity .02, z-index 9999) over the `button`/`summary` under the finger; the tap lands on it (haptic) and its click handler passes the tap on with `button.click()` while `window.__hapFwd` is true. Hidden again on click, touchmove > 10 px, touchcancel, scroll or 700 ms after touchend. The pressed button gets `.hap-press`. The menu's outside-tap listener ignores `#hapOv` and synthetic clicks unless `__hapFwd`. Android/desktop: vibrate on trusted clicks as before. Owner tested the method on a test button (v54: 10/10 ticks, action still fired); the app-wide rollout itself is not yet confirmed on the iPhone.
- Tests: every smoke test can run iPhone-like with `IOS=1 node tools/smokeNN.js` (deletes navigator.vibrate, so the switch path is used); `tools/smoke31.js` always runs that way and counts switch taps.
- Still to confirm on the owner's iPhone: ticks on all buttons, nothing double-fires or stops working (file pickers for the camera scan, summary toggles, menu).

## Horde routes (v50)
Horde step has Game (X/Y/OR/AS) + Route (`hver`, `harea`, hidden `htype` 0-3); `HORDE6` (tools/build_horde6.py from reference/LocationTable6.cs) lists the 3 horde species + level per area, rates 60/35/5. `hordeSpecies()` ports HordeArea6.getSpecies: version swaps, mixed hordes (`H6MIX`, read as 0-based horde type: the C# compares it with the 1-based slot, so the original never/wrongly mixes), Route 114 AS Swablu among Lotad (C# checks 270 vs the stored 273). Picking a horde gives per-position gender ratio (`o.gps`) and, in X/Y, 3 perfect IVs for Undiscovered egg group species (Mime Jr., Smoochum) like Wild6.Markslots. v51: checked position by position against PKHeX's Gen 6 encounter data for X, Y, OR and AS (tools/hordecheck, 0 differences); `H6POS` holds the 3 mixed hordes where the odd one's position differs per version (Y Route 11 and 12, OR Route 110). Not checked against Serebii (serebii.net not reachable from the cloud sandbox). All horde species have a sprite in `PS6` (52 added in v51 from PokeAPI/sprites Gen 7 icons, cropped x 3-37 like the existing ones). Tests: `node tools/smoke30.js`.

## Offline package
offline/ holds manifest.webmanifest, sw.js (cache name `rng-vNN`, bump each release), icons. Build: `tools/build_offline.sh` → `dist/rng-vNN-offline.zip` (adds the manifest link and a service-worker registration, skipped on file://, to a copy of index.html and zips it with the offline files). The script also refreshes `docs/` (same files + .nojekyll) for GitHub Pages: Settings → Pages → Deploy from a branch → `claude/handover-review-liaben` (the default branch), folder `/docs`; live at https://roomun.github.io/3DS-RNG-Tool-IOS/ (repo made public by the owner). Commit `docs/` with every release. Or host the zip elsewhere over https (Netlify Drop), then Add to Home Screen. Camera scan: in the artifact it uses Claude (`sample` capability) to read a photo; without `window.claude` (offline copy) `showScanOffline()` shows the same check-and-apply form for iPhone Live Text ("Scan Text" on a field) plus a paste box parsed by `scanParse()` (v48). Tests: `node tools/smoke28.js`.

## Roadmap (unrequested)
Gen 7 extra trigger variants (unknown which), Minior forme test, check against real 3DS, more sprites for categories with few species (fishing, special encounters).

## Reference data
reference/LocationTable6.cs = Gen 6 encounter tables from the original tool (the full original repo is at github.com/wwwwwwzx/3DSRNGTool).
tools/pools.py, tools/gen/* = scripts that extracted data tables / sprite pools from index.html.
