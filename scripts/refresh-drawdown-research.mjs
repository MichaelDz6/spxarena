import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { maximumDrawdown } from '../src/lib/drawdown.js';
import { benchmarkReturns } from '../src/lib/performance.js';

// Research only. This command never writes to src/data or public/.
const asOf = process.argv[2];
if (
  !/^\d{4}-\d{2}-\d{2}$/.test(asOf || '') ||
  !Number.isFinite(Date.parse(asOf))
)
  throw new Error(
    'Usage: node scripts/refresh-drawdown-research.mjs YYYY-MM-DD',
  );
const cached = process.argv.includes('--cached');
const records = JSON.parse(
  await readFile(new URL('../src/data/returns.json', import.meta.url)),
);
const directory = new URL(
  `../research/sources/drawdowns-${asOf}/`,
  import.meta.url,
);
await mkdir(directory, { recursive: true });
const symbols = {
  benchmark: 'SPY',
  warren: 'BRK-A',
  danoff: 'FCNTX',
  asness: 'QLEIX',
  berkowitz: 'FAIRX',
  gayner: 'MKL',
  hussman: 'HSGFX',
  nygren: 'OAKMX',
  davis: 'NYVTX',
  rogers: 'ARGFX',
  herro: 'OAKIX',
  gabelli: 'GABAX',
  joel: 'GINDX',
  peter: 'EPIVX',
  watsa: 'FFH.TO',
  smith: '0P0000RU7W.L',
  cathie: 'ARKK',
};
const fx = { watsa: 'CADUSD=X', smith: 'GBPUSD=X' };
const histories = {};
const errors = {};
const dateOf = (timestamp) =>
  new Date(timestamp * 1000).toISOString().slice(0, 10);
const sourceFile = (symbol) => `${symbol.replaceAll('=', '-')}.json`;
const day = 86400000;
const end = Date.parse(`${asOf}T00:00:00Z`) / 1000;
const start = Date.parse('2015-12-01T00:00:00Z') / 1000;
const allSymbols = [
  ...new Set([...Object.values(symbols), ...Object.values(fx)]),
];

for (let i = 0; i < allSymbols.length; i += 3) {
  await Promise.all(
    allSymbols.slice(i, i + 3).map(async (symbol) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${start}&period2=${end}&interval=1d&events=div%2Csplits%2CcapitalGains`;
      try {
        let raw;
        if (cached) {
          raw = JSON.parse(
            await readFile(new URL(sourceFile(symbol), directory)),
          );
        } else {
          const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(30000),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          raw = await response.json();
        }
        const result = raw.chart?.result?.[0];
        if (!result?.timestamp?.length)
          throw new Error('No dated observations');
        if (
          result.meta.symbol !== symbol ||
          result.meta.dataGranularity !== '1d'
        )
          throw new Error('Unexpected symbol or observation frequency');
        if (!cached)
          await writeFile(
            new URL(sourceFile(symbol), directory),
            JSON.stringify(raw) + '\n',
          );
        histories[symbol] = { result, url };
        console.log(
          `${symbol}: ${result.timestamp.length} observations through ${dateOf(result.timestamp.at(-1))}`,
        );
      } catch (error) {
        errors[symbol] = error.message;
        console.error(`${symbol}: ${error.message}`);
      }
    }),
  );
}

function observations(symbol, adjusted = true) {
  const raw = histories[symbol]?.result;
  if (!raw) throw new Error(`History unavailable: ${symbol}`);
  const values = adjusted
    ? raw.indicators.adjclose?.[0]?.adjclose
    : raw.indicators.quote?.[0]?.close;
  if (!values) throw new Error(`Required price series unavailable: ${symbol}`);
  return raw.timestamp
    .map((timestamp, i) => ({ date: dateOf(timestamp), value: values[i] }))
    .filter(
      (point) =>
        point.date < asOf && Number.isFinite(point.value) && point.value > 0,
    );
}

function convertCurrency(points, fxSymbol) {
  const rates = observations(fxSymbol, false);
  return points.map((point) => {
    const rate = rates.findLast((rate) => rate.date <= point.date);
    if (!rate || Date.parse(point.date) - Date.parse(rate.date) > 4 * day)
      throw new Error(`Missing recent ${fxSymbol} rate for ${point.date}`);
    return { date: point.date, value: point.value * rate.value };
  });
}

const candidates = {};
for (const [key, symbol] of Object.entries(symbols)) {
  const record = records[key];
  const entry = {
    name: record?.name ?? 'SPY benchmark',
    vehicle: record?.vehicle ?? 'SPY market-price total return',
    symbol,
    source: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/history/`,
    annualReturnSource:
      record?.source ??
      'https://www.ssga.com/us/en/individual/etfs/spdr-sp-500-etf-trust-spy',
    sourceFile: `research/sources/drawdowns-${asOf}/${sourceFile(symbol)}`,
    retrievedOn: asOf,
    frequency: 'daily',
    currency: 'USD',
    publicationStatus:
      'withheld: provider redistribution permission not verified',
  };
  candidates[key] = entry;
  try {
    let points = observations(symbol);
    const raw = histories[symbol].result;
    const expectedCurrency =
      key === 'watsa' ? 'CAD' : key === 'smith' ? 'GBP' : 'USD';
    if (raw.meta.currency !== expectedCurrency)
      throw new Error(
        `Expected ${expectedCurrency}; source uses ${raw.meta.currency}`,
      );
    if (fx[key]) {
      points = convertCurrency(points, fx[key]);
      entry.currencySource = fx[key];
      entry.currencySourceFile = `research/sources/drawdowns-${asOf}/${sourceFile(fx[key])}`;
    }
    const gaps = points
      .slice(1)
      .filter(
        (point, i) =>
          Date.parse(point.date) - Date.parse(points[i].date) > 5 * day,
      );
    if (gaps.length)
      throw new Error(
        `Incomplete daily history: ${gaps.length} gaps longer than five days`,
      );
    const endDate = points.at(-1).date;
    if (Date.parse(asOf) - Date.parse(endDate) > 5 * day)
      throw new Error(`Stale latest observation: ${endDate}`);
    const targetStart = `${Number(endDate.slice(0, 4)) - 10}${endDate.slice(4)}`;
    const opening = points.findLast((point) => point.date <= targetStart);
    if (
      !opening ||
      Date.parse(targetStart) - Date.parse(opening.date) > 4 * day
    )
      throw new Error('A full trailing ten-year history is unavailable');
    const latestPoints = points.filter((point) => point.date >= opening.date);
    if (latestPoints.length < 2450)
      throw new Error('Too few daily observations for ten years');
    entry.latest = {
      ...maximumDrawdown(latestPoints),
      requestedStartDate: targetStart,
    };
    entry.method =
      'Estimated from adjusted daily closing values with distributions reinvested. Daily closes omit intraday losses.';
    if (fx[key])
      entry.method +=
        ' Converted into USD using the latest available daily exchange rate on or before each observation.';
    const expected = record?.returns ?? benchmarkReturns;
    const yearEnds = Array.from({ length: 11 }, (_, i) =>
      points.findLast((point) => point.date <= `${2015 + i}-12-31`),
    );
    if (yearEnds.some((point, i) => !point?.date.startsWith(`${2015 + i}-12`)))
      throw new Error('Incomplete annual reconciliation history');
    entry.annualReconciliation = expected.map((published, i) => {
      const calculated = (yearEnds[i + 1].value / yearEnds[i].value - 1) * 100;
      return {
        year: 2016 + i,
        published,
        calculated,
        difference: calculated - published,
      };
    });
    entry.maxAnnualDifference = Math.max(
      ...entry.annualReconciliation.map((row) => Math.abs(row.difference)),
    );
    entry.tolerance =
      key === 'benchmark' ? 0.08 : Math.max(0.002, record.precision + 0.002);
    entry.validationStatus =
      entry.maxAnnualDifference <= entry.tolerance
        ? 'matched'
        : 'annual-return mismatch';
    if (key === 'cathie')
      entry.validationStatus =
        'wrong basis: market-price history; card record requires NAV';
    entry.periods = Object.fromEntries(
      [1, 5, 10].map((years) => [
        years,
        maximumDrawdown(
          points.filter(
            (point) =>
              point.date >= `${2025 - years}-12-31` &&
              point.date <= '2025-12-31',
          ),
        ),
      ]),
    );
  } catch (error) {
    entry.validationStatus = 'incomplete';
    entry.reason = error.message;
  }
}
for (const [key, record] of Object.entries(records)) {
  if (candidates[key]) continue;
  candidates[key] = {
    name: record.name,
    vehicle: record.vehicle,
    source: record.source,
    retrievedOn: asOf,
    validationStatus: 'daily history unavailable',
    reason:
      'No matched daily total-return series established for this exact vehicle. Do not substitute a listed holding company or a different fund.',
    publicationStatus: 'withheld: no verified daily figure',
  };
}
const output = {
  retrievedOn: asOf,
  latestPolicy:
    'Trailing ten years ending at each source’s latest completed daily observation before the retrieval date. Each result includes exact dates.',
  historicalPolicy:
    'Separate 1Y, 5Y and 10Y results through 2025-12-31 preserve the existing ranking snapshot.',
  publicationStatus:
    'Research only. None of these records establishes permission to redistribute vendor data or derived metrics.',
  rightsSource: 'https://help.yahoo.com/kb/SLN2310.html',
  downloadErrors: errors,
  records: candidates,
};
await writeFile(
  new URL('drawdowns-research.json', directory),
  JSON.stringify(output, null, 2) + '\n',
);
for (const [key, entry] of Object.entries(candidates))
  console.log(
    `${key}: ${entry.validationStatus}; latest ${entry.latest?.value?.toFixed(2) ?? '—'}%; through ${entry.latest?.endDate ?? '—'}`,
  );
console.log(
  `Saved research results to ${directory.pathname}drawdowns-research.json`,
);
