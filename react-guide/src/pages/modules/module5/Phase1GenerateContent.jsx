import React from 'react';
import {
  Title,
  Text,
  Paper,
  Box,
  Code,
  Badge,
  Group,
  List,
  ThemeIcon,
  Alert,
  Stepper,
  Divider,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconTerminal2,
  IconFolder,
  IconInfoCircle,
  IconDatabase,
} from '@tabler/icons-react';

const codeBlock = (code) => (
  <Code block style={{ background: '#1a1b1e', color: '#e9ecef', fontSize: 13, borderRadius: 8, padding: '1rem', margin: '0.5rem 0', display: 'block', whiteSpace: 'pre', userSelect: 'text' }}>
    {code}
  </Code>
);

const DualCodeBlock = ({ bash, ps }) => (
  <Box mt={6} mb={6}>
    <Text size="xs" fw={700} c="teal" mb={2} tt="uppercase" style={{ letterSpacing: 1 }}>Bash · macOS · Linux</Text>
    <Code block style={{ background: '#0b1c0b', color: '#a8ffb0', fontSize: 13, borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem', display: 'block', whiteSpace: 'pre', userSelect: 'text' }}>
      {bash}
    </Code>
    <Text size="xs" fw={700} c="blue.5" mb={2} tt="uppercase" style={{ letterSpacing: 1 }}>PowerShell · Windows</Text>
    <Code block style={{ background: '#0b0b1c', color: '#a8c8ff', fontSize: 13, borderRadius: 8, padding: '0.75rem', display: 'block', whiteSpace: 'pre', userSelect: 'text' }}>
      {ps}
    </Code>
  </Box>
);

export default function Phase1GenerateContent() {
  return (
    <Box>
      <Group mb="md" gap="sm">
        <Badge color="green" size="lg" variant="filled">Phase 1 of 6</Badge>
        <Badge color="gray" size="lg" variant="light">Generate Synthetic Data</Badge>
      </Group>

      <Text size="lg" c="dimmed" mb="xl">
        Before we can train an AI model, we need data. In this phase you will run two generator
        scripts that create realistic synthetic healthcare records — patient records and dental
        records — without using any real patient information.
      </Text>

      <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="xl">
        <Text size="sm">
          <strong>Why synthetic data?</strong> Real healthcare records are protected by HIPAA
          and cannot be used for training without strict compliance steps. Synthetic data gives
          us realistic structure and statistical patterns while keeping everything privacy-safe.
        </Text>
      </Alert>

      <Title order={3} mb="md">What gets generated</Title>
      <Paper withBorder p="md" mb="xl" radius="md">
        <List spacing="sm">
          <List.Item icon={<ThemeIcon color="green" size={20} radius="xl"><IconDatabase size={12} /></ThemeIcon>}>
            <Text fw={600}>Patient records</Text>
            <Text size="sm" c="dimmed">100 patients with demographics, ICD-10 diagnoses, medications, and allergies</Text>
          </List.Item>
          <List.Item icon={<ThemeIcon color="teal" size={20} radius="xl"><IconDatabase size={12} /></ThemeIcon>}>
            <Text fw={600}>Dental records</Text>
            <Text size="sm" c="dimmed">CDT procedure codes, tooth-level conditions, treatment history, and oral hygiene ratings</Text>
          </List.Item>
        </List>
      </Paper>

      <Title order={3} mb="md">Steps</Title>

      <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light" mb="md">
        <Group gap={6}>
          <Text size="sm" fw={600}>Working directory:</Text>
          <Code>uo-ai-data/module-5-synthetic-data/generators/</Code>
        </Group>
        <Text size="xs" c="dimmed" mt={4}>Step 1 below navigates you here from the project root. All generator scripts live in this folder.</Text>
      </Alert>

      <Stepper orientation="vertical" active={-1}>
        <Stepper.Step
          label="Navigate to the generators folder"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>Open a terminal at the <Code>uo-ai-data/</Code> project root and run:</Text>
              {codeBlock('cd module-5-synthetic-data/generators')}
              <Text size="xs" c="dimmed" mt={4}>Works in both bash and PowerShell — forward slashes are fine on Windows too.</Text>
            </Box>
          }
          icon={<IconFolder size={16} />}
        />

        <Stepper.Step
          label="Generate patient health records"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>Creates 100 synthetic patient records with diagnoses and medications:</Text>
              {codeBlock('python generate_patient_data.py')}
              <Text size="sm" c="dimmed" mt={8}>
                Output file saved to{' '}
                <Code>module-5-synthetic-data/datasets/patient-health/synthetic_patients.json</Code>
              </Text>
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Generate dental records"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>Creates dental records with tooth-level procedure and condition data:</Text>
              {codeBlock('python generate_dental_data.py')}
              <Text size="sm" c="dimmed" mt={8}>
                Output file saved to{' '}
                <Code>module-5-synthetic-data/datasets/dental-records/synthetic_dental_visits.json</Code>
              </Text>
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Verify the output"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>Confirm files were created:</Text>
              <DualCodeBlock
                bash={['ls ../datasets/patient-health/', 'ls ../datasets/dental-records/'].join('\n')}
                ps={['Get-ChildItem ../datasets/patient-health/', 'Get-ChildItem ../datasets/dental-records/'].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                You should see <Code>synthetic_patients.json</Code>, <Code>synthetic_patients.csv</Code>,{' '}
                <Code>synthetic_dental_visits.json</Code>, and <Code>synthetic_dental_visits.csv</Code>.
              </Text>
            </Box>
          }
          icon={<IconCircleCheck size={16} />}
        />
      </Stepper>

      <Divider my="xl" />

      <Paper withBorder p="md" radius="md" bg="var(--mantine-color-green-0)">
        <Group gap="sm">
          <ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={14} /></ThemeIcon>
          <Box>
            <Text fw={600} size="sm">Phase 1 complete when:</Text>
            <Text size="sm" c="dimmed">Both JSON output files exist in their respective dataset folders with at least 50 records each.</Text>
          </Box>
        </Group>
      </Paper>
    </Box>
  );
}
