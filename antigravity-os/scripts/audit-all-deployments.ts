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

async function auditDeployments() {
  loadEnv();

  // 1. Netlify
  const nToken = process.env.NETLIFY_AUTH_TOKEN;
  if (nToken) {
    const netlifyRes = await fetch('https://api.netlify.com/api/v1/sites', {
      headers: { Authorization: `Bearer ${nToken}` }
    });
    const sites: any = await netlifyRes.json();
    console.log('Netlify Sites Count:', Array.isArray(sites) ? sites.length : sites);
    if (Array.isArray(sites)) {
      for (const s of sites) {
        console.log(`- Netlify Site: ${s.name}, URL: ${s.ssl_url || s.url}, ID: ${s.id}, Updated: ${s.updated_at}`);
      }
    }
  }

  // 2. GitHub
  const gToken = process.env.GITHUB_TOKEN;
  if (gToken) {
    const ghRes = await fetch('https://api.github.com/user/repos?per_page=10&sort=updated', {
      headers: { Authorization: `Bearer ${gToken}`, 'User-Agent': 'Antigravity-Deploy-Auditor' }
    });
    const repos: any = await ghRes.json();
    console.log('\nGitHub Repos:');
    if (Array.isArray(repos)) {
      for (const r of repos) {
        console.log(`- Repo: ${r.full_name}, Default Branch: ${r.default_branch}, Updated: ${r.updated_at}, HTML URL: ${r.html_url}`);
      }
    }
  }
}

auditDeployments().catch(console.error);
