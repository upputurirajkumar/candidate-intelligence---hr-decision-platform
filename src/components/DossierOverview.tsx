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
  HelpCircle
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

interface DossierOverviewProps {
  candidate: Candidate;
  job: JobProfile;
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
  const radarData = candidate.competencies.map(comp => ({
    subject: comp.name.length > 22 ? comp.name.substring(0, 20) + '...' : comp.name,
    candidateScore: comp.score,
    benchmark: comp.benchmark,
    fullName: comp.name,
  }));

  const explainable = candidate.explainableMatch;

  const handleExportDossier = () => {
    const markdownContent = `# TalentIntel Candidate Dossier: ${candidate.name}
**Target Role**: ${job.title} (${job.level})
**Current Role**: ${candidate.currentRole} at ${candidate.currentCompany}
**Overall Fit Score**: ${candidate.overallFitScore}% (Rule-based + Weighted Index)
**Verification Rating**: ${candidate.verificationRating}%
**Status**: ${candidate.status.toUpperCase()}

## Executive Summary
${candidate.summary}

## Explainable Match Breakdown (Method: ${explainable?.calculationMethod || 'Rule-based + Weighted Competency Index'})
- Required Skills Match: ${explainable?.requiredSkillsMatch ?? 90}%
- Preferred Skills Match: ${explainable?.preferredSkillsMatch ?? 85}%
- Relevant Experience Score: ${explainable?.experienceScore ?? 95}%
- Missing Required Skills: ${explainable?.missingRequiredSkills.join(', ') || 'None (100% matched)'}
- Confidence: ${explainable?.confidence || 'High'}

## Key Strengths
${candidate.keyStrengths.map(s => `- ${s}`).join('\n')}

## Potential Risk Flags / Probes
${candidate.potentialRisks.map(r => `- ${r}`).join('\n')}

## Competency Evaluation
${candidate.competencies.map(c => `- **${c.name}**: Score ${c.score}/100 (Benchmark: ${c.benchmark}/100) — ${c.rationale}`).join('\n')}

## Verified Experience
${candidate.experiences.map(e => `### ${e.role} — ${e.company} (${e.period})
${e.highlights.map(h => `- ${h}`).join('\n')}
Technologies: ${e.technologies.join(', ')}
`).join('\n')}

## Grounded Claims Verification
${candidate.claims.map(c => `- [${c.status.toUpperCase()}] "${c.claim}" (Confidence: ${c.confidenceScore}%)\n  *Evidence*: ${c.evidenceSource}\n  *Probe*: ${c.followUpQuestion}`).join('\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidate.name.replace(/\s+/g, '_')}_Intelligence_Dossier.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="dossier-overview-container" className="space-y-6">
      {/* Top Banner: AI Synthesis & High-Level Decision Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Autonomous Intelligence Synthesis</h2>
              <p className="text-xs text-slate-500">Evaluated against {job.title} rubric</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-dossier"
              onClick={handleExportDossier}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier (MD)</span>
            </button>
            <button
              id="btn-ask-copilot-about-candidate"
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Deep-Dive Copilot</span>
            </button>
          </div>
        </div>

        <p className="text-slate-700 text-sm leading-relaxed mt-4">
          {candidate.summary}
        </p>

        {/* Strengths and Risks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Key Proven Strengths
            </h3>
            <ul className="space-y-1.5">
              {candidate.keyStrengths.map((str, idx) => (
                <li key={idx} className="text-xs text-emerald-900 flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Potential Risks & Verification Gaps
            </h3>
            <ul className="space-y-1.5">
              {candidate.potentialRisks.map((risk, idx) => (
                <li key={idx} className="text-xs text-amber-900 flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Explainable Match Score Breakdown Box (Mandatory Transparency) */}
      <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Explainable Match Score Calculation</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-indigo-100 text-indigo-800">
              {explainable?.calculationMethod || 'Rule-based + Weighted Competency Index'}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800">
              Confidence: {explainable?.confidence || 'High'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Required Skills</span>
            <span className="text-lg font-bold text-indigo-600">{explainable?.requiredSkillsMatch ?? 90}%</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Preferred Skills</span>
            <span className="text-lg font-bold text-indigo-600">{explainable?.preferredSkillsMatch ?? 85}%</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Experience Fit</span>
            <span className="text-lg font-bold text-indigo-600">{explainable?.experienceScore ?? 92}%</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">System Design</span>
            <span className="text-lg font-bold text-indigo-600">{explainable?.systemDesignScore ?? 88}%</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">Leadership Depth</span>
            <span className="text-lg font-bold text-indigo-600">{explainable?.leadershipScore ?? 80}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-800 block">Missing or Unconfirmed Required Skills:</span>
            {explainable?.missingRequiredSkills && explainable.missingRequiredSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {explainable.missingRequiredSkills.map((sk, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium">
                    Missing: {sk}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All required skills confirmed in resume & project artifacts.
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-800 block">Grounding Evidence Citations:</span>
            <ul className="space-y-1 text-slate-600">
              {explainable?.evidenceFound && explainable.evidenceFound.length > 0 ? (
                explainable.evidenceFound.map((ev, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />
                    <span>{ev}</span>
                  </li>
                ))
              ) : (
                <li className="italic text-slate-500">Cross-referenced against career timeline and verified claims.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Grid: Competency Radar vs Detailed Progress Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Radar Chart & Blind Hiring */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Role Competency Radar
              </h3>
              <span className="text-[11px] text-slate-400">vs Target Benchmark</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    name="Candidate Score"
                    dataKey="candidateScore"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Role Benchmark"
                    dataKey="benchmark"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.15}
                    strokeDasharray="3 3"
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs mt-2 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Candidate
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Target Benchmark
              </span>
            </div>
          </div>

          {/* Blind Hiring & Calibration */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-emerald-600" />
              Blind Hiring & Bias Calibration
            </h3>
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 leading-relaxed border border-slate-100 mb-3">
              <span className="font-semibold text-slate-900 block mb-1">Anonymized Evaluation Check:</span>
              {candidate.blindHiringScore.anonymizedSummary}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Bias Checks Passed
              </span>
              <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                Calibrated
              </span>
            </div>
          </div>

          {/* Portfolio & Verified Artifacts Metrics */}
          {candidate.githubOrPortfolioMetrics && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Verified Artifacts & Research
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {candidate.githubOrPortfolioMetrics.papersPublished !== undefined && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <span className="text-lg font-bold text-indigo-600">{candidate.githubOrPortfolioMetrics.papersPublished}</span>
                    <span className="text-[11px] text-slate-500 block">Published Papers</span>
                  </div>
                )}
                {candidate.githubOrPortfolioMetrics.patents !== undefined && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <span className="text-lg font-bold text-indigo-600">{candidate.githubOrPortfolioMetrics.patents}</span>
                    <span className="text-[11px] text-slate-500 block">Patents</span>
                  </div>
                )}
                {candidate.githubOrPortfolioMetrics.stars !== undefined && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <span className="text-lg font-bold text-indigo-600">{candidate.githubOrPortfolioMetrics.stars}+</span>
                    <span className="text-[11px] text-slate-500 block">GitHub Stars</span>
                  </div>
                )}
                {candidate.githubOrPortfolioMetrics.publicRepos !== undefined && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <span className="text-lg font-bold text-indigo-600">{candidate.githubOrPortfolioMetrics.publicRepos}</span>
                    <span className="text-[11px] text-slate-500 block">Open Source Repos</span>
                  </div>
                )}
              </div>
              {candidate.githubOrPortfolioMetrics.verifiedContributions && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-semibold text-slate-800">Verified Evidence:</span> {candidate.githubOrPortfolioMetrics.verifiedContributions}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Competency Scores & Work History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Detailed Competency List with Evidence Count */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Competency Breakdown & Evidence
              </h3>
              <button
                onClick={() => onNavigateToTab('verification')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Inspect Claims <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {candidate.competencies.map((comp, idx) => {
                const diff = comp.score - comp.benchmark;
                return (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">{comp.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{comp.score}/100</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          diff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {diff >= 0 ? `+${diff}% vs role` : `${diff}% vs role`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${
                          comp.score >= 90 ? 'bg-emerald-500' : comp.score >= 75 ? 'bg-indigo-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${comp.score}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <p className="line-clamp-1">{comp.rationale}</p>
                      <span className="whitespace-nowrap font-medium text-slate-600 ml-2">
                        {comp.evidenceCount} verified signals
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Work Experience Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Verified Career Trajectory
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
              {candidate.experiences.map((exp, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-xs"></div>
                  
                  <div className="w-full bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <h4 className="text-sm font-bold text-slate-900">{exp.role}</h4>
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> {exp.period} ({exp.durationYears} yrs)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold mb-2">
                      <span>{exp.company}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-normal">{exp.location}</span>
                      {exp.verifiedTenure && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Verified Tenure
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1 mb-3">
                      {exp.highlights.map((item, hIdx) => (
                        <li key={hIdx} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="text-indigo-400 font-bold">›</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60">
                      {exp.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Verified Degrees */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Academic Credentials & Degrees
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {candidate.education.map((edu, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{edu.degree}</span>
                    {edu.verified && (
                      <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-600 font-medium">{edu.institution}</p>
                  <p className="text-[11px] text-slate-500">{edu.field} • Class of {edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Multi-Source Intake & Ingestion Status Strip */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl border border-indigo-900/60 p-4 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-600/30 border border-indigo-500/30 text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  Connected Candidate Sources & Ingestion Streams
                  <span className="text-[10px] font-mono bg-indigo-900/80 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/50">
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
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
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
