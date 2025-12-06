#!/usr/bin/env python3
"""
CardioAssist Snowpark Risk Scoring Pipeline

This script runs inside Snowflake using Snowpark to calculate risk scores
for new triage intakes. In demo mode, it uses a local rule-based fallback.

Usage:
    python snowpark_pipeline.py --config snowflake_config.json
    python snowpark_pipeline.py --demo  # Local demo mode
"""

import json
import sys
from typing import Dict, Any, Optional
from datetime import datetime


def calculate_risk_score(intake_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate risk score based on vitals, age, and medical history.
    
    Returns dict with:
        - risk_score: 0-100
        - risk_level: 'high', 'medium', 'low'
        - factors: list of contributing factors
    """
    score = 0
    factors = []
    
    vitals = intake_data.get('vitals', {})
    age = intake_data.get('age', 0)
    history = intake_data.get('medical_history', '').lower()
    complaint = intake_data.get('chief_complaint', '').lower()
    
    # Age factor (max +15)
    if age > 75:
        score += 15
        factors.append("Advanced age (>75)")
    elif age > 65:
        score += 10
        factors.append("Age >65")
    elif age < 2:
        score += 10
        factors.append("Infant (<2 years)")
    
    # Vital signs assessment
    heart_rate = vitals.get('heart_rate', 0)
    if heart_rate > 120:
        score += 25
        factors.append("Severe tachycardia (HR>120)")
    elif heart_rate > 100:
        score += 15
        factors.append("Tachycardia (HR>100)")
    elif heart_rate < 50:
        score += 20
        factors.append("Bradycardia (HR<50)")
    
    # Blood pressure (parse systolic)
    bp = vitals.get('blood_pressure', '')
    if '/' in bp:
        try:
            systolic = int(bp.split('/')[0])
            if systolic > 180:
                score += 20
                factors.append("Severe hypertension (SBP>180)")
            elif systolic < 90:
                score += 25
                factors.append("Hypotension (SBP<90)")
        except:
            pass
    
    # Temperature
    temp = vitals.get('temperature', 98.6)
    if temp > 103:
        score += 20
        factors.append("High fever (>103°F)")
    elif temp > 101:
        score += 10
        factors.append("Fever (>101°F)")
    elif temp < 95:
        score += 15
        factors.append("Hypothermia (<95°F)")
    
    # Respiratory rate
    resp_rate = vitals.get('respiratory_rate', 16)
    if resp_rate > 24:
        score += 20
        factors.append("Tachypnea (RR>24)")
    elif resp_rate < 10:
        score += 25
        factors.append("Bradypnea (RR<10)")
    
    # Oxygen saturation (critical parameter)
    o2_sat = vitals.get('oxygen_saturation', 100)
    if o2_sat < 90:
        score += 30
        factors.append("Critical hypoxia (O2<90%)")
    elif o2_sat < 94:
        score += 20
        factors.append("Hypoxia (O2<94%)")
    
    # Pain level
    pain_level = vitals.get('pain_level')
    if pain_level and pain_level >= 8:
        score += 10
        factors.append("Severe pain (8-10/10)")
    
    # Medical history risk factors
    high_risk_conditions = [
        ('cardiac', 15, "Cardiac history"),
        ('heart', 15, "Cardiac history"),
        ('stroke', 15, "Stroke history"),
        ('diabetes', 8, "Diabetes"),
        ('copd', 10, "COPD"),
        ('asthma', 5, "Asthma"),
        ('cancer', 12, "Cancer history"),
        ('renal', 10, "Renal disease"),
        ('kidney', 10, "Renal disease"),
        ('liver', 10, "Liver disease"),
        ('immunosuppressed', 15, "Immunosuppression"),
        ('transplant', 15, "Transplant recipient"),
    ]
    
    for condition, points, label in high_risk_conditions:
        if condition in history:
            score += points
            factors.append(label)
    
    # Chief complaint keywords (high-risk symptoms)
    urgent_symptoms = [
        ('chest pain', 20, "Chest pain"),
        ('difficulty breathing', 20, "Respiratory distress"),
        ('shortness of breath', 20, "Respiratory distress"),
        ('unresponsive', 30, "Altered consciousness"),
        ('seizure', 25, "Seizure"),
        ('stroke', 25, "Suspected stroke"),
        ('bleeding', 15, "Active bleeding"),
        ('head injury', 20, "Head trauma"),
        ('fall', 10, "Fall with injury"),
        ('allergic reaction', 20, "Allergic reaction"),
        ('overdose', 25, "Suspected overdose"),
    ]
    
    for symptom, points, label in urgent_symptoms:
        if symptom in complaint:
            score += points
            factors.append(label)
    
    # Cap score at 100
    score = min(score, 100)
    
    # Determine risk level
    if score >= 70:
        risk_level = 'high'
    elif score >= 40:
        risk_level = 'medium'
    else:
        risk_level = 'low'
    
    return {
        'risk_score': score,
        'risk_level': risk_level,
        'contributing_factors': factors[:5]  # Top 5 factors
    }


def run_demo_mode():
    """Run in local demo mode with sample data."""
    print("=== CardioAssist Risk Scoring Pipeline (Demo Mode) ===\n")
    
    # Sample test cases
    test_cases = [
        {
            'intake_id': 'TEST-001',
            'patient_name': 'John Doe',
            'age': 68,
            'chief_complaint': 'Severe chest pain radiating to left arm',
            'vitals': {
                'heart_rate': 112,
                'blood_pressure': '160/95',
                'temperature': 98.6,
                'respiratory_rate': 24,
                'oxygen_saturation': 92,
                'pain_level': 9
            },
            'medical_history': 'Hypertension, Type 2 Diabetes, Previous MI'
        },
        {
            'intake_id': 'TEST-002',
            'patient_name': 'Jane Smith',
            'age': 34,
            'chief_complaint': 'Sprained ankle during basketball',
            'vitals': {
                'heart_rate': 78,
                'blood_pressure': '118/72',
                'temperature': 98.2,
                'respiratory_rate': 14,
                'oxygen_saturation': 99,
                'pain_level': 5
            },
            'medical_history': 'No significant history'
        }
    ]
    
    for case in test_cases:
        result = calculate_risk_score(case)
        print(f"Case: {case['intake_id']} - {case['patient_name']}")
        print(f"  Chief Complaint: {case['chief_complaint']}")
        print(f"  Risk Score: {result['risk_score']}")
        print(f"  Risk Level: {result['risk_level'].upper()}")
        print(f"  Factors: {', '.join(result['contributing_factors'])}")
        print()


def run_snowpark_mode(config_path: str):
    """Run in Snowpark mode (production)."""
    try:
        from snowflake.snowpark import Session
        import pandas as pd
    except ImportError:
        print("ERROR: snowflake-snowpark-python not installed")
        print("Install with: pip install snowflake-snowpark-python")
        sys.exit(1)
    
    # Load configuration
    with open(config_path) as f:
        config = json.load(f)
    
    print("=== CardioAssist Risk Scoring Pipeline (Snowpark Mode) ===\n")
    print(f"Connecting to: {config['account']}")
    
    # Create Snowpark session
    session = Session.builder.configs(config).create()
    
    try:
        # Query new intakes that haven't been scored
        print("Fetching new intakes...")
        intakes_df = session.sql("""
            SELECT 
                i.intake_id,
                i.patient_id,
                i.patient_name,
                i.age,
                i.sex,
                i.chief_complaint,
                i.vitals,
                i.medical_history,
                i.current_medications,
                i.allergies,
                i.created_at,
                i.created_by
            FROM stg_intakes i
            LEFT JOIN intake_results r ON i.intake_id = r.intake_id
            WHERE r.result_id IS NULL
            ORDER BY i.created_at DESC
        """).to_pandas()
        
        if intakes_df.empty:
            print("No new intakes to process.")
            return
        
        print(f"Processing {len(intakes_df)} intake(s)...\n")
        
        # Process each intake
        results = []
        for _, intake in intakes_df.iterrows():
            intake_data = intake.to_dict()
            risk_result = calculate_risk_score(intake_data)
            
            result = {
                'result_id': f"RES-{datetime.now().strftime('%Y%m%d%H%M%S')}-{intake['intake_id'][-3:]}",
                'intake_id': intake['intake_id'],
                'patient_id': intake['patient_id'],
                'risk_score': risk_result['risk_score'],
                'risk_level': risk_result['risk_level'],
                'status': 'new',
                'created_at': datetime.now().isoformat()
            }
            results.append(result)
            
            print(f"✓ {intake['intake_id']}: Risk {risk_result['risk_score']} ({risk_result['risk_level'].upper()})")
        
        # Insert results into Snowflake
        print(f"\nInserting {len(results)} result(s) into intake_results...")
        results_df = pd.DataFrame(results)
        session.write_pandas(
            results_df,
            table_name='intake_results',
            database=config['database'],
            schema=config['schema'],
            auto_create_table=False,
            overwrite=False
        )
        
        print("✓ Pipeline completed successfully")
        
    finally:
        session.close()


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='CardioAssist Risk Scoring Pipeline')
    parser.add_argument('--config', help='Path to Snowflake config JSON')
    parser.add_argument('--demo', action='store_true', help='Run in demo mode')
    
    args = parser.parse_args()
    
    if args.demo:
        run_demo_mode()
    elif args.config:
        run_snowpark_mode(args.config)
    else:
        print("ERROR: Must specify either --demo or --config")
        print("Usage:")
        print("  Demo mode:       python snowpark_pipeline.py --demo")
        print("  Production mode: python snowpark_pipeline.py --config snowflake_config.json")
        sys.exit(1)


if __name__ == '__main__':
    main()
