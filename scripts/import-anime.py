"""Cache factual TVmaze episode metadata; no summaries or scripts."""
from pathlib import Path
import urllib.request,json,time
shows=[('naruto',495,'火影忍者'),('shippuden',488,'火影忍者 疾风传'),('onepiece',1505,'海贼王 / 航海王'),('bleach',1905,'死神 BLEACH'),('bleach-tybw',80375,'死神 千年血战篇')]
out=[]
for key,id,name in shows:
 def get(url):
  for attempt in range(3):
   try:return json.load(urllib.request.urlopen(url,timeout=40))
   except Exception:
    if attempt==2:raise
    time.sleep(1)
 show=get(f'https://api.tvmaze.com/shows/{id}');eps=get(f'https://api.tvmaze.com/shows/{id}/episodes')
 rows=[{'date':e['airdate'],'season':e['season'],'number':e['number'],'title':e['name'],'url':e['url']} for e in eps if e.get('airdate') and e.get('number') and e['airdate']<='2025-12-31']
 print(key,len(rows),rows[:1],rows[-1:])
 image=None;image_source=None
 if eps and eps[0].get('image'):
  image_source=eps[0]['image']['original'];folder=Path('dist/images/anime');folder.mkdir(exist_ok=True);target=folder/(key+'.jpg');urllib.request.urlretrieve(image_source,target);image='images/anime/'+target.name
 out.append({'imageSource':image_source,'imageDate':rows[0]['date'] if rows else None,'id':key,'name':name,'source':show['url'],'premiered':show['premiered'],'image':image,'episodes':rows})
Path('dist/data').mkdir(exist_ok=True)
Path('dist/data/anime-airdates.json').write_text(json.dumps({'attribution':'TVmaze, CC BY-SA 4.0. Episode airdate metadata, Japan original broadcast; specials excluded.','source':'https://www.tvmaze.com/api','fetched':'2026-10-19','shows':out},ensure_ascii=False,separators=(',',':'))+'\n')
