// Three-rule engine (David Paul): difficult trade, short-term vs long-term conflict, stop-loss zones.
function parseYahoo(j) {
  const r = j.chart.result[0], q = r.indicators.quote[0], bars = [];
  r.timestamp.forEach((t, i) => {
    if (q.close[i] == null || q.open[i] == null || q.high[i] == null || q.low[i] == null) return;
    bars.push({ t: t * 1000, o: q.open[i], h: q.high[i], l: q.low[i], c: q.close[i] });
  });
  return { meta: { symbol: r.meta.symbol, name: r.meta.shortName || r.meta.longName || r.meta.symbol, type: r.meta.instrumentType, price: r.meta.regularMarketPrice, time: r.meta.regularMarketTime * 1000, currency: r.meta.currency }, bars };
}

function analyze(bars, P) {
  P = Object.assign({ lt: 200, st: 10, rsiN: 2, rsiLo: 15, rsiHi: 85, swing: 10, sweepWin: 3, atrN: 14, maxHold: 15 }, P || {});
  const n = bars.length, c = bars.map(b => b.c);
  const sma = (N) => { const o = Array(n).fill(null); let s = 0; for (let i = 0; i < n; i++) { s += c[i]; if (i >= N) s -= c[i - N]; if (i >= N - 1) o[i] = s / N; } return o; };
  const smaL = sma(P.lt), smaS = sma(P.st);
  // Wilder RSI
  const rsi = Array(n).fill(null); let ag = 0, al = 0;
  for (let i = 1; i < n; i++) {
    const d = c[i] - c[i - 1], g = Math.max(d, 0), l = Math.max(-d, 0);
    if (i <= P.rsiN) { ag += g / P.rsiN; al += l / P.rsiN; if (i === P.rsiN) rsi[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al); continue; }
    ag = (ag * (P.rsiN - 1) + g) / P.rsiN; al = (al * (P.rsiN - 1) + l) / P.rsiN;
    rsi[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }
  const atr = Array(n).fill(null); let a = 0;
  for (let i = 1; i < n; i++) {
    const tr = Math.max(bars[i].h - bars[i].l, Math.abs(bars[i].h - c[i - 1]), Math.abs(bars[i].l - c[i - 1]));
    a = i <= P.atrN ? a + tr / P.atrN : (a * (P.atrN - 1) + tr) / P.atrN; if (i >= P.atrN) atr[i] = a;
  }
  // Swing levels = where the crowd parks stops: just under the prior N-day low / over the prior N-day high.
  const swLo = Array(n).fill(null), swHi = Array(n).fill(null);
  for (let i = P.swing; i < n; i++) { let lo = Infinity, hi = -Infinity; for (let k = i - P.swing; k < i; k++) { lo = Math.min(lo, bars[k].l); hi = Math.max(hi, bars[k].h); } swLo[i] = lo; swHi[i] = hi; }

  const rows = [];
  for (let i = 0; i < n; i++) {
    const b = bars[i], ok = smaL[i] != null && rsi[i] != null && swLo[i] != null && atr[i] != null;
    const row = { i, t: b.t, o: b.o, h: b.h, l: b.l, c: b.c, smaL: smaL[i], smaS: smaS[i], rsi: rsi[i], atr: atr[i], swLo: swLo[i], swHi: swHi[i], long: null, short: null };
    if (ok) {
      // Rule 3: a stop run happened in the last few bars (price traded through the swing level) and price is back on the right side.
      let sweptLo = null, sweptHi = null;
      for (let k = Math.max(P.swing, i - P.sweepWin + 1); k <= i; k++) {
        if (bars[k].l < swLo[k]) sweptLo = sweptLo == null ? Math.min(bars[k].l, Infinity) : Math.min(sweptLo, bars[k].l);
        if (bars[k].h > swHi[k]) sweptHi = sweptHi == null ? bars[k].h : Math.max(sweptHi, bars[k].h);
      }
      row.long = {
        r1: rsi[i] <= P.rsiLo,                         // feels difficult: buying into a hard selloff
        r2: b.c > smaL[i] && b.c < smaS[i],             // long-term up, short-term down
        r3: sweptLo != null,                            // stops under the swing low just got taken
        sweep: sweptLo,
      };
      row.short = {
        r1: rsi[i] >= P.rsiHi,
        r2: b.c < smaL[i] && b.c > smaS[i],
        r3: sweptHi != null,
        sweep: sweptHi,
      };
      row.long.score = +row.long.r1 + +row.long.r2 + +row.long.r3;
      row.short.score = +row.short.r1 + +row.short.r2 + +row.short.r3;
    }
    rows.push(row);
  }

  // Trade simulation: enter at the close when all 3 rules agree; exit when short-term trend rejoins long-term (close crosses the short SMA),
  // when the stop beyond the swept level is hit, or after maxHold bars.
  const trades = []; let pos = null;
  for (let i = 0; i < n; i++) {
    const r = rows[i];
    if (pos) {
      const held = i - pos.i; let exit = null, why = null;
      if (pos.side === 'long') {
        if (r.l <= pos.stop) { exit = Math.min(r.o, pos.stop); why = 'Stop hit'; }
        else if (r.smaS != null && r.c > r.smaS) { exit = r.c; why = 'Back above ' + P.st + '-day avg'; }
      } else {
        if (r.h >= pos.stop) { exit = Math.max(r.o, pos.stop); why = 'Stop hit'; }
        else if (r.smaS != null && r.c < r.smaS) { exit = r.c; why = 'Back below ' + P.st + '-day avg'; }
      }
      if (!exit && held >= P.maxHold) { exit = r.c; why = 'Time stop (' + P.maxHold + ' bars)'; }
      if (exit) {
        const ret = pos.side === 'long' ? exit / pos.entry - 1 : pos.entry / exit - 1;
        trades.push(Object.assign(pos, { xi: i, xt: r.t, exit, why, ret, bars: held })); pos = null; continue;
      }
    }
    if (!pos && r.long && r.long.score === 3) pos = { side: 'long', i, t: r.t, entry: r.c, stop: r.long.sweep - 0.25 * r.atr };
    else if (!pos && r.short && r.short.score === 3) pos = { side: 'short', i, t: r.t, entry: r.c, stop: r.short.sweep + 0.25 * r.atr };
  }
  return { P, rows, trades, open: pos };
}

// Performance: daily mark-to-market equity (fully invested while in a trade, flat otherwise),
// round-trip cost in basis points charged at exit, compared with buy and hold over the same span.
function summarize(A, opts) {
  const costBps = (opts && opts.costBps) != null ? opts.costBps : 5;
  const rows = A.rows, first = rows.findIndex(r => r.long), n = rows.length;
  const eq = Array(n).fill(null), bh = Array(n).fill(null);
  let base = 1, k = 0; const T = A.trades.concat(A.open ? [Object.assign({}, A.open, { xi: n - 1, exit: rows[n - 1].c, open: true })] : []);
  const net = (t, px) => (t.side === 'long' ? px / t.entry : t.entry / px) * (1 - costBps / 1e4);
  for (let i = first; i < n; i++) {
    bh[i] = rows[i].c / rows[first].c;
    while (k < T.length && T[k].xi < i) { base *= net(T[k], T[k].exit); k++; }
    const t = T[k];
    if (t && t.i < i && i < t.xi) eq[i] = base * net(t, rows[i].c);
    else if (t && i === t.xi) eq[i] = base * net(t, t.exit);
    else eq[i] = base;
  }
  const years = (rows[n - 1].t - rows[first].t) / (365.25 * 864e5);
  const dd = (s) => { let pk = -Infinity, m = 0; for (let i = first; i < n; i++) { pk = Math.max(pk, s[i]); m = Math.min(m, s[i] / pk - 1); } return m; };
  const sharpe = (s) => { const r = []; for (let i = first + 1; i < n; i++) r.push(s[i] / s[i - 1] - 1); const mu = r.reduce((a, b) => a + b, 0) / r.length, sd = Math.sqrt(r.reduce((a, b) => a + (b - mu) ** 2, 0) / r.length); return sd ? mu / sd * Math.sqrt(252) : 0; };
  const closed = A.trades.map(t => Object.assign({}, t, { net: net(t, t.exit) - 1 }));
  const wins = closed.filter(t => t.net > 0), losses = closed.filter(t => t.net <= 0);
  const gw = wins.reduce((a, t) => a + t.net, 0), gl = -losses.reduce((a, t) => a + t.net, 0);
  const side = (s) => { const x = closed.filter(t => t.side === s); return { n: x.length, win: x.length ? x.filter(t => t.net > 0).length / x.length : null, avg: x.length ? x.reduce((a, t) => a + t.net, 0) / x.length : null }; };
  const total = eq[n - 1] - 1, bhTotal = bh[n - 1] - 1;
  return {
    first, years, costBps, eq, bh, trades: closed,
    n: closed.length, winRate: closed.length ? wins.length / closed.length : null,
    avg: closed.length ? closed.reduce((a, t) => a + t.net, 0) / closed.length : null,
    avgWin: wins.length ? gw / wins.length : null, avgLoss: losses.length ? -gl / losses.length : null,
    pf: gl > 0 ? gw / gl : null, total, cagr: Math.pow(1 + total, 1 / years) - 1, maxDD: dd(eq), sharpe: sharpe(eq),
    exposure: closed.reduce((a, t) => a + t.bars, 0) / (n - first),
    avgBars: closed.length ? closed.reduce((a, t) => a + t.bars, 0) / closed.length : null,
    bhTotal, bhCagr: Math.pow(1 + bhTotal, 1 / years) - 1, bhDD: dd(bh), bhSharpe: sharpe(bh),
    long: side('long'), short: side('short'),
  };
}

if (typeof module !== 'undefined') module.exports = { parseYahoo, analyze, summarize };
