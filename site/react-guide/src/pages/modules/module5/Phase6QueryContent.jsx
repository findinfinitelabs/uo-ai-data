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
  IconRobot,
  IconInfoCircle,
  IconTrophy,
  IconBulb,
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

const exampleQueries = [
  'What medications is patient P001 currently prescribed?',
  'List all patients with a Type 2 diabetes diagnosis.',
  'Which patients have a penicillin allergy?',
  'What dental procedures were performed in the last 12 months?',
  'Summarize the health profile of patient P042.',
];

export default function Phase6QueryContent() {
  return (
    <Box>
      <Group mb="md" gap="sm">
        <Badge color="green" size="lg" variant="filled">Phase 6 of 6</Badge>
        <Badge color="gray" size="lg" variant="light">Query & Validate</Badge>
      </Group>

      <Text size="lg" c="dimmed" mb="xl">
        Your fine-tuned healthcare AI model is live on Ollama. In this final phase you will
        forward the Ollama port to your local machine and query the model — first via raw curl,
        then through the healthcare AI bridge service that wraps it in a structured API.
      </Text>

      <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="xl">
        <Text size="sm">
          <strong>Two ways to query:</strong> Direct Ollama API (port 11434) for raw model
          interaction, or the healthcare-ai-bridge (port 8080) which adds query validation,
          context injection from DynamoDB, and structured JSON responses.
        </Text>
      </Alert>

      <Title order={3} mb="md">Steps</Title>

      <Alert icon={<IconInfoCircle size={16} />} color="gray" variant="light" mb="md">
        <Text size="sm" fw={600}>Working directory: any</Text>
        <Text size="xs" c="dimmed" mt={4}><Code>kubectl</Code> and <Code>curl</Code> commands work from any directory as long as your kubeconfig (<Code>~/.kube/config</Code>) is configured for the EKS cluster.</Text>
      </Alert>

      <Stepper orientation="vertical" active={-1}>
        <Stepper.Step
          label="Port-forward Ollama to localhost"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                Run this in a <strong>separate terminal</strong> and leave it open:
              </Text>
              <DualCodeBlock
                bash={["OLLAMA_POD=$(kubectl get pods -n ollama -l app=ollama -o jsonpath='{.items[0].metadata.name}')", 'kubectl port-forward -n ollama $OLLAMA_POD 11434:11434'].join('\n')}
                ps={["$OLLAMA_POD = $(kubectl get pods -n ollama -l app=ollama -o jsonpath='{.items[0].metadata.name}')", 'kubectl port-forward -n ollama $OLLAMA_POD 11434:11434'].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                You should see <Code>Forwarding from 127.0.0.1:11434</Code>.
              </Text>
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Send a test query via curl"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                In a new terminal, send your first question to the healthcare model:
              </Text>
              <DualCodeBlock
                bash={['curl http://localhost:11434/api/generate \\', "  -d '{", '    "model": "healthcare-ai",', '    "prompt": "What medications is patient P001 taking?",', '    "stream": false', "  }'" ].join('\n')}
                ps={['curl http://localhost:11434/api/generate `', "  -d '{",'    `"model`": `"healthcare-ai`",', '    `"prompt`": `"What medications is patient P001 taking?`",', '    `"stream`": false', "  }'" ].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                The response JSON will contain a <Code>"response"</Code> field with the model's answer.
              </Text>
            </Box>
          }
          icon={<IconRobot size={16} />}
        />

        <Stepper.Step
          label="Port-forward the AI bridge service"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb={4}>
                The bridge service enriches queries with live DynamoDB context and returns
                structured JSON. In another terminal:
              </Text>
              {codeBlock(`kubectl port-forward svc/healthcare-ai-bridge -n default 8080:8080`)}
            </Box>
          }
          icon={<IconTerminal2 size={16} />}
        />

        <Stepper.Step
          label="Query the bridge API"
          description={
            <Box mt={4} mb="md">
              {codeBlock(`curl http://localhost:8080/query \\
  -H "Content-Type: application/json" \\
  -d '{"question": "List all patients with hypertension"}'`)}
              <Text size="sm" c="dimmed" mt={8}>
                The bridge returns a structured response including matched patient IDs,
                the AI-generated summary, and the source data used as context.
              </Text>
            </Box>
          }
          icon={<IconRobot size={16} />}
        />

        <Stepper.Step
          label="Try these example queries"
          description={
            <Box mt={4} mb="md">
              <List spacing={4} size="sm">
                {exampleQueries.map((q) => (
                  <List.Item key={q} icon={<ThemeIcon color="blue" size={18} radius="xl"><IconBulb size={10} /></ThemeIcon>}>
                    {q}
                  </List.Item>
                ))}
              </List>
            </Box>
          }
          icon={<IconBulb size={16} />}
        />

        <Stepper.Step
          label="Validate answer quality"
          description={
            <Box mt={4} mb="md">
              <Text size="sm" c="dimmed" mb="sm">
                Check your model's responses against the source data:
              </Text>
              <DualCodeBlock
                bash={['# Verify answers against the source record', 'aws dynamodb get-item \\', '  --table-name healthcare-patients \\', "  --key '{\"patient_id\": {\"S\": \"P001\"}}' \\", '  --profile uo-innovation'].join('\n')}
                ps={['# Verify answers against the source record', 'aws dynamodb get-item `', '  --table-name healthcare-patients `', '  --key (ConvertTo-Json @{patient_id=@{S="P001"}} -Compress) `', '  --profile uo-innovation'].join('\n')}
              />
              <Text size="sm" c="dimmed" mt={8}>
                Compare the model's answer to the raw record. Good fine-tuning should produce
                answers that accurately reflect the DynamoDB data without hallucination.
              </Text>
            </Box>
          }
          icon={<IconCircleCheck size={16} />}
        />
      </Stepper>

      <Divider my="xl" />

      <Paper withBorder p="md" radius="md" bg="var(--mantine-color-green-0)">
        <Group gap="sm" align="flex-start">
          <ThemeIcon color="yellow" size={32} radius="xl" mt={2}><IconTrophy size={18} /></ThemeIcon>
          <Box>
            <Text fw={700} size="md">Module 5 complete! 🎉</Text>
            <Text size="sm" c="dimmed" mt={4}>
              You have successfully generated synthetic healthcare data, uploaded it to DynamoDB,
              fine-tuned a language model, deployed it to Ollama on EKS, and validated it with
              real queries. This is a full end-to-end AI data pipeline.
            </Text>
          </Box>
        </Group>
      </Paper>
    </Box>
  );
}
