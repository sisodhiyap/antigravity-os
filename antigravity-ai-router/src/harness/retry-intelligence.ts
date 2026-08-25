/**
 * Antigravity Production-Grade Adaptive Harness - Failure & Retry Intelligence
 * Expanded failure taxonomy (TRANSIENT, CONTEXT, TOOL, STRATEGY, MODEL, PERMISSION, BUG, REPEATED).
 * Enforces strictly bounded, intelligent recovery without infinite loops.
 */

import { FailureClassification } from './types.js';
import { CreditGovernor } from './credit-governor.js';

export class RetryIntelligence {
  public classifyFailure(error: Error | string, governor: CreditGovernor): FailureClassification {
    const message = (typeof error === 'string' ? error : error.message || '').toLowerCase();

    // 1. Repeated / Max retries reached
    if (governor.retriesCount >= governor.getBudget().maxRetries) {
      return {
        type: 'REPEATED',
        reason: 'Maximum retries quota strictly exhausted.',
        action: 'stop',
        retryAllowed: false
      };
    }

    // 2. Transient Network / Rate Limit / Timeout
    if (message.includes('429') || message.includes('rate limit') || message.includes('timeout') || message.includes('econnreset') || message.includes('fetch failed')) {
      return {
        type: 'TRANSIENT',
        reason: 'Transient network latency or rate limit.',
        action: 'fallback_or_retry_once',
        retryAllowed: true
      };
    }

    // 3. Context Length Overflow
    if (message.includes('context length') || message.includes('too many tokens') || message.includes('maximum context') || message.includes('context_length_exceeded')) {
      return {
        type: 'CONTEXT',
        reason: 'Context window overflow.',
        action: 'rebuild_context',
        retryAllowed: true
      };
    }

    // 4. Permission / Access Denied
    if (message.includes('permission denied') || message.includes('unauthorized') || message.includes('forbidden') || message.includes('access denied')) {
      return {
        type: 'PERMISSION',
        reason: 'Security permission boundary violation.',
        action: 'use_correct_permission',
        retryAllowed: false
      };
    }

    // 5. Tool Execution Failure
    if (message.includes('tool call') || message.includes('spawn failed') || message.includes('tool blocked') || message.includes('command failed')) {
      return {
        type: 'TOOL',
        reason: 'Subprocess or MCP tool execution failure.',
        action: 'fallback_or_retry_once',
        retryAllowed: true
      };
    }

    // 6. Quality & Model Output Verification
    if (message.includes('quality check failed') || message.includes('syntax error') || message.includes('unexpected token') || message.includes('parse error')) {
      return {
        type: 'MODEL',
        reason: 'Model output failed code validation or quality score threshold.',
        action: 'escalate_if_justified',
        retryAllowed: true
      };
    }

    // 7. Internal System Bug
    if (message.includes('nullpointer') || message.includes('is not a function') || message.includes('cannot read property')) {
      return {
        type: 'BUG',
        reason: 'Internal runtime anomaly.',
        action: 'report_or_alternative',
        retryAllowed: false
      };
    }

    // 8. Strategy Mismatch
    return {
      type: 'STRATEGY',
      reason: 'Algorithmic or logic strategy mismatch.',
      action: 'change_strategy',
      retryAllowed: true
    };
  }
}

export const retryIntelligence = new RetryIntelligence();
