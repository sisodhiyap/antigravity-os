import { FallbackEngine } from '../src/router/fallback-engine.js';
import { QuotaManager } from '../src/router/quota-manager.js';

async function verifyAllLive() {
  const engine = new FallbackEngine(new QuotaManager());

  console.log('--- Testing OpenAI gpt-4o-mini ---');
  try {
    const oai = await engine.executeRequest({ prompt: 'Say OpenAI Live in 4 words', forceModel: 'gpt-4o-mini' });
    console.log('OpenAI response:', oai.content.trim(), '| Model:', oai.selectedModel);
  } catch (e: any) {
    console.error('OpenAI failed:', e.message);
  }

  console.log('--- Testing Gemini 2.0 Flash ---');
  try {
    const gem = await engine.executeRequest({ prompt: 'Say Gemini Live in 4 words', forceModel: 'gemini-2.0-flash' });
    console.log('Gemini response:', gem.content.trim(), '| Model:', gem.selectedModel);
  } catch (e: any) {
    console.error('Gemini failed:', e.message);
  }

  console.log('--- Testing DeepSeek Chat ---');
  try {
    const ds = await engine.executeRequest({ prompt: 'Say DeepSeek Live in 4 words', forceModel: 'deepseek-chat' });
    console.log('DeepSeek response:', ds.content.trim(), '| Model:', ds.selectedModel);
  } catch (e: any) {
    console.error('DeepSeek failed:', e.message);
  }
}

verifyAllLive();
