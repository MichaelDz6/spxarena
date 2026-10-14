import test from 'node:test';
import assert from 'node:assert/strict';
import {
  investorComparison,
  createInvestorChart,
  comparisonDescription,
} from '../src/lib/investor-chart.js';
import { rankedInvestors, rankedById } from '../src/lib/performance.js';

test('profile comparisons rebase both investments to $10,000 over the selected dates', () => {
  for (const record of rankedInvestors) {
    for (const years of [1, 5, 10]) {
      const comparison = investorComparison(record, years);
      assert.equal(comparison.investor[0], 10000);
      assert.equal(comparison.benchmark[0], 10000);
      assert.equal(comparison.investor.length, years + 1);
      assert.equal(comparison.startYear, 2026 - years);
      assert.ok(
        Math.abs(comparison.annualized - record.stats[years].value) < 1e-10,
      );
      assert.ok(Math.abs(comparison.gap - record.stats[years].gap) < 1e-10);
      assert.equal(
        comparison.difference,
        comparison.investor.at(-1) - comparison.benchmark.at(-1),
      );
      for (const width of [280, 375, 900]) {
        const chart = createInvestorChart(comparison, width);
        assert.doesNotMatch(chart.markup, /NaN|Infinity|undefined/);
        assert.equal(
          (chart.markup.match(/class="profile-investor-dot"/g) || []).length,
          years + 1,
        );
      }
    }
  }
  assert.equal(
    Math.round(investorComparison(rankedById.warren).benchmark.at(-1)),
    39468,
  );
  assert.throws(() => investorComparison(rankedById.warren, 7), RangeError);
});

test('unranked profiles show the benchmark without inventing investor returns or a zero result', () => {
  const comparison = investorComparison(undefined);
  assert.equal(comparison.investor, null);
  assert.equal(comparison.annualized, null);
  assert.equal(comparison.gap, null);
  assert.equal(comparison.difference, null);
  const chart = createInvestorChart(comparison);
  assert.doesNotMatch(
    chart.markup,
    /profile-investor-line|profile-investor-dot/,
  );
  assert.match(chart.markup, /profile-benchmark-line/);
  assert.match(
    comparisonDescription(comparison),
    /No comparable investor return record/,
  );
});
