# Horde list check against PKHeX

Compares the app's horde table (HORDE6 + hordeSpecies, all 4 games, every position) with the horde
areas in PKHeX's encounter data (github.com/kwsch/PKHeX, extracted from the games). v51: 0 differences.

    git clone --depth 1 --filter=blob:none --sparse https://github.com/kwsch/PKHeX /tmp/pkhex
    (cd /tmp/pkhex && git sparse-checkout set PKHeX.Core/Resources/legality/wild/Gen6)
    python3 -I tools/hordecheck/pk_hordes.py /tmp/pkhex/PKHeX.Core/Resources/legality/wild/Gen6 /tmp/pk_hordes.json
    node tools/hordecheck/compare.js /tmp/pk_hordes.json

Only the comparison is kept here; no PKHeX data is copied into the app.
