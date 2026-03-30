#!/bin/bash

# Ollama Installation Script for EKS
# Deploys Ollama with GPU support on your EKS cluster

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NAMESPACE="${OLLAMA_NAMESPACE:-ollama}"
# Changed default replicas from 2 to 1.
OLLAMA_REPLICAS="${OLLAMA_REPLICAS:-1}"
STORAGE_SIZE="${STORAGE_SIZE:-50Gi}"
OLLAMA_VERSION="${OLLAMA_VERSION:-latest}"
AWS_REGION="${AWS_REGION:-us-west-2}"
USE_GPU="${USE_GPU:-false}"
SKIP_CONFIRMATION="${SKIP_CONFIRMATION:-false}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Ollama Installation on EKS${NC}"
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

# Step 1: Verify Prerequisites
echo -e "${BLUE}Step 1: Verifying Prerequisites${NC}"

if ! command_exists kubectl; then
    print_error "kubectl is not installed"
    exit 1
fi
print_status "kubectl installed"

if ! kubectl cluster-info &>/dev/null; then
    print_error "Not connected to any Kubernetes cluster"
    # FIX: Replaced hardcoded us-east-1 with ${AWS_REGION} variable.
    echo "Run: aws eks update-kubeconfig --region ${AWS_REGION} --name ollama-ai-cluster"
    exit 1
fi
print_status "Connected to Kubernetes cluster"

# Step 2: Create Namespace
echo ""
echo -e "${BLUE}Step 2: Creating Namespace${NC}"

if kubectl get namespace ${NAMESPACE} &>/dev/null; then
    print_warning "Namespace ${NAMESPACE} already exists"
else
    kubectl create namespace ${NAMESPACE}
    print_status "Namespace ${NAMESPACE} created"
fi

kubectl config set-context --current --namespace=${NAMESPACE}
print_status "Default namespace set to ${NAMESPACE}"

# Step 3: Create Persistent Volume Claim
echo ""
echo -e "${BLUE}Step 3: Creating Persistent Storage for Models${NC}"

cat > /tmp/ollama-pvc.yaml <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ollama-models
  namespace: ${NAMESPACE}
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp2
  resources:
    requests:
      storage: ${STORAGE_SIZE}
EOF

kubectl apply -f /tmp/ollama-pvc.yaml
print_status "Persistent volume claim created (${STORAGE_SIZE})"

# Wait for PVC to bind
echo "Waiting for PVC to bind..."
kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/ollama-models -n ${NAMESPACE} --timeout=60s || true
print_status "Storage ready"

# Step 4: Deploy Ollama
echo ""
echo -e "${BLUE}Step 4: Deploying Ollama${NC}"

# GPU resource requests, nodeSelector, and tolerations are now
# conditional on USE_GPU=true.
if [ "$USE_GPU" = "true" ]; then
    RESOURCE_BLOCK="        resources:
          requests:
            memory: \"4Gi\"
            cpu: \"2\"
            nvidia.com/gpu: \"1\"
          limits:
            memory: \"8Gi\"
            cpu: \"4\"
            nvidia.com/gpu: \"1\""
    SCHEDULING_BLOCK="      nodeSelector:
        workload: ai-inference
      tolerations:
      - key: nvidia.com/gpu
        operator: Exists
        effect: NoSchedule"
else
    RESOURCE_BLOCK="        resources:
          requests:
            memory: \"8Gi\"
            cpu: \"2\"
          limits:
            memory: \"12Gi\"
            cpu: \"4\""
    SCHEDULING_BLOCK=""
fi

cat > /tmp/ollama-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: ${NAMESPACE}
  labels:
    app: ollama
spec:
  replicas: ${OLLAMA_REPLICAS}
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
      - name: ollama
        image: ollama/ollama:${OLLAMA_VERSION}
        ports:
        - containerPort: 11434
          name: http
          protocol: TCP
        env:
        - name: OLLAMA_HOST
          value: "0.0.0.0:11434"
        - name: OLLAMA_ORIGINS
          value: "*"
        volumeMounts:
        - name: ollama-models
          mountPath: /root/.ollama
${RESOURCE_BLOCK}
        livenessProbe:
          httpGet:
            path: /
            port: 11434
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /
            port: 11434
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
      volumes:
      - name: ollama-models
        persistentVolumeClaim:
          claimName: ollama-models
${SCHEDULING_BLOCK}
---
apiVersion: v1
kind: Service
metadata:
  name: ollama-service
  namespace: ${NAMESPACE}
  labels:
    app: ollama
spec:
  selector:
    app: ollama
  ports:
    - protocol: TCP
      port: 11434
      targetPort: 11434
      name: http
  type: LoadBalancer
  # Removed sessionAffinity: ClientIP. The classic AWS load balancer
  # does not support ClientIP affinity and will fail to provision with
  # "unsupported load balancer affinity: ClientIP" error.
EOF

kubectl apply -f /tmp/ollama-deployment.yaml
print_status "Ollama deployment created"

# Step 5: Wait for Deployment
echo ""
echo -e "${BLUE}Step 5: Waiting for Ollama to be Ready${NC}"
echo "This may take a few minutes..."

kubectl rollout status deployment/ollama -n ${NAMESPACE} --timeout=5m
print_status "Ollama pods are running"

# Step 6: Verify Service
echo ""
echo -e "${BLUE}Step 6: Verifying Service${NC}"

echo "Waiting for LoadBalancer to be ready..."
sleep 20

LB_HOSTNAME=$(kubectl get svc ollama-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
LB_IP=$(kubectl get svc ollama-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -n "$LB_HOSTNAME" ]; then
    OLLAMA_URL="http://${LB_HOSTNAME}:11434"
    print_status "Ollama accessible at: $OLLAMA_URL"
elif [ -n "$LB_IP" ]; then
    OLLAMA_URL="http://${LB_IP}:11434"
    print_status "Ollama accessible at: $OLLAMA_URL"
else
    print_warning "LoadBalancer not ready yet. Check with: kubectl get svc -n ${NAMESPACE}"
    OLLAMA_URL="http://localhost:11434"
fi

# Step 7: Download AI Models
echo ""
echo -e "${BLUE}Step 7: Downloading AI Models${NC}"
echo ""
echo "Model strategy for this class:"
echo "  - Mistral 7B (~4.1GB) is the only required model."
echo "  - It serves as the Ollama fallback backend when Bedrock is unavailable."
echo "  - AWS Bedrock (Claude 3 Haiku) is the primary LLM for all coursework."
echo ""

# Get first pod name
POD_NAME=$(kubectl get pods -n ${NAMESPACE} -l app=ollama -o jsonpath='{.items[0].metadata.name}')
print_status "Using pod: $POD_NAME"

echo "Pulling Mistral 7B..."
if kubectl exec -n ${NAMESPACE} ${POD_NAME} -- ollama pull mistral; then
    print_status "Mistral model downloaded (~4.1GB)"
else
    print_warning "Failed to download Mistral — check pod logs:"
    echo "  kubectl logs -n ${NAMESPACE} ${POD_NAME}"
fi

# Optional small model for experimentation — safe disk footprint
if [ "$SKIP_CONFIRMATION" = false ]; then
    echo ""
    echo "Optional: phi3 (~2.3GB) and llama3.2 (~2GB) are small enough to"
    echo "coexist with Mistral if students want to compare models."
    read -p "Download phi3 as an optional second model? (y/n): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pulling phi3..."
        if kubectl exec -n ${NAMESPACE} ${POD_NAME} -- ollama pull phi3; then
            print_status "phi3 model downloaded"
        else
            print_warning "Failed to download phi3"
        fi
    fi
fi

# Step 8: Test Ollama
echo ""
echo -e "${BLUE}Step 8: Testing Ollama${NC}"

echo "Available models:"
kubectl exec -n ${NAMESPACE} ${POD_NAME} -- ollama list

echo ""
echo "Testing Mistral model..."
TEST_RESPONSE=$(kubectl exec -n ${NAMESPACE} ${POD_NAME} -- ollama run mistral "What is a knowledge graph? Answer in one sentence." 2>/dev/null || echo "Test failed")
echo "Response: $TEST_RESPONSE"

if [[ "$TEST_RESPONSE" != "Test failed" ]]; then
    print_status "Ollama is working correctly!"
else
    print_warning "Ollama test did not complete successfully"
fi

# Step 9: Save Configuration
echo ""
echo -e "${BLUE}Step 9: Saving Configuration${NC}"

cat > ollama-info.txt <<EOF
Ollama Deployment Information
==============================
Namespace: ${NAMESPACE}
Replicas: ${OLLAMA_REPLICAS}
Storage: ${STORAGE_SIZE}
GPU Enabled: ${USE_GPU}
Deployed: $(date)

Service URL: ${OLLAMA_URL}

Installed Models:
$(kubectl exec -n ${NAMESPACE} ${POD_NAME} -- ollama list 2>/dev/null || echo "Check with: kubectl exec -n ${NAMESPACE} ${POD_NAME} -- ollama list")

Useful Commands:
================

# List all models
kubectl exec -n ${NAMESPACE} ${POD_NAME} -- ollama list

# Pull a new model
kubectl exec -n ${NAMESPACE} ${POD_NAME} -- ollama pull <model-name>

# Run a model interactively
kubectl exec -it -n ${NAMESPACE} ${POD_NAME} -- ollama run mistral

# View logs
kubectl logs -n ${NAMESPACE} -l app=ollama --tail=100

# Port forward for local access
kubectl port-forward -n ${NAMESPACE} svc/ollama-service 11434:11434

# Test API locally (after port-forward)
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Why is healthcare data compliance important?",
  "stream": false
}'

Next Steps:
===========
Run: ./3-setup-knowledge-graph.sh
EOF

print_status "Configuration saved to ollama-info.txt"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Ollama Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Service URL: ${OLLAMA_URL}"
echo "Namespace: ${NAMESPACE}"
echo "Pods: ${OLLAMA_REPLICAS}"
if [ "$USE_GPU" = "true" ]; then
    echo "GPU: Enabled"
else
    echo "GPU: Disabled (CPU-only)"
fi
echo ""
echo "To access locally:"
echo "  kubectl port-forward -n ${NAMESPACE} svc/ollama-service 11434:11434"
echo ""
echo "Next: Run ./3-setup-knowledge-graph.sh to deploy Neo4j"
echo ""