"""
crystal-speech-emote server — static + APIs
"""
import http.server, json, os, cgi, urllib.parse, threading, sys

WORK_DIR = os.environ.get('CSE_WORK_DIR', os.path.dirname(os.path.abspath(__file__)))
PLUGIN_DIR = os.environ.get('CSE_PLUGIN_DIR', WORK_DIR)
PORT = int(os.environ.get('CSE_PORT', '8904'))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=WORK_DIR, **kw)

    def do_GET(self):
        p = urllib.parse.urlparse(self.path).path
        if p == '/api/agents': return self._agents()
        super().do_GET()

    def do_POST(self):
        p = urllib.parse.urlparse(self.path).path
        if p == '/api/save-config': return self._save()
        if p == '/api/upload-emote': return self._upload()

    def do_OPTIONS(self):
        self.send_response(200); self.end_headers()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        super().end_headers()

    def _agents(self):
        try:
            with open(os.path.join(PLUGIN_DIR,'data','agents.json'),'r',encoding='utf-8') as f:
                self._json(json.load(f))
        except: self._json({})

    def _save(self):
        try:
            length = int(self.headers.get('Content-Length',0))
            data = json.loads(self.rfile.read(length).decode('utf-8'))
            p = os.path.join(PLUGIN_DIR,'data','agents.json')
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p,'w',encoding='utf-8') as f: json.dump(data,f,ensure_ascii=False,indent=2)
            self._json({'ok':True})
        except Exception as e: self._json({'ok':False,'error':str(e)},500)

    def _upload(self):
        try:
            ctype = self.headers.get('Content-Type','')
            if 'multipart' not in ctype: return self._json({'error':'need multipart'},400)
            form = cgi.FieldStorage(fp=self.rfile, headers=self.headers,
                environ={'REQUEST_METHOD':'POST','CONTENT_TYPE':ctype})
            aid = form.getfirst('agentId','rebecca')
            tid = form.getfirst('toneId','happy')
            fi = form['file']
            if not fi.filename: return self._json({'error':'no file'},400)
            ext = os.path.splitext(fi.filename)[1] or '.png'
            d = os.path.join(PLUGIN_DIR,'assets','emotes',aid); os.makedirs(d,exist_ok=True)
            dest = os.path.join(d,f'{tid}{ext}')
            with open(dest,'wb') as f: f.write(fi.file.read())
            pd = os.path.join(WORK_DIR,'assets','emotes',aid); os.makedirs(pd,exist_ok=True)
            fi.file.seek(0)
            with open(os.path.join(pd,f'{tid}{ext}'),'wb') as f: f.write(fi.file.read())
            self._link_emote(aid,tid,f'assets/emotes/{aid}/{tid}{ext}')
            self._json({'ok':True,'url':f'/assets/emotes/{aid}/{tid}{ext}'})
        except Exception as e: self._json({'ok':False,'error':str(e)},500)

    def _link_emote(self,aid,tid,rel):
        p = os.path.join(PLUGIN_DIR,'data','agents.json')
        try:
            with open(p,'r',encoding='utf-8') as f: d = json.load(f)
        except: d = {}
        a = d.setdefault(aid,{'displayName':aid,'theme':{},'emotes':{},'toneMap':{}})
        a.setdefault('emotes',{})[tid] = rel
        with open(p,'w',encoding='utf-8') as f: json.dump(d,f,ensure_ascii=False,indent=2)

    def _json(self,data,code=200):
        b = json.dumps(data,ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type','application/json')
        self.send_header('Content-Length',str(len(b)))
        self.end_headers()
        self.wfile.write(b)

if __name__ == '__main__':
    s = http.server.HTTPServer(('0.0.0.0',PORT), Handler)
    print(f'Serving: http://0.0.0.0:{PORT}')
    s.serve_forever()
