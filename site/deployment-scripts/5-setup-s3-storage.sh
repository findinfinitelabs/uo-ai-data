#!/bin/bash

# Script 5: Setup S3 Storage for Dataset Publishing
# Creates S3 bucket for users to publish healthcare datasets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

SKIP_CONFIRMATION="${SKIP_CONFIRMATION:-false}"

CLUSTER_NAME=${CLUSTER_NAME:-ollama-ai-cluster}
AWS_REGION=${AWS_REGION:-us-west-2}
NAMESPACE=${NAMESPACE:-ollama}
STUDENT_ID=${STUDENT_ID:-student0001}
RESOURCE_GROUP=${RESOURCE_GROUP:-dataai-account-student0001}
TABLE_PREFIX=${TABLE_PREFIX:-healthcare}

# S3_BUCKET_NAME made deterministic using account ID instead of
# $(date +%s). The timestamp approach generates a new name on every
# run, causing the script to attempt creating a new bucket each time
# rather than reusing the existing one. Using the account ID keeps
# the name unique globally while being stable across re-runs.
# If S3_BUCKET_NAME is already set in .env, that value is used.
if [ -z "${S3_BUCKET_NAME}" ]; then
    AWS_ACCOUNT=$(aws sts get-caller-identity \
        --profile uo-innovation \
        --query Account \
        --output text)
    S3_BUCKET_NAME="healthcare-ai-datasets-${AWS_ACCOUNT}"
fi

echo "=============================================="
echo "   S3 Storage Setup for Dataset Publishing"
echo "=============================================="
echo ""
echo "Configuration:"
echo "  Bucket Name: ${S3_BUCKET_NAME}"
echo "  AWS Region:  ${AWS_REGION}"
echo "  Cluster:     ${CLUSTER_NAME}"
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

# Added --profile uo-innovation to aws s3 ls check and all subsequent
# aws CLI calls.
if aws s3 ls "s3://${S3_BUCKET_NAME}" \
    --profile uo-innovation 2>/dev/null; then
    print_warning "Bucket ${S3_BUCKET_NAME} already exists"
else
    if [ "${AWS_REGION}" = "us-east-1" ]; then
        aws s3api create-bucket \
            --profile uo-innovation \
            --bucket ${S3_BUCKET_NAME} \
            --region ${AWS_REGION}
    else
        aws s3api create-bucket \
            --profile uo-innovation \
            --bucket ${S3_BUCKET_NAME} \
            --region ${AWS_REGION} \
            --create-bucket-configuration LocationConstraint=${AWS_REGION}
    fi
    print_status "Created S3 bucket: ${S3_BUCKET_NAME}"
fi

# Step 2: Configure Bucket Settings
echo ""
echo -e "${BLUE}Step 2: Configuring Bucket Settings${NC}"

aws s3api put-bucket-versioning \
    --profile uo-innovation \
    --bucket ${S3_BUCKET_NAME} \
    --versioning-configuration Status=Enabled \
    --region ${AWS_REGION}
print_status "Enabled versioning"

aws s3api put-bucket-encryption \
    --profile uo-innovation \
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

aws s3api put-bucket-lifecycle-configuration \
    --profile uo-innovation \
    --bucket ${S3_BUCKET_NAME} \
    --lifecycle-configuration '{
        "Rules": [{
            "ID": "ArchiveOldDatasets",
            "Status": "Enabled",
            "Filter": {"Prefix": ""},
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

aws s3api put-public-access-block \
    --profile uo-innovation \
    --bucket ${S3_BUCKET_NAME} \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --region ${AWS_REGION}
print_status "Blocked public access"

aws s3api put-bucket-tagging \
    --profile uo-innovation \
    --bucket ${S3_BUCKET_NAME} \
    --tagging 'TagSet=[{Key=Project,Value=healthcare-ai},{Key=Environment,Value=innovation-sandbox},{Key=ResourceGroup,Value='"${RESOURCE_GROUP}"'},{Key=Owner,Value='"${STUDENT_ID}"'}]' \
    --region ${AWS_REGION}
print_status "Added resource group tags"

# Step 3: Create IAM Policy for S3 Access
echo ""
echo -e "${BLUE}Step 3: Creating IAM Policy for S3 Access${NC}"

AWS_ACCOUNT=$(aws sts get-caller-identity \
    --profile uo-innovation \
    --query Account \
    --output text)

S3_POLICY_NAME="HealthcareAI-S3-Policy"

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

POLICY_ARN=$(aws iam list-policies \
    --profile uo-innovation \
    --query "Policies[?PolicyName=='${S3_POLICY_NAME}'].Arn" \
    --output text)

if [ -z "$POLICY_ARN" ]; then
    POLICY_ARN=$(aws iam create-policy \
        --profile uo-innovation \
        --policy-name ${S3_POLICY_NAME} \
        --policy-document file:///tmp/s3-policy.json \
        --tags Key=Project,Value=healthcare-ai Key=ResourceGroup,Value="${RESOURCE_GROUP}" Key=Owner,Value="${STUDENT_ID}" \
        --query 'Policy.Arn' \
        --output text)
    print_status "Created IAM policy: ${S3_POLICY_NAME}"
else
    # Update existing policy with a new version
    POLICY_VERSION=$(aws iam list-policy-versions \
        --profile uo-innovation \
        --policy-arn ${POLICY_ARN} \
        --query 'Versions[?IsDefaultVersion==`false`].VersionId' \
        --output text | head -1)
    if [ -n "$POLICY_VERSION" ]; then
        aws iam delete-policy-version \
            --profile uo-innovation \
            --policy-arn ${POLICY_ARN} \
            --version-id ${POLICY_VERSION} 2>/dev/null || true
    fi
    aws iam create-policy-version \
        --profile uo-innovation \
        --policy-arn ${POLICY_ARN} \
        --policy-document file:///tmp/s3-policy.json \
        --set-as-default >/dev/null
    print_status "Updated IAM policy: ${S3_POLICY_NAME}"
fi

# Step 4: Attach S3 Policy to BedrockAccessRole
echo ""
echo -e "${BLUE}Step 4: Attaching S3 Policy to Service Account Role${NC}"

# Replaced the eksctl get iamserviceaccount lookup (which searched for
# the non-existent 'integration-service-account') with a direct attach
# to BedrockAccessRole-ollama-ai-cluster. This is the role bound to
# bedrock-service-account, which is what the bridge pod runs as.
# The same pattern was used for DynamoDB in 4-deploy-integration.sh.
BEDROCK_ROLE="BedrockAccessRole-ollama-ai-cluster"

aws iam attach-role-policy \
    --profile uo-innovation \
    --role-name ${BEDROCK_ROLE} \
    --policy-arn ${POLICY_ARN} 2>/dev/null || print_warning "S3 policy may already be attached"
print_status "Attached S3 policy to ${BEDROCK_ROLE}"

# Step 5: Create Export Utilities
# This must happen BEFORE Step 6 (image rebuild) so the real
# export_to_s3.py is baked into the container image. Script 4 builds
# the image with a no-op stub; this step replaces it with the full
# implementation and rebuilds so the bridge pod picks it up in one
# clean deploy-all.sh run without manual intervention.
echo ""
echo -e "${BLUE}Step 6: Creating Export Utilities${NC}"

cat > export_to_s3.py <<'EOFPYTHON'
#!/usr/bin/env python3
"""
Export healthcare datasets to S3
Can be used standalone or imported into the Flask bridge app.
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

        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{prefix}{table_name}_{timestamp}.json"
        json_data = json.dumps(items, indent=2, cls=DecimalEncoder)

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
        """Export all healthcare tables to S3"""
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
                print(f"  ✓ {table}: {result['record_count']} records → {result['s3_uri']}")
            except Exception as e:
                results[table] = {'error': str(e)}
                print(f"  ✗ {table}: {str(e)}")

        return results

    def export_query_results(self, query_text, response_data, llm_used='unknown'):
        """Export a specific query and its AI-generated results"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"queries/query_{timestamp}.json"

        export_data = {
            'timestamp': timestamp,
            'query': query_text,
            'llm_used': llm_used,
            'response': response_data
        }

        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=json.dumps(export_data, indent=2, cls=DecimalEncoder),
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

        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=json.dumps(export_data, indent=2, cls=DecimalEncoder),
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

        return [
            {
                'key': obj['Key'],
                'size': obj['Size'],
                'last_modified': obj['LastModified'].isoformat(),
                's3_uri': f"s3://{self.bucket_name}/{obj['Key']}"
            }
            for obj in response['Contents']
        ]


if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 export_to_s3.py <bucket-name> [table-prefix]")
        sys.exit(1)

    bucket_name = sys.argv[1]
    table_prefix = sys.argv[2] if len(sys.argv) > 2 else 'healthcare'

    print(f"Exporting all healthcare tables to s3://{bucket_name}...")
    exporter = DatasetExporter(bucket_name)
    results = exporter.export_all_healthcare_tables(table_prefix)

    success = sum(1 for r in results.values() if 'error' not in r)
    print(f"\nExported {success}/{len(results)} tables successfully.")
EOFPYTHON

chmod +x export_to_s3.py
print_status "Created export_to_s3.py utility"

# Step 6: Rebuild container image with real export_to_s3.py and update deployment
echo ""
echo -e "${BLUE}Step 6: Rebuilding Container Image with S3 Export Support${NC}"

BUILD_DIR="/tmp/healthcare-ai-bridge"

if [ ! -d "${BUILD_DIR}" ]; then
    print_warning "Build directory ${BUILD_DIR} not found — was 4-deploy-integration.sh run first?"
    print_warning "Skipping image rebuild. Re-run this script after deploying script 4."
else
    # Copy the real export_to_s3.py into the build context, replacing the stub
    cp export_to_s3.py ${BUILD_DIR}/export_to_s3.py
    print_status "Copied real export_to_s3.py into build context"

    cd ${BUILD_DIR}

    IMAGE_NAME="${IMAGE_NAME:-healthcare-ai-bridge}"
    IMAGE_TAG="${IMAGE_TAG:-latest}"
    ECR_REPO="${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}"

    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} . >/dev/null
    print_status "Docker image rebuilt"

    aws ecr get-login-password \
        --profile uo-innovation \
        --region ${AWS_REGION} \
      | docker login --username AWS --password-stdin \
          ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com 2>/dev/null

    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}
    docker push ${ECR_REPO}:${IMAGE_TAG} >/dev/null
    print_status "Pushed updated image to ECR: ${ECR_REPO}:${IMAGE_TAG}"

    # Return to deployment-scripts directory
    cd - >/dev/null

    # Now patch ConfigMap and restart pod with the new image
    if kubectl get configmap healthcare-bridge-config -n ${NAMESPACE} &>/dev/null; then
        kubectl patch configmap healthcare-bridge-config \
            -n ${NAMESPACE} \
            --type merge \
            -p "{\"data\": {\"S3_BUCKET_NAME\": \"${S3_BUCKET_NAME}\"}}"
        print_status "Updated healthcare-bridge-config with S3 bucket name"

        kubectl rollout restart deployment/healthcare-ai-bridge -n ${NAMESPACE}
        kubectl rollout status deployment/healthcare-ai-bridge -n ${NAMESPACE} --timeout=2m
        print_status "Restarted healthcare-ai-bridge with real S3 export support"
    else
        print_warning "healthcare-bridge-config not found — run 4-deploy-integration.sh first"
        echo "  After deploying, re-run this script to complete the S3 setup."
    fi
fi

# Step 7: Test Export
echo ""
echo -e "${BLUE}Step 7: Testing S3 Export${NC}"

if [ "$SKIP_CONFIRMATION" = false ]; then
    read -p "Run a test export of all DynamoDB tables to S3 now? (y/n): " -r
    RUN_EXPORT=$REPLY
else
    RUN_EXPORT="y"
fi

if [[ $RUN_EXPORT =~ ^[Yy]$ ]]; then
    echo "Running test export..."
    if AWS_PROFILE=uo-innovation python3 export_to_s3.py "${S3_BUCKET_NAME}" "${TABLE_PREFIX}"; then
        print_status "Test export completed successfully"
    else
        print_warning "Test export failed. Check credentials and bucket permissions."
        echo "  Manual test: AWS_PROFILE=uo-innovation python3 export_to_s3.py ${S3_BUCKET_NAME}"
    fi
else
    echo "To run the export later:"
    echo "  AWS_PROFILE=uo-innovation python3 export_to_s3.py ${S3_BUCKET_NAME}"
fi

# Step 8: Save Configuration
echo ""
echo -e "${BLUE}Step 8: Saving Configuration${NC}"

# Update .env (not config.env) to match what the script sources at the
# top. Also write S3_BUCKET_NAME regardless of whether it was already
# present, so re-runs always reflect the current bucket name.
if grep -q "S3_BUCKET_NAME" ./.env 2>/dev/null; then
    # Replace existing line
    sed -i "s|^S3_BUCKET_NAME=.*|S3_BUCKET_NAME=${S3_BUCKET_NAME}|" ./.env
else
    echo "S3_BUCKET_NAME=${S3_BUCKET_NAME}" >> ./.env
fi
print_status "Updated .env with S3_BUCKET_NAME=${S3_BUCKET_NAME}"

cat > s3-storage-info.txt <<EOF
S3 Storage Configuration
========================
Bucket Name: ${S3_BUCKET_NAME}
Region:      ${AWS_REGION}
Policy ARN:  ${POLICY_ARN}
Created:     $(date)

Features:
---------
- Versioning enabled
- Server-side encryption (AES256)
- Lifecycle policies configured
- Public access blocked

Lifecycle:
----------
- Day 0-89:   STANDARD storage
- Day 90-179: STANDARD_IA (Infrequent Access)
- Day 180+:   GLACIER (Archive)

Cost Estimate:
--------------
- STANDARD:     ~\$0.023/GB/month
- STANDARD_IA:  ~\$0.0125/GB/month
- GLACIER:      ~\$0.004/GB/month
- Typical:      ~\$5-20/month for 100GB dataset

Access:
-------
S3 URI:   s3://${S3_BUCKET_NAME}
Console:  https://s3.console.aws.amazon.com/s3/buckets/${S3_BUCKET_NAME}

IAM Role with S3 Access:
------------------------
BedrockAccessRole-ollama-ai-cluster
  - BedrockAccessPolicy-ollama-ai-cluster
  - DynamoDBHealthcareReadPolicy
  - HealthcareAI-S3-Policy

Export Usage:
-------------
# Export all tables
AWS_PROFILE=uo-innovation python3 export_to_s3.py ${S3_BUCKET_NAME}

# From Python (inside EKS pod, uses IRSA)
from export_to_s3 import DatasetExporter
exporter = DatasetExporter('${S3_BUCKET_NAME}')
results = exporter.export_all_healthcare_tables()

# Export specific query result
exporter.export_query_results(
    query_text="Show diabetes patients",
    response_data={"patients": [...]},
    llm_used="bedrock"
)

# List exports
exports = exporter.list_exports(prefix='datasets/')

Integration API Endpoints (after deploying script 4):
------------------------------------------------------
POST /export-to-s3         - Export current query results
GET  /s3-exports           - List available exports
POST /export-conversation  - Save chat history

Bridge URL:
-----------
http://a2b92163e9cfb460c90c310ceee42297-1749988853.us-west-2.elb.amazonaws.com:8080

List exported files:
--------------------
aws s3 ls s3://${S3_BUCKET_NAME}/ --recursive --profile uo-innovation
EOF

print_status "Saved s3-storage-info.txt"

# Summary
echo ""
echo "================================================================"
echo -e "${GREEN}S3 Storage Setup Complete!${NC}"
echo "================================================================"
echo ""
echo "Created:"
echo "  S3 Bucket:    ${S3_BUCKET_NAME}"
echo "  IAM Policy:   ${S3_POLICY_NAME}"
echo "  Export util:  export_to_s3.py"
echo "  Docs:         s3-storage-info.txt"
echo ""
echo "Features:"
echo "  Versioning, encryption, lifecycle policies, no public access"
echo ""
echo "Manual export:"
echo "  AWS_PROFILE=uo-innovation python3 export_to_s3.py ${S3_BUCKET_NAME}"
echo ""
echo "List exports:"
echo "  aws s3 ls s3://${S3_BUCKET_NAME}/ --recursive --profile uo-innovation"
echo ""
echo "================================================================"