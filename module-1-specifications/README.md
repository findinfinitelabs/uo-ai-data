# Module 1: Data Specifications for AI/ML

## Overview

This module covers creating data specifications for AI and machine learning projects.
You'll learn to define data requirements, classify fields by sensitivity and data type,
and generate specification artifacts using AI.

## Learning Objectives

By the end of this module, students will be able to:

1. **Analyze use cases** to identify data requirements for AI/ML projects
2. **Classify data fields** by PHI, PII, sensitivity level, and data type
3. **Create data dictionaries** that document field-level specifications
4. **Use AI to generate** JSON schemas, validation rules, and sample data
5. **Consider privacy implications** when specifying healthcare and financial data

---

## Step 1: Analyzing Use Cases

Before defining data specifications, analyze the business scenario to understand:

### Five Key Questions

| Question | Why It Matters |
|----------|----------------|
| **What is the primary business objective?** | Determines which data is most critical |
| **Who are the end users?** | Influences data access and format requirements |
| **What regulatory frameworks apply?** | HIPAA, PCI-DSS, GDPR affect data handling |
| **What is the expected data volume?** | Impacts storage, processing, and model training |
| **What is the required data freshness?** | Real-time vs. batch processing needs |

### Example Use Cases

We'll work with three use cases throughout this module:

#### 1. Personalized Health Insights

👩🏾‍💼 **Maria Chen** - Marketing Executive, 52 years old

Maria wants to combine her wearable data (Oura Ring, Apple Watch) with her doctor's EHR records to get personalized insights about her cardiovascular risk.

**Data Sources:** Oura Ring API, Apple HealthKit, EHR System

---

#### 2. Manufacturing Equipment Analytics

🚜 **Pape Machinery, Inc.** - Heavy Equipment Manufacturer

Pape operates 50+ CNC machines and wants to predict equipment failures before they happen by combining IoT sensor data with maintenance logs and production schedules.

**Data Sources:** IoT Sensors, Maintenance Logs (SAP PM), MES Production

---

#### 3. Banking Fraud Detection

🏦 **Pacific Northwest Credit Union** - Financial Services

The credit union processes 50,000+ transactions daily and needs to detect fraudulent transactions in real-time by analyzing transaction patterns, customer behavior, and threat intelligence.

**Data Sources:** Transaction Stream, Customer Profiles, Threat Intelligence

---

## Step 2: Field Classification

For each data source, classify every field using these dimensions:

### Classification Dimensions

| Dimension | Options | Description |
|-----------|---------|-------------|
| **PHI** | Yes / No | Protected Health Information under HIPAA |
| **PII** | Yes / No | Personally Identifiable Information |
| **Sensitivity** | Public / Private / Confidential / Restricted | Data access level |
| **Data Type** | string, integer, float, boolean, date, datetime, array, object | Technical type |

### Sensitivity Levels

- **Public** - Can be shared openly (e.g., merchant categories, equipment IDs)
- **Private** - Internal use only (e.g., timestamps, work order IDs)
- **Confidential** - Need-to-know basis (e.g., health metrics, transaction amounts)
- **Restricted** - Highest protection (e.g., patient IDs, account numbers)

### Example: Personalized Health - Oura Ring API

| Field Name | PHI | PII | Sensitivity | Data Type |
|------------|-----|-----|-------------|-----------|
| user_id | No | Yes | Restricted | string |
| date | No | No | Private | date |
| sleep_score | Yes | No | Confidential | integer |
| hrv_avg | Yes | No | Confidential | integer |
| resting_hr | Yes | No | Confidential | integer |
| deep_sleep_mins | Yes | No | Confidential | integer |
| rem_sleep_mins | Yes | No | Confidential | integer |
| readiness_score | Yes | No | Confidential | integer |

### Example: Manufacturing - IoT Sensors

| Field Name | PHI | PII | Sensitivity | Data Type |
|------------|-----|-----|-------------|-----------|
| sensor_id | No | No | Public | string |
| equipment_id | No | No | Public | string |
| timestamp | No | No | Public | datetime |
| temperature_c | No | No | Public | float |
| vibration_hz | No | No | Public | float |
| pressure_psi | No | No | Public | float |
| oil_level_pct | No | No | Public | float |
| runtime_hours | No | No | Public | float |

### Example: Fraud Detection - Transaction Stream

| Field Name | PHI | PII | Sensitivity | Data Type |
|------------|-----|-----|-------------|-----------|
| transaction_id | No | No | Private | string |
| account_id | No | Yes | Restricted | string |
| timestamp | No | No | Private | datetime |
| amount | No | No | Confidential | float |
| merchant_category | No | No | Public | string |
| merchant_name | No | No | Public | string |
| location | No | Yes | Private | string |
| channel | No | No | Public | string |

---

## Step 3: AI-Assisted Specification Generation

Use AI to generate specification artifacts from your classified fields. Here are prompts you can use:

### Prompt 1: JSON Schema Generation

```text
Generate a JSON Schema for validating [DATA SOURCE] data with these fields:

[PASTE YOUR FIELD CLASSIFICATION TABLE]

Include:
- Required fields array
- Type constraints with format specifiers
- Value range constraints where appropriate
- Descriptions for each field
- $id and $schema headers
```

### Prompt 2: Data Dictionary

```text
Create a comprehensive data dictionary for [DATA SOURCE] with these fields:

[PASTE YOUR FIELD CLASSIFICATION TABLE]

Format as a table with columns:
- Field Name
- Data Type
- Description
- Valid Values/Range
- Required (Y/N)
- Example Value
- Privacy Classification
```

### Prompt 3: Validation Rules

```text
Generate data quality validation rules for [DATA SOURCE]:

[PASTE YOUR FIELD CLASSIFICATION TABLE]

Include rules for:
- Null/missing value handling
- Format validation (dates, IDs, etc.)
- Range checks for numeric fields
- Referential integrity between related fields
- Cross-field consistency checks
```

### Prompt 4: Sample Data Generator

```text
Create a Python script that generates realistic synthetic [DATA SOURCE] data:

[PASTE YOUR FIELD CLASSIFICATION TABLE]

Requirements:
- Generate 100 sample records
- Include realistic value distributions
- Maintain referential integrity
- Add edge cases for testing
- Output as both JSON and CSV
```

---

## Practice Exercise

Using the example files in `examples/`:

1. **Choose a use case** from the three examples above
2. **Complete field classification** for all data sources
3. **Generate a JSON schema** using the AI prompts
4. **Create a data dictionary** documenting all fields
5. **Write validation rules** for data quality

## Resources

- [JSON Schema Documentation](https://json-schema.org/)
- [FHIR Data Standards](https://www.hl7.org/fhir/)
- [HIPAA Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/)
- [PCI-DSS Requirements](https://www.pcisecuritystandards.org/)
- [Interactive Exercise - React App](/react-guide/)
