import React from 'react';
import { MantineProvider, AppShell, Container, Title, Text, SimpleGrid, Paper, List, ThemeIcon, Badge } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { ModuleCard } from './components/ModuleCard';
import { modules } from './data/modules';
import './index.css';

function Hero() {
  return (
    <Paper shadow="md" radius="lg" p="lg" className="hero">
      <Badge color="blue" variant="light" size="lg" mb="sm">
        UO AI Data Class
      </Badge>
      <Title order={1} mb="xs">Learn how data powers AI</Title>
      <Text size="lg" c="dimmed" mb="md">
        Start with solid specs, respect privacy, build ethically, and practice with synthetic data.
      </Text>
      <Text size="sm" c="dimmed">
        Quick analogy: the model is a chef; your prompt is the ingredient list. RAG is handing the chef a mini cookbook from your docs. Fine-tuning teaches the chef new recipes using your examples.
      </Text>
    </Paper>
  );
}

function Primer() {
  return (
    <Paper shadow="sm" radius="md" p="lg" mb="lg">
      <Title order={3} mb="sm">AI basics we use</Title>
      <List
        spacing="xs"
        size="sm"
        center
        icon={<ThemeIcon color="blue" size={20} radius="xl"><IconCircleCheck size={14} /></ThemeIcon>}
      >
        <List.Item>Inference: ask the model questions directly; no new learning happens.</List.Item>
        <List.Item>RAG: fetch supporting snippets from your data, then let the model answer grounded in those snippets.</List.Item>
        <List.Item>Fine-tuning: teach the model patterns with your examples (e.g., synthetic clinical notes to answers).</List.Item>
        <List.Item>Why Module 1 matters: clear schemas and quality rules make prompts, RAG docs, and fine-tune datasets consistent and safe.</List.Item>
      </List>
    </Paper>
  );
}

function Models() {
  return (
    <Paper shadow="sm" radius="md" p="lg" mb="lg">
      <Title order={3} mb="sm">Models to try (Mac-friendly & downloadable)</Title>
      <List
        spacing="xs"
        size="sm"
        center
        icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={14} /></ThemeIcon>}
      >
        <List.Item>Mistral 7B Instruct — strong general baseline; good with LoRA/QLoRA.</List.Item>
        <List.Item>Phi-3 Mini 3.8B Instruct — very light; runs on modest RAM; good for structured Q&A.</List.Item>
        <List.Item>Llama 3 8B Instruct — widely supported; good instruction-following.</List.Item>
        <List.Item>BioMistral 7B — biomedical-tuned; better with clinical terminology (use synthetic/non-PHI data).</List.Item>
        <List.Item>Meditron 7B — biomedical-focused; solid for clinical-style text; use 4–5 bit quantized builds on laptops.</List.Item>
      </List>
    </Paper>
  );
}

export default function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <AppShell padding="lg">
        <AppShell.Main>
          <Container size="lg">
            <Hero />
            <Primer />
            <Models />
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {modules.map((mod) => (
                <ModuleCard key={mod.id} {...mod} />
              ))}
            </SimpleGrid>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
