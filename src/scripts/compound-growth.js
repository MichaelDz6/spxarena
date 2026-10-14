import {
  compoundExample,
  compoundBalance,
  compoundPoint,
  compoundMoney,
} from '../lib/compound-example.js';

const figure = document.querySelector('[data-compound-example]');
if (figure) {
  const input = figure.querySelector('#compound-years');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let shownYear = compoundExample.years;
  let frame;

  function draw(year) {
    const value = compoundBalance(year);
    const point = compoundPoint(year);
    figure.querySelector('[data-compound-balance]').textContent =
      compoundMoney.format(value);
    figure.querySelector('[data-compound-gain]').textContent =
      `+${compoundMoney.format(value - compoundExample.initial)}`;
    figure
      .querySelector('[data-compound-clip]')
      .setAttribute('width', String(point.x - 42 + 4));
    const marker = figure.querySelector('[data-compound-marker]');
    marker.setAttribute('cx', String(point.x));
    marker.setAttribute('cy', String(point.y));
    const guide = figure.querySelector('[data-compound-guide]');
    guide.setAttribute('x1', String(point.x));
    guide.setAttribute('x2', String(point.x));
    guide.setAttribute('y1', String(point.y));
  }

  input.addEventListener('input', () => {
    const year = Number(input.value);
    const yearLabel = `${year} ${year === 1 ? 'year' : 'years'}`;
    figure.querySelector('[data-compound-year]').textContent = yearLabel;
    figure.querySelector('[data-compound-years-output]').textContent =
      yearLabel;
    input.setAttribute(
      'aria-valuetext',
      `${yearLabel}: ${compoundMoney.format(compoundBalance(year))}`,
    );
    cancelAnimationFrame(frame);
    const from = shownYear;
    const started = performance.now();
    function animate(now) {
      const progress = reducedMotion.matches
        ? 1
        : Math.min((now - started) / 280, 1);
      shownYear = from + (year - from) * (1 - (1 - progress) ** 3);
      draw(shownYear);
      if (progress < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
  });
  figure.querySelector('.compound-scrubber').hidden = false;
}
