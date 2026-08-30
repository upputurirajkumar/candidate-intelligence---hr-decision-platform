# TalentIntel

### Evidence-Grounded AI Candidate Intelligence Platform

> **TalentIntel is an evidence-grounded AI candidate intelligence platform designed to help HR teams understand candidates beyond the resume.**
> 
> *AI provides decision support; final hiring decisions remain with human reviewers.*

---

## Table of Contents
1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [Key Features](#4-key-features)
5. [How It Works](#5-how-it-works)
6. [Candidate Intelligence Workflow](#6-candidate-intelligence-workflow)
7. [Supported Candidate Sources](#7-supported-candidate-sources)
8. [AI Capabilities](#8-ai-capabilities)
9. [Evidence & Corroboration](#9-evidence--corroboration)
10. [Career Timeline & Gap Analysis](#10-career-timeline--gap-analysis)
11. [Integrity & Potential Inconsistency Analysis](#11-integrity--potential-inconsistency-analysis)
12. [Role Matching](#12-role-matching)
13. [30+ Supported Job Roles](#13-30-supported-job-roles)
14. [Custom Roles](#14-custom-roles)
15. [Candidate Leaderboard](#15-candidate-leaderboard)
16. [Candidate Comparison Matrix](#16-candidate-comparison-matrix)
17. [Interview History](#17-interview-history)
18. [Interview Intelligence](#18-interview-intelligence)
19. [HR Copilot](#19-hr-copilot)
20. [Analytics & Reports](#20-analytics--reports)
21. [Security & Privacy](#21-security--privacy)
22. [Architecture](#22-architecture)
23. [Technology Stack](#23-technology-stack)
24. [Installation](#24-installation)
25. [Environment Variables](#25-environment-variables)
26. [Running Locally](#26-running-locally)
27. [Testing](#27-testing)
28. [Deployment](#28-deployment)
29. [Limitations](#29-limitations)
30. [Future Improvements](#30-future-improvements)
31. [Disclaimer](#31-disclaimer)

---

## 1. Overview
TalentIntel is an enterprise-grade candidate intelligence platform that aggregates candidate profiles across multiple modalities (resumes, GitHub repositories, LinkedIn profiles, portfolio projects, and industry certifications). It corroborates self-reported claims against observable evidence, analyzes career timelines, computes explainable role match scores against 30+ standardized and custom job requisitions, and equips talent teams with an evidence-grounded HR Copilot and structured interview protocols.

## 2. Problem Statement
Traditional applicant tracking systems (ATS) and keyword matchers evaluate candidates purely on self-reported resume text:
- **Unverified Claims**: Buzzwords and inflated titles pass keyword filters without corroborating proof.
- **Surface-Level Screening**: Recruiters lack the bandwidth to manually review code repositories, career continuity, and certification registries.
- **Disconnected Workflows**: Notes, interview rubrics, technical evaluations, and candidate questions remain scattered across documents and spreadsheets.
- **Biased Automated Screening**: Black-box scoring algorithms lack transparency, explainability, and verifiable citations.

## 3. Solution
TalentIntel bridges the gap between self-reported resumes and verified execution:
- **Multi-Source Corroboration**: Cross-references resume claims with public code commits, verified credentials, and career milestones.
- **Evidence Provenance**: Flags each assertion with a confidence tier (**Verified**, **Partially Verified**, **Candidate-Reported**, or **Flagged Inconsistency**).
- **Explainable Match Scoring**: Breaks down role fit into transparent weights: Required Skills, Experience Relevance, and Evidence Grounding.
- **Human-Centric Review**: Provides structured interview guides and HR Copilot assistance while preserving final authority for human decision-makers.

## 4. Key Features
- **Multi-Source Ingestion**: Resumes (.pdf, .docx, .txt), GitHub repositories, LinkedIn profiles, portfolio links, and certificate registries.
- **Multi-Agent Evaluation**: Specialized analysis modules assessing technical depth, career continuity, integrity signals, and collaboration.
- **Evidence Verification Panel**: Ground-truth extraction with direct citations and verification status badges.
- **Career Timeline & Neutral Gap Analysis**: Objective timeline visualization treating sabbaticals, parental leave, and education transitions neutrally.
- **Role Universe (30+ Standardized Roles)**: Pre-configured rubrics spanning Frontend, Backend, ML, DevOps, Security, Product, and Data.
- **Custom Role Builder**: Instant synthesis of custom job requisitions with required skills, experience ranges, and custom weighting.
- **Dynamic Leaderboard**: Real-time role-specific candidate ranking with multi-variable sorting and filtering.
- **Side-by-Side Comparison Matrix**: Direct radar chart and attribute comparison between multiple candidates.
- **Structured Interview Protocols**: Context-aware probing questions, scorecards, and multi-round synthesis history.
- **HR Copilot**: Context-aware assistant querying grounded evidence and candidate artifacts via RAG.
- **Pipeline Analytics & Reports**: Funnel velocity, source attribution breakdowns, and printable PDF reports.

## 5. How It Works
```
+-----------------------------------------------------------------------------+
|                             Candidate Sources                               |
|        [ Resume ]  [ GitHub ]  [ LinkedIn ]  [ Portfolio ]  [ Certs ]       |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     Ingestion & Security Sanitization                       |
|   SSRF Filtering • Prompt Injection Guard • Isolated Document Parser        |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     Evidence Extraction & Fact-Checking                     |
|    Claim Extraction • Cross-Source Corroboration • Registry Lookup          |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     Multi-Tenant RAG & Embeddings Store                     |
|           Isolated Vector Chunks • Contextual Evidence Indexing             |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     Role Matching & Intelligence Engine                     |
|       Skill Alignment • Experience Fit • Evidence Grounding Weights         |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                        HR Workspace & Decision Layer                        |
|  Executive Dossier • Leaderboard • Comparison • HR Copilot • Interview Pad  |
+-----------------------------------------------------------------------------+
```

## 6. Candidate Intelligence Workflow
1. **Intake**: Recruiter uploads a resume or provides public profile links (GitHub, LinkedIn, Portfolio).
2. **Sanitization**: Inputs undergo strict prompt injection defense and SSRF URL validation.
3. **Extraction**: Claims regarding skills, employment tenure, projects, and certifications are extracted.
4. **Corroboration**: Claims are cross-referenced across sources (e.g., matching a claimed React proficiency to GitHub repositories).
5. **Synthesis**: The candidate dossier is indexed in tenant-isolated vector storage.
6. **Evaluation**: Explainable match scores are calculated against the active role requisition.
7. **Interviewing**: Targeted probing questions are generated for interview rounds.

## 7. Supported Candidate Sources
- **Resume**: Plain text, PDF, DOCX, and Markdown documents.
- **GitHub**: Public profile usernames, repository ownership, commit history, and primary languages.
- **LinkedIn**: Career tenure, company transitions, and role titles.
- **Portfolio**: Deployed applications, system architectures, and technical writeups.
- **Certifications**: Industry certificate IDs checked against public credential formats.

## 8. AI Capabilities
- **Server-Side Gemini Integration**: Secure AI synthesis using `@google/genai` without client-exposed API keys.
- **Strict Injection Defense**: Isolates candidate text in non-executable untrusted boundary tags to prevent prompt injection.
- **Retrieval-Augmented Generation (RAG)**: Retrieves exact grounded candidate excerpts for conversational queries.
- **Explainable Reasoning Traces**: Produces human-auditable rationales for skill match deductions and confidence scores.

## 9. Evidence & Corroboration
Every candidate claim receives an evidence classification:
- **Verified**: Directly corroborated by an observable external artifact (e.g., active GitHub code or valid credential ID).
- **Partially Verified**: Plausible claim supported by secondary indicators (e.g., LinkedIn tenure matches resume).
- **Candidate-Reported**: Stated by the candidate without independent external verification.
- **Flagged Inconsistency**: Discrepancy detected between sources (e.g., conflicting employment dates).

## 10. Career Timeline & Gap Analysis
- Visualizes employment history, company tenures, and skill acquisition over time.
- **Fairness & Bias-Mitigated Evaluation**: Career gaps, transitions, parental leave, or independent research periods are treated neutrally and never penalized as fraud.

## 11. Integrity & Potential Inconsistency Analysis
- Highlights contradictory dates, mismatched job titles, or uncorroborated architectural claims.
- Enforces constructive, non-accusatory terminology ("Potential Inconsistency", "Requires Verification") designed to guide human interview inquiry.

## 12. Role Matching
The matching engine evaluates candidates across three explainable vectors:
$$\text{Overall Fit} = (w_1 \cdot \text{Skill Fit}) + (w_2 \cdot \text{Experience Fit}) + (w_3 \cdot \text{Evidence Grounding})$$
Weights are adjustable by HR teams based on role seniority and hiring priorities.

## 13. 30+ Supported Job Roles
Includes pre-calibrated rubrics across core industry disciplines:
- **Frontend & Web**: Senior Frontend Engineer, React Architect, Full-Stack TypeScript Engineer.
- **Backend & Cloud**: Senior Backend Engineer (Go/Node/Java), Distributed Systems Architect, Cloud Infrastructure Engineer.
- **AI & Data**: Machine Learning Engineer, AI Research Scientist, LLM Application Engineer, Data Engineer.
- **Security & DevOps**: DevSecOps Engineer, Site Reliability Engineer (SRE), Cyber Security Analyst.
- **Product & Design**: Technical Product Manager, Lead UX/UI Designer, Engineering Manager.

## 14. Custom Roles
Recruiters can create custom job requisitions on demand. The system dynamically extracts required skills, preferred qualifications, and calculates instant candidate match scores.

## 15. Candidate Leaderboard
- Real-time ranking of candidates for the selected active requisition.
- Filtering by stage (Applied, Screening, Shortlisted, Interviewing, Offered), department, and minimum match score.
- Direct quick-actions to inspect dossiers, schedule interviews, or trigger deep-dive copilot queries.

## 16. Candidate Comparison Matrix
- Compare up to 4 candidates side-by-side.
- Multi-dimensional radar charts for skill coverage, experience relevance, and evidence grounding.
- Direct attribute diffing for quick executive review.

## 17. Interview History
- Centralized multi-round interview tracking (Screening, Technical Deep-Dive, System Design, Behavioral).
- Historical scorecards with timestamped feedback, interviewer notes, and candidate progression.

## 18. Interview Intelligence
- Generates tailored probing questions based on candidate-specific evidence gaps.
- Includes clear evaluation rubrics ("Look for concrete trade-off explanations between PostgreSQL and DynamoDB").
- Interactive live scoring pad with automatic weighted average calculation.

## 19. HR Copilot
- Context-aware conversational drawer for deep-dive questions.
- Suggested prompt pills: *"Why is this candidate a top match?"*, *"What evidence supports their AWS skills?"*, *"What potential inconsistencies should we probe?"*.
- Strict citation transparency showing the exact source chunk backing every response.

## 20. Analytics & Reports
- Pipeline funnel progression tracking applicant velocity from Ingestion to Offer.
- Verification health breakdown visualizing grounded vs unverified claims.
- One-click print-ready and exportable executive summary dossiers.

## 21. Security & Privacy
- **Multi-Tenant Isolation**: Cryptographic session tokens enforce strict organization data boundaries.
- **Server-Side API Keys**: Gemini API keys and secrets are never exposed to client browsers.
- **SSRF URL Sanitizer**: Prohibits localhost, loopback, AWS metadata (169.254.169.254), and private LAN ranges.
- **Path Traversal Protection**: Strips relative path characters and null bytes from uploaded filenames.
- **Rate Limiting**: Defends endpoints against brute force and denial of service.
- **Comprehensive Audit Logs**: Sensitive actions logged with zero secret leakage.

## 22. Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    React 18 + Vite SPA                      │
│   Tailwind CSS • Motion • Lucide Icons • Recharts • Canvas  │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / REST (Bearer JWT)
                               v
┌─────────────────────────────────────────────────────────────┐
│                     Express 4 API Server                    │
│   Rate Limiting • SSRF Protection • Multi-Tenant RBAC Auth  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               v                               v
┌──────────────────────────────┐ ┌────────────────────────────┐
│   Google Gemini 2.5 Engine   │ │     In-Memory / SQLite     │
│   @google/genai Server SDK   │ │ Multi-Tenant Data & Vector │
└──────────────────────────────┘ └────────────────────────────┘
```

## 23. Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Motion, Lucide React, Recharts.
- **Backend**: Express 4, Node.js (ESM), TypeScript (`tsx` / `esbuild`).
- **AI & LLM**: Google Gemini (`@google/genai` TypeScript SDK).
- **RAG & Search**: Custom In-Memory Multi-Tenant Vector & Chunk Store.
- **Security**: Node `crypto` (`scrypt`, `randomBytes`), HMAC-SHA256 tokens, custom SSRF validator.
- **Testing**: Built-in comprehensive test runner (`server/tests/runTests.ts`) covering 110 P0/P1/P2 test suites.

## 24. Installation
```bash
# 1. Clone repository
git clone https://github.com/example/talentintel.git
cd talentintel

# 2. Install dependencies
npm install
```

## 25. Environment Variables
Copy `.env.example` to `.env` and configure:
```env
# Google Gemini API Key (Server-side secret)
GEMINI_API_KEY=your_gemini_api_key_here

# Session Secret (Optional - defaults to auto-generated cryptographically secure salt)
SESSION_SECRET=your_secure_random_hmac_secret
```

## 26. Running Locally
```bash
# Start development server on port 3000
npm run dev

# Open in browser
http://localhost:3000
```

## 27. Testing
Run the 110-test automated test suite:
```bash
npm test
```

## 28. Deployment
```bash
# Build client and server bundles
npm run build

# Start production server
npm start
```

## 29. Limitations
- **Public Artifact Availability**: Evaluation accuracy depends on public availability of candidate repositories, publications, or verifiable credential formats.
- **Network Access**: Third-party profile imports require active internet connectivity and valid profile URLs.
- **AI Uncertainty**: Model inferences represent probabilistic assessments and must be corroborated by human interviewers.

## 30. Future Improvements
- Native ATS bidirectional integrations (Workday, Greenhouse, Lever).
- Automated live coding sandbox execution with test case verification.
- Advanced multi-language audio transcription for live interview rounds.

## 31. Disclaimer
*TalentIntel is an AI-powered decision support platform. It is designed to assist human recruiters and hiring managers by synthesizing multi-source candidate evidence. It does not replace human judgment, and all final hiring, interviewing, and employment decisions remain solely with human reviewers.*
