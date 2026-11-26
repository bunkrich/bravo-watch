# Builds index.html from template.html + data.js (the schedule data).
# Daily refresh: edit data.js only, then run: python3 build.py
t=open("template.html").read()
d=open("data.js").read()
open("index.html","w").write(t.replace("/*DATA*/",d))
print("built index.html")
