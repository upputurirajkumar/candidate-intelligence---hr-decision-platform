import React, { useState, useEffect } from 'react';
import { JobProfile, JobHiringPolicy } from '../types';
import { authenticatedFetch } from '../lib/api';
import { useToast } from './common/ToastSystem';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Sliders, 
  History, 
  Layers, 
  Sparkles,
  Lock,
  Save
} from 'lucide-react';

interface JobHiringPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobProfile | null;
  onPolicyUpdated?: () => void;
}

export const JobHiringPolicyModal: React.FC<JobHiringPolicyModalProps> = ({
  isOpen,
  onClose,
  job,
  onPolicyUpdated,
}) => {
  const toast = useToast();
  const [policy, setPolicy] = useState<JobHiringPolicy | null>(null);
  const [history, setHistory] = useState<JobHiringPolicy[]>([]);
  const [minFitScore, setMinFitScore] = useState<number>(75);
  const [minVerificationRating, setMinVerificationRating] = useState<number>(70);
  const [requiredInterviewRounds, setRequiredInterviewRounds] = useState<number>(2);
  const [requireHumanOverrideReason, setRequireHumanOverrideReason] = useState<boolean>(true);
  const [autoAdvanceMinScore, setAutoAdvanceMinScore] = useState<number>(90);
  const [activeTab, setActiveTab] = useState<'policy' | 'history'>('policy');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !job) return;

    async function fetchPolicy() {
      setLoading(true);
      try {
        const [pRes, hRes] = await Promise.all([
          authenticatedFetch(`/api/jobs/${job.id}/policy`),
          authenticatedFetch(`/api/jobs/${job.id}/policy/history`),
        ]);

        if (pRes.ok) {
          const pData = await pRes.json();
          setPolicy(pData);
          setMinFitScore(pData.minimumOverallFitScore || 75);
          setMinVerificationRating(pData.minimumVerificationRating || 70);
          setRequiredInterviewRounds(pData.requiredInterviewRounds || 2);
          setRequireHumanOverrideReason(Boolean(pData.requireHumanOverrideReason));
          setAutoAdvanceMinScore(pData.autoAdvanceQualifiedScores || 90);
        }

        if (hRes.ok) {
          const hData = await hRes.json();
          setHistory(hData);
        }
      } catch (err) {
        console.error('Failed to load job policy:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPolicy();
  }, [isOpen, job]);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authenticatedFetch(`/api/jobs/${job.id}/policy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          minimumOverallFitScore: Number(minFitScore),
          minimumVerificationRating: Number(minVerificationRating),
          requiredInterviewRounds: Number(requiredInterviewRounds),
          requireHumanOverrideReason,
          autoAdvanceQualifiedScores: Number(autoAdvanceMinScore),
          mandatorySkills: job.skills || [],
          mandatoryCertifications: job.certifications || [],
        }),
      });

      if (!res.ok) throw new Error('Failed to update job hiring policy');

      const updated = await res.json();
      setPolicy(updated);
      setHistory([updated, ...history]);
      toast.success(
        'Hiring Policy Published',
        `Policy v${updated.policyVersion} activated for ${job.title}.`
      );
      if (onPolicyUpdated) onPolicyUpdated();
      onClose();
    } catch (err: any) {
      toast.error('Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Job Requisition Hiring Policy & Stage-Gates</span>
                {policy && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                    v{policy.policyVersion}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">Enforce rigorous threshold gates for <strong>{job.title}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'policy' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Policy Stage-Gates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'history' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Version History ({history.length})
          </button>
        </div>

        {activeTab === 'policy' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex justify-between">
                  <span>Minimum Role Fit Score</span>
                  <span className="text-cyan-400 font-mono font-bold">{minFitScore}%</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={minFitScore}
                  onChange={(e) => setMinFitScore(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex justify-between">
                  <span>Minimum Verification Rating</span>
                  <span className="text-emerald-400 font-mono font-bold">{minVerificationRating}%</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="95"
                  value={minVerificationRating}
                  onChange={(e) => setMinVerificationRating(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Mandatory Interview Rounds</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={requiredInterviewRounds}
                  onChange={(e) => setRequiredInterviewRounds(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Auto-Advance Fast-Track Threshold</label>
                <input
                  type="number"
                  min="80"
                  max="100"
                  value={autoAdvanceMinScore}
                  onChange={(e) => setAutoAdvanceMinScore(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireHumanOverrideReason}
                  onChange={(e) => setRequireHumanOverrideReason(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-600 focus:ring-0 mt-0.5"
                />
                <div>
                  <div className="text-xs font-bold text-white">Require Override Justification for Blocked Stage-Gates</div>
                  <div className="text-[11px] text-slate-400">
                    If candidate does not meet the minimum match or verification score, reviewers must provide explicit audit justification to advance them.
                  </div>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Publish Policy Version'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-mono">Version {h.policyVersion}</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(h.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                  <div>Min Fit: <strong className="text-cyan-400">{h.minimumOverallFitScore}%</strong></div>
                  <div>Min Verification: <strong className="text-emerald-400">{h.minimumVerificationRating}%</strong></div>
                  <div>Interviews: <strong className="text-purple-400">{h.requiredInterviewRounds} Rounds</strong></div>
                  <div>By: <strong className="text-slate-200">{h.updatedBy}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
