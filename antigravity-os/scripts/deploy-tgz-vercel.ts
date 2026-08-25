import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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

async function deployTgz() {
  loadEnv();
  const vToken = process.env.VERCEL_TOKEN;
  if (!vToken) throw new Error('No VERCEL_TOKEN');

  const teamSlug = 'sisodhiyaprashant35-6364s-projects';
  const appDir = process.cwd();

  console.log(`Deploying with Vercel CLI using cloud build in ${appDir}...`);

  const child = spawn('npx', ['vercel', 'deploy', '--archive=tgz', '--token', vToken, '--scope', teamSlug, '--prod', '--yes'], {
    cwd: appDir,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  let allOutput = '';

  child.stdout.on('data', (d) => {
    const s = d.toString();
    allOutput += s;
    process.stdout.write(s);
  });

  child.stderr.on('data', (d) => {
    const s = d.toString();
    allOutput += s;
    process.stderr.write(s);
  });

  child.on('close', (code) => {
    console.log(`\nVercel deploy finished with exit code ${code}`);
    const matches = allOutput.match(/https:\/\/[a-zA-Z0-9-]+\.vercel\.app/g);
    if (matches && matches.length > 0) {
      const prodUrl = matches[matches.length - 1];
      console.log(`\n========================================`);
      console.log(`VERCEL PRODUCTION URL: ${prodUrl}`);
      console.log(`========================================`);
      fs.writeFileSync(path.resolve(appDir, 'scripts/deployment-url.txt'), prodUrl);
    }
  });
}

deployTgz().catch(console.error);
