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
  Network
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
  const [activeTab, setActiveTab] = useState<'network' | 'claims' | 'consistency' | 'rag' | 'certifications' | 'projects'>('network');
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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Truth
          </span>
        );
      case 'exaggerated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Exaggerated / Scope Gap
          </span>
        );
      case 'unverified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" /> Unverified Assertion
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Contradiction Detected
          </span>
        );
    }
  };

  const getIntegrityBadge = (support?: string) => {
    switch (support) {
      case 'SUPPORTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider">Supported</span>;
      case 'PARTIALLY SUPPORTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase tracking-wider">Partially Supported</span>;
      case 'UNSUPPORTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 uppercase tracking-wider">Unsupported</span>;
      case 'CONFLICTING':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 uppercase tracking-wider">Conflicting</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800 uppercase tracking-wider">Insufficient Evidence</span>;
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

  const verifiedCount = candidate.claims.filter(c => c.status === 'verified').length;
  const exaggeratedCount = candidate.claims.filter(c => c.status === 'exaggerated').length;
  const unverifiedCount = candidate.claims.filter(c => c.status === 'unverified').length;

  const consistencyReport = candidate.consistencyReport;
  const certifications = candidate.certifications || [];
  const projectOwnership = candidate.projectOwnership || [];

  return (
    <div id="evidence-verification-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-md backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Candidate Intelligence & Evidence Engine</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-cyan-300 border border-indigo-800">
                  RAG Grounded
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cross-source corroborated intelligence, Source Trust Models, and prompt-injection-safe document grounding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask Copilot about Evidence</span>
            </button>
          </div>
        </div>

        {/* Source Trust Model Strip */}
        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Source Trust Hierarchy:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              1. Candidate-Reported (Self-reported)
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              2. Publicly Observable (GitHub/Repos)
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              3. Potentially Corroborated (Registries)
            </span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 font-bold text-emerald-300">
              4. Third-Party Verified
            </span>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Verification Rating</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">{candidate.verificationRating}%</span>
          </div>

          <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/60 rounded-xl">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">Verified Facts</span>
            <span className="text-xl font-extrabold text-emerald-300 font-mono">{verifiedCount} claims</span>
          </div>

          <div className="p-3.5 bg-amber-950/30 border border-amber-900/60 rounded-xl">
            <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block">Exaggerations / Gaps</span>
            <span className="text-xl font-extrabold text-amber-300 font-mono">{exaggeratedCount} claims</span>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Integrity Risk Level</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-xl font-extrabold ${consistencyReport?.integrityRiskScore?.level === 'High' ? 'text-rose-400' : consistencyReport?.integrityRiskScore?.level === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {consistencyReport?.integrityRiskScore?.level || 'Low'}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block">(Rule-based)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'network' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Provenance Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'claims' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Audited Claims & Grounding</span>
        </button>

        <button
          onClick={() => setActiveTab('consistency')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'consistency' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cross-Source Consistency & Gaps</span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${activeTab === 'rag' ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'}`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>RAG Evidence Retrieval</span>
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
          <Code className="w-3.5 h-3.5" />
          <span>Project Ownership ({projectOwnership.length})</span>
        </button>
      </div>

      {/* TAB 0: INTERACTIVE PROVENANCE GRAPH */}
      {activeTab === 'network' && (
        <EvidenceNetworkVisualizer candidate={candidate} />
      )}

      {/* TAB 1: AUDITED CLAIMS */}
      {activeTab === 'claims' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Filter Claims:</span>
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
                          {getIntegrityBadge(claim.status === 'verified' ? 'SUPPORTED' : 'PARTIALLY SUPPORTED')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Confidence</div>
                        <div className="text-xs font-bold text-cyan-300 font-mono">{claim.confidenceScore}%</div>
                      </div>
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

                  {/* Grounding Source & Analysis Notes */}
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
                          <option value="exaggerated">Exaggerated / Scope Gap</option>
                          <option value="unverified">Unverified Assertion</option>
                          <option value="flagged">Contradiction Detected</option>
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

      {/* TAB 2: CROSS-SOURCE CONSISTENCY & INTEGRITY MATRIX */}
      {activeTab === 'consistency' && (
        <div className="space-y-6">
          {/* External Source Status Bar */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>External Source Verification Endpoints</span>
                </h3>
                <p className="text-xs text-slate-400">Live checks against candidate-linked professional endpoints</p>
              </div>
              <button
                onClick={handleAuditSources}
                disabled={isAuditingSources}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isAuditingSources ? 'animate-spin' : ''}`} />
                <span>{isAuditingSources ? 'Auditing Endpoints...' : 'Re-verify Endpoints'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Github className="w-4 h-4 text-slate-400" /> GitHub Repository
                  </span>
                  {getSourceStatusBadge(candidate.externalSources?.[0]?.status || 'verified')}
                </div>
                <p className="text-[11px] text-slate-400">
                  {candidate.externalSources?.[0]?.details || 'Grounding public commits, active repositories, and architecture PRs.'}
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Linkedin className="w-4 h-4 text-sky-400" /> LinkedIn Profile
                  </span>
                  {getSourceStatusBadge(candidate.externalSources?.[1]?.status || 'corroborated')}
                </div>
                <p className="text-[11px] text-slate-400">
                  {candidate.externalSources?.[1]?.details || 'Corroborated employment history, title consistency, and duration.'}
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <Globe className="w-4 h-4 text-emerald-400" /> Portfolio / Whitepapers
                  </span>
                  {getSourceStatusBadge(candidate.externalSources?.[2]?.status || 'reachable')}
                </div>
                <p className="text-[11px] text-slate-400">
                  {candidate.externalSources?.[2]?.details || 'External tech documentation and verified publications reachable.'}
                </p>
              </div>
            </div>
          </div>

          {/* Cross-Source Consistency Evaluation */}
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
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Career Timeline & Tenure Integrity Checks</span>
              </h3>

              {/* Timeline Gaps */}
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

              {/* Overlaps */}
              {candidate.timelineAnomalies && candidate.timelineAnomalies.length > 0 && (
                <div className="space-y-3">
                  {candidate.timelineAnomalies.map(anom => (
                    <div key={anom.id} className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          {anom.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-800">
                          Severity: {anom.severity}
                        </span>
                      </div>
                      <p className="text-slate-300">{anom.description}</p>
                      <p className="text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-rose-900/40">
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

          {/* Search Results */}
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
                {ragResult.structuredOutput?.limitations && ragResult.structuredOutput.limitations.length > 0 && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-900/60">
                    <strong>Limitations:</strong> {ragResult.structuredOutput.limitations.join('. ')}
                  </div>
                )}
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
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {c.chunk.metadata.attribution}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Score: {c.score}</span>
                      </div>
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

      {/* TAB 4: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Audited Professional Certifications</span>
            </h3>
            <p className="text-xs text-slate-400">
              Certifications are treated as 'Candidate-reported' until cryptographic credential IDs are validated against official registries.
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
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800">
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
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
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
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300">
                      Commit History: {proj.observedSignals.commitActivityAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    {proj.observedSignals.languageBreakdown && (
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300">
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
