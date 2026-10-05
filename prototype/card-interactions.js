 function syncDesign(state) {
  const key=state.el.dataset.key;
  if(!['rare','arcade','tabletop'].includes(key))return;
  const d=roster.find(d=>d.key===state.selected),history=series[state.selected];
  root.querySelectorAll(`[data-pick="${key}"][aria-pressed]`).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.investor===state.selected)));
  if(key==='arcade') {
   root.querySelector('[data-arcade-name]').textContent=d.name.toUpperCase();
   root.querySelector('[data-arcade-vehicle]').textContent=d.fund.toUpperCase();
   root.querySelector('[data-arcade-return]').textContent=fmt(d.value)+'%';
   root.querySelector('[data-arcade-gap]').textContent=fmt(d.gap)+' pp';
   root.querySelector('[data-arcade-verdict]').textContent=d.gap>0?'AHEAD OF THE INDEX':'BEHIND THE INDEX';
   const portrait=root.querySelector('[data-arcade-portrait]');portrait.dataset.person=state.selected;portrait.querySelector('img').alt=d.name+' — illustrated portrait';
  }
  if(key==='tabletop') {
   const finish=accumulate(history.returns)[5];
   const annual=(Math.pow(finish/10000,1/5)-1)*100;
   const base=(Math.pow(benchmark[5]/10000,1/5)-1)*100;
   root.querySelector('[data-tabletop-name]').textContent=d.name;
   root.querySelector('[data-tabletop-finish]').textContent='$'+Math.round(finish).toLocaleString('en-US');
   root.querySelector('[data-tabletop-vehicle]').textContent=d.fund.toUpperCase();
   root.querySelector('[data-tabletop-gap]').textContent=fmt(annual-base)+' pp / YEAR VS THE INDEX';
  }
 }
 root.querySelectorAll('[data-pick]').forEach(button=>button.addEventListener('click',()=>{
  const state=chartStates[button.dataset.pick];state.selected=button.dataset.investor;
  state.el.querySelector('select').value=state.selected;
  renderChart(state);syncDesign(state);saveState();
 }));
 const joelAnnual=(Math.pow(accumulate(series.joel.returns)[5]/10000,1/5)-1)*100;
 root.querySelector('[data-joel-cagr]').firstChild.nodeValue=fmt(joelAnnual)+'% ';
 Object.values(chartStates).forEach(syncDesign);
