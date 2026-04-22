#!/usr/bin/env python3
"""
TinyLlama + LoRA inference — optionally pulls live context from DynamoDB tables.

Usage (with DynamoDB context):
  AWS_PROFILE=uo-innovation python3 scripts/inference.py \\
    --model models/healthcare-lora \\
    --tables lithia-vehicles lithia-customers \\
    --region us-west-2 \\
    --prompt "Which vehicles have been on the lot the longest?"

Usage (no DynamoDB):
  python3 scripts/inference.py --model models/healthcare-lora --prompt "What is LoRA?"
"""
import argparse
import json
import torch
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel, PeftConfig

SYSTEM = (
    "You are a helpful automotive data assistant for Lithia Motors. "
    "When given database records, answer questions using only that data. "
    "Be concise and specific."
)


def build_prompt(question: str, context: str = "") -> str:
    user_content = f"{context}\n\n{question}".strip() if context else question
    return f"<|system|>\n{SYSTEM}</s>\n<|user|>\n{user_content}</s>\n<|assistant|>\n"


def fetch_dynamo_context(tables: list[str], region: str, max_rows: int = 10) -> str:
    """Scan up to max_rows from each table and return as a compact text block."""
    try:
        import boto3
    except ImportError:
        print("Warning: boto3 not installed — skipping DynamoDB context.")
        return ""

    db = boto3.resource("dynamodb", region_name=region)
    blocks: list[str] = []
    for table_name in tables:
        try:
            resp = db.Table(table_name).scan(Limit=max_rows)
            items = resp.get("Items", [])
            if not items:
                blocks.append(f"[{table_name}: empty]")
                continue
            rows_text = json.dumps(items, default=str, indent=None, separators=(",", ":"))
            blocks.append(f"[{table_name} — {len(items)} records]\n{rows_text}")
        except Exception as e:
            blocks.append(f"[{table_name}: error — {e}]")
    return "\n\n".join(blocks)


def load_model(adapter_path: str):
    cfg = PeftConfig.from_pretrained(adapter_path)
    base = cfg.base_model_name_or_path
    if torch.cuda.is_available():
        device = "cuda"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        device = "mps"
    else:
        device = "cpu"

    print(f"Base model : {base}")
    print(f"Adapter    : {adapter_path}")
    print(f"Device     : {device}")

    tok = AutoTokenizer.from_pretrained(adapter_path)
    model = AutoModelForCausalLM.from_pretrained(
        base, dtype=torch.float32, low_cpu_mem_usage=True
    )
    model = PeftModel.from_pretrained(model, adapter_path)
    model.eval()
    if device != "cpu":
        model = model.to(device)
    return model, tok, device


def ask(model, tok, device: str, question: str, context: str = "", max_new_tokens: int = 150) -> str:
    p = build_prompt(question, context)
    inp = tok(p, return_tensors="pt")
    if device != "cpu":
        inp = {k: v.to(device) for k, v in inp.items()}
    with torch.no_grad():
        out = model.generate(
            **inp,
            max_new_tokens=max_new_tokens,
            do_sample=False,
            repetition_penalty=1.1,
        )
    return tok.decode(out[0][inp["input_ids"].shape[1]:], skip_special_tokens=True).strip()


DEFAULT_QUESTIONS = [
    "How many records are in this dataset and what do they represent?",
    "What patterns or trends do you notice in the data?",
    "Are there any records that stand out as unusual or incomplete?",
    "Summarize the key fields and their typical values.",
]


def main():
    parser = argparse.ArgumentParser(description="TinyLlama + LoRA inference with optional DynamoDB context")
    parser.add_argument("--model", default="./models/healthcare-lora", help="Path to LoRA adapter directory")
    parser.add_argument("--prompt", default=None, help="Single question to ask")
    parser.add_argument("--tables", nargs="*", default=[], help="DynamoDB table names to fetch as context")
    parser.add_argument("--region", default="us-west-2", help="AWS region for DynamoDB")
    parser.add_argument("--max-rows", type=int, default=10, help="Max rows to fetch per table for context")
    parser.add_argument("--max-tokens", type=int, default=150, help="Max tokens to generate")
    args = parser.parse_args()

    if not Path(args.model).exists():
        print(f"Adapter not found: {args.model}. Run training first.")
        return

    # Fetch DynamoDB context if tables provided
    context = ""
    if args.tables:
        print(f"\nFetching context from DynamoDB tables: {', '.join(args.tables)}")
        context = fetch_dynamo_context(args.tables, args.region, args.max_rows)
        if context:
            print(f"Context loaded ({len(context)} chars)\n")

    model, tok, device = load_model(args.model)
    questions = [args.prompt] if args.prompt else DEFAULT_QUESTIONS

    print("=" * 60)
    for q in questions:
        print(f"\nQ: {q}")
        print(f"A: {ask(model, tok, device, q, context, args.max_tokens)}")
        print("-" * 40)


if __name__ == "__main__":
    main()
