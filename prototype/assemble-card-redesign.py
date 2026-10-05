from pathlib import Path
import re,hashlib

folder=Path(__file__).parent
before=(folder/'spx-arena-before-card-redesign.html').read_text()
style,rest=before.split('</style>',1)
style='\n'.join(line for line in style.splitlines() if not any(x in line for x in ['#spx-directions .collectors','#spx-directions .bracket','#spx-directions .files','/* 03 —','/* 04 —','/* 05 —']))
style+='\n'+(folder/'card-directions.css').read_text()+'\n</style>'
first=rest.index(' <section data-variant="03')
last=rest.index('<script type="application/json"')
panels=rest[:first]+(folder/'card-directions.html').read_text()+'\n</div>\n'+rest[last:]
start=panels.index(' const fileNotes=')
end=panels.index(' if(globalThis.Tweak)',start)
panels=panels[:start]+(folder/'card-interactions.js').read_text()+'\n'+panels[end:]
result=style+panels

def preserved_markup(text):
    a=text.index(' <section data-variant="01')
    b=text.index(' <section data-variant="03')
    return text[a:b]

def protected_styles(text):
    css=text.split('</style>')[0]
    return '\n'.join(line for line in css.splitlines() if '#spx-directions' in line and not any(x in line for x in ['.collectors','.bracket','.files','.rare','.arcade','.tabletop']))

assert preserved_markup(before)==preserved_markup(result)
assert protected_styles(before)==protected_styles(result)
assert result.count('data-variant=')==5
assert len(result.encode())<1000000
assert not any(x in result for x in ['The Collectors','The Bracket','Investor Files','data-file=','data-bracket='])
(folder/'spx-arena-five-directions.html').write_text(result)
print({'bytes':len(result.encode()),'designs_1_and_2_markup_unchanged':True,'designs_1_and_2_css_unchanged':True,'protected_markup_sha256':hashlib.sha256(preserved_markup(result).encode()).hexdigest()})
