 const saved=window.openai?.widgetState?.privateContent||{};
 const state={selected:gameById[saved.homeSelection]?saved.homeSelection:'bill',years:[10,5,1].includes(saved.homeHorizon)?saved.homeHorizon:10};
 const portraitSource=JSON.parse(document.getElementById('spx-home-portrait-data').textContent).src;
 const $=selector=>root.querySelector(selector);
 const dollars=n=>'$'+Math.round(n).toLocaleString('en-US');
 function mountPortrait(el) {
  const crop=document.createElement('span');crop.className='portrait-window';
  const img=document.createElement('img');img.src=portraitSource;img.alt=series[el.dataset.person].name+' — original illustrated portrait';img.decoding='async';crop.append(img);el.replaceChildren(crop);
  new ResizeObserver(entries=>{const {width,height}=entries[0].contentRect;const side=Math.max(width,height);crop.style.width=side+'px';crop.style.height=side+'px';crop.style.left=(width-side)/2+'px';crop.style.top=Math.min(0,(height-side)*.2)+'px';}).observe(el);
 }
 function miniStats(d) {
  return [5,1].map(n=>`<span class="period-stat" data-tier="${d.stats[n].tier}"><span class="period-caption">${n}Y ${n===1?'SEASON':'FORM'} <em>${titleCase(d.stats[n].tier)}</em></span><span class="period-numbers"><b>${fmt(d.stats[n].value)}%</b><small>${fmt(d.stats[n].gap,2)} pp${n===1?'':'/yr'}</small></span></span>`).join('');
 }
 function cardMarkup(d) {
  return `<button type="button" class="arena-card cursor-interaction" data-investor="${d.key}" data-tier="${d.tier}" aria-pressed="${d.key===state.selected}" aria-label="Compare ${d.name}, ${titleCase(d.tier)} over 10 years"><span class="card-crown"><span class="card-gem" aria-hidden="true"></span><span class="rarity-word">10Y · ${d.tier.toUpperCase()}</span><span class="card-gem" aria-hidden="true"></span></span><span class="hero-window"><span class="portrait" data-person="${d.key}"></span></span><span class="name-scroll"><strong>${d.name}</strong><small>${d.fund.toUpperCase()}</small></span><span class="card-stats"><span><b class="card-value">${fmt(d.value)}%</b><small>10Y ANNUALIZED</small></span><span><b class="card-gap">${fmt(d.gap,2)}</b><small>PP / YR VS SPY</small></span></span><span class="period-stats">${miniStats(d)}</span><span class="card-foot">2016–2025 · RANK 0${d.rank} / 04</span></button>`;
 }
 $('[data-card-deck]').innerHTML=gameRoster.map(cardMarkup).join('');
 $('[data-investor-select]').innerHTML=gameRoster.map(d=>`<option value="${d.key}">${d.name}</option>`).join('');
 $('[data-benchmark-ten]').textContent=fmt(benchmarkStats[10])+'%';
 $('[data-benchmark-five]').textContent=fmt(benchmarkStats[5])+'%';
 $('[data-benchmark-one]').textContent=fmt(benchmarkStats[1])+'%';
 $('[data-benchmark-wealth]').textContent=dollars(accumulate(benchmarkReturns).at(-1));
 $('[data-sources]').innerHTML=sources;
 root.querySelectorAll('.portrait').forEach(mountPortrait);
 function saveState() {
  window.openai?.setWidgetState({modelContent:{design:'SPX Arena — Gilded Tavern homepage with original portraits and legendary SPX benchmark',selectedInvestor:series[state.selected].name,chartYears:state.years,mainRatingYears:10,asOf:'2025-12-31'},privateContent:{homeSelection:state.selected,homeHorizon:state.years}})?.catch(()=>{});
 }
 function drawChart() {
  const svg=$('.performance-chart'),w=Math.round(svg.clientWidth);if(w<80)return;
  const {selected,years}=state,d=gameById[selected],values=accumulate(d.returns.slice(-years)),benchmark=accumulate(benchmarkReturns.slice(-years));
  const h=w<340?232:262,p={l:49,r:9,t:22,b:44},maximum=Math.max(...values,...benchmark)*1.08;
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
  const portrait=$('[data-record-portrait]');portrait.dataset.person=d.key;portrait.querySelector('img').alt=d.name+' — original illustrated portrait';
  $('[data-record-tier]').textContent='10Y · '+d.tier.toUpperCase();$('[data-record-tier]').dataset.tier=d.tier;
  $('[data-return-label]').textContent=n===1?'1Y season return':`${n}Y annualized return`;
  $('[data-spy-label]').textContent=n===1?'SPY · 1Y season':`SPY · ${n}Y annualized`;
  $('[data-record-return]').textContent=fmt(s.value)+'%';
  $('[data-record-benchmark]').textContent=fmt(benchmarkStats[n])+'%';
  $('[data-gap-label]').textContent=`${n}Y ${s.tier==='unrated'?'GAP':s.gap>=0?'ADVANTAGE':'SHORTFALL'} VS SPY`;
  $('[data-record-gap]').innerHTML=`${fmt(s.gap,2)} <small>${n===1?'pp':'pp / year'}</small>`;
  $('[data-result]').textContent=s.tier==='unrated'?'TOO CLOSE TO RATE FROM ROUNDED DATA':s.gap>=0?'AHEAD OF THE BENCHMARK':'BEHIND THE BENCHMARK';
  $('[data-consistency]').textContent=d.windows.filter(v=>v.gap>0).length+' / 6';
  $('[data-record-detail]').innerHTML=`<p><b>${d.windows.filter(v=>v.gap>0).length} of six rolling five-year windows ahead of SPY.</b> Annualized gaps, with windows ending each December:</p><div class="rolling-windows">${d.windows.map(v=>`<span><small>${v.start}–${v.end}</small><b class="${v.gap>=0?'up':'down'}">${fmt(v.gap,2)} pp/yr</b></span>`).join('')}</div><p>These windows overlap; they are not independent tests of skill. Figures are approximate. The frame always uses the full 10-year result, even when viewing a shorter period.</p><p><b>Maximum drawdown: not yet verified.</b> Annual observations miss intra-year losses; a daily total-return series is required. ${d.key==='joel'?'GINDX is co-managed with Robert Goldstein and uses a leveraged long/short overlay.':d.key==='bill'?'PSH uses leverage; NAV returns differ from its traded shares. Its 5Y rarity is Unrated because rounded source data cannot establish which side of zero the gap falls on.':d.key==='cathie'?'ARKK is a concentrated thematic fund.':'Berkshire is a conglomerate, not a fund.'}</p>${d.key==='warren'?'<p><b>Legacy · 1965–2025:</b> Berkshire 19.7% per year versus the S&amp;P 500 with dividends at 10.5% per year. This separately dated career record does not change the 10Y rarity. SPY did not exist for the full career period.</p>':''}`;
  drawChart();
 }
 root.querySelectorAll('[data-investor]').forEach(button=>button.addEventListener('click',()=>{state.selected=button.dataset.investor;update();saveState();}));
 $('[data-investor-select]').addEventListener('change',e=>{state.selected=e.target.value;update();saveState();});
 root.querySelectorAll('[data-horizon]').forEach(button=>button.addEventListener('click',()=>{state.years=Number(button.dataset.horizon);update();saveState();}));
 root.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{const target=root.querySelector(link.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({block:'start',behavior:'auto'});}}));
 let previousWidth=0;new ResizeObserver(entries=>{const width=Math.round(entries[0].contentRect.width);if(width>0&&width!==previousWidth){previousWidth=width;drawChart();}}).observe($('.record-chart'));
 window.addEventListener('openai:set_globals',e=>{const incoming=e.detail?.globals?.widgetState?.privateContent;if(!incoming)return;state.selected=gameById[incoming.homeSelection]?incoming.homeSelection:state.selected;state.years=[10,5,1].includes(incoming.homeHorizon)?incoming.homeHorizon:state.years;update();});
 update();
})();
