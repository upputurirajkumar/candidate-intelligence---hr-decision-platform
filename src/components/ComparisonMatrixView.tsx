import React, { useState, useMemo } from 'react';
import { Candidate, JobProfile } from '../types';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  Clock, 
  UserCheck,
  Check,
  X,
  Zap,
  Code,
  Briefcase,
  GitBranch,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ComparisonMatrixViewProps {
  candidates: Candidate[];
  job: JobProfile;
  activeCandidateId: string;
  onSelectCandidate: (id: string) => void;
  onOpenCopilot: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  candidates,
  job,
  activeCandidateId,
  onSelectCandidate,
  onOpenCopilot,
  onNavigateToTab,
}) => {
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    candidates.map(c => c.id).slice(0, 3)
  );

  const toggleCandidateSelection = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      if (selectedCandidateIds.length > 2) {
        setSelectedCandidateIds(selectedCandidateIds.filter(cid => cid !== id));
      }
    } else {
      if (selectedCandidateIds.length < 4) {
        setSelectedCandidateIds([...selectedCandidateIds, id]);
      }
    }
  };

  const comparedCandidates = useMemo(() => {
    return candidates.filter(c => selectedCandidateIds.includes(c.id));
  }, [candidates, selectedCandidateIds]);

  // Dimension Winners Calculation
  const winners = useMemo(() => {
    if (comparedCandidates.length === 0) return null;

    const bestSkill = [...comparedCandidates].sort(
      (a, b) => (b.overallFitScore || 0) - (a.overallFitScore || 0)
    )[0];

    const bestExp = [...comparedCandidates].sort(
      (a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0)
    )[0];

    const bestEvidence = [...comparedCandidates].sort(
      (a, b) => (b.verificationRating || 0) - (a.verificationRating || 0)
    )[0];

    if (!bestSkill || !bestExp || !bestEvidence) return null;

    return {
      bestSkill,
      bestExp,
      bestEvidence,
    };
  }, [comparedCandidates]);

  // Chart Data
  const allCompetencies: string[] = Array.from(
    new Set(comparedCandidates.flatMap(c => (c.competencies || []).map(comp => comp?.name || '')).filter(Boolean))
  );

  const chartData = allCompetencies.map((compName: string) => {
    const dataPoint: any = { name: compName.length > 22 ? compName.substring(0, 20) + '...' : compName };
    comparedCandidates.forEach(cand => {
      const match = (cand.competencies || []).find(c => c?.name === compName);
      dataPoint[cand.name || 'Candidate'] = match ? match.score : 65;
    });
    return dataPoint;
  });

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div id="comparison-matrix-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Side-by-Side Candidate Decision Matrix</h2>
              <p className="text-xs text-slate-500">
                Multi-candidate evaluation calibrated against <span className="font-semibold text-slate-800">{job.title}</span> requirements
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate Copilot Trade-Off Synthesis</span>
          </button>
        </div>

        {/* Candidate Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs font-bold text-slate-500 mr-1">Select 2 to 4 Candidates:</span>
          {candidates.map((cand) => {
            const isSelected = selectedCandidateIds.includes(cand.id);
            return (
              <button
                key={cand.id}
                onClick={() => toggleCandidateSelection(cand.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <img src={cand.avatarUrl} alt={cand.name} className="w-4 h-4 rounded-full object-cover" />
                <span>{cand.name}</span>
                <span className="text-[10px] font-mono opacity-80">{cand.overallFitScore}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Winner Dimension Badges */}
      {winners && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Skill Fit Winner */}
          <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Skill Requirement Winner</span>
            </div>
            <div className="flex items-center gap-2.5">
              <img src={winners.bestSkill.avatarUrl} alt={winners.bestSkill.name} className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <div className="text-xs font-bold text-slate-900">{winners.bestSkill.name}</div>
                <div className="text-[11px] text-indigo-600 font-mono font-semibold">{winners.bestSkill.overallFitScore}% Overall Fit</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Highest coverage of core distributed algorithms and target requirements.
            </p>
          </div>

          {/* Experience Winner */}
          <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Tenure & Seniority Winner</span>
            </div>
            <div className="flex items-center gap-2.5">
              <img src={winners.bestExp.avatarUrl} alt={winners.bestExp.name} className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <div className="text-xs font-bold text-slate-900">{winners.bestExp.name}</div>
                <div className="text-[11px] text-emerald-600 font-mono font-semibold">{winners.bestExp.yearsOfExperience} Years Exp</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Deepest architectural track record at {winners.bestExp.currentCompany}.
            </p>
          </div>

          {/* Evidence Winner */}
          <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Evidence Grounding Winner</span>
            </div>
            <div className="flex items-center gap-2.5">
              <img src={winners.bestEvidence.avatarUrl} alt={winners.bestEvidence.name} className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <div className="text-xs font-bold text-slate-900">{winners.bestEvidence.name}</div>
                <div className="text-[11px] text-amber-700 font-mono font-semibold">{winners.bestEvidence.verificationRating}% Fact-Checked</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Highest density of corroborated code commits and verified claims.
            </p>
          </div>
        </div>
      )}

      {/* Competency Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          Multi-Competency Benchmark Overlay
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {comparedCandidates.map((c, i) => (
                <Bar key={c.id} dataKey={c.name} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Required Skills Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Code className="w-4 h-4 text-indigo-600" />
            Required Skills Alignment Matrix ({job.title})
          </h3>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-emerald-600">
              <Check className="w-3 h-3" /> Direct Match
            </span>
            <span className="flex items-center gap-1 text-indigo-600">
              <Zap className="w-3 h-3" /> Semantic Synonym
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              <X className="w-3 h-3" /> Gap
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 w-56">Required Skill</th>
                {comparedCandidates.map(cand => (
                  <th key={cand.id} className="p-3.5 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <img src={cand.avatarUrl} alt={cand.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="font-bold text-slate-900">{cand.name.split(' ')[0]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(job?.requiredSkills || ['Python', 'System Design', 'Kubernetes']).map((skill, sIdx) => (
                <tr key={sIdx} className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-800">{skill}</td>
                  {comparedCandidates.map(cand => {
                    const direct = (cand.skills || []).find(s => (typeof s === 'string' ? s : s?.name || '').toLowerCase() === (skill || '').toLowerCase());
                    const isSemantic = !direct && (cand.skills || []).some(s => {
                      const sName = typeof s === 'string' ? s : s?.name || '';
                      return sName.toLowerCase().includes((skill || '').toLowerCase()) || 
                             (skill || '').toLowerCase().includes(sName.toLowerCase());
                    });

                    return (
                      <td key={cand.id} className="p-3.5">
                        {direct ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3" /> {(typeof direct === 'object' && direct?.level) || 'Proficient'} {typeof direct === 'object' && direct?.verified && '✓'}
                          </span>
                        ) : isSemantic ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            <Zap className="w-3 h-3" /> Semantic Related
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                            <X className="w-3 h-3" /> Missing
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Decision Attribute Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Decision Attributes & Logistics</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <tbody className="divide-y divide-slate-100">
              {/* Overall Fit Score */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800 w-48">Overall Role Fit</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4 font-bold text-slate-900">
                    <span className="text-sm font-extrabold text-indigo-600 font-mono">{cand.overallFitScore}%</span>
                  </td>
                ))}
              </tr>

              {/* Factual Grounding Rating */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">Evidence Grounding</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" /> {cand.verificationRating}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Experience */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">Years of Experience</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4 text-slate-800 font-semibold font-mono">
                    {cand.yearsOfExperience} years ({cand.currentCompany})
                  </td>
                ))}
              </tr>

              {/* Salary Expectation */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">Salary Expectation</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4 text-slate-700 font-medium">
                    {cand.salaryExpectation}
                  </td>
                ))}
              </tr>

              {/* Notice Period */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">Notice Period</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4 text-slate-700">
                    {cand.noticePeriod}
                  </td>
                ))}
              </tr>

              {/* Key Advantage */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">Key Differentiator</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4 text-slate-700 leading-relaxed">
                    {cand.keyStrengths?.[0] || 'Strong systems background'}
                  </td>
                ))}
              </tr>

              {/* Action Buttons */}
              <tr className="bg-slate-50/40">
                <td className="p-4 font-bold text-slate-800">Action</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4">
                    <button
                      onClick={() => {
                        onSelectCandidate(cand.id);
                        if (onNavigateToTab) onNavigateToTab('dossier');
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <span>Open {cand.name.split(' ')[0]}'s Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
