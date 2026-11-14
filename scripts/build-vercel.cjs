const { readFileSync, readdirSync, lstatSync, copyFileSync, mkdtempSync, renameSync, existsSync, unlinkSync, rmdirSync } = require('node:fs');
const { resolve, join, relative, isAbsolute } = require('node:path');
const root = resolve(__dirname, '..');
const output = resolve(root, 'dist');
const expected = ['about.html', 'app.js', 'index.html', 'projects.js', 'robots.txt', 'sathvidhu-logo.png', 'sitemap.xml', 'theme.css'];
function validate(directory) {
  if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink()) throw new Error('Unsafe publish directory');
  const files = [];
  function walk(path) {
    for (const name of readdirSync(path)) {
      const target = resolve(path, name);
      const rel = relative(directory, target);
      if (rel.startsWith('..') || isAbsolute(rel) || lstatSync(target).isSymbolicLink()) throw new Error('Unsafe publish path');
      if (lstatSync(target).isDirectory()) walk(target);
      else if (lstatSync(target).isFile()) files.push(rel.replaceAll('\\', '/'));
      else throw new Error('Unsupported publish entry');
    }
  }
  walk(directory);
  if (JSON.stringify(files.sort()) !== JSON.stringify(expected)) throw new Error('Unexpected publish file set');
  for (const file of expected.filter(name => name !== 'sathvidhu-logo.png')) {
    const content = readFileSync(join(directory, file), 'utf8');
    if (/RESEND_API_KEY|UPSTASH_REDIS_REST_TOKEN|CONTACT_RATE_LIMIT_SALT|-----BEGIN .*PRIVATE KEY|Bearer\s+re_/i.test(content)) throw new Error('Server-only material in publish output');
  }
}
const source = join(root, 'public');
validate(source);
if (existsSync(output) && (lstatSync(output).isSymbolicLink() || !lstatSync(output).isDirectory())) throw new Error('Unsafe output directory');
// Staging and backup containers are siblings of dist, avoiding system-temp mounts.
// Only this invocation's generated staging files may be removed; backups survive.
const staging = mkdtempSync(join(root, '.dist-build-'));
let backup;
let previousMoved = false;
function cleanStaging() {
  if (!existsSync(staging)) return;
  const rel = relative(root, staging);
  if (!/^\.dist-build-[^/\\]+$/.test(rel) || lstatSync(staging).isSymbolicLink()) throw new Error('Unsafe staging cleanup');
  const names = readdirSync(staging);
  if (names.some(name => !expected.includes(name) || !lstatSync(join(staging, name)).isFile() || lstatSync(join(staging, name)).isSymbolicLink())) {
    throw new Error('Unexpected staging contents retained for review');
  }
  for (const name of names) unlinkSync(join(staging, name));
  rmdirSync(staging);
}
try {
  for (const file of expected) copyFileSync(join(source, file), join(staging, file));
  const html = readFileSync(join(staging, 'index.html'), 'utf8');
  if (!html.includes('data-contact-provider="compose"') || /action="\/api\/contact"|data-netlify=/.test(html)) throw new Error('Missing safe compose form marker');
  validate(staging);
  if (existsSync(output)) {
    backup = mkdtempSync(join(root, '.dist-backup-'));
    renameSync(output, join(backup, 'dist'));
    previousMoved = true;
  }
  renameSync(staging, output);
} catch (error) {
  const failures = [error];
  if (previousMoved) {
    try {
      if (existsSync(output)) throw new Error('Output path occupied; refusing to overwrite it');
      renameSync(join(backup, 'dist'), output);
      previousMoved = false;
    } catch (rollbackError) {
      failures.push(new Error(`Rollback failed; previous output is preserved at ${join(backup, 'dist')}`, { cause: rollbackError }));
    }
  }
  try { cleanStaging(); } catch (cleanupError) { failures.push(cleanupError); }
  // Remove only a newly created, empty container; never remove a saved output.
  if (backup && !previousMoved) {
    try { rmdirSync(backup); } catch (cleanupError) { failures.push(cleanupError); }
  }
  throw failures.length === 1 ? error : new AggregateError(failures, 'Build failed; review preserved output and filesystem errors');
}
console.log('Vercel static output: dist/. Serverless entry: api/contact.js (separate from static output).');
if (backup) console.log(`Previous output preserved at ${join(backup, 'dist')}`);
