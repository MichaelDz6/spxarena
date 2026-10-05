import profiles from '../data/investors.json' with { type: 'json' };
import records from '../data/returns.json' with { type: 'json' };

// Calendar-year total returns, 2016–2025. SPY is the investable benchmark.
export const benchmarkReturns = [
  12, 21.7, -4.57, 31.22, 18.33, 28.73, -18.17, 26.18, 24.89, 17.72,
];
export const cagr = (returns) =>
  (Math.pow(
    returns.reduce((value, annual) => value * (1 + annual / 100), 1),
    1 / returns.length,
  ) -
    1) *
  100;
export const accumulate = (returns) =>
  returns.reduce(
    (values, annual) => [...values, values.at(-1) * (1 + annual / 100)],
    [10000],
  );
export const fmt = (value, places = 1) =>
  `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(places)}`;
export const dollars = (value) =>
  '$' + Math.round(value).toLocaleString('en-US');
export const titleCase = (value) => value[0].toUpperCase() + value.slice(1);
export const delta = (value) =>
  value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
export const tierFor = (gap, years) =>
  !Number.isFinite(gap)
    ? 'unrated'
    : gap >= (years === 1 ? 10 : 3)
      ? 'legendary'
      : gap >= (years === 1 ? 4 : 1)
        ? 'epic'
        : gap >= 0
          ? 'rare'
          : 'common';
export const benchmarkStats = Object.fromEntries(
  [10, 5, 1].map((years) => [years, cagr(benchmarkReturns.slice(-years))]),
);

export function scoreRecord(record) {
  return Object.fromEntries(
    [10, 5, 1].map((years) => {
      const returns = record.returns.slice(-years);
      const value = cagr(returns);
      const gap = value - benchmarkStats[years];
      // Rounded source data must not decide a badge at a boundary.
      const lower =
        cagr(returns.map((r) => r - record.precision)) -
        cagr(benchmarkReturns.slice(-years).map((r) => r + 0.005));
      const upper =
        cagr(returns.map((r) => r + record.precision)) -
        cagr(benchmarkReturns.slice(-years).map((r) => r - 0.005));
      const tier =
        tierFor(lower, years) === tierFor(upper, years)
          ? tierFor(gap, years)
          : 'unrated';
      return [years, { value, gap, tier }];
    }),
  );
}

export const rankedInvestors = Object.entries(records)
  .map(([key, record]) => {
    const stats = scoreRecord(record);
    const windows = Array.from({ length: 6 }, (_, i) => ({
      start: 2016 + i,
      end: 2020 + i,
      gap:
        cagr(record.returns.slice(i, i + 5)) -
        cagr(benchmarkReturns.slice(i, i + 5)),
    }));
    return {
      ...record,
      key,
      stats,
      windows,
      value: stats[10].value,
      gap: stats[10].gap,
      tier: stats[10].tier,
    };
  })
  .sort((a, b) => b.gap - a.gap)
  .map((record, i) => ({ ...record, rank: i + 1 }));
export const rankedById = Object.fromEntries(
  rankedInvestors.map((d) => [d.key, d]),
);
export const investors = profiles;
export const investorById = Object.fromEntries(
  investors.map((d) => [d.key, d]),
);
export const rosterOrder = [
  'warren',
  'cathie',
  'bill',
  'burry',
  'dalio',
  'cramer',
  'loeb',
  'pabrai',
  'smith',
  'gabelli',
  'danoff',
  'asness',
  'berkowitz',
  'watsa',
  'gayner',
  'hussman',
  'nygren',
  'davis',
  'rogers',
  'herro',
  'lynch',
  'munger',
  'soros',
  'oleary',
  'griffin',
  'druckenmiller',
  'simons',
  'marks',
  'tudor',
  'einhorn',
  'baron',
  'joel',
  'peter',
  'carl',
];
