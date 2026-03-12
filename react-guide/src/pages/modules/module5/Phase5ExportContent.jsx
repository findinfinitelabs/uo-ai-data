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
  IconCloud,
  IconInfoCircle,
  IconAlertTriangle,
  IconRocket,
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

export default function Phase5ExportContent() {
  return (
    <Box>
      <Group mb="md" gap="sm">
        <Badge color="green" size="lg" variant="filled">Phase 5 of 6</Badge>
        <Badge color="gray" size="lg" variant="light">Export & Load into Ollama</Badge>
      </Group>

      <Text size="lg" c="dimmed" mb="xl">
        Ollama serves models in the GGUF format. In this phase you will merge your LoRA adapters
        into the base model, export to GGUF, copy the file into the running Ollama pod on EKS,
        and register it as a named model that students can query.
      </Text>

      <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
        <Text size="sm">
          <strong>GGUF</strong> (GPT-Generated Unified Format) is Ollama's native model format.
          It bundles weights, tokenizer, and metadata into a single portable file.
        </Text>
      </Alert>

      <Alert icon={<IconAlertTriangle size={16} />} color="yellow" mb="xl">
        <Text size="sm">
          <strong>Prerequisites:</strong> The Ollama pod must be running on EKS (deployed in
          Module 4). Check with: <Code>kubectl get pods -n ollama</Code>
        </Text>
      </Alert>

      <Title order={3} mb="md">Steps</Title>

      <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light" mb="md">
        <Group gap={6}>
          <Text size="sm" fw={600}>Working directory:</Text>
          <Code>uo-ai-data/module-6-llm-training/</Code>
        </Group>
        <Text size="xs" c="dimmed" mt={4}>kubectl commands work from any directory as long as your kubeconfig is set. The export script and Modelfile live in this folder.</Text>
      </Alert>

      <Stepper orientation="vertical" active={-1}>
        <Stepper.Step
          label="Export the fine-tuned model to GGUF"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                Merge LoRA adapters with the base model and convert to GGUF format:
              </Text>
              <DualCodeBlock
                bash={['python scripts/export_model.py \\', '  --adapter models/healthcare-lora \\', '  --format gguf \\', '  --output models/healthcare-model.gguf'].join('\n')}
                ps={['python scripts/export_model.py `', '  --adapter models/healthcare-lora `', '  --format gguf `', '  --output models/healthcare-model.gguf'].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                This produces <Code>models/healthcare-model.gguf</Code> (~1–2 GB depending on
                quantisation). Uses Q4_K_M quantisation by default for a good quality/size balance.
              </Text>
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Copy the GGUF file into the Ollama pod"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                Get the pod name and copy the model file into it:
              </Text>
              <DualCodeBlock
                bash={['# Get pod name', "OLLAMA_POD=$(kubectl get pods -n ollama -l app=ollama -o jsonpath='{.items[0].metadata.name}')", 'echo "Pod: $OLLAMA_POD"', '', '# Copy model file into the pod', 'kubectl cp models/healthcare-model.gguf \\', '  ollama/$OLLAMA_POD:/root/.ollama/models/healthcare-model.gguf'].join('\n')}
                ps={['# Get pod name', "$OLLAMA_POD = $(kubectl get pods -n ollama -l app=ollama -o jsonpath='{.items[0].metadata.name}')", 'Write-Output "Pod: $OLLAMA_POD"', '', '# Copy model file into the pod', 'kubectl cp models/healthcare-model.gguf `', '  ollama/$OLLAMA_POD:/root/.ollama/models/healthcare-model.gguf'].join('\n')}
              />
            </Box>
          }
          icon={<IconCloud size={16} />}
        />

        <Stepper.Step
          label="Create the Modelfile"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                Create <Code>module-6-llm-training/Modelfile</Code> with this content:
              </Text>
              <Code block style={{ background: '#1a1b1e', color: '#e9ecef', fontSize: 12, borderRadius: 8, padding: '0.75rem', margin: '0.5rem 0', display: 'block', whiteSpace: 'pre' }}>
{`FROM /root/.ollama/models/healthcare-model.gguf

SYSTEM """
You are a healthcare data assistant trained on synthetic patient records.
You answer questions about patient diagnoses, medications, and dental health
in a clear and concise way. Never invent information not in your training data.
"""`}
              </Code>
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Register the model in Ollama"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                Copy the Modelfile into the pod and create the model:
              </Text>
              <DualCodeBlock
                bash={['kubectl cp module-6-llm-training/Modelfile \\', '  ollama/$OLLAMA_POD:/root/.ollama/Modelfile', '', 'kubectl exec -n ollama $OLLAMA_POD -- \\', '  ollama create healthcare-ai -f /root/.ollama/Modelfile'].join('\n')}
                ps={['kubectl cp module-6-llm-training/Modelfile `', '  ollama/$OLLAMA_POD:/root/.ollama/Modelfile', '', 'kubectl exec -n ollama $OLLAMA_POD `', '  -- ollama create healthcare-ai -f /root/.ollama/Modelfile'].join('\n')}
              />
            </Box>
          }
          icon={<IconRocket size={16} />}
        />

        <Stepper.Step
          label="Verify the model is listed"
          description={
            <Box mt={4} mb="md">
              <DualCodeBlock
                bash="kubectl exec -n ollama $OLLAMA_POD -- ollama list"
                ps="kubectl exec -n ollama $OLLAMA_POD -- ollama list"
              />
              <Text size="sm" c="dimmed" mt={8}>
                You should see <Code>healthcare-ai</Code> in the output list.
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
            <Text fw={600} size="sm">Phase 5 complete when:</Text>
            <Text size="sm" c="dimmed">
              <Code>ollama list</Code> inside the pod shows <Code>healthcare-ai</Code> as an available model.
            </Text>
          </Box>
        </Group>
      </Paper>
    </Box>
  );
}
