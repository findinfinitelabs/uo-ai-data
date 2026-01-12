# Module 2: AI Environment Setup

Set up your AI learning environment to start experimenting with language models. Choose the option that best fits your situation:

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
