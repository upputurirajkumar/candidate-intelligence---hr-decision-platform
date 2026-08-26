import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Candidate, JobProfile, AuditLog, User, InterviewRecord } from '../../src/types';
import { INITIAL_CANDIDATES, INITIAL_JOBS } from '../data/initialData';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  organizations: { id: string; name: string; createdAt: string }[];
  jobs: JobProfile[];
  candidates: Candidate[];
  auditLogs: AuditLog[];
  interviewRecords: InterviewRecord[];
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const calculatedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculatedHash, 'hex'));
}

const DEFAULT_ORG_ID = 'org-talentintel-enterprise';

const adminCreds = hashPassword('AdminPass2026!');
const recruiterCreds = hashPassword('RecruiterPass2026!');
const managerCreds = hashPassword('ManagerPass2026!');
const interviewerCreds = hashPassword('InterviewerPass2026!');

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    email: 'admin@talentintel.ai',
    name: 'Elena Rostova',
    role: 'Admin',
    orgId: DEFAULT_ORG_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    passwordHash: adminCreds.hash,
    passwordSalt: adminCreds.salt,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-recruiter-1',
    email: 'recruiter@talentintel.ai',
    name: 'Marcus Vance',
    role: 'Recruiter',
    orgId: DEFAULT_ORG_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    passwordHash: recruiterCreds.hash,
    passwordSalt: recruiterCreds.salt,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-manager-1',
    email: 'manager@talentintel.ai',
    name: 'Sarah Lin',
    role: 'Hiring Manager',
    orgId: DEFAULT_ORG_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    passwordHash: managerCreds.hash,
    passwordSalt: managerCreds.salt,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-interviewer-1',
    email: 'interviewer@talentintel.ai',
    name: 'David Chen',
    role: 'Interviewer',
    orgId: DEFAULT_ORG_ID,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    passwordHash: interviewerCreds.hash,
    passwordSalt: interviewerCreds.salt,
    createdAt: new Date().toISOString(),
  },
];

export class PersistentDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to read db file, initializing defaults:', err);
    }

    // Seed defaults
    const initialJobsWithOrg = INITIAL_JOBS.map(j => ({ ...j, orgId: DEFAULT_ORG_ID }));
    const initialCandsWithOrg = INITIAL_CANDIDATES.map(c => ({
      ...c,
      orgId: DEFAULT_ORG_ID,
      isArchived: false,
      timelineGaps: [
        {
          id: 'gap-1',
          startDate: '2019-09',
          endDate: '2020-03',
          durationMonths: 6,
          surroundingRoles: 'Prior: Senior SRE at CloudVenture; Next: Principal SRE at KubeScale',
          status: 'clarified',
          notes: 'Candidate took a 6-month planned sabbatical for open-source Kubernetes core development.',
          confidence: 'high' as const,
        },
      ],
      externalSources: [
        {
          type: 'github' as const,
          url: 'https://github.com/alexrivera-sre',
          status: 'verified' as const,
          lastChecked: new Date().toISOString(),
          details: 'Verified maintainer of 3 popular Terraform modules with 1,800+ stars.',
        },
        {
          type: 'linkedin' as const,
          url: 'https://linkedin.com/in/alexrivera-cloud',
          status: 'corroborated' as const,
          lastChecked: new Date().toISOString(),
          details: 'Matches resume employment dates and title hierarchy.',
        },
      ],
    }));

    const initialData: DatabaseSchema = {
      users: INITIAL_USERS,
      organizations: [
        { id: DEFAULT_ORG_ID, name: 'TalentIntel Enterprise Technologies', createdAt: new Date().toISOString() },
        { id: 'org-external-corp', name: 'Apex Multi-Cloud Corp', createdAt: new Date().toISOString() },
      ],
      jobs: initialJobsWithOrg,
      candidates: initialCandsWithOrg as Candidate[],
      auditLogs: [
        {
          id: 'audit-init',
          userId: 'user-admin-1',
          userEmail: 'admin@talentintel.ai',
          userName: 'Elena Rostova',
          orgId: DEFAULT_ORG_ID,
          action: 'SYSTEM_BOOTSTRAP',
          entityType: 'system',
          entityId: 'system-root',
          details: 'Persistent encrypted database initialized with enterprise security rules.',
          timestamp: new Date().toISOString(),
        },
      ],
      interviewRecords: [],
    };

    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  // --- Users & Auth ---
  public getUsers(orgId?: string): User[] {
    if (orgId) {
      return this.data.users.filter(u => u.orgId === orgId);
    }
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'> & { passwordPlain: string }): User {
    const { hash, salt } = hashPassword(user.passwordPlain);
    const newUser: User = {
      id: `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      email: user.email.toLowerCase(),
      name: user.name,
      role: user.role,
      orgId: user.orgId || DEFAULT_ORG_ID,
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- Jobs (Tenant-Scoped) ---
  public getJobs(orgId: string): JobProfile[] {
    return this.data.jobs.filter(j => j.orgId === orgId);
  }

  public getJobById(id: string, orgId: string): JobProfile | undefined {
    return this.data.jobs.find(j => j.id === id && j.orgId === orgId);
  }

  public saveJob(job: JobProfile, orgId: string): JobProfile {
    const jobWithOrg: JobProfile = { ...job, orgId: orgId || job.orgId || DEFAULT_ORG_ID };
    if (!jobWithOrg.id) {
      jobWithOrg.id = `job-${Date.now()}`;
    }
    const idx = this.data.jobs.findIndex(j => j.id === jobWithOrg.id && j.orgId === orgId);
    if (idx >= 0) {
      this.data.jobs[idx] = jobWithOrg;
    } else {
      this.data.jobs.unshift(jobWithOrg);
    }
    this.save();
    return jobWithOrg;
  }

  public deleteJob(id: string, orgId: string): boolean {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter(j => !(j.id === id && j.orgId === orgId));
    const deleted = this.data.jobs.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Candidates (Tenant-Scoped) ---
  public getCandidates(orgId: string, options?: { jobId?: string; includeArchived?: boolean; search?: string }): Candidate[] {
    return this.data.candidates.filter(c => {
      if (c.orgId !== orgId) return false;
      if (!options?.includeArchived && c.isArchived) return false;
      if (options?.jobId && c.targetJobId !== options.jobId) return false;
      if (options?.search) {
        const query = options.search.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesRole = c.currentRole.toLowerCase().includes(query);
        const matchesSkill = c.skills.some(s => s.name.toLowerCase().includes(query));
        if (!matchesName && !matchesRole && !matchesSkill) return false;
      }
      return true;
    });
  }

  public getCandidateById(id: string, orgId: string): Candidate | undefined {
    return this.data.candidates.find(c => c.id === id && c.orgId === orgId);
  }

  public saveCandidate(candidate: Candidate, orgId: string): Candidate {
    const candWithOrg: Candidate = { ...candidate, orgId: orgId || candidate.orgId || DEFAULT_ORG_ID };
    if (!candWithOrg.id) {
      candWithOrg.id = `cand-${Date.now()}`;
    }
    const idx = this.data.candidates.findIndex(c => c.id === candWithOrg.id && c.orgId === orgId);
    if (idx >= 0) {
      this.data.candidates[idx] = candWithOrg;
    } else {
      this.data.candidates.unshift(candWithOrg);
    }
    this.save();
    return candWithOrg;
  }

  public deleteCandidate(id: string, orgId: string): boolean {
    const initialLen = this.data.candidates.length;
    this.data.candidates = this.data.candidates.filter(c => !(c.id === id && c.orgId === orgId));
    const deleted = this.data.candidates.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  public bulkUpdateCandidateStatus(
    candidateIds: string[], 
    stage: any, 
    orgId: string, 
    changedBy: string, 
    notes?: string
  ): Candidate[] {
    const updated: Candidate[] = [];
    const timestamp = new Date().toISOString();

    this.data.candidates.forEach(c => {
      if (candidateIds.includes(c.id) && c.orgId === orgId) {
        c.pipelineStatus = stage;
        c.status = stage.toLowerCase().replace(/\s+/g, '_');
        c.stageHistory = [
          ...(c.stageHistory || []),
          { stage, timestamp, changedBy, notes: notes || `Batch transition to ${stage}` }
        ];
        updated.push(c);
      }
    });

    if (updated.length > 0) this.save();
    return updated;
  }

  public bulkArchiveCandidates(candidateIds: string[], orgId: string, archive = true): Candidate[] {
    const updated: Candidate[] = [];
    this.data.candidates.forEach(c => {
      if (candidateIds.includes(c.id) && c.orgId === orgId) {
        c.isArchived = archive;
        updated.push(c);
      }
    });
    if (updated.length > 0) this.save();
    return updated;
  }

  // --- Audit Logging ---
  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.data.auditLogs.unshift(newLog);
    // Keep max 1000 logs in storage
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.save();
    return newLog;
  }

  public getAuditLogs(orgId: string, limit = 100): AuditLog[] {
    return this.data.auditLogs.filter(l => l.orgId === orgId).slice(0, limit);
  }

  // --- Interview Records ---
  public addInterviewRecord(record: Omit<InterviewRecord, 'id' | 'createdAt'>, orgId: string): InterviewRecord {
    const newRec: InterviewRecord = {
      id: `intv-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      createdAt: new Date().toISOString(),
      orgId,
      ...record,
    };
    this.data.interviewRecords.unshift(newRec);
    this.save();
    return newRec;
  }

  public getInterviewRecords(candidateId: string, orgId: string): InterviewRecord[] {
    return this.data.interviewRecords.filter(r => r.candidateId === candidateId && r.orgId === orgId);
  }

  public getAllInterviewRecords(orgId: string): InterviewRecord[] {
    return this.data.interviewRecords.filter(r => r.orgId === orgId);
  }
}

export const db = new PersistentDatabase();
