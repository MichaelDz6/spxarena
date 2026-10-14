import {
  riskScenarios,
  riskOutcome,
  riskMoney,
  riskPercent,
  startingValue,
} from '../lib/risk-scenarios.js';

const lab = document.querySelector('[data-risk-lab]');
if (lab) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = [...lab.querySelectorAll('[data-scenario]')];
  const playback = lab.querySelector('[data-risk-playback]');
  const takeaway = lab.querySelector('[data-risk-takeaway]');
  const duration = 8000;
  let current = riskScenarios.findIndex(
    (scenario) => scenario.id === lab.dataset.currentScenario,
  );
  const initialOutcome = riskOutcome(riskScenarios[current].returns);
  const currentValues = {
    single: initialOutcome.single.value,
    basket: initialOutcome.basket.value,
  };
  let playing = !reducedMotion.matches;
  let visible = false;
  let timer;
  let valueFrame;

  function render(index, manual = false) {
    current = index;
    const scenario = riskScenarios[index];
    const outcome = riskOutcome(scenario.returns);
    lab.dataset.currentScenario = scenario.id;
    buttons.forEach((button, i) =>
      button.setAttribute('aria-pressed', String(i === index)),
    );
    lab.querySelector('[data-scenario-title]').textContent = scenario.title;
    lab.querySelector('[data-scenario-description]').textContent =
      scenario.description;
    lab.querySelector('[data-scenario-change]').textContent = scenario.change;
    lab.querySelector('[data-scenario-metric-label]').textContent =
      scenario.metricLabel;

    cancelAnimationFrame(valueFrame);
    const from = { ...currentValues };
    const started = performance.now();
    function animateValues(now) {
      const progress = reducedMotion.matches
        ? 1
        : Math.min((now - started) / 650, 1);
      const eased = 1 - (1 - progress) ** 3;
      for (const kind of ['single', 'basket']) {
        currentValues[kind] =
          from[kind] + (outcome[kind].value - from[kind]) * eased;
        lab.querySelector(`[data-risk-value="${kind}"]`).textContent =
          riskMoney.format(currentValues[kind]);
        const loss = startingValue - currentValues[kind];
        lab.querySelector(`[data-risk-loss="${kind}"]`).textContent =
          progress === 1 && outcome[kind].change === 0
            ? 'Nothing lost'
            : `${riskMoney.format(loss)} lost`;
      }
      if (progress < 1) valueFrame = requestAnimationFrame(animateValues);
    }
    animateValues(started);

    for (const kind of ['single', 'basket']) {
      const result = outcome[kind];
      lab.querySelector(`[data-risk-bar="${kind}"]`).style.width =
        `${(result.value / startingValue) * 100}%`;
      const change = lab.querySelector(`[data-risk-change="${kind}"]`);
      change.textContent = riskPercent(result.change);
      change.classList.toggle('no-change', result.change === 0);
      lab
        .querySelector(`[data-risk-loss="${kind}"]`)
        .classList.toggle('no-change', result.change === 0);
      lab
        .querySelector(`[data-risk-value="${kind}"]`)
        .classList.toggle('value-wiped-out', result.value === 0);
    }
    lab.querySelectorAll('[data-risk-holding]').forEach((tile) => {
      const change = scenario.returns[Number(tile.dataset.companyIndex)];
      tile.classList.toggle('holding-falls', change < 0);
      tile.classList.toggle('holding-bankrupt', change === -1);
      tile.querySelector('small').textContent = riskPercent(change);
    });
    // Announce user selections, without interrupting screen readers on every autoplay step.
    takeaway.setAttribute('aria-live', manual ? 'polite' : 'off');
    takeaway.textContent = scenario.takeaway;
    if (!reducedMotion.matches) {
      lab.querySelector('[data-risk-event]').animate(
        [
          { opacity: 0.6, transform: 'translateY(4px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 350, easing: 'ease-out' },
      );
    }
  }

  function schedule() {
    clearTimeout(timer);
    const running = playing && visible && !document.hidden;
    lab.dataset.playing = String(running);
    playback.setAttribute('aria-pressed', String(playing));
    playback.setAttribute(
      'aria-label',
      playing ? 'Pause scenario tour' : 'Play scenario tour',
    );
    playback.querySelector('[data-tour-label]').textContent = playing
      ? 'Pause tour'
      : 'Play tour';
    playback
      .querySelector('[data-tour-icon]')
      .setAttribute(
        'd',
        playing ? 'M5 4h3v12H5zm7 0h3v12h-3z' : 'm7 4 9 6-9 6Z',
      );
    if (running)
      timer = setTimeout(() => {
        render((current + 1) % riskScenarios.length);
        schedule();
      }, duration);
  }

  buttons.forEach((button, i) =>
    button.addEventListener('click', () => {
      playing = false;
      render(i, true);
      schedule();
    }),
  );
  playback.addEventListener('click', () => {
    playing = !playing;
    if (playing) render(0);
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) playing = false;
    schedule();
  });
  new IntersectionObserver(
    ([entry]) => {
      const nextVisible =
        entry.isIntersecting && entry.intersectionRatio >= 0.25;
      if (visible !== nextVisible) {
        visible = nextVisible;
        schedule();
      }
    },
    { threshold: [0, 0.25] },
  ).observe(lab);
  lab.querySelector('.risk-interaction-header').hidden = false;
  lab.querySelector('.risk-scenarios').hidden = false;
  takeaway.setAttribute('aria-live', playing ? 'off' : 'polite');
  schedule();
}
