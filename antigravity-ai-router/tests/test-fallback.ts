import { QuotaManager } from '../src/router/quota-manager.js';
import { FallbackEngine } from '../src/router/fallback-engine.js';

async function main() {
  const quota = new QuotaManager();
  const engine = new FallbackEngine(quota);
  console.log('Testing fallback engine execution...');
  const res = await engine.executeRequest({ prompt: 'Write a TypeScript function to reverse a string' });
  console.log('Response Model Selected:', res.selectedModel);
  console.log('Response Provider:', res.selectedProvider);
  console.log('Fallback Chain Used:', res.fallbackChainUsed);
  console.log('Latency Ms:', res.latencyMs);
  console.log('Sample Content:\n', res.content.slice(0, 300));
}

main().catch(err => {
  console.error('Execution error:', err);
});
