import React, { useState, useRef, useEffect, useMemo } from 'react';
import { JobProfile, Candidate } from '../types';
import { 
  Briefcase, 
  Search, 
  X, 
  Sliders, 
  Filter, 
  Sparkles, 
  Users, 
  DollarSign, 
  MapPin, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Compass
} from 'lucide-react';

export interface UniverseRoleNode {
  id: string;
  title: string;
  cluster: 'AI & Data' | 'Software Engineering' | 'Cloud & DevOps' | 'Cybersecurity' | 'Product & Leadership' | 'Business & Analytics' | 'Design & QA';
  department: string;
  level: string;
  salaryRange: string;
  requiredSkills: string[];
  matchedCandidatesCount: number;
  color: string;
  glowColor: string;
  x: number;
  y: number;
  radius: number;
}

// 30+ Comprehensive Roles Data for Role Universe
export const ALL_UNIVERSE_ROLES: UniverseRoleNode[] = [
  // 1. AI & Data Cluster
  {
    id: 'job-2',
    title: 'Lead AI/ML Research & Inference Engineer',
    cluster: 'AI & Data',
    department: 'Applied AI & Foundation Models',
    level: 'L6 / Lead',
    salaryRange: '$230,000 - $290,000 + Equity',
    requiredSkills: ['Python', 'PyTorch', 'vLLM', 'CUDA', 'RAG / Vector DBs', 'Transformer Architectures'],
    matchedCandidatesCount: 3,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 0.28,
    y: 0.25,
    radius: 26,
  },
  {
    id: 'job-ai-arch',
    title: 'Principal AI Systems Architect',
    cluster: 'AI & Data',
    department: 'Applied AI & Foundation Models',
    level: 'L7 / Principal',
    salaryRange: '$250,000 - $320,000 + Equity',
    requiredSkills: ['Large Model Inference', 'Distributed Training', 'TensorRT', 'GPU Cluster Mgmt'],
    matchedCandidatesCount: 2,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 0.35,
    y: 0.20,
    radius: 24,
  },
  {
    id: 'job-rag-eng',
    title: 'Principal LLM & RAG Engineer',
    cluster: 'AI & Data',
    department: 'Applied AI & Foundation Models',
    level: 'L6 / Staff',
    salaryRange: '$210,000 - $265,000 + Equity',
    requiredSkills: ['LangGraph', 'Qdrant', 'Milvus', 'Chunking Strategies', 'Hybrid Search', 'DSPy'],
    matchedCandidatesCount: 4,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 0.22,
    y: 0.32,
    radius: 22,
  },
  {
    id: 'job-data-sci',
    title: 'Lead Data Scientist',
    cluster: 'AI & Data',
    department: 'Applied AI & Foundation Models',
    level: 'L5 / Lead',
    salaryRange: '$190,000 - $245,000 + Equity',
    requiredSkills: ['Python', 'SQL', 'Predictive Modeling', 'Bayesian Inference', 'Causal Inference'],
    matchedCandidatesCount: 3,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 0.33,
    y: 0.35,
    radius: 20,
  },
  {
    id: 'job-mlops',
    title: 'MLOps Platform Engineer',
    cluster: 'AI & Data',
    department: 'Applied AI & Foundation Models',
    level: 'L5 / Senior',
    salaryRange: '$195,000 - $250,000 + Equity',
    requiredSkills: ['Kubeflow', 'MLflow', 'Triton Server', 'Model Observability', 'Feast Feature Store'],
    matchedCandidatesCount: 2,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 0.38,
    y: 0.28,
    radius: 21,
  },
  {
    id: 'job-nlp-res',
    title: 'NLP Research Engineer',
    cluster: 'AI & Data',
    department: 'Applied AI & Foundation Models',
    level: 'L6 / Senior',
    salaryRange: '$220,000 - $280,000 + Equity',
    requiredSkills: ['Tokenization', 'Attention Mechanisms', 'Synthetic Data Gen', 'Evaluation Harnesses'],
    matchedCandidatesCount: 2,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    x: 0.26,
    y: 0.18,
    radius: 20,
  },

  // 2. Software Engineering Cluster
  {
    id: 'job-1',
    title: 'Staff Distributed Systems Engineer',
    cluster: 'Software Engineering',
    department: 'Infrastructure & Core Platform',
    level: 'L6 / Staff',
    salaryRange: '$220,000 - $275,000 + Equity',
    requiredSkills: ['Go', 'Rust', 'Kubernetes', 'Distributed Systems', 'Kafka', 'Raft Consensus', 'gRPC'],
    matchedCandidatesCount: 5,
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    x: 0.65,
    y: 0.26,
    radius: 28,
  },
  {
    id: 'job-be-arch',
    title: 'Principal Backend Architect',
    cluster: 'Software Engineering',
    department: 'Infrastructure & Core Platform',
    level: 'L7 / Principal',
    salaryRange: '$240,000 - $310,000 + Equity',
    requiredSkills: ['Microservices', 'PostgreSQL', 'High Throughput', 'CQRS', 'Event Sourcing'],
    matchedCandidatesCount: 4,
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    x: 0.72,
    y: 0.20,
    radius: 24,
  },
  {
    id: 'job-fs-lead',
    title: 'Lead Full Stack Engineer',
    cluster: 'Software Engineering',
    department: 'Core Product Engineering',
    level: 'L5 / Lead',
    salaryRange: '$190,000 - $240,000 + Equity',
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'GraphQL', 'Tailwind', 'Next.js'],
    matchedCandidatesCount: 6,
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    x: 0.58,
    y: 0.32,
    radius: 23,
  },
  {
    id: 'job-fe-arch',
    title: 'Senior Frontend Architect',
    cluster: 'Software Engineering',
    department: 'Core Product Engineering',
    level: 'L6 / Staff',
    salaryRange: '$200,000 - $255,000 + Equity',
    requiredSkills: ['React Core', 'Web Performance', 'Micro-frontends', 'State Architecture', 'WASM'],
    matchedCandidatesCount: 3,
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    x: 0.54,
    y: 0.22,
    radius: 21,
  },
  {
    id: 'job-rust-sys',
    title: 'Systems Programming Engineer (Rust/C++)',
    cluster: 'Software Engineering',
    department: 'Infrastructure & Core Platform',
    level: 'L5 / Senior',
    salaryRange: '$205,000 - $265,000 + Equity',
    requiredSkills: ['Rust', 'C++', 'Memory Management', 'SIMD', 'Lockless Data Structures'],
    matchedCandidatesCount: 2,
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    x: 0.74,
    y: 0.34,
    radius: 20,
  },
  {
    id: 'job-mobile-core',
    title: 'Mobile Core Architect (iOS/Android)',
    cluster: 'Software Engineering',
    department: 'Core Product Engineering',
    level: 'L6 / Staff',
    salaryRange: '$210,000 - $260,000 + Equity',
    requiredSkills: ['Swift', 'Kotlin', 'React Native', 'Offline-first Sync', 'Mobile Security'],
    matchedCandidatesCount: 2,
    color: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    x: 0.62,
    y: 0.38,
    radius: 19,
  },

  // 3. Cloud & DevOps Cluster
  {
    id: 'job-cloud-arch',
    title: 'Cloud Infrastructure Architect',
    cluster: 'Cloud & DevOps',
    department: 'DevOps & SRE',
    level: 'L6 / Staff',
    salaryRange: '$215,000 - $270,000 + Equity',
    requiredSkills: ['AWS/GCP/Azure', 'Terraform', 'Multi-region VPCs', 'Cost Optimization', 'Zero-trust Network'],
    matchedCandidatesCount: 3,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    x: 0.78,
    y: 0.58,
    radius: 24,
  },
  {
    id: 'job-sre-lead',
    title: 'Principal Site Reliability Engineer (SRE)',
    cluster: 'Cloud & DevOps',
    department: 'DevOps & SRE',
    level: 'L6 / Principal',
    salaryRange: '$220,000 - $280,000 + Equity',
    requiredSkills: ['SLO/SLA Management', 'Chaos Engineering', 'Observability (Prometheus/Datadog)', 'Incident Response'],
    matchedCandidatesCount: 3,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    x: 0.85,
    y: 0.52,
    radius: 23,
  },
  {
    id: 'job-k8s-eng',
    title: 'Kubernetes Platform Engineer',
    cluster: 'Cloud & DevOps',
    department: 'DevOps & SRE',
    level: 'L5 / Senior',
    salaryRange: '$195,000 - $250,000 + Equity',
    requiredSkills: ['Kubernetes Operators', 'Helm', 'ArgoCD / GitOps', 'Service Mesh (Istio)', 'Cilium'],
    matchedCandidatesCount: 4,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    x: 0.82,
    y: 0.66,
    radius: 22,
  },
  {
    id: 'job-devsecops',
    title: 'DevSecOps Architect',
    cluster: 'Cloud & DevOps',
    department: 'DevOps & SRE',
    level: 'L6 / Staff',
    salaryRange: '$210,000 - $265,000 + Equity',
    requiredSkills: ['CI/CD Security', 'SAST/DAST', 'Container Image Hardening', 'Policy as Code (OPA)'],
    matchedCandidatesCount: 2,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    x: 0.72,
    y: 0.68,
    radius: 20,
  },

  // 4. Cybersecurity Cluster
  {
    id: 'job-cyber-lead',
    title: 'Principal Cybersecurity Engineer',
    cluster: 'Cybersecurity',
    department: 'Information Security & Trust',
    level: 'L6 / Principal',
    salaryRange: '$225,000 - $285,000 + Equity',
    requiredSkills: ['Threat Modeling', 'Zero Trust', 'SOC2 / ISO 27001', 'Cryptography', 'SIEM & Detection'],
    matchedCandidatesCount: 3,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    x: 0.48,
    y: 0.72,
    radius: 24,
  },
  {
    id: 'job-appsec',
    title: 'Application Security Architect',
    cluster: 'Cybersecurity',
    department: 'Information Security & Trust',
    level: 'L5 / Senior',
    salaryRange: '$200,000 - $255,000 + Equity',
    requiredSkills: ['OWASP Top 10', 'Penetration Testing', 'Code Auditing', 'OAuth2/OIDC Protocols'],
    matchedCandidatesCount: 2,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    x: 0.40,
    y: 0.78,
    radius: 21,
  },
  {
    id: 'job-crypto-eng',
    title: 'Cryptographic Systems Lead',
    cluster: 'Cybersecurity',
    department: 'Information Security & Trust',
    level: 'L6 / Staff',
    salaryRange: '$230,000 - $290,000 + Equity',
    requiredSkills: ['KMS', 'Post-Quantum Cryptography', 'TLS/mTLS', 'Hardware Security Modules'],
    matchedCandidatesCount: 1,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    x: 0.55,
    y: 0.82,
    radius: 20,
  },

  // 5. Product & Leadership Cluster
  {
    id: 'job-3',
    title: 'Principal Product Manager - Enterprise Platform',
    cluster: 'Product & Leadership',
    department: 'Product Management',
    level: 'L7 / Principal',
    salaryRange: '$210,000 - $260,000 + Equity',
    requiredSkills: ['Enterprise SaaS Roadmap', 'Product Discovery', 'Metrics & Telemetry', 'API Product Design'],
    matchedCandidatesCount: 4,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    x: 0.20,
    y: 0.62,
    radius: 25,
  },
  {
    id: 'job-vpe',
    title: 'VP of Engineering',
    cluster: 'Product & Leadership',
    department: 'Executive Leadership',
    level: 'L8 / Executive',
    salaryRange: '$280,000 - $380,000 + Equity',
    requiredSkills: ['Org Scaling (100+)', 'Engineering Culture', 'Budget & Headcount', 'Executive Communication'],
    matchedCandidatesCount: 2,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    x: 0.12,
    y: 0.55,
    radius: 27,
  },
  {
    id: 'job-tpm-dir',
    title: 'Technical Program Director',
    cluster: 'Product & Leadership',
    department: 'Product Management',
    level: 'L7 / Director',
    salaryRange: '$220,000 - $275,000 + Equity',
    requiredSkills: ['Cross-functional Execution', 'Risk Mitigation', 'Agile Governance', 'Release Management'],
    matchedCandidatesCount: 2,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    x: 0.16,
    y: 0.72,
    radius: 21,
  },

  // 6. Business & Analytics Cluster
  {
    id: 'job-quant-lead',
    title: 'Lead Quantitative Analyst',
    cluster: 'Business & Analytics',
    department: 'Quantitative Analytics & Strategy',
    level: 'L5 / Lead',
    salaryRange: '$200,000 - $260,000 + Equity',
    requiredSkills: ['Time Series Analysis', 'Python/R', 'Econometrics', 'Risk Modeling', 'Stochastic Calculus'],
    matchedCandidatesCount: 2,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    x: 0.32,
    y: 0.54,
    radius: 22,
  },
  {
    id: 'job-bi-arch',
    title: 'Business Intelligence Architect',
    cluster: 'Business & Analytics',
    department: 'Quantitative Analytics & Strategy',
    level: 'L5 / Senior',
    salaryRange: '$180,000 - $230,000 + Equity',
    requiredSkills: ['Snowflake / BigQuery', 'dbt', 'Looker / Tableau', 'Data Warehousing', 'Data Governance'],
    matchedCandidatesCount: 3,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    x: 0.38,
    y: 0.46,
    radius: 21,
  },
  {
    id: 'job-talent-lead',
    title: 'Head of Talent Intelligence',
    cluster: 'Business & Analytics',
    department: 'Human Resources & People Ops',
    level: 'L7 / Director',
    salaryRange: '$210,000 - $265,000 + Equity',
    requiredSkills: ['Talent Analytics', 'Workforce Planning', 'Bias Auditing', 'ATS Ecosystems', 'Executive Recruiting'],
    matchedCandidatesCount: 3,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    x: 0.28,
    y: 0.44,
    radius: 23,
  },

  // 7. Design & Quality Cluster
  {
    id: 'job-ux-lead',
    title: 'Principal UX/UI Designer',
    cluster: 'Design & QA',
    department: 'Product Design & Research',
    level: 'L6 / Principal',
    salaryRange: '$195,000 - $250,000 + Equity',
    requiredSkills: ['Design Systems', 'Figma', 'User Research', 'Prototyping', 'Accessibility (WCAG AAA)'],
    matchedCandidatesCount: 3,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    x: 0.88,
    y: 0.32,
    radius: 23,
  },
  {
    id: 'job-design-sys',
    title: 'Design Systems Architect',
    cluster: 'Design & QA',
    department: 'Product Design & Research',
    level: 'L5 / Staff',
    salaryRange: '$185,000 - $240,000 + Equity',
    requiredSkills: ['Token Design', 'React / CSS Architecture', 'Storybook', 'Component Governance'],
    matchedCandidatesCount: 2,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    x: 0.86,
    y: 0.20,
    radius: 20,
  },
  {
    id: 'job-qa-arch',
    title: 'Staff QA Automation Architect',
    cluster: 'Design & QA',
    department: 'Quality Engineering',
    level: 'L5 / Staff',
    salaryRange: '$180,000 - $235,000 + Equity',
    requiredSkills: ['Playwright', 'Cypress', 'Load Testing (k6)', 'Contract Testing (Pact)', 'CI Pipelines'],
    matchedCandidatesCount: 3,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    x: 0.92,
    y: 0.44,
    radius: 21,
  },
];

const CLUSTER_CONFIG = [
  { name: 'All Clusters', color: '#94a3b8' },
  { name: 'AI & Data', color: '#06b6d4' },
  { name: 'Software Engineering', color: '#6366f1' },
  { name: 'Cloud & DevOps', color: '#38bdf8' },
  { name: 'Cybersecurity', color: '#ef4444' },
  { name: 'Product & Leadership', color: '#10b981' },
  { name: 'Business & Analytics', color: '#f59e0b' },
  { name: 'Design & QA', color: '#ec4899' },
];

interface RoleUniverseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob?: JobProfile | null;
  onSelectRole?: (role: JobProfile) => void;
  onSelectJob?: (role: JobProfile) => void;
  candidates?: Candidate[];
  jobs?: JobProfile[];
  onSelectCandidate?: (candidateId: string) => void;
}

export const RoleUniverseModal: React.FC<RoleUniverseModalProps> = ({
  isOpen,
  onClose,
  selectedJob,
  onSelectRole,
  onSelectJob,
  candidates = [],
  jobs = [],
  onSelectCandidate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCluster, setSelectedCluster] = useState<string>('All Clusters');
  const [activeNode, setActiveNode] = useState<UniverseRoleNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<UniverseRoleNode | null>(null);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return ALL_UNIVERSE_ROLES.filter((role) => {
      const matchCluster = selectedCluster === 'All Clusters' || role.cluster === selectedCluster;
      const matchSearch =
        role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCluster && matchSearch;
    });
  }, [searchTerm, selectedCluster]);

  // Set default active node safely
  useEffect(() => {
    if (selectedJob?.title) {
      const match = ALL_UNIVERSE_ROLES.find((r) => r.title.toLowerCase() === selectedJob.title.toLowerCase());
      setActiveNode(match || ALL_UNIVERSE_ROLES[0]);
    } else {
      setActiveNode(ALL_UNIVERSE_ROLES[0]);
    }
  }, [selectedJob]);

  // Canvas Interactive Visualizer
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    const handleResize = () => {
      if (!container) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Background Ambient Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Cluster Inter-Links
      ALL_UNIVERSE_ROLES.forEach((r1, idx1) => {
        ALL_UNIVERSE_ROLES.forEach((r2, idx2) => {
          if (idx2 > idx1 && r1.cluster === r2.cluster) {
            const x1 = r1.x * width;
            const y1 = r1.y * height;
            const x2 = r2.x * width;
            const y2 = r2.y * height;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = r1.glowColor.replace('0.4', '0.12');
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Draw Role Nodes
      ALL_UNIVERSE_ROLES.forEach((role) => {
        const isMatched = filteredRoles.some((fr) => fr.id === role.id);
        const isSelected = activeNode?.id === role.id;
        const isHovered = hoveredNode?.id === role.id;

        const x = role.x * width;
        const y = role.y * height;
        const radius = isSelected ? role.radius + 6 : isHovered ? role.radius + 3 : role.radius;

        ctx.save();
        if (!isMatched) {
          ctx.globalAlpha = 0.2;
        }

        // Pulse Ring for Active Node
        if (isSelected) {
          const pulse = Math.sin(time * 3) * 6 + 8;
          ctx.beginPath();
          ctx.arc(x, y, radius + pulse, 0, Math.PI * 2);
          ctx.strokeStyle = role.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node Glow Halo
        const glowGrad = ctx.createRadialGradient(x, y, radius * 0.4, x, y, radius * 1.8);
        glowGrad.addColorStop(0, role.glowColor);
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Node Solid Body
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeStyle = role.color;
        ctx.stroke();

        // Node Label in Node
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${Math.max(9, Math.floor(radius * 0.42))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Split title into 2 short words
        const words = role.title.split(' ');
        if (words.length >= 2) {
          ctx.fillText(words[0], x, y - 5);
          ctx.fillText(words[1], x, y + 7);
        } else {
          ctx.fillText(role.title.substring(0, 8), x, y);
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isOpen, filteredRoles, activeNode, hoveredNode]);

  if (!isOpen) return null;

  const handleSelectUniverseNode = (roleNode: UniverseRoleNode) => {
    setActiveNode(roleNode);
  };

  const handleApplyRoleToPlatform = () => {
    if (!activeNode) return;
    const existingJob = jobs?.find(
      (j) => j.title.toLowerCase() === activeNode.title.toLowerCase() || j.id === activeNode.id
    );
    const convertedJob: JobProfile = existingJob || {
      id: activeNode.id,
      title: activeNode.title,
      department: activeNode.department,
      level: activeNode.level,
      location: 'San Francisco, CA / Hybrid',
      salaryRange: activeNode.salaryRange,
      description: `Target requisition for ${activeNode.title} across ${activeNode.department}. Focus on scalable systems, engineering execution, and factual candidate grounding.`,
      requiredSkills: activeNode.requiredSkills,
      preferredSkills: ['High Performance Systems', 'Mentorship', 'Cloud Architecture'],
      weightings: {
        technical: 35,
        systemDesign: 25,
        leadership: 20,
        execution: 10,
        cultureFit: 10,
      },
    };
    if (onSelectRole) onSelectRole(convertedJob);
    if (onSelectJob) onSelectJob(convertedJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header Strip */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950 text-cyan-400 border border-indigo-800/80 shadow-inner">
              <Compass className="w-6 h-6 animate-[spin_40s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">Role Universe & Requisition Topology</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {ALL_UNIVERSE_ROLES.length} Enterprise Roles
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive cluster map connecting skills, compensation, and active candidate pipelines across the enterprise.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-950/60 border-b border-slate-800/80 px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 30+ roles, skills, depts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.8 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Cluster Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
            {CLUSTER_CONFIG.map((cluster) => {
              const isSelected = selectedCluster === cluster.name;
              return (
                <button
                  key={cluster.name}
                  onClick={() => setSelectedCluster(cluster.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cluster.color }} />
                  <span>{cluster.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interactive Stage */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
          {/* Canvas Topology Viewer (Left/Center Column) */}
          <div
            ref={containerRef}
            className="lg:col-span-8 bg-slate-950 relative h-full flex items-center justify-center overflow-hidden border-r border-slate-800"
          >
            <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />

            {/* Quick Helper Overlay */}
            <div className="absolute top-3 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-400">
              <span>Click any role to inspect requirements & pipeline</span>
            </div>

            {/* Floating Role Node Chips Strip on Mobile/Bottom */}
            <div className="absolute bottom-3 left-4 right-4 flex gap-2 overflow-x-auto p-1 pointer-events-auto bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 lg:hidden">
              {filteredRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveNode(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border shrink-0 ${
                    activeNode?.id === role.id
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  {role.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Selected Role Inspector Panel */}
          <div className="lg:col-span-4 bg-slate-900/95 overflow-y-auto p-6 flex flex-col justify-between space-y-6">
            {activeNode ? (
              <div className="space-y-5">
                {/* Role Header Card */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: `${activeNode.color}33`, borderColor: activeNode.color, borderWidth: 1 }}
                    >
                      {activeNode.cluster}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{activeNode.level}</span>
                  </div>

                  <h3 className="text-xl font-black text-white tracking-tight">{activeNode.title}</h3>
                  <p className="text-xs text-slate-400">{activeNode.department}</p>
                </div>

                {/* Compensation & Level Specs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Compensation</span>
                    </div>
                    <p className="text-xs font-bold text-slate-100 font-mono">{activeNode.salaryRange}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>In Pipeline</span>
                    </div>
                    <p className="text-xs font-bold text-cyan-300 font-mono">
                      {candidates.length} Matched Dossiers
                    </p>
                  </div>
                </div>

                {/* Required Skills & Competencies */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    Key Core Skill Requirements
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeNode.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-950 text-slate-200 border border-slate-800 flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeNode.color }} />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Candidate Quick Look Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Top Matched Candidates In Platform
                  </h4>
                  <div className="space-y-2">
                    {candidates.slice(0, 3).map((cand) => (
                      <div
                        key={cand.id}
                        className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={cand.avatarUrl}
                            alt={cand.name}
                            className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-white leading-tight">{cand.name}</p>
                            <p className="text-[10px] text-slate-400">{cand.currentRole}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 text-[11px]">
                          {cand.overallFitScore}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <Compass className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">Select any role node from the universe to view details.</p>
              </div>
            )}

            {/* Bottom Apply Action Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={handleApplyRoleToPlatform}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Set Active Requisition & Evaluate Candidates</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
