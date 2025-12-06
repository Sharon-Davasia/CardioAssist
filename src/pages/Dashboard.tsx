import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Shield, Search, Plus, Eye, AlertCircle, Activity, TrendingUp, Users, Clock, Bell, RefreshCw, CheckCircle, Phone, Printer, FileText, Download, Send, XCircle, Filter, ArrowRightLeft, Calendar, X } from "lucide-react";
import { getAllCases, getCaseStats, subscribeToCases, updateCaseStatus, escalateCase, getHighRiskNewCases, type TriageCase, type RiskLevel, type CaseStatus } from "@/lib/caseStore";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { StaffAssignmentDropdown, STAFF_LIST } from "@/components/StaffAssignmentDropdown";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [notifications, setNotifications] = useState<TriageCase[]>([]);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [, forceUpdate] = useState({});
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [reportDialog, setReportDialog] = useState<{ open: boolean; type: 'daily' | 'critical' | 'weekly' | null }>({ open: false, type: null });
  const [shiftHandoffDialog, setShiftHandoffDialog] = useState(false);
  const [handoffFrom, setHandoffFrom] = useState<string>("");
  const [handoffTo, setHandoffTo] = useState<string>("");

  // Subscribe to case changes for real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToCases(() => {
      forceUpdate({});
    });
    return unsubscribe;
  }, []);

  const allCases = getAllCases();
  const stats = getCaseStats();

  // Check for new high-risk cases
  useEffect(() => {
    const highRiskNew = getHighRiskNewCases();
    const newAlerts = highRiskNew.filter(c => 
      new Date(c.arrivalTime).getTime() > lastCheckTime
    );
    
    if (newAlerts.length > 0) {
      setNotifications(prev => [...newAlerts, ...prev].slice(0, 10));
      newAlerts.forEach(c => {
        toast({
          title: "🚨 High-Risk Case Alert",
          description: (
            <div className="mt-2 space-y-1">
              <div className="font-semibold">{c.patientName}</div>
              <div className="text-sm text-muted-foreground">{c.chiefComplaint}</div>
              <div className="text-sm font-medium text-risk-high">Risk Score: {c.riskScore}</div>
            </div>
          ),
          variant: "destructive",
          duration: 10000,
          action: (
            <Button size="sm" variant="outline" onClick={() => navigate(`/case/${c.id}`)} className="bg-background">
              View
            </Button>
          ),
        });
      });
      setLastCheckTime(Date.now());
    }
  }, [allCases, lastCheckTime, navigate, toast]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredCases = useMemo(() => {
    let filtered = allCases;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.patientName.toLowerCase().includes(query) ||
          c.patientId.toLowerCase().includes(query) ||
          c.chiefComplaint.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query)
      );
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter((c) => c.riskLevel === riskFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (staffFilter !== "all") {
      filtered = filtered.filter((c) => c.assignedTo === staffFilter);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((c) => new Date(c.arrivalTime) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((c) => new Date(c.arrivalTime) <= toDate);
    }

    return filtered.sort((a, b) => b.riskScore - a.riskScore);
  }, [allCases, searchQuery, riskFilter, statusFilter, staffFilter, dateFrom, dateTo]);

  // Get unique assigned staff from cases
  const assignedStaffList = useMemo(() => {
    const staffSet = new Set<string>();
    allCases.forEach(c => {
      if (c.assignedTo) staffSet.add(c.assignedTo);
    });
    return Array.from(staffSet);
  }, [allCases]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (riskFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (staffFilter !== "all") count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  }, [riskFilter, statusFilter, staffFilter, dateFrom, dateTo]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setRiskFilter("all");
    setStatusFilter("all");
    setStaffFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  // Critical cases (risk score >= 90)
  const criticalCases = useMemo(() => {
    return allCases.filter(c => c.riskScore >= 90);
  }, [allCases]);

  const chartData = useMemo(() => {
    const riskData = [
      { name: "High Risk", value: stats.high, color: "hsl(var(--risk-high))" },
      { name: "Medium Risk", value: stats.medium, color: "hsl(var(--risk-medium))" },
      { name: "Low Risk", value: stats.low, color: "hsl(var(--risk-low))" },
    ];

    const statusData = [
      { name: "New", count: stats.newCases, color: "hsl(var(--status-new))" },
      { name: "In Progress", count: stats.inProgress, color: "hsl(var(--status-progress))" },
      { name: "Escalated", count: stats.escalated, color: "hsl(var(--risk-high))" },
      { name: "Completed", count: stats.completed, color: "hsl(var(--risk-low))" },
    ];

    // Generate realistic trend data
    const trendData = Array.from({ length: 7 }, (_, i) => {
      const daysAgo = 6 - i;
      const date = new Date(Date.now() - daysAgo * 86400000);
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        cases: Math.floor(Math.random() * 15) + 8 + Math.floor(stats.total / 3),
        highRisk: Math.floor(Math.random() * 4) + 2 + Math.floor(stats.high / 2),
      };
    });

    return { riskData, statusData, trendData };
  }, [stats]);

  const formatTimestamp = useCallback((iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const handleViewCritical = () => {
    setRiskFilter('high');
    setStatusFilter('all');
    scrollToSection('queue');
    toast({
      title: "Showing Critical Cases",
      description: `Displaying ${criticalCases.length} high-risk cases (score ≥ 90)`,
    });
  };

  const handleAssignCase = (caseId: string) => {
    updateCaseStatus(caseId, 'in-progress', 'Dr. Available');
    toast({
      title: "Case Assigned",
      description: `Case ${caseId} has been assigned and marked in-progress.`,
    });
  };

  const handleEscalateCase = (caseId: string) => {
    escalateCase(caseId);
    toast({
      title: "Case Escalated",
      description: `Case ${caseId} has been escalated for immediate attention.`,
      variant: "destructive",
    });
  };

  const handleCompleteCase = (caseId: string) => {
    updateCaseStatus(caseId, 'completed');
    toast({
      title: "Case Completed",
      description: `Case ${caseId} has been marked as completed.`,
    });
  };

  const handleAcknowledge = (caseId: string) => {
    updateCaseStatus(caseId, 'in-progress');
    toast({
      title: "Case Acknowledged",
      description: `Case ${caseId} has been acknowledged and is now in progress.`,
    });
  };

  const handleCall = (caseId: string, patientName: string) => {
    toast({
      title: "Initiating Call",
      description: `Calling patient ${patientName} for case ${caseId}...`,
    });
  };

  const handleReassign = (caseId: string, staffName: string) => {
    updateCaseStatus(caseId, 'in-progress', staffName);
    toast({
      title: "Case Reassigned",
      description: `Case ${caseId} has been reassigned to ${staffName}.`,
    });
  };

  const handlePrintWristband = (tcase: TriageCase) => {
    const printContent = `
      ═══════════════════════════════════════
      PATIENT WRISTBAND - ${tcase.id}
      ═══════════════════════════════════════
      Name: ${tcase.patientName}
      Patient ID: ${tcase.patientId}
      Age/Sex: ${tcase.age}y / ${tcase.sex}
      Risk Level: ${tcase.riskLevel.toUpperCase()} (${tcase.riskScore})
      Chief Complaint: ${tcase.chiefComplaint}
      Arrival: ${new Date(tcase.arrivalTime).toLocaleString()}
      ═══════════════════════════════════════
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; font-size: 14px;">${printContent}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
    toast({
      title: "Print Initiated",
      description: `Wristband for ${tcase.patientName} sent to printer.`,
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Multi-select handlers
  const handleSelectCase = (caseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCases(prev => [...prev, caseId]);
    } else {
      setSelectedCases(prev => prev.filter(id => id !== caseId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCases(filteredCases.map(c => c.id));
    } else {
      setSelectedCases([]);
    }
  };

  const handleBulkMarkReviewed = () => {
    selectedCases.forEach(caseId => {
      updateCaseStatus(caseId, 'in-progress');
    });
    toast({
      title: "Bulk Action Complete",
      description: `${selectedCases.length} cases marked as reviewed.`,
    });
    setSelectedCases([]);
  };

  const handleBulkNotification = () => {
    toast({
      title: "Notifications Sent",
      description: `Batch notification sent for ${selectedCases.length} cases.`,
    });
    setSelectedCases([]);
  };

  const handleExportCSV = (data: TriageCase[], filename: string) => {
    const headers = ['Case ID', 'Patient Name', 'Patient ID', 'Age', 'Sex', 'Chief Complaint', 'Risk Score', 'Risk Level', 'Status', 'Arrival Time'];
    const csvContent = [
      headers.join(','),
      ...data.map(c => [
        c.id,
        `"${c.patientName}"`,
        c.patientId,
        c.age,
        c.sex,
        `"${c.chiefComplaint.replace(/"/g, '""')}"`,
        c.riskScore,
        c.riskLevel,
        c.status,
        new Date(c.arrivalTime).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Export Complete",
      description: `${data.length} records exported to ${filename}.csv`,
    });
  };

  const handleExportPDF = (reportType: string) => {
    // Simple PDF-like print view
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = reportType === 'daily' 
        ? `<h1>Daily Summary Report</h1><p>Date: ${new Date().toLocaleDateString()}</p><p>Total Cases: ${stats.total}</p><p>Completed: ${stats.completed}</p><p>High Risk: ${stats.high}</p><p>Average Wait: ${stats.avgWaitTime}m</p>`
        : reportType === 'critical'
        ? `<h1>Critical Cases Report</h1><p>Total Critical: ${criticalCases.length}</p>${criticalCases.map(c => `<p>${c.id}: ${c.patientName} - Score: ${c.riskScore}</p>`).join('')}`
        : `<h1>Weekly Trends Report</h1><p>7-day case trends and performance metrics</p>`;
      
      printWindow.document.write(`<html><head><title>${reportType} Report</title></head><body style="font-family: Arial, sans-serif; padding: 20px;">${content}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
    toast({
      title: "PDF Generated",
      description: `${reportType} report ready for printing.`,
    });
  };

  // Shift Handoff handler
  const handleShiftHandoff = () => {
    if (!handoffFrom || !handoffTo) {
      toast({
        title: "Selection Required",
        description: "Please select both outgoing and incoming staff members.",
        variant: "destructive",
      });
      return;
    }

    if (handoffFrom === handoffTo) {
      toast({
        title: "Invalid Selection",
        description: "Cannot handoff to the same staff member.",
        variant: "destructive",
      });
      return;
    }

    // Find cases assigned to outgoing staff
    const casesToTransfer = allCases.filter(c => c.assignedTo === handoffFrom && c.status !== 'completed');
    
    if (casesToTransfer.length === 0) {
      toast({
        title: "No Cases to Transfer",
        description: `${handoffFrom} has no active cases to hand off.`,
      });
      return;
    }

    // Transfer all cases
    casesToTransfer.forEach(c => {
      updateCaseStatus(c.id, c.status, handoffTo);
    });

    toast({
      title: "Shift Handoff Complete",
      description: `${casesToTransfer.length} case(s) transferred from ${handoffFrom} to ${handoffTo}.`,
    });

    setShiftHandoffDialog(false);
    setHandoffFrom("");
    setHandoffTo("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                aria-label="Go to home"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
                  <Shield className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                </div>
                <h1 className="text-xl font-bold text-foreground">CardioAssist</h1>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => forceUpdate({})}
                aria-label="Refresh data"
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={clearNotifications}
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-risk-high text-white text-xs flex items-center justify-center font-semibold animate-pulse">
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </Button>
              <Button onClick={() => navigate("/intake")} aria-label="Create new intake">
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                New Intake
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="border-b border-border bg-card sticky top-[73px] z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: "overview", label: "Overview", icon: Activity },
              { id: "queue", label: "Queue", icon: Users },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
              { id: "reports", label: "Reports", icon: Clock },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                  activeSection === section.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Overview Section */}
        <section id="overview" className="scroll-mt-32" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-2xl font-bold mb-4">Overview</h2>
          
          {/* Alert Banner for Critical Cases */}
          {stats.high > 0 && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-risk-high animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold text-risk-high">
                  {stats.high} High-Risk {stats.high === 1 ? 'Case' : 'Cases'} Requiring Attention
                </p>
                <p className="text-sm text-muted-foreground">
                  {criticalCases.length} critical cases with score ≥ 90
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleViewCritical}>
                View Critical
              </Button>
            </div>
          )}

          {/* Visual Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card-clinical p-5 space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setRiskFilter('all'); setStatusFilter('all'); scrollToSection('queue'); }}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Total Cases</div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Active in system</div>
            </div>

            <div className="card-clinical p-5 space-y-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-risk-high" onClick={handleViewCritical}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">High Risk</div>
                <div className="p-2 bg-risk-high/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-risk-high" />
                </div>
              </div>
              <div className="text-3xl font-bold text-risk-high">{stats.high}</div>
              <div className="text-xs text-muted-foreground">Requires immediate attention</div>
            </div>

            <div className="card-clinical p-5 space-y-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('new'); scrollToSection('queue'); }}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">New Cases</div>
                <div className="p-2 bg-status-new/10 rounded-lg">
                  <Activity className="h-5 w-5 text-status-new" />
                </div>
              </div>
              <div className="text-3xl font-bold text-status-new">{stats.newCases}</div>
              <div className="text-xs text-muted-foreground">Awaiting review</div>
            </div>

            <div className="card-clinical p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Avg Wait Time</div>
                <div className="p-2 bg-teal/10 rounded-lg">
                  <Clock className="h-5 w-5 text-teal" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">{stats.avgWaitTime}m</div>
              <div className="text-xs text-muted-foreground">Current average</div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card-clinical p-4">
              <h3 className="text-sm font-semibold mb-3">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData.riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {chartData.riskData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-clinical p-4 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-3">Case Status Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData.statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px" 
                    }} 
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Queue Section - Active Cases */}
        <section id="queue" className="scroll-mt-32" aria-labelledby="queue-heading">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 id="queue-heading" className="text-2xl font-bold">Patient Queue</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Active triage cases requiring clinical review and action. Prioritized by risk score.
              </p>
            </div>
            <Button variant="outline" onClick={() => setShiftHandoffDialog(true)}>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Shift Handoff
            </Button>
          </div>

          {/* Filters */}
          <div className="card-clinical p-4 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    placeholder="Search by name, ID, or complaint..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    aria-label="Search cases"
                  />
                </div>
                <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v as RiskLevel | "all")}>
                  <SelectTrigger className="w-full sm:w-[150px]" aria-label="Filter by risk level">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CaseStatus | "all")}>
                  <SelectTrigger className="w-full sm:w-[150px]" aria-label="Filter by status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant={showAdvancedFilters ? "secondary" : "outline"} 
                  size="icon"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="relative"
                >
                  <Filter className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
              
              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border">
                  <Select value={staffFilter} onValueChange={setStaffFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by assigned staff">
                      <SelectValue placeholder="Assigned Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff</SelectItem>
                      {assignedStaffList.map((staff) => (
                        <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                      ))}
                      {STAFF_LIST.map((staff) => (
                        !assignedStaffList.includes(staff.name) && (
                          <SelectItem key={staff.id} value={staff.name}>{staff.name}</SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full sm:w-[150px]"
                      aria-label="From date"
                      placeholder="From"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full sm:w-[150px]"
                      aria-label="To date"
                      placeholder="To"
                    />
                  </div>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedCases.length > 0 && (
            <div className="card-clinical p-3 mb-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-medium">
                  {selectedCases.length} case{selectedCases.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleBulkMarkReviewed}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Reviewed
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExportCSV(filteredCases.filter(c => selectedCases.includes(c.id)), 'selected_cases')}>
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkNotification}>
                    <Send className="h-4 w-4 mr-1" />
                    Batch Notify
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedCases([])}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cases Table */}
          <div className="card-clinical">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Active Cases <span className="text-muted-foreground">({filteredCases.length})</span>
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live updates
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 w-10">
                      <Checkbox 
                        checked={selectedCases.length === filteredCases.length && filteredCases.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all cases"
                      />
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground" scope="col">Case ID</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground" scope="col">Patient</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground" scope="col">Chief Complaint</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground" scope="col">Risk</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground" scope="col">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-foreground" scope="col">Arrival</th>
                    <th className="text-right p-3 text-sm font-semibold text-foreground" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No cases found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((tcase) => (
                      <tr
                        key={tcase.id}
                        className={cn(
                          "border-b border-border hover:bg-muted/20 transition-colors",
                          tcase.status === "escalated" && "bg-risk-high/5",
                          tcase.riskLevel === "high" && tcase.status === "new" && "bg-red-50/50 dark:bg-red-950/20",
                          selectedCases.includes(tcase.id) && "bg-primary/5"
                        )}
                      >
                        <td className="p-3">
                          <Checkbox 
                            checked={selectedCases.includes(tcase.id)}
                            onCheckedChange={(checked) => handleSelectCase(tcase.id, checked as boolean)}
                            aria-label={`Select case ${tcase.id}`}
                          />
                        </td>
                        <td className="p-3 text-sm font-mono">{tcase.id}</td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <div className="font-medium text-foreground">{tcase.patientName}</div>
                            <div className="text-xs text-muted-foreground">
                              {tcase.age}y, {tcase.sex} · {tcase.patientId}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="text-sm text-foreground line-clamp-2">{tcase.chiefComplaint}</div>
                        </td>
                        <td className="p-3">
                          <RiskBadge level={tcase.riskLevel} score={tcase.riskScore} />
                        </td>
                        <td className="p-3">
                          <StatusBadge status={tcase.status} />
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{formatTimestamp(tcase.arrivalTime)}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/case/${tcase.id}`)}
                              aria-label={`Open case ${tcase.id}`}
                              title="Open"
                            >
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            {tcase.status === "new" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAcknowledge(tcase.id)}
                                aria-label={`Acknowledge case ${tcase.id}`}
                                title="Acknowledge"
                              >
                                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCall(tcase.id, tcase.patientName)}
                              aria-label={`Call patient for case ${tcase.id}`}
                              title="Call"
                            >
                              <Phone className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <StaffAssignmentDropdown
                              currentAssignment={tcase.assignedTo}
                              onAssign={(staffName) => handleReassign(tcase.id, staffName)}
                              size="sm"
                              placeholder="Reassign"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintWristband(tcase)}
                              aria-label={`Print wristband for case ${tcase.id}`}
                              title="Print Wristband/PDF"
                            >
                              <Printer className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            {tcase.status === "new" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-risk-high hover:bg-risk-high hover:text-white"
                                onClick={() => handleEscalateCase(tcase.id)}
                                aria-label={`Escalate case ${tcase.id}`}
                                title="Escalate"
                              >
                                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            )}
                            {tcase.status === "in-progress" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-600 hover:text-white"
                                onClick={() => handleCompleteCase(tcase.id)}
                                aria-label={`Complete case ${tcase.id}`}
                                title="Complete"
                              >
                                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Recent Activity Section - Audit/Feed */}
        <section id="activity" className="scroll-mt-32" aria-labelledby="activity-heading">
          <div className="mb-4">
            <h2 id="activity-heading" className="text-2xl font-bold">Recent Activity</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Audit trail of recent case submissions, updates, and system events.
            </p>
          </div>
          
          <div className="card-clinical p-4">
            <div className="space-y-3">
              {allCases.slice(0, 8).map((c, idx) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      c.riskLevel === 'high' ? "bg-risk-high" : c.riskLevel === 'medium' ? "bg-risk-medium" : "bg-risk-low"
                    )} />
                    <div>
                      <p className="font-medium text-sm">{c.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.status === 'new' ? 'New case submitted' : c.status === 'in-progress' ? 'Case in progress' : c.status === 'escalated' ? 'Case escalated' : 'Case completed'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-muted-foreground">{formatTimestamp(c.arrivalTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section id="analytics" className="scroll-mt-32" aria-labelledby="analytics-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="analytics-heading" className="text-2xl font-bold">Analytics</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleExportCSV(allCases, 'all_cases')}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExportPDF('weekly')}>
                <FileText className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-clinical p-4">
              <h3 className="text-sm font-semibold mb-3">7-Day Case Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px" 
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="cases" stroke="hsl(var(--primary))" strokeWidth={2} name="Total Cases" />
                  <Line type="monotone" dataKey="highRisk" stroke="hsl(var(--risk-high))" strokeWidth={2} name="High Risk" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card-clinical p-4">
              <h3 className="text-sm font-semibold mb-3">Performance Metrics</h3>
              <div className="space-y-4 mt-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Average Response Time</span>
                    <span className="font-semibold">8.5 min</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: "85%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cases Resolved Today</span>
                    <span className="font-semibold">{stats.completed} / {stats.total}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total * 100) : 0}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Staff Utilization</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-status-progress rounded-full transition-all" style={{ width: "92%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Patient Satisfaction</span>
                    <span className="font-semibold">4.7 / 5.0</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-status-new rounded-full transition-all" style={{ width: "94%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reports Section */}
        <section id="reports" className="scroll-mt-32" aria-labelledby="reports-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="reports-heading" className="text-2xl font-bold">Reports</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleExportCSV(allCases, 'full_report')}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExportPDF('daily')}>
                <FileText className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-clinical p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setReportDialog({ open: true, type: 'daily' })}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Daily Summary</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {stats.total} total cases, {stats.completed} resolved
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); setReportDialog({ open: true, type: 'daily' }); }}>
                View Report
              </Button>
            </div>

            <div className="card-clinical p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setReportDialog({ open: true, type: 'critical' })}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-risk-high/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-risk-high" />
                </div>
                <h3 className="font-semibold">Critical Cases</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {criticalCases.length} critical cases (score ≥ 90)
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); setReportDialog({ open: true, type: 'critical' }); }}>
                View Critical
              </Button>
            </div>

            <div className="card-clinical p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setReportDialog({ open: true, type: 'weekly' })}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-teal" />
                </div>
                <h3 className="font-semibold">Weekly Trends</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Performance metrics and case trends over 7 days
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); setReportDialog({ open: true, type: 'weekly' }); }}>
                View Report
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Report Dialog */}
      <Dialog open={reportDialog.open} onOpenChange={(open) => setReportDialog({ open, type: reportDialog.type })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {reportDialog.type === 'daily' && 'Daily Summary Report'}
              {reportDialog.type === 'critical' && 'Critical Cases Report'}
              {reportDialog.type === 'weekly' && 'Weekly Trends Report'}
            </DialogTitle>
            <DialogDescription>
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {reportDialog.type === 'daily' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Cases</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">High Risk</p>
                    <p className="text-2xl font-bold text-risk-high">{stats.high}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg Wait</p>
                    <p className="text-2xl font-bold">{stats.avgWaitTime}m</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handleExportPDF('daily')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </>
            )}
            
            {reportDialog.type === 'critical' && (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  {criticalCases.length} cases with risk score ≥ 90
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {criticalCases.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{c.patientName}</p>
                        <p className="text-xs text-muted-foreground">{c.id} · {c.chiefComplaint.slice(0, 40)}...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <RiskBadge level={c.riskLevel} score={c.riskScore} />
                        <Button size="sm" variant="ghost" onClick={() => { setReportDialog({ open: false, type: null }); navigate(`/case/${c.id}`); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full" onClick={() => handleExportCSV(criticalCases, 'critical_cases')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
              </>
            )}
            
            {reportDialog.type === 'weekly' && (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="cases" stroke="hsl(var(--primary))" strokeWidth={2} name="Total" />
                    <Line type="monotone" dataKey="highRisk" stroke="hsl(var(--risk-high))" strokeWidth={2} name="High Risk" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                    <p className="text-lg font-bold">8.5 min</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Resolution Rate</p>
                    <p className="text-lg font-bold">{stats.total > 0 ? Math.round(stats.completed / stats.total * 100) : 0}%</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => handleExportPDF('weekly')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Shift Handoff Dialog */}
      <Dialog open={shiftHandoffDialog} onOpenChange={setShiftHandoffDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Shift Handoff
            </DialogTitle>
            <DialogDescription>
              Transfer all active cases from one staff member to another when shifts change.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Outgoing Staff (transferring from)</label>
              <Select value={handoffFrom} onValueChange={setHandoffFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select outgoing staff..." />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_LIST.map((staff) => {
                    const caseCount = allCases.filter(c => c.assignedTo === staff.name && c.status !== 'completed').length;
                    return (
                      <SelectItem key={staff.id} value={staff.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{staff.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({caseCount} cases)</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Incoming Staff (transferring to)</label>
              <Select value={handoffTo} onValueChange={setHandoffTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select incoming staff..." />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_LIST.map((staff) => (
                    <SelectItem 
                      key={staff.id} 
                      value={staff.name}
                      disabled={staff.name === handoffFrom}
                    >
                      <div className="flex flex-col">
                        <span>{staff.name}</span>
                        <span className="text-xs text-muted-foreground">{staff.role} · {staff.specialty}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {handoffFrom && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">{allCases.filter(c => c.assignedTo === handoffFrom && c.status !== 'completed').length}</span>
                  {" "}active case(s) will be transferred from <span className="font-medium">{handoffFrom}</span>
                  {handoffTo && <> to <span className="font-medium">{handoffTo}</span></>}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShiftHandoffDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShiftHandoff} disabled={!handoffFrom || !handoffTo}>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Complete Handoff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
