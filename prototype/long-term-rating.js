(() => {
 const root=document.getElementById('spx-directions');
 // All observations are calendar-year total returns, 2016–2025.
 // SPY uses market-price total returns; fund NAV / Berkshire market value are explicit.
 const benchmarkReturns=[12.00,21.70,-4.57,31.22,18.33,28.73,-18.17,26.18,24.89,17.72];
 const series={
  bill:{name:'Bill Ackman',vehicle:'PSH · NAV',returns:[-13.5,-4.0,-0.7,58.1,70.2,26.9,-8.8,26.7,10.2,20.9]},
  joel:{name:'Joel Greenblatt',vehicle:'GINDX · co-managed',returns:[17.98,26.05,-3.50,19.37,6.80,32.75,-11.61,26.42,26.05,22.29]},
  cathie:{name:'Cathie Wood',vehicle:'ARKK · NAV',returns:[-1.97,87.41,3.58,35.23,152.51,-23.36,-66.99,67.82,8.36,35.58]},
  warren:{name:'Warren Buffett',vehicle:'Berkshire · market value',returns:[23.4,21.9,2.8,11.0,2.4,29.6,4.0,15.8,25.5,10.9]}
 };
 const cagr=rs=>(Math.pow(rs.reduce((v,r)=>v*(1+r/100),1),1/rs.length)-1)*100;
 const accumulate=rs=>rs.reduce((a,r)=>[...a,a[a.length-1]*(1+r/100)],[10000]);
 const fmt=(n,places=1)=>`${n<0?'−':'+'}${Math.abs(n).toFixed(places)}`;
 const tierFor=(gap,years)=>!Number.isFinite(gap)?'unrated':gap>=(years===1?10:3)?'legendary':gap>=(years===1?4:1)?'epic':gap>=0?'rare':'common';
 const titleCase=s=>s[0].toUpperCase()+s.slice(1);
 const benchmarkStats=Object.fromEntries([10,5,1].map(n=>[n,cagr(benchmarkReturns.slice(-n))]));
 const gameRoster=Object.entries(series).map(([key,d])=>{
  const stats=Object.fromEntries([10,5,1].map(n=>{
   const value=d.returns.length>=n?cagr(d.returns.slice(-n)):null;
   const gap=value===null?null:value-benchmarkStats[n];
   const precision=['bill','warren'].includes(key)?0.05:0.005;
   const lower=cagr(d.returns.slice(-n).map(r=>r-precision))-cagr(benchmarkReturns.slice(-n).map(r=>r+0.005));
   const upper=cagr(d.returns.slice(-n).map(r=>r+precision))-cagr(benchmarkReturns.slice(-n).map(r=>r-0.005));
   // Do not let rounding decide a badge when the plausible gap spans a tier boundary.
   const tier=tierFor(lower,n)===tierFor(upper,n)?tierFor(gap,n):'unrated';
   return [n,{value,gap,tier}];
  }));
  const windows=Array.from({length:6},(_,i)=>({start:2016+i,end:2020+i,gap:cagr(d.returns.slice(i,i+5))-cagr(benchmarkReturns.slice(i,i+5))}));
  return {...d,key,fund:d.vehicle,stats,windows,value:stats[10].value,gap:stats[10].gap,tier:stats[10].tier};
 }).sort((a,b)=>b.gap-a.gap).map((d,i)=>({...d,rank:i+1}));
 const gameById=Object.fromEntries(gameRoster.map(d=>[d.key,d]));
 const saved=window.openai?.widgetState?.privateContent||{};
 const fantasySelections={...(saved.fantasySelections||{})};
 const chartStates={};
 const portraitSource=JSON.parse(document.getElementById('spx-portrait-data').textContent).src;
 const fantasyPortraitSource=JSON.parse(document.getElementById('spx-fantasy-portrait-data').textContent).src;
 function mountPortrait(el) {
  const crop=document.createElement('span');crop.className='portrait-window';
  const img=document.createElement('img');img.src=el.closest('.fantasy')?fantasyPortraitSource:portraitSource;
  img.alt=series[el.dataset.person].name+' — illustrated portrait';img.decoding='async';crop.append(img);el.replaceChildren(crop);
  new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;const side=Math.max(width,height);crop.style.width=side+'px';crop.style.height=side+'px';crop.style.left=(width-side)/2+'px';crop.style.top=Math.min(0,(height-side)*.2)+'px';}).observe(el);
 }
 function miniStats(d) {
  return [5,1].map(n=>`<span class="period-stat" data-tier="${d.stats[n].tier}"><span class="period-caption">${n}Y ${n===1?'SEASON':'FORM'} <em>${titleCase(d.stats[n].tier)}</em></span><span class="period-numbers"><b>${fmt(d.stats[n].value)}%</b><small>${fmt(d.stats[n].gap,2)} pp${n===1?'':'/yr'}</small></span></span>`).join('');
 }
 function cardMarkup(d,key) {
  return `<button class="arena-card cursor-interaction" data-fantasy-pick="${key}" data-investor="${d.key}" data-tier="${d.tier}" aria-pressed="${d.key==='bill'}" aria-label="Compare ${d.name}, ${titleCase(d.tier)} over 10 years"><span class="card-crown"><span class="card-gem" aria-hidden="true"></span><span class="rarity-word">10Y · ${d.tier.toUpperCase()}</span><span class="card-gem" aria-hidden="true"></span></span><span class="hero-window"><span class="portrait" data-person="${d.key}"></span></span><span class="name-scroll"><strong>${d.name}</strong><small>${d.fund.toUpperCase()}</small></span><span class="card-stats"><span><b class="card-value">${fmt(d.value)}%</b><small>10Y ANNUALIZED</small></span><span><b class="card-gap">${fmt(d.gap,2)}</b><small>PP / YR VS SPY</small></span></span><span class="period-stats">${miniStats(d)}</span><span class="card-foot">2016–2025 · RANK 0${d.rank} / 04</span></button>`;
 }
 function inventoryMarkup(d,key) {
  return `<button class="inventory-row cursor-interaction" data-fantasy-pick="${key}" data-investor="${d.key}" data-tier="${d.tier}" aria-pressed="${d.key==='bill'}" aria-label="Choose ${d.name}, ${titleCase(d.tier)} over 10 years"><span class="portrait" data-person="${d.key}"></span><span class="inventory-copy"><strong>${d.name}</strong><small>10Y ${titleCase(d.tier)} · #0${d.rank}</small></span><span class="inventory-value">${fmt(d.value)}%</span></button>`;
 }
 root.querySelectorAll('[data-card-deck]').forEach(el=>el.innerHTML=gameRoster.map(d=>cardMarkup(d,el.dataset.cardDeck)).join(''));
 root.querySelectorAll('[data-feature-card]').forEach(el=>el.innerHTML=cardMarkup(gameById.bill,el.dataset.featureCard));
 root.querySelectorAll('[data-inventory]').forEach(el=>el.innerHTML=gameRoster.map(d=>inventoryMarkup(d,el.dataset.inventory)).join(''));
 root.querySelectorAll('[data-podium]').forEach(el=>el.innerHTML=[gameRoster[1],gameRoster[0],gameRoster[2]].map(d=>`<div class="podium-place" data-place="${d.rank}" data-tier="${d.tier}"><span class="podium-number">${['I','II','III'][d.rank-1]}</span>${cardMarkup(d,el.dataset.podium)}<span class="podium-plinth">${d.tier.toUpperCase()} · ${fmt(d.gap,2)} PP / YR</span></div>`).join(''));
 root.querySelectorAll('[data-ranking]').forEach(el=>{
  el.innerHTML=`<table class="board-table"><caption class="rating-sr">Four selected vehicles ranked by 10-year annualized return minus SPY total return, ending December 31, 2025.</caption><thead><tr><th scope="col">#</th><th scope="col">Investor / vehicle</th><th scope="col" class="numeric">10Y / yr</th><th scope="col">Gap / yr</th></tr></thead><tbody>${gameRoster.map(d=>`<tr><td class="rank mono">0${d.rank}</td><td><div class="identity"><span class="avatar portrait" data-person="${d.key}"></span><div><strong>${d.name}</strong><small>${d.fund}</small><span class="night-rarity" data-tier="${d.tier}">10Y ${titleCase(d.tier)}</span></div></div></td><td class="numeric">${fmt(d.value)}%</td><td class="numeric ${d.gap>=0?'up':'down'}">${fmt(d.gap,2)}<small>pp</small></td></tr>`).join('')}</tbody></table><p class="ranking-period-note">10Y rank · 2016–2025 · Four selected vehicles</p>`;
 });
 const tierRules=`<p class="rating-principle">10 years earn the frame.<br>5 years show form. 1 year is a season.</p><div class="tier-key"><span data-tier="legendary"><i></i>Legendary<small>≥3 pp/yr</small></span><span data-tier="epic"><i></i>Epic<small>1–&lt;3</small></span><span data-tier="rare"><i></i>Rare<small>0–&lt;1</small></span><span data-tier="common"><i></i>Common<small>&lt;0</small></span></div><details class="tier-rules"><summary>How the long-term tiers work</summary><p><b>Main score:</b> 10-year annualized vehicle return minus SPY market-price total return, on the same dates. All current comparisons end December 31, 2025; 10Y starts December 31, 2015, 5Y starts December 31, 2020, and 1Y starts December 31, 2024. Returns include reinvested distributions and applicable fund expenses, before personal taxes.</p><p><b>10Y and 5Y:</b> Legendary ≥3 pp/year; Epic ≥1 and &lt;3; Rare ≥0 and &lt;1; Common &lt;0. <b>1Y season:</b> Legendary ≥10 pp; Epic ≥4 and &lt;10; Rare ≥0 and &lt;4; Common &lt;0. These are SPX Arena’s proposed performance tiers, not statistical proof of skill or risk-adjusted grades.</p><p><b>Eligibility:</b> fewer than 10 verified years means no main rank; a complete 5Y record qualifies for a separate 5Y division. Missing records are Unrated, never Common. If the precision of published data spans a tier boundary, that badge also remains Unrated. PSH’s 5Y gap is too close to zero to rate from rounded annual figures. Full-career comparisons belong in Legacy, with their own matched benchmark dates.</p><p>Ranks use unrounded calculations; displayed values are rounded. Risk and leverage differ. A future reporting update must use the same verified end date across the division.</p></details>`;
 root.querySelectorAll('[data-tier-rules]').forEach(el=>el.innerHTML=tierRules);
 const sources=`<details class="source-details"><summary>Sources &amp; comparison notes · as of Dec 31, 2025</summary><p>The four selected vehicles are ranked by 10-year annualized outperformance versus SPY, the S&amp;P 500 ETF. This is a dated research snapshot, not a live ranking of all investors. Figures are approximately calculated by compounding rounded published annual returns. Charts use annual observations only. SPY is market-price total return; ARKK, GINDX and PSH are NAV returns after fund expenses. Berkshire is per-share market value. NAV and shareholder returns are different measures; these labels stay visible.</p><p>Annual data: <a href="https://assets.ark-funds.com/media-12243148-2a3e-4996-9763-260f93905eb9/43f4ba54-a65f-44d9-b18c-c911a1d6e3e4/ARK%20Innovation%20ETF%20Summary%20Prospectus.pdf" target="_blank" rel="noopener noreferrer">ARK prospectus, 2016–2024</a> · <a href="https://www.ark-funds.com/funds/arkk" target="_blank" rel="noopener noreferrer">ARK, 2025</a> · <a href="https://www.berkshirehathaway.com/letters/2025ltr.pdf" target="_blank" rel="noopener noreferrer">Berkshire</a> · <a href="https://www.gothamfunds.com/Download.aspx?ID=457bfb70-a1f5-4692-858e-35a279efb3a3&Inline=1" target="_blank" rel="noopener noreferrer">Gotham</a> · <a href="https://assets.pershingsquareholdings.com/wp-content/uploads/2026/02/11144917/2026-Annual-Investor-Presentation.pdf" target="_blank" rel="noopener noreferrer">Pershing Square</a> · <a href="https://www.financecharts.com/compare/AME%2CNAV/performance" target="_blank" rel="noopener noreferrer">SPY annual returns</a> · <a href="https://media.fidelity.com/assets/Fidelity.com_VMS/791/211/031926_ITM_Show-Notes.pdf" target="_blank" rel="noopener noreferrer">Fidelity: SPY 1Y / 5Y / 10Y cross-check</a> · <a href="https://www.spglobal.com/spdji/en/documents/spiva/spiva-us-year-end-2025.pdf" target="_blank" rel="noopener noreferrer">SPIVA</a>.</p><p>GINDX is co-managed by Joel Greenblatt and Robert Goldstein. Berkshire is a conglomerate. PSH NAV includes the effects of its structure and buybacks; it is not its listed-share return. Annual observations cannot measure intra-year maximum drawdown. No risk score is fabricated. Historical performance does not establish future returns.</p></details>`;
 root.querySelectorAll('[data-sources]').forEach(el=>el.innerHTML=sources);
 root.querySelectorAll('.missing-history').forEach(el=>el.remove());
 root.querySelectorAll('.portrait').forEach(mountPortrait);
 function saveState() {
  const investors=Object.fromEntries(Object.entries(chartStates).map(([k,v])=>[k,v.selected]));
  const horizons=Object.fromEntries(Object.entries(chartStates).map(([k,v])=>[k,v.years]));
  window.openai?.setWidgetState({modelContent:{comparison:'SPX Arena, 10-year main rarity and 5Y/1Y badges, through 2025',selectedInvestors:investors,chartHorizons:horizons},privateContent:{investors,horizons,fantasySelections}})?.catch(()=>{});
 }
 root.querySelectorAll('[data-chart]').forEach(el=>{
  const key=el.dataset.key,defaultId=key==='night'?'cathie':'bill';
  const state={selected:series[saved.investors?.[key]]?saved.investors[key]:defaultId,years:[1,5,10].includes(saved.horizons?.[key])?saved.horizons[key]:10,el,height:Number(el.dataset.height),lastWidth:0};
  chartStates[key]=state;
  el.innerHTML=`<div class="chart-top"><div><div class="chart-title">Growth of $10,000</div><div class="chart-sub"></div></div><label><span class="rating-sr">Compare investor</span><select class="chart-select" aria-label="Compare investor in ${key} design">${Object.entries(series).map(([k,d])=>`<option value="${k}" ${k===state.selected?'selected':''}>${d.name}</option>`).join('')}</select></label></div><div class="horizon-controls" role="group" aria-label="Chart period in ${key} design">${[10,5,1].map(n=>`<button type="button" class="cursor-interaction" data-horizon="${n}" aria-pressed="${state.years===n}">${n}Y${n===10?' · Main':n===5?' · Form':' · Season'}</button>`).join('')}</div><svg class="spx-chart" role="img" aria-label="Investment growth comparison"></svg><div class="chart-legend"><span><b></b>SPY total return</span><span><b class="investor-line"></b><span class="legend-investor"></span></span></div><div class="chart-readout" aria-live="polite"></div><details class="record-details"><summary>Consistency &amp; risk</summary><div class="record-content"></div></details>`;
  el.querySelector('select').addEventListener('change',e=>{state.selected=e.target.value;renderChart(state);if(key!=='night')applyFantasy(key,state.selected,false);saveState();});
  el.querySelectorAll('[data-horizon]').forEach(button=>button.addEventListener('click',()=>{state.years=Number(button.dataset.horizon);renderChart(state);saveState();}));
  new ResizeObserver(entries=>{const width=Math.round(entries[0].contentRect.width);if(width>0&&width!==state.lastWidth){state.lastWidth=width;renderChart(state);}}).observe(el);
 });
 function renderChart(state) {
  const {el,selected,years}=state,d=gameById[selected];
  el.querySelector('.chart-sub').textContent=`${2026-years}–2025 · ${years}Y ${years===1?'season return':'annualized comparison'}`;
  el.querySelectorAll('[data-horizon]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.horizon)===years)));
  const w=Math.round(el.clientWidth);if(w<50)return;
  const h=state.height,p={l:45,r:12,t:14,b:29},values=accumulate(d.returns.slice(-years)),benchmark=accumulate(benchmarkReturns.slice(-years));
  const max=Math.ceil(Math.max(...values,...benchmark)/10000)*10000;
  const x=i=>p.l+i*(w-p.l-p.r)/years,y=v=>h-p.b-v/max*(h-p.t-p.b);
  const path=a=>a.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const ticks=Array.from({length:4},(_,i)=>i*max/3),positions=years===1?[0,1]:w<390?[0,Math.floor(years/2),years]:years===10?[0,2,4,6,8,10]:[0,1,2,3,4,5];
  const svg=el.querySelector('svg');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.style.height=h+'px';
  svg.setAttribute('aria-label',`Growth of ten thousand US dollars, ${2026-years} through 2025. ${d.vehicle}: ${Math.round(values[years])} dollars. SPY: ${Math.round(benchmark[years])} dollars. Annual observations with distributions reinvested.`);
  svg.innerHTML=`<title>${d.name} vs SPY, ${years} years</title><desc>USD investment value. Annual observations only, starting December 31, ${2025-years}.</desc>${ticks.map(v=>`<line x1="${p.l}" x2="${w-p.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width="1"/><text x="${p.l-7}" y="${y(v)+4}" fill="var(--soft)" font-family="IBM Plex Mono,monospace" font-size="11" text-anchor="end">$${Math.round(v/1000)}k</text>`).join('')}<path d="${path(benchmark)} L${x(years)},${h-p.b} L${x(0)},${h-p.b} Z" fill="var(--accent)" opacity=".065"/><path d="${path(benchmark)}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/><path d="${path(values)}" fill="none" stroke="var(--investor)" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>${positions.map(i=>`<text x="${x(i)}" y="${h-7}" fill="var(--soft)" font-size="11" font-family="IBM Plex Mono,monospace" text-anchor="${i===0?'start':i===years?'end':'middle'}">${i===0?'DEC ':''}’${String(2025-years+i).slice(2)}</text>`).join('')}${benchmark.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="2.5" fill="var(--accent)"/>`).join('')}${values.map((v,i)=>`<rect x="${x(i)-2.3}" y="${y(v)-2.3}" width="4.6" height="4.6" fill="var(--investor)"/>`).join('')}<line class="hover-guide" x1="0" x2="0" y1="${p.t}" y2="${h-p.b}" stroke="var(--soft)" opacity="0"/><rect class="chart-hit" x="${p.l}" y="${p.t}" width="${w-p.l-p.r}" height="${h-p.t-p.b}" fill="transparent"/>`;
  el.querySelector('.legend-investor').textContent=d.vehicle;
  const dollars=n=>'$'+Math.round(n).toLocaleString('en-US');
  const readout=i=>el.querySelector('.chart-readout').innerHTML=`<span>DEC ${2025-years+i}</span><span>SPY ${dollars(benchmark[i])} · ${d.vehicle.split(' · ')[0]} ${dollars(values[i])}</span>`;
  readout(years);
  const hit=svg.querySelector('.chart-hit');
  hit.addEventListener('pointermove',e=>{const box=svg.getBoundingClientRect(),i=Math.max(0,Math.min(years,Math.round(((e.clientX-box.left)*w/box.width-p.l)/(w-p.l-p.r)*years))),guide=svg.querySelector('.hover-guide');guide.setAttribute('x1',x(i));guide.setAttribute('x2',x(i));guide.setAttribute('opacity','.45');readout(i);});
  hit.addEventListener('pointerleave',()=>{svg.querySelector('.hover-guide').setAttribute('opacity','0');readout(years);});
  el.querySelector('.record-content').innerHTML=`<p><b>${d.windows.filter(v=>v.gap>0).length} / 6 five-year windows beat SPY.</b> Annualized gaps for overlapping windows ending each December:</p><div class="rolling-windows">${d.windows.map(v=>`<span><small>${v.start}–${v.end}</small><b class="${v.gap>=0?'up':'down'}">${fmt(v.gap,2)} pp/yr</b></span>`).join('')}</div><p>Windows overlap; they are not independent tests of skill. The card frame always uses the full 10-year period.</p><p><b>Maximum drawdown: not yet verified.</b> Annual observations miss intra-year losses; a daily total-return series is required. ${selected==='joel'?'GINDX uses a leveraged long/short overlay.':selected==='bill'?'PSH uses leverage; NAV returns differ from its traded shares. Its 5Y rarity is Unrated because rounded source data cannot establish which side of zero the gap falls on.':selected==='cathie'?'ARKK is a concentrated thematic fund.':'Berkshire is a conglomerate, not a fund.'}</p>${selected==='warren'?'<p><b>Legacy · 1965–2025:</b> Berkshire 19.7%/yr versus S&amp;P 500 with dividends 10.5%/yr. This separately dated career record does not change the 10Y rarity. SPY did not exist for the full career period.</p>':''}`;
 }
 function applyFantasy(key,id,draw=true) {
  const d=gameById[id],state=chartStates[key];if(!d||!state)return;
  fantasySelections[key]=id;state.selected=id;state.el.querySelector('select').value=id;
  root.querySelectorAll(`[data-fantasy-pick="${key}"]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.investor===id)));
  const card=root.querySelector(`[data-feature-card="${key}"] .arena-card`);
  if(card){
   card.dataset.investor=id;card.dataset.tier=d.tier;card.setAttribute('aria-pressed','true');card.setAttribute('aria-label',`Compare ${d.name}, ${titleCase(d.tier)} over 10 years`);
   card.querySelector('.rarity-word').textContent='10Y · '+d.tier.toUpperCase();card.querySelector('.name-scroll strong').textContent=d.name;card.querySelector('.name-scroll small').textContent=d.fund.toUpperCase();
   card.querySelector('.card-value').textContent=fmt(d.value)+'%';card.querySelector('.card-gap').textContent=fmt(d.gap,2);card.querySelector('.period-stats').innerHTML=miniStats(d);card.querySelector('.card-foot').textContent=`2016–2025 · RANK 0${d.rank} / 04`;
   const portrait=card.querySelector('.portrait');portrait.dataset.person=id;portrait.querySelector('img').alt=d.name+' — fantasy portrait illustration';
  }
  for(const [attr,value] of [['name',d.name],['fund',d.fund],['return',fmt(d.value)+'%'],['gap',fmt(d.gap,2)+' pp/yr'],['tier','10Y · '+d.tier.toUpperCase()]])root.querySelectorAll(`[data-selected-${attr}="${key}"]`).forEach(el=>{el.textContent=value;if(attr==='tier')el.dataset.tier=d.tier;});
  if(key==='spell')root.querySelector('[data-duel-outcome]').textContent=d.gap>=0?'AHEAD OF SPY OVER 10 YEARS':'BEHIND SPY OVER 10 YEARS';
  if(draw)renderChart(state);
 }
 root.querySelectorAll('[data-fantasy-pick]').forEach(button=>button.addEventListener('click',()=>{applyFantasy(button.dataset.fantasyPick,button.dataset.investor);saveState();}));
 for(const key of ['tavern','vault','guild','spell'])applyFantasy(key,gameById[fantasySelections[key]]?fantasySelections[key]:chartStates[key].selected);
 const night=gameById.cathie;
 root.querySelector('[data-night-periods]').innerHTML=miniStats(night);
 window.addEventListener('openai:set_globals',event=>{
  const state=event.detail?.globals?.widgetState?.privateContent;if(!state)return;
  for(const [key,chart] of Object.entries(chartStates)){
   if([1,5,10].includes(state.horizons?.[key]))chart.years=state.horizons[key];
   const id=state.fantasySelections?.[key]||state.investors?.[key];
   if(series[id]){chart.selected=id;chart.el.querySelector('select').value=id;if(key!=='night')applyFantasy(key,id,false);}
   renderChart(chart);
  }
 });
})();
