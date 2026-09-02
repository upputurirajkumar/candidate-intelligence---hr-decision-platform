import crypto from 'crypto';

export interface WebhookSubscription {
  id: string;
  orgId: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  isActive: boolean;
  createdAt: string;
  description: string;
}

export type WebhookEventType =
  | 'candidate.created'
  | 'candidate.stage_changed'
  | 'verification.completed'
  | 'decision.recorded'
  | 'interview.feedback_submitted'
  | 'job.created';

export interface WebhookDeliveryLog {
  id: string;
  subscriptionId: string;
  orgId: string;
  eventType: WebhookEventType;
  payload: Record<string, any>;
  timestamp: string;
  status: 'DELIVERED' | 'FAILED';
  httpStatusCode?: number;
  durationMs: number;
  signature: string;
  idempotencyKey: string;
}

class WebhookService {
  private subscriptions: Map<string, WebhookSubscription> = new Map();
  private deliveryLogs: WebhookDeliveryLog[] = [];
  private processedIdempotencyKeys: Set<string> = new Set();

  constructor() {
    // Seed an example ATS webhook
    const defaultSub: WebhookSubscription = {
      id: 'wh-sub-ats-greenhouse',
      orgId: 'org-talentintel-enterprise',
      url: 'https://api.workday-or-greenhouse.example/webhooks/talentintel',
      secret: 'whsec_prod_talentintel_enterprise_2026',
      events: ['candidate.created', 'candidate.stage_changed', 'decision.recorded'],
      isActive: true,
      createdAt: new Date().toISOString(),
      description: 'Primary Greenhouse ATS Bi-directional Sync',
    };
    this.subscriptions.set(defaultSub.id, defaultSub);
  }

  public registerWebhook(options: {
    orgId: string;
    url: string;
    events: WebhookEventType[];
    description: string;
  }): WebhookSubscription {
    const id = `wh-sub-${crypto.randomBytes(6).toString('hex')}`;
    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;

    const sub: WebhookSubscription = {
      id,
      orgId: options.orgId,
      url: options.url,
      secret,
      events: options.events,
      isActive: true,
      createdAt: new Date().toISOString(),
      description: options.description,
    };

    this.subscriptions.set(id, sub);
    return sub;
  }

  public getWebhooks(orgId: string): WebhookSubscription[] {
    const list: WebhookSubscription[] = [];
    for (const sub of this.subscriptions.values()) {
      if (sub.orgId === orgId) {
        list.push(sub);
      }
    }
    return list;
  }

  public deleteWebhook(id: string, orgId: string): boolean {
    const sub = this.subscriptions.get(id);
    if (sub && sub.orgId === orgId) {
      this.subscriptions.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Compute HMAC-SHA256 signature for webhook payload
   */
  public generateSignature(payload: string, secret: string, timestamp: number): string {
    const signaturePayload = `${timestamp}.${payload}`;
    return crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');
  }

  /**
   * Verify inbound webhook signature
   */
  public verifySignature(payload: string, signature: string, secret: string, timestamp: number): boolean {
    if (!signature || typeof signature !== 'string') return false;
    const expected = this.generateSignature(payload, secret, timestamp);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }

  /**
   * Dispatch event to all matching active webhook subscriptions
   */
  public async dispatchEvent(orgId: string, eventType: WebhookEventType, data: Record<string, any>) {
    const matchingSubs = this.getWebhooks(orgId).filter(s => s.isActive && s.events.includes(eventType));
    if (matchingSubs.length === 0) return;

    const timestamp = Date.now();
    const idempotencyKey = `evt-${crypto.randomBytes(8).toString('hex')}`;
    const payloadObject = {
      id: idempotencyKey,
      event: eventType,
      orgId,
      timestamp: new Date(timestamp).toISOString(),
      data,
    };
    const payloadStr = JSON.stringify(payloadObject);

    for (const sub of matchingSubs) {
      const signature = this.generateSignature(payloadStr, sub.secret, timestamp);
      const deliveryId = `del-${crypto.randomBytes(8).toString('hex')}`;

      // In-memory simulation / delivery log
      const deliveryLog: WebhookDeliveryLog = {
        id: deliveryId,
        subscriptionId: sub.id,
        orgId,
        eventType,
        payload: payloadObject,
        timestamp: new Date().toISOString(),
        status: 'DELIVERED',
        httpStatusCode: 200,
        durationMs: 42,
        signature,
        idempotencyKey,
      };

      this.deliveryLogs.unshift(deliveryLog);
      if (this.deliveryLogs.length > 500) this.deliveryLogs.pop();
    }
  }

  public getDeliveryLogs(orgId: string, limit: number = 50): WebhookDeliveryLog[] {
    return this.deliveryLogs.filter(l => l.orgId === orgId).slice(0, limit);
  }
}

export const webhookService = new WebhookService();
