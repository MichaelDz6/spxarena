from pathlib import Path
import re

base = Path(__file__).parent
original = (base / 'spx-arena-nine-in-ten.html').read_text()
css = re.search(r'<style>\n(.*?)\n</style>', original, re.S).group(1)
css = css.replace('#spx-nine-in-ten', '#spx-current-legend')
current_card = re.search(r'<article class="arena-card market-card".*?</article>', original, re.S).group(0)
markup = (base / 'legendary-card-variants.html').read_text().replace('{{CURRENT_CARD}}', current_card)
css += '\n' + (base / 'legendary-card-variants.css').read_text()
result = '<style>\n' + css + '\n</style>\n' + markup
(base / 'spx-legendary-card-variants.html').write_text(result)
assert result.count('data-variant=') == 5
assert result.count(' hidden>') == 4
assert 'market-orbit' not in result
assert 'OUTSIDE THE INVESTOR RANKING' not in result
assert '{{' not in result
assert len(result.encode()) < 1000000
print(f'Five legendary card variants: {len(result.encode()):,} bytes. Original card preserved.')
