from pathlib import Path
import re

base = Path(__file__).parent
source = (base / 'spx-arena-premium-gold.html').read_text()
page = re.search(r'<section data-variant="Pearl & Gold"[^>]*>\n(.*?)\n</section>\n<section data-variant="Midnight & Gold"', source, re.S).group(1)
css = (base / 'five-arena-themes.css').read_text()
css = css[:css.index('/* 02 —')] + css[css.index('@media(max-width:800px)'):]
css = css.replace('#spx-explorations', '#spx-pearl-gold')
css = css.replace('family=DM+Sans:wght@400;500;600;700', 'family=DM+Sans:wght@300;400;500;600;700')
palette = (base / 'arena-premium-gold.css').read_text()
for key in ('midnight', 'bordeaux', 'jade', 'obsidian'):
    palette = re.sub(r'#spx-premium-gold \.palette-' + key + r' \{.*?\n\}\n', '', palette, flags=re.S)
css += '\n' + palette.replace('#spx-premium-gold', '#spx-pearl-gold')
css += '\n' + (base / 'pearl-gold-readability.css').read_text()
css += '\n' + (base / 'pearl-gold-professional.css').read_text()
images = re.search(r'<script type="application/json" id="arena-gold-portraits">(.*?)</script>', source, re.S).group(1)
script = (base / 'arena-gold-interactions.js').read_text().replace('spx-premium-gold', 'spx-pearl-gold').replace('arena-gold-portraits', 'pearl-gold-portraits').replace('arenaPremiumGold', 'pearlGoldHomepage')
script = script.replace("design:'Gilded Arena'", "design:'Pearl & Gold — readable text and rarity frames'")
# This is the selected homepage, so remove the old multi-variant stage sizing.
script = script[:script.index(" // Equal responsive stages")] + '})();\n'
(base / 'pearl-gold-interactions.js').write_text(script)
fragment = '<style>\n' + css + '\n</style>\n<div id="spx-pearl-gold">\n' + page + '\n</div>\n<script type="application/json" id="pearl-gold-portraits">' + images + '</script>\n<script>\n' + script + '\n</script>\n'
(base / 'spx-arena-pearl-gold.html').write_text(fragment)
assert len(fragment.encode()) < 1000000
ids = re.findall(r'\bid="([^"]+)"', fragment[:fragment.index('<script')])
assert len(ids) == len(set(ids))
assert fragment.count('class="contender-deck"') == 1
assert 'viz-carousel' not in fragment
print(f'Pearl & Gold homepage created: {len(fragment.encode()):,} bytes; one homepage; original data and portraits retained.')
