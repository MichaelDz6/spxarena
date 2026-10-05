from pathlib import Path
import re

base = Path(__file__).parent
previous = (base / 'spx-arena-premium-gold.html').read_text()
original = (base / 'spx-arena-five-new-designs.html').read_text()
first = re.search(r'<section data-variant="Gilded Arena" aria-label="Gilded Arena homepage">\n(.*?)\n</section>\n<section data-variant="Ivory League"', original, re.S).group(1)
# Favorites retain both their appearance and their positions, 1 and 4.
palettes = [('pearl', 'Pearl & Gold'), ('alabaster', 'Alabaster & Gold'), ('celadon', 'Celadon & Gold'), ('jade', 'Jade & Gold'), ('cashmere', 'Cashmere & Gold')]
sections = []
for i, (key, name) in enumerate(palettes):
    part = first.replace('gilded-', key + '-').replace('design-gilded', 'design-' + key).replace('data-design="gilded"', f'data-design="{key}"')
    refined = ' palette-refined' if key not in ('pearl', 'jade') else ''
    part = part.replace('class="fantasy arena-home gilded"', f'class="fantasy arena-home gilded palette-{key} palette-light{refined}"')
    section = f'<section data-variant="{name}" aria-label="{name} color scheme"' + (' hidden' if i else '') + '>\n' + part + '\n</section>'
    if key in ('pearl', 'jade'):
        prior = re.search(r'<section data-variant="' + re.escape(name) + r'".*?\n</section>', previous, re.S).group(0)
        assert section == prior, f'{name} markup changed'
    sections.append(section)

css = (base / 'five-arena-themes.css').read_text()
css = css[:css.index('/* 02 —')] + css[css.index('@media(max-width:800px)'):]
css = css.replace('#spx-explorations', '#spx-refined-light-gold')
gold_css = (base / 'arena-premium-gold.css').read_text()
for key in ('midnight', 'bordeaux', 'obsidian'):
    gold_css = re.sub(r'#spx-premium-gold \.palette-' + key + r' \{.*?\n\}\n', '', gold_css, flags=re.S)
css += '\n' + gold_css.replace('#spx-premium-gold', '#spx-refined-light-gold')
css += '\n' + (base / 'arena-refined-light-gold.css').read_text()
images = re.search(r'<script type="application/json" id="arena-gold-portraits">(.*?)</script>', previous, re.S).group(1)
script = (base / 'arena-gold-interactions.js').read_text().replace('spx-premium-gold', 'spx-refined-light-gold').replace('arena-gold-portraits', 'arena-refined-gold-portraits').replace('arenaPremiumGold', 'arenaRefinedLightGold')
(base / 'arena-refined-gold-interactions.js').write_text(script)
fragment = '<style>\n' + css + '\n</style>\n<div id="spx-refined-light-gold">\n<div class="viz-carousel" aria-label="Pearl and Jade favorites with three new light gold palettes">\n' + '\n'.join(sections) + '\n</div>\n</div>\n<script type="application/json" id="arena-refined-gold-portraits">' + images + '</script>\n<script>\n' + script + '\n</script>\n'
output = base / 'spx-arena-refined-light-gold.html'
output.write_text(fragment)
assert len(fragment.encode()) < 1000000
ids = re.findall(r'\bid="([^"]+)"', fragment[:fragment.index('<script')])
assert len(ids) == len(set(ids)), 'Duplicate element IDs'
assert fragment.count('data-variant=') == 5
assert fragment.count('class="contender-deck"') == 5
assert len(re.findall(r'<section data-variant=.*? hidden>', fragment)) == 4
print(f'Five palettes: {len(fragment.encode()):,} bytes. Pearl and Jade markup unchanged, original palette rules retained.')
