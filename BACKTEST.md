# Backtest: David Paul's three rules

Generated 2026-11-21 from Yahoo Finance daily bars (range 10y). Round-trip cost 5 bps per trade. Entries at the signal close, exits per the rules below. Futures use Yahoo's continuous front-month series, which has roll gaps.

## Rules as tested

| Rule | Buy side | Sell side |
|---|---|---|
| 1. Trade that feels difficult | RSI(2) ≤ 15 | RSI(2) ≥ 85 |
| 2. Short-term trend against long-term trend | close > 200-day SMA and < 10-day SMA | close < 200-day SMA and > 10-day SMA |
| 3. Where the crowd's stops are | low traded below prior 10-day low within last 3 bars | high traded above prior 10-day high within last 3 bars |

Entry when all three agree. Exit on close back across the 10-day SMA, a stop 0.25 ATR beyond the swept extreme, or 15 bars.

## Summary

- 1496 trades across 13 instruments. Pooled win rate +32%, average trade +0.02% after costs.
- Long side: 1012 trades, win +34%, average +0.11%. Short side: 484 trades, win +26%, average -0.15%.
- Beat buy and hold on CAGR in 1/13, on Sharpe in 2/13, on max drawdown in 13/13.
- Default parameters rank 4 of 27 in the sensitivity grid by median Sharpe.

## Per instrument

| Symbol | Name | Years | Trades | Win | Avg | PF | CAGR | Max DD | Sharpe | Exposure | B&H CAGR | B&H DD | B&H Sharpe |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| ES=F | S&P 500 E-mini | 9.2 | 107 | +24% | -0.22% | 0.70 | -2.6% | -28.3% | -0.50 | +10% | +11.9% | -34.4% | 0.69 |
| NQ=F | Nasdaq 100 E-mini | 9.2 | 118 | +33% | +0.15% | 1.19 | +1.6% | -29.2% | 0.27 | +12% | +16.9% | -35.3% | 0.78 |
| YM=F | Dow E-mini | 9.2 | 110 | +26% | -0.19% | 0.72 | -2.4% | -28.3% | -0.50 | +10% | +9.0% | -37.3% | 0.56 |
| RTY=F | Russell 2000 E-mini | 8.6 | 107 | +21% | -0.31% | 0.67 | -4.0% | -32.6% | -0.62 | +11% | +6.1% | -42.6% | 0.36 |
| GC=F | Gold | 9.2 | 104 | +37% | +0.22% | 1.40 | +2.3% | -10.8% | 0.42 | +12% | +11.0% | -33.9% | 0.68 |
| CL=F | Crude oil | 9.2 | 112 | +33% | +0.14% | 1.09 | +0.5% | -37.5% | 0.10 | +12% | +6.0% | -149.2% | -0.20 |
| ZN=F | 10-year T-note | 9.2 | 93 | +35% | -0.00% | 0.99 | -0.0% | -4.8% | -0.01 | +10% | -1.9% | -25.7% | -0.32 |
| SPY | SPDR S&P 500 | 9.2 | 118 | +32% | +0.07% | 1.12 | +0.8% | -18.0% | 0.16 | +11% | +11.8% | -34.1% | 0.69 |
| QQQ | Invesco QQQ | 9.2 | 120 | +37% | +0.22% | 1.28 | +2.6% | -25.1% | 0.39 | +12% | +16.8% | -35.6% | 0.78 |
| AAPL | Apple | 9.2 | 113 | +31% | -0.14% | 0.88 | -2.2% | -36.6% | -0.12 | +12% | +26.2% | -38.7% | 0.93 |
| MSFT | Microsoft | 9.2 | 105 | +39% | +0.28% | 1.28 | +2.8% | -19.0% | 0.31 | +10% | +22.6% | -37.6% | 0.85 |
| NVDA | Nvidia | 9.2 | 114 | +34% | +0.29% | 1.17 | +2.2% | -38.7% | 0.21 | +12% | +44.8% | -66.4% | 0.99 |
| BTC-USD | Bitcoin | 9.5 | 175 | +30% | -0.12% | 0.93 | -3.9% | -39.7% | -0.10 | +14% | +37.8% | -83.4% | 0.68 |

## Parameter sensitivity (top 10 and default)

RSI threshold (buy ≤ x, sell ≥ 100−x), swing lookback for stop zones, short-term SMA length. Median across instruments.

| Rank | RSI | Swing | Short SMA | Trades | Median Sharpe | Median PF | Instruments with CAGR > 0 |
|--:|--:|--:|--:|--:|--:|--:|--:|
| 1 | 25 | 5 | 10 | 2750 | 0.22 | 1.13 | 9/13 |
| 2 | 25 | 5 | 5 | 2903 | 0.17 | 1.09 | 9/13 |
| 3 | 15 | 10 | 5 | 1536 | 0.14 | 1.11 | 7/13 |
| 4 (default) | 15 | 10 | 10 | 1496 | 0.10 | 1.09 | 7/13 |
| 5 | 15 | 5 | 5 | 2268 | 0.09 | 1.06 | 8/13 |
| 6 | 25 | 10 | 5 | 1872 | 0.09 | 1.06 | 9/13 |
| 7 | 15 | 5 | 10 | 2200 | 0.07 | 1.04 | 7/13 |
| 8 | 15 | 20 | 5 | 824 | 0.07 | 1.08 | 7/13 |
| 9 | 25 | 20 | 5 | 1016 | 0.05 | 1.05 | 7/13 |
| 10 | 25 | 5 | 20 | 2137 | 0.04 | 1.03 | 5/13 |

## Caveats

- Entering at the same close that completes the signal is slightly optimistic. Next-open entry would be the conservative version.
- Futures returns are on price only, with no margin or roll adjustment.
- CL=F buy-and-hold drawdown is below −100% because the continuous series traded at negative prices (crude oil, April 2020). Treat that row's B&H figures as broken.
- The thresholds are an interpretation of the rules in the source video, not the speaker's published parameters.
- Study tool only. Not investment advice.
