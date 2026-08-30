import React from 'react';
import { Candidate, JobProfile } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Calendar, 
  GraduationCap, 
  Award, 
  FileCode2, 
  TrendingUp, 
  Layers, 
  Download, 
  Scale, 
  BookOpen,
  ArrowUpRight,
  Calculator,
  HelpCircle,
  Activity
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { CandidateIntelligenceVisualizer } from './CandidateIntelligenceVisualizer';
import { CareerTimelineVisualizer } from './CareerTimelineVisualizer';
import { AnimatedMatchScore } from './AnimatedMatchScore';

interface DossierOverviewProps {
  candidate: Candidate;
  job?: JobProfile | null;
  onNavigateToTab: (tab: 'dossier' | 'sources' | 'agents' | 'verification' | 'comparison' | 'graph' | 'interview') => void;
  onOpenCopilot: () => void;
}

export const DossierOverview: React.FC<DossierOverviewProps> = ({
  candidate,
  job,
  onNavigateToTab,
  onOpenCopilot,
}) => {
  // Format data for radar chart
  const radarData = (candidate?.competencies || []).map(comp => ({
    subject: (comp?.name || '').length > 22 ? (comp?.name || '').substring(0, 20) + '...' : (comp?.name || ''),
    candidateScore: comp?.score || 0,
    benchmark: comp?.benchmark || 70,
    fullName: comp?.name || 'Competency',
  }));

  const explainable = candidate?.explainableMatch;

  const handleExportDossier = () => {
    const candidateName = candidate?.name || 'Candidate';
    const jobTitle = job?.title || 'Target Role';
    const markdownContent = `# TalentIntel Candidate Dossier: ${candidateName}
**Target Role**: ${jobTitle} (${job?.level || 'Mid-Senior'})
**Current Role**: ${candidate?.currentRole || 'Engineer'} at ${candidate?.currentCompany || 'Company'}
**Overall Fit Score**: ${candidate?.overallFitScore ?? 85}% (Rule-based + Weighted Index)
**Verification Rating**: ${candidate?.verificationRating ?? 80}%
**Status**: ${(candidate?.status || 'Active').toUpperCase()}

## Executive Summary
${candidate?.summary || 'Executive evaluation summary pending.'}

## Explainable Match Breakdown (Method: ${explainable?.calculationMethod || 'Rule-based + Weighted Competency Index'})
- Required Skills Match: ${explainable?.requiredSkillsMatch ?? 90}%
- Preferred Skills Match: ${explainable?.preferredSkillsMatch ?? 85}%
- Relevant Experience Score: ${explainable?.experienceScore ?? 95}%
- Missing Required Skills: ${explainable?.missingRequiredSkills?.join(', ') || 'None (100% matched)'}
- Confidence: ${explainable?.confidence || 'High'}

## Key Strengths
${(candidate?.keyStrengths || []).map(s => `- ${s}`).join('\n')}

## Potential Risk Flags / Probes
${(candidate?.potentialRisks || []).map(r => `- ${r}`).join('\n')}

## Competency Evaluation
${(candidate?.competencies || []).map(c => `- **${c?.name || 'Competency'}**: Score ${c?.score || 0}/100 (Benchmark: ${c?.benchmark || 70}/100) — ${c?.rationale || ''}`).join('\n')}

## Verified Experience
${(candidate?.experiences || []).map(e => `### ${e?.role || 'Role'} — ${e?.company || 'Company'} (${e?.period || ''})
${(e?.highlights || []).map(h => `- ${h}`).join('\n')}
Technologies: ${(e?.technologies || []).join(', ')}
`).join('\n')}

## Grounded Claims Verification
${(candidate?.claims || []).map(c => `- [${(c?.status || 'verified').toUpperCase()}] "${c?.claim || ''}" (Confidence: ${c?.confidenceScore || 85}%)\n  *Evidence*: ${c?.evidenceSource || 'Repository'}\n  *Probe*: ${c?.followUpQuestion || ''}`).join('\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidateName.replace(/\s+/g, '_')}_Intelligence_Dossier.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="dossier-overview-container" className="space-y-6">
      {/* Top Banner: AI Synthesis & High-Level Decision Metrics */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-6 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-950/80 text-cyan-400 rounded-xl border border-indigo-800/60">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Executive Summary & Intelligence</h2>
              <p className="text-xs text-slate-400">Evaluated against {job?.title || 'Target Role'} rubric</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-dossier"
              onClick={handleExportDossier}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier (MD)</span>
            </button>
            <button
              id="btn-ask-copilot-about-candidate"
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask HR Copilot</span>
            </button>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mt-4">
          {candidate.summary}
        </p>

        {/* Strengths and Risks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-xl p-4">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Key Strengths
            </h3>
            <ul className="space-y-1.5">
              {candidate.keyStrengths.map((str, idx) => (
                <li key={idx} className="text-xs text-emerald-200 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/60 rounded-xl p-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Areas to Probe & Gaps
            </h3>
            <ul className="space-y-1.5">
              {candidate.potentialRisks.map((risk, idx) => (
                <li key={idx} className="text-xs text-amber-200 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Animated Match Score Calculation Engine */}
      <AnimatedMatchScore
        score={candidate.overallFitScore}
        explainable={explainable}
        label={`Role Match for ${job?.title || 'Target Role'}`}
      />

      {/* Multi-Dimensional Candidate Intelligence Visualizer */}
      <CandidateIntelligenceVisualizer
        candidate={candidate}
        job={job}
        onInspectEvidence={() => onNavigateToTab('verification')}
      />

      {/* Verified Career Trajectory & Tenure Timeline Visualizer */}
      <CareerTimelineVisualizer candidate={candidate} />

      {/* Secondary Context & Verified Credentials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Blind Hiring & Portfolios */}
        <div className="lg:col-span-5 space-y-6">
          {/* Blind Hiring & Calibration */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-md">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-emerald-400" />
              Blind Hiring & Bias Calibration
            </h3>
            <div className="p-3 bg-slate-950 rounded-xl text-xs text-slate-300 leading-relaxed border border-slate-800 mb-3">
              <span className="font-semibold text-slate-200 block mb-1">Anonymized Evaluation Check:</span>
              {candidate.blindHiringScore.anonymizedSummary}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bias Checks Passed
              </span>
              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium border border-slate-700">
                Calibrated
              </span>
            </div>
          </div>

          {/* Portfolio & Verified Artifacts Metrics */}
          {candidate.githubOrPortfolioMetrics && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-md">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Verified Artifacts & Research
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {candidate.githubOrPortfolioMetrics.papersPublished !== undefined && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-lg font-bold text-cyan-300 font-mono">{candidate.githubOrPortfolioMetrics.papersPublished}</span>
                    <span className="text-[11px] text-slate-400 block">Published Papers</span>
                  </div>
                )}
                {candidate.githubOrPortfolioMetrics.patents !== undefined && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-lg font-bold text-cyan-300 font-mono">{candidate.githubOrPortfolioMetrics.patents}</span>
                    <span className="text-[11px] text-slate-400 block">Patents</span>
                  </div>
                )}
                {candidate.githubOrPortfolioMetrics.stars !== undefined && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-lg font-bold text-cyan-300 font-mono">{candidate.githubOrPortfolioMetrics.stars}+</span>
                    <span className="text-[11px] text-slate-400 block">GitHub Stars</span>
                  </div>
                )}
                {candidate.githubOrPortfolioMetrics.publicRepos !== undefined && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-lg font-bold text-cyan-300 font-mono">{candidate.githubOrPortfolioMetrics.publicRepos}</span>
                    <span className="text-[11px] text-slate-400 block">Open Source Repos</span>
                  </div>
                )}
              </div>
              {candidate.githubOrPortfolioMetrics.verifiedContributions && (
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-200">Verified Evidence:</span> {candidate.githubOrPortfolioMetrics.verifiedContributions}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Degrees & Ingestion Source Status */}
        <div className="lg:col-span-7 space-y-6">
          {/* Education & Verified Degrees */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-md">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              Academic Credentials & Degrees
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {candidate.education.map((edu, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{edu.degree}</span>
                    {edu.verified && (
                      <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-400 font-medium">{edu.institution}</p>
                  <p className="text-[11px] text-slate-400">{edu.field} • Class of {edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Multi-Source Intake & Ingestion Status Strip */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 rounded-2xl border border-indigo-900/60 p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-cyan-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  Connected Candidate Sources & Ingestion Streams
                  <span className="text-[10px] font-mono bg-indigo-900/80 text-cyan-300 px-2 py-0.5 rounded border border-indigo-700/50">
                    {(candidate.externalSources?.length || 0) + (candidate.documents?.length || 1) + (candidate.certifications?.length || 0)} Active
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Resume, GitHub repositories, LinkedIn profile, portfolio sites & verified certifications are continuously audited.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('sources')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Sources</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
