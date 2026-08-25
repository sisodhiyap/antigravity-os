import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}

async function pushCleanRelease() {
  loadEnv();
  const gToken = process.env.GITHUB_TOKEN;
  if (!gToken) {
    console.error('No GITHUB_TOKEN');
    return;
  }

  const rootDir = path.resolve(process.cwd(), '..');
  const remoteUrlWithToken = `https://x-access-token:${gToken}@github.com/sisodhiyap/antigravity-os.git`;

  console.log('Creating clean release branch to eliminate past commit history secrets...');
  try {
    // 1. Create and switch to orphan branch
    execSync('git checkout --orphan release-clean', { cwd: rootDir, stdio: 'pipe' });
    execSync('git add -A', { cwd: rootDir, stdio: 'pipe' });
    execSync('git commit -m "feat(release): Antigravity OS v5.1 Sovereign Production Release"', { cwd: rootDir, stdio: 'pipe' });
    
    // 2. Switch main branch to point to this clean commit
    execSync('git branch -D main', { cwd: rootDir, stdio: 'pipe' });
    execSync('git branch -m main', { cwd: rootDir, stdio: 'pipe' });

    const sha = execSync('git rev-parse HEAD', { cwd: rootDir, encoding: 'utf-8' }).trim();
    console.log('Clean Release Commit SHA:', sha);

    // 3. Push to GitHub main
    console.log('Pushing clean main branch to GitHub repository sisodhiyap/antigravity-os...');
    const output = execSync(`git push -u "${remoteUrlWithToken}" main:main --force`, {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    console.log('Push Output:', output || 'Successfully pushed clean main branch to GitHub.');
  } catch (err: any) {
    console.error('Push Error:', err.stderr || err.message);
  }
}

pushCleanRelease().catch(console.error);
