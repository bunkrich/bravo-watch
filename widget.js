// Clubhouse Tonight · home-screen widget for the free Scriptable app (iOS)
// Shows the next new Bravo episodes (or Peacock drops) from clubhousetonight.com.
// Widget Parameter: leave blank for Bravo air times, or type "peacock" for Peacock drops.

const FEED = "https://clubhousetonight.com/schedule.json";
const MODE = String(args.widgetParameter || "").toLowerCase().includes("peacock") ? "peacock" : "bravo";
const PK = MODE === "peacock";
const FAMILY = config.widgetFamily || "large";
const SMALL = FAMILY === "small";
// vertical room for the list, in points (header + footer already taken out)
const ROOM = { small: 108, medium: 104, large: 292, extraLarge: 292 }[FAMILY] || 292;
const ROW_H = 21, DAY_H = 22; // a row incl. its gap · a day label incl. gaps

const INK = new Color("#f5f1ff"), MUT = new Color("#aea3c8"), DIM = new Color("#7d7299");
const PINK = new Color("#ff4fae");
const ACCENT = PK ? new Color("#ffe000") : new Color("#4dc9ff"); // Peacock gold · Bravo cyan, like the site

async function load() {
  const fm = FileManager.local();
  const cache = fm.joinPath(fm.cacheDirectory(), "clubhouse-tonight.json");
  try {
    const r = new Request(FEED);
    r.timeoutInterval = 10;
    const data = await r.loadJSON();
    if (!data || !data.updated || !Array.isArray(data.days)) throw new Error("bad feed"); // never cache a broken feed
    fm.writeString(cache, JSON.stringify(data));
    return data;
  } catch (e) {
    try { return fm.fileExists(cache) ? JSON.parse(fm.readString(cache)) : null; } // offline: last good copy
    catch (e2) { return null; }
  }
}

function todayNY() {
  // a TV day: rolls over at 6 AM New York time, like the site, so a 3 AM WWHL airing still counts as last night
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() - 6 * 3600e3));
}
const noon = iso => new Date(iso + "T12:00:00Z");
function label(iso, today) {
  const diff = Math.round((noon(iso) - noon(today)) / 864e5);
  if (diff === 0) return PK ? "Today" : "Tonight";
  if (diff === 1) return "Tomorrow";
  return noon(iso).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}
const shortDate = iso => noon(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
// "S16 E12 · Echoes of the Past · back after a break" → "Echoes of the Past" (the notes live on the site)
function cleanTitle(it) {
  const parts = it.title.split(" · ");
  if (it.show === "WWHL") return parts[0];
  return (/^S\d+ E\d+$/.test(parts[0]) ? parts[1] : parts[0]) || it.title;
}
// "8:00 PM" → "8 PM", "Mon 3:00 AM" → "3 AM", "~9:30 PM" → "9:30 PM"
const shortTime = t => t.replace("~", "").replace(/^[A-Z][a-z]{2} /, "").replace(":00 ", " ");

const data = await load();
const w = new ListWidget();
const g = new LinearGradient();
g.colors = [new Color("#1d0d33"), new Color("#0b0718")];
g.locations = [0, 1];
w.backgroundGradient = g;
w.setPadding(SMALL ? 14 : 16, 16, 14, 16);
w.url = "https://clubhousetonight.com/" + (PK ? "?view=peacock" : "");
w.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000);

// header: Clubhouse Tonight ............ On Peacock · 6 AM
const head = w.addStack();
head.centerAlignContent();
const t1 = head.addText("Clubhouse ");
t1.font = Font.heavySystemFont(SMALL ? 13 : 16); t1.textColor = INK;
const t2 = head.addText("Tonight");
t2.font = Font.heavySystemFont(SMALL ? 13 : 16); t2.textColor = PINK;
if (!SMALL) {
  head.addSpacer();
  const m = head.addText(PK ? "Peacock · 6 AM" : "On Bravo");
  m.font = Font.semiboldSystemFont(11); m.textColor = ACCENT;
}
w.addSpacer(SMALL ? 8 : 12);

function pill(parent, it) {
  const c = it.color || "#ff4fae";
  const p = parent.addStack();
  p.size = new Size(SMALL ? 38 : 42, 17);
  p.cornerRadius = 5;
  p.backgroundColor = new Color(c, 0.18);
  p.centerAlignContent();
  const t = p.addText(it.code);
  t.font = Font.heavySystemFont(10); t.textColor = new Color(c); t.lineLimit = 1; t.minimumScaleFactor = 0.7;
}

if (!data) {
  const t = w.addText("Can't load the schedule right now.");
  t.font = Font.systemFont(13); t.textColor = MUT;
} else {
  const today = todayNY();
  let room = ROOM, daysShown = 0;
  for (const d of data.days) {
    if (d.date < today) continue;
    const items = d[MODE] || [];
    if (!items.length && daysShown > 0) continue;   // skip empty days after the first
    if (room < DAY_H + ROW_H) break;                // don't start a day we can't show a row of
    if (daysShown > 0) w.addSpacer(8);
    daysShown++;
    room -= DAY_H;

    const dh = w.addStack();
    dh.centerAlignContent();
    const dl = dh.addText(label(d.date, today).toUpperCase());
    dl.font = Font.heavySystemFont(10); dl.textColor = daysShown === 1 ? ACCENT : MUT;
    if (!SMALL) {
      const dd = dh.addText("  " + shortDate(d.date));
      dd.font = Font.semiboldSystemFont(10); dd.textColor = DIM;
    }
    w.addSpacer(5);

    if (!items.length) {
      const q = w.addText(PK ? "Nothing new on Peacock" : "Nothing new on Bravo");
      q.font = Font.systemFont(12); q.textColor = MUT;
      room -= ROW_H;
      continue;
    }
    items.forEach((it, i) => {
      if (room < ROW_H) return;
      if (i > 0) w.addSpacer(4);
      room -= ROW_H;
      const r = w.addStack();
      r.centerAlignContent();
      if (!PK) {                                     // Peacock drops are all 6 AM, so no time column there
        const tc = r.addStack();
        tc.size = new Size(SMALL ? 36 : 40, 17);
        tc.centerAlignContent();
        const tm = tc.addText(shortTime(it.time));
        tm.font = Font.semiboldMonospacedSystemFont(11); tm.textColor = INK; tm.lineLimit = 1; tm.minimumScaleFactor = 0.75;
        tc.addSpacer();
        r.addSpacer(4);
      }
      pill(r, it);
      if (!SMALL) {
        r.addSpacer(10);
        const tba = /TBA/i.test(it.title);
        const ti = r.addText(cleanTitle(it));
        ti.font = tba ? Font.systemFont(13) : Font.mediumSystemFont(13);
        ti.textColor = tba ? DIM : INK; ti.lineLimit = 1;
      }
      r.addSpacer();
    });
    if (SMALL) break;                                // small: just the first day
  }
  w.addSpacer();
  const f = w.addText("Updated " + shortDate(data.updated) + " · times ET");
  f.font = Font.systemFont(9); f.textColor = DIM;
}

Script.setWidget(w);
if (!config.runsInWidget) await w.presentLarge();
Script.complete();
