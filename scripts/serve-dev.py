from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=4188);a=p.parse_args()
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(Path(__file__).resolve().parents[1]/'dist'),**kwargs)
 def send_head(self):
  if 'If-Modified-Since' in self.headers:del self.headers['If-Modified-Since']
  return super().send_head()
 def end_headers(self):
  self.send_header('Cache-Control','no-store');super().end_headers()
ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
