-- CardioAssist Snowflake Database Schema
-- Run this script to create all required tables and masking policies

-- Create database and schema
CREATE DATABASE IF NOT EXISTS cardioassist_db;
USE DATABASE cardioassist_db;
CREATE SCHEMA IF NOT EXISTS public;
USE SCHEMA public;

-- =====================================================
-- STAGING TABLE: Raw intake data
-- =====================================================

CREATE OR REPLACE TABLE stg_intakes (
    intake_id STRING PRIMARY KEY,
    patient_id STRING NOT NULL,
    patient_name STRING NOT NULL,
    age NUMBER NOT NULL,
    sex STRING NOT NULL,
    chief_complaint STRING NOT NULL,
    
    -- Vitals (stored as OBJECT for flexibility)
    vitals OBJECT,
    
    -- Clinical data
    medical_history STRING,
    current_medications STRING,
    allergies STRING,
    
    -- Metadata
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    created_by STRING NOT NULL,
    
    -- File attachments (stored as ARRAY of S3 paths)
    attachments ARRAY,
    
    CONSTRAINT age_check CHECK (age >= 0 AND age <= 150)
);

-- =====================================================
-- RESULTS TABLE: Risk scores and AI summaries
-- =====================================================

CREATE OR REPLACE TABLE intake_results (
    result_id STRING PRIMARY KEY,
    intake_id STRING NOT NULL,
    patient_id STRING NOT NULL,
    
    -- Risk assessment
    risk_score NUMBER NOT NULL,
    risk_level STRING NOT NULL,
    
    -- AI-generated summary
    ai_summary STRING,
    ai_confidence NUMBER,
    ai_model_name STRING,
    ai_prompt_template STRING,
    ai_temperature NUMBER,
    ai_max_tokens NUMBER,
    
    -- Case status
    status STRING DEFAULT 'new',
    assigned_to STRING,
    
    -- Timestamps
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    
    CONSTRAINT fk_intake FOREIGN KEY (intake_id) REFERENCES stg_intakes(intake_id),
    CONSTRAINT risk_score_range CHECK (risk_score >= 0 AND risk_score <= 100),
    CONSTRAINT risk_level_check CHECK (risk_level IN ('high', 'medium', 'low')),
    CONSTRAINT status_check CHECK (status IN ('new', 'in-progress', 'completed', 'escalated')),
    CONSTRAINT confidence_range CHECK (ai_confidence >= 0 AND ai_confidence <= 1)
);

-- =====================================================
-- AUDIT LOG TABLE: Complete audit trail
-- =====================================================

CREATE OR REPLACE TABLE audit_log (
    log_id STRING PRIMARY KEY,
    timestamp TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    
    -- User information
    user_id STRING NOT NULL,
    user_name STRING NOT NULL,
    user_role STRING NOT NULL,
    
    -- Action details
    action STRING NOT NULL,
    resource_type STRING NOT NULL,
    resource_id STRING NOT NULL,
    
    -- Request metadata
    ip_address STRING,
    user_agent STRING,
    
    -- Result
    result STRING NOT NULL,
    error_message STRING,
    
    CONSTRAINT result_check CHECK (result IN ('SUCCESS', 'FAILURE', 'ERROR'))
);

-- =====================================================
-- MASKING POLICIES
-- =====================================================

-- Mask patient IDs for non-admin users
CREATE OR REPLACE MASKING POLICY mask_patient_id AS (val STRING) RETURNS STRING ->
  CASE
    WHEN CURRENT_ROLE() IN ('ACCOUNTADMIN', 'SYSADMIN', 'CARDIOASSIST_ADMIN') 
      THEN val
    ELSE 'PT-***'
  END;

-- Mask case/intake IDs for audit viewers
CREATE OR REPLACE MASKING POLICY mask_case_id AS (val STRING) RETURNS STRING ->
  CASE
    WHEN CURRENT_ROLE() IN ('ACCOUNTADMIN', 'SYSADMIN', 'CARDIOASSIST_ADMIN')
      THEN val
    ELSE REGEXP_REPLACE(val, '[0-9]', '*')
  END;

-- Mask patient names (show only initials)
CREATE OR REPLACE MASKING POLICY mask_patient_name AS (val STRING) RETURNS STRING ->
  CASE
    WHEN CURRENT_ROLE() IN ('ACCOUNTADMIN', 'SYSADMIN', 'CARDIOASSIST_ADMIN', 'CARDIOASSIST_DOCTOR')
      THEN val
    ELSE REGEXP_REPLACE(val, '\\b(\\w)[\\w]+', '\\1.')
  END;

-- Apply masking policies
ALTER TABLE stg_intakes MODIFY COLUMN patient_id 
  SET MASKING POLICY mask_patient_id;

ALTER TABLE stg_intakes MODIFY COLUMN patient_name 
  SET MASKING POLICY mask_patient_name;

ALTER TABLE intake_results MODIFY COLUMN patient_id 
  SET MASKING POLICY mask_patient_id;

ALTER TABLE audit_log MODIFY COLUMN resource_id 
  SET MASKING POLICY mask_case_id;

-- =====================================================
-- INDEXES for performance
-- =====================================================

-- Index on risk score for queue sorting
CREATE INDEX IF NOT EXISTS idx_risk_score 
  ON intake_results(risk_score DESC);

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_status 
  ON intake_results(status);

-- Index on created_at for timeline queries
CREATE INDEX IF NOT EXISTS idx_created_at 
  ON intake_results(created_at DESC);

-- Index on patient_id for lookups
CREATE INDEX IF NOT EXISTS idx_patient_id 
  ON stg_intakes(patient_id);

-- =====================================================
-- VIEWS for common queries
-- =====================================================

-- Active queue view (non-completed cases)
CREATE OR REPLACE VIEW v_active_queue AS
SELECT 
    r.result_id,
    r.intake_id,
    i.patient_id,
    i.patient_name,
    i.age,
    i.sex,
    i.chief_complaint,
    r.risk_score,
    r.risk_level,
    r.status,
    r.assigned_to,
    i.created_at AS arrival_time,
    r.updated_at AS last_updated
FROM intake_results r
JOIN stg_intakes i ON r.intake_id = i.intake_id
WHERE r.status != 'completed'
ORDER BY r.risk_score DESC, i.created_at ASC;

-- High risk cases view
CREATE OR REPLACE VIEW v_high_risk_cases AS
SELECT *
FROM v_active_queue
WHERE risk_level = 'high'
ORDER BY risk_score DESC;

-- Recent audit activity
CREATE OR REPLACE VIEW v_recent_audit AS
SELECT 
    timestamp,
    user_name,
    user_role,
    action,
    resource_type,
    resource_id,
    result
FROM audit_log
WHERE timestamp > DATEADD(day, -7, CURRENT_TIMESTAMP())
ORDER BY timestamp DESC;

-- =====================================================
-- SAMPLE DATA (for testing only - remove in production)
-- =====================================================

-- Uncomment to insert test data:
/*
INSERT INTO stg_intakes VALUES (
    'TEST-001',
    'PT-9999',
    'Test Patient',
    45,
    'M',
    'Test complaint for validation',
    OBJECT_CONSTRUCT(
        'heart_rate', 80,
        'blood_pressure', '120/80',
        'temperature', 98.6,
        'respiratory_rate', 16,
        'oxygen_saturation', 98
    ),
    'No significant history',
    'None',
    'None',
    CURRENT_TIMESTAMP(),
    'system_test',
    ARRAY_CONSTRUCT()
);
*/

-- =====================================================
-- GRANTS (adjust based on your roles)
-- =====================================================

-- Create application roles
CREATE ROLE IF NOT EXISTS cardioassist_admin;
CREATE ROLE IF NOT EXISTS cardioassist_doctor;
CREATE ROLE IF NOT EXISTS cardioassist_nurse;
CREATE ROLE IF NOT EXISTS cardioassist_audit_viewer;

-- Grant permissions
GRANT USAGE ON DATABASE cardioassist_db TO ROLE cardioassist_nurse;
GRANT USAGE ON SCHEMA public TO ROLE cardioassist_nurse;
GRANT SELECT, INSERT ON stg_intakes TO ROLE cardioassist_nurse;
GRANT SELECT, INSERT, UPDATE ON intake_results TO ROLE cardioassist_nurse;

GRANT USAGE ON DATABASE cardioassist_db TO ROLE cardioassist_doctor;
GRANT USAGE ON SCHEMA public TO ROLE cardioassist_doctor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ROLE cardioassist_doctor;
GRANT UPDATE ON intake_results TO ROLE cardioassist_doctor;

GRANT USAGE ON DATABASE cardioassist_db TO ROLE cardioassist_admin;
GRANT ALL ON SCHEMA public TO ROLE cardioassist_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO ROLE cardioassist_admin;

GRANT USAGE ON DATABASE cardioassist_db TO ROLE cardioassist_audit_viewer;
GRANT USAGE ON SCHEMA public TO ROLE cardioassist_audit_viewer;
GRANT SELECT ON audit_log TO ROLE cardioassist_audit_viewer;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify setup:
/*
SHOW TABLES;
SHOW MASKING POLICIES;
SHOW VIEWS;
DESCRIBE TABLE stg_intakes;
DESCRIBE TABLE intake_results;
DESCRIBE TABLE audit_log;
*/

COMMIT;
