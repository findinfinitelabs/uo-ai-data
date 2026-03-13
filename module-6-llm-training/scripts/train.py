#!/usr/bin/env python3
"""
Fine-Tune TinyLlama 1.1B with LoRA (CPU-compatible)

Runs on any Windows/macOS/Linux machine without a GPU.
Expected time: ~30-60 min on a modern laptop CPU for 3 epochs / 300 examples.

Usage:
    python scripts/train.py \
        --config configs/lora_config.yaml \
        --data data/processed/train.jsonl \
        --output models/healthcare-lora
"""

import argparse
from pathlib import Path

import yaml
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, TaskType
from trl import SFTTrainer


def load_config(config_path: str) -> dict:
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def get_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def setup_model_and_tokenizer(config: dict):
    model_name = config["model"]["name"]
    cache_dir = config["model"].get("cache_dir", "./models")
    device = get_device()

    print(f"\nLoading model: {model_name}")
    print(f"Device       : {device}")
    if device == "cuda":
        print(f"GPU          : {torch.cuda.get_device_name(0)}")
    
    tokenizer = AutoTokenizer.from_pretrained(
        model_name, cache_dir=cache_dir, trust_remote_code=True
    )
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # CPU-compatible: no quantization, float32
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        cache_dir=cache_dir,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True,
    )
    model.gradient_checkpointing_enable()
    print("Model loaded successfully")
    return model, tokenizer


def setup_lora(model, config: dict):
    lora_cfg = config.get("lora", {})
    peft_config = LoraConfig(
        r=lora_cfg.get("r", 8),
        lora_alpha=lora_cfg.get("lora_alpha", 16),
        lora_dropout=lora_cfg.get("lora_dropout", 0.05),
        bias=lora_cfg.get("bias", "none"),
        task_type=TaskType.CAUSAL_LM,
        target_modules=lora_cfg.get("target_modules", ["q_proj", "v_proj"]),
    )
    model = get_peft_model(model, peft_config)
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    print(f"LoRA adapters applied — trainable params: {trainable:,} / {total:,} ({100*trainable/total:.2f}%)")
    return model


def load_training_data(train_file: str, eval_file: str = None):
    if not Path(train_file).exists():
        raise FileNotFoundError(
            f"Training file not found: {train_file}\n"
            "Run: python scripts/prepare_data.py --source dynamodb --profile uo-innovation first"
        )
    train_dataset = load_dataset("json", data_files=train_file, split="train")
    eval_dataset = None
    if eval_file and Path(eval_file).exists():
        eval_dataset = load_dataset("json", data_files=eval_file, split="train")
    print(f"Training examples  : {len(train_dataset)}")
    if eval_dataset:
        print(f"Evaluation examples: {len(eval_dataset)}")
    return train_dataset, eval_dataset


def train(config_path: str, data_file: str, output_dir: str, resume_from: str = None):
    print("\n" + "=" * 60)
    print("  TinyLlama 1.1B  LoRA Fine-Tuning (CPU)")
    print("=" * 60)

    config = load_config(config_path)
    t = config.get("training", {})
    out = output_dir or t.get("output_dir", "./models/healthcare-lora")

    model, tokenizer = setup_model_and_tokenizer(config)
    model = setup_lora(model, config)

    eval_file = str(Path(data_file).parent / "eval.jsonl")
    train_dataset, eval_dataset = load_training_data(data_file, eval_file)

    training_args = TrainingArguments(
        output_dir=out,
        num_train_epochs=t.get("num_train_epochs", 3),
        per_device_train_batch_size=t.get("per_device_train_batch_size", 1),
        per_device_eval_batch_size=t.get("per_device_eval_batch_size", 1),
        gradient_accumulation_steps=t.get("gradient_accumulation_steps", 8),
        gradient_checkpointing=t.get("gradient_checkpointing", True),
        learning_rate=t.get("learning_rate", 2e-4),
        lr_scheduler_type=t.get("lr_scheduler_type", "cosine"),
        warmup_ratio=t.get("warmup_ratio", 0.03),
        weight_decay=t.get("weight_decay", 0.001),
        optim="adamw_torch",           # CPU-compatible optimizer
        max_grad_norm=t.get("max_grad_norm", 0.3),
        logging_steps=t.get("logging_steps", 5),
        save_steps=t.get("save_steps", 50),
        eval_steps=t.get("eval_steps", 50) if eval_dataset else None,
        evaluation_strategy="steps" if eval_dataset else "no",
        save_total_limit=2,
        fp16=False,
        bf16=False,                     # CPU does not support bf16
        use_cpu=get_device() == "cpu",
        push_to_hub=False,
        report_to="none",
    )

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        args=training_args,
        dataset_text_field="text",
        max_seq_length=t.get("max_seq_length", 512),
        packing=False,                  # Disable packing for CPU stability
    )

    print(f"\nOutput directory: {out}")
    print(f"Epochs          : {t.get('num_train_epochs', 3)}")
    print(f"Max seq length  : {t.get('max_seq_length', 512)}")
    print("\nStarting training — watch for 'loss' decreasing each epoch...\n")

    trainer.train(resume_from_checkpoint=resume_from)

    print("\nSaving model...")
    trainer.save_model(out)
    tokenizer.save_pretrained(out)

    print("\n" + "=" * 60)
    print("  Training complete!")
    print("=" * 60)
    print(f"\nAdapter saved to: {out}")
    print("\nNext: python scripts/inference.py --model", out)


def main():
    parser = argparse.ArgumentParser(description="Fine-tune TinyLlama 1.1B with LoRA (CPU)")
    parser.add_argument("--config", type=str, default="./configs/lora_config.yaml")
    parser.add_argument("--data", type=str, default="./data/processed/train.jsonl",
                        help="Path to training JSONL file")
    parser.add_argument("--output", type=str, default="./models/healthcare-lora",
                        help="Directory to save the LoRA adapter")
    parser.add_argument("--resume-from", type=str, default=None)
    args = parser.parse_args()
    train(args.config, args.data, args.output, args.resume_from)


if __name__ == "__main__":
    main()
