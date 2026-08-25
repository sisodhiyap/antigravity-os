import fs from 'fs';
import path from 'path';

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

async function verifyGitHub() {
  loadEnv();
  const gToken = process.env.GITHUB_TOKEN;
  console.log('GITHUB_TOKEN:', gToken ? 'PRESENT' : 'MISSING');
  if (!gToken) return;

  const headers = {
    Authorization: `Bearer ${gToken}`,
    'User-Agent': 'Antigravity-Deployer',
    Accept: 'application/vnd.github.v3+json'
  };

  // 1. Authenticated user
  const userRes = await fetch('https://api.github.com/user', { headers });
  const userData: any = await userRes.json();
  console.log(`Authenticated GitHub User: ${userData.login} (${userData.name || 'N/A'})`);

  // 2. Check sisodhiyap/antigravity-os repo
  const repoRes = await fetch('https://api.github.com/repos/sisodhiyap/antigravity-os', { headers });
  console.log(`Repository sisodhiyap/antigravity-os HTTP Status: ${repoRes.status}`);

  if (repoRes.status === 200) {
    const repoData: any = await repoRes.json();
    console.log(`Repo Name: ${repoData.full_name}`);
    console.log(`Default Branch: ${repoData.default_branch}`);
    console.log(`Private: ${repoData.private}`);
    console.log(`Permissions: ${JSON.stringify(repoData.permissions)}`);
    console.log(`Clone URL: ${repoData.clone_url}`);
  } else if (repoRes.status === 404) {
    console.log(`Repository sisodhiyap/antigravity-os does not exist yet. Creating repository...`);
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'antigravity-os',
        description: 'Antigravity OS v5.1 — Sovereign AI Operating System Dashboard',
        private: false,
        auto_init: false
      })
    });
    const createData: any = await createRes.json();
    console.log(`Create Repo Result (HTTP ${createRes.status}): ${createData.full_name || createData.message}`);
  }
}

verifyGitHub().catch(console.error);
