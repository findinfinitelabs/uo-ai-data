# Data Dictionary Template

## Dataset: [Dataset Name]

**Version**: [Version Number]  
**Last Updated**: [Date]  
**Owner**: [Data Owner Name]

---

## Overview

Brief description of the dataset and its purpose.

---

## Data Fields

### Patient Demographics

| Field Name | Data Type | Length | Required | Description | Valid Values | Example |
|------------|-----------|--------|----------|-------------|--------------|---------|
| patient_id | String | 9 | Yes | Anonymized unique patient identifier | Pattern: P[0-9]{8} | P00001234 |
| age | Integer | - | Yes | Patient age in years | 0-120 | 45 |
| gender | String | - | Yes | Patient gender | male, female, other, unknown | female |
| race_ethnicity | String | - | No | Patient race/ethnicity | See enumeration in schema | Asian |
| zip_code | String | 5 | No | Patient ZIP code | 5-digit numeric | 97403 |

### Health Metrics

| Field Name | Data Type | Length | Required | Description | Valid Values | Example |
|------------|-----------|--------|----------|-------------|--------------|---------|
| systolic_bp | Number | - | No | Systolic blood pressure | 60-250 mmHg | 120 |
| diastolic_bp | Number | - | No | Diastolic blood pressure | 40-150 mmHg | 80 |
| heart_rate | Number | - | No | Heart rate | 30-250 bpm | 72 |
| temperature | Number | - | No | Body temperature | 95.0-107.0 °F | 98.6 |
| weight | Number | - | No | Weight in pounds | 2-700 lbs | 165 |
| height | Number | - | No | Height in inches | 20-96 inches | 68 |
| bmi | Number | - | No | Body Mass Index | 10-80 | 25.1 |

### Diagnoses

| Field Name | Data Type | Length | Required | Description | Valid Values | Example |
|------------|-----------|--------|----------|-------------|--------------|---------|
| code | String | - | Yes | ICD-10 diagnosis code | Pattern: `[A-Z][0-9]{2}(\.[0-9]{1,4})?` | E11.9 |
| description | String | - | Yes | Diagnosis description | Free text | Type 2 diabetes mellitus |
| onset_date | Date | - | No | Date of diagnosis | ISO 8601 format | 2023-03-15 |
| status | String | - | No | Diagnosis status | active, resolved, chronic | active |

### Medications

| Field Name | Data Type | Length | Required | Description | Valid Values | Example |
|------------|-----------|--------|----------|-------------|--------------|---------|
| name | String | - | Yes | Medication name | Free text | Metformin |
| dosage | String | - | Yes | Dosage and frequency | Free text | 500mg twice daily |
| start_date | Date | - | No | Start date | ISO 8601 format | 2023-03-20 |
| end_date | Date | - | No | End date (if applicable) | ISO 8601 format | - |

### Lab Results

| Field Name | Data Type | Length | Required | Description | Valid Values | Example |
|------------|-----------|--------|----------|-------------|--------------|---------|
| test_name | String | - | Yes | Name of lab test | Free text | Glucose, fasting |
| value | Number | - | Yes | Test result value | Numeric | 95 |
| unit | String | - | Yes | Unit of measurement | Free text | mg/dL |
| reference_range | String | - | No | Normal reference range | Free text | 70-100 mg/dL |
| date | DateTime | - | Yes | Date and time of test | ISO 8601 format | 2024-01-15T09:30:00Z |
| abnormal_flag | Boolean | - | No | Outside normal range | true, false | false |

---

## Data Quality Rules

### Validation Rules

1. **Patient ID**: Must be unique across the dataset
2. **Age**: Must be a positive integer between 0 and 120
3. **Blood Pressure**: Systolic must be greater than diastolic
4. **BMI**: Calculated as weight(kg) / height(m)²; should match provided value within 0.5
5. **Dates**: All dates must be in ISO 8601 format (YYYY-MM-DD)
6. **ICD-10 Codes**: Must follow standard ICD-10 format

### Completeness Requirements

- **Critical Fields** (100% required): patient_id, age, gender
- **Important Fields** (95% recommended): vital signs for health monitoring
- **Optional Fields**: race_ethnicity, specific lab tests based on patient condition

### Consistency Checks

- Gender values must be from the controlled vocabulary
- All diagnosis codes must be valid ICD-10 codes
- Medication names should use generic names when possible
- Dates should be chronologically consistent (e.g., end_date >= start_date)

---

## Data Lineage

- **Source System**: [EHR System Name]
- **Extraction Method**: [API/Batch Export/Manual]
- **Transformation Applied**: [De-identification, normalization, etc.]
- **Load Frequency**: [Real-time/Daily/Weekly]

---

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2024-01-01 | Initial version | [Name] |
| 1.1 | 2024-02-15 | Added lab_results table | [Name] |

---

## Notes

- This dataset contains synthetic data for educational purposes only
- All patient identifiers are anonymized
- Data complies with HIPAA Safe Harbor method for de-identification
