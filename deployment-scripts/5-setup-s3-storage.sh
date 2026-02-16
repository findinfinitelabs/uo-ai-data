#!/bin/bash

# Script 5: Setup S3 Storage for Dataset Publishing
# Creates S3 bucket for users to publish healthcare datasets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load configuration
if [ -f ./.env ]; then
    source ./.env
elif [ -f ./config.env ]; then
    source ./config.env
else
    echo -e "${RED}Configuration file .env not found!${NC}"
    echo "Please run setup-aws-credentials.sh first to create .env file."
    exit 1
fi

# Set defaults if not in config
CLUSTER_NAME=${CLUSTER_NAME:-healthcare-ai-cluster}
AWS_REGION=${AWS_REGION:-us-west-2}
S3_BUCKET_NAME=${S3_BUCKET_NAME:-healthcare-ai-datasets-$(date +%s)}
NAMESPACE=${NAMESPACE:-default}
STUDENT_ID=${STUDENT_ID:-student0001}
RESOURCE_GROUP=${RESOURCE_GROUP:-dataai-account-student0001}

echo "=============================================="
echo "   S3 Storage Setup for Dataset Publishing"
echo "=============================================="
echo ""
echo "Configuration:"
echo "  Bucket Name: ${S3_BUCKET_NAME}"
echo "  AWS Region: ${AWS_REGION}"
echo "  Cluster: ${CLUSTER_NAME}"
echo ""

# Functions
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Create S3 Bucket
echo -e "${BLUE}Step 1: Creating S3 Bucket${NC}"

# Check if bucket exists (S3 bucket names are globally unique)
if aws s3 ls "s3://${S3_BUCKET_NAME}" 2>/dev/null; then
    print_warning "Bucket ${S3_BUCKET_NAME} already exists"
else
    # Create bucket with appropriate region configuration
    if [ "${AWS_REGION}" = "us-east-1" ]; then
        aws s3api create-bucket \
            --bucket ${S3_BUCKET_NAME} \
            --region ${AWS_REGION}
    else
        aws s3api create-bucket \
            --bucket ${S3_BUCKET_NAME} \
            --region ${AWS_REGION} \
            --create-bucket-configuration LocationConstraint=${AWS_REGION}
    fi
    print_status "Created S3 bucket: ${S3_BUCKET_NAME}"
fi

# Step 2: Configure Bucket Settings
echo ""
echo -e "${BLUE}Step 2: Configuring Bucket Settings${NC}"

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket ${S3_BUCKET_NAME} \
    --versioning-configuration Status=Enabled \
    --region ${AWS_REGION}
print_status "Enabled versioning"

# Enable encryption
aws s3api put-bucket-encryption \
    --bucket ${S3_BUCKET_NAME} \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }' \
    --region ${AWS_REGION}
print_status "Enabled encryption"

# Add lifecycle policy for cost optimization
aws s3api put-bucket-lifecycle-configuration \
    --bucket ${S3_BUCKET_NAME} \
    --lifecycle-configuration '{
        "Rules": [{
            "Id": "ArchiveOldDatasets",
            "Status": "Enabled",
            "Transitions": [{
                "Days": 90,
                "StorageClass": "STANDARD_IA"
            }, {
                "Days": 180,
                "StorageClass": "GLACIER"
            }],
            "NoncurrentVersionTransitions": [{
                "NoncurrentDays": 30,
                "StorageClass": "GLACIER"
            }]
        }]
    }' \
    --region ${AWS_REGION}
print_status "Configured lifecycle policies (90d → IA, 180d → Glacier)"

# Block public access (security best practice)
aws s3api put-public-access-block \
    --bucket ${S3_BUCKET_NAME} \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --region ${AWS_REGION}
print_status "Blocked public access"

# Add tags to S3 bucket
aws s3api put-bucket-tagging \
    --bucket ${S3_BUCKET_NAME} \
    --tagging 'TagSet=[{Key=Project,Value=healthcare-ai},{Key=Environment,Value=innovation-sandbox},{Key=ResourceGroup,Value='"${RESOURCE_GROUP}"'},{Key=Owner,Value='"${STUDENT_ID}"'}]' \
    --region ${AWS_REGION}
print_status "Added resource group tags"

# Step 3: Create IAM Policy for S3 Access
echo ""
echo -e "${BLUE}Step 3: Creating IAM Policy for S3 Access${NC}"

S3_POLICY_NAME="HealthcareAI-S3-Policy"

# Create IAM policy document
cat > /tmp/s3-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::${S3_BUCKET_NAME}",
                "arn:aws:s3:::${S3_BUCKET_NAME}/*"
            ]
        }
    ]
}
EOF

# Create or update policy
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='${S3_POLICY_NAME}'].Arn" --output text)

if [ -z "$POLICY_ARN" ]; then
    POLICY_ARN=$(aws iam create-policy \
        --policy-name ${S3_POLICY_NAME} \
        --policy-document file:///tmp/s3-policy.json \
        --tags Key=Project,Value=healthcare-ai Key=ResourceGroup,Value="${RESOURCE_GROUP}" Key=Owner,Value="${STUDENT_ID}" \
        --query 'Policy.Arn' \
        --output text)
    print_status "Created IAM policy: ${S3_POLICY_NAME}"
else
    # Update existing policy
    POLICY_VERSION=$(aws iam list-policy-versions --policy-arn ${POLICY_ARN} --query 'Versions[?IsDefaultVersion==`false`].VersionId' --output text | head -1)
    if [ ! -z "$POLICY_VERSION" ]; then
        aws iam delete-policy-version --policy-arn ${POLICY_ARN} --version-id ${POLICY_VERSION} 2>/dev/null || true
    fi
    aws iam create-policy-version \
        --policy-arn ${POLICY_ARN} \
        --policy-document file:///tmp/s3-policy.json \
        --set-as-default
    print_status "Updated IAM policy: ${S3_POLICY_NAME}"
fi

# Step 4: Update Service Account with S3 Permissions
echo ""
echo -e "${BLUE}Step 4: Updating Service Account Permissions${NC}"

# Get the IAM role associated with the service account
ROLE_NAME=$(eksctl get iamserviceaccount \
    --cluster ${CLUSTER_NAME} \
    --namespace ${NAMESPACE} \
    --region ${AWS_REGION} 2>/dev/null | grep integration-service-account | awk '{print $3}')

if [ -z "$ROLE_NAME" ]; then
    print_warning "Service account not found. Will attach policy when integration is deployed."
    echo "PENDING_S3_POLICY_ARN=${POLICY_ARN}" >> /tmp/pending-s3-setup.env
else
    # Attach S3 policy to role
    aws iam attach-role-policy \
        --role-name ${ROLE_NAME} \
        --policy-arn ${POLICY_ARN}
    print_status "Attached S3 policy to service account role"
fi

# Step 5: Create Sample Export Script
echo ""
echo -e "${BLUE}Step 5: Creating Export Utilities${NC}"

cat > export_to_s3.py <<'EOFPYTHON'
#!/usr/bin/env python3
"""
Export healthcare datasets to S3
Can be used standalone or imported into Flask app
"""

import boto3
import json
import os
from datetime import datetime
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

class DatasetExporter:
    def __init__(self, bucket_name, aws_region='us-west-2'):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client('s3', region_name=aws_region)
        self.dynamodb = boto3.resource('dynamodb', region_name=aws_region)
    
    def export_table(self, table_name, prefix=''):
        """Export a single DynamoDB table to S3"""
        table = self.dynamodb.Table(table_name)
        response = table.scan()
        items = response['Items']
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{prefix}{table_name}_{timestamp}.json"
        
        # Convert to JSON
        json_data = json.dumps(items, indent=2, cls=DecimalEncoder)
        
        # Upload to S3
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=json_data,
            ContentType='application/json',
            Metadata={
                'table': table_name,
                'export_date': timestamp,
                'record_count': str(len(items))
            }
        )
        
        return {
            'filename': filename,
            'record_count': len(items),
            's3_uri': f"s3://{self.bucket_name}/{filename}"
        }
    
    def export_all_healthcare_tables(self, table_prefix='healthcare'):
        """Export all healthcare tables"""
        tables = [
            f'{table_prefix}-patients',
            f'{table_prefix}-diagnoses',
            f'{table_prefix}-medications',
            f'{table_prefix}-providers',
            f'{table_prefix}-patient-diagnoses',
            f'{table_prefix}-patient-medications'
        ]
        
        results = {}
        for table in tables:
            try:
                result = self.export_table(table, prefix='datasets/')
                results[table] = result
            except Exception as e:
                results[table] = {'error': str(e)}
        
        return results
    
    def export_query_results(self, query_text, response_data, llm_used='unknown'):
        """Export a specific query and its results"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"queries/query_{timestamp}.json"
        
        export_data = {
            'timestamp': timestamp,
            'query': query_text,
            'llm_used': llm_used,
            'response': response_data
        }
        
        json_data = json.dumps(export_data, indent=2, cls=DecimalEncoder)
        
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=json_data,
            ContentType='application/json',
            Metadata={
                'query_type': 'ai_interaction',
                'llm': llm_used,
                'timestamp': timestamp
            }
        )
        
        return {
            'filename': filename,
            's3_uri': f"s3://{self.bucket_name}/{filename}"
        }
    
    def export_conversation(self, messages, metadata=None):
        """Export a full conversation thread"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"conversations/conversation_{timestamp}.json"
        
        export_data = {
            'timestamp': timestamp,
            'messages': messages,
            'metadata': metadata or {}
        }
        
        json_data = json.dumps(export_data, indent=2, cls=DecimalEncoder)
        
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=json_data,
            ContentType='application/json'
        )
        
        return {
            'filename': filename,
            's3_uri': f"s3://{self.bucket_name}/{filename}"
        }
    
    def list_exports(self, prefix=''):
        """List all exports in the bucket"""
        response = self.s3_client.list_objects_v2(
            Bucket=self.bucket_name,
            Prefix=prefix
        )
        
        if 'Contents' not in response:
            return []
        
        exports = []
        for obj in response['Contents']:
            exports.append({
                'key': obj['Key'],
                'size': obj['Size'],
                'last_modified': obj['LastModified'].isoformat(),
                's3_uri': f"s3://{self.bucket_name}/{obj['Key']}"
            })
        
        return exports

if __name__ == '__main__':
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python3 export_to_s3.py <bucket-name> [table-prefix]")
        sys.exit(1)
    
    bucket_name = sys.argv[1]
    table_prefix = sys.argv[2] if len(sys.argv) > 2 else 'healthcare'
    
    exporter = DatasetExporter(bucket_name)
    
    print(f"Exporting all healthcare tables to {bucket_name}...")
    results = exporter.export_all_healthcare_tables(table_prefix)
    
    print("\nExport Results:")
    for table, result in results.items():
        if 'error' in result:
            print(f"  ✗ {table}: {result['error']}")
        else:
            print(f"  ✓ {table}: {result['record_count']} records → {result['s3_uri']}")
    
    print("\nDone!")
EOFPYTHON

chmod +x export_to_s3.py
print_status "Created export_to_s3.py utility"

# Step 6: Save Configuration
echo ""
echo -e "${BLUE}Step 6: Saving Configuration${NC}"

cat > s3-storage-info.txt <<EOF
S3 Storage Configuration
========================

Bucket Name: ${S3_BUCKET_NAME}
Region: ${AWS_REGION}
Policy ARN: ${POLICY_ARN}

Features:
---------
✓ Versioning enabled
✓ Server-side encryption (AES256)
✓ Lifecycle policies configured
✓ Public access blocked

Lifecycle:
----------
- Day 0-89:    STANDARD storage
- Day 90-179:  STANDARD_IA (Infrequent Access)
- Day 180+:    GLACIER (Archive)

Cost Estimate:
--------------
- STANDARD: ~\$0.023/GB/month
- STANDARD_IA: ~\$0.0125/GB/month
- GLACIER: ~\$0.004/GB/month

Typical usage: ~\$5-20/month for 100GB dataset

Access:
-------
S3 URI: s3://${S3_BUCKET_NAME}
Console: https://s3.console.aws.amazon.com/s3/buckets/${S3_BUCKET_NAME}

Export Usage:
-------------
# Export all tables
python3 export_to_s3.py ${S3_BUCKET_NAME}

# From Python
from export_to_s3 import DatasetExporter
exporter = DatasetExporter('${S3_BUCKET_NAME}')
results = exporter.export_all_healthcare_tables()

# Export specific query
exporter.export_query_results(
    query_text="Show diabetes patients",
    response_data={"patients": [...]},
    llm_used="bedrock"
)

# List exports
exports = exporter.list_exports(prefix='datasets/')

Integration:
------------
The integration API (4-deploy-integration.sh) will include:
- POST /export-to-s3 - Export current dataset
- GET /s3-exports - List available exports
- POST /export-conversation - Save chat history

Web UI will prompt users after AI interactions:
"Would you like to publish this dataset to S3?"
EOF

print_status "Saved s3-storage-info.txt"

# Update config.env if bucket name was auto-generated
if ! grep -q "S3_BUCKET_NAME" ./config.env 2>/dev/null; then
    echo "S3_BUCKET_NAME=${S3_BUCKET_NAME}" >> ./config.env
    print_status "Updated config.env with bucket name"
fi

# Summary
echo ""
echo "================================================================"
echo -e "${GREEN}✓ S3 Storage Setup Complete!${NC}"
echo "================================================================"
echo ""
echo "Created:"
echo "  • S3 Bucket: ${S3_BUCKET_NAME}"
echo "  • IAM Policy: ${S3_POLICY_NAME}"
echo "  • Export utility: export_to_s3.py"
echo "  • Documentation: s3-storage-info.txt"
echo ""
echo "Features:"
echo "  • Versioning enabled"
echo "  • Encryption at rest"
echo "  • Lifecycle policies (auto-archive after 90/180 days)"
echo "  • Secure (no public access)"
echo ""
echo "Next: Update integration API to add S3 export functionality"
echo "      (This will be handled in step 4-deploy-integration.sh)"
echo ""
echo "Manual Export:"
echo "  python3 export_to_s3.py ${S3_BUCKET_NAME}"
echo ""
echo "Cost: ~\$5-20/month (depends on data volume)"
echo ""
echo "================================================================"
