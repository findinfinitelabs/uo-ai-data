# AWS Authentication Setup Guide

This guide explains how to configure AWS credentials so the deployment scripts can access your AWS account.

## Quick Start

**Run the setup wizard:**

```bash
chmod +x setup-aws-credentials.sh
./setup-aws-credentials.sh
```

The wizard will guide you through credential setup and verify access.

---

## Authentication Methods

### 1. Federated/SSO Account (Recommended for Enterprise)

If your organization uses AWS SSO or federated authentication (like account **375523929321**), follow these steps:

#### Step 1: Configure AWS SSO

```bash
aws configure sso
```

You'll be prompted for:

- **SSO start URL**: Provided by your IT/AWS admin (e.g., `https://your-org.awsapps.com/start`)
- **SSO region**: Usually `us-east-1` (where SSO service runs)
- **Account ID**: Your AWS account (e.g., `375523929321`)
- **Role name**: The role you want to assume (e.g., `PowerUserAccess`)
- **Profile name**: A name for this configuration (e.g., `healthcare-prod`)

#### Step 2: Login to SSO

```bash
aws sso login --profile healthcare-prod
```

This opens your browser to authenticate via SSO.

#### Step 3: Set Your Profile

```bash
# In your current shell
export AWS_PROFILE=healthcare-prod

# Or add to ~/.bashrc or ~/.zshrc to persist
echo 'export AWS_PROFILE=healthcare-prod' >> ~/.bashrc
```

#### Step 4: Verify Access

```bash
aws sts get-caller-identity
```

You should see:

```json
{
    "UserId": "...",
    "Account": "375523929321",
    "Arn": "arn:aws:sts::375523929321:assumed-role/..."
}
```

#### Step 5: Deploy

```bash
./deploy-all.sh
```

---

### 2. IAM User with Access Keys

If you have a standard IAM user with access keys:

#### Step 1: Get Your Keys

1. Go to AWS Console → IAM → Users → [Your User]
2. Click "Security credentials" tab
3. Click "Create access key"
4. **Save both keys immediately** (you won't see the secret again!)

#### Step 2: Configure AWS CLI

```bash
aws configure
```

Enter:

- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region**: `us-east-1` (or your preferred region)
- **Output format**: `json`

#### Step 3: Verify

```bash
aws sts get-caller-identity
```

#### Step 4: Deploy

```bash
./deploy-all.sh
```

---

### 3. AWS Profile (Multiple Accounts)

If you manage multiple AWS accounts:

#### List Profiles

```bash
aws configure list-profiles
```

#### Use a Specific Profile

```bash
export AWS_PROFILE=my-profile-name
./deploy-all.sh
```

Or specify in config:

```bash
echo "AWS_PROFILE=my-profile-name" >> config.env
```

---

### 4. Temporary Credentials

For temporary access (expires after 1-12 hours):

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_SESSION_TOKEN=your_session_token
export AWS_REGION=us-east-1
```

Then deploy immediately before credentials expire:

```bash
./deploy-all.sh
```

---

## Required AWS Permissions

Your IAM user or federated role needs these permissions:

### Essential Services

- **EKS**: Create and manage Kubernetes clusters
- **EC2**: Launch instances, manage VPCs, security groups
- **DynamoDB**: Create and manage tables
- **S3**: Create and manage buckets
- **IAM**: Create roles for service accounts (IRSA)
- **Bedrock**: AI model access (optional)

### Quick Setup: Use Our Pre-Built Policy

We've created a comprehensive IAM policy with exact permissions needed:

```bash
# Automated setup (creates and optionally attaches policy)
chmod +x create-iam-policy.sh
./create-iam-policy.sh
```

Or manually with AWS CLI:

```bash
aws iam create-policy \
  --policy-name HealthcareAI-Deployment-Policy \
  --policy-document file://iam-policy-healthcare-ai.json \
  --description "Permissions for Healthcare AI Infrastructure deployment"
```

### Managed Policies (Alternative)

If you can't create custom policies, request **one of these**:

- `AdministratorAccess` (full access, easiest for testing)
- `PowerUserAccess` + `IAMFullAccess` (good balance)

### Custom Policy Details

The complete policy is in `iam-policy-healthcare-ai.json`.

**Summary of permissions**:

- **EKS**: Full control over EKS clusters
- **EC2**: VPC, subnets, security groups, instances, load balancers
- **AutoScaling**: Launch configurations and auto-scaling groups
- **IAM**: Create and manage roles, policies, OIDC providers for IRSA
- **CloudFormation**: Stack management (used by eksctl)
- **DynamoDB**: Full table management
- **S3**: Full bucket management
- **ECR**: Docker image registry
- **Bedrock**: AI model access
- **CloudWatch**: Logs and metrics
- **ELB**: Load balancer management
- **KMS**: Encryption key management

**📄 Full policy**: See [iam-policy-healthcare-ai.json](./iam-policy-healthcare-ai.json)

---

## Troubleshooting

### Error: "Unable to locate credentials"

**Problem**: AWS CLI can't find credentials  
**Solution**: Run `./setup-aws-credentials.sh` or `aws configure`

### Error: "The security token included in the request is expired"

**Problem**: SSO session or temporary credentials expired  
**Solution**:

```bash
# For SSO
aws sso login --profile YOUR_PROFILE

# For temporary credentials, get new ones
```

### Error: "User: arn:aws:iam::... is not authorized to perform: eks:CreateCluster"

**Problem**: Insufficient permissions  
**Solution**: Contact your AWS administrator to grant required permissions

### Error: "ExpiredToken: The security token included in the request is invalid"

**Problem**: Federated session expired  
**Solution**:

```bash
aws sso login --profile YOUR_PROFILE
# Then retry deployment
./deploy-all.sh
```

### SSO Login Opens Wrong Browser

**Problem**: Browser doesn't have your SSO session  
**Solution**:

```bash
# Copy the URL from terminal and paste in correct browser
# Or configure default browser:
export AWS_DEFAULT_SSO_REGION=us-east-1
```

---

## Verification Checklist

Before deploying, verify:

```bash
# 1. AWS CLI installed
aws --version

# 2. Credentials work
aws sts get-caller-identity

# 3. Correct account (should show 375523929321 for you)
aws sts get-caller-identity --query Account --output text

# 4. Can access EKS
aws eks list-clusters --region us-east-1

# 5. Can access DynamoDB
aws dynamodb list-tables --region us-east-1

# 6. Can access S3
aws s3 ls
```

If all commands succeed, you're ready to deploy!

---

## For Your Specific Setup (Account 375523929321)

Since you have a **federated user account**, follow these steps:

### Step 1: Request Permissions from AWS Admin

Send your AWS administrator this information:

**Email Template:**

```
Subject: IAM Policy Request for Healthcare AI Deployment

Hi [Admin Name],

I need permissions to deploy a Healthcare AI infrastructure on AWS account 375523929321.

Please create/attach the IAM policy from this file:
https://github.com/[your-repo]/deployment-scripts/iam-policy-healthcare-ai.json

Or attach these managed policies to my federated role:
- PowerUserAccess
- IAMFullAccess

Permissions needed for:
- EKS cluster management
- EC2, VPC, networking
- DynamoDB tables
- S3 buckets
- IAM roles for service accounts
- Bedrock (AI models)

Thank you!
```

### Step 2: Configure AWS SSO

Once permissions are granted:

```bash
aws configure sso
# Enter the info from your admin
```

### Step 3: Login

```bash
aws sso login --profile healthcare-prod
```

### Step 4: Set Profile

```bash
export AWS_PROFILE=healthcare-prod
# Or add to config.env:
echo "AWS_PROFILE=healthcare-prod" >> config.env
```

### Step 5: Verify Access

```bash
aws sts get-caller-identity
# Should show Account: 375523929321

# Check permissions
./create-iam-policy.sh  # This will verify your access
```

### Step 6: Deploy

```bash
./deploy-all.sh
```

---

## Security Best Practices

✅ **DO**:

- Use SSO/federated authentication when available
- Use AWS_PROFILE to separate accounts
- Rotate access keys every 90 days
- Use IAM roles instead of access keys when possible
- Enable MFA on your IAM user

❌ **DON'T**:

- Commit credentials to Git
- Share access keys
- Use root account credentials
- Leave access keys in environment variables permanently
- Copy credentials from untrusted sources

---

## Need Help?

**Run the setup wizard:**

```bash
./setup-aws-credentials.sh
```

**Or contact your AWS administrator** with:

- Your account ID: `375523929321`
- Services needed: EKS, EC2, DynamoDB, S3, IAM, Bedrock
- Managed policy needed: `PowerUserAccess` or `AdministratorAccess`
