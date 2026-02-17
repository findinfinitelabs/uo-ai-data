# 🚀 Quick Start - Deploy in 3 Steps

## For Account 375523929321 (Federated User)

### ✅ Prerequisites Checklist

Before deploying, make sure you have:

- [ ] **AWS CLI installed**

  ```bash
  aws --version
  ```

  If not: `brew install awscli` (macOS) or [download here](https://aws.amazon.com/cli/)

- [ ] **kubectl installed**

  ```bash
  kubectl version --client
  ```

  If not: `brew install kubectl` (macOS)

- [ ] **eksctl installed**

  ```bash
  eksctl version
  ```

  If not: `brew install eksctl` (macOS)

- [ ] **Docker running**

  ```bash
  docker ps
  ```

  If not: Start Docker Desktop

---

## 🎯 3-Step Deployment

### Step 1️⃣: Configure AWS Credentials

**Run the setup wizard:**

```bash
cd deployment-scripts
./setup-aws-credentials.sh
```

**Or manually (for federated account):**

```bash
# Configure SSO (one time)
aws configure sso
# You'll need from your AWS admin:
# - SSO start URL: https://[your-org].awsapps.com/start
# - Account ID: 375523929321
# - Role name: (e.g., PowerUserAccess)

# Login (do this each session or when expired)
aws sso login --profile healthcare-prod

# Set profile for this session
export AWS_PROFILE=healthcare-prod

# Verify access
aws sts get-caller-identity
# Should show: "Account": "375523929321"
```

---

### Step 2️⃣: Request IAM Permissions

**Option A: Try automatic setup first**

```bash
./create-iam-policy.sh
```

If this succeeds, you're done! Skip to Step 3.

**Option B: Request from AWS Admin (if you don't have IAM permissions)**

Send this to your AWS administrator:

```
Subject: IAM Policy Request for Healthcare AI Deployment

Hi [Admin Name],

I need to deploy Healthcare AI infrastructure on account 375523929321.

Please attach this IAM policy to my federated role:
File: iam-policy-healthcare-ai.json
Policy Name: HealthcareAI-Deployment-Policy

Or attach these managed policies:
1. PowerUserAccess
2. IAMFullAccess

Services needed:
- EKS, EC2, VPC, DynamoDB, S3, IAM, Bedrock

Project: Healthcare AI course deployment for testing/development

Thank you!
```

**After admin grants permissions**, verify:

```bash
# Check EKS access
aws eks list-clusters --region us-east-1

# Check EC2 access
aws ec2 describe-vpcs --region us-east-1

# Should both work without errors
```

---

### Step 3️⃣: Deploy Everything

```bash
# One command deploys the entire stack
./deploy-all.sh
```

**What happens:**

- ⏱️  **Time**: 40-60 minutes
- 💰 **Cost**: ~$15-20/day while running
- 🏗️  **Creates**:
  - EKS cluster (1 GPU node)
  - Ollama (self-hosted LLM)
  - AWS Bedrock access (managed LLM)
  - DynamoDB tables (healthcare data)
  - Integration API with web UI
  - S3 bucket for datasets

**Monitor progress:**

- Watch the terminal output
- Log saved to: `deployment-YYYYMMDD-HHMMSS.log`

---

## 🎉 After Deployment

### Access the Web UI

```bash
# Get the service URL
kubectl get svc healthcare-ai-bridge -n ollama

# Or use port-forward for immediate access
kubectl port-forward -n ollama svc/healthcare-ai-bridge 8080:8080
```

**Then open:** <http://localhost:8080>

### Test the System

1. **Open web UI** at <http://localhost:8080>
2. **Try example queries**:
   - "How many patients have diabetes?"
   - "What are the most common medications?"
3. **Test both LLM backends**:
   - Switch between Bedrock and Ollama
4. **Enable RAG** (context from database)
5. **Publish results to S3** when prompted

---

## 🛠️ Troubleshooting

### "AWS credentials not configured"

```bash
# Check current credentials
aws sts get-caller-identity

# If SSO expired
aws sso login --profile healthcare-prod
export AWS_PROFILE=healthcare-prod
```

### "User is not authorized to perform: eks:CreateCluster"

Your AWS admin needs to grant permissions. Use Step 2 above.

### "Docker daemon is not running"

Start Docker Desktop, then retry.

### SSO session expired during deployment

```bash
# Login again
aws sso login --profile healthcare-prod

# Resume deployment (it's idempotent - safe to re-run)
./deploy-all.sh
```

---

## 📚 Additional Resources

- **Full AWS setup guide**: [AWS-SETUP.md](./AWS-SETUP.md)
- **IAM policy details**: [iam-policy-healthcare-ai.json](./iam-policy-healthcare-ai.json)
- **Complete documentation**: [README.md](./README.md)
- **Configuration options**: [config.env.example](./config.env.example)

---

## 🧹 Cleanup (When Done Testing)

**To avoid ongoing costs:**

```bash
# Delete everything (asks for confirmation)
./cleanup.sh

# Or manual cleanup
eksctl delete cluster --name ollama-ai-cluster --region us-east-1
```

**Cost after cleanup:** $0/day ✅

---

## 💡 Tips

- **SSO expires**: Typically after 1-12 hours. Just re-login.
- **Cost savings**: Delete cluster when not in use
- **Logs**: Check `deployment-*.log` if anything fails
- **Idempotent**: Safe to re-run scripts if interrupted
- **Gradual**: Each step can be run independently

---

## Need Help?

1. Check the error message in terminal
2. Look in `deployment-*.log` for details
3. Verify AWS credentials: `aws sts get-caller-identity`
4. Check permissions: `./create-iam-policy.sh`
5. Review [AWS-SETUP.md](./AWS-SETUP.md) for detailed troubleshooting

---

**Ready to deploy?**

```bash
./setup-aws-credentials.sh  # Step 1
./create-iam-policy.sh      # Step 2  
./deploy-all.sh             # Step 3 - LET'S GO! 🚀
```
