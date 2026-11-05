import re,json
s=open('/mnt/user-data/outputs/artifacts/7159972f-3327-4e9f-aaf2-0745ddc27954/index.html',encoding='utf-8').read()
def J(n):
    i=s.index('const '+n+' =')+len('const '+n+' =');d=0;st=s.index('{',i)
    for j in range(st,len(s)):
        if s[j]=='{':d+=1
        elif s[j]=='}':
            d-=1
            if d==0:return json.loads(s[st:j+1])
K=lambda n:{int(k) for k in J(n) if k.isdigit()}
WD=J('WD');XD=J('XD');SP=J('SP');PS=K('PS');PS6=K('PS6')
def last(rows):return {x for r in rows for x in r[-1][1:]}
wild=set();[wild.update(last(WD[k])) for k in('sm','us')]
fish={x for k in XD['fish'] for r in XD['fish'][k] for x in r[-1]}
sos={r[0] for r in XD['sos']}|{x for r in XD['sos'] for x in r[2]}
ub={r[0] for k in SP['spec'] for r in SP['spec'][k].get('ub',[])}
legends=[144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721,772,773,785,786,787,788,789,790,791,792,800,801,802,807,808,809]
h=set()
src=open('/home/claude/src/3DSRNGTool-master/3DSRNGTool/Gen6/Gen6Encounter/LocationTable6.cs',encoding='utf-8-sig').read().split('\n')
for a,b in((205,442),(442,568)):
  for l in src[a-1:b]:
    for m in re.finditer(r'Species\s*=\s*new\[\]\s*\{([^}]*)\}',l):h|={int(x) for x in re.findall(r'(?<![\w])\d+(?![\w])',m.group(1))}
