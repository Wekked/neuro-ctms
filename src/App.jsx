import { useState, useMemo } from "react";

// ════════════════════════════════════════════════════════════════
//  CNS CLINICAL TRIAL MANAGEMENT SYSTEM + eTMF
//  Electronic Trial Master File built on TMF Reference Model v3.3
// ════════════════════════════════════════════════════════════════

// ── COLOR SYSTEM ──────────────────────────────────────────────
const C = {
  bg: "#0f1117", surface: "#181b23", surfaceAlt: "#1e2230", card: "#232839",
  border: "#2a2f3e", borderLight: "#353b4f",
  text: "#e8eaf0", textMute: "#8b90a0", textDim: "#5d6278",
  accent: "#6c8cff", accentSoft: "rgba(108,140,255,0.12)",
  green: "#34d399", greenSoft: "rgba(52,211,153,0.12)",
  amber: "#fbbf24", amberSoft: "rgba(251,191,36,0.12)",
  red: "#f87171", redSoft: "rgba(248,113,113,0.12)",
  purple: "#a78bfa", purpleSoft: "rgba(167,139,250,0.12)",
  cyan: "#22d3ee", cyanSoft: "rgba(34,211,238,0.12)",
  rose: "#fb7185", roseSoft: "rgba(251,113,133,0.12)",
};

// ── TMF REFERENCE MODEL (v3.3 Zones & Sections) ──────────────
const TMF_ZONES = [
  {
    id: "Z01", name: "Trial Management", color: C.accent, icon: "◆",
    sections: [
      { id: "01.01", name: "Trial Oversight", artifacts: ["Trial Management Plan", "Communication Plan", "Organizational Chart", "Signature Delegation Log", "Meeting Minutes"] },
      { id: "01.02", name: "Central Trial Documents", artifacts: ["Protocol", "Protocol Amendments", "Investigator's Brochure", "IB Supplements", "Reference Safety Information"] },
      { id: "01.03", name: "Trial Team", artifacts: ["Staff CV / Qualifications", "Training Records", "Delegation of Authority Log", "Contact List"] },
      { id: "01.04", name: "Trial Progress", artifacts: ["Status Reports", "Enrollment Reports", "Milestone Tracking Reports", "Risk Assessment Reports"] },
      { id: "01.05", name: "Trial Committees", artifacts: ["DSMB Charter", "DSMB Meeting Minutes", "Steering Committee Minutes", "Endpoint Adjudication Charter"] },
    ]
  },
  {
    id: "Z02", name: "Central Trial Documents", color: C.purple, icon: "◇",
    sections: [
      { id: "02.01", name: "Regulatory", artifacts: ["Regulatory Submission Dossier", "Health Authority Approval", "IND / CTA Documents", "Annual Reports to HA", "Safety Reports to HA"] },
      { id: "02.02", name: "IRB / IEC Central", artifacts: ["IRB Approval Letter (Central)", "Informed Consent Form (Master)", "ICF Amendments", "IRB Correspondence", "Continuing Review"] },
      { id: "02.03", name: "Insurance / Indemnity", artifacts: ["Insurance Certificate", "Indemnity Agreement", "Subject Compensation Documentation"] },
      { id: "02.04", name: "Agreements", artifacts: ["Clinical Trial Agreement (Template)", "CRO Agreement", "Vendor Agreements", "Lab Services Agreement", "Imaging Charter Agreement"] },
      { id: "02.05", name: "IP Management", artifacts: ["IP Management Plan", "Drug Accountability Log (Central)", "Certificate of Analysis", "Shipping Records", "Temperature Excursion Log"] },
    ]
  },
  {
    id: "Z03", name: "Site Management", color: C.green, icon: "●",
    sections: [
      { id: "03.01", name: "Site Selection", artifacts: ["Feasibility Questionnaire", "Site Assessment Report", "Confidentiality Agreement", "Pre-Study Visit Report"] },
      { id: "03.02", name: "Site Setup", artifacts: ["Site Initiation Visit Report", "Site Signature Page", "Financial Disclosure Form (FDA 3455)", "Lab Normal Ranges", "Equipment Calibration Certs"] },
      { id: "03.03", name: "IRB / IEC (Site)", artifacts: ["IRB Approval Letter (Site)", "Site-Specific ICF", "Site ICF Amendments", "IRB Correspondence (Site)", "Continuing Review (Site)"] },
      { id: "03.04", name: "Regulatory (Site)", artifacts: ["Investigator CV / License", "Medical License", "Form FDA 1572", "Regulatory Binder Checklist"] },
      { id: "03.05", name: "Site Activity", artifacts: ["Monitoring Visit Report", "Follow-Up Letter", "Protocol Deviation Log", "Site Correspondence Log", "Site Close-Out Visit Report"] },
    ]
  },
  {
    id: "Z04", name: "IP & Lab Management", color: C.amber, icon: "▲",
    sections: [
      { id: "04.01", name: "IP at Site", artifacts: ["Drug Accountability Log (Site)", "IP Receipt Records", "IP Dispensing Log", "IP Return / Destruction Records", "Temperature Monitoring Log"] },
      { id: "04.02", name: "Lab Management", artifacts: ["Lab Certification (CAP / CLIA)", "Lab Kit Inventory", "Sample Manifest", "Central Lab Results", "Biomarker Analysis Reports"] },
      { id: "04.03", name: "CNS Imaging", artifacts: ["Imaging Protocol", "MRI Qualification Phantom Scans", "PET Tracer Certification", "Imaging Core Lab Agreement", "Image Transfer Logs"] },
    ]
  },
  {
    id: "Z05", name: "Data Management & Statistics", color: C.cyan, icon: "◎",
    sections: [
      { id: "05.01", name: "Data Management", artifacts: ["Data Management Plan", "CRF Completion Guidelines", "Database Design Document", "Edit Check Specifications", "Data Validation Rules"] },
      { id: "05.02", name: "SAE / Safety", artifacts: ["SAE Report Form", "SAE Narratives", "CIOMS Forms", "SUSAR Notifications", "DSUR / PBRER"] },
      { id: "05.03", name: "Statistics", artifacts: ["Statistical Analysis Plan", "Randomization List", "Interim Analysis Report", "Final CSR Tables / Figures", "DSMB Unblinding Envelopes"] },
    ]
  },
];

// ── CNS DATA ─────────────────────────────────────────────────
const CNS_INDICATIONS = [
  "Alzheimer's Disease", "Parkinson's Disease", "Multiple Sclerosis (RRMS)",
  "Multiple Sclerosis (PPMS)", "Treatment-Resistant Depression",
  "Major Depressive Disorder", "Bipolar I Disorder", "Schizophrenia",
  "Epilepsy / Focal Seizures", "Generalized Anxiety Disorder", "PTSD",
  "ALS / Motor Neuron Disease", "Huntington's Disease", "Migraine (Chronic)",
  "Neuropathic Pain", "Stroke / Ischemic Recovery", "Traumatic Brain Injury",
  "Autism Spectrum Disorder", "ADHD", "Narcolepsy / Sleep Disorders",
];

const CNS_ENDPOINTS = [
  "ADAS-Cog 13 at 78 weeks", "CDR-SB change from baseline at 18 months",
  "MMSE change from baseline at 52 weeks", "MDS-UPDRS total score change at 40 weeks",
  "EDSS change from baseline at 96 weeks", "ARR (Annualized Relapse Rate) at 2 years",
  "MADRS total score change at 8 weeks", "HAMD-17 response rate at 6 weeks",
  "PANSS total score change at 12 weeks", "50% responder rate (seizure frequency) at 12 weeks",
  "CGI-S change from baseline at 8 weeks", "Time to confirmed disability progression",
  "Brain volume loss on MRI at 24 months", "CSF amyloid-beta 42/40 ratio at 78 weeks",
];

const INDICATION_GROUP = (ind) => {
  if (/alzheimer|parkinson|als|huntington|stroke|traumatic/i.test(ind)) return { label: "Neurodegenerative", color: C.red };
  if (/multiple sclerosis/i.test(ind)) return { label: "Neuroinflammatory", color: C.amber };
  if (/depress|bipolar|schizo|anxiety|ptsd/i.test(ind)) return { label: "Psychiatric", color: C.purple };
  if (/epilepsy|migraine|pain|narcolepsy/i.test(ind)) return { label: "Epilepsy / Pain", color: C.cyan };
  return { label: "Neurodevelopmental", color: C.rose };
};

// ── SAMPLE DATA ──────────────────────────────────────────────
const sampleTrials = [
  { id: "T001", name: "BEACON-AD: Anti-Tau mAb in Early Alzheimer's", phase: "Phase III", status: "Recruiting", sponsor: "NeuroVantage Therapeutics", pi: "Dr. Elena Torres", indication: "Alzheimer's Disease", startDate: "2024-06-01", endDate: "2027-03-01", targetEnrollment: 1200, currentEnrollment: 438, sites: 68, primaryEndpoint: "CDR-SB change from baseline at 18 months", nctId: "NCT06234891", irbNumber: "IRB-2024-0341", regulatoryDesignation: "Breakthrough Therapy", imagingRequired: true, imagingType: "Amyloid PET + Tau PET" },
  { id: "T002", name: "SYNAPSE-PD: a-Synuclein Inhibitor in Parkinson's", phase: "Phase II", status: "Active, Not Recruiting", sponsor: "Cortex Biosciences", pi: "Dr. James Okafor", indication: "Parkinson's Disease", startDate: "2023-09-15", endDate: "2025-12-31", targetEnrollment: 180, currentEnrollment: 180, sites: 22, primaryEndpoint: "MDS-UPDRS total score change at 40 weeks", nctId: "NCT05891234", irbNumber: "IRB-2023-0987", regulatoryDesignation: "Fast Track", imagingRequired: true, imagingType: "DaTscan SPECT" },
  { id: "T003", name: "CLARITY-TRD: Psilocybin-Assisted Therapy", phase: "Phase II", status: "Recruiting", sponsor: "Mindful Neuroscience", pi: "Dr. Anika Sharma", indication: "Treatment-Resistant Depression", startDate: "2024-02-01", endDate: "2026-01-15", targetEnrollment: 90, currentEnrollment: 61, sites: 8, primaryEndpoint: "MADRS total score change at 8 weeks", nctId: "NCT06012345", irbNumber: "IRB-2024-0102", regulatoryDesignation: "Breakthrough Therapy", imagingRequired: true, imagingType: "fMRI" },
  { id: "T004", name: "RESOLVE-EP: Nav1.2 Blocker in Focal Epilepsy", phase: "Phase III", status: "Recruiting", sponsor: "IonChannel Therapeutics", pi: "Dr. Robert Kim", indication: "Epilepsy / Focal Seizures", startDate: "2024-08-01", endDate: "2026-08-01", targetEnrollment: 320, currentEnrollment: 112, sites: 34, primaryEndpoint: "50% responder rate (seizure frequency) at 12 weeks", nctId: "NCT06345678", irbNumber: "IRB-2024-0567", regulatoryDesignation: "Fast Track", imagingRequired: false, imagingType: "" },
];

const samplePatients = [
  { id: "P001", name: "Margaret Wilson", age: 72, sex: "F", trialId: "T001", status: "Active", enrollDate: "2024-09-12", visits: 8, adverse: 1, geneticMarker: "APOE e4/e4", conMeds: "Donepezil 10mg", mmse: 22, cdrSb: 4.5, updrs: null, hamd: null },
  { id: "P002", name: "Harold Chen", age: 68, sex: "M", trialId: "T001", status: "Active", enrollDate: "2024-10-03", visits: 6, adverse: 0, geneticMarker: "APOE e3/e4", conMeds: "Memantine 10mg", mmse: 24, cdrSb: 3.0, updrs: null, hamd: null },
  { id: "P003", name: "James Patterson", age: 64, sex: "M", trialId: "T002", status: "Completed", enrollDate: "2023-11-01", visits: 14, adverse: 2, geneticMarker: "LRRK2 G2019S", conMeds: "Carbidopa-Levodopa", mmse: null, cdrSb: null, updrs: 38, hamd: null },
  { id: "P004", name: "Sarah Mitchell", age: 41, sex: "F", trialId: "T003", status: "Active", enrollDate: "2024-06-15", visits: 4, adverse: 0, geneticMarker: "—", conMeds: "None", mmse: null, cdrSb: null, updrs: null, hamd: 28 },
  { id: "P005", name: "David Nguyen", age: 34, sex: "M", trialId: "T004", status: "Active", enrollDate: "2024-11-01", visits: 3, adverse: 1, geneticMarker: "SCN2A variant", conMeds: "Levetiracetam 1000mg", mmse: null, cdrSb: null, updrs: null, hamd: null },
];

// ── eTMF SAMPLE DOCUMENTS ────────────────────────────────────
const generateEtmfDocs = () => {
  const statuses = ["Final", "Final", "Final", "Draft", "Under Review", "Superseded"];
  const uploaders = ["E. Torres", "J. Okafor", "A. Sharma", "R. Kim", "L. Chen", "M. Park"];
  const docs = [];
  let docId = 1;
  sampleTrials.forEach(trial => {
    TMF_ZONES.forEach(zone => {
      zone.sections.forEach(section => {
        section.artifacts.forEach((art, ai) => {
          if (Math.sin(docId * 7.3 + ai * 2.1) > -0.15) {
            const status = statuses[Math.abs(Math.floor(Math.sin(docId * 3.7) * 6)) % statuses.length];
            const daysAgo = Math.floor(Math.abs(Math.sin(docId * 1.9)) * 300) + 1;
            const d = new Date(); d.setDate(d.getDate() - daysAgo);
            docs.push({
              id: `DOC-${String(docId).padStart(4, "0")}`, trialId: trial.id, zoneId: zone.id,
              sectionId: section.id, artifactName: art,
              fileName: `${art.replace(/[^a-zA-Z0-9]/g, "_")}_${trial.id}_v${status === "Superseded" ? "1.0" : status === "Draft" ? "0.1" : "2.0"}.pdf`,
              version: status === "Superseded" ? "1.0" : status === "Draft" ? "0.1" : "2.0",
              status, uploadedBy: uploaders[docId % 6],
              uploadDate: d.toISOString().split("T")[0],
              fileSize: `${(Math.floor(Math.abs(Math.sin(docId * 4.2)) * 4800) + 50)}KB`,
              locked: status === "Final" || status === "Superseded",
            });
            docId++;
          }
        });
      });
    });
  });
  return docs;
};

// ── STYLES ───────────────────────────────────────────────────
const font = `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, sans-serif`;
const mono = `"IBM Plex Mono", "SF Mono", monospace`;

const btnS = (v = "primary", sz = "md") => ({
  display: "inline-flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer",
  borderRadius: 8, fontFamily: font, fontWeight: 500, transition: "all 0.15s",
  fontSize: sz === "sm" ? 12 : 13, padding: sz === "sm" ? "5px 10px" : "8px 16px",
  ...(v === "primary" && { background: C.accent, color: "#fff" }),
  ...(v === "ghost" && { background: "transparent", color: C.textMute, border: `1px solid ${C.border}` }),
  ...(v === "danger" && { background: C.redSoft, color: C.red }),
});

const pillS = (bg, color) => ({
  display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20,
  fontSize: 11, fontWeight: 600, fontFamily: font, background: bg, color, letterSpacing: 0.3,
});

const inputS = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
  background: C.surface, color: C.text, fontFamily: font, fontSize: 13, outline: "none", boxSizing: "border-box",
};

const selectS = { ...inputS, cursor: "pointer" };

// ── SMALL COMPONENTS ─────────────────────────────────────────
const Badge = ({ children, bg, color: c }) => <span style={pillS(bg, c)}>{children}</span>;

const StatusBadge = ({ status }) => {
  const map = {
    "Recruiting": [C.greenSoft, C.green], "Active, Not Recruiting": [C.amberSoft, C.amber],
    "Completed": [C.accentSoft, C.accent], "Suspended": [C.redSoft, C.red],
    "Final": [C.greenSoft, C.green], "Draft": [C.amberSoft, C.amber],
    "Under Review": [C.purpleSoft, C.purple], "Superseded": [C.redSoft, C.red],
    "Active": [C.greenSoft, C.green], "Screen Failed": [C.redSoft, C.red], "Withdrawn": [C.redSoft, C.red],
  };
  const [bg, c] = map[status] || [C.accentSoft, C.accent];
  return <Badge bg={bg} color={c}>{status}</Badge>;
};

const ProgressBar = ({ value, max, color = C.accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border }}>
      <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.4s" }} />
    </div>
    <span style={{ fontSize: 12, color: C.textMute, fontFamily: mono, minWidth: 42, textAlign: "right" }}>{Math.round((value / max) * 100)}%</span>
  </div>
);

const Stat = ({ label, value, sub, color = C.accent }) => (
  <div style={{ background: C.card, borderRadius: 12, padding: "18px 20px", border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 11, color: C.textMute, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: mono, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{sub}</div>}
  </div>
);

const Modal = ({ open, onClose, title, width = 560, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28, width, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: C.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textMute, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const SearchBox = ({ value, onChange, placeholder = "Search..." }) => (
  <div style={{ position: "relative" }}>
    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textDim, fontSize: 14 }}>&#x2315;</span>
    <input style={{ ...inputS, paddingLeft: 34, width: 260 }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const DataTable = ({ columns, data, onRowClick }) => (
  <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}` }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font, fontSize: 13 }}>
      <thead>
        <tr style={{ background: C.surfaceAlt }}>
          {columns.map((col, i) => (
            <th key={i} style={{ padding: "10px 14px", textAlign: "left", color: C.textMute, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, borderBottom: `1px solid ${C.border}`, ...(col.width ? { width: col.width } : {}) }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: C.textDim }}>No records found</td></tr>}
        {data.map((row, ri) => (
          <tr key={ri} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? "pointer" : "default", borderBottom: `1px solid ${C.border}`, transition: "background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.surfaceAlt}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {columns.map((col, ci) => (
              <td key={ci} style={{ padding: "10px 14px", color: C.text }}>{col.render ? col.render(row) : row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [trials, setTrials] = useState(sampleTrials);
  const [patients, setPatients] = useState(samplePatients);
  const [etmfDocs, setEtmfDocs] = useState(() => generateEtmfDocs());
  const [page, setPage] = useState("dashboard");
  const [selectedTrialId, setSelectedTrialId] = useState(null);
  const [search, setSearch] = useState("");

  // eTMF state
  const [etmfTrialFilter, setEtmfTrialFilter] = useState("all");
  const [etmfZoneFilter, setEtmfZoneFilter] = useState("all");
  const [etmfStatusFilter, setEtmfStatusFilter] = useState("all");
  const [etmfSearch, setEtmfSearch] = useState("");
  const [etmfView, setEtmfView] = useState("explorer");
  const [expandedZone, setExpandedZone] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  // Modals
  const [trialModal, setTrialModal] = useState(false);
  const [patientModal, setPatientModal] = useState(false);
  const [editTrial, setEditTrial] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [uploadModal, setUploadModal] = useState(null);
  const [docDetailModal, setDocDetailModal] = useState(null);
  const [auditModal, setAuditModal] = useState(null);

  const selectedTrial = trials.find(t => t.id === selectedTrialId);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◫" },
    { id: "trials", label: "Trials", icon: "◆" },
    { id: "patients", label: "Patients", icon: "◉" },
    { id: "assessments", label: "Assessments", icon: "▦" },
    { id: "etmf", label: "eTMF", icon: "▤" },
    { id: "safety", label: "Safety", icon: "⚠" },
  ];

  // Handlers
  const saveTrial = (t) => {
    if (editTrial) setTrials(prev => prev.map(x => x.id === t.id ? t : x));
    else setTrials(prev => [...prev, { ...t, id: `T${String(prev.length + 1).padStart(3, "0")}` }]);
    setTrialModal(false); setEditTrial(null);
  };
  const savePatient = (p) => {
    if (editPatient) setPatients(prev => prev.map(x => x.id === p.id ? p : x));
    else {
      setPatients(prev => [...prev, { ...p, id: `P${String(prev.length + 1).padStart(3, "0")}` }]);
      setTrials(prev => prev.map(t => t.id === p.trialId ? { ...t, currentEnrollment: t.currentEnrollment + 1 } : t));
    }
    setPatientModal(false); setEditPatient(null);
  };
  const uploadDocument = (formData) => {
    const newDoc = {
      id: `DOC-${String(etmfDocs.length + 1).padStart(4, "0")}`,
      ...formData,
      uploadDate: new Date().toISOString().split("T")[0],
      locked: formData.status === "Final",
    };
    setEtmfDocs(prev => [...prev, newDoc]);
    setUploadModal(null);
  };

  // eTMF metrics
  const etmfMetrics = useMemo(() => {
    const tf = etmfTrialFilter === "all" ? null : etmfTrialFilter;
    const filtered = tf ? etmfDocs.filter(d => d.trialId === tf) : etmfDocs;
    const total = filtered.length;
    const final = filtered.filter(d => d.status === "Final").length;
    const draft = filtered.filter(d => d.status === "Draft").length;
    const review = filtered.filter(d => d.status === "Under Review").length;
    const superseded = filtered.filter(d => d.status === "Superseded").length;
    const zoneCompleteness = TMF_ZONES.map(zone => {
      const totalArtifacts = zone.sections.reduce((sum, s) => sum + s.artifacts.length, 0) * (tf ? 1 : trials.length);
      const uploaded = filtered.filter(d => d.zoneId === zone.id && d.status !== "Superseded").length;
      return { ...zone, totalArtifacts, uploaded, pct: totalArtifacts > 0 ? Math.round((uploaded / totalArtifacts) * 100) : 0 };
    });
    return { total, final, draft, review, superseded, zoneCompleteness };
  }, [etmfDocs, etmfTrialFilter, trials.length]);

  // ══════════════════════════════════════════════════════════
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: font, color: C.text }}>
      {/* SIDEBAR */}
      <nav style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, padding: "24px 0", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "0 20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, letterSpacing: 1.5, fontFamily: mono }}>TrialSphere</div>
          <div style={{ fontSize: 11, color: C.textMute, marginTop: 2 }}>eTMF | CTMS</div>
        </div>
        <div style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setPage(item.id); setSelectedTrialId(null); setSearch(""); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2, background: page === item.id ? C.accentSoft : "transparent", color: page === item.id ? C.accent : C.textMute, fontFamily: font, fontSize: 13, fontWeight: page === item.id ? 600 : 400, transition: "all 0.15s", textAlign: "left" }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.textDim }}>
          TMF Ref Model v3.3{"\n"}21 CFR Part 11
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", maxHeight: "100vh" }}>

        {/* ══ DASHBOARD ══ */}
        {page === "dashboard" && (<>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Dashboard</h1>
          <p style={{ color: C.textMute, margin: "0 0 24px", fontSize: 13 }}>Trial portfolio overview</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 28 }}>
            <Stat label="Active Trials" value={trials.filter(t => t.status !== "Completed").length} sub={`${trials.length} total`} color={C.accent} />
            <Stat label="Enrolled" value={trials.reduce((s, t) => s + t.currentEnrollment, 0)} sub={`of ${trials.reduce((s, t) => s + t.targetEnrollment, 0)} target`} color={C.green} />
            <Stat label="Patients" value={patients.length} sub={`${patients.filter(p => p.status === "Active").length} active`} color={C.purple} />
            <Stat label="Adverse Events" value={patients.reduce((s, p) => s + p.adverse, 0)} sub="total reported" color={C.red} />
            <Stat label="eTMF Documents" value={etmfDocs.filter(d => d.status !== "Superseded").length} sub={`${etmfMetrics.final} finalized`} color={C.cyan} />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>Active Studies</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginBottom: 28 }}>
            {trials.map(t => { const grp = INDICATION_GROUP(t.indication); return (
              <div key={t.id} onClick={() => { setSelectedTrialId(t.id); setPage("trials"); }}
                style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: mono, color: C.textDim }}>{t.id}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.35 }}>{t.name}</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <Badge bg={C.accentSoft} color={C.accent}>{t.phase}</Badge>
                  <Badge bg={grp.color + "20"} color={grp.color}>{grp.label}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.textMute, marginBottom: 8 }}>{t.indication} · {t.sites} sites</div>
                <ProgressBar value={t.currentEnrollment} max={t.targetEnrollment} color={C.green} />
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{t.currentEnrollment} / {t.targetEnrollment} enrolled</div>
              </div>
            ); })}
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>TMF Completeness</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {etmfMetrics.zoneCompleteness.map(z => (
              <div key={z.id} style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ color: z.color, fontSize: 14 }}>{z.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{z.name}</span>
                </div>
                <ProgressBar value={z.pct} max={100} color={z.pct >= 80 ? C.green : z.pct >= 50 ? C.amber : C.red} />
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>{z.uploaded} / {z.totalArtifacts} artifacts</div>
              </div>
            ))}
          </div>
        </>)}

        {/* ══ TRIALS LIST ══ */}
        {page === "trials" && !selectedTrialId && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Trials</h1>
              <p style={{ color: C.textMute, margin: "4px 0 0", fontSize: 13 }}>{trials.length} studies</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <SearchBox value={search} onChange={setSearch} placeholder="Search trials..." />
              <button style={btnS("primary")} onClick={() => { setEditTrial(null); setTrialModal(true); }}>+ New Trial</button>
            </div>
          </div>
          <DataTable columns={[
            { label: "ID", width: 60, render: r => <span style={{ fontFamily: mono, fontSize: 12, color: C.textDim }}>{r.id}</span> },
            { label: "Study", render: r => <span style={{ fontWeight: 600 }}>{r.name}</span> },
            { label: "Phase", width: 90, render: r => <Badge bg={C.accentSoft} color={C.accent}>{r.phase}</Badge> },
            { label: "Indication", width: 180, render: r => { const g = INDICATION_GROUP(r.indication); return <Badge bg={g.color + "20"} color={g.color}>{r.indication}</Badge>; } },
            { label: "Status", width: 140, render: r => <StatusBadge status={r.status} /> },
            { label: "Enrollment", width: 160, render: r => <ProgressBar value={r.currentEnrollment} max={r.targetEnrollment} color={C.green} /> },
          ]} data={trials.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.indication.toLowerCase().includes(search.toLowerCase()))}
          onRowClick={t => setSelectedTrialId(t.id)} />
        </>)}

        {/* ── TRIAL DETAIL ── */}
        {page === "trials" && selectedTrial && (<>
          <button style={{ ...btnS("ghost", "sm"), marginBottom: 16 }} onClick={() => setSelectedTrialId(null)}>← Back to Trials</button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{selectedTrial.name}</h1>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Badge bg={C.accentSoft} color={C.accent}>{selectedTrial.phase}</Badge>
                <StatusBadge status={selectedTrial.status} />
                {selectedTrial.regulatoryDesignation && <Badge bg={C.purpleSoft} color={C.purple}>{selectedTrial.regulatoryDesignation}</Badge>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={btnS("ghost", "sm")} onClick={() => { setEditTrial(selectedTrial); setTrialModal(true); }}>Edit</button>
              <button style={btnS("primary", "sm")} onClick={() => { setEditPatient(null); setPatientModal(true); }}>+ Enroll Patient</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
            <Stat label="Enrolled" value={selectedTrial.currentEnrollment} sub={`of ${selectedTrial.targetEnrollment}`} color={C.green} />
            <Stat label="Sites" value={selectedTrial.sites} color={C.accent} />
            <Stat label="AEs" value={patients.filter(p => p.trialId === selectedTrial.id).reduce((s, p) => s + p.adverse, 0)} color={C.red} />
            <Stat label="eTMF Docs" value={etmfDocs.filter(d => d.trialId === selectedTrial.id && d.status !== "Superseded").length} color={C.cyan} />
          </div>
          <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>Protocol Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, fontSize: 13 }}>
              {[["NCT ID", selectedTrial.nctId], ["IRB", selectedTrial.irbNumber], ["Sponsor", selectedTrial.sponsor], ["PI", selectedTrial.pi], ["Indication", selectedTrial.indication], ["Endpoint", selectedTrial.primaryEndpoint], ["Start", selectedTrial.startDate], ["End", selectedTrial.endDate], ["Imaging", selectedTrial.imagingRequired ? selectedTrial.imagingType : "None"]].map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 11, color: C.textDim, marginBottom: 2 }}>{k}</div><div>{v || "—"}</div></div>
              ))}
            </div>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px", color: C.textMute }}>Enrolled Patients</h3>
          <DataTable columns={[
            { label: "ID", width: 60, render: r => <span style={{ fontFamily: mono, fontSize: 12, color: C.textDim }}>{r.id}</span> },
            { label: "Name", render: r => <span style={{ fontWeight: 500 }}>{r.name}</span> },
            { label: "Age/Sex", width: 70, render: r => `${r.age}${r.sex}` },
            { label: "Status", width: 110, render: r => <StatusBadge status={r.status} /> },
            { label: "Genetic Marker", render: r => <span style={{ fontFamily: mono, fontSize: 12 }}>{r.geneticMarker || "—"}</span> },
            { label: "Visits", width: 55, key: "visits" },
            { label: "AEs", width: 45, render: r => <span style={{ color: r.adverse > 0 ? C.red : C.textDim }}>{r.adverse}</span> },
          ]} data={patients.filter(p => p.trialId === selectedTrial.id)} onRowClick={p => { setEditPatient(p); setPatientModal(true); }} />
        </>)}

        {/* ══ PATIENTS ══ */}
        {page === "patients" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div><h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Patients</h1><p style={{ color: C.textMute, margin: "4px 0 0", fontSize: 13 }}>{patients.length} subjects</p></div>
            <SearchBox value={search} onChange={setSearch} placeholder="Search patients..." />
          </div>
          <DataTable columns={[
            { label: "ID", width: 60, render: r => <span style={{ fontFamily: mono, fontSize: 12, color: C.textDim }}>{r.id}</span> },
            { label: "Name", render: r => <span style={{ fontWeight: 500 }}>{r.name}</span> },
            { label: "Trial", render: r => { const t = trials.find(t => t.id === r.trialId); return t ? <span style={{ fontSize: 12 }}>{t.name.split(":")[0]}</span> : "—"; } },
            { label: "Age/Sex", width: 70, render: r => `${r.age}${r.sex}` },
            { label: "Status", width: 110, render: r => <StatusBadge status={r.status} /> },
            { label: "Genetic Marker", render: r => <span style={{ fontFamily: mono, fontSize: 12 }}>{r.geneticMarker || "—"}</span> },
            { label: "Con Meds", render: r => <span style={{ fontSize: 12, color: C.textMute }}>{r.conMeds || "—"}</span> },
            { label: "AEs", width: 45, render: r => <span style={{ color: r.adverse > 0 ? C.red : C.textDim }}>{r.adverse}</span> },
          ]} data={patients.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))}
          onRowClick={p => { setEditPatient(p); setPatientModal(true); }} />
        </>)}

        {/* ══ ASSESSMENTS ══ */}
        {page === "assessments" && (<>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Assessments</h1>
          <p style={{ color: C.textMute, margin: "0 0 24px", fontSize: 13 }}>CNS-validated clinical assessment scores</p>
          {trials.map(t => {
            const tp = patients.filter(p => p.trialId === t.id);
            if (!tp.length) return null;
            const ind = t.indication.toLowerCase();
            const scales = [];
            if (/alzheimer/i.test(ind)) scales.push({ key: "mmse", label: "MMSE", thresholds: [24, 18] }, { key: "cdrSb", label: "CDR-SB", thresholds: [4.5, 9], invert: true });
            if (/parkinson/i.test(ind)) scales.push({ key: "updrs", label: "MDS-UPDRS", thresholds: [40, 80], invert: true });
            if (/depress|trd/i.test(ind)) scales.push({ key: "hamd", label: "HAMD-17", thresholds: [7, 17], invert: true });
            if (!scales.length) return null;
            return (
              <div key={t.id} style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>{t.name}</h3>
                <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: font }}>
                    <thead><tr style={{ background: C.surfaceAlt }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: C.textMute, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>Patient</th>
                      {scales.map(s => <th key={s.key} style={{ padding: "10px 14px", textAlign: "center", color: C.textMute, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{s.label}</th>)}
                    </tr></thead>
                    <tbody>{tp.map(p => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "10px 14px", fontWeight: 500 }}>{p.name}</td>
                        {scales.map(s => {
                          const val = p[s.key];
                          if (val == null) return <td key={s.key} style={{ textAlign: "center", color: C.textDim, padding: "10px 14px" }}>—</td>;
                          let color = C.green;
                          if (s.invert) { if (val >= s.thresholds[1]) color = C.red; else if (val >= s.thresholds[0]) color = C.amber; }
                          else { if (val <= s.thresholds[1]) color = C.red; else if (val <= s.thresholds[0]) color = C.amber; }
                          return <td key={s.key} style={{ textAlign: "center", padding: "10px 14px" }}><span style={{ ...pillS(color + "20", color), fontFamily: mono, minWidth: 36, justifyContent: "center" }}>{val}</span></td>;
                        })}
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>)}

        {/* ══ eTMF ══ */}
        {page === "etmf" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Electronic Trial Master File</h1>
              <p style={{ color: C.textMute, margin: "4px 0 0", fontSize: 13 }}>TMF Reference Model v3.3 · ICH E6(R3) Compliant</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["explorer", "list", "completeness"].map(v => (
                <button key={v} style={btnS(etmfView === v ? "primary" : "ghost", "sm")} onClick={() => setEtmfView(v)}>
                  {v === "explorer" ? "Explorer" : v === "list" ? "List View" : "Completeness"}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
            <Stat label="Total Docs" value={etmfMetrics.total} color={C.accent} />
            <Stat label="Finalized" value={etmfMetrics.final} color={C.green} />
            <Stat label="Under Review" value={etmfMetrics.review} color={C.purple} />
            <Stat label="Draft" value={etmfMetrics.draft} color={C.amber} />
            <Stat label="Superseded" value={etmfMetrics.superseded} color={C.red} />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <select style={{ ...selectS, width: 200 }} value={etmfTrialFilter} onChange={e => setEtmfTrialFilter(e.target.value)}>
              <option value="all">All Trials</option>
              {trials.map(t => <option key={t.id} value={t.id}>{t.id}: {t.name.split(":")[0]}</option>)}
            </select>
            <select style={{ ...selectS, width: 200 }} value={etmfZoneFilter} onChange={e => setEtmfZoneFilter(e.target.value)}>
              <option value="all">All TMF Zones</option>
              {TMF_ZONES.map(z => <option key={z.id} value={z.id}>{z.id} {z.name}</option>)}
            </select>
            <select style={{ ...selectS, width: 160 }} value={etmfStatusFilter} onChange={e => setEtmfStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              {["Final", "Draft", "Under Review", "Superseded"].map(s => <option key={s}>{s}</option>)}
            </select>
            <SearchBox value={etmfSearch} onChange={setEtmfSearch} placeholder="Search documents..." />
          </div>

          {/* EXPLORER VIEW */}
          {etmfView === "explorer" && (<div>
            {(etmfZoneFilter === "all" ? TMF_ZONES : TMF_ZONES.filter(z => z.id === etmfZoneFilter)).map(zone => {
              const zoneOpen = expandedZone === zone.id;
              const zoneDocs = etmfDocs.filter(d => d.zoneId === zone.id && (etmfTrialFilter === "all" || d.trialId === etmfTrialFilter));
              const zoneDocCount = zoneDocs.filter(d => d.status !== "Superseded").length;
              return (
                <div key={zone.id} style={{ marginBottom: 8 }}>
                  <button onClick={() => setExpandedZone(zoneOpen ? null : zone.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 18px", background: zoneOpen ? C.surfaceAlt : C.card, borderRadius: 10, border: `1px solid ${zoneOpen ? zone.color + "40" : C.border}`, cursor: "pointer", fontFamily: font, color: C.text, textAlign: "left", transition: "all 0.15s" }}>
                    <span style={{ color: zone.color, fontSize: 18, width: 24, textAlign: "center" }}>{zone.icon}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{zone.id} — {zone.name}</span>
                      <span style={{ fontSize: 12, color: C.textDim, marginLeft: 12 }}>{zone.sections.length} sections · {zoneDocCount} docs</span>
                    </span>
                    <span style={{ color: C.textDim, fontSize: 16, transform: zoneOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▸</span>
                  </button>
                  {zoneOpen && (<div style={{ paddingLeft: 20, marginTop: 4 }}>
                    {zone.sections.map(section => {
                      const secOpen = expandedSection === section.id;
                      const sectionDocs = zoneDocs.filter(d => d.sectionId === section.id && d.status !== "Superseded" && (etmfStatusFilter === "all" || d.status === etmfStatusFilter) && (!etmfSearch || d.artifactName.toLowerCase().includes(etmfSearch.toLowerCase()) || d.fileName.toLowerCase().includes(etmfSearch.toLowerCase())));
                      return (
                        <div key={section.id} style={{ marginBottom: 4 }}>
                          <button onClick={() => setExpandedSection(secOpen ? null : section.id)}
                            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: secOpen ? C.surface : "transparent", borderRadius: 8, border: `1px solid ${secOpen ? C.border : "transparent"}`, cursor: "pointer", fontFamily: font, color: C.text, textAlign: "left" }}>
                            <span style={{ color: C.textDim, fontSize: 14, transform: secOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▸</span>
                            <span style={{ fontFamily: mono, fontSize: 11, color: zone.color, minWidth: 40 }}>{section.id}</span>
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{section.name}</span>
                            <span style={{ fontSize: 11, color: C.textDim }}>{sectionDocs.length} / {section.artifacts.length}</span>
                          </button>
                          {secOpen && (<div style={{ paddingLeft: 28, paddingBottom: 8 }}>
                            {section.artifacts.map((art, ai) => {
                              const artDocs = sectionDocs.filter(d => d.artifactName === art);
                              const hasDoc = artDocs.length > 0;
                              return (
                                <div key={ai} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 6, marginBottom: 2, fontSize: 13, background: hasDoc ? "transparent" : "rgba(248,113,113,0.04)", borderLeft: `3px solid ${hasDoc ? C.green : C.red + "60"}` }}>
                                  <span style={{ color: hasDoc ? C.green : C.red, fontSize: 12 }}>{hasDoc ? "✓" : "○"}</span>
                                  <span style={{ flex: 1, color: hasDoc ? C.text : C.textMute }}>{art}</span>
                                  {artDocs.map(doc => (
                                    <span key={doc.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                      <StatusBadge status={doc.status} />
                                      <button style={{ ...btnS("ghost", "sm"), padding: "3px 8px", fontSize: 11 }} onClick={() => setDocDetailModal(doc)}>View</button>
                                      <button style={{ ...btnS("ghost", "sm"), padding: "3px 8px", fontSize: 11 }} onClick={() => setAuditModal(doc)}>Audit</button>
                                    </span>
                                  ))}
                                  {!hasDoc && (
                                    <button style={{ ...btnS("ghost", "sm"), padding: "3px 8px", fontSize: 11, color: C.accent }}
                                      onClick={() => setUploadModal({ trialId: etmfTrialFilter !== "all" ? etmfTrialFilter : trials[0]?.id, zoneId: zone.id, sectionId: section.id, artifactName: art })}>+ Upload</button>
                                  )}
                                </div>
                              );
                            })}
                          </div>)}
                        </div>
                      );
                    })}
                  </div>)}
                </div>
              );
            })}
          </div>)}

          {/* LIST VIEW */}
          {etmfView === "list" && (
            <DataTable columns={[
              { label: "ID", width: 85, render: r => <span style={{ fontFamily: mono, fontSize: 11, color: C.textDim }}>{r.id}</span> },
              { label: "Trial", width: 55, render: r => <span style={{ fontFamily: mono, fontSize: 11, color: C.accent }}>{r.trialId}</span> },
              { label: "Zone", width: 55, render: r => { const z = TMF_ZONES.find(z => z.id === r.zoneId); return <span style={{ color: z?.color, fontSize: 12 }}>{r.zoneId}</span>; } },
              { label: "Artifact", render: r => <span style={{ fontWeight: 500 }}>{r.artifactName}</span> },
              { label: "File", render: r => <span style={{ fontSize: 12, color: C.textMute, fontFamily: mono }}>{r.fileName.length > 35 ? r.fileName.slice(0, 35) + "..." : r.fileName}</span> },
              { label: "Ver", width: 45, render: r => <span style={{ fontFamily: mono, fontSize: 11 }}>{r.version}</span> },
              { label: "Status", width: 110, render: r => <StatusBadge status={r.status} /> },
              { label: "Date", width: 90, render: r => <span style={{ fontSize: 12, color: C.textMute }}>{r.uploadDate}</span> },
              { label: "By", width: 80, render: r => <span style={{ fontSize: 12 }}>{r.uploadedBy}</span> },
              { label: "", width: 28, render: r => r.locked ? <span style={{ color: C.amber, fontSize: 12 }}>&#x1F512;</span> : null },
            ]} data={etmfDocs.filter(d =>
              (etmfTrialFilter === "all" || d.trialId === etmfTrialFilter) &&
              (etmfZoneFilter === "all" || d.zoneId === etmfZoneFilter) &&
              (etmfStatusFilter === "all" || d.status === etmfStatusFilter) &&
              (!etmfSearch || d.artifactName.toLowerCase().includes(etmfSearch.toLowerCase()) || d.fileName.toLowerCase().includes(etmfSearch.toLowerCase()))
            ).sort((a, b) => b.uploadDate.localeCompare(a.uploadDate))} onRowClick={doc => setDocDetailModal(doc)} />
          )}

          {/* COMPLETENESS VIEW */}
          {etmfView === "completeness" && (<div>
            {(etmfTrialFilter === "all" ? trials : trials.filter(t => t.id === etmfTrialFilter)).map(trial => (
              <div key={trial.id} style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>
                  <span style={{ fontFamily: mono, color: C.accent, marginRight: 8 }}>{trial.id}</span>{trial.name}
                </h3>
                <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: font }}>
                    <thead><tr style={{ background: C.surfaceAlt }}>
                      {["Zone / Section", "Expected", "Uploaded", "Final", "Completeness"].map((h, i) => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: i > 0 && i < 4 ? "center" : "left", color: C.textMute, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, ...(i === 4 ? { width: 200 } : i > 0 ? { width: 80 } : {}) }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>{TMF_ZONES.map(zone => {
                      const zd = etmfDocs.filter(d => d.trialId === trial.id && d.zoneId === zone.id && d.status !== "Superseded");
                      const total = zone.sections.reduce((s, sec) => s + sec.artifacts.length, 0);
                      const uploaded = zd.length;
                      const finalized = zd.filter(d => d.status === "Final").length;
                      const pct = total > 0 ? Math.round((uploaded / total) * 100) : 0;
                      return (
                        <tr key={zone.id} style={{ borderBottom: `1px solid ${C.border}`, background: C.card }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600 }}><span style={{ color: zone.color, marginRight: 8 }}>{zone.icon}</span>{zone.name}</td>
                          <td style={{ textAlign: "center", fontFamily: mono }}>{total}</td>
                          <td style={{ textAlign: "center", fontFamily: mono }}>{uploaded}</td>
                          <td style={{ textAlign: "center", fontFamily: mono, color: C.green }}>{finalized}</td>
                          <td style={{ padding: "10px 14px" }}><ProgressBar value={pct} max={100} color={pct >= 80 ? C.green : pct >= 50 ? C.amber : C.red} /></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>)}
        </>)}

        {/* ══ SAFETY ══ */}
        {page === "safety" && (<>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Safety Monitor</h1>
          <p style={{ color: C.textMute, margin: "0 0 24px", fontSize: 13 }}>Adverse event tracking across all CNS trials</p>
          {trials.map(t => {
            const tp = patients.filter(p => p.trialId === t.id);
            const totalAE = tp.reduce((s, p) => s + p.adverse, 0);
            const withAE = tp.filter(p => p.adverse > 0);
            return (
              <div key={t.id} style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.textMute }}>{t.indication} · {tp.length} patients</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, fontFamily: mono, color: totalAE > 0 ? C.red : C.green }}>{totalAE}</div>
                    <div style={{ fontSize: 11, color: C.textDim }}>total AEs</div>
                  </div>
                </div>
                {withAE.length > 0 && (<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {withAE.map(p => <div key={p.id} style={{ ...pillS(C.redSoft, C.red), fontSize: 12 }}>{p.name}: {p.adverse} AE{p.adverse > 1 ? "s" : ""}</div>)}
                </div>)}
              </div>
            );
          })}
        </>)}
      </main>

      {/* ══ MODALS ══ */}

      {/* Trial Form */}
      <Modal open={trialModal} onClose={() => { setTrialModal(false); setEditTrial(null); }} title={editTrial ? "Edit Trial" : "New Trial"} width={620}>
        <TrialForm trial={editTrial} onSave={saveTrial} onClose={() => { setTrialModal(false); setEditTrial(null); }} />
      </Modal>

      {/* Patient Form */}
      <Modal open={patientModal} onClose={() => { setPatientModal(false); setEditPatient(null); }} title={editPatient ? "Edit Patient" : "Enroll Patient"} width={560}>
        <PatientForm patient={editPatient} trials={trials} defaultTrialId={selectedTrialId} onSave={savePatient} onClose={() => { setPatientModal(false); setEditPatient(null); }} />
      </Modal>

      {/* Upload Doc */}
      <Modal open={!!uploadModal} onClose={() => setUploadModal(null)} title="Upload Document" width={500}>
        {uploadModal && <UploadForm context={uploadModal} onUpload={uploadDocument} onClose={() => setUploadModal(null)} />}
      </Modal>

      {/* Doc Detail */}
      <Modal open={!!docDetailModal} onClose={() => setDocDetailModal(null)} title="Document Details" width={560}>
        {docDetailModal && <DocDetail doc={docDetailModal} trials={trials} onAudit={() => { setAuditModal(docDetailModal); setDocDetailModal(null); }} onClose={() => setDocDetailModal(null)} />}
      </Modal>

      {/* Audit Trail */}
      <Modal open={!!auditModal} onClose={() => setAuditModal(null)} title={auditModal ? `Audit Trail — ${auditModal.artifactName}` : "Audit Trail"} width={640}>
        {auditModal && <AuditTrail doc={auditModal} onClose={() => setAuditModal(null)} />}
      </Modal>
    </div>
  );
}

// ── FORM COMPONENTS ──────────────────────────────────────────

function TrialForm({ trial, onSave, onClose }) {
  const blank = { name: "", phase: "Phase II", status: "Recruiting", sponsor: "", pi: "", indication: CNS_INDICATIONS[0], startDate: "", endDate: "", targetEnrollment: 100, currentEnrollment: 0, sites: 1, primaryEndpoint: CNS_ENDPOINTS[0], nctId: "", irbNumber: "", regulatoryDesignation: "", imagingRequired: false, imagingType: "" };
  const [f, setF] = useState(trial || blank);
  const s = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  return (<>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Study Name</label><input style={inputS} value={f.name} onChange={e => s("name", e.target.value)} placeholder="STUDY-NAME: Full Title" /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Phase</label><select style={selectS} value={f.phase} onChange={e => s("phase", e.target.value)}>{["Phase I", "Phase I/II", "Phase II", "Phase II/III", "Phase III", "Phase IV"].map(p => <option key={p}>{p}</option>)}</select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Status</label><select style={selectS} value={f.status} onChange={e => s("status", e.target.value)}>{["Recruiting", "Active, Not Recruiting", "Completed", "Suspended"].map(st => <option key={st}>{st}</option>)}</select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Indication</label><select style={selectS} value={f.indication} onChange={e => s("indication", e.target.value)}>{CNS_INDICATIONS.map(i => <option key={i}>{i}</option>)}</select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Primary Endpoint</label><select style={selectS} value={f.primaryEndpoint} onChange={e => s("primaryEndpoint", e.target.value)}>{CNS_ENDPOINTS.map(ep => <option key={ep}>{ep}</option>)}</select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Sponsor</label><input style={inputS} value={f.sponsor} onChange={e => s("sponsor", e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>PI</label><input style={inputS} value={f.pi} onChange={e => s("pi", e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>NCT ID</label><input style={inputS} value={f.nctId} onChange={e => s("nctId", e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>IRB Number</label><input style={inputS} value={f.irbNumber} onChange={e => s("irbNumber", e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Regulatory Designation</label><select style={selectS} value={f.regulatoryDesignation} onChange={e => s("regulatoryDesignation", e.target.value)}><option value="">None</option>{["Breakthrough Therapy", "Fast Track", "Orphan Drug", "Priority Review", "Accelerated Approval"].map(r => <option key={r}>{r}</option>)}</select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Start Date</label><input style={inputS} type="date" value={f.startDate} onChange={e => s("startDate", e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>End Date</label><input style={inputS} type="date" value={f.endDate} onChange={e => s("endDate", e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Target Enrollment</label><input style={inputS} type="number" value={f.targetEnrollment} onChange={e => s("targetEnrollment", +e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Sites</label><input style={inputS} type="number" value={f.sites} onChange={e => s("sites", +e.target.value)} /></div>
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
      <button style={btnS("ghost")} onClick={onClose}>Cancel</button>
      <button style={btnS("primary")} onClick={() => onSave({ ...f, id: trial?.id || "" })}>{trial ? "Save" : "Create Trial"}</button>
    </div>
  </>);
}

function PatientForm({ patient, trials, defaultTrialId, onSave, onClose }) {
  const blank = { name: "", age: "", sex: "M", trialId: defaultTrialId || trials[0]?.id || "", status: "Active", enrollDate: new Date().toISOString().split("T")[0], visits: 0, adverse: 0, geneticMarker: "", conMeds: "", mmse: null, cdrSb: null, updrs: null, hamd: null };
  const [f, setF] = useState(patient || blank);
  const s = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  return (<>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Patient Name</label><input style={inputS} value={f.name} onChange={e => s("name", e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Age</label><input style={inputS} type="number" value={f.age} onChange={e => s("age", +e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Sex</label><select style={selectS} value={f.sex} onChange={e => s("sex", e.target.value)}><option value="M">Male</option><option value="F">Female</option></select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Trial</label><select style={selectS} value={f.trialId} onChange={e => s("trialId", e.target.value)}>{trials.map(t => <option key={t.id} value={t.id}>{t.id}: {t.name.split(":")[0]}</option>)}</select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Status</label><select style={selectS} value={f.status} onChange={e => s("status", e.target.value)}>{["Active", "Completed", "Screen Failed", "Withdrawn"].map(st => <option key={st}>{st}</option>)}</select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Genetic Marker</label><input style={inputS} value={f.geneticMarker} onChange={e => s("geneticMarker", e.target.value)} placeholder="e.g. APOE e4/e4" /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Concomitant Meds</label><input style={inputS} value={f.conMeds} onChange={e => s("conMeds", e.target.value)} /></div>
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
      <button style={btnS("ghost")} onClick={onClose}>Cancel</button>
      <button style={btnS("primary")} onClick={() => onSave({ ...f, id: patient?.id || "" })}>{patient ? "Save" : "Enroll"}</button>
    </div>
  </>);
}

function UploadForm({ context, onUpload, onClose }) {
  const [f, setF] = useState({ fileName: "", version: "1.0", status: "Draft", uploadedBy: "", fileSize: "245KB" });
  return (<>
    <div style={{ background: C.surfaceAlt, borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 12 }}>
      <div style={{ color: C.textMute, marginBottom: 4 }}>Uploading to:</div>
      <div style={{ color: C.text, fontWeight: 500 }}>{context.artifactName}</div>
      <div style={{ color: C.textDim, marginTop: 2 }}>Zone {context.zoneId} · Section {context.sectionId} · Trial {context.trialId}</div>
    </div>
    <div style={{ display: "grid", gap: 12 }}>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>File Name</label><input style={inputS} value={f.fileName} onChange={e => setF(p => ({ ...p, fileName: e.target.value }))} placeholder={`${context.artifactName.replace(/[^a-zA-Z0-9]/g, "_")}_${context.trialId}_v1.0.pdf`} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Version</label><input style={inputS} value={f.version} onChange={e => setF(p => ({ ...p, version: e.target.value }))} /></div>
        <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Status</label><select style={selectS} value={f.status} onChange={e => setF(p => ({ ...p, status: e.target.value }))}><option>Draft</option><option>Under Review</option><option>Final</option></select></div>
      </div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Uploaded By</label><input style={inputS} value={f.uploadedBy} onChange={e => setF(p => ({ ...p, uploadedBy: e.target.value }))} placeholder="Full name" /></div>
      <div style={{ border: `2px dashed ${C.border}`, borderRadius: 12, padding: 32, textAlign: "center", color: C.textDim, fontSize: 13, cursor: "pointer" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>&#128196;</div>
        <div>Drop file here or click to browse</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>PDF, DOCX, XLSX — Max 50MB</div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
      <button style={btnS("ghost")} onClick={onClose}>Cancel</button>
      <button style={btnS("primary")} onClick={() => onUpload({ ...context, fileName: f.fileName || `${context.artifactName.replace(/[^a-zA-Z0-9]/g, "_")}_${context.trialId}_v${f.version}.pdf`, version: f.version, status: f.status, uploadedBy: f.uploadedBy || "System", fileSize: f.fileSize })}>Upload Document</button>
    </div>
  </>);
}

function DocDetail({ doc, trials, onAudit, onClose }) {
  const zone = TMF_ZONES.find(z => z.id === doc.zoneId);
  const section = zone?.sections.find(s => s.id === doc.sectionId);
  const trial = trials.find(t => t.id === doc.trialId);
  return (<>
    <div style={{ background: C.surfaceAlt, borderRadius: 10, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{doc.artifactName}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <StatusBadge status={doc.status} />
        {doc.locked && <Badge bg={C.amberSoft} color={C.amber}>&#x1F512; Locked</Badge>}
        <Badge bg={zone?.color + "20"} color={zone?.color}>{zone?.name}</Badge>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 13 }}>
      {[["Document ID", doc.id], ["Trial", `${doc.trialId} — ${trial?.name?.split(":")[0] || ""}`], ["TMF Zone", `${doc.zoneId} — ${zone?.name}`], ["Section", `${doc.sectionId} — ${section?.name}`], ["File Name", doc.fileName], ["Version", doc.version], ["File Size", doc.fileSize], ["Uploaded By", doc.uploadedBy], ["Upload Date", doc.uploadDate], ["Status", doc.status]].map(([k, v]) => (
        <div key={k}><div style={{ fontSize: 11, color: C.textDim, marginBottom: 2 }}>{k}</div><div style={{ color: C.text, fontFamily: k === "File Name" ? mono : font, fontSize: k === "File Name" ? 12 : 13 }}>{v}</div></div>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
      <button style={btnS("ghost", "sm")} onClick={onAudit}>View Audit Trail</button>
      <button style={btnS("primary", "sm")} onClick={onClose}>Close</button>
    </div>
  </>);
}

function AuditTrail({ doc, onClose }) {
  const trail = [
    { ts: doc.uploadDate + " 09:12:34", user: doc.uploadedBy, action: "Document uploaded", detail: `Version ${doc.version} — ${doc.fileName}` },
    ...(doc.status === "Under Review" ? [{ ts: doc.uploadDate + " 14:23:11", user: doc.uploadedBy, action: "Status changed", detail: "Draft -> Under Review" }] : []),
    ...(doc.status === "Final" ? [
      { ts: doc.uploadDate + " 14:23:11", user: doc.uploadedBy, action: "Status changed", detail: "Draft -> Under Review" },
      { ts: doc.uploadDate + " 16:45:02", user: "QA Reviewer", action: "Document reviewed", detail: "Approved — no findings" },
      { ts: doc.uploadDate + " 17:01:33", user: "QA Reviewer", action: "Status changed", detail: "Under Review -> Final" },
      { ts: doc.uploadDate + " 17:01:34", user: "System", action: "Document locked", detail: "Locked per 21 CFR Part 11 — read-only" },
    ] : []),
    ...(doc.status === "Superseded" ? [{ ts: doc.uploadDate + " 10:00:00", user: "System", action: "Document superseded", detail: "Replaced by newer version" }] : []),
  ];
  return (<>
    <div style={{ background: C.surfaceAlt, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11, color: C.textDim }}>{doc.id} · {doc.fileName} · v{doc.version}</div>
    <div style={{ display: "flex", flexDirection: "column" }}>
      {trail.map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < trail.length - 1 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, marginTop: 5, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{e.action}</span>
              <span style={{ fontSize: 11, fontFamily: mono, color: C.textDim }}>{e.ts}</span>
            </div>
            <div style={{ fontSize: 12, color: C.textMute }}>{e.detail}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>By: {e.user}</div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
      <button style={btnS("primary", "sm")} onClick={onClose}>Close</button>
    </div>
  </>);
}
