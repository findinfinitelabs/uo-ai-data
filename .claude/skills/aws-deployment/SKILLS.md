# AWS Innovation Studio Deployment Skill

## Overview

Guidelines for deploying healthcare AI infrastructure on AWS, specifically for AWS Innovation Studio (formerly Sandbox) environments used in educational settings.

## AWS Authentication

### SSO/Federated Accounts

For AWS Innovation Studio accounts (like account `375523929321`):

```bash
# Configure SSO
aws configure sso

# Required prompts:
# - SSO start URL: https://your-org.awsapps.com/start
# - SSO region: us-east-1
# - Account ID: Your AWS account number
# - Role name: PowerUserAccess or AdministratorAccess
# - Profile name: Choose a memorable name (e.g., uo-innovation)

# Login before each session
aws sso login --profile uo-innovation

# Set profile for deployment
export AWS_PROFILE=uo-innovation
```

### Verify Authentication

Always verify credentials before deployment:

```bash
# Check current identity
aws sts get-caller-identity

# Should return:
# {
#     "UserId": "...",
#     "Account": "375523929321",
#     "Arn": "arn:aws:sts::375523929321:assumed-role/..."
# }
```

### Session Management

SSO sessions expire, typically after 8-12 hours:

```bash
# Check if session is valid
aws sts get-caller-identity 2>/dev/null || echo "Session expired"

# Refresh session
aws sso login --profile uo-innovation
```

## EKS Cluster Deployment

### Pre-Deployment Checklist

Before deploying an EKS cluster:

- [ ] AWS CLI configured with valid credentials
- [ ] `kubectl` installed (v1.27+)
- [ ] `eksctl` installed (v0.150+)
- [ ] Sufficient AWS credits/budget
- [ ] Required IAM permissions (EKS, EC2, VPC, IAM)
- [ ] Region selected (prefer `us-east-1` for Bedrock availability)

### Cost Estimation

**Base Infrastructure Costs (per day):**

- EKS Control Plane: $3.60/day ($0.15/hour)
- GPU Nodes (2x g4dn.xlarge): $23-26/day
- Storage (EBS, 50GB): $0.40/day
- Network Transfer: Variable
- **Total Base: ~$27-30/day**

**Usage-Based Costs:**

- AWS Bedrock: Pay per token (varies by model)
- DynamoDB: Pay per request/storage
- Data Transfer: Pay for egress

### Deployment Command

```bash
# Single-command deployment
chmod +x deploy-all.sh
./deploy-all.sh

# Manual step-by-step
./1-deploy-eks-cluster.sh      # ~20-30 minutes
./2-install-ollama.sh           # ~10-15 minutes
./2b-setup-bedrock.sh           # ~2-3 minutes
./3-setup-knowledge-graph.sh   # ~3-5 minutes
./4-deploy-integration.sh      # ~5-10 minutes
```

### Configuration Variables

```bash
# Customize deployment
export CLUSTER_NAME="healthcare-ai-cluster"
export AWS_REGION="us-east-1"
export GPU_NODE_COUNT=2
export OLLAMA_NAMESPACE="ollama"
export TABLE_PREFIX="healthcare"

# Then deploy
./deploy-all.sh
```

## GPU Node Configuration

### Node Types

Recommended GPU instances for AI workloads:

- **g4dn.xlarge** - 1x NVIDIA T4, 16GB GPU RAM (Cost-effective)
- **g4dn.2xlarge** - 1x NVIDIA T4, 32GB GPU RAM (Better for large models)
- **g5.xlarge** - 1x NVIDIA A10G, 24GB GPU RAM (Newer generation)

### GPU Resource Allocation

```yaml
# Ollama pod configuration
resources:
  requests:
    nvidia.com/gpu: 1
    memory: "8Gi"
    cpu: "2"
  limits:
    nvidia.com/gpu: 1
    memory: "16Gi"
    cpu: "4"
```

## AWS Bedrock Integration

### Enabling Bedrock Access

1. **Enable in Console** (one-time setup):
   - AWS Console → Bedrock → Model access
   - Request access to models (Claude, Llama, Mistral)
   - Wait for approval (usually instant for Innovation Studio)

2. **Grant IAM Permissions**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    }
  ]
}
```

3. **Test Access**:

```bash
aws bedrock list-foundation-models --region us-east-1
```

### Bedrock Model Selection

Available models and use cases:

- **Claude 3 Sonnet** - Best for complex reasoning, healthcare context
- **Claude 3 Haiku** - Fast, cost-effective for simple tasks
- **Llama 2** - Open weights, good for fine-tuning
- **Mistral** - Strong performance, efficient

## DynamoDB Table Setup

### Table Configuration

For healthcare data storage:

```bash
# Create patient records table
aws dynamodb create-table \
  --table-name healthcare-patients \
  --attribute-definitions \
    AttributeName=patient_id,AttributeType=S \
  --key-schema \
    AttributeName=patient_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Best Practices

- Use **PAY_PER_REQUEST** billing for variable workloads
- Set **TTL** for temporary data
- Enable **encryption at rest**
- Use **point-in-time recovery** for production
- Tag tables for cost tracking

## Monitoring and Cost Management

### Essential Monitoring

```bash
# Check cluster status
kubectl get nodes
kubectl top nodes

# Check pod status
kubectl get pods -n ollama
kubectl logs -n ollama deployment/ollama

# Check costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### Cost Optimization

**Immediate savings:**

- Scale down GPU nodes when not in use
- Use spot instances for non-critical workloads
- Delete unused EBS volumes
- Stop clusters overnight (educational use)

**Long-term savings:**

- Use Reserved Instances for production
- Implement auto-scaling
- Monitor and optimize DynamoDB usage
- Archive old data to S3

## Cleanup and Teardown

### Complete Cleanup

```bash
# Run cleanup script
chmod +x cleanup.sh
./cleanup.sh

# Manual cleanup if needed
eksctl delete cluster --name healthcare-ai-cluster --region us-east-1

# Verify all resources deleted
aws ec2 describe-instances --region us-east-1
aws dynamodb list-tables --region us-east-1
```

### Partial Cleanup

Stop GPU nodes but keep cluster:

```bash
# Scale down to 0 nodes
eksctl scale nodegroup \
  --cluster healthcare-ai-cluster \
  --name gpu-nodes \
  --nodes 0 \
  --region us-east-1
```

## Troubleshooting

### Common Issues

**Issue: SSO session expired**
```bash
# Solution: Re-login
aws sso login --profile uo-innovation
```

**Issue: EKS cluster creation fails**
```bash
# Check IAM permissions
aws sts get-caller-identity
aws iam get-user

# Check service quotas
aws service-quotas get-service-quota \
  --service-code eks \
  --quota-code L-1194D53C
```

**Issue: GPU pods not scheduling**
```bash
# Verify GPU nodes exist
kubectl get nodes -l node.kubernetes.io/instance-type=g4dn.xlarge

# Check NVIDIA device plugin
kubectl get pods -n kube-system | grep nvidia
```

**Issue: Bedrock access denied**
```bash
# Verify model access enabled in console
aws bedrock list-foundation-models --region us-east-1

# Check IAM policy attached
aws iam list-attached-user-policies --user-name YOUR_USER
```

## Security Best Practices

### For Educational Environments

- ✅ Use IAM roles, not access keys
- ✅ Enable CloudTrail logging
- ✅ Encrypt data at rest (Bedrock, DynamoDB)
- ✅ Use VPC for network isolation
- ✅ Regular credential rotation (SSO handles this)
- ✅ Tag all resources with project/student info

### For Production

- Enable AWS Config for compliance
- Implement least-privilege access
- Use AWS KMS for encryption
- Enable VPC Flow Logs
- Implement backup and disaster recovery
- Set up AWS GuardDuty for threat detection

## Innovation Studio Specific Notes

### Budget Alerts

Set up billing alerts to avoid credit exhaustion:

```bash
aws budgets create-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget file://budget-config.json
```

### Resource Limits

Innovation Studio accounts may have:

- Limited vCPU quotas (request increases if needed)
- Restricted regions (usually us-east-1, us-west-2)
- Time-bound access (semester/course duration)
- Model access restrictions (request specific models)

### Best Practices for Students

- Clean up resources after each session
- Share clusters within teams
- Use smaller models for testing
- Schedule intensive training for off-hours
- Monitor costs daily
- Document all deployments for reproducibility
