# Backtest: David Paul's three rules

Generated 2026-11-28 from Yahoo Finance daily bars (range 10y). Round-trip cost 5 bps per trade. Entries at the signal close, exits per the rules below. Futures use Yahoo's continuous front-month series, which has roll gaps.

## Rules as tested

| Rule | Buy side | Sell side |
|---|---|---|
| 1. Trade that feels difficult | RSI(2) ≤ 15 | RSI(2) ≥ 85 |
| 2. Short-term trend against long-term trend | close > 200-day SMA and < 10-day SMA | close < 200-day SMA and > 10-day SMA |
| 3. Where the crowd's stops are | low traded below prior 10-day low within last 3 bars | high traded above prior 10-day high within last 3 bars |

Entry when all three agree. Exit on close back across the 10-day SMA, a stop 0.25 ATR beyond the swept extreme, or 15 bars.

## Summary

- 1493 trades across 13 instruments. Pooled win rate +32%, average trade +0.03% after costs.
- Long side: 1010 trades, win +35%, average +0.13%. Short side: 483 trades, win +26%, average -0.16%.
- Beat buy and hold on CAGR in 1/13, on Sharpe in 2/13, on max drawdown in 13/13.
- Default parameters rank 6 of 27 in the sensitivity grid by median Sharpe.

## Per instrument

| Symbol | Name | Years | Trades | Win | Avg | PF | CAGR | Max DD | Sharpe | Exposure | B&H CAGR | B&H DD | B&H Sharpe |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| ES=F | S&P 500 E-mini | 9.2 | 107 | +24% | -0.22% | 0.70 | -2.6% | -28.3% | -0.50 | +10% | +12.4% | -34.4% | 0.71 |
| NQ=F | Nasdaq 100 E-mini | 9.2 | 118 | +33% | +0.15% | 1.19 | +1.6% | -29.2% | 0.27 | +12% | +17.6% | -35.3% | 0.80 |
| YM=F | Dow E-mini | 9.2 | 110 | +26% | -0.19% | 0.72 | -2.4% | -28.3% | -0.50 | +10% | +9.4% | -37.3% | 0.58 |
| RTY=F | Russell 2000 E-mini | 8.6 | 107 | +21% | -0.31% | 0.67 | -4.0% | -32.6% | -0.62 | +11% | +6.9% | -42.6% | 0.39 |
| GC=F | Gold | 9.2 | 104 | +37% | +0.22% | 1.40 | +2.3% | -10.8% | 0.42 | +12% | +11.6% | -33.9% | 0.71 |
| CL=F | Crude oil | 9.2 | 111 | +32% | +0.11% | 1.07 | +0.1% | -37.5% | 0.08 | +12% | +5.8% | -149.2% | -0.20 |
| ZN=F | 10-year T-note | 9.2 | 92 | +36% | +0.00% | 1.02 | +0.1% | -4.8% | 0.05 | +11% | -1.9% | -25.7% | -0.31 |
| SPY | SPDR S&P 500 | 9.2 | 118 | +32% | +0.07% | 1.12 | +0.8% | -18.0% | 0.16 | +11% | +12.3% | -34.1% | 0.71 |
| QQQ | Invesco QQQ | 9.2 | 120 | +37% | +0.22% | 1.28 | +2.6% | -25.1% | 0.39 | +12% | +17.6% | -35.6% | 0.80 |
| AAPL | Apple | 9.2 | 112 | +31% | -0.14% | 0.88 | -2.1% | -36.6% | -0.12 | +12% | +26.9% | -38.7% | 0.95 |
| MSFT | Microsoft | 9.2 | 105 | +39% | +0.28% | 1.28 | +2.8% | -19.0% | 0.31 | +10% | +22.7% | -37.6% | 0.85 |
| NVDA | Nvidia | 9.2 | 114 | +34% | +0.29% | 1.17 | +2.2% | -38.7% | 0.21 | +12% | +47.3% | -66.4% | 1.01 |
| BTC-USD | Bitcoin | 9.5 | 175 | +31% | -0.03% | 0.98 | -2.2% | -39.7% | -0.02 | +14% | +40.0% | -83.4% | 0.70 |

## Parameter sensitivity (top 10 and default)

RSI threshold (buy ≤ x, sell ≥ 100−x), swing lookback for stop zones, short-term SMA length. Median across instruments.

| Rank | RSI | Swing | Short SMA | Trades | Median Sharpe | Median PF | Instruments with CAGR > 0 |
|--:|--:|--:|--:|--:|--:|--:|--:|
| 1 | 25 | 5 | 10 | 2747 | 0.22 | 1.13 | 9/13 |
| 2 | 25 | 5 | 5 | 2899 | 0.17 | 1.09 | 9/13 |
| 3 | 15 | 10 | 5 | 1534 | 0.12 | 1.09 | 7/13 |
| 4 | 15 | 20 | 5 | 825 | 0.11 | 1.13 | 7/13 |
| 5 | 15 | 5 | 5 | 2264 | 0.09 | 1.06 | 8/13 |
| 6 (default) | 15 | 10 | 10 | 1493 | 0.08 | 1.07 | 8/13 |
| 7 | 15 | 5 | 10 | 2196 | 0.07 | 1.04 | 7/13 |
| 8 | 25 | 10 | 5 | 1869 | 0.07 | 1.05 | 9/13 |
| 9 | 25 | 10 | 10 | 1775 | 0.06 | 1.04 | 6/13 |
| 10 | 25 | 20 | 5 | 1017 | 0.05 | 1.05 | 7/13 |

## Caveats

- Entering at the same close that completes the signal is slightly optimistic. Next-open entry would be the conservative version.
- Futures returns are on price only, with no margin or roll adjustment.
- CL=F buy-and-hold drawdown is below −100% because the continuous series traded at negative prices (crude oil, April 2020). Treat that row's B&H figures as broken.
- The thresholds are an interpretation of the rules in the source video, not the speaker's published parameters.
- Study tool only. Not investment advice.
