from pathlib import Path
import re

base = Path(__file__).parent
original = (base / 'spx-arena-five-color-schemes.html').read_text()
ivory = re.search(r'<section data-variant="Ivory & Bronze" aria-label="Ivory & Bronze color scheme" hidden>\n(.*?)\n</section>\n</div>\n</div>', original, re.S).group(1)
palettes = [('champagne', 'Champagne & Gold'), ('pearl', 'Pearl & Copper'), ('sage', 'Sage & Brass')]
sections = []
for i, (key, name) in enumerate(palettes):
    part = ivory.replace('ivory-', key + '-').replace('design-ivory', 'design-' + key).replace('data-design="ivory"', f'data-design="{key}"')
    part = part.replace('gilded palette-ivory"', f'gilded palette-ivory palette-{key}"')
    sections.append(f'<section data-variant="{name}" aria-label="{name} color scheme"' + (' hidden' if i else '') + '>\n' + part + '\n</section>')

css = re.search(r'<style>\n(.*?)\n</style>', original, re.S).group(1).replace('#spx-colorways', '#spx-light-palettes')
css += '\n' + (base / 'arena-light-palettes.css').read_text()
images = re.search(r'<script type="application/json" id="arena-colorway-portraits">(.*?)</script>', original, re.S).group(1)
script = (base / 'arena-colorway-interactions.js').read_text().replace('spx-colorways', 'spx-light-palettes').replace('arena-colorway-portraits', 'arena-light-portraits').replace('arenaColorways', 'arenaLightPalettes')
(base / 'arena-light-interactions.js').write_text(script)
fragment = '<style>\n' + css + '\n</style>\n<div id="spx-light-palettes">\n<div class="viz-carousel" aria-label="Three light palettes inspired by Ivory & Bronze">\n' + '\n'.join(sections) + '\n</div>\n</div>\n<script type="application/json" id="arena-light-portraits">' + images + '</script>\n<script>\n' + script + '\n</script>\n'
(base / 'spx-arena-three-light-palettes.html').write_text(fragment)
assert len(fragment.encode()) < 1000000
ids = re.findall(r'\bid="([^"]+)"', fragment[:fragment.index('<script')])
assert len(ids) == len(set(ids)), 'Duplicate IDs'
print('Three light palettes:', ', '.join(name for _, name in palettes))
print('Fragment bytes:', len(fragment.encode()))
