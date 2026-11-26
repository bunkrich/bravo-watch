"""Bake the rendered schedule into index.html so search engines (and slow phones)
see real content before JavaScript runs. The page's own script still re-renders
on load, so visitors always get the live 'today'. If Chrome isn't available the
build keeps the plain page and just prints a note."""
import html, json, os, re, shutil, subprocess

IDS = ["upd", "days", "lu", "prem", "stack", "covered"]
PROBE = """<script>
setTimeout(function(){
  var ids=%s, out={};
  ids.forEach(function(id){
    var el=document.getElementById(id); if(!el) return;
    var c=el.cloneNode(true);
    c.querySelectorAll('.rv').forEach(function(n){n.classList.remove('rv','in');n.style.transitionDelay='';if(!n.getAttribute('style'))n.removeAttribute('style')});
    c.querySelectorAll('details[open]').forEach(function(d){d.removeAttribute('open')});
    c.querySelectorAll('[aria-expanded="true"]').forEach(function(n){n.setAttribute('aria-expanded','false')});
    out[id]=c.innerHTML;
  });
  var pre=document.createElement('pre'); pre.id='__pr'; pre.textContent=JSON.stringify(out);
  document.body.innerHTML=''; document.body.appendChild(pre);
},600);
</script>""" % json.dumps(IDS)


def chrome():
    for name in ("google-chrome", "chromium", "chromium-browser", "google-chrome-stable"):
        p = shutil.which(name)
        if p:
            return p
    return None


def run(index="index.html"):
    exe = chrome()
    if not exe:
        print("prerender skipped: Chrome not found (page still works, just not pre-rendered)")
        return False
    src = open(index).read()
    tmp = os.path.abspath(".prerender.html")
    open(tmp, "w").write(src.replace("</body>", PROBE + "</body>", 1))
    try:
        dom = subprocess.run(
            [exe, "--headless=new", "--no-sandbox", "--disable-gpu", "--virtual-time-budget=5000",
             "--dump-dom", "file://" + tmp],
            capture_output=True, text=True, timeout=120).stdout
    except Exception as e:
        print("prerender skipped:", e)
        return False
    finally:
        try:
            os.remove(tmp)
        except OSError:
            pass
    m = re.search(r'<pre id="__pr">(.*?)</pre>', dom, re.S)
    if not m:
        print("prerender skipped: no output from Chrome")
        return False
    data = json.loads(html.unescape(m.group(1)))
    filled = 0
    for i in IDS:
        inner = data.get(i)
        if not inner:
            continue
        pat = re.compile(r'(<(\w+)\b[^>]*\bid="%s"[^>]*>)(</\2>)' % re.escape(i))
        src, n = pat.subn(lambda mm: mm.group(1) + inner + mm.group(3), src, count=1)
        filled += n
    open(index, "w").write(src)
    print("prerendered %d/%d sections" % (filled, len(IDS)))
    return filled == len(IDS)


if __name__ == "__main__":
    run()
