# Synthetic Healthcare Data Generation Skill

## Overview

This skill provides guidelines for generating realistic synthetic healthcare data that maintains privacy while preserving utility for AI/ML training.

## Core Principles

### Data Realism

Synthetic data must be realistic enough to train effective models:

- **Use authentic distributions** - Age, gender, race demographics match real population statistics
- **Maintain correlations** - BMI correlates with weight/height, diagnoses correlate with medications
- **Temporal consistency** - Dates follow logical chronology (onset before treatment)
- **Medical plausibility** - Vital signs within human ranges, appropriate diagnosis-medication pairings

### Privacy Preservation

Even synthetic data should demonstrate privacy-preserving practices:

- **No real patient data** - All records are completely fictional
- **De-identification patterns** - Follow HIPAA Safe Harbor method (remove 18 identifiers)
- **Statistical divergence** - Synthetic data should not replicate real patient patterns exactly
- **Randomization** - Use appropriate seeding for reproducibility but avoid predictable patterns

## Generation Standards

### Patient Demographics

```python
# ✅ Good: Realistic distributions
GENDERS = ["male", "female", "other", "unknown"]
MIN_AGE = 18
MAX_AGE = 85
# Use weighted sampling for age distribution (more middle-aged patients)

# ❌ Avoid: Unrealistic uniformity
ages = [random.randint(0, 120) for _ in range(100)]  # Too uniform
```

### Medical Codes

Always use proper standardized codes:

- **ICD-10** for diagnoses (e.g., `E11.9` for Type 2 diabetes)
- **CDT codes** for dental procedures (e.g., `D0120` for periodic oral evaluation)
- **LOINC** for lab tests
- **NDC** or generic names for medications

### Data Validation Requirements

Generated data must pass these checks:

1. **Schema compliance** - All required fields present
2. **Type validation** - Correct data types (dates as ISO 8601, numeric ranges)
3. **Logical consistency** - Systolic BP > Diastolic BP, valid BMI calculations
4. **No duplicates** - Unique patient/visit IDs
5. **Realistic ranges** - Vital signs, lab values within human biological limits

```python
# Example validation
def validate_patient_record(patient):
    """Validate synthetic patient data."""
    # Check blood pressure logic
    if patient['vitals']['systolic_bp'] <= patient['vitals']['diastolic_bp']:
        raise ValueError("Systolic BP must exceed diastolic BP")
    
    # Verify BMI calculation
    height_m = patient['vitals']['height_cm'] / 100
    calculated_bmi = patient['vitals']['weight_kg'] / (height_m ** 2)
    if abs(calculated_bmi - patient['vitals']['bmi']) > 0.1:
        raise ValueError("BMI calculation incorrect")
    
    # Check age range
    if not (0 <= patient['demographics']['age'] <= 120):
        raise ValueError("Age out of realistic range")
```

## Output Formats

### JSON Format (Recommended for hierarchical data)

```json
{
  "patient_id": "P00001234",
  "demographics": {
    "age": 45,
    "gender": "female",
    "race": "Asian",
    "state": "Oregon"
  },
  "vitals": {
    "systolic_bp": 128,
    "diastolic_bp": 82,
    "heart_rate": 72
  },
  "diagnoses": [
    {
      "code": "E11.9",
      "description": "Type 2 diabetes mellitus",
      "onset_date": "2023-03-15"
    }
  ]
}
```

### CSV Format (For flat analysis)

- Use for summary statistics and quick imports
- Flatten nested structures appropriately
- Include header row with clear column names
- Handle lists as pipe-separated values or separate rows

## Tool Configuration

### Python Standard Library Approach

For educational purposes, prefer standard library over external dependencies:

```python
import random
import json
from datetime import datetime, timedelta
import csv

# Set seed for reproducibility
random.seed(42)

# Generate data using standard library functions
```

### When to Use External Libraries

Only add dependencies when necessary:

- **Faker** - For realistic names/addresses (avoid for privacy training)
- **pandas** - For data validation and analysis
- **numpy** - For complex statistical distributions

## Common Patterns

### Date Generation

```python
def random_date(start_date, end_date):
    """Generate random date between two dates."""
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

# Usage
onset_date = random_date(
    datetime(2020, 1, 1),
    datetime(2024, 12, 31)
)
```

### Weighted Selection

```python
# More realistic than uniform selection
def weighted_diagnosis():
    """Select diagnosis with realistic prevalence."""
    diagnoses = [
        ("E11.9", "Type 2 Diabetes", 0.3),  # 30% chance
        ("I10", "Hypertension", 0.4),        # 40% chance
        ("E78.5", "Hyperlipidemia", 0.2),   # 20% chance
        ("J45.909", "Asthma", 0.1)          # 10% chance
    ]
    
    choices = [d[0:2] for d in diagnoses]
    weights = [d[2] for d in diagnoses]
    
    return random.choices(choices, weights=weights)[0]
```

### Correlated Variables

```python
def generate_correlated_vitals(age, has_hypertension):
    """Generate vitals that correlate with age and conditions."""
    # Base values
    systolic = 110 + (age - 18) * 0.5  # Increases with age
    diastolic = 70 + (age - 18) * 0.2
    
    # Adjust for hypertension
    if has_hypertension:
        systolic += random.randint(10, 30)
        diastolic += random.randint(5, 15)
    
    # Add random variation
    systolic += random.randint(-5, 5)
    diastolic += random.randint(-3, 3)
    
    return int(systolic), int(diastolic)
```

## Best Practices

### ✅ Do

- Use meaningful patient IDs (e.g., P00001234, not real MRNs)
- Include data generation timestamp and script version
- Document assumptions and limitations
- Provide both JSON and CSV outputs
- Validate all generated data before saving
- Include data generation metadata

### ❌ Don't

- Copy patterns from real patient data directly
- Use actual names, addresses, or phone numbers
- Create unrealistic uniform distributions
- Skip validation steps
- Ignore medical plausibility constraints
- Mix real and synthetic data

## Testing Generated Data

```python
def test_dataset_quality(patients):
    """Run quality checks on generated dataset."""
    print(f"Total records: {len(patients)}")
    
    # Check for duplicates
    ids = [p['patient_id'] for p in patients]
    assert len(ids) == len(set(ids)), "Duplicate patient IDs found"
    
    # Validate age distribution
    ages = [p['demographics']['age'] for p in patients]
    assert min(ages) >= 18, "Patient under minimum age"
    assert max(ages) <= 85, "Patient over maximum age"
    
    # Check data completeness
    for p in patients:
        assert 'patient_id' in p, "Missing patient_id"
        assert 'demographics' in p, "Missing demographics"
        assert 'vitals' in p, "Missing vitals"
    
    print("✅ All quality checks passed")
```

## Documentation Requirements

Every synthetic dataset should include:

1. **README** - Description, generation method, limitations
2. **Data dictionary** - Field definitions, codes, ranges
3. **Validation report** - Quality metrics, distributions
4. **Generation script** - Reproducible code with seed value
5. **Usage examples** - How to load and use the data
