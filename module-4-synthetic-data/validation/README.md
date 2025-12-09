# Data Validation Tools

## Overview
This directory contains tools and scripts for validating the quality and characteristics of synthetic datasets generated in Module 4.

## Purpose
Data validation ensures that:
- Generated data meets specified requirements
- Statistical properties are realistic
- Data distributions are appropriate
- No privacy violations exist (even in synthetic data)
- Data is suitable for AI/ML training

## Validation Categories

### 1. Schema Validation
- Verify all required fields are present
- Check data types match specifications
- Validate field formats (dates, codes, etc.)
- Ensure referential integrity

### 2. Statistical Validation
- Analyze distributions of numeric fields
- Check for outliers and anomalies
- Verify correlations make sense
- Compare to real-world population statistics

### 3. Quality Validation
- Check for missing values
- Identify duplicate records
- Verify value ranges
- Validate code formats (ICD-10, CDT)

### 4. Consistency Validation
- Check internal consistency (e.g., systolic > diastolic BP)
- Verify temporal consistency (dates in logical order)
- Validate logical relationships

## Usage

### Basic Validation
Students can create validation scripts using Python:

```python
import json
import pandas as pd

# Load synthetic data
with open('../datasets/patient-health/synthetic_patients.json', 'r') as f:
    patients = json.load(f)

# Example validations
print(f"Total patients: {len(patients)}")

# Check age distribution
ages = [p['demographics']['age'] for p in patients]
print(f"Age range: {min(ages)} to {max(ages)}")
print(f"Average age: {sum(ages)/len(ages):.1f}")

# Check for required fields
for i, patient in enumerate(patients):
    if 'patient_id' not in patient:
        print(f"Patient {i} missing patient_id")
```

### Advanced Validation
- Use pandas for statistical analysis
- Create visualization of distributions
- Compare against expected ranges
- Generate validation reports

## Validation Checklist

### Patient Health Data
- [ ] All patient IDs are unique
- [ ] Ages are between 0-120
- [ ] Systolic BP > Diastolic BP
- [ ] BMI calculation is correct
- [ ] ICD-10 codes follow proper format
- [ ] Lab values are within realistic ranges
- [ ] Dates are in ISO 8601 format
- [ ] No missing required fields

### Dental Records Data
- [ ] All visit IDs are unique
- [ ] Tooth numbers are 1-32
- [ ] CDT codes follow proper format (D####)
- [ ] PSR codes are 0-4
- [ ] Pocket depths are 0-15mm
- [ ] Dates are in ISO 8601 format
- [ ] Treatment costs are reasonable
- [ ] No missing required fields

## Example Validation Scripts

### Count Statistics
```bash
# Count total records (includes header line, so subtract 1 for actual record count)
wc -l ../datasets/patient-health/synthetic_patients.csv

# Count records without header
tail -n +2 ../datasets/patient-health/synthetic_patients.csv | wc -l

# View first few records
head -10 ../datasets/patient-health/synthetic_patients.csv
```

### JSON Validation
```bash
# Validate JSON syntax
python -m json.tool ../datasets/patient-health/synthetic_patients.json > /dev/null
echo "JSON is valid"
```

### Data Profiling with Pandas
```python
import pandas as pd

# Load CSV data
df = pd.read_csv('../datasets/patient-health/synthetic_patients.csv')

# Basic statistics
print(df.describe())

# Check for missing values
print(df.isnull().sum())

# Value counts for categorical fields
print(df['gender'].value_counts())
print(df['race_ethnicity'].value_counts())
```

## Exercises for Students

1. **Schema Validation Exercise**
   - Load the JSON schema from Module 1
   - Validate synthetic data against the schema
   - Report any violations

2. **Statistical Analysis Exercise**
   - Calculate summary statistics for all numeric fields
   - Create histograms of age, BMI, blood pressure
   - Identify any unrealistic values

3. **Bias Detection Exercise**
   - Analyze demographic representation
   - Check if all groups are adequately represented
   - Apply bias assessment checklist from Module 3

4. **Quality Metrics Exercise**
   - Calculate completeness percentage
   - Identify fields with missing values
   - Assess overall data quality score

## Resources

### Python Libraries for Validation
- **jsonschema**: Validate JSON against schemas
- **pandas**: Data analysis and profiling
- **numpy**: Numerical validation
- **Great Expectations**: Comprehensive data validation framework

### Installation
```bash
pip install jsonschema pandas numpy
```

### Example: Schema Validation
```python
import json
import jsonschema
from jsonschema import validate

# Load schema
with open('../../module-1-specifications/examples/patient-health-schema.json', 'r') as f:
    schema = json.load(f)

# Load data
with open('../datasets/patient-health/synthetic_patients.json', 'r') as f:
    patients = json.load(f)

# Validate each patient record
for i, patient in enumerate(patients):
    try:
        validate(instance=patient, schema=schema)
        print(f"Patient {i} is valid")
    except jsonschema.exceptions.ValidationError as e:
        print(f"Patient {i} validation error: {e.message}")
```

## Next Steps

1. Run basic validation checks on generated data
2. Create custom validation scripts for your use case
3. Document any data quality issues found
4. Iterate on data generation to improve quality
5. Compare validation results across different datasets

---

*This directory is part of Module 4: Synthetic Data Creation. Use these validation techniques to ensure high-quality synthetic datasets for AI training.*
