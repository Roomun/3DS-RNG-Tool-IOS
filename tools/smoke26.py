from playwright.sync_api import sync_playwright
URL='file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html'
with sync_playwright() as p:
    b=p.chromium.launch();c=b.new_context(viewport={'width':390,'height':760},has_touch=True,is_mobile=True);pg=c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL);pg.wait_for_timeout(700)
    g=lambda:pg.evaluate("[fabm.className,pnl.className]")
    pg.tap('#toolFab');pg.wait_for_timeout(600);pg.tap('#setB');pg.wait_for_timeout(600);print('item',g())
    pg.tap('#pClose');pg.wait_for_timeout(600);print('panel closed',g())
    pg.tap('#toolFab');pg.wait_for_timeout(600);print('reopen',g())
    pg.touchscreen.tap(200,200);pg.wait_for_timeout(700);print('outside',g())
    pg.tap('#toolFab');pg.wait_for_timeout(600);pg.tap('#fsB');pg.wait_for_timeout(600);print('final screen',g(),errs)
