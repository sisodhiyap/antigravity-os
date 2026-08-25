import fs from 'fs';
import path from 'path';

function scanSizes(dir: string, baseDir: string = dir): { path: string; size: number }[] {
  let results: { path: string; size: number }[] = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === '.next' || item === '.git') continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(scanSizes(full, baseDir));
    } else {
      results.push({ path: path.relative(baseDir, full), size: stat.size });
    }
  }
  return results;
}

const all = scanSizes(process.cwd());
all.sort((a, b) => b.size - a.size);
console.log('Top 20 largest files in project:');
for (const f of all.slice(0, 20)) {
  console.log(`  ${(f.size / 1024 / 1024).toFixed(2)} MB -> ${f.path}`);
}
