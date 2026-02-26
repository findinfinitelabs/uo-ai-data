# Healthcare Data Dictionary

## Student Exercise: Specification Introduction

**Instructions**: Before reviewing the detailed data dictionary below, write a comprehensive introduction that defines:
1. **What is this document?** - Explain the purpose and scope of this healthcare data dictionary
2. **Dataset Overview** - Describe what the synthetic healthcare dataset contains and how the tables relate to each other
3. **Intended Use** - Explain how this data will be used for AI/ML training and analysis
4. **Data Context** - Provide relevant context about the data source, environment, and classification
5. **Write in Your Words** -  Write the specification in your own words first
6. **Write using AI** - Next write your specifications using AI and compare the two

**Your Introduction** (write 2-4 paragraphs):

```
[STUDENT: Write your specification introduction here. Consider addressing:
- The purpose of documenting healthcare data specifications
- An overview of the 6 interconnected DynamoDB tables (patients, diagnoses, 
  medications, providers, and their relationships)
- The educational context and synthetic nature of this dataset
- Any relevant technical details (data source, AWS environment, etc.)
- The importance of proper data documentation for healthcare AI/ML projects]
```

**Reference Information**:
- **Data Source**: DynamoDB Tables (healthcare-*)  
- **Region**: us-west-2  
- **Environment**: AWS Innovation Sandbox  
- **Purpose**: Educational AI/ML training for healthcare analytics  
- **Data Classification**: Synthetic (HIPAA-compliant training data)

**AI Model Use**: Evaluate AI 

Evaluate how AI models can be used to create this specification.

---

## Classification Legend

### PHI (Protected Health Information)
Health information that can be linked to an individual and relates to:
- **Yes**: Information covered under HIPAA (medical conditions, treatments, health metrics)
- **No**: Non-health information or anonymized health data

### PII (Personally Identifiable Information)
Information that can identify a specific individual:
- **Yes**: Can identify an individual (names, contact info, IDs)
- **No**: Cannot identify a specific individual

### Sensitivity Levels
- **Public**: Information that can be shared freely (medication names, general medical knowledge)
- **Private**: Internal use only (identifiers, contact information)
- **Confidential**: Limited access required (health records, insurance information)
- **Restricted**: Strictest controls (clinical notes, treatment details)

---

## Table 1: Patients

**Table Name**: `healthcare-patients`  
**Primary Key**: `patient_id` (String)  
**Description**: Core patient demographic and contact information

| Field Name | Data Type | PHI | PII | Sensitivity | Description | Valid Values | Example |
|------------|-----------|-----|-----|-------------|-------------|--------------|---------|
| patient_id | String | No | Yes | Private | Unique patient identifier | Format: P##### | P00001 |
| first_name | String | No | Yes | Private | Patient's first name | Any valid name | John |
| last_name | String | No | Yes | Private | Patient's last name | Any valid name | Doe |
| date_of_birth | String (ISO 8601) | Yes | Yes | Confidential | Patient's date of birth | YYYY-MM-DD | 1985-03-15 |
| gender | String | Yes | No | Private | Patient's gender | Male, Female, Other | Male |
| blood_type | String | Yes | No | Confidential | Patient's blood type | A+, A-, B+, B-, AB+, AB-, O+, O- | O+ |
| email | String | No | Yes | Private | Patient's email address | Valid email format | john.doe@email.com |
| phone | String | No | Yes | Private | Patient's phone number | Various formats | (555) 123-4567 |
| address | String | No | Yes | Private | Patient's street address | Any valid address | 123 Main St |
| city | String | No | Yes | Private | Patient's city | Any valid city name | Springfield |
| state | String | No | Yes | Private | Patient's state | 2-letter state code | CA |
| zip_code | String | No | Yes | Private | Patient's ZIP code | 5-digit format | 90210 |
| insurance_provider | String | Yes | No | Confidential | Name of insurance company | Insurance company names | Blue Cross Blue Shield |
| insurance_id | String | Yes | Yes | Confidential | Patient's insurance ID number | Alphanumeric | BC123456789 |
| emergency_contact | String | No | Yes | Private | Emergency contact name | Any valid name | Jane Doe |
| emergency_phone | String | No | Yes | Private | Emergency contact phone | Various formats | (555) 987-6543 |
| created_at | String (ISO 8601) | No | No | Private | Record creation timestamp | ISO 8601 datetime | 2024-01-15T10:30:00Z |
| updated_at | String (ISO 8601) | No | No | Private | Record update timestamp | ISO 8601 datetime | 2024-02-20T14:45:00Z |

**Data Quality Rules**:
- `patient_id` must be unique and follow P##### format
- `date_of_birth` must be a valid past date
- `email` must be valid email format
- `blood_type` must match one of 8 valid types
- `zip_code` must be 5 digits
- All timestamp fields use ISO 8601 format

**Null Handling**:
- Required fields: patient_id, first_name, last_name, date_of_birth, created_at
- Optional fields: email, phone, insurance_provider, insurance_id, emergency_contact, emergency_phone, updated_at

---

## Table 2: Diagnoses

**Table Name**: `healthcare-diagnoses`  
**Primary Key**: `diagnosis_code` (String)  
**Description**: Reference table of medical diagnoses and conditions

| Field Name | Data Type | PHI | PII | Sensitivity | Description | Valid Values | Example |
|------------|-----------|-----|-----|-------------|-------------|--------------|---------|
| diagnosis_code | String | No | No | Private | Unique diagnosis identifier | Format: D##### | D00001 |
| diagnosis_name | String | No | No | Public | Common name of the condition | Medical condition names | Hypertension |
| icd10_code | String | No | No | Public | ICD-10 diagnostic code | Format: X##.## | I10.0 |
| description | String | No | No | Public | Clinical description | Free text | Clinical diagnosis of Hypertension |
| severity | String | No | No | Public | Condition severity level | Mild, Moderate, Severe, Critical | Moderate |
| category | String | No | No | Public | Medical category | Cardiovascular, Respiratory, Metabolic, Mental Health, Musculoskeletal | Cardiovascular |
| typical_treatment | String | No | No | Public | Standard treatment approach | Free text | Standard treatment protocol for Hypertension |
| created_at | String (ISO 8601) | No | No | Private | Record creation timestamp | ISO 8601 datetime | 2024-01-15T10:30:00Z |

**Data Quality Rules**:
- `diagnosis_code` must be unique and follow D##### format
- `icd10_code` should follow ICD-10 format standards
- `severity` must be one of: Mild, Moderate, Severe, Critical
- `category` must be one of defined medical categories

**Null Handling**:
- Required fields: diagnosis_code, diagnosis_name, created_at
- Optional fields: icd10_code, description, severity, category, typical_treatment

**Note**: This is a reference table containing general medical knowledge, not patient-specific data.

---

## Table 3: Medications

**Table Name**: `healthcare-medications`  
**Primary Key**: `medication_id` (String)  
**Description**: Reference table of pharmaceutical medications

| Field Name | Data Type | PHI | PII | Sensitivity | Description | Valid Values | Example |
|------------|-----------|-----|-----|-------------|-------------|--------------|---------|
| medication_id | String | No | No | Public | Unique medication identifier | Format: MED##### | MED00001 |
| generic_name | String | No | No | Public | Generic medication name | Standard drug names | Lisinopril |
| brand_name | String | No | No | Public | Brand/commercial name | Proprietary names | Zestril |
| medication_class | String | No | No | Public | Therapeutic drug class | Drug class names | ACE Inhibitor |
| dosage_forms | String | No | No | Public | Available forms | Tablet, Capsule, Liquid, Injection, Patch | Tablet |
| typical_dosage | String | No | No | Public | Standard dosage amount | Format: ##mg | 10mg |
| route | String | No | No | Public | Administration route | Oral, IV, IM, Topical, Sublingual | Oral |
| frequency | String | No | No | Public | Standard dosing schedule | Once daily, Twice daily, Three times daily, As needed | Once daily |
| side_effects | String | No | No | Public | Common side effects | Comma-separated list | dizziness, fatigue, headache |
| contraindications | String | No | No | Public | Medical contraindications | Comma-separated list | pregnancy, kidney disease |
| manufacturer | String | No | No | Public | Pharmaceutical company | Company names | Merck |
| fda_approved | Boolean | No | No | Public | FDA approval status | true, false | true |
| created_at | String (ISO 8601) | No | No | Private | Record creation timestamp | ISO 8601 datetime | 2024-01-15T10:30:00Z |

**Data Quality Rules**:
- `medication_id` must be unique and follow MED##### format
- `generic_name` must be provided
- `route` must be one of defined administration routes
- `fda_approved` must be boolean value

**Null Handling**:
- Required fields: medication_id, generic_name, created_at
- Optional fields: brand_name, medication_class, dosage_forms, typical_dosage, route, frequency, side_effects, contraindications, manufacturer, fda_approved

**Note**: This is a reference table containing public pharmaceutical information, not patient-specific prescriptions.

---

## Table 4: Providers

**Table Name**: `healthcare-providers`  
**Primary Key**: `provider_id` (String)  
**Description**: Healthcare provider credentials and contact information

| Field Name | Data Type | PHI | PII | Sensitivity | Description | Valid Values | Example |
|------------|-----------|-----|-----|-------------|-------------|--------------|---------|
| provider_id | String | No | No | Private | Unique provider identifier | Format: PROV##### | PROV00001 |
| first_name | String | No | Yes | Private | Provider's first name | Any valid name | Sarah |
| last_name | String | No | Yes | Private | Provider's last name | Any valid name | Johnson |
| title | String | No | No | Public | Medical credential | MD, DO, NP, PA | MD |
| specialty | String | No | No | Public | Medical specialty | Specialty names | Cardiology |
| npi_number | String | No | Yes | Private | National Provider Identifier | 10-digit number | 1234567890 |
| dea_number | String | No | Yes | Confidential | DEA registration number | Format: XX####### | AB1234567 |
| license_number | String | No | Yes | Private | Medical license number | Format: XXX###### | ABC123456 |
| license_state | String | No | No | Public | State of licensure | 2-letter state code | CA |
| email | String | No | Yes | Private | Provider's email | Valid email format | dr.johnson@hospital.com |
| phone | String | No | Yes | Private | Provider's phone | Various formats | (555) 234-5678 |
| hospital_affiliation | String | No | No | Public | Affiliated hospital/clinic | Hospital names | Memorial Medical Center |
| years_experience | Number | No | No | Public | Years in practice | 1-40 | 15 |
| accepting_patients | Boolean | No | No | Public | Accepting new patients | true, false | true |
| created_at | String (ISO 8601) | No | No | Private | Record creation timestamp | ISO 8601 datetime | 2024-01-15T10:30:00Z |

**Data Quality Rules**:
- `provider_id` must be unique and follow PROV##### format
- `npi_number` must be 10 digits
- `dea_number` follows DEA format (2 letters + 7 digits)
- `years_experience` must be positive integer
- `title` must be one of: MD, DO, NP, PA

**Null Handling**:
- Required fields: provider_id, first_name, last_name, title, specialty, created_at
- Optional fields: npi_number, dea_number, license_number, license_state, email, phone, hospital_affiliation, years_experience, accepting_patients

---

## Table 5: Patient-Diagnoses

**Table Name**: `healthcare-patient-diagnoses`  
**Composite Key**: `patient_id` (HASH) + `diagnosis_code` (RANGE)  
**Description**: Links patients to their diagnoses with clinical details

| Field Name | Data Type | PHI | PII | Sensitivity | Description | Valid Values | Example |
|------------|-----------|-----|-----|-------------|-------------|--------------|---------|
| patient_id | String | No | Yes | Private | Patient identifier (FK) | Format: P##### | P00001 |
| diagnosis_code | String | No | No | Private | Diagnosis identifier (FK) | Format: D##### | D00015 |
| diagnosed_date | String (ISO 8601) | Yes | No | Confidential | Date of diagnosis | YYYY-MM-DD | 2023-06-15 |
| provider_id | String | No | No | Private | Diagnosing provider (FK) | Format: PROV##### | PROV00032 |
| status | String | Yes | No | Confidential | Current condition status | Active, Resolved, Chronic, In Remission | Active |
| notes | String | Yes | No | Restricted | Clinical notes | Free text | Patient reports improved symptoms after treatment |
| follow_up_required | Boolean | Yes | No | Confidential | Follow-up needed | true, false | true |
| last_visit | String (ISO 8601) | Yes | No | Confidential | Last appointment date | YYYY-MM-DD | 2024-01-20 |
| created_at | String (ISO 8601) | No | No | Private | Record creation timestamp | ISO 8601 datetime | 2024-01-15T10:30:00Z |

**Data Quality Rules**:
- `patient_id` must exist in Patients table
- `diagnosis_code` must exist in Diagnoses table
- `provider_id` must exist in Providers table
- `diagnosed_date` must be past or current date
- `last_visit` must be >= `diagnosed_date`
- `status` must be one of: Active, Resolved, Chronic, In Remission

**Null Handling**:
- Required fields: patient_id, diagnosis_code, diagnosed_date, provider_id, created_at
- Optional fields: status, notes, follow_up_required, last_visit

**Relationships**:
- Many-to-Many relationship between Patients and Diagnoses
- Many-to-One relationship with Providers (diagnosing physician)

**Privacy Note**: This table contains highly sensitive PHI linking patients to medical conditions. Access should be strictly controlled and audited.

---

## Table 6: Patient-Medications

**Table Name**: `healthcare-patient-medications`  
**Composite Key**: `patient_id` (HASH) + `medication_id` (RANGE)  
**Description**: Links patients to prescribed medications with dosage and status

| Field Name | Data Type | PHI | PII | Sensitivity | Description | Valid Values | Example |
|------------|-----------|-----|-----|-------------|-------------|--------------|---------|
| patient_id | String | No | Yes | Private | Patient identifier (FK) | Format: P##### | P00001 |
| medication_id | String | No | No | Private | Medication identifier (FK) | Format: MED##### | MED00042 |
| prescribed_date | String (ISO 8601) | Yes | No | Confidential | Date of prescription | YYYY-MM-DD | 2023-08-10 |
| provider_id | String | No | No | Private | Prescribing provider (FK) | Format: PROV##### | PROV00025 |
| dosage | String | Yes | No | Confidential | Prescribed dosage | Format: ##mg | 20mg |
| frequency | String | Yes | No | Confidential | Dosing schedule | Once daily, Twice daily, Three times daily, As needed | Once daily |
| duration_days | Number | Yes | No | Confidential | Prescription duration | 7-365 days | 90 |
| refills_remaining | Number | Yes | No | Confidential | Number of refills left | 0-5 | 2 |
| pharmacy | String | Yes | No | Private | Dispensing pharmacy | Pharmacy names | Walgreens Pharmacy |
| status | String | Yes | No | Confidential | Prescription status | Active, Completed, Discontinued, On Hold | Active |
| notes | String | Yes | No | Restricted | Clinical/pharmacy notes | Free text | Take with food. Monitor blood pressure weekly. |
| created_at | String (ISO 8601) | No | No | Private | Record creation timestamp | ISO 8601 datetime | 2024-01-15T10:30:00Z |

**Data Quality Rules**:
- `patient_id` must exist in Patients table
- `medication_id` must exist in Medications table
- `provider_id` must exist in Providers table
- `prescribed_date` must be past or current date
- `duration_days` must be positive integer (7-365)
- `refills_remaining` must be 0-5
- `status` must be one of: Active, Completed, Discontinued, On Hold

**Null Handling**:
- Required fields: patient_id, medication_id, prescribed_date, provider_id, dosage, frequency, created_at
- Optional fields: duration_days, refills_remaining, pharmacy, status, notes

**Relationships**:
- Many-to-Many relationship between Patients and Medications
- Many-to-One relationship with Providers (prescribing physician)

**Privacy Note**: This table contains sensitive PHI regarding patient medications. Access should be strictly controlled and audited.

---

## Access Control Matrix

| Role | Patients | Diagnoses | Medications | Providers | Patient-Diagnoses | Patient-Medications |
|------|----------|-----------|-------------|-----------|-------------------|---------------------|
| Data Scientist | Read-Only (Anonymized) | Read-Only | Read-Only | Read-Only | Read-Only (Anonymized) | Read-Only (Anonymized) |
| Healthcare Admin | Full Access | Read-Only | Read-Only | Full Access | Read-Only | Read-Only |
| Clinical Staff | Full Access | Read-Only | Read-Only | Read-Only | Full Access | Full Access |
| Billing Department | Read (Limited) | Read-Only | Read-Only | Read-Only | Read (Limited) | Read (Limited) |
| Patients | Own Records Only | Read-Only | Read-Only | Read-Only | Own Records Only | Own Records Only |
| Auditor | Read-Only (Full) | Read-Only | Read-Only | Read-Only | Read-Only (Full) | Read-Only (Full) |

**Access Notes**:
- All PHI access must be logged and audited per HIPAA requirements
- Anonymization must remove all 18 HIPAA identifiers for research use
- Patient access requires identity verification
- Administrative access requires role-based authentication

---

## Data Relationships

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────┐
│  Patients   │◄────────┤ Patient-Diagnoses    ├────────►│  Diagnoses  │
│             │         │                      │         │             │
│ patient_id  │         │ patient_id (FK)      │         │ diagnosis   │
│ first_name  │         │ diagnosis_code (FK)  │         │  _code      │
│ last_name   │         │ diagnosed_date       │         │ icd10_code  │
│ dob         │         │ provider_id (FK)     │         │ severity    │
│ blood_type  │         │ status               │         └─────────────┘
│ ...         │         │ notes                │
└─────────────┘         └──────────────────────┘
      ▲                          │
      │                          │
      │                          ▼
      │                  ┌─────────────┐
      │                  │  Providers  │
      │                  │             │
      │                  │ provider_id │
      │                  │ specialty   │
      │                  │ npi_number  │
      │                  └─────────────┘
      │                          ▲
      │                          │
      │                          │
      │                ┌──────────────────────┐         ┌──────────────┐
      └────────────────┤ Patient-Medications  ├────────►│ Medications  │
                       │                      │         │              │
                       │ patient_id (FK)      │         │ medication   │
                       │ medication_id (FK)   │         │  _id         │
                       │ prescribed_date      │         │ generic_name │
                       │ provider_id (FK)     │         │ brand_name   │
                       │ dosage               │         │ ...          │
                       │ status               │         └──────────────┘
                       └──────────────────────┘
```

---

## HIPAA Compliance Notes

### De-identification Requirements
For AI training on this synthetic data in production environments with real data:

**Safe Harbor Method - Remove/Generalize**:
1. Names (first_name, last_name, emergency_contact)
2. Geographic subdivisions smaller than state
3. Dates (except year) - use date ranges instead
4. Phone numbers, email addresses
5. Medical record numbers (patient_id, provider_id)
6. Account numbers (insurance_id)

**Expert Determination Method**:
- Statistical disclosure risk assessment required
- Document de-identification procedures
- Maintain audit trail of anonymization

### Data Retention
- Training data: Retain per institutional policy
- Audit logs: Minimum 6 years per HIPAA
- Patient requests for deletion: Complete within 30 days

---

## Student Exercise: Data Risk Assessment

**Instructions**: Now that you've reviewed the complete healthcare data dictionary, analyze and document the potential risks associated with using this data for AI/ML applications. Consider multiple risk dimensions and provide a comprehensive risk overview.

**Your Risk Assessment** (write 3-5 paragraphs addressing the following areas):

```
[STUDENT: Write your data risk assessment here. Consider addressing:

1. PRIVACY & SECURITY RISKS:
   - What are the risks of PHI/PII exposure even with synthetic data?
   - How could this data be re-identified or linked to real individuals?
   - What security vulnerabilities exist in the data storage and access patterns?

2. COMPLIANCE & REGULATORY RISKS:
   - What HIPAA compliance challenges might arise when using this data?
   - What happens if real patient data accidentally gets mixed with synthetic data?
   - What are the legal implications of improper data handling?

3. AI/ML MODEL RISKS:
   - What biases might be present in synthetic healthcare data generation?
   - How could training on synthetic data lead to poor real-world model performance?
   - What risks exist in generalizing from this dataset to actual patient populations?

4. OPERATIONAL RISKS:
   - What could go wrong during data pipeline operations?
   - What are the risks of data quality issues or corruption?
   - How might inadequate documentation lead to misuse of this data?

5. ETHICAL RISKS:
   - What ethical concerns arise from using healthcare data for AI training?
   - How might this data perpetuate healthcare disparities?
   - What are the implications of automated decision-making based on this data?

Provide specific examples and explain the potential impact of each risk category.]
```

**Risk Mitigation Considerations**:
After documenting risks, consider what controls, policies, or technical measures could reduce these risks. How would you approach risk management for a healthcare AI project using this data?

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2024-02-26 | System | Converted to student exercise format with introduction and risk assessment sections |
| 1.0 | 2024-02-26 | System | Initial healthcare data dictionary creation for Module 1 with all 6 DynamoDB tables |

---

## Additional Resources

- **HIPAA Privacy Rule**: [HHS.gov HIPAA](https://www.hhs.gov/hipaa)
- **ICD-10 Codes**: [WHO ICD-10](https://www.who.int/classifications/icd)
- **DynamoDB Documentation**: See `/module-5-synthetic-data/dynamodb-queries.md`
- **Data Generation Scripts**: See `/module-5-synthetic-data/generators/`

---

*This data dictionary is part of the UO AI Data educational curriculum and documents synthetic healthcare data only. No real patient information is contained in this dataset.*
