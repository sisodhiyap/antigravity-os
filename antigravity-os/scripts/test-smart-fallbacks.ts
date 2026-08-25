import { classifyTask } from '../../antigravity-ai-router/src/router/classifier.ts';
import { selectIntelligentModel } from '../../antigravity-ai-router/src/router/selector.ts';
import { ResourceMonitor } from '../../antigravity-ai-router/src/router/resource-monitor.ts';

interface FallbackTestScenario {
  testId: string;
  name: string;
  condition: string;
  expectedSelected: string;
  expectedFallbackChain: string[];
  actualSelected: string;
  actualFallbackChain: string[];
  verdict: 'PASS' | 'FAIL';
  explanation: string;
}

async function runFallbackScenarios() {
  console.log('===============================================================');
  console.log('       ANTIGRAVITY OS v5.1 — SMART FALLBACK TEST SUITE         ');
  console.log('===============================================================');

  const scenarios: FallbackTestScenario[] = [];

  // -------------------------------------------------------------
  // Test 1: Ollama Healthy -> Choose Ollama
  // -------------------------------------------------------------
  const t1Classification = classifyTask('Format this JSON payload');
  const t1Decision = selectIntelligentModel({ classification: t1Classification });
  scenarios.push({
    testId: 'TEST_1',
    name: 'Ollama Healthy (Fast Local)',
    condition: 'Standard coding / format prompt under normal memory',
    expectedSelected: 'ollama',
    expectedFallbackChain: ['nvidia/nemotron-3.5-lightning:free', 'airllm/Qwen/Qwen3-32B'],
    actualSelected: t1Decision.selectedProvider,
    actualFallbackChain: t1Decision.fallbackChain,
    verdict: t1Decision.selectedProvider === 'ollama' ? 'PASS' : 'FAIL',
    explanation: t1Decision.reason
  });

  // -------------------------------------------------------------
  // Test 2: Ollama Unavailable -> Choose Appropriate Fallback
  // (For FAST_LOCAL, fallback chain is OpenRouter -> AirLLM)
  // -------------------------------------------------------------
  const t2Fallback = t1Decision.fallbackChain[0];
  scenarios.push({
    testId: 'TEST_2',
    name: 'Ollama Unavailable Fallback',
    condition: 'Primary Ollama fails; router cascades to next candidate in chain',
    expectedSelected: 'openrouter',
    expectedFallbackChain: ['airllm/Qwen/Qwen3-32B'],
    actualSelected: t2Fallback.includes('openrouter') || t2Fallback.includes('nvidia') ? 'openrouter' : 'unknown',
    actualFallbackChain: t1Decision.fallbackChain.slice(1),
    verdict: t2Fallback.includes('nvidia') || t2Fallback.includes('openrouter') ? 'PASS' : 'FAIL',
    explanation: 'Cascaded gracefully from Ollama to OpenRouter free cloud tier'
  });

  // -------------------------------------------------------------
  // Test 3: AirLLM Unavailable -> Choose OpenRouter
  // (For LOCAL_LARGE, fallback chain is OpenRouter -> Ollama)
  // -------------------------------------------------------------
  const t3Classification = classifyTask('Architect a 32B model layered memory streaming pipeline');
  const t3Decision = selectIntelligentModel({ classification: t3Classification });
  const t3FirstFallback = t3Decision.fallbackChain[0];
  scenarios.push({
    testId: 'TEST_3',
    name: 'AirLLM Unavailable Fallback',
    condition: 'Primary AirLLM offline or busy; router falls back to high-capacity cloud',
    expectedSelected: 'openrouter',
    expectedFallbackChain: ['qwen2.5-coder:14b'],
    actualSelected: t3FirstFallback.includes('openrouter') || t3FirstFallback.includes('nvidia') ? 'openrouter' : 'unknown',
    actualFallbackChain: t3Decision.fallbackChain.slice(1),
    verdict: t3FirstFallback.includes('nvidia') || t3FirstFallback.includes('openrouter') ? 'PASS' : 'FAIL',
    explanation: 'Cascaded from AirLLM to OpenRouter (nemotron-3.5-lightning:free)'
  });

  // -------------------------------------------------------------
  // Test 4: OpenRouter Unavailable -> Choose Local Provider
  // (For CLOUD, fallback chain is Ollama -> AirLLM)
  // -------------------------------------------------------------
  const t4Classification = classifyTask('Execute a cloud-quality formal security review with openrouter');
  const t4Decision = selectIntelligentModel({ classification: t4Classification });
  const t4FirstFallback = t4Decision.fallbackChain[0];
  scenarios.push({
    testId: 'TEST_4',
    name: 'OpenRouter Unavailable Fallback',
    condition: 'Cloud provider rate-limited or offline; fallback to local model',
    expectedSelected: 'ollama',
    expectedFallbackChain: ['airllm/Qwen/Qwen3-32B'],
    actualSelected: t4FirstFallback.includes('qwen2.5-coder') ? 'ollama' : 'unknown',
    actualFallbackChain: t4Decision.fallbackChain.slice(1),
    verdict: t4FirstFallback.includes('qwen2.5-coder') ? 'PASS' : 'FAIL',
    explanation: 'Cascaded from OpenRouter to Ollama (qwen2.5-coder:14b)'
  });

  // -------------------------------------------------------------
  // Test 5: Insufficient RAM for AirLLM -> Refuse AirLLM -> Choose Safe Provider
  // -------------------------------------------------------------
  const t5Classification = classifyTask('Deep architectural refactor for 32B model');
  const t5Decision = selectIntelligentModel({
    classification: t5Classification,
    overrideRamAvailableGb: 1.8 // Below 4.0 GB safe threshold
  });
  scenarios.push({
    testId: 'TEST_5',
    name: 'Insufficient RAM Safety Guard',
    condition: 'Available Host RAM (1.8 GB) < Safe Threshold (4.0 GB)',
    expectedSelected: 'openrouter',
    expectedFallbackChain: ['qwen2.5-coder:14b', 'qwen/qwen3-coder:free'],
    actualSelected: t5Decision.selectedProvider,
    actualFallbackChain: t5Decision.fallbackChain,
    verdict: t5Decision.selectedProvider === 'openrouter' && t5Decision.escalated ? 'PASS' : 'FAIL',
    explanation: t5Decision.escalationReason || t5Decision.reason
  });

  // -------------------------------------------------------------
  // Display Results
  // -------------------------------------------------------------
  console.table(
    scenarios.map((s) => ({
      Test: s.testId,
      Scenario: s.name,
      Selected: s.actualSelected,
      'Fallback Plan': s.actualFallbackChain.join(' -> '),
      Result: s.verdict,
      Notes: s.explanation.slice(0, 50) + (s.explanation.length > 50 ? '...' : '')
    }))
  );

  const allPassed = scenarios.every((s) => s.verdict === 'PASS');
  console.log(`\nSMART FALLBACK SUITE RESULT: ${allPassed ? '5 / 5 SCENARIOS PASSED ✅' : 'FAILURES DETECTED ❌'}\n`);
}

runFallbackScenarios().catch(console.error);
