const test = require('node:test');
const assert = require('node:assert/strict');
const {runInNewContext} = require('node:vm');
const {readFileSync} = require('node:fs');
// Exercise the actual Lua body with Redis command semantics, without services.
const lua = readFileSync('api/contact.js','utf8').match(/const LIMIT_SCRIPT = `([\s\S]*?)`;/)[1];
const js = lua.replace(/--[^\n]*/g,'').replace(/local /g,'let ')
  .replace(/\bthen\b/g,'{').replace(/\bend\b/g,'}')
  .replace(/if ([^\n{]+) \{/g,'if ($1) {').replace(/==/g,'===')
  .replace(/return \{([^}]+)\}/g,'return [$1]');
function harness() {
  const entries = new Map(); let now=0;
  const redis={call(command,key,ttl) {
    if(entries.get(key)?.expires<=now) entries.delete(key);
    if(command==='INCR') {
      const entry=entries.get(key)||{value:0,expires:Infinity};
      entry.value++; entries.set(key,entry); return entry.value;
    }
    if(command==='EXPIRE') {entries.get(key).expires=now+ttl;return 1;}
    throw new Error('Unsupported Redis command');
  }};
  return {entries, advance(seconds){now+=seconds;}, run(ip='ip',day='day') {
    return Array.from(runInNewContext('(function(){'+js+'\n})()', {redis,KEYS:[null,ip,day]}));
  }};
}
test('exhausted IP cannot spend global quota; another IP can still submit',()=>{
  const h=harness();
  for(let n=1;n<=5;n++) assert.deepEqual(h.run(),[n,n]);
  for(let n=6;n<=60;n++) assert.deepEqual(h.run(),[n,1]);
  assert.equal(h.entries.get('day').value,5);
  assert.deepEqual(h.run('other'),[1,6]);
  assert.deepEqual(h.run('ip','new-day'),[61,1]);
  assert.equal(h.entries.has('new-day'),false);
});
test('IP expiry is not extended by rejected requests and global TTL stays fixed',()=>{
  const h=harness(); h.run(); h.advance(599);
  for(let n=2;n<=6;n++) h.run();
  assert.equal(h.entries.get('ip').expires,600);
  assert.equal(h.entries.get('day').expires,86400);
  h.advance(1); assert.deepEqual(h.run(),[1,6]);
  assert.equal(h.entries.get('ip').expires,1200);
  assert.equal(h.entries.get('day').expires,86400);
  h.advance(85800); assert.deepEqual(h.run(),[1,1]);
});
test('global boundary remains 40; requests from separate IPs share the counter',()=>{
  const h=harness();
  for(let n=1;n<=40;n++) assert.deepEqual(h.run('ip-'+n),[1,n]);
  assert.deepEqual(h.run('ip-41'),[1,41]);
});
