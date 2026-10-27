# Three-Rule Tracker

Live tracker and backtest for three trading rules credited to David Paul (MoneyShow, via a coingrams reel):

1. **Take the trade that feels difficult.** Buy after hard down days (RSI(2) ≤ 15), sell after sharp rallies (RSI(2) ≥ 85).
2. **Trade against the short-term trend when it conflicts with the long-term trend.** Buy when close > 200-day SMA and < 10-day SMA; sell when close < 200-day SMA and > 10-day SMA.
3. **Know where most traders put their stops.** Buy after price trades below the prior 10-day low (stops flushed) within the last 3 bars; sell after it trades above the prior 10-day high.

A signal fires when all three agree. Positions exit when the close crosses back over the 10-day SMA, on a stop 0.25 ATR beyond the swept extreme, or after 15 bars.

The thresholds are this project's interpretation of the rules, not the speaker's published parameters. Study tool only, not investment advice.

## What's here

| Path | Purpose |
|---|---|
| `index.html` | The tracker: today's verdict, rule checklist, price chart with rule strip, per-symbol backtest and equity curve |
| `engine.js` | Rule engine and performance stats, shared by the page and the backtest script |
| `api/chart.js` | Vercel function that proxies Yahoo Finance daily bars (`/api/chart?symbol=ES=F&range=10y`), cached 60 s at the edge |
| `scripts/backtest.js` | Runs the 13-instrument backtest and parameter grid, writes `BACKTEST.md` and `data/backtest.json` |
| `scripts/dev.js` | Local server that serves the site and runs the API function |

## Run locally

Needs Node 18 or newer. No dependencies.

```bash
npm run dev
```

Then open http://localhost:3000.

## Re-run the backtest

```bash
npm run backtest
```

Arguments: `node scripts/backtest.js <range> <costBps>`, for example `node scripts/backtest.js max 10`.

See [BACKTEST.md](BACKTEST.md) for the latest results.

## Deploy

Push to `main`; Vercel builds the static site and the `api/` function with no configuration.
