const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync, readdirSync, cpSync, mkdtempSync} = require('node:fs');
const {join} = require('node:path');
const {tmpdir} = require('node:os');
const {execFileSync} = require('node:child_process');
const primary = 'https://aj-sath.vercel.app';
// Isolate output from other test files and preserve the repository's build output.
const root = mkdtempSync(join(tmpdir(), 'sath-seo-test-'));
for (const name of ['public','scripts']) cpSync(name,join(root,name),{recursive:true});
execFileSync(process.execPath,[join(root,'scripts/build-vercel.cjs')]);
for (const directory of ['public','dist']) {
  for (const page of ['index.html','about.html']) {
    test(`${directory}/${page}: one primary canonical, aligned sharing and structured data`,()=>{
      const html=readFileSync(join(root,directory,page),'utf8');
      const url=primary+(page==='index.html'?'/':'/about.html');
      assert.deepEqual([...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)].map(m=>m[1]),[url]);
      const meta = key => [...html.matchAll(new RegExp('<meta (?:name|property)="'+key+'" content="([^"]+)"','g'))].map(m=>m[1]);
      for(const key of ['og:url','twitter:url']) assert.deepEqual(meta(key),[url]);
      for(const key of ['og:image','twitter:image']) assert.deepEqual(meta(key),[primary+'/sathvidhu-logo.png']);
      for(const key of ['og:title','og:description','twitter:title','twitter:description','twitter:card']) assert.equal(meta(key).length,1);
      assert.deepEqual(meta('robots'),['index,follow']);
      const data=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
      assert.equal(data.url,url);
      assert.equal((data.about||data.mainEntity).url,primary+(page==='index.html'?'/about.html':'/'));
      assert.ok((data.about||data.mainEntity).sameAs.includes('https://github.com/Sathvidhu'));
      assert.ok(!/netlify\.app|noindex/i.test(html));
      assert.ok(html.includes('href="#main-content"'));
      assert.ok(html.includes('id="main-content"'));
    });
  }
  test(`${directory}: sitemap, robots and publish set agree with primary`,()=>{
    const sitemap=readFileSync(join(root,directory,'sitemap.xml'),'utf8');
    assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]),[primary+'/',primary+'/about.html']);
    assert.ok(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
    const robots=readFileSync(join(root,directory,'robots.txt'),'utf8');
    assert.equal(robots.replace(/\r\n/g, '\n').trim(),`User-agent: *\nAllow: /\n\nSitemap: ${primary}/sitemap.xml`);
    assert.equal(readdirSync(join(root,directory)).length,8);
    for(const file of readdirSync(join(root,directory)).filter(n=>/\.(html|js|css|xml|txt)$/.test(n))) {
      assert.ok(!readFileSync(join(root,directory,file),'utf8').includes('aj-sath.netlify.app'),file);
    }
  });
}
