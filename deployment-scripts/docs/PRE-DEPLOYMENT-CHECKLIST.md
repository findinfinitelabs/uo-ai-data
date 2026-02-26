# Pre-Deployment Checklist for AWS Innovation Sandbox

## Overview

Use this checklist to ensure your environment is ready before deploying the Healthcare AI infrastructure.

---

## ✅ Step 1: AWS Access Verification

### 1.1 Verify AWS CLI Installation

```bash
aws --version
```

**Expected**: `aws-cli/2.x.x` or higher

**If not installed**:
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download and run: https://awscli.amazonaws.com/AWSCLIV2.msi
```

### 1.2 Configure SSO Authentication

```bash
cd deployment-scripts
./setup-aws-credentials.sh
```

Choose option **2** (Federated/SSO Account) and follow the prompts.

**Alternative** (manual):
```bash
aws configure sso
# SSO start URL: <provided by instructor>
# SSO Region: us-east-1
# Account ID: <your Innovation Sandbox account>
# Role: PowerUserAccess or AdministratorAccess
# Profile name: uo-innovation

aws sso login --profile uo-innovation
export AWS_PROFILE=uo-innovation
```

### 1.3 Verify Credentials

```bash
aws sts get-caller-identity
```

**Expected output**:
```json
{
    "UserId": "AROAXXXXXXXXXX:your-email@example.com",
    "Account": "375523929321",
    "Arn": "arn:aws:sts::375523929321:assumed-role/PowerUserAccess/your-email@example.com"
}
```

**✓ Checklist**:
- [ ] AWS CLI installed (v2.x or higher)
- [ ] SSO configured (profile created)
- [ ] Successfully logged in
- [ ] `aws sts get-caller-identity` works
- [ ] Account ID matches Innovation Sandbox (e.g., 375523929321)

---

## ✅ Step 2: Required Tools Installation

### 2.1 kubectl (Kubernetes CLI)

```bash
kubectl version --client
```

**Expected**: `Client Version: v1.28.x` or higher

**If not installed**:
```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Windows
choco install kubernetes-cli
```

### 2.2 eksctl (EKS CLI)

```bash
eksctl version
```

**Expected**: `0.150.0` or higher

**If not installed**:
```bash
# macOS
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl

# Linux
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Windows
choco install eksctl
```

### 2.3 Helm (Kubernetes Package Manager)

```bash
helm version
```

**Expected**: `v3.12.x` or higher

**If not installed**:
```bash
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Windows
choco install kubernetes-helm
```

### 2.4 Python 3 and pip

```bash
python3 --version
pip3 --version
```

**Expected**: `Python 3.13+` and `pip 21+`

**If not installed**:
```bash
# macOS
brew install python3

# Linux (Ubuntu/Debian)
sudo apt update
sudo apt install python3 python3-pip

# Windows
# Download from: https://www.python.org/downloads/
```

**✓ Checklist**:
- [ ] kubectl installed and working
- [ ] eksctl installed and working
- [ ] helm installed and working
- [ ] Python 3.13+ installed
- [ ] pip3 installed

---

## ✅ Step 3: AWS Permissions Check

### 3.1 Test EKS Permissions

```bash
aws eks list-clusters --region us-east-1
```

**Expected**: Empty list `[]` or existing clusters (not an error)

### 3.2 Test EC2 Permissions

```bash
aws ec2 describe-vpcs --region us-east-1
```

**Expected**: List of VPCs (should work without error)

### 3.3 Test DynamoDB Permissions

```bash
aws dynamodb list-tables --region us-east-1
```

**Expected**: Empty list or existing tables

### 3.4 Test Bedrock Access

```bash
aws bedrock list-foundation-models --region us-east-1
```

**Expected**: List of models (Claude, Llama, etc.)

### 3.5 Test IAM Permissions

```bash
aws iam get-user 2>/dev/null || aws sts get-caller-identity
```

**Expected**: Your user/role information

**✓ Checklist**:
- [ ] Can list EKS clusters (even if empty)
- [ ] Can describe VPCs
- [ ] Can list DynamoDB tables
- [ ] Can access Bedrock models
- [ ] Can get IAM/STS identity

**⚠️ If any fail**: Contact your instructor to grant necessary permissions.

---

## ✅ Step 4: Service Quotas Check

### 4.1 Check vCPU Quota (for GPU instances)

```bash
aws service-quotas get-service-quota \
    --service-code ec2 \
    --quota-code L-1216C47A \
    --region us-east-1 \
    --query 'Quota.Value'
```

**Expected**: `32` or higher (need ~8 vCPUs for 1 GPU node)

### 4.2 Check EKS Cluster Quota

```bash
aws service-quotas get-service-quota \
    --service-code eks \
    --quota-code L-1194D53C \
    --region us-east-1 \
    --query 'Quota.Value'
```

**Expected**: `10` or higher (we need 1 cluster)

### 4.3 Check Elastic IP Quota

```bash
aws service-quotas get-service-quota \
    --service-code ec2 \
    --quota-code L-0263D0A3 \
    --region us-east-1 \
    --query 'Quota.Value'
```

**Expected**: `5` or higher

**✓ Checklist**:
- [ ] vCPU quota >= 32
- [ ] EKS cluster quota >= 10
- [ ] Elastic IP quota >= 5

**⚠️ If quotas too low**: Request increases through AWS Console → Service Quotas

---

## ✅ Step 5: Cost Budget Verification

### 5.1 Understand Daily Costs

| Resource | Daily Cost | Monthly Cost |
|----------|------------|--------------|
| EKS Control Plane | $2.40 | $72 |
| GPU Node (g4dn.xlarge) | $13-15 | $390-450 |
| DynamoDB | $0.10 | $3 |
| Neo4j Storage | $0.03 | $1 |
| S3 | $0.07 | $2 |
| Bedrock (usage) | Variable | $5-10 |
| **Total** | **$15-18/day** | **$470-540/month** |

### 5.2 Set Budget Alert (Recommended)

```bash
# Create budget configuration
cat > budget-config.json << 'EOF'
{
  "BudgetName": "healthcare-ai-budget",
  "BudgetLimit": {
    "Amount": "100",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostFilters": {
    "TagKeyValue": ["user:Project$healthcare-ai"]
  },
  "NotificationsWithSubscribers": [
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 80,
        "ThresholdType": "PERCENTAGE"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "your-email@example.com"
        }
      ]
    }
  ]
}
EOF

# Create budget
aws budgets create-budget \
    --account-id $(aws sts get-caller-identity --query Account --output text) \
    --budget file://budget-config.json
```

**✓ Checklist**:
- [ ] Understand estimated costs ($15-18/day)
- [ ] Have instructor approval for budget
- [ ] Optional: Set up budget alerts
- [ ] Plan to delete resources after use

---

## ✅ Step 6: Student Information

### 6.1 Confirm Your Student ID

You'll be prompted for this during deployment. Use lowercase, no spaces:

**Good examples**:
- `student001`
- `jsmith`
- `alice`

**Bad examples**:
- `Student 001` (spaces)
- `J.Smith` (special characters)
- `ALICE123` (uppercase)

### 6.2 Resource Naming Convention

Your resources will be tagged as:

```
Project: healthcare-ai
Environment: innovation-sandbox
ResourceGroup: dataai-account375523929321-jsmith
Owner: jsmith
```

This helps track costs per student.

**✓ Checklist**:
- [ ] Know your student ID (lowercase, no spaces)
- [ ] Understand resource naming convention
- [ ] Ready to use unique identifiers

---

## ✅ Step 7: Graph Database Choice

You'll be prompted to choose a graph database option during deployment:

### Option 1: DynamoDB Only
- **Cost**: ~$1/month
- **Performance**: Fast key-value lookups
- **Limitations**: No graph traversal queries
- **Use case**: Simple patient/diagnosis lookups

### Option 2: DynamoDB + Neo4j (Recommended) ⭐
- **Cost**: ~$2-3/month additional
- **Performance**: Full graph query support
- **Benefits**: Patient relationship exploration, RAG, complex queries
- **Use case**: Complete healthcare knowledge graph

### Option 3: DynamoDB + NetworkX
- **Cost**: $0 additional
- **Performance**: In-memory only (not persistent)
- **Limitations**: Must reload data each run
- **Use case**: Testing/development

**Recommendation**: Choose **Option 2** (Neo4j) for full capabilities.

**✓ Checklist**:
- [ ] Decided on graph database option (recommend Neo4j)
- [ ] Understand cost implications
- [ ] Ready to choose during deployment

---

## ✅ Step 8: Deployment Time Estimate

Plan your deployment timing:

| Phase | Duration | Can Pause? |
|-------|----------|------------|
| EKS Cluster | 20-30 min | ❌ No |
| Ollama | 10-15 min | ❌ No |
| Bedrock | 2-3 min | ✅ Yes |
| DynamoDB | 3-5 min | ✅ Yes |
| Neo4j | 3-5 min | ✅ Yes |
| Integration | 5-10 min | ❌ No |
| S3 Storage | 2-3 min | ✅ Yes |
| **Total** | **45-70 min** | |

**⚠️ Important**: 
- Plan for 60-75 minutes of uninterrupted time
- EKS cluster creation cannot be paused
- Have stable internet connection
- Keep terminal window open

**✓ Checklist**:
- [ ] Block out 60-90 minutes
- [ ] Stable internet connection
- [ ] Power source (laptop plugged in)
- [ ] No urgent interruptions expected

---

## ✅ Step 9: Pre-Flight Test

Run this quick verification script:

```bash
#!/bin/bash
echo "=== Pre-Deployment Verification ==="
echo ""

# AWS CLI
if command -v aws &> /dev/null; then
    echo "✓ AWS CLI: $(aws --version)"
else
    echo "✗ AWS CLI: NOT FOUND"
fi

# kubectl
if command -v kubectl &> /dev/null; then
    echo "✓ kubectl: $(kubectl version --client --short 2>/dev/null)"
else
    echo "✗ kubectl: NOT FOUND"
fi

# eksctl
if command -v eksctl &> /dev/null; then
    echo "✓ eksctl: $(eksctl version)"
else
    echo "✗ eksctl: NOT FOUND"
fi

# helm
if command -v helm &> /dev/null; then
    echo "✓ helm: $(helm version --short)"
else
    echo "✗ helm: NOT FOUND"
fi

# Python
if command -v python3 &> /dev/null; then
    echo "✓ python3: $(python3 --version)"
else
    echo "✗ python3: NOT FOUND"
fi

# AWS Auth
if aws sts get-caller-identity &> /dev/null; then
    ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo "✓ AWS Authenticated: Account $ACCOUNT"
else
    echo "✗ AWS Authentication: FAILED"
fi

echo ""
echo "=== Check Complete ==="
```

Save as `pre-flight-check.sh` and run:
```bash
chmod +x pre-flight-check.sh
./pre-flight-check.sh
```

**All items should show ✓**. If any show ✗, fix before deploying.

**✓ Checklist**:
- [ ] All tools show ✓
- [ ] AWS authentication works
- [ ] Ready to proceed

---

## ✅ Step 10: Ready to Deploy!

### Final Checklist

- [ ] AWS CLI installed and configured
- [ ] SSO authentication working
- [ ] kubectl, eksctl, helm installed
- [ ] Python 3.13+ installed
- [ ] All permissions verified
- [ ] Service quotas adequate
- [ ] Budget approved by instructor
- [ ] Student ID chosen (lowercase, no spaces)
- [ ] Graph database option decided
- [ ] 60-90 minutes of time available
- [ ] Pre-flight check passed

### Next Steps

If all boxes are checked, proceed with deployment:

```bash
cd deployment-scripts
./deploy-all.sh
```

You'll be prompted for:
1. **Student ID**: Enter your student identifier
2. **Graph Database**: Choose option 2 (DynamoDB + Neo4j) recommended
3. **Confirmation**: Review cost estimate and confirm

---

## 🆘 Troubleshooting

### Issue: AWS CLI not found
**Solution**: Install AWS CLI (see Step 2.1)

### Issue: SSO login fails
**Solution**: 
```bash
aws sso logout
aws configure sso  # Re-configure
aws sso login --profile uo-innovation
```

### Issue: Permission denied errors
**Solution**: Contact instructor to grant PowerUserAccess or AdministratorAccess role

### Issue: Service quota too low
**Solution**: Request increase at AWS Console → Service Quotas → EC2 → Running On-Demand G instances

### Issue: Budget concerns
**Solution**: Talk to instructor about:
- Using smaller instance types (g4dn.xlarge instead of g4dn.2xlarge)
- Scaling to 0 nodes when not in use
- Using Bedrock-only setup (no GPUs)

---

## 📚 Additional Resources

- [AWS Innovation Sandbox Documentation](https://aws.amazon.com/training/digital/innovation-sandbox/)
- [EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/)
- [eksctl Documentation](https://eksctl.io/)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)

---

**Ready? Let's deploy! 🚀**

```bash
cd deployment-scripts
./deploy-all.sh
```
