# CardioAssist Demo Script

**Duration:** 2-4 minutes  
**Goal:** Demonstrate AI-powered emergency triage with privacy-first architecture

---

## Setup (Before Demo)

1. Ensure demo mode is active (visit with `?demo=true` or set `VITE_DEMO_MODE=true`)
2. Open `http://localhost:8080` in browser
3. Have 10 synthetic cases pre-loaded

---

## Demo Flow

### **Opening (30 seconds)**

> "I'm going to show you CardioAssist—an AI-powered emergency triage assistant that helps hospitals prioritize patients faster while keeping all data secure inside their Snowflake environment."

**Action:** Show landing page, briefly highlight the three feature cards:
- Instant Risk Scoring
- Privacy-First Architecture  
- Full Audit Trail

### **Act 1: Queue Dashboard (60 seconds)**

**Action:** Click "View Dashboard"

> "Here's the triage queue. Notice cases are automatically sorted by AI risk score—high risk at the top."

**Action:** Point to the stats at top (High Risk: 4, Medium: 3, Low: 3)

> "Each case shows the patient's chief complaint, risk level, and status. Let's look at this critical case."

**Action:** Click on CASE-001 (John D., 68M, chest pain, Risk: HIGH 92)

### **Act 2: Case Detail & AI Summary (90 seconds)**

**Action:** On Case Detail page, highlight patient info and vitals

> "This is a 68-year-old male with severe chest pain, heart rate 112, elevated blood pressure. Classic signs of acute coronary syndrome."

**Action:** Click "AI Summary" tab

> "The AI has analyzed his vitals, medical history—including a previous MI—and current symptoms. It's flagging this as critical and recommending immediate ECG and cardiology consult."

**Action:** Click "Show Explainability"

> "Here's the key: we can see exactly how the AI reached this conclusion. The model, temperature settings, and prompt are all logged. In production, this goes to Snowflake's audit table for full compliance."

**Action:** Click "Timeline" tab

> "Every action is tracked. Who created the case, when, and what happened next."

### **Act 3: New Intake (45 seconds)**

**Action:** Navigate back to Dashboard, click "New Intake"

> "Let's add a new patient. The intake form captures vitals, chief complaint, medical history—everything needed for risk scoring."

**Action:** Quickly fill in a few fields (name, age, complaint, heart rate)

> "When we click Submit & Score, the system would send this to our Snowpark pipeline in Snowflake, run the risk model, generate an AI summary using Cortex, and place the patient in the queue—all without data leaving the secure environment."

**Action:** Click "Submit & Score" (or just point to it without submitting)

### **Act 4: Admin & Privacy (30 seconds)**

**Action:** Navigate to Admin page (if time permits, otherwise mention it)

> "Finally, the admin panel shows our audit trail. Notice the PII masking toggle—patient IDs are masked by default using Snowflake's dynamic data masking policies."

**Action:** Toggle masking on/off to demonstrate

> "This ensures compliance while giving admins the visibility they need."

### **Closing (15 seconds)**

> "So in summary: CardioAssist gives emergency departments AI-powered triage that's fast, accurate, and privacy-first. All processing happens in Snowflake, fully auditable, with no patient data exposed. Thank you!"

---

## Key Points to Emphasize

✅ **AI-powered** - Instant risk scoring saves critical time  
✅ **Privacy-first** - All processing inside Snowflake  
✅ **Explainable** - See exactly how AI reached conclusions  
✅ **Compliant** - Full audit trail + data masking  
✅ **Production-ready** - Real integrations (Auth0, S3, Snowpark)

---

## Backup Talking Points (If Asked)

**Q: How accurate is the risk scoring?**  
> "The model uses evidence-based clinical parameters. In production, you'd train on your historical triage data. The demo uses a rule-based fallback for illustration."

**Q: What about edge cases?**  
> "That's where explainability is crucial. Clinicians can see the AI's reasoning and override if needed. Every decision is logged for review."

**Q: How does Snowflake integration work?**  
> "We provide Snowpark scripts that run inside Snowflake. Your data never leaves your environment. Cortex handles the AI summarization. See the docs folder for complete setup instructions."

**Q: What about Auth0 / S3 / other integrations?**  
> "All the stubs are in place. The .env.example shows what secrets you need. Our docs walk through connecting each service step by step."
