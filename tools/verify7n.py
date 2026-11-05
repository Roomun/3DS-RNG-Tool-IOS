import json,sys
from playwright.sync_api import sync_playwright
REF=open('/home/claude/tools/ref7n.js').read()
BUILD=r"""(kind)=>{
 const vi=verInfo(), num=id=>parseInt($(id).value,10)||0;
 const P={seed:parseInt($('seed').value,16)>>>0,min:num('from'),max:num('to'),models:num('npc')+1,raining:$('rain').checked,consider:$('wcd').checked,
  delayTime:Math.trunc(num('wdelay')/2)+2,corr:num('wcorr'),honeyDelay:vi.ult?63:93,ultrawild:false,charm:$('charm').checked,tsv:$('tsv').value===''?-1:num('tsv'),
  lmin:num('wlmin'),lmax:Math.max(num('wlmin'),num('wlmax')),mode:'honey',dtype:0,rate:0,ub:false,dt2:0,d2:1,cry:false};
 const sp=slotView(); P.info=sp?sp.map(c=>c?sinfo(c):null):[];
 const a=curArea();
 if(kind==='ub'||kind==='scan'){const tg=curTarget(); P.slots=WSLOTS[+$('wslot').value]; P.rate=num('sprate'); P.ub=kind==='ub'; P.locked=tg[0]<=800; P.slvl=tg[1]; P.sinfo=sinfo(tg[0]); P.ultrawild=vi.ult; P.mode='honey'; P.dtype=0;}
 else if(kind==='amb'){P.mode='misc'; P.slots=XD.dist[a[10]]; const tr=+$('sptrig').value; P.dtype=(a[6]===1&&tr)?tr:a[6]; P.cry=a[0]===64; P.d2=a[7]; P.dt2=Math.trunc(num('spdelay2')/2);}
 else if(kind==='crab'){P.mode='crab'; P.clevel=num('splevel'); P.dtype=1; P.slots=[100]; }
 else if(kind==='fish'){P.mode='fish'; P.slots=fishDist(a); P.rate=49; P.dtype=($('wcd').checked&&$('fover').checked)?2:1; P.bite=num('fbite'); P.suction=false; P.plat=($('fbub').checked&&vi.ult)?19:14; P.ultrawild=false;}
 return P;}"""
CMP=r"""(args)=>{const [kind]=args; const P=window.__P; const ref=REF(P); let bad=[],n=0;
 const items=[0,1,3]; const hi=r=>r<50?0:r<55?1:3;
 for(const e of window.__res){ n++; const r=ref[e.frame]; if(!r){bad.push(['missing',e.frame]);continue;}
  const chk=(k,a,b)=>{ if(a!==b) bad.push([e.frame,k,a,b]); };
  chk('ec',e.ec>>>0,r.ec>>>0); chk('pid',e.pid>>>0,r.pid>>>0); chk('lvl',e.level,r.level); chk('nat',e.nature,r.nature); chk('ab',e.ability,r.ability);
  chk('gen',e.gender,r.gender); chk('iv',e.iv.join(),r.iv.join()); chk('shiny',!!e.shiny,!!r.shiny);
  if(kind!=='scan'&&kind!=='ub') chk('slot',e.slot,r.slot); else chk('special',!!e.special,!!r.special);
  if(!(r.special&&kind!=='fish')) chk('item',e.item,hi(r.item));
 }
 const inRange=Object.keys(ref).length; return {n,inRange,bad:bad.slice(0,6),nbad:bad.length};}"""
errs=[]
def setup(pg,kind,cfg):
    op=lambda: pg.evaluate("document.querySelectorAll('details.sec').forEach(d=>d.open=true)")
    op(); pg.select_option('#game','7',force=True); pg.select_option('#kind','fish7' if kind=='fish' else 'spec7',force=True); op()
    if kind!='fish': pg.select_option('#sptype',kind); op()
    pg.select_option('#wver',cfg['ver']); op()
    pg.select_option('#warea',index=cfg['area']); op()
    if kind in('ub','scan') and cfg.get('target') is not None:
        pg.select_option('#sptarget',index=cfg['target']); op()
    pg.select_option('#lead','0'); op()
    pg.fill('#seed',cfg['seed']); pg.fill('#from',str(cfg['from'])); pg.fill('#to',str(cfg['to']))
    pg.fill('#npc',str(cfg['npc'])); pg.fill('#wdelay',str(cfg['delay'])); pg.fill('#wcorr',str(cfg.get('corr',0)))
    (pg.check if cfg['rain'] else pg.uncheck)('#rain'); (pg.check if cfg['consider'] else pg.uncheck)('#wcd'); (pg.check if cfg['charm'] else pg.uncheck)('#charm')
    pg.fill('#tsv',str(cfg.get('tsv',''))); 
    if kind=='amb' and cfg.get('trig') is not None: pg.select_option('#sptrig',cfg['trig'])
    if kind=='crab': pg.fill('#splevel','20')
    if kind=='fish': pg.fill('#fbite','78'); (pg.check if cfg.get('over') else pg.uncheck)('#fover')
    if 'rate' in cfg: pg.fill('#sprate',str(cfg['rate']))
    op()
def run(pg,kind,cfg):
    setup(pg,kind,cfg); pg.click('#go'); pg.wait_for_timeout(700)
    pg.evaluate("window.__P=("+BUILD+")('"+kind+"')")
    r=pg.evaluate("(args)=>("+CMP+")(args)",[kind])
    return r
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':800}); pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file:///mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html'); pg.evaluate("localStorage.clear(); localStorage.setItem('rng-layout-v1','all')"); pg.reload()
    pg.add_script_tag(content=REF); pg.add_script_tag(content='(()=>{const o=window.searchWild; window.searchWild=function(...a){const r=o.apply(this,a); window.__res=r; return r;};})()')
    scen=[]
    seeds=['1A2B3C4D','DEADBEEF','00C0FFEE']
    for kind,areas in [('ub',[1])]:
        for ver in ['sun']:
            for ai in areas:
                for k,(npc,rain,cons,charm) in enumerate([(0,False,True,False),(3,True,True,True),(2,False,False,False)]):
                    scen.append((kind,dict(ver=ver,area=ai,seed=seeds[k%3],**{'from':478,'to':700},npc=npc,rain=rain,consider=cons,charm=charm,delay=(10+7*k) ,over=(kind=='fish' and k==0))))
    tot=0;badc=0
    for kind,cfg in scen:
        try:
            r=run(pg,kind,cfg)
        except Exception as ex:
            print('EXC',kind,cfg['ver'],cfg['area'],str(ex)[:100]); badc+=1; continue
        tot+=1; print('ok' if not r['nbad'] else 'BADR',kind,cfg['ver'],cfg['area'],r['n'],r['inRange'],flush=True)
        if r['nbad'] or r['n']==0:
            badc+=1; print('BAD',kind,cfg['ver'],cfg['area'],cfg['npc'],cfg['rain'],cfg['consider'],cfg['charm'],r)
    print('scenarios',tot,'bad',badc,'errs',errs[:3])
