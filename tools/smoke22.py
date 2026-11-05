from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':700});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html');pg.wait_for_timeout(600)
    st=lambda:pg.evaluate("[fabm.className,getComputedStyle(fabm).display]")
    pg.click('#toolFab');pg.wait_for_timeout(400);print('open',st())
    pg.click('#toolFab');pg.wait_for_timeout(80);print('closing',st());pg.wait_for_timeout(300);print('closed',st())
    pg.click('#toolFab');pg.wait_for_timeout(400);pg.mouse.click(200,150);pg.wait_for_timeout(80);print('outside closing',st());pg.wait_for_timeout(300);print(st())
    pg.click('#toolFab');pg.wait_for_timeout(400);pg.click('#setB');pg.wait_for_timeout(400);print('after setB',st(),pg.evaluate("pnl.className"),errs)
