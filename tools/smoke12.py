from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':800})
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m: errs.append('C:'+m.text) if m.type=='error' else None)
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html')
    pg.evaluate("localStorage.clear(); localStorage.setItem('rng-layout-v1','all')"); pg.reload()
    op=lambda: pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    pg.select_option('#kind','spec7',force=True); op()
    print('types',pg.evaluate("[...document.querySelectorAll('#sptype option')].map(o=>o.value+':'+o.textContent)"))
    for t in ['ub','scan','amb','crab']:
        op(); pg.select_option('#sptype',t); op()
        print('---',t,'areas',pg.evaluate("document.querySelectorAll('#warea option').length"),'targets',pg.evaluate("document.querySelectorAll('#sptarget option').length"))
        op(); pg.select_option('#warea',index=1); op()
        if t in('ub','scan'): print('target',pg.input_value('#sptarget'),'rate',pg.input_value('#sprate'),'lv',pg.input_value('#splevel'))
        op(); pg.fill('#seed','1A2B3C4D'); pg.fill('#from','478'); pg.fill('#to','1500')
        pg.click('#go'); pg.wait_for_timeout(800)
        print('msg',pg.inner_text('#msg')[:120],'cards',pg.locator('#out .card').count())
        if pg.locator('#out .card').count(): print(pg.locator('#out .card').first.inner_text().replace('\n',' | ')[:260])
    print('ERR',errs[:6])
