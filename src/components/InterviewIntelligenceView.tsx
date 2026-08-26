import React, { useState, useEffect } from 'react';
import { Candidate, JobProfile, InterviewQuestion, InterviewRecord } from '../types';
import { authenticatedFetch } from '../lib/api';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Send,
  History,
  Award
} from 'lucide-react';

interface InterviewIntelligenceViewProps {
  candidate: Candidate;
  job: JobProfile;
  onAddQuestion: (newQuestion: InterviewQuestion) => void;
  onOpenCopilot: () => void;
}

export const InterviewIntelligenceView: React.FC<InterviewIntelligenceViewProps> = ({
  candidate,
  job,
  onAddQuestion,
  onOpenCopilot,
}) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    candidate.interviewQuestions[0]?.id || null
  );
  const [questionScores, setQuestionScores] = useState<Record<string, number>>({});
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Structured Interview Records
  const [interviewRecords, setInterviewRecords] = useState<InterviewRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [selectedStage, setSelectedStage] = useState<InterviewRecord['stage']>('Technical Deep-Dive');
  const [overallRecommendation, setOverallRecommendation] = useState<InterviewRecord['recommendation']>('Hire');
  const [committeeNotes, setCommitteeNotes] = useState<string>('');
  const [isSubmittingRecord, setIsSubmittingRecord] = useState<boolean>(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviewHistory();
  }, [candidate.id]);

  const fetchInterviewHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/interviews`);
      if (res.ok) {
        const data = await res.json();
        setInterviewRecords(data.interviewRecords || []);
      }
    } catch (err) {
      console.error('Failed to fetch interview history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedQuestionId(prev => (prev === id ? null : id));
  };

  const handleSetScore = (qId: string, score: number) => {
    setQuestionScores(prev => ({ ...prev, [qId]: score }));
  };

  const handleSetNote = (qId: string, note: string) => {
    setQuestionNotes(prev => ({ ...prev, [qId]: note }));
  };

  const handleGenerateFreshProbes = async () => {
    setIsGenerating(true);
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/generate-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.questions && data.questions.length > candidate.interviewQuestions.length) {
        const newest = data.questions[data.questions.length - 1];
        onAddQuestion(newest);
        setExpandedQuestionId(newest.id);
      }
    } catch (err) {
      console.error('Failed to generate interview probe:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitScorecard = async () => {
    if (!committeeNotes.trim() && Object.keys(questionScores).length === 0) return;

    setIsSubmittingRecord(true);
    setSubmitSuccessMessage(null);
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: selectedStage,
          scores: questionScores,
          notes: committeeNotes,
          recommendation: overallRecommendation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInterviewRecords(prev => [data.interviewRecord, ...prev]);
        setSubmitSuccessMessage('Official interview scorecard recorded to candidate audit dossier.');
        setCommitteeNotes('');
        setTimeout(() => setSubmitSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to submit interview scorecard:', err);
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  const getDifficultyBadge = (diff: InterviewQuestion['difficulty']) => {
    switch (diff) {
      case 'principal':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">Principal Level (L6+)</span>;
      case 'advanced':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Advanced</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">Intermediate</span>;
    }
  };

  return (
    <div id="interview-intelligence-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tailored Live Interview Intelligence & Rubrics</h2>
              <p className="text-xs text-slate-500">
                Grounded questions targeting resume assertions, weak spots, and L6+ competencies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-generate-ai-probe"
              onClick={handleGenerateFreshProbes}
              disabled={isGenerating}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isGenerating ? 'Generating Probes...' : 'Generate New Probe Question'}</span>
            </button>
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Copilot Q&A</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block mb-0.5">Target Role Calibration</span>
            <span className="font-bold text-slate-900">{job.title}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block mb-0.5">Scored Questions</span>
            <span className="font-bold text-slate-900">
              {Object.keys(questionScores).length} / {candidate.interviewQuestions.length} completed
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block mb-0.5">Evaluator Standard</span>
            <span className="font-bold text-emerald-700">Strict Non-Hallucinatory Rubric</span>
          </div>
        </div>
      </div>

      {/* Structured Historical Interview Logs Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <span>Interview Records & Committee Evaluations</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {interviewRecords.length} recorded session{interviewRecords.length !== 1 ? 's' : ''}
          </span>
        </div>

        {interviewRecords.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-medium">No previous interview record found.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Score live questions below and submit the evaluation to log official feedback.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviewRecords.map((record) => (
              <div key={record.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {record.stage} • <span className="text-indigo-600">{record.interviewerName}</span> ({record.interviewerRole})
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    record.recommendation === 'Strong Hire' || record.recommendation === 'Hire'
                      ? 'bg-emerald-100 text-emerald-800'
                      : record.recommendation.includes('Leaning')
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {record.recommendation}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">Conducted on {record.date}</div>
                {record.notes && (
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                    {record.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Cards with Rubric and Real-Time Scoring */}
      <div className="space-y-4">
        {candidate.interviewQuestions.map((q, idx) => {
          const isExpanded = expandedQuestionId === q.id;
          const currentScore = questionScores[q.id] || 0;

          return (
            <div
              key={q.id}
              id={`interview-q-${q.id}`}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Question Header Accordion Bar */}
              <div
                onClick={() => toggleExpand(q.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {getDifficultyBadge(q.difficulty)}
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {q.targetCompetency}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{q.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {currentScore > 0 && (
                    <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> {currentScore}/5
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Rubric & Scoring Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/30 space-y-4">
                  {/* Context Objective */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">🎯 Intent & Grounding Context:</span>
                    <p className="text-slate-600 leading-relaxed">{q.context}</p>
                  </div>

                  {/* 3-Tier Rubric Guide */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Evaluation Rubric Criteria
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Poor Signal */}
                      <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200">
                        <span className="font-bold text-rose-800 block mb-1">❌ Inadequate (1-2 pts)</span>
                        <p className="text-rose-900 leading-relaxed text-[11px]">{q.evaluationRubric.poor}</p>
                      </div>

                      {/* Good Signal */}
                      <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200">
                        <span className="font-bold text-blue-800 block mb-1">⚡ Expected / Good (3-4 pts)</span>
                        <p className="text-blue-900 leading-relaxed text-[11px]">{q.evaluationRubric.good}</p>
                      </div>

                      {/* Exceptional Signal */}
                      <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                        <span className="font-bold text-emerald-800 block mb-1">🌟 Exceptional / L6+ (5 pts)</span>
                        <p className="text-emerald-900 leading-relaxed text-[11px]">{q.evaluationRubric.exceptional}</p>
                      </div>
                    </div>
                  </div>

                  {/* Live Interviewer Score & Notes Panel */}
                  <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800">Interviewer Score:</span>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map(score => (
                          <button
                            key={score}
                            onClick={() => handleSetScore(q.id, score)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentScore === score
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Live Response Notes & Observations:
                      </label>
                      <textarea
                        value={questionNotes[q.id] || ''}
                        onChange={(e) => handleSetNote(q.id, e.target.value)}
                        placeholder="Type verbatim observations, code architecture citations, or candidate explanations..."
                        rows={2}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Official Scorecard Submission Box */}
      <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>Submit Official Panel Scorecard & Decision</span>
        </h3>

        {submitSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{submitSuccessMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Interview Stage:</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as any)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="Initial Screen">Initial Screen</option>
              <option value="Technical Deep-Dive">Technical Deep-Dive</option>
              <option value="System Architecture">System Architecture</option>
              <option value="Hiring Committee">Hiring Committee</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Recommendation:</label>
            <select
              value={overallRecommendation}
              onChange={(e) => setOverallRecommendation(e.target.value as any)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium"
            >
              <option value="Strong Hire">Strong Hire</option>
              <option value="Hire">Hire</option>
              <option value="Leaning Hire">Leaning Hire</option>
              <option value="Leaning No Hire">Leaning No Hire</option>
              <option value="No Hire">No Hire</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Committee Synthesis & Key Takeaways:</label>
          <textarea
            value={committeeNotes}
            onChange={(e) => setCommitteeNotes(e.target.value)}
            placeholder="Summarize candidate's technical depth, system trade-offs, cultural alignment, and areas for onboarding support..."
            rows={3}
            className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmitScorecard}
            disabled={isSubmittingRecord}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmittingRecord ? 'Saving Scorecard...' : 'Submit & Log Interview Scorecard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
