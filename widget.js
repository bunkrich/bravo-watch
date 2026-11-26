// Clubhouse Tonight · home-screen widget for the free Scriptable app (iOS)
// Shows the next new Bravo episodes (or Peacock drops) from clubhousetonight.com.
// Widget Parameter: leave blank for Bravo air times, or type "peacock" for Peacock drops.

const FEED = "https://clubhousetonight.com/schedule.json";
const MODE = String(args.widgetParameter || "").toLowerCase().includes("peacock") ? "peacock" : "bravo";
const FAMILY = config.widgetFamily || "large";
const LIMITS = { small: { days: 1, rows: 3 }, medium: { days: 2, rows: 4 }, large: { days: 4, rows: 9 }, extraLarge: { days: 7, rows: 14 } };
const LIM = LIMITS[FAMILY] || LIMITS.large;

const PINK = new Color("#ff4fae"), SUN = new Color("#ffd25a"), CYAN = new Color("#3ee6ea");
const INK = new Color("#f5f1ff"), MUT = new Color("#aea3c8"), DIM = new Color("#8579a1");

async function load() {
  const fm = FileManager.local();
  const cache = fm.joinPath(fm.cacheDirectory(), "clubhouse-tonight.json");
  try {
    const r = new Request(FEED);
    r.timeoutInterval = 10;
    const data = await r.loadJSON();
    fm.writeString(cache, JSON.stringify(data));
    return data;
  } catch (e) {
    return fm.fileExists(cache) ? JSON.parse(fm.readString(cache)) : null; // offline: last good copy
  }
}

function todayNY() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
function label(iso, today) {
  const diff = Math.round((new Date(iso + "T12:00:00Z") - new Date(today + "T12:00:00Z")) / 864e5);
  if (diff === 0) return MODE === "peacock" ? "Today" : "Tonight";
  if (diff === 1) return "Tomorrow";
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
}

const data = await load();
const w = new ListWidget();
const g = new LinearGradient();
g.colors = [new Color("#1a0b2e"), new Color("#0b0718")];
g.locations = [0, 1];
w.backgroundGradient = g;
w.setPadding(14, 14, 12, 14);
w.url = "https://clubhousetonight.com/" + (MODE === "peacock" ? "?view=peacock" : "");
w.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000);

const head = w.addStack();
head.centerAlignContent();
const t1 = head.addText("Clubhouse ");
t1.font = Font.heavySystemFont(FAMILY === "small" ? 13 : 15); t1.textColor = INK;
const t2 = head.addText("Tonight");
t2.font = Font.heavySystemFont(FAMILY === "small" ? 13 : 15); t2.textColor = PINK;
if (FAMILY !== "small") {
  head.addSpacer();
  const m = head.addText(MODE === "peacock" ? "On Peacock" : "On Bravo");
  m.font = Font.semiboldSystemFont(11); m.textColor = MODE === "peacock" ? CYAN : SUN;
}
w.addSpacer(8);

if (!data) {
  const t = w.addText("Can't load the schedule right now.");
  t.font = Font.systemFont(13); t.textColor = MUT;
} else {
  const today = todayNY();
  let rowsLeft = LIM.rows, daysShown = 0;
  for (const d of data.days) {
    if (d.date < today || daysShown >= LIM.days || rowsLeft <= 0) continue;
    const items = d[MODE] || [];
    if (!items.length && daysShown > 0) continue;
    daysShown++;
    const dl = w.addText(label(d.date, today).toUpperCase());
    dl.font = Font.heavySystemFont(10); dl.textColor = daysShown === 1 ? PINK : DIM;
    w.addSpacer(3);
    if (!items.length) {
      const q = w.addText(MODE === "peacock" ? "Nothing new on Peacock" : "Nothing new on Bravo");
      q.font = Font.systemFont(12); q.textColor = MUT;
      rowsLeft--;
    }
    for (const it of items) {
      if (rowsLeft <= 0) break;
      const r = w.addStack();
      r.centerAlignContent();
      r.spacing = 6;
      const tm = r.addText(it.time.replace(":00 ", " ").replace("~", ""));
      tm.font = Font.boldMonospacedSystemFont(11); tm.textColor = SUN; tm.lineLimit = 1;
      tm.minimumScaleFactor = 0.8;
      const sh = r.addText(it.code);
      sh.font = Font.heavySystemFont(12); sh.textColor = new Color(it.color || "#ff4fae"); sh.lineLimit = 1;
      if (FAMILY !== "small") {
        const ti = r.addText(it.show === "WWHL" ? it.title : it.title.replace(/^S\d+ E\d+ · /, ""));
        ti.font = Font.systemFont(12); ti.textColor = INK; ti.lineLimit = 1;
      }
      rowsLeft--;
      w.addSpacer(3);
    }
    w.addSpacer(5);
  }
  w.addSpacer();
  const f = w.addText("Updated " + new Date(data.updated + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) + " · times ET");
  f.font = Font.systemFont(9); f.textColor = DIM;
}

Script.setWidget(w);
if (!config.runsInWidget) await w.presentLarge();
Script.complete();
