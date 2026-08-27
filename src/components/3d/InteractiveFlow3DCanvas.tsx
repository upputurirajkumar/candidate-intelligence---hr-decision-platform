import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSearch, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  Database,
  GitBranch,
  Layers,
  Search,
  Zap
} from 'lucide-react';

export interface PipelineStage {
  id: string;
  stepNumber: string;
  title: string;
  tagline: string;
  description: string;
  sourcesInvolved: string[];
  outputArtifact: string;
  trustLevel: string;
  iconName: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'collect',
    stepNumber: '01',
    title: 'Collect',
    tagline: 'Multi-Modal Ingestion & Signal Harvesting',
    description: 'Pulls unstructured data directly from uploaded resumes (PDF/DOCX/TXT), public GitHub profiles (repositories, commit history, pull requests), verified LinkedIn exports, and certification registries with strict schema validation.',
    sourcesInvolved: ['Resume Documents', 'GitHub Repositories', 'LinkedIn Profiles', 'Official Registries'],
    outputArtifact: 'Standardized Ingestion Payload & Raw Source Hash',
    trustLevel: 'Raw Candidate & Public Telemetry',
    iconName: 'Database',
  },
  {
    id: 'process',
    stepNumber: '02',
    title: 'Process',
    tagline: 'Claim Extraction & Entity Disambiguation',
    description: 'Deconstructs raw text into atomic verifiable claims: employment dates, leadership roles, claimed tech stacks, and quantifiable business outcomes. Isolates candidate text into non-executable sandbox boundaries.',
    sourcesInvolved: ['Semantic Parser', 'Entity Graph Extractor', 'Prompt Injection Shield'],
    outputArtifact: 'Structured Claims Manifest (claims.json)',
    trustLevel: 'Isolated Non-Executable Sandbox',
    iconName: 'Layers',
  },
  {
    id: 'corroborate',
    stepNumber: '03',
    title: 'Corroborate',
    tagline: 'Multi-Source Fact Checking & Audit',
    description: 'Cross-checks every resume claim against verifiable external evidence. Validates GitHub commit timestamps, repo ownership, license registries, and peer endorsements to classify claims into Verified, Unverified, or Flagged.',
    sourcesInvolved: ['GitHub Code Evidence', 'License Registries', 'Cross-Source Comparison'],
    outputArtifact: 'Factual Grounding Audit (85-98% Corroborated)',
    trustLevel: 'Publicly Observable & Registry Verified',
    iconName: 'ShieldCheck',
  },
  {
    id: 'analyze',
    stepNumber: '04',
    title: 'Analyze',
    tagline: 'Multi-Agent Autonomous Orchestration',
    description: '4 specialized AI agents inspect the candidate independently: Technical Validator analyzes code depth; Experience Auditor verifies timeline continuity; Integrity Scout detects anomalies; Culture & Soft-Skills Evaluator reviews team alignment.',
    sourcesInvolved: ['Technical Agent', 'Experience Agent', 'Integrity Agent', 'Culture Agent'],
    outputArtifact: 'Multi-Agent Consensus Matrix & Reasoning Logs',
    trustLevel: 'Corroborated AI Synthesis',
    iconName: 'Cpu',
  },
  {
    id: 'match',
    stepNumber: '05',
    title: 'Match',
    tagline: 'Explainable Requisition Fit Scoring',
    description: 'Calculates weighted fit against customized job requirements: technical skills, architectural experience, years in domain, and compensation alignment. Produces transparent breakdown bars with zero black-box scoring.',
    sourcesInvolved: ['Job Requisition Schema', 'Custom Skill Weightings', 'Salary & Notice Criteria'],
    outputArtifact: 'Role Fit Index (0-100%) & Skill Gap Breakdown',
    trustLevel: 'Deterministic Weighted Match',
    iconName: 'Target',
  },
  {
    id: 'decide',
    stepNumber: '06',
    title: 'Decide',
    tagline: 'HR Copilot Briefings & Interview Intelligence',
    description: 'Generates tailored probing interview questions targeting flagged or unverified claims, side-by-side candidate comparison matrices, and one-click hiring committee dossiers ready for executive review.',
    sourcesInvolved: ['Decision Copilot', 'Evidence-Based Questions', 'Interview Scoring Pad'],
    outputArtifact: 'Executive Hiring Dossier & Interview Protocol',
    trustLevel: 'Actionable Executive Decision Support',
    iconName: 'CheckCircle2',
  },
];

export const InteractiveFlow3DCanvas: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(2); // Default on Corroborate
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeStage = PIPELINE_STAGES[activeStageIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = 200);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 200;
    };
    window.addEventListener('resize', handleResize);

    let progress = 0;

    const render = () => {
      progress += 0.015;
      ctx.clearRect(0, 0, width, height);

      const stageCount = PIPELINE_STAGES.length;
      const padding = 50;
      const stepWidth = (width - padding * 2) / (stageCount - 1);
      const cy = height / 2;

      // Draw connecting glowing rail
      const railGrad = ctx.createLinearGradient(padding, cy, width - padding, cy);
      railGrad.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
      railGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.6)');
      railGrad.addColorStop(1, 'rgba(168, 85, 247, 0.4)');

      ctx.beginPath();
      ctx.moveTo(padding, cy);
      ctx.lineTo(width - padding, cy);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Flowing glowing laser progress
      const activeX = padding + activeStageIndex * stepWidth;
      const laserGrad = ctx.createLinearGradient(padding, cy, activeX, cy);
      laserGrad.addColorStop(0, '#6366f1');
      laserGrad.addColorStop(1, '#06b6d4');

      ctx.beginPath();
      ctx.moveTo(padding, cy);
      ctx.lineTo(activeX, cy);
      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Flowing data packets
      for (let i = 0; i < 4; i++) {
        const pOffset = ((progress + i * 0.25) % 1) * (activeX - padding);
        const px = padding + pOffset;
        if (px <= activeX) {
          ctx.beginPath();
          ctx.arc(px, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw Nodes
      PIPELINE_STAGES.forEach((stage, idx) => {
        const nx = padding + idx * stepWidth;
        const isCurrent = idx === activeStageIndex;
        const isPast = idx < activeStageIndex;

        // Node Glow
        if (isCurrent) {
          ctx.save();
          const glowGrad = ctx.createRadialGradient(nx, cy, 5, nx, cy, 26);
          glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
          glowGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)');
          glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(nx, cy, 28, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Base node circle
        ctx.beginPath();
        ctx.arc(nx, cy, isCurrent ? 14 : 10, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? '#06b6d4' : isPast ? '#6366f1' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = isCurrent ? '#ffffff' : isPast ? '#818cf8' : '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Step number label
        ctx.font = `700 ${isCurrent ? 12 : 10}px Inter, sans-serif`;
        ctx.fillStyle = isCurrent ? '#0f172a' : '#cbd5e1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stage.stepNumber, nx, cy);

        // Stage Title Below Node
        ctx.font = `600 ${isCurrent ? 12 : 11}px Inter, sans-serif`;
        ctx.fillStyle = isCurrent ? '#38bdf8' : isPast ? '#e2e8f0' : '#64748b';
        ctx.fillText(stage.title, nx, cy + 28);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [activeStageIndex]);

  return (
    <div className="space-y-6">
      {/* Interactive Flow Canvas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
              Interactive 6-Stage Evidence Pipeline
            </span>
          </div>
          <span className="text-xs text-indigo-400 font-mono">Click any stage to inspect execution</span>
        </div>

        <div className="w-full">
          <canvas ref={canvasRef} className="w-full h-[180px] cursor-pointer" />
        </div>

        {/* Stage Selector Buttons for Mobile & Desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-4 border-t border-slate-800/80">
          {PIPELINE_STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveStageIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeStageIndex === idx
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg ring-1 ring-cyan-400'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono opacity-70">Step {s.stepNumber}</span>
              <span className="font-bold">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Deep-Dive Inspection Card for Selected Stage */}
      <div className="bg-slate-900/80 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-xl text-white backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-700 text-cyan-400 rounded-full text-xs font-mono font-bold">
                STAGE {activeStage.stepNumber}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {activeStage.title}: <span className="text-indigo-400">{activeStage.tagline}</span>
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {activeStage.description}
            </p>

            <div className="pt-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Sources & Subsystems:</div>
              <div className="flex flex-wrap gap-2">
                {activeStage.sourcesInvolved.map((source, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Artifact Badge */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 lg:w-80 shrink-0">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Guaranteed Output Artifact</div>
              <div className="text-xs font-bold text-cyan-300 font-mono mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{activeStage.outputArtifact}</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Security & Trust Level</div>
              <div className="text-xs font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{activeStage.trustLevel}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveStageIndex((prev) => (prev + 1) % PIPELINE_STAGES.length)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Next Stage: {PIPELINE_STAGES[(activeStageIndex + 1) % PIPELINE_STAGES.length].title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
