// Case store for managing triage cases across the app
import { SYNTHETIC_CASES } from './demoMode';
import type { TriageCase, RiskLevel, CaseStatus } from './demoMode';

export type { TriageCase, RiskLevel, CaseStatus };

// In-memory store for cases
let cases: TriageCase[] = [...SYNTHETIC_CASES];
let listeners: (() => void)[] = [];

// Generate unique case ID
function generateCaseId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `CASE-${num}`;
}

// Generate unique patient ID
function generatePatientId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `PT-${num}`;
}

// Determine risk level from score
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// Subscribe to case changes
export function subscribeToCases(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

// Notify all listeners
function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Get all cases
export function getAllCases(): TriageCase[] {
  return [...cases].sort((a, b) => b.riskScore - a.riskScore);
}

// Get case by ID
export function getCaseById(id: string): TriageCase | undefined {
  return cases.find(c => c.id === id);
}

// Add a new case from intake form
export function addCase(intakeData: {
  patientName: string;
  patientId?: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  chiefComplaint: string;
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    painLevel?: number;
  };
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  riskScore: number;
}): TriageCase {
  const now = new Date().toISOString();
  const riskLevel = getRiskLevelFromScore(intakeData.riskScore);
  
  // Generate AI summary based on risk level
  let aiSummary = '';
  let aiConfidence = 0.85;
  
  if (riskLevel === 'high') {
    aiSummary = `**CRITICAL:** ${intakeData.age}${intakeData.sex} presenting with ${intakeData.chiefComplaint}. Vitals concerning: HR ${intakeData.vitals.heartRate}, BP ${intakeData.vitals.bloodPressure}, SpO2 ${intakeData.vitals.oxygenSaturation}%. **Recommend:** Immediate evaluation, continuous monitoring.`;
    aiConfidence = 0.92;
  } else if (riskLevel === 'medium') {
    aiSummary = `**MODERATE:** ${intakeData.age}${intakeData.sex} with ${intakeData.chiefComplaint}. Some abnormal vitals noted. **Recommend:** Priority evaluation within 30 minutes, reassess vitals.`;
    aiConfidence = 0.82;
  } else {
    aiSummary = `**LOW PRIORITY:** ${intakeData.age}${intakeData.sex} with ${intakeData.chiefComplaint}. Stable vitals. **Recommend:** Standard evaluation, may wait if higher priority cases present.`;
    aiConfidence = 0.88;
  }

  const newCase: TriageCase = {
    id: generateCaseId(),
    patientId: intakeData.patientId || generatePatientId(),
    patientName: intakeData.patientName,
    age: intakeData.age,
    sex: intakeData.sex,
    chiefComplaint: intakeData.chiefComplaint,
    vitals: intakeData.vitals,
    medicalHistory: intakeData.medicalHistory,
    currentMedications: intakeData.currentMedications,
    allergies: intakeData.allergies,
    riskScore: intakeData.riskScore,
    riskLevel,
    aiSummary,
    aiConfidence,
    status: 'new',
    arrivalTime: now,
    lastUpdated: now,
    timeline: [
      {
        id: `evt-${Date.now()}`,
        timestamp: now,
        event: riskLevel === 'high' ? 'Case created - HIGH PRIORITY' : 'Case created',
        user: 'Triage System',
        role: 'triage_nurse'
      }
    ]
  };

  cases = [newCase, ...cases];
  notifyListeners();
  
  return newCase;
}

// Update case status
export function updateCaseStatus(caseId: string, status: CaseStatus, assignedTo?: string): void {
  cases = cases.map(c => {
    if (c.id === caseId) {
      const now = new Date().toISOString();
      return {
        ...c,
        status,
        assignedTo: assignedTo || c.assignedTo,
        lastUpdated: now,
        timeline: [
          ...c.timeline,
          {
            id: `evt-${Date.now()}`,
            timestamp: now,
            event: `Status changed to ${status}${assignedTo ? `, assigned to ${assignedTo}` : ''}`,
            user: 'Triage System',
            role: 'triage_nurse'
          }
        ]
      };
    }
    return c;
  });
  notifyListeners();
}

// Escalate case
export function escalateCase(caseId: string): void {
  updateCaseStatus(caseId, 'escalated');
}

// Get cases by status
export function getCasesByStatus(status: CaseStatus): TriageCase[] {
  return cases.filter(c => c.status === status);
}

// Get high-risk new cases (for alerts)
export function getHighRiskNewCases(): TriageCase[] {
  return cases.filter(c => c.riskLevel === 'high' && c.status === 'new');
}

// Get recent cases (last hour)
export function getRecentCases(minutes: number = 60): TriageCase[] {
  const cutoff = new Date(Date.now() - minutes * 60000).toISOString();
  return cases.filter(c => c.arrivalTime >= cutoff);
}

// Get stats
export function getCaseStats() {
  const high = cases.filter(c => c.riskLevel === 'high').length;
  const medium = cases.filter(c => c.riskLevel === 'medium').length;
  const low = cases.filter(c => c.riskLevel === 'low').length;
  const newCases = cases.filter(c => c.status === 'new').length;
  const inProgress = cases.filter(c => c.status === 'in-progress').length;
  const escalated = cases.filter(c => c.status === 'escalated').length;
  const completed = cases.filter(c => c.status === 'completed').length;
  
  // Calculate average wait time for active cases
  const activeCases = cases.filter(c => c.status !== 'completed');
  const avgWaitTime = activeCases.length > 0
    ? Math.floor(activeCases.reduce((sum, c) => {
        const waitMs = Date.now() - new Date(c.arrivalTime).getTime();
        return sum + waitMs / 60000;
      }, 0) / activeCases.length)
    : 0;

  return {
    total: cases.length,
    high,
    medium,
    low,
    newCases,
    inProgress,
    escalated,
    completed,
    avgWaitTime
  };
}
