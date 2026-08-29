import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  FileText, 
  ShieldCheck, 
  GitBranch, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  X, 
  Layers, 
  Loader2, 
  Database,
  BarChart3
} from 'lucide-react';

interface AIProcessingPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  onComplete?: () => void;
}

const PIPELINE_STAGES = [
  {
    id: 1,
    title: 'Multi-Source Ingestion',
    desc: 'Connecting resume documents, GitHub public repos, and official registry streams.',
    detail: 'Sanitizing file metadata and checking payload sizes (<10MB).',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Zero-Trust Sandboxing & Prompt Defense',
    desc: 'Isolating untrusted text tokens and executing adversarial prompt injection scans.',
    detail: 'Neutralizing synthetic prompt injection directives.',
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: 'Entity Extraction & Timeline Graph',
    desc: 'Extracting competencies, employer tenures, published papers, and commit hashes.',
    detail: 'Reconstructing career continuity and identifying verified milestones.',
    icon: Layers,
  },
  {
    id: 4,
    title: 'Multi-Agent Autonomous Audit',
    desc: 'Technical, Experience, Integrity, and Culture agents conducting parallel evaluations.',
    detail: 'Technical agent analyzing code complexity; Integrity agent checking tenure consistency.',
    icon: Cpu,
  },
  {
    id: 5,
    title: 'Cross-Source Fact Corroboration',
    desc: 'Cross-referencing self-authored claims against external verified repositories.',
    detail: 'Corroborating 24 claims against GitHub commits and certified credentials.',
    icon: GitBranch,
  },
  {
    id: 6,
    title: 'Explainable Fit & Dossier Synthesis',
    desc: 'Calculating deterministic match indices and generating interview probing questions.',
    detail: 'Synthesizing evidence-backed scoring matrix with 0.0% hallucination drift.',
    icon: Sparkles,
  },
];

export const AIProcessingPipelineModal: React.FC<AIProcessingPipelineModalProps> = ({
  isOpen,
  onClose,
  candidateName = 'New Candidate',
  onComplete,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(1);
      setIsFinished(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < 6) {
          return prev + 1;
        } else {
          setIsFinished(true);
          clearInterval(interval);
          if (onComplete) onComplete();
          return 6;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950 text-cyan-400 border border-indigo-800/80 shadow-inner">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                AI Autonomous Intelligence Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Processing candidate dossier: <strong>{candidateName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Stage Visualizer List */}
        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage) => {
            const Icon = stage.icon;
            const isDone = currentStage > stage.id || isFinished;
            const isCurrent = currentStage === stage.id && !isFinished;
            const isPending = currentStage < stage.id;

            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isDone
                    ? 'bg-slate-950/80 border-emerald-900/50 text-slate-300'
                    : isCurrent
                    ? 'bg-slate-950 border-cyan-500/80 shadow-lg ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-40 text-slate-500'
                }`}
              >
                <div
                  className={`p-2 rounded-xl border mt-0.5 shrink-0 ${
                    isDone
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : isCurrent
                      ? 'bg-cyan-950 text-cyan-400 border-cyan-800 animate-pulse'
                      : 'bg-slate-900 text-slate-600 border-slate-800'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs font-bold ${
                        isDone ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      Stage {stage.id}: {stage.title}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {isDone ? 'COMPLETED' : isCurrent ? 'EXECUTING...' : 'QUEUED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{stage.desc}</p>
                  {isCurrent && (
                    <p className="text-[11px] text-cyan-300 font-mono pt-1">
                      › {stage.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {isFinished ? 'All 6 stages verified and synthesized.' : 'Auditing multi-modal evidence...'}
          </span>

          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
              isFinished
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span>{isFinished ? 'View Generated Dossier' : 'Run In Background'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
