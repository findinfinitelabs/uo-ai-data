#!/usr/bin/env python3
import argparse, torch
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel, PeftConfig

SYSTEM = "You are a helpful healthcare data assistant."

def prompt(q):
    return f"<|system|>\n{SYSTEM}</s>\n<|user|>\n{q}</s>\n<|assistant|>\n"

def load_model(adapter_path):
    cfg = PeftConfig.from_pretrained(adapter_path)
    base = cfg.base_model_name_or_path
    device = "cuda" if torch.cuda.is_available() else ("mps" if hasattr(torch.backends,"mps") and torch.backends.mps.is_available() else "cpu")
    print(f"Base model : {base}")
    print(f"Adapter    : {adapter_path}")
    print(f"Device     : {device}")
    tok = AutoTokenizer.from_pretrained(adapter_path)
    model = AutoModelForCausalLM.from_pretrained(base, torch_dtype=torch.float32, low_cpu_mem_usage=True)
    model = PeftModel.from_pretrained(model, adapter_path)
    model.eval()
    if device != "cpu": model = model.to(device)
    return model, tok, device

def ask(model, tok, device, question, max_new_tokens=100):
    p = prompt(question)
    inp = tok(p, return_tensors="pt")
    if device != "cpu": inp = {k: v.to(device) for k, v in inp.items()}
    with torch.no_grad():
        out = model.generate(**inp, max_new_tokens=max_new_tokens, do_sample=False, repetition_penalty=1.1)
    return tok.decode(out[0][inp["input_ids"].shape[1]:], skip_special_tokens=True).strip()

TESTS = [
    "Summarize the demographic profile of patient P001.",
    "What conditions are commonly documented in this dataset?",
    "What medications appear in this healthcare dataset?",
    "Identify any missing fields in this patient record.",
]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="./models/healthcare-lora")
    parser.add_argument("--prompt", default=None)
    parser.add_argument("--max-tokens", type=int, default=100)
    args = parser.parse_args()
    if not Path(args.model).exists():
        print(f"Adapter not found: {args.model}. Run training first.")
        return
    model, tok, device = load_model(args.model)
    questions = [args.prompt] if args.prompt else TESTS
    print("=" * 60)
    for q in questions:
        print(f"\nQ: {q}")
        print(f"A: {ask(model, tok, device, q, args.max_tokens)}")
        print("-" * 40)

if __name__ == "__main__":
    main()
