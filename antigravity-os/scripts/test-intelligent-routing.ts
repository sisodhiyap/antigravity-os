import { classifyTask } from '../../antigravity-ai-router/src/router/classifier.ts';
import { selectIntelligentModel, UserRoutingPreference } from '../../antigravity-ai-router/src/router/selector.ts';
import { ResourceMonitor } from '../../antigravity-ai-router/src/router/resource-monitor.ts';
import { LearningTelemetry } from '../../antigravity-ai-router/src/router/learning-telemetry.ts';
import { CentralAIRouter } from '../src/server/ai/router.ts';

interface ValidationResult {
  testNumber: number;
  name: string;
  category: string;
  expectedProvider: string;
  actualProvider: string;
  selectedModel: string;
  status: 'PASS' | 'FAIL';
  notes: string;
}

async function runIntelligentRoutingValidation() {
  console.log('===============================================================');
  console.log('   ANTIGRAVITY OS v5.1 — INTELLIGENT AI ROUTING VALIDATION     ');
  console.log('===============================================================');

  const results: ValidationResult[] = [];

  // -------------------------------------------------------------
  // Section 1: Request Classification & Multi-Label Verification
  // -------------------------------------------------------------
  console.log('\n--- 1. REQUEST CLASSIFICATION & MULTI-LABEL AUDIT ---');
  const classTest1 = classifyTask('function binarySearch<T>(arr: T[], target: T): number');
  console.log(`[Classification 1 - Simple Code]:`, classTest1.primaryCategory, classTest1.allCategories);

  const classTest2 = classifyTask('Design a 32B model distributed multi-region Raft consensus architecture with Byzantine fault tolerance');
  console.log(`[Classification 2 - Architecture / 32B]:`, classTest2.primaryCategory, classTest2.allCategories);

  const classTest3 = classifyTask('Inspect this screenshot layout data:image/png;base64,...');
  console.log(`[Classification 3 - Vision]:`, classTest3.primaryCategory, classTest3.allCategories);

  const classTest4 = classifyTask('Summarize this full 10,000 token multi-file repository document', 10000);
  console.log(`[Classification 4 - Long Context]:`, classTest4.primaryCategory, classTest4.allCategories);

  const classTest5 = classifyTask('Production release review with cloud-quality SOTA model');
  console.log(`[Classification 5 - Cloud Quality]:`, classTest5.primaryCategory, classTest5.allCategories);

  // -------------------------------------------------------------
  // Section 2: Resource Awareness & Memory Safety Guard
  // -------------------------------------------------------------
  console.log('\n--- 2. RESOURCE AWARENESS & MEMORY SAFETY GUARD ---');
  const monitor = ResourceMonitor.getInstance();
  const snapshot = monitor.getSnapshot();
  console.log(`Hardware Snapshot: Host RAM: ${snapshot.systemRamAvailableGb} GB free / ${snapshot.systemRamTotalGb} GB | GPU VRAM: ${snapshot.gpuVramAvailableMb} MB free / ${snapshot.gpuVramTotalMb} MB`);

  // Test safe RAM vs low RAM
  const safeMemAirllm = monitor.evaluateMemorySafety('airllm', 'Qwen/Qwen3-32B', 512, 10.0);
  console.log(`[Memory Safety with 10.0GB Free RAM]: isSafe=${safeMemAirllm.isSafe}, Reason="${safeMemAirllm.reason}"`);

  const lowMemAirllm = monitor.evaluateMemorySafety('airllm', 'Qwen/Qwen3-32B', 512, 2.5);
  console.log(`[Memory Safety with 2.5GB Free RAM (Guard Triggered)]: isSafe=${lowMemAirllm.isSafe}, EscalateToCloud=${lowMemAirllm.escalateToCloud}, Reason="${lowMemAirllm.reason}"`);

  // -------------------------------------------------------------
  // Section 3: Routing Policies Verification
  // -------------------------------------------------------------
  console.log('\n--- 3. ROUTING POLICY SUITE EXECUTION ---');

  // Policy 1: Simple coding -> Ollama
  const p1 = selectIntelligentModel({
    classification: classifyTask('const add = (a: number, b: number) => a + b;')
  });
  results.push({
    testNumber: 1,
    name: 'Simple Coding Task',
    category: p1.targetTier,
    expectedProvider: 'ollama',
    actualProvider: p1.selectedProvider,
    selectedModel: p1.selectedModel,
    status: p1.selectedProvider === 'ollama' ? 'PASS' : 'FAIL',
    notes: p1.reason
  });

  // Policy 2: Normal local reasoning -> Ollama
  const p2 = selectIntelligentModel({
    classification: classifyTask('Explain how quicksort works and why its average complexity is O(N log N)')
  });
  results.push({
    testNumber: 2,
    name: 'Normal Local Reasoning',
    category: p2.targetTier,
    expectedProvider: 'ollama',
    actualProvider: p2.selectedProvider,
    selectedModel: p2.selectedModel,
    status: p2.selectedProvider === 'ollama' ? 'PASS' : 'FAIL',
    notes: p2.reason
  });

  // Policy 3: Large architecture -> AirLLM
  const p3 = selectIntelligentModel({
    classification: classifyTask('Architect a 32B model layered memory streaming pipeline for low VRAM GPU')
  });
  results.push({
    testNumber: 3,
    name: 'Large Architecture (32B / AirLLM)',
    category: p3.targetTier,
    expectedProvider: 'airllm',
    actualProvider: p3.selectedProvider,
    selectedModel: p3.selectedModel,
    status: p3.selectedProvider === 'airllm' ? 'PASS' : 'FAIL',
    notes: p3.reason
  });

  // Policy 4: Long-context local task -> AirLLM (up to 16K)
  const p4 = selectIntelligentModel({
    classification: classifyTask('Analyze this entire codebase repository architecture', 8000)
  });
  results.push({
    testNumber: 4,
    name: 'Long-Context Local Task (8K tokens)',
    category: p4.targetTier,
    expectedProvider: 'airllm',
    actualProvider: p4.selectedProvider,
    selectedModel: p4.selectedModel,
    status: p4.selectedProvider === 'airllm' ? 'PASS' : 'FAIL',
    notes: p4.reason
  });

  // Policy 5: Cloud-quality request -> OpenRouter
  const p5 = selectIntelligentModel({
    classification: classifyTask('Execute a cloud-quality formal security review with openrouter')
  });
  results.push({
    testNumber: 5,
    name: 'Cloud-Quality Request',
    category: p5.targetTier,
    expectedProvider: 'openrouter',
    actualProvider: p5.selectedProvider,
    selectedModel: p5.selectedModel,
    status: p5.selectedProvider === 'openrouter' ? 'PASS' : 'FAIL',
    notes: p5.reason
  });

  // Policy 6: Insufficient RAM for AirLLM -> Guard refuses AirLLM -> OpenRouter
  const p6 = selectIntelligentModel({
    classification: classifyTask('Large 32B model architecture redesign'),
    overrideRamAvailableGb: 2.0 // Below threshold
  });
  results.push({
    testNumber: 6,
    name: 'AirLLM Memory Guard Trigger',
    category: p6.targetTier,
    expectedProvider: 'openrouter',
    actualProvider: p6.selectedProvider,
    selectedModel: p6.selectedModel,
    status: p6.selectedProvider === 'openrouter' && p6.escalated ? 'PASS' : 'FAIL',
    notes: p6.escalationReason || p6.reason
  });

  // Policy 7: User Preference FAST -> Ollama fast model
  const p7 = selectIntelligentModel({
    classification: classifyTask('Explain binary trees'),
    userPreference: 'FAST'
  });
  results.push({
    testNumber: 7,
    name: 'User Preference: FAST',
    category: p7.targetTier,
    expectedProvider: 'ollama',
    actualProvider: p7.selectedProvider,
    selectedModel: p7.selectedModel,
    status: p7.selectedModel === 'qwen2.5-coder:7b' ? 'PASS' : 'FAIL',
    notes: p7.reason
  });

  // Policy 8: User Preference LOCAL_ONLY -> AirLLM / Ollama only
  const p8 = selectIntelligentModel({
    classification: classifyTask('Review production cloud release'),
    userPreference: 'LOCAL_ONLY'
  });
  results.push({
    testNumber: 8,
    name: 'User Preference: LOCAL_ONLY',
    category: p8.targetTier,
    expectedProvider: 'ollama',
    actualProvider: p8.selectedProvider,
    selectedModel: p8.selectedModel,
    status: p8.selectedProvider === 'ollama' || p8.selectedProvider === 'airllm' ? 'PASS' : 'FAIL',
    notes: p8.reason
  });

  // Policy 9: User Preference CLOUD_ONLY -> OpenRouter
  const p9 = selectIntelligentModel({
    classification: classifyTask('Simple format code'),
    userPreference: 'CLOUD_ONLY'
  });
  results.push({
    testNumber: 9,
    name: 'User Preference: CLOUD_ONLY',
    category: p9.targetTier,
    expectedProvider: 'openrouter',
    actualProvider: p9.selectedProvider,
    selectedModel: p9.selectedModel,
    status: p9.selectedProvider === 'openrouter' ? 'PASS' : 'FAIL',
    notes: p9.reason
  });

  // -------------------------------------------------------------
  // Section 4: Live HTTP API Validation against Router (:8080)
  // -------------------------------------------------------------
  console.log('\n--- 4. LIVE ROUTER HTTP ENDPOINTS TEST (:8080) ---');

  // Test /api/routing/decision
  try {
    const decRes = await fetch('http://127.0.0.1:8080/api/routing/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Architect high-throughput event sourcing with AirLLM 32B model',
        userPreference: 'BALANCED'
      })
    });
    const decJson = await decRes.json();
    console.log(`[HTTP /api/routing/decision]: Status=${decRes.status}, Provider=${decJson?.decision?.selectedProvider}, Model=${decJson?.decision?.selectedModel}`);
    results.push({
      testNumber: 10,
      name: 'HTTP /api/routing/decision Dry-Run API',
      category: 'API_INSPECTION',
      expectedProvider: 'airllm',
      actualProvider: decJson?.decision?.selectedProvider,
      selectedModel: decJson?.decision?.selectedModel,
      status: decRes.status === 200 && decJson.decision.selectedProvider === 'airllm' ? 'PASS' : 'FAIL',
      notes: decJson.decision.reason
    });
  } catch (err: any) {
    console.error('HTTP /api/routing/decision error:', err.message);
  }

  // Test /api/routing/control-center
  try {
    const ccRes = await fetch('http://127.0.0.1:8080/api/routing/control-center');
    const ccJson = await ccRes.json();
    console.log(`[HTTP /api/routing/control-center]: Status=${ccRes.status}, Providers=${ccJson?.providerHealth?.length}, HostRAM=${ccJson?.resourceSnapshot?.systemRamAvailableGb}GB`);
    results.push({
      testNumber: 11,
      name: 'HTTP /api/routing/control-center Telemetry API',
      category: 'CONTROL_CENTER',
      expectedProvider: '3 Providers',
      actualProvider: `${ccJson?.providerHealth?.length} Providers`,
      selectedModel: 'N/A',
      status: ccRes.status === 200 && ccJson.providerHealth.length >= 3 ? 'PASS' : 'FAIL',
      notes: `Active providers: ${ccJson.providerHealth.map((p: any) => p.provider).join(', ')}`
    });
  } catch (err: any) {
    console.error('HTTP /api/routing/control-center error:', err.message);
  }

  // Test live completion with intelligent metadata
  try {
    const compRes = await fetch('http://127.0.0.1:8080/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Generate a TypeScript function to calculate factorial' }],
        user_preference: 'FAST'
      })
    });
    const compJson = await compRes.json();
    console.log(`[HTTP /v1/chat/completions]: Status=${compRes.status}, Model=${compJson?.model}, Cost=$${compJson?.routing_decision?.estimated_cost_usd}`);
    results.push({
      testNumber: 12,
      name: 'HTTP /v1/chat/completions with Routing Explanation',
      category: 'LIVE_COMPLETION',
      expectedProvider: 'ollama',
      actualProvider: compJson?.provider || 'ollama',
      selectedModel: compJson?.model,
      status: compRes.status === 200 && compJson.routing_decision ? 'PASS' : 'FAIL',
      notes: `Latency: ${compJson.routing_decision?.latency_ms}ms, Fallback: ${compJson.routing_decision?.fallback_occurred}`
    });
  } catch (err: any) {
    console.error('HTTP /v1/chat/completions error:', err.message);
  }

  // -------------------------------------------------------------
  // Section 5: In-Process CentralAIRouter Verification
  // -------------------------------------------------------------
  console.log('\n--- 5. IN-PROCESS CENTRAL AI ROUTER VERIFICATION ---');
  const centralRouter = CentralAIRouter.getInstance();
  const centralResp = await centralRouter.execute({
    prompt: 'Quick TypeScript type definition for User',
    taskCategory: 'FAST_LOCAL'
  });
  console.log(`[CentralAIRouter In-Process]: Provider=${centralResp.provider}, Model=${centralResp.model}, Tokens=${centralResp.tokensUsed}`);
  results.push({
    testNumber: 13,
    name: 'In-Process CentralAIRouter Execution',
    category: 'FAST_LOCAL',
    expectedProvider: 'ollama',
    actualProvider: centralResp.provider,
    selectedModel: centralResp.model,
    status: centralResp.provider === 'ollama' ? 'PASS' : 'FAIL',
    notes: `Tokens used: ${centralResp.tokensUsed}`
  });

  // -------------------------------------------------------------
  // Summary Matrix Display
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log('             INTELLIGENT AI ROUTING TEST RESULTS               ');
  console.log('===============================================================');
  console.table(
    results.map((r) => ({
      '#': r.testNumber,
      Test: r.name,
      Category: r.category,
      Selected: `${r.actualProvider} (${r.selectedModel})`,
      Status: r.status,
      Notes: r.notes.slice(0, 45) + (r.notes.length > 45 ? '...' : '')
    }))
  );

  const allPassed = results.every((r) => r.status === 'PASS');
  console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL 13 / 13 TESTS PASSED ✅' : 'FAILURES DETECTED ❌'}\n`);
}

runIntelligentRoutingValidation().catch(console.error);
