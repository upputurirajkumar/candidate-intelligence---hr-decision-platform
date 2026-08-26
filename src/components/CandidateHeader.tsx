import React from 'react';
import { Candidate, JobProfile } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Sparkles, 
  FileText,
  GitBranch,
  Search,
  Layers,
  HelpCircle,
  BarChart3,
  Share2
} from 'lucide-react';

interface CandidateHeaderProps {
  candidate: Candidate;
  job: JobProfile;
  activeTab: 'dossier' | 'sources' | 'agents' | 'verification' | 'comparison' | 'graph' | 'interview';
  onTabChange: (tab: 'dossier' | 'sources' | 'agents' | 'verification' | 'comparison' | 'graph' | 'interview') => void;
  onOpenCopilot: () => void;
  onStatusChange: (status: Candidate['status']) => void;
}

export const CandidateHeader: React.FC<CandidateHeaderProps> = ({
  candidate,
  job,
  activeTab,
  onTabChange,
  onOpenCopilot,
  onStatusChange,
}) => {
  const verifiedClaimsCount = candidate.claims.filter(c => c.status === 'verified').length;
  const flaggedClaimsCount = candidate.claims.filter(c => c.status === 'exaggerated' || c.status === 'flagged').length;

  const statusColors = {
    shortlisted: 'bg-blue-50 text-blue-700 border-blue-200',
    in_interview: 'bg-amber-50 text-amber-700 border-amber-200',
    offer_ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    review_required: 'bg-rose-50 text-rose-700 border-rose-200',
    rejected: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const statusLabels = {
    shortlisted: 'Shortlisted',
    in_interview: 'In Interview',
    offer_ready: 'Offer Ready',
    review_required: 'Review Required',
    rejected: 'Archived / Rejected',
  };

  return (
    <div id="candidate-header" className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Candidate Profile Details */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={candidate.avatarUrl}
                alt={candidate.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-full text-white ring-2 ring-white" title="Verified Identity">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{candidate.name}</h1>
                <select
                  id="candidate-status-select"
                  aria-label="Candidate Status"
                  value={candidate.status}
                  onChange={(e) => onStatusChange(e.target.value as Candidate['status'])}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${statusColors[candidate.status]}`}
                >
                  <option value="shortlisted">{statusLabels.shortlisted}</option>
                  <option value="in_interview">{statusLabels.in_interview}</option>
                  <option value="offer_ready">{statusLabels.offer_ready}</option>
                  <option value="review_required">{statusLabels.review_required}</option>
                  <option value="rejected">{statusLabels.rejected}</option>
                </select>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                  ID: {candidate.id}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-700 mt-0.5">
                {candidate.currentRole} <span className="text-slate-400">at</span> <span className="text-indigo-600 font-semibold">{candidate.currentCompany}</span>
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.yearsOfExperience} years exp
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Notice: {candidate.noticePeriod}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.salaryExpectation}
                </span>
              </div>
            </div>
          </div>

          {/* Fit Scores & Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Overall Role Fit Card */}
            <div id="metric-role-fit" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="18" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    stroke={candidate.overallFitScore >= 90 ? '#10b981' : candidate.overallFitScore >= 75 ? '#6366f1' : '#f59e0b'}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - candidate.overallFitScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-slate-800">{candidate.overallFitScore}%</span>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Role Fit Index</div>
                <div className="text-xs font-medium text-slate-800 truncate max-w-[140px]" title={job.title}>
                  {job.title}
                </div>
              </div>
            </div>

            {/* Evidence Verification Score Card */}
            <div id="metric-evidence-verified" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                {candidate.verificationRating}%
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Evidence Grounding</div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {verifiedClaimsCount} verified
                  </span>
                  {flaggedClaimsCount > 0 && (
                    <span className="text-amber-700 font-medium flex items-center gap-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> {flaggedClaimsCount} probe
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Copilot Quick Launcher Button */}
            <button
              id="btn-open-copilot"
              onClick={onOpenCopilot}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI Copilot</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 mt-6 border-t border-slate-100 pt-3 overflow-x-auto">
          <button
            id="tab-dossier"
            onClick={() => onTabChange('dossier')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dossier'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Intelligence Dossier</span>
          </button>

          <button
            id="tab-sources"
            onClick={() => onTabChange('sources')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sources'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Candidate Sources</span>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {(candidate.externalSources?.length || 0) + (candidate.documents?.length || 1) + (candidate.certifications?.length || 0)}
            </span>
          </button>

          <button
            id="tab-agents"
            onClick={() => onTabChange('agents')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'agents'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Multi-Agent Reasoning Trace</span>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {candidate.reasoningTrace.length}
            </span>
          </button>

          <button
            id="tab-verification"
            onClick={() => onTabChange('verification')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Claim Grounding & Fact Checks</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {candidate.claims.length}
            </span>
          </button>

          <button
            id="tab-comparison"
            onClick={() => onTabChange('comparison')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'comparison'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Comparison Matrix</span>
          </button>

          <button
            id="tab-graph"
            onClick={() => onTabChange('graph')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Entity Knowledge Graph</span>
          </button>

          <button
            id="tab-interview"
            onClick={() => onTabChange('interview')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'interview'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Interview Intelligence & Rubric</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {candidate.interviewQuestions.length}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
