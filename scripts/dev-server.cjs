const http = require('node:http');
require('./build-vercel.cjs');
const { readFile } = require('node:fs/promises');
const { resolve, extname, sep } = require('node:path');
const { createHandler } = require('../api/contact.js');
const root = resolve(__dirname, '../dist');
const args = process.argv.slice(2);
const port = Number(args[0] || 8766);
// Safe by default: this local server NEVER calls Resend or Redis, even if the
// shell has real credentials. Use it for UI/API routing, not live email testing.
const contact = createHandler({ env: { CONTACT_ALLOWED_ORIGINS: `http://127.0.0.1:${port},http://localhost:${port}` } });
http.createServer(async (req,res) => {
  res.status = code => { res.statusCode=code; return res; };
  res.json = data => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(data)); };
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/api/contact') {
    let bytes=0, chunks=[];
    for await (const chunk of req) {
      bytes+=chunk.length;
      if (bytes>32768) return res.status(413).json({ok:false,error:'Your message is too large.'});
      chunks.push(chunk);
    }
    req.body = Buffer.concat(chunks).toString('utf8');
    return contact(req,res);
  }
  if (!['GET','HEAD'].includes(req.method)) return res.status(405).json({ok:false,error:'Method not allowed.'});
  try {
    const file = resolve(root, '.' + decodeURIComponent(pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root+sep)) return res.status(403).end();
    const data=await readFile(file);
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.xml':'application/xml','.txt':'text/plain'};
    res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.status(404).end('Not found'); }
}).listen(port,'127.0.0.1',()=>console.log(`Local Vercel preview: http://127.0.0.1:${port}/ (email sending disabled)`));
