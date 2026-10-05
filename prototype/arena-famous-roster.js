 const rosterOrder=['warren','cathie','bill','burry','dalio','cramer','loeb','pabrai','smith','gabelli','danoff','asness','berkowitz','watsa','gayner','hussman','nygren','davis','rogers','herro','lynch','munger','soros','oleary','griffin','druckenmiller','simons','marks','tudor','einhorn','baron','joel','peter','carl'];
 const pageSize=6;
 const pageCount=Math.ceil(rosterOrder.length/pageSize);
 state.rosterPage=Number.isInteger(saved.rosterPage)&&saved.rosterPage>=0&&saved.rosterPage<pageCount?saved.rosterPage:0;
 state.profile=fameById[saved.profile]?saved.profile:'burry';
 function famousCard(d){
  return `<button type="button" class="arena-card profile-card cursor-interaction" data-profile="${d.key}" data-tier="unrated" aria-label="View ${d.name} profile, unranked"><span class="card-crown"><span class="card-gem" aria-hidden="true"></span><span class="rarity-word">UNRANKED</span><span class="card-gem" aria-hidden="true"></span></span><span class="hero-window"><span class="portrait" data-person="${d.key}"></span></span><span class="name-scroll"><strong>${d.name}</strong><small>${d.vehicle}</small></span><span class="profile-tagline">${d.knownFor}</span><span class="profile-card-meta"><span><small>STRATEGY</small><b>${d.category}</b></span><span><small>RECORD</small><b>${d.status}</b></span></span><span class="card-foot">VIEW PROFILE <span aria-hidden="true">↗</span></span></button>`;
 }
 $('[data-card-deck]').innerHTML=rosterOrder.map(key=>gameById[key]?cardMarkup(gameById[key]):famousCard(fameById[key])).join('');
 function updateRosterPage(scroll=false){
  const cards=$('[data-card-deck]').children;
  Array.from(cards).forEach((card,i)=>card.hidden=Math.floor(i/pageSize)!==state.rosterPage);
  $('[data-roster-range]').textContent=`${state.rosterPage*pageSize+1}–${Math.min(rosterOrder.length,(state.rosterPage+1)*pageSize)} of ${rosterOrder.length} investors`;
  $('[data-roster-prev]').disabled=state.rosterPage===0;
  $('[data-roster-next]').disabled=state.rosterPage===Math.ceil(rosterOrder.length/pageSize)-1;
  if(scroll)$('#nine-arena-contenders').scrollIntoView({block:'start',behavior:'auto'});
 }
 $('[data-roster-prev]').addEventListener('click',()=>{state.rosterPage=Math.max(0,state.rosterPage-1);updateRosterPage(true);saveState();});
 $('[data-roster-next]').addEventListener('click',()=>{state.rosterPage=Math.min(pageCount-1,state.rosterPage+1);updateRosterPage(true);saveState();});
 function renderFamousProfile(){
  const d=fameById[state.profile];
  if(!d)return;
  $('[data-profile-name]').textContent=d.name;
  $('[data-profile-vehicle]').textContent=d.vehicle;
  $('[data-profile-tagline]').textContent=d.knownFor;
  $('[data-profile-strategy]').textContent=d.category;
  $('[data-profile-status]').textContent=d.status;
  $('[data-profile-detail]').textContent=d.detail;
  $('[data-profile-source]').href=d.source;
  $('[data-profile-source]').textContent=d.sourceLabel+' ↗';
  const ranked=gameById[d.key];
  $('[data-profile-rating]').textContent=ranked?`RANK ${ranked.rank} OF ${gameRoster.length} · ${ranked.tier.toUpperCase()}`:'UNRANKED';
  $('[data-profile-rating]').dataset.tier=ranked?.tier||'unrated';
  $('[data-profile-ranking-note]').textContent=ranked?`2016–2025 · ${fmt(ranked.value)}% per year · ${fmt(ranked.gap,2)} percentage points per year versus SPY. ${ranked.method}`:'No 10-year rank or rarity has been assigned. A complete return record over matching dates is required before a profile joins the scored leaderboard.';
  const photo=$('[data-profile-portrait]');photo.dataset.person=d.key;mountPortrait(photo);
  const credit=$('[data-profile-photo-credit]');credit.href=d.photoCredit;credit.textContent='Portrait source ↗';
 }
 function openFamousProfile(key){
  if(!fameById[key])return;
  state.profile=key;showPage('profile');saveState();
 }
 root.addEventListener('click',e=>{
  const button=e.target.closest('[data-profile]');
  if(button&&root.contains(button))openFamousProfile(button.dataset.profile);
 });
 updateRosterPage();
