from pathlib import Path
import base64, json, re

base = Path(__file__).parent
old = (base / 'long-term-rating.js').read_text()
data = old[:old.index(' const saved=')]
data = data.replace(" const root=document.getElementById('spx-directions');", " const outer=document.getElementById('spx-explorations');")
data = data.replace("warren:{", "peter:{name:'Peter Schiff',vehicle:'EPIVX · affiliated fund',returns:[17.99,15.09,-14.49,16.72,18.37,7.11,0.47,9.80,5.08,47.15]},\n  carl:{name:'Carl Icahn',vehicle:'Icahn funds · composite',returns:[-20.3,2.1,7.9,-15.4,-14.3,-0.3,-2.4,-16.9,-3.5,0.4]},\n  warren:{")
data = data.replace("['bill','warren']", "['bill','warren','carl']")
sources = old[old.index(' const sources='):old.index(" root.querySelectorAll('[data-sources]')")]
sources = sources.replace('The four selected vehicles', 'The six selected vehicles')
sources = sources.replace('ARKK, GINDX and PSH', 'ARKK, GINDX, EPIVX and PSH')
sources = sources.replace('Annual observations cannot', 'EPIVX is EuroPac International Value Class A at NAV, excluding its initial sales charge (up to 4.5%); including that charge reduces its published 10Y return to 10.84%. Peter Schiff is associated with the adviser and investment philosophy; James Nelson and Luke Allen manage the fund. It invests internationally, so SPY is an opportunity-cost comparison, not its mandate benchmark. Icahn’s figures are the published investment-fund composite, net of expenses, not IEP shareholder returns or his personal return. Annual observations cannot')
new_links = '<p>New annual records: <a href="https://www.sec.gov/Archives/edgar/data/1318342/000121390026023914/ea0277787-03_497k.htm" target="_blank" rel="noopener noreferrer">EuroPac 2026 prospectus, Class A calendar-year chart</a> · <a href="https://epcadvisorsgroup.com/wp-content/uploads/2026/02/EPIVX-Fund-Fact-Sheet-12.31.2025.pdf" target="_blank" rel="noopener noreferrer">EuroPac December 2025 factsheet</a> · Icahn annual reports: <a href="https://www.ielp.com/static-files/f81df15f-0a43-4229-bef9-0b858d10dd79" target="_blank" rel="noopener noreferrer">2018 (2016–18)</a>, <a href="https://www.ielp.com/static-files/04bff682-1623-4b57-9e6b-f5addf735797" target="_blank" rel="noopener noreferrer">2019</a>, <a href="https://www.ielp.com/static-files/f988d18e-724f-429d-b35c-5a0908660e6f" target="_blank" rel="noopener noreferrer">2022 (2020–22)</a>, <a href="https://www.ielp.com/static-files/a5d6dde9-3909-48db-bf35-28c21e788151" target="_blank" rel="noopener noreferrer">2025 (2023–25)</a>.</p>'
sources = sources.replace('</details>`;', new_links + '</details>`;')

markup = (base / 'arena-home-markup.html').read_text()
markup = markup.replace('<div id="spx-tavern-home">\n', '', 1).rstrip().rsplit('\n</div>', 1)[0]
markup = markup.replace('4 SELECTED VEHICLES', '6 SELECTED VEHICLES')
markup = markup.replace('Most active funds fall behind the S&amp;P 500.', 'Most active U.S. large-cap funds can’t beat the S&amp;P 500.')
markup = markup.replace('Original editorial portraits', 'Illustrated editorial portraits')
themes = [('gilded', 'Gilded Arena'), ('ivory', 'Ivory League'), ('emerald', 'Emerald Club'), ('cobalt', 'Cobalt Circuit'), ('scarlet', 'Scarlet Championship')]
sections = []
for i, (key, name) in enumerate(themes):
    part = markup.replace('spx-page fantasy tavern arena-home', f'fantasy arena-home {key}')
    part = part.replace('class="fantasy arena-home', f'id="design-{key}" data-design="{key}" class="fantasy arena-home', 1)
    ids = re.findall(r'\bid="([^"]+)"', part)
    for ident in ids:
        if ident == 'design-' + key:
            continue
        part = part.replace('id="' + ident + '"', 'id="' + key + '-' + ident + '"').replace('href="#' + ident + '"', 'href="#' + key + '-' + ident + '"').replace('aria-labelledby="' + ident + '"', 'aria-labelledby="' + key + '-' + ident + '"')
    sections.append(f'<section data-variant="{name}" aria-label="{name} homepage"' + (' hidden' if i else '') + '>\n' + part + '\n</section>')

images = {'src': 'data:image/jpeg;base64,' + base64.b64encode((base / 'investor-portraits.jpg').read_bytes()).decode()}
for key, filename in [('peter', 'peter-schiff-portrait.jpg'), ('carl', 'carl-icahn-portrait.jpg')]:
    images[key] = 'data:image/jpeg;base64,' + base64.b64encode((base / filename).read_bytes()).decode()

interactions = (base / 'arena-home-interactions.js').read_text()
interactions = interactions.removesuffix('})();\n')
interactions = interactions.replace(" const saved=window.openai?.widgetState?.privateContent||{};", " const designKey=root.dataset.design;\n const saved=window.openai?.widgetState?.privateContent?.arenaDesigns?.[designKey]||{};")
interactions = interactions.replace('saved.homeSelection', 'saved.selected').replace('saved.homeHorizon', 'saved.years')
interactions = interactions.replace(" const portraitSource=JSON.parse(document.getElementById('spx-home-portrait-data').textContent).src;", " const portraitData=JSON.parse(document.getElementById('arena-six-portraits').textContent);\n const portraitSource=portraitData.src;")
interactions = interactions.replace('img.src=portraitSource;', 'img.src=portraitData[el.dataset.person]||portraitSource;')
interactions = interactions.replace(' / 04', ' / 06')
start = interactions.index(' function saveState()')
end = interactions.index(' function drawChart()', start)
interactions = interactions[:start] + ''' function saveState() {
  savedStates[designKey]={selected:state.selected,years:state.years};
  window.openai?.setWidgetState({modelContent:{design:designKey,selectedInvestor:series[state.selected].name,chartYears:state.years,mainRatingYears:10,asOf:'2025-12-31'},privateContent:{arenaDesigns:savedStates}})?.catch(()=>{});
 }
''' + interactions[end:]
interactions = interactions.replace("portrait.querySelector('img').alt=d.name", "portrait.querySelector('img').src=portraitData[d.key]||portraitSource;portrait.querySelector('img').alt=d.name")
interactions = interactions.replace(":'Berkshire is a conglomerate, not a fund.'", ":d.key==='peter'?'EPIVX is EuroPac International Value Class A NAV, excluding its initial sales charge. Schiff is affiliated with the adviser; James Nelson and Luke Allen manage the fund. This is an international strategy, with a different investment mandate from SPY.':d.key==='carl'?'These are Icahn’s investment-fund composite returns, net of expenses. They are not IEP shareholder returns or his personal returns.':'Berkshire is a conglomerate, not a fund.'")
interactions = interactions.replace("const incoming=e.detail?.globals?.widgetState?.privateContent;", "const incoming=e.detail?.globals?.widgetState?.privateContent?.arenaDesigns?.[designKey];")
interactions = interactions.replace('incoming.homeSelection', 'incoming.selected').replace('incoming.homeHorizon', 'incoming.years')
interactions = interactions.replace("const h=w<340?232:262,p={l:49,r:9,t:22,b:44}", "const h=w<340?232:262,p={l:52,r:9,t:22,b:44}")
script = data + sources + '''
 const savedStates={...(window.openai?.widgetState?.privateContent?.arenaDesigns||{})};
 outer.querySelectorAll('[data-design]').forEach(root=>{
''' + interactions + '''
 });
 // Equal responsive stages keep the host's design picker in one place.
 const stages=[...outer.querySelectorAll('[data-variant]')];
 let measuring=false,previousStageWidth=0;
 function measureStages(){
  if(measuring)return;measuring=true;
  const width=outer.clientWidth;let maximum=0;
  stages.forEach(stage=>{
   const style=stage.getAttribute('style');
   stage.style.cssText=`position:absolute;visibility:hidden;display:block!important;width:${width}px;pointer-events:none;min-height:0;`;
   maximum=Math.max(maximum,stage.querySelector('[data-design]').getBoundingClientRect().height);
   if(style===null)stage.removeAttribute('style');else stage.setAttribute('style',style);
  });
  stages.forEach(stage=>stage.style.minHeight=Math.ceil(maximum)+'px');measuring=false;
 }
 new ResizeObserver(()=>{const w=Math.round(outer.clientWidth);if(w&&w!==previousStageWidth){previousStageWidth=w;requestAnimationFrame(measureStages);}}).observe(outer);
 document.fonts.ready.then(measureStages);
 outer.addEventListener('toggle',()=>requestAnimationFrame(measureStages),true);
})();
'''
(base / 'five-design-interactions.js').write_text(script)
fragment = '<style>\n' + (base / 'five-arena-themes.css').read_text() + '\n</style>\n<div id="spx-explorations">\n<div class="viz-carousel" aria-label="Five SPX Arena homepage designs">\n' + '\n'.join(sections) + '\n</div>\n</div>\n<script type="application/json" id="arena-six-portraits">' + json.dumps(images) + '</script>\n<script>\n' + script + '\n</script>\n'
(base / 'spx-arena-five-new-designs.html').write_text(fragment)
print('Fragment bytes:', len(fragment.encode()))
assert len(fragment.encode()) < 1000000
all_ids = re.findall(r'\bid="([^"]+)"', fragment[:fragment.index('<script')])
assert len(all_ids) == len(set(all_ids)), 'Duplicate IDs'
print('Five variants; unique IDs:', len(all_ids))
