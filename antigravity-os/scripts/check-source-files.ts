import fs from 'fs';
import path from 'path';

function getFiles(dir: string, baseDir: string = dir): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'public_factory') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, baseDir));
    } else {
      results.push(path.relative(baseDir, fullPath));
    }
  }
  return results;
}

const files = getFiles(process.cwd());
console.log(`Total deployable source files (excluding node_modules/.next/.git): ${files.length}`);
console.log('Sample files:', files.slice(0, 20));
