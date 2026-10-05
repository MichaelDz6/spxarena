from pathlib import Path
import base64, re, json

folder=Path(__file__).parent
target=folder/'spx-arena-five-directions.html'
original=target.read_text()
common=original.split('/* 02 — FINANCIAL REVIEW.')[0]
night=original.split(' <section data-variant="01 · Night Session"')[1].split(' <section data-variant="02 · Financial Review"')[0]
night=' <section data-variant="01 · Night Session"'+night
night=night.replace('<div class="duel-monogram" aria-label="Cathie Wood portrait placeholder">CW</div>','<span class="portrait" data-person="cathie"></span>')
night=night.replace('Monogram portrait placeholders','Editorial portrait illustrations')
script=original[original.rindex('<script>'):]
for initials,key in [('CW','cathie'),('JG','joel'),('BA','bill'),('WB','warren')]:
    script=script.replace("initials:'"+initials+"'", "key:'"+key+"'")
script=script.replace('<span class="avatar" aria-label="${d.name} portrait placeholder">${d.initials}</span>','<span class="avatar portrait" data-person="${d.key}"></span>')
script='\n'.join(line for line in script.splitlines() if "root.querySelector('[data-fight-cards]')" not in line and "root.querySelector('[data-club-cards]')" not in line)
script=re.sub(r"  if\(el.dataset.key==='review'\) \{.*?\n  \}", '', script, flags=re.S)
script=script.replace("series[saved[key]]?saved[key]:'cathie'", "series[saved[key]]?saved[key]:(el.dataset.default||'cathie')")
script=script.replace('renderChart(state);saveState();','renderChart(state);syncDesign(state);saveState();')
script=script.replace("state.el.querySelector('select').value=state.selected;renderChart(state);", "state.el.querySelector('select').value=state.selected;renderChart(state);syncDesign(state);")
script=script.replace(" if(globalThis.Tweak)", (folder/'portrait-interactions.js').read_text()+"\n if(globalThis.Tweak)")
css=(folder/'new-directions.css').read_text()
css='\n'.join(line for line in css.splitlines() if not ('.portrait img' in line and ('night ' in line or 'cinema-person' in line)))
css='\n'.join(line for line in css.splitlines() if not ('cinema-person .portrait[data-person' in line))
css=css.replace('#spx-directions .ringside h1 em', '#spx-directions .ringside h1 span')
css+='\n#spx-directions .spx-page .portrait-window { position:absolute;display:block; }\n'
css+='\n#spx-directions .files .chart-top label,#spx-directions .bracket .chart-top label { display:none; }\n'
css+='\n@media(max-width:520px) { #spx-directions .spx-page .new-section { padding:20px; } }\n'
asset=json.dumps({'src':'data:image/jpeg;base64,'+base64.b64encode((folder/'investor-portraits.jpg').read_bytes()).decode()})
result=common+css+'\n</style>\n<div id="spx-directions" class="viz-carousel" aria-label="Five SPX Arena homepage designs">\n'+night+(folder/'new-panels.html').read_text()+'\n</div>\n<script type="application/json" id="spx-portrait-data">'+asset+'</script>\n'+script
assert len(result.encode())<1000000
assert result.count('data-variant=')==5
assert not any(x in result for x in ['Financial Review','Fight Card','Market Terminal','Index Club','portrait placeholder','initials:'])
target.write_text(result)
print(f'Updated five concepts: {len(result.encode()):,} bytes')
