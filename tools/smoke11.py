from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':800})
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html')
    pg.evaluate("localStorage.clear(); localStorage.setItem('rng-layout-v1','all')"); pg.reload()
    op=lambda: pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    # ---------- SOS
    pg.select_option('#kind','sos',force=True); op()
    print('game',pg.input_value('#game'),'from',pg.input_value('#from'))
    areas=pg.evaluate("[...document.querySelectorAll('#warea option')].slice(1,6).map(o=>[o.value,o.textContent])"); print(areas)
    pg.select_option('#warea',index=2); op()
    print('ospec',pg.evaluate("[...document.querySelectorAll('#ospec option')].map(o=>o.textContent)"))
    print('slots',pg.evaluate("[...document.querySelectorAll('#slotsBox .slot')].map(s=>s.textContent)"))
    pg.fill('#seed','1A2B3C4D'); pg.fill('#oseed','0BADC0DE'); pg.fill('#oframe','10'); pg.fill('#ochain','31')
    pg.uncheck('#wcd'); pg.fill('#from','478'); pg.fill('#to','560'); op()
    pg.click('#go'); pg.wait_for_timeout(500)
    print('msg',pg.inner_text('#msg')[:120]); n=pg.locator('#out .card').count(); print('cards',n)
    print(pg.locator('#out .card').first.inner_text().replace('\n',' | ')[:260])
    # independent reference for frame 478, consider off
    ref=pg.evaluate("""() => {
      const sf=new SFMT(0x1A2B3C4D); const L=[],H=[]; for(let i=0;i<700;i++){L.push(sf.u32());H.push(sf.u32());}
      const f=478; let p=f-1; const M=k=>{const j=++p;return m64(L[j],H[j],k);};
      const so=sosBuffer(0x0BADC0DE,10); const par=sosParams(31);
      const ec=L[f]; let k=f; const rolls=1+par.pidBonus; const pids=[]; for(let i=0;i<rolls;i++)pids.push(L[++k]);
      return {ec, pid:pids[pids.length-1], pidBonus:par.pidBonus, flaw:par.flaw, ha:par.haRate, call:[so[0]%100,so[1]%100]};
    }""")
    print('ref',ref)
    # ---------- Fishing
    pg.select_option('#kind','fish7',force=True); op()
    print('fish game',pg.input_value('#game'), 'areas', pg.evaluate("document.querySelectorAll('#warea option').length"))
    pg.select_option('#warea',index=3); op()
    print('npc',pg.input_value('#npc'),'lv',pg.input_value('#wlmin'),pg.input_value('#wlmax'),'bite',pg.input_value('#fbite'),'delay',pg.input_value('#wdelay'))
    print('slots',pg.evaluate("[...document.querySelectorAll('#slotsBox .slot')].map(s=>s.textContent)"))
    pg.fill('#seed','1A2B3C4D'); pg.fill('#from','478'); pg.fill('#to','900'); op()
    pg.click('#go'); pg.wait_for_timeout(500)
    print('fish msg',pg.inner_text('#msg')[:140]); print('fish cards',pg.locator('#out .card').count())
    if pg.locator('#out .card').count(): print(pg.locator('#out .card').first.inner_text().replace('\n',' | ')[:200])
    # suction cups + no overview
    op(); pg.select_option('#lead','10'); pg.uncheck('#fover'); pg.click('#go'); pg.wait_for_timeout(500)
    print('suction/no-overview cards',pg.locator('#out .card').count(), pg.inner_text('#msg')[:90])
    # back to wild still works
    op(); pg.select_option('#kind','wild',force=True); op(); pg.fill('#to','600'); pg.click('#go'); pg.wait_for_timeout(400)
    print('wild cards',pg.locator('#out .card').count())
    b.close()
print('errors',errs)
