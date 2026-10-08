# SPX Arena

An Astro website comparing recognizable investors’ fund and company records with the S&P 500, represented by the SPY ETF. The approved Nine in Ten design uses the Pearl & Gold palette and collector-style investor cards.

## Start locally

Use **Node.js 24 LTS** (recorded in `.nvmrc`) and npm. If you use nvm, run `nvm install` and `nvm use` first.

From the repository root:

```sh
npm install
npm run dev
```

Open the local URL printed by Astro, normally **http://localhost:4321/**. If that port is occupied, Astro selects the next available port.

```sh
npm run check    # Astro / TypeScript diagnostics
npm test         # Return calculations, rankings and contribution timing
npm run build    # Generate the production site in dist/
npm run preview  # Serve the production build locally
```

No API keys, database, Python environment, or backend server are needed. Historical data is included in the project. The calculator and interactive charts run in the browser; profiles and rankings are rendered into HTML at build time.

## Project structure

```text
src/
  pages/         Astro routes: home, leaderboard, calculator, investor profiles
  layouts/       Shared document shell, metadata and navigation
  components/    Hero, benchmark card, investor cards, ranking and record sections
  styles/        Approved Pearl & Gold styling and site-wide rules
  scripts/       Browser chart, calculator, portrait and pagination interactions
  lib/           Shared performance and calculator functions
  data/          Investor metadata, annual returns and image paths
public/
  portraits/     Local investor images
research/
  sources/       Reports and price snapshots supporting the return records
tests/           Calculation and data-integrity tests
astro.config.mjs
amplify.yml
render.yaml
```

The previous `prototype/` and `design-backups/` folders have been removed. The current application is entirely under `src/` and `public/`; earlier design work remains recoverable from Git history. `research/` contains supporting evidence, not application code or design backups.

## Routes

- `/` — the arena, 34 investor cards, interactive comparisons and top-five ranking
- `/leaderboard/` — all 20 ranked records and 14 unranked profiles
- `/what-is-spx/` — A visual beginner’s guide to SPX, the S&P 500, ETFs, diversification and compounding
- `/calculator/` — Investment Calculator: future growth using an adjustable average annual return and monthly contributions
- `/calculator/?mode=goal` — Goal Calculator: find the monthly contribution needed to reach a target portfolio value
- `/investors/<slug>/` — an individual profile, return record and sources
- `/?investor=watsa#nine-arena-record` — a shareable selected comparison

## Deployment

The site builds to static HTML, CSS and JavaScript in `dist/`. There is no server adapter to configure.

- **AWS Amplify:** connect the repository and use the included `amplify.yml`. It installs Node 24, runs `npm ci` and `npm run build`, and publishes `dist/`.
- **Render:** create a Static Site using the included `render.yaml`, or set the build command to `npm ci && npm run build` and publish directory to `dist`. Use Node 24.

Both providers should serve the generated page directories directly. Do not add a catch-all single-page-app rewrite to `index.html`. Connect `spxarena.com` in the chosen provider’s domain settings when ready. The canonical site URL is in `astro.config.mjs`.

References: [Astro on AWS](https://docs.astro.build/en/guides/deploy/aws/) and [Astro on Render](https://docs.astro.build/en/guides/deploy/render/).

## Research and data conventions

This is a historical snapshot through **December 31, 2025**, not a live market feed. The roster contains **34 profiles and 20 ranked records** for **2016–2025**. The main ranking and card frame use ten-year annualized outperformance. Five-year and one-year statistics receive separate badges. SPX identifies the index and site branding; benchmark returns use **SPY total returns**. SPIVA’s intro statistics refer to active U.S. large-cap funds compared with the index itself.

Returns belong to the named fund, composite, or listed company, rather than an investor’s personal portfolio. Vehicle labels and profile notes identify co-management, share classes, excluded sales loads and company proxies. Fundsmith and Fairfax are converted to USD. Adjusted-NAV estimates and published rounded returns can differ slightly from fund reports. Annual observations do not establish daily drawdowns or risk-adjusted performance.

Pabrai Fund 3 uses the annual-return and NAV appendices of its 2025 report; the conflicting headline ten-year figure is disclosed in the profile. Fourteen other profiles remain unranked because a comparable record has not been established. Missing comparable data does not imply underperformance.

Update `src/data/returns.json` and the corresponding profile in `src/data/investors.json` together. Each ranked record must retain ten matched annual returns, source links, vehicle description, rounding precision, method, currency and as-of date. Source reports and price snapshots live in `research/sources/`. The earlier historical calculator's monthly observations are retained there as `spy-monthly-prices.json`. Portrait provenance is recorded in the profile data and `research/portrait-sources.json`.

The Investment Calculator projects future growth rather than replaying historical prices. Its editable 10% annual return default is a rounded long-run S&P 500 total-return reference, sourced on the page to Schwab Asset Management. It uses an effective monthly rate `(1 + annualRate / 100) ** (1 / 12) - 1`, with deposits at each month's end. Duration is entered in years and additional months. Every input change smoothly animates the totals and chart from their currently displayed values; reduced-motion preferences disable these transitions. The default chart is also rendered into the static HTML. Both dollar inputs use comma formatting and adaptive step buttons. Projections assume a constant average and reinvested dividends, exclude taxes, fees and inflation, and are not guaranteed outcomes.

The calculator’s **Plan a goal** button switches to a target-based calculation while preserving the starting investment, duration, average return and the original monthly contribution. Goal mode solves the month-end annuity formula, rounds the required deposit up to a whole dollar, and charts that funded projection. It also handles zero or negative average returns and goals already covered by starting capital.
