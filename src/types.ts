export type VerificationStatus = 'verified' | 'unverified' | 'exaggerated' | 'flagged';

export type UserRole = 'Admin' | 'HR' | 'Recruiter' | 'Hiring Manager' | 'Interviewer';

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
  integrity_support: ExperienceIntegritySupport;
  evidence_ids: string[];
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
  entityType: 'candidate' | 'job' | 'claim' | 'interview' | 'system' | 'auth';
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
  stage: CandidatePipelineStatus;
  timestamp: string;
  changedBy: string;
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
  overallFitScore: number; // 0-100
  verificationRating: number; // 0-100
  status: 'shortlisted' | 'in_interview' | 'offer_ready' | 'review_required' | 'rejected' | string;
  pipelineStatus?: CandidatePipelineStatus;
  stageHistory?: StageTransitionRecord[];
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
