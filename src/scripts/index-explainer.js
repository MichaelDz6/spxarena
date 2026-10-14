const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scorecard = document.querySelector('[data-company-scorecard]');

if (scorecard) {
  const spotlights = [
    ...scorecard.querySelectorAll('[data-company-spotlight]'),
  ];
  const choices = [...scorecard.querySelectorAll('[data-company-select]')];
  let current = 0;
  let timer;

  function showCompany(index) {
    current = index;
    spotlights.forEach((spotlight, i) => {
      spotlight.dataset.active = String(i === index);
      choices[i].setAttribute('aria-pressed', String(i === index));
    });
    const name = spotlights[index].querySelector(
      '.mosaic-company-name',
    ).textContent;
    scorecard
      .querySelector('.company-mosaic')
      .setAttribute(
        'aria-label',
        `500 squares, one per company. The ${name} logo points to its highlighted square. Square size does not represent company weight.`,
      );
  }

  function schedule() {
    clearTimeout(timer);
    if (document.hidden) return;
    timer = setTimeout(() => {
      showCompany((current + 1) % spotlights.length);
      schedule();
    }, 3800);
  }

  choices.forEach((button, i) =>
    button.addEventListener('click', () => {
      showCompany(i);
      schedule();
    }),
  );
  document.addEventListener('visibilitychange', schedule);
  scorecard.querySelector('.scorecard-controls').hidden = false;
  showCompany(0);
  schedule();
}

const allocation = document.querySelector('[data-index-allocation]');
if (allocation) {
  const choices = [...allocation.querySelectorAll('[data-allocation-select]')];
  const slices = [...allocation.querySelectorAll('[data-allocation-slice]')];
  const reset = allocation.querySelector('[data-allocation-reset]');
  let selected = -1;

  function select(index) {
    selected = index;
    const company = choices[index];
    choices.forEach((choice, i) =>
      choice.setAttribute('aria-pressed', String(i === index)),
    );
    slices.forEach((slice, i) => {
      slice.style.opacity = index < 0 || i === index ? '1' : '0.18';
    });
    allocation.querySelector('[data-allocation-label]').textContent = company
      ? company.dataset.name
      : 'TOP 10 COMPANIES';
    const value = allocation.querySelector('[data-allocation-value]');
    value.replaceChildren(
      document.createTextNode(
        company ? company.dataset.weight : allocation.dataset.topWeight,
      ),
    );
    const unit = document.createElement('small');
    unit.textContent = '%';
    value.append(unit);
    if (!reducedMotion.matches)
      value.animate(
        [
          { opacity: 0.4, transform: 'translateY(5px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 250, easing: 'ease-out' },
      );
    reset.hidden = index < 0;
  }
  choices.forEach((choice, i) => {
    choice.disabled = false;
    choice.addEventListener('click', () => select(selected === i ? -1 : i));
  });
  reset.addEventListener('click', () => {
    const previous = selected;
    select(-1);
    choices[previous]?.focus();
  });
  allocation.querySelector('.allocation-instruction').hidden = false;
}
