import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  Candidate, 
  JobProfile, 
  AuditLog, 
  User, 
  UserRole,
  InterviewRecord,
  HumanDecisionRecord,
  CandidateReviewAssignment,
  CandidateCollaborativeNote,
  JobHiringPolicy,
  UserInvitation,
  DataGovernancePolicy,
} from '../../src/types';
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
  humanDecisions: HumanDecisionRecord[];
  reviewAssignments: CandidateReviewAssignment[];
  collaborativeNotes: CandidateCollaborativeNote[];
  hiringPolicies: Record<string, JobHiringPolicy[]>;
  invitations: UserInvitation[];
  governancePolicies: Record<string, DataGovernancePolicy>;
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
        const parsed = JSON.parse(raw);
        if (!parsed.interviewRecords) parsed.interviewRecords = [];
        if (!parsed.candidates) parsed.candidates = [];
        if (!parsed.jobs) parsed.jobs = [];
        if (!parsed.auditLogs) parsed.auditLogs = [];
        if (!parsed.users) parsed.users = INITIAL_USERS;
        if (!parsed.organizations) parsed.organizations = [];
        if (!parsed.humanDecisions) parsed.humanDecisions = [];
        if (!parsed.reviewAssignments) parsed.reviewAssignments = [];
        if (!parsed.collaborativeNotes) parsed.collaborativeNotes = [];
        if (!parsed.hiringPolicies) parsed.hiringPolicies = {};
        if (!parsed.invitations) parsed.invitations = [];
        if (!parsed.governancePolicies) parsed.governancePolicies = {};
        return parsed;
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
      humanDecisions: [
        {
          id: 'dec-seed-1',
          candidateId: 'cand-1',
          jobId: 'job-1',
          orgId: DEFAULT_ORG_ID,
          actorId: 'user-manager-1',
          actorName: 'Sarah Lin',
          actorRole: 'Hiring Manager',
          decisionType: 'MOVE_TO_INTERVIEW',
          previousState: 'Screening',
          newState: 'Interview',
          reason: 'Strong public evidence corroborating Kubernetes and Terraform expertise. Proceed with Technical Deep-Dive.',
          evidenceContext: ['github-repo-terraform-modules', 'aws-cert-registry-lookup'],
          isOverride: false,
          aiRecommendationSnapshot: {
            recommendation: 'PROCEED_TO_TECHNICAL_REVIEW',
            fitScore: 92,
            confidence: 'High',
          },
          timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        },
      ],
      reviewAssignments: [
        {
          id: 'assign-seed-1',
          candidateId: 'cand-1',
          candidateName: 'Alex Rivera',
          jobId: 'job-1',
          orgId: DEFAULT_ORG_ID,
          assignedToUserId: 'user-interviewer-1',
          assignedToUserName: 'David Chen',
          assignedByUserId: 'user-manager-1',
          assignedByUserName: 'Sarah Lin',
          taskType: 'TECHNICAL_REVIEW',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 3600000 * 24 * 3).toISOString(),
          assignedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          notes: 'Focus on distributed consensus protocols and production outage recovery cases.',
        },
      ],
      collaborativeNotes: [
        {
          id: 'note-seed-1',
          candidateId: 'cand-1',
          orgId: DEFAULT_ORG_ID,
          authorId: 'user-recruiter-1',
          authorName: 'Marcus Vance',
          authorRole: 'Recruiter',
          authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          content: 'Candidate confirmed availability for technical panel next Tuesday. Compensation expectations align with budget.',
          mentions: ['Sarah Lin'],
          category: 'GENERAL',
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        },
      ],
      hiringPolicies: {
        'job-1': [
          {
            policyVersion: 1,
            name: 'Principal Infrastructure Policy v1',
            requiredSkillWeight: 40,
            preferredSkillWeight: 15,
            experienceWeight: 20,
            evidenceWeight: 15,
            projectsWeight: 10,
            minExperienceYears: 6,
            minEvidenceCoverage: 65,
            mandatoryCertifications: ['AWS Certified Solutions Architect - Professional'],
            requiredInterviewRounds: 2,
            allowAIAutoShortlist: false,
            updatedAt: new Date().toISOString(),
            updatedBy: 'Elena Rostova',
          },
        ],
      },
      invitations: [],
      governancePolicies: {
        [DEFAULT_ORG_ID]: {
          retentionPeriodDays: 365,
          anonymizeOnDelete: true,
          dataExportAllowed: true,
          auditLogRetentionDays: 730,
          updatedAt: new Date().toISOString(),
        },
      },
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

  public createUser(user: Omit<User, 'id' | 'createdAt' | 'avatarUrl'> & { avatarUrl?: string; passwordPlain: string }): User {
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

  public updateCandidate(id: string, updates: Partial<Candidate>, orgId: string): Candidate | undefined {
    const candidate = this.getCandidateById(id, orgId);
    if (!candidate) return undefined;
    Object.assign(candidate, updates);
    this.save();
    return candidate;
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
  public addInterviewRecord(record: Omit<InterviewRecord, 'id' | 'createdAt' | 'orgId'> & { orgId?: string }, orgId: string): InterviewRecord {
    const finalOrgId = orgId || record.orgId || DEFAULT_ORG_ID;
    const newRec: InterviewRecord = {
      id: `intv-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      createdAt: new Date().toISOString(),
      ...record,
      orgId: finalOrgId,
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

  // --- Human Decisions & Overrides (Prompt 4) ---
  public addHumanDecision(
    decision: Omit<HumanDecisionRecord, 'id' | 'timestamp'>,
    orgId: string
  ): HumanDecisionRecord {
    const finalOrgId = orgId || decision.orgId || DEFAULT_ORG_ID;
    const newDec: HumanDecisionRecord = {
      id: `dec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
      ...decision,
      orgId: finalOrgId,
    };
    if (!this.data.humanDecisions) this.data.humanDecisions = [];
    this.data.humanDecisions.unshift(newDec);
    this.save();
    return newDec;
  }

  public getHumanDecisions(candidateId: string, orgId: string): HumanDecisionRecord[] {
    if (!this.data.humanDecisions) return [];
    return this.data.humanDecisions.filter(d => d.candidateId === candidateId && d.orgId === orgId);
  }

  public getAllHumanDecisions(orgId: string): HumanDecisionRecord[] {
    if (!this.data.humanDecisions) return [];
    return this.data.humanDecisions.filter(d => d.orgId === orgId);
  }

  // --- Collaborative Review Assignments ---
  public addReviewAssignment(
    assignment: Omit<CandidateReviewAssignment, 'id' | 'assignedAt'>,
    orgId: string
  ): CandidateReviewAssignment {
    const finalOrgId = orgId || assignment.orgId || DEFAULT_ORG_ID;
    const newAssign: CandidateReviewAssignment = {
      id: `assign-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      assignedAt: new Date().toISOString(),
      ...assignment,
      orgId: finalOrgId,
    };
    if (!this.data.reviewAssignments) this.data.reviewAssignments = [];
    this.data.reviewAssignments.unshift(newAssign);
    this.save();
    return newAssign;
  }

  public getReviewAssignments(
    orgId: string,
    options?: { candidateId?: string; assignedToUserId?: string; status?: string }
  ): CandidateReviewAssignment[] {
    if (!this.data.reviewAssignments) return [];
    return this.data.reviewAssignments.filter(a => {
      if (a.orgId !== orgId) return false;
      if (options?.candidateId && a.candidateId !== options.candidateId) return false;
      if (options?.assignedToUserId && a.assignedToUserId !== options.assignedToUserId) return false;
      if (options?.status && a.status !== options.status) return false;
      return true;
    });
  }

  public updateReviewAssignment(
    id: string,
    updates: Partial<CandidateReviewAssignment>,
    orgId: string
  ): CandidateReviewAssignment | undefined {
    if (!this.data.reviewAssignments) return undefined;
    const idx = this.data.reviewAssignments.findIndex(a => a.id === id && a.orgId === orgId);
    if (idx === -1) return undefined;

    const existing = this.data.reviewAssignments[idx];
    const updated: CandidateReviewAssignment = {
      ...existing,
      ...updates,
      completedAt: updates.status === 'COMPLETED' ? new Date().toISOString() : existing.completedAt,
    };
    this.data.reviewAssignments[idx] = updated;
    this.save();
    return updated;
  }

  // --- Collaborative Notes & Comments ---
  public addCollaborativeNote(
    note: Omit<CandidateCollaborativeNote, 'id' | 'createdAt'>,
    orgId: string
  ): CandidateCollaborativeNote {
    const finalOrgId = orgId || note.orgId || DEFAULT_ORG_ID;
    const newNote: CandidateCollaborativeNote = {
      id: `note-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      createdAt: new Date().toISOString(),
      ...note,
      orgId: finalOrgId,
    };
    if (!this.data.collaborativeNotes) this.data.collaborativeNotes = [];
    this.data.collaborativeNotes.unshift(newNote);
    this.save();
    return newNote;
  }

  public getCollaborativeNotes(candidateId: string, orgId: string): CandidateCollaborativeNote[] {
    if (!this.data.collaborativeNotes) return [];
    return this.data.collaborativeNotes.filter(n => n.candidateId === candidateId && n.orgId === orgId);
  }

  public deleteCollaborativeNote(noteId: string, orgId: string): boolean {
    if (!this.data.collaborativeNotes) return false;
    const initialLen = this.data.collaborativeNotes.length;
    this.data.collaborativeNotes = this.data.collaborativeNotes.filter(n => !(n.id === noteId && n.orgId === orgId));
    const deleted = this.data.collaborativeNotes.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Job Hiring Policies with Versioning ---
  public getJobHiringPolicy(jobId: string, orgId: string): JobHiringPolicy | undefined {
    if (!this.data.hiringPolicies || !this.data.hiringPolicies[jobId]) {
      // Return default template policy
      return {
        policyVersion: 1,
        name: 'Default Enterprise Hiring Policy v1',
        requiredSkillWeight: 40,
        preferredSkillWeight: 15,
        experienceWeight: 20,
        evidenceWeight: 15,
        projectsWeight: 10,
        minExperienceYears: 3,
        minEvidenceCoverage: 60,
        mandatoryCertifications: [],
        requiredInterviewRounds: 2,
        allowAIAutoShortlist: false,
        updatedAt: new Date().toISOString(),
        updatedBy: 'System Policy Engine',
      };
    }
    const policies = this.data.hiringPolicies[jobId];
    return policies[policies.length - 1]; // return latest version
  }

  public getJobHiringPolicyHistory(jobId: string, orgId: string): JobHiringPolicy[] {
    if (!this.data.hiringPolicies || !this.data.hiringPolicies[jobId]) {
      const defaultPol = this.getJobHiringPolicy(jobId, orgId);
      return defaultPol ? [defaultPol] : [];
    }
    return this.data.hiringPolicies[jobId];
  }

  public saveJobHiringPolicy(
    jobId: string,
    policy: Omit<JobHiringPolicy, 'policyVersion' | 'updatedAt'>,
    orgId: string,
    updatedBy: string
  ): JobHiringPolicy {
    if (!this.data.hiringPolicies) this.data.hiringPolicies = {};
    if (!this.data.hiringPolicies[jobId]) this.data.hiringPolicies[jobId] = [];

    const history = this.data.hiringPolicies[jobId];
    const nextVersion = history.length + 1;

    const newPolicy: JobHiringPolicy = {
      ...policy,
      policyVersion: nextVersion,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'Authorized HR User',
    };

    history.push(newPolicy);
    this.save();
    return newPolicy;
  }

  // --- User Administration & Invitations ---
  public createInvitation(
    invitation: Omit<UserInvitation, 'id' | 'createdAt' | 'token' | 'status' | 'expiresAt'> & { expiresAt?: string }
  ): UserInvitation {
    const token = `inv-${crypto.randomBytes(16).toString('hex')}`;
    const newInv: UserInvitation = {
      id: `inv-id-${Date.now()}`,
      token,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: invitation.expiresAt || new Date(Date.now() + 7 * 24 * 3600000).toISOString(), // 7 days
      ...invitation,
    };
    if (!this.data.invitations) this.data.invitations = [];
    this.data.invitations.unshift(newInv);
    this.save();
    return newInv;
  }

  public getInvitations(orgId: string): UserInvitation[] {
    if (!this.data.invitations) return [];
    return this.data.invitations.filter(i => i.orgId === orgId);
  }

  public getInvitationByToken(token: string): UserInvitation | undefined {
    if (!this.data.invitations) return undefined;
    return this.data.invitations.find(i => i.token === token && i.status === 'PENDING' && new Date(i.expiresAt) > new Date());
  }

  public acceptInvitation(token: string, passwordPlain: string): User | undefined {
    const inv = this.getInvitationByToken(token);
    if (!inv) return undefined;

    inv.status = 'ACCEPTED';
    const newUser = this.createUser({
      email: inv.email,
      name: inv.name,
      role: inv.role,
      orgId: inv.orgId,
      passwordPlain,
    });
    this.save();
    return newUser;
  }

  public deleteUser(userId: string, orgId: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => !(u.id === userId && u.orgId === orgId));
    const deleted = this.data.users.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  public updateUserRole(userId: string, newRole: UserRole, orgId: string): User | undefined {
    const user = this.data.users.find(u => u.id === userId && u.orgId === orgId);
    if (!user) return undefined;
    user.role = newRole;
    this.save();
    return user;
  }

  // --- Data Governance & Retention ---
  public getGovernancePolicy(orgId: string): DataGovernancePolicy {
    if (!this.data.governancePolicies || !this.data.governancePolicies[orgId]) {
      return {
        retentionPeriodDays: 365,
        anonymizeOnDelete: true,
        dataExportAllowed: true,
        auditLogRetentionDays: 730,
        updatedAt: new Date().toISOString(),
      };
    }
    return this.data.governancePolicies[orgId];
  }

  public updateGovernancePolicy(orgId: string, updates: Partial<DataGovernancePolicy>): DataGovernancePolicy {
    if (!this.data.governancePolicies) this.data.governancePolicies = {};
    const existing = this.getGovernancePolicy(orgId);
    const updated: DataGovernancePolicy = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.governancePolicies[orgId] = updated;
    this.save();
    return updated;
  }

  public anonymizeCandidate(candidateId: string, orgId: string, actorName: string): Candidate | undefined {
    const candidate = this.getCandidateById(candidateId, orgId);
    if (!candidate) return undefined;

    // GDPR / CCPA right-to-be-forgotten compliant anonymization
    candidate.name = `Anonymized Candidate #${candidate.id.slice(-4)}`;
    candidate.email = `redacted-${candidate.id.slice(-4)}@anonymized.talentintel.local`;
    candidate.avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
    candidate.location = 'Redacted';
    candidate.summary = 'Personal identifying information anonymized in accordance with enterprise data retention policy.';
    candidate.salaryExpectation = 'Redacted';
    candidate.isArchived = true;
    candidate.status = 'anonymized';

    // Strip PII from experience & education while preserving anonymized skill/role telemetry
    candidate.experiences = (candidate.experiences || []).map(e => ({
      ...e,
      company: `Company #${Math.floor(Math.random() * 900 + 100)}`,
      location: 'Redacted',
    }));

    candidate.education = (candidate.education || []).map(ed => ({
      ...ed,
      institution: 'Higher Education Institution (Redacted)',
    }));

    if (candidate.externalSources) {
      candidate.externalSources = candidate.externalSources.map(s => ({
        ...s,
        url: 'https://redacted-pii.talentintel.local',
      }));
    }

    this.save();
    return candidate;
  }
}

export const db = new PersistentDatabase();

