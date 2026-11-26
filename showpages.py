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


from zoneinfo import ZoneInfo  # required: never fall back to the server's own date

NY = ZoneInfo("America/New_York")


def today_ny():
    return dt.datetime.now(NY).date()


def at_ny(date, hhmm, minutes=0):
    """ISO timestamp (with ET offset) for a date + HH:MM, plus optional minutes."""
    h, m = map(int, (hhmm or "20:00").split(":"))
    return (dt.datetime.combine(D(date), dt.time(h, m), NY) + dt.timedelta(minutes=minutes)).isoformat()


def _lum(h):
    v = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    v = [c / 12.92 if c <= .03928 else ((c + .055) / 1.055) ** 2.4 for c in v]
    return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]


def needs_ink(c1, c2):
    """Dark badge text when white would be too faint on the middle of the show's gradient."""
    mid = "#" + "".join(f"{(int(c1[i:i + 2], 16) + int(c2[i:i + 2], 16)) // 2:02x}" for i in (1, 3, 5))
    return 1.05 / (_lum(mid) + .05) < 3


def wwhl_airing(w, night):
    """[ep, "YYYY-MM-DD HH:MM", st] or None for a WWHL viewing night."""
    return (w.get("airings") or {}).get(night)


def wwhl_when(night, at):
    ad, t = at[:10], at[11:]
    if ad > night:
        return f"Late {D(night).strftime('%a')} · airs {D(ad).strftime('%a')} {t12(t)} ET"
    return f"{t12(t)} ET"


CSS = """:root{--bg:#07041a;--ink:#f7f3ff;--mut:#b9aed6;--dim:#9488b5;--line:rgba(255,255,255,.11);--glass:rgba(255,255,255,.055);--pea1:#ffe000;--pea2:#ffa800;
--font:system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--num:ui-rounded,"SF Pro Rounded",system-ui,-apple-system,sans-serif;--ease:cubic-bezier(.2,.7,.2,1)}
*,*::before,*::after{box-sizing:border-box}html{background:var(--bg);color-scheme:dark;padding-top:env(safe-area-inset-top);-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:transparent}
body{margin:0;min-height:100vh;min-height:100dvh;color:var(--ink);background:var(--bg);font:16px/1.6 var(--font);-webkit-font-smoothing:antialiased}
/* every show page is lit in that show's own colours (from its Bravo key art) */
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(46vmax 46vmax at 0% -6%,color-mix(in srgb,var(--c1) 34%,transparent),transparent 62%),radial-gradient(42vmax 42vmax at 104% 30%,color-mix(in srgb,var(--c2) 30%,transparent),transparent 62%),radial-gradient(40vmax 40vmax at 40% 112%,rgba(166,122,255,.16),transparent 62%),var(--bg)}
@supports not (color:color-mix(in srgb,red 50%,blue)){body::before{background:radial-gradient(46vmax 46vmax at 0% -6%,rgba(255,79,174,.26),transparent 62%),radial-gradient(42vmax 42vmax at 104% 30%,rgba(77,201,255,.16),transparent 62%),var(--bg)}}
a{color:inherit}:focus-visible{outline:2px solid var(--c1);outline-offset:2px}
.wrap{width:min(820px,100% - 2*max(16px,4vw,env(safe-area-inset-left),env(safe-area-inset-right)));margin-inline:auto}
.bar{position:sticky;top:0;z-index:5;background:rgba(7,4,26,.6);-webkit-backdrop-filter:blur(22px) saturate(170%);backdrop-filter:blur(22px) saturate(170%);border-bottom:1px solid var(--line)}
.bar .wrap{display:flex;align-items:center;justify-content:space-between;min-height:60px;gap:12px}
.brand{font-weight:800;letter-spacing:-.025em;font-size:20px;text-decoration:none;white-space:nowrap}
.brand span{color:#ff4fae;background:linear-gradient(90deg,#ff4fae,#ffd25a);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.back{display:inline-flex;align-items:center;min-height:40px;font-size:14px;font-weight:650;color:var(--mut);text-decoration:none;padding:0 14px;border-radius:99px}.back:hover{background:rgba(255,255,255,.1);color:var(--ink)}
.hero{display:flex;gap:18px;align-items:center;margin:34px 0 8px}
.badge{flex:none;width:64px;height:64px;border-radius:18px;display:grid;place-items:center;font:800 17px/1 var(--font);letter-spacing:-.01em;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4);background:linear-gradient(145deg,var(--c1),var(--c2));box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -10px 18px rgba(0,0,0,.18),0 0 0 1px rgba(255,255,255,.12),0 0 34px -4px var(--c1)}
.badge.sm{font-size:13.5px}.badge.ink{color:#160c02;text-shadow:0 1px 0 rgba(255,255,255,.35)}
h1{font-size:clamp(27px,4.6vw,40px);line-height:1.1;letter-spacing:-.03em;margin:0;text-wrap:balance}
.lead{color:var(--mut);margin:8px 0 24px;font-size:16.5px;text-wrap:pretty}
.card{background:var(--glass);border:1px solid var(--line);border-radius:22px;padding:20px 22px;margin:0 0 14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 12px 32px rgba(0,0,0,.28);-webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%)}
.card.next{border-color:color-mix(in srgb,var(--c1) 55%,transparent);background:linear-gradient(160deg,color-mix(in srgb,var(--c1) 16%,transparent),var(--glass) 60%);box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 0 42px -16px var(--c1),0 12px 32px rgba(0,0,0,.28)}
h2{font-size:19px;margin:0 0 10px;letter-spacing:-.015em}
.k{font-size:12.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--c1)}
.next .when{font:800 23px/1.25 var(--num);letter-spacing:-.02em;margin:4px 0}.next .ttl{font-weight:700}
.mut{color:var(--mut)}p{margin:0 0 8px}
ul.eps{list-style:none;margin:0;padding:0}ul.eps li{display:grid;grid-template-columns:128px 1fr;gap:4px 14px;padding:12px 0;border-top:1px solid var(--line)}ul.eps li:first-child{border-top:0}
.dt{font-weight:700;font-size:14px}.dt span{display:block;color:#ffd25a;font:700 14px/1.4 var(--num)}
.ep b{display:block}.ep .syn{color:var(--mut);font-size:14px;text-wrap:pretty}
@media(max-width:560px){ul.eps li{grid-template-columns:1fr}.hero{gap:14px;margin-top:26px}.badge{width:56px;height:56px;border-radius:16px;font-size:15px}.card{padding:18px}}
.pk{display:inline-flex;align-items:center;gap:6px;min-height:36px;margin-top:8px;padding:0 14px;border-radius:99px;font-size:13px;font-weight:800;text-decoration:none;background:rgba(255,255,255,.08);border:1px solid var(--line)}
.pk.live{color:#1a1200;background:linear-gradient(90deg,var(--pea1),var(--pea2));border:0;box-shadow:0 0 18px -4px var(--pea2)}
.tag{display:inline-block;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.1);color:var(--mut);margin-left:6px;vertical-align:1px}
.shows{display:flex;flex-wrap:wrap;gap:8px}.shows a{display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 14px;border-radius:99px;background:rgba(255,255,255,.07);border:1px solid var(--line);font-size:14px;font-weight:700;text-decoration:none;transition:border-color .2s,box-shadow .2s}
.shows a::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c1);box-shadow:0 0 8px var(--c1)}
.shows a:hover{border-color:var(--c1);box-shadow:0 0 16px -6px var(--c1)}
.cta{display:inline-flex;align-items:center;min-height:44px;margin-top:6px;padding:0 20px;border-radius:99px;background:linear-gradient(90deg,#ff4fae,#ffd25a);color:#140b24;font-weight:800;text-decoration:none;box-shadow:0 0 22px -6px #ff4fae}
footer{padding:22px 0 calc(48px + env(safe-area-inset-bottom));color:var(--dim);font-size:13px}footer a{color:var(--mut)}
@media (color-gamut:p3){@supports (color:oklch(from red l c h)){.badge{background:linear-gradient(145deg,oklch(from var(--c1) l calc(c * 1.22) h),oklch(from var(--c2) l calc(c * 1.18) h))}}}
@supports (animation-timeline:view()){@media (prefers-reduced-motion:no-preference){.card{animation:rise linear both;animation-timeline:view();animation-range:entry 0% entry 35%}@keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}}}
@view-transition{navigation:auto}
::view-transition-old(root),::view-transition-new(root){animation-duration:.22s}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}"""

TRACK = """<script>(()=>{let me=false;try{me=!!localStorage.getItem("umami.disabled")}catch(e){}
const LIVE=["clubhousetonight.com","www.clubhousetonight.com"].includes(location.hostname);if(me||!LIVE)return;
const c=document.createElement("script");c.defer=true;c.src="https://static.cloudflareinsights.com/beacon.min.js";c.dataset.cfBeacon=JSON.stringify({token:"e327c2f1f9b24f13bec12fed2dfbdeb0"});document.head.appendChild(c);
const s=document.createElement("script");s.defer=true;s.src="https://cloud.umami.is/script.js";s.dataset.websiteId="cfb9dce1-a6ac-41b5-8f97-0c982d277fe9";s.dataset.domains="clubhousetonight.com,www.clubhousetonight.com";document.head.appendChild(s);
const t=(n,d)=>{try{window.umami&&umami.track(n,d)}catch(e){}};
document.addEventListener("click",ev=>{const a=ev.target.closest("a");if(!a)return;const sh=document.body.dataset.show;
if(a.classList.contains("pk"))t("peacock",{show:sh,area:"show_page"});else if(a.closest(".shows"))t("show_page_nav",{from:sh,to:a.textContent.trim()});});})();</script>"""


# Show pages are rebuilt once a day: once the featured airing has ended, roll the card on to the next one.
ROLL = """<script>(()=>{const c=[...document.querySelectorAll(".card.next[data-end]")];if(!c.length)return;const roll=()=>{const n=Date.now();
const a=c[0];if(!a||a.hidden||n<Date.parse(a.dataset.end))return;const b=c[1];
if(b){a.hidden=true;b.hidden=false}else{const k=a.querySelector(".k");if(k)k.textContent="Latest episode \u00b7 aired"}};
roll();document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")roll()});setInterval(roll,300000)})();</script>"""


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

    def colours(s):
        m = shows_meta.get(s)
        return (m[0], m[1], m[2]) if m else (re.sub(r"[^A-Z]", "", s)[:3] or s[:2].upper(), "#7b6be0", "#3f2f9c")

    def cvars(s):
        _, c1, c2 = colours(s)
        return f"--c1:{c1};--c2:{c2}"

    def badge(s):
        code, c1, c2 = colours(s)
        cls = (" ink" if needs_ink(c1, c2) else "") + (" sm" if len(code) > 3 else "")
        return f'<span class="badge{cls}" aria-hidden="true">{e(code)}</span>'

    def peacock_url(s):
        if s == "WWHL":
            return c["WWHL"].get("peacock", "")
        m = shows_meta.get(s)
        return m[4] if m and len(m) > 4 else ""

    def streaming(ep):
        return len(ep) > 6 and ep[6] == "streaming"

    def drop_of(ep):
        if streaming(ep):
            return ep[0]
        return ep[6] if len(ep) > 6 and ep[6] else (D(ep[0]) + dt.timedelta(days=1)).isoformat()

    def is_live(drop):
        now = dt.datetime.now(NY)
        return drop < tstr or (drop == tstr and now.hour >= 6)

    def ep_li(ep, past):
        drop = drop_of(ep)
        url = (ep[7] if len(ep) > 7 and ep[7] else "") or peacock_url(ep[2])
        live = is_live(drop)
        btn = ""
        if url and streaming(ep):
            btn = f'<a class="pk live" href="{e(url)}">▶ Already on Peacock</a>'
        elif url:
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
            since = (today - dt.timedelta(days=8)).isoformat()
            nights = sorted(set([d for d in w.get("guests", {}) if d >= since] + [d for d in (w.get("airings") or {}) if d >= since]))
            lead = ("Bravo moves Watch What Happens Live around night to night, sometimes to after midnight, so every airtime below is copied from "
                    "Bravo's own schedule. Each episode streams on Peacock the next morning.")
            offs = [o for o in w.get("off", []) if o[1] >= tstr]
            upn = [d for d in nights if d >= tstr and wwhl_airing(w, d)]

            def card(d, label, hidden=False):
                a = wwhl_airing(w, d)
                g = w.get("guests", {}).get(d)
                end = at_ny(a[1][:10], a[1][11:], 60)
                who = f"Guests: {e(g[0])}" if g else "Guests not announced yet"
                return (f'<section class="card next" data-end="{e(end)}"{" hidden" if hidden else ""}><div class="k">{e(label)}</div>'
                        f'<div class="when">{e(nice(d))} · {e(wwhl_when(d, a[1]).replace("Late " + D(d).strftime("%a") + " · ", "late night, "))}</div><div class="ttl">{who}</div>'
                        f'<p class="mut">Episode {e(a[0])} · on Peacock {e(nice((D(d) + dt.timedelta(days=1)).isoformat()))} at 6:00 AM.</p></section>')
            if upn:
                sections.append(card(upn[0], "Tonight's episode" if upn[0] == tstr else "Next episode"))
                if len(upn) > 1:
                    sections.append(card(upn[1], "Next episode", hidden=True))
            elif offs:
                sections.append(f'<section class="card next"><div class="k">Next episode</div><div class="ttl">{e(offs[0][2])}</div><p class="mut">Through {e(nice(offs[0][1]))}.</p></section>')
            if nights:
                def li(d):
                    a = wwhl_airing(w, d)
                    g = w.get("guests", {}).get(d)
                    tm = e(wwhl_when(d, a[1])) if a else "Time not tracked"
                    live = is_live((D(d) + dt.timedelta(days=1)).isoformat())
                    btn = f'<a class="pk live" href="{e(w.get("peacock"))}">▶ Watch on Peacock</a>' if live and w.get("peacock") else ""
                    return (f'<li><div class="dt">{e(nice(d))}<span>{tm}</span></div><div class="ep"><b>{e(g[0]) if g else "Guests not announced yet"}</b>'
                            + (f'<div class="syn">Episode {e(a[0])}</div>' if a else "") + btn + '</div></li>')
                sections.append(f'<section class="card"><h2>WWHL Nights &amp; Guests</h2><ul class="eps">{"".join(li(d) for d in [x for x in nights if x >= tstr] + sorted([x for x in nights if x < tstr], reverse=True))}</ul></section>')
            if offs:
                sections.append('<section class="card"><h2>Weeks Off</h2>' + "".join(f'<p>{e(nice(o[0]))} – {e(nice(o[1]))}: {e(o[2])}</p>' for o in offs) + '</section>')
            title = "WWHL Guests This Week: Watch What Happens Live Schedule"
            desc = "Who's on Watch What Happens Live with Andy Cohen this week: every night's guests, air times and when each episode hits Peacock. Updated daily."
        else:
            when_bits = []
            if slots:
                when_bits.append(" and ".join(f"{days_full[d]} at {t12(t)}" for d, t in slots) + " on Bravo")
            lead = (f"Season {season} · " if season else "") + (when_bits[0] if when_bits else "On Bravo") + ". New episodes stream on Peacock the next morning at 6:00 AM."
            def next_card(n, label, hidden=False):
                drop = drop_of(n)
                url = (n[7] if len(n) > 7 and n[7] else "") or peacock_url(s)
                syn = f'<p class="mut">{e(n[5])}</p>' if len(n) > 5 and n[5] else ""
                if streaming(n):
                    pk = '<p class="mut">Already streaming on Peacock.</p>' + (f'<a class="pk live" href="{e(url)}">▶ Watch on Peacock</a>' if url else "")
                else:
                    pk = f'<p class="mut">On Peacock {e(nice(drop))} at 6:00 AM.</p>' + (f'<a class="pk" href="{e(url)}">Peacock · {e(D(drop).strftime("%a"))} 6 AM</a>' if url else "")
                attrs = (f' data-end="{e(at_ny(n[0], n[1], 60))}"' if n[1] else "") + (" hidden" if hidden else "")
                return (f'<section class="card next"{attrs}><div class="k">{e(label)}</div>'
                        f'<div class="when">{e(nice(n[0]))} · {e(t12(n[1]))}</div><div class="ttl">{e(n[3])}</div>{syn}{pk}</section>')
            if up:
                sections.append(next_card(up[0], "Tonight's new episode" if up[0][0] == tstr else "Next new episode"))
                if len(up) > 1:
                    sections.append(next_card(up[1], "Next new episode", hidden=True))
            prem = [p for p in c["PREMIERES"] if p.get("show") == s and p["date"] >= tstr]
            for p in prem:
                eplist = "".join(f'<li><div class="dt">{e(x[0])}</div><div class="ep"><b>{e(x[1])}</b></div></li>' for x in p.get("eps", []))
                sections.append(f'<section class="card"><h2>Premiere: {e(p["title"])}</h2><p><b>{e(nice(p["date"], True))}</b> · {e(p.get("when", ""))}</p>' + (f'<ul class="eps">{eplist}</ul>' if eplist else "") + '</section>')
            if up[2:]:
                sections.append(f'<section class="card"><h2>Coming Up</h2><ul class="eps">{"".join(ep_li(x, False) for x in up[2:])}</ul></section>')
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

        nav = "".join(f'<a href="/{slug(x)}" style="{cvars(x)}">{e(fn(x) if len(fn(x)) <= 28 else x)}</a>' for x in active if x != s)
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
<body data-show="{e(s)}" style="{cvars(s)}">
<div class="bar"><div class="wrap"><a class="brand" href="/">Clubhouse <span>Tonight</span></a><a class="back" href="/">← Tonight's schedule</a></div></div>
<main class="wrap">
  <div class="hero">{badge(s)}<h1>{e(name)}</h1></div>
  <p class="lead">{e(lead)}</p>
  {''.join(sections) or '<section class="card"><p class="mut">No new episodes on the schedule right now.</p></section>'}
  <section class="card"><h2>Every Bravo Night in One Place</h2><p class="mut">See tonight's full lineup, WWHL guests and Peacock drops for every show.</p><a class="cta" href="/">Open Clubhouse Tonight</a></section>
  <section class="card"><h2>More Show Schedules</h2><div class="shows">{nav}</div></section>
</main>
<footer><div class="wrap">Updated {e(nice(c["UPDATED"], True))}. All times Eastern. Not affiliated with Bravo, NBCUniversal or Peacock. · <a href="/about">About &amp; contact</a></div></footer>
{ROLL}
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
        ww = c["WWHL"]
        a = wwhl_airing(ww, dd)
        if a:
            g = ww.get("guests", {}).get(dd)
            late = a[1][:10] > dd
            bravo.append({"show": "WWHL", "code": "WWHL", "color": (shows_meta.get("WWHL") or ["", "#22d3f0"])[1], "time": (D(a[1][:10]).strftime("%a ") if late else "") + t12(a[1][11:]),
                          "title": g[0] if g else "Guests TBA", "url": f"{SITE}/wwhl"})
        peacock = []
        for x in sorted([x for x in c["EPISODES"] if not streaming(x) and drop_of(x) == dd], key=lambda x: x[1]):
            m = shows_meta.get(x[2]) or [x[2][:3], "#7b6be0", "#3f2f9c"]
            peacock.append({"show": x[2], "code": m[0], "color": m[1], "time": "6:00 AM", "title": x[3], "url": (x[7] if len(x) > 7 and x[7] else "") or peacock_url(x[2])})
        prev = (D(dd) - dt.timedelta(days=1)).isoformat()
        if wwhl_airing(ww, prev):
            g = ww.get("guests", {}).get(prev)
            peacock.append({"show": "WWHL", "code": "WWHL", "color": (shows_meta.get("WWHL") or ["", "#22d3f0"])[1], "time": "6:00 AM", "title": g[0] if g else "Guests TBA", "url": ww.get("peacock", "")})
        days.append({"date": dd, "bravo": bravo, "peacock": peacock})
    json.dump({"updated": c["UPDATED"], "site": SITE, "days": days}, open("schedule.json", "w"), separators=(",", ":"))
    json.dump(pages, open("showpages.json", "w"))
    print(f"show pages: {len(pages)} ({', '.join(pages)})")
    return pages


if __name__ == "__main__":
    run()
