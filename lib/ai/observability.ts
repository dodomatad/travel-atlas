export interface LogEntry {
  requestId: string;
  intent?: string;
  tool?: string;
  latencyMs?: number;
  provider?: string;
  status: 'SUCCESS' | 'ERROR' | 'INFO';
  error?: string;
  metadata?: Record<string, unknown>;
}

export class AILogger {
  private static sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    const sensitiveKeys = ['key', 'token', 'secret', 'password', 'authorization', 'bearer'];
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (sensitiveKeys.some(s => k.toLowerCase().includes(s))) {
        sanitized[k] = '[REDACTED]';
      } else if (typeof v === 'object') {
        sanitized[k] = this.sanitize(v);
      } else {
        sanitized[k] = v;
      }
    }
    return sanitized;
  }

  public static log(entry: LogEntry): void {
    const sanitizedEntry = {
      ...entry,
      metadata: entry.metadata ? this.sanitize(entry.metadata) : undefined,
      timestamp: new Date().toISOString(),
    };

    // Em produção/testes, emitimos JSON estruturado
    if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify(sanitizedEntry));
    }
  }

  public static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
