import { IconFileText, IconCode, IconChecklist } from '@tabler/icons-react';

// Solution examples data (Traditional vs AI-powered)
export const solutionExamples = {
  'data-dictionary': {
    title: 'Data Dictionary',
    description:
      'Traditional manual cataloging vs. AI-powered automated classification',
    icon: IconFileText,
    traditional: {
      title: 'Traditional Approach',
      subtitle: 'Manual data cataloging by data stewards',
      code: `\`\`\`yaml
# Data Dictionary Entry - Manual Process
field_name: patient_blood_pressure
data_owner: "Jane Smith, Data Governance Team"
date_created: "2024-01-15"
date_last_reviewed: "2024-06-20"
review_status: "Pending Review"
approved_by: "Data Governance Committee"
approval_date: null  # Waiting 6 weeks for approval

data_type: string
description: "Patient blood pressure reading"
sensitivity: "PHI - Needs Review"
classification_method: "Manual - Steward Judgment"
business_glossary_link: "/wiki/blood-pressure"
source_system: "Unknown - Needs Discovery"
data_quality_score: null  # Not yet assessed
lineage_documented: false

# Issues with this approach:
# - 6+ week approval cycles
# - Inconsistent classifications
# - Stale metadata (reviewed 6 months ago)
# - No automated quality monitoring
# - Data stewards overloaded (500+ fields backlog)
\`\`\``,
      issues: [
        'Manual classification is slow (weeks per field)',
        'Data steward bottleneck creates backlogs',
        'Classifications become stale quickly',
        'Inconsistent judgment across stewards',
        'No real-time quality monitoring',
        'Source/lineage often unknown or outdated',
      ],
    },
    ai: {
      title: 'AI-Powered Approach',
      subtitle: 'Automated classification as data flows through pipelines',
      code: `\`\`\`json
{
  "field_catalog_entry": {
    "field_name": "patient_blood_pressure",
    "auto_classified_at": "2024-03-15T14:32:01Z",
    "classification_model": "healthcare-phi-classifier-v3",
    "confidence_score": 0.97,
    
    "ai_detected_properties": {
      "data_type": "object",
      "semantic_type": "vital_sign.blood_pressure",
      "phi_classification": "protected_health_information",
      "phi_category": "medical_record",
      "hipaa_identifier": false,
      "sensitivity_level": "high",
      "suggested_access_role": ["clinical_staff", "treating_physician"]
    },
    
    "auto_discovered_lineage": {
      "source_systems": ["epic_ehr", "bedside_monitor_feed"],
      "upstream_tables": ["raw.vital_signs", "staging.patient_encounters"],
      "downstream_consumers": ["ml.readmission_model", "reports.clinical_dashboard"],
      "last_data_flow": "2024-03-15T14:30:00Z"
    },
    
    "continuous_quality_metrics": {
      "completeness": 0.94,
      "validity": 0.99,
      "freshness_hours": 0.5,
      "anomaly_alerts": 0,
      "last_quality_check": "2024-03-15T14:31:00Z"
    },
    
    "unified_catalog_sync": {
      "catalog_id": "UC-2024-VIT-00847",
      "auto_synced": true,
      "governance_status": "auto_approved",
      "human_review_required": false
    }
  }
}
\`\`\``,
      benefits: [
        'Classification happens in seconds, not weeks',
        'Consistent ML-based categorization',
        'Real-time lineage discovery from data flows',
        'Continuous quality monitoring (not point-in-time)',
        'Auto-sync to unified data catalog',
        'Human review only for low-confidence items',
      ],
      highlights: [
        {
          line: '"classification_model":',
          label: '← ML model handles classification',
        },
        {
          line: '"confidence_score": 0.97',
          label: '← High confidence = auto-approve',
        },
        { line: '"phi_classification":', label: '← AI detects PHI automatically' },
        {
          line: '"auto_discovered_lineage":',
          label: '← Traced from actual data flows',
        },
        {
          line: '"continuous_quality_metrics":',
          label: '← Real-time monitoring',
        },
        {
          line: '"auto_synced": true',
          label: '← Unified catalog updated automatically',
        },
      ],
    },
  },
  'json-schema': {
    title: 'JSON Schema',
    description: 'Static validation vs. AI-assisted schema evolution',
    icon: IconCode,
    traditional: {
      title: 'Traditional Approach',
      subtitle: 'Manually written and maintained schemas',
      code: `\`\`\`json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PatientRecord",
  "type": "object",
  "properties": {
    "patient_id": { "type": "string" },
    "name": { "type": "string" },
    "dob": { "type": "string" },
    "diagnosis": { "type": "string" }
  }
}

// Problems:
// - Written once, rarely updated
// - No validation of semantic meaning
// - Doesn't catch data drift
// - Schema debt accumulates over time
\`\`\``,
      issues: [
        'Schemas become outdated as data evolves',
        'No automatic detection of new patterns',
        'Schema changes require manual PRs',
        'Validation catches syntax, not semantics',
        'Technical debt accumulates silently',
      ],
    },
    ai: {
      title: 'AI-Powered Approach',
      subtitle: 'Schema inference and drift detection',
      code: `\`\`\`json
{
  "ai_schema_management": {
    "inferred_schema": {
      "patient_id": {
        "type": "string",
        "pattern_detected": "^PAT-[0-9]{4}-[0-9]{5}$",
        "pattern_confidence": 0.99
      },
      "diagnosis": {
        "type": "string",
        "semantic_type": "icd10_code",
        "values_observed": ["E11.9", "I10", "J06.9"],
        "suggested_enum": true
      }
    },
    "drift_detection": {
      "new_field_detected": "telehealth_flag",
      "alert_sent": "2024-03-14T10:00:00Z",
      "suggested_schema_update": true
    },
    "auto_evolution": {
      "backwards_compatible": true,
      "pr_auto_created": "#1847"
    }
  }
}
\`\`\``,
      benefits: [
        'Schema inferred from actual data',
        'Drift detection catches changes early',
        'Auto-creates PRs for schema updates',
        'Semantic validation, not just syntax',
        'Continuous schema health monitoring',
      ],
      highlights: [
        { line: '"pattern_detected":', label: '← AI learns the format' },
        { line: '"semantic_type": "icd10_code"', label: '← Understands meaning' },
        { line: '"new_field_detected":', label: '← Catches data drift' },
        { line: '"pr_auto_created":', label: '← Automates schema evolution' },
      ],
    },
  },
  'quality-rules': {
    title: 'Quality Rules',
    description: 'Static rule checks vs. AI-driven anomaly detection',
    icon: IconChecklist,
    traditional: {
      title: 'Traditional Approach',
      subtitle: 'Hardcoded business rules',
      code: `\`\`\`sql
-- Traditional DQ Rules (Static)
SELECT * FROM patients
WHERE age < 0 OR age > 120  -- Invalid age
   OR email NOT LIKE '%@%.%'  -- Bad email
   OR created_at > CURRENT_DATE  -- Future date

-- Problems:
-- - Only catches predefined issues
-- - Misses novel data quality problems
-- - Rules become stale as data changes
-- - No learning from historical patterns
\`\`\``,
      issues: [
        'Only catches predefined issues',
        'Cannot detect novel anomalies',
        'Rules require manual updates',
        'No learning from patterns',
        'Binary pass/fail, no nuance',
      ],
    },
    ai: {
      title: 'AI-Powered Approach',
      subtitle: 'ML-based anomaly detection and quality scoring',
      code: `\`\`\`json
{
  "ai_quality_engine": {
    "anomaly_detection": {
      "field": "patient_age",
      "expected_distribution": "normal(45, 15)",
      "current_batch_mean": 67.2,
      "z_score": 3.8,
      "alert": "Unusual age distribution in last batch",
      "severity": "medium"
    },
    "pattern_learning": {
      "learned_rule": "diagnosis codes start with letter",
      "violations_today": 12,
      "auto_quarantined": true
    },
    "quality_score": {
      "overall": 0.94,
      "completeness": 0.97,
      "validity": 0.91,
      "consistency": 0.96,
      "trend": "improving"
    },
    "root_cause_suggestion": "Source system upgrade on 3/14 changed format"
  }
}
\`\`\``,
      benefits: [
        'Detects anomalies never seen before',
        'Learns patterns from historical data',
        'Nuanced quality scores, not just pass/fail',
        'Root cause suggestions speed resolution',
        'Continuous improvement over time',
      ],
      highlights: [
        { line: '"expected_distribution":', label: '← Learns normal patterns' },
        { line: '"z_score": 3.8', label: '← Statistical anomaly detection' },
        { line: '"learned_rule":', label: '← AI discovers rules automatically' },
        {
          line: '"root_cause_suggestion":',
          label: '← Explains why issues occur',
        },
      ],
    },
  },
};
