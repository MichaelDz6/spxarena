from pathlib import Path
import base64,json,re
base=Path(__file__).resolve().parent
original=(base/'long-term-rating.js').read_text()
prelude=original.split(' const saved=')[0].replace("getElementById('spx-directions')","getElementById('spx-tavern-home')")
sources=' const sources='+original.split(' const sources=',1)[1].split('\n root.querySelectorAll',1)[0]+'\n'
core=(base/'fantasy-directions.css').read_text().split('/* 02:')[0].replace('#spx-directions','#spx-tavern-home')
custom=(base/'arena-home.css').read_text()
# CSS imports must precede all rules.
font,custom=custom.split('\n',1)
js=prelude+sources+(base/'arena-home-interactions.js').read_text()
(base/'arena-home-compiled.js').write_text(js)
portrait={'src':'data:image/jpeg;base64,'+base64.b64encode((base/'investor-portraits.jpg').read_bytes()).decode()}
fragment='<style>\n'+font+'\n'+core+custom+'\n</style>\n'+(base/'arena-home-markup.html').read_text()+'\n<script type="application/json" id="spx-home-portrait-data">'+json.dumps(portrait)+'</script>\n<script>\n'+js+'\n</script>\n'
out=base/'spx-arena-gilded-home.html';out.write_text(fragment)
ids=re.findall(r'\bid="([^"]+)"',fragment)
assert len(ids)==len(set(ids)), 'Duplicate ID'
assert out.stat().st_size<1_000_000
assert '<html' not in fragment.lower() and '<!doctype' not in fragment.lower()
print(f'{out.name}: {out.stat().st_size:,} bytes; {len(ids)} unique IDs')
