import test from 'node:test';
import assert from 'node:assert/strict';
import { maximumDrawdown } from '../src/lib/drawdown.js';
import {
  annualStatistics,
  investorStatistics,
} from '../src/lib/investor-stats.js';
import { rankedById, rankedInvestors } from '../src/lib/performance.js';
import daily from '../src/data/drawdowns.json' with { type: 'json' };

const series = (values) =>
  values.map((value, index) => ({ date: `${2015 + index}-12-31`, value }));
const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test('drawdown uses chronological peaks, compounds consecutive losses and detects recovery', () => {
  const result = maximumDrawdown(series([100, 120, 108, 86.4, 110, 120]));
  close(result.value, -28);
  assert.equal(result.peakDate, '2016-12-31');
  assert.equal(result.troughDate, '2018-12-31');
  assert.equal(result.recoveryDate, '2020-12-31');
  // A later all-time high must not be used as the peak for an earlier trough.
  close(maximumDrawdown(series([100, 80, 200, 180])).value, -20);
  assert.equal(maximumDrawdown(series([100, 80, 90])).recoveryDate, null);
});

test('drawdown includes the opening balance and distinguishes no losses from missing data', () => {
  close(maximumDrawdown(series([100, 70, 75])).value, -30);
  const noLoss = maximumDrawdown(series([100, 110, 120]));
  assert.equal(noLoss.value, 0);
  assert.equal(noLoss.peakDate, null);
  assert.equal(noLoss.troughDate, null);
  close(maximumDrawdown(series([100, 0])).value, -100);
  for (const invalid of [
    [],
    series([100]),
    series([0, 1]),
    series([100, NaN]),
    series([100, -1]),
    series([100, 90]).reverse(),
  ]) {
    assert.throws(() => maximumDrawdown(invalid), RangeError);
  }
});

test('annual stats handle loss streaks, flat years, benchmark ties and one-year windows', () => {
  const stats = annualStatistics([20, -10, -20, 0], 2022, [20, -15, -10, 0]);
  close(stats.total, -13.6);
  close(stats.drawdown.value, -28);
  assert.deepEqual(stats.best, { value: 20, year: 2022 });
  assert.deepEqual(stats.worst, { value: -20, year: 2024 });
  assert.equal(stats.positive, 1);
  assert.equal(stats.ahead, 1);
  assert.equal(annualStatistics(undefined, 2016), null);
  const single = annualStatistics([10], 2025, [5]);
  assert.deepEqual(single.best, single.worst);
  assert.equal(single.positive, 1);
});

test('every profile period uses matched drawdown frequency and handles unavailable records', () => {
  for (const record of rankedInvestors) {
    for (const years of [1, 5, 10]) {
      const stats = investorStatistics(record, years);
      assert.equal(stats.rows.length, 5);
      assert.equal(stats.startYear, 2026 - years);
      assert.equal(stats.frequency, daily[record.key] ? 'daily' : 'annual');
      assert.equal(
        stats.rows.find((row) => row.key === 'total').investor.value,
        `${record.stats[years].value < 0 ? '−' : '+'}${Math.abs(((1 + record.stats[years].value / 100) ** years - 1) * 100).toFixed(1)}%`,
      );
      if (stats.frequency === 'daily') {
        assert.ok(daily[record.key].periods[years].observations >= years * 245);
        assert.ok(
          daily[record.key].periods[years].value <=
            annualStatistics(record.returns.slice(-years), 2026 - years)
              .drawdown.value +
              0.15,
        );
        assert.equal(
          stats.benchmarkDrawdown.magnitude,
          Math.abs(daily.benchmark.periods[years].value),
        );
      } else {
        assert.match(stats.title, /year-end/);
        assert.match(stats.note, /Daily maximum drawdown is not available/);
      }
    }
  }
  for (const years of [1, 5, 10]) {
    const missing = investorStatistics(undefined, years);
    assert.equal(missing.investorDrawdown.value, '—');
    assert.ok(missing.rows.every((row) => row.investor.value === '—'));
    assert.notEqual(missing.benchmarkDrawdown.value, '—');
  }
  // Unlicensed daily data is excluded; year-end sampling cannot reveal intra-year losses.
  assert.equal(investorStatistics(rankedById.warren).frequency, 'annual');
  assert.equal(investorStatistics(rankedById.warren).investorDrawdown.magnitude, 0);
  assert.throws(() => investorStatistics(rankedById.warren, 3), RangeError);
});
