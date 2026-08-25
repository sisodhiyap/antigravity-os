import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface KnowledgeItem {
  id: string;
  category: 'bug_fix' | 'architectural_rule' | 'user_preference' | 'performance_pattern';
  title: string;
  description: string;
  solution: string;
  timestamp: string;
  tags: string[];
}

export class KnowledgeEngine {
  private dbPath: string;
  private knowledgeItems: KnowledgeItem[] = [];

  constructor() {
    this.dbPath = path.join(__dirname, '../../runtime/knowledge_graph.json');
    this.loadKnowledgeStore();
  }

  private loadKnowledgeStore(): void {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        this.knowledgeItems = JSON.parse(raw || '[]');
      } else {
        this.seedInitialKnowledge();
      }
    } catch (err) {
      this.knowledgeItems = [];
      this.seedInitialKnowledge();
    }
  }

  private seedInitialKnowledge(): void {
    this.knowledgeItems = [
      {
        id: 'ki-001',
        category: 'architectural_rule',
        title: 'Windows PowerShell Execution Policy',
        description: 'npx.ps1 script execution is blocked on Windows PowerShell by default policy.',
        solution: 'Execute commands using powershell -ExecutionPolicy Bypass -Command "..."',
        timestamp: new Date().toISOString(),
        tags: ['windows', 'powershell', 'execution_policy']
      },
      {
        id: 'ki-002',
        category: 'bug_fix',
        title: 'Puter.js Safe DOM Rendering',
        description: 'Prevent XSS injection and unsafe HTML when rendering AI streaming text.',
        solution: 'Use Text nodes or textContent instead of innerHTML or document.write().',
        timestamp: new Date().toISOString(),
        tags: ['puter.js', 'security', 'dom']
      },
      {
        id: 'ki-003',
        category: 'performance_pattern',
        title: 'ComfyUI 6GB VRAM Optimization',
        description: 'Avoid out-of-memory crashes on RTX 3060 6GB VRAM GPUs.',
        solution: 'Enforce fp8/Q4 GGUF quantization and --lowvram CPU offloading.',
        timestamp: new Date().toISOString(),
        tags: ['vram', 'rtx3060', 'comfyui']
      }
    ];
    this.saveKnowledgeStore();
  }

  public saveKnowledgeStore(): void {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, JSON.stringify(this.knowledgeItems, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save Knowledge Store:', err);
    }
  }

  public addKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'timestamp'>): KnowledgeItem {
    const newItem: KnowledgeItem = {
      ...item,
      id: `ki-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.knowledgeItems.push(newItem);
    this.saveKnowledgeStore();
    return newItem;
  }

  public searchKnowledge(query: string): KnowledgeItem[] {
    const q = query.toLowerCase();
    return this.knowledgeItems.filter(
      (ki) =>
        ki.title.toLowerCase().includes(q) ||
        ki.description.toLowerCase().includes(q) ||
        ki.solution.toLowerCase().includes(q) ||
        ki.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  public getAllKnowledge(): KnowledgeItem[] {
    return [...this.knowledgeItems];
  }
}
