#!/bin/bash

#####################################################################
# Healthcare AI Infrastructure - Verification Script
# 
# This script verifies all components are running correctly
#
# Usage: ./verify-deployment.sh
#####################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
CLUSTER_NAME="${CLUSTER_NAME:-ollama-ai-cluster}"
AWS_REGION="${AWS_REGION:-us-east-1}"

print_header() {
    echo ""
    echo -e "${BOLD}${BLUE}========================================${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}========================================${NC}"
    echo ""
}

print_test() {
    echo -e "${BLUE}Testing:${NC} $1"
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC} $1"
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ WARN${NC} $1"
}

# Test counters
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

print_header "Healthcare AI Infrastructure Verification"

# Check 1: kubectl connectivity
print_test "Kubectl connectivity"
if kubectl cluster-info &>/dev/null; then
    print_pass "Connected to Kubernetes cluster"
    ((PASS_COUNT++))
else
    print_fail "Cannot connect to Kubernetes cluster"
    ((FAIL_COUNT++))
    echo "Run: aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"
    exit 1
fi

# Check 2: Cluster nodes
print_test "EKS cluster nodes"
NODES=$(kubectl get nodes --no-headers 2>/dev/null | wc -l | tr -d ' ')
READY_NODES=$(kubectl get nodes --no-headers 2>/dev/null | grep -c "Ready" || echo "0")
if [ "$READY_NODES" -ge 1 ]; then
    print_pass "Cluster has ${READY_NODES}/${NODES} ready nodes"
    ((PASS_COUNT++))
else
    print_fail "No ready nodes found"
    ((FAIL_COUNT++))
fi

# Check 3: GPU availability
print_test "GPU nodes"
GPU_NODES=$(kubectl get nodes -o json 2>/dev/null | jq -r '.items[].status.allocatable."nvidia.com/gpu"' | grep -v null | wc -l | tr -d ' ')
if [ "$GPU_NODES" -ge 1 ]; then
    print_pass "${GPU_NODES} GPU node(s) available"
    ((PASS_COUNT++))
else
    print_warning "No GPU nodes detected"
    ((WARN_COUNT++))
fi

# Check 4: Ollama namespace
print_test "Ollama namespace"
if kubectl get namespace ollama &>/dev/null; then
    print_pass "Namespace 'ollama' exists"
    ((PASS_COUNT++))
else
    print_fail "Namespace 'ollama' not found"
    ((FAIL_COUNT++))
fi

# Check 5: Ollama deployment
print_test "Ollama deployment"
OLLAMA_PODS=$(kubectl get pods -n ollama -l app=ollama --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$OLLAMA_PODS" -ge 1 ]; then
    print_pass "${OLLAMA_PODS} Ollama pod(s) running"
    ((PASS_COUNT++))
else
    print_fail "No Ollama pods running"
    ((FAIL_COUNT++))
fi

# Check 6: Ollama service
print_test "Ollama service"
if kubectl get svc ollama-service -n ollama &>/dev/null; then
    OLLAMA_LB=$(kubectl get svc ollama-service -n ollama -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
    if [ -n "$OLLAMA_LB" ]; then
        print_pass "Ollama service accessible at ${OLLAMA_LB}:11434"
        ((PASS_COUNT++))
    else
        print_warning "Ollama service exists but LoadBalancer not ready"
        ((WARN_COUNT++))
    fi
else
    print_fail "Ollama service not found"
    ((FAIL_COUNT++))
fi

# Check 7: Ollama API
print_test "Ollama API"
POD=$(kubectl get pods -n ollama -l app=ollama -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD" ]; then
    if kubectl exec -n ollama ${POD} -- wget -q -O- http://localhost:11434 &>/dev/null; then
        print_pass "Ollama API responding"
        ((PASS_COUNT++))
    else
        print_fail "Ollama API not responding"
        ((FAIL_COUNT++))
    fi
else
    print_fail "Cannot find Ollama pod for API test"
    ((FAIL_COUNT++))
fi

# Check 8: Ollama models
print_test "Ollama models"
if [ -n "$POD" ]; then
    MODELS=$(kubectl exec -n ollama ${POD} -- ollama list 2>/dev/null | tail -n +2 | wc -l | tr -d ' ')
    if [ "$MODELS" -ge 1 ]; then
        print_pass "${MODELS} model(s) available"
        kubectl exec -n ollama ${POD} -- ollama list 2>/dev/null | tail -n +2 | while read line; do
            echo "    - $line"
        done
        ((PASS_COUNT++))
    else
        print_warning "No models downloaded yet"
        ((WARN_COUNT++))
    fi
fi

# Check 9: Neo4j namespace
print_test "Neo4j namespace"
if kubectl get namespace neo4j &>/dev/null; then
    print_pass "Namespace 'neo4j' exists"
    ((PASS_COUNT++))
else
    print_fail "Namespace 'neo4j' not found"
    ((FAIL_COUNT++))
fi

# Check 10: Neo4j deployment
print_test "Neo4j deployment"
NEO4J_PODS=$(kubectl get pods -n neo4j -l app=neo4j --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$NEO4J_PODS" -ge 1 ]; then
    print_pass "Neo4j pod running"
    ((PASS_COUNT++))
else
    print_fail "Neo4j pod not running"
    ((FAIL_COUNT++))
fi

# Check 11: Neo4j service
print_test "Neo4j service"
if kubectl get svc neo4j-healthcare -n neo4j &>/dev/null; then
    NEO4J_LB=$(kubectl get svc neo4j-healthcare -n neo4j -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
    if [ -n "$NEO4J_LB" ]; then
        print_pass "Neo4j accessible at ${NEO4J_LB}:7474"
        ((PASS_COUNT++))
    else
        print_warning "Neo4j service exists but LoadBalancer not ready"
        ((WARN_COUNT++))
    fi
else
    print_fail "Neo4j service not found"
    ((FAIL_COUNT++))
fi

# Check 12: Neo4j data
print_test "Neo4j data"
NEO4J_POD=$(kubectl get pods -n neo4j -l app=neo4j -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$NEO4J_POD" ]; then
    NODE_COUNT=$(kubectl exec -n neo4j ${NEO4J_POD} -- cypher-shell -u neo4j -p "${NEO4J_PASSWORD:-ChangeMe123!}" "MATCH (n) RETURN count(n)" 2>/dev/null | tail -1 | tr -d ' ' || echo "0")
    if [ "$NODE_COUNT" -gt 0 ]; then
        print_pass "Knowledge graph has ${NODE_COUNT} nodes"
        ((PASS_COUNT++))
    else
        print_warning "Knowledge graph is empty"
        ((WARN_COUNT++))
    fi
else
    print_fail "Cannot access Neo4j pod for data check"
    ((FAIL_COUNT++))
fi

# Check 13: Integration service
print_test "Integration service deployment"
BRIDGE_PODS=$(kubectl get pods -n ollama -l app=kg-query-bridge --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$BRIDGE_PODS" -ge 1 ]; then
    print_pass "${BRIDGE_PODS} query bridge pod(s) running"
    ((PASS_COUNT++))
else
    print_fail "Query bridge not running"
    ((FAIL_COUNT++))
fi

# Check 14: Integration API
print_test "Integration API"
BRIDGE_POD=$(kubectl get pods -n ollama -l app=kg-query-bridge -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$BRIDGE_POD" ]; then
    HEALTH=$(kubectl exec -n ollama ${BRIDGE_POD} -- wget -q -O- http://localhost:8080/health 2>/dev/null || echo "")
    if [ -n "$HEALTH" ]; then
        print_pass "Integration API responding"
        ((PASS_COUNT++))
    else
        print_fail "Integration API not responding"
        ((FAIL_COUNT++))
    fi
else
    print_fail "Cannot find integration pod"
    ((FAIL_COUNT++))
fi

# Summary
print_header "Verification Summary"

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT + WARN_COUNT))
echo "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASS_COUNT}${NC}"
echo -e "${YELLOW}Warnings: ${WARN_COUNT}${NC}"
echo -e "${RED}Failed: ${FAIL_COUNT}${NC}"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✓ All critical checks passed!${NC}"
    echo ""
    echo "Your healthcare AI infrastructure is fully operational."
    echo ""
    echo "Access URLs:"
    echo "  Ollama:  http://${OLLAMA_LB:-localhost}:11434"
    echo "  Neo4j:   http://${NEO4J_LB:-localhost}:7474"
    echo "  Bridge:  http://$(kubectl get svc kg-query-bridge -n ollama -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo localhost):8080"
    exit 0
elif [ "$FAIL_COUNT" -le 2 ]; then
    echo -e "${YELLOW}${BOLD}⚠ Some checks failed, but core services may be operational${NC}"
    echo ""
    echo "Review the failures above and run diagnostics if needed."
    exit 1
else
    echo -e "${RED}${BOLD}✗ Multiple critical failures detected${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Check pod logs: kubectl logs -n <namespace> <pod-name>"
    echo "  2. Check events: kubectl get events -n <namespace> --sort-by='.lastTimestamp'"
    echo "  3. Review deployment status: kubectl get all -n <namespace>"
    echo "  4. Check deployment logs in deployment-*.log files"
    exit 1
fi
