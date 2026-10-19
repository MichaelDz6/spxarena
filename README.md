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
- `/etfs-arena/` — 20 popular U.S.-listed ETFs ranked by 2016–2025 annualized NAV returns, with SPY as the benchmark
- `/arena-of-ruin/` — six sourced case studies of catastrophic losses and a near-collapse, with each figure’s scope and original reporting
- `/what-is-spx/` — A visual beginner’s guide to SPX, the S&P 500, ETFs, diversification and compounding
- `/calculator/` — Investment Calculator: future growth using an adjustable average annual return and monthly contributions
- `/calculator/?mode=goal` — Goal Calculator: find the monthly contribution needed to reach a target portfolio value
- `/about/` — the site's educational purpose: exploring real performance records and learning how investing works
- `/investors/<slug>/` — an individual profile, return record and sources
- `/?investor=watsa#nine-arena-record` — a shareable selected comparison

## Deployment

The site builds to static HTML, CSS and JavaScript in `dist/`. There is no server adapter to configure.

- **AWS Amplify:** connect the repository and use the included `amplify.yml`. It installs Node 24, runs `npm ci` and `npm run build`, and publishes `dist/`.
- **Render:** create a Static Site using the included `render.yaml`, or set the build command to `npm ci && npm run build` and publish directory to `dist`. Use Node 24.

Both providers should serve the generated page directories directly. Do not add a catch-all single-page-app rewrite to `index.html`. Connect `spxarena.com` in the chosen provider’s domain settings when ready. The canonical site URL is in `astro.config.mjs`.

References: [Astro on AWS](https://docs.astro.build/en/guides/deploy/aws/) and [Astro on Render](https://docs.astro.build/en/guides/deploy/render/).

## Research and data conventions

Arena of Ruin is a separate editorial collection in `src/data/arena-of-ruin.json`, researched October 16, 2026, with events from 2021–2026. Its six cases cover seven people: Leopold Aschenbrenner, David Chau, James Wynn, Sam Bankman-Fried, Su Zhu and Kyle Davies, and Bill Hwang. It distinguishes personal wealth, trading profits, firm assets and creditor debt; these figures are not ranked or added together. Aschenbrenner is explicitly identified as a near-collapse. Each case links to its reporting, and the page uses original decorative artwork, two licensed Sam Bankman-Fried photographs, and initials where photo permission remains unresolved. The card portrait and alternate interview frame are credited in the case details and on `/credits/#arena-of-ruin-portraits`; source evidence is under `research/arena-of-ruin-portraits/`. It does not change the performance roster or ranking snapshot below.

This is a historical snapshot through **December 31, 2025**, not a live market feed. The roster contains **34 profiles and 20 ranked records** for **2016–2025**. The main ranking and card frame use ten-year annualized outperformance. Five-year and one-year statistics receive separate badges. SPX identifies the index and site branding; benchmark returns use **SPY total returns**. SPIVA’s intro statistics refer to **all active U.S. large-cap funds**, including growth, core and value styles, compared with the index itself: 92.89% underperformed over 20 years (2006–2025), 85.59% over 10 years and 78.78% over one year. All three figures come from [SPIVA U.S. Year-End 2025, Report 1a, page 12](https://www.spglobal.com/spdji/en/documents/spiva/spiva-us-year-end-2025.pdf#page=12). These are fund-category statistics, not a measure of all individual investors or all fund types. The site deliberately retains the year-end 2025 snapshot rather than mixing dates with newer SPIVA releases.

Investor cards show 10-year annualized return, the gap versus SPY, **estimated maximum drawdown over the latest ten years** and the one-year season. Card estimates are stored separately in `src/data/card-drawdowns.json` and display an approximation sign and observation frequency; exact dates are available in the card tooltip and profile disclosure. Seventeen of twenty ranked cards have estimates: sixteen daily histories through October 14, 2026, and PSH weekly/month-end NAV returns through October 13. ARKK explicitly uses a market-price proxy for the NAV-based ranking. Three records remain unavailable; their individual reasons are recorded. Five-year performance remains available in the detailed views. Drawdown does not affect ranking or rarity.

The latest research inputs are under `research/sources/drawdowns-2026-10-15/`. Refresh daily research with `node scripts/refresh-drawdown-research.mjs YYYY-MM-DD`; reproduce it offline with `node scripts/refresh-drawdown-research.mjs 2026-10-15 --cached`. The saved `pershing-weekly-rows.json` contains dated NAV/YTD observations extracted from the issuer’s public NAV table. `node scripts/build-card-drawdowns.mjs 2026-10-15` builds the card summaries. It chains PSH’s dividend-inclusive YTD returns through each year-end, checks the annual figures, and requires continuous weekly coverage. Daily estimates accept annual differences up to 0.5 percentage points for complete calendar years inside the rolling window; the ARKK basis exception is explicit. EPIVX’s larger full-year 2016 discrepancy lies outside those complete years and remains recorded in research. Raw histories stay outside the site build. Provider permissions are not represented as verified; see the existing rights audit.

Returns belong to the named fund, composite, or listed company, rather than an investor’s personal portfolio. Vehicle labels and profile notes identify co-management, share classes, excluded sales loads and company proxies. Fundsmith and Fairfax are converted to USD. Adjusted-NAV estimates and published rounded returns can differ slightly from fund reports. Annual observations do not establish daily drawdowns or risk-adjusted performance.

Investor profiles retain the fixed 1Y, 5Y and 10Y comparisons through December 2025: maximum year-end drawdown, total return, best/worst calendar year, positive years and years beating SPX. Both sides of that drawdown comparison use annual observations, which miss intra-year losses. A separate “Latest card drawdown” disclosure gives the rolling estimate, exact dates, frequency, method and source link. The empty `src/data/drawdowns.json` is the historical comparison dataset; it is not the latest card dataset. No investor statistics are invented for unranked profiles.

Pabrai Fund 3 uses the annual-return and NAV appendices of its 2025 report; the conflicting headline ten-year figure is disclosed in the profile. Fourteen other profiles remain unranked because a comparable record has not been established. Missing comparable data does not imply underperformance.

Update `src/data/returns.json` and the corresponding profile in `src/data/investors.json` together. Each ranked record must retain ten matched annual returns, source links, vehicle description, rounding precision, method, currency and as-of date. Source reports and price snapshots live in `research/sources/`. The earlier historical calculator's monthly observations are retained there as `spy-monthly-prices.json`. The photo policy is authentic licensed color photographs only. Nineteen profiles currently have cleared color photographs (12 AI enhanced/cropped); fifteen show “Photo unavailable” while reuse permission is unresolved. No generated faces or drawings are published. Original inputs and final enhancement prompts are recorded in `research/portrait-photo-enhancement-prompts.json`; final WebP files are under `public/portraits/`. Current licenses, dimensions, color status and checksums are recorded in `src/data/portrait-credits.json` and shown on `/credits/`. See `research/PHOTO-CLEARANCE.md` for remaining gaps. Earlier `research/portrait-sources.json` entries are historical records, not approved assets.

The Investment Calculator projects future growth rather than replaying historical prices. Its editable 10% annual return default is a rounded long-run S&P 500 total-return reference, sourced on the page to Schwab Asset Management. It uses an effective monthly rate `(1 + annualRate / 100) ** (1 / 12) - 1`, with deposits at each month's end. Duration is entered in years and additional months. Every input change smoothly animates the totals and chart from their currently displayed values; reduced-motion preferences disable these transitions. The default chart is also rendered into the static HTML. Both dollar inputs use comma formatting and adaptive step buttons. Projections assume a constant average and reinvested dividends, exclude taxes, fees and inflation, and are not guaranteed outcomes.

The calculator’s **Plan a goal** button switches to a target-based calculation while preserving the starting investment, duration, average return and the original monthly contribution. Goal mode solves the month-end annuity formula, rounds the required deposit up to a whole dollar, and charts that funded projection. It also handles zero or negative average returns and goals already covered by starting capital.

## Languages

English (US) is the source language and fallback. On first visit, the shared
layout selects the first supported language in `navigator.languages`: Polish
(`pl`, including regional variants) or English (`en-US`, including other English
variants). Unsupported browser languages fall back to English.

The footer language selector saves an explicit choice in local storage under
`spx-arena-language`. A `?lang=pl` or `?lang=en-US` URL overrides that preference;
internal navigation preserves an explicit URL choice, including calculator query
parameters and anchors, so it also works with storage disabled.

Copy lives in `src/i18n/pl*.js`, keyed by normalized English source text. Add a
Polish entry when changing English copy. `translate.js` handles parameterized
labels, durations, chart descriptions, and announcements. The shared client
module translates text nodes and accessible metadata without replacing elements
or their listeners, and observes newly generated interactive content. Proper
names, fund names, tickers, source titles, dollar amounts, and input conventions
remain as published; monetary figures continue to represent USD.

JavaScript is required for language detection and Polish rendering. The static
HTML remains English for no-JavaScript visits and search crawlers. If translation
loading fails, the page reveals the English fallback after a short timeout.
