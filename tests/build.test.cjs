const test=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {readFileSync,readdirSync}=require('node:fs');
const {resolve}=require('node:path');

test('build separates Vercel API from assets and preserves Netlify source',()=>{
  const source=readFileSync('public/index.html','utf8');
  execFileSync(process.execPath,['scripts/build-vercel.cjs']);
  const built=readFileSync('dist/index.html','utf8');
  assert.equal(readFileSync('public/index.html','utf8'),source);
  assert.ok(source.includes('data-contact-provider="netlify"'));
  assert.ok(source.includes('data-netlify="true"'));
  assert.ok(built.includes('data-contact-provider="resend"'));
  assert.ok(built.includes('action="/api/contact"'));
  assert.ok(!built.includes('data-netlify='));assert.ok(!built.includes('name="form-name"'));
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
