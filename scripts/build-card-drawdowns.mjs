import { readFile, writeFile } from 'node:fs/promises';
import { maximumDrawdown } from '../src/lib/drawdown.js';

// Cards use dated estimates; the profile's fixed 2016–2025 comparison remains separate.
const asOf = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf ?? ''))
  throw new Error('Usage: node scripts/build-card-drawdowns.mjs YYYY-MM-DD');
const directory = new URL(
  `../research/sources/drawdowns-${asOf}/`,
  import.meta.url,
);
const read = async (name) =>
  JSON.parse(await readFile(new URL(name, directory)));
const research = await read('drawdowns-research.json');
const pershing = await read('pershing-weekly-rows.json');
const annual = JSON.parse(
  await readFile(new URL('../src/data/returns.json', import.meta.url)),
);
const day = 86400000;
const records = {};

for (const [key, entry] of Object.entries(research.records)) {
  if (!entry.latest || entry.validationStatus === 'incomplete') continue;
  // Compare full calendar years inside the rolling window. A 2016 full-year
  // discrepancy does not disqualify a window that starts in October 2016.
  const checked = entry.annualReconciliation.filter(
    (row) => row.year > Number(entry.latest.startDate.slice(0, 4)),
  );
  if (checked.length < 9) throw new Error(`${key}: incomplete reconciliation`);
  const difference = Math.max(
    ...checked.map((row) => Math.abs(row.difference)),
  );
  const proxy = key === 'cathie';
  if (!proxy && difference > 0.5)
    throw new Error(`${key}: investigate an annual discrepancy above 0.5 pp`);
  if (Date.parse(asOf) - Date.parse(entry.latest.endDate) > 5 * day)
    throw new Error(`${key}: stale daily history`);
  records[key] = {
    status: 'estimate',
    frequency: 'daily',
    basis: proxy ? 'market-price proxy' : 'total return',
    currency: 'USD',
    source: entry.source,
    sourceLabel: `${entry.symbol} · adjusted daily history`,
    retrievedOn: asOf,
    latest: entry.latest,
    method: entry.method,
    note: proxy
      ? 'ARKK market-price total-return proxy. The annual-return ranking uses fund NAV, so the two bases differ.'
      : 'Approximate total-return drawdown. Distribution adjustments, source precision and currency conversion can differ from issuer returns.',
    validation: {
      fullYearsChecked: checked.map((row) => row.year),
      maxAnnualDifferencePp: difference,
      originalStatus: entry.validationStatus,
    },
  };
}

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const rows = pershing.rows
  .filter((row) => Number(row.year) >= 2015)
  .map((row) => {
    const [date, month] = row.date.split(' ');
    const monthIndex = months.indexOf(month.slice(0, 3));
    const ytd = Number(row.ytd.replace('%', ''));
    if (monthIndex < 0 || !Number.isFinite(ytd))
      throw new Error('Invalid PSH observation');
    return {
      date: `${row.year}-${String(monthIndex + 1).padStart(2, '0')}-${date.padStart(2, '0')}`,
      ytd,
    };
  })
  .sort((a, b) => a.date.localeCompare(b.date));

// Chain published net YTD returns through each December. Raw NAV alone would
// count dividend payments as losses. YTD returns already include distributions.
let base = 100;
const points = rows.map((row) => {
  const value = base * (1 + row.ytd / 100);
  if (row.date.endsWith('12-31')) base = value;
  return { date: row.date, value };
});
for (let year = 2016; year <= 2025; year++) {
  const end = rows.find((row) => row.date === `${year}-12-31`);
  if (!end || Math.abs(end.ytd - annual.bill.returns[year - 2016]) > 0.051)
    throw new Error(`PSH ${year}: annual return does not reconcile`);
}
const endDate = points.at(-1).date;
if (Date.parse(asOf) - Date.parse(endDate) > 10 * day)
  throw new Error('Stale PSH weekly history');
const requestedStartDate = `${Number(endDate.slice(0, 4)) - 10}${endDate.slice(4)}`;
const opening = points.findLast((point) => point.date <= requestedStartDate);
if (
  !opening ||
  Date.parse(requestedStartDate) - Date.parse(opening.date) > 10 * day
)
  throw new Error('Incomplete PSH ten-year window');
const weekly = points.filter((point) => point.date >= opening.date);
if (
  weekly.length < 480 ||
  weekly.some(
    (point, i) =>
      i && Date.parse(point.date) - Date.parse(weekly[i - 1].date) > 17 * day,
  )
)
  throw new Error('Incomplete weekly PSH observations');
records.bill = {
  status: 'estimate',
  frequency: 'weekly',
  basis: 'NAV total return',
  currency: 'USD',
  source: pershing.source,
  sourceLabel: 'Pershing Square Holdings · weekly NAV returns',
  retrievedOn: asOf,
  latest: { ...maximumDrawdown(weekly), requestedStartDate },
  method:
    'Published net-of-fees USD YTD returns chained through each calendar year-end. Includes weekly and month-end observations and reinvested distributions.',
  note: 'Weekly estimate from returns rounded to 0.1%. Peaks and losses between reporting dates are not captured.',
  validation: {
    fullYearsChecked: Array.from({ length: 10 }, (_, i) => 2016 + i),
    maxAnnualDifferencePp: 0,
  },
};

const unavailable = {
  loeb: 'Monthly reports are available, but a continuous ten-year history for this exact Offshore Fund record has not yet been assembled.',
  pabrai:
    'A continuous daily or weekly NAV history has not been established for Pabrai Investment Fund 3.',
  carl: 'A continuous daily or weekly history has not been established for the Icahn investment-fund composite. IEP share prices measure a different investment.',
};
for (const [key, reason] of Object.entries(unavailable))
  records[key] = {
    status: 'unavailable',
    reason,
    source: annual[key].source,
    retrievedOn: asOf,
  };

const output = {
  retrievedOn: asOf,
  window:
    'Trailing ten years through each source’s latest completed observation; opening observation on or immediately before the anniversary.',
  records,
};
await writeFile(
  new URL('../src/data/card-drawdowns.json', import.meta.url),
  JSON.stringify(output, null, 2) + '\n',
);
for (const [key, entry] of Object.entries(records))
  console.log(
    `${key}: ${entry.latest?.value.toFixed(1) ?? '—'}% · ${entry.frequency ?? entry.status} · ${entry.latest?.endDate ?? ''}`,
  );
