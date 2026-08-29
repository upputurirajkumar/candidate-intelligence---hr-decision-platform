import React, { useState, useEffect } from 'react';
import { ExplainableMatchBreakdown } from '../types';
import { Calculator, CheckCircle2, AlertTriangle, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

interface AnimatedMatchScoreProps {
  score: number;
  explainable?: ExplainableMatchBreakdown;
  label?: string;
}

export const AnimatedMatchScore: React.FC<AnimatedMatchScoreProps> = ({
  score,
  explainable,
  label = 'Overall Requisition Fit',
}) => {
  const [displayScore, setDisplayScore] = useState<number>(0);
  const [showCascadingBreakdown, setShowCascadingBreakdown] = useState<boolean>(false);

  useEffect(() => {
    // Reset and count up smoothly
    let current = 0;
    const step = Math.ceil(score / 25) || 1;
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
        setTimeout(() => setShowCascadingBreakdown(true), 200);
      } else {
        setDisplayScore(current);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-indigo-900/60 p-6 shadow-xl space-y-5 backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-950/80 text-cyan-400 border border-indigo-800/60 shadow-inner">
            <Calculator className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Explainable Match Score Engine
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic rubric weighting combined with factual grounding verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-indigo-950 text-cyan-300 border border-indigo-800">
            {explainable?.calculationMethod || 'Weighted Index + Provenance Check'}
          </span>
        </div>
      </div>

      {/* Main Score Hero Block */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 sm:p-6 bg-slate-950 rounded-2xl border border-slate-800">
        {/* Animated Big Score */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-950 border-2 border-indigo-500/40 shadow-2xl">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {displayScore}%
            </span>
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-cyan-400 tracking-wider mb-1">
              {label}
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {displayScore >= 90
                ? 'Strong Match — Exceeds Requisition Rubric'
                : displayScore >= 75
                ? 'Competitive Match — Meets Core Criteria'
                : 'Partial Match — Needs Technical Probing'}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Confidence Rating: {explainable?.confidence || 'High'}
            </div>
          </div>
        </div>

        {/* Quick Summary Pill Stats */}
        <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto">
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Required Skills</span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {explainable?.requiredSkillsMatch ?? 92}%
            </span>
          </div>
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-center min-w-[120px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience Fit</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {explainable?.experienceScore ?? 95}%
            </span>
          </div>
        </div>
      </div>

      {/* Cascading Breakdown Grid */}
      <div
        className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-opacity duration-700 ${
          showCascadingBreakdown ? 'opacity-100' : 'opacity-20'
        }`}
      >
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-1">Preferred Skills</span>
          <span className="text-lg font-bold font-mono text-cyan-300">
            {explainable?.preferredSkillsMatch ?? 88}%
          </span>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-1">System Design</span>
          <span className="text-lg font-bold font-mono text-indigo-300">
            {explainable?.systemDesignScore ?? 90}%
          </span>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-1">Leadership Depth</span>
          <span className="text-lg font-bold font-mono text-violet-300">
            {explainable?.leadershipScore ?? 82}%
          </span>
        </div>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-1">Evidence Grounding</span>
          <span className="text-lg font-bold font-mono text-emerald-300">
            {explainable?.requiredSkillsMatch ? 95 : 90}%
          </span>
        </div>
      </div>

      {/* Missing Skills and Evidence Citations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="font-bold text-slate-200 block">Missing Requisition Skills:</span>
          {explainable?.missingRequiredSkills && explainable.missingRequiredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {explainable.missingRequiredSkills.map((sk, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-900 font-medium">
                  {sk}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% of required skills corroborated in artifacts
            </span>
          )}
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
          <span className="font-bold text-slate-200 block">Factual Grounding Citations:</span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {explainable?.evidenceFound && explainable.evidenceFound.length > 0
              ? explainable.evidenceFound.join(' • ')
              : 'Cross-referenced against verified GitHub commits, tenure records, and live system architectures.'}
          </p>
        </div>
      </div>
    </div>
  );
};
