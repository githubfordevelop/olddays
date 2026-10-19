import importlib.util, io, json, tempfile, unittest, zipfile
from pathlib import Path

spec=importlib.util.spec_from_file_location('pull_sync',Path(__file__).resolve().parents[1]/'deploy/pull-sync.py')
sync=importlib.util.module_from_spec(spec);spec.loader.exec_module(sync)
SHA='a'*40

class DeployTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        sync.ROOT=Path(self.temp.name)
        self.old=sync.ROOT/'releases'/'old';self.old.mkdir(parents=True)
        (sync.ROOT/'current').symlink_to(self.old)
    def payload(self,bad=False):
        out=io.BytesIO()
        with zipfile.ZipFile(out,'w') as z:
            for name in ['index.html','app.js','annual-news.js','annual-news-extra.js','mobile-scenes.js','style.css']:z.writestr('repo/dist/'+name,'valid static file')
            z.writestr('repo/README.md','must not be deployed')
            if bad:z.writestr('repo/dist/../../escape','unsafe')
        return out.getvalue()
    def setup_fetch(self,bad=False,health=True,foreign=False):
        run={'conclusion':'success','head_branch':'main','event':'push','head_repository':{'full_name':'other/repo' if foreign else sync.REPO},'head_sha':SHA,'html_url':'https://github.com/example/actions/runs/1'}
        payload=self.payload(bad)
        def fetch(url,*args):
            if '/actions/' in url:return json.dumps({'workflow_runs':[run]}).encode()
            if 'codeload.github.com' in url:return payload
            if url.startswith('http://127.0.0.1'):return json.dumps({'commit':SHA if health else 'old'}).encode()
            raise AssertionError('Unexpected URL')
        sync.download=fetch
    def test_rejects_foreign_repository_ci(self):
        self.setup_fetch(foreign=True);sync.sync()
        self.assertEqual((sync.ROOT/'current').resolve(),self.old.resolve())
    def test_rejects_traversal_without_touching_current(self):
        self.setup_fetch(bad=True)
        with self.assertRaises(RuntimeError):sync.sync()
        self.assertEqual((sync.ROOT/'current').resolve(),self.old.resolve())
        self.assertFalse((sync.ROOT/'escape').exists())
    def test_publishes_only_static_dist_and_records_commit(self):
        self.setup_fetch();sync.sync()
        current=(sync.ROOT/'current').resolve()
        self.assertEqual(current.name,SHA)
        self.assertTrue((current/'index.html').exists())
        self.assertFalse((current/'README.md').exists())
        self.assertEqual(json.loads((current/'version.json').read_text())['commit'],SHA)
    def test_http_failure_restores_previous_release(self):
        self.setup_fetch(health=False)
        with self.assertRaises(RuntimeError):sync.sync()
        self.assertEqual((sync.ROOT/'current').resolve(),self.old.resolve())

if __name__=='__main__':unittest.main()
