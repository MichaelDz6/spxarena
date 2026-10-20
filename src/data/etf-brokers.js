// Checked against official broker pages on 2026-10-19.
// US entries reflect standard US-listed ETF access, subject to account eligibility.
// UCITS entries are matched to instrument listings; venues/currencies may differ.
const brokers = {
  schwab: { name: 'Charles Schwab', logo: '/broker-logos/schwab.png' },
  fidelity: { name: 'Fidelity', logo: '/broker-logos/fidelity.svg' },
  ibkr: { name: 'Interactive Brokers', logo: '/broker-logos/ibkr.png' },
  vanguard: { name: 'Vanguard', logo: '/etf-logos/vanguard.svg' },
  bossa: { name: 'bossa · DM BOŚ', logo: '/broker-logos/bossa.svg' },
  mbank: { name: 'mBank · eMakler', logo: '/broker-logos/mbank.svg' },
  trading212: { name: 'Trading 212', logo: '/broker-logos/trading212.png' },
  xtb: { name: 'XTB', logo: '/broker-logos/xtb.svg' },
};
/** @param {keyof typeof brokers} id @param {string} url */
const entry = (id, url) => ({ ...brokers[id], url });
const usBrokers = [
  entry('schwab', 'https://www.schwab.com/etfs/invest-in-etfs'),
  entry('fidelity', 'https://www.fidelity.com/etfs/investing-in-etfs'),
  entry('ibkr', 'https://www.interactivebrokers.com/en/trading/products-etfs.php'),
  entry('vanguard', 'https://investor.vanguard.com/investment-products/etfs'),
];
const bossaList = 'https://bossa.pl/sites/b30/files/2026-02/document/Lista_wszystkich_instrumentow_zagranicznych_21-01-2026_0.pdf';
const xtbList = 'https://xas-new-cdn.xtb.com/file/0103/32/57be81a2-02a2-45fe-b1df-6fecee2f40e1/specyfikacja-instrumentow-omi-05-01-2026.pdf';
const mbankList = 'https://www.mbank.pl/pdf/ind/inwestycje/lista-akcji-zagranicznych.pdf';
const ibkrContracts = 'https://www.clientam.com/en/trading/products-exchanges.php';
/** @param {string} symbol @param {string} xtbSource */
const ucitsBrokers = (symbol, xtbSource) => [
  entry('bossa', bossaList),
  entry('ibkr', symbol === 'CSPX.GB'
    ? 'https://misc.interactivebrokers.com/cstools/contract_info/v3.10/index.php?action=Details&conid=75776072&site=GEN'
    : ibkrContracts),
  { ...entry('mbank', mbankList), listing: symbol === 'CSPX.GB' ? 'CSP1 · GBP' : undefined },
  entry('trading212', `https://www.trading212.com/trading-instruments/invest/${symbol}`),
  entry('xtb', xtbSource),
];
/** @type {Record<string, Record<string, {name: string, logo: string, url: string, listing?: string}[]>>} */
export const etfBrokers = {
  'en-US': { SPYM: usBrokers, VOO: usBrokers, IVV: usBrokers, SPY: usBrokers },
  pl: {
    SPYL: ucitsBrokers('SPYL.NL', 'https://www.xtb.com/pl/etf/spdr-s-p-500-ucits-acc-eur'),
    'CSPX / SXR8': ucitsBrokers('CSPX.GB', 'https://www.xtb.com/pl/etf/ishares-core-s-p-500-ucits-acc-eur'),
    VUAA: ucitsBrokers('VUAA.GB', xtbList),
    VUSA: ucitsBrokers('VUSA.GB', xtbList),
  },
};
