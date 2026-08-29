import React, { useState } from 'react';
import { User, JobProfile } from '../../types';
import { 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Menu, 
  X, 
  LogOut, 
  ChevronRight, 
  Briefcase,
  ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react';

export type AppRoute = 
  | 'home'
  | 'how-it-works'
  | 'platform'
  | 'candidate';

interface GlobalNavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute, params?: { candidateId?: string; view?: string }) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenCopilot: () => void;
  onOpenUniverse?: () => void;
  selectedJob?: JobProfile | null;
}

export const GlobalNavbar: React.FC<GlobalNavbarProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenCopilot,
  onOpenUniverse,
  selectedJob,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navLinks: { id: AppRoute; label: string; badge?: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'platform', label: 'HR Workspace', badge: 'Enterprise' },
  ];

  return (
    <nav id="global-navbar" className="bg-slate-950/90 text-white border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                    TalentIntel
                  </span>
                  <span className="bg-cyan-950/90 text-cyan-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-cyan-800/60 font-mono">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Evidence-Grounded Candidate Intelligence
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.id || (link.id === 'platform' && currentRoute === 'candidate');
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-xs border border-slate-700/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {link.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {onOpenUniverse && (
                <button
                  id="navbar-btn-role-universe"
                  onClick={onOpenUniverse}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Explore 30+ Enterprise Roles Topology"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Role Universe</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">30+</span>
                </button>
              )}
            </div>
          </div>

          {/* Center Context Capsule: Requisition Indicator (When in Workspace) */}
          {(currentRoute === 'platform' || currentRoute === 'candidate') && selectedJob && (
            <div className="hidden xl:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 text-[11px]">Active Requisition:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[160px]">{selectedJob?.title || 'Target Role'}</span>
            </div>
          )}

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Global HR Copilot Launch (if authenticated) */}
            {currentUser && (
              <button
                id="btn-global-copilot"
                onClick={onOpenCopilot}
                className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Launch AI Decision Copilot"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>HR Copilot</span>
              </button>
            )}

            {/* Launch Workspace CTA (if on marketing pages) */}
            {(currentRoute === 'home' || currentRoute === 'how-it-works') && (
              <button
                onClick={() => onNavigate('platform')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* User Session Capsule or Sign In */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.2 rounded-xl border border-slate-800">
                  <img
                    src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={currentUser?.name || currentUser?.email || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-slate-700"
                  />
                  <div className="hidden lg:block text-left">
                    <div className="text-[11px] font-bold text-slate-200 leading-none">{currentUser?.name || currentUser?.email || 'Admin User'}</div>
                    <div className="text-[10px] text-cyan-400 font-semibold">{currentUser?.role || 'HR'}</div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Logout Session"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-2">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.id || (link.id === 'platform' && currentRoute === 'candidate');
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between cursor-pointer ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {onOpenUniverse && (
              <button
                onClick={() => {
                  onOpenUniverse();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-cyan-300 hover:bg-slate-900 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Role Universe (30+ Roles)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Topology
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
