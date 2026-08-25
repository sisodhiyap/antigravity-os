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

async function deployPrebuilt() {
  loadEnv();
  const vToken = process.env.VERCEL_TOKEN;
  if (!vToken) throw new Error('No VERCEL_TOKEN');

  const teamSlug = 'sisodhiyaprashant35-6364s-projects';
  const appDir = process.cwd();

  console.log('Step 1: Building project for Vercel (.vercel/output)...');
  try {
    const buildOut = execSync(`npx vercel build --prod --token "${vToken}" --scope "${teamSlug}" --yes`, {
      cwd: appDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 180000
    });
    console.log('Vercel Build Output:\n', buildOut);
  } catch (err: any) {
    console.warn('Vercel Build Info:', err.stdout || err.stderr || err.message);
  }

  console.log('\nStep 2: Deploying prebuilt artifact to Vercel production...');
  try {
    const deployOut = execSync(`npx vercel deploy --prebuilt --prod --token "${vToken}" --scope "${teamSlug}" --yes`, {
      cwd: appDir,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 180000
    });
    console.log('Vercel Deploy Output:\n', deployOut);

    const lines = deployOut.trim().split('\n');
    const prodUrl = lines[lines.length - 1].trim();
    console.log(`\n============================================================`);
    console.log(`PRODUCTION URL: ${prodUrl}`);
    console.log(`============================================================`);

    fs.writeFileSync(path.resolve(process.cwd(), 'scripts/deployment-url.txt'), prodUrl);
  } catch (err: any) {
    console.error('Vercel Deploy Error:', err.stderr || err.stdout || err.message);
  }
}

deployPrebuilt().catch(console.error);
