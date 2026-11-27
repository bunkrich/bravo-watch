// IndexNow ping. Netlify runs a function named "deploy-succeeded" automatically after every
// successful deploy, so each daily update tells Bing (and the other IndexNow search engines)
// which pages changed. ChatGPT search and Copilot lean on Bing's index, so fresh pages get seen sooner.
// The key is public by design: it is also served at /f96a2476a2e3ad8e9d79ae4c5d028d2c.txt to prove we own the site.
// Any failure is logged and ignored, so it can never break a deploy.
const HOST = "clubhousetonight.com";
const KEY = "f96a2476a2e3ad8e9d79ae4c5d028d2c";

exports.handler = async (event) => {
  try {
    let deploy = {};
    try { deploy = JSON.parse(event.body || "{}").payload || {}; } catch (_) {}
    if (deploy.context && deploy.context !== "production") return { statusCode: 200, body: "skipped: " + deploy.context };
    const xml = await (await fetch("https://" + HOST + "/sitemap.xml")).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith("https://" + HOST + "/"));
    urls.push("https://" + HOST + "/tonight.txt", "https://" + HOST + "/llms.txt");
    const r = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: "https://" + HOST + "/" + KEY + ".txt", urlList: urls }),
    });
    console.log("IndexNow", r.status, urls.length + " URLs");
    return { statusCode: 200, body: "IndexNow " + r.status };
  } catch (err) {
    console.log("IndexNow failed:", err && err.message);
    return { statusCode: 200, body: "IndexNow failed" };
  }
};
