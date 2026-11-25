const test=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {readFileSync,readdirSync}=require('node:fs');
const {resolve}=require('node:path');

test('build preserves compose source and keeps the legacy API outside assets',()=>{
  const source=readFileSync('public/index.html','utf8');
  execFileSync(process.execPath,['scripts/build-vercel.cjs']);
  const built=readFileSync('dist/index.html','utf8');
  assert.equal(readFileSync('public/index.html','utf8'),source);
  assert.equal(built,source);
  assert.ok(built.includes('data-contact-provider="compose"'));
  assert.ok(!/data-netlify=|action="\/api\/contact"|name="form-name"/.test(built));
  assert.ok(built.includes('id="gmailCompose"'));
  const config=JSON.parse(readFileSync('vercel.json'));
  assert.equal(config.outputDirectory,'dist');assert.equal(config.framework,null);
  assert.ok(config.functions['api/contact.js']);assert.equal(config.rewrites,undefined);
  assert.ok(!readdirSync('dist').includes('api'));
  assert.ok(!resolve('api/contact.js').startsWith(resolve('dist')));
  assert.ok(readFileSync('netlify.toml','utf8').includes('publish = "public"'));
});
test('static output cannot contain configured server-only secrets or server files',()=>{
  const scan=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?scan(`${dir}/${entry.name}`):[`${dir}/${entry.name}`]);
  for(const path of scan('public')) {
    if(!/\.(js|html|css|txt|xml)$/.test(path)) continue;
    const content=readFileSync(path,'utf8');
    assert.ok(!/RESEND_API_KEY|UPSTASH_REDIS_REST_TOKEN|CONTACT_RATE_LIMIT_SALT|Bearer re_/i.test(content),path);
  }
  assert.ok(!scan('dist').some(path=>/\.env|contact\.js$/.test(path)));
});
const {mkdtempSync,cpSync,writeFileSync,mkdirSync,existsSync,symlinkSync} = require('node:fs');
const {tmpdir} = require('node:os');
const {join} = require('node:path');
function fixture() {
  const root=mkdtempSync(join(tmpdir(),'sath-build-test-'));
  for(const name of ['public','scripts']) cpSync(name,join(root,name),{recursive:true});
  return {root,build:()=>execFileSync(process.execPath,[join(root,'scripts/build-vercel.cjs')],{stdio:'pipe'})};
}
test('fresh output excludes nested stale output without deleting its contents',()=>{
  const f=fixture();f.build();
  mkdirSync(join(f.root,'dist','old'),{recursive:true});
  writeFileSync(join(f.root,'dist','old','audit.log'),'stale');
  f.build();assert.equal(existsSync(join(f.root,'dist','old')),false);
  assert.equal(readdirSync(join(f.root,'dist')).length,9);
});
for(const name of ['.env','debug.log','audit/report.json','api/contact.js','../escape.txt']) {
  test('reject unexpected publish path '+name,()=>{
    const f=fixture();const target=join(f.root,'public',name);
    mkdirSync(require('node:path').dirname(target),{recursive:true});writeFileSync(target,'test');
    if(name.startsWith('../')) {
      // Outside public must never be copied, even when present in the repository.
      f.build();assert.equal(existsSync(join(f.root,'dist','escape.txt')),false);
    } else assert.throws(f.build);
  });
}
test('reject server-only material inside an allowed asset before replacing output',()=>{
  const f=fixture();f.build();
  writeFileSync(join(f.root,'public','app.js'),'const RESEND_API_KEY = "not-a-real-secret";');
  assert.throws(f.build);
  assert.ok(readFileSync(join(f.root,'dist','app.js'),'utf8').includes('renderProjects'));
});
test('reject linked public or output directories',()=>{
  for(const name of ['public','dist']) {
    const f=fixture(); const target=join(f.root,'target');mkdirSync(target);
    if(name==='public') require('node:fs').renameSync(join(f.root,'public'),join(f.root,'original-public'));
    symlinkSync(target,join(f.root,name),process.platform==='win32'?'junction':'dir');
    assert.throws(f.build);
  }
});
// Failure injection is confined to a child process and an isolated fixture.
function injectedBuild(f, mode) {
  const preload=join(f.root,'inject.cjs');
  writeFileSync(preload,`
    const fs=require('node:fs');
    const path=require('node:path');
    const root=${JSON.stringify(f.root)};
    const mode=${JSON.stringify(mode)};
    const originalRename=fs.renameSync;
    const originalCopy=fs.copyFileSync;
    fs.renameSync=(from,to)=>{
      let code;
      if(mode==='backup-exdev' && from===path.join(root,'dist')) code='EXDEV';
      if((mode==='publish' || mode==='rollback') && path.basename(from).startsWith('.dist-build-')) code='EACCES';
      if(mode==='rollback' && path.basename(path.dirname(from)).startsWith('.dist-backup-')) code='EACCES';
      if(code) throw Object.assign(new Error('Injected '+code),{code});
      return originalRename(from,to);
    };
    fs.copyFileSync=(from,to)=>{
      if(mode==='copy' && path.basename(from)==='projects.js') throw Object.assign(new Error('Injected copy failure'),{code:'EIO'});
      return originalCopy(from,to);
    };
  `);
  return ()=>execFileSync(process.execPath,['--require',preload,join(f.root,'scripts/build-vercel.cjs')],{stdio:'pipe'});
}
for(const mode of ['backup-exdev','publish','copy']) {
  test(`build ${mode} failure restores previous output and cleans staging`,()=>{
    const f=fixture();f.build();
    writeFileSync(join(f.root,'dist','user-maintained.txt'),'keep this exact content');
    const before=readFileSync(join(f.root,'dist','index.html'),'utf8');
    assert.throws(injectedBuild(f,mode),error=>{
      assert.ok(error.stderr.toString().includes(mode==='backup-exdev'?'EXDEV':mode==='publish'?'EACCES':'copy failure'));
      return true;
    });
    assert.equal(readFileSync(join(f.root,'dist','index.html'),'utf8'),before);
    assert.equal(readFileSync(join(f.root,'dist','user-maintained.txt'),'utf8'),'keep this exact content');
    assert.deepEqual(readdirSync(f.root).filter(n=>/^\.dist-(build|backup)-/.test(n)),[]);
  });
}
test('successful rebuild preserves unique backups including user-maintained content',()=>{
  const f=fixture();f.build();
  writeFileSync(join(f.root,'dist','user-maintained.txt'),'original');
  const original=readFileSync(join(f.root,'dist','index.html'),'utf8');
  f.build();
  const first=readdirSync(f.root).find(n=>n.startsWith('.dist-backup-'));
  assert.equal(readFileSync(join(f.root,first,'dist','user-maintained.txt'),'utf8'),'original');
  assert.equal(readFileSync(join(f.root,first,'dist','index.html'),'utf8'),original);
  f.build();
  assert.equal(readdirSync(f.root).filter(n=>n.startsWith('.dist-backup-')).length,2);
  assert.equal(readFileSync(join(f.root,first,'dist','user-maintained.txt'),'utf8'),'original');
  assert.equal(readdirSync(f.root).some(n=>n.startsWith('.dist-build-')),false);
});
test('rollback filesystem failure retains recoverable backup and reports it',()=>{
  const f=fixture();f.build();
  writeFileSync(join(f.root,'dist','user-maintained.txt'),'recover me');
  assert.throws(injectedBuild(f,'rollback'),error=>{
    assert.ok(error.stderr.toString().includes('previous output is preserved at'));return true;
  });
  const backup=readdirSync(f.root).find(n=>n.startsWith('.dist-backup-'));
  assert.equal(readFileSync(join(f.root,backup,'dist','user-maintained.txt'),'utf8'),'recover me');
  assert.equal(readdirSync(f.root).some(n=>n.startsWith('.dist-build-')),false);
});
test('validation failure cleans generated staging and leaves old output untouched',()=>{
  const f=fixture();f.build();
  const before=readFileSync(join(f.root,'dist','index.html'),'utf8');
  writeFileSync(join(f.root,'public','index.html'),'<html>Missing provider marker</html>');
  assert.throws(f.build);
  assert.equal(readFileSync(join(f.root,'dist','index.html'),'utf8'),before);
  assert.equal(readdirSync(f.root).some(n=>n.startsWith('.dist-build-')),false);
});
