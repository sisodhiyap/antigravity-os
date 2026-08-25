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

async function checkGitLink() {
  loadEnv();
  const vToken = process.env.VERCEL_TOKEN;
  const teamId = 'team_Pzsll6md4ZIm3lPkJx0oPsAs';
  const projectId = 'prj_zdye6tCCjcNRROhH15qQqw6T0ghV';

  const headers = {
    Authorization: `Bearer ${vToken}`,
    'Content-Type': 'application/json'
  };

  // Inspect project
  const pRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}?teamId=${teamId}`, { headers });
  const pData: any = await pRes.json();
  console.log(`Project Details:`, {
    id: pData.id,
    name: pData.name,
    framework: pData.framework,
    targets: pData.targets,
    link: pData.link
  });
}

checkGitLink().catch(console.error);
