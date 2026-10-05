# SPX Arena

Website design and research for comparing recognizable investors' fund and company records with the S&P 500, represented by the SPY ETF.

## Current design

The current interactive prototype is [`prototype/spx-arena-nine-in-ten.html`](prototype/spx-arena-nine-in-ten.html): the **Nine in Ten** introduction, **Pearl & Gold** palette, collector cards, historical comparison charts, compact top-five ranking, full leaderboard, and monthly-contribution calculator.

The roster contains **34 investor profiles**, including **20 ranked records** for calendar years **2016–2025**. The main rank and card frame use ten-year annualized outperformance. Five-year and one-year statistics have separate badges. SPX is the site branding; benchmark returns use SPY total returns.

This repository currently contains the HTML prototype and its design sources. The planned Astro application and AWS Amplify or Render deployment have not been implemented.

## Files

- `prototype/assemble-nine-in-ten.py` builds the current prototype from the component markup, styles, interaction scripts, datasets, and portraits alongside it.
- `prototype/arena-ranked-investors.json` contains the 14 newly added ten-year return series, methods, source links, and vehicle descriptions. The original six records remain in `prototype/pearl-gold-interactions.js`.
- `prototype/arena-famous-investors.json` contains the additional investor biographies and record status.
- `prototype/spy-monthly-prices.json` supplies the historical calculator.
- `prototype/famous-portraits/manifest.json` identifies the source of each photograph; original files and optimized display assets are preserved.
- `prototype/ranked-sources/` preserves research reports and the price snapshots used to calculate the new records.
- Other prototype files preserve earlier design, palette, introduction, and card iterations.
- `design-backups/2026-09-30/` preserves Night Session and the modified investor portraits, with a checksum manifest.

## Rebuild the current prototype

Requires Python 3 and Pillow. The optional research collectors also use pypdf.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python prototype/assemble-nine-in-ten.py
node --check prototype/nine-in-ten-interactions.js
```

The generated HTML is an inline visualization fragment. It includes its styles, scripts, datasets, and embedded portraits, plus the pinned D3 CDN script. The checked-in fragment can be inspected without rerunning data collection.

To regenerate the 14 added records from the archived price snapshots and published annual observations:

```sh
.venv/bin/python prototype/build-ranked-contenders.py
.venv/bin/python prototype/assemble-nine-in-ten.py
```

The `collect-*.py` scripts retrieve public research or portrait sources over the network. Their outputs are already included.

## Data conventions

Returns belong to the named fund, composite, or listed company, rather than the investor's personal portfolio. Vehicle labels and profile notes identify co-management, fund share classes, excluded sales loads, and company proxies. Fundsmith and Fairfax are converted to USD. Adjusted-NAV estimates and published rounded annual returns can differ slightly from fund reports.

Pabrai Fund 3 uses the annual return and NAV appendices of its 2025 report; the conflicting headline ten-year figure is disclosed in its profile. Fourteen other profiles remain unranked because a comparable record has not been established. The site carries source links and methodology notes with the comparisons.
