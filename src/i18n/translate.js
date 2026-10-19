import polish from './pl.js';
import { normalizeText } from './locale.js';

export function translate(text, locale = 'en-US') {
  if (!text || locale !== 'pl') return text;
  const normalized = normalizeText(text);
  const direct = polish[normalized];
  if (direct) return text.replace(/\S[\s\S]*\S|\S/, direct);
  let translated = normalized;
  // Interactive views sometimes join several existing disclosures in one text
  // node. Reuse the full translations without replacing individual words.
  if (translated.length > 60) {
    for (const [source, target] of fragments) {
      if (translated.includes(source)) {
        translated = translated.replaceAll(source, () => target);
      }
    }
  }
  for (const [pattern, replacement] of patterns)
    translated = translated.replace(pattern, replacement);
  return translated === normalized
    ? text
    : text.replace(/\S[\s\S]*\S|\S/, translated);
}

const fragments = Object.entries(polish)
  .filter(([source]) => source.length > 60)
  .sort(([a], [b]) => b.length - a.length);

const patterns = [
  [
    /^Monthly contribution needed: (.+) to reach (.+) in (.+)\. Projected portfolio (.+)\.$/,
    (_, monthly, target, duration, value) =>
      `Wymagana miesięczna wpłata: ${monthly}, aby osiągnąć ${target}. Okres: ${translate(duration, 'pl')}. Prognozowany portfel ${value}.`,
  ],
  [
    /^Projected portfolio (.+)\. You contribute (.+)\. Estimated investment growth (.+)\.$/,
    'Prognozowany portfel $1. Twoje wpłaty $2. Szacowany wzrost inwestycji $3.',
  ],
  [
    /^Projected portfolio (after (.+)|today), using (.+)% average annual return: (.+)\. Contributions: (.+)\.$/,
    (_, period, duration, rate, value, invested) =>
      `Prognozowany portfel ${duration ? `po upływie ${translate(duration, 'pl')}` : 'dzisiaj'}, przy średniej rocznej stopie zwrotu ${rate}%: ${value}. Wpłaty: ${invested}.`,
  ],
  [
    /^Estimated portfolio value and cumulative contributions in US dollars (over (.+)|today), using a constant average return\. Final value (.+); total contributions (.+)\.$/,
    (_, period, duration, value, invested) =>
      `Szacowana wartość portfela i suma wpłat w dolarach amerykańskich ${duration ? `przez ${translate(duration, 'pl')}` : 'dzisiaj'}, przy stałej średniej stopie zwrotu. Wartość końcowa ${value}; suma wpłat ${invested}.`,
  ],
  [
    /^Growth of ten thousand US dollars, December (\d+) to December (\d+)\. (.+)\. Annual total returns with distributions reinvested\.$/,
    'Wzrost dziesięciu tysięcy dolarów amerykańskich, od grudnia $1 do grudnia $2. $3. Roczne całkowite stopy zwrotu z reinwestycją wypłat.',
  ],
  [
    /^Growth of \$10,000, January (\d+) to December (\d+)\./,
    'Wzrost 10 000 USD, od stycznia $1 do grudnia $2.',
  ],
  [
    /No comparable investor return record is available\. Year-end observations only\./g,
    'Brak porównywalnej historii zwrotów inwestora. Wyłącznie obserwacje na koniec roku.',
  ],
  [/SPX, measured through SPY:/g, 'SPX mierzony przez SPY:'],
  [
    /^Estimated largest peak-to-trough decline from (.+) to (.+), using (daily|weekly) observations in USD\./,
    (_, from, to, frequency) =>
      `Szacowany największy spadek od szczytu do dołka od ${from} do ${to}, według obserwacji ${frequency === 'daily' ? 'dziennych' : 'tygodniowych'} w USD.`,
  ],
  [
    /Approximate total-return drawdown\. Distribution adjustments, source precision and currency conversion can differ from issuer returns\./g,
    'Przybliżone obsunięcie całkowitego zwrotu. Korekty wypłat, dokładność źródeł i przeliczenia walutowe mogą różnić się od wyników emitenta.',
  ],
  [
    /ARKK market-price total-return proxy\. The annual-return ranking uses fund NAV, so the two bases differ\./g,
    'Przybliżenie całkowitego zwrotu ARKK z ceny rynkowej. Ranking roczny używa NAV funduszu, więc podstawy różnią się.',
  ],
  [
    /Weekly estimate from returns rounded to 0.1%\. Peaks and losses between reporting dates are not captured\./g,
    'Szacunek tygodniowy ze zwrotów zaokrąglonych do 0,1%. Nie obejmuje szczytów i strat między raportami.',
  ],
  [/\bSource: /g, 'Źródło: '],
  [/^(.+) versus SPY ETF$/, '$1 w porównaniu z ETF SPY'],
  [/^Recovered by /, 'Straty odrobione do '],
  [/\bDecember (\d{4})/g, 'Grudzień $1'],
  [/\bDec (\d{4})/g, 'Gru $1'],
  [/\b(\d+) YEARS?\b/g, '$1 LAT'],
  [/^(\d+)-year cumulative$/, 'Łącznie za $1 lat'],
  [/^CASE (\d+)$/, 'PRZYPADEK $1'],
  [/^Show (.+) square$/, 'Pokaż kwadrat $1'],
  [/^(.+)% weight$/, 'Waga $1%'],
  [/^Latest card drawdown · /, 'Najnowsze obsunięcie z karty · '],
  [/^Record to verify · /, 'Wyniki do weryfikacji · '],
  [/^Historical profile · /, 'Profil historyczny · '],
  [/^Fund review pending · /, 'Wyniki w trakcie weryfikacji · '],
  [/\bCompany A goes bankrupt\b/g, 'Spółka A bankrutuje'],
  [/\bCompany A falls\b/g, 'Spółka A traci'],
  [/\bThe whole market falls\b/g, 'Cały rynek spada'],
  [
    /^View (.+), (Legendary|Epic|Rare|Common) over 10 years$/,
    (_, name, tier) => `Zobacz: ${name}, ${polish[tier]} za 10 lat`,
  ],
  [/^View (.+), unranked$/, 'Zobacz: $1, poza rankingiem'],
  [
    /^(.+)’s comparison is not available yet\.$/,
    'Porównanie dla $1 nie jest jeszcze dostępne.',
  ],
  [/^Rank (\d+) of (\d+)$/, 'Pozycja $1 z $2'],
  [/^RANK (\d+) \/ (\d+)$/, 'POZYCJA $1 / $2'],
  [/^(\d+)[–-](\d+) of (\d+) investors$/, '$1–$2 z $3 inwestorów'],
  [/^(\d+) of (\d+)$/, '$1 z $2'],
  [
    /^(\d+) of six rolling five-year windows ahead of SPY\.$/,
    '$1 z sześciu kroczących okresów pięcioletnich z wynikiem powyżej SPY.',
  ],
  [
    /^(\d+)Y · (LEGENDARY|EPIC|RARE|COMMON)$/,
    (_, years, tier) => `${years} LAT · ${polish[tier]}`,
  ],
  [/^(\d+)Y annualized return$/, '$1 LAT · średnioroczny zwrot'],
  [
    /^(\d+)Y (ADVANTAGE|SHORTFALL|GAP) VS SPY$/,
    (_, years, label) =>
      `${years} LAT · ${label === 'ADVANTAGE' ? 'PRZEWAGA' : label === 'SHORTFALL' ? 'STRATA' : 'RÓŻNICA'} WZGLĘDEM SPY`,
  ],
  [/^SPY · (\d+)Y annualized$/, 'SPY · $1 LAT średniorocznie'],
  [/^About (.+) ↗$/, 'O inwestorze: $1 ↗'],
  [/\b(\d+) monthly contributions? of (.+)$/, '$1 comiesięcznych wpłat po $2'],
  [/^Each month, to reach your (.+) goal$/, 'Co miesiąc, aby osiągnąć cel $1'],
  [/^GOAL · /, 'CEL · '],
  [
    /^(Increase|Decrease) by (.+)$/,
    (_, verb, amount) =>
      `${verb === 'Increase' ? 'Zwiększ' : 'Zmniejsz'} o ${amount}`,
  ],
  [/\bUS dollars\b/g, 'dolarów amerykańskich'],
  [/\bpercentage points \/ year\b/g, 'punktów procentowych / rok'],
  [/\bpp\s*\/\s*(?:year|yr)\b/g, 'p.p. / rok'],
  [/\bpp\b/g, 'p.p.'],
  [/\bper year\b/g, 'rocznie'],
  [
    /\b(\d+) years?\b/g,
    (_, n) =>
      `${n} ${Number(n) === 1 ? 'rok' : Number(n) % 10 >= 2 && Number(n) % 10 <= 4 && !(Number(n) % 100 >= 12 && Number(n) % 100 <= 14) ? 'lata' : 'lat'}`,
  ],
  [
    /\b(\d+) months?\b/g,
    (_, n) =>
      `${n} ${Number(n) === 1 ? 'miesiąc' : Number(n) % 10 >= 2 && Number(n) % 10 <= 4 && !(Number(n) % 100 >= 12 && Number(n) % 100 <= 14) ? 'miesiące' : 'miesięcy'}`,
  ],
  [/\b(\d+) yr\b/g, '$1 lat'],
  [/\bToday\b/g, 'Dzisiaj'],
  [/\bAfter\b/g, 'Po upływie'],
  [/\bPortfolio /g, 'Portfel '],
  [/\bContributions /g, 'Wpłaty '],
  [/\bAnnual observations\b/g, 'Obserwacje roczne'],
  [/\b2025 season\b/g, 'Sezon 2025'],
  [/\bco-managed\b/g, 'współzarządzany'],
  [/\bfund NAV\b/g, 'NAV funduszu'],
  [/\bshareholders USD\b/g, 'akcjonariusze USD'],
  [/\bYear-end\b/g, 'Koniec roku'],
  [/\bDEC (\d{4})\b/g, 'GRU $1'],
  [/\b(\d+)Y SEASON\b/g, '$1 ROK · SEZON'],
  [/\b(\d+)Y ANNUALIZED\b/g, '$1 LAT · ŚREDNIOROCZNIE'],
  [/\b(\d+)Y RARITY\b/g, '$1 LAT · KLASA'],
  [/\b(\d+)Y drawdown\b/g, '$1 LAT · obsunięcie'],
  [/\b(\d+)Y frame\b/g, '$1 LAT · ramka'],
  [/\b(\d+)Y \/ YEAR\b/g, '$1 LAT / ROK'],
  [
    /issuer performance for December 31, 2025/g,
    'wyniki emitenta na 31 grudnia 2025',
  ],
  [/\(opens in a new tab\)/g, '(otwiera się w nowej karcie)'],
  [
    /Photo unavailable; reuse permission has not been verified/g,
    'Zdjęcie niedostępne; nie potwierdzono zgody na wykorzystanie',
  ],
  [
    /Licensed original color photograph, cropped and AI enhanced/g,
    'Licencjonowane oryginalne zdjęcie kolorowe, wykadrowane i ulepszone przez AI',
  ],
  [
    /Licensed original color photograph/g,
    'Licencjonowane oryginalne zdjęcie kolorowe',
  ],
  [/ — AI-enhanced adaptation/g, ' — wersja ulepszona przez AI'],
  [/\bvs SPX\b/g, 'względem SPX'],
];

export const t = (text) =>
  translate(
    text,
    typeof document === 'undefined' ? 'en-US' : document.documentElement.lang,
  );
