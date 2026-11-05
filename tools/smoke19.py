from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();c=b.new_context(viewport={'width':390,'height':700},has_touch=True,is_mobile=True);pg=c.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html');pg.wait_for_timeout(800)
    st=lambda:pg.evaluate("document.querySelector('main').dataset.step")
    def swipe(x1,x2,y=400):
        pg.evaluate("""([x1,x2,y])=>{const m=document.querySelector('main');const mk=(t,x)=>new Touch({identifier:1,target:m,clientX:x,clientY:y});
        m.dispatchEvent(new TouchEvent('touchstart',{touches:[mk(0,x1)],changedTouches:[mk(0,x1)],bubbles:true}));
        m.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[mk(0,x2)],bubbles:true}))}""",[x1,x2,y])
    pg.click('.kc >> nth=0');pg.wait_for_timeout(400);print('after card',st())
    swipe(300,100);print('swipe left',st(),pg.evaluate("document.querySelector('main').classList.contains('go')"))
    swipe(100,300);print('swipe right',st());swipe(100,300);print('swipe right at 1',st());print(errs)
