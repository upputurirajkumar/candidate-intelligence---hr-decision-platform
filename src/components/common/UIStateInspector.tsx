import React, { useState } from 'react';
import { Candidate, JobProfile, User } from '../../types';
import { 
  Sliders, 
  X, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  Briefcase, 
  User as UserIcon, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Sparkles
} from 'lucide-react';
import { useToast } from './ToastSystem';

interface UIStateInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: string;
  selectedJob: JobProfile | null;
  activeCandidate: Candidate | null;
  candidatesCount: number;
  jobsCount: number;
  currentUser: User | null;
  overlays: {
    isCopilotOpen: boolean;
    isIntakeOpen: boolean;
    isIngestionOpen: boolean;
    isUniverseOpen: boolean;
    isAIProcessingOpen: boolean;
    isAuthModalOpen: boolean;
    isCommandPaletteOpen: boolean;
  };
}

export const UIStateInspector: React.FC<UIStateInspectorProps> = ({
  isOpen,
  onClose,
  currentRoute,
  selectedJob,
  activeCandidate,
  candidatesCount,
  jobsCount,
  currentUser,
  overlays,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const toast = useToast();

  if (!isOpen) return null;

  const stateDump = {
    timestamp: new Date().toISOString(),
    route: currentRoute,
    pathname: typeof window !== 'undefined' ? window.location.pathname : '',
    tenant: {
      userId: currentUser?.id || 'unauthenticated',
      email: currentUser?.email || 'unauthenticated',
      role: currentUser?.role || 'none',
      orgId: currentUser?.organizationId || 'org_talentintel_demo',
    },
    activeJobRequisition: selectedJob ? {
      id: selectedJob.id,
      title: selectedJob.title,
      department: selectedJob.department,
      experienceYearsRequired: selectedJob.experienceYearsRequired,
      requiredSkillsCount: selectedJob.requiredSkills?.length || 0,
      preferredSkillsCount: selectedJob.preferredSkills?.length || 0,
    } : null,
    activeCandidateDossier: activeCandidate ? {
      id: activeCandidate.id,
      name: activeCandidate.name,
      currentRole: activeCandidate.currentRole,
      pipelineStatus: activeCandidate.pipelineStatus || activeCandidate.status,
      overallFitScore: activeCandidate.overallFitScore,
      claimsCount: activeCandidate.claims?.length || 0,
      verifiedClaimsCount: activeCandidate.claims?.filter(c => c.verificationStatus === 'VERIFIED').length || 0,
      evidenceSourcesCount: activeCandidate.evidenceRecords?.length || 0,
    } : null,
    inventory: {
      totalCandidates: candidatesCount,
      totalJobs: jobsCount,
    },
    overlays,
    synchronization: {
      isJobSelected: !!selectedJob,
      isCandidateSelected: !!activeCandidate,
      isCandidateMatchedToJob: activeCandidate ? (activeCandidate.targetJobId === selectedJob?.id || !activeCandidate.targetJobId) : true,
      allOverlaysClosed: Object.values(overlays).filter(Boolean).length <= 1,
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(stateDump, null, 2));
    setCopied(true);
    toast.success('UI State Dump Copied', 'Active component state copied to clipboard as JSON.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="ui-state-inspector-panel"
      className="fixed bottom-4 left-4 z-[60] max-w-md w-full bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-3 duration-200"
      role="dialog"
      aria-label="UI State Inspector"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-950/80 border border-violet-700/60 flex items-center justify-center text-violet-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">UI State Inspector</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-800">
                Dev/Audit
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Live Synchronized Platform State</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy state JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[10px] hidden sm:inline">{copied ? 'Copied' : 'JSON'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 overflow-y-auto space-y-4 text-xs">
        {/* Sync Status Banner */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">State Synchronization</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
            HEALTHY
          </span>
        </div>

        {/* Section 1: Navigation & Route */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>Active Navigation</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Route:</span>
              <span className="text-indigo-300 font-bold">{currentRoute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pathname:</span>
              <span className="text-slate-300">{typeof window !== 'undefined' ? window.location.pathname : '/'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Active Job Requisition */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <Briefcase className="w-3 h-3 text-amber-400" />
            <span>Selected Job Requisition</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
            {selectedJob ? (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Title:</span>
                  <span className="text-amber-300 font-bold truncate max-w-[200px]">{selectedJob.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-slate-300">{selectedJob.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Required Skills:</span>
                  <span className="text-slate-300">{selectedJob.requiredSkills?.length || 0} skills</span>
                </div>
              </>
            ) : (
              <span className="text-slate-500 italic">No requisition selected</span>
            )}
          </div>
        </div>

        {/* Section 3: Active Candidate */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <UserIcon className="w-3 h-3 text-cyan-400" />
            <span>Active Candidate Dossier</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
            {activeCandidate ? (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-cyan-300 font-bold">{activeCandidate.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Overall Fit:</span>
                  <span className="text-emerald-400 font-bold">{activeCandidate.overallFitScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Claims / Verified:</span>
                  <span className="text-slate-300">
                    {activeCandidate.claims?.length || 0} / {activeCandidate.claims?.filter(c => c.verificationStatus === 'VERIFIED').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pipeline Stage:</span>
                  <span className="text-indigo-300">{activeCandidate.pipelineStatus || activeCandidate.status}</span>
                </div>
              </>
            ) : (
              <span className="text-slate-500 italic">No candidate selected</span>
            )}
          </div>
        </div>

        {/* Section 4: Active Overlays */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Active Overlays & Drawers</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            {Object.entries(overlays).map(([key, active]) => (
              <div key={key} className="flex items-center justify-between p-1 rounded bg-slate-900/60">
                <span className="text-slate-400 truncate">{key.replace(/^is/, '').replace(/Open$/, '')}</span>
                <span className={`px-1 rounded font-bold ${active ? 'text-amber-400 bg-amber-950' : 'text-slate-600'}`}>
                  {active ? 'OPEN' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Session & Tenant */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <FileCode className="w-3 h-3 text-slate-400" />
            <span>Session & Multi-Tenancy</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">User Role:</span>
              <span className="text-cyan-400 font-bold">{currentUser?.role || 'Guest'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tenant Org:</span>
              <span className="text-slate-300 truncate max-w-[180px]">{currentUser?.organizationId || 'org_talentintel_demo'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Shortcut Tip */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Toggle shortcut: <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">Ctrl+Shift+D</kbd></span>
        <button
          onClick={onClose}
          className="text-indigo-400 hover:underline cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
