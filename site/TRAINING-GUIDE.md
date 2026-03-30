# Healthcare AI — LLM Training Guide

Fine-tune **TinyLlama 1.1B** on synthetic healthcare data from DynamoDB.  
Works on any Windows, macOS, or Linux laptop CPU — no GPU required.

---

## Prerequisites

- Python 3.9+ installed
- AWS SSO authenticated (`aws sso login --profile uo-innovation`)
- DynamoDB tables populated (Phase 2 complete — 100 patient records in `healthcare-patients`)

---

## Setup (one-time)

```bash
cd module-6-llm-training
python -m venv .venv-train
```

**Windows:**
```powershell
.venv-train\Scripts\activate
pip install -r requirements.txt
```

**macOS / Linux:**
```bash
source .venv-train/bin/activate
pip install -r requirements.txt
```

---

## Step 1 — Download the base model (~2.2 GB, one-time)

```bash
python scripts/download_model.py
```

The model is cached in `~/.cache/huggingface/`. You only need to do this once.  
A sanity check runs at the end — you should see a short sentence printed.

---

## Step 2 — Prepare training data from DynamoDB

```bash
python scripts/prepare_data.py \
  --source dynamodb \
  --profile uo-innovation \
  --output-dir data/processed
```

**Windows PowerShell:**
```powershell
python scripts/prepare_data.py `
  --source dynamodb `
  --profile uo-innovation `
  --output-dir data/processed
```

**Expected output:**
```
Connecting to DynamoDB (profile=uo-innovation, region=us-west-2)...
  Found 100 patients
  Generated 400 instruction pairs from DynamoDB

Dataset saved:
  Training  : 360 examples -> data/processed/train.jsonl
  Evaluation: 40 examples  -> data/processed/eval.jsonl
```

**Verify the file:**
```bash
# macOS / Linux
wc -l data/processed/train.jsonl
head -n 1 data/processed/train.jsonl

# Windows PowerShell
(Get-Content data/processed/train.jsonl).Count
Get-Content data/processed/train.jsonl | Select-Object -First 1
```

You should see **at least 200 lines** and JSON containing a `text` field with the TinyLlama chat format.

---

## Step 3 — Fine-tune the model

```bash
python scripts/train.py \
  --config configs/lora_config.yaml \
  --data data/processed/train.jsonl \
  --output models/healthcare-lora
```

**Windows PowerShell:**
```powershell
python scripts/train.py `
  --config configs/lora_config.yaml `
  --data data/processed/train.jsonl `
  --output models/healthcare-lora
```

**Expected training output:**
```
TinyLlama 1.1B  LoRA Fine-Tuning (CPU)
=======================================
Loading model: TinyLlama/TinyLlama-1.1B-Chat-v1.0
Device       : cpu
LoRA adapters applied — trainable params: 4,194,304 / 1,104,062,464 (0.38%)
Training examples  : 360

{'loss': 2.88, 'epoch': 0.11}
{'loss': 2.46, 'epoch': 0.22}
{'loss': 1.66, 'epoch': 0.44}
...
{'loss': 0.92, 'epoch': 3.0}

Saving model...
Adapter saved to: models/healthcare-lora
```

**Time estimate:** 30–90 minutes on a modern CPU (varies by processor speed).

**Watch the `loss` value** — it should decrease each epoch. A final loss below 1.5 means the model learned from the data.

---

## Step 4 — Verify the training output

**Check the adapter files exist:**
```bash
# macOS / Linux
ls models/healthcare-lora/

# Windows PowerShell
Get-ChildItem models/healthcare-lora/
```

You should see:
```
adapter_config.json        ← LoRA configuration
adapter_model.safetensors  ← Trained weights (~8–15 MB)
tokenizer.json             ← Tokenizer
tokenizer_config.json
```

If `adapter_model.safetensors` is missing, training did not complete — check the terminal output for errors.

---

## Step 5 — Run inference to test the model

```bash
python scripts/inference.py --model models/healthcare-lora
```

**Expected output:**
```
============================================================

Q: Summarize the demographic profile of patient P001.
A: Age: 45, Gender: Female, BMI: 28.3.
----------------------------------------

Q: What conditions are commonly documented in this dataset?
A: Common diagnoses include: Type 2 Diabetes Mellitus, Essential Hypertension, Hyperlipidemia.
----------------------------------------

Q: What medications appear in this healthcare dataset?
A: Medications documented include: Metformin, Lisinopril, Atorvastatin.
----------------------------------------
```

**Ask a custom question:**
```bash
python scripts/inference.py --model models/healthcare-lora --prompt "What is the average age of patients in this dataset?"
```

---

## Troubleshooting

| Error | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'boto3'` | Run `pip install -r requirements.txt` inside your venv |
| `botocore.exceptions.NoCredentialsError` | Run `aws sso login --profile uo-innovation` |
| `FileNotFoundError: data/processed/train.jsonl` | Run Step 2 (prepare_data.py) first |
| `Adapter not found: models/healthcare-lora` | Run Step 3 (train.py) first |
| Training loss stays above 3.0 | Check that train.jsonl has 200+ lines; re-run prepare_data.py |
| Out of memory (CPU) | Reduce `per_device_train_batch_size` to `1` in `configs/lora_config.yaml` (already default) |

---

## File structure

```
module-6-llm-training/
├── configs/
│   └── lora_config.yaml          ← Training hyperparameters (TinyLlama, CPU settings)
├── data/
│   └── processed/
│       ├── train.jsonl            ← Generated by prepare_data.py
│       └── eval.jsonl
├── models/
│   └── healthcare-lora/          ← Created by train.py
│       ├── adapter_config.json
│       ├── adapter_model.safetensors
│       └── tokenizer.json
├── scripts/
│   ├── download_model.py         ← Step 1
│   ├── prepare_data.py           ← Step 2 (--source dynamodb)
│   ├── train.py                  ← Step 3
│   └── inference.py              ← Step 4 (verify)
└── requirements.txt              ← CPU-compatible, no CUDA
```
