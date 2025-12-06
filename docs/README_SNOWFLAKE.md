# Snowflake Integration Guide

This guide explains how to connect CardioAssist to your Snowflake environment for production use.

---

## Prerequisites

- Snowflake account with appropriate permissions
- Python 3.9+ for Snowpark scripts
- Access to create databases, tables, and UDFs

---

## Step 1: Create Database and Tables

### 1.1 Run DDL Script

Execute the SQL DDL script to create the required tables and masking policies:

```bash
# Log into Snowflake SQL Worksheet or use snowsql CLI
snowsql -a <your_account> -u <your_user>

# Run the DDL script
!source sfdemo/snowflake_tables.sql
```

This creates:
- `stg_intakes` - Staging table for raw intake data
- `intake_results` - Risk scores, AI summaries, and metadata
- `audit_log` - Complete audit trail with user actions

### 1.2 Verify Table Creation

```sql
USE DATABASE cardioassist_db;
USE SCHEMA public;

SHOW TABLES;
-- Should see: stg_intakes, intake_results, audit_log

DESCRIBE TABLE stg_intakes;
```

---

## Step 2: Configure Masking Policies

Masking policies are included in the DDL script. Verify they're applied:

```sql
-- Check masking policies
SHOW MASKING POLICIES IN SCHEMA public;

-- Should see:
-- mask_patient_id (applied to patient_id columns)
-- mask_case_id (applied to case_id columns)
```

### How Masking Works

- **Admins**: See unmasked data
- **Doctors/Nurses**: See masked patient IDs (e.g., `PT-***`)
- **Audit viewers**: See masked case IDs by default

To modify masking rules:

```sql
-- Example: Allow doctors to see unmasked patient IDs
ALTER MASKING POLICY mask_patient_id 
  SET BODY -> 
    CASE 
      WHEN CURRENT_ROLE() IN ('ADMIN', 'DOCTOR') THEN val
      ELSE 'PT-***'
    END;
```

---

## Step 3: Set Up Snowpark Pipeline

### 3.1 Install Snowpark Python

```bash
pip install snowflake-snowpark-python
pip install pandas
```

### 3.2 Configure Connection

Create `snowflake_config.json` (do NOT commit to git):

```json
{
  "account": "your_account",
  "user": "your_user",
  "password": "your_password",
  "warehouse": "your_warehouse",
  "database": "cardioassist_db",
  "schema": "public",
  "role": "ACCOUNTADMIN"
}
```

### 3.3 Run Risk Scoring Pipeline

```bash
cd sfdemo
python snowpark_pipeline.py --config snowflake_config.json
```

This script:
1. Reads from `stg_intakes`
2. Calculates risk scores based on vitals and history
3. Writes results to `intake_results`

### 3.4 Customize Risk Logic

Edit `snowpark_pipeline.py` to adjust risk scoring:

```python
def calculate_risk_score(vitals, age, history):
    score = 0
    
    # Vital sign weights
    if vitals['heart_rate'] > 100:
        score += 20
    if vitals['oxygen_saturation'] < 92:
        score += 25
    
    # Age factor
    if age > 65:
        score += 10
    
    # History factors
    if 'cardiac' in history.lower():
        score += 15
    
    return min(score, 100)  # Cap at 100
```

---

## Step 4: Integrate Cortex AI

### 4.1 Enable Cortex in Your Account

```sql
-- Check if Cortex is available
SHOW FUNCTIONS LIKE 'SNOWFLAKE.CORTEX.COMPLETE';
```

If not available, contact Snowflake support to enable Cortex.

### 4.2 Create Summarization UDF

```sql
CREATE OR REPLACE FUNCTION generate_clinical_summary(
    chief_complaint STRING,
    vitals OBJECT,
    age NUMBER,
    medical_history STRING
)
RETURNS STRING
LANGUAGE PYTHON
RUNTIME_VERSION = '3.9'
PACKAGES = ('snowflake-snowpark-python')
HANDLER = 'summarize'
AS
$$
import json
from snowflake.snowpark import Session

def summarize(chief_complaint, vitals, age, medical_history):
    # Load prompt template
    prompt = f"""You are a clinical AI assistant. Analyze this patient:
    
Chief Complaint: {chief_complaint}
Age: {age}
Vitals: {json.dumps(vitals)}
History: {medical_history}

Provide a concise clinical summary in 3-4 bullet points:
- Priority level (CRITICAL/URGENT/MODERATE/LOW)
- Key findings
- Recommended immediate actions
"""
    
    # Call Cortex
    response = Session.builder.getOrCreate().sql(f"""
        SELECT SNOWFLAKE.CORTEX.COMPLETE(
            'mixtral-8x7b',
            '{prompt}',
            {{
                'temperature': 0.2,
                'max_tokens': 384
            }}
        ) AS summary
    """).collect()[0]['SUMMARY']
    
    return response
$$;
```

### 4.3 Test UDF

```sql
SELECT generate_clinical_summary(
    'Severe chest pain radiating to left arm',
    OBJECT_CONSTRUCT(
        'heart_rate', 112,
        'blood_pressure', '160/95',
        'oxygen_saturation', 92
    ),
    68,
    'Hypertension, Type 2 Diabetes, Previous MI (2019)'
) AS ai_summary;
```

### 4.4 Configure Prompt Templates

Edit `sfdemo/cortex_prompt_templates/summary_prompt.txt`:

```
You are a clinical AI assistant analyzing emergency department triage cases.

Patient Information:
- Chief Complaint: {{chief_complaint}}
- Age: {{age}} years, Sex: {{sex}}
- Vitals: HR {{heart_rate}}, BP {{blood_pressure}}, Temp {{temperature}}°F, RR {{respiratory_rate}}, O₂ Sat {{oxygen_saturation}}%
- Pain Level: {{pain_level}}/10
- Medical History: {{medical_history}}
- Current Medications: {{current_medications}}
- Allergies: {{allergies}}

Instructions:
1. Assess urgency level (CRITICAL/URGENT/MODERATE/LOW PRIORITY)
2. Identify key clinical findings
3. Recommend immediate diagnostic/treatment actions
4. Keep response under 100 words, use bullet points
5. Start with priority marker (e.g., "**CRITICAL:**")

Output Format:
**[PRIORITY]:** [Brief assessment]. [Key findings]. **Recommend:** [Actions].
```

---

## Step 5: Configure Backend API

### 5.1 Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5.2 Set Environment Variables

```bash
export SNOWFLAKE_ACCOUNT=your_account
export SNOWFLAKE_USER=your_user
export SNOWFLAKE_PASSWORD=your_password
export SNOWFLAKE_WAREHOUSE=your_warehouse
export SNOWFLAKE_DATABASE=cardioassist_db
export SNOWFLAKE_SCHEMA=public
```

### 5.3 Test Connection

```bash
python -c "
from snowflake.snowpark import Session
import os

session = Session.builder.configs({
    'account': os.getenv('SNOWFLAKE_ACCOUNT'),
    'user': os.getenv('SNOWFLAKE_USER'),
    'password': os.getenv('SNOWFLAKE_PASSWORD'),
    'warehouse': os.getenv('SNOWFLAKE_WAREHOUSE'),
    'database': os.getenv('SNOWFLAKE_DATABASE'),
    'schema': os.getenv('SNOWFLAKE_SCHEMA')
}).create()

print('Connected:', session.sql('SELECT CURRENT_DATABASE()').collect())
"
```

---

## Step 6: Audit and Monitoring

### 6.1 Query Audit Logs

```sql
-- View recent audit events
SELECT 
    timestamp,
    user_name,
    action,
    resource,
    result
FROM audit_log
ORDER BY timestamp DESC
LIMIT 50;

-- Track AI usage
SELECT 
    DATE_TRUNC('hour', timestamp) AS hour,
    COUNT(*) AS ai_summaries_generated
FROM intake_results
WHERE ai_summary IS NOT NULL
GROUP BY hour
ORDER BY hour DESC;
```

### 6.2 Set Up Alerts

```sql
-- Create alert for high-risk cases
CREATE OR REPLACE ALERT high_risk_alert
  WAREHOUSE = your_warehouse
  SCHEDULE = '5 MINUTE'
  IF (EXISTS (
    SELECT 1 
    FROM intake_results 
    WHERE risk_score > 80 
      AND created_at > DATEADD(minute, -5, CURRENT_TIMESTAMP())
  ))
  THEN
    CALL SYSTEM$SEND_EMAIL(
      'your-alert-email@example.com',
      'High Risk Patient Alert',
      'New high-risk triage cases detected'
    );
```

---

## Troubleshooting

### Issue: "Object does not exist" error

**Solution:** Verify you're in the correct database/schema:
```sql
USE DATABASE cardioassist_db;
USE SCHEMA public;
```

### Issue: Masking policy not applied

**Solution:** Check your role has permission to see masked data:
```sql
SHOW GRANTS TO ROLE your_role;
```

### Issue: Cortex function not found

**Solution:** Ensure Cortex is enabled in your account. Contact Snowflake support.

### Issue: Snowpark connection timeout

**Solution:** Check network connectivity and warehouse status:
```sql
SHOW WAREHOUSES;
ALTER WAREHOUSE your_warehouse RESUME;
```

---

## Production Checklist

✅ Tables created with proper constraints  
✅ Masking policies applied and tested  
✅ Snowpark pipeline deployed and scheduled  
✅ Cortex UDF created and tested  
✅ Backend API connected to Snowflake  
✅ Audit logging enabled  
✅ Alerts configured for high-risk cases  
✅ Secrets stored securely (not in code)  
✅ Role-based access control configured  
✅ Monitoring dashboard set up

---

## Next Steps

1. **Performance Testing**: Load test with realistic case volumes
2. **Model Tuning**: Adjust risk scoring weights based on outcomes
3. **Prompt Engineering**: Refine Cortex prompts for better summaries
4. **Integration**: Connect Auth0, S3, and other services
5. **Monitoring**: Set up Snowflake resource monitors and cost alerts

For questions, see the main README or open an issue.
