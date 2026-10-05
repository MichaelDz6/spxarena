(() => {
function calculateHistory(prices, config) {
 const {initial, monthly, start, end, timing}=config;
 if(!Number.isFinite(initial)||!Number.isFinite(monthly)||initial<0||monthly<0||initial>100000000||monthly>10000000) throw new Error('Enter a starting amount from $0 to $100,000,000 and a monthly amount from $0 to $10,000,000.');
 if(!['end','beginning'].includes(timing)) throw new Error('Choose when to add your monthly contribution.');
 const first=prices.findIndex(p=>p.month===start), last=prices.findIndex(p=>p.month===end);
 if(first<1||last<1) throw new Error('Choose months between January 2016 and December 2025.');
 if(last<first) throw new Error('The end month must be the same as or after the start month.');
 let value=initial, invested=initial;
 const points=[{month:prices[first-1].month,value,invested}];
 for(let i=first;i<=last;i++) {
  const ratio=prices[i].adjustedClose/prices[i-1].adjustedClose;
  if(!Number.isFinite(ratio)||ratio<=0) throw new Error('Price data is unavailable for this period.');
  value=timing==='beginning'?(value+monthly)*ratio:value*ratio+monthly;
  invested+=monthly;
  points.push({month:prices[i].month,value,invested});
 }
 return {value,invested,gain:value-invested,months:last-first+1,points};
}

 const outer=document.getElementById('spx-nine-in-ten');
 // All observations are calendar-year total returns, 2016–2025.
 // SPY uses market-price total returns; fund NAV / Berkshire market value are explicit.
 const benchmarkReturns=[12.00,21.70,-4.57,31.22,18.33,28.73,-18.17,26.18,24.89,17.72];
 const series={
  bill:{name:'Bill Ackman',vehicle:'PSH · NAV',returns:[-13.5,-4.0,-0.7,58.1,70.2,26.9,-8.8,26.7,10.2,20.9]},
  joel:{name:'Joel Greenblatt',vehicle:'GINDX · co-managed',returns:[17.98,26.05,-3.50,19.37,6.80,32.75,-11.61,26.42,26.05,22.29]},
  cathie:{name:'Cathie Wood',vehicle:'ARKK · NAV',returns:[-1.97,87.41,3.58,35.23,152.51,-23.36,-66.99,67.82,8.36,35.58]},
  peter:{name:'Peter Schiff',vehicle:'EPIVX · affiliated fund',returns:[17.99,15.09,-14.49,16.72,18.37,7.11,0.47,9.80,5.08,47.15]},
  carl:{name:'Carl Icahn',vehicle:'Icahn funds · composite',returns:[-20.3,2.1,7.9,-15.4,-14.3,-0.3,-2.4,-16.9,-3.5,0.4]},
  warren:{name:'Warren Buffett',vehicle:'Berkshire · market value',returns:[23.4,21.9,2.8,11.0,2.4,29.6,4.0,15.8,25.5,10.9]}
 };
 Object.assign(series,JSON.parse(document.getElementById('arena-ranked-investors').textContent));
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
   const precision=d.precision??(['bill','warren','carl'].includes(key)?0.05:0.005);
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
 const fameProfiles=JSON.parse(document.getElementById('arena-famous-investors').textContent);
 const fameById=Object.fromEntries(fameProfiles.map(d=>[d.key,d]));
 const sources=`<details class="source-details"><summary>Sources &amp; comparison notes · as of Dec 31, 2025</summary><p>The arena features 34 investor profiles. Twenty selected vehicles are ranked by 10-year annualized outperformance versus SPY, the S&amp;P 500 ETF. This is a dated research snapshot, not a live ranking of all investors. Figures are estimates from published annual returns or adjusted year-end NAVs and share prices. The record details identify the method and sources. Fundsmith and Fairfax are converted to USD. This is a return ranking, not a risk-adjusted assessment; the vehicles have different mandates and exposures. Charts use annual observations only. SPY is market-price total return; ARKK, GINDX, EPIVX and PSH are NAV returns after fund expenses. Berkshire is per-share market value. NAV and shareholder returns are different measures; these labels stay visible.</p><p>Annual data: <a href="https://assets.ark-funds.com/media-12243148-2a3e-4996-9763-260f93905eb9/43f4ba54-a65f-44d9-b18c-c911a1d6e3e4/ARK%20Innovation%20ETF%20Summary%20Prospectus.pdf" target="_blank" rel="noopener noreferrer">ARK prospectus, 2016–2024</a> · <a href="https://www.ark-funds.com/funds/arkk" target="_blank" rel="noopener noreferrer">ARK, 2025</a> · <a href="https://www.berkshirehathaway.com/letters/2025ltr.pdf" target="_blank" rel="noopener noreferrer">Berkshire</a> · <a href="https://www.gothamfunds.com/Download.aspx?ID=457bfb70-a1f5-4692-858e-35a279efb3a3&Inline=1" target="_blank" rel="noopener noreferrer">Gotham</a> · <a href="https://assets.pershingsquareholdings.com/wp-content/uploads/2026/02/11144917/2026-Annual-Investor-Presentation.pdf" target="_blank" rel="noopener noreferrer">Pershing Square</a> · <a href="https://www.financecharts.com/etfs/SPY/performance" target="_blank" rel="noopener noreferrer">SPY annual returns</a> · <a href="https://media.fidelity.com/assets/Fidelity.com_VMS/791/211/031926_ITM_Show-Notes.pdf" target="_blank" rel="noopener noreferrer">Fidelity: SPY 1Y / 5Y / 10Y cross-check</a> · <a href="https://www.spglobal.com/spdji/en/documents/spiva/spiva-us-year-end-2025.pdf" target="_blank" rel="noopener noreferrer">SPIVA</a>.</p><p>GINDX is co-managed by Joel Greenblatt and Robert Goldstein. Berkshire is a conglomerate. PSH NAV includes the effects of its structure and buybacks; it is not its listed-share return. EPIVX is EuroPac International Value Class A at NAV, excluding its initial sales charge (up to 4.5%); including that charge reduces its published 10Y return to 10.84%. Peter Schiff is associated with the adviser and investment philosophy; James Nelson and Luke Allen manage the fund. It invests internationally, so SPY is an opportunity-cost comparison, not its mandate benchmark. Icahn’s figures are the published investment-fund composite, net of expenses, not IEP shareholder returns or his personal return. Annual observations cannot measure intra-year maximum drawdown. No risk score is fabricated. Historical performance does not establish future returns.</p><p>New annual records: <a href="https://www.sec.gov/Archives/edgar/data/1318342/000121390026023914/ea0277787-03_497k.htm" target="_blank" rel="noopener noreferrer">EuroPac 2026 prospectus, Class A calendar-year chart</a> · <a href="https://epcadvisorsgroup.com/wp-content/uploads/2026/02/EPIVX-Fund-Fact-Sheet-12.31.2025.pdf" target="_blank" rel="noopener noreferrer">EuroPac December 2025 factsheet</a> · Icahn annual reports: <a href="https://www.ielp.com/static-files/f81df15f-0a43-4229-bef9-0b858d10dd79" target="_blank" rel="noopener noreferrer">2018 (2016–18)</a>, <a href="https://www.ielp.com/static-files/04bff682-1623-4b57-9e6b-f5addf735797" target="_blank" rel="noopener noreferrer">2019</a>, <a href="https://www.ielp.com/static-files/f988d18e-724f-429d-b35c-5a0908660e6f" target="_blank" rel="noopener noreferrer">2022 (2020–22)</a>, <a href="https://www.ielp.com/static-files/a5d6dde9-3909-48db-bf35-28c21e788151" target="_blank" rel="noopener noreferrer">2025 (2023–25)</a>.</p></details>`;

 const savedStates={...(window.openai?.widgetState?.privateContent?.nineInTenHomepage||{})};
 outer.querySelectorAll('[data-design]').forEach(root=>{
 const designKey=root.dataset.design;
 const saved=window.openai?.widgetState?.privateContent?.nineInTenHomepage?.[designKey]||{};
 const state={selected:gameById[saved.selected]?saved.selected:'bill',years:[10,5,1].includes(saved.years)?saved.years:10};
 const portraitData=JSON.parse(document.getElementById('nine-in-ten-portraits').textContent);
 const portraitSource=portraitData.src;
 const $=selector=>root.querySelector(selector);
 const dollars=n=>'$'+Math.round(n).toLocaleString('en-US');
 function mountPortrait(el) {
  const crop=document.createElement('span');crop.className='portrait-window';
  const img=document.createElement('img');img.src=portraitData[el.dataset.person]||portraitSource;img.alt=(series[el.dataset.person]||fameById[el.dataset.person]).name+(fameById[el.dataset.person]?' — portrait':' — original illustrated portrait');img.decoding='async';crop.append(img);el._portraitObserver?.disconnect();el.replaceChildren(crop);
  el.classList.toggle('is-photo',Boolean(fameById[el.dataset.person]));
  if(fameById[el.dataset.person])return;
  (el._portraitObserver=new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;const side=Math.max(width,height);crop.style.width=side+'px';crop.style.height=side+'px';crop.style.left=(width-side)/2+'px';crop.style.top=Math.min(0,(height-side)*.2)+'px';})).observe(el);
 }
 function miniStats(d) {
  return [5,1].map(n=>`<span class="period-stat" data-tier="${d.stats[n].tier}"><span class="period-caption">${n}Y ${n===1?'SEASON':'FORM'} <em>${titleCase(d.stats[n].tier)}</em></span><span class="period-numbers"><b>${fmt(d.stats[n].value)}%</b><small data-delta="${d.stats[n].gap>0?'positive':d.stats[n].gap<0?'negative':'neutral'}">${fmt(d.stats[n].gap,2)} pp${n===1?'':'/yr'}</small></span></span>`).join('');
 }
 function cardMarkup(d) {
  return `<button type="button" class="arena-card cursor-interaction" data-investor="${d.key}" data-tier="${d.tier}" aria-pressed="${d.key===state.selected}" aria-label="Compare ${d.name}, ${titleCase(d.tier)} over 10 years"><span class="card-crown"><span class="card-gem" aria-hidden="true"></span><span class="rarity-word">10Y · ${d.tier.toUpperCase()}</span><span class="card-gem" aria-hidden="true"></span></span><span class="hero-window"><span class="portrait" data-person="${d.key}"></span></span><span class="name-scroll"><strong>${d.name}</strong><small>${d.fund.toUpperCase()}</small></span><span class="card-stats"><span><b class="card-value">${fmt(d.value)}%</b><small>10Y ANNUALIZED</small></span><span><b class="card-gap" data-delta="${d.gap>0?'positive':d.gap<0?'negative':'neutral'}">${fmt(d.gap,2)}</b><small>PP / YR VS SPY</small></span></span><span class="period-stats">${miniStats(d)}</span><span class="card-foot">2016–2025 · RANK ${String(d.rank).padStart(2,'0')} / ${gameRoster.length}</span></button>`;
 }
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

 $('[data-investor-select]').innerHTML=gameRoster.map(d=>`<option value="${d.key}">${d.name}</option>`).join('');
 $('[data-benchmark-ten]').textContent=fmt(benchmarkStats[10])+'%';
 $('[data-benchmark-five]').textContent=fmt(benchmarkStats[5])+'%';
 $('[data-benchmark-one]').textContent=fmt(benchmarkStats[1])+'%';
 $('[data-benchmark-wealth]').textContent=dollars(accumulate(benchmarkReturns).at(-1));
 $('[data-sources]').innerHTML=sources+`<details class="profile-photo-credits"><summary>Added records &amp; portrait sources</summary><p>The fourteen newly ranked records use the full 2016–2025 period. Adjusted-NAV estimates can differ slightly from published fund returns. Pabrai Fund 3 uses the annual and NAV appendices; its conflicting headline ten-year figure is disclosed in the profile. Each record links to its data sources.</p><p>${gameRoster.filter(d=>d.method).map(d=>`<a href="${d.source}" target="_blank" rel="noopener noreferrer">${d.name}</a>`).join(' · ')}</p><p>Fourteen other profiles remain unranked while comparable records are reviewed. Fame does not establish performance.</p><p>Portrait sources: ${fameProfiles.map(d=>`<a href="${d.photoCredit}" target="_blank" rel="noopener noreferrer">${d.name}</a>`).join(' · ')}</p></details>`;
 root.querySelectorAll('.portrait').forEach(mountPortrait);
 function saveState() {
  savedStates[designKey]={selected:state.selected,years:state.years,page:state.page,calculator:state.calculator,rosterPage:state.rosterPage,profile:state.profile};
  window.openai?.setWidgetState({modelContent:{design:'Nine in Ten — Pearl & Gold',colorScheme:'pearl',introVariant:'Nine in Ten',page:state.page,calculator:state.calculator,rosterPage:state.rosterPage,profile:state.page==='profile'?fameById[state.profile]?.name:null,selectedInvestor:series[state.selected].name,chartYears:state.years,mainRatingYears:10,asOf:'2025-12-31'},privateContent:{nineInTenHomepage:savedStates}})?.catch(()=>{});
 }
 function drawChart() {
  const svg=$('.performance-chart'),w=Math.round(svg.clientWidth);if(w<80)return;
  const {selected,years}=state,d=gameById[selected],values=accumulate(d.returns.slice(-years)),benchmark=accumulate(benchmarkReturns.slice(-years));
  const h=w<340?232:262,p={l:52,r:9,t:22,b:44},maximum=Math.max(...values,...benchmark)*1.08;
  const step=maximum>80000?25000:maximum>35000?10000:maximum>17000?5000:2500,max=Math.ceil(maximum/step)*step;
  const x=i=>p.l+i*(w-p.l-p.r)/years,y=v=>h-p.b-v/max*(h-p.t-p.b);
  const path=a=>a.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
  const ticks=Array.from({length:Math.floor(max/step)+1},(_,i)=>i*step),positions=years===1?[0,1]:w<400?[0,Math.floor(years/2),years]:years===10?[0,2,4,6,8,10]:[0,1,2,3,4,5];
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.style.height=h+'px';
  svg.setAttribute('aria-label',`Growth of ten thousand US dollars, December ${2025-years} to December 2025. ${d.name}, ${d.vehicle}: ${dollars(values.at(-1))}. SPY ETF: ${dollars(benchmark.at(-1))}. Annual total returns with distributions reinvested.`);
  svg.innerHTML=`<title>${d.name} versus SPY ETF</title><desc>USD investment value. Only year-end observations are available; connecting lines do not show the path within each year.</desc><text x="${p.l}" y="11" fill="var(--soft)" font-size="11" font-family="IBM Plex Mono,monospace">USD</text>${ticks.map(v=>`<line x1="${p.l}" x2="${w-p.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width=".7" opacity=".5"/><text x="${p.l-8}" y="${y(v)+4}" fill="var(--soft)" font-family="IBM Plex Mono,monospace" font-size="11" text-anchor="end">$${v/1000}k</text>`).join('')}<path d="${path(benchmark)} L${x(years)},${h-p.b} L${x(0)},${h-p.b} Z" fill="var(--accent)" opacity=".065"/><path d="${path(benchmark)}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/><path d="${path(values)}" fill="none" stroke="var(--investor)" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>${positions.map(i=>`<text x="${x(i)}" y="${h-24}" fill="var(--soft)" font-size="11" font-family="IBM Plex Mono,monospace" text-anchor="${i===0?'start':i===years?'end':'middle'}">${2025-years+i}</text>`).join('')}<text x="${w-p.r}" y="${h-4}" fill="var(--soft)" font-size="11" font-family="IBM Plex Mono,monospace" text-anchor="end">Year-end</text>${benchmark.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="2.5" fill="var(--accent)"/>`).join('')}${values.map((v,i)=>`<rect x="${x(i)-2.3}" y="${y(v)-2.3}" width="4.6" height="4.6" fill="var(--investor)"/>`).join('')}<line class="hover-guide" x1="0" x2="0" y1="${p.t}" y2="${h-p.b}" stroke="var(--soft)" opacity="0"/><rect class="chart-hit" x="${p.l}" y="${p.t}" width="${w-p.l-p.r}" height="${h-p.t-p.b}" fill="transparent"/>`;
  const readout=i=>$('.chart-readout').innerHTML=`<span>DEC ${2025-years+i}</span><span>SPY ${dollars(benchmark[i])} · ${d.vehicle.split(' · ')[0]} ${dollars(values[i])}</span>`;
  readout(years);
  const hit=svg.querySelector('.chart-hit');
  const point=e=>{const box=svg.getBoundingClientRect(),i=Math.max(0,Math.min(years,Math.round(((e.clientX-box.left)*w/box.width-p.l)/(w-p.l-p.r)*years))),guide=svg.querySelector('.hover-guide');guide.setAttribute('x1',x(i));guide.setAttribute('x2',x(i));guide.setAttribute('opacity','.5');readout(i);};
  hit.addEventListener('pointermove',point);hit.addEventListener('pointerdown',point);
  hit.addEventListener('pointerleave',()=>{svg.querySelector('.hover-guide').setAttribute('opacity','0');readout(years);});
 }
 function update() {
  const d=gameById[state.selected],n=state.years,s=d.stats[n];
  root.querySelectorAll('[data-investor]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.investor===d.key)));
  root.querySelectorAll('[data-horizon]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.horizon)===n)));
  $('[data-investor-select]').value=d.key;
  $('[data-chart-period]').textContent=(n===1?'2025 season':`${2026-n}–2025`)+' · Annual observations';
  $('[data-chart-legend]').textContent=d.vehicle;
  $('[data-record-name]').textContent=d.name;
  $('[data-record-vehicle]').textContent=d.vehicle;
  const portrait=$('[data-record-portrait]');portrait.dataset.person=d.key;mountPortrait(portrait);
  $('[data-record-tier]').textContent='10Y · '+d.tier.toUpperCase();$('[data-record-tier]').dataset.tier=d.tier;
  $('[data-return-label]').textContent=n===1?'1Y season return':`${n}Y annualized return`;
  $('[data-spy-label]').textContent=n===1?'SPY · 1Y season':`SPY · ${n}Y annualized`;
  $('[data-record-return]').textContent=fmt(s.value)+'%';
  $('[data-record-benchmark]').textContent=fmt(benchmarkStats[n])+'%';
  $('[data-gap-label]').textContent=`${n}Y ${s.tier==='unrated'?'GAP':s.gap>=0?'ADVANTAGE':'SHORTFALL'} VS SPY`;
  $('[data-record-gap]').innerHTML=`${fmt(s.gap,2)} <small>${n===1?'pp':'pp / year'}</small>`;
  $('[data-result]').textContent=s.tier==='unrated'?'TOO CLOSE TO RATE FROM ROUNDED DATA':s.gap>=0?'AHEAD OF THE BENCHMARK':'BEHIND THE BENCHMARK';
  $('[data-consistency]').textContent=d.windows.filter(v=>v.gap>0).length+' / 6';
  $('[data-record-detail]').innerHTML=`<p><b>${d.windows.filter(v=>v.gap>0).length} of six rolling five-year windows ahead of SPY.</b> Annualized gaps, with windows ending each December:</p><div class="rolling-windows">${d.windows.map(v=>`<span><small>${v.start}–${v.end}</small><b class="${v.gap>=0?'up':'down'}">${fmt(v.gap,2)} pp/yr</b></span>`).join('')}</div><p>These windows overlap; they are not independent tests of skill. Figures are approximate. The frame always uses the full 10-year result, even when viewing a shorter period.</p><p><b>Maximum drawdown: not yet verified.</b> Annual observations miss intra-year losses; a daily total-return series is required. ${d.detail?d.detail:d.key==='joel'?'GINDX is co-managed with Robert Goldstein and uses a leveraged long/short overlay.':d.key==='bill'?'PSH uses leverage; NAV returns differ from its traded shares. Its 5Y rarity is Unrated because rounded source data cannot establish which side of zero the gap falls on.':d.key==='cathie'?'ARKK is a concentrated thematic fund.':d.key==='peter'?'EPIVX is EuroPac International Value Class A NAV, excluding its initial sales charge. Schiff is affiliated with the adviser; James Nelson and Luke Allen manage the fund. This is an international strategy, with a different investment mandate from SPY.':d.key==='carl'?'These are Icahn’s investment-fund composite returns, net of expenses. They are not IEP shareholder returns or his personal returns.':'Berkshire is a conglomerate, not a fund.'}</p>${d.key==='warren'?'<p><b>Legacy · 1965–2025:</b> Berkshire 19.7% per year versus the S&amp;P 500 with dividends at 10.5% per year. This separately dated career record does not change the 10Y rarity. SPY did not exist for the full career period.</p>':''}`;
  if(d.method)$('[data-record-detail]').innerHTML+=`<p><b>Data basis.</b> ${d.method}</p><p><a href="${d.source}" target="_blank" rel="noopener noreferrer">${d.sourceLabel} ↗</a> · ${d.dataSources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} ↗</a>`).join(' · ')}</p><button type="button" class="profile-source cursor-interaction" data-profile="${d.key}">About ${d.name} ↗</button>`;
  drawChart();
 }
 const monthlyData=JSON.parse(document.getElementById('arena-monthly-prices').textContent);
 const defaultCalculator={initial:10000,monthly:250,start:'2016-01',end:'2025-12',timing:'end'};
 state.page=['home','leaderboard','calculator','profile'].includes(saved.page)?saved.page:'home';
 state.calculator={...defaultCalculator,...saved.calculator};
 try {calculateHistory(monthlyData.prices,state.calculator);} catch {state.calculator={...defaultCalculator};}
 const fullMonth=m=>new Intl.DateTimeFormat('en-US',{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(m+'-01T00:00:00Z'));
 const benchmarkValue=benchmarkStats[10], top=gameRoster.slice(0,5);
 const axisMaximum=Math.ceil(Math.max(benchmarkValue,...top.map(d=>d.value))/5)*5;
 const benchmarkPosition=benchmarkValue/axisMaximum*100;
 const identity=d=>`<div class="bar-identity"><span class="bar-rank">${String(d.rank).padStart(2,'0')}</span><span class="portrait" data-person="${d.key}"></span><div><strong>${d.name}</strong><small>${d.vehicle}</small></div></div>`;
 const benchmarkRow=`<div class="bar-row benchmark-row"><div class="bar-identity"><span class="bar-rank">—</span><span class="bar-benchmark-icon" aria-hidden="true">◆</span><div><strong>SPX · S&amp;P 500</strong><small>SPY ETF · THE BENCHMARK</small></div></div><div class="bar-track"><span class="bar-fill" style="width:${benchmarkPosition}%"></span></div><div class="bar-value"><strong>${fmt(benchmarkValue)}%</strong><small>BENCHMARK</small></div></div>`;
 $('[data-top-leaderboard]').innerHTML=benchmarkRow+top.map(d=>`<div class="bar-row">${identity(d)}<div class="bar-track"><span class="bar-fill" style="width:${d.value/axisMaximum*100}%"></span></div><div class="bar-value"><strong>${fmt(d.value)}%</strong><small><span class="excess-return ${d.gap>0?'up':d.gap<0?'down':''}">${fmt(d.gap,2)} pp</span><span class="bar-gap-context"> vs SPX</span></small></div></div>`).join('')+`<div class="bar-axis" aria-hidden="true"><span></span><div class="bar-axis-ticks">${[0,1,2,3,4].map(i=>`<span>${i*axisMaximum/4}%</span>`).join('')}</div><span></span></div>`;
 $('[data-top-leaderboard]').setAttribute('aria-label',`Ten-year annualized return, 2016 through 2025. SPX benchmark via SPY: ${fmt(benchmarkValue)} percent. `+top.map(d=>`Rank ${d.rank}, ${d.name}, ${fmt(d.value)} percent, ${fmt(d.gap,2)} percentage points per year versus SPX.`).join(' '));
 $('[data-ranking-benchmark]').textContent=fmt(benchmarkValue)+'%';
 $('[data-full-ranking]').innerHTML=gameRoster.map(d=>`<tr><td>${fameById[d.key]?`<button type="button" class="ranking-person cursor-interaction" data-profile="${d.key}" aria-label="Explore ${d.name}'s record">${identity(d)}</button>`:identity(d)}</td><td>${fmt(d.value)}%</td><td class="${d.gap>=0?'up':'down'}">${fmt(d.gap,2)} pp</td><td>${fmt(d.stats[5].value)}%</td><td>${fmt(d.stats[1].value)}%</td><td><span class="rarity-badge" data-tier="${d.tier}">${titleCase(d.tier)}</span></td></tr>`).join('');
 $('[data-unranked-list]').innerHTML=fameProfiles.filter(d=>!gameById[d.key]).map(d=>`<button type="button" class="unranked-entry cursor-interaction" data-profile="${d.key}" aria-label="View ${d.name}, ${d.status}, unranked"><span class="portrait" data-person="${d.key}"></span><span><strong>${d.name}</strong><small>${d.status} · ${d.vehicle}</small></span><span aria-hidden="true">↗</span></button>`).join('');
 root.querySelectorAll('.leaderboard-bars .portrait,.ranking-table .portrait,.unranked-list .portrait').forEach(mountPortrait);
 const leaderboard=$('[data-top-leaderboard]');
 const benchmarkLine=document.createElement('span');
 benchmarkLine.className='leaderboard-reference-line';
 benchmarkLine.setAttribute('aria-hidden','true');
 leaderboard.append(benchmarkLine);
 function positionBenchmarkLine(){
  if(!leaderboard.clientWidth)return;
  const tracks=leaderboard.querySelectorAll('.bar-track');
  const bounds=leaderboard.getBoundingClientRect();
  const first=tracks[0].getBoundingClientRect(),last=tracks[tracks.length-1].getBoundingClientRect();
  benchmarkLine.style.left=(first.left-bounds.left+first.width*benchmarkPosition/100)+'px';
  benchmarkLine.style.top=(first.top-bounds.top)+'px';
  benchmarkLine.style.height=(last.bottom-first.top)+'px';
 }
 const benchmarkLayoutObserver=new ResizeObserver(positionBenchmarkLine);
 benchmarkLayoutObserver.observe(leaderboard);
 leaderboard.querySelectorAll('.bar-row').forEach(row=>benchmarkLayoutObserver.observe(row));
 let calculation=calculateHistory(monthlyData.prices,state.calculator);
 const form=$('[data-calculator-form]');
 function syncCalculatorForm(){for(const [key,value] of Object.entries(state.calculator))form.elements.namedItem(key).value=value;}
 function drawCalculator(){
  const svg=$('[data-calc-chart]'),w=Math.round(svg.clientWidth);if(w<80)return;
  const h=270,p={l:58,r:12,t:20,b:43},pts=calculation.points;
  const yMaximum=Math.max(1,...pts.map(d=>Math.max(d.value,d.invested)))*1.08;
  const x=d3.scaleLinear().domain([0,pts.length-1]).range([p.l,w-p.r]);
  const y=d3.scaleLinear().domain([0,yMaximum]).nice(4).range([h-p.b,p.t]);
  const ticks=y.ticks(4);
  const labelIndexes=[0,Math.floor((pts.length-1)/2),pts.length-1].filter((v,i,a)=>a.indexOf(v)===i);
  const dateLabel=i=>fullMonth(pts[i].month);
  const path=key=>d3.line().x((d,i)=>x(i)).y(d=>y(d[key]))(pts);
  const area=d3.area().x((d,i)=>x(i)).y0(y(0)).y1(d=>y(d.value))(pts);
  const shortMoney=v=>v>=1000000?'$'+(v/1000000).toFixed(v%1000000===0?0:1)+'m':v>=1000?'$'+(v/1000).toFixed(v%1000===0?0:1)+'k':'$'+Math.round(v);
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.style.height=h+'px';
  svg.setAttribute('aria-label',`Historical SPY investment from ${fullMonth(state.calculator.start)} through ${fullMonth(state.calculator.end)}. Final value ${dollars(calculation.value)}, contributions ${dollars(calculation.invested)}, investment gain or loss ${dollars(calculation.gain)}.`);
  svg.innerHTML=`<title>SPY historical investment journey</title><desc>Monthly portfolio value compared with cumulative contributions, in US dollars. Dividends reinvested.</desc><text x="${p.l}" y="11" fill="var(--soft)" font-size="11">USD</text>${ticks.map(v=>`<line x1="${p.l}" x2="${w-p.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" stroke-width=".7"/><text x="${p.l-9}" y="${y(v)+4}" fill="var(--soft)" font-size="11" text-anchor="end">${shortMoney(v)}</text>`).join('')}<path d="${area}" fill="var(--brand)" opacity=".055"/><path d="${path('value')}" fill="none" stroke="var(--brand)" stroke-width="2"/><path d="${path('invested')}" fill="none" stroke="#af954f" stroke-width="1.5" stroke-dasharray="5 4"/>${labelIndexes.map((i,j)=>`<text x="${x(i)}" y="${h-24}" fill="var(--soft)" font-size="11" text-anchor="${j===0?'start':j===labelIndexes.length-1?'end':'middle'}">${dateLabel(i)}</text>`).join('')}<text x="${w-p.r}" y="${h-5}" fill="var(--soft)" font-size="11" text-anchor="end">Month-end</text><line data-calc-guide y1="${p.t}" y2="${h-p.b}" stroke="var(--soft)" visibility="hidden"/><circle data-value-dot r="3" fill="var(--brand)" visibility="hidden"/><circle data-invested-dot r="3" fill="#af954f" visibility="hidden"/><rect data-chart-hit data-chart-hover-overlay="cross-series" x="${p.l}" y="${p.t}" width="${w-p.l-p.r}" height="${h-p.t-p.b}" fill="transparent"/>`;
  const tooltip=$('[data-calc-tooltip]');tooltip.hidden=true;
  const hit=svg.querySelector('[data-chart-hit]');
  const show=e=>{
   const box=svg.getBoundingClientRect(),position=Math.max(0,Math.min(pts.length-1,x.invert((e.clientX-box.left)*w/box.width)));
   const i=Math.min(pts.length-2,Math.floor(position)),fraction=position-i;
   const interpolate=key=>pts[i][key]+(pts[i+1][key]-pts[i][key])*fraction;
   const cx=x(position),guide=svg.querySelector('[data-calc-guide]');guide.setAttribute('x1',cx);guide.setAttribute('x2',cx);guide.setAttribute('visibility','visible');
   ['value','invested'].forEach(key=>{const dot=svg.querySelector(`[data-${key}-dot]`);dot.setAttribute('cx',cx);dot.setAttribute('cy',y(interpolate(key)));dot.setAttribute('visibility','visible');});
   tooltip.innerHTML=`<strong>${fullMonth(pts[i].month)} – ${fullMonth(pts[i+1].month)}</strong>Portfolio ≈ ${dollars(interpolate('value'))}<br>Contributions ≈ ${dollars(interpolate('invested'))}<br><small>Between monthly observations</small>`;
   tooltip.hidden=false;tooltip.style.left=Math.max(0,Math.min(w-205,cx+12))+'px';
  };
  hit.addEventListener('pointermove',show);hit.addEventListener('pointerdown',show);
  hit.addEventListener('pointerleave',e=>{if(e.pointerType==='touch')return;tooltip.hidden=true;svg.querySelectorAll('[data-calc-guide],[data-value-dot],[data-invested-dot]').forEach(el=>el.setAttribute('visibility','hidden'));});
 }
 function updateCalculator(){
  calculation=calculateHistory(monthlyData.prices,state.calculator);
  $('[data-calc-period]').textContent=fullMonth(state.calculator.start)+' – '+fullMonth(state.calculator.end);
  $('[data-calc-value]').textContent=dollars(calculation.value);
  $('[data-calc-invested]').textContent=dollars(calculation.invested);
  $('[data-calc-gain]').textContent=(calculation.gain<0?'−':'+')+dollars(Math.abs(calculation.gain));
  $('[data-calc-gain]').className=calculation.gain>=0?'up':'down';
  root.querySelectorAll('[data-calc-value],[data-calc-invested],[data-calc-gain]').forEach(el=>el.classList.toggle('large-amount',el.textContent.length>10));
  $('[data-calc-summary]').textContent=`${calculation.months} monthly additions of ${dollars(state.calculator.monthly)} · dividends reinvested`;
  drawCalculator();
 }
 function showPage(page,scroll=true){
  state.page=['home','leaderboard','calculator','profile'].includes(page)?page:'home';
  root.querySelectorAll('[data-page]').forEach(el=>el.hidden=el.dataset.page!==state.page);
  root.querySelectorAll('.home-nav [data-page-link]').forEach(el=>{if(el.dataset.pageLink===state.page)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  if(state.page==='home'){drawChart();positionBenchmarkLine();}
  if(state.page==='calculator')updateCalculator();
  if(state.page==='profile')renderFamousProfile();
  if(scroll)root.querySelector('.home-nav').scrollIntoView({block:'start',behavior:'auto'});
 }
 root.querySelectorAll('[data-page-link]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();showPage(link.dataset.pageLink);saveState();}));
 root.querySelectorAll('[data-home-anchor]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();showPage('home',false);root.querySelector('#'+link.dataset.homeAnchor).scrollIntoView({block:'start',behavior:'auto'});saveState();}));
 root.querySelectorAll('.home-logo').forEach(link=>link.addEventListener('click',()=>{showPage('home');saveState();}));
 function applyCalculation(e){
  e.preventDefault();if(!form.reportValidity())return;const inputs=new FormData(form);
  const next={initial:Number(inputs.get('initial')),monthly:Number(inputs.get('monthly')),start:inputs.get('start'),end:inputs.get('end'),timing:inputs.get('timing')};
  try {calculateHistory(monthlyData.prices,next);state.calculator=next;$('[data-calculator-error]').hidden=true;updateCalculator();saveState();}
  catch(error){$('[data-calculator-error]').textContent=error.message;$('[data-calculator-error]').hidden=false;}
 }
 $('[data-calculate]').addEventListener('click',applyCalculation);
 form.addEventListener('submit',applyCalculation);
 form.addEventListener('keydown',e=>{if(e.key==='Enter')applyCalculation(e);});
 new ResizeObserver(()=>{if(state.page==='calculator')drawCalculator();}).observe($('.calculator-result'));
 window.addEventListener('openai:set_globals',e=>{
  const incoming=e.detail?.globals?.widgetState?.privateContent?.nineInTenHomepage?.[designKey];if(!incoming)return;
  if(incoming.calculator){try{calculateHistory(monthlyData.prices,incoming.calculator);state.calculator={...incoming.calculator};syncCalculatorForm();}catch{}}
  if(fameById[incoming.profile])state.profile=incoming.profile;
  if(Number.isInteger(incoming.rosterPage)&&incoming.rosterPage>=0&&incoming.rosterPage<pageCount){state.rosterPage=incoming.rosterPage;updateRosterPage();}
  showPage(incoming.page||state.page,false);
 });
 syncCalculatorForm();updateCalculator();showPage(state.page,false);

 root.querySelectorAll('[data-investor]').forEach(button=>button.addEventListener('click',()=>{state.selected=button.dataset.investor;update();saveState();}));
 $('[data-investor-select]').addEventListener('change',e=>{state.selected=e.target.value;update();saveState();});
 root.querySelectorAll('[data-horizon]').forEach(button=>button.addEventListener('click',()=>{state.years=Number(button.dataset.horizon);update();saveState();}));
 root.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{const target=root.querySelector(link.getAttribute('href'));if(target&&!link.hasAttribute('data-home-anchor')){e.preventDefault();target.scrollIntoView({block:'start',behavior:'auto'});}}));
 let previousWidth=0;new ResizeObserver(entries=>{const width=Math.round(entries[0].contentRect.width);if(width>0&&width!==previousWidth){previousWidth=width;drawChart();}}).observe($('.record-chart'));
 window.addEventListener('openai:set_globals',e=>{const incoming=e.detail?.globals?.widgetState?.privateContent?.nineInTenHomepage?.[designKey];if(!incoming)return;state.selected=gameById[incoming.selected]?incoming.selected:state.selected;state.years=[10,5,1].includes(incoming.years)?incoming.years:state.years;update();});
 update();

 });
})();
