#!/usr/bin/env python3
"""
Fine-Tune Mistral 7B with LoRA/QLoRA

This script fine-tunes Mistral 7B using parameter-efficient methods
(LoRA/QLoRA) for data management and generation tasks.
"""

import os
import argparse
from pathlib import Path

import yaml
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import (
    LoraConfig,
    get_peft_model,
    prepare_model_for_kbit_training,
    TaskType,
)
from trl import SFTTrainer


def load_config(config_path: str) -> dict:
    """Load configuration from YAML file."""
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)


def get_device():
    """Determine the best available device."""
    if torch.cuda.is_available():
        return "cuda"
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def setup_model_and_tokenizer(config: dict):
    """
    Set up the model and tokenizer with optional quantization.
    
    Args:
        config: Configuration dictionary
    
    Returns:
        Tuple of (model, tokenizer)
    """
    model_name = config["model"]["name"]
    cache_dir = config["model"].get("cache_dir", "./models")
    
    print(f"\n🔧 Loading model: {model_name}")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        cache_dir=cache_dir,
        trust_remote_code=True,
    )
    
    # Set padding token
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"
    
    # Configure quantization
    quant_config = config.get("quantization", {})
    if quant_config.get("enabled", False):
        print("📦 Using 4-bit quantization (QLoRA)")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=quant_config.get("load_in_4bit", True),
            bnb_4bit_quant_type=quant_config.get("bnb_4bit_quant_type", "nf4"),
            bnb_4bit_compute_dtype=getattr(
                torch, 
                quant_config.get("bnb_4bit_compute_dtype", "float16")
            ),
            bnb_4bit_use_double_quant=quant_config.get("bnb_4bit_use_double_quant", True),
        )
    else:
        bnb_config = None
        print("📦 Loading model in full precision")
    
    # Load model
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        cache_dir=cache_dir,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.float16,
    )
    
    # Prepare for k-bit training if quantized
    if bnb_config:
        model = prepare_model_for_kbit_training(model)
    
    # Enable gradient checkpointing
    model.gradient_checkpointing_enable()
    
    print("✅ Model loaded successfully")
    return model, tokenizer


def setup_lora(model, config: dict):
    """
    Configure and apply LoRA adapters to the model.
    
    Args:
        model: The base model
        config: Configuration dictionary
    
    Returns:
        Model with LoRA adapters
    """
    lora_config = config.get("lora", {})
    
    print("\n🔗 Configuring LoRA adapters")
    print(f"   Rank (r): {lora_config.get('r', 64)}")
    print(f"   Alpha: {lora_config.get('lora_alpha', 16)}")
    print(f"   Target modules: {lora_config.get('target_modules', [])}")
    
    peft_config = LoraConfig(
        r=lora_config.get("r", 64),
        lora_alpha=lora_config.get("lora_alpha", 16),
        lora_dropout=lora_config.get("lora_dropout", 0.1),
        bias=lora_config.get("bias", "none"),
        task_type=TaskType.CAUSAL_LM,
        target_modules=lora_config.get("target_modules", [
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ]),
    )
    
    model = get_peft_model(model, peft_config)
    
    # Print trainable parameters
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"\n📊 Trainable parameters: {trainable_params:,} / {total_params:,}")
    print(f"   Percentage: {100 * trainable_params / total_params:.2f}%")
    
    return model


def load_training_data(config: dict):
    """
    Load training and evaluation datasets.
    
    Args:
        config: Configuration dictionary
    
    Returns:
        Tuple of (train_dataset, eval_dataset)
    """
    data_config = config.get("data", {})
    train_file = data_config.get("train_file", "./data/processed/train.jsonl")
    eval_file = data_config.get("eval_file", "./data/processed/eval.jsonl")
    
    print(f"\n📂 Loading training data from: {train_file}")
    
    # Check if files exist
    if not Path(train_file).exists():
        raise FileNotFoundError(
            f"Training file not found: {train_file}\n"
            "Run: python scripts/prepare_data.py first"
        )
    
    train_dataset = load_dataset("json", data_files=train_file, split="train")
    
    if Path(eval_file).exists():
        eval_dataset = load_dataset("json", data_files=eval_file, split="train")
        print(f"   Training examples: {len(train_dataset)}")
        print(f"   Evaluation examples: {len(eval_dataset)}")
    else:
        eval_dataset = None
        print(f"   Training examples: {len(train_dataset)}")
        print(f"   No evaluation file found (optional)")
    
    return train_dataset, eval_dataset


def train(config_path: str, resume_from: str = None):
    """
    Main training function.
    
    Args:
        config_path: Path to configuration YAML file
        resume_from: Path to checkpoint to resume from (optional)
    """
    print("\n" + "=" * 60)
    print("🚀 MISTRAL 7B FINE-TUNING WITH LoRA")
    print("=" * 60)
    
    # Load configuration
    config = load_config(config_path)
    
    # Check device
    device = get_device()
    print(f"\n💻 Device: {device}")
    if device == "cuda":
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
        print(f"   VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    
    # Setup model and tokenizer
    model, tokenizer = setup_model_and_tokenizer(config)
    
    # Apply LoRA
    model = setup_lora(model, config)
    
    # Load data
    train_dataset, eval_dataset = load_training_data(config)
    
    # Training arguments
    train_config = config.get("training", {})
    output_dir = train_config.get("output_dir", "./models/mistral-7b-finetuned")
    
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=train_config.get("num_train_epochs", 3),
        per_device_train_batch_size=train_config.get("per_device_train_batch_size", 4),
        per_device_eval_batch_size=train_config.get("per_device_eval_batch_size", 4),
        gradient_accumulation_steps=train_config.get("gradient_accumulation_steps", 4),
        gradient_checkpointing=train_config.get("gradient_checkpointing", True),
        learning_rate=train_config.get("learning_rate", 2e-4),
        lr_scheduler_type=train_config.get("lr_scheduler_type", "cosine"),
        warmup_ratio=train_config.get("warmup_ratio", 0.03),
        weight_decay=train_config.get("weight_decay", 0.001),
        optim=train_config.get("optim", "paged_adamw_32bit"),
        max_grad_norm=train_config.get("max_grad_norm", 0.3),
        logging_steps=train_config.get("logging_steps", 10),
        save_steps=train_config.get("save_steps", 100),
        eval_steps=train_config.get("eval_steps", 100) if eval_dataset else None,
        evaluation_strategy="steps" if eval_dataset else "no",
        save_total_limit=train_config.get("save_total_limit", 3),
        fp16=train_config.get("fp16", False),
        bf16=train_config.get("bf16", True),
        push_to_hub=False,
        report_to="wandb" if config.get("wandb", {}).get("enabled", False) else "none",
    )
    
    # Create trainer
    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        args=training_args,
        dataset_text_field="text",
        max_seq_length=train_config.get("max_seq_length", 2048),
        packing=train_config.get("packing", True),
    )
    
    print("\n" + "=" * 60)
    print("🎯 STARTING TRAINING")
    print("=" * 60)
    print(f"\n   Output directory: {output_dir}")
    print(f"   Epochs: {train_config.get('num_train_epochs', 3)}")
    print(f"   Batch size: {train_config.get('per_device_train_batch_size', 4)}")
    print(f"   Gradient accumulation: {train_config.get('gradient_accumulation_steps', 4)}")
    print(f"   Effective batch size: {train_config.get('per_device_train_batch_size', 4) * train_config.get('gradient_accumulation_steps', 4)}")
    print(f"   Learning rate: {train_config.get('learning_rate', 2e-4)}")
    print("\n")
    
    # Train
    if resume_from:
        trainer.train(resume_from_checkpoint=resume_from)
    else:
        trainer.train()
    
    # Save the final model
    print("\n💾 Saving final model...")
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\nModel saved to: {output_dir}")
    print("\nNext steps:")
    print("  1. Test your model: python scripts/inference.py")
    print("  2. Export for Ollama: python scripts/export_model.py")


def main():
    parser = argparse.ArgumentParser(
        description="Fine-tune Mistral 7B with LoRA"
    )
    parser.add_argument(
        "--config",
        type=str,
        default="./configs/lora_config.yaml",
        help="Path to training configuration file"
    )
    parser.add_argument(
        "--resume-from",
        type=str,
        default=None,
        help="Path to checkpoint to resume training from"
    )
    
    args = parser.parse_args()
    
    train(args.config, args.resume_from)


if __name__ == "__main__":
    main()
