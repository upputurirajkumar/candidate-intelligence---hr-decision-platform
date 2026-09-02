import React, { useState, useEffect } from 'react';
import { HumanVsAIAnalytics, FairnessQualityMetrics, CandidateReviewAssignment } from '../types';
import { authenticatedFetch } from '../lib/api';
import { useToast } from './common/ToastSystem';
import { 
  Scale, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Clock, 
  RefreshCw, 
  Sparkles,
  Layers,
  PieChart,
  Target
} from 'lucide-react';

export const HumanVsAIAnalyticsView: React.FC = () => {
  const toast = useToast();
  const [alignmentData, setAlignmentData] = useState<HumanVsAIAnalytics | null>(null);
  const [fairnessData, setFairnessData] = useState<FairnessQualityMetrics | null>(null);
  const [assignments, setAssignments] = useState<CandidateReviewAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [alignRes, fairRes, assignRes] = await Promise.all([
        authenticatedFetch('/api/analytics/human-vs-ai'),
        authenticatedFetch('/api/analytics/fairness-quality'),
        authenticatedFetch('/api/assignments'),
      ]);

      if (alignRes.ok) {
        const aData = await alignRes.json();
        setAlignmentData(aData);
      }
      if (fairRes.ok) {
        const fData = await fairRes.json();
        setFairnessData(fData);
      }
      if (assignRes.ok) {
        const assData = await assignRes.json();
        setAssignments(assData);
      }
    } catch (err) {
      console.error('Failed to load enterprise analytics:', err);
      toast.error('Analytics Error', 'Could not refresh enterprise analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleUpdateAssignmentStatus = async (id: string, newStatus: CandidateReviewAssignment['status']) => {
    try {
      const res = await authenticatedFetch(`/api/assignments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
        toast.success('Assignment Updated', `Task status marked as ${newStatus}.`);
      }
    } catch (err) {
      console.error('Failed to update assignment:', err);
      toast.error('Update Error', 'Could not update assignment status.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>Human-AI Alignment & Enterprise Governance Analytics</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Audited
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Calibration telemetry measuring algorithmic suggestion vs. human panel consensus, fairness parity, and review turnaround times.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      {alignmentData && fairnessData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Alignment Rate */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
              <span>AI / Human Alignment</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400 font-mono">
              {alignmentData.overallAlignmentRate}%
            </div>
            <p className="text-[11px] text-slate-400">
              {alignmentData.totalDecisionsRecorded} total human hiring decisions recorded.
            </p>
          </div>

          {/* Overrides */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
              <span>Human Override Rate</span>
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {alignmentData.overrideRate}%
            </div>
            <p className="text-[11px] text-slate-400">
              {alignmentData.overrideDecisionsCount} panel overrides with documented justification.
            </p>
          </div>

          {/* Verification Completion */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
              <span>Evidence Coverage</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {fairnessData.verificationCompletionRate}%
            </div>
            <p className="text-[11px] text-slate-400">
              Resume claims grounded against authoritative sources.
            </p>
          </div>

          {/* Avg Time to Decision */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400">
              <span>Avg Time to Decision</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-purple-400 font-mono">
              {fairnessData.averageTimeToDecisionDays} <span className="text-base font-normal">Days</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pipeline throughput from raw intake to final verdict.
            </p>
          </div>
        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alignment & Override Breakdown */}
        {alignmentData && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span>Decision Discrepancy & Alignment Model</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                Aligned: {alignmentData.alignedDecisionsCount} / {alignmentData.totalDecisionsRecorded}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>AI Recommendation Consensus</span>
                <span className="font-mono text-white">{alignmentData.overallAlignmentRate}% Agreement</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
                <div 
                  className="bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${alignmentData.overallAlignmentRate}%` }}
                  title={`Aligned: ${alignmentData.overallAlignmentRate}%`}
                />
                <div 
                  className="bg-amber-500 transition-all duration-500" 
                  style={{ width: `${alignmentData.overrideRate}%` }}
                  title={`Overrides: ${alignmentData.overrideRate}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Aligned Decision ({alignmentData.alignedDecisionsCount})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Panel Overrides ({alignmentData.overrideDecisionsCount})
                </span>
              </div>
            </div>

            {/* Common Override Reasons */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Common Override Rationale Drivers
              </h4>
              <div className="space-y-2">
                {alignmentData.commonOverrideReasons.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-300 font-medium">{item.reason}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 font-mono text-[11px] border border-indigo-800">
                        {item.count} occurrences
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fairness & Demographic Calibration */}
        {fairnessData && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Fairness & Quality Safeguards</span>
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                fairnessData.demographicParityStatus === 'COMPLIANT' 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {fairnessData.demographicParityStatus}
              </span>
            </div>

            {/* Metrics List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-200 font-semibold">Blind Screening Parity Score</div>
                  <div className="text-[11px] text-slate-400">PII Redaction & Calibration Check</div>
                </div>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {fairnessData.blindScreeningParityScore}%
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-200 font-semibold">Interviewer Scoring Consistency</div>
                  <div className="text-[11px] text-slate-400">Variance between panel members</div>
                </div>
                <div className="text-base font-bold font-mono text-cyan-400">
                  {fairnessData.interviewerConsistencyScore}%
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-200 font-semibold">Evidence Coverage Index</div>
                  <div className="text-[11px] text-slate-400">Claims supported by verified artifacts</div>
                </div>
                <div className="text-base font-bold font-mono text-purple-400">
                  {fairnessData.verificationCompletionRate}%
                </div>
              </div>
            </div>

            {/* Bias Audit Footnote */}
            <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Equal Opportunity & Demographic Parity checks are executed against adverse impact ratio benchmarks (EEOC four-fifths rule).
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Active Review Assignments Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Active Review Assignments & Workload Queue</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-cyan-300">
                {assignments.length} Tasks
              </span>
            </h3>
            <p className="text-xs text-slate-400">Distributed task allocation across hiring managers, technical interviewers, and HR reviewers.</p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No pending review assignments in queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {assignments.map((task) => {
              const formattedDue = new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={task.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-indigo-300 border border-slate-800">
                        {task.taskType.replace(/_/g, ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1.5">{task.candidateName}</h4>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      task.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      task.status === 'IN_PROGRESS' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                      task.status === 'DECLINED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  {task.notes && (
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {task.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div>
                      <span>Reviewer: </span>
                      <strong className="text-slate-200">{task.assignedToUserName}</strong>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Due {formattedDue}</span>
                    </div>
                  </div>

                  {/* Quick Action Selector */}
                  <div className="pt-1 flex items-center justify-end gap-1">
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateAssignmentStatus(task.id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    )}
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateAssignmentStatus(task.id, 'IN_PROGRESS')}
                        className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Start Task
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
