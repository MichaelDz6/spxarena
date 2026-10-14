import images from '../data/portraits.json';
import { investorById } from '../lib/performance.js';
import { portraitPresentation } from '../lib/portrait-presentation.js';

export function mountPortrait(element) {
  const person = element.dataset.person;
  const crop = document.createElement('span');
  crop.className = 'portrait-window';
  const image = document.createElement('img');
  image.src = images[person];
  const presentation = portraitPresentation(person, investorById[person].name);
  image.alt = presentation.alt;
  image.width = presentation.width;
  image.height = presentation.height;
  element.dataset.portraitKind = presentation.kind;
  element.title = presentation.alt;
  image.decoding = 'async';
  crop.append(image);
  element.replaceChildren(crop);
  if (presentation.label) {
    const label = document.createElement('span');
    label.className = 'portrait-kind';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = presentation.label;
    element.append(label);
  }
  element.classList.add('is-photo');
}
