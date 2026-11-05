from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':700});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html');pg.wait_for_timeout(600)
    st=lambda:pg.evaluate("[fabm.className,getComputedStyle(fabm).display,[...fabm.children].map(c=>c.style.getPropertyValue('--k')+'/'+getComputedStyle(c).animationDelay)]")
    pg.click('#toolFab');pg.wait_for_timeout(30);print('open',st());pg.wait_for_timeout(500)
    pg.click('#toolFab');pg.wait_for_timeout(30);print('closing',st());pg.wait_for_timeout(600);print('closed',st())
    pg.click('#toolFab');pg.wait_for_timeout(500);pg.click('#setB');pg.wait_for_timeout(600);pg.click('#pClose');pg.wait_for_timeout(100);print(pg.evaluate("pnl.className"));pg.wait_for_timeout(450);print(pg.evaluate("pnl.className"),errs)
