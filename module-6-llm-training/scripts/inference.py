#!/usr/bin/env python3
"""
Run Inference with Fine-Tuned Mistral 7B

This script loads your fine-tuned model and runs inference
for data management and generation tasks.
"""

import argparse
import json
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel


def get_device():
    """Determine the best available device."""
    if torch.cuda.is_available():
        return "cuda"
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def load_model(
    base_model: str = "mistralai/Mistral-7B-Instruct-v0.2",
    adapter_path: str = None,
    quantize: bool = True,
    cache_dir: str = "./models"
):
    """
    Load the model with optional fine-tuned adapters.
    
    Args:
        base_model: Base model name on Hugging Face
        adapter_path: Path to LoRA adapters (if fine-tuned)
        quantize: Whether to use 4-bit quantization
        cache_dir: Directory where models are cached
    
    Returns:
        Tuple of (model, tokenizer)
    """
    print(f"\n🔧 Loading model: {base_model}")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        base_model,
        cache_dir=cache_dir,
        trust_remote_code=True,
    )
    
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Quantization config
    if quantize:
        print("📦 Using 4-bit quantization")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
        )
    else:
        bnb_config = None
    
    # Load base model
    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        quantization_config=bnb_config,
        cache_dir=cache_dir,
        device_map="auto",
        trust_remote_code=True,
        torch_dtype=torch.float16,
    )
    
    # Load LoRA adapters if provided
    if adapter_path and Path(adapter_path).exists():
        print(f"🔗 Loading LoRA adapters from: {adapter_path}")
        model = PeftModel.from_pretrained(model, adapter_path)
        print("✅ Adapters loaded successfully")
    else:
        print("ℹ️ Using base model without fine-tuning")
    
    model.eval()
    return model, tokenizer


def format_prompt(instruction: str, input_text: str = None) -> str:
    """Format the prompt in Mistral instruction format."""
    if input_text:
        return f"<s>[INST] {instruction}\n\n{input_text} [/INST]\n"
    return f"<s>[INST] {instruction} [/INST]\n"


def generate(
    model,
    tokenizer,
    prompt: str,
    max_new_tokens: int = 1024,
    temperature: float = 0.7,
    top_p: float = 0.95,
    do_sample: bool = True,
):
    """
    Generate text from the model.
    
    Args:
        model: The loaded model
        tokenizer: The tokenizer
        prompt: The formatted prompt
        max_new_tokens: Maximum tokens to generate
        temperature: Sampling temperature
        top_p: Top-p sampling parameter
        do_sample: Whether to use sampling
    
    Returns:
        Generated text
    """
    device = next(model.parameters()).device
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_p=top_p,
            do_sample=do_sample,
            pad_token_id=tokenizer.eos_token_id,
        )
    
    # Decode and extract the response
    full_output = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract just the response (after [/INST])
    if "[/INST]" in full_output:
        response = full_output.split("[/INST]")[-1].strip()
    else:
        response = full_output
    
    return response


def interactive_mode(model, tokenizer, args):
    """Run interactive inference mode."""
    print("\n" + "=" * 60)
    print("🤖 INTERACTIVE MODE")
    print("=" * 60)
    print("\nEnter your prompts below. Type 'quit' to exit.")
    print("Use 'input:' prefix to add context to your instruction.\n")
    
    while True:
        try:
            instruction = input("\n📝 Instruction: ").strip()
            
            if instruction.lower() == 'quit':
                print("\n👋 Goodbye!")
                break
            
            if not instruction:
                continue
            
            # Check for input context
            input_text = None
            if instruction.lower().startswith("input:"):
                print("(Enter your input context, then press Enter twice)")
                lines = []
                while True:
                    line = input()
                    if line == "":
                        break
                    lines.append(line)
                input_text = "\n".join(lines)
                instruction = input("📝 Instruction: ").strip()
            
            # Format and generate
            prompt = format_prompt(instruction, input_text)
            print("\n⏳ Generating...")
            
            response = generate(
                model,
                tokenizer,
                prompt,
                max_new_tokens=args.max_tokens,
                temperature=args.temperature,
                top_p=args.top_p,
            )
            
            print("\n" + "-" * 40)
            print("🤖 Response:")
            print("-" * 40)
            print(response)
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break


def run_examples(model, tokenizer, args):
    """Run example prompts to test the model."""
    examples = [
        {
            "instruction": "Generate a synthetic patient record for a 35-year-old male with asthma.",
            "input": None
        },
        {
            "instruction": "Convert this natural language query to SQL.",
            "input": "Find all customers who made a purchase over $100 in the last month"
        },
        {
            "instruction": "Create a data dictionary entry for an 'orders' table with columns: id, customer_id, product_id, quantity, total_price, order_date, status",
            "input": None
        },
    ]
    
    print("\n" + "=" * 60)
    print("🧪 RUNNING EXAMPLE PROMPTS")
    print("=" * 60)
    
    for i, example in enumerate(examples, 1):
        print(f"\n{'=' * 40}")
        print(f"Example {i}/{len(examples)}")
        print(f"{'=' * 40}")
        print(f"\n📝 Instruction: {example['instruction']}")
        
        if example['input']:
            print(f"📄 Input: {example['input']}")
        
        prompt = format_prompt(example['instruction'], example['input'])
        print("\n⏳ Generating...")
        
        response = generate(
            model,
            tokenizer,
            prompt,
            max_new_tokens=args.max_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
        )
        
        print("\n🤖 Response:")
        print("-" * 40)
        print(response)


def main():
    parser = argparse.ArgumentParser(
        description="Run inference with fine-tuned Mistral 7B"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="mistralai/Mistral-7B-Instruct-v0.2",
        help="Base model name"
    )
    parser.add_argument(
        "--adapter",
        type=str,
        default="./models/mistral-7b-finetuned",
        help="Path to LoRA adapter weights"
    )
    parser.add_argument(
        "--prompt",
        type=str,
        default=None,
        help="Single prompt to run (otherwise enters interactive mode)"
    )
    parser.add_argument(
        "--input",
        type=str,
        default=None,
        help="Optional input context for the prompt"
    )
    parser.add_argument(
        "--examples",
        action="store_true",
        help="Run example prompts"
    )
    parser.add_argument(
        "--max-tokens",
        type=int,
        default=1024,
        help="Maximum tokens to generate"
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=0.7,
        help="Sampling temperature"
    )
    parser.add_argument(
        "--top-p",
        type=float,
        default=0.95,
        help="Top-p sampling parameter"
    )
    parser.add_argument(
        "--no-quantize",
        action="store_true",
        help="Disable 4-bit quantization"
    )
    parser.add_argument(
        "--cache-dir",
        type=str,
        default="./models",
        help="Model cache directory"
    )
    
    args = parser.parse_args()
    
    # Check for adapter
    adapter_path = args.adapter if Path(args.adapter).exists() else None
    
    # Load model
    model, tokenizer = load_model(
        base_model=args.model,
        adapter_path=adapter_path,
        quantize=not args.no_quantize,
        cache_dir=args.cache_dir,
    )
    
    # Run inference
    if args.prompt:
        # Single prompt mode
        prompt = format_prompt(args.prompt, args.input)
        print("\n⏳ Generating...")
        response = generate(
            model,
            tokenizer,
            prompt,
            max_new_tokens=args.max_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
        )
        print("\n🤖 Response:")
        print("-" * 40)
        print(response)
    elif args.examples:
        # Example mode
        run_examples(model, tokenizer, args)
    else:
        # Interactive mode
        interactive_mode(model, tokenizer, args)


if __name__ == "__main__":
    main()
