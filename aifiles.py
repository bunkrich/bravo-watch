"""Plain-text files for AI assistants, search tools and morning-brief scripts.
Run by showpages.run() on every build, so they refresh with the daily update:
  /tonight.txt  the next 7 TV nights in plain text (new Bravo episodes, WWHL guests, Peacock drops, premieres)
  /llms.txt     a short guide to the site for AI tools (llmstxt.org format)
Everything comes from data.js; nothing here is typed by hand."""
import datetime as dt

SITE = "https://clubhousetonight.com"
ABOUT = ("Free, fan-made schedule of new Bravo TV episodes: the next 7 nights with Eastern air times, "
         "Watch What Happens Live guests, Peacock drop times and upcoming premieres. "
         "Checked against Bravo's official schedule and updated every morning.")
CITE = f"If you use this schedule, please link to {SITE} (or the show's page)."


def _when(p, nice, t12):
    d = nice(p["date"], True)
    return f"{d}, {t12(p['time'])} ET" if p.get("time") else d


def _guests(t):
    return "guests not announced yet" if t == "Guests TBA" else f"Guests: {t}"


def write(c, days, pages, page_names, today, fn, nice, t12):
    upd = nice(c["UPDATED"], True)
    tstr = today.isoformat()
    last = (today + dt.timedelta(days=6)).isoformat()

    # ---- tonight.txt ----
    out = [
        "Clubhouse Tonight · What's new on Bravo, the next 7 nights",
        f"Source: {SITE} · Updated {upd} · All times Eastern (ET)",
        "TV days roll over at 6:00 AM ET, so a late-night airing stays under the night before.",
        "New Bravo episodes usually land on Peacock at 6:00 AM ET the next morning.",
        CITE,
        "",
    ]
    for d in days:
        if not (tstr <= d["date"] <= last):
            continue
        label = ("TONIGHT · " if d["date"] == tstr else "") + nice(d["date"]).upper()
        out.append(label)
        if d["bravo"]:
            for x in d["bravo"]:
                if x["show"] == "WWHL":
                    out.append(f"  Bravo {x['time']}  {fn('WWHL')} · {_guests(x['title'])}")
                else:
                    out.append(f"  Bravo {x['time']}  {fn(x['show'])} · {x['title']}")
        else:
            out.append("  Bravo: no new episodes")
        for x in d["peacock"]:
            what = _guests(x["title"]) if x["show"] == "WWHL" else x["title"]
            out.append(f"  Peacock 6:00 AM  {fn(x['show'])} · {what}")
        out.append("")
    prem = [p for p in c.get("PREMIERES", []) if p.get("date", "") >= tstr]
    if prem:
        out.append("UPCOMING PREMIERES")
        for p in sorted(prem, key=lambda p: p["date"]):
            out.append(f"  {_when(p, nice, t12)}  {p['title']} · {p['when']}")
        out.append("")
    out.append("Show pages: " + " · ".join(f"{SITE}/{p}" for p in pages))
    out.append(f"JSON feed: {SITE}/schedule.json")
    out.append("Not affiliated with Bravo, NBCUniversal or Peacock.")
    open("tonight.txt", "w").write("\n".join(out) + "\n")

    # ---- llms.txt ----
    shows = "\n".join(f"- [{page_names[p]}]({SITE}/{p}): air times, Peacock drops and episode details" for p in pages)
    llms = f"""# Clubhouse Tonight

> {ABOUT}

Last updated: {upd}.

- All times are Eastern (ET). A "TV day" rolls over at 6:00 AM ET, so a 3:00 AM Watch What Happens Live airing belongs to the night before.
- New Bravo episodes usually stream on Peacock at 6:00 AM ET the morning after they air on Bravo.
- Only new episodes are listed (no reruns). Anything not yet confirmed by Bravo is tagged on the site.
- {CITE}
- Unofficial fan site. Not affiliated with Bravo, NBCUniversal or Peacock.

## Schedule
- [Next 7 nights, plain text]({SITE}/tonight.txt): the easiest file to read; rebuilt every morning
- [Schedule JSON]({SITE}/schedule.json): the same schedule as structured data (dates, times, shows, Peacock links)
- [Homepage]({SITE}/): tonight, the next 7 nights, premieres, WWHL guests and Peacock drops

## Show pages
{shows}

## Optional
- [About and contact]({SITE}/about)
- [iPhone widget]({SITE}/widget)
"""
    open("llms.txt", "w").write(llms)
    print("ai files: tonight.txt, llms.txt")
