import { rankedById, investorById, fmt, dollars } from '../lib/performance.js';
import { investorStatistics } from '../lib/investor-stats.js';
import {
  investorComparison,
  createInvestorChart,
  comparisonDescription,
} from '../lib/investor-chart.js';

const root = document.querySelector('[data-profile-comparison]');
if (root) {
  const record = rankedById[root.dataset.person];
  const profile = investorById[root.dataset.person];
  const $ = (selector) => root.querySelector(selector);
  const svg = $('[data-profile-chart]');
  let comparison = investorComparison(record);
  let chart;
  let selectedYear = comparison.years;
  let lastWidth = 0;

  function readYear(index, showGuide = true) {
    selectedYear = Math.max(0, Math.min(comparison.years, index));
    const guide = svg.querySelector('[data-profile-guide]');
    guide.setAttribute('x1', chart.x(selectedYear));
    guide.setAttribute('x2', chart.x(selectedYear));
    guide.setAttribute('visibility', showGuide ? 'visible' : 'hidden');
    $('[data-profile-readout]').textContent =
      `December ${comparison.startYear - 1 + selectedYear} · SPX ${dollars(comparison.benchmark[selectedYear])}${record ? ` · ${profile.name} ${dollars(comparison.investor[selectedYear])}` : ''}`;
  }

  function drawChart() {
    lastWidth = Math.round(svg.clientWidth);
    chart = createInvestorChart(comparison, lastWidth);
    svg.setAttribute('viewBox', `0 0 ${chart.width} ${chart.height}`);
    svg.setAttribute(
      'aria-label',
      comparisonDescription(comparison, record?.vehicle),
    );
    svg.innerHTML = chart.markup;
    readYear(comparison.years, false);
  }

  function update(years) {
    comparison = investorComparison(record, years);
    const stats = investorStatistics(record, years);
    $('[data-stats-period]').textContent = stats.period;
    for (const [key, value] of [
      ['investor', stats.investorDrawdown],
      ['benchmark', stats.benchmarkDrawdown],
    ]) {
      const result = $(`[data-drawdown="${key}"]`);
      result.querySelector('[data-drawdown-value]').textContent = value.value;
      result.querySelector('[data-drawdown-bar]').style.width =
        `${value.magnitude}%`;
      result.querySelector('[data-drawdown-dates]').textContent = value.dates;
      result.querySelector('[data-drawdown-recovery]').textContent =
        value.recovery;
    }
    for (const row of stats.rows) {
      for (const key of ['investor', 'benchmark']) {
        const cell = $(`[data-stat="${row.key}"] [data-stat-${key}]`);
        cell.querySelector('[data-stat-value]').textContent = row[key].value;
        cell.querySelector('[data-stat-value]').dataset.tone = row[key].tone;
        cell.querySelector('[data-stat-detail]').textContent = row[key].detail;
      }
    }
    $('[data-profile-start]').textContent = comparison.startYear;
    root
      .querySelectorAll('[data-profile-years]')
      .forEach((button) =>
        button.setAttribute(
          'aria-pressed',
          String(Number(button.dataset.profileYears) === years),
        ),
      );
    const unit = years === 1 ? 'in 2025' : 'per year';
    $('[data-profile-benchmark]').textContent = dollars(
      comparison.benchmark.at(-1),
    );
    $('[data-profile-benchmark-return]').textContent =
      `${fmt(comparison.benchmarkAnnualized)}% ${unit}`;
    if (record) {
      $('[data-profile-value]').textContent = dollars(
        comparison.investor.at(-1),
      );
      $('[data-profile-return]').textContent =
        `${fmt(comparison.annualized)}% ${unit}`;
      $('[data-profile-difference]').textContent =
        `${comparison.difference < 0 ? '−' : '+'}${dollars(Math.abs(comparison.difference))}`;
      $('[data-profile-difference]').className =
        comparison.difference >= 0 ? 'up' : 'down';
      $('[data-profile-gap]').textContent =
        `${fmt(comparison.gap, 2)} percentage points${years === 1 ? '' : ' / year'}`;
    }
    drawChart();
  }

  const point = (event) => {
    if (!chart) return;
    const bounds = svg.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * chart.width;
    readYear(
      Math.round(
        ((x - chart.padding.left) /
          (chart.width - chart.padding.left - chart.padding.right)) *
          comparison.years,
      ),
    );
  };
  svg.addEventListener('pointermove', point);
  svg.addEventListener('pointerdown', point);
  svg.addEventListener('pointerleave', () => readYear(comparison.years, false));
  svg.addEventListener('blur', () => readYear(comparison.years, false));
  svg.addEventListener('keydown', (event) => {
    const targets = {
      ArrowLeft: selectedYear - 1,
      ArrowRight: selectedYear + 1,
      Home: 0,
      End: comparison.years,
    };
    if (event.key in targets) {
      event.preventDefault();
      readYear(targets[event.key]);
    }
    if (event.key === 'Escape') readYear(comparison.years, false);
  });
  root
    .querySelectorAll('[data-profile-years]')
    .forEach((button) =>
      button.addEventListener('click', () =>
        update(Number(button.dataset.profileYears)),
      ),
    );
  drawChart();
  svg.setAttribute('tabindex', '0');
  $('[data-profile-periods]').hidden = false;
  $('[data-profile-chart-help]').hidden = false;
  new ResizeObserver(() => {
    if (Math.round(svg.clientWidth) !== lastWidth) drawChart();
  }).observe(svg);
}
