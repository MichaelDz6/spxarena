/** The UCITS quotes refer to the EUR listings on Xetra. */
export const quoteListings = {
  SPYM: { symbol: 'SPYM', currency: 'USD', listing: 'NYSE Arca' },
  VOO: { symbol: 'VOO', currency: 'USD', listing: 'NYSE Arca' },
  IVV: { symbol: 'IVV', currency: 'USD', listing: 'NYSE Arca' },
  SPY: { symbol: 'SPY', currency: 'USD', listing: 'NYSE Arca' },
  SPYL: { symbol: 'SPYL.DE', currency: 'EUR', listing: 'Xetra' },
  'CSPX / SXR8': { symbol: 'SXR8.DE', currency: 'EUR', listing: 'Xetra · SXR8' },
  VUAA: { symbol: 'VUAA.DE', currency: 'EUR', listing: 'Xetra' },
  VUSA: { symbol: 'VUSA.DE', currency: 'EUR', listing: 'Xetra' },
};

/** @param {any} payload @param {string} symbol @param {string} currency */
export function parseQuote(payload, symbol, currency) {
  const meta = payload?.chart?.result?.[0]?.meta;
  if (payload?.chart?.error || meta?.symbol !== symbol || meta?.currency !== currency ||
      !Number.isFinite(meta?.regularMarketPrice) || meta.regularMarketPrice <= 0 ||
      !Number.isFinite(meta?.regularMarketTime) || meta.regularMarketTime <= 0) {
    throw new Error(`Invalid quote for ${symbol}`);
  }
  return { price: meta.regularMarketPrice, currency, asOf: new Date(meta.regularMarketTime * 1000).toISOString() };
}

/** Fetch at build time: the static page always labels the provider's quote time. */
export async function loadEtfQuotes() {
  return Object.fromEntries(await Promise.all(Object.entries(quoteListings).map(async ([ticker, listing]) => {
    const url = `https://finance.yahoo.com/quote/${encodeURIComponent(listing.symbol)}/`;
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(listing.symbol)}?interval=1d&range=1d`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return [ticker, { ...listing, url, quote: parseQuote(await response.json(), listing.symbol, listing.currency) }];
    } catch (error) {
      console.warn(`ETF quote unavailable (${listing.symbol}): ${error instanceof Error ? error.message : String(error)}`);
      return [ticker, { ...listing, url, quote: null }];
    }
  })));
}
