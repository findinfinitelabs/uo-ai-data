# Local Setup with Ollama

Run AI models locally on your Mac for complete privacy and offline access.

## Prerequisites

- Mac with Apple Silicon (M1/M2/M3) or Intel
- At least 8GB RAM (16GB+ recommended)
- ~10GB free disk space
- macOS 11 (Big Sur) or later

## Step 1: Install Ollama

### Option A: Direct Download (Recommended)

1. Go to [ollama.com](https://ollama.com)
2. Click **Download for macOS**
3. Open the downloaded `.dmg` file
4. Drag Ollama to your Applications folder
5. Open Ollama from Applications

### Option B: Homebrew

```bash
brew install ollama
```

## Step 2: Start Ollama

1. Open Ollama from your Applications
2. You'll see the Ollama icon in your menu bar (llama icon)
3. Ollama runs as a background service

Verify it's running:

```bash
ollama --version
```

## Step 3: Download a Model

Open Terminal and download your first model:

```bash
# Lightweight model (good for 8GB RAM)
ollama pull phi3:mini

# General purpose (needs 16GB RAM)
ollama pull mistral:7b-instruct

# Popular choice (needs 16GB RAM)
ollama pull llama3:8b
```

## Step 4: Test the Model

### Interactive Chat

```bash
ollama run phi3:mini
```

Type your prompt and press Enter. Type `/bye` to exit.

### One-shot Query

```bash
ollama run phi3:mini "Explain what fine-tuning means in AI"
```

## Step 5: Use with Python

### Install the Ollama Python Library

```bash
pip install ollama
```

### Basic Python Example

```python
import ollama

# Simple chat
response = ollama.chat(
    model='phi3:mini',
    messages=[
        {'role': 'user', 'content': 'What is RAG in AI?'}
    ]
)

print(response['message']['content'])
```

### Streaming Response

```python
import ollama

# Stream the response as it generates
stream = ollama.chat(
    model='phi3:mini',
    messages=[{'role': 'user', 'content': 'Explain synthetic data'}],
    stream=True
)

for chunk in stream:
    print(chunk['message']['content'], end='', flush=True)
```

## Recommended Models by RAM

| RAM | Recommended Model | Command |
| --- | --- | --- |
| 8GB | Phi-3 Mini | `ollama pull phi3:mini` |
| 16GB | Mistral 7B | `ollama pull mistral:7b-instruct` |
| 16GB | Llama 3 8B | `ollama pull llama3:8b` |
| 32GB+ | Llama 3 70B (Q4) | `ollama pull llama3:70b-instruct-q4_0` |

## Managing Models

```bash
# List installed models
ollama list

# Remove a model
ollama rm phi3:mini

# Show model info
ollama show phi3:mini
```

## Running as an API Server

Ollama runs an API server on `http://localhost:11434` by default.

### Test the API

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "What is machine learning?",
  "stream": false
}'
```

### Use with Any HTTP Client

```python
import requests

response = requests.post(
    'http://localhost:11434/api/generate',
    json={
        'model': 'phi3:mini',
        'prompt': 'Explain HIPAA in simple terms',
        'stream': False
    }
)

print(response.json()['response'])
```

## Troubleshooting

### "Model not found"

```bash
# Re-pull the model
ollama pull phi3:mini
```

### Slow Performance

- Close other memory-intensive apps
- Use a smaller model (phi3:mini instead of llama3:8b)
- Check Activity Monitor for RAM usage

### Ollama Not Running

```bash
# Start Ollama manually
ollama serve
```

### Out of Memory

- Try a quantized version: `ollama pull llama3:8b-instruct-q4_0`
- Use a smaller model
- Close other applications

## Privacy Benefits

Running locally means:

- ✅ Your prompts never leave your machine
- ✅ No API keys or accounts needed
- ✅ Works without internet (after model download)
- ✅ No usage tracking or data collection
- ✅ Perfect for sensitive or experimental work

## Next Steps

- [→ Back to Module 2 Overview](../README.md)
- [→ Try the Quick Start exercises](../quickstart.md)
- [→ Compare with AWS Bedrock](../aws-bedrock/README.md)
