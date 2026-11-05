import re, json, struct
R='/home/claude/src/3DSRNGTool-master/3DSRNGTool/'
# slot distributions
w=open(R+'Core/WildRNG.cs',encoding='utf-8-sig').read()
i=w.index('SlotDistribution = new byte[][]'); j=w.index('};',i)
blk=w[i:j]
dist=[]
for m in re.finditer(r'new byte\[\]\s*\{([^}]*)\}',blk):
    dist.append([int(x) for x in re.findall(r'\d+',m.group(1).split('//')[0])])
print('slot dists',len(dist))
# fishing
t=open(R+'Gen7/Gen7Encounter/LocationTable7.cs',encoding='utf-8-sig').read()
def fishblk(name):
    i=t.index('public readonly static FishingArea7[] '+name); 
    k=t.index('};',i); return t[i:k]
fish={}
for key,name in (('sm','Fishing_SM'),('us','Fishing_USUM')):
    arr=[]
    for m in re.finditer(r'new FishingArea7\s*\{(.*?)\n\s*\},',fishblk(name),re.S):
        b=m.group(1)
        loc=int(re.search(r'Location\s*=\s*(\d+)',b).group(1))
        idx=re.search(r'idx\s*=\s*(\d+)',b); idx=int(idx.group(1)) if idx else 0
        mark=re.search(r'mark\s*=\s*"([^"]*)"',b); mark=mark.group(1) if mark else ''
        npc=re.search(r'NPC\s*=\s*(\d+)',b); npc=int(npc.group(1)) if npc else 0
        ld='Longdelay = true' in b; lp='Lapras = true' in b
        lmin=re.search(r'LevelMin\s*=\s*(\d+)',b); lmin=int(lmin.group(1)) if lmin else 10
        lmax=int(re.search(r'LevelMax\s*=\s*(\d+)',b).group(1))
        st=int(re.search(r'SlotType\s*=\s*(\d+)',b).group(1))
        sp=[int(x) for x in re.findall(r'\d+',re.search(r'Species\s*=\s*new\[\]\s*\{([^}]*)\}',b).group(1))]
        arr.append([loc,idx,mark,npc,1 if ld else 0,1 if lp else 0,lmin,lmax,st,sp])
    fish[key]=arr; print(key,len(arr))
# personal
d=open(R+'Resources/bytes/personal_uu','rb').read()
BABY={30,31,172,173,174,175,201,236,238,239,240,298,360,406,433,438,439,440,446,447,458}
def ent(e,sp):
    g=e[0x12]; iv3=1 if (e[0x16]==0xF and sp not in BABY) else 0
    return [g,iv3,e[6],e[7],e[0x1b]]
pers={}
for sp in range(1,808):
    e=d[sp*0x54:(sp+1)*0x54]
    pers[str(sp)]=ent(e,sp)
    fc=e[0x20]; fi=struct.unpack('<H',e[0x1c:0x1e])[0]
    if fc>1 and fi>0:
        for f in range(1,fc):
            ee=d[(fi+f-1)*0x54:(fi+f)*0x54]
            if len(ee)==0x54: pers[str(sp|(f<<11))]=ent(ee,sp)
print('pers',len(pers))
names=open(R+'Resources/text/text_Species_en.txt',encoding='utf-8-sig').read().split('\n')
spn={str(i):names[i].strip() for i in range(1,808)}
# allies
a=open(R+'Gen7/Gen7Encounter/SOSAllies.cs',encoding='utf-8-sig').read()
i=a.index('private static SOSAllies[] Table'); j=a.index('};',i)
tab=[]
for m in re.finditer(r'new SOSAllies\{(.*?)\},\s*$',a[i:j],re.M):
    b=m.group(1)
    sp=int(re.search(r'Species\s*=\s*(\d+)',b).group(1))
    st=re.search(r'slottype\s*=\s*(\d+)',b); st=int(st.group(1)) if st else 0
    al=re.search(r'Ally\s*=\s*new\[\]\s*\{([^}]*)\}',b); al=[int(x) for x in re.findall(r'\d+',al.group(1))] if al else []
    bb=re.search(r'Baby\s*=\s*(\d+)',b); bb=int(bb.group(1)) if bb else 0
    lo=re.search(r'Locations\s*=\s*new\[\]\s*\{([^}]*)\}',b); lo=[int(x) for x in re.findall(r'\d+',lo.group(1))] if lo else None
    ul=re.search(r'Ultra\s*=\s*(true|false)',b); ul=None if not ul else (ul.group(1)=='true')
    tab.append([sp,st,al,bb,lo,ul])
print('allies',len(tab), tab[:3])
json.dump({'dist':dist,'fish':fish,'pers':pers,'spn':spn,'sos':tab},open('gen/data.json','w'),separators=(',',':'))
import os; print(os.path.getsize('gen/data.json'))
