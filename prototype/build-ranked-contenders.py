"""Build reproducible 2016–2025 records; retain each vehicle and source convention."""
from pathlib import Path
import json, math

base = Path(__file__).parent
profiles = json.loads((base/'arena-new-contenders.json').read_text())
market = json.loads((base/'ranked-sources/year-end-records.json').read_text())
tickers = dict(gabelli='GABAX',danoff='FCNTX',asness='QLEIX',berkowitz='FAIRX',watsa='FFH.TO',gayner='MKL',hussman='HSGFX',nygren='OAKMX',davis='NYVTX',rogers='ARGFX',herro='OAKIX')
published = {
 'loeb':[6.1,17.9,-11.3,17.0,19.2,22.5,-21.9,3.4,24.2,8.9],
 'pabrai':[2.3,109.2,-41.9,12.5,18.4,-15.2,16.8,38.9,61.9,-20.0],
 'smith':[28.16,21.97,2.20,25.63,18.29,22.11,-13.80,12.37,8.87,.79],
 'gabelli':[11.58,20.16,-7.69,22.43,11.23,18.93,-10.63,10.29,8.16,16.74],
}
additional = {
 'loeb':[
  ('2016–2022 · Offshore annual history','https://assets.thirdpoint.com/f/160155/x/68fe31b218/2023-07-third-point-performance.pdf?cv=1691020826437'),
  ('2023 · Offshore investor letter','https://assets.thirdpointlimited.com/f/166217/x/4c01ad22d8/fourth-quarter-2023-investor-letter-tpil.pdf'),
  ('2024 · issuer performance release','https://www.prnewswire.co.uk/news-releases/regulatory-news/third-point-investors-ltd-third-point-publishes-q4-2024-investor-letter-864113313.html'),
  ('2025 · Offshore December report','https://assets-malibu-life.s3.us-west-2.amazonaws.com/system/uploads/fae/file/asset/1683/Third_Point_Master_Fund_December_2025_Monthly_Report.pdf')],
 'pabrai':[('2025 annual report · Appendices B & D','https://pabraifunds.com/pdf/web/AR_2025.pdf')],
 'smith':[('GBP annual return history · Morningstar report hosted by Fundsmith','https://www.fundsmith.co.uk/media/jbsni1u0/morningstar-fundsmith-report-2025.pdf'),('GBP/USD year-end conversion','https://finance.yahoo.com/quote/GBPUSD=X/history/')],
 'watsa':[('CAD/USD year-end conversion','https://finance.yahoo.com/quote/CADUSD=X/history/')],
}
records={}
for p in profiles:
 key=p['key'];symbol=tickers.get(key)
 returns=published.get(key,market[symbol]['returns'] if symbol else None).copy()
 sources=[{'label':label,'url':url} for label,url in additional.get(key,[])]
 if key=='loeb':p['source']=sources[-1]['url'];p['sourceLabel']='Third Point · December 2025 performance'
 if key=='smith':p['wiki']='Terry_Smith_(investor)'
 note='Compounded from published calendar-year net returns. Values are approximate because the annual figures are rounded.'
 if key not in published or key=='watsa':
  sources.append({'label':symbol+' · adjusted daily history','url':market[symbol]['source']})
  note='Estimated from dividend- and split-adjusted year-end '+('share prices' if key in ['watsa','gayner'] else 'NAVs')+'. Small differences from published fund total returns can arise from distribution-reinvestment conventions and source precision.'
 if key in ['watsa','smith']:
  fx=market['CADUSD=X' if key=='watsa' else 'GBPUSD=X']['returns']
  returns=[((1+r/100)*(1+f/100)-1)*100 for r,f in zip(returns,fx)]
  note+=' Converted to USD using year-end exchange rates; fund and FX valuation times can differ.'
 if key=='smith':note='Published T Acc GBP returns translated to USD using year-end exchange rates. FX valuation times can differ from the fund’s valuation time; values are approximate.'
 if key=='pabrai':note+=' The calculated 10Y CAGR is about 11.4%, consistent with the NAV appendix ($41.33 to $122.07); the report’s headline table instead states 8.9%. This conflict is disclosed rather than silently using that headline.'
 precision=.05 if key in ['loeb','pabrai','smith','watsa'] else .005 if key=='gabelli' else .10
 records[key]={**{k:p[k] for k in ['name','vehicle','detail','source','sourceLabel']},'returns':[round(r,6) for r in returns],'precision':precision,'method':note,'dataSources':sources,'asOf':'2025-12-31','currency':'USD'}
 assert len(returns)==10 and all(math.isfinite(r) and r>-100 for r in returns)
 print(key,'10Y',round((math.prod(1+r/100 for r in returns)**.1-1)*100,3))
(base/'arena-ranked-investors.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
(base/'arena-new-contenders.json').write_text(json.dumps(profiles,ensure_ascii=False,indent=2))
old=json.loads((base/'arena-famous-investors.json').read_text())
new_by_key={p['key']:p for p in profiles}
(base/'arena-famous-investors.json').write_text(json.dumps([new_by_key.get(p['key'],p) for p in old],ensure_ascii=False,indent=2))
