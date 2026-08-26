import React, { useState } from 'react';
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
  UserCheck 
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
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  candidates,
  job,
  activeCandidateId,
  onSelectCandidate,
  onOpenCopilot,
}) => {
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    candidates.map(c => c.id).slice(0, 3)
  );

  const toggleCandidateSelection = (id: string) => {
    if (selectedCandidateIds.includes(id)) {
      if (selectedCandidateIds.length > 1) {
        setSelectedCandidateIds(selectedCandidateIds.filter(cid => cid !== id));
      }
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const comparedCandidates = candidates.filter(c => selectedCandidateIds.includes(c.id));

  // Build chart data across common competencies
  const allCompetencies: string[] = Array.from(
    new Set(comparedCandidates.flatMap(c => c.competencies.map(comp => comp.name)))
  );

  const chartData = allCompetencies.map((compName: string) => {
    const dataPoint: any = { name: compName.length > 20 ? compName.substring(0, 18) + '...' : compName };
    comparedCandidates.forEach(cand => {
      const match = cand.competencies.find(c => c.name === compName);
      dataPoint[cand.name] = match ? match.score : 65;
    });
    return dataPoint;
  });

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const topCandidate = [...comparedCandidates].sort((a, b) => b.overallFitScore - a.overallFitScore)[0];

  return (
    <div id="comparison-matrix-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Side-by-Side Candidate Benchmark Matrix</h2>
              <p className="text-xs text-slate-500">
                Calibrated across technical depth, grounded evidence, leadership, and compensation
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate AI Trade-Off Synthesis</span>
          </button>
        </div>

        {/* Candidate Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs font-bold text-slate-500 mr-2">Select Candidates:</span>
          {candidates.map((cand, idx) => {
            const isSelected = selectedCandidateIds.includes(cand.id);
            return (
              <button
                key={cand.id}
                onClick={() => toggleCandidateSelection(cand.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
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

      {/* AI Recommendation Box */}
      {topCandidate && (
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-indigo-600 text-white rounded-lg shadow-2xs">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Top Strategic Match</span>
                <span className="text-xs font-mono font-bold text-indigo-950">• {topCandidate.name} ({topCandidate.overallFitScore}% Fit)</span>
              </div>
              <p className="text-xs text-indigo-950 mt-1 leading-relaxed">
                <strong>{topCandidate.name}</strong> leads the cohort for <em>{job.title}</em> with highest factual verification ({topCandidate.verificationRating}%) and deep specialization in core distributed consensus requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Competency Comparison Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          Competency Score Comparison
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {comparedCandidates.map((c, i) => (
                <Bar key={c.id} dataKey={c.name} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Deep Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Comprehensive Decision Attribute Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4 w-48">Decision Criteria</th>
                {comparedCandidates.map(cand => (
                  <th key={cand.id} className="p-4 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <img src={cand.avatarUrl} alt={cand.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 capitalize">{cand.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{cand.currentCompany}</div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Overall Fit Score */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">Overall Role Fit</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4 font-bold text-slate-900">
                    <span className="text-sm font-extrabold text-indigo-600">{cand.overallFitScore}%</span>
                  </td>
                ))}
              </tr>

              {/* Evidence Verification Rating */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">Factual Grounding Index</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> {cand.verificationRating}%
                    </span>
                  </td>
                ))}
              </tr>

              {/* Compensation */}
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
                <td className="p-4 font-bold text-slate-800">Core Advantage</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4 text-slate-700 leading-relaxed">
                    {cand.keyStrengths[0]}
                  </td>
                ))}
              </tr>

              {/* Potential Risks */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-4 font-bold text-slate-800">Watch Items / Trade-offs</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4 text-amber-900 leading-relaxed bg-amber-50/20">
                    {cand.potentialRisks[0]}
                  </td>
                ))}
              </tr>

              {/* Action Button */}
              <tr className="bg-slate-50/30">
                <td className="p-4 font-bold text-slate-800">Inspect Full Dossier</td>
                {comparedCandidates.map(cand => (
                  <td key={cand.id} className="p-4">
                    <button
                      onClick={() => onSelectCandidate(cand.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <span>View {cand.name.split(' ')[0]}</span>
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
