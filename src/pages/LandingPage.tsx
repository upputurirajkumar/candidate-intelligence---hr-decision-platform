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
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-24 border-b border-slate-800/60">
        {/* Ambient Radial Gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-700/60 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-300 backdrop-blur-md shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Evidence-Grounded Candidate Intelligence</span>
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
                AI connects candidate information from multiple sources, cross-checks available evidence, identifies potential inconsistencies, evaluates role alignment, and helps HR make better-informed decisions.
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

              {/* Legitimate Product Capability Highlights (No Invented Stats) */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-white font-mono">5</div>
                  <div className="text-[11px] text-slate-400 font-medium">Grounded Sources</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">30+</div>
                  <div className="text-[11px] text-slate-400 font-medium">Supported Roles</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-indigo-300 font-sans leading-tight">Multi-Source</div>
                  <div className="text-[11px] text-slate-400 font-medium">Evidence Analysis</div>
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

      {/* The Dilemma with Unverified Resumes */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-800/60 px-3 py-1 rounded-full">
              Hiring Evaluation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Resumes alone cannot verify practical execution.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Traditional keyword filters match surface text without verifying whether self-reported achievements match actual code repositories, career timelines, and certified credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unverified Resume Review */}
            <div className="bg-slate-900/80 border border-rose-900/30 rounded-3xl p-8 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Traditional Keyword-Based Screening</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Uncorroborated Claims:</strong> Self-authored summaries treated as fact without proof.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Keyword Inconsistencies:</strong> ATS filters pass surface text without verifying technical depth.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Generic Interview Prep:</strong> Interviewers ask standard questions instead of exploring concrete evidence.</span>
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
                  <span><strong>Multi-Source Corroboration:</strong> Cross-checks claims against code repos, career tenure, and verified credentials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Multi-Agent Domain Review:</strong> Specialized agents evaluate technical depth, continuity, and collaboration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Targeted Interview Protocols:</strong> Generates probing questions grounded in verified candidate artifacts.</span>
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
              Everything talent teams and hiring managers need to evaluate candidate profiles with complete evidence provenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Multi-Agent Review */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="p-3 bg-indigo-950/80 text-indigo-400 rounded-2xl w-fit border border-indigo-800/60">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Multi-Agent Review System</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Specialized agents run structured evaluations across code repositories, career continuity, integrity signals, and soft skills with reasoning traces.
              </p>
            </div>

            {/* Feature 2: Fact Checking & Grounding */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="p-3 bg-cyan-950/80 text-cyan-400 rounded-2xl w-fit border border-cyan-800/60">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Verifiable Evidence Fact-Checking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspects claims with confidence metrics and evidence citations. Highlights timeline conflicts and corroborates code commits and registry credentials.
              </p>
            </div>

            {/* Feature 3: Explainable Job Matching */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="p-3 bg-emerald-950/80 text-emerald-400 rounded-2xl w-fit border border-emerald-800/60">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Explainable Role Match Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transparent match formulas weighting required skills, architectural depth, and evidence grounding with customizable weighting bars.
              </p>
            </div>

            {/* Feature 4: Interview Intelligence */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-purple-500/40 transition-all">
              <div className="p-3 bg-purple-950/80 text-purple-400 rounded-2xl w-fit border border-purple-800/60">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Structured Interview Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Targeted probing question protocols with rubric criteria, live structured scoring pads, and multi-round synthesis feedback.
              </p>
            </div>

            {/* Feature 5: Side-by-Side Comparison */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 hover:border-amber-500/40 transition-all">
              <div className="p-3 bg-amber-950/80 text-amber-400 rounded-2xl w-fit border border-amber-800/60">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Candidate Comparison & Rankings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare candidates across required skill matrices, evidence ratings, and compensation fit for balanced hiring decisions.
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
                Built with zero-trust input validation and strict data isolation.
              </h3>
              <p className="text-xs text-slate-400">
                Candidate inputs are validated in isolated environments. Role-based access control, cryptographic authentication, and enterprise organization data boundaries.
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
            Ready to enhance candidate evaluations with grounded intelligence?
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto font-sans">
            Launch the workspace to explore candidate profiles, connect evidence sources, or evaluate role alignment.
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
