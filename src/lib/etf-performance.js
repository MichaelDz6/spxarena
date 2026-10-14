import snapshot from '../data/etfs.json' with { type: 'json' };
import { tierFor } from './performance.js';

export const etfSnapshot = snapshot;
// Compare like-for-like issuer NAV returns, including the SPY benchmark.
export const etfBenchmark = snapshot.funds.find(
  (fund) => fund.ticker === 'SPY',
).annualizedReturn;
export const rankedEtfs = snapshot.funds
  .map((fund) => {
    const gap = Number((fund.annualizedReturn - etfBenchmark).toFixed(2));
    const lowerTier = tierFor(gap - 2 * snapshot.precision, 10);
    const upperTier = tierFor(gap + 2 * snapshot.precision, 10);
    return {
      ...fund,
      value: fund.annualizedReturn,
      gap,
      tier:
        fund.ticker === 'SPY'
          ? 'rare'
          : lowerTier === upperTier
            ? tierFor(gap, 10)
            : 'unrated',
    };
  })
  .sort((a, b) => b.value - a.value || a.ticker.localeCompare(b.ticker))
  // Equal published returns share a rank; ticker order only stabilizes the display.
  .map((fund, i, sorted) => ({
    ...fund,
    rank: sorted.findIndex((other) => other.value === fund.value) + 1,
  }));
