from pathlib import Path
import base64,json,hashlib

folder=Path(__file__).parent
before=(folder/'spx-arena-before-fantasy.html').read_text()
style,rest=before.split('</style>',1)
remove=['.ringside','.rare ','.arcade','.tabletop','/* 02 —','/* 03 /','/* 04 /','/* 05 /']
style='\n'.join(line for line in style.splitlines() if not any(x in line for x in remove))
style=style.replace('<style>','<style>\n@import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap");',1)
style+='\n'+(folder/'fantasy-directions.css').read_text()+'\n</style>'
night=rest[:rest.index(' <section data-variant="02')]
scripts=rest[rest.index('<script type="application/json"'):]
scripts=scripts.replace("const img=document.createElement('img');img.src=portraitSource;", "const img=document.createElement('img');img.src=el.closest('.fantasy')?fantasyPortraitSource:portraitSource;")
scripts=scripts.replace(" const personNames=", " const fantasyPortraitSource=JSON.parse(document.getElementById('spx-fantasy-portrait-data').textContent).src;\n const personNames=",1)
scripts=scripts.replace(" root.querySelectorAll('.portrait').forEach(mountPortrait);",(folder/'fantasy-init.js').read_text()+"\n root.querySelectorAll('.portrait').forEach(mountPortrait);")
start=scripts.index(' function syncDesign(state) {')
end=scripts.index(' if(globalThis.Tweak)',start)
scripts=scripts[:start]+(folder/'fantasy-interactions.js').read_text()+'\n'+scripts[end:]
scripts=scripts.replace('privateContent:{investors}', 'privateContent:{investors,fantasySelections}')
image_json=json.dumps({'src':'data:image/jpeg;base64,'+base64.b64encode((folder/'fantasy-investor-portraits.jpg').read_bytes()).decode()})
asset='\n<script type="application/json" id="spx-fantasy-portrait-data">'+image_json+'</script>\n'
result=style+night+(folder/'fantasy-panels.html').read_text()+'\n</div>\n'+asset+scripts
def night_html(text):
 a=text.index(' <section data-variant="01')
 b=text.index(' <section data-variant="02')
 return text[a:b]
def preserved_styles(text):
 css=text.split('</style>')[0]
 return '\n'.join(line for line in css.splitlines() if '#spx-directions .night' in line or '#spx-directions .spx-page' in line)
assert night_html(result)==night_html(before)
assert preserved_styles(result)==preserved_styles(before)
assert result.count('data-variant=')==5
assert len(result.encode())<1000000,len(result.encode())
(folder/'spx-arena-five-directions.html').write_text(result)
print({'bytes':len(result.encode()),'night_session_markup_and_styles_unchanged':True,'night_sha256':hashlib.sha256(night_html(result).encode()).hexdigest()})
