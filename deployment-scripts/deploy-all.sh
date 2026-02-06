#!/bin/bash

#####################################################################
# Healthcare AI Infrastructure - Complete Deployment Script
# 
# This script deploys the full stack:
# 1. EKS Cluster with GPU support
# 2. Ollama LLM service
# 2b. AWS Bedrock setup
# 3. DynamoDB tables
# 4. Query Bridge Integration
#
# Usage: ./deploy-all.sh [--skip-confirmation] [--no-color]
#####################################################################

set -e

# Parse arguments
SKIP_CONFIRMATION=false
NO_COLOR=false

for arg in "$@"; do
    case $arg in
        --skip-confirmation)
            SKIP_CONFIRMATION=true
            shift
            ;;
        --no-color)
            NO_COLOR=true
            shift
            ;;
        --help)
            echo "Usage: ./deploy-all.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-confirmation  Skip all confirmation prompts"
            echo "  --no-color          Disable colored output"
            echo "  --help              Show this help message"
            echo ""
            echo "Environment Variables (optional):"
            echo "  CLUSTER_NAME         EKS cluster name (default: ollama-ai-cluster)"
            echo "  AWS_REGION           AWS region (default: us-east-1)"
            echo "  GPU_NODE_COUNT       Number of GPU nodes (default: 2)"
            echo "  TABLE_PREFIX         DynamoDB table prefix (default: healthcare)"
            echo ""
            exit 0
            ;;
    esac
done

# Colors
if [ "$NO_COLOR" = false ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    MAGENTA='\033[0;35m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    MAGENTA=''
    CYAN=''
    BOLD=''
    NC=''
fi

# Configuration (can be overridden by environment variables)
CLUSTER_NAME="${CLUSTER_NAME:-ollama-ai-cluster}"
AWS_REGION="${AWS_REGION:-us-east-1}"
GPU_NODE_COUNT="${GPU_NODE_COUNT:-2}"
TABLE_PREFIX="${TABLE_PREFIX:-healthcare}"

# Deployment tracking
START_TIME=$(date +%s)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/deployment-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo "$@" | tee -a "$LOG_FILE"
}

print_header() {
    log ""
    log -e "${BOLD}${CYAN}========================================${NC}"
    log -e "${BOLD}${CYAN}$1${NC}"
    log -e "${BOLD}${CYAN}========================================${NC}"
    log ""
}

print_step() {
    log -e "${BOLD}${MAGENTA}>>> $1${NC}"
}

print_success() {
    log -e "${GREEN}✓${NC} $1"
}

print_error() {
    log -e "${RED}✗${NC} $1"
}

print_warning() {
    log -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    log -e "${BLUE}ℹ${NC} $1"
}

cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Deployment failed!"
        log ""
        log "Log file: $LOG_FILE"
        log ""
        log "To retry, fix the issue and run:"
        log "  ./deploy-all.sh"
        log ""
        log "To clean up and start over:"
        log "  eksctl delete cluster --name=${CLUSTER_NAME} --region=${AWS_REGION}"
    fi
}

trap cleanup EXIT

# ASCII Art Banner
clear
cat << "EOF"
 _   _            _ _   _                           _    ___ 
| | | | ___  __ _| | |_| |__   ___ __ _ _ __ ___  / \  |_ _|
| |_| |/ _ \/ _` | | __| '_ \ / __/ _` | '__/ _ \ / _ \  | | 
|  _  |  __/ (_| | | |_| | | | (_| (_| | | |  __// ___ \ | | 
|_| |_|\___|\__,_|_|\__|_| |_|\___\__,_|_|  \___/_/   \_\___|
                                                               
         Infrastructure Deployment Automation
EOF

log ""
log "Starting deployment at $(date)"
log "Log file: $LOG_FILE"
log ""

# Display Configuration
print_header "Configuration"
log "  Cluster Name:    ${CLUSTER_NAME}"
log "  AWS Region:      ${AWS_REGION}"
log "  GPU Node Count:  ${GPU_NODE_COUNT}"
log "  Table Prefix:    ${TABLE_PREFIX}"
log ""

# Check AWS Credentials
print_header "Checking AWS Credentials"

if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not installed"
    log ""
    log "Please install AWS CLI first:"
    log "  macOS:   brew install awscli"
    log "  Linux:   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    log "  Windows: https://aws.amazon.com/cli/"
    log ""
    exit 1
fi
print_success "AWS CLI installed"

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured or invalid"
    log ""
    log -e "${YELLOW}No valid AWS credentials found!${NC}"
    log ""
    log "Your AWS credentials need to be configured before deployment."
    log ""
    log "For federated/SSO accounts (like yours with account 375523929321):"
    log "  1. Run the setup wizard:"
    log "     ./setup-aws-credentials.sh"
    log ""
    log "  2. Or manually configure SSO:"
    log "     aws configure sso"
    log "     aws sso login --profile YOUR_PROFILE"
    log "     export AWS_PROFILE=YOUR_PROFILE"
    log ""
    log "For standard IAM users:"
    log "  1. Run: aws configure"
    log "  2. Enter your Access Key ID and Secret Access Key"
    log ""
    log "After configuring credentials, run this script again."
    log ""
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
USER_ARN=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)

print_success "AWS credentials verified"
log "  Account ID: ${ACCOUNT_ID}"
log "  Identity:   ${USER_ARN}"
log ""

# Confirmation
if [ "$SKIP_CONFIRMATION" = false ]; then
    print_warning "This will deploy a small/medium AI infrastructure stack (1 GPU node)"
    print_warning "Estimated cost: ~\$15-20/day base + usage-based costs"
    print_warning "Estimated time: 40-60 minutes"
    log ""
    read -p "Continue with deployment? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy](es)?$ ]]; then
        log "Deployment cancelled by user."
        exit 0
    fi
fi

# Verify scripts exist
REQUIRED_SCRIPTS=(
    "1-deploy-eks-cluster.sh"
    "2-install-ollama.sh"
    "2b-setup-bedrock.sh"
    "3-setup-knowledge-graph.sh"
    "4-deploy-integration.sh"
    "5-setup-s3-storage.sh"
)

log ""
print_step "Verifying deployment scripts..."
for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ ! -f "${SCRIPT_DIR}/${script}" ]; then
        print_error "Missing script: ${script}"
        exit 1
    fi
    chmod +x "${SCRIPT_DIR}/${script}"
done
print_success "All scripts found and executable"

# Export configuration
export CLUSTER_NAME
export AWS_REGION
export GPU_NODE_COUNT
export TABLE_PREFIX

# Step 1: Deploy EKS Cluster
print_header "Step 1/5: Deploying EKS Cluster"
print_info "This will take 20-30 minutes..."
log ""

if bash "${SCRIPT_DIR}/1-deploy-eks-cluster.sh" 2>&1 | tee -a "$LOG_FILE"; then
    print_success "EKS cluster deployed successfully"
else
    print_error "EKS cluster deployment failed"
    exit 1
fi

# Step 2: Install Ollama
print_header "Step 2/5: Installing Ollama"
print_info "This will take 10-15 minutes..."
log ""

if bash "${SCRIPT_DIR}/2-install-ollama.sh" 2>&1 | tee -a "$LOG_FILE"; then
    print_success "Ollama installed successfully"
else
    print_error "Ollama installation failed"
    exit 1
fi

# Step 2b: Setup Bedrock
print_header "Step 2b/5: Setting up AWS Bedrock"
print_info "This will take 2-3 minutes..."
log ""

if bash "${SCRIPT_DIR}/2b-setup-bedrock.sh" 2>&1 | tee -a "$LOG_FILE"; then
    print_success "Bedrock setup complete"
else
    print_error "Bedrock setup failed"
    exit 1
fi

# Step  3: Setup DynamoDB
print_header "Step 3/5: Setting up DynamoDB Tables"
print_info "This will take 3-5 minutes..."
log ""

if bash "${SCRIPT_DIR}/3-setup-knowledge-graph.sh" 2>&1 | tee -a "$LOG_FILE"; then
    print_success "DynamoDB tables setup complete"
else
    print_error "DynamoDB setup failed"
    exit 1
fi

# Step 4: Deploy Integration
print_header "Step 4/6: Deploying AI Integration"
print_info "This will take 5-10 minutes..."
log ""

if bash "${SCRIPT_DIR}/4-deploy-integration.sh" 2>&1 | tee -a "$LOG_FILE"; then
    print_success "Integration deployed successfully"
else
    print_error "Integration deployment failed"
    exit 1
fi

# Step 5: Setup S3 Storage
print_header "Step 5/6: Setting up S3 Storage for Dataset Publishing"
print_info "This will take 2-3 minutes..."
log ""

if bash "${SCRIPT_DIR}/5-setup-s3-storage.sh" 2>&1 | tee -a "$LOG_FILE"; then
    print_success "S3 storage setup complete"
else
    print_error "S3 storage setup failed"
    exit 1
fi

# Calculate deployment time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Final Summary
print_header "Deployment Complete! 🎉"

log -e "${GREEN}All components successfully deployed!${NC}"
log ""
log "Deployment Time: ${MINUTES}m ${SECONDS}s"
log ""
log -e "${BOLD}Access Information:${NC}"
log ""

# Gather service URLs
log "Fetching service URLs..."
OLLAMA_LB=$(kubectl get svc ollama-service -n ollama -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "localhost")
BRIDGE_LB=$(kubectl get svc healthcare-ai-bridge -n ollama -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "localhost")

if [ "$OLLAMA_LB" = "localhost" ]; then
    log -e "${YELLOW}Note: LoadBalancers may still be provisioning. Use port-forward for immediate access.${NC}"
    log ""
fi

log "1. Ollama (LLM Service - Self-hosted)"
log "   URL: http://${OLLAMA_LB}:11434"
log "   Port-forward: kubectl port-forward -n ollama svc/ollama-service 11434:11434"
log ""

log "2. AWS Bedrock (LLM Service - Managed)"
log "   Region: ${AWS_REGION}"
log "   Models: Claude 3, Llama 3, Mistral"
log "   Status: Configured via IRSA"
log "   Test: cat bedrock-info.txt"
log ""

log "3. DynamoDB (Healthcare Data)"
log "   Region: ${AWS_REGION}"
log "   Tables: ${TABLE_PREFIX}-patients, ${TABLE_PREFIX}-diagnoses, etc."
log "   Access: Via IAM roles (IRSA)"
log ""

log "4. Query Bridge (AI Integration)"
log "   URL: http://${BRIDGE_LB}:8080"
log "   Web UI: http://${BRIDGE_LB}:8080"
log "   Port-forward: kubectl port-forward -n ollama svc/healthcare-ai-bridge 8080:8080"
log "   Features: Dual LLM (Bedrock + Ollama), RAG, GraphQL queries"
log ""

log "5. S3 Storage (Dataset Publishing)"
log "   Bucket: ${S3_BUCKET_NAME:-Not configured}"
log "   Region: ${AWS_REGION}"
log "   Usage: Export datasets from web UI"
log ""
log "   API: http://${BRIDGE_LB}:8080"
log "   Port-forward: kubectl port-forward -n ollama svc/healthcare-ai-bridge 8080:8080"
log ""

log -e "${BOLD}Quick Test:${NC}"
log ""
log "# Test query with Bedrock (after port-forward on 8080)"
log "curl -X POST http://localhost:8080/query \\"
log "  -H 'Content-Type: application/json' \\"
log "  -d '{\"question\": \"How many patients have diabetes?\", \"use_bedrock\": true}'"
log ""
log "# Test query with Ollama"
log "curl -X POST http://localhost:8080/query \\"
log "  -H 'Content-Type: application/json' \\"
log "  -d '{\"question\": \"What medications are most common?\", \"use_bedrock\": false}'"
log ""

log -e "${BOLD}Cleanup:${NC}"
log ""
log "# When you're done, delete everything:"
log "eksctl delete cluster --name=${CLUSTER_NAME} --region=${AWS_REGION}"
log ""
log "# Delete DynamoDB tables:"
log "aws dynamodb list-tables --region ${AWS_REGION} --query 'TableNames[?starts_with(@, \`${TABLE_PREFIX}-\`)]' --output text | xargs -n1 aws dynamodb delete-table --region ${AWS_REGION} --table-name"
log ""
log "# Delete Bedrock IAM resources:"
log "aws iam detach-role-policy --role-name BedrockAccessRole --policy-arn \$(aws iam list-policies --query 'Policies[?PolicyName==\`BedrockAccessPolicy\`].Arn' --output text)"
log "aws iam delete-policy --policy-arn \$(aws iam list-policies --query 'Policies[?PolicyName==\`BedrockAccessPolicy\`].Arn' --output text)"
log "aws iam delete-role --role-name BedrockAccessRole"
log ""

log -e "${BOLD}Documentation:${NC}"
log ""
log "  - cluster-info.txt        : EKS cluster details"
log "  - ollama-info.txt         : Ollama commands and usage"
log "  - bedrock-info.txt        : Bedrock models and configuration"
log "  - dynamodb-info.txt       : DynamoDB tables and queries"
log "  - integration-info.txt    : API documentation"
log "  - $LOG_FILE : Complete deployment log"
log ""

# Save deployment summary
cat > "${SCRIPT_DIR}/deployment-summary.txt" <<EOF
Healthcare AI Infrastructure Deployment Summary
================================================
Deployed: $(date)
Duration: ${MINUTES}m ${SECONDS}s

Configuration:
--------------
Cluster Name:    ${CLUSTER_NAME}
AWS Region:      ${AWS_REGION}
GPU Node Count:  ${GPU_NODE_COUNT}
Table Prefix:    ${TABLE_PREFIX}

Services:
---------
Ollama:          http://${OLLAMA_LB}:11434
Bedrock:         Enabled (${AWS_REGION})
DynamoDB:        ${TABLE_PREFIX}-* tables
Query Bridge:    http://${BRIDGE_LB}:8080

LLM Models:
-----------
Ollama:          mistral, llama2, mixtral
Bedrock:         Claude 3, Llama 3, Mistral

Data Storage:
-------------
DynamoDB Tables: ${TABLE_PREFIX}-patients, ${TABLE_PREFIX}-diagnoses,
                 ${TABLE_PREFIX}-medications, ${TABLE_PREFIX}-providers,
                 ${TABLE_PREFIX}-patient-diagnoses, ${TABLE_PREFIX}-patient-medications

Next Steps:
-----------
1. Wait 2-3 minutes for LoadBalancers to fully provision
2. Test the query bridge API with both Bedrock and Ollama
3. Access healthcare data via natural language queries
4. Check bedrock-info.txt and integration-info.txt for examples

Cleanup:
--------
eksctl delete cluster --name=${CLUSTER_NAME} --region=${AWS_REGION}
# Also delete DynamoDB tables and Bedrock IAM resources (see cleanup section above)
EOF

print_success "Deployment summary saved to deployment-summary.txt"
log ""
log -e "${GREEN}${BOLD}🚀 Your Healthcare AI Infrastructure is ready!${NC}"
log ""
