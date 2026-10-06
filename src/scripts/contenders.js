const section = document.querySelector('#nine-arena-contenders');
const deck = section.querySelector('[data-card-deck]');
const cards = Array.from(deck.children);
const pagination = section.querySelector('.roster-pagination');
const controls = section.querySelector('.roster-carousel-controls');
const range = section.querySelector('[data-carousel-range]');
const play = section.querySelector('[data-carousel-play]');
const previous = section.querySelector('[data-carousel-prev]');
const next = section.querySelector('[data-carousel-next]');
const mobile = window.matchMedia('(max-width: 700px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pageSize = 6;
const pageCount = Math.ceil(cards.length / pageSize);
let page = 0;
let current = 0;
let direction = 1;
let playing = !reducedMotion.matches;
let visible = false;
let timer;
let scrollTimer;

function updatePage() {
  cards.forEach((card, i) => {
    card.hidden = Math.floor(i / pageSize) !== page;
  });
  section.querySelector('[data-roster-range]').textContent =
    `${page * pageSize + 1}–${Math.min(cards.length, (page + 1) * pageSize)} of ${cards.length} investors`;
  section.querySelector('[data-roster-prev]').disabled = page === 0;
  section.querySelector('[data-roster-next]').disabled = page === pageCount - 1;
}

function updateControls() {
  range.textContent = `${current + 1} of ${cards.length}`;
  range.setAttribute('aria-live', playing ? 'off' : 'polite');
  play.setAttribute('aria-pressed', String(playing));
  play.setAttribute(
    'aria-label',
    playing ? 'Pause automatic card rotation' : 'Start automatic card rotation',
  );
  play
    .querySelector('path')
    .setAttribute('d', playing ? 'M7 5v10M13 5v10' : 'm7 4 9 6-9 6Z');
  previous.disabled = current === 0;
  next.disabled = current === cards.length - 1;
  if (mobile.matches)
    cards.forEach((card, index) => {
      card.tabIndex = index === current ? 0 : -1;
    });
}

function schedule() {
  clearTimeout(timer);
  if (!mobile.matches || !playing || !visible || document.hidden) return;
  timer = setTimeout(() => {
    if (current === cards.length - 1) direction = -1;
    if (current === 0) direction = 1;
    moveTo(current + direction);
  }, 5000);
}

function pause() {
  if (!mobile.matches) return;
  playing = false;
  clearTimeout(timer);
  updateControls();
}

function moveTo(index, animate = true) {
  const distance = Math.abs(index - current);
  current = Math.max(0, Math.min(cards.length - 1, index));
  const left =
    cards[current].getBoundingClientRect().left -
    deck.getBoundingClientRect().left +
    deck.scrollLeft -
    4;
  deck.scrollTo({
    left,
    behavior:
      animate && !reducedMotion.matches && distance < 4 ? 'smooth' : 'instant',
  });
  updateControls();
  schedule();
}

function syncLayout() {
  clearTimeout(timer);
  clearTimeout(scrollTimer);
  pagination.hidden = mobile.matches;
  controls.hidden = !mobile.matches;
  if (mobile.matches) {
    cards.forEach((card) => {
      card.hidden = false;
    });
    deck.setAttribute('role', 'region');
    deck.setAttribute('aria-roledescription', 'carousel');
    deck.tabIndex = 0;
    moveTo(current, false);
  } else {
    deck.removeAttribute('role');
    deck.removeAttribute('aria-roledescription');
    deck.removeAttribute('tabindex');
    cards.forEach((card) => card.removeAttribute('tabindex'));
    page = Math.floor(current / pageSize);
    updatePage();
  }
}

for (const [selector, delta] of [
  ['[data-roster-prev]', -1],
  ['[data-roster-next]', 1],
]) {
  section.querySelector(selector).addEventListener('click', () => {
    page = Math.max(0, Math.min(pageCount - 1, page + delta));
    current = page * pageSize;
    updatePage();
    section.scrollIntoView({ block: 'start' });
  });
}
previous.addEventListener('click', () => {
  pause();
  moveTo(current - 1);
});
next.addEventListener('click', () => {
  pause();
  moveTo(current + 1);
});
play.addEventListener('click', () => {
  playing = !playing;
  updateControls();
  schedule();
});
deck.addEventListener('pointerdown', pause, { passive: true });
deck.addEventListener('wheel', pause, { passive: true });
deck.addEventListener('focusin', pause);
deck.addEventListener('keydown', (event) => {
  if (!mobile.matches) return;
  const destinations = {
    ArrowLeft: current - 1,
    ArrowRight: current + 1,
    Home: 0,
    End: cards.length - 1,
  };
  if (!(event.key in destinations)) return;
  event.preventDefault();
  pause();
  // Keep keyboard focus on the carousel while its current card changes.
  deck.focus({ preventScroll: true });
  moveTo(destinations[event.key]);
});
deck.addEventListener(
  'scroll',
  () => {
    if (!mobile.matches) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const left = deck.getBoundingClientRect().left + 4;
      current = cards.reduce(
        (nearest, card, index) =>
          Math.abs(card.getBoundingClientRect().left - left) <
          Math.abs(cards[nearest].getBoundingClientRect().left - left)
            ? index
            : nearest,
        0,
      );
      updateControls();
      schedule();
    }, 140);
  },
  { passive: true },
);
new IntersectionObserver(
  ([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    schedule();
  },
  { threshold: [0, 0.5] },
).observe(deck);
let lastWidth = 0;
new ResizeObserver(([entry]) => {
  if (entry.contentRect.width === lastWidth) return;
  lastWidth = entry.contentRect.width;
  if (mobile.matches) moveTo(current, false);
}).observe(deck);
mobile.addEventListener('change', syncLayout);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    playing = false;
    updateControls();
  }
  schedule();
});
document.addEventListener('visibilitychange', schedule);
window.addEventListener('pagehide', () => {
  clearTimeout(timer);
  clearTimeout(scrollTimer);
});
window.addEventListener('pageshow', schedule);
syncLayout();
