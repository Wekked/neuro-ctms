# NeuroTrial — CNS CTMS + eTMF

A CNS-focused Clinical Trial Management System with integrated Electronic Trial Master File, built with React + Vite.

## Features

### CTMS
- **Dashboard** — Active trials, enrollment progress, indication portfolio, adverse event tracking
- **Trial Registry** — Full CNS protocol management with indication-specific assessment scales (MMSE, CDR-SB, MDS-UPDRS, MADRS, PANSS, EDSS, etc.)
- **Subject Tracking** — Patient enrollment, genetic markers (APOE ε4, LRRK2), neuroimaging protocols, visit history
- **CNS Indications** — Alzheimer's, Parkinson's, MS, TRD, Schizophrenia, Epilepsy, ALS, and more

### eTMF
- **DIA TMF Reference Model** — 8 zones with sections and artifacts
- **Tree / List / Completeness views** — Navigate documents by hierarchy, flat list, or zone-level dashboards
- **Inspection Readiness Meter** — Real-time gauge with 70%/90% thresholds
- **Document Lifecycle** — Draft → Under Review → Approved → Final → Superseded
- **Audit Trail** — Timestamped log of all document actions
- **Missing Document Tracking** — Required artifacts not yet filed are flagged for action

## Tech Stack
- React 19 + Vite
- Pure CSS-in-JS (zero dependencies beyond React)
- GitHub Pages deployment via Actions

## Development

```bash
npm install
npm run dev
```

## Deployment
Push to `main` branch — GitHub Actions will build and deploy to Pages automatically.

## Compliance
Designed with 21 CFR Part 11, ICH-GCP, HIPAA, and GDPR requirements in mind.
