import React, { useState } from 'react';
import { JobProfile } from '../types';
import { 
  Briefcase, 
  ChevronDown, 
  MapPin, 
  DollarSign, 
  Sliders, 
  Check, 
  X, 
  Save,
  Plus
} from 'lucide-react';

interface JobProfileSelectorProps {
  jobs: JobProfile[];
  selectedJob: JobProfile;
  onSelectJob: (job: JobProfile) => void;
  onUpdateJob: (updatedJob: JobProfile) => void;
}

export const JobProfileSelector: React.FC<JobProfileSelectorProps> = ({
  jobs,
  selectedJob,
  onSelectJob,
  onUpdateJob,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditingWeightings, setIsEditingWeightings] = useState<boolean>(false);
  const [editedWeightings, setEditedWeightings] = useState(selectedJob.weightings);

  const handleSaveWeightings = () => {
    onUpdateJob({
      ...selectedJob,
      weightings: editedWeightings,
    });
    setIsEditingWeightings(false);
  };

  return (
    <div className="relative">
      {/* Trigger Bar */}
      <div className="flex items-center gap-2">
        <button
          id="btn-job-dropdown"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs transition-all cursor-pointer"
        >
          <div className="p-1 bg-indigo-50 text-indigo-600 rounded">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">Target Job Requisition</div>
            <div className="truncate max-w-[200px] sm:max-w-[280px] font-bold text-slate-900">{selectedJob.title}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
        </button>

        <button
          onClick={() => setIsEditingWeightings(!isEditingWeightings)}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
          title="Adjust Competency Weightings"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-40 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Open Hiring Requisitions
          </div>

          {jobs.map((job) => {
            const isCurrent = job.id === selectedJob.id;
            return (
              <button
                key={job.id}
                onClick={() => {
                  onSelectJob(job);
                  setEditedWeightings(job.weightings);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer flex items-start justify-between ${
                  isCurrent ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{job.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{job.department} • {job.level}</div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.salaryRange}</span>
                  </div>
                </div>
                {isCurrent && <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Weightings Modal Drawer */}
      {isEditingWeightings && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Calibrate Role Weightings</h3>
                <p className="text-xs text-slate-500">{selectedJob.title}</p>
              </div>
              <button onClick={() => setIsEditingWeightings(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Technical Acumen & Coding</span>
                  <span className="font-mono">{editedWeightings.technical}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editedWeightings.technical}
                  onChange={(e) => setEditedWeightings({ ...editedWeightings, technical: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>System Design & Architecture</span>
                  <span className="font-mono">{editedWeightings.systemDesign}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editedWeightings.systemDesign}
                  onChange={(e) => setEditedWeightings({ ...editedWeightings, systemDesign: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Technical Leadership & Mentorship</span>
                  <span className="font-mono">{editedWeightings.leadership}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editedWeightings.leadership}
                  onChange={(e) => setEditedWeightings({ ...editedWeightings, leadership: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Execution Velocity & SRE</span>
                  <span className="font-mono">{editedWeightings.execution}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editedWeightings.execution}
                  onChange={(e) => setEditedWeightings({ ...editedWeightings, execution: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Culture Add & Cross-Functional</span>
                  <span className="font-mono">{editedWeightings.cultureFit}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editedWeightings.cultureFit}
                  onChange={(e) => setEditedWeightings({ ...editedWeightings, cultureFit: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEditingWeightings(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWeightings}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Rubric
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
