import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Lock, AlertTriangle, Home, Activity, FileText, Users, Heart, UserRound, CheckCircle2, Cloud, Database, Mail, Phone, Facebook, Twitter, Linkedin, Instagram, Clock, TrendingUp, Stethoscope } from "lucide-react";
import { DEMO_MODE } from "@/lib/demoMode";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-medical-tech.jpg";
import personaDoctor from "@/assets/persona-doctor.png";
import personaNurse from "@/assets/persona-nurse.png";
import personaPatient from "@/assets/persona-patient.png";
import phoneMockup from "@/assets/phone-mockup.png";
import HeartbeatAnimation from "@/components/HeartbeatAnimation";
import { AnimatedSection } from "@/components/AnimatedSection";
import { StatCounter } from "@/components/StatCounter";
import { ParallaxHero } from "@/components/ParallaxHero";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";

const Index = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b border-nav-border bg-card sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-[22px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Shield className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>CardioAssist</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/dashboard')}
                size="sm"
                className="rounded-full px-6 bg-primary hover:bg-primary-hover transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Go to dashboard"
              >
                Dashboard
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                size="sm"
                className="rounded-full px-6 border-2 border-primary text-primary hover:bg-primary/5 transition-all duration-300"
                aria-label="Sign in to CardioAssist"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="border-b border-nav-border bg-card sticky top-[95px] z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            {[
              { id: "home", label: "Home", icon: Home },
              { id: "features", label: "Features", icon: Zap },
              { id: "about", label: "About", icon: FileText },
              { id: "contact", label: "Contact", icon: Users },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-300",
                  "text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg"
                )}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* Demo Mode Banner */}
        {DEMO_MODE && (
          <div className="bg-status-new/10 border-b border-status-new/20">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-status-new">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <span className="font-medium">Demo Mode Active</span>
                <span className="text-muted-foreground">— Using synthetic patient data</span>
              </div>
            </div>
          </div>
        )}

        {/* Hero with Parallax */}
        <ParallaxHero backgroundImage={heroImage} className="min-h-[80vh]">
          <section id="home" className="scroll-mt-32 container mx-auto px-4 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="space-y-8 text-left">
                <AnimatedSection animation="fade-up">
                  <h2 className="text-5xl font-bold text-foreground leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    AI-Powered Emergency Triage
                  </h2>
                </AnimatedSection>
                <AnimatedSection animation="fade-up" delay={100}>
                  <p className="text-xl text-foreground/80 leading-relaxed">
                    Prioritize patients faster with privacy-first clinical summaries. All processing happens securely inside your Snowflake environment.
                  </p>
                </AnimatedSection>
                <AnimatedSection animation="fade-up" delay={200}>
                  <div className="flex flex-col gap-4 pt-4">
                    <Button
                      size="lg"
                      onClick={() => navigate('/dashboard')}
                      className="px-8 py-6 text-base bg-primary hover:bg-primary-hover rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 justify-center"
                      aria-label="Medical staff member portal"
                    >
                      <UserRound className="h-5 w-5" />
                      I am a Medical Staff Member
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/intake')}
                      className="px-8 py-6 text-base border-2 border-primary text-primary bg-background/80 backdrop-blur-sm hover:bg-primary/5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 justify-center"
                      aria-label="Patient portal"
                    >
                      <Heart className="h-5 w-5" />
                      I am a Patient
                    </Button>
                  </div>
                </AnimatedSection>
              </div>
              <AnimatedSection animation="fade-left" delay={300}>
                <div className="relative hidden md:block">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
                  <img 
                    src={heroImage} 
                    alt="Doctor using digital tablet with AI hologram scanning patient" 
                    className="relative rounded-3xl shadow-2xl w-full h-auto border border-white/20"
                  />
                </div>
              </AnimatedSection>
            </div>
          </section>
        </ParallaxHero>

        {/* Features */}
        <section id="features" className="scroll-mt-32 container mx-auto px-4 py-16 bg-gradient-to-b from-transparent to-muted/20">
          <AnimatedSection animation="fade-up">
            <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Key Features</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Discover how CardioAssist transforms emergency care with cutting-edge technology</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AnimatedSection animation="fade-up" delay={0}>
              <div className="card-glass p-8 space-y-4 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.15]">
                  <Activity className="w-full h-full text-secondary transform rotate-12" />
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/60 relative z-10">
                  <Zap className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold relative z-10">Instant Risk Scoring</h3>
                <p className="text-muted-foreground relative z-10">
                  AI analyzes vitals, history, and symptoms to generate risk scores in seconds, helping you prioritize critical cases immediately.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={150}>
              <div className="card-glass p-8 space-y-4 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.15]">
                  <Shield className="w-full h-full text-[#10b981] transform rotate-12" />
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#10b981]/60 relative z-10">
                  <Lock className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold relative z-10">Privacy-First Architecture</h3>
                <p className="text-muted-foreground relative z-10">
                  All data processing happens inside your Snowflake environment. Patient data never leaves your secure perimeter.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <div className="card-glass p-8 space-y-4 relative overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.15]">
                  <FileText className="w-full h-full text-[#ef4444] transform rotate-12" />
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ef4444] to-[#ef4444]/60 relative z-10">
                  <Shield className="h-8 w-8 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold relative z-10">Full Audit Trail</h3>
                <p className="text-muted-foreground relative z-10">
                  Every AI decision is logged with prompts, confidence scores, and user actions for complete clinical accountability.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCounter
                value={50000}
                suffix="+"
                label="Patients Triaged"
                icon={Users}
              />
              <StatCounter
                value={98}
                suffix="%"
                label="Accuracy Rate"
                icon={TrendingUp}
              />
              <StatCounter
                value={45}
                suffix="s"
                label="Avg. Triage Time"
                icon={Clock}
              />
              <StatCounter
                value={500}
                suffix="+"
                label="Healthcare Facilities"
                icon={Stethoscope}
              />
            </div>
          </div>
        </section>

        {/* User Personas Section */}
        <section className="scroll-mt-32 container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-muted/30">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Built for Every Healthcare Role</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Tailored features for doctors, nurses, and patients to streamline emergency care</p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Doctors */}
            <AnimatedSection animation="fade-up" delay={0}>
              <div className="card-glass p-8 space-y-6 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="flex justify-center">
                  <img src={personaDoctor} alt="Doctor with stethoscope" className="w-32 h-32 rounded-full shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-primary">Doctors</h3>
                <ul className="text-left space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>AI-powered risk scoring for instant patient prioritization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Comprehensive dashboards with real-time analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Complete patient history at your fingertips</span>
                  </li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary-hover" onClick={() => navigate('/dashboard')}>
                  Access Doctor Portal
                </Button>
              </div>
            </AnimatedSection>

            {/* Nurses */}
            <AnimatedSection animation="fade-up" delay={150}>
              <div className="card-glass p-8 space-y-6 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="flex justify-center">
                  <img src={personaNurse} alt="Nurse with clipboard" className="w-32 h-32 rounded-full shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-primary">Nurses</h3>
                <ul className="text-left space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Smart triage tools for efficient patient intake</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Real-time alerts for critical cases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Streamlined workflow management</span>
                  </li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary-hover" onClick={() => navigate('/intake')}>
                  Access Nurse Portal
                </Button>
              </div>
            </AnimatedSection>

            {/* Patients */}
            <AnimatedSection animation="fade-up" delay={300}>
              <div className="card-glass p-8 space-y-6 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="flex justify-center">
                  <img src={personaPatient} alt="Patient in wheelchair" className="w-32 h-32 rounded-full shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold text-primary">Patients</h3>
                <ul className="text-left space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Easy symptom input and digital check-in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Real-time wait time updates and status tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Secure access to your medical information</span>
                  </li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary-hover" onClick={() => navigate('/intake')}>
                  Patient Check-In
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection animation="fade-up">
              <h3 className="text-center text-2xl font-bold mb-8 text-muted-foreground">Trusted by Healthcare Professionals Worldwide</h3>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <AnimatedSection animation="scale" delay={0}>
                <div className="card-glass p-6 text-center space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                  <div className="flex justify-center">
                    <Shield className="h-12 w-12 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">HIPAA Compliant</h4>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="scale" delay={100}>
                <div className="card-glass p-6 text-center space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                  <div className="flex justify-center">
                    <Database className="h-12 w-12 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">Snowflake Powered</h4>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="scale" delay={200}>
                <div className="card-glass p-6 text-center space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                  <div className="flex justify-center">
                    <Cloud className="h-12 w-12 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">AWS Bedrock Enabled</h4>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="scale" delay={300}>
                <div className="card-glass p-6 text-center space-y-3 hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                  <div className="flex justify-center">
                    <Lock className="h-12 w-12 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm">Hospital-Grade Security</h4>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Testimonials Carousel */}
        <TestimonialsCarousel />

        {/* Mobile App Showcase */}
        <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-muted/30 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <AnimatedSection animation="fade-right">
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Access Anywhere, Anytime
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    CardioAssist is optimized for mobile devices, allowing healthcare professionals to access critical patient information on the go. Make faster decisions with our intuitive mobile interface.
                  </p>
                  <HeartbeatAnimation />
                  <div className="flex gap-4 pt-4">
                    <Button size="lg" className="bg-primary hover:bg-primary-hover">
                      Download iOS App
                    </Button>
                    <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/5">
                      Download Android
                    </Button>
                  </div>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="fade-left" delay={200}>
                <div className="flex justify-center">
                  <img
                    src={phoneMockup} 
                    alt="CardioAssist mobile app dashboard" 
                    className="w-full max-w-md drop-shadow-2xl"
                    style={{ transform: 'rotate(-5deg)' }}
                  />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="scroll-mt-32 container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">About CardioAssist</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              CardioAssist is a production-quality AI triage system designed for emergency departments. 
              Built with privacy and security at its core, it leverages Snowflake's powerful data platform 
              and Cortex AI to provide instant risk assessment without compromising patient data.
            </p>
            <div className="grid md:grid-cols-2 gap-6 pt-6">
              <div className="card-glass p-6 text-left space-y-2">
                <h3 className="font-semibold text-lg">HIPAA Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  All data stays within your secure Snowflake environment with comprehensive audit logging.
                </p>
              </div>
              <div className="card-glass p-6 text-left space-y-2">
                <h3 className="font-semibold text-lg">Real-Time Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Get instant risk scores and AI-generated summaries as patients arrive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="scroll-mt-32 container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Get in Touch</h2>
              <p className="text-lg text-muted-foreground">
                Interested in bringing CardioAssist to your emergency department? Contact our team for a demo.
              </p>
            </div>
            
            {/* Emergency Contact Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[#ef4444] to-[#dc2626]"></div>
              <div className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-[#ef4444] font-semibold text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Urgent Support Available</span>
                  </div>
                  <p className="text-muted-foreground">Our team is available 24/7 for critical issues</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="flex items-center gap-4 p-4 bg-[#F4F9FF] rounded-xl">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground font-medium">Email</div>
                      <div className="font-semibold text-foreground">demo@cardioassist.health</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-[#F4F9FF] rounded-xl">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground font-medium">Emergency Hotline</div>
                      <div className="font-semibold text-foreground">1-800-CARDIO-AI</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20">
          <div className="card-clinical max-w-3xl mx-auto p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Transform Your Triage Process?</h2>
            <p className="text-lg text-muted-foreground">
              Join emergency departments using CardioAssist to reduce wait times and improve patient outcomes.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/intake')}
              className="px-8 py-6 text-base"
              aria-label="Get started with CardioAssist"
            >
              Get Started
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative mt-20 bg-gradient-to-b from-primary/5 to-primary/10 border-t border-nav-border overflow-hidden">
        {/* Medical Symbol Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Activity className="w-96 h-96" />
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-foreground">CardioAssist</span>
              </div>
              <p className="text-sm text-muted-foreground">Privacy-first emergency triage for modern healthcare.</p>
            </div>
            
            {/* Product */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
                <li><a href="/intake" className="hover:text-primary transition-colors">Intake</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-nav-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2025 CardioAssist. All rights reserved.</p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-primary" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-primary" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-primary" />
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-primary" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;