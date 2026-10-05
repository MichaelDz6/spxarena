"""Collect sourced, small portrait assets for the website's new profiles."""
from pathlib import Path
import json, urllib.request, urllib.parse, concurrent.futures

base = Path(__file__).parent
directory = base / 'famous-portraits'
directory.mkdir(exist_ok=True)
profiles = json.loads((base / 'arena-famous-investors.json').read_text())
cached_manifest = {p['key']:p for p in json.loads((directory/'manifest.json').read_text())} if (directory/'manifest.json').exists() else {}
headers = {'User-Agent': 'SPXArenaResearch/1.0 (website prototype; public biographical portraits)'}
fallbacks = {
    'burry': ('https://imageio.forbes.com/specials-images/dam/imageserve/38497369/0x0.jpg?format=jpg&width=320', 'https://www.forbes.com/sites/gurufocus/2019/07/31/dr-michael-burry-of-big-short-likes-asian-stocks/'),
    'lynch': ('https://csfboston.sosimplecms2.com/uploads/images/board_of_trustees/peter-lynch.jpg?v=1642088861973', 'https://www.csfboston.org/who-we-are/leadership/board-of-trustees'),
    'druckenmiller': ('https://www.grantspub.com/images/speakers/Druckenmiller.jpg', 'https://www.grantspub.com/includes/cfn_speakerBio.cfm?sid=155'),
    'einhorn': ('https://www.skagenfondene.no/globalassets/skagen-funds/new-years-conference/2025/speakers/david.e-web.jpg?format=jpg&quality=75&width=320', 'https://www.skagenfondene.no/tema/nyttarskonferansen/david-einhorn/'),
    'baron': ('https://www.baroncapitalgroup.com/_next/image?q=75&url=https%3A%2F%2Flive-baron-capital-cms.pantheonsite.io%2Fsites%2Fdefault%2Ffiles%2F2024%2F04%2F24%2F2024-ron-baron.jpg&w=384', 'https://www.baroncapitalgroup.com/article/letter-ron-q1-2025')
}

def read(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
        return r.read()

def collect(p):
    cached=cached_manifest.get(p['key'])
    if cached and cached.get('path') and (directory/cached['path']).exists() and cached.get('credit'):
        return cached
    if p['key'] in fallbacks:
        source, credit = fallbacks[p['key']]
        output = directory / (p['key'] + '.jpg')
        if not output.exists():
            output.write_bytes(read(source))
        return {'key': p['key'], 'path': output.name, 'source': source, 'credit': credit,
                'rights': 'Source-hosted editorial portrait; publication rights not verified', 'bytes': output.stat().st_size}
    path = directory / (p['key'] + '-summary.json')
    if not path.exists():
        path.write_bytes(read('https://en.wikipedia.org/api/rest_v1/page/summary/' + p['wiki']))
    summary = json.loads(path.read_text())
    thumb = summary.get('thumbnail', {})
    if not thumb:
        return {'key': p['key'], 'missing': True}
    source = thumb['source']
    # Ask Wikimedia's thumbnail service for a compact asset; preserve the original.
    import re
    source = re.sub(r'/\d+px-', '/250px-', source)
    suffix = '.png' if source.lower().endswith('.png') else '.jpg'
    output = directory / (p['key'] + suffix)
    if not output.exists():
        output.write_bytes(read(source))
    original = summary.get('originalimage', {}).get('source', source)
    parts = urllib.parse.urlparse(original).path.split('/')
    file_name = urllib.parse.unquote(parts[-2] if '/thumb/' in original else parts[-1])
    return {'key': p['key'], 'path': output.name, 'source': source, 'original': original,
            'credit': 'https://commons.wikimedia.org/wiki/File:' + urllib.parse.quote(file_name),
            'bytes': output.stat().st_size}

results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    futures = {pool.submit(collect, p): p for p in profiles}
    for f in concurrent.futures.as_completed(futures):
        try:
            result = f.result()
        except Exception as e:
            result = {'key': futures[f]['key'], 'error': str(e)}
        results.append(result)
        print(json.dumps(result), flush=True)
(directory / 'manifest.json').write_text(json.dumps(results, indent=2))
