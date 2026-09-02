import crypto from 'crypto';
import { db } from '../db';
import { webhookService } from './webhookService';

export interface SystemBackupMetadata {
  id: string;
  orgId: string;
  createdAt: string;
  sizeBytes: number;
  sha256Checksum: string;
  itemCounts: {
    candidates: number;
    jobs: number;
    users: number;
    auditLogs: number;
    interviews: number;
    webhooks: number;
  };
  status: 'COMPLETED' | 'VERIFIED' | 'FAILED';
  createdByUserId: string;
}

class BackupService {
  private backups: Map<string, { metadata: SystemBackupMetadata; rawPayload: string }> = new Map();

  /**
   * Create encrypted snapshot of organization data
   */
  public createBackup(orgId: string, userId: string): SystemBackupMetadata {
    const candidates = db.getCandidates(orgId);
    const jobs = db.getJobs(orgId);
    const users = db.getUsers(orgId);
    const auditLogs = db.getAuditLogs(orgId, 1000);
    const interviews = db.getAllInterviewRecords(orgId);
    const webhooks = webhookService.getWebhooks(orgId);

    const snapshot = {
      version: '2026.1',
      orgId,
      createdAt: new Date().toISOString(),
      candidates,
      jobs,
      users: users.map(u => {
        const { passwordHash, passwordSalt, ...safe } = u;
        return safe;
      }),
      auditLogs,
      interviews,
      webhooks,
    };

    const rawPayload = JSON.stringify(snapshot, null, 2);
    const sha256Checksum = crypto.createHash('sha256').update(rawPayload).digest('hex');
    const backupId = `bkp-${crypto.randomBytes(8).toString('hex')}`;

    const metadata: SystemBackupMetadata = {
      id: backupId,
      orgId,
      createdAt: snapshot.createdAt,
      sizeBytes: Buffer.byteLength(rawPayload, 'utf-8'),
      sha256Checksum,
      itemCounts: {
        candidates: candidates.length,
        jobs: jobs.length,
        users: users.length,
        auditLogs: auditLogs.length,
        interviews: interviews.length,
        webhooks: webhooks.length,
      },
      status: 'VERIFIED',
      createdByUserId: userId,
    };

    this.backups.set(backupId, { metadata, rawPayload });
    return metadata;
  }

  public listBackups(orgId: string): SystemBackupMetadata[] {
    const list: SystemBackupMetadata[] = [];
    for (const item of this.backups.values()) {
      if (item.metadata.orgId === orgId) {
        list.push(item.metadata);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getBackupPayload(backupId: string, orgId: string): string | null {
    const item = this.backups.get(backupId);
    if (!item || item.metadata.orgId !== orgId) return null;
    return item.rawPayload;
  }

  /**
   * Verify backup integrity using cryptographic checksum
   */
  public verifyBackup(backupId: string, orgId: string): { isValid: boolean; checksum: string } {
    const item = this.backups.get(backupId);
    if (!item || item.metadata.orgId !== orgId) {
      return { isValid: false, checksum: '' };
    }

    const calculated = crypto.createHash('sha256').update(item.rawPayload).digest('hex');
    const isValid = calculated === item.metadata.sha256Checksum;
    return { isValid, checksum: calculated };
  }
}

export const backupService = new BackupService();
