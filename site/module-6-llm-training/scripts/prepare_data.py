#!/usr/bin/env python3
"""
Prepare Training Data for Lithia Motors LLM Fine-Tuning

Reads from DynamoDB tables and converts automotive records into
instruction-tuning JSONL pairs for TinyLlama LoRA fine-tuning.

Usage:
    python scripts/prepare_data.py \
        --source dynamodb \
        --profile uo-innovation \
        --tables lithia-vehicles lithia-financing lithia-insurance \
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


# TinyLlama chat template
SYSTEM_PROMPT = "You are a knowledgeable Lithia Motors automotive assistant. Help customers and staff with vehicle inventory, financing, insurance, and service information."

INST_TEMPLATE = f"<|system|>\n{SYSTEM_PROMPT}</s>\n<|user|>\n{{instruction}}</s>\n<|assistant|>\n{{output}}</s>"


def fmt(instruction: str, output: str) -> Dict[str, str]:
    return {"text": INST_TEMPLATE.format(instruction=instruction.strip(), output=output.strip())}


# ── Per-table Q&A generators ──────────────────────────────────────────────────

def pairs_from_vehicles(items: List[Dict]) -> List[Dict]:
    data = []
    for v in items:
        vid  = v.get('id', v.get('vin', 'UNKNOWN'))
        year = v.get('year', '')
        make = v.get('make', '')
        model = v.get('model', '')
        style = v.get('style', v.get('trim', ''))
        vin  = v.get('vin', '')
        msrp = v.get('msrp', v.get('price', ''))
        cost = v.get('cost', '')
        vtype = v.get('type', v.get('vehicle_type', ''))

        label = f"{year} {make} {model}".strip() or vid

        data.append(fmt(
            f"Describe the vehicle with VIN {vin}." if vin else f"Describe vehicle {vid}.",
            f"{label} {style}. MSRP: ${msrp:,.0f}." if isinstance(msrp, (int, float)) else f"{label} {style}. MSRP: {msrp}."
        ))
        if msrp and cost:
            try:
                margin = float(msrp) - float(cost)
                data.append(fmt(
                    f"What is the gross margin on the {label}?",
                    f"The {label} has a cost of ${float(cost):,.0f} and MSRP of ${float(msrp):,.0f}, giving a gross margin of ${margin:,.0f}."
                ))
            except (ValueError, TypeError):
                pass
        if vtype:
            data.append(fmt(
                f"What type of vehicle is the {label}?",
                f"The {label} is classified as a {vtype}."
            ))
        if style:
            data.append(fmt(
                f"What trim level is the {label}?",
                f"The {label} comes in the {style} trim."
            ))
    return data


def pairs_from_financing(items: List[Dict]) -> List[Dict]:
    data = []
    for f in items:
        fid   = f.get('id', f.get('financing_id', 'UNKNOWN'))
        rate  = f.get('interest_rate', f.get('rate', ''))
        term  = f.get('term_months', f.get('term', ''))
        amount = f.get('loan_amount', f.get('amount', ''))
        lender = f.get('lender', f.get('bank', ''))
        score  = f.get('credit_score', f.get('credit_tier', ''))

        data.append(fmt(
            f"Describe the financing option {fid}.",
            f"Loan of ${float(amount):,.0f} at {rate}% APR for {term} months{f' through {lender}' if lender else ''}." if amount and rate and term
            else f"Financing record {fid}: rate={rate}, term={term} months, lender={lender}."
        ))
        if score:
            data.append(fmt(
                f"What credit score is needed for financing record {fid}?",
                f"This financing option requires a credit score of {score}."
            ))
        if rate:
            data.append(fmt(
                f"What is the interest rate for financing plan {fid}?",
                f"The interest rate is {rate}% APR."
            ))
    return data


def pairs_from_insurance(items: List[Dict]) -> List[Dict]:
    data = []
    for ins in items:
        iid      = ins.get('id', ins.get('policy_id', 'UNKNOWN'))
        provider = ins.get('provider', ins.get('carrier', ''))
        premium  = ins.get('monthly_premium', ins.get('premium', ''))
        coverage = ins.get('coverage_type', ins.get('type', ''))
        deduct   = ins.get('deductible', '')

        data.append(fmt(
            f"Describe insurance plan {iid}.",
            f"{coverage} coverage from {provider}. Monthly premium: ${float(premium):,.2f}. Deductible: ${float(deduct):,.0f}." if premium and deduct
            else f"Insurance plan {iid}: provider={provider}, coverage={coverage}, premium={premium}."
        ))
        if coverage:
            data.append(fmt(
                f"What type of coverage does insurance plan {iid} provide?",
                f"Plan {iid} provides {coverage} coverage through {provider}." if provider else f"Plan {iid} provides {coverage} coverage."
            ))
    return data


def pairs_from_members(items: List[Dict]) -> List[Dict]:
    data = []
    for m in items:
        mid   = m.get('id', m.get('member_id', 'UNKNOWN'))
        name  = m.get('name', m.get('full_name', ''))
        tier  = m.get('tier', m.get('membership_tier', ''))
        points = m.get('points', m.get('reward_points', ''))
        since  = m.get('member_since', m.get('joined', ''))

        label = name or mid
        data.append(fmt(
            f"Summarize the profile of member {mid}.",
            f"{label} is a {tier} member" + (f" with {points:,} reward points" if isinstance(points, (int, float)) else f" with {points} points") + (f", member since {since}." if since else ".")
        ))
        if tier:
            data.append(fmt(
                f"What membership tier does {label} hold?",
                f"{label} holds {tier} tier membership."
            ))
    return data


def pairs_from_services(items: List[Dict]) -> List[Dict]:
    data = []
    for s in items:
        sid   = s.get('id', s.get('service_id', 'UNKNOWN'))
        stype = s.get('service_type', s.get('type', ''))
        cost  = s.get('cost', s.get('price', ''))
        date  = s.get('service_date', s.get('date', ''))
        vin   = s.get('vin', s.get('vehicle_vin', ''))
        tech  = s.get('technician', s.get('tech', ''))

        data.append(fmt(
            f"Describe service record {sid}.",
            f"{stype} performed" + (f" on vehicle {vin}" if vin else "") + (f" on {date}" if date else "") + (f" by {tech}" if tech else "") + (f". Cost: ${float(cost):,.2f}." if cost else ".")
        ))
        if stype and cost:
            try:
                data.append(fmt(
                    f"What was the cost of the {stype} service in record {sid}?",
                    f"The {stype} service cost ${float(cost):,.2f}."
                ))
            except (ValueError, TypeError):
                pass
    return data


def pairs_from_generic(table_name: str, items: List[Dict]) -> List[Dict]:
    """Fallback for any table not specifically handled."""
    data = []
    for item in items:
        rid = item.get('id', str(list(item.values())[0]) if item else 'UNKNOWN')
        fields = ", ".join(f"{k}: {v}" for k, v in list(item.items())[:6] if v)
        data.append(fmt(
            f"Describe record {rid} from {table_name}.",
            fields + "."
        ))
    return data


TABLE_GENERATORS = {
    'vehicles':          pairs_from_vehicles,
    'financing':         pairs_from_financing,
    'insurance':         pairs_from_insurance,
    'members':           pairs_from_members,
    'services':          pairs_from_services,
    'member-financing':  pairs_from_financing,
    'member-insurance':  pairs_from_insurance,
    'member-rentals':    pairs_from_generic,
}


def scan_table(dynamo, table_name: str) -> List[Dict]:
    tbl = dynamo.Table(table_name)
    resp = tbl.scan()
    items = resp.get('Items', [])
    while 'LastEvaluatedKey' in resp:
        resp = tbl.scan(ExclusiveStartKey=resp['LastEvaluatedKey'])
        items.extend(resp.get('Items', []))
    return items


def load_from_dynamodb(profile: str, region: str, tables: List[str]) -> List[Dict]:
    if not HAS_BOTO3:
        raise ImportError("boto3 is required — run: pip install boto3")

    print(f"Connecting to DynamoDB (profile={profile}, region={region})...")
    session = boto3.Session(profile_name=profile, region_name=region)
    dynamo = session.resource('dynamodb')

    all_data = []
    for table_name in tables:
        print(f"  Scanning {table_name}...")
        try:
            items = scan_table(dynamo, table_name)
        except Exception as e:
            print(f"  [warn] Could not scan {table_name}: {e}")
            continue

        print(f"    Found {len(items)} records")

        # Match table name to a generator by suffix
        suffix = table_name.replace('lithia-', '')
        generator = TABLE_GENERATORS.get(suffix)
        if generator:
            pairs = generator(items) if suffix != 'member-rentals' else generator(table_name, items)
        else:
            pairs = pairs_from_generic(table_name, items)

        print(f"    Generated {len(pairs)} instruction pairs")
        all_data.extend(pairs)

    print(f"\n  Total: {len(all_data)} instruction pairs from {len(tables)} table(s)")
    return all_data


def load_from_csv(file_path: str) -> List[Dict]:
    import csv
    print(f"Loading from CSV: {file_path}")
    data = []
    with open(file_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            instruction = row.get("instruction", "").strip()
            output = row.get("output", "").strip()
            if instruction and output:
                data.append(fmt(instruction, output))
    print(f"  Loaded {len(data)} examples from CSV")
    return data


def load_from_jsonl(file_path: str) -> List[Dict]:
    print(f"Loading from JSONL: {file_path}")
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            item = json.loads(line)
            if item.get("instruction") and item.get("output"):
                data.append(fmt(item["instruction"], item["output"]))
    print(f"  Loaded {len(data)} examples from JSONL")
    return data


def create_example_data() -> List[Dict]:
    examples = [
        ("What year is the Ford F-150 in inventory?", "The Ford F-150 in inventory is a 2023 model."),
        ("What is the MSRP of the Toyota Camry?", "The 2024 Toyota Camry has an MSRP of $28,400."),
        ("What interest rate is available for a 60-month loan?", "A 60-month auto loan is available at 6.9% APR."),
        ("What coverage does the premium insurance plan offer?", "The premium plan offers comprehensive and collision coverage with a $500 deductible."),
        ("How many reward points does a Gold member earn per purchase?", "Gold tier members earn 2x reward points on every vehicle purchase and service visit."),
    ]
    return [fmt(q, a) for q, a in examples]


def save_dataset(data: List[Dict], output_dir: str, train_ratio: float = 0.9):
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    random.shuffle(data)
    split_idx = int(len(data) * train_ratio)
    train_data = data[:split_idx]
    eval_data  = data[split_idx:]

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
    print(f"  Evaluation: {len(eval_data)} examples  -> {eval_path}")


def main():
    parser = argparse.ArgumentParser(description="Prepare Lithia Motors training data for LLM fine-tuning")
    parser.add_argument("--source", type=str,
                        choices=["dynamodb", "csv", "jsonl", "example"],
                        default="example", help="Data source")
    parser.add_argument("--file", type=str, help="Path to CSV or JSONL file (for --source csv/jsonl)")
    parser.add_argument("--profile", type=str, default="uo-innovation",
                        help="AWS SSO profile name")
    parser.add_argument("--region", type=str, default="us-west-2",
                        help="AWS region")
    parser.add_argument("--tables", type=str, nargs='+',
                        default=["lithia-vehicles"],
                        help="DynamoDB table names to pull data from")
    parser.add_argument("--output-dir", type=str, default="./data/processed")
    parser.add_argument("--train-ratio", type=float, default=0.9)
    args = parser.parse_args()

    if args.source == "dynamodb":
        data = load_from_dynamodb(args.profile, args.region, args.tables)
    elif args.source == "csv":
        if not args.file:
            raise ValueError("--file is required for --source csv")
        data = load_from_csv(args.file)
    elif args.source == "jsonl":
        if not args.file:
            raise ValueError("--file is required for --source jsonl")
        data = load_from_jsonl(args.file)
    else:
        print("Using built-in example data (no AWS required)...")
        data = create_example_data()

    if not data:
        print("No data loaded — check your source and try again.")
        return

    save_dataset(data, args.output_dir, args.train_ratio)
    print("\nDone! Next step:")
    print("  python scripts/train.py --config configs/lora_config.yaml --data data/processed/train.jsonl --output models/lithia-lora")


if __name__ == "__main__":
    main()

