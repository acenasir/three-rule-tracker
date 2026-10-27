// Tracked instruments: [Yahoo symbol, name, kind]. Add a row here to track another symbol.
const SYMBOLS = [
  ["ES=F", "S&P 500 E-mini", "Futures"], ["NQ=F", "Nasdaq 100 E-mini", "Futures"], ["YM=F", "Dow E-mini", "Futures"],
  ["RTY=F", "Russell 2000 E-mini", "Futures"], ["GC=F", "Gold", "Futures"], ["CL=F", "Crude oil", "Futures"],
  ["ZN=F", "10-year T-note", "Futures"], ["SPY", "SPDR S&P 500", "ETF"], ["QQQ", "Invesco QQQ", "ETF"],
  ["AAPL", "Apple", "Stock"], ["MSFT", "Microsoft", "Stock"], ["NVDA", "Nvidia", "Stock"], ["BTC-USD", "Bitcoin", "Crypto"],
];
module.exports = { SYMBOLS };
