# Healthcare AI Infrastructure Deployment Scripts

Automated deployment scripts for setting up a complete AI infrastructure on AWS EKS
with dual LLM backends (Ollama + Bedrock) and DynamoDB for healthcare data.

## 📋 Prerequisites

Before running these scripts, ensure you have:

- **AWS Account**: AWS Innovation Sandbox access with sufficient credits
- **AWS CLI**: Installed and configured (`aws configure`)
- **kubectl**: Kubernetes command-line tool
- **eksctl**: EKS cluster management tool
- **Docker**: For building container images
- **Helm**: Kubernetes package manager (installed automatically by script 2)
- **Python 3**: For data population scripts
- **Sufficient IAM Permissions**: EKS, EC2, VPC, IAM, ECR

### macOS Installation

```bash
brew install awscli kubectl eksctl docker helm python3
```

### Linux Installation

```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

## 🚀 Quick Start

### Step 0: Configure AWS Credentials (Required First!)

**Before deploying**, you must configure AWS credentials:

```bash
# Run the setup wizard (recommended)
chmod +x setup-aws-credentials.sh
./setup-aws-credentials.sh
```

**For federated/SSO accounts** (like account 375523929321):

```bash
# Configure SSO
aws configure sso

# Login
aws sso login --profile YOUR_PROFILE

# Set profile for deployment
export AWS_PROFILE=YOUR_PROFILE
```

**For IAM users with access keys**:

```bash
aws configure
# Enter your Access Key ID and Secret Access Key
```

**Verify your setup**:

```bash
aws sts get-caller-identity
# Should show your account ID and user ARN
```

📖 **Detailed guide**: See [AWS-SETUP.md](./AWS-SETUP.md) for complete instructions.

---

### Option 1: One-Command Deployment (Recommended)

Once AWS credentials are configured:

```bash
# Deploy everything automatically
chmod +x *.sh
./deploy-all.sh
```

This master script runs all deployment steps in sequence with progress tracking and error handling.

**Total Time: ~60-90 minutes**

### Option 2: Manual Step-by-Step Deployment

Run each script individually:

```bash
# 1. Deploy EKS Cluster (~20-30 minutes)
chmod +x *.sh
./1-deploy-eks-cluster.sh

# 2. Install Ollama (~10-15 minutes)
./2-install-ollama.sh

# 2b. Setup AWS Bedrock (~2-3 minutes)
./2b-setup-bedrock.sh

# 3. Setup DynamoDB Tables (~3-5 minutes)
./3-setup-knowledge-graph.sh

# 4. Deploy Integration (~5-10 minutes)
./4-deploy-integration.sh
```

### Option 3: Custom Configuration

```bash
# Copy configuration template
cp config.env.example config.env

# Edit configuration
nano config.env

# Deploy with custom config
source config.env && ./deploy-all.sh
```

## 📜 Script Details

### 1. Deploy EKS Cluster (`1-deploy-eks-cluster.sh`)

Creates an EKS cluster optimized for AI workloads with GPU support.

**Features:**

- Automated prerequisite checking
- GPU-enabled nodes (g4dn.xlarge)
- NVIDIA device plugin installation
- Cost estimation and confirmation
- Cluster configuration saved to file

**Configuration:**

```bash
export CLUSTER_NAME="ollama-ai-cluster"  # Default
export AWS_REGION="us-east-1"             # Default
export GPU_NODE_COUNT=2                   # Default
```

**Outputs:**

- `cluster-info.txt`: Cluster details and access commands
- `/tmp/eks-cluster-config.yaml`: Cluster configuration

**Cost Estimate:** ~$27-30/day base + usage-based Bedrock and DynamoDB costs

---

### 2. Install Ollama (`2-install-ollama.sh`)

Deploys Ollama on EKS with persistent storage and downloads AI models.

**Features:**

- Persistent volume for model storage
- GPU resource allocation
- LoadBalancer service for external access
- Automatic model downloads (Llama 2, Mistral, optional Mixtral)
- Health checks and readiness probes

**Configuration:**

```bash
export OLLAMA_NAMESPACE="ollama"     # Default
export OLLAMA_REPLICAS=2             # Default
export STORAGE_SIZE="50Gi"           # Default
```

**Downloaded Models:**

- **Llama 2** (7B): General-purpose LLM (~4GB)
- **Mistral** (7B): Excellent for instructions (~4GB)
- **Mixtral** (8x7B): Optional, more powerful (~26GB)

**Outputs:**

- `ollama-info.txt`: Service details and commands

---

### 2b. Setup AWS Bedrock (`2b-setup-bedrock.sh`)

Configures AWS Bedrock access with IAM roles for EKS pods.

**Features:**

- Bedrock availability checking
- IAM policy creation for model invocation
- IRSA (IAM Roles for Service Accounts) configuration
- Kubernetes service account with role annotation
- Bedrock connectivity testing
- Model access verification

**Configuration:**

```bash
export AWS_REGION="us-east-1"           # Must support Bedrock
```

**Available Models:**

- **Claude 3 Haiku**: Fast, cost-effective ($0.25/MTok input)
- **Claude 3 Sonnet**: Balanced performance
- **Llama 3 70B**: Meta's latest open model
- **Mistral 7B**: Efficient instruction following

**Outputs:**

- `bedrock-info.txt`: Configuration and model access details
- `test-bedrock.py`: Python script to test Bedrock access

---

### 3. Setup DynamoDB Tables (`3-setup-knowledge-graph.sh`)

Creates DynamoDB tables and populates them with healthcare data.

**Features:**

- 6 DynamoDB tables with optimized keys
- PAY_PER_REQUEST billing (cost-effective for variable load)
- Sample healthcare data generation
- Python population script
- Data validation and verification

**Configuration:**

```bash
export TABLE_PREFIX="healthcare"          # Default
export BILLING_MODE="PAY_PER_REQUEST"     # Default
```

**DynamoDB Tables:**

- **patients**: patient_id (key), age, gender
- **diagnoses**: diagnosis_code (key), name, category
- **medications**: medication_id (key), name, class, form, dosage
- **providers**: npi (key), specialty, name
- **patient-diagnoses**: patient_id (key) + diagnosis_code (sort), date, severity
- **patient-medications**: patient_id (key) + medication_id (sort), date, frequency

**Outputs:**

- `dynamodb-info.txt`: Table details and query examples
- `populate-healthcare-data.py`: Data population script

**Cost Estimate:** ~$5/month for sample data with PAY_PER_REQUEST billing

---

### 4. Deploy Integration (`4-deploy-integration.sh`)

Deploys the query bridge that connects both Ollama and Bedrock with DynamoDB for natural language queries.

**Features:**

- Flask API with dual LLM backend support
- Natural language → DynamoDB query translation
- Model selection (Ollama vs Bedrock)
- Docker containerization
- Optional AWS ECR push
- Health checks and monitoring
- LoadBalancer service
- Results explanation via LLM

**Configuration:**

```bash
export INTEGRATION_NAMESPACE="ollama"          # Default
export IMAGE_NAME="healthcare-ai-bridge"      # Default
export USE_BEDROCK="true"                     # Enable Bedrock
```

**API Endpoints:**

- `GET /health`: Health check and configuration status
- `POST /query`: Natural language query with explanations
- `GET /stats`: Database statistics

**Example Query:**

```bash
curl -X POST http://localhost:8080/query \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "How many patients have diabetes?",
    "use_bedrock": true,
    "explain": true
  }'
```

**Outputs:**

- `integration-info.txt`: API documentation and examples

**API Endpoints:**

- `GET /health`: Health check
- `POST /query`: Natural language query with AI explanation
- `POST /direct-query`: Execute Cypher directly

**Outputs:**

- `integration-info.txt`: API documentation and examples
- `/tmp/healthcare-ai-bridge/`: Application source code

---

## 🔧 Environment Variables

Set these before running scripts to customize deployment:

```bash
# EKS Configuration
export CLUSTER_NAME="my-ai-cluster"
export AWS_REGION="us-west-2"  # Must support Bedrock
export K8S_VERSION="1.28"
export GPU_INSTANCE_TYPE="g4dn.xlarge"
export GPU_NODE_COUNT=2

# Ollama Configuration
export OLLAMA_NAMESPACE="ollama"
export OLLAMA_REPLICAS=3
export STORAGE_SIZE="100Gi"

# Bedrock Configuration
export BEDROCK_REGION="us-east-1"
export BEDROCK_MODEL="anthropic.claude-3-haiku-20240307-v1:0"
export USE_BEDROCK="true"

# DynamoDB Configuration
export TABLE_PREFIX="healthcare"
export BILLING_MODE="PAY_PER_REQUEST"

# Integration Configuration
export INTEGRATION_NAMESPACE="ollama"
export IMAGE_NAME="healthcare-ai-bridge"
```

## 📊 Cost Management

### Estimated Costs (Innovation Sandbox Credits)

| Component | Instance Type | Cost/Hour | Daily Cost |
|-----------|---------------|-----------|------------|
| GPU Nodes (2x) | g4dn.xlarge | $0.526 | $25.25 |
| General Node | t3.large | $0.0832 | $2.00 |
| EBS Volumes | gp3 (50GB) | $0.08/GB/month | ~$0.13 |
| LoadBalancers (2x) | - | $0.025/hour each | $1.20 |
| DynamoDB | PAY_PER_REQUEST | Variable | ~$0.17* |
| Bedrock | Pay-per-use | Variable | ~$1-5** |
| **Total** | - | - | **~$28-34/day** |

*DynamoDB costs based on 1M reads/writes per month (~$5/month total)  
**Bedrock costs vary by model and usage. Claude 3 Haiku: $0.25/MTok input, $1.25/MTok output

### Cost Comparison: DynamoDB vs Neo4j

| Feature | DynamoDB | Neo4j on EKS |
|---------|----------|---------------|
| **Monthly Cost** | ~$5 (sample data) | ~$50+ (persistent volumes + node) |
| **Scalability** | Serverless, automatic | Manual scaling |
| **Maintenance** | Fully managed | Self-managed |
| **Setup Time** | 3-5 minutes | 15-20 minutes |
| **Backup** | Point-in-time recovery | Manual or automated |

### Cost Comparison: Bedrock vs Self-hosted LLMs

| Feature | Bedrock | Ollama on EKS |
|---------|---------|---------------|
| **Cost Model** | Pay-per-token | Fixed (GPU node cost) |
| **Idle Cost** | $0 | ~$25/day (GPU nodes) |
| **Scalability** | Automatic | Limited by nodes |
| **Latency** | Medium (API call) | Low (local) |
| **Best For** | Variable/production | Development/high-volume |

### Cost Optimization Tips

1. **Use Spot Instances**: Reduce GPU costs by ~70% (requires cluster config modification)
2. **Scale Down When Idle**:

   ```bash
   eksctl scale nodegroup --cluster=ollama-ai-cluster --name=ai-compute-nodes --nodes=0
   ```

3. **Delete When Not in Use**:

   ```bash
   eksctl delete cluster --name=ollama-ai-cluster --region=us-east-1
   # Also delete DynamoDB tables and Bedrock IAM resources
   ```

4. **Use Smaller Models**: Llama 2 instead of Mixtral saves memory/storage
5. **Use Bedrock for Production**: Eliminates GPU costs, pay only for usage
6. **Use Ollama for Development**: Fixed cost, great for testing and iteration
7. **DynamoDB On-Demand**: Perfect for variable workloads, no idle costs

## 🧪 Testing the Deployment

### 1. Test Ollama

```bash
# Port-forward
kubectl port-forward -n ollama svc/ollama-service 11434:11434

# Test API
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "What is HIPAA?",
  "stream": false
}'
```

### 2. Test Bedrock

```bash
# Check Bedrock configuration
cat bedrock-info.txt

# Test with Python script
python3 test-bedrock.py

# List available models
aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[*].[modelId,modelName]' --output table
```

### 3. Test DynamoDB

```bash
# List tables
aws dynamodb list-tables --region us-east-1

# Count patients
aws dynamodb scan --table-name healthcare-patients --select COUNT --region us-east-1

# Get sample patient
aws dynamodb scan --table-name healthcare-patients --limit 1 --region us-east-1
```

### 4. Test Integration API

```bash
# Port-forward
kubectl port-forward -n ollama svc/healthcare-ai-bridge 8080:8080

# Health check
curl http://localhost:8080/health

# Natural language query with Bedrock
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How many patients have diabetes?", "use_bedrock": true}'

# Natural language query with Ollama
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What medications are most commonly prescribed?", "use_bedrock": false}'

# Get database statistics
curl http://localhost:8080/stats
```

## 🐛 Troubleshooting

### EKS Cluster Issues

**Problem**: Cluster creation fails

```bash
# Check CloudFormation stacks
aws cloudformation describe-stacks --region us-east-1

# View eksctl logs
eksctl utils describe-stacks --cluster=ollama-ai-cluster --region=us-east-1
```

**Problem**: GPU nodes not available

```bash
# Check nodes
kubectl get nodes -o wide

# Check NVIDIA plugin
kubectl get pods -n kube-system | grep nvidia

# Verify GPU allocation
kubectl get nodes -o json | jq '.items[].status.allocatable."nvidia.com/gpu"'
```

### Ollama Issues

**Problem**: Pods in Pending state

```bash
# Describe pod
kubectl describe pod -n ollama -l app=ollama

# Check events
kubectl get events -n ollama --sort-by='.lastTimestamp'

# Common issue: Insufficient GPU resources
```

**Problem**: Model download fails

```bash
# Check pod logs
kubectl logs -n ollama -l app=ollama --tail=100

# Exec into pod
kubectl exec -it -n ollama <pod-name> -- bash
ollama list
ollama pull llama2
```

### DynamoDB Issues

**Problem**: Tables not found

```bash
# List tables
aws dynamodb list-tables --region us-east-1 --query 'TableNames[?starts_with(@, `healthcare-`)]'

# Describe table
aws dynamodb describe-table --table-name healthcare-patients --region us-east-1

# Re-run setup script
./3-setup-knowledge-graph.sh
```

**Problem**: Access denied

```bash
# Check IAM permissions
aws sts get-caller-identity

# Verify IAM role for EKS service account
kubectl get sa bedrock-service-account -n ollama -o yaml
```

### Bedrock Issues

**Problem**: Bedrock not available in region

```bash
# List supported regions
aws bedrock list-foundation-models --region us-east-1

# Try a different region (us-west-2, eu-west-1, etc.)
export BEDROCK_REGION=us-west-2
./2b-setup-bedrock.sh
```

**Problem**: Model access denied

```bash
# Check model access
aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[*].[modelId,modelName]' --output table

# Request model access in AWS Console:
# https://console.aws.amazon.com/bedrock → Model access
```

**Problem**: IAM role issues

```bash
# Check IRSA configuration
kubectl describe sa bedrock-service-account -n ollama

# Verify IAM role
aws iam get-role --role-name BedrockAccessRole

# Re-run Bedrock setup
./2b-setup-bedrock.sh
```

### Integration Issues

**Problem**: Bridge cannot connect to Ollama/Bedrock/DynamoDB

```bash
# Check logs
kubectl logs -n ollama -l app=healthcare-ai-bridge --tail=100

# Test Ollama connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://ollama-service.ollama.svc.cluster.local:11434

# Test DynamoDB access
kubectl run -it --rm debug --image=amazon/aws-cli --restart=Never -- \
  aws dynamodb list-tables --region us-east-1

# Check service account
kubectl get sa bedrock-service-account -n ollama -o yaml
```

**Problem**: Queries fail

```bash
# Check pod logs
kubectl logs -n ollama -l app=healthcare-ai-bridge --tail=200

# Restart deployment
kubectl rollout restart deployment/healthcare-ai-bridge -n ollama

# Toggle LLM backend
curl -X POST http://localhost:8080/query \
  -d '{"question": "test", "use_bedrock": false}'  # Try Ollama instead
```

## 🔄 Updating/Redeploying

### Update Ollama Models

```bash
POD=$(kubectl get pods -n ollama -l app=ollama -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n ollama $POD -- ollama pull <new-model-name>
```

### Update Integration Service

```bash
# Rebuild image
cd /tmp/healthcare-ai-bridge
docker build -t healthcare-ai-bridge:v2 .

# Update deployment
kubectl set image deployment/healthcare-ai-bridge -n ollama bridge=healthcare-ai-bridge:v2

# Rollout
kubectl rollout status deployment/healthcare-ai-bridge -n ollama
```

### Switch LLM Backend

```bash
# Use Bedrock (managed)
kubectl set env deployment/healthcare-ai-bridge -n ollama USE_BEDROCK=true

# Use Ollama (self-hosted)
kubectl set env deployment/healthcare-ai-bridge -n ollama USE_BEDROCK=false

# Change Bedrock model
kubectl set env deployment/healthcare-ai-bridge -n ollama \
  BEDROCK_MODEL=meta.llama3-70b-instruct-v1:0
```

### Scale Resources

```bash
# Scale Ollama replicas
kubectl scale deployment/ollama -n ollama --replicas=3

# Scale EKS nodes
eksctl scale nodegroup --cluster=ollama-ai-cluster --name=ai-compute-nodes --nodes=3
```

## 🗑️ Cleanup

### Automated Cleanup (Recommended)

```bash
# Remove all infrastructure
./cleanup.sh

# Force cleanup without prompts
./cleanup.sh --force

# Keep persistent volumes (models data)
./cleanup.sh --keep-data
```

### Manual Cleanup

#### Delete Individual Components

```bash
# Delete integration
kubectl delete deployment healthcare-ai-bridge -n ollama
kubectl delete service healthcare-ai-bridge -n ollama
kubectl delete configmap healthcare-bridge-config -n ollama

# Delete DynamoDB tables
aws dynamodb delete-table --table-name healthcare-patients --region us-east-1
aws dynamodb delete-table --table-name healthcare-diagnoses --region us-east-1
aws dynamodb delete-table --table-name healthcare-medications --region us-east-1
aws dynamodb delete-table --table-name healthcare-providers --region us-east-1
aws dynamodb delete-table --table-name healthcare-patient-diagnoses --region us-east-1
aws dynamodb delete-table --table-name healthcare-patient-medications --region us-east-1

# Delete Bedrock IAM resources
ROLE_ARN=$(aws iam get-role --role-name BedrockAccessRole --query 'Role.Arn' --output text)
POLICY_ARN=$(aws iam list-policies --query 'Policies[?PolicyName==`BedrockAccessPolicy`].Arn' --output text)
aws iam detach-role-policy --role-name BedrockAccessRole --policy-arn $POLICY_ARN
aws iam delete-role --role-name BedrockAccessRole
aws iam delete-policy --policy-arn $POLICY_ARN� Verification

After deployment, verify everything is working:

```bash
# Run comprehensive verification
./verify-deployment.sh

# This checks:
# - Cluster connectivity
# - All pods running
# - GPU availability
# - Service endpoints
# - API responses
# - Data populated
```

## 📦 Package Contents

```
deployment-scripts/
├── deploy-all.sh                    # Master deployment script
├── cleanup.sh                       # Automated cleanup
├── verify-deployment.sh             # Verification tests
├── config.env.example               # Configuration template
├── 1-deploy-eks-cluster.sh          # EKS cluster setup
├── 2-install-ollama.sh              # Ollama installation
├── 2b-setup-bedrock.sh              # AWS Bedrock configuration
├── 3-setup-knowledge-graph.sh       # DynamoDB tables setup
├── 4-deploy-integration.sh          # Integration service
└── README.md                        # This file
```

## 📚 Additional Resources

- [EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [IAM Roles for Service Accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)

## 🤝 Support

For issues or questions:

1. Run `./verify-deployment.sh` to diagnose issues
2. Check the generated `*-info.txt` files for troubleshooting commands
3. Review deployment logs: `deployment-*.log`
4. Review pod logs: `kubectl logs -n <namespace> <pod-name>`
5. Check events: `kubectl get events -n <namespace> --sort-by='.lastTimestamp'`
6``

## 📚 Additional Resources

- [EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

## 🤝 Support

For issues or questions:

1. Check the generated `*-info.txt` files for troubleshooting commands
2. Review pod logs: `kubectl logs -n <namespace> <pod-name>`
3. Check events: `kubectl get events -n <namespace> --sort-by='.lastTimestamp'`
4. Verify resources: `kubectl get all -n <namespace>`

## 📝 License

This project is part of the University of Oregon Healthcare AI course materials.
