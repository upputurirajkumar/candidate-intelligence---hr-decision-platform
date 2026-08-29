import React, { useState } from 'react';
import { Candidate, JobProfile } from '../types';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Target, 
  Activity, 
  Scale, 
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface CandidateIntelligenceVisualizerProps {
  candidate: Candidate;
  job: JobProfile | null;
  onInspectEvidence?: () => void;
}

export type VisualizerMode = 'radar' | 'radial_rings' | 'delta_matrix';

export const CandidateIntelligenceVisualizer: React.FC<CandidateIntelligenceVisualizerProps> = ({
  candidate,
  job,
  onInspectEvidence,
}) => {
  const [activeMode, setActiveMode] = useState<VisualizerMode>('radial_rings');

  // Format data for radar
  const radarData = (candidate.competencies || []).map((comp) => ({
    subject: comp.name.length > 20 ? comp.name.substring(0, 18) + '...' : comp.name,
    candidateScore: comp.score || 0,
    benchmark: comp.benchmark || 75,
    fullName: comp.name,
  }));

  const explainable = candidate.explainableMatch;
  const verifiedClaimsCount = candidate.claims?.filter((c) => c.verificationStatus === 'VERIFIED').length || 0;
  const totalClaimsCount = candidate.claims?.length || 1;
  const verificationRatio = Math.round((verifiedClaimsCount / totalClaimsCount) * 100);

  // Radial Rings Ring Specs
  const rings = [
    {
      label: 'Required Skills Match',
      value: explainable?.requiredSkillsMatch ?? 92,
      color: '#06b6d4',
      bgStroke: 'rgba(6, 182, 212, 0.15)',
      radius: 80,
    },
    {
      label: 'Relevant Experience Fit',
      value: explainable?.experienceScore ?? 95,
      color: '#6366f1',
      bgStroke: 'rgba(99, 102, 241, 0.15)',
      radius: 65,
    },
    {
      label: 'Evidence Grounding Rating',
      value: candidate.verificationRating ?? 90,
      color: '#10b981',
      bgStroke: 'rgba(16, 185, 129, 0.15)',
      radius: 50,
    },
    {
      label: 'Integrity & Anonymized Calibration',
      value: candidate.blindHiringScore?.biasScore ?? 98,
      color: '#a855f7',
      bgStroke: 'rgba(168, 85, 247, 0.15)',
      radius: 35,
    },
  ];

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800/80 p-6 shadow-xl space-y-6 backdrop-blur-xl relative overflow-hidden">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-950/90 text-cyan-400 border border-indigo-800/60 shadow-inner">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Multi-Dimensional Candidate Intelligence
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated against <strong>{job?.title || 'Active Target Role'}</strong> rubric
            </p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('radial_rings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'radial_rings'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Concentric Gauges
          </button>
          <button
            onClick={() => setActiveMode('radar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'radar'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Role Radar
          </button>
          <button
            onClick={() => setActiveMode('delta_matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'delta_matrix'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Delta Benchmarks
          </button>
        </div>
      </div>

      {/* Main Dynamic Visualizer Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Visual Canvas (Left 7 Cols) */}
        <div className="lg:col-span-7 flex items-center justify-center p-2 min-h-[290px]">
          {activeMode === 'radial_rings' && (
            <div className="relative flex items-center justify-center w-full">
              <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90" viewBox="0 0 200 200">
                {rings.map((ring, idx) => {
                  const circumference = 2 * Math.PI * ring.radius;
                  const offset = circumference - (ring.value / 100) * circumference;
                  return (
                    <g key={idx}>
                      {/* Background Track */}
                      <circle
                        cx="100"
                        cy="100"
                        r={ring.radius}
                        fill="transparent"
                        stroke={ring.bgStroke}
                        strokeWidth="7"
                      />
                      {/* Animated Value Arc */}
                      <circle
                        cx="100"
                        cy="100"
                        r={ring.radius}
                        fill="transparent"
                        stroke={ring.color}
                        strokeWidth="7"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Center Core Score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {candidate.overallFitScore}%
                </span>
                <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                  Overall Fit
                </span>
              </div>
            </div>
          )}

          {activeMode === 'radar' && (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 8 }} />
                  <Radar
                    name="Candidate"
                    dataKey="candidateScore"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.45}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="benchmark"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.15}
                    strokeDasharray="3 3"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeMode === 'delta_matrix' && (
            <div className="w-full space-y-3">
              {(candidate.competencies || []).map((comp, idx) => {
                const diff = (comp.score || 0) - (comp.benchmark || 75);
                return (
                  <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{comp.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{comp.score}%</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            diff >= 0 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {diff >= 0 ? `+${diff}%` : `${diff}%`}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          comp.score >= 90 ? 'bg-emerald-500' : comp.score >= 75 ? 'bg-indigo-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${comp.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend & Metric Deep-Dive (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {rings.map((ring, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ring.color }} />
                <span className="text-xs font-semibold text-slate-300">{ring.label}</span>
              </div>
              <span className="text-sm font-bold font-mono text-white">{ring.value}%</span>
            </div>
          ))}

          {onInspectEvidence && (
            <button
              onClick={onInspectEvidence}
              className="w-full mt-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Inspect Source Evidence Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
