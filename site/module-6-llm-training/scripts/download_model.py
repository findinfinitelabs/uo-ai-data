#!/usr/bin/env python3
"""
Download TinyLlama 1.1B from Hugging Face

Downloads the model and tokenizer to the local cache (~2.2 GB).
No Hugging Face account or token required (Apache 2.0 license).

Usage:
    python scripts/download_model.py
"""

import argparse
from pathlib import Path
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_NAME = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

def main():
    parser = argparse.ArgumentParser(description="Download TinyLlama 1.1B")
    parser.add_argument("--model", type=str, default=MODEL_NAME)
    parser.add_argument("--cache-dir", type=str, default="./models")
    args = parser.parse_args()

    cache = Path(args.cache_dir)
    cache.mkdir(parents=True, exist_ok=True)

    device = "cpu"
    if torch.cuda.is_available():
        device = "cuda"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        device = "mps"

    print(f"Model    : {args.model}")
    print(f"Cache dir: {cache}")
    print(f"Device   : {device}")
    print()
    print("Downloading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(args.model, cache_dir=str(cache))
    print("Tokenizer downloaded.")

    print("Downloading model weights (~2.2 GB -- may take a few minutes)...")
    model = AutoModelForCausalLM.from_pretrained(
        args.model,
        cache_dir=str(cache),
        dtype=torch.float32,
        low_cpu_mem_usage=True,
    )
    print("Model downloaded.")

    inputs = tokenizer("Lithia Motors AI is", return_tensors="pt")
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=10)
    print("\nSanity check:", tokenizer.decode(out[0], skip_special_tokens=True))
    print("\nDone! Next: python scripts/prepare_data.py --source dynamodb --profile uo-innovation")

if __name__ == "__main__":
    main()
