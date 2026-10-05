from pathlib import Path
import re

base = Path(__file__).parent
original = (base / 'spx-arena-five-new-designs.html').read_text()
first = re.search(r'<section data-variant="Gilded Arena" aria-label="Gilded Arena homepage">\n(.*?)\n</section>\n<section data-variant="Ivory League"', original, re.S).group(1)
palettes = [('sapphire', 'Sapphire & Silver'), ('forest', 'Forest & Gold'), ('amethyst', 'Amethyst & Platinum'), ('crimson', 'Crimson & Copper'), ('ivory', 'Ivory & Bronze')]
sections = []
for i, (key, name) in enumerate(palettes):
    part = first.replace('gilded-', key + '-').replace('design-gilded', 'design-' + key).replace('data-design="gilded"', f'data-design="{key}"')
    part = part.replace('class="fantasy arena-home gilded"', f'class="fantasy arena-home gilded palette-{key}"')
    sections.append(f'<section data-variant="{name}" aria-label="{name} color scheme"' + (' hidden' if i else '') + '>\n' + part + '\n</section>')

# Retain exactly the chosen design's base rules and responsive geometry.
css = (base / 'five-arena-themes.css').read_text()
css = css[:css.index('/* 02 —')] + css[css.index('@media(max-width:800px)'):]
css = css.replace('#spx-explorations', '#spx-colorways')
css += '\n' + (base / 'arena-colorways.css').read_text()
images = re.search(r'<script type="application/json" id="arena-six-portraits">(.*?)</script>', original, re.S).group(1)
script = (base / 'five-design-interactions.js').read_text().replace('spx-explorations', 'spx-colorways').replace('arena-six-portraits', 'arena-colorway-portraits').replace('arenaDesigns', 'arenaColorways')
script = script.replace('modelContent:{design:designKey,', "modelContent:{design:'Gilded Arena',colorScheme:designKey,")
(base / 'arena-colorway-interactions.js').write_text(script)
fragment = '<style>\n' + css + '\n</style>\n<div id="spx-colorways">\n<div class="viz-carousel" aria-label="Five color schemes for Gilded Arena">\n' + '\n'.join(sections) + '\n</div>\n</div>\n<script type="application/json" id="arena-colorway-portraits">' + images + '</script>\n<script>\n' + script + '\n</script>\n'
(base / 'spx-arena-five-color-schemes.html').write_text(fragment)
assert len(fragment.encode()) < 1000000
ids = re.findall(r'\bid="([^"]+)"', fragment[:fragment.index('<script')])
assert len(ids) == len(set(ids)), 'Duplicate element IDs'
print('Five color-only variants; bytes:', len(fragment.encode()))
print('Shared content, typography and card geometry preserved.')
