# Quick Start Guide

Get up and running with AI in 10 minutes. Choose your path:

## Decision Tree

```text
Do you have UO credentials and prefer cloud-based?
├── YES → Use AWS Bedrock (Option A)
└── NO or prefer local?
    └── Use Ollama (Option B)
```

## Option A: AWS Bedrock Quick Start

### 1. Sign In (2 min)

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock)
2. Sign in with UO credentials
3. Navigate to **Playgrounds** → **Chat**

### 2. Send Your First Prompt (1 min)

Select **Claude 3 Haiku** and try:

```text
You are a helpful assistant for healthcare data science students.
Explain what "de-identification" means and why it matters for HIPAA.
```

### 3. Experiment (5 min)

Try these prompts to explore different capabilities:

**Summarization:**

```text
Summarize the key points of HIPAA's Safe Harbor method in 3 bullet points.
```

**Code Generation:**

```text
Write a Python function that validates an ICD-10 diagnosis code format.
```

**Analysis:**

```text
What are the pros and cons of using synthetic data vs. real de-identified data for training healthcare AI models?
```

## Option B: Ollama Quick Start

### 1. Install Ollama (3 min)

```bash
# Download from ollama.com or use Homebrew
brew install ollama
```

### 2. Download a Model (5 min)

```bash
# For 8GB RAM Macs
ollama pull phi3:mini

# For 16GB+ RAM Macs
ollama pull mistral:7b-instruct
```

### 3. Chat with the Model (2 min)

```bash
ollama run phi3:mini
```

Try these prompts:

```text
>>> Explain what RAG means in AI
>>> What's the difference between fine-tuning and prompt engineering?
>>> /bye
```

## First Exercises

Once you're set up, try these exercises:

### Exercise 1: Basic Prompt

Ask the model to explain a concept from this course:

```text
Explain the difference between inference, RAG, and fine-tuning 
as if you were explaining to a business student with no AI background.
```

### Exercise 2: Structured Output

Ask for structured data:

```text
Generate a JSON schema for a patient record that includes:
- Patient ID
- Age
- Gender
- List of diagnoses with ICD-10 codes
- List of medications

Follow JSON Schema draft-07 format.
```

### Exercise 3: Code Generation

```text
Write a Python function called validate_patient_id that:
1. Takes a patient_id string as input
2. Returns True if it matches the pattern P followed by 8 digits
3. Returns False otherwise
Include type hints and a docstring.
```

### Exercise 4: Compare Models

If you have access to both AWS Bedrock and Ollama, try the same prompt on different models and compare:

- Response quality
- Speed
- Level of detail
- Code correctness (if applicable)

## Troubleshooting Quick Fixes

### AWS Bedrock

| Problem | Solution |
| --- | --- |
| Can't access Bedrock | Check UO AWS portal access |
| Model not available | Request access in Model Access settings |
| Slow response | Try Claude 3 Haiku (fastest) |

### Ollama

| Problem | Solution |
| --- | --- |
| Command not found | Restart terminal after install |
| Out of memory | Use `phi3:mini` instead |
| Slow generation | Close other apps, use smaller model |

## Next Steps

- [→ AWS Bedrock Full Guide](./aws-bedrock/README.md)
- [→ Local Setup Full Guide](./local-setup/README.md)
- [→ Module 3: Regulations & Compliance](../module-3-regulations/README.md)
