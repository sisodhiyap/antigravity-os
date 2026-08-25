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

async function deployAntigravity() {
  loadEnv();
  const vToken = process.env.VERCEL_TOKEN;
  if (!vToken) {
    console.error('No VERCEL_TOKEN');
    return;
  }

  const teamSlug = 'sisodhiyaprashant35-6364s-projects';
  const appDir = process.cwd(); // c:\D drive\Antigravity\antigravity-os

  console.log(`Starting Vercel Production Deployment for Antigravity OS v5.1...`);
  console.log(`Target Directory: ${appDir}`);
  console.log(`Team: ${teamSlug}`);

  try {
    // Deploy via Vercel CLI
    const deployCmd = `npx -y vercel --token "${vToken}" --scope "${teamSlug}" --prod --yes --cwd "${appDir}"`;
    console.log(`Executing Vercel deploy...`);
    const output = execSync(deployCmd, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 300000
    });

    console.log(`Deployment output:\n${output}`);
    
    // Extract deployed URL
    const lines = output.trim().split('\n');
    const prodUrl = lines[lines.length - 1].trim();
    console.log(`\n========================================`);
    console.log(`PRODUCTION URL: ${prodUrl}`);
    console.log(`========================================`);

    fs.writeFileSync(
      path.resolve(process.cwd(), 'scripts/deployment-url.txt'),
      prodUrl
    );
  } catch (err: any) {
    console.error('Deployment Failed:', err.stderr || err.stdout || err.message);
  }
}

deployAntigravity().catch(console.error);
