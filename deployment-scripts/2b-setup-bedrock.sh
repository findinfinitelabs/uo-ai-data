#!/bin/bash

#####################################################################
# AWS Bedrock Setup Script
# Enables Bedrock models and configures IAM permissions for EKS
#####################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
CLUSTER_NAME="${CLUSTER_NAME:-ollama-ai-cluster}"
NAMESPACE="${BEDROCK_NAMESPACE:-ollama}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AWS Bedrock Setup${NC}"
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

if ! aws sts get-caller-identity &>/dev/null; then
    print_error "AWS credentials not configured"
    exit 1
fi
print_status "AWS credentials configured"

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
print_status "AWS Account: ${AWS_ACCOUNT}"

# Step 2: Check Bedrock Availability
echo ""
echo -e "${BLUE}Step 2: Checking Bedrock Availability${NC}"

# List available models
echo "Checking available Bedrock models in ${AWS_REGION}..."
AVAILABLE_MODELS=$(aws bedrock list-foundation-models --region ${AWS_REGION} --query 'modelSummaries[*].modelId' --output text 2>/dev/null || echo "")

if [ -z "$AVAILABLE_MODELS" ]; then
    print_warning "Bedrock may not be available in ${AWS_REGION} or you may need to enable it first"
    echo ""
    echo "To enable Bedrock:"
    echo "  1. Go to AWS Console > Bedrock"
    echo "  2. Request model access for the models you want to use"
    echo "  3. Wait for approval (usually instant for most models)"
    echo ""
    read -p "Have you already enabled Bedrock model access? (y/n): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Please enable Bedrock model access first:"
        echo "  https://console.aws.amazon.com/bedrock/home?region=${AWS_REGION}#/modelaccess"
        exit 1
    fi
else
    print_status "Bedrock is available"
    echo ""
    echo "Available models:"
    echo "$AVAILABLE_MODELS" | tr '\t' '\n' | head -10 | sed 's/^/  - /'
    if [ $(echo "$AVAILABLE_MODELS" | wc -w) -gt 10 ]; then
        echo "  ... and $(($(echo "$AVAILABLE_MODELS" | wc -w) - 10)) more"
    fi
fi

# Step 3: Recommended Models
echo ""
echo -e "${BLUE}Step 3: Recommended Models for Healthcare AI${NC}"

RECOMMENDED_MODELS=(
    "anthropic.claude-3-sonnet-20240229-v1:0"
    "anthropic.claude-3-haiku-20240307-v1:0"
    "meta.llama3-70b-instruct-v1:0"
    "mistral.mistral-7b-instruct-v0:2"
)

echo ""
echo "Checking access to recommended models..."
for MODEL in "${RECOMMENDED_MODELS[@]}"; do
    # Try to get model details
    if aws bedrock get-foundation-model --model-identifier "$MODEL" --region ${AWS_REGION} &>/dev/null; then
        print_status "$MODEL"
    else
        print_warning "$MODEL (not accessible - may need to request access)"
    fi
done

# Step 4: Create IAM Policy for Bedrock Access
echo ""
echo -e "${BLUE}Step 4: Creating IAM Policy for Bedrock Access${NC}"

POLICY_NAME="BedrockAccessPolicy-${CLUSTER_NAME}"

# Check if policy exists
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='${POLICY_NAME}'].Arn" --output text 2>/dev/null)

if [ -z "$POLICY_ARN" ]; then
    cat > /tmp/bedrock-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream",
                "bedrock:ListFoundationModels",
                "bedrock:GetFoundationModel"
            ],
            "Resource": "*"
        }
    ]
}
EOF
    
    POLICY_ARN=$(aws iam create-policy \
        --policy-name "${POLICY_NAME}" \
        --policy-document file:///tmp/bedrock-policy.json \
        --description "Allow EKS pods to access AWS Bedrock" \
        --query 'Policy.Arn' \
        --output text)
    
    print_status "IAM policy created: ${POLICY_ARN}"
else
    print_warning "IAM policy already exists: ${POLICY_ARN}"
fi

# Step 5: Create IAM Role for Service Account (IRSA)
echo ""
echo -e "${BLUE}Step 5: Setting up IAM Role for Service Account (IRSA)${NC}"

SERVICE_ACCOUNT_NAME="bedrock-service-account"
ROLE_NAME="BedrockAccessRole-${CLUSTER_NAME}"

# Get OIDC provider for EKS cluster
OIDC_PROVIDER=$(aws eks describe-cluster --name ${CLUSTER_NAME} --region ${AWS_REGION} --query "cluster.identity.oidc.issuer" --output text | sed -e "s/^https:\/\///")

if [ -z "$OIDC_PROVIDER" ]; then
    print_error "Could not find OIDC provider for cluster ${CLUSTER_NAME}"
    print_warning "Make sure the EKS cluster exists and OIDC is enabled"
    exit 1
fi

print_status "OIDC Provider: ${OIDC_PROVIDER}"

# Check if role exists
ROLE_ARN=$(aws iam get-role --role-name "${ROLE_NAME}" --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    # Create trust policy
    cat > /tmp/trust-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::${AWS_ACCOUNT}:oidc-provider/${OIDC_PROVIDER}"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "${OIDC_PROVIDER}:sub": "system:serviceaccount:${NAMESPACE}:${SERVICE_ACCOUNT_NAME}",
                    "${OIDC_PROVIDER}:aud": "sts.amazonaws.com"
                }
            }
        }
    ]
}
EOF
    
    ROLE_ARN=$(aws iam create-role \
        --role-name "${ROLE_NAME}" \
        --assume-role-policy-document file:///tmp/trust-policy.json \
        --description "IAM role for EKS pods to access Bedrock" \
        --query 'Role.Arn' \
        --output text)
    
    print_status "IAM role created: ${ROLE_ARN}"
    
    # Attach policy to role
    aws iam attach-role-policy \
        --role-name "${ROLE_NAME}" \
        --policy-arn "${POLICY_ARN}"
    
    print_status "Policy attached to role"
else
    print_warning "IAM role already exists: ${ROLE_ARN}"
fi

# Step 6: Create Kubernetes Service Account
echo ""
echo -e "${BLUE}Step 6: Creating Kubernetes Service Account${NC}"

if ! command_exists kubectl; then
    print_error "kubectl not installed"
    exit 1
fi

if ! kubectl cluster-info &>/dev/null; then
    print_error "Not connected to Kubernetes cluster"
    echo "Run: aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"
    exit 1
fi

# Create or update service account
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ${SERVICE_ACCOUNT_NAME}
  namespace: ${NAMESPACE}
  annotations:
    eks.amazonaws.com/role-arn: ${ROLE_ARN}
EOF

print_status "Kubernetes service account created/updated"

# Step 7: Test Bedrock Access
echo ""
echo -e "${BLUE}Step 7: Testing Bedrock Access${NC}"

echo "Creating test pod..."
kubectl run bedrock-test --image=amazon/aws-cli --rm -it --restart=Never \
  --namespace=${NAMESPACE} \
  --serviceaccount=${SERVICE_ACCOUNT_NAME} \
  --command -- aws bedrock list-foundation-models --region ${AWS_REGION} \
  >/tmp/bedrock-test.log 2>&1 &

sleep 5

if grep -q "modelSummaries" /tmp/bedrock-test.log 2>/dev/null; then
    print_status "Bedrock access confirmed!"
else
    print_warning "Bedrock test inconclusive - check manually:"
    echo "  kubectl run bedrock-test --image=amazon/aws-cli --rm -it --restart=Never \\"
    echo "    --namespace=${NAMESPACE} --serviceaccount=${SERVICE_ACCOUNT_NAME} \\"
    echo "    -- aws bedrock list-foundation-models --region ${AWS_REGION}"
fi

# Clean up test pod
kubectl delete pod bedrock-test -n ${NAMESPACE} --ignore-not-found=true 2>/dev/null || true

# Step 8: Create Test Script
echo ""
echo -e "${BLUE}Step 8: Creating Bedrock Test Script${NC}"

cat > test-bedrock.py <<'EOF'
#!/usr/bin/env python3
"""
Test AWS Bedrock access and models
"""

import boto3
import json
import sys

def test_bedrock(region):
    print(f"🧪 Testing AWS Bedrock in {region}")
    print("="*50)
    
    bedrock = boto3.client('bedrock', region_name=region)
    bedrock_runtime = boto3.client('bedrock-runtime', region_name=region)
    
    # List available models
    print("\n1. Listing available models...")
    try:
        response = bedrock.list_foundation_models()
        models = response['modelSummaries']
        print(f"✓ Found {len(models)} models")
        
        # Show first few models
        print("\nAvailable models (first 5):")
        for model in models[:5]:
            print(f"  - {model['modelId']}")
            print(f"    Provider: {model['providerName']}")
            print(f"    Input: {model.get('inputModalities', ['text'])}")
            print(f"    Output: {model.get('outputModalities', ['text'])}")
            print()
    except Exception as e:
        print(f"✗ Error listing models: {str(e)}")
        return False
    
    # Test Claude model
    print("\n2. Testing Claude 3 Haiku...")
    try:
        prompt = "What is HIPAA in one sentence?"
        
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
        
        response = bedrock_runtime.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        answer = response_body['content'][0]['text']
        
        print(f"✓ Claude response: {answer}")
        
    except Exception as e:
        print(f"✗ Error testing Claude: {str(e)}")
        print("\nNote: You may need to request access to Claude models:")
        print(f"  https://console.aws.amazon.com/bedrock/home?region={region}#/modelaccess")
    
    # Test Llama model
    print("\n3. Testing Llama 3...")
    try:
        prompt = "What is AI? Answer in one sentence."
        
        body = json.dumps({
            "prompt": prompt,
            "max_gen_len": 512,
            "temperature": 0.5,
        })
        
        response = bedrock_runtime.invoke_model(
            modelId='meta.llama3-8b-instruct-v1:0',
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        answer = response_body['generation']
        
        print(f"✓ Llama response: {answer}")
        
    except Exception as e:
        print(f"⚠ Llama not available: {str(e)}")
    
    print("\n✅ Bedrock testing complete!")
    return True

if __name__ == "__main__":
    region = sys.argv[1] if len(sys.argv) > 1 else 'us-east-1'
    test_bedrock(region)
EOF

chmod +x test-bedrock.py
print_status "Created test-bedrock.py"

echo ""
echo "Testing Bedrock access with Python..."
if command_exists python3; then
    if python3 -c "import boto3" 2>/dev/null; then
        python3 test-bedrock.py ${AWS_REGION} || print_warning "Bedrock test had issues - check model access"
    else
        print_warning "boto3 not installed. Install with: pip3 install boto3"
    fi
else
    print_warning "Python 3 not found - skip test"
fi

# Step 9: Save Configuration
echo ""
echo -e "${BLUE}Step 9: Saving Configuration${NC}"

cat > bedrock-info.txt <<EOF
AWS Bedrock Configuration
=========================
Region: ${AWS_REGION}
Account: ${AWS_ACCOUNT}
Configured: $(date)

IAM Configuration:
==================
Policy ARN: ${POLICY_ARN}
Role ARN: ${ROLE_ARN}
Service Account: ${SERVICE_ACCOUNT_NAME}
Namespace: ${NAMESPACE}

OIDC Provider: ${OIDC_PROVIDER}

Recommended Models:
===================
- anthropic.claude-3-sonnet-20240229-v1:0 (Best for complex reasoning)
- anthropic.claude-3-haiku-20240307-v1:0 (Fast and cost-effective)
- meta.llama3-70b-instruct-v1:0 (Open source, good performance)
- mistral.mistral-7b-instruct-v0:2 (Lightweight, efficient)

Model Access:
=============
Request access to models:
https://console.aws.amazon.com/bedrock/home?region=${AWS_REGION}#/modelaccess

Pricing (examples):
===================
Claude 3 Haiku:
  - Input: \$0.25 per 1M tokens
  - Output: \$1.25 per 1M tokens

Claude 3 Sonnet:
  - Input: \$3 per 1M tokens
  - Output: \$15 per 1M tokens

Llama 3 (8B):
  - Input: \$0.30 per 1M tokens
  - Output: \$0.60 per 1M tokens

Testing Commands:
=================

# Test from command line
aws bedrock list-foundation-models --region ${AWS_REGION}

# Test with Python
python3 test-bedrock.py ${AWS_REGION}

# Test from within EKS pod
kubectl run -it --rm bedrock-test \\
  --image=amazon/aws-cli \\
  --serviceaccount=${SERVICE_ACCOUNT_NAME} \\
  --namespace=${NAMESPACE} \\
  -- aws bedrock list-foundation-models --region ${AWS_REGION}

Using Bedrock in Applications:
===============================

Python Example:
--------------
import boto3
import json

bedrock_runtime = boto3.client('bedrock-runtime', region_name='${AWS_REGION}')

body = json.dumps({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Your question here"}]
})

response = bedrock_runtime.invoke_model(
    modelId='anthropic.claude-3-haiku-20240307-v1:0',
    body=body
)

result = json.loads(response['body'].read())
answer = result['content'][0]['text']

Next Steps:
===========
1. Request access to desired models in AWS Console
2. Run: ./4-deploy-integration.sh (will use both Ollama and Bedrock)
3. Test the integration API
EOF

print_status "Configuration saved to bedrock-info.txt"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AWS Bedrock Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Configuration:"
echo "  Region: ${AWS_REGION}"
echo "  IAM Role: ${ROLE_ARN}"
echo "  Service Account: ${SERVICE_ACCOUNT_NAME}"
echo ""
echo "Next steps:"
echo "  1. Ensure you have model access enabled in AWS Console"
echo "  2. Run: ./4-deploy-integration.sh to deploy the query bridge"
echo "  3. The integration will support both Ollama and Bedrock"
echo ""
echo "Test Bedrock:"
echo "  python3 test-bedrock.py ${AWS_REGION}"
echo ""
