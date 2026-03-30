import React from 'react';
import {
  Title,
  Text,
  Paper,
  Box,
  Code,
  Badge,
  Group,
  ThemeIcon,
  Alert,
  Stepper,
  Divider,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconTerminal2,
  IconInfoCircle,
  IconAlertTriangle,
  IconFileText,
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

export default function Phase3PrepareContent() {
  return (
    <Box>
      <Group mb="md" gap="sm">
        <Badge color="green" size="lg" variant="filled">Phase 3 of 6</Badge>
        <Badge color="gray" size="lg" variant="light">Prepare Training Data</Badge>
      </Group>

      <Text size="lg" c="dimmed" mb="xl">
        Language models learn from question-and-answer pairs, not raw database records. In this
        phase you will run a preparation script that reads your DynamoDB data and converts it
        into a structured JSONL file in the Mistral instruction format — the format the LLM
        expects during fine-tuning.
      </Text>

      <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
        <Text size="sm">
          <strong>Mistral instruction format</strong> wraps each example as:
          <Code style={{ display: 'block', marginTop: 6 }}>
            {'<s>[INST] Question or prompt [/INST] Expected answer </s>'}
          </Code>
        </Text>
      </Alert>

      <Alert icon={<IconAlertTriangle size={16} />} color="yellow" mb="xl">
        <Text size="sm">
          <strong>Prerequisites:</strong> Phase 2 must be complete — data must exist in DynamoDB
          before the prepare script can pull it.
        </Text>
      </Alert>

      <Title order={3} mb="md">Steps</Title>

      <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light" mb="md">
        <Group gap={6}>
          <Text size="sm" fw={600}>Working directory:</Text>
          <Code>uo-ai-data/module-6-llm-training/</Code>
        </Group>
        <Text size="xs" c="dimmed" mt={4}>Step 1 navigates you here. All training scripts are in <Code>scripts/</Code> and config in <Code>configs/</Code> inside this folder.</Text>
      </Alert>

      <Stepper orientation="vertical" active={-1}>
        <Stepper.Step
          label="Navigate to the training scripts folder"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>From the <Code>uo-ai-data/</Code> project root:</Text>
              {codeBlock('cd module-6-llm-training')}
              <Text size="xs" c="dimmed" mt={4}>Works in both bash and PowerShell.</Text>
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Install Python dependencies"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                Install the packages needed for data preparation and model training:
              </Text>
              {codeBlock('pip install -r requirements.txt')}
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Run the data preparation script"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                This reads from DynamoDB and writes a JSONL training file:
              </Text>
              <DualCodeBlock
                bash={['python scripts/prepare_data.py \\', '  --source dynamodb \\', '  --profile uo-innovation \\', '  --output-dir data/processed'].join('\n')}
                ps={['python scripts/prepare_data.py `', '  --source dynamodb `', '  --profile uo-innovation `', '  --output-dir data/processed'].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                The script queries DynamoDB and generates instruction pairs, saving two files:
              </Text>
              <Code block style={{ background: '#1a1b1e', color: '#e9ecef', fontSize: 12, borderRadius: 8, padding: '0.75rem', margin: '0.5rem 0', display: 'block', whiteSpace: 'pre-wrap' }}>
{`{"text": "<s>[INST] What medications is patient P001 taking? [/INST]
Patient P001 is prescribed Metformin 500mg twice daily and Lisinopril 10mg once daily. </s>"}`}
              </Code>
            </Box>
          }
          icon={<IconFileText size={16} />}
        />

        <Stepper.Step
          label="Inspect the training file"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>Count lines in the training file:</Text>
              <DualCodeBlock
                bash={['wc -l data/processed/train.jsonl', 'head -n 2 data/processed/train.jsonl'].join('\n')}
                ps={['(Get-Content data/processed/train.jsonl).Count', 'Get-Content data/processed/train.jsonl | Select-Object -First 2'].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                You should see at least 200 lines (instruction pairs) for a useful fine-tune.
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
            <Text fw={600} size="sm">Phase 3 complete when:</Text>
            <Text size="sm" c="dimmed">
              <Code>data/processed/train.jsonl</Code> exists and contains at least 200 lines.
            </Text>
          </Box>
        </Group>
      </Paper>
    </Box>
  );
}
