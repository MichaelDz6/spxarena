from pathlib import Path
import re, json, base64, io
from PIL import Image

base = Path(__file__).parent
source = (base / 'spx-arena-five-intros.html').read_text()
css = re.search(r'<style>\n(.*?)\n</style>', source, re.S).group(1)
page = re.search(r'<section data-variant="Nine in Ten"[^>]*>\n(.*?)\n</section>\n<section data-variant=', source, re.S).group(1)
intro = re.search(r'<template data-intro="nine"[^>]*>\n(.*?)\n</template>', (base / 'intro-variants-markup.html').read_text(), re.S).group(1).replace('{{key}}', 'nine')
page = re.sub(r'<section class="intro-hero hero-nine".*?</section>', lambda match: intro, page, count=1, flags=re.S)
benchmark = (base / 'nine-in-ten-benchmark.html').read_text().strip()
page = re.sub(r'<section class="benchmark-stage".*?</section>', lambda match: benchmark, page, count=1, flags=re.S)
page = page.replace('<span class="market-orbit" aria-hidden="true"></span>', '')
page = page.replace('      <span class="card-foot">THE BENCHMARK · OUTSIDE THE INVESTOR RANKING</span>\n', '')
page = page.replace('<main id="nine-arena-top">', '<main id="nine-arena-top" data-page="home">')
page = page.replace('<section class="rules-section"', (base / 'arena-leaderboard-section.html').read_text() + '\n<section class="rules-section"', 1)
page = page.replace('  <div data-sources class="home-sources">', (base / 'arena-extra-pages.html').read_text() + '\n  <div data-sources class="home-sources">')
page = page.replace('  <div data-sources class="home-sources">', (base / 'arena-famous-profiles.html').read_text() + '\n  <div data-sources class="home-sources">')
page = page.replace('10Y LEADERBOARD<br> <b>2016–2025 · 6 SELECTED VEHICLES</b>', '34 INVESTOR PROFILES<br><b>20 RANKED · 14 UNRANKED</b>')
page = page.replace('<div class="contender-deck" data-card-deck="arena"></div>', '<p class="roster-intro">The faces you know. The records behind them. Explore 34 investors, with 20 ten-year records in the ranking.</p>\n<div class="contender-deck" data-card-deck="arena"></div>\n<div class="roster-pagination"><p data-roster-range aria-live="polite"></p><div><button type="button" class="cursor-interaction" data-roster-prev aria-label="Previous investor cards">← Previous</button><button type="button" class="cursor-interaction" data-roster-next aria-label="Next investor cards">Next →</button></div></div>')
page = page.replace('Select a card to inspect its record.', 'Select a card to explore its record or profile.')
page = page.replace('Illustrated editorial portraits · Historical snapshot through 2025', 'Editorial portraits · Historical snapshot through 2025')
page = re.sub(r'<nav aria-label="Main navigation">.*?</nav>', '<nav aria-label="Main navigation"><a href="#home" data-page-link="home">The arena</a><a href="#leaderboard" data-page-link="leaderboard">Leaderboard</a><a href="#calculator" data-page-link="calculator">Calculator</a><a href="#nine-arena-rules" data-home-anchor="nine-arena-rules">The rulebook</a></nav>', page, count=1)
css = css.replace('#spx-intro-five', '#spx-nine-in-ten')
css = re.sub(r'#spx-nine-in-ten \.market-orbit\s*\{[^}]*\}\n?', '', css)
css += '\n' + (base / 'legendary-gold-border.css').read_text()
css += '\n' + (base / 'nine-in-ten-refinements.css').read_text()
css += '\n' + (base / 'arena-expansion.css').read_text()
css += '\n' + (base / 'arena-famous-roster.css').read_text()
images = re.search(r'<script type="application/json" id="intro-five-portraits">(.*?)</script>', source, re.S).group(1)
images = json.loads(images)
# Keep the original assets in the backups; only optimize the embedded copies.
for key, uri in images.items():
    if not isinstance(uri, str) or not uri.startswith('data:image/'):
        continue
    decoded = base64.b64decode(uri.split(',', 1)[1])
    im = Image.open(io.BytesIO(decoded)).convert('RGB')
    encoded = io.BytesIO()
    im.save(encoded, format='WEBP', quality=80)
    images[key] = 'data:image/webp;base64,' + base64.b64encode(encoded.getvalue()).decode()
famous = json.loads((base / 'arena-famous-investors.json').read_text())
manifest = {p['key']: p for p in json.loads((base / 'famous-portraits/manifest.json').read_text())}
for profile in famous:
    key = profile['key']
    images[key] = 'data:image/webp;base64,' + base64.b64encode((base / 'famous-portraits' / (key + '.webp')).read_bytes()).decode()
    profile['photoCredit'] = manifest[key]['credit']
images = json.dumps(images, separators=(',', ':'))
script = (base / 'pearl-gold-interactions.js').read_text()
script = script.replace('spx-pearl-gold', 'spx-nine-in-ten').replace('pearl-gold-portraits', 'nine-in-ten-portraits').replace('pearlGoldHomepage', 'nineInTenHomepage')
script = script.replace('Pearl & Gold — readable text and rarity frames', 'Nine in Ten — Pearl & Gold')
script = script.replace('colorScheme:designKey,', "colorScheme:'pearl',introVariant:'Nine in Ten',")
script = script.replace(' const cagr=', " Object.assign(series,JSON.parse(document.getElementById('arena-ranked-investors').textContent));\n const cagr=", 1)
script = script.replace("const precision=['bill','warren','carl'].includes(key)?0.05:0.005;", "const precision=d.precision??(['bill','warren','carl'].includes(key)?0.05:0.005);")
script = script.replace('RANK 0${d.rank} / 06', "RANK ${String(d.rank).padStart(2,'0')} / ${gameRoster.length}")
script = script.replace(" const outer=", (base / 'arena-calculator-model.js').read_text() + '\n const outer=', 1)
script = script.replace(' const sources=', " const fameProfiles=JSON.parse(document.getElementById('arena-famous-investors').textContent);\n const fameById=Object.fromEntries(fameProfiles.map(d=>[d.key,d]));\n const sources=", 1)
script = script.replace('savedStates[designKey]={selected:state.selected,years:state.years};', 'savedStates[designKey]={selected:state.selected,years:state.years,page:state.page,calculator:state.calculator,rosterPage:state.rosterPage,profile:state.profile};')
script = script.replace("introVariant:'Nine in Ten',", "introVariant:'Nine in Ten',page:state.page,calculator:state.calculator,rosterPage:state.rosterPage,profile:state.page==='profile'?fameById[state.profile]?.name:null,")
script = script.replace("img.alt=series[el.dataset.person].name+' — original illustrated portrait';", "img.alt=(series[el.dataset.person]||fameById[el.dataset.person]).name+(fameById[el.dataset.person]?' — portrait':' — original illustrated portrait');")
script = script.replace("el.replaceChildren(crop);", "el._portraitObserver?.disconnect();el.replaceChildren(crop);\n  el.classList.toggle('is-photo',Boolean(fameById[el.dataset.person]));\n  if(fameById[el.dataset.person])return;", 1)
script = script.replace("new ResizeObserver(entries=>{const {width,height}", "(el._portraitObserver=new ResizeObserver(entries=>{const {width,height}", 1)
script = script.replace("}).observe(el);", "})).observe(el);", 1)
script = re.sub(r"portrait.querySelector\('img'\)\.src=.*?portrait.querySelector\('img'\)\.alt=.*?;", "mountPortrait(portrait);", script, count=1)
script = script.replace("${d.key==='joel'?", "${d.detail?d.detail:d.key==='joel'?", 1)
script = script.replace("  drawChart();\n }\n root.querySelectorAll('[data-investor]')", """  if(d.method)$('[data-record-detail]').innerHTML+=`<p><b>Data basis.</b> ${d.method}</p><p><a href="${d.source}" target="_blank" rel="noopener noreferrer">${d.sourceLabel} ↗</a> · ${d.dataSources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} ↗</a>`).join(' · ')}</p><button type="button" class="profile-source cursor-interaction" data-profile="${d.key}">About ${d.name} ↗</button>`;
  drawChart();
 }
 root.querySelectorAll('[data-investor]')""", 1)
script = script.replace(" $('[data-card-deck]').innerHTML=gameRoster.map(cardMarkup).join('');", (base / 'arena-famous-roster.js').read_text())
script = script.replace("The six selected vehicles are ranked", "The arena features 34 investor profiles. Twenty selected vehicles are ranked")
script = script.replace("Figures are approximately calculated by compounding rounded published annual returns.", "Figures are estimates from published annual returns or adjusted year-end NAVs and share prices. The record details identify the method and sources. Fundsmith and Fairfax are converted to USD. This is a return ranking, not a risk-adjusted assessment; the vehicles have different mandates and exposures.")
script = script.replace("https://www.financecharts.com/compare/AME%2CNAV/performance", "https://www.financecharts.com/etfs/SPY/performance")
script = script.replace("$('[data-sources]').innerHTML=sources;", """$('[data-sources]').innerHTML=sources+`<details class="profile-photo-credits"><summary>Added records &amp; portrait sources</summary><p>The fourteen newly ranked records use the full 2016–2025 period. Adjusted-NAV estimates can differ slightly from published fund returns. Pabrai Fund 3 uses the annual and NAV appendices; its conflicting headline ten-year figure is disclosed in the profile. Each record links to its data sources.</p><p>${gameRoster.filter(d=>d.method).map(d=>`<a href="${d.source}" target="_blank" rel="noopener noreferrer">${d.name}</a>`).join(' · ')}</p><p>Fourteen other profiles remain unranked while comparable records are reviewed. Fame does not establish performance.</p><p>Portrait sources: ${fameProfiles.map(d=>`<a href="${d.photoCredit}" target="_blank" rel="noopener noreferrer">${d.name}</a>`).join(' · ')}</p></details>`;""")
script = script.replace(" root.querySelectorAll('[data-investor]').forEach(button", (base / 'arena-expansion.js').read_text() + "\n root.querySelectorAll('[data-investor]').forEach(button", 1)
script = script.replace("if(target){e.preventDefault();target.scrollIntoView", "if(target&&!link.hasAttribute('data-home-anchor')){e.preventDefault();target.scrollIntoView")
page = page.replace('<button class="arena-action cursor-interaction" type="button" data-profile-compare hidden>Compare with SPX <span aria-hidden="true">→</span></button>', '')
monthly = (base / 'spy-monthly-prices.json').read_text()
ranked = (base / 'arena-ranked-investors.json').read_text()
fragment = '<style>\n' + css + '\n</style>\n<div id="spx-nine-in-ten">\n' + page + '\n</div>\n<script type="application/json" id="nine-in-ten-portraits">' + images + '</script>\n<script type="application/json" id="arena-famous-investors">' + json.dumps(famous, ensure_ascii=False) + '</script>\n<script type="application/json" id="arena-ranked-investors">' + ranked + '</script>\n<script type="application/json" id="arena-monthly-prices">' + monthly + '</script>\n<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>\n<script>\n' + script + '\n</script>\n'
(base / 'nine-in-ten-interactions.js').write_text(script)
(base / 'spx-arena-nine-in-ten.html').write_text(fragment)
card = re.search(r'<article class="arena-card market-card".*?</article>', page, re.S).group(0)
preview_css = css.replace('#spx-nine-in-ten', '#spx-gold-border-preview')
preview_css += '\n#spx-gold-border-preview .gold-border-stage {display:flex;justify-content:center;align-items:center;min-height:500px;padding:36px 24px;box-sizing:border-box;}\n#spx-gold-border-preview .gold-border-card {width:240px;max-width:100%;background:transparent;}\n'
preview = (base / 'legendary-gold-border-preview.html').read_text().replace('{{CURRENT_CARD}}', card)
(base / 'spx-legendary-gold-border.html').write_text('<style>\n' + preview_css + '\n</style>\n' + preview)
assert 'market-orbit' not in fragment
assert 'THE BENCHMARK · OUTSIDE THE INVESTOR RANKING' not in fragment
assert fragment.count('class="contender-deck"') == 1
assert 'viz-carousel' not in fragment
assert len(fragment.encode()) < 1000000
print(f'Nine in Ten saved: {len(fragment.encode()):,} bytes; circle and card footer removed.')
