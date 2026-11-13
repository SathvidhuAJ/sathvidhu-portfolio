const { spawnSync } = require('node:child_process');
const { readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
for (const directory of ['public','api','scripts','tests']) {
  for (const file of readdirSync(directory).filter(name => /\.(?:js|cjs)$/.test(name))) {
    const result = spawnSync(process.execPath, ['--check', join(directory,file)], { stdio:'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}
JSON.parse(readFileSync('vercel.json'));
JSON.parse(readFileSync('package.json'));
console.log('JavaScript syntax and configuration JSON: PASS');
