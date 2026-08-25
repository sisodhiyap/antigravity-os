import { KernelEvent, EventHandler } from "./types";

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private wildcardListeners: Set<{ pattern: RegExp; handler: EventHandler }> = new Set();
  private eventHistory: KernelEvent[] = [];
  private readonly maxHistorySize = 500;
  private totalEventsBroadcasted = 0;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to a specific topic or wildcard pattern (e.g. "service:*", "kernel:*")
   */
  public on<T = any>(topic: string, handler: EventHandler<T>): () => void {
    if (topic.includes("*")) {
      const regexPattern = new RegExp("^" + topic.replace(/\*/g, ".*") + "$");
      const sub = { pattern: regexPattern, handler: handler as EventHandler };
      this.wildcardListeners.add(sub);
      return () => {
        this.wildcardListeners.delete(sub);
      };
    }

    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic)!.add(handler as EventHandler);

    return () => {
      this.listeners.get(topic)?.delete(handler as EventHandler);
    };
  }

  /**
   * Subscribe once to an event
   */
  public once<T = any>(topic: string, handler: EventHandler<T>): () => void {
    const unsubscribe = this.on<T>(topic, async (event) => {
      unsubscribe();
      await handler(event);
    });
    return unsubscribe;
  }

  /**
   * Publish an event to the bus
   */
  public async emit<T = any>(topic: string, source: string, payload: T): Promise<KernelEvent<T>> {
    const event: KernelEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      topic,
      source,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.totalEventsBroadcasted++;
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Direct topic listeners
    const handlers = this.listeners.get(topic);
    const promises: Promise<void>[] = [];

    if (handlers) {
      for (const handler of handlers) {
        try {
          const res = handler(event);
          if (res instanceof Promise) promises.push(res);
        } catch (err) {
          console.error(`[EventBus] Error in handler for topic '${topic}':`, err);
        }
      }
    }

    // Wildcard listeners
    for (const { pattern, handler } of this.wildcardListeners) {
      if (pattern.test(topic)) {
        try {
          const res = handler(event);
          if (res instanceof Promise) promises.push(res);
        } catch (err) {
          console.error(`[EventBus] Error in wildcard handler for '${topic}':`, err);
        }
      }
    }

    await Promise.allSettled(promises);
    return event;
  }

  /**
   * Query event history
   */
  public getHistory(filter?: { topic?: string; source?: string; limit?: number }): KernelEvent[] {
    let result = [...this.eventHistory];
    if (filter?.topic) {
      result = result.filter((e) => e.topic.includes(filter.topic!));
    }
    if (filter?.source) {
      result = result.filter((e) => e.source === filter.source);
    }
    const limit = filter?.limit || 100;
    return result.slice(-limit);
  }

  /**
   * Get telemetry stats for the event bus
   */
  public getStats() {
    let directSubscribers = 0;
    for (const subs of this.listeners.values()) {
      directSubscribers += subs.size;
    }

    return {
      totalBroadcasted: this.totalEventsBroadcasted,
      historyCount: this.eventHistory.length,
      directTopics: this.listeners.size,
      activeSubscribers: directSubscribers + this.wildcardListeners.size,
    };
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }
}
