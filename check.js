// Freshness guard: run by build.py. Exits 1 (build fails) if anything on the page is out of date.
const fs=require("fs"),vm=require("vm");
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+"/data.js","utf8").replace(/^const /gm,"var "),ctx);
const today=new Date().toLocaleDateString("en-CA",{timeZone:"America/New_York"});
const days=(a,b)=>Math.round((new Date(b)-new Date(a))/864e5);
const errs=[];
const key=(show,s)=>{const m=/\bS(\d+)\b/.exec(s||"");return m?`${show} S${m[1]}`:show}; // same show + same season = already aired
const aired=new Set([...ctx.HISTORY.map(h=>key(h[1],h[2])),...ctx.EPISODES.filter(e=>e[0]<=today).map(e=>key(e[2],e[3]))]);
const norm=s=>" "+s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()+" ";
ctx.RADAR.forEach(r=>{
  if(!r[4])errs.push(`RADAR "${r[0]}" has no verified date`);
  else if(days(r[4],today)>=7)errs.push(`RADAR "${r[0]}" last verified ${r[4]}; re-check it`);
  aired.forEach(s=>{if(norm(r[0]+" "+r[1]).includes(norm(s)))errs.push(`RADAR "${r[0]}" mentions "${s}", which already aired; move it to HISTORY`)});
});
ctx.PREMIERES.forEach(p=>{if(p.date<today)errs.push(`PREMIERES "${p.title}" (${p.date}) is past; move it to HISTORY`)});
const isDate=s=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+"T00:00:00Z"))&&new Date(s+"T00:00:00Z").toISOString().slice(0,10)===s;
const isTime=s=>typeof s==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const plus=(d,n)=>new Date(new Date(d+"T00:00:00Z").getTime()+n*864e5).toISOString().slice(0,10);
if(!isDate(ctx.UPDATED))errs.push(`UPDATED "${ctx.UPDATED}" is not a valid YYYY-MM-DD date`);
else if(ctx.UPDATED>today)errs.push(`UPDATED ${ctx.UPDATED} is in the future (today is ${today} in New York)`);
else if(days(ctx.UPDATED,today)>1)errs.push(`UPDATED is ${ctx.UPDATED}; bump it`);
if(!isDate(ctx.LISTED_THROUGH))errs.push(`LISTED_THROUGH "${ctx.LISTED_THROUGH}" is not a valid YYYY-MM-DD date`);
else if(ctx.LISTED_THROUGH<plus(today,6))errs.push(`LISTED_THROUGH ${ctx.LISTED_THROUGH} doesn't cover the next 7 nights (needs ${plus(today,6)} or later); add episodes`);
/* row shapes: a typo here silently drops an episode from the page */
const ST=new Set(["ok","li","rep","chk"]),seen=new Set();
ctx.EPISODES.forEach((e,i)=>{const id=`EPISODES[${i}] ${e[2]} ${e[0]}`;
  if(!isDate(e[0]))errs.push(`${id}: bad date`);
  if(e[1]!==""&&!isTime(e[1]))errs.push(`${id}: time "${e[1]}" must be HH:MM (24h) or ""`);
  if(!ST.has(e[4]))errs.push(`${id}: status "${e[4]}" must be ok, li, rep or chk`);
  if(e[6]!=null&&e[6]!==""&&e[6]!=="streaming"&&!isDate(e[6]))errs.push(`${id}: 7th field must be null, "streaming" or an early-drop date`);
  const m=/\bS(\d+) E(\d+)/.exec(e[3]||"");if(m){const k=`${e[2]} S${m[1]}E${m[2]}`;if(seen.has(k))errs.push(`${id}: duplicate episode ${k}`);seen.add(k)}});
/* WWHL: every listed night needs a real Bravo airtime, on that date or after midnight */
const W=ctx.WWHL||{};
if(W.time)errs.push(`WWHL.time is no longer used: list each night in WWHL.airings with Bravo's exact airtime`);
Object.entries(W.airings||{}).forEach(([n,a])=>{const id=`WWHL.airings["${n}"]`;
  if(!isDate(n))return errs.push(`${id}: bad night date`);
  if(!Array.isArray(a)||a.length<3)return errs.push(`${id}: must be [episode, "YYYY-MM-DD HH:MM", status]`);
  const [ad,at]=String(a[1]).split(" ");
  if(!isDate(ad)||!isTime(at))errs.push(`${id}: airtime "${a[1]}" must be "YYYY-MM-DD HH:MM"`);
  else if(ad!==n&&!(ad===plus(n,1)&&at<"06:00"))errs.push(`${id}: airtime ${a[1]} must be that night or before 6 AM the next morning`);
  if(!ST.has(a[2]))errs.push(`${id}: status "${a[2]}" must be ok, li, rep or chk`);
  if((W.off||[]).some(o=>n>=o[0]&&n<=o[1]))errs.push(`${id}: falls inside an off week; remove one or the other`)});
Object.keys(W.guests||{}).forEach(n=>{if(!isDate(n))errs.push(`WWHL.guests["${n}"]: bad date`)});
(ctx.PREMIERES||[]).forEach(p=>{if(p.time&&!isTime(p.time))errs.push(`PREMIERES "${p.title}": time must be HH:MM or "" when not announced`)});
const used=new Set([...ctx.EPISODES.map(e=>e[2]),...ctx.HISTORY.map(h=>h[1]),...ctx.PREMIERES.map(p=>p.show).filter(Boolean),...ctx.GRID.flatMap(g=>g[1].map(s=>s[1])),...(ctx.AFTERSHOWS||[]).map(a=>a.show),...(ctx.REUNIONS||[]).map(r=>r[0]),"WWHL"]);
used.forEach(s=>{if(!ctx.FULL||!ctx.FULL[s])errs.push(`FULL is missing the official full name for "${s}"`)});
if(errs.length){console.error("FRESHNESS CHECK FAILED:\n- "+errs.join("\n- "));process.exit(1)}
console.log("freshness check ok");
