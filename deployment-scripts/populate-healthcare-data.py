#!/usr/bin/env python3
"""
Healthcare Data Population Script
Populates DynamoDB with sample healthcare data
"""

import boto3
import sys
from decimal import Decimal

class HealthcareData:
    def __init__(self, region, table_prefix):
        self.dynamodb = boto3.resource('dynamodb', region_name=region)
        self.table_prefix = table_prefix
        
        # Get table references
        self.patients_table = self.dynamodb.Table(f'{table_prefix}-patients')
        self.diagnoses_table = self.dynamodb.Table(f'{table_prefix}-diagnoses')
        self.medications_table = self.dynamodb.Table(f'{table_prefix}-medications')
        self.providers_table = self.dynamodb.Table(f'{table_prefix}-providers')
        self.patient_diagnoses_table = self.dynamodb.Table(f'{table_prefix}-patient-diagnoses')
        self.patient_medications_table = self.dynamodb.Table(f'{table_prefix}-patient-medications')
    
    def populate_data(self):
        """Load sample healthcare data"""
        try:
            # Create Patients
            patients = [
                {'patient_id': 'ANON001', 'age': Decimal('45'), 'gender': 'F', 'original_id': 'P001'},
                {'patient_id': 'ANON002', 'age': Decimal('62'), 'gender': 'M', 'original_id': 'P002'},
                {'patient_id': 'ANON003', 'age': Decimal('38'), 'gender': 'F', 'original_id': 'P003'},
                {'patient_id': 'ANON004', 'age': Decimal('55'), 'gender': 'M', 'original_id': 'P004'},
            ]
            
            with self.patients_table.batch_writer() as batch:
                for patient in patients:
                    batch.put_item(Item=patient)
            print("✓ Created patients")
            
            # Create Diagnoses
            diagnoses = [
                {'diagnosis_code': 'E11.9', 'name': 'Type 2 Diabetes Mellitus', 'category': 'Endocrine'},
                {'diagnosis_code': 'I10', 'name': 'Essential Hypertension', 'category': 'Cardiovascular'},
                {'diagnosis_code': 'J45.909', 'name': 'Unspecified Asthma', 'category': 'Respiratory'},
                {'diagnosis_code': 'E78.5', 'name': 'Hyperlipidemia', 'category': 'Endocrine'},
            ]
            
            with self.diagnoses_table.batch_writer() as batch:
                for diagnosis in diagnoses:
                    batch.put_item(Item=diagnosis)
            print("✓ Created diagnoses")
            
            # Create Medications
            medications = [
                {'medication_id': 'MED001', 'name': 'Metformin', 'class': 'Antidiabetic', 'form': 'Tablet', 'dosage': '500mg'},
                {'medication_id': 'MED002', 'name': 'Lisinopril', 'class': 'ACE Inhibitor', 'form': 'Tablet', 'dosage': '10mg'},
                {'medication_id': 'MED003', 'name': 'Albuterol', 'class': 'Bronchodilator', 'form': 'Inhaler', 'dosage': '90mcg'},
                {'medication_id': 'MED004', 'name': 'Atorvastatin', 'class': 'Statin', 'form': 'Tablet', 'dosage': '20mg'},
            ]
            
            with self.medications_table.batch_writer() as batch:
                for medication in medications:
                    batch.put_item(Item=medication)
            print("✓ Created medications")
            
            # Create Providers
            providers = [
                {'npi': 'NPI001', 'specialty': 'Endocrinology', 'name': 'Dr. Smith'},
                {'npi': 'NPI002', 'specialty': 'Cardiology', 'name': 'Dr. Johnson'},
                {'npi': 'NPI003', 'specialty': 'Pulmonology', 'name': 'Dr. Williams'},
            ]
            
            with self.providers_table.batch_writer() as batch:
                for provider in providers:
                    batch.put_item(Item=provider)
            print("✓ Created providers")
            
            # Create Patient-Diagnosis Relationships
            patient_diagnoses = [
                {'patient_id': 'ANON001', 'diagnosis_code': 'E11.9', 'date': '2024-01-15', 'severity': 'Moderate', 'provider_npi': 'NPI001'},
                {'patient_id': 'ANON002', 'diagnosis_code': 'I10', 'date': '2023-06-10', 'severity': 'Mild', 'provider_npi': 'NPI002'},
                {'patient_id': 'ANON002', 'diagnosis_code': 'E78.5', 'date': '2023-06-10', 'severity': 'Moderate', 'provider_npi': 'NPI002'},
                {'patient_id': 'ANON003', 'diagnosis_code': 'J45.909', 'date': '2022-03-20', 'severity': 'Mild', 'provider_npi': 'NPI003'},
            ]
            
            with self.patient_diagnoses_table.batch_writer() as batch:
                for rel in patient_diagnoses:
                    batch.put_item(Item=rel)
            print("✓ Created patient-diagnosis relationships")
            
            # Create Patient-Medication Relationships
            patient_medications = [
                {'patient_id': 'ANON001', 'medication_id': 'MED001', 'medication_name': 'Metformin', 'date': '2024-01-15', 'frequency': 'twice daily'},
                {'patient_id': 'ANON002', 'medication_id': 'MED002', 'medication_name': 'Lisinopril', 'date': '2023-06-10', 'frequency': 'once daily'},
                {'patient_id': 'ANON002', 'medication_id': 'MED004', 'medication_name': 'Atorvastatin', 'date': '2023-06-10', 'frequency': 'once daily'},
                {'patient_id': 'ANON003', 'medication_id': 'MED003', 'medication_name': 'Albuterol', 'date': '2022-03-20', 'frequency': 'as needed'},
            ]
            
            with self.patient_medications_table.batch_writer() as batch:
                for rel in patient_medications:
                    batch.put_item(Item=rel)
            print("✓ Created patient-medication relationships")
            
        except Exception as e:
            print(f"Error populating data: {str(e)}")
            raise
    
    def verify_data(self):
        """Verify data was loaded correctly"""
        try:
            # Count items in each table
            print("\n📊 Data Summary:")
            
            patients = self.patients_table.scan(Select='COUNT')
            print(f"  Patients: {patients['Count']}")
            
            diagnoses = self.diagnoses_table.scan(Select='COUNT')
            print(f"  Diagnoses: {diagnoses['Count']}")
            
            medications = self.medications_table.scan(Select='COUNT')
            print(f"  Medications: {medications['Count']}")
            
            providers = self.providers_table.scan(Select='COUNT')
            print(f"  Providers: {providers['Count']}")
            
            patient_diagnoses = self.patient_diagnoses_table.scan(Select='COUNT')
            print(f"  Patient-Diagnosis Links: {patient_diagnoses['Count']}")
            
            patient_meds = self.patient_medications_table.scan(Select='COUNT')
            print(f"  Patient-Medication Links: {patient_meds['Count']}")
            
            # Sample query
            print("\n📋 Sample Patient Data:")
            response = self.patients_table.scan(Limit=3)
            for patient in response['Items']:
                patient_id = patient['patient_id']
                print(f"  Patient: {patient_id} (Age: {patient['age']}, Gender: {patient['gender']})")
                
                # Get diagnoses
                diag_response = self.patient_diagnoses_table.query(
                    KeyConditionExpression='patient_id = :pid',
                    ExpressionAttributeValues={':pid': patient_id}
                )
                if diag_response['Items']:
                    print(f"    Diagnoses:")
                    for diag in diag_response['Items']:
                        print(f"      - {diag['diagnosis_code']} ({diag.get('severity', 'N/A')})")
                
                # Get medications
                med_response = self.patient_medications_table.query(
                    KeyConditionExpression='patient_id = :pid',
                    ExpressionAttributeValues={':pid': patient_id}
                )
                if med_response['Items']:
                    print(f"    Medications:")
                    for med in med_response['Items']:
                        print(f"      - {med['medication_name']} ({med.get('frequency', 'N/A')})")
                        
        except Exception as e:
            print(f"Error verifying data: {str(e)}")
            raise

def main():
    if len(sys.argv) < 3:
       print("Usage: python3 populate-healthcare-data.py <region> <table_prefix>")
        print("Example: python3 populate-healthcare-data.py us-east-1 healthcare")
        sys.exit(1)
    
    region = sys.argv[1]
    table_prefix = sys.argv[2]
    
    print("🏥 Healthcare Data Setup")
    print("="*50)
    
    try:
        data = HealthcareData(region, table_prefix)
        
        print("\n1. Populating data...")
        data.populate_data()
        
        print("\n2. Verifying data...")
        data.verify_data()
        
        print("\n✅ Healthcare data setup complete!")
        print("\nYour DynamoDB tables are populated with sample healthcare data.")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
