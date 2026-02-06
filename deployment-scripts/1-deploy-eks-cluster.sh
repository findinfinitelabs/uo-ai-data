#!/bin/bash

# EKS Cluster Deployment Script for Healthcare AI
# This script automates the deployment of an EKS cluster with GPU support

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLUSTER_NAME="${CLUSTER_NAME:-ollama-ai-cluster}"
REGION="${AWS_REGION:-us-east-1}"
K8S_VERSION="${K8S_VERSION:-1.28}"
GPU_INSTANCE_TYPE="${GPU_INSTANCE_TYPE:-g4dn.xlarge}"
GPU_NODE_COUNT="${GPU_NODE_COUNT:-1}"  # Reduced to 1 for small/medium cluster

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}EKS Cluster Deployment for Healthcare AI${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "  Cluster Name: $CLUSTER_NAME"
echo "  Region: $REGION"
echo "  Kubernetes Version: $K8S_VERSION"
echo "  GPU Instance Type: $GPU_INSTANCE_TYPE"
echo "  GPU Node Count: $GPU_NODE_COUNT"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
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
    print_error "AWS CLI is not installed. Please install it first:"
    echo "  https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi
print_status "AWS CLI installed"

if ! command_exists kubectl; then
    print_error "kubectl is not installed. Installing now..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install kubectl
    else
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
        rm kubectl
    fi
fi
print_status "kubectl installed"

if ! command_exists eksctl; then
    print_error "eksctl is not installed. Installing now..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install eksctl
    else
        curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
        sudo mv /tmp/eksctl /usr/local/bin
    fi
fi
print_status "eksctl installed"

# Step 2: Verify AWS Credentials
echo ""
echo -e "${BLUE}Step 2: Verifying AWS Credentials${NC}"

if ! aws sts get-caller-identity &>/dev/null; then
    print_error "AWS credentials are not configured"
    echo ""
    echo "Please run: aws configure"
    echo "Enter your AWS Access Key ID and Secret Access Key"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
print_status "AWS credentials verified"
echo "  Account: $AWS_ACCOUNT"
echo "  User/Role: $AWS_USER"

# Step 3: Create Cluster Configuration
echo ""
echo -e "${BLUE}Step 3: Creating Cluster Configuration${NC}"

cat > /tmp/eks-cluster-config.yaml <<EOF
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: ${CLUSTER_NAME}
  region: ${REGION}
  version: "${K8S_VERSION}"

vpc:
  cidr: "10.0.0.0/16"
  nat:
    gateway: HighlyAvailable

managedNodeGroups:
  - name: ai-compute-nodes
    instanceType: ${GPU_INSTANCE_TYPE}
    minSize: 1
    maxSize: 3
    desiredCapacity: ${GPU_NODE_COUNT}
    volumeSize: 100
    ssh:
      allow: true
    labels:
      workload: ai-inference
    tags:
      Environment: innovation-sandbox
      Project: healthcare-ai
      ManagedBy: eksctl

  - name: general-nodes
    instanceType: t3.medium
    minSize: 1
    maxSize: 2
    desiredCapacity: 1
    volumeSize: 30
    tags:
      Environment: innovation-sandbox
      Project: healthcare-ai

iam:
  withOIDC: true

addons:
  - name: vpc-cni
  - name: coredns
  - name: kube-proxy
EOF

print_status "Cluster configuration created at /tmp/eks-cluster-config.yaml"

# Step 4: Estimate Costs
echo ""
echo -e "${BLUE}Step 4: Cost Estimate${NC}"
print_warning "GPU instances (${GPU_INSTANCE_TYPE}) cost approximately \$0.526/hour per node"
print_warning "With ${GPU_NODE_COUNT} GPU nodes + 1 general node, estimated cost: ~\$15-20/day (small cluster)"
print_warning "Make sure you have sufficient Innovation Sandbox credits!"
echo ""
echo -e "${GREEN}💡 This is a small/medium cluster optimized for development and testing${NC}"
echo ""
read -p "Continue with deployment? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy](es)?$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Step 5: Deploy Cluster
echo ""
echo -e "${BLUE}Step 5: Deploying EKS Cluster${NC}"
echo "This will take 15-20 minutes..."
echo ""

if eksctl create cluster -f /tmp/eks-cluster-config.yaml; then
    print_status "EKS cluster created successfully!"
else
    print_error "Failed to create EKS cluster"
    exit 1
fi

# Step 6: Update kubeconfig
echo ""
echo -e "${BLUE}Step 6: Updating kubeconfig${NC}"

aws eks update-kubeconfig --region ${REGION} --name ${CLUSTER_NAME}
print_status "kubeconfig updated"

# Step 7: Verify Cluster
echo ""
echo -e "${BLUE}Step 7: Verifying Cluster${NC}"

kubectl get nodes
print_status "Cluster nodes are ready"

kubectl get namespaces
print_status "Default namespaces created"

# Step 8: Install NVIDIA Device Plugin
echo ""
echo -e "${BLUE}Step 8: Installing NVIDIA Device Plugin for GPU Support${NC}"

kubectl create -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.14.0/nvidia-device-plugin.yml

echo "Waiting for NVIDIA plugin to be ready..."
sleep 30

if kubectl get pods -n kube-system | grep nvidia-device-plugin | grep Running &>/dev/null; then
    print_status "NVIDIA device plugin installed successfully"
    
    # Verify GPU availability
    GPU_COUNT=$(kubectl get nodes -o json | jq -r '.items[].status.allocatable."nvidia.com/gpu"' | grep -v null | wc -l)
    print_status "GPU nodes available: $GPU_COUNT"
else
    print_warning "NVIDIA plugin may still be starting. Check with: kubectl get pods -n kube-system | grep nvidia"
fi

# Step 9: Save Cluster Info
echo ""
echo -e "${BLUE}Step 9: Saving Cluster Information${NC}"

cat > cluster-info.txt <<EOF
EKS Cluster Information
========================
Cluster Name: ${CLUSTER_NAME}
Region: ${REGION}
Kubernetes Version: ${K8S_VERSION}
Created: $(date)

AWS Account: ${AWS_ACCOUNT}
AWS User/Role: ${AWS_USER}

Nodes:
$(kubectl get nodes)

To access this cluster later, run:
  aws eks update-kubeconfig --region ${REGION} --name ${CLUSTER_NAME}

To delete this cluster when done:
  eksctl delete cluster --name ${CLUSTER_NAME} --region ${REGION}

Next Steps:
  1. Run: ./2-install-ollama.sh
  2. Run: ./3-setup-knowledge-graph.sh
  3. Run: ./4-deploy-integration.sh
EOF

print_status "Cluster information saved to cluster-info.txt"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}EKS Cluster Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Cluster Details:"
echo "  Name: ${CLUSTER_NAME}"
echo "  Region: ${REGION}"
echo "  GPU Nodes: ${GPU_NODE_COUNT} x ${GPU_INSTANCE_TYPE}"
echo ""
echo "Next: Run ./2-install-ollama.sh to install Ollama on your cluster"
echo ""
