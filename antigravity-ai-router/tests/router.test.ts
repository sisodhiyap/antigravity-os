import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyTask } from '../src/router/classifier.js';
import { selectModel } from '../src/router/selector.js';
import { QuotaManager } from '../src/router/quota-manager.js';
import { validateQuality } from '../src/router/quality-checker.js';
import { FallbackEngine } from '../src/router/fallback-engine.js';
import { RouterMcpServer } from '../src/mcp-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🧪 Starting Antigravity AI Router Test Suite...');
  let passed = 0;
  let failed = 0;

  // Test 1: Classification Test
  try {
    const easyClass = classifyTask('rename variable foo to bar');
    if (easyClass.complexity !== 'EASY') throw new Error(`Expected EASY but got ${easyClass.complexity}`);

    const hardClass = classifyTask('design full microservices architecture and system refactor');
    if (hardClass.complexity !== 'HARD') throw new Error(`Expected HARD but got ${hardClass.complexity}`);

    console.log('✅ Test 1 Passed: Task Classification logic verified.');
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 1 Failed: ${e.message}`);
    failed++;
  }

  // Test 2: Model Selector Test
  try {
    const route = selectModel({ category: 'bug_fix', complexity: 'MEDIUM', recommendedType: 'local', reason: 'test' });
    if (route.modelId !== 'qwen2.5-coder:14b') throw new Error(`Expected qwen2.5-coder:14b but got ${route.modelId}`);
    if (!route.fallbackChain.includes('omniroute/free-coder')) throw new Error('Missing OmniRoute fallback in chain');

    console.log('✅ Test 2 Passed: Model Selector & Fallback Chain verified.');
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 2 Failed: ${e.message}`);
    failed++;
  }

  // Test 3: Quota Manager Test
  try {
    const qm = new QuotaManager();
    qm.recordRequest('ollama', 150, 20, true);
    const stats = qm.getProviderStats('ollama');
    if (!stats || stats.requests !== 1) throw new Error('Quota tracking failed');

    console.log('✅ Test 3 Passed: Quota Manager & Telemetry tracking verified.');
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 3 Failed: ${e.message}`);
    failed++;
  }

  // Test 4: Quality Validation & Repair Check
  try {
    const badCode = validateQuality('{ function test() { ');
    if (badCode.valid !== false) throw new Error('Failed to flag mismatched braces');

    const goodCode = validateQuality('function add(a: number, b: number): number { return a + b; }');
    if (goodCode.valid !== true) throw new Error('Flagged valid code as bad');

    console.log('✅ Test 4 Passed: Code Quality Verification verified.');
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 4 Failed: ${e.message}`);
    failed++;
  }

  // Test 5: MCP Tool Call Handler
  try {
    const qm = new QuotaManager();
    const fe = new FallbackEngine(qm);
    const mcp = new RouterMcpServer(qm, fe);
    const listRes = mcp.handleToolCall('model.list', {});
    if (!listRes.models || listRes.models.length === 0) throw new Error('MCP model.list returned empty');

    console.log('✅ Test 5 Passed: MCP Server Tool Interface verified.');
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 5 Failed: ${e.message}`);
    failed++;
  }

  // Test 6: Puter.js Integration & Security Audit
  try {
    const dashboardPath = path.join(__dirname, '../dashboard/index.html');
    const htmlContent = fs.readFileSync(dashboardPath, 'utf-8');

    if (!htmlContent.includes('https://js.puter.com/v2/')) {
      throw new Error('Puter.js SDK script tag missing from dashboard/index.html');
    }
    if (!htmlContent.includes('puter.ai.chat')) {
      throw new Error('puter.ai.chat API invocation missing from dashboard/index.html');
    }
    if (!htmlContent.includes('const MODELS = {')) {
      throw new Error('Configurable MODELS dictionary missing');
    }
    if (!htmlContent.includes('async function askAI')) {
      throw new Error('Reusable askAI service function missing');
    }
    if (htmlContent.includes('document.write(')) {
      throw new Error('Forbidden document.write found in dashboard/index.html');
    }
    if (htmlContent.includes('API_KEY') || htmlContent.includes('SECRET_KEY')) {
      throw new Error('Exposed API key string detected in frontend HTML');
    }

    console.log('✅ Test 6 Passed: Puter.js SDK, askAI service & DOM security audit verified.');
    passed++;
  } catch (e: any) {
    console.error(`❌ Test 6 Failed: ${e.message}`);
    failed++;
  }

  console.log(`\n📊 Test Suite Summary: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
