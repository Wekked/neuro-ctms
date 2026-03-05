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

const RECRUITMENT_SOURCES = [
  "Physician Referral", "ClinicalTrials.gov", "Community Outreach", "Patient Advocacy Group",
  "Social Media Campaign", "EHR Pre-Screening", "Self-Referral", "Site Database",
  "Memory Clinic Referral", "Movement Disorder Clinic", "Neurology Network", "Print Advertisement",
];

const SITE_LIST = [
  { siteId: "068", name: "Johns Hopkins CNS Research", city: "Baltimore, MD" },
  { siteId: "012", name: "UCSF Memory & Aging Center", city: "San Francisco, CA" },
  { siteId: "022", name: "Mayo Clinic Movement Disorders", city: "Rochester, MN" },
  { siteId: "004", name: "McLean Hospital TRD Unit", city: "Belmont, MA" },
  { siteId: "017", name: "Cleveland Clinic Epilepsy Center", city: "Cleveland, OH" },
  { siteId: "031", name: "Mass General Neuroscience", city: "Boston, MA" },
  { siteId: "045", name: "Columbia University ADRC", city: "New York, NY" },
  { siteId: "009", name: "Northwestern Cognitive Neurology", city: "Chicago, IL" },
  { siteId: "055", name: "Stanford Movement Disorders", city: "Palo Alto, CA" },
  { siteId: "073", name: "Duke Psychiatry Research", city: "Durham, NC" },
  { siteId: "038", name: "Yale Epilepsy Program", city: "New Haven, CT" },
  { siteId: "061", name: "UCLA Neuropsych Research", city: "Los Angeles, CA" },
];

const samplePatients = [
  // T001 - Alzheimer's (target: 1200, sites: 68)
  { id: "T001-MW-068-001", name: "T001-MW-068-001", age: 72, sex: "F", trialId: "T001", status: "Active", enrollDate: "2024-09-12", visits: 8, adverse: 1, geneticMarker: "APOE e4/e4", conMeds: "Donepezil 10mg", mmse: 22, cdrSb: 4.5, updrs: null, hamd: null, siteId: "068", recruitmentSource: "Memory Clinic Referral", screenDate: "2024-08-20", screenResult: "Passed", randomized: true, randomizedDate: "2024-09-12", completedStudy: false },
  { id: "T001-HC-012-002", name: "T001-HC-012-002", age: 68, sex: "M", trialId: "T001", status: "Active", enrollDate: "2024-10-03", visits: 6, adverse: 0, geneticMarker: "APOE e3/e4", conMeds: "Memantine 10mg", mmse: 24, cdrSb: 3.0, updrs: null, hamd: null, siteId: "012", recruitmentSource: "ClinicalTrials.gov", screenDate: "2024-09-15", screenResult: "Passed", randomized: true, randomizedDate: "2024-10-03", completedStudy: false },
  { id: "T001-AB-045-003", name: "T001-AB-045-003", age: 75, sex: "M", trialId: "T001", status: "Screen Failed", enrollDate: null, visits: 1, adverse: 0, geneticMarker: "APOE e3/e3", conMeds: "Aricept 5mg", mmse: 27, cdrSb: 1.0, updrs: null, hamd: null, siteId: "045", recruitmentSource: "Patient Advocacy Group", screenDate: "2024-11-02", screenResult: "Failed - CDR-SB below threshold", randomized: false, randomizedDate: null, completedStudy: false },
  { id: "T001-KL-009-004", name: "T001-KL-009-004", age: 70, sex: "F", trialId: "T001", status: "Active", enrollDate: "2024-12-01", visits: 3, adverse: 0, geneticMarker: "APOE e4/e4", conMeds: "Donepezil 10mg", mmse: 21, cdrSb: 5.0, updrs: null, hamd: null, siteId: "009", recruitmentSource: "EHR Pre-Screening", screenDate: "2024-11-10", screenResult: "Passed", randomized: true, randomizedDate: "2024-12-01", completedStudy: false },
  { id: "T001-RP-068-005", name: "T001-RP-068-005", age: 66, sex: "M", trialId: "T001", status: "Screen Failed", enrollDate: null, visits: 1, adverse: 0, geneticMarker: "APOE e3/e4", conMeds: "None", mmse: 26, cdrSb: 2.0, updrs: null, hamd: null, siteId: "068", recruitmentSource: "Physician Referral", screenDate: "2025-01-05", screenResult: "Failed - Amyloid PET negative", randomized: false, randomizedDate: null, completedStudy: false },
  { id: "T001-EM-031-006", name: "T001-EM-031-006", age: 73, sex: "F", trialId: "T001", status: "Withdrawn", enrollDate: "2024-08-15", visits: 4, adverse: 1, geneticMarker: "APOE e4/e4", conMeds: "Galantamine 16mg", mmse: 20, cdrSb: 5.5, updrs: null, hamd: null, siteId: "031", recruitmentSource: "Neurology Network", screenDate: "2024-07-22", screenResult: "Passed", randomized: true, randomizedDate: "2024-08-15", completedStudy: false },
  { id: "T001-DW-012-007", name: "T001-DW-012-007", age: 69, sex: "M", trialId: "T001", status: "Screen Failed", enrollDate: null, visits: 1, adverse: 0, geneticMarker: "—", conMeds: "None", mmse: 28, cdrSb: 0.5, updrs: null, hamd: null, siteId: "012", recruitmentSource: "Community Outreach", screenDate: "2024-12-20", screenResult: "Failed - MMSE too high", randomized: false, randomizedDate: null, completedStudy: false },

  // T002 - Parkinson's (target: 180, sites: 22)
  { id: "T002-JP-022-001", name: "T002-JP-022-001", age: 64, sex: "M", trialId: "T002", status: "Completed", enrollDate: "2023-11-01", visits: 14, adverse: 2, geneticMarker: "LRRK2 G2019S", conMeds: "Carbidopa-Levodopa", mmse: null, cdrSb: null, updrs: 38, hamd: null, siteId: "022", recruitmentSource: "Movement Disorder Clinic", screenDate: "2023-10-10", screenResult: "Passed", randomized: true, randomizedDate: "2023-11-01", completedStudy: true },
  { id: "T002-LS-055-002", name: "T002-LS-055-002", age: 58, sex: "F", trialId: "T002", status: "Completed", enrollDate: "2023-12-05", visits: 14, adverse: 0, geneticMarker: "LRRK2 G2019S", conMeds: "Ropinirole 4mg", mmse: null, cdrSb: null, updrs: 32, hamd: null, siteId: "055", recruitmentSource: "Site Database", screenDate: "2023-11-15", screenResult: "Passed", randomized: true, randomizedDate: "2023-12-05", completedStudy: true },
  { id: "T002-RN-022-003", name: "T002-RN-022-003", age: 61, sex: "M", trialId: "T002", status: "Active", enrollDate: "2024-01-20", visits: 10, adverse: 1, geneticMarker: "GBA N370S", conMeds: "Levodopa/Carbidopa", mmse: null, cdrSb: null, updrs: 42, hamd: null, siteId: "022", recruitmentSource: "Physician Referral", screenDate: "2024-01-05", screenResult: "Passed", randomized: true, randomizedDate: "2024-01-20", completedStudy: false },
  { id: "T002-AF-055-004", name: "T002-AF-055-004", age: 55, sex: "F", trialId: "T002", status: "Screen Failed", enrollDate: null, visits: 1, adverse: 0, geneticMarker: "—", conMeds: "Pramipexole 1mg", mmse: null, cdrSb: null, updrs: 18, hamd: null, siteId: "055", recruitmentSource: "ClinicalTrials.gov", screenDate: "2024-02-10", screenResult: "Failed - UPDRS too low", randomized: false, randomizedDate: null, completedStudy: false },

  // T003 - TRD (target: 90, sites: 8)
  { id: "T003-SM-004-001", name: "T003-SM-004-001", age: 41, sex: "F", trialId: "T003", status: "Active", enrollDate: "2024-06-15", visits: 4, adverse: 0, geneticMarker: "—", conMeds: "None", mmse: null, cdrSb: null, updrs: null, hamd: 28, siteId: "004", recruitmentSource: "Physician Referral", screenDate: "2024-05-28", screenResult: "Passed", randomized: true, randomizedDate: "2024-06-15", completedStudy: false },
  { id: "T003-JR-073-002", name: "T003-JR-073-002", age: 35, sex: "M", trialId: "T003", status: "Active", enrollDate: "2024-07-10", visits: 3, adverse: 0, geneticMarker: "—", conMeds: "Lithium 600mg", mmse: null, cdrSb: null, updrs: null, hamd: 25, siteId: "073", recruitmentSource: "Social Media Campaign", screenDate: "2024-06-20", screenResult: "Passed", randomized: true, randomizedDate: "2024-07-10", completedStudy: false },
  { id: "T003-CT-004-003", name: "T003-CT-004-003", age: 29, sex: "F", trialId: "T003", status: "Screen Failed", enrollDate: null, visits: 1, adverse: 0, geneticMarker: "—", conMeds: "Fluoxetine 40mg", mmse: null, cdrSb: null, updrs: null, hamd: 14, siteId: "004", recruitmentSource: "Self-Referral", screenDate: "2024-08-01", screenResult: "Failed - HAMD below threshold", randomized: false, randomizedDate: null, completedStudy: false },
  { id: "T003-WP-073-004", name: "T003-WP-073-004", age: 47, sex: "M", trialId: "T003", status: "Completed", enrollDate: "2024-04-01", visits: 7, adverse: 1, geneticMarker: "—", conMeds: "Venlafaxine 225mg", mmse: null, cdrSb: null, updrs: null, hamd: 30, siteId: "073", recruitmentSource: "Patient Advocacy Group", screenDate: "2024-03-12", screenResult: "Passed", randomized: true, randomizedDate: "2024-04-01", completedStudy: true },

  // T004 - Epilepsy (target: 320, sites: 34)
  { id: "T004-DN-017-001", name: "T004-DN-017-001", age: 34, sex: "M", trialId: "T004", status: "Active", enrollDate: "2024-11-01", visits: 3, adverse: 1, geneticMarker: "SCN2A variant", conMeds: "Levetiracetam 1000mg", mmse: null, cdrSb: null, updrs: null, hamd: null, siteId: "017", recruitmentSource: "Neurology Network", screenDate: "2024-10-15", screenResult: "Passed", randomized: true, randomizedDate: "2024-11-01", completedStudy: false },
  { id: "T004-ML-038-002", name: "T004-ML-038-002", age: 28, sex: "F", trialId: "T004", status: "Active", enrollDate: "2024-12-05", visits: 2, adverse: 0, geneticMarker: "—", conMeds: "Lamotrigine 200mg", mmse: null, cdrSb: null, updrs: null, hamd: null, siteId: "038", recruitmentSource: "EHR Pre-Screening", screenDate: "2024-11-18", screenResult: "Passed", randomized: true, randomizedDate: "2024-12-05", completedStudy: false },
  { id: "T004-BT-017-003", name: "T004-BT-017-003", age: 42, sex: "M", trialId: "T004", status: "Screen Failed", enrollDate: null, visits: 1, adverse: 0, geneticMarker: "—", conMeds: "Carbamazepine 800mg", mmse: null, cdrSb: null, updrs: null, hamd: null, siteId: "017", recruitmentSource: "Physician Referral", screenDate: "2025-01-10", screenResult: "Failed - Seizure frequency too low", randomized: false, randomizedDate: null, completedStudy: false },
  { id: "T004-AK-061-004", name: "T004-AK-061-004", age: 31, sex: "F", trialId: "T004", status: "Active", enrollDate: "2025-01-20", visits: 1, adverse: 0, geneticMarker: "SCN1A variant", conMeds: "Valproate 1000mg", mmse: null, cdrSb: null, updrs: null, hamd: null, siteId: "061", recruitmentSource: "ClinicalTrials.gov", screenDate: "2025-01-05", screenResult: "Passed", randomized: true, randomizedDate: "2025-01-20", completedStudy: false },
];

// ── EDC: VISIT SCHEDULE TEMPLATES (per indication) ──────────
const VISIT_TEMPLATES = {
  "Alzheimer's Disease": [
    { visitId: "SCR", name: "Screening", week: -4, window: [-6, -2], forms: ["Demographics", "Medical History", "MMSE", "CDR-SB", "ADAS-Cog", "Vital Signs", "Lab Panel", "Amyloid PET", "MRI Brain", "Concomitant Medications", "Inclusion/Exclusion Criteria"] },
    { visitId: "BL", name: "Baseline / Randomization", week: 0, window: [0, 0], forms: ["MMSE", "CDR-SB", "ADAS-Cog", "NPI", "ADCS-ADL", "Vital Signs", "ECG", "IP Dispensing", "Randomization"] },
    { visitId: "V1", name: "Week 4", week: 4, window: [3, 5], forms: ["MMSE", "Vital Signs", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V2", name: "Week 13", week: 13, window: [11, 15], forms: ["MMSE", "CDR-SB", "Vital Signs", "Lab Panel", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V3", name: "Week 26", week: 26, window: [24, 28], forms: ["MMSE", "CDR-SB", "ADAS-Cog", "NPI", "ADCS-ADL", "Vital Signs", "Lab Panel", "MRI Brain", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V4", name: "Week 52", week: 52, window: [50, 54], forms: ["MMSE", "CDR-SB", "ADAS-Cog", "NPI", "ADCS-ADL", "Vital Signs", "Lab Panel", "ECG", "Amyloid PET", "MRI Brain", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V5", name: "Week 78 (Primary)", week: 78, window: [76, 80], forms: ["MMSE", "CDR-SB", "ADAS-Cog", "NPI", "ADCS-ADL", "Vital Signs", "Lab Panel", "ECG", "Amyloid PET", "MRI Brain", "Adverse Events", "Concomitant Medications", "IP Return"] },
    { visitId: "ET", name: "Early Termination", week: null, window: null, forms: ["MMSE", "CDR-SB", "Vital Signs", "Lab Panel", "Adverse Events", "Concomitant Medications", "IP Return", "End of Study Form"] },
  ],
  "Parkinson's Disease": [
    { visitId: "SCR", name: "Screening", week: -2, window: [-4, -1], forms: ["Demographics", "Medical History", "MDS-UPDRS", "H&Y Stage", "Vital Signs", "Lab Panel", "DaTscan", "Concomitant Medications", "Inclusion/Exclusion Criteria"] },
    { visitId: "BL", name: "Baseline", week: 0, window: [0, 0], forms: ["MDS-UPDRS", "PDQ-39", "Vital Signs", "ECG", "IP Dispensing", "Randomization"] },
    { visitId: "V1", name: "Week 4", week: 4, window: [3, 5], forms: ["MDS-UPDRS", "Vital Signs", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V2", name: "Week 12", week: 12, window: [10, 14], forms: ["MDS-UPDRS", "PDQ-39", "Vital Signs", "Lab Panel", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V3", name: "Week 24", week: 24, window: [22, 26], forms: ["MDS-UPDRS", "H&Y Stage", "PDQ-39", "Vital Signs", "Lab Panel", "DaTscan", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V4", name: "Week 40 (Primary)", week: 40, window: [38, 42], forms: ["MDS-UPDRS", "H&Y Stage", "PDQ-39", "Vital Signs", "Lab Panel", "ECG", "DaTscan", "Adverse Events", "Concomitant Medications", "IP Return"] },
    { visitId: "ET", name: "Early Termination", week: null, window: null, forms: ["MDS-UPDRS", "Vital Signs", "Lab Panel", "Adverse Events", "IP Return", "End of Study Form"] },
  ],
  "Treatment-Resistant Depression": [
    { visitId: "SCR", name: "Screening", week: -2, window: [-3, -1], forms: ["Demographics", "Medical History", "MADRS", "HAMD-17", "PHQ-9", "C-SSRS", "Vital Signs", "Lab Panel", "fMRI", "Concomitant Medications", "Inclusion/Exclusion Criteria"] },
    { visitId: "BL", name: "Baseline / Dosing Day", week: 0, window: [0, 0], forms: ["MADRS", "HAMD-17", "C-SSRS", "Vital Signs", "IP Administration", "Randomization"] },
    { visitId: "V1", name: "Day 1 (Post-Dose)", week: 0, window: [0, 0], forms: ["MADRS", "Vital Signs", "Adverse Events", "Dissociation Scale"] },
    { visitId: "V2", name: "Week 1", week: 1, window: [0.5, 1.5], forms: ["MADRS", "HAMD-17", "C-SSRS", "Vital Signs", "Adverse Events", "Concomitant Medications"] },
    { visitId: "V3", name: "Week 4", week: 4, window: [3, 5], forms: ["MADRS", "HAMD-17", "PHQ-9", "C-SSRS", "CGI-S", "Vital Signs", "Lab Panel", "Adverse Events", "Concomitant Medications"] },
    { visitId: "V4", name: "Week 8 (Primary)", week: 8, window: [7, 9], forms: ["MADRS", "HAMD-17", "PHQ-9", "C-SSRS", "CGI-S", "Vital Signs", "Lab Panel", "fMRI", "Adverse Events", "Concomitant Medications"] },
    { visitId: "FU", name: "Week 12 Follow-Up", week: 12, window: [11, 13], forms: ["MADRS", "HAMD-17", "C-SSRS", "Vital Signs", "Adverse Events"] },
    { visitId: "ET", name: "Early Termination", week: null, window: null, forms: ["MADRS", "HAMD-17", "C-SSRS", "Vital Signs", "Lab Panel", "Adverse Events", "End of Study Form"] },
  ],
  "Epilepsy / Focal Seizures": [
    { visitId: "SCR", name: "Screening", week: -4, window: [-6, -2], forms: ["Demographics", "Medical History", "Seizure Diary Baseline", "Vital Signs", "Lab Panel", "EEG", "Concomitant Medications", "Inclusion/Exclusion Criteria"] },
    { visitId: "BL", name: "Baseline", week: 0, window: [0, 0], forms: ["Seizure Diary", "QOLIE-31", "Vital Signs", "IP Dispensing", "Randomization"] },
    { visitId: "V1", name: "Week 2 (Titration)", week: 2, window: [1, 3], forms: ["Seizure Diary", "Vital Signs", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V2", name: "Week 4", week: 4, window: [3, 5], forms: ["Seizure Diary", "Vital Signs", "Lab Panel", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V3", name: "Week 8", week: 8, window: [7, 9], forms: ["Seizure Diary", "QOLIE-31", "CGI-S", "Vital Signs", "Adverse Events", "Concomitant Medications", "IP Accountability"] },
    { visitId: "V4", name: "Week 12 (Primary)", week: 12, window: [11, 13], forms: ["Seizure Diary", "QOLIE-31", "CGI-S", "Vital Signs", "Lab Panel", "EEG", "Adverse Events", "Concomitant Medications", "IP Return"] },
    { visitId: "ET", name: "Early Termination", week: null, window: null, forms: ["Seizure Diary", "Vital Signs", "Lab Panel", "Adverse Events", "IP Return", "End of Study Form"] },
  ],
};
const getVisitTemplate = (indication) => VISIT_TEMPLATES[indication] || VISIT_TEMPLATES["Alzheimer's Disease"];

// Generate sample EDC visit data for existing patients
const generateEdcVisits = () => {
  const visits = [];
  samplePatients.forEach(p => {
    const trial = sampleTrials.find(t => t.id === p.trialId);
    if (!trial) return;
    const template = getVisitTemplate(trial.indication);
    const enrollDate = new Date(p.enrollDate);
    template.forEach((vt, vi) => {
      if (vi >= p.visits || vt.visitId === "ET") return;
      const visitDate = new Date(enrollDate);
      if (vt.week !== null) visitDate.setDate(visitDate.getDate() + vt.week * 7);
      const isCompleted = vi < p.visits;
      const formStatuses = {};
      vt.forms.forEach(form => {
        if (isCompleted) {
          formStatuses[form] = Math.random() > 0.1 ? "Complete" : "Incomplete";
        } else {
          formStatuses[form] = "Not Started";
        }
      });
      visits.push({
        id: `${p.id}-${vt.visitId}`,
        patientId: p.id,
        trialId: p.trialId,
        visitId: vt.visitId,
        visitName: vt.name,
        scheduledDate: visitDate.toISOString().split("T")[0],
        actualDate: isCompleted ? visitDate.toISOString().split("T")[0] : null,
        status: isCompleted ? "Completed" : (vi === p.visits ? "Scheduled" : "Upcoming"),
        forms: formStatuses,
        queries: isCompleted ? Math.floor(Math.random() * 3) : 0,
        sdv: isCompleted ? (Math.random() > 0.3 ? "Verified" : "Pending") : "N/A",
      });
    });
    // Add next scheduled visit
    if (p.status === "Active" && p.visits < template.length - 1) {
      const nextVt = template[p.visits];
      if (nextVt.visitId !== "ET") {
        const nextDate = new Date(enrollDate);
        if (nextVt.week !== null) nextDate.setDate(nextDate.getDate() + nextVt.week * 7);
        const formStatuses = {};
        nextVt.forms.forEach(form => { formStatuses[form] = "Not Started"; });
        visits.push({
          id: `${p.id}-${nextVt.visitId}`,
          patientId: p.id, trialId: p.trialId,
          visitId: nextVt.visitId, visitName: nextVt.name,
          scheduledDate: nextDate.toISOString().split("T")[0],
          actualDate: null, status: "Scheduled",
          forms: formStatuses, queries: 0, sdv: "N/A",
        });
      }
    }
  });
  return visits;
};

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
  const [edcVisits, setEdcVisits] = useState(() => generateEdcVisits());
  const [edcTrialFilter, setEdcTrialFilter] = useState("all");
  const [edcPatientFilter, setEdcPatientFilter] = useState("all");
  const [edcSelectedVisit, setEdcSelectedVisit] = useState(null);
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
    { id: "edc", label: "EDC", icon: "⊞" },
    { id: "recruitment", label: "Recruitment", icon: "⊕" },
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
    if (editPatient) setPatients(prev => prev.map(x => x.id === editPatient.id ? { ...p, id: editPatient.id } : x));
    else {
      setPatients(prev => [...prev, p]);
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
            { label: "Subject ID", render: r => <span style={{ fontWeight: 500, fontFamily: mono, fontSize: 12 }}>{r.name}</span> },
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
            { label: "Subject ID", render: r => <span style={{ fontWeight: 500, fontFamily: mono, fontSize: 12 }}>{r.name}</span> },
            { label: "Trial", render: r => { const t = trials.find(t => t.id === r.trialId); return t ? <span style={{ fontSize: 12 }}>{t.name.split(":")[0]}</span> : "—"; } },
            { label: "Age/Sex", width: 70, render: r => `${r.age}${r.sex}` },
            { label: "Status", width: 110, render: r => <StatusBadge status={r.status} /> },
            { label: "Genetic Marker", render: r => <span style={{ fontFamily: mono, fontSize: 12 }}>{r.geneticMarker || "—"}</span> },
            { label: "Con Meds", render: r => <span style={{ fontSize: 12, color: C.textMute }}>{r.conMeds || "—"}</span> },
            { label: "AEs", width: 45, render: r => <span style={{ color: r.adverse > 0 ? C.red : C.textDim }}>{r.adverse}</span> },
          ]} data={patients.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))}
          onRowClick={p => { setEditPatient(p); setPatientModal(true); }} />
        </>)}

        {/* ══ EDC — Electronic Data Capture ══ */}
        {page === "edc" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Electronic Data Capture</h1>
              <p style={{ color: C.textMute, margin: "4px 0 0", fontSize: 13 }}>Visit scheduling · CRF tracking · Source data verification</p>
            </div>
          </div>

          {/* EDC Stats */}
          {(() => {
            const tf = edcTrialFilter === "all" ? null : edcTrialFilter;
            const fv = edcVisits.filter(v => !tf || v.trialId === tf).filter(v => edcPatientFilter === "all" || v.patientId === edcPatientFilter);
            const completed = fv.filter(v => v.status === "Completed").length;
            const scheduled = fv.filter(v => v.status === "Scheduled").length;
            const totalForms = fv.reduce((s, v) => s + Object.keys(v.forms).length, 0);
            const completeForms = fv.reduce((s, v) => s + Object.values(v.forms).filter(f => f === "Complete").length, 0);
            const openQueries = fv.reduce((s, v) => s + v.queries, 0);
            const pendingSdv = fv.filter(v => v.sdv === "Pending").length;
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
                <Stat label="Visits Completed" value={completed} sub={`${fv.length} total`} color={C.green} />
                <Stat label="Scheduled" value={scheduled} sub="upcoming visits" color={C.accent} />
                <Stat label="CRF Completion" value={totalForms > 0 ? `${Math.round((completeForms / totalForms) * 100)}%` : "—"} sub={`${completeForms} / ${totalForms} forms`} color={C.cyan} />
                <Stat label="Open Queries" value={openQueries} sub={openQueries > 0 ? "action required" : "none"} color={openQueries > 0 ? C.amber : C.green} />
                <Stat label="Pending SDV" value={pendingSdv} sub={pendingSdv > 0 ? "needs verification" : "all verified"} color={pendingSdv > 0 ? C.purple : C.green} />
              </div>
            );
          })()}

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <select style={{ ...selectS, width: 220 }} value={edcTrialFilter} onChange={e => { setEdcTrialFilter(e.target.value); setEdcPatientFilter("all"); setEdcSelectedVisit(null); }}>
              <option value="all">All Trials</option>
              {trials.map(t => <option key={t.id} value={t.id}>{t.id}: {t.name.split(":")[0]}</option>)}
            </select>
            <select style={{ ...selectS, width: 200 }} value={edcPatientFilter} onChange={e => { setEdcPatientFilter(e.target.value); setEdcSelectedVisit(null); }}>
              <option value="all">All Patients</option>
              {patients.filter(p => edcTrialFilter === "all" || p.trialId === edcTrialFilter).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Visit Detail Modal */}
          {edcSelectedVisit && (() => {
            const v = edcSelectedVisit;
            const p = patients.find(pt => pt.id === v.patientId);
            const t = trials.find(tr => tr.id === v.trialId);
            const template = getVisitTemplate(t?.indication);
            const vtDef = template?.find(vt => vt.visitId === v.visitId);
            return (
              <div style={{ background: C.card, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>{v.visitName}</span>
                      <StatusBadge status={v.status} />
                      {v.sdv !== "N/A" && <Badge bg={v.sdv === "Verified" ? C.greenSoft : C.amberSoft} color={v.sdv === "Verified" ? C.green : C.amber}>SDV: {v.sdv}</Badge>}
                    </div>
                    <div style={{ fontSize: 13, color: C.textMute }}>{p?.name} · {t?.name?.split(":")[0]} · {t?.indication}</div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
                      Scheduled: {v.scheduledDate}{v.actualDate ? ` · Actual: ${v.actualDate}` : ""}
                      {vtDef?.window && ` · Window: Week ${vtDef.window[0]}–${vtDef.window[1]}`}
                    </div>
                  </div>
                  <button style={btnS("ghost", "sm")} onClick={() => setEdcSelectedVisit(null)}>✕ Close</button>
                </div>

                {/* CRF Form List */}
                <h4 style={{ fontSize: 13, fontWeight: 600, color: C.textMute, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.8 }}>Case Report Forms ({Object.keys(v.forms).length})</h4>
                <div style={{ display: "grid", gap: 6 }}>
                  {Object.entries(v.forms).map(([formName, status]) => (
                    <div key={formName} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 8,
                      background: status === "Complete" ? C.greenSoft : status === "Incomplete" ? C.amberSoft : C.surfaceAlt,
                      border: `1px solid ${status === "Complete" ? C.green + "30" : status === "Incomplete" ? C.amber + "30" : C.border}`,
                    }}>
                      <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>
                        {status === "Complete" ? "✓" : status === "Incomplete" ? "◐" : "○"}
                      </span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: status === "Not Started" ? C.textMute : C.text }}>{formName}</span>
                      <Badge bg={status === "Complete" ? C.greenSoft : status === "Incomplete" ? C.amberSoft : C.accentSoft}
                        color={status === "Complete" ? C.green : status === "Incomplete" ? C.amber : C.textDim}>{status}</Badge>
                      {v.status !== "Completed" && status !== "Complete" && (
                        <button style={{ ...btnS("primary", "sm"), padding: "4px 10px", fontSize: 11 }}
                          onClick={() => {
                            setEdcVisits(prev => prev.map(ev => ev.id === v.id ? { ...ev, forms: { ...ev.forms, [formName]: "Complete" } } : ev));
                            setEdcSelectedVisit(prev => ({ ...prev, forms: { ...prev.forms, [formName]: "Complete" } }));
                          }}>
                          {status === "Not Started" ? "Start" : "Complete"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Complete Visit button */}
                {v.status !== "Completed" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                    <button style={btnS("primary")} onClick={() => {
                      const allComplete = Object.values(v.forms).every(f => f === "Complete");
                      const updatedForms = {};
                      Object.keys(v.forms).forEach(f => { updatedForms[f] = "Complete"; });
                      setEdcVisits(prev => prev.map(ev => ev.id === v.id ? { ...ev, status: "Completed", actualDate: new Date().toISOString().split("T")[0], forms: allComplete ? ev.forms : updatedForms, sdv: "Pending" } : ev));
                      setEdcSelectedVisit(null);
                    }}>
                      Complete Visit
                    </button>
                  </div>
                )}

                {/* Queries */}
                {v.queries > 0 && (
                  <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: C.amberSoft, border: `1px solid ${C.amber}30` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.amber, marginBottom: 4 }}>⚠ {v.queries} Open {v.queries === 1 ? "Query" : "Queries"}</div>
                    <div style={{ fontSize: 12, color: C.textMute }}>Data clarification required. Review flagged fields and resolve before source data verification.</div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Visit Schedule by Patient */}
          {edcPatientFilter !== "all" ? (() => {
            const p = patients.find(pt => pt.id === edcPatientFilter);
            const t = trials.find(tr => tr.id === p?.trialId);
            const template = getVisitTemplate(t?.indication);
            const pVisits = edcVisits.filter(v => v.patientId === edcPatientFilter);
            if (!p || !t) return null;
            return (
              <div>
                <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, fontFamily: mono }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: C.textMute, marginTop: 2 }}>{t.name} · {t.indication} · Enrolled: {p.enrollDate}</div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  {/* Timeline */}
                  <div style={{ position: "relative", paddingLeft: 24 }}>
                    <div style={{ position: "absolute", left: 7, top: 6, bottom: 6, width: 2, background: C.border }} />
                    {template.filter(vt => vt.visitId !== "ET").map((vt, i) => {
                      const visit = pVisits.find(v => v.visitId === vt.visitId);
                      const isComplete = visit?.status === "Completed";
                      const isScheduled = visit?.status === "Scheduled";
                      const isMissing = !visit && i < (p.visits || 0);
                      const dotColor = isComplete ? C.green : isScheduled ? C.accent : C.border;
                      const completedForms = visit ? Object.values(visit.forms).filter(f => f === "Complete").length : 0;
                      const totalForms = vt.forms.length;
                      return (
                        <div key={vt.visitId} style={{ display: "flex", gap: 14, marginBottom: 16, position: "relative", cursor: visit ? "pointer" : "default" }}
                          onClick={() => visit && setEdcSelectedVisit(visit)}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: dotColor, border: `2px solid ${C.bg}`, flexShrink: 0, zIndex: 1, marginTop: 2 }} />
                          <div style={{ flex: 1, padding: "8px 14px", borderRadius: 8, background: isScheduled ? C.accentSoft : isComplete ? C.surfaceAlt : "transparent", border: `1px solid ${isScheduled ? C.accent + "30" : isComplete ? C.border : C.border}`, transition: "all 0.15s" }}
                            onMouseEnter={e => visit && (e.currentTarget.style.borderColor = C.accent)}
                            onMouseLeave={e => visit && (e.currentTarget.style.borderColor = isScheduled ? C.accent + "30" : C.border)}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <span style={{ fontFamily: mono, fontSize: 11, color: dotColor, marginRight: 8 }}>{vt.visitId}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: visit ? C.text : C.textDim }}>{vt.name}</span>
                                {vt.week !== null && <span style={{ fontSize: 11, color: C.textDim, marginLeft: 8 }}>Week {vt.week}</span>}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {visit && <span style={{ fontSize: 11, color: C.textMute }}>{completedForms}/{totalForms} forms</span>}
                                {visit && <StatusBadge status={visit.status} />}
                                {visit?.sdv === "Pending" && <Badge bg={C.amberSoft} color={C.amber}>SDV</Badge>}
                                {!visit && <span style={{ fontSize: 11, color: C.textDim }}>—</span>}
                              </div>
                            </div>
                            {visit?.scheduledDate && <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
                              {isComplete ? `Completed: ${visit.actualDate}` : `Scheduled: ${visit.scheduledDate}`}
                              {vt.window && ` · Window: Wk ${vt.window[0]}–${vt.window[1]}`}
                            </div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })() : (
            /* All-patient visit overview */
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>
                {edcTrialFilter !== "all" ? `Visit Schedule — ${trials.find(t => t.id === edcTrialFilter)?.name?.split(":")[0] || ""}` : "Upcoming & Recent Visits"}
              </h3>
              <DataTable columns={[
                { label: "Visit ID", width: 70, render: r => <span style={{ fontFamily: mono, fontSize: 11, color: C.accent }}>{r.visitId}</span> },
                { label: "Visit", render: r => <span style={{ fontWeight: 500 }}>{r.visitName}</span> },
                { label: "Subject", render: r => { const p = patients.find(pt => pt.id === r.patientId); return <span style={{ fontSize: 12, fontFamily: mono }}>{p?.name || r.patientId}</span>; } },
                { label: "Trial", width: 55, render: r => <span style={{ fontFamily: mono, fontSize: 11, color: C.textDim }}>{r.trialId}</span> },
                { label: "Scheduled", width: 100, render: r => <span style={{ fontSize: 12, color: C.textMute }}>{r.scheduledDate}</span> },
                { label: "Status", width: 110, render: r => <StatusBadge status={r.status} /> },
                { label: "CRFs", width: 80, render: r => {
                  const complete = Object.values(r.forms).filter(f => f === "Complete").length;
                  const total = Object.keys(r.forms).length;
                  return <span style={{ fontFamily: mono, fontSize: 11, color: complete === total ? C.green : C.textMute }}>{complete}/{total}</span>;
                }},
                { label: "Queries", width: 60, render: r => <span style={{ color: r.queries > 0 ? C.amber : C.textDim, fontFamily: mono, fontSize: 11 }}>{r.queries}</span> },
                { label: "SDV", width: 80, render: r => r.sdv !== "N/A" ? <Badge bg={r.sdv === "Verified" ? C.greenSoft : C.amberSoft} color={r.sdv === "Verified" ? C.green : C.amber}>{r.sdv}</Badge> : <span style={{ color: C.textDim }}>—</span> },
              ]} data={edcVisits
                .filter(v => (edcTrialFilter === "all" || v.trialId === edcTrialFilter))
                .sort((a, b) => {
                  const order = { "Scheduled": 0, "Completed": 1, "Upcoming": 2 };
                  return (order[a.status] ?? 3) - (order[b.status] ?? 3) || a.scheduledDate.localeCompare(b.scheduledDate);
                })}
              onRowClick={v => setEdcSelectedVisit(v)} />
            </div>
          )}
        </>)}

        {/* ══ RECRUITMENT ══ */}
        {page === "recruitment" && (() => {
          const recTrialFilter = edcTrialFilter; // reuse filter state
          const setRecTrialFilter = setEdcTrialFilter;
          const tf = recTrialFilter === "all" ? null : recTrialFilter;
          const fp = tf ? patients.filter(p => p.trialId === tf) : patients;

          const totalScreened = fp.filter(p => p.screenDate).length;
          const screenFailed = fp.filter(p => p.screenResult && p.screenResult.startsWith("Failed")).length;
          const randomized = fp.filter(p => p.randomized).length;
          const completedStudy = fp.filter(p => p.completedStudy).length;
          const withdrawn = fp.filter(p => p.status === "Withdrawn").length;
          const active = fp.filter(p => p.status === "Active").length;
          const screenFailRate = totalScreened > 0 ? Math.round((screenFailed / totalScreened) * 100) : 0;
          const randomizedRate = totalScreened > 0 ? Math.round((randomized / totalScreened) * 100) : 0;
          const completionRate = randomized > 0 ? Math.round((completedStudy / randomized) * 100) : 0;
          const withdrawalRate = randomized > 0 ? Math.round((withdrawn / randomized) * 100) : 0;

          // By source
          const bySource = {};
          fp.forEach(p => { const src = p.recruitmentSource || "Unknown"; bySource[src] = (bySource[src] || 0) + 1; });
          const sourceEntries = Object.entries(bySource).sort((a, b) => b[1] - a[1]);

          // By site
          const bySite = {};
          fp.forEach(p => {
            const sid = p.siteId || "Unknown";
            if (!bySite[sid]) bySite[sid] = { screened: 0, failed: 0, randomized: 0, completed: 0, active: 0 };
            bySite[sid].screened++;
            if (p.screenResult?.startsWith("Failed")) bySite[sid].failed++;
            if (p.randomized) bySite[sid].randomized++;
            if (p.completedStudy) bySite[sid].completed++;
            if (p.status === "Active") bySite[sid].active++;
          });
          const siteEntries = Object.entries(bySite).sort((a, b) => b[1].screened - a[1].screened);

          // By trial
          const byTrial = {};
          trials.forEach(t => {
            const tp = patients.filter(p => p.trialId === t.id);
            byTrial[t.id] = {
              name: t.name, indication: t.indication, target: t.targetEnrollment,
              screened: tp.filter(p => p.screenDate).length,
              failed: tp.filter(p => p.screenResult?.startsWith("Failed")).length,
              randomized: tp.filter(p => p.randomized).length,
              completed: tp.filter(p => p.completedStudy).length,
              active: tp.filter(p => p.status === "Active").length,
            };
          });

          // Monthly enrollment trend (by randomizedDate)
          const monthlyEnroll = {};
          fp.filter(p => p.randomizedDate).forEach(p => {
            const mo = p.randomizedDate.slice(0, 7);
            monthlyEnroll[mo] = (monthlyEnroll[mo] || 0) + 1;
          });
          const monthKeys = Object.keys(monthlyEnroll).sort();
          const maxMonthly = Math.max(...Object.values(monthlyEnroll), 1);

          // Screen failure reasons
          const failReasons = {};
          fp.filter(p => p.screenResult?.startsWith("Failed")).forEach(p => {
            const reason = p.screenResult.replace("Failed - ", "");
            failReasons[reason] = (failReasons[reason] || 0) + 1;
          });
          const failEntries = Object.entries(failReasons).sort((a, b) => b[1] - a[1]);

          return (<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Recruitment</h1>
                <p style={{ color: C.textMute, margin: "4px 0 0", fontSize: 13 }}>Screening · Enrollment · Retention across studies and sites</p>
              </div>
              <select style={{ ...selectS, width: 240 }} value={recTrialFilter} onChange={e => setRecTrialFilter(e.target.value)}>
                <option value="all">All Trials</option>
                {trials.map(t => <option key={t.id} value={t.id}>{t.id}: {t.name.split(":")[0]}</option>)}
              </select>
            </div>

            {/* Funnel Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
              <Stat label="Screened" value={totalScreened} sub="total screened" color={C.accent} />
              <Stat label="Screen Failure" value={`${screenFailRate}%`} sub={`${screenFailed} of ${totalScreened} failed`} color={screenFailRate > 30 ? C.red : screenFailRate > 20 ? C.amber : C.green} />
              <Stat label="Randomized" value={randomized} sub={`${randomizedRate}% of screened`} color={C.green} />
              <Stat label="Completed Study" value={`${completionRate}%`} sub={`${completedStudy} of ${randomized} randomized`} color={completionRate >= 80 ? C.green : completionRate >= 60 ? C.amber : C.red} />
              <Stat label="Withdrawn" value={`${withdrawalRate}%`} sub={`${withdrawn} of ${randomized}`} color={withdrawalRate > 15 ? C.red : withdrawalRate > 5 ? C.amber : C.green} />
              <Stat label="Active" value={active} sub="currently on-study" color={C.cyan} />
            </div>

            {/* Recruitment Funnel */}
            <div style={{ background: C.card, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 18px", color: C.textMute }}>Recruitment Funnel</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Screened", value: totalScreened, color: C.accent, pct: 100 },
                  { label: "Screen Passed", value: totalScreened - screenFailed, color: C.cyan, pct: totalScreened > 0 ? ((totalScreened - screenFailed) / totalScreened) * 100 : 0 },
                  { label: "Randomized", value: randomized, color: C.green, pct: totalScreened > 0 ? (randomized / totalScreened) * 100 : 0 },
                  { label: "Active", value: active, color: C.purple, pct: totalScreened > 0 ? (active / totalScreened) * 100 : 0 },
                  { label: "Completed", value: completedStudy, color: C.amber, pct: totalScreened > 0 ? (completedStudy / totalScreened) * 100 : 0 },
                ].map((step, i) => (
                  <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 12, color: C.textMute, width: 110, textAlign: "right" }}>{step.label}</span>
                    <div style={{ flex: 1, height: 28, borderRadius: 6, background: C.border, overflow: "hidden", position: "relative" }}>
                      <div style={{ width: `${step.pct}%`, height: "100%", background: step.color, borderRadius: 6, transition: "width 0.6s ease", minWidth: step.value > 0 ? 2 : 0 }} />
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 600, fontFamily: mono, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{step.value}</span>
                    </div>
                    <span style={{ fontSize: 12, fontFamily: mono, color: C.textDim, width: 42, textAlign: "right" }}>{Math.round(step.pct)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Enrollment by Month */}
              <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>Monthly Randomizations</h3>
                {monthKeys.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {monthKeys.map(mo => (
                      <div key={mo} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, fontFamily: mono, color: C.textDim, width: 60 }}>{mo}</span>
                        <div style={{ flex: 1, height: 18, borderRadius: 4, background: C.border, overflow: "hidden" }}>
                          <div style={{ width: `${(monthlyEnroll[mo] / maxMonthly) * 100}%`, height: "100%", background: C.green, borderRadius: 4, transition: "width 0.4s" }} />
                        </div>
                        <span style={{ fontSize: 12, fontFamily: mono, color: C.text, width: 24, textAlign: "right" }}>{monthlyEnroll[mo]}</span>
                      </div>
                    ))}
                  </div>
                ) : <div style={{ color: C.textDim, fontSize: 13 }}>No randomizations recorded</div>}
              </div>

              {/* Recruitment Source */}
              <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>Recruitment Source</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {sourceEntries.map(([src, count]) => (
                    <div key={src} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{src}</span>
                      <div style={{ width: 120, height: 14, borderRadius: 3, background: C.border, overflow: "hidden" }}>
                        <div style={{ width: `${(count / fp.length) * 100}%`, height: "100%", background: C.purple, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: mono, color: C.textMute, width: 24, textAlign: "right" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {/* Screen Failure Reasons */}
              <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>Screen Failure Reasons</h3>
                {failEntries.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {failEntries.map(([reason, count]) => (
                      <div key={reason} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: C.redSoft, border: `1px solid ${C.red}20` }}>
                        <span style={{ fontSize: 13, color: C.text }}>{reason}</span>
                        <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: C.red }}>{count}</span>
                      </div>
                    ))}
                  </div>
                ) : <div style={{ color: C.textDim, fontSize: 13 }}>No screen failures</div>}
              </div>

              {/* Retention summary */}
              <div style={{ background: C.card, borderRadius: 12, padding: 20, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>Retention Summary</h3>
                {[
                  { label: "On-Study (Active)", value: active, total: randomized, color: C.green },
                  { label: "Completed Protocol", value: completedStudy, total: randomized, color: C.cyan },
                  { label: "Withdrawn / Lost", value: withdrawn, total: randomized, color: C.red },
                ].map(r => (
                  <div key={r.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.textMute }}>{r.label}</span>
                      <span style={{ fontFamily: mono, color: r.color }}>{r.value} / {r.total} ({r.total > 0 ? Math.round((r.value / r.total) * 100) : 0}%)</span>
                    </div>
                    <ProgressBar value={r.value} max={r.total || 1} color={r.color} />
                  </div>
                ))}
              </div>
            </div>

            {/* By Trial */}
            {recTrialFilter === "all" && (<>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>Recruitment by Trial</h3>
              <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 20 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: font }}>
                  <thead><tr style={{ background: C.surfaceAlt }}>
                    {["Trial", "Target", "Screened", "Screen Fail %", "Randomized", "Rand. Rate", "Active", "Completed", "Completion %"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: h === "Trial" ? "left" : "center", color: C.textMute, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{trials.map(t => {
                    const d = byTrial[t.id];
                    const sfr = d.screened > 0 ? Math.round((d.failed / d.screened) * 100) : 0;
                    const rr = d.screened > 0 ? Math.round((d.randomized / d.screened) * 100) : 0;
                    const cr = d.randomized > 0 ? Math.round((d.completed / d.randomized) * 100) : 0;
                    return (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "10px 14px" }}><span style={{ fontFamily: mono, fontSize: 11, color: C.accent, marginRight: 6 }}>{t.id}</span><span style={{ fontWeight: 500 }}>{t.name.split(":")[0]}</span></td>
                        <td style={{ textAlign: "center", fontFamily: mono }}>{d.target}</td>
                        <td style={{ textAlign: "center", fontFamily: mono }}>{d.screened}</td>
                        <td style={{ textAlign: "center" }}><span style={{ ...pillS(sfr > 30 ? C.redSoft : sfr > 20 ? C.amberSoft : C.greenSoft, sfr > 30 ? C.red : sfr > 20 ? C.amber : C.green), fontFamily: mono }}>{sfr}%</span></td>
                        <td style={{ textAlign: "center", fontFamily: mono, color: C.green }}>{d.randomized}</td>
                        <td style={{ textAlign: "center" }}><span style={{ ...pillS(C.greenSoft, C.green), fontFamily: mono }}>{rr}%</span></td>
                        <td style={{ textAlign: "center", fontFamily: mono }}>{d.active}</td>
                        <td style={{ textAlign: "center", fontFamily: mono }}>{d.completed}</td>
                        <td style={{ textAlign: "center" }}><span style={{ ...pillS(cr >= 80 ? C.greenSoft : cr >= 50 ? C.amberSoft : C.accentSoft, cr >= 80 ? C.green : cr >= 50 ? C.amber : C.accent), fontFamily: mono }}>{cr}%</span></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            </>)}

            {/* By Site */}
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px", color: C.textMute }}>Recruitment by Site</h3>
            <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: font }}>
                <thead><tr style={{ background: C.surfaceAlt }}>
                  {["Site", "Location", "Screened", "Failed", "SF %", "Randomized", "Active", "Completed"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: h === "Site" || h === "Location" ? "left" : "center", color: C.textMute, fontSize: 11, textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{siteEntries.map(([sid, d]) => {
                  const site = SITE_LIST.find(s => s.siteId === sid);
                  const sfr = d.screened > 0 ? Math.round((d.failed / d.screened) * 100) : 0;
                  return (
                    <tr key={sid} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 14px" }}><span style={{ fontFamily: mono, fontSize: 12, color: C.accent }}>{sid}</span>{site ? <span style={{ marginLeft: 8, fontSize: 12 }}>{site.name}</span> : ""}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: C.textMute }}>{site?.city || "—"}</td>
                      <td style={{ textAlign: "center", fontFamily: mono }}>{d.screened}</td>
                      <td style={{ textAlign: "center", fontFamily: mono, color: d.failed > 0 ? C.red : C.textDim }}>{d.failed}</td>
                      <td style={{ textAlign: "center" }}><span style={{ ...pillS(sfr > 40 ? C.redSoft : sfr > 25 ? C.amberSoft : C.greenSoft, sfr > 40 ? C.red : sfr > 25 ? C.amber : C.green), fontFamily: mono }}>{sfr}%</span></td>
                      <td style={{ textAlign: "center", fontFamily: mono, color: C.green }}>{d.randomized}</td>
                      <td style={{ textAlign: "center", fontFamily: mono }}>{d.active}</td>
                      <td style={{ textAlign: "center", fontFamily: mono }}>{d.completed}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </>);
        })()}

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
                        <td style={{ padding: "10px 14px", fontWeight: 500, fontFamily: mono, fontSize: 12 }}>{p.name}</td>
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
                  {withAE.map(p => <div key={p.id} style={{ ...pillS(C.redSoft, C.red), fontSize: 12, fontFamily: mono }}>{p.name}: {p.adverse} AE{p.adverse > 1 ? "s" : ""}</div>)}
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
  const blank = { name: "", age: "", sex: "M", trialId: defaultTrialId || trials[0]?.id || "", status: "Active", enrollDate: new Date().toISOString().split("T")[0], visits: 0, adverse: 0, geneticMarker: "", conMeds: "", mmse: null, cdrSb: null, updrs: null, hamd: null, initials: "", siteNumber: "" };
  const [f, setF] = useState(patient || blank);
  const s = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  // Auto-generate subject ID from components
  const subjectId = f.name && patient ? f.name : (f.trialId && f.initials && f.siteNumber ? `${f.trialId}-${f.initials.toUpperCase()}-${f.siteNumber.padStart(3, "0")}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}` : "");
  return (<>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {patient ? (
        <div style={{ gridColumn: "1 / -1" }}><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Subject ID</label><input style={{ ...inputS, background: C.surfaceAlt, color: C.textDim }} value={f.name} readOnly /></div>
      ) : (<>
        <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Subject Initials</label><input style={inputS} value={f.initials || ""} onChange={e => s("initials", e.target.value.toUpperCase().slice(0, 3))} placeholder="e.g. MW" maxLength={3} /></div>
        <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Site Number</label><input style={inputS} value={f.siteNumber || ""} onChange={e => s("siteNumber", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 068" maxLength={3} /></div>
        {subjectId && <div style={{ gridColumn: "1 / -1", background: C.surfaceAlt, borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          <span style={{ fontSize: 11, color: C.textMute, marginRight: 8 }}>Generated ID:</span>
          <span style={{ fontFamily: mono, color: C.accent, fontWeight: 600 }}>{subjectId}</span>
        </div>}
      </>)}
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Age</label><input style={inputS} type="number" value={f.age} onChange={e => s("age", +e.target.value)} /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Sex</label><select style={selectS} value={f.sex} onChange={e => s("sex", e.target.value)}><option value="M">Male</option><option value="F">Female</option></select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Trial</label><select style={selectS} value={f.trialId} onChange={e => s("trialId", e.target.value)}>{trials.map(t => <option key={t.id} value={t.id}>{t.id}: {t.name.split(":")[0]}</option>)}</select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Status</label><select style={selectS} value={f.status} onChange={e => s("status", e.target.value)}>{["Active", "Completed", "Screen Failed", "Withdrawn"].map(st => <option key={st}>{st}</option>)}</select></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Genetic Marker</label><input style={inputS} value={f.geneticMarker} onChange={e => s("geneticMarker", e.target.value)} placeholder="e.g. APOE e4/e4" /></div>
      <div><label style={{ fontSize: 11, color: C.textMute, display: "block", marginBottom: 4 }}>Concomitant Meds</label><input style={inputS} value={f.conMeds} onChange={e => s("conMeds", e.target.value)} /></div>
    </div>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
      <button style={btnS("ghost")} onClick={onClose}>Cancel</button>
      <button style={btnS("primary")} onClick={() => {
        const finalName = patient ? f.name : subjectId;
        onSave({ ...f, name: finalName, id: patient?.id || finalName });
      }}>{patient ? "Save" : "Enroll"}</button>
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
