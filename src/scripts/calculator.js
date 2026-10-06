import {
  calculateProjection,
  calculateGoal,
  defaultCalculator,
  formatMoney,
  formatDuration,
} from '../lib/calculator.js';
import {
  createProjectionChart,
  projectionPaths,
  interpolateChartGeometry,
  compactMoney,
  chartMonthLabel,
} from '../lib/projection-chart.js';
import {
  parseAmount,
  formatAmountInput,
  startingInvestmentStep,
  stepStartingInvestment,
  monthlyContributionStep,
  stepMonthlyContribution,
} from '../lib/amount-input.js';

const root = document.querySelector('[data-page="calculator"]');
const $ = (selector) => root.querySelector(selector);
const form = $('[data-calculator-form]');
const svg = $('[data-calc-chart]');
const tooltip = $('[data-calc-tooltip]');
const slider = $('[data-years-slider]');
const content = $('[data-calc-content]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const outputs = {
  value: $('[data-calc-value]'),
  invested: $('[data-calc-invested]'),
  gain: $('[data-calc-gain]'),
};
let goalMode = false;
const originalCopy = {
  title: $('#calculator-page-title').innerHTML,
  intro: $('[data-calc-intro]').innerHTML,
  secondary: $('[data-calc-secondary-label]').innerHTML,
};
const moneyControls = {
  initial: {
    maximum: 100000000,
    step: startingInvestmentStep,
    adjust: stepStartingInvestment,
    error: 'Enter a starting investment from $0 to $100,000,000.',
  },
  target: {
    minimum: 1,
    maximum: 100000000,
    step: startingInvestmentStep,
    adjust: (value, direction) =>
      Math.max(1, stepStartingInvestment(value, direction)),
    error: 'Enter a target value from $1 to $100,000,000.',
  },
  monthly: {
    maximum: 10000000,
    step: monthlyContributionStep,
    adjust: stepMonthlyContribution,
    error: 'Enter a monthly contribution from $0 to $10,000,000.',
  },
};
for (const [name, control] of Object.entries(moneyControls)) {
  control.input = form.elements.namedItem(name);
  control.buttons = root.querySelectorAll(`[data-amount="${name}"]`);
}
let calculation = calculateProjection(defaultCalculator);
let displayedNumbers = {
  value: calculation.value,
  invested: calculation.invested,
  gain: calculation.gain,
};
let displayedGeometry;
let chart;
let chartNodes;
let selectedMonth = 0;
let animationFrame = 0;
let lastSignature;

function formatMoneyField(input) {
  const value = input.value;
  const formatted = formatAmountInput(value);
  if (value === formatted) return;
  // Keep the caret beside the same digit as grouping separators are inserted.
  const position = (offset) => {
    const count = value
      .slice(0, offset ?? value.length)
      .replaceAll(',', '').length;
    let cursor = 0;
    let characters = 0;
    while (cursor < formatted.length && characters < count) {
      if (formatted[cursor] !== ',') characters++;
      cursor++;
    }
    return cursor;
  };
  const start = position(input.selectionStart);
  const end = position(input.selectionEnd);
  input.value = formatted;
  input.setSelectionRange(start, end);
}

function adjustMoney(control, direction) {
  const value = parseAmount(control.input.value);
  if (
    !Number.isFinite(value) ||
    value < (control.minimum ?? 0) ||
    value > control.maximum
  )
    return;
  control.input.value = formatAmountInput(
    String(control.adjust(value, direction)),
  );
  applyCalculation();
}

function hideTooltip() {
  tooltip.hidden = true;
  svg
    .querySelectorAll(
      '[data-calc-guide], [data-value-dot], [data-invested-dot]',
    )
    .forEach((element) => element.setAttribute('visibility', 'hidden'));
}

function resultNumbers() {
  return {
    value: goalMode ? calculation.monthly : calculation.value,
    invested: calculation.invested,
    gain: goalMode ? calculation.value : calculation.gain,
  };
}

function renderNumbers(numbers) {
  displayedNumbers = numbers;
  for (const [key, element] of Object.entries(outputs)) {
    const value = numbers[key];
    const text =
      key === 'gain' && !goalMode
        ? (value < 0 ? '−' : '+') + formatMoney(Math.abs(value))
        : formatMoney(value);
    if (element.textContent !== text) element.textContent = text;
    element.classList.toggle('large-amount', text.length > 10);
  }
  outputs.gain.classList.toggle('up', !goalMode && numbers.gain >= 0);
  outputs.gain.classList.toggle('down', !goalMode && numbers.gain < 0);
}

function renderGeometry(geometry) {
  displayedGeometry = geometry;
  const paths = projectionPaths(geometry);
  chartNodes.value.setAttribute('d', paths.value);
  chartNodes.invested.setAttribute('d', paths.invested);
  chartNodes.fill.setAttribute('d', paths.fill);
  const last = geometry.points.at(-1);
  for (const node of chartNodes.endpoints) {
    node.setAttribute('cx', last.x);
    node.setAttribute('cy', last.value);
  }
  chartNodes.values.forEach((node, index) => {
    node.textContent = compactMoney((geometry.maximum * index) / 4);
  });
  chartNodes.months.forEach((node, index) => {
    const fraction = index / 2;
    const month = Math.round(geometry.months * fraction);
    node.textContent = chartMonthLabel(month);
    node.setAttribute('x', geometry.points[index * 64].x);
    node.setAttribute(
      'opacity',
      index === 0 || (index === 1 ? geometry.months > 1 : geometry.months > 0)
        ? '1'
        : '0',
    );
  });
}

function prepareChart() {
  const next = createProjectionChart(
    calculation,
    Math.max(80, Math.round(svg.clientWidth)),
    Math.max(120, Math.round(svg.clientHeight)),
  );
  const rebuilt =
    !chartNodes || next.width !== chart.width || next.height !== chart.height;
  if (rebuilt) {
    svg.setAttribute('viewBox', `0 0 ${next.width} ${next.height}`);
    svg.innerHTML = next.markup;
    chartNodes = {
      value: svg.querySelector('[data-portfolio-path]'),
      invested: svg.querySelector('[data-contributions-path]'),
      fill: svg.querySelector('[data-projection-fill]'),
      endpoints: svg.querySelectorAll(
        '[data-projection-endpoint], [data-projection-halo]',
      ),
      values: svg.querySelectorAll('[data-axis-value]'),
      months: svg.querySelectorAll('[data-axis-month]'),
    };
    displayedGeometry = next.geometry;
  }
  chart = next;
  svg.querySelector('desc').textContent = chart.description;
  return rebuilt;
}

function stopAnimation() {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  content.removeAttribute('data-calc-animating');
}

function finishProjection() {
  stopAnimation();
  if (!calculation || !chartNodes) return;
  renderNumbers(resultNumbers());
  renderGeometry(chart.geometry);
  // Announce the settled result once, rather than announcing every animation frame.
  $('[data-calc-announcement]').textContent = goalMode
    ? `Monthly contribution needed: ${formatMoney(calculation.monthly)} to reach ${formatMoney(calculation.target)} in ${formatDuration(calculation.months)}. Projected portfolio ${formatMoney(calculation.value)}.`
    : `Projected portfolio ${formatMoney(calculation.value)}. You contribute ${formatMoney(calculation.invested)}. Estimated investment growth ${formatMoney(calculation.gain)}.`;
}

function animateProjection() {
  stopAnimation();
  hideTooltip();
  const rebuilt = prepareChart();
  if (rebuilt || reducedMotion.matches) {
    finishProjection();
    return;
  }
  const fromNumbers = displayedNumbers;
  const fromGeometry = displayedGeometry;
  const toGeometry = chart.geometry;
  const toNumbers = resultNumbers();
  const started = performance.now();
  content.setAttribute('data-calc-animating', 'true');
  const tick = (now) => {
    const progress = Math.min(1, (now - started) / 680);
    const eased = 1 - (1 - progress) ** 3;
    renderNumbers(
      Object.fromEntries(
        Object.entries(toNumbers).map(([key, value]) => [
          key,
          fromNumbers[key] + (value - fromNumbers[key]) * eased,
        ]),
      ),
    );
    renderGeometry(interpolateChartGeometry(fromGeometry, toGeometry, eased));
    if (progress < 1) animationFrame = requestAnimationFrame(tick);
    else finishProjection();
  };
  animationFrame = requestAnimationFrame(tick);
}

function showMonth(month) {
  if (!calculation || !chart || animationFrame) return;
  selectedMonth = Math.max(0, Math.min(calculation.months, Math.round(month)));
  const point = calculation.points[selectedMonth];
  const cx = chart.x(selectedMonth);
  const guide = svg.querySelector('[data-calc-guide]');
  guide.setAttribute('x1', cx);
  guide.setAttribute('x2', cx);
  guide.setAttribute('visibility', 'visible');
  for (const key of ['value', 'invested']) {
    const dot = svg.querySelector(`[data-${key}-dot]`);
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', chart.y(point[key]));
    dot.setAttribute('visibility', 'visible');
  }
  tooltip.innerHTML = `<strong>${selectedMonth === 0 ? 'Today' : `After ${formatDuration(selectedMonth)}`}</strong>Portfolio ${formatMoney(point.value)}<br>Contributions ${formatMoney(point.invested)}`;
  tooltip.hidden = false;
  tooltip.style.left = `${Math.max(0, Math.min(svg.clientWidth - tooltip.offsetWidth, cx + 12))}px`;
}
function showPointer(event) {
  if (!chart) return;
  const box = svg.getBoundingClientRect();
  showMonth(
    chart.x.invert(((event.clientX - box.left) * chart.width) / box.width),
  );
}
svg.addEventListener('pointermove', showPointer);
svg.addEventListener('pointerdown', showPointer);
svg.addEventListener('pointerleave', hideTooltip);
svg.addEventListener('blur', hideTooltip);
svg.addEventListener('keydown', (event) => {
  if (!calculation) return;
  const targets = {
    ArrowLeft: selectedMonth - 1,
    ArrowRight: selectedMonth + 1,
    Home: 0,
    End: calculation.months,
  };
  if (event.key === 'Escape') hideTooltip();
  if (event.key in targets) {
    event.preventDefault();
    showMonth(targets[event.key]);
  }
});

function applyCalculation() {
  const config = Object.fromEntries(
    [
      'initial',
      goalMode ? 'target' : 'monthly',
      'years',
      'months',
      'annualRate',
    ].map((key) => {
      const input = form.elements.namedItem(key);
      const control = moneyControls[key];
      const value = control
        ? parseAmount(input.value)
        : input.value === ''
          ? NaN
          : input.valueAsNumber;
      if (control) {
        const valid =
          Number.isFinite(value) &&
          value >= (control.minimum ?? 0) &&
          value <= control.maximum;
        input.setCustomValidity(valid ? '' : control.error);
        if (valid) {
          input.setAttribute('aria-valuenow', value);
          input.setAttribute('aria-valuetext', `${input.value} US dollars`);
        } else {
          input.removeAttribute('aria-valuenow');
          input.removeAttribute('aria-valuetext');
        }
        control.buttons.forEach((button) => {
          const increasing = Number(button.dataset.amountStep) > 0;
          button.disabled =
            !valid ||
            (increasing
              ? value >= control.maximum
              : value <= (control.minimum ?? 0));
          button.title = `${increasing ? 'Increase' : 'Decrease'} by ${formatMoney(control.step(value))}`;
        });
      }
      input.setAttribute('aria-invalid', String(!input.validity.valid));
      return [key, value];
    }),
  );
  if (Number.isInteger(config.years) && config.years >= 0 && config.years <= 50)
    slider.value = config.years;
  root
    .querySelectorAll('[data-duration]')
    .forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(
          Number(button.dataset.duration) === config.years &&
            config.months === 0,
        ),
      ),
    );
  try {
    const next = goalMode ? calculateGoal(config) : calculateProjection(config);
    const signature = JSON.stringify(config);
    if (calculation && lastSignature === signature) return;
    lastSignature = signature;
    calculation = next;
    $('[data-calculator-error]').hidden = true;
    $('[data-calc-empty]').hidden = true;
    content.hidden = false;
    $('[data-calc-period]').textContent = formatDuration(calculation.months);
    $('[data-calc-rate]').textContent = `${config.annualRate}%`;
    $('[data-calc-summary]').textContent = goalMode
      ? `Each month, to reach your ${formatMoney(config.target)} goal`
      : `${calculation.months} monthly ${calculation.months === 1 ? 'contribution' : 'contributions'} of ${formatMoney(config.monthly)}`;
    $('#calculation-heading').textContent = goalMode
      ? `GOAL · ${formatMoney(config.target)}`
      : 'YOUR FUTURE, IN NUMBERS';
    $('[data-goal-status]').textContent =
      goalMode && calculation.coveredByInitial
        ? 'Your starting investment alone is projected to cover this goal. No monthly contributions needed.'
        : 'Monthly amount rounded up to the next dollar. The chart shows your projected path to the goal.';
    svg.setAttribute(
      'aria-label',
      `Projected portfolio ${calculation.months ? `after ${formatDuration(calculation.months).toLowerCase()}` : 'today'}, using ${config.annualRate}% average annual return: ${formatMoney(calculation.value)}. Contributions: ${formatMoney(calculation.invested)}.`,
    );
    selectedMonth = 0;
    animateProjection();
  } catch (error) {
    stopAnimation();
    calculation = null;
    hideTooltip();
    content.hidden = true;
    $('[data-calc-empty]').hidden = false;
    $('[data-calc-period]').textContent = '—';
    $('[data-calculator-error]').textContent = error.message;
    $('[data-calculator-error]').hidden = false;
  }
}

form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('input', (event) => {
  const control = moneyControls[event.target.name];
  if (control) formatMoneyField(control.input);
  if (event.target === slider)
    form.elements.namedItem('years').value = slider.value;
  applyCalculation();
});
for (const control of Object.values(moneyControls)) {
  control.buttons.forEach((button) =>
    button.addEventListener('click', () =>
      adjustMoney(control, Number(button.dataset.amountStep)),
    ),
  );
  control.input.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    adjustMoney(control, event.key === 'ArrowUp' ? 1 : -1);
  });
}
form.addEventListener('change', applyCalculation);
root.querySelectorAll('[data-duration]').forEach((button) =>
  button.addEventListener('click', () => {
    form.elements.namedItem('years').value = button.dataset.duration;
    form.elements.namedItem('months').value = '0';
    applyCalculation();
  }),
);
new ResizeObserver(() => {
  if (
    !calculation ||
    svg.clientWidth < 80 ||
    (Math.round(svg.clientWidth) === chart?.width &&
      Math.round(svg.clientHeight) === chart?.height)
  )
    return;
  stopAnimation();
  prepareChart();
  finishProjection();
  hideTooltip();
}).observe(svg);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) finishProjection();
});
window.addEventListener('pagehide', finishProjection);
function setCalculatorMode(mode, updateUrl = true) {
  const nextGoalMode = mode === 'goal';
  const changed = nextGoalMode !== goalMode;
  goalMode = nextGoalMode;
  root.dataset.calculatorMode = goalMode ? 'goal' : 'growth';
  root.querySelectorAll('[data-calculator-mode]').forEach((button) => {
    if (button.tagName === 'BUTTON')
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.calculatorMode === mode),
      );
  });
  $('[data-growth-control]').hidden = goalMode;
  $('[data-goal-control]').hidden = !goalMode;
  moneyControls.monthly.input.disabled = goalMode;
  moneyControls.target.input.disabled = !goalMode;
  $('[data-goal-method]').hidden = !goalMode;
  $('[data-goal-status]').hidden = !goalMode;
  $('#calculator-page-title').innerHTML = goalMode
    ? 'Goal <br /><em>Calculator.</em>'
    : originalCopy.title;
  $('[data-calc-intro]').innerHTML = goalMode
    ? 'Start with a goal. See how much you would need to invest each month, using your time horizon and an <strong>average annual return</strong>.'
    : originalCopy.intro;
  $('[data-form-heading]').textContent = goalMode
    ? 'YOUR SAVINGS GOAL'
    : 'YOUR INVESTMENT PLAN';
  $('[data-calc-value-label]').innerHTML = goalMode
    ? '<span class="desktop-calc-label">Monthly contribution needed</span><span class="mobile-calc-label">Monthly investment</span>'
    : 'Projected portfolio value';
  $('[data-calc-secondary-label]').innerHTML = goalMode
    ? 'Projected value'
    : originalCopy.secondary;
  document.title = goalMode
    ? 'Goal Calculator | SPX Arena'
    : 'Investment Calculator | SPX Arena';
  if (updateUrl) {
    const url = new URL(window.location.href);
    if (goalMode) url.searchParams.set('mode', 'goal');
    else url.searchParams.delete('mode');
    window.history.replaceState(null, '', url);
  }
  // Different units should not animate from portfolio dollars to monthly dollars.
  if (changed) chartNodes = null;
  applyCalculation();
}
root.querySelectorAll('button[data-calculator-mode]').forEach((button) => {
  button.addEventListener('click', () =>
    setCalculatorMode(button.dataset.calculatorMode),
  );
});
setCalculatorMode(
  new URLSearchParams(window.location.search).get('mode') === 'goal'
    ? 'goal'
    : 'growth',
  false,
);
