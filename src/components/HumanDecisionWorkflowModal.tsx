import React, { useState, useEffect } from 'react';
import { Candidate, JobProfile, HumanDecisionRecord, DecisionReadinessScore, JobHiringPolicy } from '../types';
import { authenticatedFetch } from '../lib/api';
import { useToast } from './common/ToastSystem';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Scale, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  UserCheck, 
  HelpCircle,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';

interface HumanDecisionWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
  job: JobProfile | null;
  onDecisionRecorded: (updatedCandidate: Candidate) => void;
}

export const HumanDecisionWorkflowModal: React.FC<HumanDecisionWorkflowModalProps> = ({
  isOpen,
  onClose,
  candidate,
  job,
  onDecisionRecorded,
}) => {
  const toast = useToast();
  const [decisionType, setDecisionType] = useState<HumanDecisionRecord['decisionType']>('ADVANCE_STAGE');
  const [targetState, setTargetState] = useState<string>('Technical Round');
  const [reason, setReason] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isOverride, setIsOverride] = useState<boolean>(false);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [readiness, setReadiness] = useState<DecisionReadinessScore | null>(null);
  const [policy, setPolicy] = useState<JobHiringPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !candidate) return;

    // Reset default form state
    setDecisionType('ADVANCE_STAGE');
    setTargetState(
      candidate.pipelineStatus === 'New' ? 'Screening' :
      candidate.pipelineStatus === 'Screening' ? 'Technical Round' :
      candidate.pipelineStatus === 'Technical Round' ? 'Final Round' :
      candidate.pipelineStatus === 'Final Round' ? 'Offer' : 'Hired'
    );
    setReason('');
    setOverrideReason('');
    setIsOverride(false);
    setSelectedEvidence([]);

    // Fetch live readiness & policy
    async function fetchReadiness() {
      setLoading(true);
      try {
        const [readinessRes, policyRes] = await Promise.all([
          authenticatedFetch(`/api/candidates/${candidate.id}/decision-readiness`),
          job ? authenticatedFetch(`/api/jobs/${job.id}/policy`) : Promise.resolve(null),
        ]);

        if (readinessRes.ok) {
          const rData = await readinessRes.json();
          setReadiness(rData);
        }

        if (policyRes && policyRes.ok) {
          const pData = await policyRes.json();
          setPolicy(pData);
        }
      } catch (err) {
        console.error('Failed to load decision readiness:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReadiness();
  }, [isOpen, candidate, job]);

  if (!isOpen || !candidate) return null;

  const toggleEvidence = (citation: string) => {
    setSelectedEvidence(prev => 
      prev.includes(citation) ? prev.filter(c => c !== citation) : [...prev, citation]
    );
  };

  const handleDecisionTypeChange = (type: HumanDecisionRecord['decisionType']) => {
    setDecisionType(type);
    if (type === 'PROCEED_TO_OFFER') {
      setTargetState('Offer');
    } else if (type === 'REJECT_CANDIDATE') {
      setTargetState('Rejected');
    } else if (type === 'REQUEST_SECOND_OPINION') {
      setTargetState('Review Required');
    } else if (type === 'CALIBRATION_OVERRIDE') {
      setIsOverride(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.warning('Rationale Required', 'Please provide a clear justification for this hiring decision.');
      return;
    }

    if (isOverride && !overrideReason.trim()) {
      toast.warning('Override Reason Required', 'Please explicitly document why you are overriding the AI fit recommendation.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionType,
          newState: targetState,
          reason,
          evidenceContext: selectedEvidence,
          isOverride,
          overrideReason: isOverride ? overrideReason : undefined,
          aiRecommendationSnapshot: {
            recommendation: candidate.overallFitScore >= 80 ? 'PROCEED_TO_INTERVIEW' : 'FURTHER_VERIFICATION_NEEDED',
            fitScore: candidate.overallFitScore,
            confidence: candidate.verificationRating >= 80 ? 'High' : 'Moderate',
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to record decision');
      }

      const data = await res.json();
      toast.success(
        'Human Decision Recorded',
        `Decision '${decisionType}' persisted to immutable audit ledger.`
      );
      if (data.candidate) {
        onDecisionRecorded(data.candidate);
      }
      onClose();
    } catch (err: any) {
      console.error('Decision submission error:', err);
      toast.error('Submission Failed', err.message || 'Could not record decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const evidenceOptions = [
    ...(candidate.claims || []).map(c => `Claim: ${c.claim} (${c.status.toUpperCase()})`),
    ...(candidate.keyStrengths || []).map(s => `Strength: ${s}`),
    ...(candidate.potentialRisks || []).map(r => `Risk Flag: ${r}`),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Human Decision & Audit Record</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Human-in-the-Loop
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Authoritative hiring action for <strong className="text-slate-200">{candidate.name}</strong> • Requisition: {job?.title || 'General'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Decision Readiness Summary Strip */}
          {readiness && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Decision Readiness Evaluation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    readiness.readinessStatus === 'READY' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    readiness.readinessStatus === 'GATED' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {readiness.readinessStatus === 'READY' ? 'Ready for Decision' :
                     readiness.readinessStatus === 'GATED' ? 'Stage Gates Incomplete' : 'Evaluating Requirements'}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {readiness.overallReadinessScore}%
                  </span>
                </div>
              </div>

              {/* Stage Gates Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {readiness.stageGates.map((gate, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2 p-2 rounded-xl border text-xs ${
                      gate.satisfied 
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' 
                        : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                    }`}
                  >
                    {gate.satisfied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold">{gate.gateName}</div>
                      <div className="text-[11px] opacity-80">{gate.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>Select Action / Decision Type</span>
              <span className="text-[10px] text-slate-500 font-sans">Immutable Audit Record</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'ADVANCE_STAGE', label: 'Advance Stage', icon: ArrowRight, color: 'hover:border-cyan-500' },
                { id: 'PROCEED_TO_OFFER', label: 'Extend Offer', icon: CheckCircle2, color: 'hover:border-emerald-500' },
                { id: 'REJECT_CANDIDATE', label: 'Archive / Reject', icon: XCircle, color: 'hover:border-rose-500' },
                { id: 'CALIBRATION_OVERRIDE', label: 'Human Override', icon: Scale, color: 'hover:border-amber-500' },
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = decisionType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleDecisionTypeChange(opt.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-xs ring-1 ring-indigo-500' 
                        : `bg-slate-950/60 border-slate-800 text-slate-400 ${opt.color} hover:text-slate-200`
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Stage Transition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Pipeline Stage</label>
              <select
                value={targetState}
                onChange={(e) => setTargetState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Screening">Screening</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Technical Round">Technical Round</option>
                <option value="Final Round">Final Round</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>AI Recommendation Alignment</span>
                <span className="text-[11px] text-cyan-400 font-mono">Fit Score: {candidate.overallFitScore}%</span>
              </label>
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs flex items-center justify-between text-slate-300">
                <span>AI Suggestion: <strong>{candidate.overallFitScore >= 80 ? 'Proceed to Final' : 'Further Verification'}</strong></span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={isOverride}
                    onChange={(e) => setIsOverride(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span className="text-amber-400 font-semibold">Flag Override</span>
                </label>
              </div>
            </div>
          </div>

          {/* Override Reason (Conditional) */}
          {isOverride && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Document AI Override Rationale</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                Why are you taking an action contrary to the automated score or stage gate recommendation? This ensures complete enterprise calibration transparency.
              </p>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Proven track record in specialized niche compensated for unverified secondary certification..."
                rows={2}
                className="w-full bg-slate-950 border border-amber-900/50 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Primary Decision Rationale */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Primary Decision Rationale (Required)</span>
              <span className="text-[11px] text-slate-500">Will be saved to candidate ledger</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide specific notes regarding candidate qualifications, panel consensus, or interview outcomes..."
              rows={3}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Evidence Citations Checkboxes */}
          {evidenceOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
                Attach Supporting Evidence Citations (Optional)
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                {evidenceOptions.map((opt, i) => {
                  const isChecked = selectedEvidence.includes(opt);
                  return (
                    <label
                      key={i}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/50 text-xs text-slate-300 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEvidence(opt)}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                      />
                      <span className="line-clamp-1">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Immutable cryptographic audit hash appended upon submission.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {submitting ? 'Recording...' : 'Commit Human Decision'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
