import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Database, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";

const Admin = () => {
  const navigate = useNavigate();
  const [maskingEnabled, setMaskingEnabled] = useState(true);

  // Demo audit log entries
  const auditLogs = [
    {
      id: "audit-001",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      user: "Dr. Chen",
      action: "Viewed case CASE-002",
      resource: "CASE-002",
      result: "SUCCESS",
    },
    {
      id: "audit-002",
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      user: "Nurse Martinez",
      action: "Created case CASE-001",
      resource: "CASE-001",
      result: "SUCCESS",
    },
    {
      id: "audit-003",
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      user: "Dr. Patel",
      action: "Escalated case CASE-003",
      resource: "CASE-003",
      result: "SUCCESS",
    },
    {
      id: "audit-004",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      user: "Admin Demo",
      action: "Accessed audit logs",
      resource: "AUDIT_SYSTEM",
      result: "SUCCESS",
    },
    {
      id: "audit-005",
      timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
      user: "Nurse Rodriguez",
      action: "AI summary generated for CASE-004",
      resource: "CASE-004",
      result: "SUCCESS",
    },
  ];

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const maskData = (text: string) => {
    if (!maskingEnabled) return text;
    // Mask patient IDs and case IDs
    return text.replace(/CASE-\d+/g, "CASE-***").replace(/PT-\d+/g, "PT-***");
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
                <h1 className="text-xl font-bold">Admin & Audit</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <div className="font-medium text-accent">Production Snowflake Integration</div>
              <div className="text-sm text-muted-foreground">
                In production, audit logs are stored in Snowflake with masking policies applied automatically. All AI
                prompts, responses, and user actions are logged for compliance.
              </div>
            </div>
          </div>
        </div>

        {/* Masking Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Data Masking Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">PII Masking</div>
                <div className="text-sm text-muted-foreground">
                  Apply masking policies to patient identifiers in audit logs
                </div>
              </div>
              <Button
                variant={maskingEnabled ? "default" : "outline"}
                onClick={() => setMaskingEnabled(!maskingEnabled)}
                aria-pressed={maskingEnabled}
                aria-label={maskingEnabled ? "Disable masking" : "Enable masking"}
              >
                {maskingEnabled ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                    Masking On
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" aria-hidden="true" />
                    Masking Off
                  </>
                )}
              </Button>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" aria-hidden="true" />
                Snowflake Masking Policies
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  <strong>Policy:</strong> <code className="bg-background px-1 py-0.5 rounded">mask_patient_id</code>{" "}
                  → Applied to <code className="bg-background px-1 py-0.5 rounded">patient_id</code> column
                </div>
                <div>
                  <strong>Policy:</strong> <code className="bg-background px-1 py-0.5 rounded">mask_case_id</code> →
                  Applied to <code className="bg-background px-1 py-0.5 rounded">case_id</code> column
                </div>
                <div className="pt-2 border-t border-border">
                  See{" "}
                  <code className="bg-background px-1 py-0.5 rounded">sfdemo/snowflake_tables.sql</code> for DDL and
                  masking policy definitions.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-3 text-sm font-semibold" scope="col">
                      Timestamp
                    </th>
                    <th className="text-left p-3 text-sm font-semibold" scope="col">
                      User
                    </th>
                    <th className="text-left p-3 text-sm font-semibold" scope="col">
                      Action
                    </th>
                    <th className="text-left p-3 text-sm font-semibold" scope="col">
                      Resource
                    </th>
                    <th className="text-left p-3 text-sm font-semibold" scope="col">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-3 text-sm text-muted-foreground">{formatTimestamp(log.timestamp)}</td>
                      <td className="p-3 text-sm font-medium">{log.user}</td>
                      <td className="p-3 text-sm">{maskData(log.action)}</td>
                      <td className="p-3">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{maskData(log.resource)}</code>
                      </td>
                      <td className="p-3">
                        <Badge variant={log.result === "SUCCESS" ? "default" : "destructive"} className="text-xs">
                          {log.result}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Demo Mode</span>
                <Badge variant="outline" className="bg-status-new/10 text-status-new border-status-new/20">
                  ACTIVE
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Snowflake Integration</span>
                <Badge variant="outline">STUB</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cortex AI</span>
                <Badge variant="outline">MOCK</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auth0</span>
                <Badge variant="outline">DEMO BYPASS</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Docs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                To connect production services, see:
              </div>
              <ul className="space-y-1 text-sm">
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">docs/README_SNOWFLAKE.md</code> — Snowflake +
                  Cortex setup
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">secrets/README.md</code> — Secrets management
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">sfdemo/</code> — Snowpark scripts and DDL
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
