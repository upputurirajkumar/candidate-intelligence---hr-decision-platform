import React, { useState } from 'react';
import { Candidate, ClaimVerification, VerificationStatus } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  GitBranch, 
  Linkedin, 
  Globe, 
  Award, 
  Cpu, 
  ArrowRight, 
  Search, 
  ExternalLink,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface EvidenceNetworkVisualizerProps {
  candidate: Candidate;
  onVerifyClaim?: (claimId: string, status: VerificationStatus, confidence?: number, notes?: string) => void;
}

export const EvidenceNetworkVisualizer: React.FC<EvidenceNetworkVisualizerProps> = ({
  candidate,
  onVerifyClaim,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(
    candidate.claims && candidate.claims.length > 0 ? candidate.claims[0].id : null
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'flagged' | 'unverified'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const claims = candidate.claims || [];

  const filteredClaims = claims.filter((claim) => {
    const statusMatch =
      statusFilter === 'all'
        ? true
        : statusFilter === 'verified'
        ? claim.verificationStatus === 'VERIFIED'
        : statusFilter === 'flagged'
        ? claim.verificationStatus === 'FLAGGED'
        : claim.verificationStatus === 'UNVERIFIED';

    const textMatch =
      claim.claim.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (claim.evidenceSource || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (claim.reasoning || '').toLowerCase().includes(searchFilter.toLowerCase());

    return statusMatch && textMatch;
  });

  const activeClaim = claims.find((c) => c.id === selectedClaimId) || filteredClaims[0] || null;

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800/80 p-6 shadow-xl space-y-6 backdrop-blur-xl">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-inner">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Cross-Source Evidence Grounding Network
            </h3>
            <p className="text-xs text-slate-400">
              Interactive factual provenance linking claims across Resumes, GitHub, LinkedIn, and Registries
            </p>
          </div>
        </div>

        {/* Verification Summary Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400">Grounded Claims:</span>
          <span className="font-mono font-bold text-emerald-400">
            {claims.filter((c) => c.verificationStatus === 'VERIFIED').length} / {claims.length} Verified
          </span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({claims.length})
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'verified'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Verified ({claims.filter((c) => c.verificationStatus === 'VERIFIED').length})
          </button>
          <button
            onClick={() => setStatusFilter('flagged')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'flagged'
                ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Probes & Gaps ({claims.filter((c) => c.verificationStatus === 'FLAGGED').length})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search claim, tech, source..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Grid: Left Claim List vs Right Evidence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Claim Cards */}
        <div className="lg:col-span-6 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredClaims.length > 0 ? (
            filteredClaims.map((claim) => {
              const isSelected = activeClaim?.id === claim.id;
              const isVerified = claim.verificationStatus === 'VERIFIED';
              const isFlagged = claim.verificationStatus === 'FLAGGED';

              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-950 border-cyan-500/80 shadow-lg ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {isVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isFlagged ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full font-mono ${
                          isVerified
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : isFlagged
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {claim.verificationStatus}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {claim.confidenceScore}% Confidence
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-100 line-clamp-2 mb-1.5 leading-snug">
                    "{claim.claim}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[200px] text-slate-300">
                      Source: {claim.evidenceSource || 'Resume Archive'}
                    </span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-0.5">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No claims match the filter criteria.
            </div>
          )}
        </div>

        {/* Right Column: Grounded Provenance & Interview Probe Inspector */}
        <div className="lg:col-span-6 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
          {activeClaim ? (
            <>
              {/* Claim Title */}
              <div className="space-y-1.5 border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Claim ID: {activeClaim.id}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Grounding Confidence: {activeClaim.confidenceScore}%
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-relaxed">
                  "{activeClaim.claim}"
                </h4>
              </div>

              {/* Source Provenance Link */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Grounding Source & Corroborating Artifacts</span>
                </div>
                <p className="text-xs text-slate-300">
                  {activeClaim.evidenceSource || 'Corroborated across multi-repo commit history and tenure records.'}
                </p>
                {activeClaim.reasoning && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 italic">
                    AI Auditor Reasoning: {activeClaim.reasoning}
                  </p>
                )}
              </div>

              {/* Follow-up Probing Question */}
              {activeClaim.followUpQuestion && (
                <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recommended Interview Probe for Panel</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">
                    "{activeClaim.followUpQuestion}"
                  </p>
                </div>
              )}

              {/* Action: Verify / Override Claim */}
              {onVerifyClaim && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">Recruiter Status Override:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onVerifyClaim(activeClaim.id, 'VERIFIED', 98, 'Manual Recruiter Confirmation')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold hover:bg-emerald-900 transition-all cursor-pointer"
                    >
                      Confirm Verified
                    </button>
                    <button
                      onClick={() => onVerifyClaim(activeClaim.id, 'FLAGGED', 50, 'Flagged for Technical Round 2')}
                      className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-bold hover:bg-amber-900 transition-all cursor-pointer"
                    >
                      Flag for Interview
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select any claim on the left to inspect multi-source provenance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
