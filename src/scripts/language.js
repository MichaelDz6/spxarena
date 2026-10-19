import { localeStorageKey } from '../i18n/locale.js';
import { translate } from '../i18n/translate.js';

const locale = document.documentElement.lang;
const attributes = [
  'aria-label',
  'aria-description',
  'aria-valuetext',
  'aria-roledescription',
  'title',
  'alt',
  'placeholder',
];
const excluded =
  'script, style, code, pre, textarea, [contenteditable], [translate="no"], [data-language-select]';

function localize(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (root.parentElement?.closest(excluded)) return;
    const translated = translate(root.data, locale);
    if (translated !== root.data) root.data = translated;
    return;
  }
  if (
    root.nodeType !== Node.ELEMENT_NODE &&
    root.nodeType !== Node.DOCUMENT_NODE
  )
    return;
  if (root.nodeType === Node.ELEMENT_NODE) {
    if (root.matches(excluded)) return;
    for (const attribute of attributes) {
      const value = root.getAttribute(attribute);
      if (value) {
        const translated = translate(value, locale);
        if (translated !== value) root.setAttribute(attribute, translated);
      }
    }
    if (
      root.matches(
        'meta[name="description"], meta[property="og:description"], meta[property="og:title"]',
      )
    ) {
      const value = root.getAttribute('content');
      const translated = translate(value, locale);
      if (translated !== value) root.setAttribute('content', translated);
    }
  }
  for (const child of root.childNodes) localize(child);
}

const selector = document.querySelector('[data-language-select]');
selector.value = locale;
selector.disabled = false;
selector.setAttribute('aria-label', translate('Language', locale));
selector.addEventListener('change', () => {
  try {
    localStorage.setItem(localeStorageKey, selector.value);
  } catch {
    /* Private browsing may disable storage. */
  }
  const url = new URL(location.href);
  url.searchParams.set('lang', selector.value);
  location.assign(url);
});

// Keep an explicit URL choice when storage is unavailable, including on new tabs.
const explicitLocale = new URLSearchParams(location.search).get('lang');
function localizeLink(element) {
  if (
    !explicitLocale ||
    !element.matches('a[href^="/"]') ||
    element.getAttribute('href').startsWith('//')
  )
    return;
  const url = new URL(element.href);
  if (url.origin !== location.origin || /\.[a-z0-9]+$/i.test(url.pathname))
    return;
  url.searchParams.set('lang', locale);
  if (element.href !== url.href) element.href = url.href;
}
function visitLinks(root) {
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  localizeLink(root);
  root.querySelectorAll('a[href^="/"]').forEach(localizeLink);
}

localize(document);
visitLinks(document.documentElement);
document.documentElement.dataset.i18nReady = '';

// Interactive features create new text and accessible labels after the initial render.
// Observe only content changes; chart geometry and animation attributes are untouched.
const observer = new MutationObserver((records) => {
  observer.disconnect();
  for (const record of records) {
    if (record.type === 'childList') {
      for (const node of record.addedNodes) {
        localize(node);
        visitLinks(node);
      }
    } else localize(record.target);
  }
  observe();
});
function observe() {
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...attributes, 'content', 'href'],
  });
}
if (locale === 'pl' || explicitLocale) observe();
