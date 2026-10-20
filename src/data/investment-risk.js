const sources = {
  horizon:
    'https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/gauge-your-risk-tolerance',
  allocation:
    'https://www.investor.gov/introduction-investing/getting-started/asset-allocation',
  history:
    'https://corporate.vanguard.com/content/dam/corp/research/pdf/constructing_return_target_portfolios.pdf',
  study: 'https://doi.org/10.1111/j.1540-6261.2012.01722.x',
  etf: 'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24',
  savings:
    'https://www.investor.gov/build-wealth-over-time-through-saving-and-investing',
};
export const investmentRisk = {
  'en-US': {
    back: '← Back to the broker guide',
    eyebrow: 'RISK · TIME · EVIDENCE',
    title: 'How long should you invest?',
    lead: 'Start with when you need the money. Research can inform your plan, but no holding period makes an S&P 500 ETF risk-free.',
    answerTitle: 'Think in years—and plan for losses.',
    answer:
      'For money needed within five years, avoid relying on stock-market returns. For longer goals, stocks may play a role, but your allocation should reflect how much loss you can afford and whether you can delay spending. There is no scientifically established “safe after 10 years” rule.',
    horizonTitle: 'Match the investment to the goal.',
    horizonNote:
      'These are planning categories based on investor guidance and the research below, not scientifically proven cutoffs or a personalized portfolio recommendation.',
    horizons: [
      [
        '5 years or less',
        'Prioritize the spending goal',
        'For a fixed near-term expense, focus on preserving the money and access to it. Investor.gov cautions against risky investments for goals five years away or sooner.',
      ],
      [
        'More than 5, up to 10 years',
        'Do not assume the deadline is safe',
        'An equity-heavy portfolio can still be down when you need it. Consider a mix of assets and how much of the goal must be protected from stock-market losses.',
      ],
      [
        'More than 10 years',
        'Plan for growth, keep managing risk',
        'A longer horizon may make stock exposure more appropriate for flexible goals. It still does not guarantee a profit or the return you need. Revisit the mix as spending approaches.',
      ],
    ],
    horizonSource: 'Investor.gov · time horizon and risk tolerance ↗',
    evidenceTitle: 'What the evidence actually says.',
    evidence: [
      {
        tag: 'HISTORICAL DATA · 1926–2023',
        title: 'Even a decade can lose money.',
        text: 'Vanguard’s 2023 study reports rolling ten-year annualized nominal US stock returns ranging roughly from −5% to +20%. It uses the S&P Composite before 1957 and the S&P 500 thereafter. These are historical index results, not a forecast, inflation-adjusted returns or your after-tax ETF return.',
        caveat:
          'Overlapping ten-year windows share many of the same observations. They are not independent trials, and US history is not a complete map of future outcomes.',
        link: 'Vanguard research · Figure 1, page 3 (PDF) ↗',
        url: sources.history,
      },
      {
        tag: 'PEER-REVIEWED RESEARCH · 2012',
        title: 'Time does not remove uncertainty.',
        text: 'Pástor and Stambaugh, in The Journal of Finance, use up to 206 years of real stock-return data. In their model, uncertainty about expected returns and imperfect predictors can outweigh the stabilizing effect of mean reversion at long horizons.',
        caveat:
          'This is a model-based finding about predictive variance, not an exact probability of loss or a prescribed number of years for every investor.',
        link: 'Pástor & Stambaugh · Are Stocks Really Less Volatile in the Long Run? ↗',
        url: sources.study,
      },
    ],
    risksTitle: 'The risks behind an S&P 500 ETF.',
    risks: [
      [
        'Market losses',
        'A broad fund can fall with the whole stock market. Diversification reduces reliance on one company; it does not prevent a market-wide loss.',
      ],
      [
        'Concentration',
        'The S&P 500 holds large US companies, with larger companies carrying more weight. It is not a globally diversified portfolio across stocks, bonds and cash.',
      ],
      [
        'Inflation and currency',
        'A gain in dollars may still lose purchasing power after inflation. If you spend in another currency, exchange rates also affect your result. A trading currency alone does not establish currency hedging.',
      ],
      [
        'Costs and product design',
        'Fund expenses, spreads, commissions and taxes reduce what you keep. Tracking differences matter. Leveraged ETFs and CFDs behave differently from an ordinary index ETF.',
      ],
      [
        'Selling at the wrong time for your goal',
        'A loss just before a required withdrawal can force you to sell more shares. Regular purchases do not guarantee a profit; each new contribution has its own time until withdrawal.',
      ],
      [
        'Your reaction to a decline',
        'An allocation you cannot stick with may fail in practice. Separate emergency savings and consider expensive debt before committing money to long-term investments.',
      ],
    ],
    risksSource: 'Investor.gov · ETF basics and risks ↗',
    planTitle: 'Turn the evidence into a plan.',
    plan: [
      'Write down the goal date, amount needed, and whether either can change.',
      'Choose a stock allocation that fits both your willingness and financial ability to absorb a loss.',
      'As spending gets closer, review whether money needed soon should move into lower-volatility assets. Bonds also have interest-rate and credit risk.',
      'Review the plan when your circumstances change. Retirement is usually a series of withdrawals, not one date when every investment must be sold.',
    ],
    planSource: 'Investor.gov · asset allocation and diversification ↗',
    savingsSource: 'Investor.gov · financial foundations ↗',
    conclusion:
      'The useful question is not “How many years until I cannot lose?” It is “Can this investment support my goal if returns disappoint?”',
    reviewed:
      'Sources reviewed October 19, 2026. Educational information, not an individual investment recommendation.',
    next: 'Compare brokerage options',
    sources,
  },
  pl: {
    back: '← Powrót do poradnika o brokerach',
    eyebrow: 'RYZYKO · CZAS · BADANIA',
    title: 'Na jak długo inwestować?',
    lead: 'Zacznij od ustalenia, kiedy potrzebujesz pieniędzy. Badania pomagają planować, ale żaden okres posiadania ETF-u na S&P 500 nie eliminuje ryzyka.',
    answerTitle: 'Myśl w latach — uwzględnij możliwość strat.',
    answer:
      'Jeśli potrzebujesz pieniędzy w ciągu pięciu lat, nie opieraj celu na zyskach z akcji. Przy dalszych celach akcje mogą mieć miejsce w portfelu, ale ich udział powinien zależeć od strat, na które możesz sobie pozwolić, i możliwości przesunięcia wydatku. Nauka nie potwierdza reguły „po 10 latach jest bezpiecznie”.',
    horizonTitle: 'Dopasuj inwestycję do terminu celu.',
    horizonNote:
      'To kategorie pomocne w planowaniu, oparte na edukacji inwestorskiej i badaniach poniżej. Nie są naukowo udowodnionymi granicami ani indywidualną rekomendacją portfela.',
    horizons: [
      [
        '5 lat lub mniej',
        'Priorytetem jest zaplanowany wydatek',
        'Przy bliskim, nieprzesuwalnym wydatku skup się na ochronie pieniędzy i dostępie do nich. Investor.gov przestrzega przed ryzykownymi inwestycjami przy celach do pięciu lat.',
      ],
      [
        'Ponad 5 do 10 lat',
        'Termin nadal może przypaść na spadki',
        'Portfel z dużym udziałem akcji może być na minusie, gdy potrzebujesz środków. Rozważ różne klasy aktywów i ustal, jaka część celu wymaga ochrony przed spadkami rynku akcji.',
      ],
      [
        'Ponad 10 lat',
        'Planuj wzrost, nadal zarządzaj ryzykiem',
        'Dłuższy horyzont może uzasadniać udział akcji przy elastycznych celach. Nie gwarantuje zysku ani wymaganej stopy zwrotu. Weryfikuj skład portfela, gdy zbliża się wydatek.',
      ],
    ],
    horizonSource: 'Investor.gov · horyzont i tolerancja ryzyka (EN) ↗',
    evidenceTitle: 'Co rzeczywiście pokazują badania?',
    evidence: [
      {
        tag: 'DANE HISTORYCZNE · 1926–2023',
        title: 'Nawet dekada może przynieść stratę.',
        text: 'Badanie Vanguard z 2023 r. pokazuje kroczące dziesięcioletnie nominalne zwroty z akcji USA od około −5% do +20% średniorocznie. Wykorzystuje S&P Composite przed 1957 r., a później S&P 500. To historyczne wyniki indeksów, nie prognoza, wynik po inflacji ani zwrot z Twojego ETF-u po podatkach.',
        caveat:
          'Nakładające się dziesięcioletnie okresy zawierają wiele tych samych obserwacji. Nie są niezależnymi próbami, a historia USA nie obejmuje wszystkich możliwych scenariuszy.',
        link: 'Vanguard · wykres 1, strona 3 (PDF, EN) ↗',
        url: sources.history,
      },
      {
        tag: 'RECENZOWANE BADANIE NAUKOWE · 2012',
        title: 'Czas nie usuwa niepewności.',
        text: 'Pástor i Stambaugh w The Journal of Finance analizują do 206 lat danych o realnych zwrotach z akcji. W ich modelu niepewność oczekiwanych zwrotów i niedoskonałość prognoz mogą przeważać nad stabilizującym efektem powrotu do średniej w długim okresie.',
        caveat:
          'To wynik modelu dotyczący wariancji prognozowanych zwrotów, nie dokładne prawdopodobieństwo straty ani zalecany okres dla każdego inwestora.',
        link: 'Pástor i Stambaugh · Are Stocks Really Less Volatile in the Long Run? (EN) ↗',
        url: sources.study,
      },
    ],
    risksTitle: 'Jakie ryzyka wiążą się z ETF-em na S&P 500?',
    risks: [
      [
        'Spadki rynku',
        'Szeroki fundusz może tracić wraz z całym rynkiem akcji. Dywersyfikacja zmniejsza zależność od jednej spółki, ale nie zapobiega stratom całego rynku.',
      ],
      [
        'Koncentracja',
        'S&P 500 obejmuje duże spółki amerykańskie, z większą wagą największych firm. Nie jest globalnym portfelem łączącym akcje, obligacje i gotówkę.',
      ],
      [
        'Inflacja i waluty',
        'Zysk w dolarach nie musi oznaczać wzrostu siły nabywczej. Przy wydatkach w PLN znaczenie mają też kursy walut. Sama waluta notowania ETF-u nie oznacza zabezpieczenia walutowego.',
      ],
      [
        'Koszty i konstrukcja produktu',
        'Opłaty funduszu, spread, prowizje i podatki obniżają wynik netto. Znaczenie mają różnice odwzorowania indeksu. ETF z dźwignią i CFD działają inaczej niż zwykły ETF indeksowy.',
      ],
      [
        'Spadek tuż przed wypłatą',
        'Strata przed obowiązkową wypłatą może wymusić sprzedaż większej liczby jednostek. Regularne zakupy nie gwarantują zysku; każda nowa wpłata ma własny czas do wypłaty.',
      ],
      [
        'Twoja reakcja na straty',
        'Portfel, którego nie potrafisz utrzymać podczas spadków, może nie spełnić planu. Oddziel poduszkę finansową i rozważ spłatę drogich długów przed długoterminowym inwestowaniem.',
      ],
    ],
    risksSource: 'Investor.gov · podstawy i ryzyka ETF-ów (EN) ↗',
    planTitle: 'Przełóż badania na własny plan.',
    plan: [
      'Zapisz datę celu, potrzebną kwotę i możliwość ich zmiany.',
      'Dobierz udział akcji zarówno do swojej tolerancji strat, jak i finansowej zdolności do ich poniesienia.',
      'W miarę zbliżania się wydatku sprawdzaj, czy środki potrzebne wkrótce powinny trafić do mniej zmiennych aktywów. Obligacje też mają ryzyko stóp procentowych i kredytowe.',
      'Weryfikuj plan przy zmianie sytuacji życiowej. Emerytura zwykle oznacza serię wypłat, a nie jeden dzień sprzedaży wszystkich inwestycji.',
    ],
    planSource: 'Investor.gov · alokacja i dywersyfikacja (EN) ↗',
    savingsSource: 'Investor.gov · podstawy finansowe (EN) ↗',
    conclusion:
      'Przydatne pytanie nie brzmi „Po ilu latach nie mogę stracić?”, lecz „Czy ta inwestycja pozwoli realizować mój cel, jeśli wyniki rozczarują?”.',
    reviewed:
      'Źródła sprawdzono 19 października 2026 r. Materiał edukacyjny, nie indywidualna rekomendacja inwestycyjna.',
    next: 'Porównaj opcje brokerów',
    sources,
  },
};
