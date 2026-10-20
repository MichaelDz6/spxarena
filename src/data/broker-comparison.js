// Columns follow the alphabetical broker order in broker-guide.js.
// Short summaries retain conditions; an unverified feature is never treated as unavailable.
/** @type {Record<string, {hint: string, feature: string, details: string, sources: string, note: string, rows: [string, [string, string, string?][]][]}>} */
export const brokerComparison = {
  'en-US': {
    hint: 'Read across a row to compare the same feature. Scroll sideways to see every broker.',
    feature: 'Compare by', details: 'Broker details and full conditions', sources: 'Official sources',
    note: 'Online, self-directed ETF investing. $0 commissions exclude fund expenses and other applicable charges. “Confirm” means the feature was not verified for your account, not that it is unavailable.',
    rows: [
      ['ETF trade commission', [
        ['$0', 'US exchange-listed ETFs, online.'],
        ['$0', 'Online US ETF trades; standard retail accounts.'],
        ['$0 with Lite', 'Eligible US residents and trades. Pro uses fixed or tiered pricing.'],
        ['$0', 'Online ETF trades.'],
      ]],
      ['Fractional ETF purchases', [
        ['From $1', 'Most US-listed ETFs; eligible accounts.', 'https://www.schwab.com/fractional-shares-stock-slices'],
        ['Available', 'Eligible ETFs; check the minimum purchase.', 'https://www.fidelity.com/trading/recurring-investments'],
        ['Available', 'Eligible ETFs; fractional trading must be enabled.', 'https://www.interactivebrokers.com/en/trading/recurring-investments.php'],
        ['Vanguard ETFs: from $1', 'Do not assume other providers’ ETFs qualify.', 'https://investor.vanguard.com/investment-products/etfs/etf-fees'],
      ]],
      ['Convenience to compare', [
        ['Dollar-based orders', 'Buy eligible ETFs by dollar amount. Confirm recurring ETF purchases.', 'https://www.schwab.com/fractional-shares-stock-slices'],
        ['Recurring ETF purchases', 'Fund eligible scheduled investments from a linked bank account.', 'https://www.fidelity.com/trading/recurring-investments'],
        ['Recurring investments', 'Scheduled purchases of eligible fractional securities.', 'https://www.interactivebrokers.com/en/trading/recurring-investments.php'],
        ['Vanguard fund access', 'Low dollar minimum for Vanguard ETFs. Confirm automation for your fund.', 'https://investor.vanguard.com/investment-products/etfs/etf-fees'],
      ]],
      ['Currency conversion', [
        ['No FX for USD → USD', 'For other funding currencies, check conversion and transfer charges.'],
        ['No FX for USD → USD', 'For other funding currencies, check conversion and transfer charges.'],
        ['Multiple currencies', 'Conversion charges depend on the conversion method.', 'https://www.interactivebrokers.com/en/pricing/commissions-spot-currencies.php'],
        ['No FX for USD → USD', 'For other funding currencies, check conversion and transfer charges.'],
      ]],
      ['Other fees to check', [
        ['Transfers & assisted trades', 'Review service fees beyond the online ETF commission.'],
        ['Account-specific services', 'Review exceptions and fees beyond standard online ETF trades.'],
        ['Data & account services', 'Check optional market-data subscriptions and other service charges.'],
        ['$25 annual fee may apply', 'Waivers include e-delivery; check transfer and assisted-trade fees.'],
      ]],
    ],
  },
  pl: {
    hint: 'Porównuj tę samą cechę w jednym wierszu. Przewiń w bok, aby zobaczyć wszystkich brokerów.',
    feature: 'Porównaj', details: 'Szczegóły brokerów i pełne warunki', sources: 'Oficjalne źródła',
    note: 'Porównanie rzeczywistych ETF-ów, nie CFD. Prowizja 0% nie obejmuje kosztów funduszu i pozostałych opłat. „Potwierdź” oznacza brak weryfikacji funkcji dla Twojego rachunku, a nie jej niedostępność.',
    rows: [
      ['Prowizja za ETF', [
        ['Zależna od rynku', 'Zagranica: od 0,29%, minima zależą od giełdy. IKE/IKZE: promocja 0% do końca lutego 2027 r.'],
        ['Fixed lub Tiered', 'Stawka i minimum zależą od giełdy. Nie zakładaj dostępu do IBKR Lite.'],
        ['Zależna od rachunku', 'Oferty 0 zł mają warunki i wyłączenia; sprawdź ETF po ISIN.'],
        ['0 prowizji', 'Na rachunku Invest; pozostałe koszty mogą obowiązywać.'],
        ['0% do limitu obrotu', 'Do 100 000 EUR miesięcznie; potem 0,2%, min. 10 EUR.'],
      ]],
      ['Przewalutowanie', [
        ['Sprawdź taryfę', 'Koszt zależy od rachunku i sposobu wymiany.'],
        ['Zależne od metody', 'Porównaj automatyczną i samodzielną konwersję.', 'https://www.interactivebrokers.com/en/pricing/commissions-spot-currencies.php'],
        ['Marża 0,1%', 'Dla przewalutowania transakcji zagranicznych eMakler.', 'https://www.mbank.pl/indywidualny/inwestycje/gielda/rynki-zagraniczne/'],
        ['0,15%', 'Opłata FX na rachunku Invest.'],
        ['0,5%', 'Gdy transakcja wymaga przewalutowania.'],
      ]],
      ['Zakupy ułamkowe ETF', [
        ['Potwierdź u brokera', 'Sprawdź jednostki ułamkowe i minimum zakupu wybranego ETF-u.'],
        ['Dostępne', 'Dla kwalifikujących się ETF-ów; wymagają aktywacji.', 'https://www.interactivebrokers.com/en/trading/recurring-investments.php'],
        ['Potwierdź u brokera', 'Sprawdź możliwość zakupu ułamkowego w usłudze eMakler.'],
        ['Dostępne', 'Dla instrumentów objętych ofertą Invest.'],
        ['Prawa ułamkowe', 'Sprawdź warunki praw ułamkowych i dostępne ETF-y.'],
      ]],
      ['Wygoda i regularne wpłaty', [
        ['Rachunki IKE / IKZE', 'Dostęp do rynków zagranicznych; sprawdź automatyzację zakupów.'],
        ['Zakupy cykliczne', 'Dla kwalifikujących się instrumentów ułamkowych.', 'https://www.interactivebrokers.com/en/trading/recurring-investments.php'],
        ['Integracja z mBankiem', 'eMakler wymaga rachunku bankowego w mBanku.', 'https://www.mbank.pl/indywidualny/inwestycje/gielda/emakler/'],
        ['Portfele Pies', 'Funkcje regularnego inwestowania na rachunku Invest.'],
        ['Plany inwestycyjne', 'Budowanie portfela z dostępnych ETF-ów.'],
      ]],
      ['Pozostałe opłaty', [
        ['Rachunek i transfery', 'Sprawdź wybrany pakiet, typ rachunku i przeniesienie papierów.'],
        ['Dane i usługi', 'Sprawdź opcjonalne dane rynkowe oraz opłaty za usługi.'],
        ['Rachunek i usługi bankowe', 'Sprawdź taryfę eMaklera i powiązanego rachunku bankowego.'],
        ['Przechowywanie: 0', 'Sprawdź opłaty za wybraną metodę wpłaty.'],
        ['Aktywne konto: bezpłatne', 'Sprawdź warunki braku aktywności i inne opłaty.'],
      ]],
    ],
  },
};
