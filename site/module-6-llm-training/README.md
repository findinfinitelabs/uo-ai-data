# Module 6: LLM Fine-Tuning with StableLM

This module covers downloading, fine-tuning, and deploying StableLM for data management and generation tasks.

> **Why StableLM?** StabilityAI's StableLM models are Apache 2.0 licensed and **non-gated** - no license acceptance required! The 1.6B model is fast to train and works well even on consumer hardware.

## 🎯 What You'll Learn

- Download models from Hugging Face
- Prepare training data from databases
- Fine-tune using LoRA/QLoRA (memory-efficient)
- Generate synthetic data with your fine-tuned model
- Deploy locally for inference

## 📋 Prerequisites

- **GPU**: NVIDIA GPU with 8GB+ VRAM for full fine-tuning
  - 4GB VRAM works with QLoRA (quantized) for 1.6B model
  - CPU-only works but is slow
- **RAM**: 16GB+ recommended
- **Storage**: 20GB+ free space
- **Python**: 3.10+

## 🚀 Quick Start

### 1. Set Up Environment

```bash
cd module-6-llm-training
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Login to Hugging Face

```bash
huggingface-cli login
# Enter your token from https://huggingface.co/settings/tokens
```

### 3. Download the Model

```bash
python scripts/download_model.py
```

### 4. Prepare Training Data

```bash
python scripts/prepare_data.py --source database  # From database
python scripts/prepare_data.py --source csv --file data/training_data.csv  # From CSV
```

### 5. Fine-Tune the Model

```bash
python scripts/train.py --config configs/lora_config.yaml
```

### 6. Test Your Model

```bash
python scripts/inference.py --prompt "Generate a patient record for..."
```

## 📁 Folder Structure

```
module-6-llm-training/
├── README.md
├── requirements.txt
├── configs/
│   ├── lora_config.yaml      # LoRA training configuration
│   └── model_config.yaml     # Model settings
├── scripts/
│   ├── download_model.py     # Download Mistral 7B
│   ├── prepare_data.py       # Prepare training data
│   ├── train.py              # Fine-tuning script
│   ├── inference.py          # Run inference
│   └── export_model.py       # Export to GGUF for Ollama
├── data/
│   ├── raw/                  # Raw training data
│   ├── processed/            # Processed datasets
│   └── examples/             # Example training data
├── models/
│   └── .gitkeep              # Downloaded/trained models go here
└── notebooks/
    └── training_walkthrough.ipynb
```

## 🔧 Training Approaches

### Option 1: QLoRA (Recommended for most users)
- **VRAM Required**: 8-12GB
- **Training Time**: 2-4 hours for 1000 examples
- Uses 4-bit quantization + LoRA adapters
- Best balance of quality and resource usage

### Option 2: Full LoRA
- **VRAM Required**: 16-24GB
- **Training Time**: 4-8 hours for 1000 examples
- Higher quality than QLoRA
- Requires better GPU

### Option 3: Full Fine-Tuning
- **VRAM Required**: 40GB+ (A100)
- **Training Time**: 8-24 hours
- Best quality, but resource-intensive
- Usually overkill for most use cases

## 📊 Use Cases

### 1. Synthetic Data Generation
Train on your existing data patterns to generate realistic synthetic records.

### 2. SQL Query Generation
Fine-tune on natural language → SQL pairs for your specific database schema.

### 3. Data Validation
Train to identify data quality issues and suggest corrections.

### 4. Healthcare Data Tasks
Generate HIPAA-compliant synthetic patient records, clinical notes, etc.

## ⚠️ Important Notes

- **StableLM License**: Apache 2.0 - free for commercial use, no gating
- **Never train on real PHI** without proper de-identification
- Start with a small dataset (100-500 examples) to validate your approach
- Monitor for overfitting with validation loss

## 📚 Resources

- [StabilityAI Models on Hugging Face](https://huggingface.co/stabilityai)
- [Hugging Face PEFT Library](https://huggingface.co/docs/peft)
- [Unsloth - Fast Fine-Tuning](https://github.com/unslothai/unsloth)
- [QLoRA Paper](https://arxiv.org/abs/2305.14314)
