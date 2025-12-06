// Demo mode utilities and synthetic data
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || 
  new URLSearchParams(window.location.search).get('demo') === 'true';

export type RiskLevel = 'high' | 'medium' | 'low';
export type CaseStatus = 'new' | 'in-progress' | 'completed' | 'escalated';
export type UserRole = 'triage_nurse' | 'doctor' | 'admin';

export interface Vitals {
  heartRate: number;
  bloodPressure: string;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  painLevel?: number;
}

export interface TriageCase {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  chiefComplaint: string;
  vitals: Vitals;
  medicalHistory: string;
  currentMedications: string;
  allergies: string;
  riskScore: number;
  riskLevel: RiskLevel;
  aiSummary: string;
  aiConfidence: number;
  status: CaseStatus;
  assignedTo?: string;
  arrivalTime: string;
  lastUpdated: string;
  attachments?: string[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  user: string;
  role: UserRole;
}

export const SYNTHETIC_CASES: TriageCase[] = [
  {
    id: 'CASE-001',
    patientId: 'PT-7821',
    patientName: 'John D.',
    age: 68,
    sex: 'M',
    chiefComplaint: 'Severe chest pain radiating to left arm, shortness of breath',
    vitals: {
      heartRate: 112,
      bloodPressure: '160/95',
      temperature: 98.6,
      respiratoryRate: 24,
      oxygenSaturation: 92,
      painLevel: 9
    },
    medicalHistory: 'Hypertension, Type 2 Diabetes, Previous MI (2019)',
    currentMedications: 'Metformin, Lisinopril, Aspirin',
    allergies: 'Penicillin',
    riskScore: 92,
    riskLevel: 'high',
    aiSummary: '**CRITICAL:** 68M presenting with classic acute coronary syndrome symptoms. Chest pain + SOB + cardiac history = high MI probability. Tachycardia (112), elevated BP, reduced O2 sat (92%). **Recommend:** Immediate ECG, troponin, cardiology consult.',
    aiConfidence: 0.95,
    status: 'new',
    arrivalTime: new Date(Date.now() - 15 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 15 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-001',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        event: 'Case created',
        user: 'Nurse Martinez',
        role: 'triage_nurse'
      }
    ]
  },
  {
    id: 'CASE-002',
    patientId: 'PT-5492',
    patientName: 'Maria G.',
    age: 34,
    sex: 'F',
    chiefComplaint: 'Severe abdominal pain, nausea, vomiting for 6 hours',
    vitals: {
      heartRate: 98,
      bloodPressure: '128/82',
      temperature: 101.2,
      respiratoryRate: 18,
      oxygenSaturation: 97,
      painLevel: 8
    },
    medicalHistory: 'Appendectomy (2015), No chronic conditions',
    currentMedications: 'None',
    allergies: 'None known',
    riskScore: 76,
    riskLevel: 'high',
    aiSummary: '**URGENT:** 34F with acute abdomen, fever (101.2°F), persistent vomiting. RLQ tenderness likely. Differential: appendicitis vs ovarian pathology. **Recommend:** Surgical consult, CBC, imaging (CT/ultrasound).',
    aiConfidence: 0.88,
    status: 'in-progress',
    assignedTo: 'Dr. Chen',
    arrivalTime: new Date(Date.now() - 45 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 10 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-002a',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        event: 'Case created',
        user: 'Nurse Johnson',
        role: 'triage_nurse'
      },
      {
        id: 'evt-002b',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        event: 'Assigned to Dr. Chen',
        user: 'Charge Nurse',
        role: 'triage_nurse'
      }
    ]
  },
  {
    id: 'CASE-003',
    patientId: 'PT-3318',
    patientName: 'Robert K.',
    age: 52,
    sex: 'M',
    chiefComplaint: 'Fall from ladder, head injury, confusion',
    vitals: {
      heartRate: 88,
      bloodPressure: '145/90',
      temperature: 98.4,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      painLevel: 6
    },
    medicalHistory: 'Hypertension',
    currentMedications: 'Amlodipine',
    allergies: 'None',
    riskScore: 81,
    riskLevel: 'high',
    aiSummary: '**URGENT:** 52M s/p fall with head trauma + altered mental status. Mechanism concerning for intracranial injury. **Recommend:** CT head stat, neuro checks q15min, consider trauma activation.',
    aiConfidence: 0.91,
    status: 'escalated',
    assignedTo: 'Trauma Team',
    arrivalTime: new Date(Date.now() - 30 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 5 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-003a',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        event: 'Case created',
        user: 'Nurse Davis',
        role: 'triage_nurse'
      },
      {
        id: 'evt-003b',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        event: 'Escalated to trauma team',
        user: 'Dr. Patel',
        role: 'doctor'
      }
    ]
  },
  {
    id: 'CASE-004',
    patientId: 'PT-9104',
    patientName: 'Sarah L.',
    age: 29,
    sex: 'F',
    chiefComplaint: 'Suspected allergic reaction, facial swelling, difficulty swallowing',
    vitals: {
      heartRate: 105,
      bloodPressure: '118/75',
      temperature: 98.8,
      respiratoryRate: 22,
      oxygenSaturation: 94,
      painLevel: 4
    },
    medicalHistory: 'Seasonal allergies, No prior anaphylaxis',
    currentMedications: 'Cetirizine PRN',
    allergies: 'Shellfish (patient reports, never tested)',
    riskScore: 85,
    riskLevel: 'high',
    aiSummary: '**CRITICAL:** 29F with angioedema + dysphagia post-shellfish exposure. Early anaphylaxis signs. Tachycardia, reduced O2 sat. **Recommend:** Epinephrine ready, IV access, airway monitoring, consider ICU.',
    aiConfidence: 0.92,
    status: 'new',
    arrivalTime: new Date(Date.now() - 8 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 8 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-004',
        timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
        event: 'Case created - PRIORITY',
        user: 'Nurse Rodriguez',
        role: 'triage_nurse'
      }
    ]
  },
  {
    id: 'CASE-005',
    patientId: 'PT-6677',
    patientName: 'Michael T.',
    age: 45,
    sex: 'M',
    chiefComplaint: 'Persistent cough, fever, fatigue for 5 days',
    vitals: {
      heartRate: 92,
      bloodPressure: '130/85',
      temperature: 100.8,
      respiratoryRate: 20,
      oxygenSaturation: 95,
      painLevel: 3
    },
    medicalHistory: 'Asthma (mild, controlled)',
    currentMedications: 'Albuterol inhaler PRN',
    allergies: 'None',
    riskScore: 58,
    riskLevel: 'medium',
    aiSummary: '**MODERATE:** 45M with prolonged respiratory symptoms + fever. Asthma history increases pneumonia risk. Vitals borderline. **Recommend:** CXR, consider antibiotics, reassess in 2-4 hours.',
    aiConfidence: 0.82,
    status: 'new',
    arrivalTime: new Date(Date.now() - 55 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 55 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-005',
        timestamp: new Date(Date.now() - 55 * 60000).toISOString(),
        event: 'Case created',
        user: 'Nurse Williams',
        role: 'triage_nurse'
      }
    ]
  },
  {
    id: 'CASE-006',
    patientId: 'PT-2341',
    patientName: 'Lisa M.',
    age: 61,
    sex: 'F',
    chiefComplaint: 'Dizziness, lightheadedness when standing',
    vitals: {
      heartRate: 95,
      bloodPressure: '102/68',
      temperature: 97.9,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      painLevel: 1
    },
    medicalHistory: 'Hypertension, Osteoarthritis',
    currentMedications: 'Lisinopril, Ibuprofen',
    allergies: 'Codeine',
    riskScore: 64,
    riskLevel: 'medium',
    aiSummary: '**MODERATE:** 61F with orthostatic symptoms. Low BP (102/68) on antihypertensive. Possible medication-induced hypotension vs dehydration. **Recommend:** Orthostatic vitals, medication review, IV fluids PRN.',
    aiConfidence: 0.79,
    status: 'in-progress',
    assignedTo: 'Dr. Anderson',
    arrivalTime: new Date(Date.now() - 70 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 20 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-006a',
        timestamp: new Date(Date.now() - 70 * 60000).toISOString(),
        event: 'Case created',
        user: 'Nurse Thompson',
        role: 'triage_nurse'
      },
      {
        id: 'evt-006b',
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
        event: 'Assigned to Dr. Anderson',
        user: 'Charge Nurse',
        role: 'triage_nurse'
      }
    ]
  },
  {
    id: 'CASE-007',
    patientId: 'PT-8823',
    patientName: 'David H.',
    age: 23,
    sex: 'M',
    chiefComplaint: 'Sprained ankle during basketball, swelling and pain',
    vitals: {
      heartRate: 78,
      bloodPressure: '118/72',
      temperature: 98.2,
      respiratoryRate: 14,
      oxygenSaturation: 99,
      painLevel: 5
    },
    medicalHistory: 'None',
    currentMedications: 'None',
    allergies: 'None',
    riskScore: 28,
    riskLevel: 'low',
    aiSummary: '**LOW PRIORITY:** 23M with isolated ankle injury, stable vitals. Sports-related mechanism, no systemic concerns. **Recommend:** X-ray to r/o fracture, RICE protocol, orthopedic follow-up if needed.',
    aiConfidence: 0.87,
    status: 'new',
    arrivalTime: new Date(Date.now() - 90 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 90 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-007',
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
        event: 'Case created',
        user: 'Nurse Lee',
        role: 'triage_nurse'
      }
    ]
  },
  {
    id: 'CASE-008',
    patientId: 'PT-4456',
    patientName: 'Emily R.',
    age: 19,
    sex: 'F',
    chiefComplaint: 'Minor laceration on hand from broken glass',
    vitals: {
      heartRate: 82,
      bloodPressure: '115/70',
      temperature: 98.4,
      respiratoryRate: 14,
      oxygenSaturation: 99,
      painLevel: 4
    },
    medicalHistory: 'None',
    currentMedications: 'None',
    allergies: 'None',
    riskScore: 22,
    riskLevel: 'low',
    aiSummary: '**LOW PRIORITY:** 19F with superficial hand laceration. Stable vitals, no neurovascular compromise. **Recommend:** Wound cleaning, sutures/adhesive, tetanus status check.',
    aiConfidence: 0.91,
    status: 'completed',
    assignedTo: 'Dr. Wilson',
    arrivalTime: new Date(Date.now() - 120 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 35 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-008a',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        event: 'Case created',
        user: 'Nurse Garcia',
        role: 'triage_nurse'
      },
      {
        id: 'evt-008b',
        timestamp: new Date(Date.now() - 80 * 60000).toISOString(),
        event: 'Assigned to Dr. Wilson',
        user: 'Charge Nurse',
        role: 'triage_nurse'
      },
      {
        id: 'evt-008c',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
        event: 'Treatment completed, discharged',
        user: 'Dr. Wilson',
        role: 'doctor'
      }
    ]
  },
  {
    id: 'CASE-009',
    patientId: 'PT-1129',
    patientName: 'James B.',
    age: 55,
    sex: 'M',
    chiefComplaint: 'Migraine headache, photophobia, nausea',
    vitals: {
      heartRate: 76,
      bloodPressure: '125/80',
      temperature: 98.6,
      respiratoryRate: 16,
      oxygenSaturation: 99,
      painLevel: 7
    },
    medicalHistory: 'Chronic migraines (diagnosed 2018)',
    currentMedications: 'Sumatriptan PRN',
    allergies: 'Sulfa drugs',
    riskScore: 35,
    riskLevel: 'low',
    aiSummary: '**LOW PRIORITY:** 55M with typical migraine presentation. History of migraines, no red flags. Stable vitals. **Recommend:** Quiet environment, migraine protocol (triptan + antiemetic), neuro exam to r/o secondary causes.',
    aiConfidence: 0.85,
    status: 'in-progress',
    assignedTo: 'Dr. Kumar',
    arrivalTime: new Date(Date.now() - 100 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 40 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-009a',
        timestamp: new Date(Date.now() - 100 * 60000).toISOString(),
        event: 'Case created',
        user: 'Nurse Brown',
        role: 'triage_nurse'
      },
      {
        id: 'evt-009b',
        timestamp: new Date(Date.now() - 40 * 60000).toISOString(),
        event: 'Assigned to Dr. Kumar',
        user: 'Charge Nurse',
        role: 'triage_nurse'
      }
    ]
  },
  {
    id: 'CASE-010',
    patientId: 'PT-5567',
    patientName: 'Nancy W.',
    age: 72,
    sex: 'F',
    chiefComplaint: 'UTI symptoms: burning urination, frequency, urgency',
    vitals: {
      heartRate: 84,
      bloodPressure: '138/82',
      temperature: 99.1,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      painLevel: 4
    },
    medicalHistory: 'Recurrent UTIs, Diabetes Type 2',
    currentMedications: 'Metformin, Glipizide',
    allergies: 'Macrobid',
    riskScore: 42,
    riskLevel: 'medium',
    aiSummary: '**MODERATE:** 72F with classic UTI symptoms. Diabetic patient = increased complication risk. Mild fever. **Recommend:** Urinalysis + culture, alternative antibiotic (allergy to Macrobid), monitor for sepsis signs.',
    aiConfidence: 0.83,
    status: 'new',
    arrivalTime: new Date(Date.now() - 65 * 60000).toISOString(),
    lastUpdated: new Date(Date.now() - 65 * 60000).toISOString(),
    timeline: [
      {
        id: 'evt-010',
        timestamp: new Date(Date.now() - 65 * 60000).toISOString(),
        event: 'Case created',
        user: 'Nurse Martinez',
        role: 'triage_nurse'
      }
    ]
  }
];

// Demo user/role management
export const DEMO_USERS = {
  nurse: { role: 'triage_nurse' as UserRole, name: 'Nurse Demo' },
  doctor: { role: 'doctor' as UserRole, name: 'Dr. Demo' },
  admin: { role: 'admin' as UserRole, name: 'Admin Demo' }
};

export function getDemoCases(): TriageCase[] {
  return SYNTHETIC_CASES;
}

export function getDemoCase(id: string): TriageCase | undefined {
  return SYNTHETIC_CASES.find(c => c.id === id);
}
