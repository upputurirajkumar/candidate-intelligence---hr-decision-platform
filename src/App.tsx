import React, { useState, useEffect } from 'react';
import { Candidate, JobProfile, InterviewQuestion, VerificationStatus, User } from './types';
import { GlobalNavbar, AppRoute } from './components/navigation/GlobalNavbar';
import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { HRWorkspacePage } from './pages/HRWorkspacePage';
import { CandidateWorkspacePage } from './pages/CandidateWorkspacePage';
import { HRCopilotDrawer } from './components/HRCopilotDrawer';
import { ResumeIngestionModal } from './components/ResumeIngestionModal';
import { CandidateIntakeModal } from './components/CandidateIntakeModal';
import { AuthModal } from './components/AuthModal';
import { RoleUniverseModal } from './components/RoleUniverseModal';
import { AIProcessingPipelineModal } from './components/AIProcessingPipelineModal';
import { FuturisticBackground } from './components/FuturisticBackground';
import { authenticatedFetch, getStoredToken, getStoredUser, clearAuthSession, setAuthSession } from './lib/api';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [jobs, setJobs] = useState<JobProfile[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobProfile | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isIngestionOpen, setIsIngestionOpen] = useState<boolean>(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState<boolean>(false);
  const [isUniverseOpen, setIsUniverseOpen] = useState<boolean>(false);
  const [isAIProcessingOpen, setIsAIProcessingOpen] = useState<boolean>(false);
  const [processingCandidateName, setProcessingCandidateName] = useState<string>('Candidate Pipeline');
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Sync route with browser window path / history
  useEffect(() => {
    const parseUrlRoute = () => {
      const path = window.location.pathname;
      if (path === '/how-it-works') {
        setCurrentRoute('how-it-works');
      } else if (path.startsWith('/candidates/') || path.startsWith('/platform/candidate/')) {
        const parts = path.split('/');
        const id = parts[parts.length - 1];
        if (id) {
          setSelectedCandidateId(id);
          setCurrentRoute('candidate');
        } else {
          setCurrentRoute('platform');
        }
      } else if (path.startsWith('/platform')) {
        setCurrentRoute('platform');
      } else {
        setCurrentRoute('home');
      }
    };

    parseUrlRoute();

    const handlePopState = () => {
      parseUrlRoute();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize session & data
  useEffect(() => {
    async function initSessionAndData() {
      const token = getStoredToken();
      if (!token) {
        // Auto-seed demo enterprise session for frictionless preview
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
          // If auto login fails, data will load upon explicit sign-in
        }
      } else {
        try {
          const meRes = await authenticatedFetch('/api/auth/me');
          if (meRes.ok) {
            const meData = await meRes.json();
            setCurrentUser(meData.user);
            await loadPlatformData();
          } else {
            clearAuthSession();
            setCurrentUser(null);
          }
        } catch {
          clearAuthSession();
          setCurrentUser(null);
        }
      }
    }

    initSessionAndData();
  }, []);

  const loadPlatformData = async () => {
    setLoadingData(true);
    try {
      const [jobsRes, candsRes] = await Promise.all([
        authenticatedFetch('/api/jobs'),
        authenticatedFetch('/api/candidates?includeArchived=true'),
      ]);

      if (jobsRes.ok && candsRes.ok) {
        const jobsData = await jobsRes.json();
        const candsData = await candsRes.json();

        if (jobsData.jobs && jobsData.jobs.length > 0) {
          setJobs(jobsData.jobs);
          if (!selectedJob) setSelectedJob(jobsData.jobs[0]);
        }

        if (candsData.candidates && candsData.candidates.length > 0) {
          setCandidates(candsData.candidates);
          if (!selectedCandidateId) setSelectedCandidateId(candsData.candidates[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load candidate platform data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleNavigate = (route: AppRoute, params?: { candidateId?: string }) => {
    setCurrentRoute(route);
    let newPath = '/';
    if (route === 'how-it-works') {
      newPath = '/how-it-works';
    } else if (route === 'platform') {
      newPath = '/platform';
      if (!currentUser) setIsAuthModalOpen(true);
    } else if (route === 'candidate') {
      const candId = params?.candidateId || selectedCandidateId || (candidates[0]?.id ?? '');
      setSelectedCandidateId(candId);
      newPath = `/candidates/${candId}`;
      if (!currentUser) setIsAuthModalOpen(true);
    }

    try {
      window.history.pushState({}, '', newPath);
    } catch {
      // Safe fallback if history API is restricted
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    handleNavigate('candidate', { candidateId });
  };

  const handleLogout = async () => {
    try {
      await authenticatedFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthSession();
      setCurrentUser(null);
      handleNavigate('home');
    }
  };

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  const handleStatusChange = async (newStatus: Candidate['status']) => {
    if (!activeCandidate) return;
    try {
      const res = await authenticatedFetch(`/api/candidates/${activeCandidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          pipelineStatus: newStatus,
        }),
      });
      const data = await res.json();
      if (data.candidate) {
        setCandidates(prev => prev.map(c => (c.id === data.candidate.id ? data.candidate : c)));
      }
    } catch (err) {
      console.error('Failed to update candidate status:', err);
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
    handleNavigate('candidate', { candidateId: newCand.id });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 relative">
      {/* Ambient Futuristic Background Visuals */}
      <FuturisticBackground />

      {/* Global Navigation Bar */}
      <GlobalNavbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenUniverse={() => setIsUniverseOpen(true)}
        selectedJob={selectedJob}
      />

      {/* Page Routing Switcher */}
      <div className="flex-1 w-full relative z-10">
        {currentRoute === 'home' && (
          <LandingPage
            onExplorePlatform={() => handleNavigate('platform')}
            onSeeHowItWorks={() => handleNavigate('how-it-works')}
          />
        )}

        {currentRoute === 'how-it-works' && (
          <HowItWorksPage
            onLaunchPlatform={() => handleNavigate('platform')}
          />
        )}

        {currentRoute === 'platform' && (
          <HRWorkspacePage
            candidates={candidates}
            jobs={jobs}
            selectedJob={selectedJob}
            onSelectJob={(j) => setSelectedJob(j)}
            onUpdateJob={(updated) => {
              setSelectedJob(updated);
              setJobs(jobs.map(j => (j.id === updated.id ? updated : j)));
            }}
            onJobCreated={(newJob) => {
              setJobs(prev => [newJob, ...prev]);
              setSelectedJob(newJob);
            }}
            onJobDeleted={(jobId) => {
              setJobs(prev => prev.filter(j => j.id !== jobId));
            }}
            onSelectCandidate={handleSelectCandidate}
            onOpenIntake={() => setIsIntakeOpen(true)}
            onOpenIngestion={() => setIsIngestionOpen(true)}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            onOpenUniverse={() => setIsUniverseOpen(true)}
            onOpenAIProcessing={(candName) => {
              setProcessingCandidateName(candName || 'Candidate Processing Engine');
              setIsAIProcessingOpen(true);
            }}
            onRefreshData={loadPlatformData}
            currentUser={currentUser}
          />
        )}

        {currentRoute === 'candidate' && (
          activeCandidate ? (
            <CandidateWorkspacePage
              candidate={activeCandidate}
              candidates={candidates}
              job={selectedJob}
              onBackToWorkspace={() => handleNavigate('platform')}
              onSelectCandidate={(id) => {
                setSelectedCandidateId(id);
                handleNavigate('candidate', { candidateId: id });
              }}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onStatusChange={handleStatusChange}
              onVerifyClaim={handleVerifyClaim}
              onAddQuestion={handleAddQuestion}
              onUpdateCandidate={(updated) => {
                setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
              }}
            />
          ) : (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              <p className="text-xs">Loading Candidate Dossier & Verification Ledger...</p>
            </div>
          )
        )}
      </div>

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
        selectedJobId={selectedJob?.id || ''}
        onCandidateCreated={(newCand) => {
          handleCandidateAdded(newCand);
          setProcessingCandidateName(newCand.name);
          setIsAIProcessingOpen(true);
        }}
      />

      {/* Resume Ingestion Modal */}
      <ResumeIngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        jobs={jobs}
        selectedJobId={selectedJob?.id || ''}
        onCandidateAdded={(newCand) => {
          handleCandidateAdded(newCand);
          setProcessingCandidateName(newCand.name);
          setIsAIProcessingOpen(true);
        }}
      />

      {/* 30+ Role Universe Modal */}
      <RoleUniverseModal
        isOpen={isUniverseOpen}
        onClose={() => setIsUniverseOpen(false)}
        selectedJob={selectedJob}
        jobs={jobs}
        candidates={candidates}
        onSelectRole={(job) => {
          setSelectedJob(job);
          setIsUniverseOpen(false);
          handleNavigate('platform');
        }}
        onSelectJob={(job) => {
          setSelectedJob(job);
          setIsUniverseOpen(false);
          handleNavigate('platform');
        }}
        onSelectCandidate={(candId) => {
          setIsUniverseOpen(false);
          handleSelectCandidate(candId);
        }}
      />

      {/* AI Processing Pipeline Audit Modal */}
      <AIProcessingPipelineModal
        isOpen={isAIProcessingOpen}
        onClose={() => setIsAIProcessingOpen(false)}
        candidateName={processingCandidateName}
        onComplete={() => {
          // Keep active view refreshed
          loadPlatformData();
        }}
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
