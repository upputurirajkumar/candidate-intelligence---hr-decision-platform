import React, { useState } from 'react';
import { Candidate, JobProfile, AgentReasoningStep } from '../types';
import { 
  GitBranch, 
  Cpu, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  Scale, 
  FileSearch, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';

interface AgentOrchestratorViewProps {
  candidate: Candidate;
  job?: JobProfile | null;
}

export const AgentOrchestratorView: React.FC<AgentOrchestratorViewProps> = ({
  candidate,
  job,
}) => {
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(candidate.reasoningTrace.length - 1);

  const totalTokens = candidate.reasoningTrace.reduce((sum, step) => sum + step.tokensUsed, 0);
  const totalExecutionMs = candidate.reasoningTrace.reduce((sum, step) => sum + step.executionTimeMs, 0);

  const handleReplay = () => {
    setIsSimulating(true);
    setActiveStepIndex(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < candidate.reasoningTrace.length) {
        setActiveStepIndex(current);
        setSelectedAgentIndex(current);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 900);
  };

  const getAgentIcon = (avatar: string) => {
    switch (avatar) {
      case 'parser':
        return <FileSearch className="w-5 h-5 text-cyan-400" />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'target':
        return <Target className="w-5 h-5 text-indigo-400" />;
      case 'scale':
        return <Scale className="w-5 h-5 text-violet-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const currentStep = candidate.reasoningTrace[selectedAgentIndex] || candidate.reasoningTrace[0];

  return (
    <div id="agent-orchestrator-container" className="space-y-6">
      {/* Header Banner: Multi-Agent Observability Metrics */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-md backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/80 text-cyan-400 border border-indigo-800/60 rounded-xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Autonomous Multi-Agent Reasoning Pipeline</h2>
              <p className="text-xs text-slate-400">
                5 specialized reasoning agents operating in coordinated evaluation loop
              </p>
            </div>
          </div>

          {/* Action & Observability Counters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Tokens:</span>
              <span className="font-bold text-slate-200">{totalTokens.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Total Latency:</span>
              <span className="font-bold text-slate-200">{totalExecutionMs}ms</span>
            </div>

            <button
              id="btn-replay-agent-trace"
              onClick={handleReplay}
              disabled={isSimulating}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isSimulating ? 'Executing Agents...' : 'Replay Trace'}</span>
            </button>
          </div>
        </div>

        {/* Agent Cards Horizontal Workflow Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {candidate.reasoningTrace.map((step, idx) => {
            const isSelected = selectedAgentIndex === idx;
            const isPassed = idx <= activeStepIndex;

            return (
              <button
                key={idx}
                id={`agent-card-${idx}`}
                onClick={() => setSelectedAgentIndex(idx)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-500 bg-slate-900 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 shadow-2xs">
                      {getAgentIcon(step.avatar)}
                    </div>
                    <span className="text-xs font-bold text-slate-100 line-clamp-1">{step.agentName}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-emerald-400 ring-4 ring-emerald-950' : 'bg-slate-700'}`}></span>
                </div>

                <div className="text-[11px] font-medium text-slate-400 mb-2">{step.agentRole}</div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                  <span>{step.executionTimeMs}ms</span>
                  <span>{step.tokensUsed} tokens</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep-Dive Agent Trace Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Agent Selected Detail */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                {getAgentIcon(currentStep.avatar)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">{currentStep.agentName}</h3>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Step Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400">{currentStep.agentRole} • Executed at {currentStep.timestamp}</p>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400">
              <div>Runtime: <span className="font-bold text-cyan-300">{currentStep.executionTimeMs}ms</span></div>
              <div>Cost: <span className="font-bold text-slate-200">{currentStep.tokensUsed} tokens</span></div>
            </div>
          </div>

          {/* Action Objective */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Agent Action & Objective</h4>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
              {currentStep.action}
            </div>
          </div>

          {/* Key Findings & Insights */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Autonomous Findings & Synthesis</h4>
            <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-900/60 text-sm text-slate-200 leading-relaxed">
              {currentStep.findings}
            </div>
          </div>

          {/* Evidence Citations Grounded */}
          {currentStep.evidenceItems && currentStep.evidenceItems.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Grounded External Evidence Points</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentStep.evidenceItems.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Architecture Protocol Specifications */}
        <div className="lg:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            Agent Orchestration Architecture
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-100 block mb-1">1. Non-Hallucinatory Grounding</span>
              Every resume claim is cross-validated against public datasets, GitHub PR histories, arXiv papers, and RFC citations before scoring.
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-100 block mb-1">2. Role-Calibrated Scorer</span>
              Maps candidate depth specifically against <span className="font-semibold text-cyan-300">{job?.title || 'Target Role'}</span> ({job?.level || 'Senior'}) criteria rather than generic keywords.
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-100 block mb-1">3. Adversarial Bias Filter</span>
              Runs a blind calibration audit to detect demographic sentiment bias in recruiter notes and standardize fair compensation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
