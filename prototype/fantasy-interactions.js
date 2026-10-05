 function updateFeature(key,d) {
  const holder=root.querySelector(`[data-feature-card="${key}"]`);
  if(!holder)return;
  const card=holder.querySelector('.arena-card');
  card.dataset.investor=d.key;card.dataset.tier=d.tier;
  card.setAttribute('aria-pressed','true');card.setAttribute('aria-label',`Compare ${d.name}, ${titleCase(d.tier)} in the 2025 season`);
  card.querySelector('.rarity-word').textContent=d.tier.toUpperCase();
  card.querySelector('.name-scroll strong').textContent=d.name;
  card.querySelector('.name-scroll small').textContent=d.fund.toUpperCase();
  card.querySelector('.card-value').textContent=fmt(d.value)+'%';
  card.querySelector('.card-gap').textContent=fmt(d.gap);
  card.querySelector('.card-foot').textContent=`SEASON 2025 · RANK 0${d.rank} / 04`;
  const portrait=card.querySelector('.portrait');portrait.dataset.person=d.key;portrait.querySelector('img').alt=d.name+' — fantasy portrait illustration';
 }
 function applyFantasy(key,id,draw=true) {
  const d=gameById[id];if(!d)return;
  fantasySelections[key]=id;
  root.querySelectorAll(`[data-fantasy-pick="${key}"]`).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.investor===id)));
  updateFeature(key,d);
  for(const [attr,value] of [['name',d.name],['fund',d.fund],['return',fmt(d.value)+'%'],['gap',fmt(d.gap)+' pp'],['tier',d.tier.toUpperCase()]]) {
   root.querySelectorAll(`[data-selected-${attr}="${key}"]`).forEach(el=>{el.textContent=value;if(attr==='tier')el.dataset.tier=d.tier;});
  }
  if(key==='spell')root.querySelector('[data-duel-outcome]').textContent=d.gap>=0?'AHEAD OF THE INDEX':'BEHIND THE INDEX';
  const history=root.querySelector(`[data-history="${key}"]`),state=chartStates[key];
  const missing=id==='bill';state.el.hidden=missing;history.querySelector('.missing-history').hidden=!missing;
  if(!missing) { state.selected=id;state.el.querySelector('select').value=id;if(draw)renderChart(state); }
 }
 function syncDesign(state) {
  const key=state.el.dataset.key;if(!['tavern','vault','guild','spell'].includes(key))return;
  applyFantasy(key,state.selected,false);
 }
 root.querySelectorAll('[data-fantasy-pick]').forEach(button=>button.addEventListener('click',()=>{applyFantasy(button.dataset.fantasyPick,button.dataset.investor);saveState();}));
 for(const key of ['tavern','vault','guild','spell'])applyFantasy(key,gameById[fantasySelections[key]]?fantasySelections[key]:chartStates[key].selected);
 window.addEventListener('openai:set_globals',event=>{
  const choices=event.detail?.globals?.widgetState?.privateContent?.fantasySelections;
  if(choices)for(const key of ['tavern','vault','guild','spell'])if(gameById[choices[key]])applyFantasy(key,choices[key]);
 });
