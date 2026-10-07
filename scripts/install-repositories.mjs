// scripts/install-repositories.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const repos = [
  { name: 'agency-agents', url: 'https://github.com/msitarzewski/agency-agents.git' },
  { name: 'claude-mem', url: 'https://github.com/thedotmack/claude-mem.git' },
  { name: 'meetily', url: 'https://github.com/Zackriya-Solutions/meetily.git' },
  { name: 'voicebox', url: 'https://github.com/jamiepine/voicebox.git' },
  { name: 'OpenMontage', url: 'https://github.com/calesthio/OpenMontage.git' },
  { name: 'AIComicBuilder', url: 'https://github.com/LingyiChen-AI/AIComicBuilder.git' },
  { name: 'e2e-tester-army', url: 'https://github.com/tester-army/e2e.git' },
  { name: 'career-ops', url: 'https://github.com/career-ops-hq/career-ops.git' },
  { name: 'firecrawl', url: 'https://github.com/firecrawl/firecrawl.git' },
  { name: 'LTX-Desktop', url: 'https://github.com/Lightricks/LTX-Desktop.git' }
];

const targetDir = 'c:\\D drive\\Antigravity\\repositories';

console.log('=== CLONING & INSTALLING REPOSITORIES ===\n');

for (const repo of repos) {
  const dest = path.join(targetDir, repo.name);
  if (fs.existsSync(dest)) {
    console.log(`[EXISTS] ${repo.name} is already present at ${dest}`);
    continue;
  }
  console.log(`[*] Cloning ${repo.name} from ${repo.url}...`);
  try {
    execSync(`git clone --depth 1 ${repo.url} "${dest}"`, { stdio: 'inherit' });
    console.log(`[PASS] Cloned ${repo.name} successfully!\n`);
  } catch (err) {
    console.log(`[FAIL] Error cloning ${repo.name}: ${err.message}\n`);
  }
}

console.log('=== REPOSITORY SYNC FINISHED ===');
