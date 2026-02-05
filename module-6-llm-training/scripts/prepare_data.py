#!/usr/bin/env python3
"""
Prepare Training Data for Mistral 7B Fine-Tuning

This script prepares training data from various sources:
- CSV files
- JSON/JSONL files
- Database queries
- Existing datasets

Output: JSONL files in the Mistral instruction format
"""

import os
import json
import argparse
from pathlib import Path
from typing import List, Dict, Optional

import pandas as pd
from sqlalchemy import create_engine, text
from datasets import Dataset
from tqdm import tqdm


# Mistral instruction format template
MISTRAL_TEMPLATE = """<s>[INST] {instruction}

{input} [/INST]
{output}</s>"""

# Template without input (for simple instruction-output pairs)
MISTRAL_TEMPLATE_NO_INPUT = """<s>[INST] {instruction} [/INST]
{output}</s>"""


def format_for_mistral(
    instruction: str,
    output: str,
    input_text: Optional[str] = None
) -> Dict[str, str]:
    """
    Format a single example for Mistral instruction tuning.
    
    Args:
        instruction: The instruction/task description
        output: The expected output
        input_text: Optional additional context/input
    
    Returns:
        Dictionary with 'text' field formatted for training
    """
    if input_text and input_text.strip():
        text = MISTRAL_TEMPLATE.format(
            instruction=instruction,
            input=input_text,
            output=output
        )
    else:
        text = MISTRAL_TEMPLATE_NO_INPUT.format(
            instruction=instruction,
            output=output
        )
    
    return {"text": text}


def load_from_csv(
    file_path: str,
    instruction_col: str = "instruction",
    input_col: str = "input",
    output_col: str = "output"
) -> List[Dict]:
    """Load training data from CSV file."""
    print(f"📄 Loading from CSV: {file_path}")
    
    df = pd.read_csv(file_path)
    data = []
    
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Processing rows"):
        instruction = str(row.get(instruction_col, ""))
        output = str(row.get(output_col, ""))
        input_text = str(row.get(input_col, "")) if input_col in row else None
        
        if instruction and output:
            data.append(format_for_mistral(instruction, output, input_text))
    
    print(f"✅ Loaded {len(data)} examples from CSV")
    return data


def load_from_jsonl(file_path: str) -> List[Dict]:
    """Load training data from JSONL file."""
    print(f"📄 Loading from JSONL: {file_path}")
    
    data = []
    with open(file_path, 'r') as f:
        for line in tqdm(f, desc="Processing lines"):
            item = json.loads(line)
            instruction = item.get("instruction", "")
            output = item.get("output", "")
            input_text = item.get("input", None)
            
            if instruction and output:
                data.append(format_for_mistral(instruction, output, input_text))
    
    print(f"✅ Loaded {len(data)} examples from JSONL")
    return data


def load_from_database(
    connection_string: str,
    query: str,
    instruction_col: str = "instruction",
    input_col: str = "input",
    output_col: str = "output"
) -> List[Dict]:
    """
    Load training data from a database.
    
    Args:
        connection_string: SQLAlchemy connection string
        query: SQL query to fetch training data
        instruction_col: Column name for instructions
        input_col: Column name for inputs
        output_col: Column name for outputs
    
    Returns:
        List of formatted training examples
    """
    print(f"🗄️ Loading from database...")
    
    engine = create_engine(connection_string)
    
    with engine.connect() as conn:
        result = conn.execute(text(query))
        rows = result.fetchall()
        columns = result.keys()
    
    data = []
    for row in tqdm(rows, desc="Processing rows"):
        row_dict = dict(zip(columns, row))
        
        instruction = str(row_dict.get(instruction_col, ""))
        output = str(row_dict.get(output_col, ""))
        input_text = str(row_dict.get(input_col, "")) if input_col in row_dict else None
        
        if instruction and output:
            data.append(format_for_mistral(instruction, output, input_text))
    
    print(f"✅ Loaded {len(data)} examples from database")
    return data


def create_example_data() -> List[Dict]:
    """
    Create example training data for demonstration.
    These are examples of data management and generation tasks.
    """
    examples = [
        {
            "instruction": "Generate a synthetic patient record for a 45-year-old female with type 2 diabetes.",
            "output": json.dumps({
                "patient_id": "P-2024-0001",
                "age": 45,
                "gender": "Female",
                "diagnosis": ["Type 2 Diabetes Mellitus", "Hypertension"],
                "medications": ["Metformin 500mg", "Lisinopril 10mg"],
                "last_visit": "2024-01-15",
                "a1c_level": 7.2,
                "blood_pressure": "138/88"
            }, indent=2)
        },
        {
            "instruction": "Convert this natural language query to SQL.",
            "input": "Find all patients over 60 who have been diagnosed with heart disease and had a visit in the last 6 months.",
            "output": """SELECT p.patient_id, p.name, p.age, p.last_visit
FROM patients p
JOIN diagnoses d ON p.patient_id = d.patient_id
WHERE p.age > 60
  AND d.diagnosis_name LIKE '%heart disease%'
  AND p.last_visit >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
ORDER BY p.last_visit DESC;"""
        },
        {
            "instruction": "Validate this patient record and identify any data quality issues.",
            "input": json.dumps({
                "patient_id": "12345",
                "name": "john doe",
                "age": -5,
                "gender": "M",
                "phone": "555-1234",
                "email": "not-an-email",
                "ssn": "123-45-6789"
            }),
            "output": """Data Quality Issues Found:

1. **Invalid Age**: Age is -5, which is impossible. Age must be a positive integer.

2. **Name Format**: "john doe" should be properly capitalized as "John Doe".

3. **Invalid Email**: "not-an-email" is not a valid email format. Expected format: user@domain.com

4. **Phone Format**: "555-1234" appears incomplete. Expected 10-digit format: XXX-XXX-XXXX

5. **PHI Exposure Risk**: SSN field contains what appears to be a real SSN pattern. Consider:
   - Is SSN necessary for this use case?
   - Should it be masked/encrypted?

Recommended Actions:
- Reject record until age is corrected
- Apply proper name capitalization
- Validate email with regex pattern
- Require full phone number
- Review data minimization for SSN"""
        },
        {
            "instruction": "Generate a synthetic dental visit record.",
            "output": json.dumps({
                "visit_id": "DV-2024-00123",
                "patient_id": "P-8834",
                "visit_date": "2024-01-20",
                "provider": "Dr. Sarah Chen, DDS",
                "procedures": [
                    {"code": "D0120", "description": "Periodic oral evaluation", "fee": 65.00},
                    {"code": "D1110", "description": "Prophylaxis - adult", "fee": 125.00}
                ],
                "findings": "No cavities detected. Mild gingivitis in lower anterior region.",
                "next_visit": "2024-07-20",
                "total_fee": 190.00
            }, indent=2)
        },
        {
            "instruction": "Create a data dictionary entry for the 'patients' table.",
            "input": "Table contains: id, first_name, last_name, dob, ssn, email, phone, address, insurance_id, created_at",
            "output": """# Data Dictionary: patients

| Column | Type | Description | Classification | Constraints |
|--------|------|-------------|----------------|-------------|
| id | UUID | Unique patient identifier | Internal ID | PRIMARY KEY, NOT NULL |
| first_name | VARCHAR(50) | Patient's legal first name | PII | NOT NULL |
| last_name | VARCHAR(50) | Patient's legal last name | PII | NOT NULL |
| dob | DATE | Date of birth | PHI | NOT NULL, CHECK (dob <= CURRENT_DATE) |
| ssn | VARCHAR(11) | Social Security Number | PHI/Sensitive | UNIQUE, Encrypted at rest |
| email | VARCHAR(100) | Contact email address | PII | UNIQUE, Valid email format |
| phone | VARCHAR(15) | Primary phone number | PII | Valid phone format |
| address | TEXT | Mailing address | PII | - |
| insurance_id | UUID | Foreign key to insurance table | Internal | FOREIGN KEY (insurance.id) |
| created_at | TIMESTAMP | Record creation timestamp | Audit | DEFAULT CURRENT_TIMESTAMP |

## Notes
- SSN should be encrypted and access logged
- PII fields subject to GDPR/CCPA deletion requests
- PHI fields subject to HIPAA requirements"""
        },
    ]
    
    return [format_for_mistral(**ex) for ex in examples]


def save_dataset(
    data: List[Dict],
    output_dir: str,
    train_ratio: float = 0.9
):
    """
    Save processed data as train/eval JSONL files.
    
    Args:
        data: List of formatted examples
        output_dir: Directory to save output files
        train_ratio: Ratio of data for training (rest is eval)
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Shuffle and split
    import random
    random.shuffle(data)
    
    split_idx = int(len(data) * train_ratio)
    train_data = data[:split_idx]
    eval_data = data[split_idx:]
    
    # Save train set
    train_path = output_path / "train.jsonl"
    with open(train_path, 'w') as f:
        for item in train_data:
            f.write(json.dumps(item) + "\n")
    
    # Save eval set
    eval_path = output_path / "eval.jsonl"
    with open(eval_path, 'w') as f:
        for item in eval_data:
            f.write(json.dumps(item) + "\n")
    
    print(f"\n✅ Dataset saved!")
    print(f"   Training examples: {len(train_data)} → {train_path}")
    print(f"   Evaluation examples: {len(eval_data)} → {eval_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Prepare training data for Mistral fine-tuning"
    )
    parser.add_argument(
        "--source",
        type=str,
        choices=["csv", "jsonl", "database", "example"],
        default="example",
        help="Data source type"
    )
    parser.add_argument(
        "--file",
        type=str,
        help="Path to CSV or JSONL file"
    )
    parser.add_argument(
        "--connection-string",
        type=str,
        help="Database connection string"
    )
    parser.add_argument(
        "--query",
        type=str,
        help="SQL query to fetch training data"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="./data/processed",
        help="Directory to save processed data"
    )
    parser.add_argument(
        "--train-ratio",
        type=float,
        default=0.9,
        help="Ratio of data for training (0.0-1.0)"
    )
    
    args = parser.parse_args()
    
    # Load data based on source
    if args.source == "csv":
        if not args.file:
            raise ValueError("--file is required for CSV source")
        data = load_from_csv(args.file)
    
    elif args.source == "jsonl":
        if not args.file:
            raise ValueError("--file is required for JSONL source")
        data = load_from_jsonl(args.file)
    
    elif args.source == "database":
        if not args.connection_string or not args.query:
            raise ValueError("--connection-string and --query are required for database source")
        data = load_from_database(args.connection_string, args.query)
    
    else:  # example
        print("📝 Creating example training data...")
        data = create_example_data()
    
    # Save processed data
    save_dataset(data, args.output_dir, args.train_ratio)
    
    print("\n🎉 Data preparation complete!")
    print(f"\nNext step: python scripts/train.py --config configs/lora_config.yaml")


if __name__ == "__main__":
    main()
