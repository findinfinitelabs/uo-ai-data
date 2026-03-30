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
  Table,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconTerminal2,
  IconDatabase,
  IconInfoCircle,
  IconAlertTriangle,
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

const tables = [
  { name: 'healthcare-patients', content: 'Patient demographics, conditions, allergies' },
  { name: 'healthcare-diagnoses', content: 'ICD-10 diagnosis codes and descriptions' },
  { name: 'healthcare-medications', content: 'Medication names, dosages, frequencies' },
  { name: 'healthcare-providers', content: 'Physician and facility information' },
  { name: 'healthcare-patient-diagnoses', content: 'Patient ↔ diagnosis linkage table' },
  { name: 'healthcare-patient-medications', content: 'Patient ↔ medication linkage table' },
];

export default function Phase2UploadContent() {
  return (
    <Box>
      <Group mb="md" gap="sm">
        <Badge color="green" size="lg" variant="filled">Phase 2 of 6</Badge>
        <Badge color="gray" size="lg" variant="light">Upload to DynamoDB</Badge>
      </Group>

      <Text size="lg" c="dimmed" mb="xl">
        Now that you have generated synthetic data, upload it to the DynamoDB tables that were
        provisioned during the AWS deployment. These tables form the knowledge base that the AI
        model will learn from in later phases.
      </Text>

      <Alert icon={<IconAlertTriangle size={16} />} color="yellow" mb="xl">
        <Text size="sm">
          <strong>Prerequisites:</strong> Complete Phase 1 first, and ensure your AWS SSO session
          is active. Run <Code>aws sso login --profile uo-innovation</Code> if you get credential errors.
        </Text>
      </Alert>

      <Title order={3} mb="md">DynamoDB tables</Title>
      <Paper withBorder mb="xl" radius="md" style={{ overflow: 'hidden' }}>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Table name</Table.Th>
              <Table.Th>Contents</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tables.map((t) => (
              <Table.Tr key={t.name}>
                <Table.Td><Code>{t.name}</Code></Table.Td>
                <Table.Td><Text size="sm">{t.content}</Text></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Title order={3} mb="md">Steps</Title>

      <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light" mb="md">
        <Group gap={6}>
          <Text size="sm" fw={600}>Working directory:</Text>
          <Code>uo-ai-data/deployment-scripts/</Code>
        </Group>
        <Text size="xs" c="dimmed" mt={4}>Step 1 navigates you here from the project root. The upload script <Code>populate-healthcare-data.py</Code> lives in this folder.</Text>
      </Alert>

      <Stepper orientation="vertical" active={-1}>
        <Stepper.Step
          label="Navigate to the deployment scripts folder"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>From the <Code>uo-ai-data/</Code> project root:</Text>
              {codeBlock('cd deployment-scripts')}
              <Text size="xs" c="dimmed" mt={4}>Works in both bash and PowerShell.</Text>
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Verify your AWS credentials"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>Confirm identity and active session:</Text>
              {codeBlock('aws sts get-caller-identity --profile uo-innovation')}
              <Text size="sm" c="dimmed" mt={8}>
                You should see your account ID and ARN. If you see an error, log in first:
              </Text>
              {codeBlock('aws sso login --profile uo-innovation')}
            </Box>
          }
          icon={<IconCircleCheck size={16} />}
        />

        <Stepper.Step
          label="Upload patient data to DynamoDB"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                Run the population script pointing at the generated patient JSON file:
              </Text>
              <DualCodeBlock
                bash={['python populate-healthcare-data.py \\', '  --json-file ../module-5-synthetic-data/datasets/patient-health/synthetic_patients.json \\', '  --type patient \\', '  --profile uo-innovation'].join('\n')}
                ps={['python populate-healthcare-data.py `', '  --json-file ../module-5-synthetic-data/datasets/patient-health/synthetic_patients.json `', '  --type patient `', '  --profile uo-innovation'].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                The script writes all records in batches to the DynamoDB tables. Watch for
                output lines like <Code>✓ Wrote 100 patients</Code>.
              </Text>
            </Box>
          }
          icon={<IconDatabase size={16} />}
        />

        <Stepper.Step
          label="Upload dental data"
          description={
            <Box mt={4} mb="md">
              <DualCodeBlock
                bash={['python populate-healthcare-data.py \\', '  --json-file ../module-5-synthetic-data/datasets/dental-records/synthetic_dental_visits.json \\', '  --type dental \\', '  --profile uo-innovation'].join('\n')}
                ps={['python populate-healthcare-data.py `', '  --json-file ../module-5-synthetic-data/datasets/dental-records/synthetic_dental_visits.json `', '  --type dental `', '  --profile uo-innovation'].join('\n')}
              />
            </Box>
          }
          icon={<IconDatabase size={16} />}
        />

        <Stepper.Step
          label="Verify records in DynamoDB"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>Scan the patients table to confirm data is present:</Text>
              <DualCodeBlock
                bash={['aws dynamodb scan \\', '  --table-name healthcare-patients \\', '  --select COUNT \\', '  --profile uo-innovation'].join('\n')}
                ps={['aws dynamodb scan `', '  --table-name healthcare-patients `', '  --select COUNT `', '  --profile uo-innovation'].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                <Code>Count</Code> in the response should match the number of records generated in Phase 1.
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
            <Text fw={600} size="sm">Phase 2 complete when:</Text>
            <Text size="sm" c="dimmed">
              The DynamoDB scan on <Code>healthcare-patients</Code> returns a Count ≥ 50.
            </Text>
          </Box>
        </Group>
      </Paper>
    </Box>
  );
}
