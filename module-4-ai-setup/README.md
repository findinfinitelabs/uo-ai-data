# Module 2: AI Environment Setup

Set up your AI learning environment to start experimenting with language models.
Choose the option that best fits your situation:

## Start Here: AWS Innovation Sandbox SSO

Before choosing Bedrock or local setup, complete this AWS login flow in your browser and terminal.

1. Log in to AWS Innovation Sandbox at `https://d-9267f25f0e.awsapps.com/start/#/?tab=applications`.
2. Get your AWS account ID from `https://d1xn1vzs9anoa4.cloudfront.net/`.
3. Example account ID: `631285163678` (your students may have a different account ID).
4. Select **Login to account**.
5. Select the role.
6. Open a terminal in VS Code in the `deployment-scripts` folder.
7. Run:

	```bash
	aws configure sso
	```

8. For **SSO Session Name**, use `Winter 2026 Data and AI Training`.
9. For **Start URL**, use `https://d-9267f25f0e.awsapps.com/start`.
10. For **SSO region**, use `us-west-2`.
11. For **Registration scopes**, accept the default (`sso:account:access`).
12. When accounts are listed, choose the account that matches the one you logged into.
13. Choose `users` for the role.
14. For the default AWS region, use `us-west-2`.
15. For output format, accept the default option.

Then run deployment from `deployment-scripts`:

```bash
./deploy-all.sh
```

When prompted during deployment, provide the required credentials.

## 🆕 New to AWS?

If you don't have an AWS account yet, start here:

[→ **AWS Account Setup Guide** (Create account + activate SageMaker & Bedrock)](./aws-account-setup.md)

---

## Two Options for Getting Started

### Option A: AWS Bedrock (School Login)

**Best for:** Students with UO credentials who want access to powerful models without local hardware requirements.

- ✅ Access to Claude, Llama, and other production-grade models
- ✅ No local GPU or RAM requirements
- ✅ Managed infrastructure—just focus on learning
- ⚠️ Requires UO SSO authentication
- ⚠️ Usage may be monitored/limited by school policies

[→ AWS Bedrock Setup Guide](./aws-bedrock/README.md)

### Option B: Local Setup (Ollama)

**Best for:** Students who want to run models on their own Mac for privacy, offline use, or experimentation.

- ✅ Complete privacy—data never leaves your machine
- ✅ No API costs or usage limits
- ✅ Works offline
- ⚠️ Requires 8GB+ RAM (16GB+ recommended)
- ⚠️ Limited to smaller models (7B-13B parameters)

[→ Local Setup Guide](./local-setup/README.md)

## Quick Start

Not sure which to choose? Start here:

[→ Quick Start Guide](./quickstart.md)

## Comparison Table

| Feature | AWS Bedrock | Local (Ollama) |
| --- | --- | --- |
| Model Size | Up to 70B+ | 3B-13B typical |
| Setup Time | ~10 min | ~15 min |
| Cost | Free (school) | Free |
| Privacy | Cloud-based | 100% local |
| Internet Required | Yes | No (after download) |
| Hardware Needs | Any laptop | 8GB+ RAM Mac |

## What You'll Learn

1. How to authenticate and connect to AI services
2. How to send prompts and receive completions
3. How to compare different models
4. Best practices for prompt engineering
5. When to use cloud vs. local models
