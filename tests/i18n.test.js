import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { resolveLocale, languageBootstrap } from '../src/i18n/locale.js';
import { translate } from '../src/i18n/translate.js';
import polish from '../src/i18n/pl.js';
import { riskScenarios } from '../src/lib/risk-scenarios.js';

const data = (name) =>
  JSON.parse(
    readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)),
  );

test('language negotiation respects preference order, regional variants and English fallback', () => {
  assert.equal(resolveLocale(['pl-PL', 'en-US']), 'pl');
  assert.equal(resolveLocale(['en-GB', 'pl']), 'en-US');
  assert.equal(resolveLocale(['de-DE', 'pl-PL']), 'pl');
  assert.equal(resolveLocale(['de-DE', 'fr']), 'en-US');
  assert.equal(resolveLocale([]), 'en-US');
  assert.equal(resolveLocale(['pl'], 'en-US'), 'en-US');
  assert.equal(resolveLocale(['en-US'], 'pl'), 'pl');
  assert.equal(resolveLocale(['pl'], 'unsupported'), 'pl');
});

test('the actual head bootstrap prioritizes URL, then storage, then browser, even with blocked storage', () => {
  function detect({
    query = '',
    saved = null,
    languages = ['pl-PL'],
    blocked = false,
  } = {}) {
    let fallback;
    const html = {
      lang: 'en-US',
      dataset: {},
      hasAttribute: () => Object.hasOwn(html.dataset, 'i18nReady'),
    };
    vm.runInNewContext(languageBootstrap, {
      URLSearchParams,
      location: { search: query },
      localStorage: {
        getItem() {
          if (blocked) throw new Error('Blocked');
          return saved;
        },
      },
      navigator: { languages, language: 'en-US' },
      document: { documentElement: html },
      setTimeout(callback) {
        fallback = callback;
      },
    });
    return { html, fallback };
  }
  assert.equal(detect().html.lang, 'pl');
  assert.equal(detect({ saved: 'en-US' }).html.lang, 'en-US');
  assert.equal(detect({ query: '?lang=pl', saved: 'en-US' }).html.lang, 'pl');
  assert.equal(
    detect({ query: '?lang=en-US', saved: 'pl', blocked: true }).html.lang,
    'en-US',
  );
  assert.equal(detect({ blocked: true }).html.lang, 'pl');
  assert.equal(detect({ saved: 'fr', languages: ['fr'] }).html.lang, 'en-US');
  const failed = detect();
  failed.fallback();
  assert.equal(failed.html.lang, 'en-US');
  const loaded = detect();
  loaded.html.dataset.i18nReady = '';
  loaded.fallback();
  assert.equal(loaded.html.lang, 'pl');
});

test('translations retain surrounding whitespace, names, tickers and financial values', () => {
  assert.equal(translate('\n  The arena  \n', 'pl'), '\n  Arena  \n');
  for (const value of [
    'Bill Ackman',
    'SPX',
    'SPY',
    '$10,000',
    '+14.7%',
    '2016–2025',
  ]) {
    assert.equal(translate(value, 'pl'), value);
  }
  assert.equal(translate('The arena', 'en-US'), 'The arena');
  assert.equal(
    translate('New untranslated content', 'pl'),
    'New untranslated content',
  );
  assert.equal(
    translate('View Bill Ackman, Epic over 10 years', 'pl'),
    'Zobacz: Bill Ackman, Epicka za 10 lat',
  );
  assert.equal(translate('7–12 of 34 investors', 'pl'), '7–12 z 34 inwestorów');
  assert.equal(translate('22 years, 3 months', 'pl'), '22 lata, 3 miesiące');
  assert.equal(translate('12 years, 12 months', 'pl'), '12 lat, 12 miesięcy');
  assert.equal(
    translate('240 monthly contributions of $250', 'pl'),
    '240 comiesięcznych wpłat po $250',
  );
  assert.equal(translate('10Y · EPIC', 'pl'), '10 LAT · EPICKA');
  assert.equal(translate('Increase by $1,000', 'pl'), 'Zwiększ o $1,000');
  assert.equal(
    translate('Goal <br /><em>Calculator.</em>', 'pl'),
    'Kalkulator <br /><em>celu.</em>',
  );
  assert.equal(
    translate(
      'Projected portfolio $100. You contribute $80. Estimated investment growth $20.',
      'pl',
    ),
    'Prognozowany portfel $100. Twoje wpłaty $80. Szacowany wzrost inwestycji $20.',
  );
});

test('every investor biography, collapse narrative and interactive risk scenario has Polish copy', () => {
  for (const profile of Object.values(data('investor-biographies'))) {
    assert.ok(
      polish[profile.description],
      `Missing biography: ${profile.description}`,
    );
  }
  for (const entry of data('arena-of-ruin').cases) {
    for (const key of [
      'type',
      'metricLabel',
      'rise',
      'fall',
      'context',
      'lesson',
    ]) {
      assert.ok(polish[entry[key]], `Missing case ${entry.id}: ${key}`);
    }
  }
  for (const scenario of riskScenarios) {
    for (const key of [
      'label',
      'shortLabel',
      'title',
      'metricLabel',
      'description',
      'takeaway',
    ]) {
      assert.ok(
        polish[scenario[key]],
        `Missing scenario ${scenario.id}: ${key}`,
      );
    }
  }
});

test('Polish copy remains stable when observed again after interactive mutations', () => {
  for (const [source, translated] of Object.entries(polish)) {
    assert.ok(translated, `Empty translation: ${source}`);
    assert.equal(
      translate(translated, 'pl'),
      translated,
      `Not idempotent: ${source}`,
    );
  }
});

test('interactive paragraphs can combine existing disclosures without leaving English copy', () => {
  const first =
    'Annual observations miss intra-year losses; a daily total-return series is required.';
  const second =
    'PSH NAV returns include leverage and the effects of its structure and buybacks. They differ from the returns of its traded shares. The five-year rarity is Unrated because rounded source data cannot establish which side of zero the gap falls on.';
  assert.equal(
    translate(`${first} ${second}`, 'pl'),
    `${polish[first]} ${polish[second]}`,
  );
});
