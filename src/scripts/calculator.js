import { scaleLinear } from 'd3-scale';
import { line, area as areaShape } from 'd3-shape';
import monthlyData from '../data/spy-monthly-prices.json';
import { calculateHistory, defaultCalculator } from '../lib/calculator.js';
import { dollars } from '../lib/performance.js';
const root = document.getElementById('design-nine');
const $ = (selector) => root.querySelector(selector);
const state = { calculator: { ...defaultCalculator } };
const fullMonth = (m) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(m + '-01T00:00:00Z'));
let calculation = calculateHistory(monthlyData.prices, state.calculator);
const form = $('[data-calculator-form]');
function syncCalculatorForm() {
  for (const [key, value] of Object.entries(state.calculator))
    form.elements.namedItem(key).value = value;
}
function drawCalculator() {
  const svg = $('[data-calc-chart]'),
    w = Math.round(svg.clientWidth);
  if (w < 80) return;
  const h = 270,
    p = { l: 58, r: 12, t: 20, b: 43 },
    pts = calculation.points;
  const yMaximum =
    Math.max(1, ...pts.map((d) => Math.max(d.value, d.invested))) * 1.08;
  const x = scaleLinear()
    .domain([0, pts.length - 1])
    .range([p.l, w - p.r]);
  const y = scaleLinear()
    .domain([0, yMaximum])
    .nice(4)
    .range([h - p.b, p.t]);
  const ticks = y.ticks(4);
  const labelIndexes = [
    0,
    Math.floor((pts.length - 1) / 2),
    pts.length - 1,
  ].filter((v, i, a) => a.indexOf(v) === i);
  const dateLabel = (i) => fullMonth(pts[i].month);
  const path = (key) =>
    line()
      .x((d, i) => x(i))
      .y((d) => y(d[key]))(pts);
  const area = areaShape()
    .x((d, i) => x(i))
    .y0(y(0))
    .y1((d) => y(d.value))(pts);
  const shortMoney = (v) =>
    v >= 1000000
      ? '$' + (v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1) + 'm'
      : v >= 1000
        ? '$' + (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'k'
        : '$' + Math.round(v);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.style.height = h + 'px';
  svg.setAttribute(
    'aria-label',
    `Historical SPY investment from ${fullMonth(state.calculator.start)} through ${fullMonth(state.calculator.end)}. Final value ${dollars(calculation.value)}, contributions ${dollars(calculation.invested)}, investment gain or loss ${dollars(calculation.gain)}.`,
  );
  svg.innerHTML = `<title>SPY historical investment journey</title><desc>Monthly portfolio value compared with cumulative contributions, in US dollars. Dividends reinvested.</desc><text x="${p.l}" y="11" fill="var(--soft)" font-size="11">USD</text>${ticks.map((v) => `<line x1="${p.l}" x2="${w - p.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width=".7"/><text x="${p.l - 9}" y="${y(v) + 4}" fill="var(--soft)" font-size="11" text-anchor="end">${shortMoney(v)}</text>`).join('')}<path d="${area}" fill="var(--brand)" opacity=".055"/><path d="${path('value')}" fill="none" stroke="var(--brand)" stroke-width="2"/><path d="${path('invested')}" fill="none" stroke="#af954f" stroke-width="1.5" stroke-dasharray="5 4"/>${labelIndexes.map((i, j) => `<text x="${x(i)}" y="${h - 24}" fill="var(--soft)" font-size="11" text-anchor="${j === 0 ? 'start' : j === labelIndexes.length - 1 ? 'end' : 'middle'}">${dateLabel(i)}</text>`).join('')}<text x="${w - p.r}" y="${h - 5}" fill="var(--soft)" font-size="11" text-anchor="end">Month-end</text><line data-calc-guide y1="${p.t}" y2="${h - p.b}" stroke="var(--soft)" visibility="hidden"/><circle data-value-dot r="3" fill="var(--brand)" visibility="hidden"/><circle data-invested-dot r="3" fill="#af954f" visibility="hidden"/><rect data-chart-hit data-chart-hover-overlay="cross-series" x="${p.l}" y="${p.t}" width="${w - p.l - p.r}" height="${h - p.t - p.b}" fill="transparent"/>`;
  const tooltip = $('[data-calc-tooltip]');
  tooltip.hidden = true;
  const hit = svg.querySelector('[data-chart-hit]');
  const show = (e) => {
    const box = svg.getBoundingClientRect(),
      position = Math.max(
        0,
        Math.min(
          pts.length - 1,
          x.invert(((e.clientX - box.left) * w) / box.width),
        ),
      );
    const i = Math.min(pts.length - 2, Math.floor(position)),
      fraction = position - i;
    const interpolate = (key) =>
      pts[i][key] + (pts[i + 1][key] - pts[i][key]) * fraction;
    const cx = x(position),
      guide = svg.querySelector('[data-calc-guide]');
    guide.setAttribute('x1', cx);
    guide.setAttribute('x2', cx);
    guide.setAttribute('visibility', 'visible');
    ['value', 'invested'].forEach((key) => {
      const dot = svg.querySelector(`[data-${key}-dot]`);
      dot.setAttribute('cx', cx);
      dot.setAttribute('cy', y(interpolate(key)));
      dot.setAttribute('visibility', 'visible');
    });
    tooltip.innerHTML = `<strong>${fullMonth(pts[i].month)} – ${fullMonth(pts[i + 1].month)}</strong>Portfolio ≈ ${dollars(interpolate('value'))}<br>Contributions ≈ ${dollars(interpolate('invested'))}<br><small>Between monthly observations</small>`;
    tooltip.hidden = false;
    tooltip.style.left = Math.max(0, Math.min(w - 205, cx + 12)) + 'px';
  };
  hit.addEventListener('pointermove', show);
  hit.addEventListener('pointerdown', show);
  hit.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    tooltip.hidden = true;
    svg
      .querySelectorAll(
        '[data-calc-guide],[data-value-dot],[data-invested-dot]',
      )
      .forEach((el) => el.setAttribute('visibility', 'hidden'));
  });
}
function updateCalculator() {
  calculation = calculateHistory(monthlyData.prices, state.calculator);
  $('[data-calc-period]').textContent =
    fullMonth(state.calculator.start) + ' – ' + fullMonth(state.calculator.end);
  $('[data-calc-value]').textContent = dollars(calculation.value);
  $('[data-calc-invested]').textContent = dollars(calculation.invested);
  $('[data-calc-gain]').textContent =
    (calculation.gain < 0 ? '−' : '+') + dollars(Math.abs(calculation.gain));
  $('[data-calc-gain]').className = calculation.gain >= 0 ? 'up' : 'down';
  root
    .querySelectorAll('[data-calc-value],[data-calc-invested],[data-calc-gain]')
    .forEach((el) =>
      el.classList.toggle('large-amount', el.textContent.length > 10),
    );
  $('[data-calc-summary]').textContent =
    `${calculation.months} monthly additions of ${dollars(state.calculator.monthly)} · dividends reinvested`;
  drawCalculator();
}
function applyCalculation(e) {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const inputs = new FormData(form);
  const next = {
    initial: Number(inputs.get('initial')),
    monthly: Number(inputs.get('monthly')),
    start: inputs.get('start'),
    end: inputs.get('end'),
    timing: inputs.get('timing'),
  };
  try {
    calculateHistory(monthlyData.prices, next);
    state.calculator = next;
    $('[data-calculator-error]').hidden = true;
    updateCalculator();
  } catch (error) {
    $('[data-calculator-error]').textContent = error.message;
    $('[data-calculator-error]').hidden = false;
  }
}

form.addEventListener('submit', applyCalculation);
new ResizeObserver(drawCalculator).observe($('.calculator-result'));
syncCalculatorForm();
updateCalculator();
