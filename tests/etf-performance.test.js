import test from 'node:test';
import assert from 'node:assert/strict';
import {
  etfSnapshot,
  etfBenchmark,
  rankedEtfs,
} from '../src/lib/etf-performance.js';

test('ETF roster has 20 distinct, sourced records for one common period', () => {
  assert.equal(rankedEtfs.length, 20);
  assert.equal(new Set(rankedEtfs.map((fund) => fund.ticker)).size, 20);
  assert.equal(etfSnapshot.periodStart, '2016-01-01');
  assert.equal(etfSnapshot.asOf, '2025-12-31');
  assert.equal(etfSnapshot.returnBasis, 'NAV total return');
  for (const fund of rankedEtfs) {
    assert.ok(Number.isFinite(fund.value) && fund.value > -100);
    assert.equal(new URL(fund.source).protocol, 'https:');
    assert.ok(fund.sourceLabel.includes('2025'));
  }
  const popularity = [...rankedEtfs].sort(
    (a, b) => a.popularityRank - b.popularityRank,
  );
  assert.equal(popularity[0].ticker, 'VOO');
  assert.equal(popularity.at(-1).ticker, 'XLK');
  assert.ok(
    popularity.every(
      (fund, i) => i === 0 || fund.aumBillions <= popularity[i - 1].aumBillions,
    ),
  );
});

test('performance decides rank, and equal published returns share a place', () => {
  assert.deepEqual(
    rankedEtfs.slice(0, 3).map((fund) => fund.ticker),
    ['VGT', 'XLK', 'QQQ'],
  );
  assert.ok(
    rankedEtfs.every(
      (fund, i) => i === 0 || fund.value <= rankedEtfs[i - 1].value,
    ),
  );
  const ivv = rankedEtfs.find((fund) => fund.ticker === 'IVV');
  const voo = rankedEtfs.find((fund) => fund.ticker === 'VOO');
  const spy = rankedEtfs.find((fund) => fund.ticker === 'SPY');
  assert.equal(ivv.rank, 7);
  assert.equal(voo.rank, 7);
  assert.equal(spy.rank, 9);
});

test('SPY compares with itself exactly and rarity follows excess return', () => {
  assert.equal(etfBenchmark, 14.71);
  const byTicker = Object.fromEntries(
    rankedEtfs.map((fund) => [fund.ticker, fund]),
  );
  assert.equal(byTicker.SPY.gap, 0);
  assert.equal(byTicker.SPY.tier, 'rare');
  assert.equal(byTicker.VOO.gap, 0.07);
  assert.equal(byTicker.VGT.tier, 'legendary');
  assert.equal(byTicker.VUG.tier, 'epic');
  assert.equal(byTicker.BND.tier, 'common');
  assert.ok(
    rankedEtfs.every(
      (fund) => Math.abs(fund.gap - (fund.value - etfBenchmark)) < 1e-10,
    ),
  );
});
