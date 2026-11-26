import re, subprocess, sys
if subprocess.run(['node','check.js']).returncode: sys.exit('build stopped: fix the freshness errors above')
t=open("template.html").read(); d=open("data.js").read()
open("index.html","w").write(t.replace("/*DATA*/",d))
m=re.search(r'UPDATED\s*=\s*"(\d{4}-\d{2}-\d{2})"',d)
lm=m.group(1) if m else ""
open("sitemap.xml","w").write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://clubhousetonight.com/</loc><lastmod>{lm}</lastmod><changefreq>daily</changefreq></url></urlset>\n')
print("built index.html + sitemap.xml", lm)
