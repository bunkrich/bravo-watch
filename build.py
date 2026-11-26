import json, os, re, subprocess, sys
if subprocess.run(['node','check.js']).returncode: sys.exit('build stopped: fix the freshness errors above')
t=open("template.html").read(); d=open("data.js").read()
open("index.html","w").write(t.replace("/*DATA*/",d))
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

urls=[("https://clubhousetonight.com/",lm,"daily")]+[(f"https://clubhousetonight.com/{p}",lm,"daily") for p in pages]+[("https://clubhousetonight.com/about","","")]
body="".join(f"<url><loc>{u}</loc>"+(f"<lastmod>{l}</lastmod>" if l else "")+(f"<changefreq>{c}</changefreq>" if c else "")+"</url>" for u,l,c in urls)
open("sitemap.xml","w").write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n')
print("built index.html + sitemap.xml", lm)
import prerender; prerender.run()
