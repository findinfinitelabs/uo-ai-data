# Data Validation Standards Skill

## Overview

Comprehensive guidelines for validating synthetic healthcare datasets to ensure quality, consistency, and fitness for AI/ML training.

## Validation Framework

### Four Pillars of Data Validation

1. **Schema Validation** - Structure and format correctness
2. **Statistical Validation** - Distributions and ranges
3. **Consistency Validation** - Internal logical relationships
4. **Quality Validation** - Completeness and accuracy

## Schema Validation

### Required Fields Check

```python
def validate_schema(record, required_fields):
    """Verify all required fields present."""
    missing = []
    
    for field in required_fields:
        if field not in record:
            missing.append(field)
    
    if missing:
        raise ValueError(f"Missing required fields: {missing}")
    
    return True

# Patient record schema
PATIENT_SCHEMA = {
    'required': [
        'patient_id',
        'demographics',
        'vitals',
        'diagnoses'
    ],
    'demographics': ['age', 'gender', 'state'],
    'vitals': ['systolic_bp', 'diastolic_bp', 'heart_rate']
}
```

### Data Type Validation

```python
def validate_types(record, type_spec):
    """Verify field data types."""
    errors = []
    
    for field, expected_type in type_spec.items():
        if field in record:
            actual_type = type(record[field])
            if actual_type != expected_type:
                errors.append(
                    f"{field}: expected {expected_type.__name__}, "
                    f"got {actual_type.__name__}"
                )
    
    if errors:
        raise TypeError(f"Type errors:\n" + "\n".join(errors))
    
    return True

# Type specifications
PATIENT_TYPES = {
    'patient_id': str,
    'age': int,
    'weight_kg': float,
    'diagnoses': list
}
```

### Format Validation

```python
import re
from datetime import datetime

def validate_formats(record):
    """Validate specific field formats."""
    
    # Patient ID format: P########
    if not re.match(r'^P\d{8}$', record['patient_id']):
        raise ValueError("Invalid patient_id format")
    
    # ICD-10 codes
    for diagnosis in record.get('diagnoses', []):
        code = diagnosis.get('code', '')
        if not re.match(r'^[A-Z]\d{2}(\.\d{1,2})?$', code):
            raise ValueError(f"Invalid ICD-10 code: {code}")
    
    # CDT codes (dental)
    for procedure in record.get('procedures', []):
        code = procedure.get('code', '')
        if not re.match(r'^D\d{4}$', code):
            raise ValueError(f"Invalid CDT code: {code}")
    
    # Date format (ISO 8601)
    for date_field in ['visit_date', 'onset_date']:
        if date_field in record:
            try:
                datetime.fromisoformat(record[date_field])
            except ValueError:
                raise ValueError(f"Invalid date format: {date_field}")
    
    return True
```

## Statistical Validation

### Range Validation

```python
def validate_ranges(record, range_specs):
    """Check numeric values within expected ranges."""
    
    for field, (min_val, max_val) in range_specs.items():
        if field in record:
            value = record[field]
            if not (min_val <= value <= max_val):
                raise ValueError(
                    f"{field} = {value} outside valid range "
                    f"[{min_val}, {max_val}]"
                )
    
    return True

# Healthcare value ranges
VITAL_RANGES = {
    'systolic_bp': (60, 250),
    'diastolic_bp': (40, 150),
    'heart_rate': (30, 200),
    'temperature_f': (95.0, 106.0),
    'respiratory_rate': (8, 40),
    'oxygen_saturation': (70, 100),
    'weight_kg': (2.5, 300),
    'height_cm': (40, 250),
    'bmi': (10, 60)
}
```

### Distribution Analysis

```python
def analyze_distributions(dataset, field):
    """Analyze and validate field distributions."""
    import numpy as np
    
    values = [record[field] for record in dataset if field in record]
    
    stats = {
        'count': len(values),
        'mean': np.mean(values),
        'std': np.std(values),
        'min': np.min(values),
        'max': np.max(values),
        'median': np.median(values),
        'q25': np.percentile(values, 25),
        'q75': np.percentile(values, 75)
    }
    
    return stats

# Expected distribution checks
def validate_age_distribution(dataset):
    """Verify age distribution is realistic."""
    ages = [p['age'] for p in dataset]
    
    # Should not be uniform
    std = np.std(ages)
    if std < 5:
        print("⚠️ Warning: Age distribution too uniform")
    
    # Should have middle-age bias
    mean_age = np.mean(ages)
    if not (35 <= mean_age <= 55):
        print(f"⚠️ Warning: Mean age {mean_age} unusual")
    
    # Should not have too many elderly
    pct_90plus = sum(1 for a in ages if a >= 90) / len(ages)
    if pct_90plus > 0.05:
        print(f"⚠️ Warning: {pct_90plus*100:.1f}% patients 90+")
```

### Outlier Detection

```python
def detect_outliers(dataset, field, method='iqr'):
    """Identify statistical outliers."""
    import numpy as np
    
    values = np.array([r[field] for r in dataset if field in r])
    
    if method == 'iqr':
        q1, q3 = np.percentile(values, [25, 75])
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
    elif method == 'zscore':
        mean = np.mean(values)
        std = np.std(values)
        lower = mean - 3 * std
        upper = mean + 3 * std
    
    outliers = [v for v in values if v < lower or v > upper]
    
    return {
        'outlier_count': len(outliers),
        'outlier_pct': len(outliers) / len(values),
        'outlier_values': outliers,
        'bounds': (lower, upper)
    }
```

## Consistency Validation

### Internal Consistency Rules

```python
def validate_consistency(record):
    """Check internal logical consistency."""
    
    # Blood pressure: systolic > diastolic
    if 'vitals' in record:
        systolic = record['vitals'].get('systolic_bp')
        diastolic = record['vitals'].get('diastolic_bp')
        if systolic and diastolic and systolic <= diastolic:
            raise ValueError(
                f"Systolic BP ({systolic}) must exceed "
                f"diastolic BP ({diastolic})"
            )
    
    # BMI calculation
    if all(k in record['vitals'] for k in ['weight_kg', 'height_cm', 'bmi']):
        height_m = record['vitals']['height_cm'] / 100
        calculated_bmi = record['vitals']['weight_kg'] / (height_m ** 2)
        actual_bmi = record['vitals']['bmi']
        
        if abs(calculated_bmi - actual_bmi) > 0.1:
            raise ValueError(f"BMI mismatch: {actual_bmi} vs {calculated_bmi}")
    
    # Age consistency with diagnosis
    age = record['demographics']['age']
    for diagnosis in record.get('diagnoses', []):
        # Example: Type 2 diabetes rare before age 18
        if diagnosis['code'] == 'E11.9' and age < 18:
            print(f"⚠️ Warning: Type 2 diabetes in {age} year old")
    
    return True
```

### Temporal Consistency

```python
from datetime import datetime

def validate_temporal_logic(record):
    """Verify chronological order of events."""
    
    dates = {}
    
    # Extract all dates
    if 'demographics' in record and 'birth_year' in record['demographics']:
        dates['birth'] = datetime(record['demographics']['birth_year'], 1, 1)
    
    for diagnosis in record.get('diagnoses', []):
        if 'onset_date' in diagnosis:
            dates[f"dx_{diagnosis['code']}"] = datetime.fromisoformat(
                diagnosis['onset_date']
            )
    
    for med in record.get('medications', []):
        if 'start_date' in med:
            dates[f"med_{med['name']}"] = datetime.fromisoformat(
                med['start_date']
            )
    
    # Check logical order
    sorted_dates = sorted(dates.items(), key=lambda x: x[1])
    
    # Birth should be first
    if sorted_dates[0][0] != 'birth':
        print("⚠️ Warning: Event before birth")
    
    return True
```

### Cross-Field Validation

```python
def validate_cross_fields(record):
    """Validate relationships between fields."""
    
    # Pregnancy diagnosis only for females
    gender = record['demographics'].get('gender')
    for diagnosis in record.get('diagnoses', []):
        if diagnosis['code'].startswith('O') and gender != 'female':
            raise ValueError(
                f"Pregnancy diagnosis (O-code) in {gender} patient"
            )
    
    # Diabetes medication requires diabetes diagnosis
    has_diabetes = any(
        d['code'].startswith('E1') 
        for d in record.get('diagnoses', [])
    )
    has_diabetes_med = any(
        m['name'] in ['Metformin', 'Insulin']
        for m in record.get('medications', [])
    )
    
    if has_diabetes_med and not has_diabetes:
        print("⚠️ Warning: Diabetes medication without diagnosis")
    
    return True
```

## Quality Validation

### Completeness Check

```python
def validate_completeness(dataset):
    """Check for missing data patterns."""
    
    total = len(dataset)
    completeness = {}
    
    # Check each field
    all_fields = set()
    for record in dataset:
        all_fields.update(record.keys())
    
    for field in all_fields:
        present = sum(1 for r in dataset if field in r and r[field])
        completeness[field] = {
            'count': present,
            'percentage': (present / total) * 100
        }
    
    # Identify sparse fields
    sparse_fields = [
        f for f, stats in completeness.items()
        if stats['percentage'] < 80
    ]
    
    if sparse_fields:
        print(f"⚠️ Sparse fields (<80% complete): {sparse_fields}")
    
    return completeness
```

### Duplicate Detection

```python
def check_duplicates(dataset, key_field='patient_id'):
    """Detect duplicate records."""
    
    seen = set()
    duplicates = []
    
    for record in dataset:
        key = record.get(key_field)
        if key in seen:
            duplicates.append(key)
        else:
            seen.add(key)
    
    if duplicates:
        raise ValueError(f"Duplicate {key_field} found: {duplicates}")
    
    return True
```

### Data Quality Score

```python
def calculate_quality_score(dataset):
    """Compute overall data quality score."""
    
    scores = {
        'schema_compliance': 0,
        'type_validity': 0,
        'range_validity': 0,
        'consistency': 0,
        'completeness': 0
    }
    
    total = len(dataset)
    
    for record in dataset:
        # Schema
        try:
            validate_schema(record, PATIENT_SCHEMA['required'])
            scores['schema_compliance'] += 1
        except:
            pass
        
        # Types
        try:
            validate_types(record, PATIENT_TYPES)
            scores['type_validity'] += 1
        except:
            pass
        
        # Ranges
        try:
            validate_ranges(record.get('vitals', {}), VITAL_RANGES)
            scores['range_validity'] += 1
        except:
            pass
        
        # Consistency
        try:
            validate_consistency(record)
            scores['consistency'] += 1
        except:
            pass
    
    # Normalize to percentages
    quality_scores = {
        k: (v / total) * 100 
        for k, v in scores.items()
    }
    
    # Overall score
    quality_scores['overall'] = sum(quality_scores.values()) / len(quality_scores)
    
    return quality_scores
```

## Validation Report Generation

### Comprehensive Report

```python
def generate_validation_report(dataset, output_file='validation_report.txt'):
    """Generate comprehensive validation report."""
    
    with open(output_file, 'w') as f:
        f.write("=" * 60 + "\n")
        f.write("SYNTHETIC DATASET VALIDATION REPORT\n")
        f.write("=" * 60 + "\n\n")
        
        # Basic stats
        f.write(f"Total Records: {len(dataset)}\n")
        f.write(f"Generated: {datetime.now().isoformat()}\n\n")
        
        # Quality scores
        f.write("QUALITY SCORES\n")
        f.write("-" * 60 + "\n")
        scores = calculate_quality_score(dataset)
        for metric, score in scores.items():
            f.write(f"{metric:.<40} {score:.1f}%\n")
        f.write("\n")
        
        # Distribution analysis
        f.write("DISTRIBUTION ANALYSIS\n")
        f.write("-" * 60 + "\n")
        
        age_stats = analyze_distributions(dataset, 'age')
        f.write(f"Age: mean={age_stats['mean']:.1f}, "
                f"std={age_stats['std']:.1f}, "
                f"range=[{age_stats['min']}, {age_stats['max']}]\n")
        
        # Completeness
        f.write("\nCOMPLETENESS\n")
        f.write("-" * 60 + "\n")
        completeness = validate_completeness(dataset)
        for field, stats in sorted(completeness.items()):
            f.write(f"{field:.<40} {stats['percentage']:.1f}%\n")
        
        f.write("\n" + "=" * 60 + "\n")
        f.write("END OF REPORT\n")
    
    print(f"✅ Validation report saved to {output_file}")
```

## Automated Validation Pipeline

### Complete Validation Function

```python
def validate_dataset(dataset, strict=True):
    """Run complete validation pipeline."""
    
    print("🔍 Starting dataset validation...\n")
    
    errors = []
    warnings = []
    
    # 1. Schema validation
    print("1. Schema validation...")
    try:
        for i, record in enumerate(dataset):
            validate_schema(record, PATIENT_SCHEMA['required'])
        print("   ✅ Schema valid")
    except Exception as e:
        errors.append(f"Schema: {e}")
        print(f"   ❌ {e}")
    
    # 2. Type validation
    print("2. Type validation...")
    try:
        for record in dataset:
            validate_types(record, PATIENT_TYPES)
        print("   ✅ Types valid")
    except Exception as e:
        errors.append(f"Types: {e}")
        print(f"   ❌ {e}")
    
    # 3. Format validation
    print("3. Format validation...")
    try:
        for record in dataset:
            validate_formats(record)
        print("   ✅ Formats valid")
    except Exception as e:
        errors.append(f"Formats: {e}")
        print(f"   ❌ {e}")
    
    # 4. Range validation
    print("4. Range validation...")
    try:
        for record in dataset:
            validate_ranges(record.get('vitals', {}), VITAL_RANGES)
        print("   ✅ Ranges valid")
    except Exception as e:
        errors.append(f"Ranges: {e}")
        print(f"   ❌ {e}")
    
    # 5. Consistency validation
    print("5. Consistency validation...")
    try:
        for record in dataset:
            validate_consistency(record)
        print("   ✅ Consistency valid")
    except Exception as e:
        errors.append(f"Consistency: {e}")
        print(f"   ❌ {e}")
    
    # 6. Duplicates
    print("6. Duplicate detection...")
    try:
        check_duplicates(dataset)
        print("   ✅ No duplicates")
    except Exception as e:
        errors.append(f"Duplicates: {e}")
        print(f"   ❌ {e}")
    
    # Summary
    print(f"\n{'='*60}")
    if errors:
        print(f"❌ Validation FAILED with {len(errors)} error(s):")
        for error in errors:
            print(f"   - {error}")
        if strict:
            raise ValueError("Dataset validation failed")
    else:
        print("✅ All validation checks PASSED")
    print(f"{'='*60}\n")
    
    return len(errors) == 0
```

## Quick Reference

### Command-Line Validation

```bash
# Validate patient dataset
python validate_data.py \
  --input datasets/patient-health/synthetic_patients.json \
  --schema schemas/patient_schema.json \
  --report validation_report.txt

# Validate with strict mode (fail on any error)
python validate_data.py --input data.json --strict

# Generate quality report only
python validate_data.py --input data.json --report-only
```

### Common Validation Patterns

```python
# Quick validation
assert len(dataset) > 0, "Empty dataset"
assert len(set(r['patient_id'] for r in dataset)) == len(dataset), "Duplicates"

# Batch validation
results = [validate_dataset([record]) for record in dataset]
failures = [i for i, r in enumerate(results) if not r]

# Custom validation rule
def custom_rule(record):
    return record['age'] >= 18 and record['state'] in US_STATES
```
