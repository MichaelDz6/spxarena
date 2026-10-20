const us = [
  ['SPYM', 'State Street SPDR Portfolio S&P 500 ETF', 'state-street', '0.02%', '$2', 'https://www.ssga.com/us/en/individual/etfs/state-street-spdr-portfolio-sp-500-etf-spym'],
  ['VOO', 'Vanguard S&P 500 ETF', 'vanguard', '0.03%', '$3', 'https://advisors.vanguard.com/investments/products/voo/vanguard-sp-500-etf'],
  ['IVV', 'iShares Core S&P 500 ETF', 'ishares', '0.03%', '$3', 'https://www.ishares.com/us/literature/fact-sheet/ivv-ishares-core-s-p-500-etf-fund-fact-sheet-en-us.pdf'],
  ['SPY', 'State Street SPDR S&P 500 ETF Trust', 'state-street', '0.0945%', '$9.45', 'https://www.ssga.com/us/en/individual/etfs/state-street-spdr-sp-500-etf-trust-spy'],
];
const pl = [
  ['SPYL', 'State Street SPDR S&P 500 UCITS ETF (Acc)', 'state-street', '0,03%', '3 EUR', 'https://www.ssga.com/de/de/individual/etfs/state-street-spdr-sp-500-ucits-etf-acc-spyl-gy', 'IE000XZSV718', 'Akumulacja'],
  ['CSPX / SXR8', 'iShares Core S&P 500 UCITS ETF USD (Acc)', 'ishares', '0,07%', '7 EUR', 'https://www.ishares.com/uk/individual/en/products/253743/cspx', 'IE00B5BMR087', 'Akumulacja'],
  ['VUAA', 'Vanguard S&P 500 UCITS ETF USD Accumulating', 'vanguard', '0,07%', '7 EUR', 'https://www.vanguard.co.uk/professional/product/etf/equity/9694/sp-500-ucits-etf-usd-accumulating', 'IE00BFMXXD54', 'Akumulacja'],
  ['VUSA', 'Vanguard S&P 500 UCITS ETF USD Distributing', 'vanguard', '0,07%', '7 EUR', 'https://www.vanguard.co.uk/uk-fund-directory/product/etf/equity/9503/sp-500-ucits-etf-usd-distributing', 'IE00B3XXRP09', 'Wypłata'],
];
/** @param {string[][]} rows */
const funds = rows => rows.map(([ticker, name, logo, fee, cost, url, isin, income]) => ({ticker, name, logo: `/etf-logos/${logo}.svg`, fee, cost, url, isin, income: income || 'Distributing'}));
export const etfGuide = {
  'en-US': {
    title: 'One index. Different ETFs.', eyebrow: 'S&P 500 ETF comparison · United States',
    intro: 'You cannot buy SPX itself. These four US-listed ETFs aim to track the S&P 500, giving you exposure to the same index through different fund providers.',
    back: '← Where to buy S&P 500 ETFs', market: 'US-listed funds', region: 'English shows US options; Polish shows UCITS options for investors in Poland. Your residence, account type and broker determine what you can actually buy.',
    tableTitle: 'Compare the essentials', headers: ['ETF', 'Last price', 'Annual fund fee', 'Cost on $10,000 / year', 'Dividends'],
    feeQuestion: 'Is the ETF with the lowest annual fee the best?',
    feeAnswer: [
      'Not necessarily. The annual fee is only one factor. First check whether the ETF is available through your broker and whether its share price fits the amount you want to invest.',
      'For example, if SPY trades at $766 per share and you have $100, you cannot buy a whole share. An S&P 500 ETF with a lower share price could let you start investing sooner. If your broker supports fractional purchases of that ETF, you may be able to invest your $100 without buying a whole share.',
      'Starting sooner gives your money more time in the market. Over time, that can make a bigger difference than a small annual fee saving, although markets can fall and investing sooner does not guarantee a better outcome. A lower share price makes a whole share more affordable; it does not make the underlying investments cheaper. Compare commissions, spreads and currency conversion costs too.',
    ],
    priceNote: 'Source: Yahoo Finance. Latest regular-session quotes available when this page was built; prices may be delayed and refresh only when the site is rebuilt. Each quote shows its timestamp in UTC. Check your broker for the current executable price.',
    priceUnavailable: 'Unavailable', priceSource: 'Yahoo Finance ↗',
    costNote: 'Illustrative fund cost assumes a constant $10,000 balance. Fees are reflected in fund value, not a separate broker bill. This excludes spreads, commissions, currency conversion and taxes; it is not a return forecast.',
    takeaway: 'SPYM has the lowest published annual fee among these four. The difference between 0.02% and 0.03% is $1 a year per $10,000. Trading costs and the features of your brokerage account can matter more than that small difference.',
    detailsTitle: 'Meet the funds', source: 'Issuer details ↗', feeLabel: 'Annual expense ratio', incomeLabel: 'Dividend treatment',
    notes: [
      'SPYM previously traded as SPLG. It began tracking the S&P 500 in January 2020; earlier performance includes other benchmarks.',
      'VOO is an ETF share class of the Vanguard 500 Index Fund. Check whether your broker offers the purchases and account features you need.',
      'IVV offers the same S&P 500 exposure at the same published expense ratio as VOO. Compare your actual trading costs, not just the fee.',
      'SPY is structured as a unit investment trust. Its higher fund fee does not mean higher expected returns; assess execution costs for your intended trades.',
    ],
    chooseTitle: 'How to choose', points: [
      ['Start with access and total cost', 'Check availability, commissions, bid–ask spread and any currency conversion cost at your broker. Published fund fees are only one part of ownership costs.'],
      ['Compare tracking, not recent winners', 'Look at how closely the fund follows its benchmark over matching periods. Tracking difference already reflects fund expenses; do not add them again to that historical gap.'],
      ['Understand dividends', 'These US ETFs distribute income. Reinvestment depends on your account settings, and distributions can have tax consequences. Compare total returns with dividends reinvested.'],
      ['One S&P 500 ETF may be enough for this exposure', 'Holding several of these funds largely repeats the same companies. It does not diversify you across countries or asset classes, and every fund can lose value.'],
    ], risk: 'Understand the risks and investment horizon', broker: 'Compare brokers',
    footer: 'Selected examples, not a ranking or a personalized recommendation. Fund fees checked against issuer materials on 19 October 2026; verify the latest prospectus before investing. No referral links on this page.',
    funds: funds(us),
  },
  pl: {
    title: 'Jeden indeks. Różne ETF-y.', eyebrow: 'Porównanie ETF-ów na S&P 500 · Polska',
    intro: 'Nie kupujesz bezpośrednio SPX. Te cztery irlandzkie ETF-y UCITS dają ekspozycję na S&P 500 i są przykładami funduszy, które warto sprawdzić u brokera obsługującego inwestorów z Polski.',
    back: '← Gdzie kupić ETF-y na S&P 500', market: 'Fundusze UCITS', region: 'Polska wersja pokazuje ETF-y UCITS, a angielska fundusze notowane w USA. Dostępność zależy od rezydencji, rachunku, brokera i dokumentów wymaganych dla danego produktu.',
    tableTitle: 'Porównaj najważniejsze cechy', headers: ['ETF', 'Ostatnia cena', 'Roczny koszt funduszu', 'Koszt przy 10 000 EUR / rok', 'Dywidendy'],
    feeQuestion: 'Czy ETF z najniższą opłatą roczną jest najlepszy?',
    feeAnswer: [
      'Niekoniecznie. Roczna opłata to tylko jeden z czynników. Najpierw sprawdź, czy ETF jest dostępny u Twojego brokera i czy cena jednostki pasuje do kwoty, którą chcesz zainwestować.',
      'Przykładowo: jeśli jednostka SPY kosztuje 766 USD, a masz 100 USD, nie kupisz całej jednostki. ETF na S&P 500 z niższą ceną jednostki może pozwolić Ci zacząć wcześniej. Jeśli broker umożliwia zakup ułamkowych jednostek danego ETF-u, możesz zainwestować 100 USD bez kupowania całej jednostki. SPY jest tu przykładem — dla inwestorów detalicznych w Polsce dostępność funduszy z USA bywa ograniczona; sprawdź opcje UCITS poniżej.',
      'Wcześniejszy start daje pieniądzom więcej czasu na rynku. Z czasem może to mieć większe znaczenie niż niewielka oszczędność na opłacie rocznej, ale rynek może spadać i wcześniejsza inwestycja nie gwarantuje lepszego wyniku. Niższa cena jednostki ułatwia zakup całej jednostki, lecz nie oznacza tańszej wyceny aktywów funduszu. Uwzględnij też prowizje, spread i koszty przewalutowania.',
    ],
    priceNote: 'Źródło: Yahoo Finance. Ostatnie dostępne notowania z sesji regularnej w chwili budowania strony; mogą być opóźnione i są odświeżane przy kolejnym zbudowaniu witryny. Przy każdej cenie podano czas UTC. Pokazujemy notowania w EUR na Xetra (dla CSPX / SXR8: SXR8). Aktualną cenę transakcji sprawdź u brokera.',
    priceUnavailable: 'Niedostępna', priceSource: 'Yahoo Finance ↗',
    costNote: 'Przykładowy koszt przy stałej wartości inwestycji 10 000 EUR. Opłaty są uwzględniane w wartości funduszu, a nie pobierane jako osobny rachunek brokera. Pomijamy spread, prowizje, przewalutowanie i podatki. To nie jest prognoza zwrotu.',
    takeaway: 'SPYL ma najniższy opublikowany koszt roczny spośród tych czterech funduszy. Różnica między 0,03% a 0,07% wynosi 4 EUR rocznie na każde 10 000 EUR. Uwzględnij też koszty transakcji i sposób obsługi dywidend.',
    detailsTitle: 'Poznaj fundusze', source: 'Szczegóły u emitenta ↗', feeLabel: 'Roczny koszt bieżący / TER', incomeLabel: 'Dywidendy',
    notes: [
      'Akumulująca klasa jednostek. SPYL to przykładowy ticker; przed zakupem potwierdź ISIN, giełdę i walutę notowania.',
      'CSPX na giełdzie w Londynie (USD) i SXR8 na Xetra (EUR) oznaczają tę samą klasę jednostek. Identyfikuj fundusz po ISIN.',
      'Wariant akumulujący: fundusz reinwestuje dochody. VUAA to przykładowy ticker tej klasy; oznaczenia zależą od giełdy.',
      'Wariant wypłacający dywidendy. Jeśli chcesz je ponownie zainwestować, sprawdź możliwości i koszty po stronie brokera.',
    ],
    accumulation: {
      title: 'Akumulacja: przewaga podatkowa dla inwestora w Polsce',
      paragraphs: [
        'Jeśli jesteś polskim rezydentem podatkowym, ETF akumulujący (Acc) co do zasady nie powoduje corocznego podatku od dywidend po Twojej stronie: fundusz zatrzymuje i reinwestuje dochody, zamiast wypłacać je na Twój rachunek. Dzięki temu środki mogą dalej pracować bez corocznego pomniejszania o polski podatek od wypłacanej dywidendy.',
        'Na zwykłym rachunku inwestycyjnym jest to odroczenie podatku, a nie zwolnienie: przy sprzedaży z zyskiem zasadniczo płacisz 19% podatku od dochodu rozliczanego w PLN w PIT-38. Podatki u źródła od dywidend otrzymywanych przez sam fundusz mogą nadal obciążać jego wynik.',
        'To korzyść, z której amerykańscy podatnicy zasadniczo nie mogą korzystać na tych samych zasadach. Typowe ETF-y z siedzibą w USA wypłacają dywidendy, a ich automatyczna reinwestycja nie usuwa podatku na zwykłym rachunku. Zagraniczne ETF-y akumulujące zwykle podlegają w USA przepisom PFIC, które mogą oznaczać skomplikowane rozliczenia i niekorzystne opodatkowanie. Jeśli podlegasz także podatkom w USA, samo rozliczanie się w Polsce nie usuwa tych obowiązków.',
      ],
      sources: [
        ['DM BOŚ: akumulacja i rozliczanie dywidend', 'https://bossa.pl/analizy/portfele-etf'],
        ['Ministerstwo Finansów: sprzedaż papierów wartościowych', 'https://podatki.gov.pl/podatki-osobiste/pit/informacje-podstawowe/co-jest-opodatkowane/zbycie-akcji'],
        ['IRS: zasady PFIC', 'https://www.irs.gov/instructions/i8621'],
      ],
    },
    chooseTitle: 'Jak wybrać', points: [
      ['Sprawdź ISIN i dostępność', 'Ticker zależy od giełdy. Porównaj właściwą klasę jednostek, dokument KID, prowizje, spread oraz koszt przewalutowania u swojego brokera.'],
      ['Wybierz sposób obsługi dywidend', 'Acc oznacza reinwestowanie dochodów w funduszu, a Dist ich wypłatę. Akumulacja sama w sobie nie tworzy dodatkowego zwrotu ani nie gwarantuje zwolnienia z podatku.'],
      ['Waluta notowania nie zabezpiecza przed ryzykiem walutowym', 'Zakup w EUR nie usuwa ekspozycji na USD wynikającej z amerykańskich akcji. Wynik w PLN może różnić się od wyniku indeksu w USD. Żadna z pokazanych klas nie jest klasą zabezpieczoną do PLN.'],
      ['Porównaj odwzorowanie indeksu', 'Sprawdź różnicę między wynikiem funduszu a właściwym benchmarkiem w tym samym okresie. Uwzględnia ona już opłaty funduszu. Kilka ETF-ów na S&P 500 w dużej mierze powiela te same spółki.'],
    ], risk: 'Poznaj ryzyka i horyzont inwestycji', broker: 'Porównaj brokerów',
    footer: 'Wybrane przykłady, nie ranking ani indywidualna rekomendacja. Koszty sprawdzono w materiałach emitentów 19 października 2026 r. Przed zakupem sprawdź aktualne dokumenty funduszu. Ta strona nie zawiera linków polecających.',
    funds: funds(pl),
  },
};
