# Backtest: David Paul's three rules

Generated 2026-10-27 from Yahoo Finance daily bars (range 10y). Round-trip cost 5 bps per trade. Entries at the signal close, exits per the rules below. Futures use Yahoo's continuous front-month series, which has roll gaps.

## Rules as tested

| Rule | Buy side | Sell side |
|---|---|---|
| 1. Trade that feels difficult | RSI(2) ≤ 15 | RSI(2) ≥ 85 |
| 2. Short-term trend against long-term trend | close > 200-day SMA and < 10-day SMA | close < 200-day SMA and > 10-day SMA |
| 3. Where the crowd's stops are | low traded below prior 10-day low within last 3 bars | high traded above prior 10-day high within last 3 bars |

Entry when all three agree. Exit on close back across the 10-day SMA, a stop 0.25 ATR beyond the swept extreme, or 15 bars.

## Summary

- 1486 trades across 13 instruments. Pooled win rate +32%, average trade +0.04% after costs.
- Long side: 1003 trades, win +35%, average +0.14%. Short side: 483 trades, win +26%, average -0.16%.
- Beat buy and hold on CAGR in 1/13, on Sharpe in 2/13, on max drawdown in 13/13.
- Default parameters rank 4 of 27 in the sensitivity grid by median Sharpe.

## Per instrument

| Symbol | Name | Years | Trades | Win | Avg | PF | CAGR | Max DD | Sharpe | Exposure | B&H CAGR | B&H DD | B&H Sharpe |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| ES=F | S&P 500 E-mini | 9.2 | 107 | +24% | -0.22% | 0.70 | -2.6% | -28.3% | -0.49 | +10% | +13.3% | -34.4% | 0.76 |
| NQ=F | Nasdaq 100 E-mini | 9.2 | 118 | +34% | +0.17% | 1.22 | +2.0% | -29.2% | 0.32 | +11% | +19.2% | -35.3% | 0.87 |
| YM=F | Dow E-mini | 9.2 | 110 | +26% | -0.19% | 0.72 | -2.3% | -28.2% | -0.49 | +10% | +9.9% | -37.3% | 0.61 |
| RTY=F | Russell 2000 E-mini | 8.5 | 107 | +21% | -0.31% | 0.67 | -4.0% | -32.6% | -0.62 | +11% | +7.3% | -42.6% | 0.41 |
| GC=F | Gold | 9.2 | 104 | +37% | +0.22% | 1.40 | +2.3% | -10.8% | 0.42 | +12% | +13.5% | -24.9% | 0.82 |
| CL=F | Crude oil | 9.2 | 112 | +33% | +0.16% | 1.11 | +0.8% | -37.5% | 0.13 | +12% | +8.4% | -149.2% | -0.18 |
| ZN=F | 10-year T-note | 9.2 | 91 | +35% | -0.01% | 0.96 | -0.1% | -4.8% | -0.05 | +10% | -1.9% | -25.7% | -0.32 |
| SPY | SPDR S&P 500 | 9.2 | 117 | +32% | +0.07% | 1.11 | +0.7% | -18.0% | 0.16 | +11% | +13.2% | -34.1% | 0.76 |
| QQQ | Invesco QQQ | 9.2 | 120 | +37% | +0.23% | 1.29 | +2.7% | -25.1% | 0.41 | +12% | +19.1% | -35.6% | 0.87 |
| AAPL | Apple | 9.2 | 112 | +31% | -0.11% | 0.91 | -1.8% | -36.6% | -0.09 | +12% | +26.4% | -38.7% | 0.94 |
| MSFT | Microsoft | 9.2 | 103 | +40% | +0.33% | 1.34 | +3.3% | -19.0% | 0.36 | +10% | +24.0% | -37.6% | 0.90 |
| NVDA | Nvidia | 9.2 | 113 | +35% | +0.33% | 1.19 | +2.7% | -38.7% | 0.24 | +12% | +53.5% | -66.4% | 1.12 |
| BTC-USD | Bitcoin | 9.5 | 172 | +31% | -0.09% | 0.95 | -3.2% | -39.7% | -0.07 | +13% | +49.4% | -83.4% | 0.78 |

## Parameter sensitivity (top 10 and default)

RSI threshold (buy ≤ x, sell ≥ 100−x), swing lookback for stop zones, short-term SMA length. Median across instruments.

| Rank | RSI | Swing | Short SMA | Trades | Median Sharpe | Median PF | Instruments with CAGR > 0 |
|--:|--:|--:|--:|--:|--:|--:|--:|
| 1 | 25 | 5 | 10 | 2739 | 0.20 | 1.11 | 8/13 |
| 2 | 25 | 5 | 5 | 2892 | 0.17 | 1.09 | 9/13 |
| 3 | 25 | 10 | 5 | 1860 | 0.13 | 1.09 | 8/13 |
| 4 (default) | 15 | 10 | 10 | 1486 | 0.13 | 1.11 | 7/13 |
| 5 | 15 | 5 | 10 | 2191 | 0.11 | 1.06 | 8/13 |
| 6 | 15 | 10 | 5 | 1526 | 0.08 | 1.06 | 9/13 |
| 7 | 15 | 5 | 20 | 1782 | 0.07 | 1.05 | 6/13 |
| 8 | 25 | 5 | 20 | 2122 | 0.07 | 1.05 | 6/13 |
| 9 | 25 | 20 | 5 | 1003 | 0.07 | 1.07 | 7/13 |
| 10 | 15 | 5 | 5 | 2259 | 0.06 | 1.03 | 8/13 |

## Caveats

- Entering at the same close that completes the signal is slightly optimistic. Next-open entry would be the conservative version.
- Futures returns are on price only, with no margin or roll adjustment.
- CL=F buy-and-hold drawdown is below −100% because the continuous series traded at negative prices (crude oil, April 2020). Treat that row's B&H figures as broken.
- The thresholds are an interpretation of the rules in the source video, not the speaker's published parameters.
- Study tool only. Not investment advice.
