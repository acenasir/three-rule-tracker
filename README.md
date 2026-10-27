# Three-Rule Tracker

Tracker and backtest for three trading rules credited to David Paul (MoneyShow, via a coingrams reel):

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
| `scripts/fetch-data.js` | Downloads 10 years of daily bars for each tracked symbol into `data/bars/` |
| `scripts/symbols.js` | The tracked instruments; add a row to track another symbol |
| `.github/workflows/pages.yml` | Every 30 minutes (and on push): fetch bars, rerun the backtest, publish to the `gh-pages` branch |
| `scripts/backtest.js` | Runs the 13-instrument backtest and parameter grid, writes `BACKTEST.md` and `data/backtest.json` |
| `scripts/dev.js` | Local static server |

## Run locally

Needs Node 18 or newer. No dependencies.

```bash
npm run data
```

```bash
npm run dev
```

The first command downloads the data; the second serves the site at http://localhost:3000.

## Re-run the backtest

```bash
npm run backtest
```

Arguments: `node scripts/backtest.js <range> <costBps>`, for example `node scripts/backtest.js max 10`.

See [BACKTEST.md](BACKTEST.md) for the latest results.

## Live site

https://raw.githack.com/acenasir/three-rule-tracker/gh-pages/index.html

raw.githack.com serves the `gh-pages` branch for free with no account. It shows a one-time "Open the page" notice before the site. Add `#SYMBOL` to open a specific instrument, for example `#GC=F`.

## Deploy

The workflow in `.github/workflows/pages.yml` rebuilds the `gh-pages` branch every 30 minutes and on every push to `main`. You can also run it by hand from the Actions tab. Any static host can serve that branch:

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `gh-pages` / root. The site appears at https://acenasir.github.io/three-rule-tracker/.
- **Vercel:** import the repo; with no data files on `main`, the page reads live bars from `api/chart`.

Scheduled runs can lag a few minutes, and GitHub pauses schedules on repos with no activity for 60 days.
