import {
  accumulate,
  benchmarkReturns,
  benchmarkStats,
  cagr,
  dollars,
} from './performance.js';

export function investorComparison(record, years = 10) {
  if (![1, 5, 10].includes(years))
    throw new RangeError('Choose a 1, 5 or 10-year period.');
  const benchmark = accumulate(benchmarkReturns.slice(-years));
  const investor = record ? accumulate(record.returns.slice(-years)) : null;
  const annualized = record ? cagr(record.returns.slice(-years)) : null;
  return {
    years,
    startYear: 2026 - years,
    benchmark,
    investor,
    annualized,
    benchmarkAnnualized: benchmarkStats[years],
    gap: record ? annualized - benchmarkStats[years] : null,
    difference: record ? investor.at(-1) - benchmark.at(-1) : null,
  };
}

// Render the actual year-end observations, including the initial $10,000.
// Straight segments deliberately avoid inventing an intra-year return path.
export function createInvestorChart(comparison, width = 900) {
  width = Math.max(260, Math.round(width));
  const height = width < 500 ? 250 : 310;
  const padding = {
    left: width < 500 ? 45 : 58,
    right: 15,
    top: 25,
    bottom: 35,
  };
  const { benchmark, investor, years } = comparison;
  const peak = Math.max(...benchmark, ...(investor || [])) * 1.08;
  const magnitude = 10 ** Math.floor(Math.log10(peak / 4));
  const step =
    [1, 2, 2.5, 5, 10].find((n) => n * magnitude >= peak / 4) * magnitude;
  const maximum = Math.ceil(peak / step) * step;
  const x = (i) =>
    padding.left + (i / years) * (width - padding.left - padding.right);
  const y = (value) =>
    height -
    padding.bottom -
    (value / maximum) * (height - padding.top - padding.bottom);
  const path = (values) =>
    values
      .map(
        (value, i) =>
          `${i ? 'L' : 'M'}${x(i).toFixed(2)},${y(value).toFixed(2)}`,
      )
      .join(' ');
  const positions =
    years === 1
      ? [0, 1]
      : width < 500
        ? [0, Math.floor(years / 2), years]
        : Array.from({ length: 6 }, (_, i) => (years === 10 ? i * 2 : i));
  const markup = `
    <defs><linearGradient id="profile-spy-gold" x1="0%" y1="0%" x2="25%" y2="100%"><stop offset="8%" stop-color="var(--premium-gold-light)"/><stop offset="32%" stop-color="var(--premium-gold-soft)"/><stop offset="51%" stop-color="var(--premium-gold-deep)"/><stop offset="69%" stop-color="var(--premium-gold-glint)"/><stop offset="92%" stop-color="var(--premium-gold-mid)"/></linearGradient></defs>
    <text x="${padding.left}" y="12" class="profile-chart-axis">USD</text>
    ${Array.from({ length: Math.round(maximum / step) + 1 }, (_, i) => {
      const value = i * step;
      return `<line x1="${padding.left}" x2="${width - padding.right}" y1="${y(value)}" y2="${y(value)}" class="profile-chart-grid"/><text x="${padding.left - 9}" y="${y(value) + 4}" text-anchor="end" class="profile-chart-axis">$${value / 1000}k</text>`;
    }).join('')}
    <path d="${path(benchmark)} L${x(years)},${y(0)} L${x(0)},${y(0)} Z" class="profile-benchmark-fill"/>
    <path d="${path(benchmark)}" class="profile-benchmark-edge"/>
    <path d="${path(benchmark)}" class="profile-benchmark-line"/>
    ${investor ? `<path d="${path(investor)}" class="profile-investor-line"/>` : ''}
    ${benchmark.map((value, i) => `<circle cx="${x(i)}" cy="${y(value)}" r="3" class="profile-benchmark-dot"/>`).join('')}
    ${investor ? investor.map((value, i) => `<rect x="${x(i) - 2.5}" y="${y(value) - 2.5}" width="5" height="5" class="profile-investor-dot"/>`).join('') : ''}
    ${positions.map((i) => `<text x="${x(i)}" y="${height - 10}" text-anchor="${i === 0 ? 'start' : i === years ? 'end' : 'middle'}" class="profile-chart-axis">${comparison.startYear - 1 + i}</text>`).join('')}
    <line data-profile-guide y1="${padding.top}" y2="${height - padding.bottom}" class="profile-chart-guide" visibility="hidden"/>`;
  return { markup, width, height, x, padding };
}

export function comparisonDescription(comparison, vehicle) {
  return `Growth of $10,000, January ${comparison.startYear} to December 2025. SPX, measured through SPY: ${dollars(comparison.benchmark.at(-1))}.${comparison.investor ? ` ${vehicle}: ${dollars(comparison.investor.at(-1))}.` : ' No comparable investor return record is available.'} Year-end observations only.`;
}
