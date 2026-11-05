import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    for name in ['chromium','webkit']:
        try: b=getattr(p,name).launch()
        except Exception as e: print(name,'unavailable');continue
        c=b.new_context(viewport={'width':390,'height':700},has_touch=True,is_mobile=True);pg=c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html');pg.wait_for_timeout(800)
        st=lambda:pg.evaluate("fabm.className")
        r=[]
        for i in range(3):
            pg.tap('#toolFab');pg.wait_for_timeout(600);r.append(st())
            pg.tap('#toolFab');pg.wait_for_timeout(700);r.append(st())
        pg.tap('#toolFab');pg.wait_for_timeout(600);pg.tap('#toolFab');pg.wait_for_timeout(100);r.append('mid-'+st());pg.wait_for_timeout(700);r.append(st())
        print(name,r,errs)
