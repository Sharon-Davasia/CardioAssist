import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowLeft, AlertCircle, CheckCircle, FileText, Clock, Activity, UserPlus } from "lucide-react";
import { getDemoCase } from "@/lib/demoMode";
import { getCaseById, updateCaseStatus } from "@/lib/caseStore";
import { useState } from "react";
import { AIClinicalSummary } from "@/components/AIClinicalSummary";
import { StaffAssignmentDropdown } from "@/components/StaffAssignmentDropdown";
import { useToast } from "@/hooks/use-toast";

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [, forceUpdate] = useState({});

  // Try caseStore first, then fallback to demo data
  const tcase = getCaseById(id || "") || getDemoCase(id || "");

  const handleAssign = (staffName: string) => {
    if (tcase) {
      updateCaseStatus(tcase.id, 'in-progress', staffName);
      forceUpdate({});
      toast({
        title: "Case Assigned",
        description: `Case assigned to ${staffName}`,
      });
    }
  };

  const handleEscalate = () => {
    if (tcase) {
      updateCaseStatus(tcase.id, 'escalated');
      forceUpdate({});
      toast({
        title: "Case Escalated",
        description: `Case ${tcase.id} has been escalated for immediate attention.`,
        variant: "destructive",
      });
    }
  };

  const handleMarkSeen = () => {
    if (tcase) {
      updateCaseStatus(tcase.id, 'in-progress');
      forceUpdate({});
      toast({
        title: "Case Acknowledged",
        description: `Case ${tcase.id} marked as seen.`,
      });
    }
  };

  if (!tcase) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Case Not Found</h1>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} aria-label="Back to dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Dashboard
              </Button>
              <div className="w-px h-6 bg-border" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                <h1 className="text-xl font-bold">Case {tcase.id}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tcase.status === "new" && (
                <Button variant="outline" size="sm" onClick={handleEscalate} aria-label="Escalate case">
                  <AlertCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                  Escalate
                </Button>
              )}
              <StaffAssignmentDropdown
                currentAssignment={tcase.assignedTo}
                onAssign={handleAssign}
                size="sm"
                placeholder="Assign to..."
              />
              <Button size="sm" onClick={handleMarkSeen} aria-label="Mark case as seen">
                <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                Mark Seen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-medium">{tcase.patientName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Patient ID</div>
                  <div className="font-mono text-sm">{tcase.patientId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Age / Sex</div>
                  <div className="font-medium">
                    {tcase.age} years, {tcase.sex}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Arrival Time</div>
                  <div className="font-medium">{formatTimestamp(tcase.arrivalTime)}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Chief Complaint</div>
                <div className="text-foreground">{tcase.chiefComplaint}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Triage Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Risk Assessment</div>
                <RiskBadge level={tcase.riskLevel} score={tcase.riskScore} className="w-full justify-center" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Current Status</div>
                <StatusBadge status={tcase.status} className="w-full justify-center" />
              </div>
              {tcase.assignedTo && (
                <div>
                  <div className="text-sm text-muted-foreground">Assigned To</div>
                  <div className="font-medium">{tcase.assignedTo}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="text-sm">{formatTimestamp(tcase.lastUpdated)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vitals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vitals">Vitals & History</TabsTrigger>
            <TabsTrigger value="ai">AI Summary</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Heart Rate</div>
                    <div className="text-2xl font-semibold">{tcase.vitals.heartRate} bpm</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Blood Pressure</div>
                    <div className="text-2xl font-semibold">{tcase.vitals.bloodPressure}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Temperature</div>
                    <div className="text-2xl font-semibold">{tcase.vitals.temperature}°F</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Respiratory Rate</div>
                    <div className="text-2xl font-semibold">{tcase.vitals.respiratoryRate} /min</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">O₂ Saturation</div>
                    <div className="text-2xl font-semibold">{tcase.vitals.oxygenSaturation}%</div>
                  </div>
                  {tcase.vitals.painLevel !== undefined && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Pain Level</div>
                      <div className="text-2xl font-semibold">{tcase.vitals.painLevel}/10</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">History</div>
                  <div className="text-muted-foreground">{tcase.medicalHistory}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Current Medications</div>
                  <div className="text-muted-foreground">{tcase.currentMedications}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Allergies</div>
                  <div className="text-muted-foreground">{tcase.allergies}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <AIClinicalSummary tcase={tcase} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tcase.timeline.map((event, idx) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {idx === 0 ? (
                            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                          ) : (
                            <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
                          )}
                        </div>
                        {idx < tcase.timeline.length - 1 && <div className="w-px flex-1 bg-border mt-2" aria-hidden="true" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="font-medium text-foreground">{event.event}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.user} ({event.role}) · {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attached Files</CardTitle>
              </CardHeader>
              <CardContent>
                {tcase.attachments && tcase.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {tcase.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{file}</div>
                        </div>
                        <Button size="sm" variant="outline" aria-label={`View file ${file}`}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No files attached to this case.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CaseDetail;
