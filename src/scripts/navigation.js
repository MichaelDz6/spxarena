const header = document.querySelector('.home-nav');
const toggle = header.querySelector('.nav-toggle');
const navigation = header.querySelector('nav');
const mobile = window.matchMedia('(max-width: 700px)');

function setMenu(open, restoreFocus = false) {
  header.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute(
    'aria-label',
    open ? 'Close navigation' : 'Open navigation',
  );
  toggle
    .querySelector('path')
    .setAttribute('d', open ? 'm5 5 10 10M5 15 15 5' : 'M3 6h14M3 14h14');
  if (restoreFocus) toggle.focus();
}

header.dataset.menuReady = '';
toggle.hidden = false;
toggle.addEventListener('click', () =>
  setMenu(toggle.getAttribute('aria-expanded') !== 'true'),
);
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('click', (event) => {
  if (!header.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true')
    setMenu(false, true);
});
header.addEventListener('focusout', (event) => {
  if (!header.contains(event.relatedTarget)) setMenu(false);
});
mobile.addEventListener('change', () => setMenu(false));
