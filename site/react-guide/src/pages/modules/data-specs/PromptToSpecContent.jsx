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
  Badge,
  Button,
  Divider,
  Anchor,
} from '@mantine/core';
import {
  IconWand,
  IconRobot,
  IconAlertCircle,
  IconExternalLink,
  IconCircleCheck,
} from '@tabler/icons-react';
import OpenAIChat from '../../../components/OpenAIChat';
import styles from './DataSpecs.module.css';

const CUSTOM_GPT_URL =
  'https://chatgpt.com/g/g-678918520cb48191ae63c2f8dff07088-generative-ai-in-business';

const PromptToSpecContent = () => {
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
          <ThemeIcon color="grape" size={48} radius="xl">
            <IconWand size={24} />
          </ThemeIcon>
          <Box>
            <Title order={3}>AI-Powered Specification Generator</Title>
            <Text c="dimmed">
              Convert your ideas into structured data specifications
            </Text>
          </Box>
        </Group>
        <Text size="md">
          Use our custom GPT to transform natural language descriptions into
          professional data specifications, JSON schemas, and data dictionaries.
        </Text>
      </Paper>

      <Title order={3} mb="md" className={styles.sectionTitle}>
        How It Works
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
        <Card shadow="xs" padding="lg" radius="md" withBorder>
          <Badge color="green" variant="filled" size="lg" mb="sm">
            1
          </Badge>
          <Text fw={600} mb="xs">
            Describe Your Data
          </Text>
          <Text size="sm" c="dimmed">
            Tell the AI what kind of data you need in plain English.
          </Text>
        </Card>
        <Card shadow="xs" padding="lg" radius="md" withBorder>
          <Badge color="green" variant="filled" size="lg" mb="sm">
            2
          </Badge>
          <Text fw={600} mb="xs">
            AI Generates Spec
          </Text>
          <Text size="sm" c="dimmed">
            The GPT creates a structured specification with fields, types, and
            rules.
          </Text>
        </Card>
        <Card shadow="xs" padding="lg" radius="md" withBorder>
          <Badge color="green" variant="filled" size="lg" mb="sm">
            3
          </Badge>
          <Text fw={600} mb="xs">
            Refine & Export
          </Text>
          <Text size="sm" c="dimmed">
            Ask follow-up questions, then export as JSON Schema or markdown.
          </Text>
        </Card>
      </SimpleGrid>

      <Title order={3} mb="md" className={styles.sectionTitle}>
        Example Prompts to Try
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
        <Card shadow="xs" padding="lg" radius="md" withBorder>
          <Badge color="teal" variant="light" mb="sm">
            Healthcare
          </Badge>
          <Text size="sm" fw={500} mb="xs">
            Patient Visit Record
          </Text>
          <Paper p="sm" bg="gray.1" radius="sm">
            <Text size="xs" ff="monospace">
              Create a data specification for tracking patient visits at a
              dental clinic. Include patient info, procedures performed, and
              billing codes.
            </Text>
          </Paper>
        </Card>
        <Card shadow="xs" padding="lg" radius="md" withBorder>
          <Badge color="blue" variant="light" mb="sm">
            Clinical
          </Badge>
          <Text size="sm" fw={500} mb="xs">
            Medication Record
          </Text>
          <Paper p="sm" bg="gray.1" radius="sm">
            <Text size="xs" ff="monospace">
              I need a JSON schema for medication records. Include drug name,
              dosage, frequency, prescriber, and start/end dates.
            </Text>
          </Paper>
        </Card>
        <Card shadow="xs" padding="lg" radius="md" withBorder>
          <Badge color="grape" variant="light" mb="sm">
            Research
          </Badge>
          <Text size="sm" fw={500} mb="xs">
            Clinical Trial Data
          </Text>
          <Paper p="sm" bg="gray.1" radius="sm">
            <Text size="xs" ff="monospace">
              Design a data dictionary for a clinical trial tracking patient
              outcomes, adverse events, and treatment assignments.
            </Text>
          </Paper>
        </Card>
        <Card shadow="xs" padding="lg" radius="md" withBorder>
          <Badge color="orange" variant="light" mb="sm">
            Operations
          </Badge>
          <Text size="sm" fw={500} mb="xs">
            Appointment System
          </Text>
          <Paper p="sm" bg="gray.1" radius="sm">
            <Text size="xs" ff="monospace">
              Build a specification for a healthcare appointment scheduling
              system. Include provider availability, patient preferences, and
              reminders.
            </Text>
          </Paper>
        </Card>
      </SimpleGrid>

      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Important"
        color="yellow"
        mb="xl"
      >
        <Text size="sm">
          <Text span fw={600}>
            Never include real patient data
          </Text>{' '}
          in your prompts to the GPT. Use synthetic examples or describe the
          data structure without actual PHI.
        </Text>
      </Alert>

      <Divider my="xl" />

      <Title order={3} mb="md" className={styles.sectionTitle}>
        Try It Now
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
            <IconExternalLink size={12} className={styles.externalLinkIcon} />
          </Anchor>
        </Text>
      </Paper>

      <Title order={3} mb="md" className={styles.sectionTitle}>
        What You&apos;ll Get
      </Title>
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
            Data Dictionary
          </Text>{' '}
          — Human-readable field definitions
        </List.Item>
        <List.Item>
          <Text span fw={600}>
            JSON Schema
          </Text>{' '}
          — Machine-readable validation rules
        </List.Item>
        <List.Item>
          <Text span fw={600}>
            Example Records
          </Text>{' '}
          — Sample data following your spec
        </List.Item>
        <List.Item>
          <Text span fw={600}>
            Validation Rules
          </Text>{' '}
          — Business logic for data quality
        </List.Item>
        <List.Item>
          <Text span fw={600}>
            HIPAA Considerations
          </Text>{' '}
          — Which fields may contain PHI
        </List.Item>
      </List>
    </>
  );
};

export default PromptToSpecContent;
