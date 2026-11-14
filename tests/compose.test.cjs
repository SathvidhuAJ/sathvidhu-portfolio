const test=require('node:test');
const assert=require('node:assert/strict');
const {prepare,recipient,maxMailto}=require('../public/app.js');
const normal={name:'Visitor',email:'visitor@example.com',subject:'A project & a question?',message:'Hello\nSecond line'};
test('draft recipient, readable body, multiline and URL encoding',()=>{
 const d=prepare(normal);assert.deepEqual(d.errors,{});assert.equal(recipient,'sathvidhu@gmail.com');
 assert.ok(d.mailto.startsWith('mailto:sathvidhu@gmail.com?'));
 const mail=new URL(d.mailto),gmail=new URL(d.gmail);
 assert.equal(mail.searchParams.get('subject'),normal.subject);
 assert.equal(mail.searchParams.get('body'),d.body.replace(/\n/g,'\r\n'));
 assert.equal(gmail.origin,'https://mail.google.com');assert.equal(gmail.pathname,'/mail/');
 assert.equal(gmail.searchParams.get('to'),recipient);assert.equal(gmail.searchParams.get('su'),normal.subject);
 assert.equal(gmail.searchParams.get('body'),mail.searchParams.get('body'));
 assert.equal(d.body,`Hello Sathvidhu,\n\nYou have a portfolio inquiry.\n\nName: Visitor\nEmail: visitor@example.com\nSubject: A project & a question?\n\nMessage:\nHello\nSecond line\n\nRegards,\nVisitor`);
});
for(const key of ['name','email','subject','message']) test('reject blank '+key,()=>{
 const d=prepare({...normal,[key]:' \n '});assert.ok(d.errors[key]);assert.equal(d.mailto,undefined);
});
for(const email of ['invalid','a..b@example.com','.a@example.com','a@-example.com']) test('reject malformed email '+email,()=>assert.ok(prepare({...normal,email}).errors.email));
test('trim whitespace and preserve Unicode, literal HTML and reserved characters',()=>{
 const d=prepare({name:'  Zo\u00eb  ',email:' visitor@example.com ',subject:' \u4f60\u597d &?=#% ',message:' \uD83D\uDC4B\n<script>literal</script> &bcc=attacker@test.invalid '});
 assert.deepEqual(d.errors,{});assert.equal(d.values.name,'Zo\u00eb');assert.equal(d.values.email,normal.email);
 assert.equal(new URL(d.mailto).searchParams.size,2);
 assert.equal(new URL(d.gmail).searchParams.size,5);
 assert.ok(new URL(d.gmail).searchParams.get('body').includes('<script>literal</script> &bcc=attacker@test.invalid'));
});
for(const [key,max] of Object.entries({name:100,email:254,subject:200,message:5000})) test('reject overlong '+key,()=>assert.ok(prepare({...normal,[key]:'a'.repeat(max+1)}).errors[key]));
for(const key of ['name','email','subject']) test('prevent header injection in '+key,()=>assert.ok(prepare({...normal,[key]:normal[key]+'\r\nBcc: other@example.com'}).errors[key]));
test('long drafts stay complete and exceed conservative mailto threshold',()=>{
 const message='x'.repeat(5000);const d=prepare({...normal,message});assert.deepEqual(d.errors,{});
 assert.ok(d.mailto.length>maxMailto);assert.ok(new URL(d.mailto).searchParams.get('body').includes(message));
});
test('reject invalid Unicode rather than silently altering or crashing',()=>assert.ok(prepare({...normal,message:'\uD800'}).errors.message));

test('Gmail is the sole form action; direct email and compact fallback remain',()=>{
 const html=require('node:fs').readFileSync('public/index.html','utf8');
 const actions=[...html.matchAll(/<button class="btn compose-button[^"]*" id="([^"]+)" type="([^"]+)" disabled>([^<]+)<\/button>/g)];
 assert.deepEqual(actions.map(m=>[m[1],m[2],m[3]]),[['gmailCompose','submit','Open in Gmail']]);
 const options=html.match(/<details id="draftDetails" hidden>([\s\S]*?)<\/details>/)[1];
 assert.ok(!html.includes('emailCompose'));
 assert.ok(html.includes('href="mailto:sathvidhu@gmail.com"'));
 assert.ok(html.includes('Review your draft in Gmail and press Send.'));
 assert.ok(options.includes('id="gmailDraftLink"'));assert.ok(options.includes('id="manualDraft"'));
});
for(const mode of ['success','blocked','open-error','navigation-error']) test('Gmail handoff '+mode,()=>{
 const {launchGmail}=require('../public/app.js');
 const url=prepare(normal).gmail;
 let closed=false, policy, detached=false, destination;
 const popup={opener:{},document:{createElement(tag){return tag==='a'?{click(){
  detached=popup.opener===null;
  if(mode==='navigation-error') throw new Error('Cannot navigate');
  assert.equal(this.referrerPolicy,'no-referrer');assert.equal(this.rel,'noopener noreferrer');
  destination=this.href;
 }}:{};},head:{appendChild(meta){policy=meta;}},body:{appendChild(){}}},close(){closed=true;}};
 const result=launchGmail(url,(target,name)=>{
  assert.equal(target,'about:blank');assert.equal(name,'_blank');
  if(mode==='open-error')throw new Error('Cannot open');
  return mode==='blocked'?null:popup;
 });
 assert.equal(result,mode==='success');
 if(mode==='success'){
  assert.equal(destination,url);assert.equal(detached,true);
  assert.deepEqual(policy,{name:'referrer',content:'no-referrer'});
 }
 if(mode==='navigation-error')assert.equal(closed,true);
});
