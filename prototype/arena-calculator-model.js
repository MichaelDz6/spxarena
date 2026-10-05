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
