# AWS Innovation Sandbox Deployment Guide

## Overview

This guide walks you through deploying the Healthcare AI infrastructure to AWS Innovation Sandbox.
It uses proper student identification and federated authentication.

## Prerequisites

Before you begin:

- ✅ Access to AWS Innovation Sandbox (federated account)
- ✅ Your student ID (e.g., `student0001`, `jsmith`, etc.)
- ✅ AWS CLI installed (`aws --version`)
- ✅ kubectl installed (`kubectl version --client`)
- ✅ eksctl installed (`eksctl version`)

## Step 1: Configure AWS SSO Authentication

AWS Innovation Sandbox uses federated authentication (SSO). You need to configure this before deploying.

### Option A: Automated Setup (Recommended)

```bash
cd deployment-scripts
./setup-aws-credentials.sh
```

Follow the prompts:

1. Choose option "2" for Federated/SSO Account
2. Enter your SSO start URL (provided by your instructor)
3. Enter SSO region (usually `us-east-1`)
4. Enter account ID (from your Innovation Sandbox invite)
5. Choose role (usually `PowerUserAccess` or `AdministratorAccess`)
6. Name your profile (e.g., `uo-innovation`)

### Option B: Manual Setup

```bash
# Configure SSO
aws configure sso

# You'll be prompted for:
# - SSO start URL: https://your-org.awsapps.com/start
# - SSO Region: us-east-1
# - Account ID: Your Innovation Sandbox account (e.g., 375523929321)
# - Role name: PowerUserAccess (or AdministratorAccess)
# - CLI profile name: uo-innovation

# Login to SSO
aws sso login --profile uo-innovation

# Set as default profile
export AWS_PROFILE=uo-innovation

# Verify access
aws sts get-caller-identity
```

### Expected Output

```json
{
    "UserId": "AROAXXXXXXXXXX:your-email@example.com",
    "Account": "375523929321",
    "Arn": "arn:aws:sts::375523929321:assumed-role/PowerUserAccess/your-email@example.com"
}
```

## Step 2: Understand Resource Naming

All resources will be tagged with your student information for cost tracking and organization.

### Auto-Generated Names

The deployment scripts automatically generate resource identifiers:

```bash
# Format
STUDENT_ID="your-student-id"
ACCOUNT_ID="375523929321"  # Auto-detected
RESOURCE_GROUP="dataai-account${ACCOUNT_ID}-${STUDENT_ID}"

# Example
STUDENT_ID="jsmith"
RESOURCE_GROUP="dataai-account375523929321-jsmith"
```

### Resource Tags

All created resources will have these tags:

```yaml
Project: healthcare-ai
Environment: innovation-sandbox
ResourceGroup: dataai-account375523929321-jsmith
Owner: jsmith
ManagedBy: eksctl
```

### Resource Names

The deployment creates:

```
EKS Cluster:         ollama-ai-cluster
DynamoDB Tables:     healthcare-patients
                     healthcare-diagnoses
                     healthcare-medications
                     healthcare-providers
                     healthcare-patient-diagnoses
                     healthcare-patient-medications
Neo4j Namespace:     neo4j
Ollama Namespace:    ollama
S3 Bucket:          healthcare-ai-data-${ACCOUNT_ID}-${STUDENT_ID}
```

## Step 3: Pre-Deployment Checklist

Before running the deployment, verify:

### 1. AWS Access

```bash
# Should show your Innovation Sandbox account
aws sts get-caller-identity

# Should show resources in us-east-1
aws ec2 describe-regions --region us-east-1
```

### 2. Permissions Check

You need these IAM permissions:

- ✅ **EKS**: Create/delete clusters, node groups
- ✅ **EC2**: Create VPCs, security groups, instances
- ✅ **IAM**: Create service roles (for IRSA)
- ✅ **DynamoDB**: Create/delete tables
- ✅ **S3**: Create buckets
- ✅ **Bedrock**: Access foundation models
- ✅ **CloudFormation**: Create stacks (for eksctl)

If you get permission errors, contact your instructor.

### 3. Service Quotas

Innovation Sandbox accounts may have limits:

```bash
# Check vCPU quota
aws service-quotas get-service-quota \
    --service-code ec2 \
    --quota-code L-1216C47A \
    --region us-east-1

# Check EKS cluster quota
aws service-quotas get-service-quota \
    --service-code eks \
    --quota-code L-1194D53C \
    --region us-east-1
```

If quotas are too low, request increases through AWS Console.

## Step 4: Run the Deployment

### Full Deployment (Recommended)

```bash
cd deployment-scripts
./deploy-all.sh
```

You'll be prompted for:

1. **Student ID**: Enter your student identifier
   - Use your university ID (e.g., `jsmith`, `student001`)
   - Avoid special characters, use lowercase

2. **Graph Database**: Choose option
   - Option 1: DynamoDB only (~$1/month)
   - Option 2: DynamoDB + Neo4j (~$2-3/month) ⭐ **Recommended**
   - Option 3: DynamoDB + NetworkX (in-memory only)

3. **Confirmation**: Review cost estimate and confirm

### Step-by-Step Deployment

If you prefer manual control:

```bash
cd deployment-scripts

# Step 1: EKS Cluster (20-30 minutes)
export STUDENT_ID="jsmith"
./1-deploy-eks-cluster.sh

# Step 2: Ollama (10-15 minutes)
./2-install-ollama.sh

# Step 2b: Bedrock (2-3 minutes)
./2b-setup-bedrock.sh

# Step 3: DynamoDB (3-5 minutes)
./3-setup-knowledge-graph.sh

# Step 3c: Neo4j (optional, 3-5 minutes)
./3c-install-neo4j-graph.sh

# Step 4: Integration (5-10 minutes)
./4-deploy-integration.sh

# Step 5: S3 Storage (2-3 minutes)
./5-setup-s3-storage.sh
```

### Expected Timeline

| Phase | Duration | Can Work in Parallel |
|-------|----------|---------------------|
| EKS Cluster | 20-30 min | ❌ Must finish first |
| Ollama + Bedrock | 12-18 min | ✅ Can overlap |
| DynamoDB + Neo4j | 6-10 min | ✅ Can overlap |
| Integration | 5-10 min | ❌ Needs prior steps |
| S3 Storage | 2-3 min | ✅ Anytime |
| **Total** | **45-70 min** | |

## Step 5: Verify Deployment

### Check Cluster Status

```bash
# Verify EKS cluster
kubectl get nodes
kubectl get namespaces

# Check Ollama
kubectl get pods -n ollama
kubectl get svc ollama-service -n ollama

# Check Neo4j (if deployed)
kubectl get pods -n neo4j
kubectl get svc neo4j-service -n neo4j
```

### Check AWS Resources

```bash
# DynamoDB tables
aws dynamodb list-tables --region us-east-1

# S3 buckets
aws s3 ls | grep healthcare-ai

# Bedrock model access
aws bedrock list-foundation-models --region us-east-1
```

### Access Services

```bash
# Get LoadBalancer URLs
OLLAMA_URL=$(kubectl get svc ollama-service -n ollama -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
NEO4J_URL=$(kubectl get svc neo4j-service -n neo4j -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

echo "Ollama: http://${OLLAMA_URL}:11434"
echo "Neo4j: http://${NEO4J_URL}:7474"

# Or use port-forwarding
kubectl port-forward -n ollama svc/ollama-service 11434:11434 &
kubectl port-forward -n neo4j svc/neo4j-service 7474:7474 7687:7687 &
```

## Step 6: Load Sample Data

### Import Healthcare Data

```bash
# Install Python dependencies
pip3 install boto3 neo4j

# Load sample data to DynamoDB
cd module-5-synthetic-data
python3 generators/generate_patient_data.py

# Upload to DynamoDB (custom script needed)
python3 upload_to_dynamodb.py

# Import to Neo4j
cd ../deployment-scripts
python3 healthcare_neo4j_loader.py
```

### Test Queries

```bash
# Test Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "What is healthcare AI?",
  "stream": false
}'

# Test Neo4j (open browser)
open http://localhost:7474
# Login: neo4j / healthcare2024
# Run: MATCH (n) RETURN count(n)
```

## Troubleshooting

### Issue: SSO Session Expired

```bash
# Re-login
aws sso login --profile uo-innovation

# Verify
aws sts get-caller-identity
```

### Issue: Permission Denied

```bash
# Check your role
aws sts get-caller-identity | grep Role

# If you see "ReadOnlyAccess", you need PowerUserAccess or Admin role
# Contact your instructor
```

### Issue: Cluster Creation Fails

```bash
# Check eksctl logs
cat ~/.eksctl/logs/*.log

# Common: VPC quota exceeded
aws service-quotas get-service-quota \
    --service-code vpc \
    --quota-code L-F678F1CE \
    --region us-east-1

# Request quota increase if needed
```

### Issue: LoadBalancer Stuck Pending

```bash
# Check ELB status
kubectl describe svc ollama-service -n ollama

# Check AWS ELB console
aws elbv2 describe-load-balancers --region us-east-1

# Common: Account doesn't have ELB permissions
# Workaround: Use port-forwarding instead
kubectl port-forward -n ollama svc/ollama-service 11434:11434
```

### Issue: Can't Access Neo4j Browser

```bash
# Check pod status
kubectl get pods -n neo4j
kubectl logs -n neo4j statefulset/neo4j

# Common: Still initializing (wait 2-3 minutes)
# Or use port-forward
kubectl port-forward -n neo4j svc/neo4j-service 7474:7474
open http://localhost:7474
```

## Cost Management

### Daily Monitoring

```bash
# Check costs
aws ce get-cost-and-usage \
    --time-period Start=2024-01-01,End=2024-01-31 \
    --granularity DAILY \
    --metrics BlendedCost \
    --group-by Type=TAG,Key=Owner

# Set budget alert
aws budgets create-budget \
    --account-id ${ACCOUNT_ID} \
    --budget <budget-config.json>
```

### Expected Costs (Innovation Sandbox)

| Resource | Daily Cost | Monthly Cost |
|----------|------------|--------------|
| EKS Control Plane | $2.40 | $72 |
| GPU Nodes (1x g4dn.xlarge) | $13-15 | $390-450 |
| DynamoDB (on-demand) | $0.10 | $3 |
| Neo4j Storage (10GB) | $0.03 | $1 |
| S3 Storage (10GB) | $0.07 | $2 |
| Bedrock (pay-per-use) | Variable | ~$5-10 |
| **Total** | **$15-18/day** | **$470-540/month** |

### Cost Reduction Tips

1. **Scale down when not in use**:
   ```bash
   # Scale nodes to 0
   eksctl scale nodegroup --cluster=ollama-ai-cluster \
       --name=ai-compute-nodes --nodes=0 --region=us-east-1
   ```

2. **Use smaller GPU instances**:
   ```bash
   export GPU_INSTANCE_TYPE="g4dn.xlarge"  # Instead of g4dn.2xlarge
   ```

3. **Delete cluster after class**:
   ```bash
   ./cleanup.sh
   ```

4. **Use Bedrock instead of Ollama** (cheaper for light usage)

## Cleanup

### Complete Cleanup

```bash
cd deployment-scripts
./cleanup.sh
```

### Manual Cleanup

```bash
# Delete EKS cluster (includes Ollama, Neo4j)
eksctl delete cluster --name=ollama-ai-cluster --region=us-east-1

# Delete DynamoDB tables
for table in $(aws dynamodb list-tables --query 'TableNames[?starts_with(@, `healthcare-`)]' --output text); do
    aws dynamodb delete-table --table-name $table --region us-east-1
done

# Delete S3 bucket
aws s3 rb s3://healthcare-ai-data-${ACCOUNT_ID}-${STUDENT_ID} --force

# Delete IAM roles (created by eksctl)
aws iam list-roles --query 'Roles[?contains(RoleName, `eksctl-ollama-ai-cluster`)].RoleName' --output text | \
    xargs -I {} aws iam delete-role --role-name {}
```

### Verify Cleanup

```bash
# Should return nothing
aws eks list-clusters --region us-east-1
aws dynamodb list-tables --region us-east-1 | grep healthcare
aws s3 ls | grep healthcare
```

## Student Collaboration

### Share Resources in Team

If working in a team, one student deploys, others access:

```bash
# Deployer shares kubeconfig
aws eks update-kubeconfig --name ollama-ai-cluster --region us-east-1

# Copy ~/.kube/config to team members

# Team members can now access
kubectl get pods --all-namespaces
```

### Resource Isolation

Each student should use unique identifiers:

```bash
# Student 1
export STUDENT_ID="alice"
export CLUSTER_NAME="ollama-ai-cluster-alice"

# Student 2
export STUDENT_ID="bob"
export CLUSTER_NAME="ollama-ai-cluster-bob"
```

## Best Practices

### ✅ Do

- Use lowercase student IDs (no spaces/special chars)
- Tag all resources with your student ID
- Monitor costs daily
- Delete resources when done
- Share access with team members
- Document your configuration
- Back up important data
- Test with small datasets first

### ❌ Don't

- Leave clusters running overnight (unless needed)
- Use production data
- Share AWS credentials
- Exceed budget limits
- Deploy without understanding costs
- Mix multiple projects in one cluster
- Forget to clean up after semester

## Support

### Getting Help

1. **Check logs**:
   ```bash
   kubectl logs <pod-name> -n <namespace>
   ```

2. **Review AWS CloudFormation events**:
   ```bash
   aws cloudformation describe-stack-events \
       --stack-name eksctl-ollama-ai-cluster-cluster
   ```

3. **Contact instructor** with:
   - Your student ID
   - AWS account ID
   - Error messages
   - What you were trying to do

### Common Questions

**Q: Can I use us-west-2 instead of us-east-1?**  
A: Yes, but Bedrock availability varies by region. Check: [Bedrock Regions](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html#bedrock-regions)

**Q: Can multiple students share one cluster?**  
A: Yes! Use namespaces:
```bash
kubectl create namespace student-${STUDENT_ID}
```

**Q: What if I run out of Innovation Sandbox credits?**  
A: Contact your instructor. You may need to request extension or use local setup (Ollama only).

**Q: Can I deploy without GPU nodes?**  
A: Yes, but Ollama performance will be very slow. Use Bedrock instead:
```bash
export GPU_NODE_COUNT=0
```

## Next Steps

After successful deployment:

1. ✅ Complete [Module 5: Synthetic Data](../module-5-synthetic-data/README.md)
2. ✅ Load data into Neo4j for graph queries
3. ✅ Try [Module 6: LLM Fine-Tuning](../module-6-llm-training/README.md)
4. ✅ Build healthcare AI applications
5. ✅ Experiment with RAG patterns
6. ✅ Document your findings

---

**Ready to Deploy?**

```bash
cd deployment-scripts
./setup-aws-credentials.sh  # First time only
./deploy-all.sh             # Full deployment
```

**Estimated Time**: 45-70 minutes  
**Estimated Cost**: $15-18/day

Good luck! 🚀
