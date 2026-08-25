import fs from 'fs';
import path from 'path';

export interface CodeDocument {
  filePath: string;
  symbolName: string;
  contentSnippet: string;
  score?: number;
}

export class VectorIndexer {
  private indexedDocuments: CodeDocument[] = [];

  /**
   * Tokenize text into normalized word terms
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);
  }

  /**
   * Index source code files in a directory recursively
   */
  public indexDirectory(dirPath: string, extensions: string[] = ['.ts', '.js', '.html', '.md']): number {
    if (!fs.existsSync(dirPath)) return 0;

    const files = fs.readdirSync(dirPath, { recursive: true }) as string[];
    let count = 0;

    for (const relFile of files) {
      const fullPath = path.join(dirPath, relFile);
      if (fs.statSync(fullPath).isFile() && extensions.some((ext) => fullPath.endsWith(ext))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');

          // Chunk lines into logical document blocks
          for (let i = 0; i < lines.length; i += 25) {
            const chunk = lines.slice(i, i + 25).join('\n');
            if (chunk.trim()) {
              this.indexedDocuments.push({
                filePath: fullPath,
                symbolName: `${path.basename(fullPath)}#L${i + 1}-L${Math.min(i + 25, lines.length)}`,
                contentSnippet: chunk
              });
              count++;
            }
          }
        } catch (err) {}
      }
    }

    return count;
  }

  /**
   * Perform local TF-IDF / keyword similarity search across indexed code documents
   */
  public searchCodebase(query: string, topK: number = 5): CodeDocument[] {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const scored = this.indexedDocuments.map((doc) => {
      const docTokens = this.tokenize(doc.contentSnippet);
      let matches = 0;

      for (const qt of queryTokens) {
        if (docTokens.includes(qt)) {
          matches++;
        }
      }

      const score = docTokens.length > 0 ? (matches / (queryTokens.length + Math.log(docTokens.length))) : 0;
      return { ...doc, score };
    });

    return scored
      .filter((d) => (d.score || 0) > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);
  }
}
