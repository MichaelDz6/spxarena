export const defaultLocale = 'en-US';
export const supportedLocales = ['en-US', 'pl'];
export const localeStorageKey = 'spx-arena-language';

export function resolveLocale(languages = [], preference) {
  if (['en-US', 'pl'].includes(preference)) return preference;
  for (const language of languages) {
    const base = String(language).toLowerCase().split(/[-_]/)[0];
    if (base === 'pl') return 'pl';
    if (base === 'en') return 'en-US';
  }
  return 'en-US';
}

// Serialized into the document head by SiteLayout. Keep both functions free of
// module dependencies so detection runs before paint without a network request.
export function initializeLanguage(resolve) {
  let preference = new URLSearchParams(location.search).get('lang');
  try {
    if (!['en-US', 'pl'].includes(preference)) {
      preference = localStorage.getItem('spx-arena-language');
    }
  } catch {
    /* Language detection also works when storage is blocked. */
  }
  document.documentElement.lang = resolve(
    navigator.languages?.length ? navigator.languages : [navigator.language],
    preference,
  );
  setTimeout(() => {
    if (!document.documentElement.hasAttribute('data-i18n-ready')) {
      document.documentElement.lang = 'en-US';
      document.documentElement.dataset.i18nReady = '';
    }
  }, 2500);
}

export const languageBootstrap = `(${initializeLanguage.toString()})(${resolveLocale.toString()});`;

export const normalizeText = (text) => text.replace(/\s+/g, ' ').trim();
