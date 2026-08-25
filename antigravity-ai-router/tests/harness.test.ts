/**
 * Antigravity Production-Grade Adaptive Harness - Master 20-Test Verification Suite (Tests A through T)
 */

import { taskClassifier } from '../src/harness/task-classifier.js';
import { CreditGovernor } from '../src/harness/credit-governor.js';
import { modelRouter } from '../src/harness/model-router.js';
import { modelRegistry } from '../src/harness/model-registry.js';
import { reviewPolicyManager } from '../src/harness/review-policy.js';
import { retryIntelligence } from '../src/harness/retry-intelligence.js';
import { contextOptimizer } from '../src/harness/context-optimizer.js';
import { structuredHandoffManager } from '../src/harness/structured-handoff.js';
import { antiLoopGuard } from '../src/harness/anti-loop.js';
import { qualityVsCostEngine } from '../src/harness/quality-vs-cost.js';
import { toolCallOptimizer } from '../src/harness/tool-optimizer.js';
import { permissionModelManager } from '../src/harness/permission-model.js';
import { AntigravityHarness } from '../src/harness/harness-orchestrator.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    failed++;
  }
}

async function runMasterSuite() {
  console.log('=== STARTING ANTIGRAVITY HARNESS 20-TEST MASTER VERIFICATION SUITE (A - T) ===\n');

  // Test A — Solo First: Simple task uses exactly 1 agent
  {
    const profile = taskClassifier.classify('Fix typo in CSS button padding');
    const governor = new CreditGovernor(profile);
    assert(profile.complexity <= 3, 'Test A.1: Simple task classified as low complexity');
    assert(profile.recommendedMode === 'solo', 'Test A.2: Mode is SOLO');
    assert(governor.getBudget().maxAgents === 1, 'Test A.3: Budget strictly allocates 1 agent');
  }

  // Test B — Complex But Solo-Suitable: High complexity without multi-branch decomposition executes Solo
  {
    const profile = taskClassifier.classify('Write a complex mathematical proof and matrix multiplication in TypeScript');
    assert(profile.complexity >= 5, 'Test B.1: Complexity is elevated');
    assert(!profile.parallelizable, 'Test B.2: Not parallelizable');
  }

  // Test C — Genuine Decomposition: Multi-branch research/architecture uses Supervisor/Parallel
  {
    const profile = taskClassifier.classify('Design a multi-tenant microservices architecture with distributed consensus and database schema migration');
    assert(profile.complexity >= 8, 'Test C.1: Multi-faceted architecture complexity >= 8');
    assert(profile.recommendedMode === 'supervisor', 'Test C.2: Supervisor mode activated for multi-specialist scope');
  }

  // Test D — ROI Reject: Low value / low risk task rejects additional agent
  {
    const profile = taskClassifier.classify('Format JSON string');
    const governor = new CreditGovernor(profile);
    const evalRes = qualityVsCostEngine.evaluateAgentSpawn('security', 'Check JSON string', profile, governor);
    assert(!evalRes.shouldSpawn, 'Test D.1: Additional agent rejected due to low ROI');
    assert(!evalRes.decision.spawned, 'Test D.2: Machine-readable spawnDecision records false');
  }

  // Test E — ROI Accept: Critical security task accepts specialized reviewer
  {
    const profile = taskClassifier.classify('Deploy payment authorization route and update private crypto keys in production database');
    const governor = new CreditGovernor(profile);
    const evalRes = qualityVsCostEngine.evaluateAgentSpawn('security', 'Audit Auth Secrets', profile, governor);
    assert(evalRes.shouldSpawn, 'Test E.1: Security specialist accepted due to high failure cost ROI');
    assert(evalRes.decision.spawned === true, 'Test E.2: Spawn decision confirmed');
  }

  // Test F — Premium Rejection: Normal task rejects premium model
  {
    const profile = taskClassifier.classify('Implement a binary search function');
    const governor = new CreditGovernor(profile);
    const routing = modelRouter.route(profile, governor);
    assert(routing.tier === 'cheap', 'Test F.1: Cheap tier selected for standard algorithm');
    assert(!routing.isEscalated, 'Test F.2: Premium escalation rejected');
  }

  // Test G — Premium Escalation: Critical risk + high complexity escalates to Premium
  {
    const profile = taskClassifier.classify('Production zero-knowledge cryptography authentication architecture with critical security risk');
    const governor = new CreditGovernor(profile);
    const routing = modelRouter.route(profile, governor);
    assert(routing.tier === 'premium', 'Test G.1: Premium tier escalated for critical architecture');
    assert(routing.isEscalated === true, 'Test G.2: Escalation flag set');
  }

  // Test H — Budget Yellow: Disables optional review
  {
    const profile = taskClassifier.classify('Update database schema');
    const governor = new CreditGovernor(profile);
    // Simulate 65% token usage -> YELLOW
    governor.contextTokensUsed = Math.floor(governor.getBudget().maxContextTokens * 0.65);
    assert(governor.getBudgetState() === 'YELLOW', 'Test H.1: Budget State is YELLOW');
    assert(!governor.canReview(), 'Test H.2: Optional reviews disabled under YELLOW state');
  }

  // Test I — Budget Orange: Prohibits new parallel agents and forces cheap model
  {
    const profile = taskClassifier.classify('Complex API build');
    const governor = new CreditGovernor(profile);
    // Simulate 85% usage -> ORANGE
    governor.contextTokensUsed = Math.floor(governor.getBudget().maxContextTokens * 0.85);
    assert(governor.getBudgetState() === 'ORANGE', 'Test I.1: Budget State is ORANGE');
    const routing = modelRouter.route(profile, governor);
    assert(routing.tier === 'cheap', 'Test I.2: Forced to cheap tier in ORANGE state');
  }

  // Test J — Budget Red: Hard stop prevents all new agents
  {
    const profile = taskClassifier.classify('Task under pressure');
    const governor = new CreditGovernor(profile);
    governor.contextTokensUsed = Math.floor(governor.getBudget().maxContextTokens * 0.98);
    assert(governor.getBudgetState() === 'RED', 'Test J.1: Budget State is RED');
    const check = governor.canSpawnAgent('researcher', 'Extra');
    assert(!check.allowed, 'Test J.2: Agent spawning strictly blocked under RED state');
  }

  // Test K — Context Overflow: Context compression occurs
  {
    const longTask = 'x'.repeat(150000);
    const context = contextOptimizer.buildAgentContext({
      task: longTask,
      objective: 'Solve problem',
      relevantMemory: ['Fact 1', 'Fact 2', 'Fact 3', 'Fact 4'],
      maxTokens: 5000
    });
    assert(context.tokenEstimate <= 5000, 'Test K.1: Context compressed within budget');
    assert(context.relevantMemory.length <= 3, 'Test K.2: Memory items compressed');
  }

  // Test L — Duplicate Tool Call: Second identical safe read uses cache
  {
    const governor = new CreditGovernor(taskClassifier.classify('Test tool cache'));
    let executedCount = 0;
    const fakeReader = async () => {
      executedCount++;
      return 'File Content Test';
    };

    const res1 = await toolCallOptimizer.executeOptimizedToolCall('view_file', { AbsolutePath: '/test.ts' }, governor, fakeReader);
    const res2 = await toolCallOptimizer.executeOptimizedToolCall('view_file', { AbsolutePath: '/test.ts' }, governor, fakeReader);

    assert(res1 === 'File Content Test' && res2 === 'File Content Test', 'Test L.1: Tool results match');
    assert(executedCount === 1, 'Test L.2: Execution occurred only once (second call cached)');
    assert(governor.toolCallsDeduplicated === 1, 'Test L.3: Deduplication counter incremented');
  }

  // Test M — Mutable Tool: Mutable operation is NOT cached and invalidates read cache
  {
    const governor = new CreditGovernor(taskClassifier.classify('Test tool write'));
    let writeCount = 0;
    const fakeWriter = async () => {
      writeCount++;
      return { success: true };
    };

    assert(toolCallOptimizer.isMutableTool('write_to_file'), 'Test M.1: write_to_file recognized as mutable');
    assert(!toolCallOptimizer.isReadOnlyTool('write_to_file'), 'Test M.2: write_to_file is not read-only');

    await toolCallOptimizer.executeOptimizedToolCall('write_to_file', { TargetFile: '/test.ts' }, governor, fakeWriter);
    assert(writeCount === 1, 'Test M.3: Mutable tool executed directly');
  }

  // Test N — Retry: One retry allowed on transient failure
  {
    const governor = new CreditGovernor(taskClassifier.classify('Retry task'));
    const f1 = retryIntelligence.classifyFailure(new Error('HTTP 429 rate limit exceeded'), governor);
    assert(f1.type === 'TRANSIENT', 'Test N.1: 429 classified as TRANSIENT');
    assert(f1.retryAllowed === true, 'Test N.2: First retry allowed');
  }

  // Test O — Repeated Failure: Second failure stops loop
  {
    const governor = new CreditGovernor(taskClassifier.classify('Failure task'));
    governor.recordRetry('Attempt 1');
    const f2 = retryIntelligence.classifyFailure(new Error('Second failure'), governor);
    assert(f2.type === 'REPEATED', 'Test O.1: Second failure classified as REPEATED');
    assert(f2.retryAllowed === false, 'Test O.2: Infinite retry stopped');
  }

  // Test P — Recursive Agent Spawn: Child cannot spawn beyond depth 2
  {
    const s1 = antiLoopGuard.trackSpawn('root', 'child_1');
    const s2 = antiLoopGuard.trackSpawn('child_1', 'child_2');
    const s3 = antiLoopGuard.trackSpawn('child_2', 'child_3');

    assert(s1 === true, 'Test P.1: Depth 1 spawn allowed');
    assert(s2 === true, 'Test P.2: Depth 2 spawn allowed');
    assert(s3 === false, 'Test P.3: Depth 3 recursive spawn blocked');
  }

  // Test Q — Reviewer Loop: Maximum review rounds respected
  {
    const profile = taskClassifier.classify('Code change');
    const governor = new CreditGovernor(profile);
    governor.recordReviewRound();
    const reviewDecision = reviewPolicyManager.evaluateReviewNeed(profile, governor);
    assert(!reviewDecision.requiresReview, 'Test Q.1: Chained second review blocked');
  }

  // Test R — Shadow Mode: Predicts without controlling execution
  {
    const shadowHarness = new AntigravityHarness(undefined, undefined, { shadowMode: true });
    const profile = taskClassifier.classify('Build a user authentication dashboard in React');
    const prediction = shadowHarness.generateShadowPrediction('Build a user authentication dashboard in React', profile);

    assert(Boolean(prediction.mode), 'Test R.1: Shadow mode predicted mode');
    assert(prediction.predictedAgents >= 1, 'Test R.2: Shadow mode predicted agent count');
    assert(prediction.predictedCostUsd >= 0, 'Test R.3: Shadow mode predicted cost');
  }

  // Test S — Model Registry: Harness uses logical tiers decoupled from specific vendors
  {
    const cheapRes = modelRegistry.resolveModelForTier('cheap', 'coding');
    const standardRes = modelRegistry.resolveModelForTier('standard', 'reasoning');
    const premiumRes = modelRegistry.resolveModelForTier('premium', 'reasoning');

    assert(cheapRes.primary.tier === 'cheap', 'Test S.1: Cheap logical tier resolved');
    assert(standardRes.primary.tier === 'standard' || standardRes.primary.tier === 'cheap', 'Test S.2: Standard logical tier resolved');
    assert(premiumRes.primary.tier === 'premium', 'Test S.3: Premium logical tier resolved');
    assert(cheapRes.primary.capabilities.coding > 0, 'Test S.4: Capability metadata verified');
  }

  // Test T — Backward Compatibility: Permission inheritance child <= parent
  {
    const parentPerm = permissionModelManager.getPermissions('orchestrator');
    const childPerm = permissionModelManager.getPermissions('builder', 'orchestrator');

    assert(!parentPerm.allowWriteAccess, 'Test T.1: Parent orchestrator has no write access');
    assert(!childPerm.allowWriteAccess, 'Test T.2: Child inherits no write access from parent (child <= parent)');
  }

  console.log(`\n=== MASTER TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runMasterSuite().catch((err) => {
  console.error('Master Test Suite Fatal Error:', err);
  process.exit(1);
});
