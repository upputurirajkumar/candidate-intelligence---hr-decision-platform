import React, { useState } from 'react';
import { Candidate, JobProfile, InterviewQuestion, VerificationStatus, User } from '../types';
import { DossierOverview } from '../components/DossierOverview';
import { CandidateSourcesView } from '../components/CandidateSourcesView';
import { AgentOrchestratorView } from '../components/AgentOrchestratorView';
import { EvidenceVerificationPanel } from '../components/EvidenceVerificationPanel';
import { EntityGraphView } from '../components/EntityGraphView';
import { InterviewIntelligenceView } from '../components/InterviewIntelligenceView';
import { HumanDecisionWorkflowModal } from '../components/HumanDecisionWorkflowModal';
import { CandidateActivityTimeline } from '../components/CandidateActivityTimeline';
import { CollaborativeNotesPanel } from '../components/CollaborativeNotesPanel';
import { ReviewAssignmentModal } from '../components/ReviewAssignmentModal';
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
  Linkedin,
  Scale,
  History,
  MessageSquare,
  UserCheck
} from 'lucide-react';

export type CandidateWorkspaceTab = 
  | 'overview'
  | 'sources'
  | 'evidence'
  | 'agents'
  | 'interviews'
  | 'timeline'
  | 'collaboration'
  | 'graph';

interface CandidateWorkspacePageProps {
  candidate: Candidate;
  candidates: Candidate[];
  job: JobProfile | null;
  currentUser?: User | null;
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
  currentUser = null,
  onBackToWorkspace,
  onSelectCandidate,
  onOpenCopilot,
  onStatusChange,
  onVerifyClaim,
  onAddQuestion,
  onUpdateCandidate,
}) => {
  const [activeTab, setActiveTab] = useState<CandidateWorkspaceTab>('overview');
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState<boolean>(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState<boolean>(false);

  const currentIndex = candidates.findIndex(c => c.id === candidate.id);
  const prevCandidate = currentIndex > 0 ? candidates[currentIndex - 1] : null;
  const nextCandidate = currentIndex < candidates.length - 1 ? candidates[currentIndex + 1] : null;

  const verifiedClaimsCount = candidate.claims?.filter(c => c.verificationStatus === 'VERIFIED').length || 0;
  const totalClaimsCount = candidate.claims?.length || 1;
  const verificationRatio = Math.round((verifiedClaimsCount / totalClaimsCount) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWorkspace}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Requisition Workspace</span>
            </button>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="text-slate-500">Candidate:</span>
              <strong className="text-white font-bold">{candidate.name}</strong>
              <span className="text-slate-500 font-mono text-[10px]">({currentIndex + 1} of {candidates.length})</span>
            </div>
          </div>

          {/* Quick Prev / Next Switcher */}
          <div className="flex items-center gap-2">
            <button
              disabled={!prevCandidate}
              onClick={() => prevCandidate && onSelectCandidate(prevCandidate.id)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Previous Candidate"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!nextCandidate}
              onClick={() => nextCandidate && onSelectCandidate(nextCandidate.id)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Next Candidate"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Candidate Hero Header */}
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

          {/* Right: Metrics & Enterprise Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Overall Match */}
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
              <div className="text-[10px] font-mono uppercase text-slate-400">Requisition Fit</div>
              <div className="text-2xl font-black text-cyan-400 font-mono leading-none mt-1">
                {candidate.overallFitScore}%
              </div>
            </div>

            {/* Evidence Ratio */}
            <div className="bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
              <div className="text-[10px] font-mono uppercase text-slate-400">Evidence Rating</div>
              <div className="text-2xl font-black text-emerald-400 font-mono leading-none mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>{verificationRatio}%</span>
              </div>
            </div>

            {/* Stage Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 block">Stage</label>
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

            {/* Human Decision Action */}
            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4 text-amber-300" />
              <span>Record Decision</span>
            </button>

            {/* Assign Review Task Action */}
            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Assign review task to team member"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Assign</span>
            </button>

            {/* Copilot Trigger */}
            <button
              onClick={onOpenCopilot}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Copilot</span>
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
            { id: 'timeline', label: 'Journey Timeline & Audit', icon: History },
            { id: 'collaboration', label: 'Team Evaluation Notes', icon: MessageSquare },
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
            onCandidateUpdated={onUpdateCandidate}
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

        {activeTab === 'timeline' && (
          <CandidateActivityTimeline
            candidate={candidate}
            onRefresh={() => {}}
          />
        )}

        {activeTab === 'collaboration' && (
          <CollaborativeNotesPanel
            candidate={candidate}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'graph' && (
          <EntityGraphView candidate={candidate} />
        )}
      </main>

      {/* Human Decision Modal */}
      {isDecisionModalOpen && (
        <HumanDecisionWorkflowModal
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          candidate={candidate}
          job={job}
          onDecisionRecorded={(updated) => {
            onUpdateCandidate(updated);
          }}
        />
      )}

      {/* Review Assignment Modal */}
      {isAssignmentModalOpen && (
        <ReviewAssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          candidate={candidate}
          onAssignmentCreated={() => {}}
        />
      )}
    </div>
  );
};
