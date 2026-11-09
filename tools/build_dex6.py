# Builds the DEX6 table (Gen 6 species 1-721: name, base stats in page order HP/Atk/Def/SpA/SpD/Spe,
# abilities 1/2/H, gender ratio) from the original tool's personal_ao + English text files (MIT).
# Usage: python3 tools/build_dex6.py > /tmp/dex6.js
import json, base64
P = open('reference/personal_ao', 'rb').read()
names = open('reference/text_Species_en.txt', encoding='utf-8-sig').read().split('\n')
abil = open('reference/text_Abilities_en.txt', encoding='utf-8-sig').read().split('\n')
st, ab, gr = bytearray(), bytearray(), bytearray()
used = set()
for s in range(1, 722):
    d = P[s * 0x50:(s + 1) * 0x50]
    hp, at, de, sp, sa, sd = d[0:6]
    st += bytes([hp, at, de, sa, sd, sp])
    a = d[0x18:0x1B]; ab += bytes(a); used.update(a)
    gr.append(d[0x12])
mx = max(used)
print('const DEX6 = ' + json.dumps({
    'n': names[1:722], 'a': abil[:mx + 1],
    's': base64.b64encode(bytes(st)).decode(), 'b': base64.b64encode(bytes(ab)).decode(), 'g': base64.b64encode(bytes(gr)).decode()
}, separators=(',', ':')) + ';')
