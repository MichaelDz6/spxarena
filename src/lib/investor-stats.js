import approvedDrawdowns from '../data/drawdowns.json' with { type: 'json' };
// Only publish daily datasets after recording redistribution permission.
/** @type {Record<string, any>} */
const dailyDrawdowns = approvedDrawdowns;
import { accumulate, benchmarkReturns, fmt } from './performance.js';
import { maximumDrawdown } from './drawdown.js';

const percent = (value) => (value === 0 ? '0.0%' : `${fmt(value)}%`);
const tone = (value) =>
  value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
const dateLabel = (date, frequency) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'short',
    ...(frequency === 'daily' ? { day: 'numeric' } : {}),
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`));

export function annualStatistics(returns, startYear, benchmark) {
  if (!returns?.length) return null;
  const values = accumulate(returns);
  const years = returns.map((value, index) => ({
    value,
    year: startYear + index,
  }));
  return {
    total: (values.at(-1) / values[0] - 1) * 100,
    best: years.reduce((a, b) => (b.value > a.value ? b : a)),
    worst: years.reduce((a, b) => (b.value < a.value ? b : a)),
    positive: returns.filter((value) => value > 0).length,
    ahead: benchmark
      ? returns.filter((value, index) => value > benchmark[index]).length
      : null,
    drawdown: maximumDrawdown(
      values.map((value, index) => ({
        date: `${startYear - 1 + index}-12-31`,
        value,
      })),
    ),
  };
}

function drawdownDisplay(drawdown, frequency) {
  if (!drawdown)
    return {
      value: '—',
      magnitude: 0,
      dates: 'Return record unavailable',
      recovery: 'A comparable history is needed.',
    };
  return {
    value: percent(drawdown.value),
    magnitude: Math.abs(drawdown.value),
    dates: drawdown.peakDate
      ? `${dateLabel(drawdown.peakDate, frequency)} → ${dateLabel(drawdown.troughDate, frequency)}`
      : `No decline between ${frequency === 'daily' ? 'daily closes' : 'year-end observations'}`,
    recovery: drawdown.peakDate
      ? drawdown.recoveryDate
        ? `Recovered by ${dateLabel(drawdown.recoveryDate, frequency)}`
        : 'Not recovered by Dec 2025'
      : frequency === 'daily'
        ? 'Intraday losses are not measured.'
        : 'This does not mean there were no losses within a year.',
  };
}

export function investorStatistics(record, years = 10) {
  if (![1, 5, 10].includes(years))
    throw new RangeError('Choose a 1, 5 or 10-year period.');
  const startYear = 2026 - years;
  const benchmark = benchmarkReturns.slice(-years);
  const investor = annualStatistics(
    record?.returns.slice(-years),
    startYear,
    benchmark,
  );
  const market = annualStatistics(benchmark, startYear);
  const daily = record ? dailyDrawdowns[record.key] : null;
  // Match observation frequency on both sides. Never compare a daily investor
  // drawdown with a year-end benchmark drawdown, or substitute another vehicle.
  const frequency = daily && dailyDrawdowns.benchmark ? 'daily' : 'annual';
  const investorDrawdown = daily?.periods[years] ?? investor?.drawdown ?? null;
  const marketDrawdown =
    frequency === 'daily'
      ? dailyDrawdowns.benchmark.periods[years]
      : market.drawdown;
  const missing = {
    value: '—',
    detail: 'Return record unavailable',
    tone: 'neutral',
  };
  const metric = (value, detail, signed = true) => ({
    value: signed ? percent(value) : value,
    detail,
    tone: signed ? tone(value) : 'neutral',
  });
  const rows = [
    {
      key: 'total',
      label: 'Total return',
      description:
        'Growth over the whole period, with distributions reinvested.',
      investor: investor
        ? metric(investor.total, `${years}-year cumulative`)
        : missing,
      benchmark: metric(market.total, `${years}-year cumulative`),
    },
    {
      key: 'best',
      label: 'Best year',
      description:
        'Highest calendar-year return in the selected period; earliest year shown if tied.',
      investor: investor
        ? metric(investor.best.value, String(investor.best.year))
        : missing,
      benchmark: metric(market.best.value, String(market.best.year)),
    },
    {
      key: 'worst',
      label: 'Worst year',
      description:
        'Lowest calendar-year return in the selected period; earliest year shown if tied.',
      investor: investor
        ? metric(investor.worst.value, String(investor.worst.year))
        : missing,
      benchmark: metric(market.worst.value, String(market.worst.year)),
    },
    {
      key: 'positive',
      label: 'Positive years',
      description: 'Calendar years with a return above zero.',
      investor: investor
        ? metric(`${investor.positive} / ${years}`, 'Years with a gain', false)
        : missing,
      benchmark: metric(
        `${market.positive} / ${years}`,
        'Years with a gain',
        false,
      ),
    },
    {
      key: 'ahead',
      label: 'Years beating SPX',
      description:
        'Calendar years with a higher return than SPY. Ties are excluded.',
      investor: investor
        ? metric(`${investor.ahead} / ${years}`, 'Calendar-year wins', false)
        : missing,
      benchmark: metric('—', 'Comparison baseline', false),
    },
  ];
  return {
    years,
    startYear,
    frequency,
    period:
      years === 1 ? '2025 · 1 YEAR' : `${startYear}–2025 · ${years} YEARS`,
    title:
      frequency === 'daily' ? 'Maximum drawdown' : 'Maximum year-end drawdown',
    basis:
      frequency === 'daily'
        ? 'DAILY CLOSES · ESTIMATE'
        : 'YEAR-END OBSERVATIONS ONLY',
    note:
      frequency === 'daily'
        ? 'Largest peak-to-trough drop within the selected period, estimated from adjusted daily closes. Intraday losses may be larger.'
        : 'This comparison measures only the largest drop between year-end values; losses within a year can be much larger. The latest card estimate, where available, is described separately below.',
    investorDrawdown: drawdownDisplay(investorDrawdown, frequency),
    benchmarkDrawdown: drawdownDisplay(marketDrawdown, frequency),
    dailySource: daily,
    benchmarkSource: dailyDrawdowns.benchmark,
    rows,
  };
}
