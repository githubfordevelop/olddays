"""Import dated event paragraphs from fixed Wikipedia year-page revisions (CC BY-SA 4.0)."""
import concurrent.futures,json,re,urllib.request,time
from pathlib import Path
from html.parser import HTMLParser
class Node:
 def __init__(self,tag='',attrs=(),parent=None): self.tag=tag;self.attrs=dict(attrs);self.parent=parent;self.children=[]
 def text(self): return ''.join(c if isinstance(c,str) else c.text() for c in self.children)
 def walk(self):
  yield self
  for c in self.children:
   if isinstance(c,Node): yield from c.walk()
class Parser(HTMLParser):
 def __init__(self): super().__init__();self.root=Node();self.cur=self.root
 def handle_starttag(self,t,a):
  n=Node(t,a,self.cur);self.cur.children.append(n)
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']: self.cur=n
 def handle_endtag(self,t):
  n=self.cur
  while n.parent:
   if n.tag==t: self.cur=n.parent;break
   n=n.parent
 def handle_data(self,d): self.cur.children.append(d)
import threading
network_lock=threading.Lock()
def fetch_json(url):
 with network_lock:
  for attempt in range(4):
   try:
    req=urllib.request.Request(url,headers={'User-Agent':'Olddays/0.3 (github.com/githubfordevelop/olddays)'})
    data=urllib.request.urlopen(req,timeout=45).read();time.sleep(1.5);return data
   except urllib.error.HTTPError as exc:
    if exc.code not in [429,502,503,504] or attempt==3:raise
    time.sleep(15*(attempt+1))
refs=json.loads(Path('docs/data-sources.json').read_text())
def build(ref):
 y=ref['year'];cache=Path(f'work/news-import/{y}.json')
 cache.parent.mkdir(parents=True,exist_ok=True)
 if cache.exists(): raw=cache.read_bytes()
 else:
  html=fetch_json(ref['source']).decode('utf-8')
  raw=json.dumps({'parse':{'text':html}}).encode();cache.write_bytes(raw)
 html=json.loads(raw)['parse']['text'];p=Parser();p.feed(html)
 active=False;month=0;items=[];seen=set()
 for n in p.root.walk():
  if n.tag in ['h2','h3','h4']:
   t=n.text()
   if n.tag=='h2':
    if re.search('大事[记記]',t): active=True
    elif active: active=False
   m=re.search(r'(\d{1,2})月',t)
   if m: month=int(m[1])
  if not active or n.tag!='li':continue
  text=re.sub(r'\[\d+\]|\[編輯\]|\[编辑\]','',n.text()).strip()
  m=re.match(r'(?:(\d{1,2})月)?(\d{1,2})日\s*[—－–：:、\-]?\s*(.+)',text,re.S)
  if not m: continue
  mo=int(m[1]) if m[1] else month
  if not 1<=mo<=12: continue
  # Nested dated records are handled independently; avoid including them twice.
  if any(c is not n and c.tag=='li' and re.match(r'\d{1,2}月?\d*日',c.text()) for c in n.walk()): continue
  body=re.sub(r'\s+',' ',m[3]).strip();day=int(m[2]);key=(mo,day,body)
  if len(body)<10 or len(body)>2500 or key in seen: continue
  seen.add(key)
  title=re.split('[。\n]',body)[0]
  if len(title)>65:title=title[:65]+'…'
  items.append({'date':f'{mo:02}.{day:02}','month':mo,'title':title,'body':body,'source':ref['source'],'revision':ref['revision'],'history':f'https://zh.wikipedia.org/w/index.php?title={y}%E5%B9%B4&action=history'})
 items.sort(key=lambda x:x['date'])
 if len(items)<30:
  # Some year pages point to monthly pages instead of repeating their events.
  import urllib.parse
  def month_events(mo):
   cache=Path(f'work/news-import/{y}-{mo}.json')
   if cache.exists() and 'revid' in json.loads(cache.read_bytes()).get('parse',{}): payload=json.loads(cache.read_bytes())['parse']
   else:
    u='https://zh.wikipedia.org/wiki/'+urllib.parse.quote(f'{y}年{mo}月')
    html=fetch_json(u).decode('utf-8')
    revision=re.search(r'"wgRevisionId":(\d+)',html)
    if not revision:raise ValueError(f'Missing revision for {y}-{mo}')
    payload=dict(text=html,revid=int(revision[1]));cache.write_text(json.dumps(dict(parse=payload)))
   parser=Parser();parser.feed(payload['text']);day=0;out=[]
   for node in parser.root.walk():
    if node.tag in ['h2','h3','h4','dt']:
     mt=re.match(r'(?:\d{1,2}月)?(\d{1,2})日',node.text())
     if mt:day=int(mt[1])
     elif node.tag=='h2':day=0
    if node.tag!='li' or not day: continue
    if any(c is not node and c.tag=='li' for c in node.walk()):continue
    body=re.sub(r'\[\d+\]|\[來源請求\]|\s+',' ',node.text()).strip()
    if not 10<=len(body)<=2500:continue
    title=re.split('[。\n]',body)[0];title=title[:65]+'…' if len(title)>65 else title
    out.append(dict(date=f'{mo:02}.{day:02}',month=mo,title=title,body=body,source=f"https://zh.wikipedia.org/w/index.php?oldid={payload['revid']}",revision=payload['revid'],history='https://zh.wikipedia.org/w/index.php?'+urllib.parse.urlencode(dict(title=f'{y}年{mo}月',action='history'))))
   return out
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as sub:
   items=[item for chunk in sub.map(month_events,range(1,13)) for item in chunk]
  if len(items)<30:raise ValueError(f'{y}: only {len(items)} events after monthly import')
 items.sort(key=lambda x:x['date'])
 print(y,len(items),flush=True)
 return str(y),items
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: result=dict(pool.map(build,refs))
Path('data/yearbook.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
import subprocess
subprocess.run(['node','scripts/build-yearbook.mjs'],check=True)
print('Total',sum(map(len,result.values())))
