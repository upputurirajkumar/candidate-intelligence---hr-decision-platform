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
  CrossSourceConsistencyReport
} from '../types';
import { authenticatedFetch } from '../lib/api';
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
  Info
} from 'lucide-react';

interface EvidenceVerificationPanelProps {
  candidate: Candidate;
  onVerifyClaim: (claimId: string, newStatus: VerificationStatus, confidenceScore?: number, notes?: string) => void;
  onOpenCopilot: () => void;
}

export const EvidenceVerificationPanel: React.FC<EvidenceVerificationPanelProps> = ({
  candidate,
  onVerifyClaim,
  onOpenCopilot,
}) => {
  const [activeTab, setActiveTab] = useState<'claims' | 'consistency' | 'rag' | 'certifications' | 'projects'>('claims');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editStatus, setEditStatus] = useState<VerificationStatus>('verified');
  const [isAuditingSources, setIsAuditingSources] = useState<boolean>(false);

  // RAG Search State
  const [ragQuery, setRagQuery] = useState<string>('');
  const [ragResult, setRagResult] = useState<RAGRetrievalResult | null>(null);
  const [isSearchingRAG, setIsSearchingRAG] = useState<boolean>(false);

  const handleAuditSources = async () => {
    setIsAuditingSources(true);
    try {
      await authenticatedFetch(`/api/candidates/${candidate.id}/external-sources/verify`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to audit external sources:', err);
    } finally {
      setIsAuditingSources(false);
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Truth
          </span>
        );
      case 'exaggerated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Exaggerated / Scope Gap
          </span>
        );
      case 'unverified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5" /> Unverified Assertion
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Contradiction Detected
          </span>
        );
    }
  };

  const getIntegrityBadge = (support?: string) => {
    switch (support) {
      case 'SUPPORTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">Supported</span>;
      case 'PARTIALLY SUPPORTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">Partially Supported</span>;
      case 'UNSUPPORTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider">Unsupported</span>;
      case 'CONFLICTING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">Conflicting</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">Insufficient Evidence</span>;
    }
  };

  const getSourceStatusBadge = (status: ExternalSourceStatus) => {
    switch (status) {
      case 'verified':
      case 'corroborated':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Verified Grounding</span>;
      case 'reachable':
      case 'parsed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">Reachable & Parsed</span>;
      case 'provided':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">Provided by Candidate</span>;
      case 'conflicting':
      case 'failed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">Source Unavailable</span>;
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

  const verifiedCount = candidate.claims.filter(c => c.status === 'verified').length;
  const exaggeratedCount = candidate.claims.filter(c => c.status === 'exaggerated').length;
  const unverifiedCount = candidate.claims.filter(c => c.status === 'unverified').length;

  const consistencyReport = candidate.consistencyReport;
  const certifications = candidate.certifications || [];
  const projectOwnership = candidate.projectOwnership || [];

  return (
    <div id="evidence-verification-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Candidate Intelligence & Evidence Engine</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  RAG Grounded
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Cross-source corroborated intelligence, Source Trust Models, and prompt-injection-safe document grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask Copilot about Evidence</span>
            </button>
          </div>
        </div>

        {/* Source Trust Model Strip */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Source Trust Hierarchy:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
              1. Candidate-Reported (Self-reported)
            </span>
            <span className="text-slate-300">→</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
              2. Publicly Observable (GitHub/Repos)
            </span>
            <span className="text-slate-300">→</span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
              3. Potentially Corroborated (Registries)
            </span>
            <span className="text-slate-300">→</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-bold text-emerald-800">
              4. Third-Party Verified
            </span>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Verification Rating</span>
            <span className="text-xl font-extrabold text-emerald-600">{candidate.verificationRating}%</span>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Verified Facts</span>
            <span className="text-xl font-extrabold text-emerald-700">{verifiedCount} claims</span>
          </div>

          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg">
            <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Exaggerations / Gaps</span>
            <span className="text-xl font-extrabold text-amber-700">{exaggeratedCount} claims</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Integrity Risk Level</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xl font-extrabold ${consistencyReport?.integrityRiskScore?.level === 'High' ? 'text-rose-600' : consistencyReport?.integrityRiskScore?.level === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {consistencyReport?.integrityRiskScore?.level || 'Low'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 block">(Rule-based)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === 'claims' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Audited Claims & Grounding</span>
        </button>

        <button
          onClick={() => setActiveTab('consistency')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === 'consistency' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cross-Source Consistency & Gaps</span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === 'rag' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>RAG Evidence Retrieval</span>
        </button>

        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === 'certifications' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Certifications ({certifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeTab === 'projects' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Project Ownership ({projectOwnership.length})</span>
        </button>
      </div>

      {/* TAB 1: AUDITED CLAIMS */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Filter Claims:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter Claims by Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Verification Statuses</option>
                <option value="verified">Verified Truth</option>
                <option value="exaggerated">Exaggerated / Scope Gap</option>
                <option value="unverified">Unverified</option>
                <option value="flagged">Flagged / Contradiction</option>
              </select>
            </div>
          </div>

          {/* Claims List Table/Cards */}
          <div className="space-y-4">
            {filteredClaims.map((claim) => {
              const isEditing = editingClaimId === claim.id;

              return (
                <div
                  key={claim.id}
                  id={`claim-card-${claim.id}`}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {getStatusBadge(claim.status)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          "{claim.claim}"
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                            Category: {claim.category}
                          </span>
                          <span className="text-slate-300">•</span>
                          {getIntegrityBadge(claim.status === 'verified' ? 'SUPPORTED' : 'PARTIALLY SUPPORTED')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Confidence</div>
                        <div className="text-xs font-bold text-slate-800 font-mono">{claim.confidenceScore}%</div>
                      </div>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(claim)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Calibrate or Override Claim"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grounding Source & Analysis Notes */}
                  {isEditing ? (
                    <div className="p-3 bg-white border border-indigo-200 rounded-lg space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Override:</label>
                        <select
                          aria-label="Claim Status Override"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as VerificationStatus)}
                          className="text-xs border border-slate-300 rounded p-1.5 w-full font-medium"
                        >
                          <option value="verified">Verified Truth</option>
                          <option value="exaggerated">Exaggerated / Scope Gap</option>
                          <option value="unverified">Unverified Assertion</option>
                          <option value="flagged">Contradiction Detected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Auditor Notes:</label>
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={2}
                          className="w-full text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingClaimId(null)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(claim.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded cursor-pointer"
                        >
                          <Save className="w-3 h-3" /> Save Override
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                          <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" /> Evidence Grounding Source:
                          </span>
                          <p className="text-slate-600 leading-relaxed">{claim.evidenceSource}</p>
                        </div>

                        <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                          <span className="font-bold text-slate-800 block mb-1">Autonomous Auditor Synthesis:</span>
                          <p className="text-slate-600 leading-relaxed">{claim.analysisNotes}</p>
                        </div>
                      </div>

                      {/* Follow-up Probe Question */}
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs">
                        <span className="font-bold text-indigo-900 flex items-center gap-1 mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Recommended Interviewer Probe:
                        </span>
                        <p className="text-indigo-950 font-medium italic">"{claim.followUpQuestion}"</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CROSS-SOURCE CONSISTENCY & INTEGRITY MATRIX */}
      {activeTab === 'consistency' && (
        <div className="space-y-6">
          {/* External Source Status Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>External Source Verification Endpoints</span>
                </h3>
                <p className="text-xs text-slate-500">Live checks against candidate-linked professional endpoints</p>
              </div>
              <button
                onClick={handleAuditSources}
                disabled={isAuditingSources}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isAuditingSources ? 'animate-spin' : ''}`} />
                <span>{isAuditingSources ? 'Auditing Endpoints...' : 'Re-verify Endpoints'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Github className="w-4 h-4 text-slate-700" /> GitHub Repository
                  </span>
                  {getSourceStatusBadge(candidate.externalSources?.[0]?.status || 'verified')}
                </div>
                <p className="text-[11px] text-slate-600">
                  {candidate.externalSources?.[0]?.details || 'Grounding public commits, active repositories, and architecture PRs.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Linkedin className="w-4 h-4 text-sky-600" /> LinkedIn Profile
                  </span>
                  {getSourceStatusBadge(candidate.externalSources?.[1]?.status || 'corroborated')}
                </div>
                <p className="text-[11px] text-slate-600">
                  {candidate.externalSources?.[1]?.details || 'Corroborated employment history, title consistency, and duration.'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Globe className="w-4 h-4 text-emerald-600" /> Portfolio / Whitepapers
                  </span>
                  {getSourceStatusBadge(candidate.externalSources?.[2]?.status || 'reachable')}
                </div>
                <p className="text-[11px] text-slate-600">
                  {candidate.externalSources?.[2]?.details || 'External tech documentation and verified publications reachable.'}
                </p>
              </div>
            </div>
          </div>

          {/* Cross-Source Consistency Evaluation */}
          {consistencyReport && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Cross-Source Consistency Signals</span>
                  </h3>
                  <p className="text-xs text-slate-500">Objective comparison between resume, public profiles, and repositories</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Anomaly ≠ Fraud Rule Enforced
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Matching signals */}
                <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Corroborated Multi-Source Signals
                  </span>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    {consistencyReport.matchingSignals.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Missing signals */}
                <div className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-2">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-600" /> Uncorroborated / Missing Data Signals
                  </span>
                  <ul className="space-y-1 text-slate-700 list-disc list-inside">
                    {consistencyReport.missingSignals.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Inconsistencies Table */}
              {consistencyReport.conflicts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block">
                    Potential Inconsistencies Detected ({consistencyReport.conflicts.length})
                  </span>
                  {consistencyReport.conflicts.map((conf, i) => (
                    <div key={i} className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          {conf.description}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          {conf.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-rose-100">
                        <div>
                          <strong className="text-slate-800">{conf.sourceA.name}:</strong> <span className="text-slate-600">{conf.sourceA.text}</span>
                        </div>
                        <div>
                          <strong className="text-slate-800">{conf.sourceB.name}:</strong> <span className="text-slate-600">{conf.sourceB.text}</span>
                        </div>
                      </div>
                      <p className="text-slate-700 font-medium italic">
                        <strong>Action:</strong> {conf.recommendedAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Career Timeline Integrity & Anomalies */}
          {(candidate.timelineGaps?.length || candidate.timelineAnomalies?.length) ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Career Timeline & Tenure Integrity Checks</span>
              </h3>

              {/* Timeline Gaps */}
              {candidate.timelineGaps && candidate.timelineGaps.length > 0 && (
                <div className="space-y-3">
                  {candidate.timelineGaps.map(gap => (
                    <div key={gap.id} className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          Potential Timeline Gap Detected ({gap.durationMonths} months: {gap.startDate} → {gap.endDate})
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                          Confidence: {gap.confidence}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">{gap.surroundingRoles}</p>
                      {gap.notes && (
                        <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-amber-100">
                          <strong>Auditor Context:</strong> {gap.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Overlaps */}
              {candidate.timelineAnomalies && candidate.timelineAnomalies.length > 0 && (
                <div className="space-y-3">
                  {candidate.timelineAnomalies.map(anom => (
                    <div key={anom.id} className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          {anom.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          Severity: {anom.severity}
                        </span>
                      </div>
                      <p className="text-slate-700">{anom.description}</p>
                      <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-rose-100">
                        <strong>Recommended Follow-up:</strong> {anom.recommendedAction}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 3: RAG EVIDENCE RETRIEVAL */}
      {activeTab === 'rag' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Semantic RAG Evidence Retrieval</span>
            </h3>
            <p className="text-xs text-slate-500">
              Query the isolated candidate knowledge base with semantic similarity and exact passage citations.
            </p>
          </div>

          <form onSubmit={handleRAGSearch} className="flex gap-2">
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="e.g. distributed systems throughput, latency metrics, cloud egress cost, education..."
              className="flex-1 text-xs border border-slate-300 rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isSearchingRAG || !ragQuery.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              <Search className={`w-3.5 h-3.5 ${isSearchingRAG ? 'animate-spin' : ''}`} />
              <span>{isSearchingRAG ? 'Searching...' : 'Retrieve Evidence'}</span>
            </button>
          </form>

          {/* Search Results */}
          {ragResult && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">RAG Structured AI Assessment</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    Confidence: {ragResult.structuredOutput?.confidence || 'Medium'}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {ragResult.structuredOutput?.conclusion}
                </p>
                {ragResult.structuredOutput?.limitations && ragResult.structuredOutput.limitations.length > 0 && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                    <strong>Limitations:</strong> {ragResult.structuredOutput.limitations.join('. ')}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Retrieved Chunks ({ragResult.retrievedChunks.length})
                </span>
                {ragResult.retrievedChunks.map((c, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs hover:border-indigo-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        {c.chunk.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {c.chunk.metadata.attribution}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Score: {c.score}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed bg-slate-50/60 p-2.5 rounded-lg border border-slate-100 font-mono text-[11px]">
                      {c.chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Audited Professional Certifications</span>
            </h3>
            <p className="text-xs text-slate-500">
              Certifications are treated as 'Candidate-reported' until cryptographic credential IDs are validated against official registries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{cert.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cert.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {cert.verificationStatus}
                  </span>
                </div>
                <p className="text-slate-600"><strong>Issuer:</strong> {cert.issuer}</p>
                {cert.credentialId && (
                  <p className="text-slate-600 font-mono text-[11px]">
                    <strong>Credential ID:</strong> {cert.credentialId}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Issued: {cert.issueDate || '2023'}</span>
                  <span>Expires: {cert.expiryDate || '2026'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROJECT OWNERSHIP */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-600" />
              <span>Project Ownership & Open-Source Intelligence</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates claimed authorship against observable public repository signals (no simulated metrics).
            </p>
          </div>

          <div className="space-y-4">
            {projectOwnership.map((proj, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{proj.projectName}</span>
                    <span className="text-slate-500 text-[11px]">Claimed Role: {proj.claimedRole}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${proj.evidenceStrength === 'Strong' ? 'bg-emerald-100 text-emerald-800' : proj.evidenceStrength === 'Moderate' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                    {proj.evidenceStrength} Evidence
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 space-y-1">
                  <p><strong>Auditor Assessment:</strong> {proj.notes}</p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                      Commit History: {proj.observedSignals.commitActivityAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    {proj.observedSignals.languageBreakdown && (
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        Languages: {proj.observedSignals.languageBreakdown.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
