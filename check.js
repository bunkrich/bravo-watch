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
if(days(ctx.UPDATED,today)>1)errs.push(`UPDATED is ${ctx.UPDATED}; bump it`);
if(ctx.LISTED_THROUGH<today)errs.push(`LISTED_THROUGH ${ctx.LISTED_THROUGH} is past; add episodes`);
const used=new Set([...ctx.EPISODES.map(e=>e[2]),...ctx.HISTORY.map(h=>h[1]),...ctx.PREMIERES.map(p=>p.show).filter(Boolean),...ctx.GRID.flatMap(g=>g[1].map(s=>s[1]))]);
used.forEach(s=>{if(!ctx.FULL||!ctx.FULL[s])errs.push(`FULL is missing the official full name for "${s}"`)});
if(errs.length){console.error("FRESHNESS CHECK FAILED:\n- "+errs.join("\n- "));process.exit(1)}
console.log("freshness check ok");
