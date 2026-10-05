import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHistory, defaultCalculator } from '../src/lib/calculator.js';
import data from '../src/data/spy-monthly-prices.json' with { type: 'json' };

const prices = [
  { month: '2020-12', adjustedClose: 100 },
  { month: '2021-01', adjustedClose: 110 },
  { month: '2021-02', adjustedClose: 99 },
];
const scenario = {
  initial: 1000,
  monthly: 100,
  start: '2021-01',
  end: '2021-02',
  timing: 'end',
};
test('monthly cash flows use the selected contribution timing', () => {
  const end = calculateHistory(prices, scenario);
  const beginning = calculateHistory(prices, {
    ...scenario,
    timing: 'beginning',
  });
  assert.ok(Math.abs(end.value - 1180) < 1e-9);
  assert.ok(Math.abs(beginning.value - 1179) < 1e-9);
  assert.equal(end.invested, 1200);
  assert.equal(end.points.length, 3);
});
test('the default SPY historical scenario preserves the original result', () => {
  const result = calculateHistory(data.prices, defaultCalculator);
  assert.equal(Math.round(result.value), 105990);
  assert.equal(result.invested, 40000);
  assert.equal(result.months, 120);
  assert.equal(data.prices.length, 121);
});
test('zero contributions, single month and invalid inputs are handled', () => {
  const single = calculateHistory(prices, {
    ...scenario,
    monthly: 0,
    end: '2021-01',
  });
  assert.equal(single.value, 1100);
  assert.equal(single.months, 1);
  assert.equal(
    calculateHistory(prices, { ...scenario, initial: 0, monthly: 0 }).value,
    0,
  );
  for (const invalid of [
    { initial: -1 },
    { monthly: Infinity },
    { start: '2019-01' },
    { start: '2021-02', end: '2021-01' },
    { timing: 'midmonth' },
  ]) {
    assert.throws(() => calculateHistory(prices, { ...scenario, ...invalid }));
  }
});
