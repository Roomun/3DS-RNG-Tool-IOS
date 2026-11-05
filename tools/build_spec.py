import re, json
R='/home/claude/src/3DSRNGTool-master/3DSRNGTool/'
t=open(R+'Gen7/Gen7Encounter/LocationTable7.cs',encoding='utf-8-sig').read()
def blk(name):
    i=t.index('public readonly static MiscEncounter7[] '+name); k=t.index('\n        };',i); return t[i:k]
misc={}
for key,name in (('sm','Misc_SM'),('us','Misc_USUM')):
    arr=[]
    for m in re.finditer(r'new MiscEncounter7\s*\{(.*?)\n\s*\},',blk(name),re.S):
        b=m.group(1)
        loc=int(re.search(r'Location\s*=\s*(\d+)',b).group(1))
        idx=re.search(r'idx\s*=\s*(\d+)',b); idx=int(idx.group(1)) if idx else 0
        cm=re.search(r'Location\s*=\s*\d+,?\s*(?:idx\s*=\s*\d+,?)?\s*//\s*([^\n]*)',b); cm=cm.group(1).strip() if cm else ''
        g=lambda k,d: (int(re.search(k+r'\s*=\s*(\d+)',b).group(1)) if re.search(k+r'\s*=\s*(\d+)',b) else d)
        npc=g('NPC',0); lmin=g('LevelMin',0); lmax=g('LevelMax',0)
        d1=g('DelayType1',1); d2=g('DelayType2',1); dl1=g('Delay1',4); dl2=g('Delay2',90); st=g('SlotType',0)
        sp=[int(x) for x in re.findall(r'\d+',re.search(r'Species\s*=\s*new\[\]\s*\{([^}]*)\}',b).group(1))]
        arr.append([loc,idx,cm,npc,lmin,lmax,d1,d2,dl1,dl2,st,sp])
    misc[key]=arr; print(key,len(arr))
# UB / Island scan
p=open(R+'Gen7/PKMW7.cs',encoding='utf-8-sig').read()
def lists(tab):
    i=p.index('Species_'+tab+' ='); j=p.index('        };',i); return p[i:j]
spec={}
for key,tab in (('sm','SM'),('us','USUM')):
    L=lists(tab); out={'ub':[], 'scan':[]}
    for cat,txt in (('ub','Text = "UB"'),('scan','Text = "Island Scan"')):
        i=L.index(txt); j=L.index('Text =',i+10) if 'Text =' in L[i+10:] else len(L)
        seg=L[i:j]
        for line in seg.split('\n'):
            if 'new PKMW7' not in line: continue
            m2=re.search(r'new PKMW7\s*\{(.*)\}\s*,\s*(?://\s*(.*))?$',line.strip())
            if not m2: continue
            b=m2.group(1)
            if 'Conceptual' in b: continue
            sp=int(re.search(r'Species\s*=\s*(\d+)',b).group(1)); lv=int(re.search(r'Level\s*=\s*(\d+)',b).group(1))
            lo=[int(x) for x in re.findall(r'\d+',re.search(r'Location\s*=\s*new\s*\[\]\s*\{([^}]*)\}',b).group(1))]
            ra=re.search(r'Rate\s*=\s*new\s*byte\[\]\s*\{([^}]*)\}',b); ra=[int(x) for x in re.findall(r'\d+',ra.group(1))] if ra else []
            ve=re.search(r'Version\s*=\s*GameVersion\.(\w+)',b); ve=ve.group(1) if ve else ''
            cm=(m2.group(2) or '').strip()
            out[cat].append([sp,lv,lo,ra,ve,cm])
    spec[key]=out; print(key,len(out['ub']),len(out['scan']))
crab=[int(x) for x in re.findall(r'\d+',re.search(r'CrabrawlerSpots = \{([^}]*)\}',t).group(1))]
json.dump({'misc':misc,'spec':spec,'crab':crab},open('gen/spec.json','w'),separators=(',',':'))
print(crab, misc['us'][1], spec['sm']['ub'][0], spec['sm']['scan'][0])
