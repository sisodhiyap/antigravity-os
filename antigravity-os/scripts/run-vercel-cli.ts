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

async function runCli() {
  loadEnv();
  const vToken = process.env.VERCEL_TOKEN;
  if (!vToken) throw new Error('No VERCEL_TOKEN');

  const cwd = process.cwd();
  console.log(`Executing: npx vercel deploy --prod --yes in ${cwd}`);

  const child = spawn('npx', ['vercel', 'deploy', '--prod', '--yes', '--token', vToken], {
    cwd,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  child.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(data.toString());
  });

  child.on('close', (code) => {
    console.log(`Vercel CLI exited with code ${code}`);
  });
}

runCli().catch(console.error);
