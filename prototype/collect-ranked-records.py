"""Archive public adjusted prices and derive calendar-year total returns."""
from pathlib import Path
import urllib.request, urllib.parse, json, datetime, concurrent.futures

base = Path(__file__).parent
cache = base / 'ranked-sources'
cache.mkdir(exist_ok=True)
symbols = ['GABAX','FCNTX','QLEIX','FAIRX','FFH.TO','MKL','HSGFX','OAKMX','NYVTX','ARGFX','OAKIX','GBPUSD=X','CADUSD=X']
def collect(symbol):
    target=cache/(symbol.replace('=','-')+'.json')
    if not target.exists():
        p1=int(datetime.datetime(2015,12,1,tzinfo=datetime.timezone.utc).timestamp())
        p2=int(datetime.datetime(2026,1,2,tzinfo=datetime.timezone.utc).timestamp())
        url='https://query2.finance.yahoo.com/v8/finance/chart/'+urllib.parse.quote(symbol)+'?'+urllib.parse.urlencode({'period1':p1,'period2':p2,'interval':'1d','events':'div,splits','includeAdjustedClose':'true'})
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        target.write_bytes(urllib.request.urlopen(req,timeout=40).read())
    raw=json.loads(target.read_text())['chart']['result'][0]
    adj=raw['indicators']['adjclose'][0]['adjclose']
    endpoints={}
    for stamp,value in zip(raw['timestamp'],adj):
        if value is None: continue
        date=datetime.datetime.fromtimestamp(stamp,datetime.timezone.utc).date()
        if date.month==12: endpoints[date.year]={'date':date.isoformat(),'value':value}
    assert all(y in endpoints for y in range(2015,2026)), (symbol,endpoints)
    returns=[(endpoints[y]['value']/endpoints[y-1]['value']-1)*100 for y in range(2016,2026)]
    def annual(n):
        return ((endpoints[2025]['value']/endpoints[2025-n]['value'])**(1/n)-1)*100
    return symbol,{'symbol':symbol,'currency':raw['meta']['currency'],'endpoints':endpoints,'returns':returns,'stats':{str(n):annual(n) for n in [10,5,1]},'source':'https://finance.yahoo.com/quote/'+urllib.parse.quote(symbol)+'/history/'}
results={}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    for f in concurrent.futures.as_completed([pool.submit(collect,s) for s in symbols]):
        try:
            key,data=f.result();results[key]=data
            print(key,json.dumps(data['stats']),flush=True)
        except Exception as e: print('ERROR',repr(e),flush=True)
(cache/'year-end-records.json').write_text(json.dumps(results,indent=2)+'\n')
