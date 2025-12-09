"""
Simple Synthetic Patient Health Data Generator

This script generates synthetic patient health records for educational purposes.
All data is completely fictional and does not represent real patients.
"""

import random
import json
from datetime import datetime, timedelta
import csv

# Seed for reproducibility
random.seed(42)

# Configuration
NUM_PATIENTS = 100

# Demographics data
GENDERS = ['male', 'female', 'other', 'unknown']
RACES = [
    'White', 'Black or African American', 'Asian',
    'Native Hawaiian or Other Pacific Islander',
    'American Indian or Alaska Native',
    'Hispanic or Latino', 'Other'
]

# Common ICD-10 codes for chronic conditions
DIAGNOSES = [
    {'code': 'E11.9', 'description': 'Type 2 diabetes mellitus without complications', 'status': 'chronic'},
    {'code': 'I10', 'description': 'Essential (primary) hypertension', 'status': 'chronic'},
    {'code': 'E78.5', 'description': 'Hyperlipidemia, unspecified', 'status': 'chronic'},
    {'code': 'J45.909', 'description': 'Unspecified asthma, uncomplicated', 'status': 'active'},
    {'code': 'M79.3', 'description': 'Panniculitis, unspecified', 'status': 'active'},
    {'code': 'F41.9', 'description': 'Anxiety disorder, unspecified', 'status': 'active'},
    {'code': 'E66.9', 'description': 'Obesity, unspecified', 'status': 'chronic'},
]

# Common medications
MEDICATIONS = [
    {'name': 'Metformin', 'dosage': '500mg twice daily'},
    {'name': 'Lisinopril', 'dosage': '10mg once daily'},
    {'name': 'Atorvastatin', 'dosage': '20mg once daily'},
    {'name': 'Albuterol', 'dosage': '90mcg as needed'},
    {'name': 'Sertraline', 'dosage': '50mg once daily'},
    {'name': 'Omeprazole', 'dosage': '20mg once daily'},
]

# Common allergies
ALLERGENS = [
    {'allergen': 'Penicillin', 'severity': 'moderate', 'reaction': 'Rash'},
    {'allergen': 'Peanuts', 'severity': 'severe', 'reaction': 'Anaphylaxis'},
    {'allergen': 'Latex', 'severity': 'mild', 'reaction': 'Contact dermatitis'},
    {'allergen': 'Sulfa drugs', 'severity': 'moderate', 'reaction': 'Hives'},
]

# Lab tests
LAB_TESTS = [
    {'test_name': 'Glucose, fasting', 'unit': 'mg/dL', 'ref_range': '70-100', 'normal_mean': 90, 'normal_std': 10},
    {'test_name': 'Hemoglobin A1C', 'unit': '%', 'ref_range': '4.0-5.6', 'normal_mean': 5.0, 'normal_std': 0.5},
    {'test_name': 'Total Cholesterol', 'unit': 'mg/dL', 'ref_range': '125-200', 'normal_mean': 180, 'normal_std': 20},
    {'test_name': 'LDL Cholesterol', 'unit': 'mg/dL', 'ref_range': '<100', 'normal_mean': 90, 'normal_std': 15},
    {'test_name': 'HDL Cholesterol', 'unit': 'mg/dL', 'ref_range': '>40', 'normal_mean': 55, 'normal_std': 10},
    {'test_name': 'Triglycerides', 'unit': 'mg/dL', 'ref_range': '<150', 'normal_mean': 120, 'normal_std': 30},
]


def generate_patient_id(index):
    """Generate anonymous patient ID"""
    return f"P{index:08d}"


def generate_demographics(index):
    """Generate patient demographics"""
    age = random.randint(18, 85)
    return {
        'age': age,
        'gender': random.choice(GENDERS),
        'race_ethnicity': random.choice(RACES),
        'zip_code': f"{random.randint(10000, 99999)}"
    }


def generate_vital_signs(age, has_hypertension=False):
    """Generate vital signs with some correlation to conditions"""
    # Blood pressure - higher if hypertensive
    if has_hypertension:
        systolic = random.randint(130, 160)
        diastolic = random.randint(85, 100)
    else:
        systolic = random.randint(110, 130)
        diastolic = random.randint(70, 85)
    
    heart_rate = random.randint(60, 100)
    temperature = round(random.uniform(97.5, 99.5), 1)
    weight = random.randint(120, 250)
    height = random.randint(60, 75)
    
    # Calculate BMI
    bmi = round((weight / (height ** 2)) * 703, 1)
    
    return {
        'systolic_bp': systolic,
        'diastolic_bp': diastolic,
        'heart_rate': heart_rate,
        'temperature': temperature,
        'weight': weight,
        'height': height
    }, bmi


def generate_diagnoses():
    """Generate random subset of diagnoses"""
    num_diagnoses = random.randint(0, 3)
    if num_diagnoses == 0:
        return []
    
    diagnoses = random.sample(DIAGNOSES, num_diagnoses)
    
    # Add onset dates
    for diag in diagnoses:
        days_ago = random.randint(30, 365 * 5)
        onset_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        diag['onset_date'] = onset_date
    
    return diagnoses


def generate_medications(diagnoses):
    """Generate medications based on diagnoses"""
    meds = []
    diagnosis_codes = [d['code'] for d in diagnoses]
    
    # Prescribe based on conditions
    if 'E11.9' in diagnosis_codes:  # Diabetes
        meds.append({**MEDICATIONS[0], 'start_date': '2023-01-15'})
    if 'I10' in diagnosis_codes:  # Hypertension
        meds.append({**MEDICATIONS[1], 'start_date': '2023-02-20'})
    if 'E78.5' in diagnosis_codes:  # Hyperlipidemia
        meds.append({**MEDICATIONS[2], 'start_date': '2023-03-10'})
    
    return meds


def generate_allergies():
    """Generate random allergies"""
    if random.random() < 0.3:  # 30% have allergies
        num_allergies = random.randint(1, 2)
        return random.sample(ALLERGENS, num_allergies)
    return []


def generate_lab_results():
    """Generate lab test results"""
    results = []
    num_tests = random.randint(2, 4)
    tests = random.sample(LAB_TESTS, num_tests)
    
    for test in tests:
        value = round(random.gauss(test['normal_mean'], test['normal_std']), 1)
        
        # Determine if abnormal
        abnormal = random.random() < 0.2  # 20% abnormal
        
        results.append({
            'test_name': test['test_name'],
            'value': value,
            'unit': test['unit'],
            'reference_range': test['ref_range'],
            'date': (datetime.now() - timedelta(days=random.randint(1, 90))).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'abnormal_flag': abnormal
        })
    
    return results


def generate_patient():
    """Generate a complete synthetic patient record"""
    patient_index = random.randint(1, 99999999)
    patient_id = generate_patient_id(patient_index)
    demographics = generate_demographics(patient_index)
    diagnoses = generate_diagnoses()
    
    # Check for hypertension
    has_hypertension = any(d['code'] == 'I10' for d in diagnoses)
    
    vital_signs, bmi = generate_vital_signs(demographics['age'], has_hypertension)
    medications = generate_medications(diagnoses)
    allergies = generate_allergies()
    lab_results = generate_lab_results()
    
    return {
        'patient_id': patient_id,
        'demographics': demographics,
        'health_metrics': {
            'vital_signs': vital_signs,
            'bmi': bmi
        },
        'diagnoses': diagnoses,
        'medications': medications,
        'allergies': allergies,
        'lab_results': lab_results,
        'last_updated': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')
    }


def main():
    """Generate synthetic patient dataset"""
    print(f"Generating {NUM_PATIENTS} synthetic patient records...")
    
    patients = []
    for i in range(NUM_PATIENTS):
        patient = generate_patient()
        patients.append(patient)
    
    # Save as JSON
    json_file = 'datasets/patient-health/synthetic_patients.json'
    with open(json_file, 'w') as f:
        json.dump(patients, f, indent=2)
    print(f"Saved JSON to {json_file}")
    
    # Save as CSV (flattened version)
    csv_file = 'datasets/patient-health/synthetic_patients.csv'
    with open(csv_file, 'w', newline='') as f:
        fieldnames = [
            'patient_id', 'age', 'gender', 'race_ethnicity', 'zip_code',
            'systolic_bp', 'diastolic_bp', 'heart_rate', 'temperature',
            'weight', 'height', 'bmi', 'num_diagnoses', 'num_medications',
            'has_allergies', 'num_lab_results'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for patient in patients:
            row = {
                'patient_id': patient['patient_id'],
                'age': patient['demographics']['age'],
                'gender': patient['demographics']['gender'],
                'race_ethnicity': patient['demographics']['race_ethnicity'],
                'zip_code': patient['demographics']['zip_code'],
                'systolic_bp': patient['health_metrics']['vital_signs']['systolic_bp'],
                'diastolic_bp': patient['health_metrics']['vital_signs']['diastolic_bp'],
                'heart_rate': patient['health_metrics']['vital_signs']['heart_rate'],
                'temperature': patient['health_metrics']['vital_signs']['temperature'],
                'weight': patient['health_metrics']['vital_signs']['weight'],
                'height': patient['health_metrics']['vital_signs']['height'],
                'bmi': patient['health_metrics']['bmi'],
                'num_diagnoses': len(patient['diagnoses']),
                'num_medications': len(patient['medications']),
                'has_allergies': len(patient['allergies']) > 0,
                'num_lab_results': len(patient['lab_results'])
            }
            writer.writerow(row)
    print(f"Saved CSV to {csv_file}")
    
    print(f"\nGeneration complete! Created {NUM_PATIENTS} synthetic patient records.")
    print("Note: All data is synthetic and for educational purposes only.")


if __name__ == '__main__':
    main()
