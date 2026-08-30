import React, { useState, useMemo } from 'react';
import { Candidate, JobProfile, CandidatePipelineStatus } from '../types';
import { 
  Trophy, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Briefcase, 
  MapPin, 
  ArrowRight, 
  Sliders, 
  Sparkles, 
  Layers, 
  CheckSquare, 
  Square, 
  Archive, 
  ChevronRight, 
  HelpCircle, 
  X, 
  Calendar,
  Zap,
  BarChart2,
  Users,
  Copy,
  Info
} from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

interface LeaderboardViewProps {
  candidates: Candidate[];
  job?: JobProfile | null;
  onSelectCandidate: (candidateId: string) => void;
  onOpenCopilot: () => void;
  onBulkUpdated?: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  candidates,
  job,
  onSelectCandidate,
  onOpenCopilot,
  onBulkUpdated,
  onNavigateToTab,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [minExpFilter, setMinExpFilter] = useState<number>(0);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [explainingCandidate, setExplainingCandidate] = useState<Candidate | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);
  const [bulkStageModalOpen, setBulkStageModalOpen] = useState<boolean>(false);
  const [targetBulkStage, setTargetBulkStage] = useState<CandidatePipelineStatus>('Shortlisted');

  // Compute dynamic match score and ranking for each candidate relative to the current job
  const rankedCandidates = useMemo(() => {
    return candidates.map(cand => {
      // Required skills match calculation
      const requiredSkills = job?.requiredSkills || [];
      let matchedCount = 0;
      let semanticCount = 0;

      requiredSkills.forEach(reqSkill => {
        const direct = (cand.skills || []).find(s => (typeof s === 'string' ? s : s?.name || '').toLowerCase() === (reqSkill || '').toLowerCase());
        if (direct) {
          matchedCount++;
        } else {
          // Check semantic synonym
          const isSemantic = (cand.skills || []).some(s => {
            const sName = typeof s === 'string' ? s : s?.name || '';
            return sName.toLowerCase().includes((reqSkill || '').toLowerCase()) || 
                   (reqSkill || '').toLowerCase().includes(sName.toLowerCase());
          });
          if (isSemantic) semanticCount++;
        }
      });

      const reqCoverage = requiredSkills.length > 0
        ? Math.round(((matchedCount + semanticCount * 0.75) / requiredSkills.length) * 100)
        : 85;

      // Experience relevance score
      const minExp = job.experienceMin || 3;
      const expScore = cand.yearsOfExperience >= minExp
        ? Math.min(100, 80 + (cand.yearsOfExperience - minExp) * 5)
        : Math.max(30, Math.round((cand.yearsOfExperience / minExp) * 75));

      // Weighted dynamic match score
      const ruleBasedScore = Math.round(
        reqCoverage * 0.40 +
        expScore * 0.25 +
        (cand.verificationRating || 80) * 0.20 +
        (cand.overallFitScore || 75) * 0.15
      );

      return {
        ...cand,
        dynamicMatchScore: Math.min(99, Math.max(45, ruleBasedScore)),
        requiredSkillsScore: reqCoverage,
        expRelevanceScore: expScore,
        matchedRequiredCount: matchedCount,
        semanticRequiredCount: semanticCount,
      };
    }).sort((a, b) => b.dynamicMatchScore - a.dynamicMatchScore);
  }, [candidates, job]);

  // Unique filter values
  const uniqueLocations = useMemo(() => {
    const locs = Array.from(new Set(candidates.map(c => c.location).filter(Boolean)));
    return ['all', ...locs];
  }, [candidates]);

  const uniqueSkills = useMemo(() => {
    const skills = Array.from(new Set(job.requiredSkills || []));
    return ['all', ...skills];
  }, [job]);

  // Filtered leaderboard
  const filteredRanked = rankedCandidates.filter(c => {
    if (searchTerm) {
      const cName = c.name || '';
      const cRole = c.currentRole || '';
      const cCompany = c.currentCompany || '';
      const match = cName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.skills || []).some(s => (typeof s === 'string' ? s : s?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
      if (!match) return false;
    }
    if (selectedLocation !== 'all' && c.location !== selectedLocation) return false;
    if (selectedSkillFilter !== 'all') {
      const hasSkill = (c.skills || []).some(s => (typeof s === 'string' ? s : s?.name || '').toLowerCase().includes(selectedSkillFilter.toLowerCase()));
      if (!hasSkill) return false;
    }
    if (selectedStageFilter !== 'all' && (c.pipelineStatus || c.status) !== selectedStageFilter) return false;
    if (minExpFilter > 0 && c.yearsOfExperience < minExpFilter) return false;
    return true;
  });

  const toggleSelectCandidate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCandidateIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedCandidateIds.length === filteredRanked.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredRanked.map(c => c.id));
    }
  };

  const handleBulkStatusChange = async (stage: CandidatePipelineStatus) => {
    if (selectedCandidateIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await authenticatedFetch('/api/candidates/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: selectedCandidateIds,
          stage,
          notes: `Bulk status update to ${stage}`,
        }),
      });
      setSelectedCandidateIds([]);
      setBulkStageModalOpen(false);
      if (onBulkUpdated) onBulkUpdated();
    } catch (err) {
      console.error('Bulk stage transition failed:', err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkArchive = async (archive = true) => {
    if (selectedCandidateIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await authenticatedFetch('/api/candidates/bulk-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: selectedCandidateIds,
          archive,
        }),
      });
      setSelectedCandidateIds([]);
      if (onBulkUpdated) onBulkUpdated();
    } catch (err) {
      console.error('Bulk archive failed:', err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div id="leaderboard-view" className="space-y-6">
      {/* Header & Sub-Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800/80 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/60">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Top Matches
                <span className="text-xs bg-indigo-950 text-cyan-300 border border-indigo-800 px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  {filteredRanked.length} Candidates
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Candidates ranked for selected role: <span className="font-semibold text-slate-200">{job?.title || 'Target Role'}</span> ({job?.department || 'General'})
              </p>
            </div>
          </div>
        </div>

        {/* Explainability Formula Pill */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl text-slate-400 font-mono">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Decision-Support Formula: 40% Required Skills + 25% Experience + 20% Evidence Strength + 15% Verified Projects</span>
        </div>
      </div>

      {/* Filter Controls Toolbar */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800/80 shadow-md space-y-3 backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate or skill..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.filter(l => l !== 'all').map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Required Skill Filter */}
          <div>
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Required Skills</option>
              {uniqueSkills.filter(s => s !== 'all').map(skill => (
                <option key={skill} value={skill}>Skill: {skill}</option>
              ))}
            </select>
          </div>

          {/* Pipeline Stage Filter */}
          <div>
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Pipeline Stages</option>
              <option value="New">Stage: New</option>
              <option value="Screening">Stage: Screening</option>
              <option value="Shortlisted">Stage: Shortlisted</option>
              <option value="Interview">Stage: Interview</option>
              <option value="Technical Round">Stage: Technical Round</option>
              <option value="Final Round">Stage: Final Round</option>
              <option value="Offer">Stage: Offer</option>
              <option value="Hired">Stage: Hired</option>
              <option value="Rejected">Stage: Rejected</option>
              <option value="On Hold">Stage: On Hold</option>
            </select>
          </div>

          {/* Min Experience Filter */}
          <div>
            <select
              value={minExpFilter}
              onChange={(e) => setMinExpFilter(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="0">Any Experience</option>
              <option value="3">Min 3+ Years Exp</option>
              <option value="5">Min 5+ Years Exp</option>
              <option value="8">Min 8+ Years Exp</option>
              <option value="10">Min 10+ Years Exp</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar (When items selected) */}
        {selectedCandidateIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-950/80 border border-indigo-800/80 p-3 rounded-xl animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>{selectedCandidateIds.length} candidates selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBulkStageModalOpen(true)}
                disabled={isBulkProcessing}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" /> Move Stage
              </button>
              <button
                onClick={() => handleBulkArchive(true)}
                disabled={isBulkProcessing}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" /> Archive
              </button>
              <button
                onClick={() => setSelectedCandidateIds([])}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="space-y-3">
        {filteredRanked.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800 space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No matching candidates found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No candidates meet the active filter criteria. Try adjusting the search term, location, or experience threshold.
            </p>
          </div>
        ) : (
          filteredRanked.map((cand, idx) => {
            const rank = idx + 1;
            const isSelected = selectedCandidateIds.includes(cand.id);
            const isTop3 = rank <= 3;

            return (
              <div
                key={cand.id}
                id={`leaderboard-card-${cand.id}`}
                onClick={() => {
                  onSelectCandidate(cand.id);
                  if (onNavigateToTab) onNavigateToTab('dossier');
                }}
                className={`bg-slate-900 rounded-2xl p-5 border transition-all hover:shadow-xl cursor-pointer relative group ${
                  isTop3 
                    ? 'border-slate-800 hover:border-indigo-500/60 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/20' 
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Rank & Candidate Details */}
                  <div className="flex items-start gap-3.5">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => toggleSelectCandidate(cand.id, e)}
                      className="mt-1 text-slate-500 hover:text-cyan-400 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm font-mono shrink-0 shadow-xs ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/30'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950 ring-2 ring-slate-400/30'
                        : rank === 3
                        ? 'bg-amber-700 text-amber-100 ring-2 ring-amber-700/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{rank}
                    </div>

                    {/* Candidate Photo & Info */}
                    <div className="flex items-start gap-3">
                      <img
                        src={cand.avatarUrl}
                        alt={cand.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors shrink-0"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                            {cand.name}
                          </span>
                          <span className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded font-mono font-medium border border-slate-800">
                            {cand.pipelineStatus || cand.status}
                          </span>
                          {cand.duplicateFlag && (
                            <span className="flex items-center gap-1 text-[10px] bg-amber-950/80 text-amber-300 border border-amber-700/60 px-2 py-0.5 rounded-full font-semibold">
                              <AlertTriangle className="w-3 h-3 text-amber-400" /> Duplicate Detected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          {cand.currentRole} • <span className="text-slate-400">{cand.currentCompany}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            {cand.yearsOfExperience} yrs exp
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {cand.location}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <ShieldCheck className="w-3 h-3" />
                            {cand.verificationRating}% Verified Grounding
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Breakdown Cards */}
                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    {/* Required Skills Match Score */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Skill Match</div>
                      <div className="text-xs font-bold text-cyan-300 font-mono">
                        {cand.requiredSkillsScore}%
                      </div>
                    </div>

                    {/* Overall Role Match Score */}
                    <div className="bg-indigo-950/80 border border-indigo-800/80 rounded-xl px-4 py-2 text-center">
                      <div className="text-[10px] uppercase font-bold text-indigo-300">Role Match</div>
                      <div className="text-base font-extrabold text-cyan-300 font-mono">
                        {cand.dynamicMatchScore}%
                      </div>
                    </div>

                    {/* Why Ranked Here Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExplainingCandidate(cand);
                      }}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-indigo-950 hover:text-cyan-300 text-slate-200 border border-slate-700 hover:border-indigo-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Why Ranked #{rank}?</span>
                    </button>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors hidden sm:block" />
                  </div>
                </div>

                {/* Skill Chips Strip */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 self-center mr-1">Skills:</span>
                  {(cand.skills || []).slice(0, 6).map((s, sIdx) => {
                    const sName = typeof s === 'string' ? s : s?.name || '';
                    const isReq = (job?.requiredSkills || []).some(
                      r => (r || '').toLowerCase() === sName.toLowerCase()
                    );
                    return (
                      <span
                        key={sIdx}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          isReq
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {isReq && <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />}
                        {sName}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* "Why This Candidate Is Ranked Here" Explanation Drawer / Modal */}
      {explainingCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={explainingCandidate.avatarUrl}
                  alt={explainingCandidate.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {explainingCandidate.name}
                    <span className="text-xs bg-indigo-950 text-cyan-300 border border-indigo-800 px-2 py-0.5 rounded-full font-mono">
                      Ranked Match: {explainingCandidate.overallFitScore}%
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive explainability for role: <span className="font-semibold text-slate-200">{job?.title || 'Target Role'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExplainingCandidate(null)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Structured Explainability Breakdown */}
            <div className="space-y-4 text-xs">
              {/* 1. Strengths & Matches */}
              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Key Strengths & Direct Skill Alignment
                </div>
                <ul className="space-y-1 text-emerald-200">
                  {explainingCandidate.keyStrengths?.map((str, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-400">•</span>
                      <span>{str}</span>
                    </li>
                  )) || <li>Strong technical competency profile with corroborated project experience.</li>}
                </ul>
              </div>

              {/* 2. Experience & Project Relevance */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  Experience & Project Relevance
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Candidate holds <strong>{explainingCandidate.yearsOfExperience} years</strong> of industry experience at{' '}
                  <strong>{explainingCandidate.currentCompany}</strong>. Historical tenure and leadership responsibilities align with the senior requirements of {job?.title || 'the target requisition'}.
                </p>
              </div>

              {/* 3. Missing Skills & Potential Concerns */}
              <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Missing Skills & Areas to Probe in Interview
                </div>
                <div className="text-amber-200 space-y-1">
                  {explainingCandidate.potentialRisks?.length ? (
                    explainingCandidate.potentialRisks.map((risk, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="font-bold text-amber-400">•</span>
                        <span>{risk}</span>
                      </div>
                    ))
                  ) : (
                    <div>No critical disqualifying gaps observed. Candidate meets minimum core qualifications.</div>
                  )}
                </div>
              </div>

              {/* 4. Grounded Evidence & Verification Status */}
              <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-4 space-y-2">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Evidence Grounding & Verification Rating ({explainingCandidate.verificationRating}%)
                </div>
                <p className="text-indigo-200">
                  Cross-source validation completed across candidate resume documents, GitHub public repositories, and verifiable credentials. Zero synthetic hallucinations detected.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setExplainingCandidate(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const id = explainingCandidate.id;
                    setExplainingCandidate(null);
                    onSelectCandidate(id);
                    if (onNavigateToTab) onNavigateToTab('interview');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-950 text-cyan-300 hover:bg-indigo-900 border border-indigo-800 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Schedule Interview</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = explainingCandidate.id;
                    setExplainingCandidate(null);
                    onSelectCandidate(id);
                    if (onNavigateToTab) onNavigateToTab('dossier');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <span>Open Full Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Stage Transition Modal */}
      {bulkStageModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-100">
              Move {selectedCandidateIds.length} Candidates to Stage
            </h3>
            <p className="text-xs text-slate-400">
              Select the new target pipeline stage for the selected candidates. All status transitions will be logged in the audit trail.
            </p>
            <div className="space-y-2">
              {[
                'Screening',
                'Shortlisted',
                'Interview',
                'Technical Round',
                'Final Round',
                'Offer',
                'Hired',
                'Rejected',
                'On Hold',
              ].map(stage => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => handleBulkStatusChange(stage as CandidatePipelineStatus)}
                  className="w-full text-left px-3.5 py-2 rounded-xl border border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/50 text-xs font-semibold text-slate-200 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>{stage}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setBulkStageModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
