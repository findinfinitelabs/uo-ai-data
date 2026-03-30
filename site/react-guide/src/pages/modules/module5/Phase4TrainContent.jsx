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
  List,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconTerminal2,
  IconBrain,
  IconInfoCircle,
  IconAlertTriangle,
  IconClock,
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

export default function Phase4TrainContent() {
  return (
    <Box>
      <Group mb="md" gap="sm">
        <Badge color="green" size="lg" variant="filled">Phase 4 of 6</Badge>
        <Badge color="gray" size="lg" variant="light">Fine-tune the Model</Badge>
      </Group>

      <Text size="lg" c="dimmed" mb="xl">
        With the JSONL training file ready, you will fine-tune <strong>TinyLlama 1.1B</strong>
        using LoRA (Low-Rank Adaptation). LoRA freezes the base model weights and trains only
        small adapter layers, making fine-tuning feasible on any Windows or macOS laptop CPU.
      </Text>

      <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
        <Text size="sm">
          <strong>Why TinyLlama 1.1B?</strong> It is Apache 2.0 licensed, requires no Hugging
          Face account or gated access approval, and at 1.1B parameters is small enough to
          run and fine-tune on a standard Windows laptop CPU in under 90 minutes.
        </Text>
      </Alert>

      <Alert icon={<IconClock size={16} />} color="orange" mb="xl">
        <Text size="sm">
          <strong>Training time estimate:</strong> CPU-only: ~30–90 minutes for 3 epochs on
          100 patients (varies by CPU). No GPU required.
        </Text>
      </Alert>

      <Title order={3} mb="md">What LoRA trains</Title>
      <Paper withBorder p="md" mb="xl" radius="md">
        <List spacing="sm" size="sm">
          <List.Item>Rank-8 adapter matrices injected into the attention layers</List.Item>
          <List.Item>Alpha 16 scaling — balances adapter influence vs base model knowledge</List.Item>
          <List.Item>Dropout 0.05 — light regularisation to avoid overfitting 100 synthetic records</List.Item>
          <List.Item>Target modules: <Code>q_proj</Code>, <Code>v_proj</Code>, <Code>k_proj</Code>, <Code>o_proj</Code></List.Item>
        </List>
      </Paper>

      <Title order={3} mb="md">Steps</Title>

      <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light" mb="md">
        <Group gap={6}>
          <Text size="sm" fw={600}>Working directory:</Text>
          <Code>uo-ai-data/module-6-llm-training/</Code>
        </Group>
        <Text size="xs" c="dimmed" mt={4}>All commands below run from this folder. Navigate here first: <Code>cd module-6-llm-training</Code> from the project root.</Text>
      </Alert>

      <Stepper orientation="vertical" active={-1}>
        <Stepper.Step
          label="Review the training config"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                Open <Code>configs/lora_config.yaml</Code> to see LoRA hyperparameters. Defaults
                work well for this dataset — no changes needed for your first run.
              </Text>
              <DualCodeBlock
                bash="cat configs/lora_config.yaml"
                ps="Get-Content configs/lora_config.yaml"
              />
            </Box>
          }
          icon={<IconInfoCircle size={16} />}
        />

        <Stepper.Step
          label="Download the base model"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                The training script auto-downloads StableLM 1.6B on first run, but you can
                pre-fetch it to avoid timeout issues:
              </Text>
              {codeBlock('python scripts/download_model.py')}
              <Text size="sm" c="dimmed" mt={8}>
                Model is cached in <Code>~/.cache/huggingface/</Code> (~2.2 GB).
              </Text>
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Start fine-tuning"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                Run the training script with your prepared JSONL file:
              </Text>
              <DualCodeBlock
                bash={['python scripts/train.py \\', '  --config configs/lora_config.yaml \\', '  --data data/processed/train.jsonl \\', '  --output models/healthcare-lora'].join('\n')}
                ps={['python scripts/train.py `', '  --config configs/lora_config.yaml `', '  --data data/processed/train.jsonl `', '  --output models/healthcare-lora'].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                Watch for <Code>loss</Code> in the training logs — it should decrease each epoch.
                A final loss below 1.2 indicates the model has learned from the data.
              </Text>
            </Box>
          }
          icon={<IconBrain size={16} />}
        />

        <Stepper.Step
          label="Verify the checkpoint"
          description={
            <Box mt={4} mb="md">
              <DualCodeBlock
                bash="ls models/healthcare-lora/"
                ps="Get-ChildItem models/healthcare-lora/"
              />
              <Text size="sm" c="dimmed" mt={8}>
                You should see <Code>adapter_config.json</Code>, <Code>adapter_model.safetensors</Code>,
                and <Code>tokenizer.json</Code>.
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
            <Text fw={600} size="sm">Phase 4 complete when:</Text>
            <Text size="sm" c="dimmed">
              <Code>models/healthcare-lora/adapter_model.safetensors</Code> exists and
              training loss finished below 1.5.
            </Text>
          </Box>
        </Group>
      </Paper>
    </Box>
  );
}
