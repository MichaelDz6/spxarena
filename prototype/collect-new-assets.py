from pathlib import Path
import json, urllib.request, concurrent.futures
from PIL import Image, ImageOps, ImageDraw

base = Path(__file__).parent
photos = {
 'loeb': ('https://static.standard.co.uk/2021/10/22/10/daniel-loeb-large-1.jpg?auto=webp&crop=5%3A3%2Csmart&quality=75&width=1200', 'https://www.standard.co.uk/business/dan-loeb-third-point-asset-value-investors-net-asset-value-share-price-b961931.html'),
 'pabrai': ('https://fundamentalsage.com/wp-content/uploads/2024/01/MohnishPabrai.jpg', 'https://fundamentalsage.com/sage-profiles/mohnish-pabrai-quotes-books/'),
 'smith': ('https://media-prod.ii.co.uk/s3fs-public/2026-01/TerrySmith26.jpg', 'https://www.ii.co.uk/analysis-commentary/terry-smith-blames-these-three-factors-2025s-underperformance-ii537765'),
 'gabelli': ('https://business.columbia.edu/sites/default/files-efs/person/photos/mario_gabelli.jpeg', 'https://business.columbia.edu/columbia-business-school-board/people/mario-j-gabelli-67'),
 'danoff': ('https://s.wsj.net/public/resources/images/BA-BJ057A_MFQ_Q_KS_20151001170053.jpg', 'https://www.barrons.com/articles/fidelitys-will-danoff-partners-with-buffett-bezos-and-zuckerberg-1443851292'),
 'berkowitz': ('https://blogs-images.forbes.com/investor/files/2011/05/0anZcNH9AUgaa_11673.jpg', 'https://www.forbes.com/pictures/gg45eejkg/bruce-berkowitz-fairholme-capital-management/'),
 'gayner': ('https://mss-p-053.stylelabs.cloud/api/public/content/thomas-gayner?h=926&la=en&v=0137be8f&w=784', 'https://www.russellreynolds.com/en/insights/podcasts/planting-long-term-investment-seeds-with-markel-group-ceo-tom-gayner'),
 'hussman': ('https://pbs.twimg.com/profile_images/1546562566415155205/FI1in9u9_400x400.jpg', 'https://x.com/hussmanjp'),
 'nygren': ('https://oakmark.com/wp-content/uploads/sites/3/2023/08/Bill-Nygren2-234x300.jpg', 'https://oakmark.com/who-we-are/our-team/bill-nygren/'),
 'davis': ('https://www.advisorperspectives.com/images/content_image/data/22/22691374768c17ac897b58bab5849596.jpg', 'https://www.advisorperspectives.com/articles/2019/10/28/where-the-davis-funds-is-finding-great-opportunities'),
 'rogers': ('https://www.corporateleadership.org/app/uploads/2022/10/John-W.-Rogers-Jr..jpg', 'https://www.corporateleadership.org/board-of-directors/'),
 'herro': ('https://oakmark.com/wp-content/uploads/sites/3/2019/06/David-Herro-234x300.jpg', 'https://oakmark.com/who-we-are/our-team/david-herro/'),
}
pdfs = {
 'third-point-july-2023': 'https://assets.thirdpoint.com/f/160155/x/9558e53120/2023-07-july-monthly-investor-report.pdf?cv=1691028290352',
 'third-point-jan-2025': 'https://assets.thirdpointlimited.com/f/166217/x/578bf6887b/2025-01-january-monthly-report-tpil.pdf',
 'third-point-dec-2025': 'https://assets-malibu-life.s3.us-west-2.amazonaws.com/system/uploads/fae/file/asset/1683/Third_Point_Master_Fund_December_2025_Monthly_Report.pdf',
 'oakix-2025': 'https://oakmark.com/wp-content/uploads/sites/3/2026/01/Oakmark-International-Fund-Commentary-12-31-2025.pdf',
}
def download(job):
 kind, key, url = job
 path = base / ('famous-portraits' if kind == 'photo' else 'ranked-sources') / (key + ('-source.jpg' if kind == 'photo' else '.pdf'))
 if not path.exists():
  with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=25) as r: path.write_bytes(r.read())
 if kind == 'photo':
  im = ImageOps.exif_transpose(Image.open(path)).convert('RGB');im.thumbnail((280,320))
  im.save(path.parent / (key+'.webp'), quality=72)
 else:
  from pypdf import PdfReader
  path.with_suffix('.txt').write_text('\n'.join(p.extract_text() for p in PdfReader(path).pages))
 return kind,key,path.name
jobs = [('photo',k,v[0]) for k,v in photos.items()]+[('pdf',k,v) for k,v in pdfs.items()]
manifest_path = base/'famous-portraits/manifest.json'
manifest = {x['key']:x for x in json.loads(manifest_path.read_text())}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 futures={pool.submit(download,j):j for j in jobs}
 for f in concurrent.futures.as_completed(futures):
  try:
   kind,key,path=f.result()
   if kind=='photo': manifest[key]={'key':key,'path':path,'source':photos[key][0],'credit':photos[key][1],'rights':'Editorial source photo; public reuse rights not verified'}
   print('OK',kind,key,flush=True)
  except Exception as e:print('ERROR',futures[f][1],str(e),flush=True)
manifest_path.write_text(json.dumps(list(manifest.values()),indent=2))
for key in ['asness','watsa']:
 if key=='asness' and (base/'famous-portraits/asness-original.jpg').exists():
  im=Image.open(base/'famous-portraits/asness-original.jpg').convert('RGB');w,h=im.size
  im=im.crop((w*.28,h*.14,w*.74,h*.55));im.thumbnail((280,320));im.save(base/'famous-portraits/asness.webp',quality=82)
  continue
 im=Image.open(base/'famous-portraits'/manifest[key]['path']).convert('RGB');im.thumbnail((280,320));im.save(base/'famous-portraits'/(key+'.webp'),quality=72)
