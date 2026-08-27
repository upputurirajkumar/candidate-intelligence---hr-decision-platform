import React, { useState } from 'react';
import { InteractiveFlow3DCanvas, PIPELINE_STAGES } from '../components/3d/InteractiveFlow3DCanvas';
import { 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Database, 
  FileText, 
  GitBranch, 
  Linkedin, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  Layers,
  Search,
  Lock,
  Zap,
  HelpCircle
} from 'lucide-react';

interface HowItWorksPageProps {
  onLaunchPlatform: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onLaunchPlatform }) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'agents' | 'scoring' | 'interview'>('evidence');

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500 selection:text-slate-950 pb-24">
      {/* Hero Header */}
      <section className="pt-16 pb-14 border-b border-slate-800/60 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-600/10 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-300 shadow-md">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architecture & Verification Pipeline</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How TalentIntel Works
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
            A 6-step multi-modal intelligence pipeline that transforms unverified candidate claims into audited, explainable hiring intelligence.
          </p>
        </div>
      </section>

      {/* Visual Pipeline Funnel Blueprint */}
      <section className="py-12 bg-slate-900/30 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                End-to-End Grounded Data Flow
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                From Raw Source Telemetry to Grounded Executive Decisions
              </h2>
            </div>

            {/* Visual Multi-Tier Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-center">
              {/* Box 1 */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                  01 SOURCES
                </span>
                <div className="flex gap-1.5 my-1 text-slate-400">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <Linkedin className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xs font-bold text-slate-200">Resume & Telemetry</div>
                <p className="text-[11px] text-slate-400 leading-tight">PDFs, Git commits, LinkedIn history</p>
              </div>

              {/* Arrow */}
              <div className="bg-slate-950/80 border border-indigo-900/40 rounded-2xl p-4 flex flex-col items-center justify-between space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold">
                  02 PARSE
                </span>
                <Layers className="w-5 h-5 text-indigo-400 my-1" />
                <div className="text-xs font-bold text-slate-200">Claims Extraction</div>
                <p className="text-[11px] text-slate-400 leading-tight">Prompt injection shielded parsing</p>
              </div>

              {/* Box 3 */}
              <div className="bg-slate-950/80 border border-cyan-900/40 rounded-2xl p-4 flex flex-col items-center justify-between space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">
                  03 AUDIT
                </span>
                <ShieldCheck className="w-5 h-5 text-cyan-400 my-1" />
                <div className="text-xs font-bold text-slate-200">Corroboration</div>
                <p className="text-[11px] text-slate-400 leading-tight">Cross-source registry & repo verification</p>
              </div>

              {/* Box 4 */}
              <div className="bg-slate-950/80 border border-violet-900/40 rounded-2xl p-4 flex flex-col items-center justify-between space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 font-bold">
                  04 AGENTS
                </span>
                <Cpu className="w-5 h-5 text-violet-400 my-1" />
                <div className="text-xs font-bold text-slate-200">AI Multi-Agent</div>
                <p className="text-[11px] text-slate-400 leading-tight">4 autonomous domain reviewers</p>
              </div>

              {/* Box 5 */}
              <div className="bg-slate-950/80 border border-emerald-900/40 rounded-2xl p-4 flex flex-col items-center justify-between space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                  05 MATCH
                </span>
                <Target className="w-5 h-5 text-emerald-400 my-1" />
                <div className="text-xs font-bold text-slate-200">Requisition Fit</div>
                <p className="text-[11px] text-slate-400 leading-tight">Weighted role & skill gap scoring</p>
              </div>

              {/* Box 6 */}
              <div className="bg-slate-950/80 border border-amber-900/40 rounded-2xl p-4 flex flex-col items-center justify-between space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">
                  06 DECIDE
                </span>
                <CheckCircle2 className="w-5 h-5 text-amber-400 my-1" />
                <div className="text-xs font-bold text-slate-200">HR Decision</div>
                <p className="text-[11px] text-slate-400 leading-tight">Targeted interviews & leaderboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3D Pipeline Visualizer */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveFlow3DCanvas />
      </section>

      {/* Deep-Dive Subsystem Tabs */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
            Under the Hood
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Core Subsystem Mechanics
          </h2>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'evidence', label: '1. Evidence & Corroboration Engine', icon: ShieldCheck },
            { id: 'agents', label: '2. Multi-Agent Orchestrator', icon: Cpu },
            { id: 'scoring', label: '3. Explainable Match Formulas', icon: Target },
            { id: 'interview', label: '4. Interview Intelligence Protocol', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-cyan-400'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          {activeTab === 'evidence' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Continuous Cross-Source Corroboration</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  The engine automatically extracts concrete claims from the candidate’s resume and queries public GitHub activity, LinkedIn employment dates, and certification credential IDs to cross-verify every claim.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Verified Evidence:</span> Claim corroborated by direct code commits or verified certificate IDs.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-2.5">
                    <Search className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Uncorroborated Evidence:</span> Self-reported in resume with insufficient external telemetry.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-indigo-400 text-[11px] font-bold"># Evidence Verification Object</div>
                <pre className="text-[11px] text-cyan-300 overflow-x-auto leading-tight">
{`{
  "claim": "Designed Raft consensus engine in Go",
  "status": "VERIFIED",
  "confidenceScore": 0.94,
  "sources": [
    { "type": "github", "repo": "sarahchen/raft-core", "commits": 142 },
    { "type": "resume", "page": 1, "section": "Experience" }
  ],
  "crossCorroborated": true
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">4 Specialized AI Review Agents</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Instead of a single ungrounded LLM prompt, 4 autonomous agents evaluate distinct aspects with isolated system instructions and transparent reasoning logs.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="font-bold text-indigo-400">Technical Validator</div>
                    <div className="text-slate-400 text-[11px] mt-1">Code structure, architecture, concurrency depth</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="font-bold text-cyan-400">Experience Auditor</div>
                    <div className="text-slate-400 text-[11px] mt-1">Timeline continuity, title progression, tenure</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="font-bold text-emerald-400">Integrity Scout</div>
                    <div className="text-slate-400 text-[11px] mt-1">Anomalies, claim inconsistencies, ghost projects</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="font-bold text-purple-400">Culture Evaluator</div>
                    <div className="text-slate-400 text-[11px] mt-1">Leadership signals, mentoring, cross-team impact</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="text-xs font-mono font-bold text-indigo-400">Agent Consensus Summary</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl">
                    <span className="text-slate-300">Technical Mastery</span>
                    <span className="font-mono text-emerald-400 font-bold">96/100 (Exceptional)</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl">
                    <span className="text-slate-300">Experience Continuity</span>
                    <span className="font-mono text-cyan-400 font-bold">92/100 (Continuous)</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-xl">
                    <span className="text-slate-300">Integrity Confidence</span>
                    <span className="font-mono text-emerald-400 font-bold">98/100 (Low Risk)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Explainable Weighted Match Scoring</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Scores are calculated using transparent mathematical formulas based on explicit job requisition requirements rather than subjective heuristics.
                </p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="font-bold text-white">1. Required Skills Match (40% Weight)</div>
                    <div className="text-slate-400 text-[11px]">Strict coverage of essential stack items.</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="font-bold text-white">2. Experience Fit (30% Weight)</div>
                    <div className="text-slate-400 text-[11px]">Domain years and progressive seniority match.</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="font-bold text-white">3. Verified Evidence Strength (30% Weight)</div>
                    <div className="text-slate-400 text-[11px]">Percentage of claims corroborated with hard artifacts.</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-center space-y-3">
                <div className="text-4xl font-black text-cyan-400 font-mono">92%</div>
                <div className="text-xs font-semibold text-white">Calculated Overall Role Match</div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-indigo-500 h-full w-[40%]" title="Required Skills (40%)" />
                  <div className="bg-cyan-400 h-full w-[28%]" title="Experience Fit (28%)" />
                  <div className="bg-emerald-400 h-full w-[24%]" title="Evidence Strength (24%)" />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Formula: (0.40 * Skill) + (0.30 * Exp) + (0.30 * Evidence)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Evidence-Based Interview Prep</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  The platform generates targeted probing questions focusing on specific uncorroborated resume points, allowing interviewers to conduct rigorous, structured evaluations.
                </p>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-indigo-400">Targeted Probing Question:</div>
                  <div className="text-xs text-slate-200 italic">
                    "In your resume, you claimed a 60% latency drop on Redis cache clusters. Can you walk through your lock-free invalidation protocol and how you benchmarked p99 latency?"
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="text-xs font-mono font-bold text-cyan-400">Interviewer Rubric Criteria</div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="p-2 bg-slate-900 rounded-lg">✓ Explains p99 benchmark tooling (e.g., wrk2, locust)</div>
                  <div className="p-2 bg-slate-900 rounded-lg">✓ Details cache stampede mitigation strategies</div>
                  <div className="p-2 bg-slate-900 rounded-lg">✓ Mentions concrete memory overhead trade-offs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-12 text-center">
        <button
          onClick={onLaunchPlatform}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-2xl transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <span>Explore Live HR Platform</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
