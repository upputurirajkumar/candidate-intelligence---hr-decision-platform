import React, { useState, useEffect } from 'react';
import { Candidate, CandidateActivityTimelineItem } from '../types';
import { authenticatedFetch } from '../lib/api';
import { 
  History, 
  ArrowRight, 
  ShieldCheck, 
  MessageSquare, 
  FileText, 
  Scale, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Filter,
  RefreshCw
} from 'lucide-react';

interface CandidateActivityTimelineProps {
  candidate: Candidate;
  onRefresh?: () => void;
}

export const CandidateActivityTimeline: React.FC<CandidateActivityTimelineProps> = ({
  candidate,
  onRefresh,
}) => {
  const [timeline, setTimeline] = useState<CandidateActivityTimelineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data);
      }
    } catch (err) {
      console.error('Failed to load candidate timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidate) {
      fetchTimeline();
    }
  }, [candidate.id]);

  const filteredItems = timeline.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const getItemIcon = (type: CandidateActivityTimelineItem['type']) => {
    switch (type) {
      case 'intake':
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'stage_transition':
        return <ArrowRight className="w-4 h-4 text-cyan-400" />;
      case 'verification':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'interview':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'note':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'decision':
        return <Scale className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getItemBadgeClass = (type: CandidateActivityTimelineItem['type']) => {
    switch (type) {
      case 'intake':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60';
      case 'stage_transition':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60';
      case 'verification':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'interview':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'note':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      case 'decision':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Candidate Journey & Audit Timeline</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                {timeline.length} Events
              </span>
            </h3>
            <p className="text-xs text-slate-400">Chronological history across intake, verification, panel rounds, and human verdicts.</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: 'All' },
              { id: 'decision', label: 'Decisions' },
              { id: 'stage_transition', label: 'Stages' },
              { id: 'verification', label: 'Evidence' },
              { id: 'interview', label: 'Interviews' },
              { id: 'note', label: 'Notes' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              fetchTimeline();
              if (onRefresh) onRefresh();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Refresh Timeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500"></div>
          <span className="text-xs">Loading candidate audit event history...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No activity records found matching the current filter.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {filteredItems.map((item, index) => {
            const formattedDate = new Date(item.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={item.id || index} className="relative group">
                {/* Node Dot */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-cyan-400 flex items-center justify-center shadow-lg transition-colors z-10">
                  {getItemIcon(item.type)}
                </div>

                {/* Event Card */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${getItemBadgeClass(item.type)}`}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{item.actor}</span>
                      {item.actorRole && (
                        <span className="text-slate-500">({item.actorRole})</span>
                      )}
                    </div>

                    {item.type === 'decision' && (
                      <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ledger Signed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
