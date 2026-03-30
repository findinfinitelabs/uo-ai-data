# LLM Fine-Tuning Best Practices Skill

## Overview

Guidelines for fine-tuning large language models (LLMs) using parameter-efficient methods like LoRA and QLoRA, optimized for healthcare data applications.

## Why Fine-Tuning?

### Use Cases for Healthcare AI

- **Domain adaptation** - Teach model healthcare terminology and context
- **Task specialization** - Optimize for specific tasks (diagnosis suggestions, clinical notes)
- **Data format learning** - Understand structured health records (JSON, FHIR)
- **Instruction following** - Improve responses to healthcare-specific prompts
- **Privacy preservation** - Train on local/synthetic data without cloud APIs

### When NOT to Fine-Tune

- Pre-trained model already performs well (try prompt engineering first)
- Insufficient training data (<100 high-quality examples)
- Limited compute resources (consider using hosted APIs)
- Regulatory constraints prevent model modification

## Model Selection

### Recommended Models for This Repository

**StableLM 1.6B** (Primary choice)
- ✅ Apache 2.0 license (no restrictions)
- ✅ No gating (instant download)
- ✅ Small enough for consumer hardware
- ✅ Fast fine-tuning (2-4 hours)
- ⚠️ Limited context window (4096 tokens)

**Mistral 7B** (Alternative)
- ✅ Excellent instruction-following
- ✅ Apache 2.0 license
- ✅ Better quality than StableLM
- ⚠️ Requires 8GB+ VRAM for QLoRA

**Llama 2 7B** (Alternative)
- ✅ Well-tested, stable
- ✅ Good documentation
- ⚠️ Llama 2 license (commercial use restrictions)
- ⚠️ Requires 8GB+ VRAM

### Model Size Guidelines

| Model Size | VRAM (QLoRA) | VRAM (Full) | Training Time | Use Case |
|------------|--------------|-------------|---------------|----------|
| 1-3B | 4-6GB | 12-16GB | 2-4 hrs | Learning, prototyping |
| 7B | 8-12GB | 24-32GB | 4-8 hrs | Production, quality |
| 13B | 12-16GB | 40-48GB | 8-16 hrs | High quality |
| 70B+ | 24GB+ | 140GB+ | 24+ hrs | Research only |

## LoRA Configuration

### LoRA Parameters Explained

```yaml
lora:
  r: 64                    # Rank - higher = more capacity
  lora_alpha: 16           # Scaling factor (typically r/4 to r)
  lora_dropout: 0.1        # Regularization (0.05-0.1)
  bias: "none"             # Usually don't train bias
  
  target_modules:          # Which layers to adapt
    - "q_proj"             # Query projection
    - "k_proj"             # Key projection
    - "v_proj"             # Value projection
    - "o_proj"             # Output projection
    - "gate_proj"          # MLP gate
    - "up_proj"            # MLP up
    - "down_proj"          # MLP down
```

### Choosing LoRA Rank (r)

```python
# Low rank (r=8-16): Fast, low VRAM, good for simple tasks
lora_config = LoraConfig(
    r=8,
    lora_alpha=8,
    target_modules=["q_proj", "v_proj"]  # Minimal adaptation
)

# Medium rank (r=32-64): Balanced, recommended for most use cases
lora_config = LoraConfig(
    r=64,
    lora_alpha=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"]
)

# High rank (r=128-256): Maximum capacity, more VRAM
lora_config = LoraConfig(
    r=128,
    lora_alpha=32,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", 
                    "gate_proj", "up_proj", "down_proj"]
)
```

## QLoRA (4-bit Quantization)

### Benefits of QLoRA

- **4x memory reduction** - 7B model fits in 8GB VRAM
- **Minimal quality loss** - NF4 quantization preserves accuracy
- **Faster training** - Smaller memory footprint enables larger batches
- **Accessible** - Run on consumer GPUs (RTX 3080, 4090)

### QLoRA Configuration

```python
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,                      # Enable 4-bit quantization
    bnb_4bit_quant_type="nf4",               # Use NormalFloat4
    bnb_4bit_compute_dtype=torch.float16,   # Compute in FP16
    bnb_4bit_use_double_quant=True,         # Nested quantization
)

model = AutoModelForCausalLM.from_pretrained(
    "mistralai/Mistral-7B-Instruct-v0.2",
    quantization_config=bnb_config,
    device_map="auto"
)
```

## Training Data Preparation

### Data Format

Use instruction-tuning format for healthcare tasks:

```jsonl
{"instruction": "Generate a patient record for a 45-year-old female with Type 2 diabetes.", "output": "{\"patient_id\": \"P001\", \"age\": 45, \"gender\": \"female\", \"diagnoses\": [{\"code\": \"E11.9\", \"description\": \"Type 2 diabetes mellitus\"}]}"}

{"instruction": "What ICD-10 code represents essential hypertension?", "output": "The ICD-10 code for essential (primary) hypertension is I10."}

{"instruction": "Describe the HIPAA Safe Harbor de-identification method.", "output": "HIPAA Safe Harbor requires removing all 18 specified identifiers including names, addresses, dates (except year), and any other unique identifying information."}
```

### Data Quality Guidelines

**Minimum requirements:**
- 100+ high-quality examples
- Diverse instruction types
- Correct, verified outputs
- Consistent formatting
- Balanced task distribution

**Quality checklist:**
```python
def validate_training_example(example):
    """Validate training data quality."""
    
    # Check required fields
    assert 'instruction' in example, "Missing instruction"
    assert 'output' in example, "Missing output"
    
    # Check lengths
    assert len(example['instruction']) > 10, "Instruction too short"
    assert len(example['output']) > 10, "Output too short"
    assert len(example['output']) < 2048, "Output too long"
    
    # Check for PHI (even in synthetic data examples)
    forbidden = ['@', 'SSN', 'Phone:', '555-']
    assert not any(x in example['output'] for x in forbidden), \
        "Potential identifier in output"
    
    return True
```

### Data Augmentation

```python
def augment_training_data(examples):
    """Create variations of training examples."""
    
    augmented = []
    
    for ex in examples:
        # Original
        augmented.append(ex)
        
        # Variation 1: Rephrase instruction
        augmented.append({
            'instruction': rephrase(ex['instruction']),
            'output': ex['output']
        })
        
        # Variation 2: Different patient demographics
        if 'patient' in ex['output']:
            augmented.append({
                'instruction': vary_demographics(ex['instruction']),
                'output': vary_output_demographics(ex['output'])
            })
    
    return augmented
```

## Training Configuration

### Hyperparameters

```yaml
training:
  # Batch sizes (adjust for your VRAM)
  per_device_train_batch_size: 4
  gradient_accumulation_steps: 4    # Effective batch size = 16
  
  # Learning rate (start higher than pre-training)
  learning_rate: 2.0e-4              # Typical: 1e-4 to 5e-4
  lr_scheduler_type: "cosine"
  warmup_ratio: 0.03                 # 3% warmup steps
  
  # Regularization
  weight_decay: 0.001
  max_grad_norm: 1.0
  
  # Training duration
  num_train_epochs: 3                # Usually 2-5 epochs
  
  # Optimization
  optim: "adamw_torch"               # Or "paged_adamw_8bit" for QLoRA
  gradient_checkpointing: true       # Save VRAM
```

### Learning Rate Selection

```python
# Rule of thumb: Higher than pre-training LR
base_lr = 5e-5          # Pre-training LR
lora_lr = base_lr * 10  # LoRA LR (5e-4)

# Adjust based on:
# - Smaller: Larger datasets, more epochs
# - Larger: Smaller datasets, fewer epochs, high rank LoRA
```

### Training Duration

```python
# Calculate total training steps
samples = 1000
batch_size = 4
grad_accum = 4
epochs = 3

steps_per_epoch = samples // (batch_size * grad_accum)
total_steps = steps_per_epoch * epochs

print(f"Total training steps: {total_steps}")
# Output: Total training steps: 187
```

## Monitoring Training

### Key Metrics

```python
# Track these during training
metrics_to_watch = {
    'train_loss': 'Should decrease steadily',
    'eval_loss': 'Should decrease; watch for overfitting',
    'learning_rate': 'Should follow schedule (cosine)',
    'grad_norm': 'Should stay < 10; spikes indicate instability'
}
```

### Detecting Overfitting

```python
# Signs of overfitting:
if eval_loss > train_loss * 1.5:
    print("⚠️ Possible overfitting")
    # Solutions:
    # - Increase dropout
    # - Reduce epochs
    # - Add more training data
    # - Use data augmentation
```

### Early Stopping

```python
# Implement early stopping
class EarlyStoppingCallback:
    def __init__(self, patience=3):
        self.patience = patience
        self.best_eval_loss = float('inf')
        self.counter = 0
    
    def __call__(self, eval_loss):
        if eval_loss < self.best_eval_loss:
            self.best_eval_loss = eval_loss
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                return True  # Stop training
        return False
```

## Inference and Evaluation

### Testing Fine-Tuned Model

```python
from transformers import pipeline

# Load fine-tuned model
generator = pipeline(
    "text-generation",
    model="./models/mistral-7b-finetuned",
    tokenizer="mistralai/Mistral-7B-Instruct-v0.2"
)

# Test with healthcare prompt
prompt = "Generate a patient record for a 65-year-old male with hypertension."
result = generator(prompt, max_length=200, temperature=0.7)

print(result[0]['generated_text'])
```

### Evaluation Metrics

```python
def evaluate_healthcare_model(model, test_examples):
    """Evaluate on healthcare-specific tasks."""
    
    results = {
        'accuracy': 0,
        'format_compliance': 0,
        'medical_accuracy': 0
    }
    
    for example in test_examples:
        output = model.generate(example['instruction'])
        
        # Check format (JSON, correct fields)
        if is_valid_json(output):
            results['format_compliance'] += 1
        
        # Check medical accuracy (ICD-10 codes, etc.)
        if matches_expected(output, example['expected']):
            results['accuracy'] += 1
        
        # Check medical plausibility
        if medically_plausible(output):
            results['medical_accuracy'] += 1
    
    # Normalize scores
    n = len(test_examples)
    return {k: v/n for k, v in results.items()}
```

## Best Practices

### ✅ Do

- Start with small model (1-3B) to iterate quickly
- Use QLoRA for memory efficiency
- Monitor training loss continuously
- Test on held-out evaluation set
- Save checkpoints frequently
- Document all hyperparameters
- Version your training data

### ❌ Don't

- Train without validation set
- Use learning rate too high (>5e-4) or too low (<1e-5)
- Overtrain (watch eval loss)
- Skip data quality checks
- Train on biased or incorrect examples
- Forget to set random seed for reproducibility

## Export for Deployment

### Convert to GGUF (for Ollama)

```python
# Export to GGUF format
from transformers import AutoModelForCausalLM
from gguf import GGUFWriter

# Load fine-tuned model
model = AutoModelForCausalLM.from_pretrained(
    "./models/mistral-7b-finetuned"
)

# Export to GGUF
writer = GGUFWriter(
    path="./models/mistral-7b-healthcare.gguf",
    arch="llama"
)
writer.add_model(model)
writer.write()
```

### Quantize for Production

```bash
# Quantize to smaller sizes
# Q4_K_M: 4-bit, balanced quality/size
# Q5_K_M: 5-bit, higher quality
# Q8_0: 8-bit, minimal loss

llama.cpp/quantize \
  ./models/mistral-7b-healthcare.gguf \
  ./models/mistral-7b-healthcare-q4.gguf \
  Q4_K_M
```

## Troubleshooting

### Common Issues

**Issue: Out of Memory (OOM)**
```python
# Solutions:
1. Enable gradient checkpointing
2. Reduce batch size
3. Increase gradient accumulation
4. Use QLoRA instead of LoRA
5. Reduce LoRA rank
6. Use smaller model
```

**Issue: Loss Not Decreasing**
```python
# Check:
1. Learning rate too low (increase to 2e-4)
2. Data format issues (verify examples)
3. Model not trainable (check requires_grad)
4. Gradient clipping too aggressive (increase max_grad_norm)
```

**Issue: Model Outputs Gibberish**
```python
# Causes:
1. Learning rate too high (reduce to 1e-4)
2. Too many epochs (reduce to 2-3)
3. Bad training data (review and clean)
4. Wrong tokenizer (verify compatibility)
```

## Resource Requirements

### Minimum Hardware

**For 1.6B model (QLoRA):**
- 4GB VRAM (RTX 3050)
- 16GB RAM
- 20GB storage

**For 7B model (QLoRA):**
- 8GB VRAM (RTX 3060)
- 32GB RAM
- 50GB storage

**For 7B model (Full fine-tuning):**
- 24GB VRAM (RTX 3090, A5000)
- 64GB RAM
- 100GB storage

### Training Time Estimates

| Model | Examples | Hardware | Time |
|-------|----------|----------|------|
| 1.6B | 1000 | RTX 3060 | 2-3 hrs |
| 7B (QLoRA) | 1000 | RTX 3060 | 4-6 hrs |
| 7B (Full) | 1000 | A100 | 8-12 hrs |
| 13B (QLoRA) | 1000 | RTX 4090 | 8-12 hrs |

## Quick Reference Commands

```bash
# Download model
python scripts/download_model.py

# Prepare training data
python scripts/prepare_data.py --source database

# Fine-tune with LoRA
python scripts/train.py --config configs/lora_config.yaml

# Fine-tune with QLoRA (lower VRAM)
python scripts/train.py --config configs/qlora_config.yaml

# Test inference
python scripts/inference.py --prompt "Your prompt here"

# Export to GGUF
python scripts/export_model.py --format gguf

# Quantize model
python scripts/export_model.py --format gguf --quantize q4_k_m
```
