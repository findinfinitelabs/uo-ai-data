# Synthetic Data Generation Guide

## Overview
This directory contains Python scripts to generate synthetic healthcare data for educational purposes. The generated data is completely fictional and designed to teach students about data structure, quality, and AI training datasets.

## Prerequisites

### Python Installation
- Python 3.7 or higher
- No external libraries required (uses only Python standard library)

### Verify Python Installation
```bash
python --version
# or
python3 --version
```

## Generators

### 1. Patient Health Data Generator
**Script**: `generate_patient_data.py`

**Description**: Generates synthetic patient health records including demographics, vital signs, diagnoses, medications, allergies, and lab results.

**Output Files**:
- `datasets/patient-health/synthetic_patients.json` - Full JSON records
- `datasets/patient-health/synthetic_patients.csv` - Flattened CSV format

**Usage**:
```bash
cd module-4-synthetic-data
python generators/generate_patient_data.py
```

**Generated Fields**:
- Patient demographics (age, gender, race/ethnicity, ZIP code)
- Vital signs (blood pressure, heart rate, temperature, weight, height, BMI)
- Diagnoses (ICD-10 codes, descriptions, onset dates, status)
- Medications (names, dosages, start dates)
- Allergies (allergens, severity, reactions)
- Lab results (test names, values, units, reference ranges, dates)

**Default Configuration**:
- Number of patients: 100
- Adjustable in script: Change `NUM_PATIENTS` variable

### 2. Dental Records Generator
**Script**: `generate_dental_data.py`

**Description**: Generates synthetic dental examination records including tooth assessments, periodontal screenings, treatment plans, and procedures performed.

**Output Files**:
- `datasets/dental-records/synthetic_dental_visits.json` - Full JSON records
- `datasets/dental-records/synthetic_dental_visits.csv` - Flattened CSV format

**Usage**:
```bash
cd module-4-synthetic-data
python generators/generate_dental_data.py
```

**Generated Fields**:
- Visit information (visit ID, date, provider)
- Chief complaint
- Individual tooth assessments (32 teeth, conditions, surfaces)
- Periodontal screening (PSR codes, bleeding, pocket depths)
- Oral hygiene index
- Treatment plans (procedure codes, costs, priorities)
- Procedures performed (with anesthesia tracking)
- Imaging records (bitewings, panoramic x-rays)
- Next appointment recommendations

**Default Configuration**:
- Number of visits: 100
- Adjustable in script: Change `NUM_VISITS` variable

## Customization

### Adjusting Dataset Size
Edit the configuration variables at the top of each script:

**For patient data**:
```python
NUM_PATIENTS = 100  # Change to desired number
```

**For dental data**:
```python
NUM_VISITS = 100  # Change to desired number
```

### Adjusting Data Distributions
Modify the probability values in the scripts:

**Example - Increase percentage of patients with allergies**:
```python
# In generate_patient_data.py
if random.random() < 0.5:  # Changed from 0.3 to 0.5 (50%)
    num_allergies = random.randint(1, 2)
    return random.sample(ALLERGENS, num_allergies)
```

### Adding New Conditions
Add to the condition lists in the scripts:

**Example - Add new diagnosis**:
```python
DIAGNOSES = [
    # ... existing diagnoses ...
    {'code': 'J44.9', 'description': 'COPD, unspecified', 'status': 'chronic'},
]
```

### Changing Random Seed
For different random data generation:
```python
random.seed(42)  # Change to any number or remove for truly random
```

## Data Validation

After generating data, validate the output:

### Check File Creation
```bash
ls -lh datasets/patient-health/
ls -lh datasets/dental-records/
```

### Verify JSON Structure
```bash
python -m json.tool datasets/patient-health/synthetic_patients.json | head -50
```

### Count Records
```bash
# For JSON
python -c "import json; data=json.load(open('datasets/patient-health/synthetic_patients.json')); print(f'Total patients: {len(data)}')"

# For CSV
wc -l datasets/patient-health/synthetic_patients.csv
```

### Preview CSV Data
```bash
head -20 datasets/patient-health/synthetic_patients.csv
```

## Data Quality Checks

### Statistical Analysis
Use the validation scripts in the `validation/` directory:
```bash
python validation/validate_patient_data.py
python validation/validate_dental_data.py
```

### Manual Inspection
1. Check for missing values
2. Verify data ranges (e.g., age 0-120, BP realistic)
3. Ensure referential integrity (if combining datasets)
4. Validate code formats (ICD-10, CDT)
5. Check date consistency

## Privacy and Ethics

### Important Notes
- **All data is completely synthetic and fictional**
- No real patient information is included
- Data is for educational purposes only
- Suitable for teaching, testing, and demonstration
- Safe to share without privacy concerns

### What This Data Can Be Used For
✅ Learning data science and AI
✅ Testing data pipelines
✅ Demonstrating data analysis techniques
✅ Training machine learning models
✅ Teaching healthcare data standards
✅ Practicing data de-identification

### What This Data Should NOT Be Used For
❌ Clinical decision-making
❌ Research publication (as real data)
❌ Regulatory submissions
❌ Training production medical AI systems
❌ Replacing real data validation

## Integration with Other Modules

### Module 1 (Specifications)
- Compare generated data against schemas
- Validate data quality standards
- Test data dictionary completeness

### Module 2 (Regulations)
- Practice de-identification on already synthetic data
- Test compliance tools
- Demonstrate HIPAA identifier removal

### Module 3 (Ethical AI)
- Analyze demographic representation
- Test for bias in training data
- Evaluate fairness across subgroups

## Common Issues and Solutions

### Issue: Script not found
**Solution**: Ensure you're in the `module-4-synthetic-data` directory
```bash
cd module-4-synthetic-data
```

### Issue: Permission denied
**Solution**: Make script executable
```bash
chmod +x generators/generate_patient_data.py
```

### Issue: Output directory doesn't exist
**Solution**: Create directories
```bash
mkdir -p datasets/patient-health datasets/dental-records
```

### Issue: Want to regenerate with different data
**Solution**: Change random seed or delete existing files first
```bash
rm datasets/patient-health/*.json
rm datasets/patient-health/*.csv
python generators/generate_patient_data.py
```

## Advanced Usage

### Generating Larger Datasets
```bash
# Edit script to increase NUM_PATIENTS or NUM_VISITS
# For very large datasets, consider:
python generators/generate_patient_data.py > generation.log 2>&1
```

### Combining Datasets
```python
# Create combined health + dental records
# See generators/combine_datasets.py for examples
```

### Custom Data Formats
The scripts can be modified to output:
- Parquet files (with pandas)
- Excel files (with openpyxl)
- SQL insert statements
- FHIR JSON format

## Next Steps

1. Generate both patient and dental datasets
2. Explore the generated data in JSON and CSV formats
3. Use validation scripts to analyze data quality
4. Try customizing the generators for specific learning objectives
5. Use the data for AI/ML model training exercises

## Resources

- **JSON Format Guide**: https://www.json.org/
- **CSV Format Specification**: https://tools.ietf.org/html/rfc4180
- **ICD-10 Codes**: https://www.icd10data.com/
- **CDT Codes**: https://www.ada.org/en/publications/cdt
- **Python Random Module**: https://docs.python.org/3/library/random.html

## Support

For issues or questions about the data generators:
1. Check this README for solutions
2. Review the comments in the generator scripts
3. Validate your Python environment
4. Ensure all directories exist

---

*All data generated by these scripts is synthetic and for educational purposes only. No real patient data is included or used.*
