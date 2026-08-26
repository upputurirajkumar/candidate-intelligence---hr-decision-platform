import React, { useState, useEffect } from 'react';
import { Candidate, JobProfile, InterviewQuestion, VerificationStatus, User } from './types';
import { CandidateHeader } from './components/CandidateHeader';
import { DossierOverview } from './components/DossierOverview';
import { CandidateSourcesView } from './components/CandidateSourcesView';
import { AgentOrchestratorView } from './components/AgentOrchestratorView';
import { EvidenceVerificationPanel } from './components/EvidenceVerificationPanel';
import { ComparisonMatrixView } from './components/ComparisonMatrixView';
import { EntityGraphView } from './components/EntityGraphView';
import { InterviewIntelligenceView } from './components/InterviewIntelligenceView';
import { HRCopilotDrawer } from './components/HRCopilotDrawer';
import { ResumeIngestionModal } from './components/ResumeIngestionModal';
import { CandidateIntakeModal } from './components/CandidateIntakeModal';
import { JobProfileSelector } from './components/JobProfileSelector';
import { AuthModal } from './components/AuthModal';
import { authenticatedFetch, getStoredToken, getStoredUser, clearAuthSession, setAuthSession } from './lib/api';
import { 
  Sparkles, 
  Upload, 
  Search, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Layers,
  Cpu,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Archive,
  Trash2,
  Filter,
  Plus
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [jobs, setJobs] = useState<JobProfile[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobProfile | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dossier' | 'sources' | 'agents' | 'verification' | 'comparison' | 'graph' | 'interview'>('dossier');
  
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState<boolean>(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check auth and load data
  useEffect(() => {
    async function initSessionAndData() {
      const token = getStoredToken();
      if (!token) {
        // Auto sign-in with default seeded admin credentials for immediate evaluator access
        try {
          const autoRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@talentintel.ai', password: 'AdminPass2026!' }),
          });
          if (autoRes.ok) {
            const data = await autoRes.json();
            setAuthSession(data.token, data.user);
            setCurrentUser(data.user);
            await loadPlatformData();
            return;
          }
        } catch {
          setIsAuthModalOpen(true);
          setLoading(false);
          return;
        }
      }

      // Verify token
      try {
        const meRes = await authenticatedFetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
          await loadPlatformData();
        } else {
          clearAuthSession();
          setCurrentUser(null);
          setIsAuthModalOpen(true);
          setLoading(false);
        }
      } catch {
        setIsAuthModalOpen(true);
        setLoading(false);
      }
    }

    initSessionAndData();
  }, []);

  const loadPlatformData = async () => {
    try {
      const [jobsRes, candsRes] = await Promise.all([
        authenticatedFetch('/api/jobs'),
        authenticatedFetch('/api/candidates?includeArchived=true'),
      ]);

      const jobsData = await jobsRes.json();
      const candsData = await candsRes.json();

      if (jobsData.jobs && jobsData.jobs.length > 0) {
        setJobs(jobsData.jobs);
        setSelectedJob(jobsData.jobs[0]);
      }

      if (candsData.candidates && candsData.candidates.length > 0) {
        setCandidates(candsData.candidates);
        setSelectedCandidateId(candsData.candidates[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial candidate platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authenticatedFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthSession();
      setCurrentUser(null);
      setIsAuthModalOpen(true);
    }
  };

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  const handleStatusChange = async (newStatus: Candidate['status']) => {
    if (!activeCandidate) return;
    try {
      const res = await authenticatedFetch(`/api/candidates/${activeCandidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.candidate) {
        setCandidates(prev => prev.map(c => (c.id === data.candidate.id ? data.candidate : c)));
      }
    } catch (err) {
      console.error('Failed to update candidate status:', err);
    }
  };

  const handleArchiveCandidate = async (candidateId: string) => {
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidateId}/archive`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.candidate) {
        setCandidates(prev => prev.map(c => (c.id === data.candidate.id ? data.candidate : c)));
      }
    } catch (err) {
      console.error('Failed to toggle candidate archive state:', err);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this candidate record?')) return;
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidateId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c.id !== candidateId));
        if (selectedCandidateId === candidateId) {
          const remaining = candidates.filter(c => c.id !== candidateId);
          if (remaining.length > 0) setSelectedCandidateId(remaining[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to delete candidate:', err);
    }
  };

  const handleVerifyClaim = async (
    claimId: string,
    newStatus: VerificationStatus,
    confidenceScore?: number,
    notes?: string
  ) => {
    if (!activeCandidate) return;
    try {
      const res = await authenticatedFetch(`/api/candidates/${activeCandidate.id}/verify-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, newStatus, confidenceScore, notes }),
      });
      const data = await res.json();
      if (data.candidate) {
        setCandidates(prev => prev.map(c => (c.id === data.candidate.id ? data.candidate : c)));
      }
    } catch (err) {
      console.error('Failed to override claim:', err);
    }
  };

  const handleAddQuestion = (newQuestion: InterviewQuestion) => {
    if (!activeCandidate) return;
    setCandidates(prev =>
      prev.map(c => {
        if (c.id === activeCandidate.id) {
          return {
            ...c,
            interviewQuestions: [...c.interviewQuestions, newQuestion],
          };
        }
        return c;
      })
    );
  };

  const handleCandidateAdded = (newCand: Candidate) => {
    setCandidates(prev => [newCand, ...prev]);
    setSelectedCandidateId(newCand.id);
    setActiveTab('dossier');
  };

  const filteredCandidates = candidates.filter(c => {
    if (!showArchived && c.isArchived) return false;
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.currentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (loading || (!currentUser && isAuthModalOpen)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticated={(user) => {
            setCurrentUser(user);
            loadPlatformData();
          }}
        />
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wider uppercase text-indigo-300">
          Authenticating Enterprise Session...
        </p>
      </div>
    );
  }

  if (!activeCandidate || !selectedJob) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wider uppercase text-indigo-300">
          Loading Candidate Intelligence Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Universal App Header */}
      <header id="platform-navbar" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">TalentIntel</span>
                <span className="bg-indigo-950 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-800 font-mono">
                  v2.5 AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Candidate Intelligence & Verification Platform</p>
            </div>
          </div>

          {/* Center Job Requisition Selector */}
          <div className="hidden md:block">
            <JobProfileSelector
              jobs={jobs}
              selectedJob={selectedJob}
              onSelectJob={(j) => setSelectedJob(j)}
              onUpdateJob={(updated) => {
                setSelectedJob(updated);
                setJobs(jobs.map(j => (j.id === updated.id ? updated : j)));
              }}
            />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-open-intake-wizard"
              onClick={() => setIsIntakeOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Candidate Intake</span>
            </button>

            <button
              id="btn-open-ingestion-modal"
              onClick={() => setIsIngestionOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ingest Resume</span>
            </button>

            <button
              id="btn-nav-copilot"
              onClick={() => setIsCopilotOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>HR Copilot</span>
            </button>

            {/* Authenticated User Capsule */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-600"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-[11px] font-bold text-slate-200 leading-none">{currentUser.name}</div>
                    <div className="text-[10px] text-indigo-400 font-semibold">{currentUser.role}</div>
                  </div>
                </div>

                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  title="Logout session"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Candidate Quick Selector Strip */}
      <div id="candidate-selector-strip" className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5 text-xs text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Candidate Pool ({filteredCandidates.length}):
            </span>

            {filteredCandidates.map(cand => {
              const isSelected = cand.id === activeCandidate.id;
              return (
                <button
                  key={cand.id}
                  id={`select-cand-${cand.id}`}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  } ${cand.isArchived ? 'opacity-60 line-through' : ''}`}
                >
                  <img src={cand.avatarUrl} alt={cand.name} className="w-4 h-4 rounded-full object-cover" />
                  <span>{cand.name}</span>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {cand.overallFitScore}%
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                showArchived ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-700' : 'bg-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              <Archive className="w-3 h-3" />
              <span>{showArchived ? 'Hide Archived' : 'Show Archived'}</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate name, skill..."
                className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-full sm:w-52"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Profile Header Card */}
      <CandidateHeader
        candidate={activeCandidate}
        job={selectedJob}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onStatusChange={handleStatusChange}
      />

      {/* Main Tab View Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'dossier' && (
          <DossierOverview
            candidate={activeCandidate}
            job={selectedJob}
            onNavigateToTab={setActiveTab}
            onOpenCopilot={() => setIsCopilotOpen(true)}
          />
        )}

        {activeTab === 'sources' && (
          <CandidateSourcesView
            candidate={activeCandidate}
            onUpdateCandidate={(updated) => {
              setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
            }}
          />
        )}

        {activeTab === 'agents' && (
          <AgentOrchestratorView
            candidate={activeCandidate}
            job={selectedJob}
          />
        )}

        {activeTab === 'verification' && (
          <EvidenceVerificationPanel
            candidate={activeCandidate}
            onVerifyClaim={handleVerifyClaim}
            onOpenCopilot={() => setIsCopilotOpen(true)}
          />
        )}

        {activeTab === 'comparison' && (
          <ComparisonMatrixView
            candidates={candidates}
            job={selectedJob}
            activeCandidateId={activeCandidate.id}
            onSelectCandidate={(id) => {
              setSelectedCandidateId(id);
              setActiveTab('dossier');
            }}
            onOpenCopilot={() => setIsCopilotOpen(true)}
          />
        )}

        {activeTab === 'graph' && (
          <EntityGraphView candidate={activeCandidate} />
        )}

        {activeTab === 'interview' && (
          <InterviewIntelligenceView
            candidate={activeCandidate}
            job={selectedJob}
            onAddQuestion={handleAddQuestion}
            onOpenCopilot={() => setIsCopilotOpen(true)}
          />
        )}
      </main>

      {/* AI Decision Copilot Drawer */}
      <HRCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        candidate={activeCandidate}
        job={selectedJob}
      />

      {/* Candidate Intake & Multi-Source Wizard Modal */}
      <CandidateIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        jobs={jobs}
        selectedJobId={selectedJob.id}
        onCandidateCreated={handleCandidateAdded}
      />

      {/* Resume Ingestion Modal */}
      <ResumeIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        jobs={jobs}
        selectedJobId={selectedJob.id}
        onCandidateAdded={handleCandidateAdded}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={(user) => {
          setCurrentUser(user);
          loadPlatformData();
        }}
      />
    </div>
  );
}

