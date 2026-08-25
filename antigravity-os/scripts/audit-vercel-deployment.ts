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

async function auditVercel() {
  loadEnv();

  const vToken = process.env.VERCEL_TOKEN;
  console.log('VERCEL_TOKEN present?', !!vToken);

  if (!vToken) {
    console.error('No VERCEL_TOKEN found in environment.');
    return;
  }

  // 1. Fetch user/team
  const userRes = await fetch('https://api.vercel.com/v2/user', {
    headers: { Authorization: `Bearer ${vToken}` }
  });
  const userData: any = await userRes.json();
  console.log('Vercel User:', userData.user?.username || userData.user?.email);

  // 2. Fetch projects
  const projectsRes = await fetch('https://api.vercel.com/v9/projects', {
    headers: { Authorization: `Bearer ${vToken}` }
  });
  const projectsData: any = await projectsRes.json();
  console.log('\nProjects Count:', projectsData.projects?.length);
  if (projectsData.projects) {
    for (const p of projectsData.projects) {
      console.log(`- Project: ${p.name} (ID: ${p.id}, Framework: ${p.framework})`);
    }
  }

  // 3. Fetch deployments
  const depRes = await fetch('https://api.vercel.com/v6/deployments?limit=10', {
    headers: { Authorization: `Bearer ${vToken}` }
  });
  const depData: any = await depRes.json();
  console.log('\nDeployments:');
  if (depData.deployments) {
    for (const d of depData.deployments) {
      console.log(`- ID: ${d.uid}, State: ${d.state || d.readyState}, Name: ${d.name}, URL: https://${d.url}, Created: ${new Date(d.created).toISOString()}, Commit: ${d.meta?.githubCommitSha || d.meta?.commitSha || 'N/A'}`);
    }
  }
}

auditVercel().catch(console.error);
