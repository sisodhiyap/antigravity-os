import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (m) {
        let val = (m[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        process.env[m[1]] = val;
      }
    }
  }
}

async function vercelCleanup() {
  console.log('========================================================');
  console.log('PHASE 0 — VERCEL TEST PROJECT CLEANUP');
  console.log('========================================================\n');

  loadEnv();
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN not found in environment');

  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Step 1: Identity Verification
  console.log('--- STEP 1: ACCOUNT IDENTITY VERIFICATION ---');
  const userRes = await fetch('https://api.vercel.com/v2/user', { headers: auth });
  const userData: any = await userRes.json();
  const userId = userData.user?.id;
  const username = userData.user?.username;
  console.log(`Authenticated User: ${username} (${userId})`);
  if (username !== 'sisodhiyaprashant35-6364') {
    throw new Error('VERCEL CLEANUP BLOCKED: Authenticated user does not match expected owner. Aborting.');
  }
  console.log('[PASS] Identity verified: sisodhiyaprashant35-6364');

  const teamsRes = await fetch('https://api.vercel.com/v2/teams', { headers: auth });
  const teamsData: any = await teamsRes.json();
  const team = teamsData.teams?.[0];
  const teamId = team?.id;
  console.log(`Team: ${team?.slug} (${teamId})`);

  const q = teamId ? `?teamId=${teamId}` : '';

  // Step 2: List Projects
  console.log('\n--- STEP 2: LISTING PROJECTS ---');
  const projRes = await fetch(`https://api.vercel.com/v9/projects${q}`, { headers: auth });
  const projData: any = await projRes.json();
  const projects = projData.projects || [];
  console.log(`Total projects: ${projects.length}`);

  const TARGET_PROJECTS = [
    { name: 'antigravity-os-v5', id: 'prj_zdye6tCCjcNRROhH15qQqw6T0ghV' },
    { name: 'antigravity-os', id: 'prj_4drCQ97KJ6E23qxl5P9eK6kfACIB' },
  ];

  const evidenceRecords: any[] = [];
  const unrelated: any[] = [];

  for (const p of projects) {
    const isTarget = TARGET_PROJECTS.some(t => t.id === p.id || t.name === p.name);
    if (isTarget) {
      console.log(`[TARGET] ${p.name} (${p.id})`);
    } else {
      console.log(`[SKIP - NOT TARGET] ${p.name} (${p.id})`);
      unrelated.push(p.name);
    }
  }

  if (unrelated.length > 0) {
    console.log(`\nUnrelated projects (will NOT be touched): ${unrelated.join(', ')}`);
  }

  // Step 3: Delete Each Target Project
  for (const target of TARGET_PROJECTS) {
    const found = projects.find((p: any) => p.id === target.id || p.name === target.name);
    if (!found) {
      console.log(`\n[SKIP] Project '${target.name}' (${target.id}) not found in account — already deleted or does not exist.`);
      evidenceRecords.push({ project: target.name, id: target.id, action: 'NOT_FOUND', status: 'SKIP' });
      continue;
    }

    // Verify Git repository to confirm ownership
    const gitRepo = found.link?.repo;
    const gitOwner = found.link?.org;
    console.log(`\n--- DELETING: ${found.name} (${found.id}) ---`);
    console.log(`Git Repo: ${gitOwner}/${gitRepo}`);

    // Only allow deleting if repo belongs to the authenticated user
    if (gitOwner && gitOwner !== 'sisodhiyap') {
      console.log(`[BLOCKED] Git owner '${gitOwner}' does not match 'sisodhiyap'. Refusing deletion.`);
      evidenceRecords.push({ project: found.name, id: found.id, action: 'BLOCKED', reason: `Git owner mismatch: ${gitOwner}` });
      continue;
    }

    const deleteUrl = `https://api.vercel.com/v9/projects/${found.id}${teamId ? `?teamId=${teamId}` : ''}`;
    const deleteRes = await fetch(deleteUrl, { method: 'DELETE', headers: auth });
    const deleteStatus = deleteRes.status;

    if (deleteStatus === 204 || deleteStatus === 200) {
      console.log(`[PASS] Deleted project: ${found.name} (HTTP ${deleteStatus})`);
      evidenceRecords.push({
        project: found.name, id: found.id, action: 'DELETED', httpStatus: deleteStatus,
        timestamp: new Date().toISOString(), gitRepo: `${gitOwner}/${gitRepo}`
      });
    } else {
      const body = await deleteRes.text();
      console.log(`[FAIL] Could not delete ${found.name}: HTTP ${deleteStatus} — ${body}`);
      evidenceRecords.push({ project: found.name, id: found.id, action: 'FAILED', httpStatus: deleteStatus, error: body });
    }
  }

  // Step 4: Verify Deletion
  console.log('\n--- STEP 4: POST-DELETION VERIFICATION ---');
  const verifyRes = await fetch(`https://api.vercel.com/v9/projects${q}`, { headers: auth });
  const verifyData: any = await verifyRes.json();
  const remaining = verifyData.projects || [];
  const stillPresent = remaining.filter((p: any) => TARGET_PROJECTS.some(t => t.id === p.id));
  
  if (stillPresent.length === 0) {
    console.log('[PASS] All target projects removed from account.');
  } else {
    console.log(`[WARN] ${stillPresent.length} project(s) still present: ${stillPresent.map((p: any) => p.name).join(', ')}`);
  }

  // Step 5: Write Evidence
  const evidenceDir = path.resolve(process.cwd(), 'artifacts/deployment');
  if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

  const evidence = {
    timestamp: new Date().toISOString(),
    authenticatedUser: username,
    userId,
    team: team?.slug,
    teamId,
    targetProjects: TARGET_PROJECTS.map(t => t.name),
    actions: evidenceRecords,
    postDeletionProjectCount: remaining.length,
    remainingTargets: stillPresent.map((p: any) => p.name),
    status: stillPresent.length === 0 ? 'CLEANUP_COMPLETE' : 'PARTIAL_CLEANUP'
  };

  fs.writeFileSync(
    path.join(evidenceDir, 'vercel-test-cleanup.json'),
    JSON.stringify(evidence, null, 2)
  );

  console.log('\n[EVIDENCE] Saved to artifacts/deployment/vercel-test-cleanup.json');
  console.log('\n========================================================');
  console.log(`VERCEL CLEANUP: ${evidence.status}`);
  console.log('GREEN LANE: UNTOUCHED');
  console.log('========================================================');
}

vercelCleanup().catch(err => {
  console.error('VERCEL CLEANUP ERROR:', err.message);
  process.exit(1);
});
