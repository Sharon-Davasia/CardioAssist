import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Shield, ArrowLeft, Zap, User, Activity, Heart, Clock, 
  Pill, AlertTriangle, Volume2, VolumeX, FileText, Bandage,
  Stethoscope, Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoiceInput } from "@/components/intake/VoiceInput";
import { useAudioFeedback } from "@/components/intake/useAudioFeedback";
import { RiskScoreBadge, calculateRiskScore, getUrgencyLevel } from "@/components/intake/RiskScoreBadge";
import { BodyMapIllustration } from "@/components/intake/BodyMapIllustration";
import { AttachmentsCard } from "@/components/intake/AttachmentsCard";
import { QuickSelectTags } from "@/components/intake/QuickSelectTags";
import { DateOfBirthPicker } from "@/components/intake/DateOfBirthPicker";
import { cn } from "@/lib/utils";
import { addCase } from "@/lib/caseStore";

const CHIEF_COMPLAINTS = [
  "Chest Pain", "Shortness of Breath", "Trauma", "Stroke Symptoms", 
  "Abdominal Pain", "Syncope", "Seizure", "Cardiac Arrest", "Allergic Reaction",
  "Bleeding", "Burns", "Poisoning", "Other"
];

const MECHANISMS_OF_INJURY = [
  "Fall", "Motor Vehicle Accident", "Assault", "Sports Injury", 
  "Penetrating Trauma", "Blunt Trauma", "Burn", "Drowning", "Other"
];

const PAST_HISTORY_OPTIONS = [
  "Hypertension", "Diabetes", "Heart Disease", "Stroke", "COPD", "Asthma",
  "Cancer", "Kidney Disease", "Liver Disease", "Immunocompromised", "None"
];

const ALLERGY_OPTIONS = [
  "Penicillin", "Sulfa", "Aspirin", "NSAIDs", "Codeine", "Latex", 
  "Contrast Dye", "Shellfish", "Peanuts", "Other"
];

const MODE_OF_ARRIVAL = [
  "Ambulance", "Walk-in", "Private Vehicle", "Police", "Helicopter", "Transfer"
];

const TIME_OF_ONSET = ["<1 hour", "1-3 hours", "3-12 hours", ">12 hours", "Unknown"];

const Intake = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [dndMode, setDndMode] = useState(false);

  const { playSound, speak, stopSpeaking } = useAudioFeedback(audioEnabled && !dndMode);

  // Form State
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [sex, setSex] = useState("");
  
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [complaintTags, setComplaintTags] = useState<string[]>([]);
  const [complaintNotes, setComplaintNotes] = useState("");
  const [timeOfOnset, setTimeOfOnset] = useState("");
  const [mechanismsOfInjury, setMechanismsOfInjury] = useState<string[]>([]);
  
  const [heartRate, setHeartRate] = useState("");
  const [systolicBP, setSystolicBP] = useState("");
  const [diastolicBP, setDiastolicBP] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSat, setOxygenSat] = useState("");
  const [temperature, setTemperature] = useState("");
  const [painLevel, setPainLevel] = useState("");
  const [consciousness, setConsciousness] = useState("A");
  const [gcsEye, setGcsEye] = useState("4");
  const [gcsVerbal, setGcsVerbal] = useState("5");
  const [gcsMotor, setGcsMotor] = useState("6");

  // Trauma fields
  const [injurySites, setInjurySites] = useState<string[]>([]);
  const [bleedingSeverity, setBleedingSeverity] = useState("");
  const [airwayStatus, setAirwayStatus] = useState<string[]>([]);
  const [traumaDevices, setTraumaDevices] = useState<string[]>([]);

  // Medical history
  const [hasAllergies, setHasAllergies] = useState<boolean | null>(null);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [pastHistory, setPastHistory] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState("");
  const [modeOfArrival, setModeOfArrival] = useState<string[]>([]);

  // Consent
  const [consentGiven, setConsentGiven] = useState(false);

  // Risk score
  const [riskScore, setRiskScore] = useState(0);

  // Calculate age from DOB
  useEffect(() => {
    if (dateOfBirth) {
      const today = new Date();
      const birth = new Date(dateOfBirth);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setCalculatedAge(age >= 0 ? age : null);
    } else {
      setCalculatedAge(null);
    }
  }, [dateOfBirth]);

  // Calculate risk score with GCS
  useEffect(() => {
    const gcsTotal = parseInt(gcsEye) + parseInt(gcsVerbal) + parseInt(gcsMotor);
    
    const score = calculateRiskScore({
      heartRate: heartRate ? parseInt(heartRate) : undefined,
      systolicBP: systolicBP ? parseInt(systolicBP) : undefined,
      diastolicBP: diastolicBP ? parseInt(diastolicBP) : undefined,
      respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
      oxygenSat: oxygenSat ? parseInt(oxygenSat) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      consciousness,
      gcsTotal,
    });
    
    const prevLevel = getUrgencyLevel(riskScore);
    const newLevel = getUrgencyLevel(score);
    
    if (score !== riskScore) {
      setRiskScore(score);
      
      if (score >= 90 && riskScore < 90) {
        playSound("critical");
        speak("Warning: Critical vital signs detected");
      } else if (newLevel !== prevLevel && score > 0) {
        if (newLevel === "high" || newLevel === "critical") {
          playSound("warning");
          speak("Warning: Abnormal vital detected");
        }
      }
    }
  }, [heartRate, systolicBP, diastolicBP, respiratoryRate, oxygenSat, temperature, consciousness, gcsEye, gcsVerbal, gcsMotor, riskScore, playSound, speak]);

  const isTraumaCase = chiefComplaint === "Trauma" || complaintTags.includes("Trauma");

  const toggleComplaintTag = (tag: string) => {
    setComplaintTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    if (tag === chiefComplaint && complaintTags.includes(tag)) {
      setChiefComplaint("");
    }
    playSound("click");
  };

  const toggleInjurySite = (site: string) => {
    setInjurySites(prev => 
      prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site]
    );
    playSound("click");
  };

  const handleReadback = useCallback(() => {
    const details: string[] = [];
    if (patientName) details.push(`Patient name: ${patientName}`);
    if (calculatedAge) details.push(`Age: ${calculatedAge} years`);
    if (sex) details.push(`Sex: ${sex === "M" ? "Male" : sex === "F" ? "Female" : "Other"}`);
    if (chiefComplaint || complaintTags.length > 0) {
      details.push(`Chief complaint: ${chiefComplaint || complaintTags.join(", ")}`);
    }
    if (heartRate) details.push(`Heart rate: ${heartRate} beats per minute`);
    if (systolicBP && diastolicBP) details.push(`Blood pressure: ${systolicBP} over ${diastolicBP}`);
    if (oxygenSat) details.push(`Oxygen saturation: ${oxygenSat} percent`);
    if (temperature) details.push(`Temperature: ${temperature} degrees`);
    if (riskScore > 0) {
      const level = getUrgencyLevel(riskScore);
      details.push(`Risk level: ${level}, score ${riskScore}`);
    }

    if (details.length === 0) {
      speak("No patient details entered yet");
    } else {
      speak(details.join(". "));
    }
  }, [patientName, calculatedAge, sex, chiefComplaint, complaintTags, heartRate, systolicBP, diastolicBP, oxygenSat, temperature, riskScore, speak]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    if (!heartRate || !systolicBP || !diastolicBP || !respiratoryRate || !oxygenSat) {
      playSound("warning");
      speak("Please fill required vital fields");
      toast({
        title: "Missing Required Fields",
        description: "Please fill all required vital sign fields.",
        variant: "destructive",
      });
      return;
    }

    if (!consentGiven) {
      playSound("warning");
      toast({
        title: "Consent Required",
        description: "Patient consent must be confirmed before submission.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Add case to store
    const newCase = addCase({
      patientName: patientName || "Unknown Patient",
      patientId: patientId || undefined,
      age: calculatedAge || 0,
      sex: (sex as 'M' | 'F' | 'Other') || 'Other',
      chiefComplaint: chiefComplaint || complaintTags.join(", ") || "Not specified",
      vitals: {
        heartRate: parseInt(heartRate),
        bloodPressure: `${systolicBP}/${diastolicBP}`,
        temperature: parseFloat(temperature) || 98.6,
        respiratoryRate: parseInt(respiratoryRate),
        oxygenSaturation: parseInt(oxygenSat),
        painLevel: painLevel ? parseInt(painLevel) : undefined,
      },
      medicalHistory: pastHistory.join(", ") || "None",
      currentMedications: currentMedications || "None",
      allergies: hasAllergies ? selectedAllergies.join(", ") : "None known",
      riskScore,
    });

    const level = getUrgencyLevel(riskScore);
    if (level === "critical") {
      playSound("critical");
      speak("Critical case registered");
    } else {
      playSound("success");
    }

    toast({
      title: "Case Created",
      description: `Case ${newCase.id} created. Risk level: ${level.toUpperCase()}`,
    });

    setIsSubmitting(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Emergency Triage</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Audio Controls */}
              <Button
                type="button"
                variant={dndMode ? "destructive" : "outline"}
                size="sm"
                onClick={() => setDndMode(!dndMode)}
                className="gap-1"
              >
                {dndMode ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span className="hidden sm:inline">{dndMode ? "DND On" : "Audio"}</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReadback}
                className="gap-1"
              >
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">Readback</span>
              </Button>

              {riskScore > 0 && (
                <RiskScoreBadge score={riskScore} />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Patient Information */}
          <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input 
                    id="patientName" 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full Name" 
                    required 
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input 
                    id="patientId" 
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="PT-####" 
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <DateOfBirthPicker 
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    className="w-full"
                  />
                  {calculatedAge !== null && (
                    <p className="text-sm text-muted-foreground">Age: {calculatedAge} years</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex *</Label>
                  <Select value={sex} onValueChange={setSex}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg max-h-[200px] overflow-y-auto">
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mode of Arrival */}
              <div className="space-y-2">
                <Label>Mode of Arrival</Label>
                <QuickSelectTags
                  options={MODE_OF_ARRIVAL}
                  selected={modeOfArrival}
                  onToggle={(v) => setModeOfArrival(prev => 
                    prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Chief Complaint */}
          <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-red-500" />
                Chief Complaint
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Primary Complaint *</Label>
                <Select value={chiefComplaint} onValueChange={setChiefComplaint}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select primary complaint" />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-50 bg-background border shadow-lg max-h-[300px] overflow-y-auto"
                    position="popper"
                    sideOffset={4}
                  >
                    {CHIEF_COMPLAINTS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quick Select Tags</Label>
                <QuickSelectTags
                  options={CHIEF_COMPLAINTS}
                  selected={complaintTags}
                  onToggle={toggleComplaintTag}
                />
              </div>

              <div className="space-y-2">
                <Label>Time of Onset</Label>
                <QuickSelectTags
                  options={TIME_OF_ONSET}
                  selected={timeOfOnset ? [timeOfOnset] : []}
                  onToggle={(v) => setTimeOfOnset(v === timeOfOnset ? "" : v)}
                  singleSelect
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaintNotes">Additional Notes</Label>
                <div className="flex gap-2">
                  <Textarea 
                    id="complaintNotes"
                    value={complaintNotes}
                    onChange={(e) => setComplaintNotes(e.target.value)}
                    placeholder="Additional details..."
                    rows={2}
                    className="rounded-lg flex-1"
                  />
                  <VoiceInput onTranscript={(text) => setComplaintNotes(prev => prev ? `${prev} ${text}` : text)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-teal-600" />
                  Vital Signs
                </CardTitle>
                {riskScore > 0 && <RiskScoreBadge score={riskScore} />}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heartRate">HR (bpm) *</Label>
                  <Input 
                    id="heartRate" 
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="72" 
                    required 
                    min="30" 
                    max="300" 
                    className={cn(
                      "rounded-lg",
                      heartRate && (parseInt(heartRate) < 50 || parseInt(heartRate) > 110) && "border-orange-500 bg-orange-50"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>BP (mmHg) *</Label>
                  <div className="flex gap-1 items-center">
                    <Input 
                      type="number"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(e.target.value)}
                      placeholder="120" 
                      required 
                      min="50" 
                      max="300" 
                      className={cn(
                        "rounded-lg w-16",
                        systolicBP && (parseInt(systolicBP) < 90 || parseInt(systolicBP) > 180) && "border-orange-500 bg-orange-50"
                      )}
                    />
                    <span>/</span>
                    <Input 
                      type="number"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(e.target.value)}
                      placeholder="80" 
                      required 
                      min="30" 
                      max="200" 
                      className="rounded-lg w-16"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate">RR (/min) *</Label>
                  <Input 
                    id="respiratoryRate" 
                    type="number"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(e.target.value)}
                    placeholder="16" 
                    required 
                    min="5" 
                    max="60" 
                    className={cn(
                      "rounded-lg",
                      respiratoryRate && (parseInt(respiratoryRate) < 10 || parseInt(respiratoryRate) > 30) && "border-orange-500 bg-orange-50"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygenSat">SpO₂ (%) *</Label>
                  <Input 
                    id="oxygenSat" 
                    type="number"
                    value={oxygenSat}
                    onChange={(e) => setOxygenSat(e.target.value)}
                    placeholder="98" 
                    required 
                    min="50" 
                    max="100" 
                    className={cn(
                      "rounded-lg",
                      oxygenSat && parseInt(oxygenSat) < 94 && "border-orange-500 bg-orange-50"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temp (°F) *</Label>
                  <Input 
                    id="temperature" 
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="98.6" 
                    required 
                    min="90" 
                    max="110" 
                    className={cn(
                      "rounded-lg",
                      temperature && (parseFloat(temperature) < 97 || parseFloat(temperature) > 100.4) && "border-orange-500 bg-orange-50"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="painLevel">Pain (0-10)</Label>
                  <Select value={painLevel} onValueChange={setPainLevel}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="--" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg max-h-[200px] overflow-y-auto" position="popper" sideOffset={4}>
                      {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Consciousness - AVPU */}
              <div className="space-y-2">
                <Label>Consciousness (AVPU) *</Label>
                <RadioGroup 
                  value={consciousness} 
                  onValueChange={setConsciousness}
                  className="flex flex-wrap gap-4"
                >
                  {[
                    { value: "A", label: "Alert" },
                    { value: "V", label: "Voice Responsive" },
                    { value: "P", label: "Pain Responsive" },
                    { value: "U", label: "Unresponsive" },
                  ].map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`avpu-${opt.value}`} />
                      <Label htmlFor={`avpu-${opt.value}`} className="font-normal cursor-pointer">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* GCS Dropdowns */}
              <div className="space-y-2">
                <Label>Glasgow Coma Scale (GCS)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Eye (E)</Label>
                    <Select value={gcsEye} onValueChange={setGcsEye}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background border shadow-lg max-h-[200px] overflow-y-auto" position="popper" sideOffset={4}>
                        <SelectItem value="4">4 - Spontaneous</SelectItem>
                        <SelectItem value="3">3 - To Voice</SelectItem>
                        <SelectItem value="2">2 - To Pain</SelectItem>
                        <SelectItem value="1">1 - None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Verbal (V)</Label>
                    <Select value={gcsVerbal} onValueChange={setGcsVerbal}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background border shadow-lg max-h-[200px] overflow-y-auto" position="popper" sideOffset={4}>
                        <SelectItem value="5">5 - Oriented</SelectItem>
                        <SelectItem value="4">4 - Confused</SelectItem>
                        <SelectItem value="3">3 - Inappropriate</SelectItem>
                        <SelectItem value="2">2 - Incomprehensible</SelectItem>
                        <SelectItem value="1">1 - None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Motor (M)</Label>
                    <Select value={gcsMotor} onValueChange={setGcsMotor}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background border shadow-lg max-h-[200px] overflow-y-auto" position="popper" sideOffset={4}>
                        <SelectItem value="6">6 - Obeys Commands</SelectItem>
                        <SelectItem value="5">5 - Localizes Pain</SelectItem>
                        <SelectItem value="4">4 - Withdraws</SelectItem>
                        <SelectItem value="3">3 - Flexion</SelectItem>
                        <SelectItem value="2">2 - Extension</SelectItem>
                        <SelectItem value="1">1 - None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  GCS Total: {parseInt(gcsEye) + parseInt(gcsVerbal) + parseInt(gcsMotor)}/15
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trauma Fields - Conditional */}
          {isTraumaCase && (
            <Card className="border-red-200 shadow-md rounded-2xl overflow-hidden bg-red-50/30">
              <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                  <Bandage className="h-5 w-5" />
                  Trauma Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Body Map */}
                  <div className="space-y-2">
                    <Label>Injury Sites (click to select)</Label>
                    <div className="flex justify-center">
                      <BodyMapIllustration
                        selectedSites={injurySites}
                        onToggleSite={toggleInjurySite}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {injurySites.map((site) => (
                        <span key={site} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                          {site}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Mechanism of Injury */}
                    <div className="space-y-2">
                      <Label>Mechanism of Injury</Label>
                      <div className="flex flex-wrap gap-2">
                        {MECHANISMS_OF_INJURY.map((mech) => (
                          <label key={mech} className="flex items-center gap-1.5 text-sm">
                            <Checkbox
                              checked={mechanismsOfInjury.includes(mech)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setMechanismsOfInjury(prev => [...prev, mech]);
                                } else {
                                  setMechanismsOfInjury(prev => prev.filter(m => m !== mech));
                                }
                              }}
                            />
                            {mech}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Bleeding Severity */}
                    <div className="space-y-2">
                      <Label>Bleeding Severity</Label>
                      <RadioGroup value={bleedingSeverity} onValueChange={setBleedingSeverity} className="flex flex-wrap gap-4">
                        {["None", "Mild", "Moderate", "Severe"].map((opt) => (
                          <div key={opt} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.toLowerCase()} id={`bleeding-${opt}`} />
                            <Label htmlFor={`bleeding-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Airway Status */}
                    <div className="space-y-2">
                      <Label>Airway Status</Label>
                      <div className="flex flex-wrap gap-3">
                        {["Patent", "Partially Obstructed", "Fully Obstructed"].map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 text-sm">
                            <Checkbox
                              checked={airwayStatus.includes(opt)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAirwayStatus(prev => [...prev, opt]);
                                } else {
                                  setAirwayStatus(prev => prev.filter(a => a !== opt));
                                }
                              }}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Trauma Devices */}
                    <div className="space-y-2">
                      <Label>Devices Applied</Label>
                      <div className="flex flex-wrap gap-3">
                        {["Cervical Collar", "Splint", "Tourniquet", "Oxygen Support"].map((device) => (
                          <label key={device} className="flex items-center gap-1.5 text-sm">
                            <Checkbox
                              checked={traumaDevices.includes(device)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setTraumaDevices(prev => [...prev, device]);
                                } else {
                                  setTraumaDevices(prev => prev.filter(d => d !== device));
                                }
                              }}
                            />
                            {device}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical History */}
          <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5 text-purple-600" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Allergies */}
              <div className="space-y-2">
                <Label>Known Allergies?</Label>
                <RadioGroup 
                  value={hasAllergies === null ? "" : hasAllergies ? "yes" : "no"} 
                  onValueChange={(v) => setHasAllergies(v === "yes")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="allergies-yes" />
                    <Label htmlFor="allergies-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="allergies-no" />
                    <Label htmlFor="allergies-no" className="font-normal cursor-pointer">No / Unknown</Label>
                  </div>
                </RadioGroup>
                
                {hasAllergies && (
                  <div className="mt-2 pl-4 border-l-2 border-purple-200">
                    <Label className="text-sm">Select allergies:</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ALLERGY_OPTIONS.map((allergy) => (
                        <label key={allergy} className="flex items-center gap-1.5 text-sm">
                          <Checkbox
                            checked={selectedAllergies.includes(allergy)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAllergies(prev => [...prev, allergy]);
                              } else {
                                setSelectedAllergies(prev => prev.filter(a => a !== allergy));
                              }
                            }}
                          />
                          {allergy}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Past Medical History */}
              <div className="space-y-2">
                <Label>Past Medical History</Label>
                <div className="flex flex-wrap gap-2">
                  {PAST_HISTORY_OPTIONS.map((condition) => (
                    <label key={condition} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={pastHistory.includes(condition)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPastHistory(prev => [...prev, condition]);
                          } else {
                            setPastHistory(prev => prev.filter(p => p !== condition));
                          }
                        }}
                      />
                      {condition}
                    </label>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <div className="flex gap-2">
                  <Textarea 
                    id="medications"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="List medications..."
                    rows={2}
                    className="rounded-lg flex-1"
                  />
                  <VoiceInput onTranscript={(text) => setCurrentMedications(prev => prev ? `${prev} ${text}` : text)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consent */}
          <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-green-600" />
                Consent & Authorization
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(!!checked)}
                  className="mt-0.5"
                />
                <span className="text-sm">
                  Patient/Guardian consents to emergency treatment, data collection for triage purposes, 
                  and understands that information will be shared with healthcare providers as necessary for care.
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Attachments */}
          <AttachmentsCard />

          {/* Quick Actions */}
          <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  // Reset form
                  setPatientName("");
                  setDateOfBirth("");
                  setChiefComplaint("");
                  setComplaintTags([]);
                  playSound("click");
                }}>
                  Clear Form
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleReadback}>
                  <Play className="h-4 w-4 mr-1" />
                  Audio Readback
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={stopSpeaking}>
                  <VolumeX className="h-4 w-4 mr-1" />
                  Stop Audio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={isSubmitting}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting} 
              className="rounded-lg gap-2 min-w-[180px]"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Submit & Score
                  {riskScore > 0 && (
                    <span className="ml-1 text-xs opacity-80">({riskScore})</span>
                  )}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Intake;
