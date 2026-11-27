/* ===== DATA: edit this block each day =====
   SOURCE PRIORITY (accuracy): 1) Bravo: bravotv.com/schedule (today's episodes, titles, synopses, "Network Premiere" = new),
   Daily Dish schedule/premiere posts, official Bravo social; 2) Peacock episode pages (after air); 3) TV listings
   (whenitsout, TV Weekly) for future titles = status "li"; 4) press/fan reports (EntertainmentNow, Bravo and Cocktails) = "rep".
   Two sources that disagree = "chk" until Bravo settles it. Synopses: short paraphrase in our own words, never copied. */
const UPDATED = "2026-11-27";
const LISTED_THROUGH = "2026-12-09"; /* last date episode listings are filled in */
const SHOWS = { /* code, colour pair [bright, deep] taken from each show's current Bravo key art/logo, icon, Peacock page */
  "WWHL":["WWHL","#22d3f0","#c40e26","mic","https://www.peacocktv.com/watch-online/tv/watch-what-happens-live-with-andy-cohen/8809822949267363112"],
  "Still Flipping Out":["SFO","#a78bfa","#6d28d9","tv","https://www.peacocktv.com/watch-online/tv/still-flipping-out/7620720323445966112"],
  "RHUGT: Roaring 20th":["UGT","#f5c46b","#8a5a12","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-ultimate-girls-trip/7959978440999457112/seasons/5"],
  "Next Gen NYC":["NGN","#60a5fa","#1d4ed8","tv","https://www.peacocktv.com/watch-online/tv/next-gen-nyc/4677501932570333112"],
  "RHORI":["RI","#5fe3d3","#1f6aa5","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-rhode-island/8574798914766255112/seasons/1"],
  "Ladies of London: The New Reign":["LOL","#c48bff","#5b21b6","crown","https://www.peacocktv.com/watch-online/tv/ladies-of-london/5120482410719617112"],
  "Southern Hospitality":["SH","#34d399","#047857","glass","https://www.peacocktv.com/watch-online/tv/southern-hospitality/6614170128718896112"],
  "Below Deck Down Under":["BDU","#3fd4ff","#0b5c9e","anchor","https://www.peacocktv.com/watch-online/tv/below-deck-down-under/7603676207447885112/seasons/4"],
  "The Valley: Persian Style":["VPS","#fb923c","#c2410c","tv","https://www.peacocktv.com/watch-online/tv/the-valley-persian-style/8097961647034034112"],
  "RHOSLC":["SLC","#5ab0ff","#1f31a8","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-salt-lake-city/8062314053813296112"],
  "RHONY":["NY","#ff2d55","#a3001f","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-new-york-city/8023583101930400112/seasons/16"],
  "RHOP":["POT","#ff8ccc","#c2307a","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-potomac/8038056425113847112/seasons/11"],
  "RHONJ":["NJ","#ffa451","#6d2fb0","crown","https://www.peacocktv.com/watch-online/tv/the-real-housewives-of-new-jersey/6825525389042832112"],
  "Below Deck":["BD","#ffc53d","#1e3a8a","anchor","https://www.peacocktv.com/stream-tv/below-deck"],
  "Southern Charm":["SC","#b4e06c","#3d6b1d","glass","https://www.peacocktv.com/watch-online/tv/southern-charm/8058982241606202112/seasons/12"],
  "Vanderpump Rules: Lisa Las Vegas":["LV","#fbbf24","#b45309","star",""],
  "Small Town Trouble: Texas":["STT","#ff7a3d","#8c2a12","star","https://www.peacocktv.com/watch-online/tv/small-town-trouble-texas/4841643441022334112"],
  "Married at First Sight":["MAF","#ff6b8b","#a10f40","star","https://www.peacocktv.com/watch-online/tv/married-at-first-sight/6006834051739908112/seasons/20"],
  "Wife Swap: RH Edition":["WS","#ffe14a","#ff8a00","house","https://www.peacocktv.com/watch-online/tv/wife-swap-the-real-housewives-edition/6519457940197890112"]
};
const FULL = { /* official full show names, used on the page for search. Every show used anywhere needs one (check.js enforces it). */
  "RHOSLC":"The Real Housewives of Salt Lake City",
  "RHONY":"The Real Housewives of New York City",
  "RHOP":"The Real Housewives of Potomac",
  "RHONJ":"The Real Housewives of New Jersey",
  "RHOBH":"The Real Housewives of Beverly Hills",
  "RHOA":"The Real Housewives of Atlanta",
  "RHORI":"The Real Housewives of Rhode Island",
  "RHUGT: Roaring 20th":"The Real Housewives Ultimate Girls Trip: Roaring 20th",
  "Wife Swap: RH Edition":"Wife Swap: The Real Housewives Edition",
  "WWHL":"Watch What Happens Live with Andy Cohen",
  "Married at First Sight":"Married at First Sight",
  "Below Deck":"Below Deck",
  "Below Deck Down Under":"Below Deck Down Under",
  "Southern Charm":"Southern Charm",
  "Southern Hospitality":"Southern Hospitality",
  "Small Town Trouble: Texas":"Small Town Trouble: Texas",
  "Still Flipping Out":"Still Flipping Out",
  "Next Gen NYC":"Next Gen NYC",
  "Ladies of London: The New Reign":"Ladies of London: The New Reign",
  "The Valley: Persian Style":"The Valley: Persian Style",
  "Vanderpump Rules: Lisa Las Vegas":"Vanderpump Rules: Lisa Las Vegas"
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
const WWHL = { /* Watch What Happens Live. Bravo moves its airtime night to night, sometimes past midnight, so there is NO default time:
   the page only shows nights listed in "airings". */
  peacock:"https://www.peacocktv.com/watch-online/tv/watch-what-happens-live-with-andy-cohen/8809822949267363112",
  off:[["2026-11-22","2026-11-28","Off for Thanksgiving week \u00b7 no new episodes listed","rep"]],
  airings:{ /* viewing night "YYYY-MM-DD" -> [episode no., actual Bravo airtime "YYYY-MM-DD HH:MM" ET (can be after midnight, i.e. the next date), st, runtime minutes (optional; default 30)].
     Copy each airtime from bravotv.com/schedule/watch-what-happens-live (rows marked NETWORK PREMIERE). Peacock: next morning, 6 AM. */
    "2026-11-29":[192,"2026-11-30 03:00","ok"],"2026-11-30":[193,"2026-11-30 21:00","ok"],"2026-12-01":[194,"2026-12-02 03:30","ok"],
    "2026-12-02":[195,"2026-12-02 22:00","ok"],"2026-12-03":[196,"2026-12-04 03:30","ok"],"2026-12-06":[197,"2026-12-07 03:31","ok"],
    "2026-12-07":[198,"2026-12-08 03:30","ok"],"2026-12-08":[199,"2026-12-09 03:30","ok"],"2026-12-09":[200,"2026-12-10 03:00","ok"]
  },
  guests:{ /* viewing night "YYYY-MM-DD":["Guest & Guest","st"]. Guests are confirmed separately from airtimes. */
    "2026-11-19":["Jennifer Lawrence & Josh Hutcherson","ok"]
  }
};
const HISTORY = [ /* past premieres, newest first: date, show, season, night/time, source */
  ["2026-11-12","Southern Charm","S12","Thu 9:00 PM"],
  ["2026-10-20","Vanderpump Rules: Lisa Las Vegas","Limited series (3 episodes)","Tue 9:00 PM \u00b7 finale Wed"],
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
const EPISODES = [ /* date, time, show, "S E · title · note", status, synopsis (optional), Peacock: early drop date, or "streaming" if already on Peacock before the Bravo airing, or null (= next day 6 AM), Peacock episode URL (optional), runtime in minutes from Bravo's grid (optional; default 60) */
  ["2026-11-19","21:00","Southern Charm","S12 E2 \u00b7 Battle of Whits","ok","Madison jumps to Salley's defense and throws a get-together where Venita lets a secret slip."],
  ["2026-11-22","20:00","RHOP","S11 E7 \u00b7 Cold Beach, Hot Gossip","ok","The Rehoboth trip wraps with a drag show and one last blowup."],
  ["2026-11-23","20:00","Below Deck","S13 E7 \u00b7 Who's the Boss?","ok","A shake-up on the deck team makes for an emotional night, while Chef Moe rides high."],
  ["2026-11-25","20:00","RHOSLC","S7 E11 \u00b7 Maui Mystery, Solved","ok","The group hunts for whoever has been leaking info to Mary, Meredith lands a big DJ gig, and the Maui trip exposes the culprit."],
  ["2026-11-25","21:00","Small Town Trouble: Texas","S1 E2 \u00b7 Double Date and Double Standards","ok","A night at a lesbian bar stirs up jealousy for Aaryn and Annari, Hailey weighs a career change, and old feuds cool off at Honky Tonk Thursday."],
  ["2026-11-26","20:00","Southern Charm","S12 E3 \u00b7 No Bunny Business \u00b7 an hour early for Thanksgiving","ok","Allie calls off her date with Whitner, who suspects Salley had a hand in it, and Austen confronts Shep at Patricia's Easter brunch."],
  ["2026-11-29","20:00","RHOP","S11 E8 \u00b7 Surprise Surprise","ok","",null,"",90],
  ["2026-11-30","20:00","Below Deck","S13 E8 \u00b7 Shape Up or Ship Out","ok",""],
  ["2026-12-01","20:00","RHONY","S16 E12 \u00b7 Echoes of the Past \u00b7 back after a Thanksgiving-week break","ok","",null,"",90],
  ["2026-12-02","20:00","RHOSLC","S7 E12 \u00b7 Lei Down the Law","ok",""],
  ["2026-12-02","21:00","Small Town Trouble: Texas","S1 E3 \u00b7 All Hail the Corn Queen","ok",""],
  ["2026-12-03","20:00","Southern Charm","S12 E4 \u00b7 A Historic Divide \u00b7 8:00 PM again","ok","",null,"",90],
  ["2026-12-06","20:00","RHOP","S11 E9 \u00b7 Sorori-Tea! Fun","ok","",null,"",90],
  ["2026-12-07","20:00","Below Deck","S13 E9 \u00b7 Smoke and Mirrors","ok","",null,"",90],
  ["2026-12-08","20:00","RHONY","S16 E13 \u00b7 Good Vibes Only","ok","",null,"",90],
  ["2026-12-09","20:00","RHOSLC","S7 E13 \u00b7 Hostess With the Roastest","ok",""],
  ["2026-12-09","21:00","Small Town Trouble: Texas","S1 E4 \u00b7 The Forbidden Apple","ok","",null,"",90],
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
  {date:"2027-01-19",time:"",show:"RHONJ",title:"The Real Housewives of New Jersey S15",when:"Tuesday · time not announced yet",st:"ok",
   eps:[["Cast","Teresa, Melissa and Dolores, plus five new Housewives"]]}
];
const EVENTS = [ /* ISO date or text, name, detail, st, source URL */
  ["2026-12-14","Watch Party by Bravo, NYC","VERSA NYC \u00b7 advance screening of a new RHOSLC S7 episode, surprise Bravolebs and games. Tickets through Bravo.","ok","https://www.bravotv.com/the-daily-dish/rhoslc-season-7-episode-watch-party-date-location-tickets-details"],
  ["Fall 2027","BravoCon 2027","Returns in fall 2027; dates and city not announced","ok","https://www.bravotv.com/index%2ephp/the-daily-dish/andy-cohen-teases-bravocon-2027-date-details"]
];
const AFTERSHOWS = [ /* on:true + time = shown in Next 7 nights on every night that show has a new episode; pk:true = also lands on Peacock the next morning at 6 AM (Bravo says so) */
  {show:"RHONY",title:"RHONY After Show S16",on:true,time:"21:00",pk:true,url:"https://www.bravotv.com/the-daily-dish/how-to-watch-rhony-after-show-season-16",when:"Tuesdays, 9:00 PM",where:"BravoTV.com + YouTube; Peacock Wed 6:00 AM",next:"Dec 1, after RHONY E12",note:"Cast trios and solo sit-downs breaking down each episode. Started after Episode 5.",st:"ok"},
  {show:"Southern Charm",title:"Southern Charm After Show S12",on:false,when:"Not announced",where:"Last season: BravoTV.com + YouTube, Wed 10:00 PM",next:"Watch for a mid-season launch",note:"Season 11's After Show started mid-season (Jan. 7), so Season 12's may follow the same pattern.",st:"rep"},
  {show:"RHOSLC",title:"RHOSLC After Show S7",on:false,when:"No Season 7 After Show announced",where:"Past seasons: BravoTV.com + YouTube",next:"—",note:"Bravo hasn't listed one for this season.",st:"chk"}
];
const GRID = [
  ["Sun",[["20:00","RHOP","S11",""]]],
  ["Mon",[["20:00","Below Deck","S13",""]]],
  ["Tue",[["20:00","RHONY","S16","RHONJ premieres Jan 19 \u00b7 time TBA"],["21:00","RHONY","After Show","Online only"]]],
  ["Wed",[["20:00","RHOSLC","S7",""],["21:00","Small Town Trouble: Texas","S1","Wife Swap S2 from Dec 30"]]],
  ["Thu",[["20:00","Southern Charm","S12","8:00 PM on Bravo's listings through Dec 3"]]],
  ["Fri",[]],
  ["Sat",[]]
];
const CHANGES = [ /* logged, change (may use <b>), status, source URL */
  ["Nov 26","<b>WWHL</b> returns Sun Nov 29. Bravo's airtimes move night to night: Mon 9:00 PM, Wed 10:00 PM, other nights after midnight","ok","https://www.bravotv.com/schedule/watch-what-happens-live"],
  ["Nov 26","<b>Southern Charm</b> stays at 8:00 PM on Dec 3 (Bravo listing), not back to 9:00 PM","ok","https://www.bravotv.com/schedule"],
  ["Nov 25","<b>Southern Charm</b> Ep. 3 moves an hour early to 8:00 PM on Thanksgiving","ok","https://www.bravotv.com/schedule"],
  ["Nov 25","<b>RHONY</b> skipped Nov 24 for Thanksgiving week; returns Dec 1 with Ep. 12 and its After Show","li","https://whenitsout.com/tv/channel/bravo/"],
  ["Nov 25","<b>WWHL</b> off for Thanksgiving week (Nov 22\u201328); last new episode listed Nov 19","rep","https://www.peacocktv.com/watch-online/tv/watch-what-happens-live-with-andy-cohen/8809822949267363112"],
  ["Nov 20","<b>Wife Swap S2</b> takes Wed 9:00 PM from Dec 30, Small Town Trouble's slot. STT's end date isn't announced","ok","https://www.bravotv.com/the-daily-dish/wife-swap-real-housewives-edition-season-2-everything-to-know"],
  ["Nov 16","<b>RHONJ S15</b> pushed from December to Tue Jan 19","ok","https://www.bravotv.com/the-daily-dish/when-does-rhonj-season-15-premiere-air-date-revealed"],
  ["Nov","<b>Still Flipping Out</b> S1 ended; Mon 9:00 PM is open","li","https://whenitsout.com/tv/channel/bravo/"]
];
const RADAR = [ /* item, detail, status, source URL, last verified (YYYY-MM-DD). Remove an item the day it premieres and add it to HISTORY. check.js fails the build if any item is unverified for 7+ days. */
  ["RHOBH S16","Expected February, after RHOSLC; Leah Remini and Tracy Tutor reported joining","rep","https://entertainmentnow.com/real-housewives/bravo-2027-real-housewives-premiere-schedule/","2026-11-27"],
  ["RHOA S18","Expected March, after RHOP","rep","https://entertainmentnow.com/real-housewives/bravo-2027-real-housewives-premiere-schedule/","2026-11-27"],
  ["RHORI S2","Renewed in May; expected April","rep","https://entertainmentnow.com/real-housewives/bravo-2027-real-housewives-premiere-schedule/","2026-11-27"],
  ["Summer House S11","Filmed this summer, with a Below Deck Med crossover; 2027, no date yet","ok","https://www.bravotv.com/the-daily-dish/below-deck-mediterranean-summer-house-crossover-preview-video-details","2026-11-27"],
  ["Married to Medicine S13","Renewed at May upfronts; no date yet","ok","https://www.nbcuniversal.com/article/bravo-unveils-new-series-vanderpump-rules-lisa-las-vegas-and-secrets-lies-texas-wives-alongside","2026-11-27"],
  ["Holiday weeks","Skips around Christmas and New Year's not announced yet","chk","https://www.bravotv.com/the-daily-dish/bravo-winter-2026-schedule-full-lineup","2026-11-27"]
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