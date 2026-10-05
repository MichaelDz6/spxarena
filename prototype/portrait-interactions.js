 const portraitSource=JSON.parse(document.getElementById('spx-portrait-data').textContent).src;
 const personNames={cathie:'Cathie Wood',warren:'Warren Buffett',bill:'Bill Ackman',joel:'Joel Greenblatt'};
 function mountPortrait(el) {
  const crop=document.createElement('span');crop.className='portrait-window';
  const img=document.createElement('img');img.src=portraitSource;img.alt=personNames[el.dataset.person]+' — illustrated portrait';img.decoding='async';
  crop.append(img);el.replaceChildren(crop);
  new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;const side=Math.max(width,height);crop.style.width=side+'px';crop.style.height=side+'px';crop.style.left=(width-side)/2+'px';crop.style.top=Math.min(0,(height-side)*.2)+'px';}).observe(el);
 }
 root.querySelectorAll('.portrait').forEach(mountPortrait);
 const fileNotes={
  warren:{number:'001',vehicle:'BERKSHIRE · MARKET VALUE',note:'A shareholder’s return from the conglomerate he led, measured against the same market and dates.'},
  cathie:{number:'002',vehicle:'ARKK · NAV TOTAL RETURN',note:'The innovation fund’s published NAV return, including reinvested distributions. A strong year can hide a difficult five-year record.'},
  joel:{number:'003',vehicle:'GINDX · CO-MANAGED FUND',note:'Gotham Enhanced 500 is co-managed by Joel Greenblatt and Robert Goldstein. The fund’s return includes its active overlay.'}
 };
 function syncDesign(state) {
  if(state.el.dataset.key==='bracket') {
   const d=roster.find(d=>d.key===state.selected);
   root.querySelectorAll('[data-bracket]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bracket===state.selected)));
   root.querySelector('[data-bracket-name]').textContent=d.name.toUpperCase();
   root.querySelector('[data-bracket-gap]').textContent=fmt(d.gap)+' pp';
   root.querySelector('[data-bracket-outcome]').textContent=(d.gap>0?'Outperformed':'Trailed')+' the benchmark in 2025';
  }
  if(state.el.dataset.key==='files') {
   const d=series[state.selected],meta=fileNotes[state.selected];
   const annual=(Math.pow(accumulate(d.returns)[5]/10000,1/5)-1)*100;
   const base=(Math.pow(benchmark[5]/10000,1/5)-1)*100;
   root.querySelectorAll('[data-file]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.file===state.selected)));
   root.querySelector('[data-file-number]').textContent='INVESTOR / '+meta.number;
   root.querySelector('[data-file-name]').textContent=d.name.toUpperCase();
   root.querySelector('[data-file-vehicle]').textContent=meta.vehicle;
   root.querySelector('[data-file-note]').textContent=meta.note;
   root.querySelector('[data-file-return]').textContent=fmt(annual)+'%';
   root.querySelector('[data-file-fund]').textContent=d.vehicle+' · 2021–2025';
   const gap=root.querySelector('[data-file-gap]');gap.textContent=fmt(annual-base)+' pp / YEAR';gap.style.color=annual>base?'var(--positive)':'var(--negative)';
   const portrait=root.querySelector('[data-file-portrait]');portrait.dataset.person=state.selected;portrait.querySelector('img').alt=d.name+' — illustrated portrait';
  }
 }
 root.querySelectorAll('[data-bracket],[data-file]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.hasAttribute('data-bracket')?'bracket':'files';
  const state=chartStates[key];state.selected=button.dataset.bracket||button.dataset.file;
  state.el.querySelector('select').value=state.selected;renderChart(state);syncDesign(state);saveState();
 }));
 Object.values(chartStates).forEach(syncDesign);
