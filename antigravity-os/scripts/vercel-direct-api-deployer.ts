import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

function sha1(buffer: Buffer): string {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

function collectDirectoryFiles(dir: string, baseDir: string): { relativePath: string; absolutePath: string }[] {
  let results: { relativePath: string; absolutePath: string }[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === '.next' || item === '.git' || item.endsWith('.log')) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(collectDirectoryFiles(fullPath, baseDir));
    } else {
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push({ relativePath: rel, absolutePath: fullPath });
    }
  }
  return results;
}

function getEssentialNextJsFiles(appDir: string): { relativePath: string; absolutePath: string }[] {
  const files: { relativePath: string; absolutePath: string }[] = [];

  const topLevel = [
    'package.json',
    'package-lock.json',
    'next.config.ts',
    'next.config.mjs',
    'next.config.js',
    'tsconfig.json',
    'postcss.config.mjs',
    'tailwind.config.ts',
    'components.json'
  ];

  for (const f of topLevel) {
    const full = path.join(appDir, f);
    if (fs.existsSync(full)) {
      files.push({ relativePath: f, absolutePath: full });
    }
  }

  const srcDir = path.join(appDir, 'src');
  if (fs.existsSync(srcDir)) {
    files.push(...collectDirectoryFiles(srcDir, appDir));
  }

  const pubDir = path.join(appDir, 'public');
  if (fs.existsSync(pubDir)) {
    files.push(...collectDirectoryFiles(pubDir, appDir));
  }

  return files;
}

async function deployDirect() {
  loadEnv();
  const vToken = process.env.VERCEL_TOKEN;
  const teamId = 'team_Pzsll6md4ZIm3lPkJx0oPsAs';
  const projectId = 'prj_zdye6tCCjcNRROhH15qQqw6T0ghV';

  if (!vToken) throw new Error('No VERCEL_TOKEN');

  const headers = {
    Authorization: `Bearer ${vToken}`
  };

  const appDir = process.cwd();
  console.log(`Scanning essential Next.js application files in ${appDir}...`);
  const fileEntries = getEssentialNextJsFiles(appDir);
  console.log(`Total Next.js application files to deploy: ${fileEntries.length}`);

  const filesPayload: { file: string; sha: string; size: number }[] = [];
  const uploadQueue: { file: string; sha: string; size: number; content: Buffer }[] = [];

  for (const f of fileEntries) {
    const content = fs.readFileSync(f.absolutePath);
    const hash = sha1(content);
    const item = {
      file: f.relativePath,
      sha: hash,
      size: content.length,
      content
    };
    filesPayload.push({ file: item.file, sha: item.sha, size: item.size });
    uploadQueue.push(item);
  }

  // Upload in parallel chunks of 25
  const CONCURRENCY = 25;
  for (let i = 0; i < uploadQueue.length; i += CONCURRENCY) {
    const chunk = uploadQueue.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (item) => {
        try {
          const uploadRes = await fetch(`https://api.vercel.com/v2/files?teamId=${teamId}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${vToken}`,
              'Content-Type': 'application/octet-stream',
              'x-vercel-digest': item.sha,
              'Content-Length': item.size.toString()
            },
            body: item.content
          });
          if (uploadRes.status !== 200 && uploadRes.status !== 201) {
            const txt = await uploadRes.text();
            console.warn(`File ${item.file} -> HTTP ${uploadRes.status}: ${txt.slice(0, 80)}`);
          }
        } catch (e: any) {
          console.warn(`Error uploading ${item.file}: ${e.message}`);
        }
      })
    );
    console.log(`  Uploaded ${Math.min(i + CONCURRENCY, uploadQueue.length)}/${uploadQueue.length} files...`);
  }

  console.log(`\nCreating Vercel production deployment on project 'antigravity-os-v5' (ID: ${projectId})...`);

  const createDeployRes = await fetch(`https://api.vercel.com/v13/deployments?teamId=${teamId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${vToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'antigravity-os-v5',
      project: projectId,
      target: 'production',
      files: filesPayload,
      projectSettings: {
        framework: 'nextjs',
        buildCommand: 'npm run build',
        devCommand: 'npm run dev',
        outputDirectory: '.next'
      }
    })
  });

  const deployData: any = await createDeployRes.json();
  console.log(`\nVercel Deployment Response (HTTP ${createDeployRes.status}):`, {
    id: deployData.id,
    url: deployData.url,
    readyState: deployData.readyState,
    status: deployData.status,
    error: deployData.error
  });

  if (deployData.id) {
    const deploymentId = deployData.id;
    console.log(`\nWaiting for deployment build completion on Vercel (ID: ${deploymentId})...`);
    let finalState = deployData.readyState;
    let attempts = 0;
    let finalUrl = `https://${deployData.url}`;

    while (finalState !== 'READY' && finalState !== 'ERROR' && finalState !== 'CANCELED' && attempts < 60) {
      await new Promise((r) => setTimeout(r, 4000));
      attempts++;
      const statusRes = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}?teamId=${teamId}`, { headers });
      const statusData: any = await statusRes.json();
      finalState = statusData.readyState;
      if (statusData.url) finalUrl = `https://${statusData.url}`;
      console.log(`  [Poll ${attempts}] State: ${finalState} -> ${finalUrl}`);
      if (finalState === 'READY' || finalState === 'ERROR' || finalState === 'CANCELED') {
        break;
      }
    }

    console.log(`\n============================================================`);
    console.log(`DEPLOYMENT RESULT: ${finalState}`);
    console.log(`PRODUCTION URL: ${finalUrl}`);
    console.log(`DEPLOYMENT ID: ${deploymentId}`);
    console.log(`============================================================`);

    fs.writeFileSync(
      path.resolve(process.cwd(), 'scripts/deployment-url.txt'),
      finalUrl
    );
    fs.writeFileSync(
      path.resolve(process.cwd(), 'scripts/deployment-metadata.json'),
      JSON.stringify({ ...deployData, readyState: finalState, finalUrl }, null, 2)
    );
  }
}

deployDirect().catch(console.error);
