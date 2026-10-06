import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGoal,
  calculateProjection,
  defaultCalculator,
} from '../src/lib/calculator.js';

const goal = (overrides) =>
  calculateGoal({ ...defaultCalculator, target: 1000000, ...overrides });

test('goal contributions cover the target with the smallest whole-dollar deposit', () => {
  for (const scenario of [
    {},
    { initial: 0, target: 50000, years: 10, months: 6 },
    { target: 50000, years: 10, annualRate: -10 },
    { target: 50000, years: 0, months: 1 },
    {
      initial: 0,
      target: 1000000,
      years: 50,
      months: 11,
      annualRate: 0.000000001,
    },
    { initial: 0, target: 100000000, years: 50, annualRate: -50 },
  ]) {
    const config = { ...defaultCalculator, target: 1000000, ...scenario };
    const result = calculateGoal(config);
    assert.ok(result.value >= config.target - 0.000001);
    assert.ok(Number.isInteger(result.monthly));
    const lower = calculateProjection({
      ...config,
      monthly: result.monthly - 1,
    });
    assert.ok(lower.value < config.target);
    assert.equal(
      result.invested,
      config.initial + result.monthly * result.months,
    );
    assert.equal(result.points.at(-1).value, result.value);
  }
});

test('zero-return goals divide the shortfall by month count and round up', () => {
  assert.equal(
    goal({ initial: 0, target: 1200, years: 1, annualRate: 0 }).monthly,
    100,
  );
  assert.equal(
    goal({ initial: 100, target: 1201, years: 1, annualRate: 0 }).monthly,
    92,
  );
});

test('a goal funded by starting capital needs no monthly deposits', () => {
  const result = goal({ initial: 10000, target: 11000, years: 1 });
  assert.equal(result.monthly, 0);
  assert.equal(result.coveredByInitial, true);
  assert.equal(goal({ target: 5000, years: 0 }).monthly, 0);
  // Having enough today is not sufficient if the selected return erodes it.
  assert.ok(
    goal({ initial: 10000, target: 10000, years: 1, annualRate: -10 }).monthly >
      0,
  );
});

test('unreachable or incomplete goal inputs show useful errors', () => {
  assert.throws(() => goal({ years: 0, months: 0 }), /at least 1 month/);
  assert.throws(
    () => goal({ target: 100000000, years: 0, months: 1 }),
    /longer time horizon/,
  );
  for (const target of [NaN, Infinity, -1, 0, 100000001])
    assert.throws(() => goal({ target }), /target value/);
  for (const invalid of [
    { years: NaN },
    { years: 51 },
    { months: 12 },
    { annualRate: NaN },
    { initial: -1 },
  ])
    assert.throws(() => goal(invalid));
});
