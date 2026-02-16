import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Badge,
  Group,
  Box,
  List,
  ThemeIcon,
  Timeline,
  Alert,
  Card,
  SimpleGrid,
  Accordion,
  Button,
  Textarea,
  Code,
  Loader,
  Divider,
  Select,
  TextInput,
} from '@mantine/core';
import {
  IconFileText,
  IconAlertCircle,
  IconDatabase,
  IconLock,
  IconCloud,
  IconTrash,
  IconShieldCheck,
  IconClock,
  IconUsers,
  IconKey,
  IconSparkles,
  IconCode,
  IconCheck,
  IconX,
  IconDownload,
} from '@tabler/icons-react';

const DataHandlingPage = () => {
  // Synthetic data generator state
  const [dataRequirements, setDataRequirements] = useState(
    'Generate 10,000 records per table for all 6 DynamoDB tables: patients (patient_id, age 18-95, gender, original_id), diagnoses (diagnosis_code as ICD-10 codes like E11.9/I10/J45.909/E78.5, name, category), medications (medication_id, name, class, form, dosage), providers (npi, specialty, name), patient-diagnoses (patient_id + diagnosis_code with proper foreign keys, date, severity, provider_npi), patient-medications (patient_id + medication_id with proper foreign keys, date, frequency, medication_name). Ensure referential integrity: all patient_ids in junction tables must exist in patients table, all diagnosis_codes must exist in diagnoses table, all medication_ids must exist in medications table.'
  );
  const [awsRegion, setAwsRegion] = useState('us-west-2');
  const [tablePrefix, setTablePrefix] = useState('healthcare');
  const [availableTables, setAvailableTables] = useState([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Open AWS Innovation Sandbox login
  const openAWSLogin = () => {
    window.open('https://resource-explorer.console.aws.amazon.com/resource-explorer/home?region=us-west-2#/search?query=dynamodb%3Atable', '_blank');
    setShowLoginPrompt(true);
  };

  // Generate PartiQL SQL statements using OpenAI
  const generatePythonScript = async () => {
    if (!apiKey || apiKey === 'sk-your-key-here') {
      setError('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env.local file.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a healthcare data engineering expert. Generate a complete Python script to populate AWS DynamoDB tables with synthetic healthcare data using boto3 and Faker.

Requirements:
1. Use boto3 for DynamoDB operations, Faker for generating realistic data
2. Generate data for all 6 tables: patients, diagnoses, medications, providers, patient-diagnoses, patient-medications
3. Use batch_write_item() with batches of 25 items for efficiency
4. Maintain referential integrity: generate patients/diagnoses/medications/providers first, then junction tables
5. Use realistic ICD-10 codes (E11.9, I10, J45.909, E78.5, etc.), medication names, provider NPIs
6. Include progress indicators: "Inserted X/Y records..."
7. Handle the Decimal type correctly for DynamoDB (import from decimal)
8. Make table prefix configurable via command line argument
9. Include error handling and connection validation
10. Add summary statistics at the end

Script structure:
- Imports (boto3, faker, random, decimal, sys)
- Configuration (region, table_prefix from command line)
- Helper functions (generate_patient, generate_diagnosis, etc.)
- Main function with batch writes
- Progress tracking
- Summary output

Return ONLY the complete Python script, no explanations.`
            },
            {
              role: 'user',
              content: `Generate a Python script for AWS region "${awsRegion}" and table prefix "${tablePrefix}":

${dataRequirements}

Return the complete Python script ready to execute.`
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      let script = data.choices[0].message.content.trim();
      // Remove markdown code blocks if present
      script = script.replace(/```python\n?/g, '').replace(/```\n?/g, '');
      setGeneratedScript(script);
    } catch (err) {
      setError(`Failed to generate script: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Data lifecycle stages with handling policies
  const dataLifecycle = [
    {
      id: 'collection',
      title: 'Data Collection',
      icon: IconDatabase,
      color: 'blue',
      description: 'Initial acquisition of patient data from various sources',
      scenario: {
        title: '🏥 Real-World Example: Building a Readmission Predictor',
        steps: [
          'Your hospital wants to build an AI model to predict 30-day readmission risk',
          'You submit a request to the EHR team to extract patient admission records from the last 3 years',
          'Legal reviews and approves under Treatment/Operations exception (no patient authorization needed)',
          'Data engineer creates an automated ETL job that extracts only necessary fields: demographics, diagnosis codes, procedures, medications, vital signs, discharge disposition',
          'Payment and insurance details are excluded (not needed for prediction)',
          'All data transfers happen over TLS 1.3 from the EHR database to your secure analytics environment',
          'Every extraction is logged with timestamp, user ID, number of records, and purpose',
          'Result: You receive a dataset with 50,000 admissions containing only the minimum necessary fields for your AI model'
        ]
      },
      policies: [
        {
          policy: 'Minimize Collection',
          requirement: 'Only collect PHI necessary for the stated AI purpose',
          example: 'If building readmission predictor, don\'t collect patient payment information',
          hipaaRef: 'Minimum Necessary Standard (45 CFR 164.502(b))'
        },
        {
          policy: 'Document Legal Basis',
          requirement: 'Establish proper authorization or HIPAA exception',
          example: 'Treatment/Operations exception, Research authorization, De-identified data exception',
          hipaaRef: 'Privacy Rule (45 CFR 164.508, 164.512)'
        },
        {
          policy: 'Secure Transfer',
          requirement: 'Encrypt data in transit from source systems',
          example: 'Use TLS 1.2+ for API calls, SFTP for batch transfers, encrypted email for attachments',
          hipaaRef: 'Security Rule - Transmission Security (45 CFR 164.312(e))'
        },
        {
          policy: 'Audit Logging',
          requirement: 'Log all data collection activities with timestamps and user IDs',
          example: 'Record: Who, What, When, Where, Why for each data extraction',
          hipaaRef: 'Security Rule - Audit Controls (45 CFR 164.312(b))'
        }
      ]
    },
    {
      id: 'storage',
      title: 'Data Storage',
      icon: IconLock,
      color: 'teal',
      description: 'Secure storage of healthcare data during AI development',
      scenario: {
        title: '🔒 Real-World Example: Storing Training Data Securely',
        steps: [
          'The extracted dataset arrives in your AWS S3 bucket configured for HIPAA compliance',
          'S3 bucket has server-side encryption enabled using AWS KMS with a customer-managed key',
          'Bucket policy restricts access to only authorized IAM roles (data scientists, ML engineers)',
          'Data scientists access the data through a secure Jupyter Hub environment with MFA enabled',
          'A separate S3 bucket stores de-identified data for model training - data scientists cannot access the PHI bucket',
          'Physical servers are in AWS GovCloud with SOC 2 compliance and 24/7 monitoring',
          'All access attempts are logged to CloudTrail and monitored by your security team',
          'Quarterly access reviews ensure only active team members retain permissions',
          'Result: Patient data is encrypted at rest, accessible only to authorized personnel, with complete audit trail'
        ]
      },
      policies: [
        {
          policy: 'Encryption at Rest',
          requirement: 'All PHI must be encrypted using strong algorithms (AES-256)',
          example: 'Encrypted database tables, encrypted file systems, encrypted S3 buckets with KMS',
          hipaaRef: 'Security Rule - Encryption (45 CFR 164.312(a)(2)(iv))'
        },
        {
          policy: 'Access Controls',
          requirement: 'Role-based access with principle of least privilege',
          example: 'Data scientists access de-identified data; only authorized clinicians access PHI',
          hipaaRef: 'Security Rule - Access Controls (45 CFR 164.308(a)(3), 164.312(a)(1))'
        },
        {
          policy: 'Physical Safeguards',
          requirement: 'Secure facilities, locked server rooms, monitored access',
          example: 'Badge access to data centers, video surveillance, visitor logs',
          hipaaRef: 'Security Rule - Physical Safeguards (45 CFR 164.310)'
        },
        {
          policy: 'Data Segregation',
          requirement: 'Separate PHI from de-identified data; separate dev/test/prod environments',
          example: 'Production PHI accessible only in prod; synthetic data in dev/test',
          hipaaRef: 'Security Risk Management (45 CFR 164.308(a)(1))'
        }
      ]
    },
    {
      id: 'processing',
      title: 'Data Processing',
      icon: IconCloud,
      color: 'indigo',
      description: 'AI model training, testing, and deployment activities',
      scenario: {
        title: '🤖 Real-World Example: De-identifying Data for Model Training',
        steps: [
          'Privacy officer reviews the raw dataset and determines Safe Harbor de-identification is appropriate',
          'You run an automated de-identification script that removes all 18 HIPAA identifiers',
          'Dates are shifted by random offsets (maintaining intervals), ages >89 are aggregated, ZIP codes generalized to 3 digits',
          'The de-identified dataset is saved to a separate "training data" bucket accessible to data scientists',
          'You train your readmission model using SageMaker in a VPC with no internet access',
          'All training logs are reviewed to ensure no PHI leaked into model artifacts',
          'Model weights are saved to encrypted S3; model cards document the de-identification method used',
          'During deployment, you set up a secure API endpoint with TLS encryption and API key authentication',
          'Result: Model trained on de-identified data with no PHI exposure risk, deployed in HIPAA-compliant infrastructure'
        ]
      },
      policies: [
        {
          policy: 'De-identification Before ML',
          requirement: 'De-identify data before providing to data scientists (unless authorized)',
          example: 'Apply Safe Harbor or Expert Determination before loading into ML pipelines',
          hipaaRef: 'De-identification Standards (45 CFR 164.514(a)-(c))'
        },
        {
          policy: 'Business Associate Agreements',
          requirement: 'Signed BAAs with all cloud providers, AI vendors, contractors',
          example: 'AWS BAA for S3/SageMaker, OpenAI BAA for GPT APIs, contractor BAAs',
          hipaaRef: 'Privacy Rule - Business Associates (45 CFR 164.502(e), 164.504(e))'
        },
        {
          policy: 'Secure Computing Environment',
          requirement: 'HIPAA-compliant infrastructure, VPCs, private subnets, security groups',
          example: 'AWS GovCloud or HIPAA-eligible services, private SageMaker endpoints',
          hipaaRef: 'Security Rule - Technical Safeguards (45 CFR 164.312)'
        },
        {
          policy: 'Output Review',
          requirement: 'Check AI model outputs for potential PHI leakage',
          example: 'Review generated text for names/MRNs, scan error messages, audit model explanations',
          hipaaRef: 'Privacy Rule - Safeguards (45 CFR 164.530(c))'
        }
      ]
    },
    {
      id: 'sharing',
      title: 'Data Sharing',
      icon: IconUsers,
      color: 'violet',
      description: 'Sharing data with research partners, vendors, or public repositories',
      scenario: {
        title: '🤝 Real-World Example: Collaborating with a University Research Team',
        steps: [
          'A university research team wants to collaborate on improving your readmission model',
          'Legal prepares a Data Use Agreement (DUA) that restricts use to approved research only',
          'DUA prohibits re-identification attempts and requires data destruction after study completion',
          'You apply Expert Determination de-identification (k≥10) to preserve more statistical utility',
          'A qualified statistician certifies the re-identification risk is "very small" and documents the methodology',
          'The de-identified dataset is transferred via encrypted SFTP to the university\'s secure server',
          'You log the disclosure: what data, to whom, when, for what purpose, under what legal authority',
          'The university signs acknowledgment of receipt and confirms secure storage procedures',
          'After study completion, you receive a certificate of data destruction from the university',
          'Result: Research collaboration enabled while maintaining HIPAA compliance and patient privacy'
        ]
      },
      policies: [
        {
          policy: 'De-identification Required',
          requirement: 'Cannot share PHI without authorization; must de-identify first',
          example: 'Share Safe Harbor de-identified dataset with research collaborators',
          hipaaRef: 'Privacy Rule (45 CFR 164.514(a))'
        },
        {
          policy: 'Data Use Agreements',
          requirement: 'Require recipients to sign DUAs restricting use and re-disclosure',
          example: 'DUA prohibits re-identification attempts, limits use to approved research',
          hipaaRef: 'Privacy Rule - Limited Data Set (45 CFR 164.514(e))'
        },
        {
          policy: 'Secure Transfer Methods',
          requirement: 'Encrypted transmission channels for any PHI sharing',
          example: 'Encrypted portal, SFTP, encrypted email (never unencrypted email)',
          hipaaRef: 'Security Rule - Transmission Security (45 CFR 164.312(e))'
        },
        {
          policy: 'Tracking and Logging',
          requirement: 'Maintain disclosure accounting for all PHI disclosures',
          example: 'Log: What data, to whom, when, for what purpose, under what authority',
          hipaaRef: 'Privacy Rule - Accounting of Disclosures (45 CFR 164.528)'
        }
      ]
    },
    {
      id: 'retention',
      title: 'Data Retention',
      icon: IconClock,
      color: 'orange',
      description: 'Determining how long to keep healthcare data',
      scenario: {
        title: '📅 Real-World Example: Managing Data Retention for Compliance',
        steps: [
          'Your compliance team establishes a retention schedule: raw PHI (6 years), training datasets (6 years), model artifacts (life of model)',
          'You implement automated S3 lifecycle policies that move old data to Glacier after 2 years',
          'After 6 years, data is automatically flagged for disposal review',
          'Annually, you conduct a data inventory to identify datasets no longer needed for active projects',
          'A patient submits a request to delete their data under state privacy law',
          'You identify all instances of that patient\'s data across training sets, logs, and backups',
          'The patient\'s records are removed from active datasets; you evaluate whether model retraining is needed',
          'You document the deletion with timestamps and approver signatures',
          'Version control (DVC + Git) tracks all dataset versions and allows rollback if needed',
          'Result: Data retained only as long as legally required, with patient rights honored and full audit trail'
        ]
      },
      policies: [
        {
          policy: 'Retention Schedules',
          requirement: 'Define retention periods based on regulatory, legal, and business needs',
          example: 'Training data: 6 years post-study; audit logs: 6 years; model artifacts: life of model',
          hipaaRef: 'State laws vary; HIPAA requires 6-year retention of compliance docs'
        },
        {
          policy: 'Regular Review',
          requirement: 'Periodically review stored data and delete what\'s no longer needed',
          example: 'Annual data inventory and disposal review; automated retention policies',
          hipaaRef: 'Security Rule - Data Backup/Disposal (45 CFR 164.310(d))'
        },
        {
          policy: 'Version Control',
          requirement: 'Track dataset versions, model versions, and lineage',
          example: 'Git for code, DVC for datasets, MLflow for model versions',
          hipaaRef: 'Quality assurance and compliance documentation'
        },
        {
          policy: 'Right to Delete',
          requirement: 'Honor patient requests to delete their data',
          example: 'Remove patient records from training sets; consider model retraining',
          hipaaRef: 'HIPAA Right of Amendment (45 CFR 164.526); GDPR Right to Erasure (Art. 17)'
        }
      ]
    },
    {
      id: 'disposal',
      title: 'Data Disposal',
      icon: IconTrash,
      color: 'red',
      description: 'Secure destruction of healthcare data at end of lifecycle',
      scenario: {
        title: '🗑️ Real-World Example: Securely Disposing of Old Project Data',
        steps: [
          'Your readmission predictor project concluded 6 years ago; retention period has expired',
          'You create a disposal plan documenting all data locations: S3 buckets, RDS databases, EBS snapshots, local copies',
          'For S3 data: you use cryptographic erasure by deleting the KMS encryption keys, rendering data unreadable',
          'You enable S3 object versioning deletion to remove all historical versions',
          'RDS database snapshots are deleted after confirming no legal holds',
          'EBS volumes are wiped using AWS\'s secure deletion process',
          'Any hard drives with data are sent to a certified destruction vendor',
          'The vendor provides a Certificate of Destruction with serial numbers and destruction method',
          'You create a disposal log entry: date, data description, deletion method, approver, certificate number',
          'Six months later, you audit to confirm no residual copies exist in backups or archives',
          'Result: All PHI securely destroyed and unrecoverable, with documented proof for compliance audits'
        ]
      },
      policies: [
        {
          policy: 'Secure Deletion',
          requirement: 'Render PHI unreadable and unrecoverable',
          example: 'Cryptographic erasure (destroy encryption keys), overwriting, degaussing, physical destruction',
          hipaaRef: 'Security Rule - Device and Media Controls (45 CFR 164.310(d)(2))'
        },
        {
          policy: 'Certificate of Destruction',
          requirement: 'Obtain certificates from disposal vendors documenting secure destruction',
          example: 'Hard drive shredding certificate, certified data wiping logs',
          hipaaRef: 'HIPAA Security Rule compliance documentation'
        },
        {
          policy: 'Cloud Deletion',
          requirement: 'Ensure cloud providers properly delete data and all copies/backups',
          example: 'S3 object deletion with versioning, EBS volume wiping, snapshot deletion',
          hipaaRef: 'BAA should specify data deletion procedures'
        },
        {
          policy: 'Audit and Documentation',
          requirement: 'Document what was disposed, when, by whom, and method used',
          example: 'Disposal log with timestamps, data description, method, approver',
          hipaaRef: 'Security Rule - Accountability (45 CFR 164.308(a)(1))'
        }
      ]
    }
  ];

  const aiSpecificPolicies = [
    {
      category: 'Model Training',
      policies: [
        'Use de-identified data for training unless specific authorization obtained',
        'Validate no PHI in training logs, model weights, or serialized artifacts',
        'Document datasets used, de-identification methods, and data sources',
        'Implement differential privacy techniques for sensitive datasets'
      ]
    },
    {
      category: 'Model Deployment',
      policies: [
        'Deploy models only in HIPAA-compliant environments',
        'Encrypt model inputs and outputs in transit and at rest',
        'Implement access controls and authentication for model APIs',
        'Monitor for attempted PHI extraction attacks ("model inversion")'
      ]
    },
    {
      category: 'Model Monitoring',
      policies: [
        'Audit model inference requests and responses',
        'Check for PHI leakage in model explanations and error messages',
        'Monitor for fairness and bias issues that could harm patient groups',
        'Maintain model versioning and rollback capabilities'
      ]
    },
    {
      category: 'Human-in-the-Loop',
      policies: [
        'Ensure human reviewers have appropriate HIPAA training',
        'Implement audit trails for all human decisions on PHI',
        'Provide secure interfaces for clinician review and override',
        'Document when and why model outputs were overridden'
      ]
    }
  ];

  return (
    <Container size="xl" py="xl">
      <Box mb="xl">
        <Group mb="md">
          <ThemeIcon size={50} radius="md" color="cyan">
            <IconFileText size={30} />
          </ThemeIcon>
          <Box>
            <Title order={1}>Data Handling Policies for AI Projects</Title>
            <Text c="dimmed">Comprehensive policies for the complete data lifecycle</Text>
          </Box>
        </Group>
      </Box>

      <Alert icon={<IconAlertCircle />} color="cyan" mb="xl">
        <Text fw={600} mb="xs">Why Data Handling Policies Matter</Text>
        <Text size="sm">
          HIPAA requires covered entities and business associates to implement policies and procedures to prevent, detect, contain, 
          and correct security violations. For AI projects, this means establishing clear data handling policies that cover the entire 
          lifecycle from collection through disposal, with special considerations for machine learning workflows.
        </Text>
      </Alert>

      {/* Interactive Exercise: Generate Synthetic Data */}
      <Paper p="lg" mb="xl" withBorder bg="grape.0">
        <Group mb="md">
          <ThemeIcon size={50} radius="md" color="grape">
            <IconSparkles size={30} />
          </ThemeIcon>
          <Box>
            <Title order={2}>Hands-On Exercise: Generate Bulk Healthcare Data</Title>
            <Text c="dimmed">Use AI to generate a Python script that populates your DynamoDB tables with 10,000 records per table</Text>
          </Box>
        </Group>

        <Alert icon={<IconAlertCircle />} color="grape" mb="xl">
          <Text fw={600} mb="xs">Learning Objective:</Text>
          <Text size="sm">
            Practice the <Text span fw={600}>Data Collection</Text> phase by using AI to generate compliant synthetic data at scale. 
            This exercise demonstrates how to create realistic healthcare data for all 6 DynamoDB tables (patients, diagnoses, medications, 
            providers, and their relationships) while following HIPAA de-identification principles. The generated Python script will 
            populate 60,000 total records with proper referential integrity for Neo4j graph database migration.
          </Text>
        </Alert>

        <Paper p="md" mb="lg" withBorder>
          <Text fw={600} mb="md">Step 1: Configure Your DynamoDB Resources</Text>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
            <Box>
              <Text size="sm" fw={600} mb="xs">AWS Region</Text>
              <Select
                value={awsRegion}
                onChange={(value) => {
                  setAwsRegion(value);
                  setAvailableTables([]); // Clear tables when region changes
                }}
                data={[
                  { value: 'us-east-1', label: 'US East (N. Virginia)' },
                  { value: 'us-west-2', label: 'US West (Oregon)' },
                  { value: 'eu-west-1', label: 'EU (Ireland)' },
                  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
                ]}
              />
            </Box>
            <Box>
              <Text size="sm" fw={600} mb="xs">Table Prefix</Text>
              <TextInput
                value={tablePrefix}
                onChange={(e) => setTablePrefix(e.target.value)}
                placeholder="healthcare"
                description="Base name for your tables (e.g., 'healthcare' for healthcare-patients)"
              />
            </Box>
          </SimpleGrid>
          <Group>
            <Button
              leftSection={<IconDatabase size={16} />}
              onClick={openAWSLogin}
              variant="filled"
              color="blue"
            >
              Login to AWS Innovation Sandbox
            </Button>
          </Group>
          
          {showLoginPrompt && (
            <Alert icon={<IconAlertCircle />} color="blue" mt="md">
              <Text size="sm" fw={600} mb="xs">Steps to find your table prefix:</Text>
              <List size="sm" spacing="xs" withPadding>
                <List.Item>Login to AWS Innovation Sandbox (Resource Explorer window should have opened)</List.Item>
                <List.Item>Look for DynamoDB tables with names like: <Code>dataai-account*-christol-healthcare-patients</Code></List.Item>
                <List.Item>The table prefix is everything before <Code>-patients</Code></List.Item>
                <List.Item>Example: If table is <Code>dataai-account547741150715-christol-healthcare-patients</Code></List.Item>
                <List.Item>Then prefix is: <Code>dataai-account547741150715-christol-healthcare</Code></List.Item>
                <List.Item>Copy and paste the prefix above</List.Item>
              </List>
            </Alert>
          )}
        </Paper>

        <Paper p="md" mb="lg" withBorder>
          <Text fw={600} mb="md">Step 2: Describe Your Data Requirements</Text>
          <Text size="sm" mb="md" c="dimmed">
            The default generates 10,000 records per table (60,000 total) across all 6 DynamoDB tables with proper relationships.
            You can customize the requirements below.
          </Text>
          <Textarea
            value={dataRequirements}
            onChange={(e) => setDataRequirements(e.target.value)}
            placeholder="Example: Generate 1000 records per table..."
            minRows={5}
            mb="md"
          />
          <Button
            leftSection={<IconSparkles size={16} />}
            onClick={generatePythonScript}
            loading={isGenerating}
            disabled={!dataRequirements.trim()}
          >
            {isGenerating ? 'Generating Python Script...' : 'Generate Python Script with AI'}
          </Button>
        </Paper>

        {error && (
          <Alert icon={<IconX />} color="red" mb="lg">
            {error}
          </Alert>
        )}

        {generatedScript && (
          <>
            <Paper p="md" mb="lg" withBorder>
              <Group mb="md" justify="space-between">
                <Text fw={600}>Step 3: Review the Generated Python Script</Text>
                <Badge color="grape" variant="light">AI Generated</Badge>
              </Group>
              <Text size="sm" mb="md" c="dimmed">
                The AI has generated a complete Python script to populate all 6 DynamoDB tables. Review it before executing.
              </Text>
              <Paper p="md" bg="gray.9" style={{ overflow: 'auto', maxHeight: '400px' }}>
                <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '11px' }}>
                  {generatedScript}
                </Code>
              </Paper>
              <Group mt="md" gap="xs">
                <Button
                  leftSection={<IconDownload size={16} />}
                  onClick={() => {
                    const blob = new Blob([generatedScript], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'load_healthcare_data.py';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  color="teal"
                  variant="filled"
                  size="sm"
                >
                  Download Python Script
                </Button>
                <Button
                  leftSection={<IconCode size={16} />}
                  onClick={() => {
                    navigator.clipboard.writeText(generatedScript);
                  }}
                  color="teal"
                  variant="light"
                  size="sm"
                >
                  Copy to Clipboard
                </Button>
                <Button
                  leftSection={<IconDatabase size={16} />}
                  onClick={() => window.open(`https://${awsRegion}.console.aws.amazon.com/dynamodbv2/home?region=${awsRegion}#tables`, '_blank')}
                  color="grape"
                  variant="light"
                  size="sm"
                >
                  View DynamoDB Tables
                </Button>
                <Button
                  variant="subtle"
                  onClick={() => {
                    setGeneratedScript('');
                  }}
                  size="sm"
                >
                  Clear
                </Button>
              </Group>
              <Alert icon={<IconAlertCircle />} color="blue" mt="md" variant="light">
                <Text size="sm" fw={600} mb="xs">How to Execute the Script:</Text>
                <List size="sm" spacing="xs" withPadding>
                  <List.Item>
                    <Text span fw={600}>Step 1:</Text> Click "Download Python Script" above → saves as <Code>load_healthcare_data.py</Code>
                  </List.Item>
                  <List.Item>
                    <Text span fw={600}>Step 2:</Text> Install dependencies: <Code>pip install boto3 faker</Code>
                  </List.Item>
                  <List.Item>
                    <Text span fw={600}>Step 3:</Text> Configure AWS credentials (use your Innovation Sandbox credentials):
                    <Code block style={{ fontSize: '10px', marginTop: '4px' }}>
                      {`aws configure\nAWS Access Key ID: [your-key]\nAWS Secret Access Key: [your-secret]\nDefault region name: ${awsRegion}`}
                    </Code>
                  </List.Item>
                  <List.Item>
                    <Text span fw={600}>Step 4:</Text> Run the script: <Code>python load_healthcare_data.py</Code>
                  </List.Item>
                  <List.Item>
                    <Text span fw={600}>Step 5:</Text> Wait 2-5 minutes while it inserts 60,000 records with progress updates
                  </List.Item>
                  <List.Item>
                    <Text span fw={600}>Step 6:</Text> Click "View DynamoDB Tables" to verify data was inserted
                  </List.Item>
                </List>
                <Divider my="sm" />
                <Text size="sm" fw={600} mb="xs">What the script does:</Text>
                <List size="sm" spacing="xs" withPadding>
                  <List.Item>✅ Generates 10,000 patients with realistic demographics (age, gender)</List.Item>
                  <List.Item>✅ Generates 10,000 diagnoses with ICD-10 codes (E11.9, I10, J45.909, etc.)</List.Item>
                  <List.Item>✅ Generates 10,000 medications with realistic names and dosages</List.Item>
                  <List.Item>✅ Generates 10,000 providers with NPIs and specialties</List.Item>
                  <List.Item>✅ Creates 10,000 patient-diagnosis relationships with proper foreign keys</List.Item>
                  <List.Item>✅ Creates 10,000 patient-medication relationships with proper foreign keys</List.Item>
                  <List.Item>✅ Uses batch writes (25 items/batch) for efficiency</List.Item>
                  <List.Item>✅ Maintains referential integrity for Neo4j graph migration</List.Item>
                </List>
              </Alert>
            </Paper>
          </>
        )}

        {!generatedScript && !isGenerating && (
          <Alert icon={<IconAlertCircle />} color="blue" variant="light">
            <Text size="sm">
              💡 <Text span fw={600}>Tip:</Text> The AI will generate a complete Python script that populates all 6 DynamoDB tables 
              with 10,000 records each (60,000 total). The script uses batch writes for efficiency and maintains referential integrity.
            </Text>
          </Alert>
        )}
      </Paper>

      {/* Data Lifecycle Timeline */}
      <Title order={2} mb="md">Data Lifecycle: Policies at Each Stage</Title>
      <Text c="dimmed" mb="xl">
        Follow data through its complete lifecycle in an AI project, with required policies at each stage.
      </Text>

      <Timeline active={dataLifecycle.length} bulletSize={40} lineWidth={3}>
        {dataLifecycle.map((stage) => {
          const StageIcon = stage.icon;

          return (
            <Timeline.Item
              key={stage.id}
              bullet={
                <ThemeIcon size={40} variant="filled" radius="xl" color={stage.color}>
                  <StageIcon size={20} />
                </ThemeIcon>
              }
              title={
                <Group gap="xs">
                  <Text fw={600} size="lg">{stage.title}</Text>
                  <Badge color={stage.color} variant="light">
                    {stage.policies.length} Policies
                  </Badge>
                </Group>
              }
            >
              <Paper p="md" mb="xl" withBorder>
                <Text size="sm" mb="md" c="dimmed">{stage.description}</Text>

                {/* Real-World Scenario */}
                {stage.scenario && (
                  <Alert icon={<IconAlertCircle />} color={stage.color} mb="lg" variant="light">
                    <Text fw={600} size="sm" mb="md">{stage.scenario.title}</Text>
                    <List size="sm" spacing="xs" withPadding>
                      {stage.scenario.steps.map((step, stepIdx) => (
                        <List.Item key={stepIdx}>
                          <Text size="sm">{step}</Text>
                        </List.Item>
                      ))}
                    </List>
                  </Alert>
                )}

                <Accordion variant="contained">
                  {stage.policies.map((policy, idx) => (
                    <Accordion.Item key={idx} value={`${stage.id}-${idx}`}>
                      <Accordion.Control>
                        <Group>
                          <ThemeIcon color={stage.color} size="sm" variant="light">
                            <IconShieldCheck size={14} />
                          </ThemeIcon>
                          <Text fw={600} size="sm">{policy.policy}</Text>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Box mb="md">
                          <Text size="xs" fw={600} c="dimmed" mb="xs">Requirement:</Text>
                          <Text size="sm">{policy.requirement}</Text>
                        </Box>
                        <Box mb="md">
                          <Text size="xs" fw={600} c="dimmed" mb="xs">Example Implementation:</Text>
                          <Paper p="sm" bg="gray.0" radius="md">
                            <Text size="sm">{policy.example}</Text>
                          </Paper>
                        </Box>
                        <Badge size="sm" variant="outline" color={stage.color}>
                          {policy.hipaaRef}
                        </Badge>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Paper>
            </Timeline.Item>
          );
        })}
      </Timeline>

      {/* AI-Specific Policies */}
      <Paper p="lg" mt="xl" mb="xl" withBorder>
        <Group mb="md">
          <ThemeIcon size={40} radius="md" color="grape">
            <IconKey size={24} />
          </ThemeIcon>
          <Box>
            <Title order={2}>AI-Specific Data Handling Policies</Title>
            <Text size="sm" c="dimmed">Additional considerations for machine learning workflows</Text>
          </Box>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {aiSpecificPolicies.map((category) => (
            <Card key={category.category} padding="lg" radius="md" withBorder>
              <Text fw={600} mb="md">{category.category}</Text>
              <List size="sm" spacing="xs">
                {category.policies.map((policy, idx) => (
                  <List.Item key={idx}>{policy}</List.Item>
                ))}
              </List>
            </Card>
          ))}
        </SimpleGrid>
      </Paper>

      {/* Best Practices Summary */}
      <Paper p="xl" withBorder bg="cyan.0">
        <Title order={3} mb="md">Data Handling Best Practices for AI Teams</Title>
        <List spacing="md" size="sm">
          <List.Item>
            <Text fw={600}>Document Everything:</Text> Maintain comprehensive documentation of data sources, processing steps, de-identification methods, and retention schedules
          </List.Item>
          <List.Item>
            <Text fw={600}>Separate Environments:</Text> Use dev/test/prod separation with synthetic data in dev/test and PHI only in production
          </List.Item>
          <List.Item>
            <Text fw={600}>Automate Compliance:</Text> Build data handling policies into your CI/CD pipelines and infrastructure-as-code
          </List.Item>
          <List.Item>
            <Text fw={600}>Train Your Team:</Text> Ensure all team members complete HIPAA training and understand data handling requirements
          </List.Item>
          <List.Item>
            <Text fw={600}>Audit Regularly:</Text> Conduct periodic audits of data access, model outputs, and compliance with policies
          </List.Item>
          <List.Item>
            <Text fw={600}>Incident Response:</Text> Have a documented breach response plan with clear escalation procedures
          </List.Item>
          <List.Item>
            <Text fw={600}>Vendor Management:</Text> Maintain up-to-date BAAs with all vendors; audit vendor compliance annually
          </List.Item>
          <List.Item>
            <Text fw={600}>Privacy by Design:</Text> Consider privacy implications at the start of every AI project, not as an afterthought
          </List.Item>
        </List>
      </Paper>
    </Container>
  );
};

export default DataHandlingPage;
