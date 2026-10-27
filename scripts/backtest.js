// Backtests the three rules on 10 years of daily Yahoo Finance bars and writes BACKTEST.md + data/backtest.json.
// Usage: node scripts/backtest.js [range=10y] [costBps=5]
const fs = require("fs"), path = require("path");
const { parseYahoo, analyze, summarize } = require("../engine.js");

const RANGE = process.argv[2] || "10y", COST = +(process.argv[3] || 5);
const { SYMBOLS } = require("./symbols.js");
const GRID = { rsiLo: [10, 15, 25], swing: [5, 10, 20], st: [5, 10, 20] };

// Prefers the bars scripts/fetch-data.js already saved; falls back to Yahoo directly.
async function load(sym) {
  const local = path.join(__dirname, "..", "data", "bars", sym.replace(/[^A-Z0-9.-]/g, "_") + ".json");
  if (fs.existsSync(local)) {
    const j = JSON.parse(fs.readFileSync(local, "utf8"));
    return { meta: j.meta, bars: j.bars.map(a => ({ t: a[0] * 1000, o: a[1], h: a[2], l: a[3], c: a[4] })) };
  }
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=${RANGE}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${sym}: HTTP ${res.status}`);
  return parseYahoo(await res.json());
}
const pct = (v, d = 1) => v == null ? "—" : (v >= 0 ? "+" : "") + (v * 100).toFixed(d) + "%";
const num = (v, d = 2) => v == null ? "—" : v.toFixed(d);

(async () => {
  const out = [], grid = [];
  for (const [sym, name, kind] of SYMBOLS) {
    const d = await load(sym);
    const S = summarize(analyze(d.bars), { costBps: COST });
    const from = new Date(d.bars[S.first].t).toISOString().slice(0, 10), to = new Date(d.bars.at(-1).t).toISOString().slice(0, 10);
    out.push({ sym, name, kind, from, to, years: S.years, n: S.n, winRate: S.winRate, avg: S.avg, avgWin: S.avgWin, avgLoss: S.avgLoss, pf: S.pf,
      total: S.total, cagr: S.cagr, maxDD: S.maxDD, sharpe: S.sharpe, exposure: S.exposure, avgBars: S.avgBars,
      bhTotal: S.bhTotal, bhCagr: S.bhCagr, bhDD: S.bhDD, bhSharpe: S.bhSharpe, long: S.long, short: S.short });
    for (const rsiLo of GRID.rsiLo) for (const swing of GRID.swing) for (const st of GRID.st) {
      const g = summarize(analyze(d.bars, { rsiLo, rsiHi: 100 - rsiLo, swing, st }), { costBps: COST });
      grid.push({ sym, rsiLo, swing, st, n: g.n, pf: g.pf, cagr: g.cagr, sharpe: g.sharpe, maxDD: g.maxDD });
    }
    console.log(`${sym.padEnd(8)} ${String(S.n).padStart(3)} trades  win ${pct(S.winRate, 0).padStart(5)}  PF ${num(S.pf).padStart(5)}  CAGR ${pct(S.cagr).padStart(7)}  DD ${pct(S.maxDD).padStart(7)}  Sharpe ${num(S.sharpe).padStart(5)} | B&H CAGR ${pct(S.bhCagr).padStart(7)} DD ${pct(S.bhDD).padStart(7)} Sharpe ${num(S.bhSharpe)}`);
  }

  // Pooled stats across all symbols (equal weight per trade).
  const all = out.reduce((a, r) => a + r.n, 0);
  const pooledWin = out.reduce((a, r) => a + r.winRate * r.n, 0) / all, pooledAvg = out.reduce((a, r) => a + r.avg * r.n, 0) / all;
  const beatSharpe = out.filter(r => r.sharpe > r.bhSharpe).length, beatDD = out.filter(r => r.maxDD > r.bhDD).length, beatCagr = out.filter(r => r.cagr > r.bhCagr).length;
  const L = out.reduce((a, r) => ({ n: a.n + r.long.n, w: a.w + (r.long.win || 0) * r.long.n, s: a.s + (r.long.avg || 0) * r.long.n }), { n: 0, w: 0, s: 0 });
  const Sh = out.reduce((a, r) => ({ n: a.n + r.short.n, w: a.w + (r.short.win || 0) * r.short.n, s: a.s + (r.short.avg || 0) * r.short.n }), { n: 0, w: 0, s: 0 });

  // Sensitivity: median Sharpe across symbols for each parameter set.
  const keys = [...new Set(grid.map(g => `${g.rsiLo}|${g.swing}|${g.st}`))];
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const sens = keys.map(k => { const g = grid.filter(x => `${x.rsiLo}|${x.swing}|${x.st}` === k); const [rsiLo, swing, st] = k.split("|").map(Number);
    return { rsiLo, swing, st, trades: g.reduce((a, x) => a + x.n, 0), medSharpe: med(g.map(x => x.sharpe)), medPF: med(g.map(x => x.pf ?? 0)), positive: g.filter(x => x.cagr > 0).length }; })
    .sort((a, b) => b.medSharpe - a.medSharpe);
  const def = sens.find(s => s.rsiLo === 15 && s.swing === 10 && s.st === 10), rank = sens.indexOf(def) + 1;

  const meta = { generated: new Date().toISOString(), range: RANGE, costBps: COST, symbols: out.length,
    pooled: { trades: all, winRate: pooledWin, avg: pooledAvg, long: { n: L.n, win: L.w / L.n, avg: L.s / L.n }, short: { n: Sh.n, win: Sh.n ? Sh.w / Sh.n : null, avg: Sh.n ? Sh.s / Sh.n : null } },
    beat: { sharpe: beatSharpe, maxDD: beatDD, cagr: beatCagr }, sensitivity: sens, defaultRank: rank };
  fs.writeFileSync(path.join(__dirname, "..", "data", "backtest.json"), JSON.stringify({ meta, results: out }));

  const md = [];
  md.push(`# Backtest: David Paul's three rules`, ``,
    `Generated ${meta.generated.slice(0, 10)} from Yahoo Finance daily bars (range ${RANGE}). Round-trip cost ${COST} bps per trade. Entries at the signal close, exits per the rules below. Futures use Yahoo's continuous front-month series, which has roll gaps.`, ``,
    `## Rules as tested`, ``,
    `| Rule | Buy side | Sell side |`, `|---|---|---|`,
    `| 1. Trade that feels difficult | RSI(2) ≤ 15 | RSI(2) ≥ 85 |`,
    `| 2. Short-term trend against long-term trend | close > 200-day SMA and < 10-day SMA | close < 200-day SMA and > 10-day SMA |`,
    `| 3. Where the crowd's stops are | low traded below prior 10-day low within last 3 bars | high traded above prior 10-day high within last 3 bars |`, ``,
    `Entry when all three agree. Exit on close back across the 10-day SMA, a stop 0.25 ATR beyond the swept extreme, or 15 bars.`, ``,
    `## Summary`, ``,
    `- ${all} trades across ${out.length} instruments. Pooled win rate ${pct(pooledWin, 0)}, average trade ${pct(pooledAvg, 2)} after costs.`,
    `- Long side: ${L.n} trades, win ${pct(L.w / L.n, 0)}, average ${pct(L.s / L.n, 2)}. Short side: ${Sh.n} trades, win ${Sh.n ? pct(Sh.w / Sh.n, 0) : "—"}, average ${Sh.n ? pct(Sh.s / Sh.n, 2) : "—"}.`,
    `- Beat buy and hold on CAGR in ${beatCagr}/${out.length}, on Sharpe in ${beatSharpe}/${out.length}, on max drawdown in ${beatDD}/${out.length}.`,
    `- Default parameters rank ${rank} of ${sens.length} in the sensitivity grid by median Sharpe.`, ``,
    `## Per instrument`, ``,
    `| Symbol | Name | Years | Trades | Win | Avg | PF | CAGR | Max DD | Sharpe | Exposure | B&H CAGR | B&H DD | B&H Sharpe |`,
    `|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|`,
    ...out.map(r => `| ${r.sym} | ${r.name} | ${r.years.toFixed(1)} | ${r.n} | ${pct(r.winRate, 0)} | ${pct(r.avg, 2)} | ${num(r.pf)} | ${pct(r.cagr)} | ${pct(r.maxDD)} | ${num(r.sharpe)} | ${pct(r.exposure, 0)} | ${pct(r.bhCagr)} | ${pct(r.bhDD)} | ${num(r.bhSharpe)} |`), ``,
    `## Parameter sensitivity (top 10 and default)`, ``,
    `RSI threshold (buy ≤ x, sell ≥ 100−x), swing lookback for stop zones, short-term SMA length. Median across instruments.`, ``,
    `| Rank | RSI | Swing | Short SMA | Trades | Median Sharpe | Median PF | Instruments with CAGR > 0 |`, `|--:|--:|--:|--:|--:|--:|--:|--:|`,
    ...sens.slice(0, 10).concat(rank > 10 ? [def] : []).map(s => `| ${sens.indexOf(s) + 1}${s === def ? " (default)" : ""} | ${s.rsiLo} | ${s.swing} | ${s.st} | ${s.trades} | ${num(s.medSharpe)} | ${num(s.medPF)} | ${s.positive}/${out.length} |`), ``,
    `## Caveats`, ``,
    `- Entering at the same close that completes the signal is slightly optimistic. Next-open entry would be the conservative version.`,
    `- Futures returns are on price only, with no margin or roll adjustment.`,
    ...out.filter(r => r.bhDD < -1).map(r => `- ${r.sym} buy-and-hold drawdown is below −100% because the continuous series traded at negative prices (crude oil, April 2020). Treat that row's B&H figures as broken.`),
    `- The thresholds are an interpretation of the rules in the source video, not the speaker's published parameters.`,
    `- Study tool only. Not investment advice.`, ``);
  fs.writeFileSync(path.join(__dirname, "..", "BACKTEST.md"), md.join("\n"));
  console.log(`\npooled ${all} trades win ${pct(pooledWin, 0)} avg ${pct(pooledAvg, 2)} | beat B&H: CAGR ${beatCagr}/${out.length} Sharpe ${beatSharpe}/${out.length} DD ${beatDD}/${out.length} | default rank ${rank}/${sens.length}`);
  console.log("top params", sens.slice(0, 3).map(s => `${s.rsiLo}/${s.swing}/${s.st} sh ${num(s.medSharpe)}`).join(", "));
})().catch(e => { console.error(e); process.exit(1); });
