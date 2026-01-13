import React, { useState } from 'react';
import {
  Title,
  Text,
  Paper,
  ThemeIcon,
  Group,
  Box,
  SimpleGrid,
  Alert,
  List,
  Card,
  Code,
  Divider,
  Anchor,
  Badge,
  Mark,
  Modal,
  ScrollArea,
  Table,
  Tooltip,
  Stack,
  Button,
  Radio,
  Checkbox,
  Select,
  Accordion,
} from '@mantine/core';
import {
  IconDatabase,
  IconCircleCheck,
  IconBulb,
  IconRobot,
  IconAlertCircle,
  IconExternalLink,
  IconCircleDot,
  IconDeviceWatch,
  IconFileText,
  IconChartLine,
  IconTruck,
  IconCreditCard,
  IconUser,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconArrowRight,
  IconChevronDown,
  IconInfoCircle,
} from '@tabler/icons-react';
import OpenAIChat from '../../../components/OpenAIChat';
import styles from './DataSpecs.module.css';
import useCasesData from './useCases.json';
import fieldClassificationsData from './fieldClassifications.json';

const CUSTOM_GPT_URL =
  'https://chatgpt.com/g/g-678918520cb48191ae63c2f8dff07088-generative-ai-in-business';

// Icon mapping for dynamic rendering
const iconMap = {
  IconCircleDot,
  IconDeviceWatch,
  IconFileText,
  IconChartLine,
  IconTruck,
  IconCreditCard,
  IconUser,
  IconAlertTriangle,
};

// Requirements questions with options per use case
const REQUIREMENTS_QUESTIONS = {
  'personalized-health': {
    decision: {
      question: "What decision will this data support?",
      options: [
        { value: 'inventory', label: 'Inventory management decisions' },
        { value: 'health', label: 'Personalized health interventions and lifestyle changes', correct: true },
        { value: 'marketing', label: 'Marketing campaign targeting' },
        { value: 'hiring', label: 'Employee hiring decisions' },
      ]
    },
    users: {
      question: "Who will use this data?",
      options: [
        { value: 'humans', label: 'Humans only (doctors, patients)' },
        { value: 'ai', label: 'AI models only' },
        { value: 'both', label: 'Both humans and AI models', correct: true },
        { value: 'machines', label: 'Industrial machines' },
      ]
    },
    systems: {
      question: "What existing systems will this integrate with?",
      options: [
        { value: 'erp', label: 'ERP and accounting systems' },
        { value: 'ehr', label: 'Electronic Health Records (EHR/FHIR), wearable APIs', correct: true },
        { value: 'crm', label: 'CRM and sales platforms' },
        { value: 'scm', label: 'Supply chain management' },
      ]
    },
    compliance: {
      question: "What compliance requirements apply?",
      options: [
        { value: 'pci', label: 'PCI-DSS (payment card industry)' },
        { value: 'hipaa', label: 'HIPAA (health data privacy)', correct: true },
        { value: 'sox', label: 'SOX (financial reporting)' },
        { value: 'none', label: 'No specific compliance requirements' },
      ]
    },
    volume: {
      question: "What's the expected data volume?",
      options: [
        { value: 'low', label: 'Low: <100 records/day' },
        { value: 'medium', label: 'Medium: Thousands of readings/day from wearables', correct: true },
        { value: 'high', label: 'High: Millions of transactions/second' },
        { value: 'batch', label: 'Batch: Monthly data dumps only' },
      ]
    },
  },
  'manufacturing-analytics': {
    decision: {
      question: "What decision will this data support?",
      options: [
        { value: 'health', label: 'Patient treatment decisions' },
        { value: 'maintenance', label: 'Predictive maintenance and equipment scheduling', correct: true },
        { value: 'marketing', label: 'Marketing campaign targeting' },
        { value: 'fraud', label: 'Fraud detection and prevention' },
      ]
    },
    users: {
      question: "Who will use this data?",
      options: [
        { value: 'humans', label: 'Humans only (technicians, managers)' },
        { value: 'ai', label: 'AI models only' },
        { value: 'both', label: 'Both humans and AI/ML models', correct: true },
        { value: 'patients', label: 'Patients and healthcare providers' },
      ]
    },
    systems: {
      question: "What existing systems will this integrate with?",
      options: [
        { value: 'ehr', label: 'Electronic Health Records (EHR)' },
        { value: 'mes', label: 'MES, CMMS, ERP (SAP), IoT platforms', correct: true },
        { value: 'banking', label: 'Core banking systems' },
        { value: 'social', label: 'Social media platforms' },
      ]
    },
    compliance: {
      question: "What compliance requirements apply?",
      options: [
        { value: 'hipaa', label: 'HIPAA (health data privacy)' },
        { value: 'iso', label: 'ISO 9001, industry safety standards', correct: true },
        { value: 'pci', label: 'PCI-DSS (payment card industry)' },
        { value: 'gdpr', label: 'GDPR (EU data privacy)' },
      ]
    },
    volume: {
      question: "What's the expected data volume?",
      options: [
        { value: 'low', label: 'Low: <100 records/day' },
        { value: 'realtime', label: 'High: Real-time sensor streams (readings/second)', correct: true },
        { value: 'batch', label: 'Batch: Monthly data dumps only' },
        { value: 'manual', label: 'Manual: Occasional data entry' },
      ]
    },
  },
  'fraud-detection': {
    decision: {
      question: "What decision will this data support?",
      options: [
        { value: 'health', label: 'Patient treatment decisions' },
        { value: 'maintenance', label: 'Equipment maintenance scheduling' },
        { value: 'fraud', label: 'Real-time fraud detection and transaction approval', correct: true },
        { value: 'hiring', label: 'Employee hiring decisions' },
      ]
    },
    users: {
      question: "Who will use this data?",
      options: [
        { value: 'humans', label: 'Humans only (analysts)' },
        { value: 'ai', label: 'AI models only (automated decisions)' },
        { value: 'both', label: 'Both: AI for real-time, humans for review', correct: true },
        { value: 'customers', label: 'Bank customers directly' },
      ]
    },
    systems: {
      question: "What existing systems will this integrate with?",
      options: [
        { value: 'ehr', label: 'Electronic Health Records (EHR)' },
        { value: 'mes', label: 'Manufacturing Execution Systems' },
        { value: 'banking', label: 'Core banking, card networks, threat intel feeds', correct: true },
        { value: 'social', label: 'Social media platforms' },
      ]
    },
    compliance: {
      question: "What compliance requirements apply?",
      options: [
        { value: 'hipaa', label: 'HIPAA (health data privacy)' },
        { value: 'pci', label: 'PCI-DSS, BSA/AML, state banking regulations', correct: true },
        { value: 'iso', label: 'ISO 9001 (quality management)' },
        { value: 'none', label: 'No specific compliance requirements' },
      ]
    },
    volume: {
      question: "What's the expected data volume?",
      options: [
        { value: 'low', label: 'Low: <100 records/day' },
        { value: 'medium', label: 'Medium: Thousands/day' },
        { value: 'high', label: 'Very high: 50,000+ transactions/day, real-time', correct: true },
        { value: 'batch', label: 'Batch: Weekly reports only' },
      ]
    },
  },
};

const CreatingSpecsContent = () => {
  const [dataModal, setDataModal] = useState({ opened: false, source: null, useCase: null });
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [fieldAnswers, setFieldAnswers] = useState({});
  const [showStep2Results, setShowStep2Results] = useState(false);

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon size={14} /> : <IconDatabase size={14} />;
  };

  const renderHighlightedScenario = (useCase) => {
    let text = useCase.scenario;
    const highlights = useCase.highlights || [];
    
    // Simple approach: wrap highlighted text with underlined Text components
    const parts = [];
    let lastIndex = 0;
    
    highlights.forEach((highlight, idx) => {
      const index = text.indexOf(highlight.text, lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push(text.slice(lastIndex, index));
        }
        parts.push(
          <Text key={idx} span td="underline" fw={500}>
            {highlight.text}
          </Text>
        );
        lastIndex = index + highlight.text.length;
      }
    });
    
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const getSelectedDataSource = () => {
    if (!dataModal.useCase || !dataModal.source) return null;
    const useCase = useCasesData.useCases.find(uc => uc.id === dataModal.useCase);
    if (!useCase) return null;
    return useCase.dataSources.find(ds => ds.name === dataModal.source);
  };

  const selectedDataSource = getSelectedDataSource();

  return (
    <>
      {/* Use Cases Section */}
      <Title order={3} mb="md" className={styles.sectionTitle}>
        Real-World Use Cases
      </Title>
      <Text size="md" mb="lg">
        Explore how different industries combine multiple data sources to power AI applications. 
        Click on any data source badge to see sample data formats.
      </Text>
      
      <Text size="sm" c="dimmed" mb="md">
        Select a use case to begin the requirements analysis exercise. Click on <Text span fw={700}>any data source</Text> to view sample data.
      </Text>
      
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mb="xl">
        {useCasesData.useCases.map((useCase) => (
          <Card 
            key={useCase.id} 
            shadow={selectedUseCase === useCase.id ? "md" : "sm"} 
            padding="lg" 
            radius="md" 
            withBorder
            onClick={() => {
              if (selectedUseCase !== useCase.id) {
                setSelectedUseCase(useCase.id);
                setAnswers({});
                setShowResults(false);
                setFieldAnswers({});
                setShowStep2Results(false);
              }
            }}
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              borderColor: selectedUseCase === useCase.id ? 'var(--mantine-color-blue-5)' : undefined,
              borderWidth: selectedUseCase === useCase.id ? 2 : 1,
              transform: selectedUseCase === useCase.id ? 'scale(1.02)' : undefined,
              transition: 'all 0.2s ease',
            }}
          >
            {/* Header - fixed height */}
            <Box style={{ height: 60 }}>
              <Group gap="sm">
                <Text style={{ fontSize: 36 }}>{useCase.avatar}</Text>
                <Box style={{ flex: 1 }}>
                  <Text fw={700} size="md" style={{ wordBreak: 'break-word' }}>{useCase.title}</Text>
                  <Text size="xs" c="dimmed">{useCase.name}</Text>
                </Box>
                {selectedUseCase === useCase.id && (
                  <ThemeIcon color="blue" size="sm" radius="xl">
                    <IconCheck size={12} />
                  </ThemeIcon>
                )}
              </Group>
            </Box>
            
            <Divider my="xs" />
            
            {/* Tags - fixed height */}
            <Box style={{ height: 48 }}>
              <Group gap={4} wrap="wrap">
                {useCase.tags.map((tag, idx) => (
                  <Badge key={idx} color={tag.color} variant="light" size="xs">
                    {tag.label}
                  </Badge>
                ))}
              </Group>
            </Box>
            
            <Divider my="xs" />
            
            {/* Scenario - fixed height */}
            <Box style={{ height: 150, overflow: 'hidden' }}>
              <Text size="sm" lh={1.5} style={{ wordBreak: 'break-word' }}>
                {renderHighlightedScenario(useCase)}
              </Text>
            </Box>
            
            <Divider my="sm" label="Data Sources" labelPosition="center" />
            
            {/* Data Sources - stacked for easy scanning */}
            <Stack gap={6} mt="xs">
              {useCase.dataSources.map((source, idx) => (
                <Tooltip key={idx} label={source.description} withArrow multiline w={250}>
                  <Badge
                    size="md"
                    variant="outline"
                    color={useCase.color}
                    leftSection={getIcon(source.icon)}
                    style={{ cursor: 'pointer', width: 'fit-content' }}
                    onClick={() => setDataModal({ opened: true, source: source.name, useCase: useCase.id })}
                  >
                    {source.name}
                  </Badge>
                </Tooltip>
              ))}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {/* Data Source Modal */}
      <Modal
        opened={dataModal.opened}
        onClose={() => setDataModal({ opened: false, source: null, useCase: null })}
        title={
          <Group gap="sm">
            <ThemeIcon color="green" size="md" radius="xl">
              {selectedDataSource && getIcon(selectedDataSource.icon)}
            </ThemeIcon>
            <Text fw={600}>
              {selectedDataSource?.sampleData?.title || dataModal.source}
            </Text>
          </Group>
        }
        size="90%"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {selectedDataSource && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {selectedDataSource.description}
            </Text>
            
            <Alert color="blue" variant="light" icon={<IconDatabase size={16} />}>
              <Text size="sm" fw={500}>Format: {selectedDataSource.sampleData.format}</Text>
            </Alert>
            
            <Text fw={600} size="sm">Sample Records:</Text>
            <Paper p="md" bg="gray.0" radius="md">
              <Code block style={{ fontSize: 11, maxHeight: 400, overflow: 'auto' }}>
                {JSON.stringify(selectedDataSource.sampleData.records, null, 2)}
              </Code>
            </Paper>
          </Stack>
        )}
      </Modal>

      {selectedUseCase && (
        <>
          <Divider my="xl" />

          <Paper
            shadow="sm"
            p="xl"
            radius="md"
            withBorder
            mb="xl"
            className={styles.hero}
          >
            <Group gap="md" mb="md">
              <ThemeIcon color="blue" size={48} radius="xl">
                <IconDatabase size={24} />
              </ThemeIcon>
              <Box>
                <Title order={3}>Building Your First Data Specification</Title>
                <Text c="dimmed">
                  From business requirements to structured schemas
                </Text>
              </Box>
            </Group>
          </Paper>

          <Accordion 
        variant="separated" 
        radius="md" 
        mb="xl"
        defaultValue="step1"
      >
        <Accordion.Item value="step1">
          <Accordion.Control>
            <Group gap="sm">
              <ThemeIcon color="blue" size="md" radius="xl">
                <IconCircleCheck size={16} />
              </ThemeIcon>
              <Box>
                <Text fw={600}>Step 1: Gather Requirements</Text>
                {showResults && (
                  <Badge size="xs" color="teal" variant="light" ml="xs">
                    Completed
                  </Badge>
                )}
              </Box>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Text size="md" mb="md">
              Before writing any specification, you need to understand what problem
              you're solving. {selectedUseCase ? (
                <Text span c="blue" fw={600}>
                  Answer these questions based on the {useCasesData.useCases.find(uc => uc.id === selectedUseCase)?.title} use case:
                </Text>
              ) : (
                <Text span c="dimmed">Select a use case above to practice identifying requirements.</Text>
              )}
            </Text>
            
            {selectedUseCase && REQUIREMENTS_QUESTIONS[selectedUseCase] ? (
              <Paper p="lg" radius="md" withBorder>
          <Stack gap="lg">
            {Object.entries(REQUIREMENTS_QUESTIONS[selectedUseCase]).map(([key, questionData], idx) => {
              const isCorrect = showResults && answers[key] === questionData.options.find(o => o.correct)?.value;
              const isWrong = showResults && answers[key] && !isCorrect;
              
              return (
                <Box key={key}>
                  <Group gap="xs" mb="xs">
                    <Badge color="blue" variant="filled" size="sm">{idx + 1}</Badge>
                    <Text fw={600} size="sm">{questionData.question}</Text>
                    {showResults && (
                      isCorrect ? (
                        <ThemeIcon color="teal" size="xs" radius="xl">
                          <IconCheck size={10} />
                        </ThemeIcon>
                      ) : isWrong ? (
                        <ThemeIcon color="orange" size="xs" radius="xl">
                          <IconX size={10} />
                        </ThemeIcon>
                      ) : null
                    )}
                  </Group>
                  <Radio.Group
                    value={answers[key] || ''}
                    onChange={(value) => setAnswers(prev => ({ ...prev, [key]: value }))}
                  >
                    <Stack gap="xs" ml="md">
                      {questionData.options.map((option) => (
                        <Radio
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          disabled={showResults}
                          styles={{
                            label: {
                              color: showResults && option.correct ? 'var(--mantine-color-teal-7)' : undefined,
                              fontWeight: showResults && option.correct ? 600 : undefined,
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Radio.Group>
                  {idx < Object.keys(REQUIREMENTS_QUESTIONS[selectedUseCase]).length - 1 && (
                    <Divider my="md" />
                  )}
                </Box>
              );
            })}
            
            <Divider />
            
            <Group justify="space-between">
              {!showResults ? (
                <Button 
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(answers).length < Object.keys(REQUIREMENTS_QUESTIONS[selectedUseCase]).length}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Check Answers
                </Button>
              ) : (
                <Group gap="md">
                  <Badge size="lg" color="teal" variant="light">
                    Score: {Object.entries(REQUIREMENTS_QUESTIONS[selectedUseCase]).filter(
                      ([key, q]) => answers[key] === q.options.find(o => o.correct)?.value
                    ).length} / {Object.keys(REQUIREMENTS_QUESTIONS[selectedUseCase]).length}
                  </Badge>
                  <Button 
                    variant="light"
                    onClick={() => {
                      setAnswers({});
                      setShowResults(false);
                    }}
                  >
                    Try Again
                  </Button>
                </Group>
              )}
              
              <Text size="xs" c="dimmed">
                💡 Review the sample data above if you're unsure
              </Text>
            </Group>
          </Stack>
        </Paper>
      ) : (
        <List
          size="md"
          spacing="sm"
          mb="xl"
          icon={
            <ThemeIcon color="green" size={24} radius="xl">
              <IconCircleCheck size={16} />
            </ThemeIcon>
          }
        >
          <List.Item>
            <Text span fw={600}>
              What decision
            </Text>{' '}
            will this data support?
          </List.Item>
          <List.Item>
            <Text span fw={600}>
              Who will use
            </Text>{' '}
            this data? (humans, AI models, both?)
          </List.Item>
          <List.Item>
            <Text span fw={600}>
              What existing systems
            </Text>{' '}
            will this integrate with?
          </List.Item>
          <List.Item>
            <Text span fw={600}>
              What compliance requirements
            </Text>{' '}
            apply? (HIPAA, GDPR?)
          </List.Item>
          <List.Item>
            <Text span fw={600}>
              What's the expected volume
            </Text>{' '}
            of data?
          </List.Item>
        </List>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Accordion 
        variant="separated" 
        radius="md" 
        mb="xl"
        defaultValue="step2"
      >
        <Accordion.Item value="step2">
          <Accordion.Control>
            <Group gap="sm">
              <ThemeIcon color="blue" size="md" radius="xl">
                <IconDatabase size={16} />
              </ThemeIcon>
              <Box>
                <Text fw={600}>Step 2: Define Fields</Text>
                {selectedUseCase && Object.keys(fieldAnswers).length > 0 && (
                  <Badge size="xs" color="teal" variant="light" ml="xs">
                    {(() => {
                      let correct = 0;
                      let total = 0;
                      Object.entries(fieldClassificationsData.useCases[selectedUseCase]?.dataSources || {}).forEach(([sourceName, sourceData]) => {
                        total += sourceData.fields.length * 4;
                        sourceData.fields.forEach(field => {
                          const key = `${sourceName}-${field.name}`;
                          const ans = fieldAnswers[key] || {};
                          if (ans.phi === field.phi) correct++;
                          if (ans.pii === field.pii) correct++;
                          if (ans.sensitivity === field.sensitivity) correct++;
                          if (ans.dataType === field.dataType) correct++;
                        });
                      });
                      return `${correct} / ${total}`;
                    })()} complete
                  </Badge>
                )}
              </Box>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Text size="md" mb="md">
              For each piece of information, classify the data appropriately. {selectedUseCase ? (
                <Text span c="blue" fw={600}>
                  Classify the fields from each {useCasesData.useCases.find(uc => uc.id === selectedUseCase)?.title} data source:
                </Text>
              ) : (
                <Text span c="dimmed">Select a use case above to practice field classification.</Text>
              )}
            </Text>

            {selectedUseCase && fieldClassificationsData.useCases[selectedUseCase] ? (
              <Stack gap="xl">
          {Object.entries(fieldClassificationsData.useCases[selectedUseCase].dataSources).map(([sourceName, sourceData]) => (
            <Paper key={sourceName} p="md" radius="md" withBorder>
              <Group gap="sm" mb="md">
                <ThemeIcon color="blue" size="sm" radius="xl">
                  <IconDatabase size={12} />
                </ThemeIcon>
                <Text fw={600} size="sm">{sourceName}</Text>
                <Badge size="sm" color="teal" variant="light">
                  {(() => {
                    let correct = 0;
                    let total = sourceData.fields.length * 4; // 4 fields per row
                    sourceData.fields.forEach(field => {
                      const key = `${sourceName}-${field.name}`;
                      const ans = fieldAnswers[key] || {};
                      if (ans.phi === field.phi) correct++;
                      if (ans.pii === field.pii) correct++;
                      if (ans.sensitivity === field.sensitivity) correct++;
                      if (ans.dataType === field.dataType) correct++;
                    });
                    return `${correct} / ${total}`;
                  })()} correct
                </Badge>
              </Group>
              <Table striped highlightOnHover withTableBorder withColumnBorders fontSize="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 140 }}>
                      <Group gap={4}>
                        Field Name
                        <Tooltip 
                          label={
                            <Text size="xs">The column or attribute name from the data source. This becomes the key in your JSON schema.</Text>
                          }
                          withArrow
                          multiline
                          w={220}
                          position="top"
                        >
                          <ThemeIcon variant="subtle" size="xs" color="gray">
                            <IconInfoCircle size={12} />
                          </ThemeIcon>
                        </Tooltip>
                      </Group>
                    </Table.Th>
                    <Table.Th style={{ width: 80 }}>
                      <Group gap={4}>
                        PHI?
                        <Tooltip 
                          label={
                            <Stack gap={4}>
                              <Text size="xs" fw={600}>Protected Health Information</Text>
                              <Text size="xs">Health data protected under HIPAA. Includes diagnoses, treatments, vitals, lab results, and any data relating to physical or mental health.</Text>
                              <Text size="xs" mt={4} c="dimmed">Yes = Health-related data</Text>
                              <Text size="xs" c="dimmed">No = Not health-related</Text>
                            </Stack>
                          }
                          withArrow
                          multiline
                          w={260}
                          position="top"
                        >
                          <ThemeIcon variant="subtle" size="xs" color="gray">
                            <IconInfoCircle size={12} />
                          </ThemeIcon>
                        </Tooltip>
                      </Group>
                    </Table.Th>
                    <Table.Th style={{ width: 80 }}>
                      <Group gap={4}>
                        PII?
                        <Tooltip 
                          label={
                            <Stack gap={4}>
                              <Text size="xs" fw={600}>Personally Identifiable Information</Text>
                              <Text size="xs">Data that can identify a specific individual. Includes names, IDs, emails, phone numbers, addresses, and account numbers.</Text>
                              <Text size="xs" mt={4} c="dimmed">Yes = Can identify a person</Text>
                              <Text size="xs" c="dimmed">No = Cannot identify anyone</Text>
                            </Stack>
                          }
                          withArrow
                          multiline
                          w={260}
                          position="top"
                        >
                          <ThemeIcon variant="subtle" size="xs" color="gray">
                            <IconInfoCircle size={12} />
                          </ThemeIcon>
                        </Tooltip>
                      </Group>
                    </Table.Th>
                    <Table.Th style={{ width: 150 }}>
                      <Group gap={4}>
                        Sensitivity
                        <Tooltip 
                          label={
                            <Stack gap={4}>
                              <Text size="xs" fw={600}>Public:</Text>
                              <Text size="xs">No restrictions, can be freely shared (product codes, counts)</Text>
                              <Text size="xs" fw={600} mt={4}>Private:</Text>
                              <Text size="xs">Internal use only, not for public (timestamps, work orders)</Text>
                              <Text size="xs" fw={600} mt={4}>Confidential:</Text>
                              <Text size="xs">Sensitive business/health data requiring protection (diagnoses, financials)</Text>
                              <Text size="xs" fw={600} mt={4}>Restricted:</Text>
                              <Text size="xs">Highest protection, strict access control (SSN, patient IDs, account IDs)</Text>
                            </Stack>
                          }
                          withArrow
                          multiline
                          w={300}
                          position="top"
                        >
                          <ThemeIcon variant="subtle" size="xs" color="gray">
                            <IconInfoCircle size={12} />
                          </ThemeIcon>
                        </Tooltip>
                      </Group>
                    </Table.Th>
                    <Table.Th style={{ width: 110 }}>
                      <Group gap={4}>
                        Data Type
                        <Tooltip 
                          label={
                            <Stack gap={4}>
                              <Text size="xs" fw={600}>JSON Schema Data Types:</Text>
                              <Text size="xs"><Text span fw={500}>string</Text> - Text values</Text>
                              <Text size="xs"><Text span fw={500}>integer</Text> - Whole numbers</Text>
                              <Text size="xs"><Text span fw={500}>float</Text> - Decimal numbers</Text>
                              <Text size="xs"><Text span fw={500}>boolean</Text> - True/false</Text>
                              <Text size="xs"><Text span fw={500}>date</Text> - Date only (YYYY-MM-DD)</Text>
                              <Text size="xs"><Text span fw={500}>datetime</Text> - Date + time</Text>
                              <Text size="xs"><Text span fw={500}>array</Text> - List of values</Text>
                              <Text size="xs"><Text span fw={500}>object</Text> - Nested structure</Text>
                            </Stack>
                          }
                          withArrow
                          multiline
                          w={240}
                          position="top"
                        >
                          <ThemeIcon variant="subtle" size="xs" color="gray">
                            <IconInfoCircle size={12} />
                          </ThemeIcon>
                        </Tooltip>
                      </Group>
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sourceData.fields.map((field) => {
                    const key = `${sourceName}-${field.name}`;
                    const currentAnswers = fieldAnswers[key] || {};
                    
                    // Live validation - check as soon as answered
                    const hasPhiAnswer = currentAnswers.phi != null;
                    const hasPiiAnswer = currentAnswers.pii != null;
                    const hasSensAnswer = currentAnswers.sensitivity != null;
                    const hasTypeAnswer = currentAnswers.dataType != null;
                    
                    const isPhiCorrect = hasPhiAnswer && currentAnswers.phi === field.phi;
                    const isPiiCorrect = hasPiiAnswer && currentAnswers.pii === field.pii;
                    const isSensCorrect = hasSensAnswer && currentAnswers.sensitivity === field.sensitivity;
                    const isTypeCorrect = hasTypeAnswer && currentAnswers.dataType === field.dataType;
                    
                    // Generate explanations for wrong answers
                    const getPhiExplanation = () => {
                      if (field.phi === 'Yes') return `Health data under HIPAA - ${field.name} relates to individual health status`;
                      return `Not health-related data - ${field.name} doesn't reveal health conditions`;
                    };
                    const getPiiExplanation = () => {
                      if (field.pii === 'Yes') return `Can identify individuals - ${field.name} links to a specific person`;
                      return `Cannot identify individuals - ${field.name} is not personally identifiable`;
                    };
                    const getSensExplanation = () => {
                      if (field.sensitivity === 'Public') return `No restrictions - can be freely shared`;
                      if (field.sensitivity === 'Private') return `Internal use only - not for public sharing`;
                      if (field.sensitivity === 'Confidential') return `Sensitive data requiring protection`;
                      return `Highest protection - strict access control required`;
                    };
                    const getTypeExplanation = () => `Based on the data format: ${field.dataType}`;
                    
                    return (
                      <Table.Tr key={field.name}>
                        <Table.Td>
                          <Code size="xs">{field.name}</Code>
                        </Table.Td>
                        <Table.Td style={{ backgroundColor: hasPhiAnswer ? (isPhiCorrect ? '#d3f9d8' : '#ffe3e3') : undefined }}>
                          <Tooltip
                            label={<Text size="xs">✗ Correct: {field.phi}. {getPhiExplanation()}</Text>}
                            opened={hasPhiAnswer && !isPhiCorrect ? undefined : false}
                            position="top"
                            withArrow
                            multiline
                            w={250}
                            color="red"
                          >
                            <Select
                              size="xs"
                              placeholder="-"
                              data={fieldClassificationsData.classificationOptions.phi}
                              value={currentAnswers.phi || null}
                              onChange={(val) => setFieldAnswers(prev => ({ ...prev, [key]: { ...prev[key], phi: val } }))}
                              styles={{ input: { minHeight: 28 } }}
                            />
                          </Tooltip>
                        </Table.Td>
                        <Table.Td style={{ backgroundColor: hasPiiAnswer ? (isPiiCorrect ? '#d3f9d8' : '#ffe3e3') : undefined }}>
                          <Tooltip
                            label={<Text size="xs">✗ Correct: {field.pii}. {getPiiExplanation()}</Text>}
                            opened={hasPiiAnswer && !isPiiCorrect ? undefined : false}
                            position="top"
                            withArrow
                            multiline
                            w={250}
                            color="red"
                          >
                            <Select
                              size="xs"
                              placeholder="-"
                              data={fieldClassificationsData.classificationOptions.pii}
                              value={currentAnswers.pii || null}
                              onChange={(val) => setFieldAnswers(prev => ({ ...prev, [key]: { ...prev[key], pii: val } }))}
                              styles={{ input: { minHeight: 28 } }}
                            />
                          </Tooltip>
                        </Table.Td>
                        <Table.Td style={{ backgroundColor: hasSensAnswer ? (isSensCorrect ? '#d3f9d8' : '#ffe3e3') : undefined }}>
                          <Tooltip
                            label={<Text size="xs">✗ Correct: {field.sensitivity}. {getSensExplanation()}</Text>}
                            opened={hasSensAnswer && !isSensCorrect ? undefined : false}
                            position="top"
                            withArrow
                            multiline
                            w={280}
                            color="red"
                          >
                            <Select
                              size="xs"
                              placeholder="-"
                              data={fieldClassificationsData.classificationOptions.sensitivity}
                              value={currentAnswers.sensitivity || null}
                              onChange={(val) => setFieldAnswers(prev => ({ ...prev, [key]: { ...prev[key], sensitivity: val } }))}
                              styles={{ input: { minHeight: 28 } }}
                            />
                          </Tooltip>
                        </Table.Td>
                        <Table.Td style={{ backgroundColor: hasTypeAnswer ? (isTypeCorrect ? '#d3f9d8' : '#ffe3e3') : undefined }}>
                          <Tooltip
                            label={<Text size="xs">✗ Correct: {field.dataType}. {getTypeExplanation()}</Text>}
                            opened={hasTypeAnswer && !isTypeCorrect ? undefined : false}
                            position="top"
                            withArrow
                            multiline
                            w={220}
                            color="red"
                          >
                            <Select
                              size="xs"
                              placeholder="-"
                              data={fieldClassificationsData.classificationOptions.dataType}
                              value={currentAnswers.dataType || null}
                              onChange={(val) => setFieldAnswers(prev => ({ ...prev, [key]: { ...prev[key], dataType: val } }))}
                              styles={{ input: { minHeight: 28 } }}
                            />
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Paper>
          ))}

          <Group justify="space-between">
            <Group gap="md">
              <Badge size="lg" color="teal" variant="light">
                Score: {(() => {
                  let correct = 0;
                  let total = 0;
                  Object.entries(fieldClassificationsData.useCases[selectedUseCase].dataSources).forEach(([sourceName, sourceData]) => {
                    total += sourceData.fields.length * 4;
                    sourceData.fields.forEach(field => {
                      const key = `${sourceName}-${field.name}`;
                      const ans = fieldAnswers[key] || {};
                      if (ans.phi === field.phi) correct++;
                      if (ans.pii === field.pii) correct++;
                      if (ans.sensitivity === field.sensitivity) correct++;
                      if (ans.dataType === field.dataType) correct++;
                    });
                  });
                  return `${correct} / ${total}`;
                })()}
              </Badge>
              {Object.keys(fieldAnswers).length > 0 && (
                <Button 
                  variant="light"
                  size="xs"
                  onClick={() => {
                    setFieldAnswers({});
                  }}
                >
                  Reset All
                </Button>
              )}
            </Group>
            
            <Text size="xs" c="dimmed">
              💡 Review the sample data in each source to help identify field types
            </Text>
          </Group>
            </Stack>
            ) : (
              <Paper p="md" bg="gray.0" radius="md">
                <Code block>
                  {`{
  "field_name": "patient_age",
  "type": "integer",
  "description": "Patient's age in years at time of visit",
  "required": true,
  "constraints": {
    "minimum": 0,
    "maximum": 150
  },
  "phi_status": "quasi-identifier",
  "example": 45
}`}
                </Code>
              </Paper>
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
        </>
      )}

      <Divider my="xl" />

      <Title order={3} mb="md" className={styles.sectionTitle}>
        AI Spec Generator
      </Title>
      
      <Text size="md" mb="md">
        Use these prompts to generate data specifications for your selected use case:
      </Text>
      
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Group gap="xs" mb="xs">
            <Badge color="blue" size="sm">1</Badge>
            <Text fw={600} size="sm">Generate JSON Schema</Text>
          </Group>
          <Paper p="xs" bg="gray.0" radius="sm">
            <Text size="xs" style={{ lineHeight: 1.5 }}>
              Create a JSON Schema for a patient health record that includes: patient ID, demographics, vital signs from wearables, and visit history. Include validation constraints.
            </Text>
          </Paper>
        </Card>
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Group gap="xs" mb="xs">
            <Badge color="blue" size="sm">2</Badge>
            <Text fw={600} size="sm">Data Dictionary</Text>
          </Group>
          <Paper p="xs" bg="gray.0" radius="sm">
            <Text size="xs" style={{ lineHeight: 1.5 }}>
              Create a data dictionary table for IoT sensor data including: field name, data type, description, valid ranges, and whether it is required. Format as markdown.
            </Text>
          </Paper>
        </Card>
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Group gap="xs" mb="xs">
            <Badge color="blue" size="sm">3</Badge>
            <Text fw={600} size="sm">Validation Rules</Text>
          </Group>
          <Paper p="xs" bg="gray.0" radius="sm">
            <Text size="xs" style={{ lineHeight: 1.5 }}>
              Write validation rules for financial transaction data that should detect: invalid amounts, future dates, missing required fields, and format violations.
            </Text>
          </Paper>
        </Card>
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Group gap="xs" mb="xs">
            <Badge color="blue" size="sm">4</Badge>
            <Text fw={600} size="sm">Sample Data Generator</Text>
          </Group>
          <Paper p="xs" bg="gray.0" radius="sm">
            <Text size="xs" style={{ lineHeight: 1.5 }}>
              Generate 5 synthetic sample records for a manufacturing equipment sensor dataset with realistic values for temperature, vibration, pressure, and timestamp.
            </Text>
          </Paper>
        </Card>
      </SimpleGrid>

      <Paper
        shadow="md"
        p="xl"
        radius="lg"
        withBorder
        mb="xl"
        className={styles.gptGradientCard}
      >
        <Group gap="md" mb="lg">
          <ThemeIcon color="green" size={48} radius="xl">
            <IconRobot size={24} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="lg">
              AI-Powered Specification Generator
            </Text>
            <Text size="sm" c="dimmed">
              Convert natural language to data specs
            </Text>
          </Box>
        </Group>

        <Alert
          icon={<IconAlertCircle size={14} />}
          color="yellow"
          mb="lg"
          p="sm"
        >
          <Text size="sm">Never include real patient data in prompts</Text>
        </Alert>

        <OpenAIChat />

        <Divider my="lg" />

        <Text size="xs" c="dimmed" ta="center">
          <Anchor href={CUSTOM_GPT_URL} target="_blank" size="xs">
            Or use our ChatGPT version{' '}
            <IconExternalLink
              size={12}
              className={styles.externalLinkIcon}
            />
          </Anchor>
        </Text>
      </Paper>
    </>
  );
};

export default CreatingSpecsContent;
