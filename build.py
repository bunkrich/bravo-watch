import json, os, re, subprocess, sys
if subprocess.run(['node','check.js']).returncode: sys.exit('build stopped: fix the freshness errors above')
t=open("template.html").read(); d=open("data.js").read()
# Build into a candidate file; index.html is only replaced once the prerender succeeds (see the end).
CAND=".index.build.html"
import hashlib
# build id: changes whenever the page or its data changes; open tabs and Home Screen apps compare it to /version.txt and reload
BUILD=hashlib.sha1((t+d+open("build.py").read()+open("prerender.py").read()).encode()).hexdigest()[:12]
m=re.search(r'UPDATED\s*=\s*"(\d{4}-\d{2}-\d{2})"',d)
lm=m.group(1) if m else ""

# per-show pages (remove pages for shows that are no longer active)
old=[]
try: old=json.load(open("showpages.json"))
except Exception: pass
import showpages
pages=showpages.run()
for p in old:
  if p not in pages and os.path.exists(p+".html"): os.remove(p+".html")
open(CAND,"w").write(t.replace("/*DATA*/",d).replace("__BUILD__",BUILD).replace("__PAGES__",json.dumps(pages)))

# widget setup page (code embedded from widget.js so it never drifts)
import html as _h
code=open("widget.js").read()
open("widget.html","w").write(open("widget.tpl.html").read().replace("/*WIDGET_CODE*/",_h.escape(code)))
urls=[("https://clubhousetonight.com/",lm,"daily")]+[(f"https://clubhousetonight.com/{p}",lm,"daily") for p in pages]+[("https://clubhousetonight.com/about","",""),("https://clubhousetonight.com/widget","","")]
body="".join(f"<url><loc>{u}</loc>"+(f"<lastmod>{l}</lastmod>" if l else "")+(f"<changefreq>{c}</changefreq>" if c else "")+"</url>" for u,l,c in urls)
open("sitemap.xml","w").write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n')
print("built index.html + sitemap.xml", lm)
import prerender, shutil
if prerender.chrome() is None:
  # No Chrome here: publish the plain page (it still renders with JavaScript) rather than block the daily update.
  # No Chrome here: reuse the last good pre-render (a day old at most) so search engines and no-JS readers never get an empty
  # schedule. The page still re-renders fresh data with JavaScript as usual.
  print("WARNING: Chrome not found; reusing the last pre-rendered schedule:", "ok" if prerender.reuse_last(CAND) else "none saved yet")
  os.replace(CAND,"index.html"); open("version.txt","w").write(BUILD)
elif prerender.run(CAND):
  os.replace(CAND,"index.html"); open("version.txt","w").write(BUILD)
else:
  os.remove(CAND)
  sys.exit("build stopped: Chrome is installed but the pre-render came back incomplete, so index.html was left unchanged. Fix the page script (it is probably throwing an error) and rebuild.")
