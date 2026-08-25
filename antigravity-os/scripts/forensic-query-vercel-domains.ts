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

async function queryVercelDeep() {
  loadEnv();
  const vToken = process.env.VERCEL_TOKEN;
  console.log('VERCEL_TOKEN:', vToken ? 'PRESENT' : 'MISSING');
  if (!vToken) return;

  const headers = { Authorization: `Bearer ${vToken}` };

  // 1. Teams
  try {
    const teamsRes = await fetch('https://api.vercel.com/v2/teams', { headers });
    const teamsData: any = await teamsRes.json();
    console.log('\n--- Teams ---');
    console.log(JSON.stringify(teamsData, null, 2));

    const teams = teamsData.teams || [];
    for (const team of teams) {
      console.log(`\nQuerying for team ${team.slug} (${team.id})...`);
      const teamHeaders = { Authorization: `Bearer ${vToken}`, 'x-vercel-team-id': team.id };

      const tProjRes = await fetch(`https://api.vercel.com/v9/projects?teamId=${team.id}`, { headers });
      const tProjData: any = await tProjRes.json();
      console.log(`Projects in team ${team.slug}:`, JSON.stringify(tProjData, null, 2));

      const tDepRes = await fetch(`https://api.vercel.com/v6/deployments?teamId=${team.id}&limit=20`, { headers });
      const tDepData: any = await tDepRes.json();
      console.log(`Deployments in team ${team.slug}:`, JSON.stringify(tDepData, null, 2));
    }
  } catch (e: any) {
    console.error('Teams query error:', e.message);
  }

  // 2. Query Alias: antigravity-os.vercel.app
  try {
    const aliasRes = await fetch('https://api.vercel.com/v2/aliases?limit=20', { headers });
    const aliasData: any = await aliasRes.json();
    console.log('\n--- User Aliases ---');
    console.log(JSON.stringify(aliasData, null, 2));
  } catch (e: any) {
    console.error('Alias query error:', e.message);
  }

  // 3. Query Deployments for user
  try {
    const depRes = await fetch('https://api.vercel.com/v6/deployments?limit=20', { headers });
    const depData: any = await depRes.json();
    console.log('\n--- User Deployments ---');
    console.log(JSON.stringify(depData, null, 2));
  } catch (e: any) {
    console.error('Deployments query error:', e.message);
  }
}

queryVercelDeep().catch(console.error);
