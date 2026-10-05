import images from '../data/portraits.json';
import { investorById } from '../lib/performance.js';

const original = new Set(['warren', 'cathie', 'bill', 'joel', 'peter', 'carl']);
function sizeOriginalPortrait(element) {
  element._portraitObserver?.disconnect();
  if (!original.has(element.dataset.person)) return;
  const crop = element.querySelector('.portrait-window');
  const observer = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    const side = Math.max(width, height);
    Object.assign(crop.style, {
      width: `${side}px`,
      height: `${side}px`,
      left: `${(width - side) / 2}px`,
      top: `${Math.min(0, (height - side) * 0.2)}px`,
    });
  });
  element._portraitObserver = observer;
  observer.observe(element);
}
export function mountPortrait(element) {
  const person = element.dataset.person;
  const crop = document.createElement('span');
  crop.className = 'portrait-window';
  const image = document.createElement('img');
  image.src = images[person] || images.src;
  image.alt = investorById[person].name;
  image.decoding = 'async';
  crop.append(image);
  element.replaceChildren(crop);
  element.classList.toggle('is-photo', !original.has(person));
  sizeOriginalPortrait(element);
}
document.querySelectorAll('.portrait').forEach(sizeOriginalPortrait);
