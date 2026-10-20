import test from 'node:test';
import assert from 'node:assert/strict';
import { parseQuote } from '../src/lib/etf-quotes.js';

const payload = (overrides = {}) => ({ chart: { result: [{ meta: {
  symbol: 'SPY', currency: 'USD', regularMarketPrice: 766.48,
  regularMarketTime: 1792440000, ...overrides,
} }] } });

test('preserves regular-session price, currency and provider timestamp', () => {
  assert.deepEqual(parseQuote(payload(), 'SPY', 'USD'), {
    price: 766.48, currency: 'USD', asOf: new Date(1792440000 * 1000).toISOString(),
  });
});

test('rejects missing prices, wrong listings and currency mismatches', () => {
  for (const overrides of [
    { regularMarketPrice: null }, { regularMarketPrice: 0 },
    { regularMarketPrice: Infinity }, { regularMarketTime: null },
    { symbol: 'VOO' }, { currency: 'EUR' },
  ]) assert.throws(() => parseQuote(payload(overrides), 'SPY', 'USD'));
  assert.throws(() => parseQuote({ chart: { error: { code: 'Not Found' } } }, 'SPY', 'USD'));
});
