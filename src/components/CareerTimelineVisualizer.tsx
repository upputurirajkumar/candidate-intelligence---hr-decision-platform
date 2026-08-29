import React, { useState } from 'react';
import { Candidate, CandidateExperience, CandidateEducation } from '../types';
import { 
  Building2, 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Award, 
  Clock, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface CareerTimelineVisualizerProps {
  candidate: Candidate;
}

export const CareerTimelineVisualizer: React.FC<CareerTimelineVisualizerProps> = ({ candidate }) => {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0, 1]);

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const experiences = candidate.experiences || [];
  const education = candidate.education || [];

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800/80 p-6 shadow-xl space-y-6 backdrop-blur-xl">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-950/80 text-cyan-400 border border-indigo-800/60 shadow-inner">
            <Building2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Verified Career Trajectory & Tenure Timeline
            </h3>
            <p className="text-xs text-slate-400">
              Corroborated employment history, leadership progression, and academic milestones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            {candidate.yearsOfExperience || 0}+ Years Verified Experience
          </span>
        </div>
      </div>

      {/* Non-Punitive Fairness Notice Banner */}
      <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-2xl flex items-start gap-2.5 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Fairness & Bias-Mitigated Career Continuity:</strong> TalentIntel evaluates impact and verifiable accomplishments. Career transitions, sabbaticals, parental leave, or independent research periods are treated neutrally and never penalized as fraud.
        </div>
      </div>

      {/* Animated Vertical Timeline Tree */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-cyan-500 before:to-emerald-500">
        {experiences.map((exp, idx) => {
          const isExpanded = expandedIndices.includes(idx);

          return (
            <div key={idx} className="relative group">
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-5 h-5 rounded-full bg-slate-950 border-2 border-cyan-400 group-hover:border-white shadow-lg flex items-center justify-center transition-all">
                <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
              </div>

              {/* Experience Card */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 hover:border-slate-700 transition-all shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {exp.role}
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mt-0.5">
                      <span>{exp.company}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-normal">{exp.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{exp.period}</span>
                      <span className="text-slate-500 font-normal">({exp.durationYears} yrs)</span>
                    </span>

                    {exp.verifiedTenure && (
                      <span className="px-2 py-1 rounded-xl text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Verified</span>
                      </span>
                    )}

                    <button
                      onClick={() => toggleExpand(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Highlights and Tech Badges */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3 animate-fadeIn">
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {exp.highlights.map((highlight, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-cyan-400 font-bold mt-0.5">›</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Technologies Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {exp.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Education Milestone Cards */}
        {education.map((edu, idx) => (
          <div key={`edu-${idx}`} className="relative group">
            {/* Timeline Indicator Dot */}
            <div className="absolute -left-[27px] sm:-left-[31px] top-1.5 w-5 h-5 rounded-full bg-slate-950 border-2 border-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-indigo-400" />
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{edu.degree}</h4>
                  {edu.verified && (
                    <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified Degree
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-400">{edu.institution}</p>
                <p className="text-[11px] text-slate-400">{edu.field}</p>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                Class of {edu.year}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
