from pathlib import Path
import re

base=Path(__file__).parent
original=(base/'spx-arena-pearl-gold.html').read_text()
page=re.search(r'<div id="spx-pearl-gold">\n(.*?)\n</div>\n<script type="application/json"',original,re.S).group(1)
css=re.search(r'<style>\n(.*?)\n</style>',original,re.S).group(1).replace('#spx-pearl-gold','#spx-intro-five')
css+='\n'+(base/'intro-variants.css').read_text()
templates=re.findall(r'<template data-intro="([^"]+)" data-name="([^"]+)">\n(.*?)\n</template>',(base/'intro-variants-markup.html').read_text(),re.S)
sections=[]
for i,(key,name,intro) in enumerate(templates):
    part=page.replace('pearl-',key+'-').replace('design-pearl','design-'+key).replace('data-design="pearl"',f'data-design="{key}"')
    part=re.sub(r'   <section class="home-intro".*?(?=   <section class="benchmark-stage")',intro.replace('{{key}}',key)+'\n',part,flags=re.S)
    sections.append(f'<section data-variant="{name}" aria-label="{name} homepage introduction"'+(' hidden' if i else '')+'>\n'+part+'\n</section>')
images=re.search(r'<script type="application/json" id="pearl-gold-portraits">(.*?)</script>',original,re.S).group(1)
script=(base/'pearl-gold-interactions.js').read_text().replace('spx-pearl-gold','spx-intro-five').replace('pearl-gold-portraits','intro-five-portraits').replace('pearlGoldHomepage','introFiveHomepage')
script=script.replace("colorScheme:designKey,", "colorScheme:'pearl',introVariant:designKey,")
stages=(base/'five-design-interactions.js').read_text().split(' // Equal responsive stages')[1]
script=script[:script.rfind('})();')]+' // Equal responsive stages'+stages
(base/'intro-five-interactions.js').write_text(script)
fragment='<style>\n'+css+'\n</style>\n<div id="spx-intro-five">\n<div class="viz-carousel" aria-label="Five homepage introduction directions">\n'+'\n'.join(sections)+'\n</div>\n</div>\n<script type="application/json" id="intro-five-portraits">'+images+'</script>\n<script>\n'+script+'\n</script>\n'
(base/'spx-arena-five-intros.html').write_text(fragment)
assert len(fragment.encode())<1000000
ids=re.findall(r'\bid="([^"]+)"',fragment[:fragment.index('<script')])
assert len(ids)==len(set(ids))
assert len(templates)==5
assert fragment.count('class="contender-deck"')==5
assert '{{key}}' not in fragment
print(f'Five intro directions: {len(fragment.encode()):,} bytes; unique IDs; original lower-page content retained.')
