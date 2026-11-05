from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':700});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html');pg.wait_for_timeout(600)
    pg.evaluate("window.__v=0;navigator.vibrate=()=>{window.__v++;return true}")
    pg.click('.kc >> nth=0');print('vib after card',pg.evaluate('__v'))
    pg.click('#toolFab');pg.click('#setB');pg.wait_for_timeout(200)
    print('setting present',pg.locator('#hapT').count())
    pg.select_option('#hapT','0');pg.evaluate('__v=0');pg.click('#sClr');print('vib when off',pg.evaluate('__v'),errs)
