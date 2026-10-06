import { scaleLinear } from 'd3-scale';
import { line, area } from 'd3-shape';
import { formatDuration, formatMoney } from './calculator.js';

export const compactMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
}).format;

export const chartMonthLabel = (month) =>
  month === 0
    ? 'Today'
    : month % 12 === 0
      ? `${month / 12} yr`
      : `${Math.floor(month / 12) ? `${Math.floor(month / 12)}y ` : ''}${month % 12}m`;

export function projectionPaths(geometry) {
  const path = (key) =>
    line()
      .x((point) => point.x)
      .y((point) => point[key])(geometry.points);
  return {
    value: path('value'),
    invested: path('invested'),
    fill: area()
      .x((point) => point.x)
      .y0(geometry.baseline)
      .y1((point) => point.value)(geometry.points),
  };
}

// A fixed number of samples lets curves morph even when the duration changes.
export function interpolateChartGeometry(from, to, progress) {
  const mix = (a, b) => a + (b - a) * progress;
  return {
    baseline: mix(from.baseline, to.baseline),
    maximum: mix(from.maximum, to.maximum),
    months: mix(from.months, to.months),
    points: to.points.map((point, index) => ({
      x: mix(from.points[index].x, point.x),
      value: mix(from.points[index].value, point.value),
      invested: mix(from.points[index].invested, point.invested),
    })),
  };
}

export function createProjectionChart(calculation, width = 700, height = 280) {
  const padding = { left: 58, right: 12, top: 22, bottom: 34 };
  const { points, months } = calculation;
  const x = scaleLinear()
    .domain([0, Math.max(1, months)])
    .range([padding.left, width - padding.right]);
  const maximum = Math.max(
    1,
    ...points.map((point) => Math.max(point.value, point.invested)),
  );
  const y = scaleLinear()
    .domain([0, maximum * 1.08])
    .nice(4)
    .range([height - padding.bottom, padding.top]);
  const geometry = {
    baseline: y(0),
    maximum: y.domain()[1],
    months,
    points: Array.from({ length: 129 }, (_, index) => {
      const month = (months * index) / 128;
      const before = points[Math.floor(month)];
      const after = points[Math.min(months, Math.ceil(month))];
      const fraction = month - Math.floor(month);
      const value = (key) =>
        before[key] + (after[key] - before[key]) * fraction;
      return {
        x: x(month),
        value: y(value('value')),
        invested: y(value('invested')),
      };
    }),
  };
  const paths = projectionPaths(geometry);
  const last = geometry.points.at(-1);
  const description = `Estimated portfolio value and cumulative contributions in US dollars ${months ? `over ${formatDuration(months).toLowerCase()}` : 'today'}, using a constant average return. Final value ${formatMoney(calculation.value)}; total contributions ${formatMoney(calculation.invested)}.`;
  const markup = `<title>Projected investment growth</title><desc>${description}</desc>
    <text x="${padding.left}" y="12" class="chart-axis-label">USD</text>
    ${Array.from({ length: 5 }, (_, index) => {
      const value = (geometry.maximum * index) / 4;
      return `<line x1="${padding.left}" x2="${width - padding.right}" y1="${y(value)}" y2="${y(value)}" class="chart-grid"/><text data-axis-value="${index}" x="${padding.left - 9}" y="${y(value) + 4}" text-anchor="end" class="chart-axis-label">${compactMoney(value)}</text>`;
    }).join('')}
    <path d="${paths.fill}" data-projection-fill class="projection-fill"/>
    <path d="${paths.value}" data-portfolio-path class="projection-line"/>
    <path d="${paths.invested}" data-contributions-path class="contributions-line"/>
    <circle data-projection-halo cx="${last.x}" cy="${last.value}" r="8" class="projection-halo"/>
    <circle data-projection-endpoint cx="${last.x}" cy="${last.value}" r="3.5" class="projection-endpoint"/>
    ${[0, 0.5, 1]
      .map((fraction, index) => {
        const month = Math.round(months * fraction);
        const visible = index === 0 || (index === 1 ? months > 1 : months > 0);
        return `<text data-axis-month="${fraction}" x="${x(months * fraction)}" y="${height - 10}" text-anchor="${index === 0 ? 'start' : index === 2 ? 'end' : 'middle'}" opacity="${visible ? 1 : 0}" class="chart-axis-label">${chartMonthLabel(month)}</text>`;
      })
      .join('')}
    <line data-calc-guide y1="${padding.top}" y2="${height - padding.bottom}" class="chart-guide" visibility="hidden"/>
    <circle data-value-dot r="4" class="projection-endpoint" visibility="hidden"/>
    <circle data-invested-dot r="4" class="contributions-dot" visibility="hidden"/>`;
  return { markup, description, geometry, width, height, x, y };
}
