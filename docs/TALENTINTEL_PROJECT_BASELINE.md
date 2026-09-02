# 🧠 TALENTINTEL — COMPLETE PROJECT BASELINE & SYSTEM SPECIFICATION

> **Authoritative Baseline Document**  
> **Repository:** `upputurirajkumar/candidate-intelligence---hr-decision-platform`  
> **Status:** Audited & Verified Single Source of Truth  
> **Timestamp:** 2026-09-01T21:12:00-07:00  

---

## 1. EXECUTIVE SUMMARY

**TalentIntel** is a production-grade Candidate Intelligence & HR Decision-Support Platform engineered in TypeScript (React 19 + Express + Vite + Tailwind CSS) with full-stack multi-agent AI orchestration, multi-tenant isolated vector retrieval (RAG), evidence integrity verification, live voice copilot, and human-in-the-loop decision governance.

The platform ingests multi-source candidate signals (resumes in PDF/DOCX/TXT/MD, GitHub repos, LinkedIn profiles, portfolio sites, official certification registries, and live interview transcripts). It evaluates candidates against configurable enterprise job requisition profiles using explainable matching formulas, detects timeline gaps and dual-employment anomalies, neutralizes prompt injection attacks, and provides recruiters and hiring committees with grounded evidence ledgers and interactive 3D visualizations.

---

## 2. HIGH-LEVEL ARCHITECTURE MAP

```text
TalentIntel Enterprise Platform
│
├── Frontend (React 19 + Vite 6 + Tailwind CSS 4 + Motion + Recharts + Three.js)
│   ├── Navigation & App Shell (GlobalNavbar, Sticky Sub-Banners, Breadcrumbs, Dark Theme)
│   ├── Pages (LandingPage, HowItWorksPage, HRWorkspacePage, CandidateWorkspacePage)
│   ├── Interactive Modals (CandidateIntakeModal, ResumeIngestionModal, RoleUniverseModal, AIProcessingPipelineModal, AuthModal)
│   ├── AI Copilot Drawer (HRCopilotDrawer with Dual Text RAG & WebSocket Live Audio Streaming)
│   ├── Decision & Analysis Views (LeaderboardView, ComparisonMatrixView, EvidenceVerificationPanel, InterviewIntelligenceView, EntityGraphView, AnalyticsReportsView, CareerTimelineVisualizer)
│   └── 3D Visualizers (Hero3DCanvas, InteractiveFlow3DCanvas)
│
├── Backend (Node.js 22 + Express 4 + TypeScript via tsx / esbuild)
│   ├── Server Entry & Vite SPA Fallback (server.ts)
│   ├── REST API Routing (/server/routes/api.ts)
│   ├── Security Middleware (/server/middleware/auth.ts, /server/middleware/rateLimit.ts)
│   ├── Analysis & Scoring Engine (/server/services/analysisEngine.ts)
│   ├── Evidence & Integrity Risk Engine (/server/services/integrityEngine.ts)
│   ├── Multi-Tenant RAG Store & Prompt Defense (/server/services/ragEngine.ts)
│   ├── Document Parser & Binary Sandbox (/server/services/documentParser.ts)
│   ├── SSRF-Safe URL Validator (/server/services/urlValidator.ts)
│   ├── Live Gemini Voice WebSocket Service (/server/services/liveVoiceService.ts)
│   └── Server-Side Gemini Generative AI SDK Client (/server/gemini.ts)
│
├── Persistence & Database Layer
│   ├── Primary Tenant Store: In-memory atomic JSON filesystem persistence (/server/db/index.ts -> /.data/db.json)
│   ├── Password Security: Cryptographic scrypt hashing with 16-byte random salts + constant-time comparison
│   ├── Session Management: Bearer tokens with server-side revocation registry & multi-tenant org scoping
│   └── Cloud Database: Firebase Firestore integration configured via /firebase-applet-config.json & /firestore.rules
│
├── AI & RAG Pipeline
│   ├── Foundation Model: Gemini 2.5 Flash / Gemini 2.5 Pro via @google/genai TypeScript SDK
│   ├── Multi-Agent Reasoning Pipeline: 6 Specialized Agent Personas (Synthesizer, Matcher, Evidence Auditor, Integrity Agent, Question Generator, Bias Auditor)
│   ├── RAG Vector Store: In-memory TF-IDF + Cosine similarity vector store isolated strictly by `orgId:candidateId`
│   └── Prompt Injection Defense: Regex & AST boundary sanitization with `<!-- BEGIN UNTRUSTED DATA -->` encapsulation
│
└── Testing & Quality Assurance
    └── Comprehensive Test Suite (/server/tests/runTests.ts) — 110/110 tests passing across 9 test suites
```

---

## 3. FEATURE INVENTORY & IMPLEMENTATION STATUS

| Category | Feature Name | Status | Description & Layer Implementation |
| :--- | :--- | :--- | :--- |
| **Candidate Intelligence** | Resume Ingestion (PDF, DOCX, TXT, MD) | **FULLY IMPLEMENTED** | Multer memory upload + pdf-parse/mammoth parser + size limits (10MB) + executable format filter. |
| **Candidate Intelligence** | Candidate Profile & Dossier | **FULLY IMPLEMENTED** | Rich UI + persistent DB + competency radar charts + experience timeline + education verification. |
| **Candidate Intelligence** | Explainable Fit Scoring | **FULLY IMPLEMENTED** | Deterministic weighted formula: Required Skills (40%) + Preferred Skills (15%) + Experience (20%) + Evidence Strength (15%) + Leadership/Architecture (10%). |
| **Candidate Intelligence** | Semantic Skill Ontology Matching | **FULLY IMPLEMENTED** | 80+ domain skill clusters with synonyms & related tools (e.g., PyTorch ↔ Deep Learning, Go ↔ Concurrency). |
| **Candidate Intelligence** | Dynamic Requisition Leaderboard | **FULLY IMPLEMENTED** | Real-time candidate ranking against active job requisition with sorting, filtering, and stage badges. |
| **Candidate Intelligence** | Side-by-Side Comparison Matrix | **FULLY IMPLEMENTED** | Compares 2 to 4 candidates across competencies, required skill coverage, experience fit, and evidence rating with automated winner badges. |
| **Candidate Intelligence** | Multi-Source Candidate Intake Wizard | **FULLY IMPLEMENTED** | Intake modal supporting simultaneous resume text, GitHub URLs, LinkedIn URLs, portfolio links, and certifications. |
| **Candidate Intelligence** | Duplicate Candidate Detection | **FULLY IMPLEMENTED** | Fuzzy normalized name & email matching across organization records with duplicate warning banners. |
| **Evidence Intelligence** | Structured Claim Extraction | **FULLY IMPLEMENTED** | Extracts employment periods, metric achievements, degrees, skills, and certifications into `DetailedClaim` records. |
| **Evidence Intelligence** | Evidence Records & Provenance | **FULLY IMPLEMENTED** | Maps claims to specific citations, line references, document IDs, commit SHAs, and verification registries. |
| **Evidence Intelligence** | Source Trust Model & Attributions | **FULLY IMPLEMENTED** | 5 Trust Levels: Candidate-reported, Publicly observable, Potentially verified, External self-reported, Third-party verified. |
| **Evidence Intelligence** | Interactive Entity Knowledge Graph | **FULLY IMPLEMENTED** | SVG force/topological node graph connecting candidates, companies, skills, projects, degrees, and verified links. |
| **Evidence Intelligence** | External Source Verification Endpoint | **FULLY IMPLEMENTED** | Validates external GitHub, LinkedIn, and portfolio URLs with SSRF protection and status tracking. |
| **Integrity Intelligence** | Career Timeline Gap Detection | **FULLY IMPLEMENTED** | Identifies unmentioned employment gaps (>3 months) with sabbatical/consulting clarification prompts. |
| **Integrity Intelligence** | Dual-Employment Overlap Anomaly | **FULLY IMPLEMENTED** | Flags overlapping full-time engagements without labeling as fraud (objective inconsistency framing). |
| **Integrity Intelligence** | Cross-Source Consistency Auditor | **FULLY IMPLEMENTED** | Cross-references resume claims against public GitHub repos, LinkedIn profiles, and credential registries. |
| **Integrity Intelligence** | Rule-Based Integrity Risk Scoring | **FULLY IMPLEMENTED** | Evaluates risk as Low/Medium/High based on observable evidence vs self-reported discrepancies. |
| **AI Intelligence** | Multi-Agent Analysis Pipeline | **FULLY IMPLEMENTED** | 6-agent sequential reasoning chain with execution time, token telemetry, and findings ledger. |
| **AI Intelligence** | Multi-Tenant Isolated RAG Engine | **FULLY IMPLEMENTED** | Cosine similarity + keyword hybrid search strictly partitioned by `orgId:candidateId` with zero cross-tenant leakage. |
| **AI Intelligence** | HR Decision Copilot (Text Mode) | **FULLY IMPLEMENTED** | Grounded question-answering with inline dossier citations, prompt chips, and conversation history. |
| **AI Intelligence** | Live Voice Copilot (WebSocket Audio) | **FULLY IMPLEMENTED** | 16kHz PCM microphone capture + WebSocket backend streaming + Gemini Live API + 24kHz audio playback. |
| **AI Intelligence** | Prompt Injection Defense | **FULLY IMPLEMENTED** | Detects instruction overrides, strips script/system tags, and encapsulates untrusted text in boundary blocks. |
| **Interview Intelligence** | Structured Interview Feedback Ledger | **FULLY IMPLEMENTED** | Multi-stage rubrics (Initial Screen, Technical Deep-Dive, System Architecture, Committee) with recommendations. |
| **Interview Intelligence** | AI-Generated Probing Questions | **FULLY IMPLEMENTED** | Context-specific interview questions with evaluation rubrics for poor, good, and exceptional responses. |
| **Interview Intelligence** | Interview Feedback Synthesis | **FULLY IMPLEMENTED** | Aggregates interviewer feedback, identifies repeated concerns, and recommends next-round focus areas. |
| **HR Decision System** | Human-in-the-Loop Claim Verification | **FULLY IMPLEMENTED** | Allows recruiters/managers to manually verify, flag, or adjust claim confidence scores with audit tracking. |
| **HR Decision System** | Pipeline Stage Transitions | **FULLY IMPLEMENTED** | Manages stage transitions (New → Screening → Shortlisted → Interview → Technical → Offer → Hired/Rejected) with history logs. |
| **HR Decision System** | Bulk Stage & Archive Actions | **FULLY IMPLEMENTED** | Batch status updates and archiving across multiple candidates simultaneously. |
| **HR Decision System** | Secure Data Export | **FULLY IMPLEMENTED** | Exports candidate dossiers in JSON, CSV, and Markdown formats with audit trail generation. |
| **Enterprise & Governance** | Multi-Tenant Data Isolation | **FULLY IMPLEMENTED** | Complete organization-level data boundary enforcement across DB, RAG chunks, jobs, and candidate records. |
| **Enterprise & Governance** | Role-Based Access Control (RBAC) | **FULLY IMPLEMENTED** | 5 User Roles: Admin, HR, Recruiter, Hiring Manager, Interviewer with endpoint enforcement. |
| **Enterprise & Governance** | Cryptographic Audit Logging | **FULLY IMPLEMENTED** | Records immutable audit logs for all administrative actions, logins, exports, claim adjustments, and pipeline moves. |
| **Enterprise & Governance** | Pipeline Analytics & BI Reports | **FULLY IMPLEMENTED** | Funnel conversion analytics, source distribution, verification breakdowns, and in-demand skill tracking. |
| **Enterprise & Governance** | 30+ Role Universe Topology | **FULLY IMPLEMENTED** | Interactive 2D/3D visual explorer across 7 career clusters (AI & Data, Software Eng, Cloud/DevOps, Cybersecurity, Product, Business, Design). |

---

## 4. UI / UX INVENTORY & INTERACTION ARCHITECTURE

### Primary Navigation & Pages
1. **GlobalNavbar (`/src/components/navigation/GlobalNavbar.tsx`)**:
   - Fixed top banner (`z-30`) with role pill, quick tenant indicator, 3D Role Universe button, HR Copilot toggle, and user profile/auth menu.
2. **LandingPage (`/src/pages/LandingPage.tsx`)**:
   - High-contrast dark theme showcase with 3D canvas hero, core value pillars, live metrics ticker, and interactive workflow demo.
3. **HowItWorksPage (`/src/pages/HowItWorksPage.tsx`)**:
   - Deep-dive architectural walkthrough detailing the 6-agent pipeline, trust verification model, and RAG retrieval mechanisms.
4. **HRWorkspacePage (`/src/pages/HRWorkspacePage.tsx`)**:
   - Master command center with 8 sub-views: `Leaderboard`, `Candidate Dossiers`, `Comparison Matrix`, `Interview Intelligence`, `Evidence Verification`, `Pipeline Analytics`, `Job Profiles`, and `Entity Graph`.
   - Sticky job profile requisition selector and quick candidate intake buttons.
5. **CandidateWorkspacePage (`/src/pages/CandidateWorkspacePage.tsx`)**:
   - Dedicated candidate inspection console with breadcrumb switcher, previous/next candidate cycler, and 6 deep-dive tabs (`Overview`, `Sources`, `Evidence`, `Agents`, `Interviews`, `Graph`).

### Modals & Drawers
1. **`HRCopilotDrawer` (`z-50`, right-side drawer)**: Dual-mode text RAG chat and real-time live voice audio streaming.
2. **`CandidateIntakeModal` (`z-50`, centered modal)**: Multi-step wizard for candidate basic info, resume text, GitHub/LinkedIn URLs, and certifications.
3. **`ResumeIngestionModal` (`z-50`, centered modal)**: Direct document drag-and-drop / file upload for PDF, DOCX, TXT, and MD files.
4. **`RoleUniverseModal` (`z-50`, fullscreen/modal)**: 30+ role topological galaxy explorer with cluster filtering, candidate matching, and requisition selection.
5. **`AIProcessingPipelineModal` (`z-50`, progress modal)**: Visual step-by-step progress monitor showing live agent orchestration during candidate ingestion.
6. **`AuthModal` (`z-50`, centered modal)**: Secure sign-in and new user registration with pre-filled demo enterprise credentials.

---

## 5. WIDGET COORDINATION & STATE MANAGEMENT AUDIT

### Audit Status: `FIXED` (Zero Widget Collisions or Orphaned Overlays)

1. **Z-Index Hierarchy**:
   - Background Canvas: `z-0`
   - Page Content: `z-10`
   - Sticky Control Banners & Breadcrumbs: `z-20` (`backdrop-blur-xl bg-slate-900/90`)
   - Global Navbar: `z-30`
   - Slide-over Drawers (HR Copilot): `z-50`
   - Centered & Fullscreen Modals: `z-50`
   - Dropdowns & Popovers: Contained inside parent modal/card contexts with standard absolute positioning and click-outside listeners.
2. **Modal & Drawer Isolation**:
   - All modals and drawers are controlled by top-level state in `App.tsx` (`isCopilotOpen`, `isIntakeOpen`, `isIngestionOpen`, `isUniverseOpen`, `isAIProcessingOpen`, `isAuthModalOpen`).
   - Closing one overlay cleanly updates parent state without leaving backdrop artifacts.
3. **Scroll & Overflow Management**:
   - All modals feature independent inner scroll containers (`overflow-y-auto max-h-[85vh]`) ensuring viewport responsiveness on mobile and tablet screens.
   - Body scroll lock is maintained cleanly when modals are active.
4. **Audio Hardware Lifecycle**:
   - `HRCopilotDrawer` explicitly cleans up microphone streams, audio contexts, script processors, and WebSockets upon unmounting or drawer close, preventing orphaned browser audio streams.

---

## 6. BACKEND API ENDPOINT SPECIFICATION

### Authentication & RBAC (`/api/auth/*`)
- `POST /api/auth/login` — Verifies email/password via scrypt and returns signed Bearer session token.
- `POST /api/auth/register` — Creates new user with cryptographic salt and hashed password.
- `GET /api/auth/me` — Returns current authenticated user and role.
- `POST /api/auth/logout` — Revokes session token in memory registry and logs audit event.
- `GET /api/auth/users` — Returns list of organization users (Admin/HR scoped).

### Job Requisitions (`/api/jobs/*`)
- `GET /api/jobs` — Retrieves all job profiles for the authenticated organization.
- `GET /api/jobs/:id` — Retrieves specific job requisition.
- `POST /api/jobs/parse-description` — Uses ontology matching to extract skills, experience requirements, and responsibilities from raw text.
- `DELETE /api/jobs/:id` — Deletes job requisition (Admin/HR only) with audit log.

### Candidate Dossiers & Intelligence (`/api/candidates/*`)
- `GET /api/candidates` — Retrieves candidate list with filtering by `jobId`, `search`, and `includeArchived`.
- `GET /api/candidates/:id` — Retrieves complete candidate dossier, recalculates explainable match, and indices candidate in RAG.
- `POST /api/candidates` — Creates candidate record.
- `PUT /api/candidates/:id` — Updates candidate record, stage, or status.
- `DELETE /api/candidates/:id` — Permanently deletes candidate (Admin/HR only).
- `POST /api/candidates/:id/archive` — Toggles archived status.
- `POST /api/candidates/upload-document` — Ingests PDF/DOCX/TXT file and executes multi-agent analysis.
- `POST /api/analyze-resume` — Analyzes raw resume text against target requisition.
- `POST /api/candidates/intake` — Multi-source intake processing (basic info, resume, GitHub, LinkedIn, certifications).
- `POST /api/candidates/:id/sources` — Updates external source records.
- `POST /api/candidates/:id/documents` — Attaches supporting evidence document to existing candidate.
- `POST /api/candidates/:id/verify-claim` — Human-in-the-loop claim verification override.
- `POST /api/candidates/:id/external-sources/verify` — Audits external URL endpoints.
- `POST /api/candidates/:id/rag-query` — Executes isolated RAG vector retrieval.
- `GET /api/candidates/:id/integrity-audit` — Returns deep cross-source consistency report.
- `GET /api/candidates/:id/match-breakdown` — Real-time explainable match breakdown for specified job.
- `GET /api/candidates/:id/duplicates` — Duplicate candidate detection.
- `POST /api/candidates/bulk-status` — Batch status / stage move.
- `POST /api/candidates/bulk-archive` — Batch archiving / restoration.
- `GET /api/candidates/:id/export` — Exports candidate dossier as JSON, CSV, or Markdown.
- `GET /api/candidates/export-all` — Bulk organization export.

### Interview & Decision System (`/api/candidates/:id/interviews`, `/api/compare*`, `/api/copilot`)
- `GET /api/candidates/:id/interviews` — Retrieves candidate interview records.
- `POST /api/candidates/:id/interviews` — Records structured interview feedback.
- `POST /api/candidates/:id/generate-interview` — Generates tailored interview probes with rubrics.
- `GET /api/candidates/:id/interview-analysis` — Aggregated interview feedback synthesis.
- `GET /api/interviews/all` — All interview records for organization.
- `POST /api/copilot` — RAG-grounded AI Copilot text generation.
- `POST /api/compare` — Basic candidate comparison.
- `POST /api/compare-detailed` — Side-by-side 2-4 candidate comparison matrix with winner calculations.
- `GET /api/analytics/pipeline` — Live funnel, verification breakdown, and skill distribution analytics.
- `GET /api/audit-logs` — Organization audit logs.

### WebSocket Endpoints
- `ws://<host>/api/live-copilot-voice` — Real-time bi-directional audio streaming for Gemini Live Copilot.

---

## 7. DATABASE & PERSISTENCE LAYER

| Layer | Implementation | Status | Details |
| :--- | :--- | :--- | :--- |
| **Active Local Store** | Atomic JSON File (`/.data/db.json`) | **ACTIVE** | Handles fast local read/write with atomic `.tmp` swap, auto-seeding default enterprise users, jobs, candidates, and audit logs. |
| **Multi-Tenancy** | Organization-Scoped Filtering (`orgId`) | **ACTIVE** | Enforced across all DB queries (`getCandidates`, `getJobs`, `getAuditLogs`, `getInterviewRecords`). |
| **Password Security** | `crypto.scryptSync` + Random Salt | **ACTIVE** | 64-byte key length with constant-time equality checks preventing timing attacks. |
| **Token Session Store** | In-Memory Revocation Map + Bearer Auth | **ACTIVE** | Supports token invalidation upon logout and tampering detection. |
| **Cloud Database** | Firebase Firestore | **CONFIGURED & READY** | Initialized via `firebase-applet-config.json` with secure `firestore.rules` and client library in `/src/lib/firebase.ts`. |

---

## 8. AI & RAG ARCHITECTURE

1. **Model Selection**:
   - `gemini-2.5-flash`: Fast structured multi-agent extraction, resume parsing, and RAG response synthesis.
   - `gemini-2.0-flash-exp` / Live API: Real-time bi-directional audio conversation in `liveVoiceService.ts`.
2. **RAG Vector Engine (`/server/services/ragEngine.ts`)**:
   - In-memory semantic chunking (paragraphs split and annotated with source attribution and confidence).
   - High-performance tokenization, stop-word filtering, and TF-IDF normalized vector cosine similarity combined with keyword overlap scoring (`Score = Cosine * 0.6 + KeywordRatio * 0.4`).
   - Strict multi-tenant isolation key: `orgId:candidateId`.
3. **Prompt Injection Defense**:
   - Input scanning against instruction override patterns (`ignore previous instructions`, `system override`, `you are now in developer mode`, etc.).
   - Untrusted data boundary encapsulation using XML/HTML comment blocks.

---

## 9. SECURITY & GOVERNANCE AUDIT

1. **Authentication & Session Security**:
   - Passwords hashed using scrypt with unique 16-byte cryptographic salts.
   - Cryptographically signed HMAC-SHA256 session tokens with server-side revocation registry.
   - Timing-safe comparison (`crypto.timingSafeEqual`) on password checks.
2. **Authorization & RBAC**:
   - Enforced on all protected routes via `requireAuth` and `requireRole` middleware.
   - User roles: `Admin`, `HR`, `Recruiter`, `Hiring Manager`, `Interviewer`.
3. **Multi-Tenant Isolation**:
   - Strict organization boundary enforcement. Tenant A cannot read, query, update, or RAG-retrieve Tenant B records.
4. **SSRF & URL Validation**:
   - `urlValidator.ts` blocks loopback IPs (`127.0.0.1`), localhost, AWS/GCP cloud metadata IP (`169.254.169.254`), private RFC1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and unsafe protocols (`javascript:`, `file:`).
5. **File Upload Security**:
   - Multer memory storage with 10MB file size limits and executable extension blocking (`.exe`, `.sh`, `.bat`, `.cmd`, `.bin`, `.js`, `.py`, `.dll`, `.jar`).
6. **Rate Limiting**:
   - IP-based rate limiting on authentication routes (10 req/15min), AI copilot queries (30 req/min), and document uploads (10 req/min).
7. **Audit Logging**:
   - Detailed audit entries for system bootstrap, user logins/logouts, candidate creations/updates/deletions, claim verifications, document uploads, and data exports.

---

## 10. TESTING & VERIFICATION AUDIT

All 110 automated tests pass cleanly with zero failures (`npm test`):

```text
======================================================
  RUNNING TALENTINTEL P0/P1/P2/PHASE 3 TEST SUITE
======================================================
--- 1. Authentication & RBAC Suite --- (8 passed)
--- 2. Multi-Tenant Database & Persistence Suite --- (3 passed)
--- 3. Prompt Injection Defense & Sanitization Suite --- (6 passed)
--- 4. Multi-Tenant RAG Store & Citation Suite --- (5 passed)
--- 5. Candidate Intelligence, Claims & Integrity Suite --- (18 passed)
--- 6. Document Ingestion Security Suite --- (4 passed)
--- 7. Phase 4 Advanced HR Decision-Support Suite --- (9 passed)
--- 8. Phase 5 Security, Privacy & Production Hardening Suite --- (17 passed)
--- 9. Phase 6 Complete Testing, Bug Elimination & Stability Suite --- (40 passed)
======================================================
TEST SUMMARY: 110 passed, 0 failed, 110 total
======================================================
```

TypeScript compilation (`npm run build`) and linter checks (`tsc --noEmit`) complete with 0 errors.

---

## 11. PRODUCTION READINESS EVALUATION

| Category | Readiness | Evaluation Summary |
| :--- | :---: | :--- |
| **Architecture** | 🟢 READY | Clean modular full-stack separation between Express backend, services, DB layer, and React frontend. |
| **Security** | 🟢 READY | Scrypt password hashing, session revocation, RBAC, tenant isolation, SSRF protection, rate limiting, and prompt defense. |
| **Database** | 🟡 NEEDS HARDENING | Atomic JSON storage is resilient for development/single-node; migrate to Cloud SQL / Firestore for horizontal auto-scaling. |
| **Scalability** | 🟡 NEEDS HARDENING | In-memory RAG vector store is high-speed for tenant dossiers; scalable vector DB (e.g. pgvector / Cloud SQL) recommended for 100k+ candidates. |
| **Reliability** | 🟢 READY | Graceful error fallbacks, mock synthesis fallbacks when Gemini API key is unconfigured, and comprehensive input validation. |
| **Observability** | 🟢 READY | Multi-tenant audit logging with user, role, entity, and action tracking. |
| **Testing** | 🟢 READY | 110 comprehensive unit, integration, security, and E2E scenario tests. |
| **Deployment** | 🟢 READY | Production Vite build + esbuild bundled CJS server (`dist/server.cjs`) configured on `0.0.0.0:3000`. |
| **AI Governance** | 🟢 READY | Objective anomaly reporting without slanderous fraud labels; explainable scoring formulas; source attribution badges. |

---

## 12. COMPLETED ROADMAP PHASES

- **PHASE 1: Candidate & AI Intelligence** — **100% COMPLETE** (Multi-agent ingestion, claim extraction, evidence provenance, explainable scoring, semantic ontology, RAG engine).
- **PHASE 2: Human Decision & Enterprise Platform** — **100% COMPLETE** (Human-in-the-loop claim overrides, interview feedback rubrics, 2-4 candidate comparison matrix, RBAC, multi-tenancy, audit logs, pipeline BI analytics).
- **PHASE 3: Production & Enterprise Hardening** — **100% COMPLETE** (SSRF defense, prompt injection protection, document upload security, token revocation registry, duplicate candidate detection, 110 automated tests).

---

## 13. TECHNICAL DEBT & OPTIMIZATIONS INVENTORY

1. **Persistent Storage Scalability**: In-memory JSON file store (`.data/db.json`) is performant for single-instance containers; multi-instance deployment requires external Postgres / Cloud SQL or Firestore sync.
2. **Large Component File Sizes**: `CandidateSourcesView.tsx` (997 lines) and `RoleUniverseModal.tsx` (918 lines) can be subdivided into smaller sub-components for improved long-term maintainability.
3. **RAG Vector Persistence**: In-memory vector store re-indexes candidates on demand; caching embeddings in persistent storage would reduce CPU usage at high scale.

---

## 14. CRITICAL BLOCKERS

**Current Count: 0 Critical Blockers**
- The application compiles cleanly with 0 TypeScript/linter errors.
- The server runs reliably on port 3000.
- All 110 automated test suites pass.
- No UI layout crashes, memory leaks, or unhandled promise rejections exist.

---

## 15. AUTHORITATIVE CONTEXT & BASELINE RULES FOR FUTURE WORK

For all subsequent feature development, debugging, or iteration:
1. **Source of Truth**: Check this baseline document (`/docs/TALENTINTEL_PROJECT_BASELINE.md`) and the repository codebase before implementing changes.
2. **Preserve Integrity**: Do not revert or overwrite existing test suites, RBAC checks, tenant isolation boundaries, or prompt injection defenses.
3. **Maintain Zero-Slop Standard**: Preserve high-contrast styling, mathematical padding scales, Lucide icon consistency, and single-line button labels.
