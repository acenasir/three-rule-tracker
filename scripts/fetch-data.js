// Downloads daily bars from Yahoo Finance into data/bars/<SYMBOL>.json for the static site.
// Keeps the previous file when a symbol fails; exits non-zero only if every symbol fails.
// Usage: node scripts/fetch-data.js [range=10y]
const fs = require("fs"), path = require("path");
const { SYMBOLS } = require("./symbols.js");

const RANGE = process.argv[2] || "10y";
const dir = path.join(__dirname, "..", "data", "bars");
const fileFor = (sym) => path.join(dir, sym.replace(/[^A-Z0-9.-]/g, "_") + ".json");

async function fetchBars(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=${RANGE}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (three-rule-tracker)" } });
    if (r.ok) {
      const result = (await r.json()).chart.result[0], q = result.indicators.quote[0], m = result.meta, bars = [];
      result.timestamp.forEach((t, i) => {
        if ([q.open[i], q.high[i], q.low[i], q.close[i]].some(v => v == null)) return;
        bars.push([t, q.open[i], q.high[i], q.low[i], q.close[i]]);
      });
      return {
        meta: { symbol: m.symbol, name: m.shortName || m.longName || m.symbol, type: m.instrumentType, currency: m.currency, price: m.regularMarketPrice, time: m.regularMarketTime * 1000 },
        bars, fetchedAt: Date.now(),
      };
    }
    if (attempt < 3) await new Promise(res => setTimeout(res, 2000 * attempt));
    else throw new Error(`HTTP ${r.status}`);
  }
}

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  let ok = 0;
  for (const [sym] of SYMBOLS) {
    try {
      const d = await fetchBars(sym);
      fs.writeFileSync(fileFor(sym), JSON.stringify(d));
      ok++; console.log(`${sym.padEnd(8)} ${d.bars.length} bars, last close ${d.bars.at(-1)[4]}`);
    } catch (e) {
      console.warn(`${sym.padEnd(8)} failed (${e.message})${fs.existsSync(fileFor(sym)) ? ", keeping previous file" : ""}`);
    }
  }
  if (!ok) { console.error("No symbols fetched."); process.exit(1); }
})();
