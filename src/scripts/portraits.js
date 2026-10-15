import images from '../data/portraits.json';
import { investorById } from '../lib/performance.js';
import { portraitPresentation } from '../lib/portrait-presentation.js';

export function mountPortrait(element) {
  const person = element.dataset.person;
  const crop = document.createElement('span');
  crop.className = 'portrait-window';
  const image = document.createElement('img');
  const presentation = portraitPresentation(person, investorById[person].name);
  image.alt = presentation.alt;
  image.width = presentation.width;
  image.height = presentation.height;
  element.dataset.portraitKind = presentation.kind;
  element.title = presentation.alt;
  image.decoding = 'async';
  if (presentation.available) {
    image.src = images[person];
    crop.append(image);
    element.replaceChildren(crop);
  } else {
    const missing = document.createElement('span');
    missing.className = 'portrait-missing';
    missing.textContent = 'Photo unavailable';
    element.replaceChildren(missing);
  }
  element.classList.add('is-photo');
}
