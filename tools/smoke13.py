from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':800})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html')
    pg.evaluate("localStorage.clear(); localStorage.setItem('rng-layout-v1','all')"); pg.reload()
    op=lambda: pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    op(); pg.select_option('#kind','spec7',force=True); op(); pg.select_option('#sptype','crab'); op(); pg.select_option('#warea',index=1); op()
    pg.fill('#seed','1A2B3C4D'); pg.uncheck('#wcd'); pg.fill('#from','500'); pg.fill('#to','502'); pg.uncheck('#charm') if pg.locator('#charm').is_checked() else None
    pg.click('#go'); pg.wait_for_timeout(500)
    print(pg.locator('#out .card').first.inner_text().replace('\n',' | ')[:300])
    print(pg.evaluate("""()=>{const sf=new SFMT(0x1A2B3C4D);const L=[];for(let i=0;i<700;i++){L.push(sf.u32());sf.u32();}
      const f=500;return {ec:L[f+60+1].toString(16),pid:L[f+60+2].toString(16)}}"""))
    # SM UB shiny lock with TSV matching PID
    pg.select_option('#sptype','ub'); op(); pg.fill('#tsv','1939'); pg.fill('#from','478'); pg.fill('#to','900'); pg.click('#go'); pg.wait_for_timeout(500)
    print(pg.inner_text('#msg')[:100]); print('ERR',errs)
