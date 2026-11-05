from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':700},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html');pg.wait_for_timeout(800)
    pg.screenshot(path='/tmp/top1.png');pg.click('#heroT');pg.wait_for_timeout(200);pg.screenshot(path='/tmp/top2.png')
    print(errs,pg.evaluate("document.getElementById('heroS').hidden"))
