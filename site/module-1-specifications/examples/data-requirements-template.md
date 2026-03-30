# Data Requirements Template

Use this template to document data requirements for your AI/ML project. Answer the five key questions first, then detail each data source.

---

## Project Overview

**Project Name:** _[Your project name]_

**Use Case:** _[Brief description of the business problem]_

**Date:** _[Date created]_

---

## Step 1: Five Key Questions

### 1. What is the primary business objective?

_What specific outcome do you want to predict or automate? Be specific._

**Example (Personalized Health):** Predict cardiovascular risk by correlating wearable data patterns with clinical health markers.

**Example (Manufacturing):** Predict equipment failures 24-48 hours in advance to enable preventive maintenance.

**Example (Fraud Detection):** Detect fraudulent transactions in real-time with <100ms latency and <1% false positive rate.

**Your Answer:** _________________________________

---

### 2. Who are the end users?

_Who will consume the model's outputs? What decisions will they make?_

| User Type | How They Use Output | Required Format |
|-----------|---------------------|-----------------|
| _e.g., Patient_ | _Review health insights_ | _Mobile app dashboard_ |
| _e.g., Physician_ | _Validate AI recommendations_ | _EHR integration_ |
| _e.g., Operator_ | _Act on maintenance alerts_ | _SMS/Email notification_ |

**Your Answer:**

| User Type | How They Use Output | Required Format |
|-----------|---------------------|-----------------|
| | | |
| | | |
| | | |

---

### 3. What regulatory frameworks apply?

_Check all that apply and note specific requirements._

| Framework | Applies? | Key Requirements |
|-----------|----------|------------------|
| HIPAA | ☐ Yes ☐ No | PHI protection, BAA required |
| PCI-DSS | ☐ Yes ☐ No | Card data encryption, audit trails |
| GDPR | ☐ Yes ☐ No | Consent, right to erasure, DPO |
| SOX | ☐ Yes ☐ No | Financial audit controls |
| FERPA | ☐ Yes ☐ No | Student record protection |
| State Privacy Laws | ☐ Yes ☐ No | _Specify: CCPA, etc._ |

**Additional Notes:** _________________________________

---

### 4. What is the expected data volume?

_Estimate the scale for capacity planning._

| Data Source | Records/Day | Records/Month | Retention Period |
|-------------|-------------|---------------|------------------|
| _e.g., Wearable data_ | _1,440 (1/min)_ | _43,200_ | _24 months_ |
| _e.g., Transactions_ | _50,000_ | _1.5M_ | _7 years_ |
| _e.g., IoT sensors_ | _86,400 (1/sec)_ | _2.6M_ | _12 months_ |

**Your Estimates:**

| Data Source | Records/Day | Records/Month | Retention Period |
|-------------|-------------|---------------|------------------|
| | | | |
| | | | |
| | | | |

**Total Storage Estimate:** ______________ GB/month

---

### 5. What is the required data freshness?

_How current does the data need to be for the use case?_

| Category | Latency Requirement | Your Need |
|----------|---------------------|-----------|
| Real-time | < 1 second | ☐ |
| Near real-time | 1 second - 5 minutes | ☐ |
| Hourly | Refreshed every hour | ☐ |
| Daily batch | Overnight processing | ☐ |
| Weekly/Monthly | Periodic updates | ☐ |

**Justification:** _Why does the use case require this freshness?_

---

## Step 2: Data Sources

### Data Source 1: _[Name]_

**Source Type:** _[API / Database / File Export / Stream]_

**Owner/Vendor:** _[Who controls this data?]_

**Access Method:** _[REST API / JDBC / SFTP / Kafka]_

**Authentication:** _[OAuth / API Key / Credentials]_

**Update Frequency:** _[Real-time / Hourly / Daily / On-demand]_

#### Fields

| Field Name | PHI | PII | Sensitivity | Data Type | Required |
|------------|-----|-----|-------------|-----------|----------|
| | | | | | |
| | | | | | |
| | | | | | |

---

### Data Source 2: _[Name]_

**Source Type:** _[API / Database / File Export / Stream]_

**Owner/Vendor:** _[Who controls this data?]_

**Access Method:** _[REST API / JDBC / SFTP / Kafka]_

**Authentication:** _[OAuth / API Key / Credentials]_

**Update Frequency:** _[Real-time / Hourly / Daily / On-demand]_

#### Fields

| Field Name | PHI | PII | Sensitivity | Data Type | Required |
|------------|-----|-----|-------------|-----------|----------|
| | | | | | |
| | | | | | |
| | | | | | |

---

### Data Source 3: _[Name]_

**Source Type:** _[API / Database / File Export / Stream]_

**Owner/Vendor:** _[Who controls this data?]_

**Access Method:** _[REST API / JDBC / SFTP / Kafka]_

**Authentication:** _[OAuth / API Key / Credentials]_

**Update Frequency:** _[Real-time / Hourly / Daily / On-demand]_

#### Fields

| Field Name | PHI | PII | Sensitivity | Data Type | Required |
|------------|-----|-----|-------------|-----------|----------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## Summary Checklist

Before proceeding to schema generation, verify:

- [ ] All five key questions answered with specific details
- [ ] All data sources identified with access methods
- [ ] Every field classified for PHI, PII, and Sensitivity
- [ ] Data types specified for all fields
- [ ] Regulatory requirements documented
- [ ] Data volume estimates completed
- [ ] Data freshness requirements justified

---

## Next Steps

1. **Generate JSON Schema** - Use AI to create validation schemas from field classifications
2. **Create Data Dictionary** - Document detailed field specifications
3. **Define Validation Rules** - Establish data quality checks
4. **Generate Sample Data** - Create synthetic test data
