# AWS Bedrock Setup (University of Oregon)

This guide walks you through setting up AWS Bedrock using your UO school credentials.

## Prerequisites

- University of Oregon student or faculty account
- Web browser (Chrome, Firefox, Safari)
- Python 3.13+ installed (for API access)

## Step 1: Access AWS Through UO

1. Go to the [UO AWS Portal](https://aws.uoregon.edu) (or your department's AWS access page)
2. Click **Sign in with UO Credentials**
3. Complete Duo two-factor authentication
4. You'll land in the AWS Console

## Step 2: Navigate to Bedrock

1. In the AWS Console, search for **"Bedrock"** in the search bar
2. Click **Amazon Bedrock**
3. Select your region (typically `us-west-2` for Oregon)

## Step 3: Request Model Access

Before using models, you need to request access:

1. In Bedrock, go to **Model access** in the left sidebar
2. Click **Manage model access**
3. Select the models you want to use:
   - ✅ **Claude 3 Haiku** (fast, good for learning)
   - ✅ **Claude 3 Sonnet** (balanced)
   - ✅ **Llama 3 8B Instruct** (open source)
   - ✅ **Mistral 7B Instruct** (open source)
4. Click **Request model access**
5. Wait for approval (usually instant for most models)

## Step 4: Test in the Playground

1. Go to **Playgrounds** → **Chat**
2. Select a model (e.g., Claude 3 Haiku)
3. Type a test prompt:

```text
Explain what RAG (Retrieval-Augmented Generation) is in simple terms.
```

1. Click **Run** to see the response

## Step 5: Set Up API Access (Python)

### Install the AWS SDK

```bash
pip install boto3
```

### Configure Credentials

1. In AWS Console, go to your username (top right) → **Security credentials**
2. Create an access key for CLI/API use
3. Configure locally:

```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Default region: us-west-2
# Default output: json
```

### Test API Access

```python
import boto3
import json

# Create Bedrock runtime client
bedrock = boto3.client('bedrock-runtime', region_name='us-west-2')

# Send a prompt to Claude
response = bedrock.invoke_model(
    modelId='anthropic.claude-3-haiku-20240307-v1:0',
    body=json.dumps({
        'anthropic_version': 'bedrock-2023-05-31',
        'max_tokens': 500,
        'messages': [
            {'role': 'user', 'content': 'What is synthetic data and why is it useful?'}
        ]
    })
)

# Parse and print response
result = json.loads(response['body'].read())
print(result['content'][0]['text'])
```

## Troubleshooting

### "Access Denied" Error

- Make sure you've requested model access (Step 3)
- Check that your AWS credentials are configured correctly
- Verify you're using the correct region

### "Model Not Available" Error

- Some models require additional approval
- Try a different model (Claude 3 Haiku is usually available quickly)

### Credential Issues

- Re-run `aws configure` with fresh credentials
- Check that your access key hasn't expired

## Cost Considerations

- AWS Bedrock charges per token (input and output)
- UO may have credits or limits—check with your instructor
- Claude 3 Haiku is the most cost-effective for learning
- Monitor your usage in the AWS Billing dashboard

## Next Steps

- [→ Back to Module 2 Overview](../README.md)
- [→ Try the Quick Start exercises](../quickstart.md)
- [→ Compare with Local Setup](../local-setup/README.md)
