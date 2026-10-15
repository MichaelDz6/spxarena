import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/data/card-drawdowns.json' with { type: 'json' };
import { cardDrawdown } from '../src/lib/card-drawdowns.js';
import { rankedInvestors } from '../src/lib/performance.js';

test('card estimates have dated ten-year windows, provenance and explicit frequency', () => {
  for (const investor of rankedInvestors) {
    const entry = data.records[investor.key];
    assert.ok(entry, `${investor.key} needs either an estimate or a reason`);
    if (entry.status === 'unavailable') {
      assert.ok(entry.reason);
      assert.equal(cardDrawdown(investor.key).value, '—');
      continue;
    }
    assert.ok(['daily', 'weekly'].includes(entry.frequency));
    assert.equal(entry.currency, 'USD');
    assert.match(entry.source, /^https:\/\//);
    const latest = entry.latest;
    assert.ok(latest.value <= 0 && latest.value >= -100);
    assert.ok(latest.startDate <= latest.peakDate);
    assert.ok(latest.peakDate < latest.troughDate);
    assert.ok(latest.troughDate <= latest.endDate);
    assert.ok(latest.endDate <= entry.retrievedOn);
    assert.ok(
      !latest.recoveryDate ||
        (latest.recoveryDate > latest.troughDate &&
          latest.recoveryDate <= latest.endDate),
    );
    const span =
      (Date.parse(latest.endDate) - Date.parse(latest.startDate)) / 86400000;
    assert.ok(span >= 3652 && span <= 3663);
    assert.match(cardDrawdown(investor.key).value, /^≈−\d+\.\d%$/);
    assert.ok(cardDrawdown(investor.key).period.includes('2026'));
  }
});

test('PSH uses dividend-inclusive weekly returns and labels the estimate', () => {
  const entry = data.records.bill;
  // Issuer YTD observations: +0.7% on 19 Apr 2022, −26.0% on 30 Jun 2022.
  const expected = (0.74 / 1.007 - 1) * 100;
  assert.ok(Math.abs(entry.latest.value - expected) < 1e-10);
  assert.equal(entry.latest.peakDate, '2022-04-19');
  assert.equal(entry.latest.troughDate, '2022-06-30');
  assert.equal(entry.latest.endDate, '2026-10-13');
  assert.equal(cardDrawdown('bill').frequencyLabel, 'Weekly NAV');
  assert.match(cardDrawdown('bill').description, /between reporting dates/);
});

test('price proxies and missing records cannot appear as measured NAV drawdowns', () => {
  assert.equal(data.records.cathie.basis, 'market-price proxy');
  assert.match(cardDrawdown('cathie').frequencyLabel, /price proxy/);
  assert.match(cardDrawdown('cathie').description, /ranking uses fund NAV/);
  for (const key of ['loeb', 'pabrai', 'carl', 'unknown']) {
    assert.equal(cardDrawdown(key).available, false);
    assert.equal(cardDrawdown(key).value, '—');
  }
});
