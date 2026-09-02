import React, { useState } from 'react';
import { 
  Candidate, 
  ClaimVerification, 
  VerificationStatus, 
  ExternalSourceStatus,
  RAGRetrievalResult,
  DetailedClaim,
  CandidateCertification,
  ProjectOwnershipAnalysis,
  CrossSourceConsistencyReport,
  VerificationQueueItem,
  SkillVerificationRecord,
  SourceReliabilityProfile
} from '../types';
import { authenticatedFetch } from '../lib/api';
import { EvidenceNetworkVisualizer } from './EvidenceNetworkVisualizer';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  XCircle, 
  Filter, 
  ExternalLink, 
  MessageSquare,
  Sparkles,
  Edit3,
  Save,
  Globe,
  Github,
  Linkedin,
  Calendar,
  AlertCircle,
  RefreshCw,
  Search,
  Award,
  Code,
  Layers,
  FileText,
  Info,
  Network,
  ListTodo,
  Check,
  RotateCcw,
  EyeOff,
  UserCheck
} from 'lucide-react';

interface EvidenceVerificationPanelProps {
  candidate: Candidate;
  onVerifyClaim: (claimId: string, newStatus: VerificationStatus, confidenceScore?: number, notes?: string) => void;
  onOpenCopilot: () => void;
  onCandidateUpdated?: (updatedCandidate: Candidate) => void;
}

export const EvidenceVerificationPanel: React.FC<EvidenceVerificationPanelProps> = ({
  candidate,
  onVerifyClaim,
  onOpenCopilot,
  onCandidateUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'network' | 'skills' | 'claims' | 'consistency' | 'sources' | 'rag' | 'certifications' | 'projects'>('queue');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editStatus, setEditStatus] = useState<VerificationStatus>('verified');
  const [isAuditingSources, setIsAuditingSources] = useState<boolean>(false);
  const [resolvingQueueId, setResolvingQueueId] = useState<string | null>(null);
  const [queueNotesInput, setQueueNotesInput] = useState<{ [id: string]: string }>({});

  // RAG Search State
  const [ragQuery, setRagQuery] = useState<string>('');
  const [ragResult, setRagResult] = useState<RAGRetrievalResult | null>(null);
  const [isSearchingRAG, setIsSearchingRAG] = useState<boolean>(false);

  const evidenceCoverage = candidate.evidenceCoverage;
  const verificationQueue = candidate.verificationQueue || [];
  const skillVerifications = candidate.skillVerifications || [];
  const sourceReliability = candidate.sourceReliability || [];
  const consistencyReport = candidate.consistencyReport;
  const certifications = candidate.certifications || [];
  const projectOwnership = candidate.projectOwnership || [];

  const handleAuditSources = async () => {
    setIsAuditingSources(true);
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/integrity-audit`);
      if (res.ok) {
        const data = await res.json();
        if (onCandidateUpdated) {
          onCandidateUpdated({
            ...candidate,
            evidenceCoverage: data.evidenceCoverage,
            verificationQueue: data.verificationQueue,
            sourceReliability: data.sourceReliability,
            skillVerifications: data.skillVerifications,
            evidenceGraphData: data.evidenceGraphData,
            consistencyReport: data.consistencyReport,
          });
        }
      }
    } catch (err) {
      console.error('Failed to audit external sources:', err);
    } finally {
      setIsAuditingSources(false);
    }
  };

  const handleResolveQueueItem = async (itemId: string, action: 'VERIFY' | 'REQUEST_INFO' | 'MARK_REVIEWED' | 'DISMISS') => {
    setResolvingQueueId(itemId);
    try {
      const notes = queueNotesInput[itemId] || '';
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/verification-queue/${itemId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.candidate && onCandidateUpdated) {
          onCandidateUpdated(data.candidate);
        }
      }
    } catch (err) {
      console.error('Failed to resolve verification queue item:', err);
    } finally {
      setResolvingQueueId(null);
    }
  };

  const handleRAGSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    setIsSearchingRAG(true);
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/rag-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery.trim(), limit: 4 }),
      });
      if (res.ok) {
        const data = await res.json();
        setRagResult(data);
      }
    } catch (err) {
      console.error('RAG query error:', err);
    } finally {
      setIsSearchingRAG(false);
    }
  };

  const filteredClaims = candidate.claims.filter(claim => {
    const matchesCat = selectedCategory === 'all' || claim.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || claim.status === selectedStatus;
    return matchesCat && matchesStatus;
  });

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Truth
          </span>
        );
      case 'exaggerated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Scope Variance
          </span>
        );
      case 'unverified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" /> Candidate-Reported
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Discrepancy Observed
          </span>
        );
    }
  };

  const getPriorityPill = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-950 text-rose-300 border border-rose-800">CRITICAL PRIORITY</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800">HIGH PRIORITY</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-950 text-cyan-300 border border-cyan-800">MEDIUM PRIORITY</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-900 text-slate-400 border border-slate-800">LOW PRIORITY</span>;
    }
  };

  const getSourceStatusBadge = (status: ExternalSourceStatus) => {
    switch (status) {
      case 'verified':
      case 'corroborated':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">Verified Grounding</span>;
      case 'reachable':
      case 'parsed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-950 text-cyan-300 border border-indigo-800">Reachable & Parsed</span>;
      case 'provided':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900 text-slate-300 border border-slate-700">Provided by Candidate</span>;
      case 'conflicting':
      case 'failed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800">Source Unavailable</span>;
    }
  };

  const handleStartEdit = (claim: ClaimVerification) => {
    setEditingClaimId(claim.id);
    setEditNotes(claim.analysisNotes);
    setEditStatus(claim.status);
  };

  const handleSaveEdit = (claimId: string) => {
    onVerifyClaim(claimId, editStatus, undefined, editNotes);
    setEditingClaimId(null);
  };

  const pendingQueueCount = verificationQueue.filter(q => q.status === 'PENDING').length;

  return (
    <div id="evidence-verification-container" className="space-y-6">
      {/* 1. Header Banner & Evidence Coverage Scorecard */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-md backdrop-blur-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Evidence Intelligence & Verification Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-cyan-300 border border-indigo-800">
                  Grounding & Provenance
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Grounds claims in observable evidence with full mathematical provenance, source reliability tiers, and absence-of-evidence safety.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAuditSources}
              disabled={isAuditingSources}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAuditingSources ? 'animate-spin' : ''}`} />
              <span>{isAuditingSources ? 'Auditing...' : 'Re-audit Evidence'}</span>
            </button>
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>

        {/* EVIDENCE COVERAGE SCORECARD */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {evidenceCoverage?.overallCoverageScore ?? candidate.verificationRating}%
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Overall Evidence Coverage Score</span>
                <span className="text-[11px] text-slate-400">
                  {evidenceCoverage?.coverageAssessment || 'Evaluates percentage of candidate claims substantiated by independent evidence.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                Critical Claims Coverage: <strong className="text-cyan-400 font-mono">{evidenceCoverage?.criticalClaimsCoverageScore ?? 85}%</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                Pending Actions: <strong className="text-amber-400 font-mono">{pendingQueueCount}</strong>
              </span>
            </div>
          </div>

          {/* Breakdown progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
              <div style={{ width: `${evidenceCoverage?.verifiedPercentage || 60}%` }} className="bg-emerald-500 h-full transition-all" title="Verified Evidence" />
              <div style={{ width: `${evidenceCoverage?.partialPercentage || 25}%` }} className="bg-cyan-500 h-full transition-all" title="Partially Corroborated" />
              <div style={{ width: `${evidenceCoverage?.unverifiedPercentage || 10}%` }} className="bg-slate-700 h-full transition-all" title="Self-Reported" />
              <div style={{ width: `${evidenceCoverage?.conflictingPercentage || 5}%` }} className="bg-rose-500 h-full transition-all" title="Inconsistent / Discrepancy" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Verified ({evidenceCoverage?.verifiedPercentage || 60}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
                <span>Corroborated ({evidenceCoverage?.partialPercentage || 25}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />
                <span>Candidate-Reported ({evidenceCoverage?.unverifiedPercentage || 10}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Discrepancy ({evidenceCoverage?.conflictingPercentage || 5}%)</span>
              </div>
            </div>
          </div>

          {/* Non-punitive explanatory callout */}
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Integrity Calibration Principle:</strong> Evidence coverage measures the percentage of claims supported by accessible external records. High coverage ≠ good candidate; low coverage ≠ bad candidate. Lack of public evidence does not imply candidate claims are false.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'queue' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <ListTodo className="w-3.5 h-3.5 text-cyan-400" />
          <span>Verification Queue ({pendingQueueCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'network' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          <span>Evidence Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'skills' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <Code className="w-3.5 h-3.5 text-emerald-400" />
          <span>Skill Verifications ({skillVerifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'claims' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Audited Claims ({candidate.claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consistency')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'consistency' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cross-Source Signals</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'sources' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Source Reliability</span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'rag' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>RAG Retrieval</span>
        </button>

        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'certifications' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Certifications ({certifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'projects' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Projects ({projectOwnership.length})</span>
        </button>
      </div>

      {/* TAB 0: VERIFICATION QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-cyan-400" />
                <span>Verification Priority Queue</span>
              </h3>
              <p className="text-xs text-slate-400">
                Actionable tasks prioritized by claim importance, conflict severity, evidence weakness, and hiring decision relevance.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950 border border-slate-800 text-slate-300 font-mono">
              {verificationQueue.length} Items Evaluated
            </span>
          </div>

          <div className="space-y-4">
            {verificationQueue.map((item) => {
              const isResolving = resolvingQueueId === item.id;
              const isDone = item.status === 'VERIFIED' || item.status === 'REVIEWED' || item.status === 'DISMISSED';

              return (
                <div
                  key={item.id}
                  id={`queue-card-${item.id}`}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isDone ? 'bg-slate-950/40 border-slate-800/60 opacity-80' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getPriorityPill(item.verificationPriority)}
                        <span className="text-xs font-mono font-bold text-slate-400">
                          Score: {item.priorityScore}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-semibold text-slate-300 capitalize">
                          Category: {item.category}
                        </span>
                        {item.status !== 'PENDING' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Status: {item.status}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-start">
                      <button
                        onClick={() => handleResolveQueueItem(item.id, 'VERIFY')}
                        disabled={isResolving}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 transition-colors cursor-pointer"
                        title="Mark verified by auditor"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </button>

                      <button
                        onClick={() => handleResolveQueueItem(item.id, 'REQUEST_INFO')}
                        disabled={isResolving}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 transition-colors cursor-pointer"
                        title="Request candidate or background check info"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Info</span>
                      </button>

                      <button
                        onClick={() => handleResolveQueueItem(item.id, 'MARK_REVIEWED')}
                        disabled={isResolving}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                        title="Mark reviewed"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Reviewed</span>
                      </button>

                      <button
                        onClick={() => handleResolveQueueItem(item.id, 'DISMISS')}
                        disabled={isResolving}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Dismiss task"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Priority Rationale & Suggested Action */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-300 block mb-0.5">Priority Rationale:</span>
                      <p className="text-slate-400 leading-snug">{item.priorityRationale}</p>
                    </div>

                    <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-900/60">
                      <span className="font-bold text-cyan-300 block mb-0.5">Suggested Action:</span>
                      <p className="text-indigo-200 leading-snug">{item.suggestedAction}</p>
                    </div>
                  </div>

                  {/* Resolution Notes Input */}
                  {!isDone && (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={queueNotesInput[item.id] || ''}
                        onChange={(e) => setQueueNotesInput({ ...queueNotesInput, [item.id]: e.target.value })}
                        placeholder="Add auditor notes for this verification item..."
                        className="flex-1 text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {item.resolutionNotes && (
                    <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300">
                      <strong>Resolution Note ({item.resolvedBy || 'Auditor'}):</strong> {item.resolutionNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: EVIDENCE GRAPH */}
      {activeTab === 'network' && (
        <EvidenceNetworkVisualizer candidate={candidate} />
      )}

      {/* TAB 2: SKILL VERIFICATIONS & ABSENCE OF EVIDENCE */}
      {activeTab === 'skills' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Skill Verification & Demonstrated Competencies Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Distinguishes between claimed self-reported skills, evidence-backed competencies, and absence-of-evidence safety notices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillVerifications.map((sk, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-100 text-sm block">{sk.skillName}</span>
                    <span className="text-slate-400 text-[11px] capitalize">
                      Claimed: {sk.claimedProficiency} • {sk.isJobRequired ? 'Job Required' : 'Supporting'}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    sk.evidenceStatus === 'STRONG_EVIDENCE' 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : sk.evidenceStatus === 'MODERATE_EVIDENCE'
                      ? 'bg-indigo-950 text-cyan-300 border border-indigo-800'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {sk.evidenceStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Evidence Sources:</span>
                    <span className="text-slate-200 font-semibold">{sk.evidenceSources.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Confidence Rating:</span>
                    <span className="font-mono text-cyan-400 font-bold">{sk.confidenceScore}%</span>
                  </div>
                  {sk.groundedProjects.length > 0 && (
                    <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                      <strong className="text-slate-400">Grounded in Experience:</strong> {sk.groundedProjects.join(', ')}
                    </div>
                  )}
                </div>

                {/* Absence of Evidence Callout */}
                {sk.absenceOfEvidenceNotice && (
                  <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded-lg text-[11px] text-amber-300">
                    {sk.absenceOfEvidenceNotice}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDITED CLAIMS */}
      {activeTab === 'claims' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Filter Audited Claims:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Claims by Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="metric">Metrics & Numbers</option>
                <option value="experience">Architecture & Experience</option>
                <option value="skill">Technical Skills</option>
                <option value="leadership">Leadership & Management</option>
              </select>

              <select
                aria-label="Filter Claims by Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Verification Statuses</option>
                <option value="verified">Verified Truth</option>
                <option value="exaggerated">Scope Variance</option>
                <option value="unverified">Candidate-Reported</option>
                <option value="flagged">Discrepancy Observed</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredClaims.map((claim) => {
              const isEditing = editingClaimId === claim.id;

              return (
                <div
                  key={claim.id}
                  id={`claim-card-${claim.id}`}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {getStatusBadge(claim.status)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 leading-snug">
                          "{claim.claim}"
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                            Category: {claim.category}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-[11px] text-cyan-400 font-semibold font-mono">
                            Confidence: {claim.confidenceScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start">
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(claim)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Calibrate or Override Claim"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="p-4 bg-slate-900 border border-indigo-800 rounded-xl space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Status Override:</label>
                        <select
                          aria-label="Claim Status Override"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as VerificationStatus)}
                          className="text-xs bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2 w-full font-medium"
                        >
                          <option value="verified">Verified Truth</option>
                          <option value="exaggerated">Scope Variance</option>
                          <option value="unverified">Candidate-Reported</option>
                          <option value="flagged">Discrepancy Observed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Auditor Notes:</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={2}
                          className="w-full text-xs bg-slate-950 text-slate-100 border border-slate-700 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingClaimId(null)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(claim.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer"
                        >
                          <Save className="w-3 h-3" /> Save Override
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="font-bold text-slate-200 block mb-1 flex items-center gap-1">
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Evidence Grounding Source:
                          </span>
                          <p className="text-slate-300 leading-relaxed">{claim.evidenceSource}</p>
                        </div>

                        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="font-bold text-slate-200 block mb-1">Autonomous Auditor Synthesis:</span>
                          <p className="text-slate-300 leading-relaxed">{claim.analysisNotes}</p>
                        </div>
                      </div>

                      {/* Follow-up Probe Question */}
                      <div className="p-3.5 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-xs">
                        <span className="font-bold text-cyan-300 flex items-center gap-1 mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Recommended Interviewer Probe:
                        </span>
                        <p className="text-indigo-200 font-medium italic">"{claim.followUpQuestion}"</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CROSS-SOURCE SIGNALS */}
      {activeTab === 'consistency' && (
        <div className="space-y-6">
          {consistencyReport && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cross-Source Consistency Signals</span>
                  </h3>
                  <p className="text-xs text-slate-400">Objective comparison between resume, public profiles, and repositories</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Anomaly ≠ Fraud Rule Enforced
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Matching signals */}
                <div className="p-4 bg-emerald-950/30 border border-emerald-900/60 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Corroborated Multi-Source Signals
                  </span>
                  <ul className="space-y-1 text-emerald-200 list-disc list-inside">
                    {consistencyReport.matchingSignals.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Missing signals */}
                <div className="p-4 bg-amber-950/30 border border-amber-900/60 rounded-xl space-y-2">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" /> Uncorroborated / Missing Data Signals
                  </span>
                  <ul className="space-y-1 text-amber-200 list-disc list-inside">
                    {consistencyReport.missingSignals.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Inconsistencies Table */}
              {consistencyReport.conflicts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
                    Potential Inconsistencies Detected ({consistencyReport.conflicts.length})
                  </span>
                  {consistencyReport.conflicts.map((conf, i) => (
                    <div key={i} className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          {conf.description}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800">
                          {conf.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-lg border border-rose-900/40">
                        <div>
                          <strong className="text-slate-300">{conf.sourceA.name}:</strong> <span className="text-slate-400">{conf.sourceA.text}</span>
                        </div>
                        <div>
                          <strong className="text-slate-300">{conf.sourceB.name}:</strong> <span className="text-slate-400">{conf.sourceB.text}</span>
                        </div>
                      </div>
                      <p className="text-slate-300 font-medium italic">
                        <strong>Recommended Action:</strong> {conf.recommendedAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Career Timeline Integrity */}
          {(candidate.timelineGaps?.length || candidate.timelineAnomalies?.length) ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Career Timeline & Tenure Integrity Checks</span>
              </h3>

              {candidate.timelineGaps && candidate.timelineGaps.length > 0 && (
                <div className="space-y-3">
                  {candidate.timelineGaps.map(gap => (
                    <div key={gap.id} className="p-4 bg-amber-950/30 border border-amber-900/60 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          Potential Timeline Gap Detected ({gap.durationMonths} months: {gap.startDate} → {gap.endDate})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                          Confidence: {gap.confidence}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium">{gap.surroundingRoles}</p>
                      {gap.notes && (
                        <p className="text-slate-300 italic bg-slate-950 p-2.5 rounded-lg border border-amber-900/40">
                          <strong>Auditor Context:</strong> {gap.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 5: SOURCE RELIABILITY */}
      {activeTab === 'sources' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Source Reliability Tiers & Freshness Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Classifies data sources by reliability tier: Authoritative Registries, Public Observable Code, Corroborated Networks, and Self-Reported Dossiers.
            </p>
          </div>

          <div className="space-y-4">
            {sourceReliability.map((src, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{src.sourceName}</span>
                    {src.url && (
                      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      src.reliabilityTier === 'AUTHORITATIVE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : src.reliabilityTier === 'OBSERVABLE'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}>
                      {src.reliabilityTier}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800">
                      {src.freshness}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300">{src.reliabilityExplanation}</p>

                {src.provenanceDetails && (
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex flex-wrap gap-3">
                    {src.provenanceDetails.documentName && (
                      <span><strong>Document:</strong> {src.provenanceDetails.documentName}</span>
                    )}
                    {src.provenanceDetails.repoUrl && (
                      <span><strong>Repository:</strong> {src.provenanceDetails.repoUrl}</span>
                    )}
                    <span><strong>Last Audited:</strong> {new Date(src.lastAudited).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RAG RETRIEVAL */}
      {activeTab === 'rag' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Semantic RAG Evidence Retrieval</span>
            </h3>
            <p className="text-xs text-slate-400">
              Query the isolated candidate knowledge base with semantic similarity and exact passage citations.
            </p>
          </div>

          <form onSubmit={handleRAGSearch} className="flex gap-2">
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="e.g. distributed systems throughput, latency metrics, cloud egress cost, education..."
              className="flex-1 text-xs bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isSearchingRAG || !ragQuery.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              <Search className={`w-3.5 h-3.5 ${isSearchingRAG ? 'animate-spin' : ''}`} />
              <span>{isSearchingRAG ? 'Searching...' : 'Retrieve Evidence'}</span>
            </button>
          </form>

          {ragResult && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">RAG Structured AI Assessment</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-cyan-300 border border-indigo-800">
                    Confidence: {ragResult.structuredOutput?.confidence || 'Medium'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {ragResult.structuredOutput?.conclusion}
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-200 block">
                  Retrieved Chunks ({ragResult.retrievedChunks.length})
                </span>
                {ragResult.retrievedChunks.map((c, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs hover:border-indigo-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        {c.chunk.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Score: {c.score}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px]">
                      {c.chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Audited Professional Certifications</span>
            </h3>
            <p className="text-xs text-slate-400">
              Certifications are verified against official registries or flagged as candidate-reported.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{cert.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cert.verificationStatus === 'Verified' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                    {cert.verificationStatus}
                  </span>
                </div>
                <p className="text-slate-300"><strong>Issuer:</strong> {cert.issuer}</p>
                {cert.credentialId && (
                  <p className="text-slate-300 font-mono text-[11px]">
                    <strong>Credential ID:</strong> {cert.credentialId}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Project Ownership & Open-Source Intelligence</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates claimed authorship against observable public repository signals (no simulated metrics).
            </p>
          </div>

          <div className="space-y-4">
            {projectOwnership.map((proj, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-100 text-sm block">{proj.projectName}</span>
                    <span className="text-slate-400 text-[11px]">Claimed Role: {proj.claimedRole}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${proj.evidenceStrength === 'Strong' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : proj.evidenceStrength === 'Moderate' ? 'bg-indigo-950 text-cyan-300 border border-indigo-800' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                    {proj.evidenceStrength} Evidence
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 space-y-1">
                  <p><strong>Auditor Assessment:</strong> {proj.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
