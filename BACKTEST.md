# Backtest: David Paul's three rules

Generated 2026-11-14 from Yahoo Finance daily bars (range 10y). Round-trip cost 5 bps per trade. Entries at the signal close, exits per the rules below. Futures use Yahoo's continuous front-month series, which has roll gaps.

## Rules as tested

| Rule | Buy side | Sell side |
|---|---|---|
| 1. Trade that feels difficult | RSI(2) ≤ 15 | RSI(2) ≥ 85 |
| 2. Short-term trend against long-term trend | close > 200-day SMA and < 10-day SMA | close < 200-day SMA and > 10-day SMA |
| 3. Where the crowd's stops are | low traded below prior 10-day low within last 3 bars | high traded above prior 10-day high within last 3 bars |

Entry when all three agree. Exit on close back across the 10-day SMA, a stop 0.25 ATR beyond the swept extreme, or 15 bars.

## Summary

- 1495 trades across 13 instruments. Pooled win rate +32%, average trade +0.03% after costs.
- Long side: 1010 trades, win +34%, average +0.11%. Short side: 485 trades, win +26%, average -0.15%.
- Beat buy and hold on CAGR in 1/13, on Sharpe in 2/13, on max drawdown in 13/13.
- Default parameters rank 4 of 27 in the sensitivity grid by median Sharpe.

## Per instrument

| Symbol | Name | Years | Trades | Win | Avg | PF | CAGR | Max DD | Sharpe | Exposure | B&H CAGR | B&H DD | B&H Sharpe |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| ES=F | S&P 500 E-mini | 9.2 | 107 | +24% | -0.22% | 0.70 | -2.6% | -28.3% | -0.50 | +10% | +13.0% | -34.4% | 0.75 |
| NQ=F | Nasdaq 100 E-mini | 9.2 | 118 | +33% | +0.15% | 1.19 | +1.6% | -29.2% | 0.27 | +12% | +18.4% | -35.3% | 0.83 |
| YM=F | Dow E-mini | 9.2 | 110 | +26% | -0.19% | 0.72 | -2.4% | -28.2% | -0.50 | +10% | +10.0% | -37.3% | 0.61 |
| RTY=F | Russell 2000 E-mini | 8.6 | 107 | +21% | -0.31% | 0.67 | -4.0% | -32.6% | -0.62 | +11% | +7.1% | -42.6% | 0.40 |
| GC=F | Gold | 9.2 | 104 | +37% | +0.22% | 1.40 | +2.3% | -10.8% | 0.42 | +12% | +12.6% | -26.9% | 0.77 |
| CL=F | Crude oil | 9.2 | 113 | +33% | +0.12% | 1.08 | +0.4% | -37.5% | 0.09 | +12% | +7.4% | -149.2% | -0.19 |
| ZN=F | 10-year T-note | 9.2 | 93 | +35% | -0.00% | 0.99 | -0.0% | -4.8% | -0.01 | +10% | -2.0% | -25.7% | -0.34 |
| SPY | SPDR S&P 500 | 9.2 | 117 | +32% | +0.08% | 1.13 | +0.9% | -18.0% | 0.19 | +11% | +12.9% | -34.1% | 0.75 |
| QQQ | Invesco QQQ | 9.2 | 120 | +37% | +0.22% | 1.28 | +2.6% | -25.1% | 0.39 | +12% | +18.3% | -35.6% | 0.84 |
| AAPL | Apple | 9.2 | 113 | +31% | -0.14% | 0.88 | -2.2% | -36.6% | -0.12 | +12% | +26.5% | -38.7% | 0.94 |
| MSFT | Microsoft | 9.2 | 104 | +39% | +0.31% | 1.32 | +3.1% | -19.0% | 0.34 | +10% | +23.7% | -37.6% | 0.88 |
| NVDA | Nvidia | 9.2 | 114 | +34% | +0.29% | 1.17 | +2.2% | -38.7% | 0.21 | +12% | +49.0% | -66.4% | 1.05 |
| BTC-USD | Bitcoin | 9.5 | 175 | +30% | -0.12% | 0.93 | -3.9% | -39.7% | -0.10 | +14% | +42.2% | -83.4% | 0.72 |

## Parameter sensitivity (top 10 and default)

RSI threshold (buy ≤ x, sell ≥ 100−x), swing lookback for stop zones, short-term SMA length. Median across instruments.

| Rank | RSI | Swing | Short SMA | Trades | Median Sharpe | Median PF | Instruments with CAGR > 0 |
|--:|--:|--:|--:|--:|--:|--:|--:|
| 1 | 25 | 5 | 10 | 2747 | 0.23 | 1.14 | 9/13 |
| 2 | 25 | 5 | 5 | 2901 | 0.17 | 1.09 | 9/13 |
| 3 | 15 | 10 | 5 | 1535 | 0.14 | 1.11 | 7/13 |
| 4 (default) | 15 | 10 | 10 | 1495 | 0.09 | 1.08 | 7/13 |
| 5 | 15 | 5 | 5 | 2266 | 0.09 | 1.06 | 8/13 |
| 6 | 25 | 10 | 5 | 1871 | 0.09 | 1.06 | 9/13 |
| 7 | 15 | 5 | 10 | 2198 | 0.07 | 1.04 | 7/13 |
| 8 | 15 | 20 | 5 | 822 | 0.07 | 1.08 | 7/13 |
| 9 | 25 | 20 | 5 | 1014 | 0.05 | 1.05 | 7/13 |
| 10 | 25 | 5 | 20 | 2134 | 0.04 | 1.03 | 5/13 |

## Caveats

- Entering at the same close that completes the signal is slightly optimistic. Next-open entry would be the conservative version.
- Futures returns are on price only, with no margin or roll adjustment.
- CL=F buy-and-hold drawdown is below −100% because the continuous series traded at negative prices (crude oil, April 2020). Treat that row's B&H figures as broken.
- The thresholds are an interpretation of the rules in the source video, not the speaker's published parameters.
- Study tool only. Not investment advice.
