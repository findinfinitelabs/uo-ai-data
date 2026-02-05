import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Badge,
  Group,
  Box,
  Checkbox,
  ThemeIcon,
  Timeline,
  Alert,
  Progress,
  RingProgress,
  Center,
  SimpleGrid,
  Card,
  Button,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconAlertCircle,
  IconDoorEnter,
  IconUser,
  IconStethoscope,
  IconFlask,
  IconPill,
  IconCreditCard,
  IconCalendar,
  IconTrophy,
  IconDownload,
} from '@tabler/icons-react';

const ComplianceChecklistPage = () => {
  // State to track checked items for each stage
  const [checkedItems, setCheckedItems] = useState({});

  const handleCheck = (stageId, itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [`${stageId}-${itemId}`]: !prev[`${stageId}-${itemId}`]
    }));
  };

  // Patient journey with compliance checklists
  const complianceStages = [
    {
      id: 'planning',
      title: 'Project Planning & Assessment',
      icon: IconCircleCheck,
      color: 'blue',
      description: 'Initial compliance assessment before starting AI development',
      checklist: [
        {
          id: 'risk-assessment',
          item: 'Conduct HIPAA Security Risk Assessment',
          details: 'Identify potential risks and vulnerabilities in your AI project',
          reference: '45 CFR 164.308(a)(1)(ii)(A)'
        },
        {
          id: 'data-inventory',
          item: 'Create comprehensive data inventory',
          details: 'Document all PHI types, sources, flows, and storage locations',
          reference: '45 CFR 164.530(j)'
        },
        {
          id: 'legal-basis',
          item: 'Establish legal basis for data use',
          details: 'Treatment/Operations, Research, De-identified exception, or Individual Authorization',
          reference: '45 CFR 164.508, 164.512'
        },
        {
          id: 'privacy-impact',
          item: 'Complete Privacy Impact Assessment',
          details: 'Document privacy risks and mitigation strategies',
          reference: 'Best practice; required for federal agencies'
        },
        {
          id: 'workforce-training',
          item: 'Ensure team has HIPAA training',
          details: 'All workforce members accessing PHI must complete training',
          reference: '45 CFR 164.530(b)'
        }
      ]
    },
    {
      id: 'data-collection',
      title: 'Data Collection Phase',
      icon: IconDoorEnter,
      color: 'teal',
      description: 'Compliance requirements when acquiring patient data',
      checklist: [
        {
          id: 'minimum-necessary',
          item: 'Apply Minimum Necessary standard',
          details: 'Only collect PHI necessary for your stated AI purpose',
          reference: '45 CFR 164.502(b), 164.514(d)'
        },
        {
          id: 'authorization',
          item: 'Obtain required authorizations or document exception',
          details: 'Get patient authorization if required, or document applicable exception',
          reference: '45 CFR 164.508'
        },
        {
          id: 'baa-collection',
          item: 'Execute Business Associate Agreements',
          details: 'BAAs with all entities providing or receiving PHI',
          reference: '45 CFR 164.502(e), 164.504(e)'
        },
        {
          id: 'encryption-transfer',
          item: 'Encrypt data during transfer',
          details: 'Use TLS 1.2+, SFTP, or other NIST-approved encryption for PHI transfers',
          reference: '45 CFR 164.312(e)(1)'
        },
        {
          id: 'audit-collection',
          item: 'Enable audit logging for data access',
          details: 'Log who accessed what data, when, and for what purpose',
          reference: '45 CFR 164.312(b)'
        }
      ]
    },
    {
      id: 'data-storage',
      title: 'Data Storage & Security',
      icon: IconUser,
      color: 'indigo',
      description: 'Security controls for storing healthcare data',
      checklist: [
        {
          id: 'encryption-rest',
          item: 'Encrypt PHI at rest (AES-256)',
          details: 'All databases, file systems, and backups containing PHI must be encrypted',
          reference: '45 CFR 164.312(a)(2)(iv)'
        },
        {
          id: 'access-controls',
          item: 'Implement role-based access controls',
          details: 'Unique user IDs, automatic logoff, encryption/decryption controls',
          reference: '45 CFR 164.312(a)(1), 164.308(a)(3)'
        },
        {
          id: 'physical-security',
          item: 'Secure physical access to systems',
          details: 'Badge access, visitor logs, locked server rooms, video surveillance',
          reference: '45 CFR 164.310'
        },
        {
          id: 'backups',
          item: 'Implement secure backup and disaster recovery',
          details: 'Regular encrypted backups with tested recovery procedures',
          reference: '45 CFR 164.308(a)(7), 164.310(d)(2)'
        },
        {
          id: 'workstation-security',
          item: 'Secure workstations and devices',
          details: 'Encryption, screen locks, automatic logoff, anti-malware',
          reference: '45 CFR 164.310(b), (c)'
        }
      ]
    },
    {
      id: 'ml-development',
      title: 'ML Model Development',
      icon: IconStethoscope,
      color: 'violet',
      description: 'Compliance during AI model training and testing',
      checklist: [
        {
          id: 'deidentification',
          item: 'De-identify data for ML (Safe Harbor or Expert Determination)',
          details: 'Apply proper de-identification before providing to data scientists',
          reference: '45 CFR 164.514(a)-(c)'
        },
        {
          id: 'environment-separation',
          item: 'Separate dev/test/prod environments',
          details: 'Use synthetic data in dev/test; PHI only in authorized production environments',
          reference: '45 CFR 164.308(a)(1)'
        },
        {
          id: 'secure-ml-platform',
          item: 'Use HIPAA-compliant ML platforms',
          details: 'AWS SageMaker with BAA, Azure ML with BAA, or on-premise compliant infrastructure',
          reference: 'BAA requirements'
        },
        {
          id: 'model-validation',
          item: 'Check models for PHI leakage',
          details: 'Review model outputs, error messages, and explanations for embedded PHI',
          reference: '45 CFR 164.530(c)'
        },
        {
          id: 'documentation',
          item: 'Document dataset sources and processing',
          details: 'Data lineage, de-identification methods, transformations applied',
          reference: '45 CFR 164.316(b)(1)'
        }
      ]
    },
    {
      id: 'deployment',
      title: 'Model Deployment',
      icon: IconFlask,
      color: 'pink',
      description: 'Compliance requirements for deploying AI models',
      checklist: [
        {
          id: 'secure-endpoints',
          item: 'Deploy to secure, HIPAA-compliant infrastructure',
          details: 'VPC, private subnets, security groups, HIPAA-eligible cloud services',
          reference: '45 CFR 164.312'
        },
        {
          id: 'input-output-encryption',
          item: 'Encrypt model inputs and outputs',
          details: 'TLS for API calls, encrypted message queues, encrypted storage',
          reference: '45 CFR 164.312(e)'
        },
        {
          id: 'authentication',
          item: 'Implement strong authentication',
          details: 'MFA for users, API keys for services, OAuth/OIDC where applicable',
          reference: '45 CFR 164.312(d)'
        },
        {
          id: 'audit-inference',
          item: 'Log all model inference requests',
          details: 'Track who sent what inputs, outputs generated, timestamps',
          reference: '45 CFR 164.312(b)'
        },
        {
          id: 'contingency-plan',
          item: 'Create incident response and rollback plan',
          details: 'Document procedures for model failures, breaches, and version rollback',
          reference: '45 CFR 164.308(a)(7)'
        }
      ]
    },
    {
      id: 'monitoring',
      title: 'Ongoing Monitoring',
      icon: IconPill,
      color: 'orange',
      description: 'Continuous compliance monitoring and auditing',
      checklist: [
        {
          id: 'regular-audits',
          item: 'Conduct periodic compliance audits',
          details: 'Annual HIPAA Security Rule audits, quarterly access reviews',
          reference: '45 CFR 164.308(a)(1)(ii)(D)'
        },
        {
          id: 'monitoring-tools',
          item: 'Deploy security monitoring tools',
          details: 'SIEM, intrusion detection, anomaly detection, automated alerts',
          reference: '45 CFR 164.308(a)(1)'
        },
        {
          id: 'fairness-monitoring',
          item: 'Monitor for bias and fairness issues',
          details: 'Track model performance across demographic groups, audit for disparate impact',
          reference: 'Ethical AI best practices'
        },
        {
          id: 'breach-procedures',
          item: 'Have documented breach notification procedures',
          details: 'Know how to detect, report, and respond to breaches within 60 days',
          reference: '45 CFR 164.400-414'
        },
        {
          id: 'sanctions-policy',
          item: 'Enforce sanctions for non-compliance',
          details: 'Document and apply appropriate sanctions for workforce violations',
          reference: '45 CFR 164.530(e)'
        }
      ]
    },
    {
      id: 'maintenance',
      title: 'Data Retention & Disposal',
      icon: IconCalendar,
      color: 'green',
      description: 'End-of-lifecycle compliance requirements',
      checklist: [
        {
          id: 'retention-policy',
          item: 'Document data retention schedules',
          details: 'Define retention periods for datasets, models, logs, and documentation',
          reference: 'State laws; HIPAA: 6 years for compliance docs'
        },
        {
          id: 'disposal-procedures',
          item: 'Establish secure disposal procedures',
          details: 'Cryptographic erasure, overwriting, degaussing, or physical destruction',
          reference: '45 CFR 164.310(d)(2)(i)'
        },
        {
          id: 'deletion-requests',
          item: 'Honor patient deletion requests',
          details: 'Procedure for removing records from datasets and retraining if needed',
          reference: 'HIPAA Amendment rights (45 CFR 164.526); GDPR Art. 17'
        },
        {
          id: 'destruction-certificates',
          item: 'Obtain certificates of destruction',
          details: 'Document secure disposal of media and backups with vendor certificates',
          reference: '45 CFR 164.308(a)(1)'
        },
        {
          id: 'documentation-retention',
          item: 'Retain compliance documentation for 6 years',
          details: 'Policies, procedures, training records, risk assessments, audit logs',
          reference: '45 CFR 164.316(b)(2)'
        }
      ]
    }
  ];

  // Calculate completion statistics
  const totalItems = complianceStages.reduce((sum, stage) => sum + stage.checklist.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const completionPercentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const getStageCompletion = (stageId, checklistLength) => {
    const stageChecked = Object.keys(checkedItems).filter(key => 
      key.startsWith(`${stageId}-`) && checkedItems[key]
    ).length;
    return Math.round((stageChecked / checklistLength) * 100);
  };

  const downloadChecklist = () => {
    // Create Excel-compatible HTML format with styling
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Compliance Checklist</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          .header { background-color: #7048e8; color: white; font-weight: bold; font-size: 14pt; padding: 10px; }
          .stage-header { background-color: #f3f0ff; font-weight: bold; font-size: 12pt; padding: 8px; }
          .stage-desc { background-color: #f8f9fa; font-style: italic; padding: 5px; }
          .col-header { background-color: #e5dbff; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #7048e8; }
          .data-cell { padding: 5px; border: 1px solid #dee2e6; vertical-align: top; }
          .checkbox-col { width: 60px; text-align: center; }
          .requirement-col { width: 300px; }
          .details-col { width: 400px; }
          .reference-col { width: 200px; }
          table { border-collapse: collapse; width: 100%; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="4" class="header">Healthcare AI Compliance Checklist</td></tr>
          <tr><td colspan="4" style="padding: 10px; background-color: #fff9db;">
            <strong>Instructions:</strong> Use this checklist to track HIPAA compliance requirements throughout your AI project lifecycle. Mark items as completed in the first column. Total items: ${totalItems}
          </td></tr>
          <tr><td colspan="4" style="height: 10px;"></td></tr>
    `;
    
    complianceStages.forEach((stage, stageIndex) => {
      html += `
        <tr><td colspan="4" class="stage-header">${stageIndex + 1}. ${stage.title.toUpperCase()}</td></tr>
        <tr><td colspan="4" class="stage-desc">${stage.description}</td></tr>
        <tr>
          <td class="col-header checkbox-col">✓</td>
          <td class="col-header requirement-col">Requirement</td>
          <td class="col-header details-col">Implementation Details</td>
          <td class="col-header reference-col">HIPAA Reference</td>
        </tr>
      `;
      
      stage.checklist.forEach((item) => {
        html += `
          <tr>
            <td class="data-cell checkbox-col">☐</td>
            <td class="data-cell requirement-col">${item.item}</td>
            <td class="data-cell details-col">${item.details}</td>
            <td class="data-cell reference-col">${item.reference}</td>
          </tr>
        `;
      });
      
      html += `<tr><td colspan="4" style="height: 15px;"></td></tr>`;
    });
    
    // Add summary section
    html += `
      <tr><td colspan="4" style="height: 20px;"></td></tr>
      <tr><td colspan="4" class="stage-header">COMPLIANCE SUMMARY</td></tr>
      <tr>
        <td colspan="2" class="data-cell"><strong>Total Requirements:</strong></td>
        <td colspan="2" class="data-cell">${totalItems}</td>
      </tr>
      <tr>
        <td colspan="2" class="data-cell"><strong>Completed:</strong></td>
        <td colspan="2" class="data-cell" style="background-color: #d3f9d8;">_____</td>
      </tr>
      <tr>
        <td colspan="2" class="data-cell"><strong>Remaining:</strong></td>
        <td colspan="2" class="data-cell" style="background-color: #ffe3e3;">_____</td>
      </tr>
      <tr>
        <td colspan="2" class="data-cell"><strong>Completion Percentage:</strong></td>
        <td colspan="2" class="data-cell" style="background-color: #e7f5ff;">_____  %</td>
      </tr>
    `;
    
    html += `
        </table>
      </body>
      </html>
    `;
    
    // Create blob and download as .xls (Excel will open it perfectly)
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Healthcare_AI_Compliance_Checklist.xls');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container size="xl" py="xl">
      <Box mb="xl">
        <Group justify="space-between" align="flex-start">
          <Group mb="md">
            <ThemeIcon size={50} radius="md" color="grape">
              <IconCircleCheck size={30} />
            </ThemeIcon>
            <Box>
              <Title order={1}>Healthcare AI Compliance Checklist</Title>
              <Text c="dimmed">Track compliance requirements through the AI development lifecycle</Text>
            </Box>
          </Group>

          <Box style={{ textAlign: 'center' }}>
            <RingProgress
              size={120}
              thickness={12}
              sections={[{ value: completionPercentage, color: completionPercentage === 100 ? 'teal' : 'blue' }]}
              label={
                <Center>
                  <Box style={{ textAlign: 'center' }}>
                    <Text size="xl" fw={700}>{completionPercentage}%</Text>
                    <Text size="xs" c="dimmed">Complete</Text>
                  </Box>
                </Center>
              }
            />
            {completionPercentage === 100 && (
              <Badge size="lg" color="yellow" variant="filled" mt="xs" leftSection={<IconTrophy size={16} />}>
                All Done!
              </Badge>
            )}
            <Button
              variant="light"
              color="grape"
              size="sm"
              mt="md"
              leftSection={<IconDownload size={16} />}
              onClick={downloadChecklist}
            >
              Download Checklist
            </Button>
          </Box>
        </Group>
      </Box>

      <Alert icon={<IconAlertCircle />} color="grape" mb="xl">
        <Text fw={600} mb="xs">How to Use This Checklist</Text>
        <Text size="sm">
          This interactive checklist guides you through HIPAA compliance requirements for healthcare AI projects. 
          Check off items as you complete them to track your progress. Each item includes the specific HIPAA regulation reference and implementation details.
        </Text>
      </Alert>

      {/* Progress Summary */}
      <Paper p="md" mb="xl" withBorder>
        <Group justify="space-between" mb="md">
          <Text fw={600}>Overall Progress</Text>
          <Text size="sm" c="dimmed">{checkedCount} of {totalItems} items completed</Text>
        </Group>
        <Progress value={completionPercentage} size="xl" color={completionPercentage === 100 ? 'teal' : 'blue'} />
      </Paper>

      {/* Stage-by-Stage Progress */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="xl">
        {complianceStages.map((stage) => {
          const StageIcon = stage.icon;
          const stageProgress = getStageCompletion(stage.id, stage.checklist.length);
          return (
            <Card key={stage.id} padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <ThemeIcon color={stage.color} size="lg" radius="md" variant="light">
                  <StageIcon size={20} />
                </ThemeIcon>
                <Badge color={stage.color}>{stageProgress}%</Badge>
              </Group>
              <Text fw={600} size="sm" mb="xs">{stage.title}</Text>
              <Progress value={stageProgress} size="sm" color={stage.color} />
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Checklist Timeline */}
      <Title order={2} mb="md">Compliance Requirements by Project Phase</Title>
      <Text c="dimmed" mb="xl">
        Check off each requirement as you complete it. Click on items to see implementation details.
      </Text>

      <Timeline active={complianceStages.length} bulletSize={40} lineWidth={3}>
        {complianceStages.map((stage) => {
          const StageIcon = stage.icon;
          const stageProgress = getStageCompletion(stage.id, stage.checklist.length);

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
                    {stageProgress}% Complete
                  </Badge>
                </Group>
              }
            >
              <Paper p="md" mb="xl" withBorder>
                <Text size="sm" mb="md" c="dimmed">{stage.description}</Text>

                {stage.checklist.map((item) => {
                  const itemKey = `${stage.id}-${item.id}`;
                  const isChecked = checkedItems[itemKey] || false;

                  return (
                    <Paper
                      key={item.id}
                      p="md"
                      mb="sm"
                      radius="md"
                      withBorder
                      bg={isChecked ? 'teal.0' : 'white'}
                      style={{ 
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleCheck(stage.id, item.id)}
                    >
                      <Group justify="space-between" align="flex-start">
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleCheck(stage.id, item.id)}
                          size="md"
                          color={stage.color}
                          label={
                            <Box>
                              <Text fw={600} size="sm">{item.item}</Text>
                              <Text size="xs" c="dimmed" mt={4}>{item.details}</Text>
                            </Box>
                          }
                          styles={{
                            label: { cursor: 'pointer' },
                            body: { alignItems: 'flex-start' }
                          }}
                        />
                      </Group>
                      <Badge size="xs" variant="outline" color={stage.color} mt="xs">
                        {item.reference}
                      </Badge>
                    </Paper>
                  );
                })}
              </Paper>
            </Timeline.Item>
          );
        })}
      </Timeline>

      {/* Completion Message */}
      {completionPercentage === 100 && (
        <Paper p="xl" withBorder bg="green.0" mt="xl">
          <Group>
            <ThemeIcon size={60} radius="xl" color="green" variant="light">
              <IconTrophy size={30} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="xl" mb="xs">🎉 Congratulations!</Text>
              <Text size="md">
                You've completed all compliance checklist items. Remember to maintain documentation, 
                conduct regular audits, and stay updated on regulatory changes.
              </Text>
            </Box>
          </Group>
        </Paper>
      )}
    </Container>
  );
};

export default ComplianceChecklistPage;
