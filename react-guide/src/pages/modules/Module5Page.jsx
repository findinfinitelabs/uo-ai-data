import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  ThemeIcon,
  Badge,
  Group,
  Box,
  Divider,
  Button,
  SimpleGrid,
  Card,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconDatabase,
  IconCloudUpload,
  IconFileText,
  IconBrain,
  IconRocket,
  IconRobot,
  IconCircleCheck,
  IconChartBar,
} from '@tabler/icons-react';
import {
  Phase1GenerateContent,
  Phase2UploadContent,
  Phase3PrepareContent,
  Phase4TrainContent,
  Phase5ExportContent,
  Phase6QueryContent,
} from './module5';

// ─── Phase configuration ───────────────────────────────────────────────────────
const phases = [
  {
    id: 'generate',
    label: 'Phase 1',
    title: 'Generate Synthetic Data',
    subtitle: 'Create realistic patient and dental records without real PHI',
    icon: IconDatabase,
    color: 'green',
    content: <Phase1GenerateContent />,
  },
  {
    id: 'upload',
    label: 'Phase 2',
    title: 'Upload to DynamoDB',
    subtitle: 'Load the generated records into AWS DynamoDB tables',
    icon: IconCloudUpload,
    color: 'teal',
    content: <Phase2UploadContent />,
  },
  {
    id: 'prepare',
    label: 'Phase 3',
    title: 'Prepare Training Data',
    subtitle: 'Convert database records into Mistral instruction-format JSONL',
    icon: IconFileText,
    color: 'blue',
    content: <Phase3PrepareContent />,
  },
  {
    id: 'train',
    label: 'Phase 4',
    title: 'Fine-tune the Model',
    subtitle: 'LoRA fine-tune StableLM 1.6B on the healthcare dataset',
    icon: IconBrain,
    color: 'violet',
    content: <Phase4TrainContent />,
  },
  {
    id: 'export',
    label: 'Phase 5',
    title: 'Export & Load into Ollama',
    subtitle: 'Convert to GGUF and register the model in the Ollama pod',
    icon: IconRocket,
    color: 'orange',
    content: <Phase5ExportContent />,
  },
  {
    id: 'query',
    label: 'Phase 6',
    title: 'Query & Validate',
    subtitle: 'Test the live model with real healthcare questions',
    icon: IconRobot,
    color: 'red',
    content: <Phase6QueryContent />,
  },
];

// ─── Overview (index) page ──────────────────────────────────────────────────────
function OverviewPage() {
  return (
    <Container size="lg" py="xl">
      <Box mb="xl">
        <Group gap="sm" mb="xs">
          <ThemeIcon size={48} radius="xl" color="green">
            <IconDatabase size={26} />
          </ThemeIcon>
          <Box>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Module 5</Text>
            <Title order={1} size="h2">Synthetic Data → AI Training Pipeline</Title>
          </Box>
        </Group>
        <Text size="lg" c="dimmed" mt="sm">
          In this module you will build a complete end-to-end AI pipeline: generate synthetic
          healthcare records, upload them to DynamoDB, fine-tune a language model on that data,
          deploy it to Ollama on EKS, and query it with real healthcare questions.
        </Text>
      </Box>

      <Divider mb="xl" />

      <Title order={3} mb="md">Pipeline overview</Title>
      <Text size="sm" c="dimmed" mb="xl">
        Work through the six phases in order. Each phase builds on the previous one — you must
        complete Phase 1 before starting Phase 2, and so on.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="xl">
        {phases.map((phase, idx) => {
          const Icon = phase.icon;
          return (
            <Card
              key={phase.id}
              component={Link}
              to={`/module-5/${phase.id}`}
              withBorder
              padding="lg"
              radius="md"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
            >
              <Group gap="sm" mb="sm">
                <ThemeIcon size={36} radius="xl" color={phase.color} variant="light">
                  <Icon size={20} />
                </ThemeIcon>
                <Badge color={phase.color} variant="light" size="sm">{phase.label}</Badge>
              </Group>
              <Text fw={700} size="sm" mb={4}>{phase.title}</Text>
              <Text size="xs" c="dimmed">{phase.subtitle}</Text>
            </Card>
          );
        })}
      </SimpleGrid>

      <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-green-0)">
        <Group gap="sm" align="flex-start">
          <ThemeIcon color="green" size={28} radius="xl"><IconChartBar size={16} /></ThemeIcon>
          <Box>
            <Text fw={700} mb={4}>What you will build</Text>
            <Text size="sm" c="dimmed">
              A fully functional healthcare AI assistant that can answer clinical questions
              about diagnoses, medications, and dental records — trained entirely on synthetic
              data and running on AWS infrastructure you deployed in Module 4.
            </Text>
          </Box>
        </Group>
      </Paper>
    </Container>
  );
}

// ─── Individual phase page ───────────────────────────────────────────────────────
function PhasePage({ phase, phaseIndex }) {
  const prevPhase = phaseIndex > 0 ? phases[phaseIndex - 1] : null;
  const nextPhase = phaseIndex < phases.length - 1 ? phases[phaseIndex + 1] : null;

  return (
    <Container size="lg" py="xl">
      {/* Breadcrumb */}
      <Breadcrumbs mb="lg" separator="›">
        <Anchor component={Link} to="/module-5" size="sm">Module 5</Anchor>
        <Text size="sm" c="dimmed">{phase.title}</Text>
      </Breadcrumbs>

      {/* Phase content */}
      {phase.content}

      {/* Navigation */}
      <Divider my="xl" />
      <Group justify="space-between">
        {prevPhase ? (
          <Button
            component={Link}
            to={`/module-5/${prevPhase.id}`}
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
          >
            ← {prevPhase.label}: {prevPhase.title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/module-5"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to overview
          </Button>
        )}
        {nextPhase ? (
          <Button
            component={Link}
            to={`/module-5/${nextPhase.id}`}
            color="green"
            rightSection={<IconArrowRight size={16} />}
          >
            {nextPhase.label}: {nextPhase.title} →
          </Button>
        ) : (
          <Button
            component={Link}
            to="/module-5"
            variant="light"
            color="green"
            rightSection={<IconCircleCheck size={16} />}
          >
            All phases complete!
          </Button>
        )}
      </Group>
    </Container>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────────
export default function Module5Page() {
  const { subPage } = useParams();

  if (!subPage) {
    return <OverviewPage />;
  }

  const phaseIndex = phases.findIndex((p) => p.id === subPage);
  if (phaseIndex === -1) {
    return <OverviewPage />;
  }

  return <PhasePage phase={phases[phaseIndex]} phaseIndex={phaseIndex} />;
}
