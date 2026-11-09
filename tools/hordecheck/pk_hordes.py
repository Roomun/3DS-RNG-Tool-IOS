import struct, json, sys
W = sys.argv[1]
names = open('reference/text_Species_en.txt', encoding='utf-8-sig').read().split('\n')
out = {}
for g in ['x', 'y', 'or', 'as']:
    d = open(f'{W}/encounter_{g}.pkl', 'rb').read()
    ident, n = d[:2], struct.unpack_from('<H', d, 2)[0]
    offs = struct.unpack_from('<%dI' % (n + 1), d, 4)
    hs = []
    for i in range(n):
        a = d[offs[i]:offs[i + 1]]
        loc, typ = struct.unpack_from('<H', a, 0)[0], a[2]
        if typ != 7: continue
        sl = [(struct.unpack_from('<H', a, 4 + 4 * k)[0], a[6 + 4 * k], a[7 + 4 * k]) for k in range((len(a) - 4) // 4)]
        if not any(s & 0x3FF for s, _, _ in sl): continue
        hs.append([loc, [s & 0x3FF for s, _, _ in sl], sorted({mn for _, mn, _ in sl} | {mx for _, _, mx in sl})])
    out[g] = hs
    print(g, ident, n, 'areas,', len(hs), 'horde areas; first:', hs[0][0], [names[x] for x in hs[0][1]], hs[0][2])
json.dump(out, open(sys.argv[2], 'w'))
