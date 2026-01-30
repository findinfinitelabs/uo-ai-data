#!/usr/bin/env python3
"""
Download StableLM from Hugging Face

This script downloads the StableLM model and tokenizer
to your local machine for fine-tuning.
"""

import os
import argparse
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from huggingface_hub import login, snapshot_download


def get_device_info():
    """Print information about available compute devices."""
    print("\n" + "=" * 50)
    print("DEVICE INFORMATION")
    print("=" * 50)
    
    if torch.cuda.is_available():
        print(f"✅ CUDA Available: {torch.cuda.get_device_name(0)}")
        print(f"   VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
        print(f"   CUDA Version: {torch.version.cuda}")
    else:
        print("❌ CUDA not available - CPU only (training will be slow)")
    
    if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        print("✅ Apple MPS Available (Metal GPU)")
    
    print("=" * 50 + "\n")


def download_model(
    model_name: str = "stabilityai/stablelm-2-zephyr-1_6b",
    cache_dir: str = "./models",
    quantize: bool = False,
    token: str = None
):
    """
    Download StableLM model and tokenizer.
    
    Args:
        model_name: Hugging Face model identifier
        cache_dir: Directory to save the model
        quantize: If True, download with 4-bit quantization config
        token: Hugging Face API token
    """
    cache_path = Path(cache_dir)
    cache_path.mkdir(parents=True, exist_ok=True)
    
    print(f"\n📥 Downloading model: {model_name}")
    print(f"📁 Cache directory: {cache_path.absolute()}")
    
    # Login to Hugging Face if token provided
    if token:
        login(token=token)
        print("✅ Logged in to Hugging Face")
    
    # Download tokenizer first (smaller, faster)
    print("\n⏳ Downloading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        cache_dir=cache_dir,
        trust_remote_code=True
    )
    
    # Set padding token if not set
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    print("✅ Tokenizer downloaded successfully")
    
    # Configure quantization if requested
    if quantize:
        print("\n⏳ Downloading model with 4-bit quantization...")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )
        
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            quantization_config=bnb_config,
            cache_dir=cache_dir,
            device_map="auto",
            trust_remote_code=True,
        )
    else:
        # Just download the model files without loading into memory
        print("\n⏳ Downloading model files (this may take 15-30 minutes)...")
        model_path = snapshot_download(
            repo_id=model_name,
            cache_dir=cache_dir,
            ignore_patterns=["*.md", "*.txt"],  # Skip documentation files
        )
        print(f"✅ Model files downloaded to: {model_path}")
    
    print("\n" + "=" * 50)
    print("✅ DOWNLOAD COMPLETE!")
    print("=" * 50)
    print(f"\nModel ready at: {cache_path.absolute()}")
    print("\nNext steps:")
    print("  1. Prepare your training data: python scripts/prepare_data.py")
    print("  2. Start fine-tuning: python scripts/train.py")
    

def main():
    parser = argparse.ArgumentParser(
        description="Download StableLM from Hugging Face"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="stabilityai/stablelm-2-zephyr-1_6b",
        help="Model name on Hugging Face"
    )
    parser.add_argument(
        "--cache-dir",
        type=str,
        default="./models",
        help="Directory to save the model"
    )
    parser.add_argument(
        "--quantize",
        action="store_true",
        help="Download with 4-bit quantization (for testing on smaller GPUs)"
    )
    parser.add_argument(
        "--token",
        type=str,
        default=None,
        help="Hugging Face API token (or set HF_TOKEN env variable)"
    )
    
    args = parser.parse_args()
    
    # Get token from environment if not provided
    token = args.token or os.environ.get("HF_TOKEN")
    
    get_device_info()
    download_model(
        model_name=args.model,
        cache_dir=args.cache_dir,
        quantize=args.quantize,
        token=token
    )


if __name__ == "__main__":
    main()
