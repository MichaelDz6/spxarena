import { readFile, writeFile } from 'node:fs/promises';
import { maximumDrawdown } from '../src/lib/drawdown.js';
import { benchmarkReturns, rankedById } from '../src/lib/performance.js';

// Only USD series with the same vehicle/share class as the annual record.
// GABAX is excluded: its saved adjusted history does not reconcile with the
// published annual returns. Foreign-currency and private records stay annual.
const symbols = {
  benchmark: 'SPY',
  warren: 'BRK-A',
  danoff: 'FCNTX',
  asness: 'QLEIX',
  berkowitz: 'FAIRX',
  gayner: 'MKL',
  hussman: 'HSGFX',
  nygren: 'OAKMX',
  davis: 'NYVTX',
  rogers: 'ARGFX',
  herro: 'OAKIX',
};
const result = {};
for (const [key, symbol] of Object.entries(symbols)) {
  const sourceFile = `research/sources/${symbol}.json`;
  const raw = JSON.parse(
    await readFile(new URL(`../${sourceFile}`, import.meta.url), 'utf8'),
  );
  const source = raw.chart.result[0];
  if (source.meta.currency !== 'USD' || source.meta.dataGranularity !== '1d')
    throw new Error(`${symbol}: expected daily USD observations.`);
  const points = source.timestamp
    .map((timestamp, i) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      value: source.indicators.adjclose[0].adjclose[i],
    }))
    .filter(
      (point) => point.date >= '2015-12-31' && point.date <= '2025-12-31',
    );
  const expected =
    key === 'benchmark' ? benchmarkReturns : rankedById[key].returns;
  const tolerance =
    key === 'benchmark'
      ? 0.08
      : Math.max(0.002, rankedById[key].precision + 0.002);
  const yearEnds = Array.from({ length: 11 }, (_, i) =>
    points.findLast((point) => point.date.startsWith(String(2015 + i))),
  );
  if (yearEnds.some((point) => !point || point.date.slice(5, 7) !== '12'))
    throw new Error(`${symbol}: incomplete year-end coverage.`);
  const maxAnnualDifference = Math.max(
    ...expected.map((value, i) =>
      Math.abs((yearEnds[i + 1].value / yearEnds[i].value - 1) * 100 - value),
    ),
  );
  if (maxAnnualDifference > tolerance)
    throw new Error(
      `${symbol}: annual reconciliation failed (${maxAnnualDifference}).`,
    );
  const periods = Object.fromEntries(
    [1, 5, 10].map((years) => {
      const sample = points.filter(
        (point) => point.date >= `${2025 - years}-12-31`,
      );
      if (
        sample.length < years * 245 ||
        sample[0].date !== `${2025 - years}-12-31` ||
        sample.at(-1).date !== '2025-12-31'
      )
        throw new Error(`${symbol}: incomplete ${years}Y daily history.`);
      // No unexplained gap longer than a holiday weekend.
      if (
        sample.some(
          (point, i) =>
            i &&
            (Date.parse(point.date) - Date.parse(sample[i - 1].date)) /
              86400000 >
              5,
        )
      )
        throw new Error(`${symbol}: daily history contains a gap.`);
      return [years, maximumDrawdown(sample)];
    }),
  );
  result[key] = {
    symbol,
    sourceFile,
    source: `https://finance.yahoo.com/quote/${symbol}/history/`,
    sourceLabel: `${symbol} · adjusted daily history`,
    method:
      'Estimated from daily dividend- and split-adjusted closing values in USD. Daily closes do not capture intraday losses. Adjustment and reinvestment conventions can differ from published fund returns.',
    maxAnnualDifference,
    periods,
  };
}
await writeFile(
  new URL('../research/sources/drawdowns-candidate.json', import.meta.url),
  JSON.stringify(result, null, 2) + '\n',
);
console.log(
  `Built matched daily drawdowns for ${Object.keys(result).length - 1} investor records and SPY.`,
);
