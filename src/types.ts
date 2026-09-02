export type VerificationStatus = 'verified' | 'unverified' | 'exaggerated' | 'flagged';

export type UserRole = 
  | 'Super Admin' 
  | 'Admin' 
  | 'HR' 
  | 'Recruiter' 
  | 'Hiring Manager' 
  | 'Interviewer' 
  | 'HR Reviewer' 
  | 'Viewer';

export type AppPermission = 
  | 'candidate:view'
  | 'candidate:create'
  | 'candidate:update'
  | 'candidate:delete'
  | 'candidate:analyze'
  | 'candidate:verify'
  | 'decision:view'
  | 'decision:create'
  | 'decision:override'
  | 'interview:evaluate'
  | 'collaboration:comment'
  | 'assignment:manage'
  | 'analytics:view'
  | 'audit:view'
  | 'admin:manage_users'
  | 'admin:manage_roles'
  | 'admin:manage_policies'
  | 'data:export'
  | 'data:delete';

export const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  'Super Admin': [
    'candidate:view', 'candidate:create', 'candidate:update', 'candidate:delete',
    'candidate:analyze', 'candidate:verify', 'decision:view', 'decision:create', 'decision:override',
    'interview:evaluate', 'collaboration:comment', 'assignment:manage', 'analytics:view', 'audit:view',
    'admin:manage_users', 'admin:manage_roles', 'admin:manage_policies', 'data:export', 'data:delete'
  ],
  'Admin': [
    'candidate:view', 'candidate:create', 'candidate:update', 'candidate:delete',
    'candidate:analyze', 'candidate:verify', 'decision:view', 'decision:create', 'decision:override',
    'interview:evaluate', 'collaboration:comment', 'assignment:manage', 'analytics:view', 'audit:view',
    'admin:manage_users', 'admin:manage_roles', 'admin:manage_policies', 'data:export', 'data:delete'
  ],
  'HR': [
    'candidate:view', 'candidate:create', 'candidate:update',
    'candidate:analyze', 'candidate:verify', 'decision:view', 'decision:create', 'decision:override',
    'interview:evaluate', 'collaboration:comment', 'assignment:manage', 'analytics:view', 'audit:view',
    'data:export'
  ],
  'Hiring Manager': [
    'candidate:view', 'candidate:update',
    'candidate:analyze', 'candidate:verify', 'decision:view', 'decision:create', 'decision:override',
    'interview:evaluate', 'collaboration:comment', 'assignment:manage', 'analytics:view', 'audit:view',
    'data:export'
  ],
  'Recruiter': [
    'candidate:view', 'candidate:create', 'candidate:update',
    'candidate:analyze', 'candidate:verify', 'decision:view', 'decision:create',
    'interview:evaluate', 'collaboration:comment', 'analytics:view', 'audit:view',
    'data:export'
  ],
  'HR Reviewer': [
    'candidate:view', 'candidate:analyze', 'candidate:verify', 'decision:view', 'decision:create',
    'interview:evaluate', 'collaboration:comment', 'analytics:view'
  ],
  'Interviewer': [
    'candidate:view', 'interview:evaluate', 'collaboration:comment'
  ],
  'Viewer': [
    'candidate:view', 'decision:view', 'analytics:view'
  ]
};

export type SourceAttribution = 
  | 'Candidate Provided'
  | 'Observed'
  | 'Corroborated'
  | 'Verified'
  | 'AI Inference'
  | 'Synthetic/Demo';

export type EvidenceStrength = 'STRONG' | 'MODERATE' | 'WEAK' | 'INSUFFICIENT' | 'CONFLICTING';

export type SourceTrustLevel = 
  | 'Candidate-reported'
  | 'Publicly observable evidence'
  | 'Potentially verified'
  | 'External self-reported/public'
  | 'Third-party verified';

export type SourceReliabilityTier = 
  | 'AUTHORITATIVE'
  | 'OBSERVABLE'
  | 'CORROBORATED'
  | 'SELF_REPORTED'
  | 'UNVERIFIED';

export type SourceFreshness = 'FRESH' | 'STALE' | 'UNKNOWN';

export type ClaimPriority = 'CRITICAL' | 'IMPORTANT' | 'SUPPORTING';

export type VerificationPriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EvidenceVerificationState = 
  | 'VERIFIED'
  | 'PARTIALLY_VERIFIED'
  | 'CANDIDATE_REPORTED'
  | 'UNVERIFIED'
  | 'CONFLICTING'
  | 'INSUFFICIENT_EVIDENCE';

export type ExperienceIntegritySupport = 
  | 'SUPPORTED'
  | 'PARTIALLY SUPPORTED'
  | 'UNSUPPORTED'
  | 'CONFLICTING'
  | 'INSUFFICIENT EVIDENCE';

export type ClaimType = 
  | 'employment_period'
  | 'skill_experience'
  | 'project_authorship'
  | 'certification'
  | 'metric_achievement'
  | 'education'
  | 'leadership_scope';

export type CertificationVerificationStatus = 
  | 'Candidate-reported'
  | 'Verification pending'
  | 'Verified'
  | 'Expired'
  | 'Invalid'
  | 'Unable to verify';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
  avatarUrl: string;
  passwordHash?: string;
  passwordSalt?: string;
  createdAt: string;
}

export interface SourceProvenance {
  documentId?: string;
  documentName?: string;
  section?: string;
  pageNumber?: number;
  lineRange?: string;
  commitSha?: string;
  repoUrl?: string;
  credentialId?: string;
  registryUrl?: string;
  extractedAt: string;
  contentReference?: string;
}

export interface EvidenceRecord {
  id: string;
  claimId?: string;
  candidateId: string;
  sourceType: 'resume_document' | 'public_github_repo' | 'official_certification_registry' | 'public_linkedin_profile' | 'portfolio_site' | 'interview_transcript' | 'external_source';
  sourceUrlOrDoc: string;
  sourceReference: string; // section, line number, commit SHA, cert ID, etc.
  evidenceText: string;
  timestamp: string;
  strength: EvidenceStrength;
  confidence: number; // 0-100
  attribution: SourceAttribution;
  provenance?: SourceProvenance;
}

export interface DetailedClaim {
  claim_id: string;
  candidate_id: string;
  claim_type: ClaimType;
  claim_text: string;
  source: 'resume' | 'linkedin' | 'github' | 'portfolio' | 'interview' | 'certification';
  source_reference: string;
  created_at: string;
  confidence: 'high' | 'medium' | 'low';
  verification_status: VerificationStatus | 'corroborated' | 'conflicting';
  verification_state?: EvidenceVerificationState;
  claim_priority?: ClaimPriority;
  integrity_support: ExperienceIntegritySupport;
  evidence_ids: string[];
  provenance?: SourceProvenance;
  counterEvidenceIds?: string[];
  recommendedAction?: string;
}

export interface EvidenceCoverageMetrics {
  overallCoverageScore: number; // 0-100
  verifiedPercentage: number;
  partialPercentage: number;
  unverifiedPercentage: number;
  conflictingPercentage: number;
  criticalClaimsCoverageScore: number; // 0-100
  verifiedClaimsCount: number;
  partialClaimsCount: number;
  unverifiedClaimsCount: number;
  conflictingClaimsCount: number;
  totalClaimsCount: number;
  coverageAssessment: string;
}

export interface VerificationQueueItem {
  id: string;
  candidateId: string;
  claimId?: string;
  title: string;
  description: string;
  claimPriority: ClaimPriority;
  verificationPriority: VerificationPriorityLevel;
  priorityScore: number; // 0-100 calculated from factors
  priorityRationale: string; // "Required core skill with weak evidence" / "Employment date conflict"
  conflictSeverity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  evidenceWeakness: 'WEAK' | 'INSUFFICIENT' | 'CONFLICTING' | 'MODERATE' | 'NONE';
  decisionRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'VERIFIED' | 'INFO_REQUESTED' | 'REVIEWED' | 'DISMISSED';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  evidenceSources: string[];
  suggestedAction: string;
  category: 'timeline' | 'skill' | 'project' | 'certification' | 'experience';
}

export interface SourceReliabilityProfile {
  sourceType: string;
  sourceName: string;
  url?: string;
  reliabilityTier: SourceReliabilityTier;
  reliabilityExplanation: string;
  freshness: SourceFreshness;
  lastAudited: string;
  provenanceDetails?: SourceProvenance;
  claimsCount: number;
  evidenceCount: number;
}

export interface SkillVerificationRecord {
  skillName: string;
  claimedProficiency: 'expert' | 'proficient' | 'familiar';
  isJobRequired: boolean;
  evidenceStatus: 'STRONG_EVIDENCE' | 'MODERATE_EVIDENCE' | 'INSUFFICIENT_EVIDENCE' | 'NO_EVIDENCE_FOUND';
  evidenceSources: string[];
  confidenceScore: number; // 0-100
  evidenceStrength: EvidenceStrength;
  absenceOfEvidenceNotice?: string;
  groundedProjects: string[];
  demonstratedTenureYears?: number;
}

export interface EvidenceGraphNode {
  id: string;
  label: string;
  type: 'candidate' | 'claim' | 'source' | 'evidence' | 'company' | 'skill' | 'project' | 'education' | 'certification';
  status?: string;
  priority?: ClaimPriority | VerificationPriorityLevel;
  confidence?: number;
  details?: string;
  sourceAttribution?: SourceAttribution;
}

export interface EvidenceGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: 'CLAIMS' | 'SUPPORTED_BY' | 'CONTRADICTS' | 'MENTIONS' | 'WORKED_AT' | 'USED_SKILL' | 'CONTRIBUTES_TO' | 'VERIFIED_BY' | 'RELATED_TO';
  strength?: EvidenceStrength;
  notes?: string;
}

export interface EvidenceGraphData {
  nodes: EvidenceGraphNode[];
  edges: EvidenceGraphEdge[];
}

export interface CandidateCertification {
  id: string;
  name: string;
  issuer: string;
  issuingOrganization?: string;
  credentialId?: string;
  issueDate?: string;
  expiryDate?: string;
  verificationSource?: string;
  verificationUrl?: string;
  verificationStatus: CertificationVerificationStatus;
  verificationTimestamp?: string;
  evidenceStrength?: EvidenceStrength;
  evidenceNotes?: string;
}

export interface ProjectOwnershipAnalysis {
  projectName: string;
  claimedRole: string;
  repoUrl?: string;
  evidenceStrength: 'Strong' | 'Moderate' | 'Weak' | 'Insufficient evidence';
  observedSignals: {
    isOwnerOrMaintainer?: boolean;
    commitActivityAvailable: boolean;
    publicActivityDetails?: string;
    prOrIssueContributions?: string;
    languageBreakdown?: string[];
    dataStatus: 'available' | 'unavailable';
  };
  notes: string;
}

export interface CrossSourceConsistencyReport {
  matchingSignals: string[];
  missingSignals: string[];
  conflicts: {
    category: 'timeline' | 'role_title' | 'education' | 'certification' | 'project';
    description: string;
    sourceA: { name: string; text: string };
    sourceB: { name: string; text: string };
    recommendedAction: string;
  }[];
  integrityRiskScore: {
    level: 'Low' | 'Medium' | 'High';
    calculationMethod: 'Rule-based risk assessment';
    signals: {
      name: string;
      evidenceStrength: 'Strong' | 'Moderate' | 'Weak';
      status: string;
    }[];
    humanVerificationRecommended: boolean;
  };
}

export interface DocumentChunk {
  chunk_id: string;
  candidate_id: string;
  organization_id: string;
  source_type: 'resume' | 'job_spec' | 'github_profile' | 'interview_notes' | 'certification_record';
  source_id: string;
  document_id: string;
  title: string;
  content: string;
  metadata: {
    section?: string;
    pageNumber?: number;
    attribution: SourceAttribution;
    confidence: number;
  };
  embedding?: number[];
}

export interface StructuredAIOutput {
  conclusion: string;
  confidence: 'High' | 'Medium' | 'Low';
  claims: string[];
  evidence: string[];
  contradictions: string[];
  limitations: string[];
  recommended_action: string;
}

export interface RAGRetrievalResult {
  query: string;
  retrievedChunks: {
    chunk: DocumentChunk;
    score: number;
    matchType: 'semantic' | 'keyword' | 'hybrid';
  }[];
  structuredOutput?: StructuredAIOutput;
}

export type ExternalSourceStatus = 
  | 'not_added'
  | 'added'
  | 'processing'
  | 'provided'
  | 'reachable'
  | 'parsed'
  | 'corroborated'
  | 'verified'
  | 'verification_pending'
  | 'unavailable'
  | 'failed'
  | 'conflicting';

export interface ExternalSourceRecord {
  type: 'github' | 'linkedin' | 'portfolio' | 'google_scholar' | 'certification' | 'website' | 'other';
  url: string;
  status: ExternalSourceStatus;
  lastChecked: string;
  details?: string;
  error?: string;
  claimsCount?: number;
  evidenceCount?: number;
  confidenceScore?: number;
}

export interface CandidateDocumentRecord {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'certification_doc' | 'portfolio_doc' | 'other_document';
  format: string; // pdf, docx, txt, md
  sizeBytes: number;
  uploadDate: string;
  status: ExternalSourceStatus;
  parsedPassagesCount?: number;
  extractedClaimsCount?: number;
  notes?: string;
  fileUrl?: string;
}

export interface CandidateTimelineGap {
  id: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  surroundingRoles: string;
  status: 'detected' | 'clarified' | 'unresolved';
  notes?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface CandidateTimelineAnomaly {
  id: string;
  type: 'dual_employment_overlap' | 'date_conflict' | 'credential_mismatch' | 'unverified_claim';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  evidenceA: string;
  evidenceB: string;
  recommendedAction: string;
}

export interface ExplainableMatchBreakdown {
  overallScore: number;
  requiredSkillsMatch: number; // 0-100
  preferredSkillsMatch: number; // 0-100
  experienceScore: number; // 0-100
  projectsScore?: number; // 0-100
  educationScore?: number; // 0-100
  evidenceStrengthScore?: number; // 0-100
  systemDesignScore: number; // 0-100
  leadershipScore: number; // 0-100
  missingRequiredSkills: string[];
  matchedRequiredSkills: string[];
  missingPreferredSkills: string[];
  matchedPreferredSkills: string[];
  semanticMatches?: SemanticSkillMatchDetail[];
  concerns?: string[];
  evidenceFound: string[];
  confidence: 'High' | 'Medium' | 'Low';
  calculationMethod: string;
  scoringFormula?: string;
}

export interface InterviewRecord {
  id: string;
  candidateId: string;
  orgId: string;
  interviewerId: string;
  interviewerName: string;
  interviewerRole: string;
  stage: 'Initial Screen' | 'Technical Deep-Dive' | 'System Architecture' | 'Hiring Committee';
  date: string;
  scores: Record<string, number>;
  notes: string;
  recommendation: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Leaning No Hire' | 'No Hire';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  orgId: string;
  action: string;
  entityType: 'candidate' | 'job' | 'claim' | 'interview' | 'system' | 'auth' | 'user' | 'organization';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface ClaimVerification {
  id: string;
  claim: string;
  category: 'experience' | 'metric' | 'skill' | 'education' | 'leadership';
  status: VerificationStatus;
  confidenceScore: number; // 0-100
  evidenceSource: string;
  analysisNotes: string;
  followUpQuestion: string;
}

export interface CandidateExperience {
  company: string;
  role: string;
  period: string;
  durationYears: number;
  location: string;
  highlights: string[];
  technologies: string[];
  verifiedTenure: boolean;
}

export interface CandidateEducation {
  institution: string;
  degree: string;
  field: string;
  year: string;
  verified: boolean;
}

export interface CompetencyScore {
  name: string;
  score: number; // 0-100
  benchmark: number; // 0-100
  evidenceCount: number;
  rationale: string;
  category: 'technical' | 'leadership' | 'system_design' | 'execution' | 'culture';
}

export interface AgentReasoningStep {
  agentName: string;
  agentRole: string;
  avatar: string;
  timestamp: string;
  action: string;
  findings: string;
  status: 'completed' | 'in_progress' | 'flagged' | 'pending';
  executionTimeMs: number;
  tokensUsed: number;
  evidenceItems?: string[];
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  context: string;
  targetCompetency: string;
  difficulty: 'intermediate' | 'advanced' | 'principal';
  evaluationRubric: {
    poor: string;
    good: string;
    exceptional: string;
  };
  sampleAnswerNotes?: string;
}

export type CandidatePipelineStatus = 
  | 'New'
  | 'Screening'
  | 'Shortlisted'
  | 'Interview'
  | 'Technical Round'
  | 'Final Round'
  | 'Offer'
  | 'Hired'
  | 'Rejected'
  | 'On Hold';

export interface StageTransitionRecord {
  stage: CandidatePipelineStatus | string;
  timestamp?: string;
  enteredAt?: string;
  changedBy?: string;
  updatedBy?: string;
  notes?: string;
}

export interface CandidateDuplicateFlag {
  isDuplicate: boolean;
  matchedCandidateId?: string;
  matchedName?: string;
  matchedRole?: string;
  confidenceScore: number;
  reason: string;
  dismissed?: boolean;
}

export interface SemanticSkillMatchDetail {
  requiredSkill: string;
  matchedWith: string;
  domain: string;
  confidence: number;
}

export interface ExplainableAIRecommendation {
  recommendation: string;
  reason: string;
  evidence: string[];
  confidence: 'High' | 'Medium' | 'Low';
  limitation: string;
}

export interface Candidate {
  id: string;
  orgId?: string;
  name: string;
  currentRole: string;
  currentCompany: string;
  avatarUrl: string;
  email: string;
  location: string;
  yearsOfExperience: number;
  targetJobId: string;
  appliedJobId?: string;
  overallFitScore: number; // 0-100
  verificationRating: number; // 0-100
  status: 'shortlisted' | 'in_interview' | 'offer_ready' | 'review_required' | 'rejected' | string;
  pipelineStatus?: CandidatePipelineStatus;
  stageHistory?: StageTransitionRecord[];
  decisionAudit?: any[];
  duplicateFlag?: CandidateDuplicateFlag;
  summary: string;
  salaryExpectation: string;
  noticePeriod: string;
  isArchived?: boolean;
  skills: { name: string; level: 'expert' | 'proficient' | 'familiar'; verified: boolean }[];
  experiences: CandidateExperience[];
  education: CandidateEducation[];
  claims: ClaimVerification[];
  competencies: CompetencyScore[];
  reasoningTrace: AgentReasoningStep[];
  interviewQuestions: InterviewQuestion[];
  keyStrengths: string[];
  potentialRisks: string[];
  timelineGaps?: CandidateTimelineGap[];
  timelineAnomalies?: CandidateTimelineAnomaly[];
  externalSources?: ExternalSourceRecord[];
  explainableMatch?: ExplainableMatchBreakdown;
  detailedClaims?: DetailedClaim[];
  evidenceRecords?: EvidenceRecord[];
  certifications?: CandidateCertification[];
  projectOwnership?: ProjectOwnershipAnalysis[];
  consistencyReport?: CrossSourceConsistencyReport;
  documents?: CandidateDocumentRecord[];
  explainableRecommendation?: ExplainableAIRecommendation;
  evidenceCoverage?: EvidenceCoverageMetrics;
  verificationQueue?: VerificationQueueItem[];
  sourceReliability?: SourceReliabilityProfile[];
  skillVerifications?: SkillVerificationRecord[];
  evidenceGraphData?: EvidenceGraphData;
  blindHiringScore: {
    biasChecked: boolean;
    diversityCalibration: string;
    anonymizedSummary: string;
  };
  githubOrPortfolioMetrics?: {
    publicRepos?: number;
    stars?: number;
    patents?: number;
    papersPublished?: number;
    verifiedContributions?: string;
  };
}

export interface JobProfile {
  id: string;
  orgId?: string;
  title: string;
  department: string;
  level: string;
  location: string;
  salaryRange: string;
  employmentType?: 'Full-time' | 'Contract' | 'Part-time' | 'Remote' | 'Hybrid' | 'On-site';
  experienceMin?: number;
  experienceMax?: number;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  optionalSkills?: string[];
  educationRequirements?: string[];
  certifications?: string[];
  responsibilities?: string[];
  status?: 'open' | 'closed' | 'draft';
  createdAt?: string;
  weightings: {
    technical: number;
    systemDesign: number;
    leadership: number;
    execution: number;
    cultureFit: number;
  };
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: { title: string; snippet: string }[];
  suggestedPrompts?: string[];
  contextType?: 'candidate' | 'job' | 'comparison' | 'general';
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'candidate' | 'company' | 'skill' | 'project' | 'degree' | 'metric';
  color?: string;
  val: number;
}

export interface KnowledgeGraphLink {
  source: string;
  target: string;
  relationship: string;
  verified: boolean;
}

export interface CandidateComparison {
  candidateIds: string[];
  competencyComparison: {
    competency: string;
    [candidateId: string]: number | string;
  }[];
  skillFitWinner?: string;
  experienceWinner?: string;
  evidenceWinner?: string;
  verdictSummary: string;
  recommendedPick: string;
}

export interface InterviewFeedbackAnalysis {
  overallVerdict: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Leaning No Hire' | 'No Hire';
  strengths: string[];
  weaknesses: string[];
  repeatedConcerns: string[];
  technicalGaps: string[];
  behavioralSignals: string[];
  nextInterviewRecommendations: {
    topic: string;
    reason: string;
    suggestedQuestion: string;
    rubricFocus: string;
  }[];
}

export interface HRPipelineAnalytics {
  totalCandidates: number;
  candidatesPerJob: { jobId: string; jobTitle: string; count: number }[];
  pipelineFunnel: { stage: CandidatePipelineStatus; count: number; percentage: number }[];
  verificationBreakdown: { verified: number; unverified: number; flagged: number; exaggerated: number };
  sourceDistribution: { source: string; count: number; percentage: number }[];
  topSkillsInDemand: { skill: string; candidateCount: number; matchRate: number }[];
  avgTimeToEvaluateDays: number;
}

// --- Prompt 4 Enterprise Types ---

export type HumanDecisionType = 
  | 'SHORTLIST' 
  | 'MOVE_TO_INTERVIEW' 
  | 'REQUEST_VERIFICATION' 
  | 'PUT_ON_HOLD' 
  | 'ADVANCE_STAGE' 
  | 'PROCEED_TO_OFFER'
  | 'REJECT_CANDIDATE'
  | 'REQUEST_SECOND_OPINION'
  | 'CALIBRATION_OVERRIDE'
  | 'REJECT' 
  | 'WITHDRAW' 
  | 'FINALIZE_HIRE';

export interface HumanDecisionRecord {
  id: string;
  candidateId: string;
  jobId: string;
  orgId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  decisionType: HumanDecisionType;
  previousState: CandidatePipelineStatus | string;
  newState: CandidatePipelineStatus | string;
  reason: string;
  evidenceContext: string[];
  isOverride: boolean;
  aiRecommendationSnapshot?: {
    recommendation: string;
    fitScore: number;
    confidence: string;
  };
  overrideReason?: string;
  timestamp: string;
}

export type DecisionReadinessLevel = 'READY_FOR_DECISION' | 'ACTION_REQUIRED' | 'INSUFFICIENT_DATA';

export interface DecisionReadinessMetric {
  status: DecisionReadinessLevel;
  requiredSkillsVerifiedPercentage: number;
  evidenceCoverageScore: number;
  interviewCompletedCount: number;
  requiredInterviewsCount: number;
  openVerificationIssuesCount: number;
  policyCompliance: {
    requirement: string;
    met: boolean;
    details: string;
  }[];
  summary: string;
}

export interface DecisionReadinessScore {
  candidateId: string;
  overallReadinessScore: number;
  readinessStatus: 'READY' | 'GATED' | 'BLOCKED';
  stageGates: {
    gateName: string;
    satisfied: boolean;
    details: string;
  }[];
}

export type AssignmentTaskType = 
  | 'EVIDENCE_VERIFICATION' 
  | 'TECHNICAL_REVIEW' 
  | 'INTERVIEW_EVALUATION' 
  | 'FINAL_DECISION'
  | 'EVIDENCE_AUDIT'
  | 'BACKGROUND_CHECK'
  | 'COMPENSATION_BENCHMARK'
  | 'HIRING_DECISION';

export type AssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'DECLINED';

export interface CandidateReviewAssignment {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  orgId: string;
  assignedToUserId: string;
  assignedToUserName: string;
  assignedByUserId: string;
  assignedByUserName: string;
  taskType: AssignmentTaskType;
  status: AssignmentStatus;
  dueDate: string;
  assignedAt: string;
  completedAt?: string;
  notes?: string;
}

export type NoteCategory = 
  | 'GENERAL' 
  | 'EVIDENCE_NOTE' 
  | 'INTERVIEW_FEEDBACK' 
  | 'VERIFICATION_FLAG' 
  | 'DECISION_RATIONALE'
  | 'General'
  | 'Technical Review'
  | 'Interview Feedback'
  | 'Compensation'
  | 'Integrity Flag'
  | 'Hiring Committee';

export interface CandidateCollaborativeNote {
  id: string;
  candidateId: string;
  orgId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  mentions?: string[];
  category: NoteCategory;
  isConfidential?: boolean;
  tags?: string[];
  createdAt: string;
}

export type CollaborativeNote = CandidateCollaborativeNote;

export interface JobHiringPolicy {
  policyVersion: number;
  name?: string;
  jobId?: string;
  minimumOverallFitScore?: number;
  minimumVerificationRating?: number;
  requiredInterviewRounds: number;
  requireHumanOverrideReason?: boolean;
  autoAdvanceQualifiedScores?: number;
  mandatorySkills?: string[];
  mandatoryCertifications?: string[];
  requiredSkillWeight?: number;
  preferredSkillWeight?: number;
  experienceWeight?: number;
  evidenceWeight?: number;
  projectsWeight?: number;
  minExperienceYears?: number;
  minEvidenceCoverage?: number;
  allowAIAutoShortlist?: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgId: string;
  invitedBy: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  createdAt: string;
  expiresAt: string;
}

export interface DataGovernancePolicy {
  retentionPeriodDays: number;
  autoMaskPIIAfterDays?: number | null;
  requireHumanOverrideJustification?: boolean;
  anonymizeOnDelete?: boolean;
  dataExportAllowed?: boolean;
  auditLogRetentionDays?: number;
  updatedAt: string;
}

export interface HumanVsAIAnalytics {
  totalAIRecommendations?: number;
  totalDecisionsRecorded: number;
  alignedDecisionsCount: number;
  acceptedDecisionsCount?: number;
  overrideDecisionsCount: number;
  overriddenDecisionsCount?: number;
  overallAlignmentRate: number;
  acceptanceRate?: number;
  overrideRate: number;
  commonOverrideReasons: { reason: string; count: number; percentage: number }[];
  topOverrideReasons?: { reason: string; count: number; percentage: number }[];
  overridesByRole?: { role: string; overridesCount: number; totalCount: number; rate: number }[];
  overridesByStage?: { stage: string; overridesCount: number }[];
}

export interface FairnessQualityMetrics {
  demographicParityStatus: 'COMPLIANT' | 'CALIBRATION_REQUIRED';
  blindScreeningParityScore: number;
  interviewerConsistencyScore: number;
  verificationCompletionRate: number;
  averageTimeToDecisionDays: number;
  parityByExperienceCohort?: {
    cohort: string;
    candidateCount: number;
    shortlistRate: number;
    avgEvidenceRating: number;
  }[];
  parityBySourceChannel?: {
    source: string;
    candidateCount: number;
    shortlistRate: number;
  }[];
  aiModelQuality?: {
    groundingScore: number;
    citationAccuracyRate: number;
    hallucinationSignalsDetected: number;
    avgLatencyMs: number;
    totalTokensConsumed: number;
    modelFailureRate: number;
  };
}

export interface CandidateActivityTimelineItem {
  id: string;
  type: 'intake' | 'claims_extracted' | 'verification' | 'interview' | 'review' | 'note' | 'stage_transition' | 'decision';
  title: string;
  description: string;
  actor: string;
  actorRole?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

