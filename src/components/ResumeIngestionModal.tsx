import React, { useState } from 'react';
import { JobProfile, Candidate } from '../types';
import { authenticatedFetch } from '../lib/api';
import { 
  Upload, 
  X, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Cpu, 
  Zap, 
  Building2,
  FileCode
} from 'lucide-react';

interface ResumeIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobProfile[];
  selectedJobId: string;
  onCandidateAdded: (newCandidate: Candidate) => void;
}

const SAMPLE_BENCHMARK_RESUMES = [
  {
    title: 'Senior Staff SRE & Cloud Architect',
    snippet: `Alex Rivera
Senior Staff Infrastructure Engineer | San Francisco, CA | a.rivera@infra.dev
Summary: 10+ years architecting zero-downtime distributed systems and multi-tenant Kubernetes fleets across AWS and GCP.
Experience:
- Principal SRE at KubeScale (2020-Present): Scaled 120 EKS clusters to 45,000 pods with 99.995% SLA. Reduced annual cloud compute costs by $2.4M via Karpenter and Spot instance automation.
- Senior Cloud Engineer at CloudVenture (2016-2020): Built Terraform GitOps CI/CD pipelines deploying 600+ microservices daily.
Skills: Kubernetes, Go, Terraform, Prometheus, ArgoCD, Kafka, Linux eBPF, Python.
Education: B.S. in Computer Science, Georgia Tech (2016).`,
  },
  {
    title: 'Lead Foundation Model & LLM Systems Engineer',
    snippet: `Jordan Vance
Lead AI Systems Engineer | New York, NY | jordan.vance@neuralcore.io
Summary: Specialist in large-scale transformer serving architectures, KV-cache quantization, and custom Triton GPU kernels.
Experience:
- Lead Inference Engineer at Synthetix AI (2022-Present): Designed high-throughput vLLM cluster serving 70B parameter models at 140 tok/sec per H100 with continuous batching. Reduced TTFT by 40%.
- Senior ML Engineer at DeepVision Labs (2018-2022): Built distributed PyTorch training clusters across 512 A100 GPUs with DeepSpeed ZeRO-3.
Skills: PyTorch, CUDA, Triton, vLLM, TensorRT-LLM, Ray, Python, C++, Model Distillation.
Education: M.S. in Electrical & Computer Engineering, Carnegie Mellon University (2018).`,
  },
];

export const ResumeIngestionModal: React.FC<ResumeIngestionModalProps> = ({
  isOpen,
  onClose,
  jobs,
  selectedJobId,
  onCandidateAdded,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'text'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [targetJobId, setTargetJobId] = useState<string>(selectedJobId);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [agentProgressStep, setAgentProgressStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectSample = (sample: string) => {
    setResumeText(sample);
    setActiveMode('text');
    setErrorMessage(null);
  };

  const handleFileChange = (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.txt', '.md', '.json'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!hasValidExt) {
      setErrorMessage(`Unsupported format '${file.name}'. Please attach a .pdf, .docx, .txt, or .md file.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File exceeds the 10MB maximum limit.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
  };

  const handleRunAgentPipeline = async () => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setAgentProgressStep('🔍 Initializing Sourcing & Document Parser Agent...');

    try {
      let data: any;

      if (activeMode === 'upload' && selectedFile) {
        // Binary Multi-part Ingestion
        const formData = new FormData();
        formData.append('resumeFile', selectedFile);
        formData.append('jobId', targetJobId);

        const res = await authenticatedFetch('/api/candidates/upload-document', {
          method: 'POST',
          body: formData,
        });

        data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to process document file.');
        }
      } else {
        // Raw Text Pipeline
        if (!resumeText.trim()) {
          throw new Error('Please enter resume text or attach a document file.');
        }

        const res = await authenticatedFetch('/api/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeText,
            jobId: targetJobId,
          }),
        });

        data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Analysis failed.');
        }
      }

      if (data.candidate) {
        onCandidateAdded(data.candidate);
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to parse candidate resume:', err);
      setErrorMessage(err.message || 'An error occurred during resume ingestion.');
    } finally {
      setIsAnalyzing(false);
      setAgentProgressStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="resume-ingestion-modal"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ingest Candidate Resume</h3>
              <p className="text-xs text-slate-500">
                Multi-agent orchestration parses, fact-checks, and calibrates fit instantly
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <span className="font-bold">Error:</span> {errorMessage}
          </div>
        )}

        {/* Target Job Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Calibrate Fit Against Target Role:
          </label>
          <select
            value={targetJobId}
            onChange={(e) => setTargetJobId(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.level}) • {job.department}
              </option>
            ))}
          </select>
        </div>

        {/* Ingestion Mode Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => { setActiveMode('upload'); setErrorMessage(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeMode === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Attach Document (PDF, DOCX, TXT)
          </button>
          <button
            type="button"
            onClick={() => { setActiveMode('text'); setErrorMessage(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeMode === 'text'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Paste Text / Markdown
          </button>
        </div>

        {/* Mode 1: File Upload */}
        {activeMode === 'upload' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileChange(file);
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              id="resume-file-input"
              accept=".pdf,.docx,.txt,.md,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
              className="hidden"
            />
            <label htmlFor="resume-file-input" className="cursor-pointer space-y-2 block">
              <div className="w-10 h-10 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to select or drag & drop candidate resume'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supported formats: PDF, DOCX, TXT, Markdown (Max 10MB)
                </p>
              </div>
              {selectedFile && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-full mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Ready to parse ({Math.round(selectedFile.size / 1024)} KB)
                </div>
              )}
            </label>
          </div>
        )}

        {/* Mode 2: Text / Markdown */}
        {activeMode === 'text' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Resume Content:
              </label>
            </div>
            <textarea
              id="resume-text-input"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste candidate CV, LinkedIn profile export, or resume markdown here..."
              rows={7}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>
        )}

        {/* Quick Sample Presets */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Or Load Benchmark Profiles:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_BENCHMARK_RESUMES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample.snippet)}
                className="text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Agent Ingestion Progress Bar if active */}
        {isAnalyzing && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600 animate-spin" />
                {agentProgressStep}
              </span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-trigger-agent-analysis"
            type="button"
            onClick={handleRunAgentPipeline}
            disabled={isAnalyzing || (activeMode === 'upload' ? !selectedFile : !resumeText.trim())}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isAnalyzing ? 'Orchestrating Agents...' : 'Run Autonomous Multi-Agent Analysis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
