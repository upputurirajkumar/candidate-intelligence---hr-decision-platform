import React, { useState } from 'react';
import { Candidate, JobProfile, InterviewQuestion, VerificationStatus } from '../types';
import { DossierOverview } from '../components/DossierOverview';
import { CandidateSourcesView } from '../components/CandidateSourcesView';
import { AgentOrchestratorView } from '../components/AgentOrchestratorView';
import { EvidenceVerificationPanel } from '../components/EvidenceVerificationPanel';
import { EntityGraphView } from '../components/EntityGraphView';
import { InterviewIntelligenceView } from '../components/InterviewIntelligenceView';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Cpu, 
  FileText, 
  Layers, 
  HelpCircle, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Briefcase,
  ExternalLink,
  GitBranch,
  Linkedin
} from 'lucide-react';

export type CandidateWorkspaceTab = 
  | 'overview'
  | 'sources'
  | 'evidence'
  | 'agents'
  | 'interviews'
  | 'graph';

interface CandidateWorkspacePageProps {
  candidate: Candidate;
  candidates: Candidate[];
  job: JobProfile | null;
  onBackToWorkspace: () => void;
  onSelectCandidate: (candidateId: string) => void;
  onOpenCopilot: () => void;
  onStatusChange: (status: Candidate['status']) => void;
  onVerifyClaim: (claimId: string, status: VerificationStatus, confidence?: number, notes?: string) => void;
  onAddQuestion: (question: InterviewQuestion) => void;
  onUpdateCandidate: (updated: Candidate) => void;
}

export const CandidateWorkspacePage: React.FC<CandidateWorkspacePageProps> = ({
  candidate,
  candidates,
  job,
  onBackToWorkspace,
  onSelectCandidate,
  onOpenCopilot,
  onStatusChange,
  onVerifyClaim,
  onAddQuestion,
  onUpdateCandidate,
}) => {
  const [activeTab, setActiveTab] = useState<CandidateWorkspaceTab>('overview');

  const currentIndex = candidates.findIndex(c => c.id === candidate.id);
  const prevCandidate = currentIndex > 0 ? candidates[currentIndex - 1] : null;
  const nextCandidate = currentIndex < candidates.length - 1 ? candidates[currentIndex + 1] : null;

  const verifiedClaimsCount = candidate.claims?.filter(c => c.verificationStatus === 'VERIFIED').length || 0;
  const totalClaimsCount = candidate.claims?.length || 1;
  const verificationRatio = Math.round((verifiedClaimsCount / totalClaimsCount) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20">
      {/* Top Breadcrumb & Quick Switcher Strip */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-slate-400 sticky top-16 z-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToWorkspace}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to HR Workspace</span>
            </button>
            <span>/</span>
            <span className="text-slate-400">Candidates</span>
            <span>/</span>
            <span className="text-cyan-300 font-bold">{candidate?.name || 'Candidate'}</span>
          </div>

          {/* Candidate Cycler (Prev / Next) */}
          <div className="flex items-center gap-2">
            <button
              disabled={!prevCandidate}
              onClick={() => prevCandidate && onSelectCandidate(prevCandidate.id)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-all cursor-pointer"
              title={prevCandidate ? `Previous: ${prevCandidate?.name || 'Candidate'}` : 'No previous candidate'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono text-slate-400">
              {currentIndex >= 0 ? currentIndex + 1 : 1} of {candidates.length}
            </span>

            <button
              disabled={!nextCandidate}
              onClick={() => nextCandidate && onSelectCandidate(nextCandidate.id)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-all cursor-pointer"
              title={nextCandidate ? `Next: ${nextCandidate?.name || 'Candidate'}` : 'No next candidate'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Profile Hero Header Banner */}
      <section className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          {/* Left: Avatar + Details */}
          <div className="flex items-start gap-4">
            <img
              src={candidate?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={candidate?.name || 'Candidate'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {candidate?.name || 'Candidate Dossier'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {candidate?.yearsOfExperience || 0}+ Yrs Exp
                </span>
                {job && (
                  <span className="text-xs text-slate-400 font-medium">
                    Evaluated for <strong className="text-slate-200">{job?.title || 'Target Requisition'}</strong>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {candidate.currentRole} • {candidate.location}
              </p>

              {/* Source Quick Badges */}
              <div className="flex items-center gap-2 pt-1">
                {candidate.sources?.some(s => s.type === 'RESUME') && (
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] flex items-center gap-1 border border-slate-700">
                    <FileText className="w-3 h-3 text-indigo-400" /> Resume
                  </span>
                )}
                {candidate.sources?.some(s => s.type === 'GITHUB') && (
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] flex items-center gap-1 border border-slate-700">
                    <GitBranch className="w-3 h-3 text-cyan-400" /> GitHub
                  </span>
                )}
                {candidate.sources?.some(s => s.type === 'LINKEDIN') && (
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] flex items-center gap-1 border border-slate-700">
                    <Linkedin className="w-3 h-3 text-blue-400" /> LinkedIn
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Overall Match */}
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
              <div className="text-[10px] font-mono uppercase text-slate-400">Requisition Fit</div>
              <div className="text-2xl font-black text-cyan-400 font-mono leading-none mt-1">
                {candidate.overallFitScore}%
              </div>
            </div>

            {/* Evidence Ratio */}
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
              <div className="text-[10px] font-mono uppercase text-slate-400">Evidence Rating</div>
              <div className="text-2xl font-black text-emerald-400 font-mono leading-none mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>{verificationRatio}%</span>
              </div>
            </div>

            {/* Pipeline Stage Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 block">Candidate Stage</label>
              <select
                value={candidate.status}
                onChange={(e) => onStatusChange(e.target.value as Candidate['status'])}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="NEW">New (Raw)</option>
                <option value="REVIEWING">In Review</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="OFFERED">Offer Extended</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Archived</option>
              </select>
            </div>

            {/* Copilot Trigger */}
            <button
              onClick={onOpenCopilot}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask Copilot</span>
            </button>
          </div>
        </div>

        {/* Section Tabs Strip */}
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 mt-6 pt-3">
          {[
            { id: 'overview', label: 'Executive Dossier', icon: FileText },
            { id: 'evidence', label: 'Evidence & Fact-Check', icon: ShieldCheck, badge: `${candidate.claims?.length || 0}` },
            { id: 'sources', label: 'Raw Data & Sources', icon: Layers },
            { id: 'agents', label: 'AI Multi-Agent Review', icon: Cpu },
            { id: 'interviews', label: 'Interview Intelligence', icon: HelpCircle, badge: `${candidate.interviewQuestions?.length || 0}` },
            { id: 'graph', label: 'Entity Graph', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CandidateWorkspaceTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 font-bold border border-slate-800">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'overview' && (
          <DossierOverview
            candidate={candidate}
            job={job}
            onNavigateToTab={(t) => {
              if (t === 'sources') setActiveTab('sources');
              else if (t === 'verification') setActiveTab('evidence');
              else if (t === 'agents') setActiveTab('agents');
              else if (t === 'interview') setActiveTab('interviews');
              else if (t === 'graph') setActiveTab('graph');
              else onBackToWorkspace();
            }}
            onOpenCopilot={onOpenCopilot}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceVerificationPanel
            candidate={candidate}
            onVerifyClaim={onVerifyClaim}
            onOpenCopilot={onOpenCopilot}
          />
        )}

        {activeTab === 'sources' && (
          <CandidateSourcesView
            candidate={candidate}
            onUpdateCandidate={onUpdateCandidate}
          />
        )}

        {activeTab === 'agents' && (
          <AgentOrchestratorView
            candidate={candidate}
            job={job}
          />
        )}

        {activeTab === 'interviews' && (
          <InterviewIntelligenceView
            candidate={candidate}
            job={job}
            onAddQuestion={onAddQuestion}
            onOpenCopilot={onOpenCopilot}
          />
        )}

        {activeTab === 'graph' && (
          <EntityGraphView candidate={candidate} />
        )}
      </main>
    </div>
  );
};
