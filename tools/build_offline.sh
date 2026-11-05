#!/usr/bin/env bash
# Builds dist/rng-offline-<cache>.zip: index.html + manifest link + service-worker registration + offline/ files.
set -euo pipefail
cd "$(dirname "$0")/.."
V=$(grep -o 'rng-v[0-9]*' offline/sw.js | head -1)
B=$(mktemp -d); mkdir -p dist
python3 - "$B/index.html" <<'PY'
import sys
s=open('index.html',encoding='utf-8').read()
assert s.count('</head>')==1 and s.count('</body>')==1
s=s.replace('</head>','<link rel="manifest" href="manifest.webmanifest">\n</head>')
reg='<script>if("serviceWorker"in navigator&&location.protocol!=="file:")addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});</script>\n'
s=s.replace('</body>',reg+'</body>')
open(sys.argv[1],'w',encoding='utf-8').write(s)
PY
cp offline/sw.js offline/manifest.webmanifest offline/icon-192.png offline/icon-512.png offline/apple-touch-icon.png "$B/"
rm -f "dist/$V-offline.zip"; (cd "$B" && zip -q -X "$OLDPWD/dist/$V-offline.zip" *)
rm -rf "$B"; echo "dist/$V-offline.zip"
