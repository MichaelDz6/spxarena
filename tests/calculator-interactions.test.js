import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAmount,
  formatAmountInput,
  stepMonthlyContribution,
  stepStartingInvestment,
} from '../src/lib/amount-input.js';
import {
  calculateProjection,
  defaultCalculator,
} from '../src/lib/calculator.js';
import {
  createProjectionChart,
  interpolateChartGeometry,
  projectionPaths,
} from '../src/lib/projection-chart.js';

test('monthly controls cross both step thresholds and preserve valid dollar amounts', () => {
  for (const [value, direction, expected] of [
    [250, 1, 300],
    [250, -1, 200],
    [950, 1, 1000],
    [1000, 1, 1100],
    [1000, -1, 900],
    [9900, 1, 10000],
    [10000, 1, 11000],
    [10000, -1, 9000],
    [15000, -1, 14000],
    [25, -1, 0],
    [10000000, 1, 10000000],
    [250.5, 1, 300.5],
  ]) {
    const formatted = formatAmountInput(
      String(stepMonthlyContribution(value, direction)),
    );
    assert.equal(parseAmount(formatted), expected);
    const result = calculateProjection({
      ...defaultCalculator,
      monthly: parseAmount(formatted),
      years: 1,
      annualRate: 0,
    });
    assert.equal(result.value, defaultCalculator.initial + expected * 12);
  }
  assert.equal(stepStartingInvestment(9500, 1), 9600);
  assert.equal(stepStartingInvestment(10000, 1), 11000);
});

test('curves morph across different horizons and can resume from an interrupted frame', () => {
  const geometry = (overrides) =>
    createProjectionChart(
      calculateProjection({ ...defaultCalculator, ...overrides }),
    ).geometry;
  const from = geometry({ years: 0 });
  const to = geometry({ years: 50, months: 11, monthly: 10000 });
  const midpoint = interpolateChartGeometry(from, to, 0.5);
  assert.equal(from.points.length, to.points.length);
  assert.equal(midpoint.months, to.months / 2);
  assert.deepEqual(interpolateChartGeometry(from, to, 0), from);
  assert.notEqual(projectionPaths(midpoint).value, projectionPaths(from).value);
  assert.notEqual(projectionPaths(midpoint).value, projectionPaths(to).value);
  const next = geometry({ years: 1, annualRate: -50 });
  assert.deepEqual(interpolateChartGeometry(midpoint, next, 0), midpoint);
  for (const progress of [0, 0.1, 0.5, 0.9, 1]) {
    const paths = projectionPaths(
      interpolateChartGeometry(midpoint, next, progress),
    );
    assert.doesNotMatch(JSON.stringify(paths), /NaN|Infinity|undefined/);
  }
});
