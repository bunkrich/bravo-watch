/* ===== DATA: edit this block each day =====
   SOURCE PRIORITY (accuracy): 1) Bravo: bravotv.com/schedule (today's episodes, titles, synopses, "Network Premiere" = new),
   Daily Dish schedule/premiere posts, official Bravo social; 2) Peacock episode pages (after air); 3) TV listings
   (whenitsout, TV Weekly) for future titles = status "li"; 4) press/fan reports (EntertainmentNow, Bravo and Cocktails) = "rep".
   Two sources that disagree = "chk" until Bravo settles it. Synopses: short paraphrase in our own words, never copied. */
const UPDATED = "2026-11-25";
const LISTED_THROUGH = "2026-12-09"; /* last date episode listings are filled in */
const SHOWS = { /* code, colour pair, icon, Peacock page */
  "Still Flipping Out":["SFO","#a78bfa","#6d28d9","tv","https://www.peacocktv.com/watch-online/tv/still-flipping-out/7620720323445966112"],
  "RHUGT: Roaring 20th":["UGT","#f472b6","#be185d","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-ultimate-girls-trip/7959978440999457112/seasons/5"],
  "Next Gen NYC":["NGN","#60a5fa","#1d4ed8","tv","https://www.peacocktv.com/watch-online/tv/next-gen-nyc/4677501932570333112"],
  "RHORI":["RI","#22d3ee","#0e7490","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-rhode-island/8574798914766255112/seasons/1"],
  "Ladies of London: The New Reign":["LOL","#e879f9","#7e22ce","crown","https://www.peacocktv.com/watch-online/tv/ladies-of-london/5120482410719617112"],
  "Southern Hospitality":["SH","#34d399","#047857","glass","https://www.peacocktv.com/watch-online/tv/southern-hospitality/6614170128718896112"],
  "Below Deck Down Under":["BDU","#38bdf8","#0369a1","anchor","https://www.peacocktv.com/watch-online/tv/below-deck-down-under/7603676207447885112/seasons/4"],
  "The Valley: Persian Style":["VPS","#fb923c","#c2410c","tv","https://www.peacocktv.com/watch-online/tv/the-valley-persian-style/8097961647034034112"],
  "RHOSLC":["SLC","#ff3fa4","#9b2cff","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-salt-lake-city/8062314053813296112"],
  "RHONY":["NY","#2de2e6","#3a5bff","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-new-york-city/8023583101930400112/seasons/16"],
  "RHOP":["POT","#ff8a3d","#ff3f6c","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-potomac/8038056425113847112/seasons/11"],
  "RHONJ":["NJ","#ffd23f","#ff8a3d","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-new-jersey/6825525389042832112"],
  "Below Deck":["BD","#1fb6ff","#0a5cd6","anchor","https://www.peacocktv.com/stream-tv/below-deck"],
  "Southern Charm":["SC","#47f0a0","#0f9d8a","glass","https://www.peacocktv.com/watch-online/tv/southern-charm/8058982241606202112/seasons/12"],
  "Small Town Trouble: Texas":["STT","#ff6b3d","#c2185b","star","https://www.peacocktv.com/watch-online/tv/small-town-trouble-texas/4841643441022334112"],
  "Wife Swap: RH Edition":["WS","#c86bff","#ff3fa4","house","https://www.peacocktv.com/watch-online/tv/wife-swap-the-real-housewives-edition/6519457940197890112"]
};
const TRAILERS = { /* show -> official trailer page */
  "RHONY":"https://www.bravotv.com/the-daily-dish/rhony-season-16-midseason-trailer-hailey-glassman-cries-lindsay-hubbard-cameo",
  "RHOSLC":"https://www.bravotv.com/the-daily-dish/rhoslc-season-7-trailer-teases-whitney-angie-bronwyn-splits",
  "RHOP":"https://www.bravotv.com/the-daily-dish/rhop-season-11-everything-to-know",
  "Southern Charm":"https://www.bravotv.com/the-daily-dish/southern-charm-season-12-everything-to-know",
  "Small Town Trouble: Texas":"https://www.peacocktv.com/watch-online/tv/small-town-trouble-texas/4841643441022334112",
  "Wife Swap: RH Edition":"https://www.bravotv.com/the-daily-dish/wife-swap-real-housewives-edition-season-2-everything-to-know"
};
const REUNIONS = [ /* show, title, status text, st, source URL */
  ["RHONY","RHONY Season 16 reunion","Taped Nov 19 in NYC; air date and number of parts not announced","ok","https://www.bravotv.com/index%2ephp/the-daily-dish/rhony-season-16-reunion-everything-to-know"],
  ["RHOSLC","RHOSLC Season 7 reunion","In the works: Bravo opened a fan vote for a reunion question on Nov 11; no taping or air date announced","ok","https://www.bravotv.com/index%2Ephp/the-daily-dish/cast/ashley-quai"],
  ["RHOP","RHOP Season 11 reunion","Nothing announced yet","chk",""]
];
const PEACOCK_DROP = "06:00"; /* new episodes land on Peacock the next morning */
const WWHL = { /* Watch What Happens Live, Sun-Thu after the last original */
  time:"23:00", /* usual start; Bravo says it shifts nightly with the lineup */
  peacock:"https://www.peacocktv.com/watch-online/tv/watch-what-happens-live-with-andy-cohen/8809822949267363112",
  off:[["2026-11-22","2026-11-28","Off for Thanksgiving week \u00b7 no new episodes listed","rep"]],
  guests:{ /* "YYYY-MM-DD":["Guest & Guest","st"] */
    "2026-11-15":["Jeff Lewis & Stacey Rusch","ok"],"2026-11-16":["Jamie Dornan & Anthony Mackie","ok"],"2026-11-17":["Christina Ricci & Sai De Silva","ok"],"2026-11-18":["Julia Garner & Mary Cosby","ok"],"2026-11-19":["Jennifer Lawrence & Josh Hutcherson","ok"]
  }
};
const HISTORY = [ /* past premieres, newest first: date, show, season, night/time, source */
  ["2026-11-18","Small Town Trouble: Texas","S1 series premiere","Wed 9:00 PM \u00b7 two hours"],
  ["2026-11-12","Southern Charm","S12","Thu 9:00 PM"],
  ["2026-10-11","RHOP","S11","Sun 8:00 PM"],
  ["2026-09-28","Still Flipping Out","S1 series premiere","Mon 9:00 PM"],
  ["2026-09-16","RHOSLC","S7","Wed 8:00 PM"],
  ["2026-09-08","RHONY","S16","Tue 8:00 PM"],
  ["2026-08-09","RHUGT: Roaring 20th","Ultimate Girls Trip","Sun 8:00 PM"],
  ["2026-06-24","Next Gen NYC","S2","Wed"],
  ["2026-04-02","RHORI","S1 series premiere","Thu, then Sun 9:00 PM"],
  ["2026-03-05","Ladies of London: The New Reign","Series premiere","Thu 9:00 PM \u00b7 two hours"],
  ["2026-03-04","Southern Hospitality","S4","Wed"],
  ["2026-02-02","Below Deck Down Under","S4","Mon 8:00 PM"],
  ["2026-01-08","The Valley: Persian Style","S1 series premiere","Thu 9:00 PM"]
];
const EPISODES = [ /* date, time, show, "S E · title · note", status, synopsis (optional, fill when Bravo/Peacock posts it) */
  ["2026-11-25","20:00","RHOSLC","S7 E11 \u00b7 Maui Mystery, Solved","ok","The group hunts for whoever has been leaking info to Mary, Meredith lands a big DJ gig, and the Maui trip exposes the culprit."],
  ["2026-11-25","21:00","Small Town Trouble: Texas","S1 E2 \u00b7 Double Date and Double Standards","ok","A night at a lesbian bar stirs up jealousy for Aaryn and Annari, Hailey weighs a career change, and old feuds cool off at Honky Tonk Thursday."],
  ["2026-11-26","20:00","Southern Charm","S12 E3 \u00b7 No Bunny Business \u00b7 an hour early for Thanksgiving","li",""],
  ["2026-11-29","20:00","RHOP","S11 E8 \u00b7 Surprise Surprise","li",""],
  ["2026-11-30","20:00","Below Deck","S13 E8 \u00b7 Shape Up or Ship Out","li",""],
  ["2026-12-01","20:00","RHONY","S16 E12 \u00b7 back after a Thanksgiving-week break","li",""],
  ["2026-12-02","20:00","RHOSLC","S7 E12 \u00b7 Lei Down the Law","li",""],
  ["2026-12-02","21:00","Small Town Trouble: Texas","S1 E3 \u00b7 All Hail the Corn Queen","li",""],
  ["2026-12-03","21:00","Southern Charm","S12 E4 \u00b7 back at 9:00 PM","li",""],
  ["2026-12-06","20:00","RHOP","S11 E9 \u00b7 Sorori-Tea! FUN","li",""],
  ["2026-12-07","20:00","Below Deck","S13 E9 \u00b7 Smoke and Mirrors","li",""],
  ["2026-12-08","20:00","RHONY","S16 E13","li",""],
  ["2026-12-09","20:00","RHOSLC","S7 E13","li",""],
  ["2026-12-09","21:00","Small Town Trouble: Texas","S1 E4 \u00b7 The Forbidden Apple","li",""],
  ["2026-12-13","20:00","RHOP","S11 E10","li",""],
  ["2026-12-14","20:00","Below Deck","S13 E10 \u00b7 Nauti Boys","li",""],
  ["2026-12-30","21:00","Wife Swap: RH Edition","S2 E1\u20132 \u00b7 Nine Kids and a Baby Gorgeous / Mommy Cheerest","ok","Lisa Barlow and Angela Oakley swap lives in the two-episode premiere."],
  ["2027-01-06","21:00","Wife Swap: RH Edition","S2 E3 \u00b7 There's No Crying in Trapeze!","ok","Featuring Gina Kirschenheiter."],
  ["2027-01-13","21:00","Wife Swap: RH Edition","S2 E4 \u00b7 Everything's Running Smoothie","ok","Featuring Stephanie Hollman."],
  ["2027-01-19","","RHONJ","S15 premiere \u00b7 time not announced","ok",""],
  ["2027-01-20","21:00","Wife Swap: RH Edition","S2 E5 \u00b7 Ranch Realness","ok","Featuring Phaedra Parks."],
  ["2027-01-27","21:00","Wife Swap: RH Edition","S2 E6 \u00b7 9021-Oh No \u00b7 finale","ok","Featuring Crystal Kung-Minkoff."]
];
const PREMIERES = [
  {date:"2026-12-30",time:"21:00",show:"Wife Swap: RH Edition",title:"Wife Swap: The Real Housewives Edition S2",when:"Wed 9:00 PM · two-episode premiere, then Wednesdays",st:"ok",
   eps:[["Dec 30","Lisa Barlow and Angela Oakley"],["Jan 6","Gina Kirschenheiter"],["Jan 13","Stephanie Hollman"],["Jan 20","Phaedra Parks"],["Jan 27","Crystal Kung-Minkoff · finale"]]},
  {date:"2027-01-19",time:"20:00",show:"RHONJ",title:"The Real Housewives of New Jersey S15",when:"Tuesday · time not announced; 8:00 PM expected (RHONY's slot)",st:"ok",
   eps:[["Cast","Teresa, Melissa and Dolores, plus five new Housewives"]]}
];
const EVENTS = [ /* ISO date or text, name, detail, st, source URL */
  ["2026-12-14","Watch Party by Bravo, NYC","VERSA NYC \u00b7 advance screening of a new RHOSLC S7 episode, surprise Bravolebs and games. Tickets through Bravo.","ok","https://www.bravotv.com/the-daily-dish/rhoslc-season-7-episode-watch-party-date-location-tickets-details"],
  ["Fall 2027","BravoCon 2027","Returns in fall 2027; dates and city not announced","ok","https://www.bravotv.com/index%2ephp/the-daily-dish/andy-cohen-teases-bravocon-2027-date-details"]
];
const AFTERSHOWS = [ /* on:true + time = shown in Next 7 nights on every night that show has a new episode */
  {show:"RHONY",title:"RHONY After Show S16",on:true,time:"21:00",url:"https://www.bravotv.com/the-daily-dish/how-to-watch-rhony-after-show-season-16",when:"Tuesdays, 9:00 PM",where:"BravoTV.com + YouTube; Peacock Wed 6:00 AM",next:"Dec 1, after RHONY E12",note:"Cast trios and solo sit-downs breaking down each episode. Started after Episode 5.",st:"ok"},
  {show:"Southern Charm",title:"Southern Charm After Show S12",on:false,when:"Not announced",where:"Last season: BravoTV.com + YouTube, Wed 10:00 PM",next:"Watch for a mid-season launch",note:"Season 11's After Show started mid-season (Jan. 7), so Season 12's may follow the same pattern.",st:"rep"},
  {show:"RHOSLC",title:"RHOSLC After Show S7",on:false,when:"No Season 7 After Show announced",where:"Past seasons: BravoTV.com + YouTube",next:"—",note:"Bravo hasn't listed one for this season.",st:"chk"}
];
const GRID = [
  ["Sun",[["20:00","RHOP","S11",""]]],
  ["Mon",[["20:00","Below Deck","S13",""]]],
  ["Tue",[["20:00","RHONY","S16","RHONJ takes over Jan 19"],["21:00","RHONY","After Show","Online only"]]],
  ["Wed",[["20:00","RHOSLC","S7",""],["21:00","Small Town Trouble: Texas","S1","Wife Swap S2 from Dec 30"]]],
  ["Thu",[["21:00","Southern Charm","S12",""]]],
  ["Fri",[]],
  ["Sat",[]]
];
const CHANGES = [ /* logged, change (may use <b>), status, source URL */
  ["Nov 25","<b>Southern Charm</b> Ep. 3 moves an hour early to 8:00 PM on Thanksgiving; back to 9:00 PM Dec 3","li","https://www.iwantmytvmagazine.com/listings/bravo"],
  ["Nov 25","<b>RHONY</b> skipped Nov 24 for Thanksgiving week; returns Dec 1 with Ep. 12 and its After Show","li","https://whenitsout.com/tv/channel/bravo/"],
  ["Nov 25","<b>WWHL</b> off for Thanksgiving week (Nov 22\u201328); last new episode listed Nov 19","rep","https://www.peacocktv.com/watch-online/tv/watch-what-happens-live-with-andy-cohen/8809822949267363112"],
  ["Nov 20","<b>Wife Swap S2</b> takes Wed 9:00 PM from Dec 30, Small Town Trouble's slot. STT's end date isn't announced","ok","https://www.bravotv.com/the-daily-dish/wife-swap-real-housewives-edition-season-2-everything-to-know"],
  ["Nov 16","<b>RHONJ S15</b> pushed from December to Tue Jan 19","ok","https://www.bravotv.com/the-daily-dish/when-does-rhonj-season-15-premiere-air-date-revealed"],
  ["Nov","<b>Still Flipping Out</b> S1 ended; Mon 9:00 PM is open","li","https://whenitsout.com/tv/channel/bravo/"]
];
const RADAR = [ /* item, detail, status, source URL */
  ["RHOBH S16","Expected February, after RHOSLC; Leah Remini and Tracy Tutor reported joining","rep","https://entertainmentnow.com/real-housewives/bravo-2027-real-housewives-premiere-schedule/"],
  ["RHOA S18","Expected March, after RHOP","rep","https://entertainmentnow.com/real-housewives/bravo-2027-real-housewives-premiere-schedule/"],
  ["RHORI S2","Renewed in May; expected April","rep","https://entertainmentnow.com/real-housewives/bravo-2027-real-housewives-premiere-schedule/"],
  ["Summer House S11 \u00b7 Married to Medicine S13","Renewed at May upfronts; no dates","ok","https://www.nbcuniversal.com/article/bravo-unveils-new-series-vanderpump-rules-lisa-las-vegas-and-secrets-lies-texas-wives-alongside"],
  ["New series","Secrets, Lies, Texas Wives and Vanderpump Rules: Lisa Las Vegas, announced at upfronts","ok","https://www.nbcuniversal.com/article/bravo-unveils-new-series-vanderpump-rules-lisa-las-vegas-and-secrets-lies-texas-wives-alongside"],
  ["Holiday weeks","Skips around Christmas and New Year's not announced yet","chk","https://www.bravotv.com/the-daily-dish/bravo-winter-2026-schedule-full-lineup"]
];
const SOURCES = [
  ["Bravo: Winter 2026 schedule","https://www.bravotv.com/the-daily-dish/bravo-winter-2026-schedule-full-lineup"],
  ["Bravo: Wife Swap S2 episode guide","https://www.bravotv.com/the-daily-dish/wife-swap-real-housewives-edition-season-2-everything-to-know"],
  ["Bravo: RHONJ S15 premiere date","https://www.bravotv.com/the-daily-dish/when-does-rhonj-season-15-premiere-air-date-revealed"],
  ["Bravo: RHONY S16 After Show","https://www.bravotv.com/the-daily-dish/how-to-watch-rhony-after-show-season-16"],
  ["Bravo: RHONY S16 reunion","https://www.bravotv.com/index%2ephp/the-daily-dish/rhony-season-16-reunion-everything-to-know"],
  ["Bravo: Southern Charm S11 After Show","https://www.bravotv.com/index%2ephp/the-daily-dish/southern-charm-after-show-season-11-trailer-premiere-date-how-to-watch-details"],
  ["Bravo: RHOSLC Watch Party NYC","https://www.bravotv.com/the-daily-dish/rhoslc-season-7-episode-watch-party-date-location-tickets-details"],
  ["Bravo: daily schedule","https://www.bravotv.com/schedule"],
  ["EntertainmentNow: 2027 Housewives schedule","https://entertainmentnow.com/real-housewives/bravo-2027-real-housewives-premiere-schedule/"],
  ["NBCUniversal: 2026 upfront renewals","https://www.nbcuniversal.com/article/bravo-unveils-new-series-vanderpump-rules-lisa-las-vegas-and-secrets-lies-texas-wives-alongside"],
  ["Bravo: BravoCon 2027","https://www.bravotv.com/index%2ephp/the-daily-dish/andy-cohen-teases-bravocon-2027-date-details"],
  ["Bravo: Who's on WWHL this week","https://www.bravotv.com/the-daily-dish/whos-on-wwhl-this-week-schedule-guests-clips-details"],
  ["Seat42F: weekly WWHL guest lineups","https://seat42f.com/watch-what-happens-live-guests-november-15-19-2026/"],
  ["Peacock: WWHL episodes","https://www.peacocktv.com/watch-online/tv/watch-what-happens-live-with-andy-cohen/8809822949267363112"],
  ["Peacock: Bravo collection","https://www.peacocktv.com/collections/bravo"],
  ["TV Weekly listings","https://www.iwantmytvmagazine.com/listings/bravo"],
  ["WhenItsOut episode listings","https://whenitsout.com/tv/channel/bravo/"]
];
/* ===== END DATA ===== */