from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':700});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html');pg.wait_for_timeout(600)
    pg.click('#steps button[data-s="2"]');print('pop',pg.evaluate("document.querySelector('#steps button[data-s=\"2\"]').classList.contains('pop')"));pg.wait_for_timeout(600)
    print('pop gone',pg.evaluate("document.querySelector('#steps button[data-s=\"2\"]').classList.contains('pop')"))
    pg.click('#toolFab');pg.wait_for_timeout(50);pg.screenshot(path='/tmp/fab.png');pg.click('#setB');pg.wait_for_timeout(120)
    print('sheet mid-transform',pg.evaluate("getComputedStyle(document.querySelector('#pnl .sheet')).transform"))
    pg.wait_for_timeout(500);pg.click('#pClose');pg.wait_for_timeout(80)
    print('closing',pg.evaluate("[pnl.className, getComputedStyle(pnl).display]"));pg.wait_for_timeout(400)
    print('closed',pg.evaluate("[pnl.className, getComputedStyle(pnl).display]"));
    pg.click('#toolFab');pg.click('#setB');pg.wait_for_timeout(500);print('reopen',pg.evaluate("pnl.className"),errs)
