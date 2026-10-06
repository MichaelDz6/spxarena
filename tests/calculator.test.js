import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProjection,
  defaultCalculator,
} from '../src/lib/calculator.js';
import { createProjectionChart } from '../src/lib/projection-chart.js';

const near = (actual, expected) =>
  assert.ok(
    Math.abs(actual - expected) < Math.max(1, Math.abs(expected)) * 1e-10,
    `${actual} should equal ${expected}`,
  );
const project = (overrides) =>
  calculateProjection({ ...defaultCalculator, ...overrides });

test('an annual return compounds to that exact return over twelve months', () => {
  near(project({ monthly: 0, years: 1 }).value, 11000);
  near(project({ monthly: 0, years: 1, annualRate: -10 }).value, 9000);
});

test('deposits arrive at month-end and receive no growth in their arrival month', () => {
  const result = project({
    initial: 1000,
    monthly: 100,
    years: 0,
    months: 2,
    annualRate: (1.01 ** 12 - 1) * 100,
  });
  near(result.points[1].value, 1110);
  near(result.value, 1221.1);
  assert.equal(result.invested, 1200);
  near(result.gain, 21.1);
  assert.equal(result.points.length, 3);
});

test('years and extra months match the closed-form ordinary annuity calculation', () => {
  const result = project({ years: 2, months: 6 });
  const rate = 1.1 ** (1 / 12) - 1;
  const expected = 10000 * 1.1 ** 2.5 + (250 * ((1 + rate) ** 30 - 1)) / rate;
  near(result.value, expected);
  assert.equal(result.months, 30);
  assert.equal(result.invested, 17500);
  assert.equal(result.points.length, 31);
});

test('zero return, zero duration and an empty portfolio stay finite and meaningful', () => {
  const flat = project({ annualRate: 0 });
  assert.equal(flat.value, 70000);
  assert.equal(flat.gain, 0);
  const today = project({ years: 0, months: 0 });
  assert.equal(today.value, 10000);
  assert.equal(today.invested, 10000);
  assert.equal(today.points.length, 1);
  assert.equal(project({ initial: 0, monthly: 0 }).value, 0);
});

test('invalid or incomplete scenarios cannot produce a misleading projection', () => {
  for (const invalid of [
    { initial: -1 },
    { initial: NaN },
    { initial: 100000001 },
    { monthly: Infinity },
    { monthly: 10000001 },
    { years: -1 },
    { years: 51 },
    { years: 2.5 },
    { years: NaN },
    { months: 12 },
    { months: -1 },
    { months: 1.5 },
    { annualRate: NaN },
    { annualRate: -100 },
    { annualRate: 51 },
  ])
    assert.throws(() => project(invalid));
});

test('the chart renders finite geometry before JavaScript, including edge cases', () => {
  for (const config of [
    {},
    { initial: 0, monthly: 0 },
    { years: 0 },
    { annualRate: 0 },
    { annualRate: -50 },
    {
      initial: 100000000,
      monthly: 10000000,
      annualRate: 50,
      years: 50,
      months: 11,
    },
  ]) {
    const result = project(config);
    for (const width of [272, 700]) {
      const chart = createProjectionChart(result, width);
      assert.doesNotMatch(chart.markup, /NaN|Infinity|undefined/);
      assert.match(chart.markup, /data-portfolio-path/);
      assert.match(chart.markup, /data-contributions-path/);
      assert.ok(chart.x(result.months) <= width);
      assert.ok(chart.y(result.value) >= 0);
    }
  }
});
