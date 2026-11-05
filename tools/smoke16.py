from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':800}); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html'); pg.evaluate("localStorage.clear(); localStorage.setItem('rng-layout-v1','all')"); pg.reload()
    K=lambda: pg.evaluate("[...document.querySelectorAll('#kind option')].map(o=>o.value)")
    print('init g',pg.input_value('#game'),K())
    pg.select_option('#kind','spec7',force=True); pg.select_option('#game','6',force=True); print('g6',K(),'kind',pg.input_value('#kind'))
    pg.select_option('#kind','horde',force=True); pg.reload(); print('reload',pg.input_value('#game'),pg.input_value('#kind'),K())
    pg.select_option('#game','7',force=True); print('g7',K(),pg.input_value('#kind'))
    pg.select_option('#kind','sos',force=True); pg.select_option('#game','6',force=True); pg.select_option('#game','7',force=True); print('back7',pg.input_value('#kind'))
    print('ERR',errs)
