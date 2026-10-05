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
