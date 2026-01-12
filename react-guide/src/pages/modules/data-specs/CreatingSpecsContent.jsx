import React from 'react';
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
} from '@mantine/core';
import {
  IconDatabase,
  IconCircleCheck,
  IconBulb,
  IconRobot,
  IconAlertCircle,
  IconExternalLink,
} from '@tabler/icons-react';
import OpenAIChat from '../../../components/OpenAIChat';
import styles from './DataSpecs.module.css';

const CUSTOM_GPT_URL =
  'https://chatgpt.com/g/g-678918520cb48191ae63c2f8dff07088-generative-ai-in-business';

const CreatingSpecsContent = () => {
  return (
    <>
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

      <Title order={3} mb="md" className={styles.sectionTitle}>
        Step 1: Gather Requirements
      </Title>
      <Text size="md" mb="md">
        Before writing any specification, you need to understand what problem
        you're solving. Ask these questions:
      </Text>
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

      <Title order={3} mb="md" className={styles.sectionTitle}>
        Step 2: Define Fields
      </Title>
      <Text size="md" mb="md">
        For each piece of information, document:
      </Text>
      <Paper p="md" bg="gray.0" radius="md" mb="xl">
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

      <Title order={3} mb="md" className={styles.sectionTitle}>
        Step 3: Create JSON Schema
      </Title>
      <Text size="md" mb="md">
        JSON Schema provides machine-readable validation. Here's a simple
        patient record:
      </Text>
      <Paper p="md" bg="gray.0" radius="md" mb="xl">
        <Code block>
          {`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PatientRecord",
  "type": "object",
  "required": ["patient_id", "age", "visit_date"],
  "properties": {
    "patient_id": {
      "type": "string",
      "pattern": "^P[0-9]{8}$",
      "description": "Unique patient identifier (P followed by 8 digits)"
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    },
    "visit_date": {
      "type": "string",
      "format": "date"
    },
    "diagnoses": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[A-Z][0-9]{2}(\\\\.[0-9]{1,2})?$"
      },
      "description": "ICD-10 diagnosis codes"
    }
  }
}`}
        </Code>
      </Paper>

      <Title order={3} mb="md" className={styles.sectionTitle}>
        Step 4: Document Quality Rules
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Text fw={600} c="green" mb="xs">
            ✓ Valid
          </Text>
          <List size="sm" spacing="xs">
            <List.Item>patient_id matches pattern P########</List.Item>
            <List.Item>age is between 0 and 150</List.Item>
            <List.Item>visit_date is not in the future</List.Item>
            <List.Item>diagnosis codes are valid ICD-10</List.Item>
          </List>
        </Card>
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Text fw={600} c="red" mb="xs">
            ✗ Invalid
          </Text>
          <List size="sm" spacing="xs">
            <List.Item>patient_id: "12345" (missing P prefix)</List.Item>
            <List.Item>age: -5 (negative age)</List.Item>
            <List.Item>visit_date: "2030-01-01" (future date)</List.Item>
            <List.Item>diagnosis: "headache" (not ICD-10)</List.Item>
          </List>
        </Card>
      </SimpleGrid>

      <Alert icon={<IconBulb size={16} />} title="Pro Tip" color="blue" mb="xl">
        <Text size="sm">
          Start with the minimum viable specification. You can always add fields
          later, but removing fields that are already in production is painful.
        </Text>
      </Alert>

      <Divider my="xl" />

      <Title order={3} mb="md" className={styles.sectionTitle}>
        AI Spec Generator
      </Title>
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
