import {
  rankedById,
  benchmarkReturns,
  benchmarkStats,
  accumulate,
  fmt,
  dollars,
} from '../lib/performance.js';
import { mountPortrait } from './portraits.js';
const root = document.getElementById('design-nine');
const $ = (selector) => root.querySelector(selector);
const requested = new URLSearchParams(location.search).get('investor');
const state = {
  selected: rankedById[requested] ? requested : 'bill',
  years: 10,
};
function drawChart() {
  const svg = $('.performance-chart'),
    w = Math.round(svg.clientWidth);
  if (w < 80) return;
  const { selected, years } = state,
    d = rankedById[selected],
    values = accumulate(d.returns.slice(-years)),
    benchmark = accumulate(benchmarkReturns.slice(-years));
  const h = w < 340 ? 232 : 262,
    p = { l: 52, r: 9, t: 22, b: 44 },
    maximum = Math.max(...values, ...benchmark) * 1.08;
  const step =
      maximum > 80000
        ? 25000
        : maximum > 35000
          ? 10000
          : maximum > 17000
            ? 5000
            : 2500,
    max = Math.ceil(maximum / step) * step;
  const x = (i) => p.l + (i * (w - p.l - p.r)) / years,
    y = (v) => h - p.b - (v / max) * (h - p.t - p.b);
  const path = (a) =>
    a
      .map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`)
      .join(' ');
  const ticks = Array.from(
      { length: Math.floor(max / step) + 1 },
      (_, i) => i * step,
    ),
    positions =
      years === 1
        ? [0, 1]
        : w < 400
          ? [0, Math.floor(years / 2), years]
          : years === 10
            ? [0, 2, 4, 6, 8, 10]
            : [0, 1, 2, 3, 4, 5];
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.style.height = h + 'px';
  svg.setAttribute(
    'aria-label',
    `Growth of ten thousand US dollars, December ${2025 - years} to December 2025. ${d.name}, ${d.vehicle}: ${dollars(values.at(-1))}. SPY ETF: ${dollars(benchmark.at(-1))}. Annual total returns with distributions reinvested.`,
  );
  svg.innerHTML = `<title>${d.name} versus SPY ETF</title><desc>USD investment value. Only year-end observations are available; connecting lines do not show the path within each year.</desc><text x="${p.l}" y="11" fill="var(--soft)" font-size="11" font-family="IBM Plex Mono,monospace">USD</text>${ticks.map((v) => `<line x1="${p.l}" x2="${w - p.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width=".7" opacity=".5"/><text x="${p.l - 8}" y="${y(v) + 4}" fill="var(--soft)" font-family="IBM Plex Mono,monospace" font-size="11" text-anchor="end">$${v / 1000}k</text>`).join('')}<path d="${path(benchmark)} L${x(years)},${h - p.b} L${x(0)},${h - p.b} Z" fill="var(--accent)" opacity=".065"/><path d="${path(benchmark)}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/><path d="${path(values)}" fill="none" stroke="var(--investor)" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>${positions.map((i) => `<text x="${x(i)}" y="${h - 24}" fill="var(--soft)" font-size="11" font-family="IBM Plex Mono,monospace" text-anchor="${i === 0 ? 'start' : i === years ? 'end' : 'middle'}">${2025 - years + i}</text>`).join('')}<text x="${w - p.r}" y="${h - 4}" fill="var(--soft)" font-size="11" font-family="IBM Plex Mono,monospace" text-anchor="end">Year-end</text>${benchmark.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="2.5" fill="var(--accent)"/>`).join('')}${values.map((v, i) => `<rect x="${x(i) - 2.3}" y="${y(v) - 2.3}" width="4.6" height="4.6" fill="var(--investor)"/>`).join('')}<line class="hover-guide" x1="0" x2="0" y1="${p.t}" y2="${h - p.b}" stroke="var(--soft)" opacity="0"/><rect class="chart-hit" x="${p.l}" y="${p.t}" width="${w - p.l - p.r}" height="${h - p.t - p.b}" fill="transparent"/>`;
  const readout = (i) =>
    ($('.chart-readout').innerHTML =
      `<span>DEC ${2025 - years + i}</span><span>SPY ${dollars(benchmark[i])} · ${d.vehicle.split(' · ')[0]} ${dollars(values[i])}</span>`);
  readout(years);
  const hit = svg.querySelector('.chart-hit');
  const point = (e) => {
    const box = svg.getBoundingClientRect(),
      i = Math.max(
        0,
        Math.min(
          years,
          Math.round(
            ((((e.clientX - box.left) * w) / box.width - p.l) /
              (w - p.l - p.r)) *
              years,
          ),
        ),
      ),
      guide = svg.querySelector('.hover-guide');
    guide.setAttribute('x1', x(i));
    guide.setAttribute('x2', x(i));
    guide.setAttribute('opacity', '.5');
    readout(i);
  };
  hit.addEventListener('pointermove', point);
  hit.addEventListener('pointerdown', point);
  hit.addEventListener('pointerleave', () => {
    svg.querySelector('.hover-guide').setAttribute('opacity', '0');
    readout(years);
  });
}
function update() {
  const d = rankedById[state.selected],
    n = state.years,
    s = d.stats[n];

  root
    .querySelectorAll('[data-horizon]')
    .forEach((el) =>
      el.setAttribute('aria-pressed', String(Number(el.dataset.horizon) === n)),
    );
  $('[data-investor-select]').value = d.key;
  $('[data-chart-period]').textContent =
    (n === 1 ? '2025 season' : `${2026 - n}–2025`) + ' · Annual observations';
  $('[data-chart-legend]').textContent = d.vehicle;
  $('[data-record-name]').textContent = d.name;
  $('[data-record-vehicle]').textContent = d.vehicle;
  const portrait = $('[data-record-portrait]');
  portrait.dataset.person = d.key;
  mountPortrait(portrait);
  $('[data-record-tier]').textContent = '10Y · ' + d.tier.toUpperCase();
  $('[data-record-tier]').dataset.tier = d.tier;
  $('[data-return-label]').textContent =
    n === 1 ? '1Y season return' : `${n}Y annualized return`;
  $('[data-spy-label]').textContent =
    n === 1 ? 'SPY · 1Y season' : `SPY · ${n}Y annualized`;
  $('[data-record-return]').textContent = fmt(s.value) + '%';
  $('[data-record-benchmark]').textContent = fmt(benchmarkStats[n]) + '%';
  $('[data-gap-label]').textContent =
    `${n}Y ${s.tier === 'unrated' ? 'GAP' : s.gap >= 0 ? 'ADVANTAGE' : 'SHORTFALL'} VS SPY`;
  $('[data-record-gap]').innerHTML =
    `${fmt(s.gap, 2)} <small>${n === 1 ? 'pp' : 'pp / year'}</small>`;
  $('[data-result]').textContent =
    s.tier === 'unrated'
      ? 'TOO CLOSE TO RATE FROM ROUNDED DATA'
      : s.gap >= 0
        ? 'AHEAD OF THE BENCHMARK'
        : 'BEHIND THE BENCHMARK';
  $('[data-consistency]').textContent =
    d.windows.filter((v) => v.gap > 0).length + ' / 6';
  $('[data-record-detail]').innerHTML =
    `<p><b>${d.windows.filter((v) => v.gap > 0).length} of six rolling five-year windows ahead of SPY.</b> Annualized gaps, with windows ending each December:</p><div class="rolling-windows">${d.windows.map((v) => `<span><small>${v.start}–${v.end}</small><b class="${v.gap >= 0 ? 'up' : 'down'}">${fmt(v.gap, 2)} pp/yr</b></span>`).join('')}</div><p>These windows overlap; they are not independent tests of skill. Figures are approximate. The frame always uses the full 10-year result, even when viewing a shorter period.</p><p><b>Maximum drawdown: not yet verified.</b> Annual observations miss intra-year losses; a daily total-return series is required. ${d.detail ? d.detail : d.key === 'joel' ? 'GINDX is co-managed with Robert Goldstein and uses a leveraged long/short overlay.' : d.key === 'bill' ? 'PSH uses leverage; NAV returns differ from its traded shares. Its 5Y rarity is Unrated because rounded source data cannot establish which side of zero the gap falls on.' : d.key === 'cathie' ? 'ARKK is a concentrated thematic fund.' : d.key === 'peter' ? 'EPIVX is EuroPac International Value Class A NAV, excluding its initial sales charge. Schiff is affiliated with the adviser; James Nelson and Luke Allen manage the fund. This is an international strategy, with a different investment mandate from SPY.' : d.key === 'carl' ? 'These are Icahn’s investment-fund composite returns, net of expenses. They are not IEP shareholder returns or his personal returns.' : 'Berkshire is a conglomerate, not a fund.'}</p>${d.key === 'warren' ? '<p><b>Legacy · 1965–2025:</b> Berkshire 19.7% per year versus the S&amp;P 500 with dividends at 10.5% per year. This separately dated career record does not change the 10Y rarity. SPY did not exist for the full career period.</p>' : ''}`;
  if (d.method)
    $('[data-record-detail]').innerHTML +=
      `<p><b>Data basis.</b> ${d.method}</p><p><a href="${d.source}" target="_blank" rel="noopener noreferrer">${d.sourceLabel} ↗</a> · ${d.dataSources.map((s) => `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} ↗</a>`).join(' · ')}</p><a class="profile-source" href="/investors/${d.key}/">About ${d.name} ↗</a>`;
  $('[data-record-gap]').className = s.gap >= 0 ? 'up' : 'down';
  drawChart();
}

$('[data-investor-select]').addEventListener('change', (e) => {
  state.selected = e.target.value;
  update();
});
root.querySelectorAll('[data-horizon]').forEach((button) =>
  button.addEventListener('click', () => {
    state.years = Number(button.dataset.horizon);
    update();
  }),
);
new ResizeObserver(drawChart).observe($('.record-chart'));
const cards = Array.from($('[data-card-deck]').children),
  pageSize = 6,
  pageCount = Math.ceil(cards.length / pageSize);
let rosterPage = 0;
function updateRosterPage() {
  cards.forEach(
    (card, i) => (card.hidden = Math.floor(i / pageSize) !== rosterPage),
  );
  $('[data-roster-range]').textContent =
    `${rosterPage * pageSize + 1}–${Math.min(cards.length, (rosterPage + 1) * pageSize)} of ${cards.length} investors`;
  $('[data-roster-prev]').disabled = rosterPage === 0;
  $('[data-roster-next]').disabled = rosterPage === pageCount - 1;
}
$('[data-roster-prev]').addEventListener('click', () => {
  rosterPage = Math.max(0, rosterPage - 1);
  updateRosterPage();
  $('#nine-arena-contenders').scrollIntoView();
});
$('[data-roster-next]').addEventListener('click', () => {
  rosterPage = Math.min(pageCount - 1, rosterPage + 1);
  updateRosterPage();
  $('#nine-arena-contenders').scrollIntoView();
});
$('.roster-pagination').hidden = false;
updateRosterPage();
const leaderboard = $('[data-top-leaderboard]'),
  benchmarkLine = $('.leaderboard-reference-line');
function positionBenchmarkLine() {
  const tracks = leaderboard.querySelectorAll('.bar-track'),
    bounds = leaderboard.getBoundingClientRect();
  const first = tracks[0].getBoundingClientRect(),
    last = tracks[tracks.length - 1].getBoundingClientRect();
  benchmarkLine.style.left =
    first.left -
    bounds.left +
    (first.width * Number(leaderboard.dataset.benchmarkPosition)) / 100 +
    'px';
  benchmarkLine.style.top = first.top - bounds.top + 'px';
  benchmarkLine.style.height = last.bottom - first.top + 'px';
}
const observer = new ResizeObserver(positionBenchmarkLine);
observer.observe(leaderboard);
leaderboard
  .querySelectorAll('.bar-row')
  .forEach((row) => observer.observe(row));
update();
