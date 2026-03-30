#!/bin/bash

# Healthcare Data Storage Setup Script
# Creates DynamoDB tables for healthcare data

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AWS_REGION="${AWS_REGION:-us-west-2}"
TABLE_PREFIX="${TABLE_PREFIX:-healthcare}"
STUDENT_ID="${STUDENT_ID:-student0001}"
RESOURCE_GROUP="${RESOURCE_GROUP:-dataai-account-student0001}"
# Added SKIP_CONFIRMATION variable with default
SKIP_CONFIRMATION="${SKIP_CONFIRMATION:-false}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Healthcare Data Setup (DynamoDB)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Functions
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Check Prerequisites
echo -e "${BLUE}Step 1: Checking Prerequisites${NC}"

if ! command_exists aws; then
    print_error "AWS CLI not installed"
    exit 1
fi
print_status "AWS CLI installed"

if ! aws sts get-caller-identity --profile uo-innovation &>/dev/null; then
    print_error "AWS credentials not configured"
    exit 1
fi
print_status "AWS credentials configured"

if ! command_exists python3; then
    print_error "Python 3 not installed"
    exit 1
fi
print_status "Python 3 installed"

# Step 2: Create DynamoDB Tables
echo ""
echo -e "${BLUE}Step 2: Creating DynamoDB Tables${NC}"

TABLES=(
    "${TABLE_PREFIX}-patients"
    "${TABLE_PREFIX}-diagnoses"
    "${TABLE_PREFIX}-medications"
    "${TABLE_PREFIX}-providers"
    "${TABLE_PREFIX}-patient-diagnoses"
    "${TABLE_PREFIX}-patient-medications"
)

for TABLE in "${TABLES[@]}"; do
    if aws dynamodb describe-table \
        --profile uo-innovation \
        --table-name "${TABLE}" \
        --region "${AWS_REGION}" &>/dev/null; then
        print_warning "Table ${TABLE} already exists"
    else
        # Removed unreliable `if [ $? -eq 0 ]` check after redirected
        # commands. With set -e active, any failure exits immediately
        # before the check is reached, making it dead code. Table
        # creation now relies on set -e for error handling, with a
        # single print_status after each successful create call.
        case "${TABLE}" in
            *-patients)
                aws dynamodb create-table \
                    --profile uo-innovation \
                    --table-name "${TABLE}" \
                    --attribute-definitions \
                        AttributeName=patient_id,AttributeType=S \
                    --key-schema \
                        AttributeName=patient_id,KeyType=HASH \
                    --billing-mode PAY_PER_REQUEST \
                    --region "${AWS_REGION}" \
                    --tags Key=Project,Value=healthcare-ai Key=Environment,Value=innovation-sandbox Key=ResourceGroup,Value="${RESOURCE_GROUP}" Key=Owner,Value="${STUDENT_ID}" \
                    >/dev/null
                ;;
            *-diagnoses)
                aws dynamodb create-table \
                    --profile uo-innovation \
                    --table-name "${TABLE}" \
                    --attribute-definitions \
                        AttributeName=diagnosis_code,AttributeType=S \
                    --key-schema \
                        AttributeName=diagnosis_code,KeyType=HASH \
                    --billing-mode PAY_PER_REQUEST \
                    --region "${AWS_REGION}" \
                    --tags Key=Project,Value=healthcare-ai Key=ResourceGroup,Value="${RESOURCE_GROUP}" Key=Owner,Value="${STUDENT_ID}" \
                    >/dev/null
                ;;
            *-medications)
                aws dynamodb create-table \
                    --profile uo-innovation \
                    --table-name "${TABLE}" \
                    --attribute-definitions \
                        AttributeName=medication_id,AttributeType=S \
                    --key-schema \
                        AttributeName=medication_id,KeyType=HASH \
                    --billing-mode PAY_PER_REQUEST \
                    --region "${AWS_REGION}" \
                    --tags Key=Project,Value=healthcare-ai Key=ResourceGroup,Value="${RESOURCE_GROUP}" Key=Owner,Value="${STUDENT_ID}" \
                    >/dev/null
                ;;
            *-providers)
                aws dynamodb create-table \
                    --profile uo-innovation \
                    --table-name "${TABLE}" \
                    --attribute-definitions \
                        AttributeName=npi,AttributeType=S \
                    --key-schema \
                        AttributeName=npi,KeyType=HASH \
                    --billing-mode PAY_PER_REQUEST \
                    --region "${AWS_REGION}" \
                    --tags Key=Project,Value=healthcare-ai Key=ResourceGroup,Value="${RESOURCE_GROUP}" Key=Owner,Value="${STUDENT_ID}" \
                    >/dev/null
                ;;
            *-patient-diagnoses)
                aws dynamodb create-table \
                    --profile uo-innovation \
                    --table-name "${TABLE}" \
                    --attribute-definitions \
                        AttributeName=patient_id,AttributeType=S \
                        AttributeName=diagnosis_code,AttributeType=S \
                    --key-schema \
                        AttributeName=patient_id,KeyType=HASH \
                        AttributeName=diagnosis_code,KeyType=RANGE \
                    --billing-mode PAY_PER_REQUEST \
                    --region "${AWS_REGION}" \
                    --tags Key=Project,Value=healthcare-ai Key=ResourceGroup,Value="${RESOURCE_GROUP}" Key=Owner,Value="${STUDENT_ID}" \
                    >/dev/null
                ;;
            *-patient-medications)
                aws dynamodb create-table \
                    --profile uo-innovation \
                    --table-name "${TABLE}" \
                    --attribute-definitions \
                        AttributeName=patient_id,AttributeType=S \
                        AttributeName=medication_id,AttributeType=S \
                    --key-schema \
                        AttributeName=patient_id,KeyType=HASH \
                        AttributeName=medication_id,KeyType=RANGE \
                    --billing-mode PAY_PER_REQUEST \
                    --region "${AWS_REGION}" \
                    --tags Key=Project,Value=healthcare-ai Key=ResourceGroup,Value="${RESOURCE_GROUP}" Key=Owner,Value="${STUDENT_ID}" \
                    >/dev/null
                ;;
        esac
        print_status "Table ${TABLE} created"
    fi
done

# Wait for tables to be active
echo ""
echo "Waiting for tables to be active..."
sleep 10

for TABLE in "${TABLES[@]}"; do
    aws dynamodb wait table-exists \
        --profile uo-innovation \
        --table-name "${TABLE}" \
        --region "${AWS_REGION}" 2>/dev/null || true
done

print_status "All tables are active"

# Step 3: Create Healthcare Data Population Script
echo ""
echo -e "${BLUE}Step 3: Creating Healthcare Data Population Script${NC}"

cat > populate-healthcare-data.py <<'EOF'
#!/usr/bin/env python3
"""
Healthcare Data Population Script
Populates DynamoDB with sample healthcare data
"""

import boto3
import sys
from decimal import Decimal
from boto3.dynamodb.conditions import Attr


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
            print("\nData Summary:")

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
            print("\nSample Patient Data:")
            response = self.patients_table.scan(Limit=3)
            for patient in response['Items']:
                patient_id = patient['patient_id']
                print(f"  Patient: {patient_id} (Age: {patient['age']}, Gender: {patient['gender']})")

                # Get diagnoses
                diag_response = self.patient_diagnoses_table.scan(
                    FilterExpression=Attr('patient_id').eq(patient_id)
                )
                if diag_response['Items']:
                    print(f"    Diagnoses:")
                    for diag in diag_response['Items']:
                        print(f"      - {diag['diagnosis_code']} ({diag.get('severity', 'N/A')})")

                # Get medications
                med_response = self.patient_medications_table.scan(
                    FilterExpression=Attr('patient_id').eq(patient_id)
                )
                if med_response['Items']:
                    print(f"    Medications:")
                    for med in med_response['Items']:
                        print(f"      - {med['medication_name']} ({med.get('frequency', 'N/A')})")

        except Exception as e:
            print(f"Error verifying data: {str(e)}")
            raise


def main():
    # Fixed IndentationError — both print statements in the usage block
    # now have consistent 8-space indentation.
    if len(sys.argv) < 3:
        print("Usage: python3 populate-healthcare-data.py <region> <table_prefix>")
        # FIX: Updated example region from us-east-1 to us-west-2 to match
        #      the actual cluster region and avoid student confusion.
        print("Example: python3 populate-healthcare-data.py us-west-2 healthcare")
        sys.exit(1)

    region = sys.argv[1]
    table_prefix = sys.argv[2]

    print("Healthcare Data Setup")
    print("=" * 50)

    try:
        data = HealthcareData(region, table_prefix)

        print("\n1. Populating data...")
        data.populate_data()

        print("\n2. Verifying data...")
        data.verify_data()

        print("\nHealthcare data setup complete!")
        print("\nYour DynamoDB tables are populated with sample healthcare data.")

    except Exception as e:
        print(f"\nError: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
EOF

chmod +x populate-healthcare-data.py
print_status "Created populate-healthcare-data.py"

# Step 4: Install Python Dependencies
echo ""
echo -e "${BLUE}Step 4: Installing Python Dependencies${NC}"

# Use `python3 -m pip` instead of bare `pip3` to ensure boto3 is
# installed into whichever Python environment (venv or system) is
# currently active.
if python3 -m pip install boto3 --quiet 2>/dev/null; then
    print_status "boto3 installed"
else
    print_warning "Could not install boto3 automatically. Install manually:"
    echo "  pip install boto3"
fi

# Step 5: Populate Data
echo ""
echo -e "${BLUE}Step 5: Populating Healthcare Data${NC}"

# Wrapped population prompt in SKIP_CONFIRMATION check so that
# deploy-all.sh --skip-confirmation does not hang waiting for input.
if [ "$SKIP_CONFIRMATION" = false ]; then
    read -p "Populate DynamoDB tables with sample healthcare data now? (y/n): " -r
    POPULATE=$REPLY
else
    POPULATE="y"
fi

if [[ $POPULATE =~ ^[Yy]$ ]]; then
    echo "Running population script..."
    if AWS_PROFILE=uo-innovation python3 populate-healthcare-data.py "${AWS_REGION}" "${TABLE_PREFIX}"; then
        print_status "Healthcare data loaded successfully"
    else
        print_warning "Failed to populate data. Run manually later:"
        echo "  AWS_PROFILE=uo-innovation python3 populate-healthcare-data.py ${AWS_REGION} ${TABLE_PREFIX}"
    fi
else
    echo "To populate later, run:"
    echo "  AWS_PROFILE=uo-innovation python3 populate-healthcare-data.py ${AWS_REGION} ${TABLE_PREFIX}"
fi

# Step 6: Save Info
echo ""
echo -e "${BLUE}Step 6: Saving Configuration${NC}"

cat > dynamodb-info.txt <<EOF
DynamoDB Healthcare Data Information
=====================================
Region: ${AWS_REGION}
Table Prefix: ${TABLE_PREFIX}
Deployed: $(date)

Tables Created:
===============
- ${TABLE_PREFIX}-patients
- ${TABLE_PREFIX}-diagnoses
- ${TABLE_PREFIX}-medications
- ${TABLE_PREFIX}-providers
- ${TABLE_PREFIX}-patient-diagnoses
- ${TABLE_PREFIX}-patient-medications

Quick Commands:
===============

# List all tables
aws dynamodb list-tables --region ${AWS_REGION} --profile uo-innovation

# Describe a table
aws dynamodb describe-table --table-name ${TABLE_PREFIX}-patients --region ${AWS_REGION} --profile uo-innovation

# Scan patients table
aws dynamodb scan --table-name ${TABLE_PREFIX}-patients --region ${AWS_REGION} --profile uo-innovation

# Query patient diagnoses
aws dynamodb query --table-name ${TABLE_PREFIX}-patient-diagnoses \\
  --key-condition-expression "patient_id = :pid" \\
  --expression-attribute-values '{":pid":{"S":"ANON001"}}' \\
  --region ${AWS_REGION} --profile uo-innovation

# Populate data
AWS_PROFILE=uo-innovation python3 populate-healthcare-data.py ${AWS_REGION} ${TABLE_PREFIX}

# Delete all tables (cleanup)
for table in ${TABLE_PREFIX}-patients ${TABLE_PREFIX}-diagnoses ${TABLE_PREFIX}-medications ${TABLE_PREFIX}-providers ${TABLE_PREFIX}-patient-diagnoses ${TABLE_PREFIX}-patient-medications; do
  aws dynamodb delete-table --table-name \$table --region ${AWS_REGION} --profile uo-innovation
done

Python Access Example:
======================
import boto3

dynamodb = boto3.resource('dynamodb', region_name='${AWS_REGION}')
patients_table = dynamodb.Table('${TABLE_PREFIX}-patients')

# Get all patients
response = patients_table.scan()
for patient in response['Items']:
    print(patient)

# Query specific patient
response = patients_table.get_item(Key={'patient_id': 'ANON001'})
patient = response.get('Item')

Costs:
======
DynamoDB on-demand pricing:
- Pay per request (no idle capacity costs)
- Write: \$1.25 per million requests
- Read: \$0.25 per million requests
- Storage: \$0.25/GB/month
- Estimated cost for sample data: < \$5/month

Next Steps:
===========
Run: ./4-deploy-integration.sh
EOF

print_status "Configuration saved to dynamodb-info.txt"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Healthcare Data Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Region: ${AWS_REGION}"
echo "Tables: ${TABLE_PREFIX}-*"
echo ""
echo "Next: Run ./4-deploy-integration.sh to connect Ollama with DynamoDB"
echo ""