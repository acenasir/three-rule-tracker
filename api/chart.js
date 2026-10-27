// GET /api/chart?symbol=ES=F&range=10y — daily OHLC from Yahoo Finance, trimmed to what the tracker needs.
const RANGES = new Set(["1y", "2y", "5y", "10y", "max"]);

module.exports = async (req, res) => {
  const symbol = String(req.query.symbol || "").toUpperCase();
  const range = String(req.query.range || "10y");
  if (!/^[A-Z0-9^=.\-]{1,15}$/.test(symbol)) return res.status(400).json({ error: "Symbols use letters, digits and = . - ^ only, for example ES=F or BRK-B." });
  if (!RANGES.has(range)) return res.status(400).json({ error: "range must be one of " + [...RANGES].join(", ") });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (three-rule-tracker)" } });
    const j = await r.json().catch(() => null);
    const result = j && j.chart && j.chart.result && j.chart.result[0];
    if (!result) {
      const msg = (j && j.chart && j.chart.error && j.chart.error.description) || `Yahoo Finance returned HTTP ${r.status}`;
      return res.status(r.status === 404 || (j && j.chart && j.chart.error) ? 404 : 502).json({ error: msg });
    }
    const q = result.indicators.quote[0], m = result.meta, bars = [];
    result.timestamp.forEach((t, i) => {
      if ([q.open[i], q.high[i], q.low[i], q.close[i]].some(v => v == null)) return;
      bars.push([t, q.open[i], q.high[i], q.low[i], q.close[i]]);
    });
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({
      meta: { symbol: m.symbol, name: m.shortName || m.longName || m.symbol, type: m.instrumentType, currency: m.currency, price: m.regularMarketPrice, time: m.regularMarketTime * 1000 },
      bars, fetchedAt: Date.now(),
    });
  } catch (e) {
    return res.status(502).json({ error: "Could not reach Yahoo Finance: " + e.message });
  }
};
