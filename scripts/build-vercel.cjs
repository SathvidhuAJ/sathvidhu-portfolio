const { cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync } = require('node:fs');
const { resolve } = require('node:path');
const root = resolve(__dirname, '..');
const output = resolve(root, 'dist');
mkdirSync(output, { recursive: true });
cpSync(resolve(root, 'public'), output, { recursive: true });
const index = resolve(output, 'index.html');
let html = readFileSync(index, 'utf8');
if (!html.includes('data-contact-provider="netlify"')) throw new Error('Missing contact provider marker');
html = html.replace('data-contact-provider="netlify"', 'data-contact-provider="resend"')
  .replace('action="/" data-netlify-honeypot="bot-field"', 'action="/api/contact"')
  .replace(' data-netlify="true"', '')
  .replace(/\s*<input type="hidden" name="form-name" value="contact">/, '');
if (!html.includes('action="/api/contact"')) throw new Error('Missing Vercel endpoint');
writeFileSync(index, html);
// Deliberately copy only public/, never API source, .env or repository files.
if (readdirSync(output).some(name => name.startsWith('.env') || name === 'api')) throw new Error('Unsafe static output');
console.log('Vercel static output: dist/. Serverless entry: api/contact.js (separate from static output).');
