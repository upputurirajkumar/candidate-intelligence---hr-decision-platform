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
  Plus,
  Sparkles,
  Trash2,
  Layers,
  GraduationCap,
  Award,
  ListChecks,
  CheckCircle2,
  Building
} from 'lucide-react';
import { authenticatedFetch } from '../lib/api';

interface JobProfileSelectorProps {
  jobs: JobProfile[];
  selectedJob?: JobProfile | null;
  onSelectJob: (job: JobProfile) => void;
  onUpdateJob: (updatedJob: JobProfile) => void;
  onJobCreated?: (newJob: JobProfile) => void;
  onJobDeleted?: (jobId: string) => void;
  onOpenUniverse?: () => void;
}

const PRESET_ROLES = [
  'Data Scientist',
  'ML Engineer',
  'AI Systems Engineer',
  'Staff Distributed Systems Engineer',
  'Lead Full Stack Engineer',
  'Senior DevOps / SRE Engineer',
  'Cloud Infrastructure Architect',
  'Principal Product Manager',
  'Cybersecurity Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'QA Automation Engineer',
];

const DEFAULT_ROLE_WEIGHTINGS = {
  technical: 30,
  systemDesign: 25,
  evidenceVerified: 20,
  experience: 15,
  cultureFit: 10,
};

export const JobProfileSelector: React.FC<JobProfileSelectorProps> = ({
  jobs,
  selectedJob,
  onSelectJob,
  onUpdateJob,
  onJobCreated,
  onJobDeleted,
  onOpenUniverse,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditingWeightings, setIsEditingWeightings] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isParsingAI, setIsParsingAI] = useState<boolean>(false);
  const [editedWeightings, setEditedWeightings] = useState(
    selectedJob?.weightings || DEFAULT_ROLE_WEIGHTINGS
  );

  // Job Creation / Editing State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [department, setDepartment] = useState<string>('Engineering');
  const [level, setLevel] = useState<string>('L5 / Senior');
  const [location, setLocation] = useState<string>('San Francisco, CA / Remote');
  const [employmentType, setEmploymentType] = useState<JobProfile['employmentType']>('Full-time');
  const [salaryRange, setSalaryRange] = useState<string>('$180,000 - $240,000 + Equity');
  const [expMin, setExpMin] = useState<number>(4);
  const [expMax, setExpMax] = useState<number>(8);
  const [description, setDescription] = useState<string>('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Python', 'System Design']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['Kubernetes', 'Cloud']);
  const [optionalSkills, setOptionalSkills] = useState<string[]>(['Docker']);
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Design and build scalable, fault-tolerant backend services.',
    'Collaborate closely with product managers and distributed infrastructure teams.',
  ]);
  const [educationReq, setEducationReq] = useState<string[]>([
    'B.S. or M.S. in Computer Science or equivalent practical industry experience.'
  ]);
  const [customWeightings, setCustomWeightings] = useState({
    technical: 35,
    systemDesign: 30,
    leadership: 15,
    execution: 10,
    cultureFit: 10,
  });

  // Tag input states
  const [reqInput, setReqInput] = useState<string>('');
  const [prefInput, setPrefInput] = useState<string>('');
  const [respInput, setRespInput] = useState<string>('');

  const handleSaveWeightings = async () => {
    const updated = {
      ...selectedJob,
      weightings: editedWeightings,
    };
    try {
      const res = await authenticatedFetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.job) {
        onUpdateJob(data.job);
      } else {
        onUpdateJob(updated);
      }
    } catch {
      onUpdateJob(updated);
    }
    setIsEditingWeightings(false);
  };

  const openCreateModal = (presetTitle?: string) => {
    setEditingJobId(null);
    setJobTitle(presetTitle || 'Senior Data Scientist');
    setDepartment('AI & Data Intelligence');
    setLevel('L5 / Senior');
    setLocation('San Francisco, CA / Hybrid');
    setEmploymentType('Full-time');
    setSalaryRange('$190,000 - $250,000 + Equity');
    setExpMin(4);
    setExpMax(8);
    setDescription(
      presetTitle 
        ? `We are seeking an experienced ${presetTitle} to architect high-performance data systems, machine learning models, and automated inference pipelines.`
        : 'Lead data science and predictive intelligence initiatives across enterprise applications.'
    );
    setRequiredSkills(['Python', 'SQL', 'Machine Learning', 'Data Modeling', 'Statistics']);
    setPreferredSkills(['PyTorch', 'Spark', 'MLflow', 'Cloud Architecture']);
    setOptionalSkills(['Docker', 'Tableau']);
    setResponsibilities([
      'Develop robust machine learning models and real-time inference pipelines.',
      'Perform exploratory data analysis on petabyte-scale datasets.',
      'Partner with product teams to translate business questions into predictive intelligence.',
    ]);
    setEducationReq(['B.S., M.S., or Ph.D. in Data Science, Computer Science, or Quantitative Field.']);
    setCustomWeightings({
      technical: 40,
      systemDesign: 25,
      leadership: 15,
      execution: 10,
      cultureFit: 10,
    });
    setIsCreateModalOpen(true);
    setIsOpen(false);
  };

  const openEditModal = (job: JobProfile) => {
    setEditingJobId(job.id);
    setJobTitle(job.title);
    setDepartment(job.department);
    setLevel(job.level);
    setLocation(job.location);
    setEmploymentType(job.employmentType || 'Full-time');
    setSalaryRange(job.salaryRange);
    setExpMin(job.experienceMin || 3);
    setExpMax(job.experienceMax || 8);
    setDescription(job.description);
    setRequiredSkills(job.requiredSkills || []);
    setPreferredSkills(job.preferredSkills || []);
    setOptionalSkills(job.optionalSkills || []);
    setResponsibilities(job.responsibilities || []);
    setEducationReq(job.educationRequirements || ['B.S. in Computer Science or equivalent']);
    setCustomWeightings(job.weightings || {
      technical: 35,
      systemDesign: 30,
      leadership: 15,
      execution: 10,
      cultureFit: 10,
    });
    setIsCreateModalOpen(true);
    setIsOpen(false);
  };

  const handleAIParseDescription = async () => {
    if (!description.trim()) return;
    setIsParsingAI(true);
    try {
      const res = await authenticatedFetch('/api/jobs/parse-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: jobTitle, description }),
      });
      const data = await res.json();
      if (data.parsed) {
        if (data.parsed.requiredSkills?.length) setRequiredSkills(data.parsed.requiredSkills);
        if (data.parsed.preferredSkills?.length) setPreferredSkills(data.parsed.preferredSkills);
        if (data.parsed.optionalSkills?.length) setOptionalSkills(data.parsed.optionalSkills);
        if (data.parsed.experienceMin) setExpMin(data.parsed.experienceMin);
        if (data.parsed.experienceMax) setExpMax(data.parsed.experienceMax);
        if (data.parsed.responsibilities?.length) setResponsibilities(data.parsed.responsibilities);
        if (data.parsed.educationRequirements?.length) setEducationReq(data.parsed.educationRequirements);
      }
    } catch (err) {
      console.error('Failed to parse job description:', err);
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleSaveJob = async () => {
    if (!jobTitle.trim() || !department.trim()) return;

    const newJobPayload: JobProfile = {
      id: editingJobId || `job-${Date.now()}`,
      title: jobTitle.trim(),
      department: department.trim(),
      level: level.trim(),
      location: location.trim(),
      salaryRange: salaryRange.trim(),
      employmentType,
      experienceMin: expMin,
      experienceMax: expMax,
      description: description.trim(),
      requiredSkills,
      preferredSkills,
      optionalSkills,
      responsibilities,
      educationRequirements: educationReq,
      status: 'open',
      weightings: customWeightings,
    };

    try {
      const res = await authenticatedFetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobPayload),
      });
      const data = await res.json();
      const savedJob = data.job || newJobPayload;

      if (editingJobId) {
        onUpdateJob(savedJob);
      } else {
        if (onJobCreated) onJobCreated(savedJob);
        onSelectJob(savedJob);
      }
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to save job profile:', err);
    }
  };

  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (jobs.length <= 1) {
      alert('You must have at least one job requisition active in the system.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this job profile requisition?')) return;

    try {
      const res = await authenticatedFetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        if (onJobDeleted) onJobDeleted(jobId);
        if (selectedJob.id === jobId) {
          const remaining = jobs.filter(j => j.id !== jobId);
          if (remaining.length > 0) onSelectJob(remaining[0]);
        }
      }
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const addTag = (
    type: 'req' | 'pref' | 'resp', 
    value: string, 
    setValue: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!value.trim()) return;
    if (!list.includes(value.trim())) {
      setList([...list, value.trim()]);
    }
    setValue('');
  };

  const removeTag = (
    index: number,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div className="relative">
      {/* Trigger Bar */}
      <div className="flex items-center gap-2">
        <button
          id="btn-job-dropdown"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
        >
          <div className="p-1 bg-indigo-900/60 text-indigo-400 rounded-lg border border-indigo-700/50">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wider flex items-center gap-1.5">
              <span>Target Role</span>
              <span className="text-[9px] bg-slate-700 text-slate-300 px-1 py-0.2 rounded font-mono">{jobs.length} roles</span>
            </div>
            <div className="truncate max-w-[180px] sm:max-w-[240px] font-bold text-slate-100">{selectedJob?.title || 'Select Requisition'}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>

        <button
          onClick={() => setIsEditingWeightings(!isEditingWeightings)}
          className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
          title="Adjust Competency Weightings"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 z-40 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Job Requisitions ({jobs.length})
            </span>
            <button
              onClick={() => openCreateModal()}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create Role
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 py-1">
            {jobs.map((job) => {
              const isCurrent = job.id === selectedJob.id;
              return (
                <div
                  key={job.id}
                  onClick={() => {
                    onSelectJob(job);
                    setEditedWeightings(job.weightings);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg transition-all cursor-pointer flex items-start justify-between group ${
                    isCurrent ? 'bg-indigo-950/80 border border-indigo-700/60' : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 pr-2">
                    <div className="text-xs font-bold text-slate-200">{job.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{job.department} • {job.level}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="text-indigo-300">{job.salaryRange}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(job);
                      }}
                      className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
                      title="Edit Job Requisition"
                    >
                      <Sliders className="w-3 h-3" />
                    </button>
                    {jobs.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteJob(job.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Job"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    {isCurrent && <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-1" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            {onOpenUniverse && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenUniverse();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explore Role Universe (30+ Cluster Map)</span>
              </button>
            )}
            <button
              onClick={() => openCreateModal()}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-700/50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define New Custom Job Requisition</span>
            </button>
          </div>
        </div>
      )}

      {/* Calibrate Weightings Modal */}
      {isEditingWeightings && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">Calibrate Role Weightings</h3>
                <p className="text-xs text-slate-400">{selectedJob?.title || 'Target Requisition'}</p>
              </div>
              <button onClick={() => setIsEditingWeightings(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Technical Acumen & Coding</span>
                  <span className="font-mono text-indigo-400">{editedWeightings.technical}%</span>
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
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>System Design & Architecture</span>
                  <span className="font-mono text-indigo-400">{editedWeightings.systemDesign}%</span>
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
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Technical Leadership & Mentorship</span>
                  <span className="font-mono text-indigo-400">{editedWeightings.leadership}%</span>
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
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Execution Velocity & SRE</span>
                  <span className="font-mono text-indigo-400">{editedWeightings.execution}%</span>
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
                <div className="flex justify-between font-semibold text-slate-300 mb-1">
                  <span>Culture Add & Cross-Functional</span>
                  <span className="font-mono text-indigo-400">{editedWeightings.cultureFit}%</span>
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

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsEditingWeightings(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWeightings}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> Save Rubric
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Job Creator / Editor Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  {editingJobId ? 'Edit Job Requisition' : 'Create New Job Requisition'}
                </h3>
                <p className="text-xs text-slate-400">
                  Configure structured skills, experience criteria, and automated requirement parsing for any role.
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Bar */}
            {!editingJobId && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Role Archetypes</div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => openCreateModal(role)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        jobTitle === role
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Machine Learning Engineer"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Applied AI & Platform"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Seniority Level</label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="e.g. L5 / Senior"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location & Workplace</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote / San Francisco, CA"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. $200,000 - $260,000 + Equity"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={expMin}
                    onChange={(e) => setExpMin(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max / Ideal Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="35"
                    value={expMax}
                    onChange={(e) => setExpMax(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Job Description & AI Parsing */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">Job Description</label>
                  <button
                    type="button"
                    onClick={handleAIParseDescription}
                    disabled={isParsingAI || !description.trim()}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isParsingAI ? 'Parsing Requirements...' : 'AI Parse Requirements from Description'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste or write the job description here. Click 'AI Parse Requirements' to automatically extract skills, responsibilities, and experience criteria."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                />
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Required Skills (Core Match Criteria - 35% Weighting)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-700/60 rounded-md font-semibold text-[11px]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeTag(idx, requiredSkills, setRequiredSkills)}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag('req', reqInput, setReqInput, requiredSkills, setRequiredSkills);
                      }
                    }}
                    placeholder="Add required skill (e.g. PyTorch, Go, Raft, System Architecture) and press Enter..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('req', reqInput, setReqInput, requiredSkills, setRequiredSkills)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Preferred Skills */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preferred / Secondary Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {preferredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-md font-semibold text-[11px]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeTag(idx, preferredSkills, setPreferredSkills)}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prefInput}
                    onChange={(e) => setPrefInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag('pref', prefInput, setPrefInput, preferredSkills, setPreferredSkills);
                      }
                    }}
                    placeholder="Add preferred skill (e.g. eBPF, Kafka, CUDA) and press Enter..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('pref', prefInput, setPrefInput, preferredSkills, setPreferredSkills)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Core Responsibilities</label>
                <div className="space-y-1.5 mb-2">
                  {responsibilities.map((resp, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span className="flex-1 text-slate-200">{resp}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(idx, responsibilities, setResponsibilities)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={respInput}
                    onChange={(e) => setRespInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag('resp', respInput, setRespInput, responsibilities, setResponsibilities);
                      }
                    }}
                    placeholder="Add core responsibility and press Enter..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => addTag('resp', respInput, setRespInput, responsibilities, setResponsibilities)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveJob}
                disabled={!jobTitle.trim() || !department.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingJobId ? 'Save Requisition Changes' : 'Create & Activate Job Requisition'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
