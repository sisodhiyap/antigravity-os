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

async function runVercelRemediation() {
  loadEnv();
  const vToken = process.env.VERCEL_TOKEN;
  if (!vToken) {
    console.error('VERCEL AUTHORIZATION INSUFFICIENT: No VERCEL_TOKEN found.');
    return;
  }

  const headers = {
    Authorization: `Bearer ${vToken}`,
    'Content-Type': 'application/json'
  };

  // 1. Inspect User
  const userRes = await fetch('https://api.vercel.com/v2/user', { headers });
  const userData: any = await userRes.json();
  console.log(`Authenticated Vercel User: ${userData.user?.username || userData.user?.email || 'N/A'} (ID: ${userData.user?.id})`);

  // 2. Inspect Teams
  const teamsRes = await fetch('https://api.vercel.com/v2/teams', { headers });
  const teamsData: any = await teamsRes.json();
  const team = teamsData.teams?.[0];
  const teamId = team?.id;
  const teamSlug = team?.slug;
  console.log(`Team: ${teamSlug} (${teamId || 'Personal Account'})`);

  const queryParam = teamId ? `?teamId=${teamId}` : '';

  // 3. Create or Fetch Standalone Vercel Project
  console.log(`\nCreating Standalone Vercel Project 'antigravity-os-v5'...`);
  let projectRes = await fetch(`https://api.vercel.com/v9/projects/antigravity-os-v5${queryParam}`, { headers });
  let projectData: any = null;

  if (projectRes.status === 200) {
    projectData = await projectRes.json();
    console.log(`Project 'antigravity-os-v5' already exists (ID: ${projectData.id})`);
  } else {
    // Create new project without gitRepository restriction
    const createRes = await fetch(`https://api.vercel.com/v9/projects${queryParam}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'antigravity-os-v5',
        framework: 'nextjs',
        buildCommand: 'npm run build',
        devCommand: 'npm run dev',
        outputDirectory: '.next'
      })
    });
    projectData = await createRes.json();
    console.log(`Project Creation Response (HTTP ${createRes.status}):`, {
      id: projectData.id,
      name: projectData.name,
      framework: projectData.framework,
      error: projectData.error
    });
  }

  if (!projectData.id) {
    console.error('Failed to create project on Vercel:', projectData);
    return;
  }

  const projectId = projectData.id;
  console.log(`Vercel Project Verified: ${projectData.name} (${projectId})`);

  // 4. Configure Production Environment Variables on Vercel
  console.log('\nConfiguring Production Environment Variables on Vercel...');
  const envVars = [
    { key: 'NODE_ENV', value: 'production', type: 'plain', target: ['production', 'preview', 'development'] },
    { key: 'NEXT_PUBLIC_APP_NAME', value: 'Antigravity OS', type: 'plain', target: ['production', 'preview'] },
    { key: 'NEXT_PUBLIC_APP_VERSION', value: 'v5.1', type: 'plain', target: ['production', 'preview'] }
  ];

  for (const ev of envVars) {
    const evRes = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env${queryParam}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ev)
    });
    const evData = await evRes.json();
    console.log(`  Env Var ${ev.key}: HTTP ${evRes.status} (${evData.key || evData.error?.message || 'OK'})`);
  }
}

runVercelRemediation().catch(console.error);
