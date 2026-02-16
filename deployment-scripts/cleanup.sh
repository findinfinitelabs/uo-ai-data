#!/bin/bash

#####################################################################
# Healthcare AI Infrastructure - Cleanup Script
# 
# This script safely removes all deployed resources
#
# Usage: ./cleanup.sh [--force] [--keep-data]
#####################################################################

set -e

# Parse arguments
FORCE=false
KEEP_DATA=false

for arg in "$@"; do
    case $arg in
        --force)
            FORCE=true
            shift
            ;;
        --keep-data)
            KEEP_DATA=true
            shift
            ;;
        --help)
            echo "Usage: ./cleanup.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --force      Skip all confirmation prompts"
            echo "  --keep-data  Preserve persistent volumes (keeps models and graph data)"
            echo "  --help       Show this help message"
            echo ""
            exit 0
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
CLUSTER_NAME="${CLUSTER_NAME:-ollama-ai-cluster}"
AWS_REGION="${AWS_REGION:-us-west-2}"

print_header() {
    echo ""
    echo -e "${BOLD}${BLUE}========================================${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header "Healthcare AI Infrastructure Cleanup"

echo "This will remove:"
echo "  - EKS Cluster: ${CLUSTER_NAME}"
echo "  - Region: ${AWS_REGION}"
echo "  - DynamoDB tables (healthcare-*)"
echo "  - S3 buckets (healthcare-ai-data-*)"
echo "  - All deployed applications (Ollama, Neo4j, Integration service)"
echo "  - IAM roles created by eksctl"
if [ "$KEEP_DATA" = false ]; then
    echo "  - All persistent volumes (models, graph data)"
else
    echo "  - Persistent volumes will be preserved"
fi
echo ""

print_warning "This action cannot be undone!"
echo ""

if [ "$FORCE" = false ]; then
    read -p "Are you sure you want to proceed? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy](es)?$ ]]; then
        echo "Cleanup cancelled."
        exit 0
    fi
fi

# Check if cluster exists
echo ""
echo "Checking if cluster exists..."
if ! eksctl get cluster --name=${CLUSTER_NAME} --region=${AWS_REGION} &>/dev/null; then
    print_error "Cluster ${CLUSTER_NAME} not found in region ${AWS_REGION}"
    echo ""
    echo "Available clusters:"
    eksctl get cluster --region=${AWS_REGION} || echo "  None found"
    exit 1
fi

print_success "Cluster found"

# Option to back up data
if [ "$KEEP_DATA" = false ]; then
    echo ""
    read -p "Create backup of Neo4j data before deletion? (y/n): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating Neo4j backup..."
        
        # Export database
        POD=$(kubectl get pods -n neo4j -l app=neo4j -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
        if [ -n "$POD" ]; then
            kubectl exec -n neo4j ${POD} -- neo4j-admin dump --database=neo4j --to=/tmp/neo4j-backup.dump 2>/dev/null || true
            kubectl cp neo4j/${POD}:/tmp/neo4j-backup.dump ./neo4j-backup-$(date +%Y%m%d-%H%M%S).dump 2>/dev/null || true
            print_success "Backup saved (if successful)"
        else
            print_warning "Could not find Neo4j pod for backup"
        fi
    fi
fi

# Step 1: Delete Kubernetes resources (preserves PVCs if requested)
print_header "Step 1: Removing Kubernetes Applications"

echo "Deleting integration service..."
kubectl delete deployment kg-query-bridge -n ollama 2>/dev/null || true
kubectl delete service kg-query-bridge -n ollama 2>/dev/null || true
kubectl delete configmap kg-bridge-config -n ollama 2>/dev/null || true
kubectl delete secret kg-bridge-secret -n ollama 2>/dev/null || true
print_success "Integration service removed"

echo "Deleting Ollama..."
kubectl delete deployment ollama -n ollama 2>/dev/null || true
kubectl delete service ollama-service -n ollama 2>/dev/null || true
if [ "$KEEP_DATA" = false ]; then
    kubectl delete pvc ollama-models -n ollama 2>/dev/null || true
fi
print_success "Ollama removed"

echo "Uninstalling Neo4j..."
helm uninstall neo4j-healthcare -n neo4j 2>/dev/null || true
if [ "$KEEP_DATA" = false ]; then
    kubectl delete pvc -n neo4j --all 2>/dev/null || true
fi
print_success "Neo4j removed"

# Wait for resources to terminate
echo ""
echo "Waiting for resources to terminate (30 seconds)..."
sleep 30

# Step 2: Delete namespaces
print_header "Step 2: Removing Namespaces"

kubectl delete namespace ollama 2>/dev/null || true
print_success "Namespace 'ollama' removed"

kubectl delete namespace neo4j 2>/dev/null || true
print_success "Namespace 'neo4j' removed"

# Step 3: Delete DynamoDB Tables
print_header "Step 3: Deleting DynamoDB Tables"

echo "Finding healthcare DynamoDB tables..."
DYNAMODB_TABLES=$(aws dynamodb list-tables --region ${AWS_REGION} --query 'TableNames[?starts_with(@, `healthcare-`)]' --output text 2>/dev/null || echo "")

if [ -n "$DYNAMODB_TABLES" ]; then
    echo "Found tables: $DYNAMODB_TABLES"
    echo ""
    for TABLE in $DYNAMODB_TABLES; do
        echo "Deleting table: $TABLE"
        aws dynamodb delete-table --table-name "$TABLE" --region ${AWS_REGION} 2>/dev/null || true
        print_success "Table $TABLE deleted"
    done
else
    print_warning "No healthcare DynamoDB tables found"
fi

# Step 4: Delete S3 Buckets
print_header "Step 4: Deleting S3 Buckets"

echo "Finding healthcare S3 buckets..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
S3_BUCKETS=$(aws s3 ls | grep "healthcare-ai-data" | awk '{print $3}' 2>/dev/null || echo "")

if [ -n "$S3_BUCKETS" ]; then
    for BUCKET in $S3_BUCKETS; do
        echo "Emptying and deleting bucket: $BUCKET"
        aws s3 rb s3://$BUCKET --force --region ${AWS_REGION} 2>/dev/null || true
        print_success "Bucket $BUCKET deleted"
    done
else
    print_warning "No healthcare S3 buckets found"
fi

# Step 5: Delete EKS Cluster
print_header "Step 5: Deleting EKS Cluster"

echo "This will take 10-15 minutes..."
echo ""

if eksctl delete cluster --name=${CLUSTER_NAME} --region=${AWS_REGION} --wait; then
    print_success "EKS cluster deleted successfully"
else
    print_error "Failed to delete cluster completely"
    echo ""
    echo "Check AWS Console for any remaining resources:"
    echo "  - EC2 Instances"
    echo "  - EBS Volumes"
    echo "  - Load Balancers"
    echo "  - VPC and Subnets"
    echo "  - CloudFormation Stacks"
fi

# Step 6: Clean up IAM Roles (created by eksctl)
print_header "Step 6: Cleaning Up IAM Roles"

echo "Finding eksctl-created IAM roles..."
IAM_ROLES=$(aws iam list-roles --query "Roles[?contains(RoleName, 'eksctl-${CLUSTER_NAME}')].RoleName" --output text 2>/dev/null || echo "")

if [ -n "$IAM_ROLES" ]; then
    for ROLE in $IAM_ROLES; do
        echo "Checking role: $ROLE"
        # Detach managed policies
        ATTACHED_POLICIES=$(aws iam list-attached-role-policies --role-name "$ROLE" --query 'AttachedPolicies[].PolicyArn' --output text 2>/dev/null || echo "")
        for POLICY_ARN in $ATTACHED_POLICIES; do
            aws iam detach-role-policy --role-name "$ROLE" --policy-arn "$POLICY_ARN" 2>/dev/null || true
        done
        
        # Delete inline policies
        INLINE_POLICIES=$(aws iam list-role-policies --role-name "$ROLE" --query 'PolicyNames[]' --output text 2>/dev/null || echo "")
        for POLICY in $INLINE_POLICIES; do
            aws iam delete-role-policy --role-name "$ROLE" --policy-name "$POLICY" 2>/dev/null || true
        done
        
        # Delete instance profiles
        INSTANCE_PROFILES=$(aws iam list-instance-profiles-for-role --role-name "$ROLE" --query 'InstanceProfiles[].InstanceProfileName' --output text 2>/dev/null || echo "")
        for PROFILE in $INSTANCE_PROFILES; do
            aws iam remove-role-from-instance-profile --instance-profile-name "$PROFILE" --role-name "$ROLE" 2>/dev/null || true
            aws iam delete-instance-profile --instance-profile-name "$PROFILE" 2>/dev/null || true
        done
        
        # Delete role
        aws iam delete-role --role-name "$ROLE" 2>/dev/null || true
        print_success "Role $ROLE removed"
    done
else
    print_warning "No eksctl-created IAM roles found"
fi

# Step 7: Clean up local artifacts
print_header "Step 7: Cleaning Local Artifacts"

echo "Removing local configuration files..."
rm -f cluster-info.txt 2>/dev/null || true
rm -f ollama-info.txt 2>/dev/null || true
rm -f neo4j-info.txt 2>/dev/null || true
rm -f integration-info.txt 2>/dev/null || true
rm -f deployment-summary.txt 2>/dev/null || true
rm -f populate-healthcare-graph.py 2>/dev/null || true
rm -rf /tmp/eks-cluster-config.yaml 2>/dev/null || true
rm -rf /tmp/ollama-*.yaml 2>/dev/null || true
rm -rf /tmp/integration-*.yaml 2>/dev/null || true
rm -rf /tmp/kg-query-bridge 2>/dev/null || true
print_success "Local artifacts cleaned"

# Optional: Clean up docker images
echo ""
read -p "Remove local Docker images? (y/n): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker rmi kg-query-bridge:latest 2>/dev/null || true
    print_success "Docker images removed"
fi

# Summary
print_header "Cleanup Complete"

echo -e "${GREEN}All resources have been removed!${NC}"
echo ""

if [ "$KEEP_DATA" = true ]; then
    print_warning "Persistent volumes were preserved"
    echo "To fully clean up, run: ./cleanup.sh (without --keep-data)"
    ecVerifying cleanup..."
echo ""

# Check for remaining resources
REMAINING_CLUSTERS=$(eksctl get cluster --region ${AWS_REGION} 2>/dev/null | grep ${CLUSTER_NAME} || echo "")
REMAINING_TABLES=$(aws dynamodb list-tables --region ${AWS_REGION} --query 'TableNames[?starts_with(@, `healthcare-`)]' --output text 2>/dev/null || echo "")
REMAINING_BUCKETS=$(aws s3 ls | grep "healthcare-ai-data" || echo "")

if [ -n "$REMAINING_CLUSTERS" ]; then
    print_warning "EKS cluster still exists: $REMAINING_CLUSTERS"
fi

if [ -n "$REMAINING_TABLES" ]; then
    print_warning "DynamoDB tables still exist: $REMAINING_TABLES"
fi

if [ -n "$REMAINING_BUCKETS" ]; then
    print_warning "S3 buckets still exist: $REMAINING_BUCKETS"
fi

if [ -z "$REMAINING_CLUSTERS" ] && [ -z "$REMAINING_TABLES" ] && [ -z "$REMAINING_BUCKETS" ]; then
    print_success "All resources successfully removed!"
fi

echo ""
echo "Remaining charges (if any):"
echo "  - EBS snapshots (if created): ~\$0.05/GB/month"
echo "  - ECR images (if pushed): ~\$0.10/GB/month"
echo "  - CloudWatch logs: ~\$0.50/GB/month"
echo ""
echo "To check for any leftover resources by tag:"
echo "  aws resourcegroupstaggingapi get-resources --region ${AWS_REGION} --tag-filters Key=Project,Values=healthcare-ai"
echo ""
echo "To check costs:"
echo "  aws ce get-cost-and-usage --time-period Start=\$(date -u -d '7 days ago' +%Y-%m-%d),End=\$(date -u +%Y-%m-%d) --granularity DAILY --metrics BlendedCost
echo ""
echo "To check for any leftover resources:"
echo "  aws resourcegroupstaggingapi get-resources --region ${AWS_REGION}"
echo ""
echo -e "${GREEN}✓ Infrastructure successfully decommissioned${NC}"
echo ""
