from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':800})
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html')
    pg.evaluate("localStorage.clear(); localStorage.setItem('rng-layout-v1','all')"); pg.reload()
    op=lambda: pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    op(); pg.select_option('#game','6',force=True); pg.select_option('#kind','stat',force=True); op(); pg.select_option('#sver','OR'); op()
    print(pg.evaluate("[...document.querySelectorAll('#scat option')].map(o=>o.textContent)"))
    cat=pg.evaluate("[...document.querySelectorAll('#scat option')].find(o=>o.textContent==='Pokémon Link').value")
    pg.select_option('#scat',cat); op()
    print(pg.evaluate("[...document.querySelectorAll('#spoke option')].map(o=>o.textContent)"))
    for idx,(name,tg) in enumerate([('Titans',2),('Starters',3)]):
        op(); pg.select_option('#spoke',index=1+idx); op(); pg.fill('#sbt',str(tg)); pg.uncheck('#scd'); pg.fill('#seed','1A2B3C4D'); pg.fill('#from','100'); pg.fill('#to','102'); pg.click('#go'); pg.wait_for_timeout(400)
        print(name,pg.locator('#out .card').first.inner_text().replace('\n',' | ')[:200])
        r=pg.evaluate("""([tg,i3,rg])=>{const m=new MT();m.seed(0x1A2B3C4D);const B=[];for(let i=0;i<500;i++)B.push(m.next()>>>0);
         let k=101; const rn=n=>Math.floor(B[k++]*n/4294967296);
         for(let q=0;q<tg-1;q++){ if(!i3){k+=10;continue;} k+=2; const u=[0,0,0,0,0,0]; for(let c=3;c>0;){const t=rn(6); if(!u[t]){c--;u[t]=1;}} k+=rg?5:4; }
         k+=60; const ec=B[k++]; const pid=B[k++]; return [ec.toString(16),pid.toString(16)]}""",[tg, idx==0, idx==1])
        print('ref',r)
    op(); pg.select_option('#scat',index=pg.evaluate("[...document.querySelectorAll('#scat option')].length-1")); op(); print(pg.evaluate("[...document.querySelectorAll('#spoke option')].map(o=>o.textContent)"))
    op(); pg.fill('#sbt','4'); pg.fill('#sbg','101'); pg.click('#go'); pg.wait_for_timeout(500); print(pg.inner_text('#msg')[:100]); print(pg.locator('#out .card').first.inner_text().replace('\n',' | ')[:160])
    print('ERR',errs)
