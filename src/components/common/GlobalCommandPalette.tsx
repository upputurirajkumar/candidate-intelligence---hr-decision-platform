import React, { useState, useEffect, useRef } from 'react';
import { Candidate, JobProfile, User } from '../../types';
import { 
  Search, 
  Users, 
  Briefcase, 
  Sparkles, 
  Upload, 
  Plus, 
  Layers, 
  BarChart3, 
  HelpCircle, 
  ShieldCheck, 
  Share2, 
  Cpu, 
  ArrowRight,
  Terminal,
  RotateCcw,
  Sliders,
  X
} from 'lucide-react';

interface CommandItem {
  id: string;
  category: 'Candidates' | 'Job Requisitions' | 'Navigation' | 'Actions' | 'Developer';
  title: string;
  subtitle?: string;
  badge?: string;
  icon: React.ReactNode;
  perform: () => void;
}

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Candidate[];
  jobs: JobProfile[];
  selectedJob: JobProfile | null;
  currentUser: User | null;
  onSelectCandidate: (id: string) => void;
  onSelectJob: (job: JobProfile) => void;
  onNavigate: (route: 'home' | 'how-it-works' | 'platform' | 'candidate', params?: any) => void;
  onOpenIntake: () => void;
  onOpenIngestion: () => void;
  onOpenCopilot: () => void;
  onOpenUniverse: () => void;
  onOpenInspector: () => void;
  onRefreshData: () => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  isOpen,
  onClose,
  candidates,
  jobs,
  selectedJob,
  currentUser,
  onSelectCandidate,
  onSelectJob,
  onNavigate,
  onOpenIntake,
  onOpenIngestion,
  onOpenCopilot,
  onOpenUniverse,
  onOpenInspector,
  onRefreshData,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build items list dynamically based on query
  const allItems: CommandItem[] = [
    // Fast Quick Actions
    {
      id: 'action-intake',
      category: 'Actions',
      title: 'Add Candidate Profile',
      subtitle: 'Open multi-source candidate intake wizard',
      badge: 'Intake',
      icon: <Plus className="w-4 h-4 text-cyan-400" />,
      perform: () => {
        onOpenIntake();
        onClose();
      },
    },
    {
      id: 'action-ingest',
      category: 'Actions',
      title: 'Upload Resume File',
      subtitle: 'Ingest PDF, DOCX, TXT, or MD resume into active requisition',
      badge: 'Parse',
      icon: <Upload className="w-4 h-4 text-indigo-400" />,
      perform: () => {
        onOpenIngestion();
        onClose();
      },
    },
    {
      id: 'action-copilot',
      category: 'Actions',
      title: 'Launch HR Decision Copilot',
      subtitle: 'Open grounded AI assistant & live voice session',
      badge: 'AI Copilot',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      perform: () => {
        onOpenCopilot();
        onClose();
      },
    },
    {
      id: 'action-universe',
      category: 'Actions',
      title: 'Explore 30+ Role Universe',
      subtitle: 'View topological career cluster map and talent matches',
      badge: '3D Topology',
      icon: <Cpu className="w-4 h-4 text-cyan-300" />,
      perform: () => {
        onOpenUniverse();
        onClose();
      },
    },
    {
      id: 'action-refresh',
      category: 'Actions',
      title: 'Synchronize Platform Data',
      subtitle: 'Refresh candidate records, match scores, and requisitions',
      badge: 'Sync',
      icon: <RotateCcw className="w-4 h-4 text-emerald-400" />,
      perform: () => {
        onRefreshData();
        onClose();
      },
    },
    {
      id: 'action-inspector',
      category: 'Developer',
      title: 'Open UI State Inspector',
      subtitle: 'Inspect live candidate, job, and overlay state tree',
      badge: 'Ctrl+Shift+D',
      icon: <Sliders className="w-4 h-4 text-violet-400" />,
      perform: () => {
        onOpenInspector();
        onClose();
      },
    },

    // Navigation Items
    {
      id: 'nav-workspace',
      category: 'Navigation',
      title: 'Go to HR Decision Workspace',
      subtitle: 'Access candidate leaderboards, comparisons, and analytics',
      icon: <Briefcase className="w-4 h-4 text-indigo-400" />,
      perform: () => {
        onNavigate('platform');
        onClose();
      },
    },
    {
      id: 'nav-how-it-works',
      category: 'Navigation',
      title: 'Go to How It Works & Architecture',
      subtitle: 'Inspect the 6-agent reasoning chain and trust model',
      icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
      perform: () => {
        onNavigate('how-it-works');
        onClose();
      },
    },
    {
      id: 'nav-home',
      category: 'Navigation',
      title: 'Go to Landing Page',
      subtitle: 'Return to TalentIntel overview',
      icon: <Sparkles className="w-4 h-4 text-slate-400" />,
      perform: () => {
        onNavigate('home');
        onClose();
      },
    },

    // Candidate Items
    ...candidates.map((cand) => ({
      id: `cand-${cand.id}`,
      category: 'Candidates' as const,
      title: cand.name,
      subtitle: `${cand.currentRole} • ${cand.overallFitScore}% Match • ${cand.pipelineStatus || cand.status}`,
      badge: `${cand.claims?.length || 0} claims`,
      icon: <Users className="w-4 h-4 text-cyan-400" />,
      perform: () => {
        onSelectCandidate(cand.id);
        onClose();
      },
    })),

    // Job Requisitions
    ...jobs.map((job) => ({
      id: `job-${job.id}`,
      category: 'Job Requisitions' as const,
      title: job.title,
      subtitle: `${job.department} • ${job.experienceYearsRequired}+ yrs • ${job.requiredSkills?.length || 0} req skills`,
      badge: selectedJob?.id === job.id ? 'Active' : undefined,
      icon: <Briefcase className="w-4 h-4 text-amber-400" />,
      perform: () => {
        onSelectJob(job);
        onNavigate('platform');
        onClose();
      },
    })),
  ];

  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].perform();
      }
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const selectedEl = listEl.children[selectedIndex] as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      id="global-command-palette-backdrop"
      className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="global-command-palette-card"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates, roles, actions, or type a command..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-hidden font-medium"
          />
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">ESC</kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Terminal className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-semibold">No matching candidates, actions, or requisitions</p>
              <p className="text-[11px] text-slate-500">Try searching for a candidate name, skill, or role title</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.perform}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/90 text-white shadow-xs'
                      : 'hover:bg-slate-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg border shrink-0 ${
                        isSelected
                          ? 'bg-indigo-700/80 border-indigo-400/40 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">{item.title}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                            isSelected
                              ? 'bg-indigo-800 text-indigo-200 border-indigo-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                          isSelected
                            ? 'bg-indigo-800 text-cyan-200 border border-indigo-500'
                            : 'bg-slate-800 text-cyan-400 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-white' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">↑</kbd>
              <kbd className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">↵</kbd> to select
            </span>
          </div>
          <span className="font-mono text-[10px] text-indigo-400">TalentIntel Quick-Actions</span>
        </div>
      </div>
    </div>
  );
};
