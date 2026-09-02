import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface StructuredLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  traceId: string;
  requestId: string;
  orgId?: string;
  actorId?: string;
  actorRole?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  message: string;
  errorCategory?: string;
  metadata?: Record<string, any>;
}

export interface MetricSnapshot {
  uptimeSeconds: number;
  totalRequests: number;
  activeConnections: number;
  httpStatusCounts: Record<string, number>;
  latency: {
    avgMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
  };
  aiTelemetry: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    totalTokensConsumed: number;
    estimatedCostUsd: number;
    avgLatencyMs: number;
  };
  securityEvents: {
    authFailures: number;
    rateLimitHits: number;
    promptInjectionAttempts: number;
    ssrfRejections: number;
    unauthorizedRoleAccess: number;
  };
  queueMetrics: {
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
  };
}

class ObservabilityService {
  private logs: StructuredLogEntry[] = [];
  private readonly maxLogs = 2000;
  private startTime = Date.now();
  private totalRequests = 0;
  private statusCounts: Record<string, number> = {};
  private latencies: number[] = [];
  private aiCalls = 0;
  private aiSuccesses = 0;
  private aiFailures = 0;
  private aiTokens = 0;
  private aiLatencies: number[] = [];
  private authFailures = 0;
  private rateLimitHits = 0;
  private promptInjections = 0;
  private ssrfRejections = 0;
  private rbacRejections = 0;

  // Record Structured Log
  public log(entry: Omit<StructuredLogEntry, 'timestamp'>) {
    const fullEntry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    // Sanitize metadata to never log passwords, tokens or raw secrets
    if (fullEntry.metadata) {
      const sanitized: Record<string, any> = {};
      for (const [k, v] of Object.entries(fullEntry.metadata)) {
        if (/password|secret|token|authorization|cookie|key/i.test(k)) {
          sanitized[k] = '[REDACTED]';
        } else {
          sanitized[k] = v;
        }
      }
      fullEntry.metadata = sanitized;
    }

    this.logs.unshift(fullEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (process.env.NODE_ENV !== 'test') {
      const logLine = `[${fullEntry.timestamp}] [${fullEntry.level}] [Req: ${fullEntry.requestId.slice(0, 8)}] ${fullEntry.method || ''} ${fullEntry.path || ''} ${fullEntry.statusCode || ''} ${fullEntry.durationMs ? `${fullEntry.durationMs}ms` : ''} - ${fullEntry.message}`;
      if (fullEntry.level === 'ERROR') {
        console.error(logLine);
      } else if (fullEntry.level === 'WARN') {
        console.warn(logLine);
      } else {
        console.log(logLine);
      }
    }
  }

  // Record AI Call Metrics
  public recordAICall(tokens: number, latencyMs: number, success: boolean, model: string = 'gemini-2.5') {
    this.aiCalls++;
    if (success) {
      this.aiSuccesses++;
      this.aiTokens += tokens;
      this.aiLatencies.push(latencyMs);
      if (this.aiLatencies.length > 500) this.aiLatencies.shift();
    } else {
      this.aiFailures++;
    }
  }

  // Record Security Incident
  public recordSecurityIncident(type: 'auth_failure' | 'rate_limit' | 'prompt_injection' | 'ssrf' | 'rbac') {
    switch (type) {
      case 'auth_failure':
        this.authFailures++;
        break;
      case 'rate_limit':
        this.rateLimitHits++;
        break;
      case 'prompt_injection':
        this.promptInjections++;
        break;
      case 'ssrf':
        this.ssrfRejections++;
        break;
      case 'rbac':
        this.rbacRejections++;
        break;
    }
  }

  // Record HTTP Request Duration
  public recordHttpRequest(statusCode: number, durationMs: number) {
    this.totalRequests++;
    const codeKey = `${Math.floor(statusCode / 100)}xx`;
    this.statusCounts[codeKey] = (this.statusCounts[codeKey] || 0) + 1;
    this.latencies.push(durationMs);
    if (this.latencies.length > 1000) this.latencies.shift();
  }

  public getMetrics(activeQueueJobs = 0, completedJobs = 0, failedJobs = 0): MetricSnapshot {
    const sortedLatencies = [...this.latencies].sort((a, b) => a - b);
    const count = sortedLatencies.length;
    const avgMs = count > 0 ? Math.round(sortedLatencies.reduce((a, b) => a + b, 0) / count) : 0;
    const p50Ms = count > 0 ? sortedLatencies[Math.floor(count * 0.5)] : 0;
    const p95Ms = count > 0 ? sortedLatencies[Math.floor(count * 0.95)] : 0;
    const p99Ms = count > 0 ? sortedLatencies[Math.floor(count * 0.99)] : 0;

    const avgAiLatency = this.aiLatencies.length > 0
      ? Math.round(this.aiLatencies.reduce((a, b) => a + b, 0) / this.aiLatencies.length)
      : 0;

    // Estimate: $0.000075 per 1k input tokens, $0.0003 per 1k output tokens (~ avg $0.00015 / 1k tokens)
    const estimatedCostUsd = Math.round((this.aiTokens / 1000) * 0.00015 * 10000) / 10000;

    return {
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      totalRequests: this.totalRequests,
      activeConnections: 1,
      httpStatusCounts: this.statusCounts,
      latency: {
        avgMs,
        p50Ms,
        p95Ms,
        p99Ms,
      },
      aiTelemetry: {
        totalCalls: this.aiCalls,
        successfulCalls: this.aiSuccesses,
        failedCalls: this.aiFailures,
        totalTokensConsumed: this.aiTokens,
        estimatedCostUsd,
        avgLatencyMs: avgAiLatency,
      },
      securityEvents: {
        authFailures: this.authFailures,
        rateLimitHits: this.rateLimitHits,
        promptInjectionAttempts: this.promptInjections,
        ssrfRejections: this.ssrfRejections,
        unauthorizedRoleAccess: this.rbacRejections,
      },
      queueMetrics: {
        activeJobs: activeQueueJobs,
        completedJobs: completedJobs,
        failedJobs: failedJobs,
      },
    };
  }

  public getLogs(limit = 100, level?: string, orgId?: string): StructuredLogEntry[] {
    return this.logs
      .filter(l => (!level || l.level === level) && (!orgId || !l.orgId || l.orgId === orgId))
      .slice(0, limit);
  }
}

export const observability = new ObservabilityService();

/**
 * Express Middleware for Request Tracing & Structured Logging
 */
export function requestTracingMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || `req-${crypto.randomBytes(8).toString('hex')}`;
  const traceId = (req.headers['x-trace-id'] as string) || `trc-${crypto.randomBytes(12).toString('hex')}`;
  
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Trace-Id', traceId);

  (req as any).requestId = requestId;
  (req as any).traceId = traceId;

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;

    observability.recordHttpRequest(statusCode, durationMs);

    const level = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
    
    // Skip noisy static asset / favicon logs
    if (!req.path.startsWith('/@') && !req.path.startsWith('/src') && !req.path.startsWith('/node_modules')) {
      observability.log({
        level,
        traceId,
        requestId,
        orgId: (req as any).orgId,
        actorId: (req as any).user?.id,
        actorRole: (req as any).user?.role,
        method: req.method,
        path: req.path,
        statusCode,
        durationMs,
        message: `${req.method} ${req.path} -> ${statusCode} (${durationMs}ms)`,
      });
    }
  });

  next();
}
