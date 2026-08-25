import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QuotaManager } from './router/quota-manager.js';
import { FallbackEngine } from './router/fallback-engine.js';
import { selectIntelligentModel } from './router/selector.js';
import { classifyTask } from './router/classifier.js';
import { ResourceMonitor } from './router/resource-monitor.js';
import { LearningTelemetry } from './router/learning-telemetry.js';
import { RouterMcpServer } from './mcp-server.js';
import { HealthWatchdog, KnowledgeEngine } from './platform/index.js';
import { AntigravityHarness } from './harness/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8080;
const HOST = '127.0.0.1';

const quotaManager = new QuotaManager();
const fallbackEngine = new FallbackEngine(quotaManager);
const harness = new AntigravityHarness(quotaManager, fallbackEngine);
const mcpServer = new RouterMcpServer(quotaManager, fallbackEngine);
const watchdog = new HealthWatchdog();
const knowledgeEngine = new KnowledgeEngine();

const dashboardHtml = fs.readFileSync(path.join(__dirname, '../dashboard/index.html'), 'utf-8');

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url || '/';

  // Dashboard endpoint
  if (url === '/' || url === '/dashboard') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(dashboardHtml);
    return;
  }

  // Telemetry Stats API
  if (url === '/api/stats' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        quotaStats: quotaManager.getAllStats(),
        harnessSummary: harness.getSummaryMetrics(),
        harnessRecentLogs: harness.getTelemetryHistory().slice(-5)
      })
    );
    return;
  }

  // Harness Telemetry API
  if (url === '/api/harness/stats' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        summary: harness.getSummaryMetrics(),
        history: harness.getTelemetryHistory()
      })
    );
    return;
  }

  // Platform Telemetry & Health Endpoint
  if (url === '/api/platform/health' && req.method === 'GET') {
    const healthReport = await watchdog.runHealthCheck();
    const knowledgeItems = knowledgeEngine.getAllKnowledge();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'healthy',
        watchdog: healthReport,
        knowledgeEngine: {
          itemsCount: knowledgeItems.length,
          latestItems: knowledgeItems.slice(-3)
        },
        harness: harness.getSummaryMetrics()
      })
    );
    return;
  }

  // Models catalog API
  if (url === '/v1/models' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        object: 'list',
        data: [
          // Local Ollama
          { id: 'qwen2.5-coder:14b', object: 'model', owned_by: 'ollama' },
          { id: 'deepseek-r1:7b', object: 'model', owned_by: 'ollama' },
          { id: 'qwen2.5-coder:7b', object: 'model', owned_by: 'ollama' },
          { id: 'llama3.1:latest', object: 'model', owned_by: 'ollama' },
          { id: 'minicpm-v:latest', object: 'model', owned_by: 'ollama' },
          // Local AirLLM (Large Models / Low VRAM Layered Engine)
          { id: 'airllm/Qwen/Qwen3-32B', object: 'model', owned_by: 'airllm' },
          { id: 'airllm/Qwen/Qwen2.5-32B-Instruct', object: 'model', owned_by: 'airllm' },
          { id: 'airllm/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct', object: 'model', owned_by: 'airllm' },
          // Official OpenAI
          { id: 'gpt-4o', object: 'model', owned_by: 'openai' },
          { id: 'gpt-4o-mini', object: 'model', owned_by: 'openai' },
          { id: 'o3-mini', object: 'model', owned_by: 'openai' },
          // Official DeepSeek
          { id: 'deepseek-chat', object: 'model', owned_by: 'deepseek' },
          { id: 'deepseek-reasoner', object: 'model', owned_by: 'deepseek' },
          // Google Gemini Pool
          { id: 'gemini-2.0-flash', object: 'model', owned_by: 'google_pool' },
          { id: 'gemini-1.5-pro', object: 'model', owned_by: 'google_pool' },
          { id: 'gemini-1.5-flash', object: 'model', owned_by: 'google_pool' },
          // OpenRouter Free
          { id: 'qwen/qwen3-coder:free', object: 'model', owned_by: 'openrouter' },
          { id: 'nvidia/nemotron-3-super-120b-a12b:free', object: 'model', owned_by: 'openrouter' },
          { id: 'deepseek/deepseek-v4-flash:free', object: 'model', owned_by: 'openrouter' },
          { id: 'openrouter/free', object: 'model', owned_by: 'openrouter' },
          // Router9 Gateway
          { id: 'minimax/minimax-m3', object: 'model', owned_by: 'router9' },
          // Antigravity Native
          { id: 'antigravity-native-premium', object: 'model', owned_by: 'antigravity' }
        ]
      })
    );
    return;
  }

  // Intelligent Routing Decision Dry-Run API
  if (url === '/api/routing/decision' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', (chunk) => (bodyStr += chunk));
    req.on('end', () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const prompt = body.prompt || 'Hello';
        const classification = classifyTask(prompt);
        const decision = selectIntelligentModel({
          classification,
          userPreference: body.userPreference,
          overrideRamAvailableGb: body.overrideRamAvailableGb,
          forceModel: body.forceModel
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            classification,
            decision
          })
        );
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // AI Routing Control Center API
  if (url === '/api/routing/control-center' && req.method === 'GET') {
    const learningTelemetry = LearningTelemetry.getInstance();
    const resourceMonitor = ResourceMonitor.getInstance();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        resourceSnapshot: resourceMonitor.getSnapshot(),
        providerHealth: learningTelemetry.getProviderHealthScores(),
        recentRoutingRecords: learningTelemetry.getRecentRecords(10),
        minAvailableRamThresholdGb: resourceMonitor.getMinAvailableRamGb()
      })
    );
    return;
  }

  // OpenAI-Compatible Chat Completions Endpoint (Intelligent Resource-Aware Routing)
  if (url === '/v1/chat/completions' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', (chunk) => (bodyStr += chunk));
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const userPrompt = body.messages?.[body.messages.length - 1]?.content || 'Hello';

        const resp = await fallbackEngine.executeRequest({
          prompt: userPrompt,
          systemPrompt: body.messages?.[0]?.role === 'system' ? body.messages[0].content : undefined,
          forceModel: body.model,
          userPreference: body.user_preference || body.userPreference,
          overrideRamAvailableGb: body.override_ram_gb || body.overrideRamAvailableGb
        });

        if (!res.headersSent) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: resp.selectedModel,
              provider: resp.selectedProvider,
              choices: [
                {
                  index: 0,
                  message: { role: 'assistant', content: resp.content },
                  finish_reason: 'stop'
                }
              ],
              usage: {
                prompt_tokens: resp.tokensProcessed,
                completion_tokens: resp.tokensGenerated,
                total_tokens: resp.tokensProcessed + resp.tokensGenerated
              },
              routing_decision: {
                selected_model: resp.selectedModel,
                selected_provider: resp.selectedProvider,
                fallback_occurred: resp.fallbackOccurred,
                fallback_chain: resp.fallbackChainUsed,
                estimated_cost_usd: resp.estimatedCostUsd,
                quality_score: resp.qualityScore,
                latency_ms: resp.latencyMs,
                ...resp.routingExplainer
              }
            })
          );
        }
      } catch (err: any) {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: err.message, type: 'router_error' } }));
        }
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Antigravity AI Router & Optimized Harness running at http://${HOST}:${PORT}`);
});
