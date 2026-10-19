"""Import public-domain classical text chapters from Wikisource, with source/version attribution."""
import urllib.request,urllib.parse,json,re,time
from pathlib import Path
from html.parser import HTMLParser
class Paragraphs(HTMLParser):
 def __init__(self):super().__init__();self.depth=0;self.active=False;self.inp=0;self.parts=[];self.now=[];self.skip=0
 def handle_starttag(self,t,a):
  attrs=dict(a)
  if t=='div' and 'mw-parser-output' in attrs.get('class',''):self.active=True;self.depth=1;return
  if not self.active:return
  if t=='div':self.depth+=1
  if t in ['script','style','sup']:self.skip+=1
  if t=='p':self.inp+=1;self.now=[]
 def handle_endtag(self,t):
  if not self.active:return
  if t in ['script','style','sup'] and self.skip:self.skip-=1
  if t=='p' and self.inp:
   self.inp-=1;text=''.join(self.now).strip()
   if len(text)>12:self.parts.append(text)
  if t=='div':
   self.depth-=1
   if self.depth==0:self.active=False
 def handle_data(self,d):
  if self.active and self.inp and not self.skip:self.now.append(d)
books=[('journey','西遊記','西游记','吴承恩'),('kingdoms','三國演義','三国演义','罗贯中'),('redchamber','紅樓夢','红楼梦','曹雪芹')]
out=[];Path('work/classics').mkdir(parents=True,exist_ok=True);Path('dist/books').mkdir(exist_ok=True)
for key,topic,title,author in books:
 chapters=[]
 for n in range(1,6):
  name=f'{topic}/第{n:03}回';u='https://zh.wikisource.org/zh-hans/'+urllib.parse.quote(name);cache=Path(f'work/classics/{key}-{n}.html')
  if cache.exists():html=cache.read_text()
  else:
   html=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Olddays cultural reading archive (github.com/githubfordevelop/olddays)'}),timeout=30).read().decode();cache.write_text(html);time.sleep(1)
  p=Paragraphs();p.feed(html);text=p.parts
  text=[t for t in text if not any(x in t for x in ['姊妹计划','姊妹計劃','其他语言','其他語言','此作品在全世界','本作品','維基文庫','维基文库'])]
  if len(''.join(text))<1000:raise ValueError(f'Too little text for {name}: {len("".join(text))}')
  revision=re.search(r'"wgRevisionId":(\d+)',html)
  source='https://zh.wikisource.org/w/index.php?oldid='+revision[1] if revision else u
  chapters.append({'title':f'第{n}回','paragraphs':text,'source':source,'history':'https://zh.wikisource.org/w/index.php?'+urllib.parse.urlencode(dict(title=name,action='history'))})
  print(title,n,len(''.join(text)),flush=True)
 data={'id':key,'title':title,'author':author,'label':'公版经典 · 前五回','license':'经典原作属公版；数字化来源为维基文库，保留其署名与适用许可。','chapters':chapters}
 Path(f'dist/books/{key}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n');out.append({k:v for k,v in data.items() if k!='chapters'}|{'chapterCount':len(chapters),'characters':sum(len(''.join(c['paragraphs'])) for c in chapters)})
Path('data/classics-sources.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Imported',len(out),'books')
