// Good vs Bad examples data for the Why Data Matters page
export const exampleData = {
  'garbage-in-garbage-out': {
    title: 'Garbage In, Garbage Out',
    description: 'How data quality affects AI model performance',
    bad: {
      title: 'Bad Data',
      description:
        'Inconsistent, unvalidated patient data leads to unreliable predictions.',
      code: `\`\`\`json
{
  "patient_id": "12345",
  "age": "thirty-five",
  "blood_pressure": "high",
  "diagnosis": "diabetes maybe?",
  "date": "sometime in March",
  "weight": "180 lbs or kg idk"
}
\`\`\``,
      issues: [
        'Age stored as text instead of number',
        'Blood pressure is subjective, not measured',
        'Diagnosis is uncertain and informal',
        'Date is imprecise and unparseable',
        'Weight unit is ambiguous',
      ],
    },
    good: {
      title: 'Good Data',
      description: 'Properly specified and validated healthcare data.',
      code: `\`\`\`json
{
  "patient_id": "PAT-2024-12345",
  "age_years": 35,
  "blood_pressure": {
    "systolic_mmhg": 142,
    "diastolic_mmhg": 88,
    "measurement_datetime": "2024-03-15T09:30:00Z"
  },
  "diagnosis": {
    "icd10_code": "E11.9",
    "description": "Type 2 diabetes mellitus without complications",
    "confirmed": true
  },
  "encounter_date": "2024-03-15",
  "weight_kg": 81.6
}
\`\`\``,
      benefits: [
        'Numeric age enables calculations',
        'Structured BP with timestamp',
        'ICD-10 coded diagnosis is standardized',
        'ISO 8601 date format is parseable',
        'Weight in single, specified unit',
      ],
      highlights: [
        { line: '"age_years": 35', label: '← Integer type, not string' },
        { line: '"systolic_mmhg": 142', label: '← Explicit unit in field name' },
        { line: '"icd10_code": "E11.9"', label: '← Industry-standard coding' },
        { line: '"encounter_date": "2024-03-15"', label: '← ISO 8601 format' },
        { line: '"weight_kg": 81.6', label: '← Single unit, decimal precision' },
      ],
    },
  },
  'scope-creep': {
    title: 'Scope Creep',
    description: 'How unclear specifications lead to project expansion',
    bad: {
      title: 'Vague Specification',
      description: 'Undefined requirements lead to constant changes.',
      code: `\`\`\`markdown
# Patient Data Requirements

We need patient data for our AI system.

Fields:
- Name
- Contact info
- Medical history
- Other relevant information as needed
- TBD based on stakeholder feedback
\`\`\``,
      issues: [
        '"Contact info" is undefined (phone? email? address?)',
        '"Medical history" is too broad',
        '"Other relevant information" invites endless additions',
        'No data types or formats specified',
        '"TBD" means the spec is never finished',
      ],
    },
    good: {
      title: 'Precise Specification',
      description: 'Clear, bounded requirements prevent scope creep.',
      code: `\`\`\`json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Patient Demographics",
  "type": "object",
  "required": ["patient_id", "legal_name", "dob", "primary_phone"],
  "additionalProperties": false,
  "properties": {
    "patient_id": {
      "type": "string",
      "pattern": "^PAT-[0-9]{4}-[0-9]{5}$"
    },
    "legal_name": {
      "type": "object",
      "properties": {
        "given": { "type": "string", "maxLength": 50 },
        "family": { "type": "string", "maxLength": 50 }
      }
    },
    "dob": {
      "type": "string",
      "format": "date"
    },
    "primary_phone": {
      "type": "string",
      "pattern": "^\\\\+1[0-9]{10}$"
    }
  }
}
\`\`\``,
      benefits: [
        'Exact fields listed - no ambiguity',
        '"additionalProperties: false" blocks extras',
        'Patterns enforce format compliance',
        'Required fields are explicit',
        'Changes require formal spec updates',
      ],
      highlights: [
        { line: '"$schema":', label: '← JSON Schema standard' },
        { line: '"required":', label: '← Explicit required fields' },
        { line: '"additionalProperties": false', label: '← BLOCKS scope creep!' },
        { line: '"pattern":', label: '← Regex validates format' },
        { line: '"maxLength": 50', label: '← Bounded field size' },
      ],
    },
  },
  'compliance-nightmares': {
    title: 'Compliance Nightmares',
    description: 'How missing PHI identification leads to HIPAA violations',
    bad: {
      title: 'Untagged PHI',
      description: 'Data without PHI markers cannot be properly de-identified.',
      code: `\`\`\`json
{
  "fields": [
    "patient_name",
    "ssn",
    "address",
    "diagnosis",
    "provider_notes",
    "insurance_id",
    "email"
  ]
}
\`\`\``,
      issues: [
        'No PHI classification on any field',
        'SSN is a direct identifier - high risk',
        'Cannot automate de-identification',
        'Audit would flag all fields as risky',
        'No guidance for access controls',
      ],
    },
    good: {
      title: 'PHI-Classified Schema',
      description: 'Every field tagged with HIPAA classification.',
      code: `\`\`\`json
{
  "fields": [
    {
      "name": "patient_name",
      "phi_category": "direct_identifier",
      "hipaa_safe_harbor": "remove",
      "access_level": "restricted"
    },
    {
      "name": "ssn",
      "phi_category": "direct_identifier",
      "hipaa_safe_harbor": "remove",
      "access_level": "highly_restricted",
      "encryption": "required"
    },
    {
      "name": "diagnosis",
      "phi_category": "medical_info",
      "hipaa_safe_harbor": "retain",
      "access_level": "clinical_staff"
    },
    {
      "name": "age_bucket",
      "phi_category": "quasi_identifier",
      "hipaa_safe_harbor": "generalize_to_10yr_bucket",
      "access_level": "analytics"
    }
  ]
}
\`\`\``,
      benefits: [
        'Each field has PHI classification',
        'De-identification rules are explicit',
        'Access levels enable RBAC',
        'Encryption requirements documented',
        'Compliant by design',
      ],
      highlights: [
        { line: '"phi_category":', label: '← PHI classification tag' },
        {
          line: '"hipaa_safe_harbor": "remove"',
          label: '← Auto de-identification rule',
        },
        { line: '"access_level": "highly_restricted"', label: '← RBAC ready' },
        { line: '"encryption": "required"', label: '← Security requirement' },
        {
          line: '"generalize_to_10yr_bucket"',
          label: '← Safe Harbor compliant',
        },
      ],
    },
  },
  'integration-failures': {
    title: 'Integration Failures',
    description: 'How format mismatches break data pipelines',
    bad: {
      title: 'Inconsistent Formats',
      description:
        'Different systems use different formats for the same data.',
      code: `\`\`\`text
System A (EHR):
  date: "03/15/2024"
  gender: "Male"
  
System B (Lab):
  date: "2024-03-15"
  gender: "M"
  
System C (Billing):
  date: "15-Mar-24"
  gender: 1
  
System D (AI Model):
  date: ??? 
  gender: ???
\`\`\``,
      issues: [
        '3 different date formats',
        'Gender: "Male" vs "M" vs 1',
        "AI model can't parse any reliably",
        'ETL requires custom logic per system',
        'New integrations add more variations',
      ],
    },
    good: {
      title: 'Canonical Data Model',
      description:
        'Single source of truth with documented transformations.',
      code: `\`\`\`json
{
  "canonical_schema": {
    "encounter_date": {
      "type": "string",
      "format": "date",
      "description": "ISO 8601 date (YYYY-MM-DD)"
    },
    "patient_sex": {
      "type": "string",
      "enum": ["male", "female", "other", "unknown"],
      "description": "HL7 FHIR AdministrativeGender"
    }
  },
  "transformations": {
    "system_a": {
      "date": "MM/DD/YYYY -> YYYY-MM-DD",
      "gender": "lowercase(value)"
    },
    "system_b": {
      "date": "already_compliant",
      "gender": "M->male, F->female"
    },
    "system_c": {
      "date": "DD-Mon-YY -> YYYY-MM-DD",
      "gender": "1->male, 2->female"
    }
  }
}
\`\`\``,
      benefits: [
        'Single canonical format',
        'Explicit transformation rules',
        'Uses industry standards (HL7 FHIR)',
        'New systems get transformation docs',
        'AI model gets consistent input',
      ],
      highlights: [
        { line: '"canonical_schema":', label: '← Single source of truth' },
        { line: '"format": "date"', label: '← ISO 8601 standard' },
        { line: '"enum": ["male", "female"', label: '← Controlled vocabulary' },
        { line: 'HL7 FHIR', label: '← Industry standard reference' },
        { line: '"transformations":', label: '← Documented ETL rules' },
      ],
    },
  },
};
