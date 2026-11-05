from playwright.sync_api import sync_playwright
URL='file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html'
with sync_playwright() as p:
    b=p.chromium.launch()
    for mobile in (True,False):
      for rmo in ('no-preference','reduce'):
        c=b.new_context(viewport={'width':390,'height':760},has_touch=mobile,is_mobile=mobile,reduced_motion=rmo);pg=c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(URL);pg.wait_for_timeout(700)
        # simulate iPhone home-indicator padding on the bar
        pg.add_style_tag(content='.bar{padding-bottom:calc(10px + 34px)!important}')
        st=lambda:pg.evaluate("fabm.className")
        tap=(lambda: pg.tap('#toolFab')) if mobile else (lambda: pg.click('#toolFab'))
        r=[]
        for wait_open,wait_close in [(700,700),(100,700),(700,100),(700,700)]:
            tap();pg.wait_for_timeout(wait_open);r.append(st())
            tap();pg.wait_for_timeout(wait_close);r.append(st())
            pg.wait_for_timeout(700)
        # overlap + hit test while open
        tap();pg.wait_for_timeout(700)
        ov=pg.evaluate("""(()=>{const a=fabm.getBoundingClientRect(),t=toolFab.getBoundingClientRect();const cx=t.x+t.width/2,cy=t.y+t.height/2;const el=document.elementFromPoint(cx,cy);return [a.bottom<=t.top, el&&el.id]})()""")
        tap();pg.wait_for_timeout(800);r.append(st())
        print('mobile',mobile,rmo,r,ov,errs)
