from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':800},device_scale_factor=2);errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html')
    pg.evaluate("localStorage.clear()");pg.reload();pg.wait_for_timeout(800)
    for g in ['7','6']:
        pg.evaluate("g=>{document.querySelector('#cards .seg [data-g=\"'+g+'\"]').click()}",g);pg.wait_for_timeout(300)
        print(g,pg.evaluate("[...document.querySelectorAll('#cards .kc')].map(k=>k.dataset.k+':'+k.querySelectorAll('img').length)"))
        pg.locator('#cards').screenshot(path='/tmp/cards%s.png'%g)
    pg.evaluate("rerollCards()");print('errs',errs)
