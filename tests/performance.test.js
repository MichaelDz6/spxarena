import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cagr,
  accumulate,
  tierFor,
  benchmarkReturns,
  rankedInvestors,
  rankedById,
  investors,
  rosterOrder,
} from '../src/lib/performance.js';

test('returns compound geometrically, including losses', () => {
  assert.ok(Math.abs(cagr([100, -50])) < 1e-10);
  assert.deepEqual(accumulate([100, -50]), [10000, 20000, 10000]);
  assert.equal(Math.round(accumulate(benchmarkReturns).at(-1)), 39468);
});
test('all 34 profiles have unique identities and 20 complete ranked records', () => {
  assert.equal(investors.length, 34);
  assert.equal(new Set(investors.map((d) => d.key)).size, 34);
  assert.deepEqual(new Set(rosterOrder), new Set(investors.map((d) => d.key)));
  assert.equal(rankedInvestors.length, 20);
  for (const record of rankedInvestors) {
    assert.equal(record.returns.length, 10);
    assert.ok(record.returns.every((r) => Number.isFinite(r) && r > -100));
    assert.ok(record.source.startsWith('https://'));
    assert.equal(record.windows.length, 6);
  }
});
test('ten-year rank and period-specific rarity preserve the research snapshot', () => {
  assert.deepEqual(
    rankedInvestors.slice(0, 5).map((d) => d.key),
    ['watsa', 'danoff', 'bill', 'joel', 'cathie'],
  );
  assert.equal(rankedById.bill.stats[5].tier, 'unrated');
  assert.equal(rankedById.warren.tier, 'common');
  assert.equal(tierFor(3, 10), 'legendary');
  assert.equal(tierFor(3, 1), 'rare');
  assert.ok(
    rankedInvestors.every(
      (d, i) =>
        d.rank === i + 1 && (i === 0 || d.gap <= rankedInvestors[i - 1].gap),
    ),
  );
});
