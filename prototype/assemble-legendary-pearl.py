from pathlib import Path
import re

base = Path(__file__).parent
original = (base / 'spx-arena-nine-in-ten.html').read_text()
css = re.search(r'<style>\n(.*?)\n</style>', original, re.S).group(1)
css = css.replace('#spx-nine-in-ten', '#spx-pearl-original')
current = re.search(r'<article class="arena-card market-card".*?</article>', original, re.S).group(0)
content = (base / 'legendary-pearl-content.html').read_text()
markup = (base / 'legendary-pearl-variants.html').read_text().replace('{{CURRENT_CARD}}', current).replace('{{RELIC_CONTENT}}', content)
css += '\n' + (base / 'legendary-pearl-variants.css').read_text()
result = '<style>\n' + css + '\n</style>\n' + markup
(base / 'spx-legendary-pearl-variants.html').write_text(result)
assert result.count('data-variant=') == 5
assert result.count(' hidden>') == 4
assert result.count('class="relic-return"') == 4
assert 'market-orbit' not in result
assert 'OUTSIDE THE INVESTOR RANKING' not in result
assert '{{' not in result
assert current in result
assert len(result.encode()) < 1000000
print(f'Current card and four new Pearl & Gold legendary designs: {len(result.encode()):,} bytes.')
