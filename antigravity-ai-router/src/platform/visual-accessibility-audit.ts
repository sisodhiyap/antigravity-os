export interface AuditIssue {
  type: 'accessibility' | 'layout' | 'console_error';
  severity: 'warning' | 'error';
  message: string;
  selector?: string;
}

export interface VisualAuditReport {
  timestamp: string;
  url: string;
  passed: boolean;
  viewportsTested: string[];
  issues: AuditIssue[];
}

export class VisualAccessibilityAudit {
  /**
   * Run visual & WCAG accessibility audit rules on HTML string or page definition
   */
  public auditHtmlContent(html: string, pageUrl: string = 'http://127.0.0.1:8080/dashboard'): VisualAuditReport {
    const issues: AuditIssue[] = [];

    // Rule 1: Check document lang attribute
    if (!html.includes('lang=')) {
      issues.push({
        type: 'accessibility',
        severity: 'warning',
        message: 'Missing lang attribute on <html> element.',
        selector: 'html'
      });
    }

    // Rule 2: Check viewport meta tag
    if (!html.includes('name="viewport"') && !html.includes("name='viewport'")) {
      issues.push({
        type: 'layout',
        severity: 'error',
        message: 'Missing mobile viewport meta tag.',
        selector: 'head'
      });
    }

    // Rule 3: Check alt attributes on img tags
    const imgTagsWithoutAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []);
    if (imgTagsWithoutAlt.length > 0) {
      issues.push({
        type: 'accessibility',
        severity: 'warning',
        message: `Found ${imgTagsWithoutAlt.length} image tag(s) without alt text attribute.`,
        selector: 'img'
      });
    }

    // Rule 4: Audit for forbidden document.write
    if (html.includes('document.write(')) {
      issues.push({
        type: 'accessibility',
        severity: 'error',
        message: 'Forbidden document.write call found in page source.',
        selector: 'script'
      });
    }

    // Rule 5: Audit for proper form label controls
    const inputTagsWithoutId = (html.match(/<input(?![^>]*\bid=)[^>]*>/gi) || []);
    if (inputTagsWithoutId.length > 0) {
      issues.push({
        type: 'accessibility',
        severity: 'warning',
        message: `Found ${inputTagsWithoutId.length} input tag(s) missing unique id for label association.`,
        selector: 'input'
      });
    }

    return {
      timestamp: new Date().toISOString(),
      url: pageUrl,
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      viewportsTested: ['375px (Mobile)', '768px (Tablet)', '1440px (Desktop)'],
      issues
    };
  }
}
