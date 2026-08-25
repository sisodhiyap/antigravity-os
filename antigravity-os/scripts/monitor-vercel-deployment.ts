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

async function monitorDeployment() {
  loadEnv();
  const vToken = process.env.VERCEL_TOKEN;
  const teamId = 'team_Pzsll6md4ZIm3lPkJx0oPsAs';
  const projectId = 'prj_zdye6tCCjcNRROhH15qQqw6T0ghV';

  const headers = {
    Authorization: `Bearer ${vToken}`,
    'Content-Type': 'application/json'
  };

  const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&teamId=${teamId}`, { headers });
  const data: any = await res.json();
  console.log(`Total Deployments found for antigravity-os-v5: ${data.deployments?.length || 0}`);
  if (data.deployments && data.deployments.length > 0) {
    const latest = data.deployments[0];
    console.log(`Latest Deployment:`);
    console.log(`  ID: ${latest.uid}`);
    console.log(`  Name: ${latest.name}`);
    console.log(`  URL: https://${latest.url}`);
    console.log(`  State: ${latest.state}`);
    console.log(`  Ready State: ${latest.readyState}`);
    console.log(`  Created At: ${new Date(latest.created).toISOString()}`);
    console.log(`  Target: ${latest.target}`);
    return latest;
  }
  return null;
}

monitorDeployment().catch(console.error);
