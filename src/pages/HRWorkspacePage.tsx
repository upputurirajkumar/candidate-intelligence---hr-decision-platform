import React, { useState } from 'react';
import { Candidate, JobProfile, InterviewQuestion, VerificationStatus, User } from '../types';
import { LeaderboardView } from '../components/LeaderboardView';
import { ComparisonMatrixView } from '../components/ComparisonMatrixView';
import { AnalyticsReportsView } from '../components/AnalyticsReportsView';
import { JobProfileSelector } from '../components/JobProfileSelector';
import { EvidenceVerificationPanel } from '../components/EvidenceVerificationPanel';
import { InterviewIntelligenceView } from '../components/InterviewIntelligenceView';
import { EntityGraphView } from '../components/EntityGraphView';
import { AgentOrchestratorView } from '../components/AgentOrchestratorView';
import { DossierOverview } from '../components/DossierOverview';
import { 
  Users, 
  Search, 
  Archive, 
  Plus, 
  Upload, 
  Sparkles, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  HelpCircle, 
  Briefcase, 
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Share2
} from 'lucide-react';

export type WorkspaceSubView = 
  | 'leaderboard'
  | 'candidates'
  | 'comparison'
  | 'interviews'
  | 'evidence'
  | 'analytics'
  | 'jobs'
  | 'graph';

interface HRWorkspacePageProps {
  candidates: Candidate[];
  jobs: JobProfile[];
  selectedJob: JobProfile | null;
  onSelectJob: (job: JobProfile) => void;
  onUpdateJob: (job: JobProfile) => void;
  onJobCreated: (job: JobProfile) => void;
  onJobDeleted: (jobId: string) => void;
  onSelectCandidate: (candidateId: string) => void;
  onOpenIntake: () => void;
  onOpenIngestion: () => void;
  onOpenCopilot: () => void;
  onOpenUniverse?: () => void;
  onOpenAIProcessing?: (candName?: string) => void;
  onRefreshData: () => void;
  currentUser: User | null;
}

export const HRWorkspacePage: React.FC<HRWorkspacePageProps> = ({
  candidates,
  jobs,
  selectedJob,
  onSelectJob,
  onUpdateJob,
  onJobCreated,
  onJobDeleted,
  onSelectCandidate,
  onOpenIntake,
  onOpenIngestion,
  onOpenCopilot,
  onOpenUniverse,
  onOpenAIProcessing,
  onRefreshData,
  currentUser,
}) => {
  const [subView, setSubView] = useState<WorkspaceSubView>('leaderboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCandidates = candidates.filter(c => {
    if (!c) return false;
    if (!showArchived && c.isArchived) return false;
    if (statusFilter !== 'all' && (c.pipelineStatus || c.status) !== statusFilter) return false;
    const cName = c.name || '';
    const cRole = c.currentRole || '';
    const matchesSearch = cName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.skills || []).some(s => {
        const sName = typeof s === 'string' ? s : s?.name || '';
        return sName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    return matchesSearch;
  });

  const topCandidate = candidates[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Workspace Control Banner */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 sticky top-16 z-20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Job Selector & Quick Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            {selectedJob && (
              <JobProfileSelector
                jobs={jobs}
                selectedJob={selectedJob}
                onSelectJob={onSelectJob}
                onUpdateJob={onUpdateJob}
                onJobCreated={onJobCreated}
                onJobDeleted={onJobDeleted}
                onOpenUniverse={onOpenUniverse}
              />
            )}

            <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400">Total Ingested:</span>
              <span className="font-mono font-bold text-cyan-400">{candidates.length}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Audited Claims:</span>
              <span className="font-mono font-bold text-emerald-400">
                {candidates.reduce((acc, c) => acc + (c.claims?.length || 0), 0)}
              </span>
            </div>
          </div>

          {/* Right: Intake & Ingest Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenUniverse && (
              <button
                onClick={onOpenUniverse}
                className="hidden sm:flex items-center gap-1.5 bg-indigo-950/80 hover:bg-indigo-900/80 text-cyan-300 border border-indigo-700/60 px-3.5 py-1.8 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Open 3D Role Universe & Requisition Topology"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D Role Universe</span>
              </button>
            )}

            <button
              id="workspace-btn-intake"
              onClick={onOpenIntake}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-3.5 py-1.8 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Intake Wizard</span>
            </button>

            <button
              id="workspace-btn-ingest"
              onClick={onOpenIngestion}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.8 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ingest Resume</span>
            </button>

            <button
              id="workspace-btn-copilot"
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.8 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Copilot</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-800/60 pt-2 pb-1">
          {[
            { id: 'leaderboard', label: 'Leaderboard & Ranking', icon: Users, badge: `${candidates.length}` },
            { id: 'candidates', label: 'Candidate Directory', icon: Filter },
            { id: 'comparison', label: 'Side-by-Side Matrix', icon: Layers },
            { id: 'interviews', label: 'Interview Intelligence', icon: HelpCircle },
            { id: 'evidence', label: 'Evidence & Fact-Check', icon: ShieldCheck },
            { id: 'graph', label: 'Knowledge Graph', icon: Share2 },
            { id: 'analytics', label: 'Pipeline Analytics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubView(tab.id as WorkspaceSubView)}
                className={`px-3.5 py-1.8 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/90 text-white border border-indigo-400/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Candidate Directory Tab */}
        {subView === 'candidates' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidates by name, target role, technical stack..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden"
                >
                  <option value="all">All Stages</option>
                  <option value="NEW">New (Raw)</option>
                  <option value="REVIEWING">In Review</option>
                  <option value="INTERVIEWING">Interviewing</option>
                  <option value="OFFERED">Offer Extended</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Archived / Rejected</option>
                </select>

                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showArchived ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>{showArchived ? 'Hide Archived' : 'Show Archived'}</span>
                </button>
              </div>
            </div>

            {/* Candidate Directory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 space-y-4 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.avatarUrl}
                        alt={cand.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {cand.name}
                        </h4>
                        <p className="text-xs text-slate-400">{cand.currentRole}</p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-indigo-950 text-cyan-300 border border-indigo-800">
                      {cand.overallFitScore}% Match
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {(cand.skills || []).slice(0, 4).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded text-[10px] font-mono border border-slate-800">
                        {typeof s === 'string' ? s : s?.name || ''}
                      </span>
                    ))}
                    {(cand.skills?.length || 0) > 4 && (
                      <span className="px-1.5 py-0.5 bg-slate-950 text-slate-500 rounded text-[10px] font-mono">
                        +{(cand.skills?.length || 0) - 4}
                      </span>
                    )}
                  </div>

                  {/* Verification & Risk Indicators */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{cand.claims?.filter(c => c.verificationStatus === 'VERIFIED').length || 0} Verified</span>
                    </div>

                    <button
                      onClick={() => onSelectCandidate(cand.id)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Deep Analysis</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard View */}
        {subView === 'leaderboard' && selectedJob && (
          <LeaderboardView
            candidates={candidates}
            job={selectedJob}
            onSelectCandidate={onSelectCandidate}
            onOpenCopilot={onOpenCopilot}
            onBulkUpdated={onRefreshData}
            onNavigateToTab={(tab) => {
              if (tab === 'comparison') setSubView('comparison');
              else if (tab === 'analytics') setSubView('analytics');
              else if (tab === 'interview') setSubView('interviews');
              else if (tab === 'dossier') onSelectCandidate(topCandidate?.id || '');
            }}
          />
        )}

        {/* Comparison Matrix View */}
        {subView === 'comparison' && selectedJob && (
          <ComparisonMatrixView
            candidates={candidates}
            job={selectedJob}
            activeCandidateId={topCandidate?.id || ''}
            onSelectCandidate={onSelectCandidate}
            onOpenCopilot={onOpenCopilot}
            onNavigateToTab={(tab) => {
              if (tab === 'leaderboard') setSubView('leaderboard');
            }}
          />
        )}

        {/* Multi-Round Interview Intelligence Tab */}
        {subView === 'interviews' && selectedJob && topCandidate && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Interview Intelligence for {topCandidate.name}</h3>
                <p className="text-xs text-slate-400">Active candidate for {selectedJob?.title || 'Target Role'}</p>
              </div>
              <button
                onClick={() => onSelectCandidate(topCandidate.id)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Switch candidate in Deep-Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <InterviewIntelligenceView
              candidate={topCandidate}
              job={selectedJob}
              onAddQuestion={() => {}}
              onOpenCopilot={onOpenCopilot}
            />
          </div>
        )}

        {/* Evidence & Fact-Check Tab */}
        {subView === 'evidence' && topCandidate && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Evidence & Factual Grounding for {topCandidate.name}</h3>
                <p className="text-xs text-slate-400">Reviewing multi-source claim citations</p>
              </div>
              <button
                onClick={() => onSelectCandidate(topCandidate.id)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Candidate Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <EvidenceVerificationPanel
              candidate={topCandidate}
              onVerifyClaim={() => {}}
              onOpenCopilot={onOpenCopilot}
            />
          </div>
        )}

        {/* Knowledge Graph Tab */}
        {subView === 'graph' && topCandidate && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Entity Relationship Graph for {topCandidate.name}</h3>
                <p className="text-xs text-slate-400">Interactive topology of skills, projects, institutions, and roles</p>
              </div>
              <button
                onClick={() => onSelectCandidate(topCandidate.id)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open in Candidate Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <EntityGraphView candidate={topCandidate} />
          </div>
        )}

        {/* Pipeline Analytics Tab */}
        {subView === 'analytics' && selectedJob && topCandidate && (
          <AnalyticsReportsView
            candidates={candidates}
            jobs={jobs}
            selectedJob={selectedJob}
            activeCandidate={topCandidate}
            onSelectCandidate={onSelectCandidate}
          />
        )}
      </main>
    </div>
  );
};
