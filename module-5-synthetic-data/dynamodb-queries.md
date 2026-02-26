# DynamoDB Healthcare Data Queries and Population

This document provides scripts to interact with your deployed DynamoDB healthcare tables, populate them with data, and perform validation queries.

## Prerequisites

```bash
# Install required Python packages
pip install boto3 faker

# Ensure AWS credentials are configured
aws sts get-caller-identity
```

## 1. Discover Your Deployed Resources

### List All Healthcare Tables

```bash
# View all DynamoDB tables in your region
aws dynamodb list-tables --region us-west-2 --output table

# Filter only healthcare tables
aws dynamodb list-tables --region us-west-2 \
  --query "TableNames[?starts_with(@, 'healthcare-')]" \
  --output table
```

### Get Table Details

```bash
# Get details for each table
for table in healthcare-patients healthcare-diagnoses healthcare-medications healthcare-providers healthcare-patient-diagnoses healthcare-patient-medications; do
  echo "=== $table ==="
  aws dynamodb describe-table --table-name $table --region us-west-2 \
    --query "Table.[TableName,TableStatus,ItemCount,TableSizeBytes]" \
    --output table
  echo ""
done
```

### View Resource Group

```bash
# Find your resource group
aws resource-groups list-groups --region us-west-2 \
  --query "GroupIdentifiers[?contains(GroupName, 'dataai-account')]" \
  --output table

# List all resources in your group (replace with your actual group name)
aws resource-groups list-group-resources \
  --group-name dataai-account547741150715-christol \
  --region us-west-2 \
  --query "ResourceIdentifiers[?ResourceType=='AWS::DynamoDB::Table']" \
  --output table
```

## 2. Query Existing Data (PartiQL - SQL-like syntax)

### Query Patients Table

```bash
# Count all patients
aws dynamodb execute-statement \
  --statement "SELECT COUNT(*) FROM \"healthcare-patients\"" \
  --region us-west-2

# Get first 10 patients
aws dynamodb execute-statement \
  --statement "SELECT * FROM \"healthcare-patients\" LIMIT 10" \
  --region us-west-2

# Get patient by ID
aws dynamodb execute-statement \
  --statement "SELECT * FROM \"healthcare-patients\" WHERE patient_id = 'ANON001'" \
  --region us-west-2
```

### Query Diagnoses

```bash
# Get all diagnoses
aws dynamodb execute-statement \
  --statement "SELECT * FROM \"healthcare-diagnoses\"" \
  --region us-west-2

# Get specific diagnosis
aws dynamodb execute-statement \
  --statement "SELECT * FROM \"healthcare-diagnoses\" WHERE diagnosis_code = 'D001'" \
  --region us-west-2
```

### Query Medications

```bash
# Get all medications
aws dynamodb execute-statement \
  --statement "SELECT * FROM \"healthcare-medications\"" \
  --region us-west-2

# Get medications by generic name
aws dynamodb execute-statement \
  --statement "SELECT * FROM \"healthcare-medications\" WHERE generic_name = 'Metformin'" \
  --region us-west-2
```

### Query Providers

```bash
# Get all providers
aws dynamodb execute-statement \
  --statement "SELECT * FROM \"healthcare-providers\"" \
  --region us-west-2
```

## 3. Populate 10,000 Records Per Table

Save this as `populate_large_dataset.py`:

```python
#!/usr/bin/env python3
"""
DynamoDB Healthcare Data Population Script
Generates 10,000 records for each healthcare table
"""

import boto3
import random
from datetime import datetime, timedelta
from faker import Faker
import json
import sys

fake = Faker()

# Configuration
REGION = 'us-west-2'
TABLE_PREFIX = 'healthcare'
BATCH_SIZE = 25  # DynamoDB batch write limit
RECORDS_PER_TABLE = 10000

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=REGION)

def generate_patients(count):
    """Generate patient records"""
    patients = []
    for i in range(1, count + 1):
        patient_id = f"PATIENT{i:05d}"
        patients.append({
            'patient_id': patient_id,
            'first_name': fake.first_name(),
            'last_name': fake.last_name(),
            'date_of_birth': fake.date_of_birth(minimum_age=18, maximum_age=90).isoformat(),
            'gender': random.choice(['M', 'F', 'O']),
            'blood_type': random.choice(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'email': fake.email(),
            'phone': fake.phone_number(),
            'address': fake.address().replace('\n', ', '),
            'city': fake.city(),
            'state': fake.state_abbr(),
            'zip_code': fake.zipcode(),
            'insurance_provider': fake.company(),
            'insurance_id': fake.bothify(text='INS######'),
            'emergency_contact': fake.name(),
            'emergency_phone': fake.phone_number(),
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        })
    return patients

def generate_diagnoses(count):
    """Generate diagnosis records"""
    diagnoses = []
    conditions = [
        'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Chronic Kidney Disease',
        'Depression', 'Anxiety Disorder', 'Osteoarthritis', 'COPD',
        'Coronary Artery Disease', 'Hyperlipidemia', 'Hypothyroidism',
        'GERD', 'Migraine', 'Sleep Apnea', 'Atrial Fibrillation'
    ]
    
    for i in range(1, count + 1):
        diagnosis_code = f"D{i:05d}"
        condition = random.choice(conditions)
        diagnoses.append({
            'diagnosis_code': diagnosis_code,
            'diagnosis_name': condition,
            'icd10_code': fake.bothify(text='?##.##'),
            'description': f"Clinical diagnosis of {condition}",
            'severity': random.choice(['Mild', 'Moderate', 'Severe', 'Critical']),
            'category': random.choice(['Cardiovascular', 'Respiratory', 'Metabolic', 'Mental Health', 'Musculoskeletal']),
            'typical_treatment': f"Standard treatment protocol for {condition}",
            'created_at': datetime.now().isoformat()
        })
    return diagnoses

def generate_medications(count):
    """Generate medication records"""
    medications = []
    med_names = [
        ('Lisinopril', 'ACE Inhibitor'), ('Metformin', 'Biguanide'),
        ('Atorvastatin', 'Statin'), ('Amlodipine', 'Calcium Channel Blocker'),
        ('Omeprazole', 'Proton Pump Inhibitor'), ('Albuterol', 'Bronchodilator'),
        ('Levothyroxine', 'Thyroid Hormone'), ('Gabapentin', 'Anticonvulsant'),
        ('Sertraline', 'SSRI'), ('Losartan', 'ARB'), ('Simvastatin', 'Statin'),
        ('Montelukast', 'Leukotriene Inhibitor'), ('Escitalopram', 'SSRI'),
        ('Furosemide', 'Diuretic'), ('Metoprolol', 'Beta Blocker')
    ]
    
    for i in range(1, count + 1):
        med_id = f"MED{i:05d}"
        generic_name, med_class = random.choice(med_names)
        medications.append({
            'medication_id': med_id,
            'generic_name': generic_name,
            'brand_name': fake.company() + ' ' + generic_name,
            'medication_class': med_class,
            'dosage_forms': random.choice(['Tablet', 'Capsule', 'Liquid', 'Injection', 'Patch']),
            'typical_dosage': f"{random.choice([5, 10, 20, 25, 50, 100])}mg",
            'route': random.choice(['Oral', 'IV', 'IM', 'Topical', 'Sublingual']),
            'frequency': random.choice(['Once daily', 'Twice daily', 'Three times daily', 'As needed']),
            'side_effects': ', '.join(fake.words(random.randint(3, 6))),
            'contraindications': ', '.join(fake.words(random.randint(2, 4))),
            'manufacturer': fake.company(),
            'fda_approved': random.choice([True, False]),
            'created_at': datetime.now().isoformat()
        })
    return medications

def generate_providers(count):
    """Generate healthcare provider records"""
    providers = []
    specialties = [
        'Internal Medicine', 'Cardiology', 'Endocrinology', 'Pulmonology',
        'Nephrology', 'Psychiatry', 'Family Medicine', 'Orthopedics',
        'Neurology', 'Gastroenterology'
    ]
    
    for i in range(1, count + 1):
        provider_id = f"PROV{i:05d}"
        providers.append({
            'provider_id': provider_id,
            'first_name': fake.first_name(),
            'last_name': fake.last_name(),
            'title': random.choice(['MD', 'DO', 'NP', 'PA']),
            'specialty': random.choice(specialties),
            'npi_number': fake.bothify(text='##########'),
            'dea_number': fake.bothify(text='??#######'),
            'license_number': fake.bothify(text='???######'),
            'license_state': fake.state_abbr(),
            'email': fake.email(),
            'phone': fake.phone_number(),
            'hospital_affiliation': fake.company() + ' Medical Center',
            'years_experience': random.randint(1, 40),
            'accepting_patients': random.choice([True, False]),
            'created_at': datetime.now().isoformat()
        })
    return providers

def generate_patient_diagnoses(count, patient_ids, diagnosis_codes, provider_ids):
    """Generate patient-diagnosis relationships"""
    records = []
    for i in range(count):
        patient_id = random.choice(patient_ids)
        diagnosis_code = random.choice(diagnosis_codes)
        provider_id = random.choice(provider_ids)
        
        diagnosis_date = fake.date_between(start_date='-2y', end_date='today')
        
        records.append({
            'patient_id': patient_id,
            'diagnosis_code': diagnosis_code,
            'diagnosed_date': diagnosis_date.isoformat(),
            'provider_id': provider_id,
            'status': random.choice(['Active', 'Resolved', 'Chronic', 'In Remission']),
            'notes': fake.text(max_nb_chars=200),
            'follow_up_required': random.choice([True, False]),
            'last_visit': (diagnosis_date + timedelta(days=random.randint(1, 365))).isoformat(),
            'created_at': datetime.now().isoformat()
        })
    return records

def generate_patient_medications(count, patient_ids, medication_ids, provider_ids):
    """Generate patient-medication relationships"""
    records = []
    for i in range(count):
        patient_id = random.choice(patient_ids)
        medication_id = random.choice(medication_ids)
        provider_id = random.choice(provider_ids)
        
        prescribed_date = fake.date_between(start_date='-1y', end_date='today')
        
        records.append({
            'patient_id': patient_id,
            'medication_id': medication_id,
            'prescribed_date': prescribed_date.isoformat(),
            'provider_id': provider_id,
            'dosage': f"{random.choice([5, 10, 20, 25, 50, 100])}mg",
            'frequency': random.choice(['Once daily', 'Twice daily', 'Three times daily', 'As needed']),
            'duration_days': random.randint(7, 365),
            'refills_remaining': random.randint(0, 5),
            'pharmacy': fake.company() + ' Pharmacy',
            'status': random.choice(['Active', 'Completed', 'Discontinued', 'On Hold']),
            'notes': fake.text(max_nb_chars=150),
            'created_at': datetime.now().isoformat()
        })
    return records

def batch_write_items(table_name, items):
    """Write items to DynamoDB in batches"""
    table = dynamodb.Table(table_name)
    total = len(items)
    written = 0
    
    print(f"Writing {total} items to {table_name}...")
    
    for i in range(0, total, BATCH_SIZE):
        batch = items[i:i + BATCH_SIZE]
        
        with table.batch_writer() as writer:
            for item in batch:
                writer.put_item(Item=item)
        
        written += len(batch)
        if written % 500 == 0:
            print(f"  Progress: {written}/{total} ({written*100//total}%)")
    
    print(f"✓ Completed: {written} items written to {table_name}")
    return written

def main():
    print("=== DynamoDB Healthcare Data Population ===\n")
    print(f"Region: {REGION}")
    print(f"Records per table: {RECORDS_PER_TABLE}")
    print(f"Target tables: {TABLE_PREFIX}-*\n")
    
    try:
        # Generate base tables
        print("Step 1: Generating patients...")
        patients = generate_patients(RECORDS_PER_TABLE)
        patient_ids = [p['patient_id'] for p in patients]
        batch_write_items(f'{TABLE_PREFIX}-patients', patients)
        
        print("\nStep 2: Generating diagnoses...")
        diagnoses = generate_diagnoses(RECORDS_PER_TABLE)
        diagnosis_codes = [d['diagnosis_code'] for d in diagnoses]
        batch_write_items(f'{TABLE_PREFIX}-diagnoses', diagnoses)
        
        print("\nStep 3: Generating medications...")
        medications = generate_medications(RECORDS_PER_TABLE)
        medication_ids = [m['medication_id'] for m in medications]
        batch_write_items(f'{TABLE_PREFIX}-medications', medications)
        
        print("\nStep 4: Generating providers...")
        providers = generate_providers(RECORDS_PER_TABLE)
        provider_ids = [p['provider_id'] for p in providers]
        batch_write_items(f'{TABLE_PREFIX}-providers', providers)
        
        # Generate relationship tables
        print("\nStep 5: Generating patient-diagnosis relationships...")
        patient_diagnoses = generate_patient_diagnoses(
            RECORDS_PER_TABLE,
            patient_ids,
            diagnosis_codes,
            provider_ids
        )
        batch_write_items(f'{TABLE_PREFIX}-patient-diagnoses', patient_diagnoses)
        
        print("\nStep 6: Generating patient-medication relationships...")
        patient_medications = generate_patient_medications(
            RECORDS_PER_TABLE,
            medication_ids,
            medication_ids,
            provider_ids
        )
        batch_write_items(f'{TABLE_PREFIX}-patient-medications', patient_medications)
        
        print("\n" + "="*50)
        print("✓ DATA POPULATION COMPLETE!")
        print("="*50)
        print(f"\nTotal records created: {RECORDS_PER_TABLE * 6:,}")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
```

## 4. Validation Queries

Save this as `validate_data.py`:

```python
#!/usr/bin/env python3
"""
DynamoDB Healthcare Data Validation Script
Validates data in all healthcare tables
"""

import boto3
from datetime import datetime

REGION = 'us-west-2'
TABLE_PREFIX = 'healthcare'

dynamodb = boto3.client('dynamodb', region_name=REGION)

def count_items(table_name):
    """Count items in a table"""
    response = dynamodb.scan(
        TableName=table_name,
        Select='COUNT'
    )
    return response['Count']

def get_sample_items(table_name, limit=5):
    """Get sample items from table"""
    response = dynamodb.scan(
        TableName=table_name,
        Limit=limit
    )
    return response.get('Items', [])

def validate_table(table_name):
    """Validate a single table"""
    print(f"\n{'='*60}")
    print(f"Table: {table_name}")
    print('='*60)
    
    try:
        # Get table info
        table_info = dynamodb.describe_table(TableName=table_name)
        status = table_info['Table']['TableStatus']
        item_count = table_info['Table']['ItemCount']
        size_bytes = table_info['Table']['TableSizeBytes']
        
        print(f"Status: {status}")
        print(f"Item Count: {item_count:,}")
        print(f"Size: {size_bytes / (1024*1024):.2f} MB")
        
        # Get sample data
        print(f"\nSample Records (first 3):")
        samples = get_sample_items(table_name, 3)
        for i, item in enumerate(samples, 1):
            print(f"\n  Record {i}:")
            for key, value in list(item.items())[:5]:  # Show first 5 fields
                val = list(value.values())[0]
                print(f"    {key}: {val}")
        
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("="*60)
    print("DynamoDB Healthcare Data Validation")
    print("="*60)
    print(f"Region: {REGION}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    tables = [
        f'{TABLE_PREFIX}-patients',
        f'{TABLE_PREFIX}-diagnoses',
        f'{TABLE_PREFIX}-medications',
        f'{TABLE_PREFIX}-providers',
        f'{TABLE_PREFIX}-patient-diagnoses',
        f'{TABLE_PREFIX}-patient-medications'
    ]
    
    results = {}
    for table in tables:
        results[table] = validate_table(table)
    
    # Summary
    print(f"\n{'='*60}")
    print("VALIDATION SUMMARY")
    print('='*60)
    for table, success in results.items():
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{status} - {table}")
    
    all_passed = all(results.values())
    if all_passed:
        print("\n✓ All tables validated successfully!")
    else:
        print("\n✗ Some tables failed validation")

if __name__ == '__main__':
    main()
```

## 5. Complex Queries - Tying Data Together

Save this as `complex_queries.py`:

```python
#!/usr/bin/env python3
"""
Complex DynamoDB Healthcare Queries
Demonstrates joining data across multiple tables
"""

import boto3
from collections import defaultdict
import json

REGION = 'us-west-2'
TABLE_PREFIX = 'healthcare'

dynamodb = boto3.resource('dynamodb', region_name=REGION)

def get_patient_complete_record(patient_id):
    """
    Get complete patient record including:
    - Patient demographics
    - All diagnoses with details
    - All medications with details
    - All providers
    """
    print(f"\n{'='*70}")
    print(f"COMPLETE PATIENT RECORD: {patient_id}")
    print('='*70)
    
    # Get patient info
    patients_table = dynamodb.Table(f'{TABLE_PREFIX}-patients')
    patient = patients_table.get_item(Key={'patient_id': patient_id}).get('Item')
    
    if not patient:
        print(f"Patient {patient_id} not found")
        return None
    
    print(f"\n📋 Patient Information:")
    print(f"  Name: {patient.get('first_name')} {patient.get('last_name')}")
    print(f"  DOB: {patient.get('date_of_birth')}")
    print(f"  Gender: {patient.get('gender')}")
    print(f"  Blood Type: {patient.get('blood_type')}")
    print(f"  Email: {patient.get('email')}")
    print(f"  Phone: {patient.get('phone')}")
    
    # Get patient diagnoses
    pd_table = dynamodb.Table(f'{TABLE_PREFIX}-patient-diagnoses')
    diagnoses_table = dynamodb.Table(f'{TABLE_PREFIX}-diagnoses')
    providers_table = dynamodb.Table(f'{TABLE_PREFIX}-providers')
    
    response = pd_table.query(
        KeyConditionExpression='patient_id = :pid',
        ExpressionAttributeValues={':pid': patient_id}
    )
    
    print(f"\n🏥 Diagnoses ({len(response['Items'])}):")
    for pd in response['Items'][:5]:  # Show first 5
        diagnosis_code = pd.get('diagnosis_code')
        diag = diagnoses_table.get_item(Key={'diagnosis_code': diagnosis_code}).get('Item', {})
        provider_id = pd.get('provider_id')
        provider = providers_table.get_item(Key={'provider_id': provider_id}).get('Item', {})
        
        print(f"  • {diag.get('diagnosis_name', 'Unknown')}")
        print(f"    Code: {diagnosis_code}")
        print(f"    Status: {pd.get('status')}")
        print(f"    Diagnosed: {pd.get('diagnosed_date')}")
        print(f"    Provider: Dr. {provider.get('last_name', 'Unknown')}")
    
    # Get patient medications
    pm_table = dynamodb.Table(f'{TABLE_PREFIX}-patient-medications')
    medications_table = dynamodb.Table(f'{TABLE_PREFIX}-medications')
    
    response = pm_table.query(
        KeyConditionExpression='patient_id = :pid',
        ExpressionAttributeValues={':pid': patient_id}
    )
    
    print(f"\n💊 Medications ({len(response['Items'])}):")
    for pm in response['Items'][:5]:  # Show first 5
        medication_id = pm.get('medication_id')
        med = medications_table.get_item(Key={'medication_id': medication_id}).get('Item', {})
        provider_id = pm.get('provider_id')
        provider = providers_table.get_item(Key={'provider_id': provider_id}).get('Item', {})
        
        print(f"  • {med.get('generic_name', 'Unknown')}")
        print(f"    Dosage: {pm.get('dosage')}")
        print(f"    Frequency: {pm.get('frequency')}")
        print(f"    Status: {pm.get('status')}")
        print(f"    Prescribed by: Dr. {provider.get('last_name', 'Unknown')}")
    
    return {
        'patient': patient,
        'diagnoses_count': len(response['Items']),
        'medications_count': len(response['Items'])
    }

def get_provider_patient_summary(provider_id):
    """
    Get summary of all patients for a specific provider
    """
    print(f"\n{'='*70}")
    print(f"PROVIDER PATIENT SUMMARY: {provider_id}")
    print('='*70)
    
    providers_table = dynamodb.Table(f'{TABLE_PREFIX}-providers')
    provider = providers_table.get_item(Key={'provider_id': provider_id}).get('Item')
    
    if not provider:
        print(f"Provider {provider_id} not found")
        return None
    
    print(f"\n👨‍⚕️ Provider Information:")
    print(f"  Name: Dr. {provider.get('first_name')} {provider.get('last_name')}")
    print(f"  Specialty: {provider.get('specialty')}")
    print(f"  Hospital: {provider.get('hospital_affiliation')}")
    
    # Scan for all diagnoses by this provider
    pd_table = dynamodb.Table(f'{TABLE_PREFIX}-patient-diagnoses')
    response = pd_table.scan(
        FilterExpression='provider_id = :pid',
        ExpressionAttributeValues={':pid': provider_id}
    )
    
    unique_patients = set(item['patient_id'] for item in response['Items'])
    diagnosis_counts = defaultdict(int)
    
    for item in response['Items']:
        diagnosis_counts[item.get('diagnosis_code')] += 1
    
    print(f"\n📊 Statistics:")
    print(f"  Total Patients: {len(unique_patients)}")
    print(f"  Total Diagnoses: {len(response['Items'])}")
    print(f"  Avg Diagnoses per Patient: {len(response['Items'])/len(unique_patients) if unique_patients else 0:.1f}")
    
    print(f"\n🏥 Top Diagnoses:")
    diagnoses_table = dynamodb.Table(f'{TABLE_PREFIX}-diagnoses')
    for diag_code, count in sorted(diagnosis_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        diag = diagnoses_table.get_item(Key={'diagnosis_code': diag_code}).get('Item', {})
        print(f"  • {diag.get('diagnosis_name', 'Unknown')}: {count} patients")

def get_medication_usage_report():
    """
    Get report on medication usage across all patients
    """
    print(f"\n{'='*70}")
    print("MEDICATION USAGE REPORT")
    print('='*70)
    
    pm_table = dynamodb.Table(f'{TABLE_PREFIX}-patient-medications')
    medications_table = dynamodb.Table(f'{TABLE_PREFIX}-medications')
    
    # Scan all patient-medication records
    response = pm_table.scan()
    
    medication_counts = defaultdict(int)
    status_counts = defaultdict(int)
    
    for item in response['Items']:
        medication_counts[item['medication_id']] += 1
        status_counts[item.get('status', 'Unknown')] += 1
    
    print(f"\n📊 Overall Statistics:")
    print(f"  Total Prescriptions: {len(response['Items']):,}")
    print(f"  Unique Medications: {len(medication_counts)}")
    
    print(f"\n💊 Prescription Status:")
    for status, count in sorted(status_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {status}: {count:,} ({count*100/len(response['Items']):.1f}%)")
    
    print(f"\n🔝 Top 10 Prescribed Medications:")
    for i, (med_id, count) in enumerate(sorted(medication_counts.items(), key=lambda x: x[1], reverse=True)[:10], 1):
        med = medications_table.get_item(Key={'medication_id': med_id}).get('Item', {})
        print(f"  {i}. {med.get('generic_name', 'Unknown')}")
        print(f"     Class: {med.get('medication_class', 'Unknown')}")
        print(f"     Prescriptions: {count:,}")

def get_diagnosis_medication_correlation():
    """
    Find common medication patterns for specific diagnoses
    """
    print(f"\n{'='*70}")
    print("DIAGNOSIS-MEDICATION CORRELATION ANALYSIS")
    print('='*70)
    
    pd_table = dynamodb.Table(f'{TABLE_PREFIX}-patient-diagnoses')
    pm_table = dynamodb.Table(f'{TABLE_PREFIX}-patient-medications')
    diagnoses_table = dynamodb.Table(f'{TABLE_PREFIX}-diagnoses')
    medications_table = dynamodb.Table(f'{TABLE_PREFIX}-medications')
    
    # Get all active diagnoses
    pd_response = pd_table.scan(
        FilterExpression='#st = :status',
        ExpressionAttributeNames={'#st': 'status'},
        ExpressionAttributeValues={':status': 'Active'}
    )
    
    # Get all active medications by patient
    pm_response = pm_table.scan(
        FilterExpression='#st = :status',
        ExpressionAttributeNames={'#st': 'status'},
        ExpressionAttributeValues={':status': 'Active'}
    )
    
    # Build patient -> medications map
    patient_meds = defaultdict(list)
    for pm in pm_response['Items']:
        patient_meds[pm['patient_id']].append(pm['medication_id'])
    
    # Build diagnosis -> medications correlation
    diagnosis_meds = defaultdict(lambda: defaultdict(int))
    
    for pd in pd_response['Items']:
        patient_id = pd['patient_id']
        diagnosis_code = pd['diagnosis_code']
        
        for med_id in patient_meds.get(patient_id, []):
            diagnosis_meds[diagnosis_code][med_id] += 1
    
    print(f"\n🔬 Common Treatment Patterns:\n")
    
    # Show top 5 diagnoses and their common medications
    for i, (diag_code, medications) in enumerate(list(diagnosis_meds.items())[:5], 1):
        diag = diagnoses_table.get_item(Key={'diagnosis_code': diag_code}).get('Item', {})
        print(f"{i}. {diag.get('diagnosis_name', 'Unknown')}")
        print(f"   Common Medications:")
        
        for med_id, count in sorted(medications.items(), key=lambda x: x[1], reverse=True)[:3]:
            med = medications_table.get_item(Key={'medication_id': med_id}).get('Item', {})
            print(f"     • {med.get('generic_name', 'Unknown')} ({count} patients)")
        print()

def main():
    """Run all complex queries"""
    print("\n" + "="*70)
    print("COMPLEX HEALTHCARE DATA QUERIES")
    print("="*70)
    
    # Example queries
    print("\n1. Complete Patient Record")
    get_patient_complete_record('PATIENT00001')
    
    print("\n\n2. Provider Patient Summary")
    get_provider_patient_summary('PROV00001')
    
    print("\n\n3. Medication Usage Report")
    get_medication_usage_report()
    
    print("\n\n4. Diagnosis-Medication Correlation")
    get_diagnosis_medication_correlation()
    
    print("\n" + "="*70)
    print("✓ All queries completed successfully!")
    print("="*70 + "\n")

if __name__ == '__main__':
    main()
```

## Usage Instructions

### 1. Populate Tables
```bash
cd module-5-synthetic-data
python3 populate_large_dataset.py
```

### 2. Validate Data
```bash
python3 validate_data.py
```

### 3. Run Complex Queries
```bash
python3 complex_queries.py
```

### 4. Export to JSON
```bash
# Export entire table to JSON
aws dynamodb scan --table-name healthcare-patients --region us-west-2 > patients.json

# Export with PartiQL
aws dynamodb execute-statement \
  --statement "SELECT * FROM \"healthcare-patients\"" \
  --region us-west-2 > patients_export.json
```

## Notes

- **DynamoDB uses NoSQL**: Traditional SQL doesn't work. Use PartiQL (SQL-like) or boto3 SDK.
- **Batch operations**: DynamoDB limits batch writes to 25 items at a time.
- **Rate limits**: May need to add delays for large datasets to avoid throttling.
- **Costs**: On-demand pricing charges per request. Monitor usage.
- **Indexes**: Complex queries may require Global Secondary Indexes (GSIs) for better performance.

## Cleanup

To delete all data:
```bash
for table in healthcare-patients healthcare-diagnoses healthcare-medications healthcare-providers healthcare-patient-diagnoses healthcare-patient-medications; do
  aws dynamodb delete-table --table-name $table --region us-west-2
done
```
