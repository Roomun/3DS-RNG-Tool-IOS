# Builds the HORDE6 table from reference/LocationTable6.cs (original 3DS RNG Tool, MIT):
# {xy: [[location, idx, name, [species x3], level], ...], oras: [...]}
# Usage: python3 tools/build_horde6.py
import re, json
s = open('reference/LocationTable6.cs', encoding='utf-8-sig').read()
def table(name, cls):
    i = s.index(name + ' ='); j = s.index('};', i)
    out = []
    for m in re.finditer(r'new ' + cls + r'\s*\{(.*?)\n\s*\},', s[i:j] + '\n},', re.S):
        b = m.group(1)
        loc = int(re.search(r'Location\s*=\s*(\d+)', b).group(1))
        idx = re.search(r'idx\s*=\s*(\d+)', b); idx = int(idx.group(1)) if idx else 0
        name = re.search(r'//\s*(.+)', b).group(1).strip()
        sp = [int(x) for x in re.search(r'Species\s*=\s*new\[\]\s*\{([^}]*)\}', b).group(1).split(',')]
        lv = int(re.search(r'Level\s*=\s*(\d+)', b).group(1))
        out.append([loc, idx, name, sp, lv])
    return out
d = {'xy': table('Horde_XY', 'HordeArea_XY'), 'oras': table('Horde_ORAS', 'HordeArea_ORAS')}
# species in the Undiscovered egg group (0x0F): 3 perfect IVs in the wild (Wild6.Markslots; ORAS exempts baby Pokémon)
P = open('reference/personal_ao', 'rb').read()
alts = [312, 311, 336, 335, 246, 309, 302, 88, 270, 29, 241, 703, 185, 631, 263, 74, 333]
allsp = sorted({x for k in d for a in d[k] for x in a[3]} | set(alts))
d['iv3'] = [x for x in allsp if P[x * 0x50 + 0x16] == 0x0F]
print('const HORDE6 = ' + json.dumps(d, separators=(',', ':'), ensure_ascii=False) + ';')
