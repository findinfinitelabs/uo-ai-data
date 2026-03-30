# HIPAA Compliance & De-identification Skill

## Overview

Guidelines for handling Protected Health Information (PHI) and implementing HIPAA-compliant de-identification for healthcare AI projects.

## Core HIPAA Concepts

### Protected Health Information (PHI)

PHI includes any information that can identify a patient:

- Demographic identifiers (name, DOB, address)
- Medical information (diagnoses, treatments, lab results)
- Payment information (billing records, claims)
- Any unique identifying numbers (MRN, SSN)

### When HIPAA Applies

This training repository uses **100% synthetic data**, so HIPAA technically doesn't apply. However, we follow HIPAA de-identification standards to:

- Teach proper data handling practices
- Prepare students for real-world healthcare data
- Demonstrate privacy-preserving techniques
- Build ethical data management habits

## Safe Harbor De-identification Method

### The 18 HIPAA Identifiers

Must be removed from datasets:

1. ✂️ **Names** - All patient, relative, employer names
2. ✂️ **Geographic subdivisions** - Address, city, county, ZIP codes <20k population
3. ✂️ **Dates** - Except year (aggregate ages 90+ to "90+")
4. ✂️ **Telephone numbers** - All types
5. ✂️ **Fax numbers** - All fax numbers
6. ✂️ **Email addresses** - All email addresses
7. ✂️ **Social Security numbers** - All SSNs
8. ✂️ **Medical record numbers** - Replace with anonymous IDs
9. ✂️ **Health plan numbers** - All insurance numbers
10. ✂️ **Account numbers** - All financial accounts
11. ✂️ **Certificate/license numbers** - All professional/personal licenses
12. ✂️ **Vehicle identifiers** - VIN, license plates
13. ✂️ **Device identifiers** - Serial numbers, MAC addresses
14. ✂️ **URLs** - Web addresses
15. ✂️ **IP addresses** - Network identifiers
16. ✂️ **Biometric identifiers** - Fingerprints, voiceprints, facial recognition
17. ✂️ **Photographs** - Full face photos
18. ✂️ **Other unique identifiers** - Any other characteristic that could identify individual

### Implementation Checklist

```python
# Example de-identification function
def deidentify_patient_record(record):
    """Apply HIPAA Safe Harbor de-identification."""
    
    # 1. Replace name with anonymous ID
    record['patient_id'] = f"P{record['id']:08d}"
    del record['name']
    
    # 2. Generalize geography to state only
    record['state'] = record['address']['state']
    del record['address']
    
    # 3. Convert dates to age/year only
    dob = datetime.strptime(record['date_of_birth'], '%Y-%m-%d')
    age = (datetime.now() - dob).days // 365
    record['age'] = min(age, 90)  # Cap at 90+
    del record['date_of_birth']
    
    # 4-7. Remove contact information
    for field in ['phone', 'email', 'fax']:
        if field in record:
            del record[field]
    
    # 8-11. Replace numbers with anonymous IDs
    if 'ssn' in record:
        del record['ssn']
    if 'mrn' in record:
        record['study_id'] = hash_mrn(record['mrn'])
        del record['mrn']
    
    # 12-18. Remove other unique identifiers
    sensitive_fields = ['vehicle_id', 'device_serial', 'photo', 'ip_address']
    for field in sensitive_fields:
        if field in record:
            del record[field]
    
    return record
```

## Synthetic Data Best Practices

### Creating Privacy-Safe Synthetic Data

Even with synthetic data, demonstrate good practices:

```python
# ✅ Good: Anonymous patient ID
patient = {
    "patient_id": "P00001234",
    "age": 45,
    "state": "Oregon",
    "gender": "female"
}

# ❌ Bad: Contains identifiers (even if fake)
patient = {
    "name": "Jane Smith",
    "ssn": "123-45-6789",
    "dob": "1978-06-15",
    "address": "123 Main St, Portland, OR 97201"
}
```

### ZIP Code Handling

```python
def safe_zip_code(zip_code, population):
    """Apply HIPAA ZIP code rule."""
    if population < 20000:
        return "00000"  # Mask low-population ZIPs
    else:
        return zip_code[:3] + "00"  # Keep only first 3 digits
```

### Date Generalization

```python
def generalize_date(date_str, context="diagnosis"):
    """Convert specific dates to HIPAA-compliant format."""
    date = datetime.strptime(date_str, '%Y-%m-%d')
    
    # Option 1: Year only
    if context in ["birth", "death"]:
        return date.year
    
    # Option 2: Time intervals
    if context in ["diagnosis", "treatment"]:
        days_ago = (datetime.now() - date).days
        return f"{days_ago} days ago"
    
    # Option 3: Relative dates
    return date.strftime('%Y')  # Year only
```

### Age Aggregation

```python
def safe_age(age):
    """Apply 90+ rule for elderly patients."""
    return "90+" if age >= 90 else age
```

## Data Handling Policies

### For This Repository

When working with this training data:

```python
# ✅ Appropriate uses
- Learning data structures and schemas
- Training AI/ML models
- Practicing data analysis techniques
- Developing data pipelines
- Teaching privacy concepts

# ❌ Inappropriate uses
- Do NOT represent as real patient data
- Do NOT use in actual clinical systems
- Do NOT mix with real patient data
- Do NOT use for actual medical decisions
```

### Storage and Transfer

Even for synthetic data, practice secure handling:

```bash
# ✅ Good practices
- Store in version control (data is synthetic)
- Share openly for educational purposes
- Include dataset documentation
- Label clearly as "SYNTHETIC DATA"

# ❌ Avoid in real scenarios
- Emailing PHI (use secure transfer methods)
- Storing on personal devices (use encrypted drives)
- Leaving files in shared folders (use access controls)
```

## HIPAA Compliance Checklist

Use this checklist when working with actual healthcare data:

### Administrative Safeguards

- [ ] Designated Privacy Officer appointed
- [ ] Staff trained on HIPAA requirements
- [ ] Access controls implemented (role-based)
- [ ] Audit procedures in place
- [ ] Business Associate Agreements signed
- [ ] Breach notification procedures documented

### Physical Safeguards

- [ ] Facility access controls
- [ ] Workstation security (locked screens)
- [ ] Device encryption enabled
- [ ] Secure disposal procedures (shred PHI)
- [ ] Physical media controls (locked storage)

### Technical Safeguards

- [ ] User authentication (multi-factor)
- [ ] Encryption at rest and in transit
- [ ] Audit logging enabled
- [ ] Automatic logoff after inactivity
- [ ] Data backup and recovery
- [ ] Network security (firewalls, VPN)

### De-identification Verification

- [ ] All 18 identifiers removed
- [ ] No residual identifying information
- [ ] Expert determination (if required)
- [ ] Documentation of de-identification process
- [ ] Re-identification risk assessment

## Common Mistakes to Avoid

### ❌ Mistake 1: Partial De-identification

```python
# ❌ Bad: Still contains identifiers
{
    "patient_id": "P001",
    "email": "patient001@example.com",  # EMAIL = IDENTIFIER #6
    "diagnosis": "Type 2 Diabetes"
}

# ✅ Good: Fully de-identified
{
    "patient_id": "P001",
    "diagnosis": "Type 2 Diabetes"
}
```

### ❌ Mistake 2: Dates Without Aggregation

```python
# ❌ Bad: Specific dates visible
{
    "patient_id": "P001",
    "date_of_birth": "1978-03-15",  # DATES = IDENTIFIER #3
    "visit_date": "2024-01-15"
}

# ✅ Good: Generalized dates
{
    "patient_id": "P001",
    "age": 45,
    "visit_year": 2024
}
```

### ❌ Mistake 3: Small Population ZIP Codes

```python
# ❌ Bad: ZIP code with <20k population
{
    "patient_id": "P001",
    "zip_code": "97920"  # Small rural ZIP
}

# ✅ Good: Masked or generalized
{
    "patient_id": "P001",
    "zip_code": "00000"  # Or state only: "Oregon"
}
```

## Testing De-identification

```python
def test_deidentification(record):
    """Verify all HIPAA identifiers removed."""
    
    # Define fields that should NOT exist
    forbidden_fields = [
        'name', 'first_name', 'last_name',
        'ssn', 'phone', 'email', 'fax',
        'address', 'street', 'city',
        'date_of_birth', 'specific_dates',
        'medical_record_number', 'mrn',
        'ip_address', 'url', 'photo'
    ]
    
    failed_checks = []
    
    for field in forbidden_fields:
        if field in record:
            failed_checks.append(f"Found identifier: {field}")
    
    # Check date formats (should be year-only or relative)
    for key, value in record.items():
        if 'date' in key.lower() and isinstance(value, str):
            if len(value) > 4:  # More specific than year
                failed_checks.append(f"Specific date found: {key}")
    
    # Check age >= 90
    if 'age' in record and record['age'] > 90:
        failed_checks.append("Age not capped at 90+")
    
    if failed_checks:
        raise ValueError(f"De-identification failed:\n" + "\n".join(failed_checks))
    
    return True
```

## Resources

### HIPAA Official Guidelines

- [HHS HIPAA Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/index.html)
- [De-identification Guidance](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html)
- [Safe Harbor Method](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html#safeharborguidance)

### Additional Standards

- **GDPR** - European privacy regulation (stricter than HIPAA)
- **CCPA** - California Consumer Privacy Act
- **21 CFR Part 11** - FDA electronic records requirements

## Summary

### Key Takeaways

1. **Remove all 18 identifiers** for Safe Harbor compliance
2. **Aggregate ages 90+** to protect elderly
3. **Generalize geography** to state level (ZIP rules apply)
4. **Use anonymous IDs** not real medical record numbers
5. **Practice with synthetic** before touching real PHI
6. **Document everything** for audit trail
7. **When in doubt, err on side of privacy**

### Quick Reference

```bash
# Run de-identification check
python validate_deidentification.py --input data.json

# Generate compliant synthetic data
python generate_patient_data.py --hipaa-compliant

# Test dataset compliance
python test_hipaa_compliance.py --dataset synthetic_patients.json
```
