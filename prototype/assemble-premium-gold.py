from pathlib import Path
import re

base = Path(__file__).parent
original = (base / 'spx-arena-five-new-designs.html').read_text()
first = re.search(r'<section data-variant="Gilded Arena" aria-label="Gilded Arena homepage">\n(.*?)\n</section>\n<section data-variant="Ivory League"', original, re.S).group(1)
palettes = [('pearl', 'Pearl & Gold'), ('midnight', 'Midnight & Gold'), ('bordeaux', 'Bordeaux & Gold'), ('jade', 'Jade & Gold'), ('obsidian', 'Obsidian & Gold')]
sections = []
for i, (key, name) in enumerate(palettes):
    part = first.replace('gilded-', key + '-').replace('design-gilded', 'design-' + key).replace('data-design="gilded"', f'data-design="{key}"')
    light_class = ' palette-light' if key in ('pearl', 'jade') else ''
    part = part.replace('class="fantasy arena-home gilded"', f'class="fantasy arena-home gilded palette-{key}{light_class}"')
    sections.append(f'<section data-variant="{name}" aria-label="{name} color scheme"' + (' hidden' if i else '') + '>\n' + part + '\n</section>')

css = (base / 'five-arena-themes.css').read_text()
css = css[:css.index('/* 02 —')] + css[css.index('@media(max-width:800px)'):]
css = css.replace('#spx-explorations', '#spx-premium-gold')
css += '\n' + (base / 'arena-premium-gold.css').read_text()
images = re.search(r'<script type="application/json" id="arena-six-portraits">(.*?)</script>', original, re.S).group(1)
script = (base / 'five-design-interactions.js').read_text().replace('spx-explorations', 'spx-premium-gold').replace('arena-six-portraits', 'arena-gold-portraits').replace('arenaDesigns', 'arenaPremiumGold')
script = script.replace('modelContent:{design:designKey,', "modelContent:{design:'Gilded Arena',colorScheme:designKey,")
(base / 'arena-gold-interactions.js').write_text(script)
fragment = '<style>\n' + css + '\n</style>\n<div id="spx-premium-gold">\n<div class="viz-carousel" aria-label="Five premium gold color schemes for Gilded Arena">\n' + '\n'.join(sections) + '\n</div>\n</div>\n<script type="application/json" id="arena-gold-portraits">' + images + '</script>\n<script>\n' + script + '\n</script>\n'
output = base / 'spx-arena-premium-gold.html'
output.write_text(fragment)
assert len(fragment.encode()) < 1000000
ids = re.findall(r'\bid="([^"]+)"', fragment[:fragment.index('<script')])
assert len(ids) == len(set(ids)), 'Duplicate element IDs'
assert fragment.count('data-variant=') == 5
assert fragment.count('class="contender-deck"') == 5
assert len(re.findall(r'<section data-variant=.*? hidden>', fragment)) == 4
print(f'Created five gold color schemes: {len(fragment.encode()):,} bytes; five investor decks; unique IDs.')
