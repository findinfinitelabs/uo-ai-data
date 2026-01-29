# AWS Account Setup Guide

This step-by-step guide walks you through creating an AWS account from scratch and
activating Amazon SageMaker and Amazon Bedrock for AI/ML development.

---

## Table of Contents

1. [Create an AWS Account](#step-1-create-an-aws-account)
2. [Set Up Billing Alerts](#step-2-set-up-billing-alerts)
3. [Create an IAM User](#step-3-create-an-iam-user)
4. [Activate Amazon Bedrock](#step-4-activate-amazon-bedrock)
5. [Activate Amazon SageMaker](#step-5-activate-amazon-sagemaker)
6. [Install AWS CLI](#step-6-install-aws-cli)
7. [Test Your Setup](#step-7-test-your-setup)

---

## Step 1: Create an AWS Account

### 1.1 Go to AWS Sign Up

1. Open your browser and go to: **[https://aws.amazon.com](https://aws.amazon.com)**
2. Click the **"Create an AWS Account"** button (top right)

### 1.2 Enter Account Information

1. **Email address**: Use a personal email you check regularly
2. **AWS account name**: Choose something memorable (e.g., "MyAILearning")
3. Click **"Verify email address"**
4. Check your email for the verification code and enter it

### 1.3 Set Root Password

1. Create a strong password (12+ characters, mix of letters, numbers, symbols)
2. Save this password in a password manager—this is your root account!

### 1.4 Enter Contact Information

1. Select **"Personal"** for account type (unless using for business)
2. Fill in your name, phone number, and address
3. Read and accept the AWS Customer Agreement
4. Click **"Continue"**

### 1.5 Add Payment Method

1. Enter a valid credit or debit card
2. **Don't worry**: You won't be charged if you stay within the Free Tier
3. AWS may place a temporary $1 authorization hold to verify the card

### 1.6 Verify Your Identity

1. Choose **"Text message (SMS)"** or **"Voice call"**
2. Enter the verification code you receive
3. Click **"Continue"**

### 1.7 Select a Support Plan

1. Choose **"Basic support - Free"** (sufficient for learning)
2. Click **"Complete sign up"**

### 1.8 Wait for Account Activation

- Account activation typically takes **1-5 minutes**
- You'll receive a confirmation email when ready
- You can now sign in at [https://console.aws.amazon.com](https://console.aws.amazon.com)

---

## Step 2: Set Up Billing Alerts

**Important**: Set up alerts to avoid unexpected charges!

### 2.1 Access Billing Dashboard

1. Sign in to the AWS Console
2. Click your account name (top right) → **"Billing and Cost Management"**

### 2.2 Enable Cost Alerts

1. In the left sidebar, click **"Billing preferences"**
2. Under **Alert preferences**, click **"Edit"**
3. Enable:
   - ✅ **Receive AWS Free Tier alerts**
   - ✅ **Receive CloudWatch billing alerts**
4. Enter your email address
5. Click **"Update"**

### 2.3 Create a Budget

1. In the left sidebar, click **"Budgets"**
2. Click **"Create budget"**
3. Select **"Use a template (simplified)"**
4. Choose **"Zero spend budget"** (alerts if you exceed Free Tier)
5. Enter your email for notifications
6. Click **"Create budget"**

---

## Step 3: Create an IAM User

**Never use your root account for daily work!** Create an IAM user instead.

### 3.1 Access IAM

1. In the AWS Console, search for **"IAM"** in the search bar
2. Click **"IAM"** (Identity and Access Management)

### 3.2 Create a New User

1. In the left sidebar, click **"Users"**
2. Click **"Create user"**
3. **User name**: Enter something like `ai-developer`
4. ✅ Check **"Provide user access to the AWS Management Console"**
5. Select **"I want to create an IAM user"**
6. Choose **"Custom password"** and create one
7. ❌ Uncheck **"User must create a new password at next sign-in"**
8. Click **"Next"**

### 3.3 Set Permissions

1. Select **"Attach policies directly"**
2. Search for and check these policies:
   - ✅ **AmazonBedrockFullAccess**
   - ✅ **AmazonSageMakerFullAccess**
   - ✅ **IAMUserChangePassword**
3. Click **"Next"**
4. Click **"Create user"**

### 3.4 Save Your Credentials

1. Click **"Download .csv file"** to save your credentials
2. **Important**: Store this file securely—you won't see these credentials again!
3. Note your **Console sign-in URL** (looks like: `https://123456789012.signin.aws.amazon.com/console`)

### 3.5 Create Access Keys (for CLI/API)

1. Click on your new user name
2. Go to the **"Security credentials"** tab
3. Scroll to **"Access keys"** and click **"Create access key"**
4. Select **"Command Line Interface (CLI)"**
5. ✅ Check the confirmation box
6. Click **"Next"** → **"Create access key"**
7. **Download the .csv file** or copy both:
   - Access key ID
   - Secret access key
8. **Store these securely!**

---

## Step 4: Activate Amazon Bedrock

Amazon Bedrock provides access to foundation models like Claude, Llama, and Mistral.

### 4.1 Navigate to Bedrock

1. Sign in with your IAM user (not root!)
2. In the search bar, type **"Bedrock"**
3. Click **"Amazon Bedrock"**

### 4.2 Select Your Region

1. Check the region selector (top right of console)
2. Choose a supported region:
   - **us-east-1** (N. Virginia) - Most models available
   - **us-west-2** (Oregon) - Good for West Coast
3. Remember your region—you'll need it for API calls

### 4.3 Request Model Access

1. In the left sidebar, click **"Model access"**
2. Click **"Manage model access"** (or "Modify model access")
3. Select the models you want:

**Recommended for Learning:**

| Model | Why Use It |
|-------|-----------|
| ✅ Claude 3 Haiku | Fast, cheap, great for testing |
| ✅ Claude 3.5 Sonnet | Best balance of speed/quality |
| ✅ Llama 3.1 8B Instruct | Open source, no extra cost |
| ✅ Mistral 7B Instruct | Open source, lightweight |
| ✅ Amazon Titan Text | AWS native, reliable |

1. Click **"Request model access"**
2. Read and accept the End User License Agreement (EULA) for each model
3. Wait for status to change to **"Access granted"** (usually instant)

### 4.4 Test in Bedrock Playground

1. Go to **"Playgrounds"** → **"Chat"**
2. Select a model (e.g., Claude 3 Haiku)
3. Type a test prompt:

```text
What are three benefits of using synthetic data for machine learning?
```

1. Click **"Run"**
2. If you get a response, Bedrock is working! 🎉

---

## Step 5: Activate Amazon SageMaker

Amazon SageMaker is a full ML platform for training, deploying, and managing models.

### 5.1 Navigate to SageMaker

1. In the AWS Console search bar, type **"SageMaker"**
2. Click **"Amazon SageMaker"**

### 5.2 Open SageMaker Studio

SageMaker Studio is a web-based IDE for ML development.

1. Click **"Studio"** in the left sidebar
2. Click **"Create a SageMaker Domain"** (first time only)

### 5.3 Set Up SageMaker Domain

1. Select **"Set up for single user (Quick setup)"**
2. Keep the default domain name or customize it
3. Choose an execution role:
   - Select **"Create a new role"**
   - For S3 buckets, choose **"Any S3 bucket"** (for learning)
   - Click **"Create role"**
4. Click **"Submit"**
5. Wait 5-10 minutes for the domain to be created

### 5.4 Launch SageMaker Studio

1. Once the domain is ready, click **"Open Studio"**
2. This opens a JupyterLab-like environment in your browser
3. You can now create notebooks and run ML code!

### 5.5 Try SageMaker JumpStart

JumpStart provides pre-trained models you can deploy with one click.

1. In SageMaker Studio, click **"JumpStart"** in the left sidebar
2. Browse available models:
   - 🔍 Search for "Llama" or "Mistral"
   - 🔍 Look for "Text Generation" models
3. Click on a model to see details
4. **Note**: Deploying models incurs costs—start with Bedrock for free experimentation

---

## Step 6: Install AWS CLI

The AWS CLI lets you interact with AWS from your terminal.

### 6.1 Install on macOS

```bash
# Using Homebrew (recommended)
brew install awscli

# Or download directly
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### 6.2 Install on Windows

1. Download the installer: [AWS CLI MSI Installer](https://awscli.amazonaws.com/AWSCLIV2.msi)
2. Run the installer
3. Follow the prompts

### 6.3 Install on Linux

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### 6.4 Configure AWS CLI

Run the configuration wizard:

```bash
aws configure
```

Enter the following when prompted:

```text
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: us-east-1
Default output format [None]: json
```

### 6.5 Verify Installation

```bash
# Check version
aws --version

# Test authentication
aws sts get-caller-identity
```

Expected output:

```json
{
    "UserId": "AIDAEXAMPLE123456789",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/ai-developer"
}
```

---

## Step 7: Test Your Setup

### 7.1 Install Python SDK

```bash
pip install boto3
```

### 7.2 Test Bedrock API

Create a file called `test_bedrock.py`:

```python
import boto3
import json

# Create Bedrock runtime client
bedrock = boto3.client(
    'bedrock-runtime',
    region_name='us-east-1'  # Change to your region
)

# Test with Claude 3 Haiku
response = bedrock.invoke_model(
    modelId='anthropic.claude-3-haiku-20240307-v1:0',
    body=json.dumps({
        'anthropic_version': 'bedrock-2023-05-31',
        'max_tokens': 500,
        'messages': [
            {
                'role': 'user',
                'content': 'Explain what Amazon Bedrock is in 2 sentences.'
            }
        ]
    })
)

# Parse and print response
result = json.loads(response['body'].read())
print("✅ Bedrock is working!\n")
print(result['content'][0]['text'])
```

Run it:

```bash
python test_bedrock.py
```

### 7.3 Test SageMaker API

Create a file called `test_sagemaker.py`:

```python
import boto3

# Create SageMaker client
sagemaker = boto3.client('sagemaker', region_name='us-east-1')

# List your SageMaker domains
response = sagemaker.list_domains()

if response['Domains']:
    print("✅ SageMaker is working!\n")
    for domain in response['Domains']:
        print(f"Domain: {domain['DomainName']}")
        print(f"Status: {domain['Status']}")
else:
    print("No SageMaker domains found. Create one in the console first!")
```

Run it:

```bash
python test_sagemaker.py
```

---

## Free Tier Limits

Stay within these limits to avoid charges:

| Service | Free Tier Limit |
|---------|----------------|
| **Bedrock** | No free tier—pay per token (very cheap for testing) |
| **SageMaker Studio** | 250 hours/month for first 2 months |
| **SageMaker Notebooks** | 250 hours/month of ml.t3.medium |
| **S3 Storage** | 5 GB standard storage |
| **Lambda** | 1 million requests/month |

**💡 Tip**: Use Bedrock for learning—it's pay-per-use and very affordable for experimentation.

---

## Cost Estimates for Learning

| Activity | Estimated Cost |
|----------|---------------|
| Bedrock: 100 Claude Haiku queries | ~$0.05 |
| Bedrock: 100 Claude Sonnet queries | ~$0.50 |
| SageMaker Studio: 10 hours/month | Free (first 2 months) |
| Deploying a model on SageMaker | $0.50-5.00/hour |

---

## Quick Reference

### Sign-In URLs

- **Root Account**: <https://console.aws.amazon.com>
- **IAM User**: `https://YOUR_ACCOUNT_ID.signin.aws.amazon.com/console`

### Key Regions for AI Services

- **us-east-1** (N. Virginia) - Best model selection
- **us-west-2** (Oregon) - Good alternative

### Useful Console Links

- [Bedrock Console](https://console.aws.amazon.com/bedrock)
- [SageMaker Console](https://console.aws.amazon.com/sagemaker)
- [Billing Dashboard](https://console.aws.amazon.com/billing)
- [IAM Console](https://console.aws.amazon.com/iam)

---

## Troubleshooting

### "Access Denied" in Bedrock

1. Check that your IAM user has `AmazonBedrockFullAccess` policy
2. Verify you requested access to the specific model
3. Make sure you're in a supported region

### "Throttling" Errors

1. You're sending too many requests too fast
2. Add delays between API calls
3. Request a quota increase if needed

### SageMaker Domain Stuck "Creating"

1. Wait up to 15 minutes
2. Check CloudWatch Logs for errors
3. Try a different region

### High Unexpected Charges

1. Check Billing Dashboard immediately
2. Look for running SageMaker endpoints (stop them!)
3. Check for forgotten EC2 instances
4. Set up budget alerts (Step 2)

---

## Next Steps

Now that your AWS account is set up:

1. ✅ [Try the Bedrock Playground](./aws-bedrock/README.md)
2. ✅ [Run your first API call](./aws-bedrock/README.md#step-5-set-up-api-access-python)
3. ✅ [Explore SageMaker JumpStart models](https://console.aws.amazon.com/sagemaker)
4. ✅ Return to [Module 1](../module-1-specifications/README.md) to learn about data specifications
