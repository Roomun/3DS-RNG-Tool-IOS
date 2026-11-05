exec(open('/home/claude/tools/verify7L.py').read().split("with sync_playwright() as p:")[0])
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':800}); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html'); pg.evaluate("localStorage.clear(); localStorage.setItem('rng-layout-v1','all')"); pg.reload()
    pg.add_script_tag(content=REF); pg.add_script_tag(content='(()=>{const o=window.searchWild; window.searchWild=function(...a){const r=o.apply(this,a); window.__res=r; return r;};})()')
    base=dict(seed='1A2B3C4D',**{'from':478,'to':700},npc=1,rain=False,consider=True,charm=False,delay=12,area=1,lead=0)
    for kind,ver in [('ub','sun'),('ub','usun'),('scan','usun'),('amb','usun')]:
        for charm in [False,True]:
            cfg=dict(base,ver=ver,charm=charm)
            if kind=='amb': cfg['area']=4
            setup(pg,kind,cfg); pg.click('#go'); pg.wait_for_timeout(600)
            pg.evaluate("window.__P=("+BUILD+")('"+kind+"')")
            # pick a TSV from the first special (UB/scan) or any result (amb)
            tsv=pg.evaluate("()=>{const P=window.__P; const r=REF(P); for(const k of Object.keys(r)){const x=r[k]; if(P.mode==='honey'?x.special:true){const p=x.rawpid>>>0; return ((p>>>16)^(p&0xffff))>>>4;}} return -1}")
            cfg['tsv']=tsv; setup(pg,kind,cfg); pg.click('#go'); pg.wait_for_timeout(600)
            pg.evaluate("window.__P=("+BUILD+")('"+kind+"')")
            r=pg.evaluate("(args)=>("+CMP+")(args)",[kind])
            info=pg.evaluate("()=>{const P=window.__P;const r=REF(P);let sh=0,lk=0;for(const k in r){if(r[k].shiny)sh++; if(r[k].special&&P.ub&&P.locked&&((r[k].rawpid>>>16^r[k].rawpid&0xffff)>>>4)===P.tsv)lk++;} return [sh,lk,P.locked]}")
            print(kind,ver,'charm',charm,'tsv',tsv,'n',r['n'],'nbad',r['nbad'],'shinies(ref)',info[0],'locked-hits',info[1],'lockedspecies',info[2],r['bad'][:2],flush=True)
    print('errs',errs[:3])
