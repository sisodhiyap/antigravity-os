import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SelfHealingEngine,
  HealthWatchdog,
  KnowledgeEngine,
  VisualAccessibilityAudit,
  VectorIndexer
} from '../src/platform/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPlatformTests() {
  console.log('🧪 Starting Antigravity Platform Self-Healing & Learning Test Suite...');
  let passed = 0;
  let failed = 0;

  // Test 1: Self-Healing Engine Traceback Diagnosis
  try {
    const selfHealing = new SelfHealingEngine();
    const mockTraceback = "Error: Cannot find module './missing-file.js'";
    const diagnosis = selfHealing.parseTraceback(mockTraceback);
    
    if (!diagnosis.issues.some((i) => i.includes('Missing dependency'))) {
      throw new Error('SelfHealingEngine failed to identify missing module error');
    }

    console.log('✅ Test 1 Passed: Self-Healing traceback parser verified.');
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 1 Failed: ${e.message}`);
    failed++;
  }

  // Test 2: Health Watchdog Probing
  try {
    const watchdog = new HealthWatchdog();
    const report = await watchdog.runHealthCheck();
    
    if (!report.timestamp || !Array.isArray(report.endpoints)) {
      throw new Error('HealthWatchdog output structure invalid');
    }

    console.log(`✅ Test 2 Passed: Health Watchdog audited ${report.endpoints.length} endpoints.`);
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 2 Failed: ${e.message}`);
    failed++;
  }

  // Test 3: Knowledge Engine Persistence & Retrieval
  try {
    const ke = new KnowledgeEngine();
    const testItem = ke.addKnowledgeItem({
      category: 'bug_fix',
      title: 'Test Verification Entry',
      description: 'Automated test entry for knowledge persistence.',
      solution: 'Ensure json database updates cleanly.',
      tags: ['unit_test', 'knowledge_engine']
    });

    const searched = ke.searchKnowledge('knowledge_engine');
    if (!searched.some((item) => item.id === testItem.id)) {
      throw new Error('KnowledgeEngine failed to search & retrieve newly added item');
    }

    console.log('✅ Test 3 Passed: Knowledge Engine persistence & search verified.');
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 3 Failed: ${e.message}`);
    failed++;
  }

  // Test 4: Visual & WCAG Accessibility Audit
  try {
    const auditEngine = new VisualAccessibilityAudit();
    const dashboardHtml = fs.readFileSync(path.join(__dirname, '../dashboard/index.html'), 'utf-8');
    const report = auditEngine.auditHtmlContent(dashboardHtml);

    if (!report.passed) {
      throw new Error(`VisualAccessibilityAudit flagged critical errors: ${JSON.stringify(report.issues)}`);
    }

    console.log(`✅ Test 4 Passed: Visual & WCAG Audit passed with 0 critical errors (${report.issues.length} minor warnings).`);
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 4 Failed: ${e.message}`);
    failed++;
  }

  // Test 5: Local Vector Indexer & Semantic Search
  try {
    const indexer = new VectorIndexer();
    const count = indexer.indexDirectory(path.join(__dirname, '../src/platform'));
    if (count === 0) {
      throw new Error('VectorIndexer indexed 0 documents');
    }

    const results = indexer.searchCodebase('traceback diagnosis', 3);
    if (results.length === 0) {
      throw new Error('VectorIndexer search returned no results for query');
    }

    console.log(`✅ Test 5 Passed: Vector Indexer indexed ${count} code snippets & returned top matches.`);
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 5 Failed: ${e.message}`);
    failed++;
  }

  console.log(`\n📊 Platform Test Suite Summary: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runPlatformTests();
