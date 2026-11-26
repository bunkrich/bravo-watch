"""Generate one static page per active show (e.g. /rhoslc, /wwhl) from data.js.
Run by build.py. Pages are plain HTML (no JS needed to read them) so search engines
index each show's schedule, Peacock drops and WWHL guests."""
import datetime as dt, html, json, re, subprocess

SITE = "https://clubhousetonight.com"


def load():
    js = r"""const fs=require('fs'),vm=require('vm');const c={};vm.createContext(c);
vm.runInContext(fs.readFileSync('data.js','utf8').replace(/^const /gm,'var '),c);
const o={};for(const k of Object.keys(c))o[k]=c[k];process.stdout.write(JSON.stringify(o));"""
    return json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)


def slug(s):
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", s.lower()))


def e(s):
    return html.escape(str(s), quote=True)


def D(s):
    return dt.date.fromisoformat(s)


def nice(s, year=False):
    d = D(s)
    out = d.strftime("%a, %b ") + str(d.day)
    return out + (f", {d.year}" if year else "")


def t12(t):
    if not t:
        return "TBA"
    h, m = map(int, t.split(":"))
    return f"{h % 12 or 12}:{m:02d} {'PM' if h >= 12 else 'AM'}"


def today_ny():
    try:
        from zoneinfo import ZoneInfo
        return dt.datetime.now(ZoneInfo("America/New_York")).date()
    except Exception:
        return dt.date.today()


CSS = """:root{--ink:#f5f1ff;--mut:#aea3c8;--dim:#8579a1;--line:rgba(255,255,255,.12);--glass:rgba(255,255,255,.06);--pink:#ff4fae;--sun:#ffd25a;--cyan:#3ee6ea}
*{box-sizing:border-box}body{margin:0;color:var(--ink);background:#0b0718;font:16px/1.6 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
body::before{content:"";position:fixed;inset:0;z-index:-1;background:radial-gradient(40vmax 40vmax at 8% 0%,rgba(255,79,174,.26),transparent 60%),radial-gradient(38vmax 38vmax at 100% 30%,rgba(62,230,234,.16),transparent 60%),radial-gradient(40vmax 40vmax at 40% 110%,rgba(255,210,90,.12),transparent 60%)}
a{color:inherit}.wrap{width:min(820px,100% - 2*max(16px,4vw));margin-inline:auto}
.bar{position:sticky;top:0;z-index:5;background:rgba(11,7,24,.55);-webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);border-bottom:1px solid var(--line)}
.bar .wrap{display:flex;align-items:center;justify-content:space-between;min-height:60px;gap:12px}
.brand{font-weight:800;letter-spacing:-.02em;font-size:20px;text-decoration:none;white-space:nowrap}
.brand span{background:linear-gradient(90deg,var(--pink),var(--sun));-webkit-background-clip:text;background-clip:text;color:transparent}
.back{font-size:14px;font-weight:600;color:var(--mut);text-decoration:none;padding:8px 12px;border-radius:99px}.back:hover{background:rgba(255,255,255,.1);color:var(--ink)}
.hero{display:flex;gap:16px;align-items:center;margin:34px 0 8px}
.badge{flex:none;width:58px;height:58px;border-radius:16px;display:grid;place-items:center;font-weight:800;font-size:15px;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}
h1{font-size:clamp(26px,4.4vw,38px);line-height:1.12;letter-spacing:-.03em;margin:0}
.lead{color:var(--mut);margin:6px 0 22px;font-size:16.5px}
.card{background:var(--glass);border:1px solid var(--line);border-radius:22px;padding:20px 22px;margin:0 0 14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 10px 30px rgba(0,0,0,.25);-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px)}
h2{font-size:19px;margin:0 0 10px;letter-spacing:-.01em}
.k{font-size:12.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--pink)}
.next .when{font-size:22px;font-weight:800;letter-spacing:-.02em;margin:2px 0}.next .ttl{font-weight:700}
.mut{color:var(--mut)}p{margin:0 0 8px}
ul.eps{list-style:none;margin:0;padding:0}ul.eps li{display:grid;grid-template-columns:120px 1fr;gap:4px 14px;padding:11px 0;border-top:1px solid var(--line)}ul.eps li:first-child{border-top:0}
.dt{font-weight:700;font-size:14px}.dt span{display:block;color:var(--sun);font-weight:700}
.ep b{display:block}.ep .syn{color:var(--mut);font-size:14px}
@media(max-width:560px){ul.eps li{grid-template-columns:1fr}}
.pk{display:inline-flex;align-items:center;gap:6px;margin-top:6px;padding:7px 12px;border-radius:99px;font-size:13px;font-weight:800;text-decoration:none;background:rgba(255,255,255,.08);border:1px solid var(--line)}
.pk.live{color:#0b0718;background:linear-gradient(90deg,var(--sun),var(--cyan));border:0}
.tag{display:inline-block;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.1);color:var(--mut);margin-left:6px;vertical-align:1px}
.shows{display:flex;flex-wrap:wrap;gap:8px}.shows a{padding:8px 12px;border-radius:99px;background:rgba(255,255,255,.07);border:1px solid var(--line);font-size:14px;font-weight:700;text-decoration:none}
.shows a:hover{background:rgba(255,255,255,.14)}
.cta{display:inline-block;margin-top:4px;padding:12px 18px;border-radius:99px;background:linear-gradient(90deg,var(--pink),var(--sun));color:#0b0718;font-weight:800;text-decoration:none}
footer{padding:22px 0 48px;color:var(--dim);font-size:13px}footer a{color:var(--mut)}"""

TRACK = """<script>(()=>{let me=false;try{me=!!localStorage.getItem("umami.disabled")}catch(e){}
const LIVE=["clubhousetonight.com","www.clubhousetonight.com"].includes(location.hostname);if(me||!LIVE)return;
const c=document.createElement("script");c.defer=true;c.src="https://static.cloudflareinsights.com/beacon.min.js";c.dataset.cfBeacon=JSON.stringify({token:"e327c2f1f9b24f13bec12fed2dfbdeb0"});document.head.appendChild(c);
const s=document.createElement("script");s.defer=true;s.src="https://cloud.umami.is/script.js";s.dataset.websiteId="cfb9dce1-a6ac-41b5-8f97-0c982d277fe9";s.dataset.domains="clubhousetonight.com,www.clubhousetonight.com";document.head.appendChild(s);
const t=(n,d)=>{try{window.umami&&umami.track(n,d)}catch(e){}};
document.addEventListener("click",ev=>{const a=ev.target.closest("a");if(!a)return;const sh=document.body.dataset.show;
if(a.classList.contains("pk"))t("peacock",{show:sh,area:"show_page"});else if(a.closest(".shows"))t("show_page_nav",{from:sh,to:a.textContent.trim()});});})();</script>"""


def run():
    c = load()
    today = today_ny()
    tstr = today.isoformat()
    full = c.get("FULL", {})
    shows_meta = c.get("SHOWS", {})
    fn = lambda s: full.get(s, s)

    active = []
    for s in [x[2] for x in c["EPISODES"]] + [s[1] for g in c["GRID"] for s in g[1]] + [p.get("show") for p in c["PREMIERES"] if p.get("show")]:
        if s and s not in active:
            active.append(s)
    active.append("WWHL")

    def badge(s):
        m = shows_meta.get(s)
        code, c1, c2 = (m[0], m[1], m[2]) if m else ((s if s == "WWHL" else re.sub(r"[^A-Z]", "", s)[:3] or s[:2].upper()), "#7b6be0", "#3f2f9c")
        if s == "WWHL":
            c1, c2 = "#ffd25a", "#ff4fae"
        return f'<span class="badge" style="background:linear-gradient(145deg,{c1},{c2})">{e(code)}</span>'

    def peacock_url(s):
        if s == "WWHL":
            return c["WWHL"].get("peacock", "")
        m = shows_meta.get(s)
        return m[4] if m and len(m) > 4 else ""

    def drop_of(ep):
        return ep[6] if len(ep) > 6 and ep[6] else (D(ep[0]) + dt.timedelta(days=1)).isoformat()

    def is_live(drop):
        now = dt.datetime.now()
        try:
            from zoneinfo import ZoneInfo
            now = dt.datetime.now(ZoneInfo("America/New_York"))
        except Exception:
            pass
        return drop < tstr or (drop == tstr and now.hour >= 6)

    def ep_li(ep, past):
        drop = drop_of(ep)
        url = (ep[7] if len(ep) > 7 and ep[7] else "") or peacock_url(ep[2])
        live = is_live(drop)
        btn = ""
        if url:
            btn = (f'<a class="pk live" href="{e(url)}">▶ Watch on Peacock</a>' if live
                   else f'<a class="pk" href="{e(url)}">Peacock · {e(D(drop).strftime("%a"))} 6 AM</a>')
        syn = f'<div class="syn">{e(ep[5])}</div>' if len(ep) > 5 and ep[5] else ""
        status = {"li": "TV listing", "rep": "Reported", "chk": "Unconfirmed"}.get(ep[4], "")
        tag = f'<span class="tag">{status}</span>' if status else ""
        return f'<li><div class="dt">{e(nice(ep[0]))}<span>{e(t12(ep[1]))}</span></div><div class="ep"><b>{e(ep[3])}{tag}</b>{syn}{btn}</div></li>'

    pages = []
    for s in active:
        sl = slug(s)
        name = fn(s)
        eps = [x for x in c["EPISODES"] if x[2] == s]
        up = sorted([x for x in eps if x[0] >= tstr], key=lambda x: (x[0], x[1]))
        past = sorted([x for x in eps if x[0] < tstr], key=lambda x: (x[0], x[1]), reverse=True)
        season = ""
        for x in (up + past):
            m = re.search(r"\bS(\d+)\b", x[3])
            if m:
                season = m.group(1)
                break
        slots = [(g[0], sl_[0]) for g in c["GRID"] for sl_ in g[1] if sl_[1] == s and "After Show" not in sl_[2]]
        days_full = {"Sun": "Sundays", "Mon": "Mondays", "Tue": "Tuesdays", "Wed": "Wednesdays", "Thu": "Thursdays", "Fri": "Fridays", "Sat": "Saturdays"}
        sections = []

        if s == "WWHL":
            w = c["WWHL"]
            guests = sorted([(d, g) for d, g in w.get("guests", {}).items() if d >= (today - dt.timedelta(days=8)).isoformat()])
            lead = f'Airs Sunday to Thursday around {t12(w.get("time", "23:00"))} on Bravo, and streams the next morning on Peacock.'
            upg = [(d, g) for d, g in guests if d >= tstr]
            offs = [o for o in w.get("off", []) if o[1] >= tstr]
            nxt = ""
            if upg:
                d, g = upg[0]
                nxt = f'<section class="card next"><div class="k">Next episode</div><div class="when">{e(nice(d))} · ~{e(t12(w.get("time")))}</div><div class="ttl">Guests: {e(g[0])}</div></section>'
            elif offs:
                nxt = f'<section class="card next"><div class="k">Next episode</div><div class="ttl">{e(offs[0][2])}</div><p class="mut">Through {e(nice(offs[0][1]))}.</p></section>'
            sections.append(nxt)
            if guests:
                items = "".join(f'<li><div class="dt">{e(nice(d))}<span>~{e(t12(w.get("time")))}</span></div><div class="ep"><b>{e(g[0])}</b>' +
                                (f'<a class="pk live" href="{e(w.get("peacock"))}">▶ Watch on Peacock</a>' if is_live((D(d) + dt.timedelta(days=1)).isoformat()) and w.get("peacock") else "") +
                                '</div></li>' for d, g in reversed(guests))
                sections.append(f'<section class="card"><h2>WWHL Guests</h2><ul class="eps">{items}</ul></section>')
            if offs:
                sections.append('<section class="card"><h2>Weeks Off</h2>' + "".join(f'<p>{e(nice(o[0]))} – {e(nice(o[1]))}: {e(o[2])}</p>' for o in offs) + '</section>')
            title = "WWHL Guests This Week: Watch What Happens Live Schedule"
            desc = "Who's on Watch What Happens Live with Andy Cohen this week: every night's guests, air times and when each episode hits Peacock. Updated daily."
        else:
            when_bits = []
            if slots:
                when_bits.append(" and ".join(f"{days_full[d]} at {t12(t)}" for d, t in slots) + " on Bravo")
            lead = (f"Season {season} · " if season else "") + (when_bits[0] if when_bits else "On Bravo") + ". New episodes stream on Peacock the next morning at 6:00 AM."
            if up:
                n = up[0]
                drop = drop_of(n)
                url = (n[7] if len(n) > 7 and n[7] else "") or peacock_url(s)
                syn = f'<p class="mut">{e(n[5])}</p>' if len(n) > 5 and n[5] else ""
                sections.append(f'<section class="card next"><div class="k">Next new episode</div><div class="when">{e(nice(n[0]))} · {e(t12(n[1]))}</div><div class="ttl">{e(n[3])}</div>{syn}'
                                f'<p class="mut">On Peacock {e(nice(drop))} at 6:00 AM.</p>' + (f'<a class="pk" href="{e(url)}">Peacock · {e(D(drop).strftime("%a"))} 6 AM</a>' if url else "") + '</section>')
            prem = [p for p in c["PREMIERES"] if p.get("show") == s and p["date"] >= tstr]
            for p in prem:
                eplist = "".join(f'<li><div class="dt">{e(x[0])}</div><div class="ep"><b>{e(x[1])}</b></div></li>' for x in p.get("eps", []))
                sections.append(f'<section class="card"><h2>Premiere: {e(p["title"])}</h2><p><b>{e(nice(p["date"], True))}</b> · {e(p.get("when", ""))}</p>' + (f'<ul class="eps">{eplist}</ul>' if eplist else "") + '</section>')
            if up[1:] or (up and len(up) == 1 and False):
                sections.append(f'<section class="card"><h2>Coming Up</h2><ul class="eps">{"".join(ep_li(x, False) for x in up[1:])}</ul></section>')
            if past:
                sections.append(f'<section class="card"><h2>Recent Episodes</h2><ul class="eps">{"".join(ep_li(x, True) for x in past)}</ul></section>')
            extras = []
            for a in c.get("AFTERSHOWS", []):
                if a.get("show") == s and a.get("on"):
                    extras.append(f'<p><b>{e(a["title"])}</b>: {e(a.get("when", ""))} · {e(a.get("where", ""))}</p>' + (f'<p class="mut">{e(a.get("note", ""))}</p>' if a.get("note") else ""))
            for r in c.get("REUNIONS", []):
                if r[0] == s:
                    extras.append(f'<p><b>{e(r[1])}</b>: {e(r[2])}</p>')
            if extras:
                sections.append('<section class="card"><h2>After Show &amp; Reunion</h2>' + "".join(extras) + '</section>')
            short = s if s != name else name
            title = f"{name} Schedule: New Episode Dates, Times & Peacock" if len(name) < 40 else f"{short} Schedule: {name} New Episodes & Peacock"
            desc = f"When is the next new episode of {name}? Air dates and times on Bravo, episode titles and exactly when each one drops on Peacock. Updated daily."

        nav = "".join(f'<a href="/{slug(x)}">{e(fn(x) if len(fn(x)) <= 28 else x)}</a>' for x in active if x != s)
        ld = {"@context": "https://schema.org", "@type": "TVSeries", "name": name, "url": f"{SITE}/{sl}",
              "productionCompany": {"@type": "Organization", "name": "Bravo"}}
        if season:
            ld["numberOfSeasons"] = int(season)
        page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0b0718">
<title>{e(title)} · Clubhouse Tonight</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{SITE}/{sl}">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website"><meta property="og:site_name" content="Clubhouse Tonight">
<meta property="og:title" content="{e(name)} schedule · Clubhouse Tonight"><meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{SITE}/{sl}"><meta property="og:image" content="{SITE}/og.jpg?v=2"><meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld)}</script>
<style>html{{background:#0b0718;padding-top:env(safe-area-inset-top)}}{CSS}</style>
</head>
<body data-show="{e(s)}">
<div class="bar"><div class="wrap"><a class="brand" href="/">Clubhouse <span>Tonight</span></a><a class="back" href="/">← Tonight's schedule</a></div></div>
<main class="wrap">
  <div class="hero">{badge(s)}<h1>{e(name)}</h1></div>
  <p class="lead">{e(lead)}</p>
  {''.join(sections) or '<section class="card"><p class="mut">No new episodes on the schedule right now.</p></section>'}
  <section class="card"><h2>Every Bravo Night in One Place</h2><p class="mut">See tonight's full lineup, WWHL guests and Peacock drops for every show.</p><a class="cta" href="/">Open Clubhouse Tonight</a></section>
  <section class="card"><h2>More Show Schedules</h2><div class="shows">{nav}</div></section>
</main>
<footer><div class="wrap">Updated {e(nice(c["UPDATED"], True))}. All times Eastern. Not affiliated with Bravo, NBCUniversal or Peacock. · <a href="/about">About &amp; contact</a></div></footer>
{TRACK}
</body>
</html>
"""
        open(f"{sl}.html", "w").write(page)
        pages.append(sl)
    # compact feed for the home-screen widget
    days = []
    for i in range(-1, 9):
        dd = (today + dt.timedelta(days=i)).isoformat()
        bravo = []
        for x in sorted([x for x in c["EPISODES"] if x[0] == dd], key=lambda x: x[1]):
            m = shows_meta.get(x[2]) or [x[2][:3], "#7b6be0", "#3f2f9c"]
            bravo.append({"show": x[2], "code": m[0], "color": m[1], "time": t12(x[1]), "title": x[3], "url": f"{SITE}/{slug(x[2])}"})
        wd = D(dd).weekday()  # Mon=0 .. Sun=6
        if wd not in (4, 5) and not any(o[0] <= dd <= o[1] for o in c["WWHL"].get("off", [])):
            g = c["WWHL"].get("guests", {}).get(dd)
            bravo.append({"show": "WWHL", "code": "WWHL", "color": "#ffd25a", "time": "~" + t12(c["WWHL"].get("time", "23:00")), "title": g[0] if g else "Guests TBA", "url": f"{SITE}/wwhl"})
        peacock = []
        for x in sorted([x for x in c["EPISODES"] if drop_of(x) == dd], key=lambda x: x[1]):
            m = shows_meta.get(x[2]) or [x[2][:3], "#7b6be0", "#3f2f9c"]
            peacock.append({"show": x[2], "code": m[0], "color": m[1], "time": "6:00 AM", "title": x[3], "url": (x[7] if len(x) > 7 and x[7] else "") or peacock_url(x[2])})
        days.append({"date": dd, "bravo": bravo, "peacock": peacock})
    json.dump({"updated": c["UPDATED"], "site": SITE, "days": days}, open("schedule.json", "w"), separators=(",", ":"))
    json.dump(pages, open("showpages.json", "w"))
    print(f"show pages: {len(pages)} ({', '.join(pages)})")
    return pages


if __name__ == "__main__":
    run()
