import React from 'react';
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
} from '@tabler/icons-react';

const DataHandlingPage = () => {
  // Data lifecycle stages with handling policies
  const dataLifecycle = [
    {
      id: 'collection',
      title: 'Data Collection',
      icon: IconDatabase,
      color: 'blue',
      description: 'Initial acquisition of patient data from various sources',
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
