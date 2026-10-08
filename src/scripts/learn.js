const lab = document.querySelector('[data-risk-lab]');
const scenarios = {
  start: {
    returns: Array(10).fill(0),
    description: 'Nothing has changed yet. Each investment starts at $1,000.',
    takeaway: 'The same $1,000, either in one company or shared across ten.',
  },
  company: {
    returns: [-0.5, ...Array(9).fill(0)],
    description: 'Company A falls 50%. The other nine companies stay flat.',
    takeaway:
      'One company’s loss has a smaller effect when it’s only part of your investment.',
  },
  market: {
    returns: Array(10).fill(-0.2),
    description: 'All ten companies fall 20% at the same time.',
    takeaway:
      'Both lose 20%. Spreading your money across companies cannot prevent a market-wide loss.',
  },
};
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const percent = (value) =>
  value === 0 ? 'No change' : `−${Math.round(Math.abs(value) * 100)}%`;
const buttons = lab.querySelectorAll('[data-scenario]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
lab.querySelector('.risk-scenarios').hidden = false;
buttons.forEach((button) =>
  button.addEventListener('click', () => {
    const scenario = scenarios[button.dataset.scenario];
    buttons.forEach((control) =>
      control.setAttribute('aria-pressed', String(control === button)),
    );
    const singleReturn = scenario.returns[0];
    const basketReturn =
      scenario.returns.reduce((total, value) => total + value, 0) / 10;
    for (const [kind, change] of [
      ['single', singleReturn],
      ['basket', basketReturn],
    ]) {
      const value = 1000 * (1 + change);
      const output = lab.querySelector(`[data-${kind}-value]`);
      output.textContent = money.format(value);
      if (!reducedMotion.matches)
        output.animate(
          [
            { opacity: 0.45, transform: 'translateY(4px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 350, easing: 'ease-out' },
        );
      const delta = lab.querySelector(`[data-${kind}-change]`);
      delta.textContent = percent(change);
      delta.classList.toggle('no-change', change === 0);
      lab.querySelector(`[data-${kind}-bar]`).style.width =
        `${(value / 1000) * 100}%`;
    }
    lab
      .querySelector('[data-single-holding]')
      .classList.toggle('holding-falls', singleReturn < 0);
    lab
      .querySelectorAll('[data-basket-holding]')
      .forEach((tile, i) =>
        tile.classList.toggle('holding-falls', scenario.returns[i] < 0),
      );
    lab.querySelector('[data-scenario-description]').textContent =
      scenario.description;
    lab.querySelector('[data-risk-takeaway]').textContent =
      `${scenario.takeaway} One company: ${money.format(1000 * (1 + singleReturn))}. Ten-company basket: ${money.format(1000 * (1 + basketReturn))}.`;
  }),
);
