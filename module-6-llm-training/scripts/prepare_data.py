#!/usr/bin/env python3
"""
Prepare Training Data for LLM Fine-Tuning

Reads from DynamoDB (or CSV/JSONL files) and converts healthcare records
into instruction-tuning JSONL pairs for local CPU fine-tuning.

Usage:
    python scripts/prepare_data.py \
        --source dynamodb \
        --profile uo-innovation \
        --output-dir data/processed
"""

import os
import json
import argparse
import random
from pathlib import Path
from typing import List, Dict, Optional

try:
    import boto3
    from boto3.dynamodb.conditions import Key
    HAS_BOTO3 = True
except ImportError:
    HAS_BOTO3 = False

try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False

def _progress(iterable, **kwargs):
    if HAS_TQDM:
        return tqdm(iterable, **kwargs)
    return iterable


# Instruction format (works with TinyLlama chat template)
INST_TEMPLATE = "<|system|>\nYou are a helpful healthcare data assistant.</s>\n<|user|>\n{instruction}\n{input}</s>\n<|assistant|>\n{output}</s>"
INST_TEMPLATE_NO_INPUT = "<|system|>\nYou are a helpful healthcare data assistant.</s>\n<|user|>\n{instruction}</s>\n<|assistant|>\n{output}</s>"



def format_example(
    instruction: str,
    output: str,
    input_text: Optional[str] = None
) -> Dict[str, str]:
    """Format a single example for TinyLlama instruction tuning."""
    inp = input_text.strip() if input_text and input_text.strip() else ""
    if inp:
        text = INST_TEMPLATE.format(instruction=instruction, input=inp, output=output)
    else:
        text = INST_TEMPLATE_NO_INPUT.format(instruction=instruction, output=output)
    return {"text": text}


def load_from_csv(file_path: str) -> List[Dict]:
    """Load training data from CSV file (columns: instruction, input, output)."""
    import csv
    print(f"Loading from CSV: {file_path}")
    data = []
    with open(file_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in _progress(reader, desc="Processing rows"):
            instruction = row.get("instruction", "").strip()
            output = row.get("output", "").strip()
            input_text = row.get("input", "").strip()
            if instruction and output:
                data.append(format_example(instruction, output, input_text or None))
    print(f"  Loaded {len(data)} examples from CSV")
    return data


def load_from_jsonl(file_path: str) -> List[Dict]:
    """Load training data from JSONL file."""
    print(f"Loading from JSONL: {file_path}")
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in _progress(f, desc="Processing lines"):
            item = json.loads(line)
            instruction = item.get("instruction", "")
            output = item.get("output", "")
            input_text = item.get("input", None)
            if instruction and output:
                data.append(format_example(instruction, output, input_text))
    print(f"  Loaded {len(data)} examples from JSONL")
    return data


def load_from_dynamodb(profile: str, region: str, table_prefix: str) -> List[Dict]:
    """
    Read healthcare records from DynamoDB and generate instruction pairs.
    Produces one Q&A pair per patient covering diagnoses and medications.
    """
    if not HAS_BOTO3:
        raise ImportError("boto3 is required — run: pip install boto3")

    print(f"Connecting to DynamoDB (profile={profile}, region={region})...")
    session = boto3.Session(profile_name=profile, region_name=region)
    dynamo = session.resource('dynamodb')

    # Scan patients
    patients_table = dynamo.Table(f'{table_prefix}-patients')
    resp = patients_table.scan()
    patients = resp.get('Items', [])
    while 'LastEvaluatedKey' in resp:
        resp = patients_table.scan(ExclusiveStartKey=resp['LastEvaluatedKey'])
        patients.extend(resp.get('Items', []))
    print(f"  Found {len(patients)} patients")

    # Scan diagnoses and medications catalogs
    diag_table = dynamo.Table(f'{table_prefix}-diagnoses')
    med_table = dynamo.Table(f'{table_prefix}-medications')
    diag_resp = diag_table.scan().get('Items', [])
    med_resp = med_table.scan().get('Items', [])
    diag_map = {d['diagnosis_code']: d.get('name', d['diagnosis_code']) for d in diag_resp}
    med_map = {m['medication_id']: m.get('name', m['medication_id']) for m in med_resp}

    data = []
    for p in _progress(patients, desc="Building instruction pairs"):
        pid = p.get('patient_id', 'UNKNOWN')
        age = p.get('age', 'unknown')
        gender = p.get('gender', 'unknown')
        bmi = p.get('bmi', None)

        # --- Patient summary pair ---
        summary_parts = [f"Age: {age}", f"Gender: {gender}"]
        if bmi:
            summary_parts.append(f"BMI: {bmi}")
        data.append(format_example(
            instruction=f"Summarize the demographic profile of patient {pid}.",
            output=", ".join(summary_parts) + "."
        ))

        # --- Diagnoses pair (uses catalog) ---
        # Pick a few diagnoses from the catalog for variety
        if diag_map:
            sample_diags = list(diag_map.values())[:3]
            data.append(format_example(
                instruction=f"What conditions are commonly documented in this dataset?",
                input_text=f"Patient context: age {age}, gender {gender}",
                output="Common diagnoses include: " + ", ".join(sample_diags) + "."
            ))

        # --- Medications pair (uses catalog) ---
        if med_map:
            sample_meds = list(med_map.values())[:3]
            data.append(format_example(
                instruction=f"What medications appear in this healthcare dataset?",
                output="Medications documented include: " + ", ".join(sample_meds) + "."
            ))

        # --- Data quality pair ---
        data.append(format_example(
            instruction="Identify any missing fields in this patient record.",
            input_text=json.dumps({"patient_id": pid, "age": str(age), "gender": gender, "bmi": str(bmi) if bmi else None}),
            output=f"The record for {pid} is {'complete' if bmi else 'missing BMI data'}."
        ))

    print(f"  Generated {len(data)} instruction pairs from DynamoDB")
    return data


def create_example_data() -> List[Dict]:
    """Fallback: hardcoded examples for testing without AWS."""
    examples = [
        {"instruction": "Summarize the demographic profile of patient P001.",
         "output": "Age: 45, Gender: Female, BMI: 28.3."},
        {"instruction": "What conditions are commonly documented in this dataset?",
         "input": "Patient context: age 45, gender Female",
         "output": "Common diagnoses include: Type 2 Diabetes Mellitus, Essential Hypertension, Hyperlipidemia."},
        {"instruction": "What medications appear in this healthcare dataset?",
         "output": "Medications documented include: Metformin, Lisinopril, Atorvastatin."},
        {"instruction": "Identify any missing fields in this patient record.",
         "input": '{"patient_id": "P001", "age": "45", "gender": "Female", "bmi": null}',
         "output": "The record for P001 is missing BMI data."},
        {"instruction": "Summarize the demographic profile of patient P002.",
         "output": "Age: 62, Gender: Male, BMI: 31.1."},
    ]
    return [format_example(e["instruction"], e["output"], e.get("input")) for e in examples]



def save_dataset(data: List[Dict], output_dir: str, train_ratio: float = 0.9):
    """Save processed data as train/eval JSONL files."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    random.shuffle(data)
    split_idx = int(len(data) * train_ratio)
    train_data = data[:split_idx]
    eval_data = data[split_idx:]

    train_path = output_path / "train.jsonl"
    with open(train_path, 'w', encoding='utf-8') as f:
        for item in train_data:
            f.write(json.dumps(item) + "\n")

    eval_path = output_path / "eval.jsonl"
    with open(eval_path, 'w', encoding='utf-8') as f:
        for item in eval_data:
            f.write(json.dumps(item) + "\n")

    print(f"\nDataset saved:")
    print(f"  Training  : {len(train_data)} examples -> {train_path}")
    print(f"  Evaluation: {len(eval_data)} examples -> {eval_path}")


def main():
    parser = argparse.ArgumentParser(description="Prepare training data for LLM fine-tuning")
    parser.add_argument("--source", type=str,
                        choices=["dynamodb", "csv", "jsonl", "example"],
                        default="example", help="Data source")
    parser.add_argument("--file", type=str, help="Path to CSV or JSONL file")
    parser.add_argument("--profile", type=str, default="uo-innovation",
                        help="AWS profile name (for --source dynamodb)")
    parser.add_argument("--region", type=str, default="us-west-2",
                        help="AWS region (for --source dynamodb)")
    parser.add_argument("--table-prefix", type=str, default="healthcare",
                        help="DynamoDB table prefix (for --source dynamodb)")
    parser.add_argument("--output-dir", type=str, default="./data/processed")
    parser.add_argument("--train-ratio", type=float, default=0.9)
    args = parser.parse_args()

    if args.source == "dynamodb":
        data = load_from_dynamodb(args.profile, args.region, args.table_prefix)
    elif args.source == "csv":
        if not args.file:
            raise ValueError("--file is required for csv source")
        data = load_from_csv(args.file)
    elif args.source == "jsonl":
        if not args.file:
            raise ValueError("--file is required for jsonl source")
        data = load_from_jsonl(args.file)
    else:
        print("Using built-in example data (no AWS required)...")
        data = create_example_data()

    if not data:
        print("No data loaded — check your source and try again.")
        return

    save_dataset(data, args.output_dir, args.train_ratio)
    print("\nDone! Next step:")
    print("  python scripts/train.py --config configs/lora_config.yaml --data data/processed/train.jsonl --output models/healthcare-lora")


if __name__ == "__main__":
    main()
