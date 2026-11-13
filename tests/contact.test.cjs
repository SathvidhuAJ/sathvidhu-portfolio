const test = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('../api/contact.js');

const env = {
  CONTACT_ENABLED:'true', RESEND_API_KEY:'mock-resend-key', CONTACT_FROM_EMAIL:'portfolio@verified.test',
  CONTACT_ALLOWED_ORIGINS:'https://portfolio.test', UPSTASH_REDIS_REST_URL:'https://mock.upstash.io',
  UPSTASH_REDIS_REST_TOKEN:'mock-redis-key', CONTACT_RATE_LIMIT_SALT:'mock-salt-for-tests-only-32-characters'
};
const message = {name:'Local test',email:'visitor@example.com',subject:'Test opportunity',message:'A normal message. <script>alert(1)</script>', 'bot-field':''};
const id = 'a4cc119d-1281-4cc8-ae28-ab28e2be31d8';
const jsonResponse = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
async function invoke({ body=message, method='POST', headers={}, config={}, mock }={}) {
  const calls=[];
  const handler=createHandler({ env:{...env,...config}, fetchImpl:async(url,options)=>{
    calls.push({url,options});
    if(mock) return mock(url,options,calls);
    return jsonResponse(url.includes('upstash')?{result:[1,1]}:{id:'mock-provider-id'});
  }});
  const req={method,body,headers:{origin:'https://portfolio.test','content-type':'application/json','idempotency-key':id,'x-vercel-forwarded-for':'203.0.113.10',...headers}};
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(data){this.data=data;return this;}};
  await handler(req,res);
  return {...res,calls};
}

test('provider acceptance: fixed recipient, authorized sender, validated reply-to and text-only input',async()=>{
  const result=await invoke();
  assert.equal(result.code,200);assert.deepEqual(result.data,{ok:true});
  const email=JSON.parse(result.calls[1].options.body);
  assert.equal(email.from,env.CONTACT_FROM_EMAIL);assert.deepEqual(email.to,['sathvidhu@gmail.com']);
  assert.equal(email.reply_to,message.email);assert.ok(email.text.includes('<script>'));
  assert.equal(email.html,undefined);assert.equal(result.headers['Cache-Control'],'no-store');
  const redis=JSON.parse(result.calls[0].options.body);
  assert.equal(redis[0],'EVAL');assert.equal(redis[2],'2');assert.ok(!redis.join('').includes('203.0.113.10'));
});
test('same retry has stable provider idempotency; changed content has a new key',async()=>{
  const a=await invoke(),b=await invoke(),c=await invoke({body:{...message,message:'Changed content'}});
  const key=r=>r.calls[1].options.headers['Idempotency-Key'];
  assert.equal(key(a),key(b));assert.notEqual(key(a),key(c));
});
for(const [label,options,status] of [
  ['method',{method:'GET'},405],['origin',{headers:{origin:'https://attacker.test'}},403],
  ['missing origin',{headers:{origin:undefined}},403],['media type',{headers:{'content-type':'text/plain'}},415],
  ['invalid JSON',{body:'{'},400],['null body',{body:null},400],['array body',{body:[]},400],
  ['unexpected field',{body:{...message,to:'elsewhere@example.com'}},400],
  ['honeypot',{body:{...message,'bot-field':'bot'}},400],['non-string honeypot',{body:{...message,'bot-field':1}},400],
  ['missing message',{body:{...message,message:undefined}},400],['blank message',{body:{...message,message:' \n '}},400],
  ['invalid email',{body:{...message,email:'not-an-email'}},400],['invalid domain',{body:{...message,email:'a@-invalid.test'}},400],
  ['consecutive email dots',{body:{...message,email:'a..b@example.com'}},400],
  ['leading email dot',{body:{...message,email:'.a@example.com'}},400],
  ['long email local part',{body:{...message,email:'a'.repeat(65)+'@example.com'}},400],
  ['email injection',{body:{...message,email:'a@example.com\nBcc:x@example.com'}},400],
  ['subject injection',{body:{...message,subject:'hello\nBcc:x@example.com'}},400],
  ['null byte',{body:{...message,message:'hello\u0000'}},400],
  ['object field',{body:{...message,name:{bad:true}}},400],['long name',{body:{...message,name:'a'.repeat(101)}},400],
  ['long email',{body:{...message,email:'a'.repeat(250)+'@example.com'}},400],
  ['long subject',{body:{...message,subject:'a'.repeat(201)}},400],['long message',{body:{...message,message:'a'.repeat(5001)}},400],
  ['oversize body',{body:'a'.repeat(32769)},413],['content length',{headers:{'content-length':'32769'}},413],
  ['missing idempotency',{headers:{'idempotency-key':undefined}},400],
  ['disabled configuration',{config:{CONTACT_ENABLED:'false'}},503],['missing provider key',{config:{RESEND_API_KEY:''}},503],
  ['placeholder sender',{config:{CONTACT_FROM_EMAIL:'portfolio@your-domain.example'}},503],
  ['missing distributed limiter',{config:{UPSTASH_REDIS_REST_TOKEN:''}},503],
  ['missing salt',{config:{CONTACT_RATE_LIMIT_SALT:''}},503]
]) test(`rejects ${label} before external calls`,async()=>{
  const result=await invoke(options);assert.equal(result.code,status);assert.equal(result.calls.length,0);assert.equal(result.data.ok,false);
});
test('short messages and Unicode messages are accepted and fields trimmed',async()=>{
  const result=await invoke({body:{...message,name:' A ',email:' visitor@example.com ',message:'Hi'}});
  assert.equal(result.code,200);assert.ok(JSON.parse(result.calls[1].options.body).text.startsWith('Name: A\n'));
  assert.equal((await invoke({body:{...message,message:'Hello 👋 नमस्ते'}})).code,200);
});
for(const counts of [[6,1],[1,41]]) test(`shared limits reject ${counts}`,async()=>{
  const result=await invoke({mock:()=>jsonResponse({result:counts})});
  assert.equal(result.code,429);assert.equal(result.calls.length,1);assert.equal(result.headers['Retry-After'],'600');
});
for(const [label,mock] of [
  ['Redis HTTP failure',()=>jsonResponse({error:'private diagnostic'},500)],
  ['Redis malformed response',()=>jsonResponse({result:['bad',1]})],
  ['Redis outage',()=>{throw new Error('private diagnostic');}]
]) test(label+' fails closed',async()=>{
  const result=await invoke({mock});assert.equal(result.code,503);assert.equal(result.calls.length,1);
  assert.ok(!JSON.stringify(result.data).includes('private diagnostic'));
});
for(const [label,provider,status] of [
  ['provider error',()=>jsonResponse({message:'private provider diagnostic'},422),502],
  ['provider rate limit',()=>jsonResponse({message:'private provider diagnostic'},429),502],
  ['provider JSON without id',()=>jsonResponse({}),502],
  ['invalid provider JSON',()=>new Response('not json'),502],
  ['provider timeout',()=>{throw new DOMException('private timeout','TimeoutError');},504],
  ['provider offline',()=>{throw new TypeError('private network error');},502]
]) test(label+' never returns success or private diagnostics',async()=>{
  const result=await invoke({mock:url=>url.includes('upstash')?jsonResponse({result:[1,1]}):provider()});
  assert.equal(result.code,status);assert.equal(result.data.ok,false);assert.ok(!JSON.stringify(result.data).includes('private'));
});
test('preview deployment hostname accepted only from trusted environment',async()=>{
  assert.equal((await invoke({config:{VERCEL_URL:'preview.vercel.app'},headers:{origin:'https://preview.vercel.app'}})).code,200);
});
