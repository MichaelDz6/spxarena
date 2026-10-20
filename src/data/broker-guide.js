// Official broker sources reviewed October 19, 2026. Ordinary links, not affiliate links.
export const brokerGuide = {
  'en-US': {
    eyebrow: 'FROM LEARNING TO INVESTING',
    title: 'Where to buy S&P 500 ETFs',
    gettingStarted: {
      title: 'Your first ETF starts with understanding it.',
      hint: 'What could go wrong? Which fund fits? Where can you buy it? Explore these three steps, then tick them off as you go.',
      markDone: 'Mark as complete',
      steps: [
        ['Read “Before you invest”', 'Understand how ETF investing works and the risks involved.', 'Read the guide'],
        ['Choose your ETF', 'Several ETFs track the S&P 500. Find the one that fits your needs.', 'Explore the ETFs'],
        ['Choose your broker', 'Choose where to buy your ETF by comparing costs and features.', 'Compare brokers'],
      ],
      note: 'Steps 2 and 3 can be reversed. You might choose a broker first for convenience—for example, because you already have a bank account with the same company—then select an ETF available through that broker.',
    },
    intro:
      'You cannot buy the index itself. You can buy shares in an ETF that tracks it through a brokerage account. If you already have an account, check whether it offers the fund you want.',
    market: 'BROKER OPTIONS · UNITED STATES',
    region:
      'US options shown based on your language setting. Confirm that the broker supports your residency and account type.',
    teaser:
      'Compare US brokerage options, understand the costs, and learn what to check before placing an ETF order.',
    cta: 'Explore US brokers and the buying guide',
    back: '← Back to What is SPX?',
    fundTitle: 'Choose the fund before the order.',
    fundText:
      'SPY is one example of a US-listed S&P 500 ETF. Check the fund’s full name, ticker, investment objective and expense ratio. An ETF is the investment; the brokerage account is where you hold it. The same fund may be offered by more than one broker.',
    fundLink: 'State Street · SPY fund details ↗',
    fundUrl:
      'https://www.ssga.com/us/en/individual/etfs/state-street-spdr-sp-500-etf-trust-spy',
    choosing: {
      title: 'What to look for when choosing a broker',
      intro: 'The right account should fit how much you invest, how often you invest, and how you manage your money.',
      items: [
        {
          title: 'Commissions per trade',
          body: 'Some brokers offer commission-free ETF trades; others charge a fixed fee, a percentage, or a minimum per order. Compare the cost for your usual investment amount and frequency—small monthly purchases can suit a different fee structure than larger, occasional orders.',
          takeaway: 'For example: a $2 trading fee is 2% of a $100 purchase, but only 0.2% of a $1,000 purchase.',
        },
        {
          title: 'Exchange rates and conversion costs',
          body: 'Buying an ETF in a different currency from your deposit may require currency conversion. Compare the broker’s exchange-rate markup and conversion fees. You may be able to convert elsewhere before transferring the money, if the broker accepts and holds deposits in that currency.',
          takeaway: 'Compare the total cost of both routes, including conversion and transfer fees—not just the advertised exchange rate.',
        },
        {
          title: 'Convenience matters more than you think',
          body: 'A confusing app or a complicated deposit process can make regular investing harder to keep up with. A brokerage account at your existing bank may simplify transfers. Scheduled payments and recurring ETF purchases can also reduce the effort of making regular contributions.',
          takeaway: 'Check both steps: an automatic deposit moves the money; a recurring investment actually buys the ETF.',
        },
        {
          title: 'ETF availability and fractional shares',
          body: 'Check that the broker offers your chosen ETF for your account. If a whole share costs more than you want to invest, fractional shares can let you buy a smaller amount. Availability varies by broker and ETF, so check the minimum purchase too.',
          takeaway: 'For example: if a share costs $500, a $100 fractional purchase buys one-fifth of a share, before fees.',
        },
        {
          title: 'Fees beyond trading',
          body: 'Commission-free trades do not necessarily mean a free account. Check maintenance, inactivity, withdrawal, and transfer-out fees, along with any minimum-balance requirements or conditions for fee waivers.',
          takeaway: 'Look at the full fee schedule—including what you would pay if you paused investing or moved to another broker.',
        },
      ],
    },
    comparisonTitle: 'Four brokers to compare.',
    comparisonNote:
      'An alphabetical selection, not a ranking or a complete market survey. These links go directly to the brokers and do not pay us referral compensation.',
    labels: ['ETF trading costs', 'Useful features', 'What to check'],
    brokers: [
      {
        name: 'Charles Schwab',
        subtitle: 'US-listed ETF access',
        facts: [
          '$0 online commissions for US exchange-listed ETFs. Fund expenses and other applicable charges still apply.',
          'A broad selection of US-listed ETFs in a brokerage account.',
          'Check your chosen ETF, account fees, and whether the purchase amount and automation you want are supported.',
        ],
        url: 'https://www.schwab.com/pricing',
        link: 'Schwab · pricing ↗',
        more: 'https://www.schwab.com/etfs/invest-in-etfs',
        moreLabel: 'Schwab · ETF investing ↗',
        logo: '/broker-logos/schwab.png',
      },
      {
        name: 'Fidelity',
        subtitle: 'Fractional and recurring investing',
        facts: [
          '$0 commissions for online US ETF trades in standard retail brokerage accounts; exceptions and other fees can apply.',
          'Fractional shares and recurring ETF investments can help with investing a fixed dollar amount.',
          'Check the ETF’s eligibility for fractional purchases and recurring orders, plus the current commission schedule.',
        ],
        url: 'https://www.fidelity.com/investing/brokerage-account',
        link: 'Fidelity · account and pricing ↗',
        more: 'https://www.fidelity.com/trading/recurring-investments',
        moreLabel: 'Fidelity · recurring investments ↗',
        logo: '/broker-logos/fidelity.svg',
      },
      {
        name: 'Interactive Brokers',
        subtitle: 'US and international market access',
        facts: [
          'IBKR Lite offers $0 commissions on eligible US exchange-listed ETFs for eligible US residents. IBKR Pro uses fixed or tiered pricing.',
          'Access to multiple markets and currencies through one brokerage platform.',
          'Compare Lite and Pro eligibility, order exclusions, currency conversion and any market-data subscriptions.',
        ],
        url: 'https://www.interactivebrokers.com/en/pricing/commissions-home.php',
        link: 'IBKR · pricing and plan conditions ↗',
        more: 'https://www.interactivebrokers.com/en/trading/products-etfs.php',
        moreLabel: 'IBKR · ETF investing ↗',
        logo: '/broker-logos/ibkr.png',
      },
      {
        name: 'Vanguard',
        subtitle: 'ETFs and long-term investing',
        facts: [
          '$0 online ETF commissions. Fund expenses and applicable securities transaction fees on sales still apply.',
          'Access to Vanguard ETFs and other available ETFs through Vanguard Brokerage Services.',
          'A $25 annual account service fee may apply; e-delivery is one waiver route. Review transfer-out and broker-assisted charges too.',
        ],
        url: 'https://investor.vanguard.com/client-benefits/investment-fees',
        link: 'Vanguard · fees and waivers ↗',
        more: 'https://investor.vanguard.com/investment-products/etfs',
        moreLabel: 'Vanguard · ETF investing ↗',
        logo: '/etf-logos/vanguard.svg',
      },
    ],
    costTitle: 'Zero commission is not zero cost.',
    costs: [
      'The fund’s expense ratio is an ongoing fund cost, separate from broker commissions.',
      'The bid–ask spread is the difference between buying and selling prices. Your execution price matters too.',
      'Check account, transfer and currency-conversion fees when applicable. Compare costs for the amount and frequency you plan to invest.',
    ],
    costUrl:
      'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/mutual-fund-and-etf-fees-and-expenses-investor-bulletin',
    costLink: 'Investor.gov · fund and trading costs ↗',
    stepsTitle: 'From account to first purchase.',
    steps: [
      [
        'Choose an account',
        'Compare eligibility, available ETFs and fees. Complete the broker’s identity checks and decide which account type fits your needs.',
      ],
      [
        'Fund the account',
        'Transfer money and wait until it is available to trade. Check any deposit or currency-conversion charges.',
      ],
      [
        'Find the exact ETF',
        'Check the full fund name, ticker and exchange. Read its prospectus and verify that it tracks the S&P 500 without leverage or an inverse strategy.',
      ],
      [
        'Review the order',
        'Check the amount, order type, estimated costs and price before submitting. A limit order sets a price boundary but may not execute. Keep the trade confirmation.',
      ],
    ],
    note: 'Educational examples, not personal recommendations. ETF values can fall and you can lose money. Availability and fees can change; confirm the current terms with the broker.',
    reviewed: 'Broker information reviewed October 19, 2026.',
    next: 'Explore the Investment Calculator',
    before: {
      title: 'Before you invest',
      items: [
        [
          'You can lose money.',
          'An S&P 500 ETF can fall sharply; past returns do not guarantee future gains.',
        ],
        [
          'Protect money you need soon.',
          'Keep emergency savings separate. A stock ETF is unsuitable for a fixed short-term spending goal.',
        ],
        [
          'Understand the full cost.',
          'Check fund fees, currency risk and taxes—and buy the intended ETF, not a CFD.',
        ],
      ],
      cta: 'Understand the risks and your investment horizon',
    },
  },
  pl: {
    eyebrow: 'OD WIEDZY DO INWESTOWANIA',
    title: 'Gdzie kupić ETF-y na S&P 500',
    gettingStarted: {
      title: 'Pierwszy ETF? Zacznij od zrozumienia inwestycji.',
      hint: 'Co może pójść nie tak? Jaki fundusz wybrać? Gdzie go kupić? Poznaj te trzy kroki i zaznaczaj je po ukończeniu.',
      markDone: 'Oznacz jako ukończone',
      steps: [
        ['Przeczytaj „Zanim zaczniesz inwestować”', 'Dowiedz się, jak działa inwestowanie w ETF-y i jakie ryzyko się z nim wiąże.', 'Przeczytaj poradnik'],
        ['Wybierz ETF', 'Wiele ETF-ów odwzorowuje S&P 500. Wybierz ten, który odpowiada Twoim potrzebom.', 'Poznaj ETF-y'],
        ['Wybierz brokera', 'Porównaj koszty i funkcje, aby wybrać, gdzie kupić swój ETF.', 'Porównaj brokerów'],
      ],
      note: 'Kroki 2 i 3 możesz wykonać w odwrotnej kolejności. Możesz najpierw wybrać brokera ze względu na wygodę — na przykład dlatego, że masz już konto bankowe w tej samej firmie — a następnie wybrać ETF dostępny w jego ofercie.',
    },
    intro:
      'Nie można kupić samego indeksu. Można kupić jednostki ETF-u, który go odwzorowuje, przez rachunek maklerski. Jeśli masz już rachunek, sprawdź, czy udostępnia wybrany fundusz.',
    market: 'OPCJE BROKERÓW · POLSKA',
    region:
      'Opcje dla Polski na podstawie ustawionego języka. Sprawdź, czy broker obsługuje Twoje miejsce zamieszkania i rodzaj rachunku.',
    teaser:
      'Porównaj opcje brokerów dla mieszkańców Polski, poznaj koszty i sprawdź, na co zwrócić uwagę przed zakupem ETF-u.',
    cta: 'Poznaj brokerów w Polsce i poradnik zakupu',
    back: '← Powrót do „Czym jest SPX?”',
    fundTitle: 'Wybierz właściwy fundusz przed złożeniem zlecenia.',
    fundText:
      'Dla inwestora detalicznego w Polsce punktem wyjścia są ETF-y UCITS dostępne u brokera, z dokumentem KID. Przykładem jest iShares Core S&P 500 UCITS ETF, dostępny w XTB m.in. jako SXR8.DE lub CSPX.UK. Sprawdź ISIN, giełdę, walutę notowania i sposób wypłaty dywidend. Nie zakładaj, że amerykański SPY będzie dostępny na Twoim rachunku. Wybierz rzeczywisty ETF, a nie kontrakt CFD na ETF lub indeks.',
    fundLink: 'XTB · ETF-y i plany inwestycyjne ↗',
    fundUrl: 'https://www.xtb.com/pl/edukacja/plany-inwestycyjne',
    choosing: {
      title: 'Na co zwrócić uwagę przy wyborze brokera',
      intro: 'Rachunek powinien pasować do kwot i częstotliwości Twoich inwestycji oraz sposobu zarządzania pieniędzmi.',
      items: [
        {
          title: 'Prowizje od transakcji',
          body: 'Niektórzy brokerzy oferują transakcje ETF bez prowizji, inni pobierają stałą kwotę, procent wartości zlecenia lub prowizję minimalną. Porównaj koszt dla swoich typowych kwot i częstotliwości zakupów — małe, comiesięczne wpłaty mogą wymagać innej struktury opłat niż większe, rzadsze zlecenia.',
          takeaway: 'Przykład: prowizja 10 zł to 2% zakupu za 500 zł, ale tylko 0,2% zakupu za 5000 zł.',
        },
        {
          title: 'Kurs wymiany i koszty przewalutowania',
          body: 'Zakup ETF-u w walucie innej niż waluta wpłaty może wymagać przewalutowania. Porównaj marżę kursową i opłaty brokera. Możesz wymienić pieniądze przed przelewem, jeśli broker przyjmuje i przechowuje wpłaty w danej walucie.',
          takeaway: 'Porównaj łączny koszt obu sposobów, uwzględniając wymianę i przelew — nie tylko reklamowany kurs.',
        },
        {
          title: 'Wygoda ma większe znaczenie, niż myślisz',
          body: 'Nieczytelna aplikacja lub skomplikowane wpłaty mogą utrudniać regularne inwestowanie. Rachunek maklerski w Twoim banku może uprościć przelewy. Stałe zlecenia płatnicze i cykliczne zakupy ETF-ów mogą też ułatwić systematyczne inwestowanie.',
          takeaway: 'Sprawdź oba kroki: automatyczny przelew zasila rachunek, a cykliczne zlecenie inwestycyjne kupuje ETF.',
        },
        {
          title: 'Dostępność ETF-ów i jednostek ułamkowych',
          body: 'Sprawdź, czy wybrany ETF jest dostępny na Twoim rachunku. Jeśli cała jednostka kosztuje więcej, niż chcesz zainwestować, zakup ułamkowy może pozwolić Ci przeznaczyć mniejszą kwotę. Dostępność zależy od brokera i ETF-u — sprawdź też minimalną wartość zakupu.',
          takeaway: 'Przykład: jeśli jednostka kosztuje 500 EUR, zakup ułamkowy za 100 EUR daje jedną piątą jednostki, przed opłatami.',
        },
        {
          title: 'Opłaty poza prowizjami od transakcji',
          body: 'Transakcje bez prowizji nie muszą oznaczać darmowego rachunku. Sprawdź opłaty za prowadzenie rachunku, brak aktywności, wypłaty i przeniesienie papierów do innego brokera, a także wymagane minimalne saldo i warunki zwolnienia z opłat.',
          takeaway: 'Przejrzyj całą tabelę opłat — również koszty przerwy w inwestowaniu lub zmiany brokera.',
        },
      ],
    },
    comparisonTitle: 'Pięciu brokerów do porównania.',
    comparisonNote:
      'Wybór w kolejności alfabetycznej, nie ranking ani pełny przegląd rynku. Linki prowadzą bezpośrednio do brokerów i nie otrzymujemy za nie wynagrodzenia za polecenie.',
    labels: ['Koszty transakcji ETF', 'Przydatne możliwości', 'Co sprawdzić'],
    brokers: [
      {
        name: 'bossa · DM BOŚ',
        subtitle: 'Rachunek maklerski i rynki zagraniczne',
        facts: [
          'Prowizja zależy od rynku, instrumentu i rodzaju rachunku. Sprawdź aktualną tabelę, w tym minimalną prowizję za zlecenie.',
          'Dostęp do zagranicznych ETF-ów oraz rachunków IKE i IKZE. Lista instrumentów zawiera dokumenty KID.',
          'Porównaj koszty wymiany walut, minimalne prowizje i dostępność wybranego ETF-u. Oferty promocyjne mają osobne warunki i terminy.',
        ],
        url: 'https://bossa.pl/oferta/oplaty-i-prowizje',
        link: 'bossa · opłaty i prowizje ↗',
        more: 'https://bossa.pl/oferta/rynek-zagraniczny',
        moreLabel: 'bossa · rynki zagraniczne ↗',
        logo: '/broker-logos/bossa.svg',
      },
      {
        name: 'Interactive Brokers',
        subtitle: 'Rynki zagraniczne i wiele walut',
        facts: [
          'Prowizje za ETF-y zależą od giełdy i planu Fixed lub Tiered. Sprawdź minimalną prowizję oraz koszty wymiany walut.',
          'Broker przyjmuje klientów z Polski i udostępnia handel ETF-ami na wielu rynkach.',
          'Sprawdź dostępność wybranego ETF-u UCITS oraz obowiązki podatkowe i dokumenty otrzymywane od brokera. Nie zakładaj dostępności amerykańskiej oferty IBKR Lite.',
        ],
        url: 'https://www.interactivebrokers.com/en/pricing/commissions-stocks.php',
        link: 'IBKR · prowizje według rynku ↗',
        more: 'https://www.interactivebrokers.com/en/accounts/open-account-country-list.php',
        moreLabel: 'IBKR · obsługiwane kraje ↗',
        logo: '/broker-logos/ibkr.png',
      },
      {
        name: 'mBank · eMakler',
        subtitle: 'Inwestowanie przez bank i rynki zagraniczne',
        facts: [
          'Sprawdź aktualną taryfę eMaklera: prowizje i ich minima zależą od instrumentu, rynku oraz rodzaju rachunku. Oferty 0 zł mogą obejmować tylko wybrane ETF-y i mieć dodatkowe warunki.',
          'Dostęp do ETF-ów na giełdzie w Warszawie i rynkach zagranicznych, m.in. w Londynie i Frankfurcie, przez usługę eMakler.',
          'Potwierdź dostępność wybranego ETF-u UCITS po ISIN, koszty przewalutowania oraz warunki rachunku. Odróżnij ofertę eMaklera od pozostałych usług Biura maklerskiego mBanku.',
        ],
        url: 'https://www.mbank.pl/pomoc/dokumenty/oferta-indywidualna/inwestycje/emakler/',
        link: 'mBank · dokumenty i taryfa eMaklera ↗',
        more: 'https://www.mbank.pl/indywidualny/inwestycje-i-oszczednosci/gielda/emakler/',
        moreLabel: 'mBank · oferta eMakler ↗',
        logo: '/broker-logos/mbank.svg',
      },
      {
        name: 'Trading 212',
        subtitle: 'Rachunek Invest i inwestowanie ułamkowe',
        facts: [
          'Na rachunku Invest prowizja transakcyjna i opłata za przechowywanie wynoszą 0. Opłata za przewalutowanie wynosi 0,15%; inne koszty mogą mieć zastosowanie.',
          'Rachunek Invest oferuje ETF-y, udziały ułamkowe oraz portfele Pies do regularnego inwestowania.',
          'Wybierz Invest, a nie CFD. Sprawdź instrumenty dostępne dla Twojego rachunku, opłaty za metodę wpłaty i dokumenty do rozliczenia podatku.',
        ],
        url: 'https://www.trading212.com/terms/invest',
        link: 'Trading 212 · opłaty Invest ↗',
        more: 'https://www.trading212.com/pl/invest',
        moreLabel: 'Trading 212 · oferta Invest ↗',
        logo: '/broker-logos/trading212.png',
      },
      {
        name: 'XTB',
        subtitle: 'ETF-y i plany inwestycyjne',
        facts: [
          '0% prowizji do 100 000 EUR miesięcznego obrotu akcjami i ETF-ami; powyżej 0,2%, minimum 10 EUR. Przy przewalutowaniu obowiązuje marża 0,5%.',
          'Plany inwestycyjne pozwalają budować portfel z dostępnych ETF-ów.',
          'Sprawdź walutę rachunku, pozostałe opłaty i warunki praw ułamkowych. Na platformie są również CFD: upewnij się, że wybierasz rzeczywisty ETF.',
        ],
        url: 'https://www.xtb.com/pl/konto-i-oplaty',
        link: 'XTB · opłaty i warunki ↗',
        more: 'https://www.xtb.com/pl/edukacja/plany-inwestycyjne',
        moreLabel: 'XTB · plany inwestycyjne ↗',
        logo: '/broker-logos/xtb.svg',
      },
    ],
    costTitle: 'Brak prowizji nie oznacza braku kosztów.',
    costs: [
      'Koszt roczny funduszu (TER) jest odrębny od prowizji brokera. Dochodzi też spread, czyli różnica między ceną kupna i sprzedaży.',
      'Przy wpłatach w PLN zwróć uwagę na przewalutowanie. Waluta notowania ETF-u nie oznacza automatycznie zabezpieczenia ryzyka walutowego.',
      'Porównaj minimalne prowizje, opłaty za rachunek i transfer papierów. Znaczenie ma kwota oraz częstotliwość zakupów.',
    ],
    costUrl: 'https://www.xtb.com/pl/konto-i-oplaty',
    costLink: 'XTB · przykład tabeli kosztów ↗',
    stepsTitle: 'Od rachunku do pierwszego zakupu.',
    steps: [
      [
        'Wybierz rachunek',
        'Porównaj dostępność ETF-ów, opłaty i rodzaje rachunków. Przejdź weryfikację tożsamości u brokera. IKE i IKZE mają osobne zasady i limity.',
      ],
      [
        'Wpłać środki',
        'Poczekaj na zaksięgowanie pieniędzy. Sprawdź koszty wpłaty i wymiany PLN na walutę transakcji.',
      ],
      [
        'Znajdź właściwy ETF',
        'Zweryfikuj pełną nazwę, ISIN, giełdę i walutę. Przeczytaj KID. Upewnij się, że jest to ETF na S&P 500 bez dźwigni i strategii odwrotnej, a nie CFD.',
      ],
      [
        'Sprawdź zlecenie',
        'Przed zatwierdzeniem sprawdź kwotę, rodzaj zlecenia, cenę i koszty. Zlecenie z limitem określa granicę ceny, ale może nie zostać wykonane. Zachowaj potwierdzenie transakcji.',
      ],
    ],
    note: 'Przykłady edukacyjne, nie indywidualne rekomendacje. Wartość ETF-ów może spaść i możesz stracić pieniądze. Oferta i opłaty mogą się zmieniać; sprawdź aktualne warunki u brokera.',
    reviewed: 'Informacje o brokerach sprawdzono 19 października 2026 r.',
    next: 'Przejdź do kalkulatora inwestycji',
    before: {
      title: 'Zanim zaczniesz inwestować',
      items: [
        [
          'Możesz stracić pieniądze.',
          'ETF na S&P 500 może mocno stracić na wartości; historyczne wyniki nie gwarantują zysku.',
        ],
        [
          'Chroń pieniądze potrzebne wkrótce.',
          'Oddziel poduszkę finansową. ETF akcyjny nie nadaje się do celu z bliskim, nieprzesuwalnym terminem.',
        ],
        [
          'Poznaj wszystkie koszty.',
          'Sprawdź opłaty, ryzyko walutowe i podatki. Wybierz właściwy ETF, a nie CFD.',
        ],
      ],
      cta: 'Poznaj ryzyka i dobierz horyzont inwestycji',
    },
  },
};
