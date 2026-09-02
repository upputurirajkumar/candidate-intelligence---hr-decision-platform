import crypto from 'crypto';
import { parseDocumentBuffer } from './documentParser';
import { ragStore } from './ragEngine';
import { db } from '../db';
import { objectStorage } from './objectStorage';
import { extractCandidateClaims, buildEvidenceRecords, evaluateCrossSourceConsistency } from './integrityEngine';
import { calculateExplainableMatch } from './analysisEngine';

export type JobType = 
  | 'RESUME_INGEST_AND_PARSE'
  | 'BATCH_RAG_INDEX'
  | 'MULTI_SOURCE_VERIFICATION'
  | 'INTEGRITY_AUDIT'
  | 'PII_ANONYMIZATION'
  | 'REPORT_EXPORT';

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface BackgroundJob {
  id: string;
  orgId: string;
  type: JobType;
  status: JobStatus;
  progressPercent: number;
  payload: Record<string, any>;
  result?: Record<string, any>;
  errorMessage?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdByUserId: string;
}

class BackgroundJobQueue {
  private jobs: Map<string, BackgroundJob> = new Map();
  private isProcessing = false;

  constructor() {
    // Start background processing interval
    setInterval(() => this.processNext(), 500).unref();
  }

  /**
   * Enqueue a new background task
   */
  public enqueue(
    orgId: string,
    type: JobType,
    payload: Record<string, any>,
    userId: string,
    maxAttempts: number = 3
  ): BackgroundJob {
    const job: BackgroundJob = {
      id: `job-task-${crypto.randomBytes(8).toString('hex')}`,
      orgId,
      type,
      status: 'QUEUED',
      progressPercent: 0,
      payload,
      attempts: 0,
      maxAttempts,
      createdAt: new Date().toISOString(),
      createdByUserId: userId,
    };

    this.jobs.set(job.id, job);
    return job;
  }

  /**
   * Retrieve job status for tenant
   */
  public getJob(jobId: string, orgId: string): BackgroundJob | null {
    const job = this.jobs.get(jobId);
    if (!job || job.orgId !== orgId) return null;
    return job;
  }

  /**
   * List recent jobs for tenant
   */
  public listJobs(orgId: string, limit: number = 50): BackgroundJob[] {
    const result: BackgroundJob[] = [];
    for (const job of this.jobs.values()) {
      if (job.orgId === orgId) {
        result.push(job);
      }
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }

  /**
   * Cancel an in-flight or queued job
   */
  public cancelJob(jobId: string, orgId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.orgId !== orgId) return false;
    if (job.status === 'QUEUED' || job.status === 'PROCESSING') {
      job.status = 'CANCELLED';
      job.completedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public getQueueStats(): { active: number; completed: number; failed: number } {
    let active = 0;
    let completed = 0;
    let failed = 0;
    for (const j of this.jobs.values()) {
      if (j.status === 'PROCESSING' || j.status === 'QUEUED') active++;
      else if (j.status === 'COMPLETED') completed++;
      else if (j.status === 'FAILED') failed++;
    }
    return { active, completed, failed };
  }

  /**
   * Worker Loop
   */
  private async processNext() {
    if (this.isProcessing) return;

    // Find next queued job
    let nextJob: BackgroundJob | undefined;
    for (const j of this.jobs.values()) {
      if (j.status === 'QUEUED') {
        nextJob = j;
        break;
      }
    }

    if (!nextJob) return;

    this.isProcessing = true;
    nextJob.status = 'PROCESSING';
    nextJob.startedAt = new Date().toISOString();
    nextJob.attempts++;
    nextJob.progressPercent = 10;

    try {
      await this.executeJobLogic(nextJob);
      nextJob.status = 'COMPLETED';
      nextJob.progressPercent = 100;
      nextJob.completedAt = new Date().toISOString();
    } catch (err: any) {
      if ((nextJob.status as string) !== 'CANCELLED') {
        if (nextJob.attempts < nextJob.maxAttempts) {
          nextJob.status = 'QUEUED'; // Retry
        } else {
          nextJob.status = 'FAILED';
          nextJob.errorMessage = err.message || 'Background execution failed.';
          nextJob.completedAt = new Date().toISOString();
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async executeJobLogic(job: BackgroundJob) {
    const { orgId, type, payload } = job;

    switch (type) {
      case 'RESUME_INGEST_AND_PARSE': {
        const { candidateId, docId } = payload;
        job.progressPercent = 30;
        const fileRecord = objectStorage.getFile(docId, orgId);
        if (!fileRecord) throw new Error('Document buffer not found in storage pool');

        const parsed = await parseDocumentBuffer(
          fileRecord.buffer,
          fileRecord.document.sanitizedName,
          fileRecord.document.mimeType
        );

        job.progressPercent = 60;
        const chunks = ragStore.chunkDocument(parsed.text, {
          candidateId,
          orgId,
          sourceType: 'resume',
          sourceId: docId,
          documentId: docId,
          title: fileRecord.document.originalName,
          attribution: 'Candidate Provided',
          confidence: 85,
        });

        ragStore.addChunks(orgId, candidateId, chunks);
        job.progressPercent = 90;

        job.result = {
          parsedChars: parsed.text.length,
          chunksIndexed: chunks.length,
          docId,
        };
        break;
      }

      case 'BATCH_RAG_INDEX': {
        const { candidateIds } = payload;
        let indexedCount = 0;
        const total = candidateIds.length;
        for (let i = 0; i < total; i++) {
          const cId = candidateIds[i];
          const cand = db.getCandidateById(cId, orgId);
          if (cand) {
            const summaryText = `${cand.name} - ${cand.currentRole} at ${cand.currentCompany}.\n${cand.summary}\nSkills: ${cand.skills.map(s => s.name).join(', ')}`;
            const chunks = ragStore.chunkDocument(summaryText, {
              candidateId: cId,
              orgId,
              sourceType: 'resume',
              sourceId: `cand-summary-${cId}`,
              documentId: `doc-summary-${cId}`,
              title: `${cand.name} Summary Dossier`,
              attribution: 'Candidate Provided',
              confidence: 90,
            });
            ragStore.addChunks(orgId, cId, chunks);
            indexedCount++;
          }
          job.progressPercent = Math.round(((i + 1) / total) * 90);
        }
        job.result = { totalIndexed: indexedCount };
        break;
      }

      case 'MULTI_SOURCE_VERIFICATION': {
        const { candidateId } = payload;
        job.progressPercent = 40;
        const cand = db.getCandidateById(candidateId, orgId);
        if (!cand) throw new Error('Candidate not found');

        const claims = extractCandidateClaims(cand);
        job.progressPercent = 70;
        const consistency = evaluateCrossSourceConsistency(cand);

        job.result = {
          claimsCount: claims.length,
          integrityRiskLevel: consistency.integrityRiskScore.level,
          signalsMatched: consistency.matchingSignals.length,
        };
        break;
      }

      case 'REPORT_EXPORT': {
        job.progressPercent = 50;
        const candidates = db.getCandidates(orgId);
        const jobs = db.getJobs(orgId);
        job.progressPercent = 85;

        job.result = {
          exportTimestamp: new Date().toISOString(),
          candidateCount: candidates.length,
          jobsCount: jobs.length,
          format: 'json',
        };
        break;
      }

      default:
        job.progressPercent = 100;
        job.result = { status: 'processed_generic' };
    }
  }
}

export const jobQueue = new BackgroundJobQueue();
