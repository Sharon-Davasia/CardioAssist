import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";

interface RiskScoreBadgeProps {
  score: number;
  className?: string;
}

type UrgencyLevel = "critical" | "high" | "moderate" | "low";

// Updated urgency thresholds: Critical ≥90, High 70-89, Moderate 50-69, Low <50
export function getUrgencyLevel(score: number): UrgencyLevel {
  if (score >= 90) return "critical";
  if (score >= 70) return "high";
  if (score >= 50) return "moderate";
  return "low";
}

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bgColor: string; Icon: typeof AlertTriangle }> = {
  critical: {
    label: "CRITICAL",
    color: "text-white",
    bgColor: "bg-red-600",
    Icon: AlertTriangle,
  },
  high: {
    label: "HIGH",
    color: "text-white",
    bgColor: "bg-orange-500",
    Icon: AlertCircle,
  },
  moderate: {
    label: "MODERATE",
    color: "text-yellow-900",
    bgColor: "bg-yellow-400",
    Icon: Info,
  },
  low: {
    label: "LOW",
    color: "text-white",
    bgColor: "bg-green-500",
    Icon: CheckCircle,
  },
};

export function RiskScoreBadge({ score, className }: RiskScoreBadgeProps) {
  const level = getUrgencyLevel(score);
  const config = urgencyConfig[level];
  const Icon = config.Icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm",
        config.bgColor,
        config.color,
        level === "critical" && "animate-pulse",
        className
      )}
      role="status"
      aria-label={`Risk score ${score}, urgency level ${config.label}`}
    >
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
      <span className="opacity-80">({score})</span>
    </div>
  );
}

export function calculateRiskScore(vitals: {
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  respiratoryRate?: number;
  oxygenSat?: number;
  temperature?: number;
  consciousness?: string;
  gcsTotal?: number;
}): number {
  let score = 0;

  // Heart Rate scoring - extreme values MUST trigger high scores
  if (vitals.heartRate !== undefined && vitals.heartRate > 0) {
    const hr = vitals.heartRate;
    // Extreme tachycardia (>=180) - immediately critical
    if (hr >= 180) score += 40;
    // Severe tachycardia (>=150) 
    else if (hr >= 150) score += 25;
    // Tachycardia (>120)
    else if (hr > 120) score += 15;
    // Severe bradycardia (<40)
    else if (hr < 40) score += 35;
    // Bradycardia (<50)
    else if (hr < 50) score += 20;
    // Mild abnormality
    else if (hr < 60 || hr > 100) score += 5;
  }

  // Blood Pressure scoring - extreme values critical
  if (vitals.systolicBP !== undefined && vitals.systolicBP > 0) {
    const sbp = vitals.systolicBP;
    // Severe hypotension (<70) - immediately critical
    if (sbp < 70) score += 45;
    // Hypotension (<90)
    else if (sbp < 90) score += 30;
    // Low BP (<100)
    else if (sbp < 100) score += 15;
    // Hypertensive crisis (>200)
    else if (sbp > 200) score += 30;
    // Severe hypertension (>180)
    else if (sbp > 180) score += 20;
    // Hypertension (>160)
    else if (sbp > 160) score += 10;
  }

  // Respiratory Rate scoring - extreme values critical
  if (vitals.respiratoryRate !== undefined && vitals.respiratoryRate > 0) {
    const rr = vitals.respiratoryRate;
    // Severe tachypnea (>=40) or apnea (<6)
    if (rr >= 40 || rr < 6) score += 35;
    // Tachypnea (>30)
    else if (rr > 30) score += 20;
    // Mild tachypnea (>24)
    else if (rr > 24) score += 10;
    // Bradypnea (<8)
    else if (rr < 8) score += 30;
    // Mild bradypnea (<10)
    else if (rr < 10) score += 15;
  }

  // Oxygen Saturation scoring - low SpO2 is critical
  if (vitals.oxygenSat !== undefined && vitals.oxygenSat > 0) {
    const spo2 = vitals.oxygenSat;
    // Severe hypoxia (<80) - immediately critical
    if (spo2 < 80) score += 50;
    // Significant hypoxia (<85)
    else if (spo2 < 85) score += 40;
    // Hypoxia (<90)
    else if (spo2 < 90) score += 30;
    // Low SpO2 (<92)
    else if (spo2 < 92) score += 25;
    // Borderline (<94)
    else if (spo2 < 94) score += 10;
  }

  // Temperature scoring (Fahrenheit) - extreme temps critical
  if (vitals.temperature !== undefined && vitals.temperature > 0) {
    const temp = vitals.temperature;
    // Severe hyperthermia (>105°F/40.5°C) or severe hypothermia (<93°F/33.9°C)
    if (temp > 105 || temp < 93) score += 35;
    // High fever (>104°F/40°C) or hypothermia (<95°F/35°C)
    else if (temp > 104 || temp < 95) score += 25;
    // Fever (>102.2°F/39°C)
    else if (temp > 102.2) score += 15;
    // Low-grade fever (>100.4°F/38°C)
    else if (temp > 100.4) score += 5;
    // Mild hypothermia (<96°F/35.5°C)
    else if (temp < 96) score += 15;
  }

  // GCS scoring - low GCS is critical
  if (vitals.gcsTotal !== undefined) {
    const gcs = vitals.gcsTotal;
    // Severe impairment (<6) - immediately critical
    if (gcs < 6) score += 45;
    // GCS < 9 - significant impairment
    else if (gcs < 9) score += 35;
    // GCS < 12 - moderate impairment
    else if (gcs < 12) score += 20;
    // GCS < 14 - mild impairment
    else if (gcs < 14) score += 8;
  }

  // Consciousness scoring (AVPU) - unresponsive is critical
  if (vitals.consciousness) {
    switch (vitals.consciousness) {
      case "U": // Unresponsive - critical
        score += 40;
        break;
      case "P": // Pain responsive - severe
        score += 25;
        break;
      case "V": // Voice responsive - concerning
        score += 12;
        break;
      case "A": // Alert
      default:
        break;
    }
  }

  return Math.min(100, score);
}
