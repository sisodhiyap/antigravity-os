import { QuotaManager } from '../src/router/quota-manager.js';
import { FallbackEngine } from '../src/router/fallback-engine.js';

async function testFallback() {
  const quota = new QuotaManager();
  const engine = new FallbackEngine(quota);

  console.log('Testing forced fallback to OpenRouter Free unlimited tier...');
  const res = await engine.executeRequest({
    prompt: 'Write a TypeScript interface for a User and a function to validate user email',
    forceModel: 'openrouter/free'
  });

  console.log('Fallback Selected Model:', res.selectedModel);
  console.log('Fallback Provider:', res.selectedProvider);
  console.log('Quality Score:', res.qualityScore);
  console.log('Latency Ms:', res.latencyMs);
  console.log('Generated Code Sample:\n', res.content.slice(0, 300));
}

testFallback().catch(err => {
  console.error('Fallback test error:', err);
});
