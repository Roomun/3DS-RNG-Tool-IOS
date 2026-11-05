from playwright.sync_api import sync_playwright
import subprocess, json
ref = json.loads(subprocess.check_output(['node','-e','''
// independent TinyMT port straight from RNG/TinyMT.cs
const mat1=0x8f7011ee, mat2=0xfc78ff1f, tmat=0x3793fdff, MASK=0x7FFFFFFF;
const st=[0x11111111,0x22222222,0x33333333,0x44444444]; // status[0..3]
function nextState(){ let y=st[3]; let x=((st[0]&MASK)^st[1]^st[2])>>>0; x=(x^(x<<1))>>>0; y=(y^(y>>>1)^x)>>>0;
 st[0]=st[1]; st[1]=st[2]; st[2]=(x^(y<<10))>>>0; st[3]=y; if((y&1)===1){st[1]=(st[1]^mat1)>>>0; st[2]=(st[2]^mat2)>>>0;} }
function temper(){ let t0=st[3]; const t1=(st[0]+(st[2]>>>8))>>>0; t0=(t0^t1)>>>0; if((t1&1)===1) t0=(t0^tmat)>>>0; return t0; }
const out=[]; for(let i=0;i<=40;i++){ const state=st.slice().reverse().map(v=>v.toString(16).toUpperCase().padStart(8,"0")).join(","); nextState(); const r=temper();
 out.push({i,tid:r&0xffff,sid:r>>>16,tsv:((r&0xffff)^(r>>>16))>>>4,state}); }
console.log(JSON.stringify(out));
''']).decode())
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':800})
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html')
    pg.evaluate("localStorage.clear(); localStorage.setItem('rng-layout-v1','all')"); pg.reload()
    pg.select_option('#game','6',force=True); pg.select_option('#kind','id',force=True)
    pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    print('game',pg.input_value('#game'),'from',pg.input_value('#from'),'label',pg.inner_text('#seedL'))
    pg.fill('#seed','44444444,33333333,22222222,11111111'); pg.fill('#to','40'); pg.click('#go'); pg.wait_for_timeout(300)
    cards=pg.locator('#out .card').all_inner_texts(); print(len(cards))
    bad=0
    for c,r in zip(cards,ref):
        ok=('TID %05d'%r['tid']) in c and ('SID %05d'%r['sid']) in c and ('TSV %04d'%r['tsv']) in c and r['state'] in c
        bad+= (not ok)
    print('mismatches',bad)
    # filter by TSV of frame 7 and check auto-extend finds earliest
    t=ref[7]['tsv']; pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    pg.fill('#idtsv',str(t)); pg.fill('#to','3'); pg.click('#go'); pg.wait_for_timeout(500)
    print('tsv',t,pg.inner_text('#msg')[:120]); print(pg.locator('#out .card').first.inner_text().replace('\n',' | ')[:120])
    # TID partial filter
    pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    pg.fill('#idtsv',''); pg.fill('#idlist','%05d'%ref[12]['tid']); pg.fill('#to','40'); pg.click('#go'); pg.wait_for_timeout(300)
    print('tid filter first', pg.locator('#out .card').first.inner_text().replace('\n',' | ')[:100])
    # Gen 7
    pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    pg.select_option('#game','7',force=True); pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    print('g7 from',pg.input_value('#from'),pg.inner_text('#seedL'))
    pg.fill('#seed','1A2B3C4D'); pg.fill('#idlist',''); pg.fill('#to','1030'); pg.fill('#idclk','3'); pg.click('#go'); pg.wait_for_timeout(300)
    print(pg.locator('#out .card').count(), pg.locator('#out .card').first.inner_text().replace('\n',' | ')[:200])
    b.close()
print('errors',errs)
