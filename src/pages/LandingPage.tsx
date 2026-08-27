import React from 'react';
import { Hero3DCanvas } from '../components/3d/Hero3DCanvas';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  GitBranch, 
  FileText, 
  Users, 
  BarChart3, 
  Lock, 
  Layers, 
  HelpCircle,
  TrendingUp,
  Share2
} from 'lucide-react';

interface LandingPageProps {
  onExplorePlatform: () => void;
  onSeeHowItWorks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onExplorePlatform,
  onSeeHowItWorks,
}) => {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/60">
        {/* Glow Background Blurs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-700/60 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-300 backdrop-blur-md shadow-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Next-Gen Candidate Verification & Intelligence</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Understand Candidates <br />
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                  Beyond the Resume.
                </span>
              </h1>

              {/* Supporting Subheadline */}
              <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0">
                AI-powered candidate intelligence using evidence from resumes, GitHub, LinkedIn, portfolios, and official registries. Eliminate resume embellishment with multi-source factual corroboration.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  id="hero-btn-explore"
                  onClick={onExplorePlatform}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl hover:shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-btn-how-it-works"
                  onClick={onSeeHowItWorks}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>See How It Works</span>
                </button>
              </div>

              {/* Quick Proof Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-white font-mono">94%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Factual Grounding</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">0.0%</div>
                  <div className="text-[11px] text-slate-400 font-medium">AI Hallucination Drift</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-indigo-400 font-mono">65%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Faster Screening</div>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Canvas Column */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <Hero3DCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* The Problem with Traditional Resumes */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-800/60 px-3 py-1 rounded-full">
              The Hiring Dilemma
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              70% of resumes contain exaggerated or unverifiable claims.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Traditional applicant tracking systems blindly index keywords without verifying whether a candidate actually designed the architecture or merely sat in the meeting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legacy Resume Pitfall */}
            <div className="bg-slate-900/80 border border-rose-900/30 rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Traditional Keyword-Based Screening</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Uncorroborated Claims:</strong> Self-authored resumes treated as ground truth without proof.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>AI Keyword Stuffing:</strong> Candidates pass ATS filters with synthetic prompt-generated resumes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Blind Interview Prep:</strong> Interviewers ask generic questions instead of probing actual risk areas.</span>
                </li>
              </ul>
            </div>

            {/* TalentIntel Grounded Solution */}
            <div className="bg-slate-900/80 border border-emerald-900/30 rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">TalentIntel Evidence Grounding</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Multi-Modal Cross-Checking:</strong> Corroborates claims against GitHub commits, LinkedIn tenure, and certifications.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Autonomous Multi-Agent Audit:</strong> Technical, Experience, Integrity, and Culture agents inspect with zero hallucinations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Targeted Interview Intelligence:</strong> Auto-generates exact probing questions with expected candidate answers.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Grid */}
      <section className="py-20 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
              Full-Stack HR Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              A unified command center for precision hiring.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Everything hiring managers and talent leads need to evaluate candidates objectively with complete provenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Multi-Agent Review */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="p-3 bg-indigo-950/80 text-indigo-400 rounded-2xl w-fit border border-indigo-800/60">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Agent Autonomous Orchestration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                4 specialized agents run isolated evaluations across code repositories, career continuity, integrity signals, and soft skills with full reasoning traces.
              </p>
            </div>

            {/* Feature 2: Fact Checking & Grounding */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="p-3 bg-cyan-950/80 text-cyan-400 rounded-2xl w-fit border border-cyan-800/60">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Verifiable Evidence Fact-Checker</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Audits every claim with confidence scores and evidence citations. Flags timeline conflicts and corroborates GitHub PRs and registry credentials.
              </p>
            </div>

            {/* Feature 3: Explainable Job Matching */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="p-3 bg-emerald-950/80 text-emerald-400 rounded-2xl w-fit border border-emerald-800/60">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Explainable Fit Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transparent match formulas weighting required skills, architectural depth, and evidence grounding with custom departmental weighting bars.
              </p>
            </div>

            {/* Feature 4: Interview Intelligence */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-purple-500/40 transition-all">
              <div className="p-3 bg-purple-950/80 text-purple-400 rounded-2xl w-fit border border-purple-800/60">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Live Interview Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated probing question protocols with rubric criteria, live structured scoring pads, and multi-round synthesis feedback.
              </p>
            </div>

            {/* Feature 5: Side-by-Side Comparison */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-amber-500/40 transition-all">
              <div className="p-3 bg-amber-950/80 text-amber-400 rounded-2xl w-fit border border-amber-800/60">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Comparison Matrix & Leaderboard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare top candidates across required skill tables, evidence ratings, and compensation fit with automated top-pick hiring verdicts.
              </p>
            </div>

            {/* Feature 6: Knowledge Graph */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-pink-500/40 transition-all">
              <div className="p-3 bg-pink-950/80 text-pink-400 rounded-2xl w-fit border border-pink-800/60">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Candidate Entity Knowledge Graph</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive topological visualization connecting skills, past companies, open source repositories, and verified achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security Banner */}
      <section className="py-16 bg-slate-900/80 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                <Lock className="w-4 h-4" />
                <span>Enterprise Security & Multi-Tenant Isolation</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Built with zero-trust prompt injection defense and strict data residency.
              </h3>
              <p className="text-xs text-slate-400">
                Untrusted candidate resumes are sealed in non-executable sandboxes before analysis. Scrypt cryptographic password hashing, role-based access control, and full organizational tenant isolation.
              </p>
            </div>

            <button
              onClick={onExplorePlatform}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all shrink-0 cursor-pointer"
            >
              Access HR Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to upgrade your talent decisions with verified intelligence?
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto font-sans">
            Launch the workspace to explore pre-seeded candidates, ingest new resumes, or test autonomous agent fact-checking.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExplorePlatform}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Launch HR Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
