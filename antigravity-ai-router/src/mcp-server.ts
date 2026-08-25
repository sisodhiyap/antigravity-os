import { QuotaManager } from './router/quota-manager.js';
import { FallbackEngine } from './router/fallback-engine.js';
import { classifyTask } from './router/classifier.js';
import { selectModel } from './router/selector.js';

export class RouterMcpServer {
  private quotaManager: QuotaManager;
  private fallbackEngine: FallbackEngine;

  constructor(quotaManager: QuotaManager, fallbackEngine: FallbackEngine) {
    this.quotaManager = quotaManager;
    this.fallbackEngine = fallbackEngine;
  }

  handleToolCall(toolName: string, args: any) {
    switch (toolName) {
      case 'model.list':
        return {
          models: [
            { id: 'qwen2.5-coder:14b', type: 'local', provider: 'ollama' },
            { id: 'deepseek-r1:7b', type: 'local', provider: 'ollama' },
            { id: 'qwen2.5-coder:7b', type: 'local', provider: 'ollama' },
            { id: 'llama3.1:latest', type: 'local', provider: 'ollama' },
            { id: 'minicpm-v:latest', type: 'local', provider: 'ollama' },
            { id: 'omniroute/free-coder', type: 'free', provider: 'omniroute' },
            { id: 'antigravity-native-premium', type: 'native', provider: 'antigravity' }
          ]
        };

      case 'model.health':
        return {
          status: 'HEALTHY',
          ollama: 'HEALTHY (http://127.0.0.1:11434)',
          omniroute: 'HEALTHY (http://127.0.0.1:3000)',
          antigravity: 'AVAILABLE'
        };

      case 'router.route':
        const classification = classifyTask(args.prompt || '');
        const route = selectModel(classification);
        return {
          classification,
          selectedRoute: route
        };

      case 'router.stats':
      case 'quota.status':
        return {
          stats: this.quotaManager.getAllStats()
        };

      default:
        throw new Error(`Unknown MCP tool: ${toolName}`);
    }
  }
}
