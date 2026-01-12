import React from 'react';
import {
  MantineProvider,
  AppShell,
  Container,
  Title,
  Text,
  Paper,
  List,
  ThemeIcon,
  Badge,
  NavLink,
  Group,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconFileText,
  IconShieldCheck,
  IconScale,
  IconDatabase,
} from '@tabler/icons-react';
import { modules } from './data/modules';
import './index.css';

function Hero() {
  return (
    <Paper shadow="md" radius="lg" p="lg" className="hero">
      <Badge color="green" variant="filled" size="lg" mb="sm" style={{ color: '#FEE11A' }}>
        UO AI Data Class
      </Badge>
      <Title order={1} mb="xs" style={{ color: '#007030' }}>
        Learn how data powers AI
      </Title>
      <Text size="lg" mb="md" style={{ color: '#004F6E' }}>
        Start with solid specs, respect privacy, build ethically, and practice with synthetic data.
      </Text>
      <Text size="sm" style={{ color: '#104735' }}>
        Quick analogy: the model is a chef; your prompt is the ingredient list. RAG is handing the
        chef a mini cookbook from your docs. Fine-tuning teaches the chef new recipes using your
        examples.
      </Text>
    </Paper>
  );
}

function Primer() {
  return (
    <Paper shadow="sm" radius="md" p="lg" mb="lg">
      <Title order={3} mb="sm" style={{ color: '#007030' }}>
        AI basics we use
      </Title>
      <List
        spacing="xs"
        size="sm"
        center
        icon={
          <ThemeIcon color="green" size={20} radius="xl">
            <IconCircleCheck size={14} />
          </ThemeIcon>
        }
      >
        <List.Item>Inference: ask the model questions directly; no new learning happens.</List.Item>
        <List.Item>
          RAG: fetch supporting snippets from your data, then let the model answer grounded in those
          snippets.
        </List.Item>
        <List.Item>
          Fine-tuning: teach the model patterns with your examples (e.g., synthetic clinical notes
          to answers).
        </List.Item>
        <List.Item>
          Why Module 1 matters: clear schemas and quality rules make prompts, RAG docs, and
          fine-tune datasets consistent and safe.
        </List.Item>
      </List>
    </Paper>
  );
}

function Models() {
  return (
    <Paper shadow="sm" radius="md" p="lg" mb="lg">
      <Title order={3} mb="sm" style={{ color: '#007030' }}>
        Models to try (Mac-friendly & downloadable)
      </Title>
      <List
        spacing="xs"
        size="sm"
        center
        icon={
          <ThemeIcon style={{ backgroundColor: '#489D46' }} size={20} radius="xl">
            <IconCircleCheck size={14} />
          </ThemeIcon>
        }
      >
        <List.Item>Mistral 7B Instruct — strong general baseline; good with LoRA/QLoRA.</List.Item>
        <List.Item>
          Phi-3 Mini 3.8B Instruct — very light; runs on modest RAM; good for structured Q&A.
        </List.Item>
        <List.Item>Llama 3 8B Instruct — widely supported; good instruction-following.</List.Item>
        <List.Item>
          BioMistral 7B — biomedical-tuned; better with clinical terminology (use synthetic/non-PHI
          data).
        </List.Item>
        <List.Item>
          Meditron 7B — biomedical-focused; solid for clinical-style text; use 4–5 bit quantized
          builds on laptops.
        </List.Item>
      </List>
    </Paper>
  );
}

const moduleIcons = {
  'module-1': IconFileText,
  'module-2': IconShieldCheck,
  'module-3': IconScale,
  'module-4': IconDatabase,
};

export default function App() {
  return (
    <MantineProvider
      theme={{
        primaryColor: 'green',
        colors: {
          green: [
            '#e6f4ed',
            '#cce9db',
            '#99d3b7',
            '#66bd93',
            '#33a76f',
            '#007030',
            '#005a26',
            '#00431d',
            '#002d13',
            '#00160a',
          ],
          yellow: [
            '#fffce6',
            '#fff9cc',
            '#fff399',
            '#ffed66',
            '#fee733',
            '#FEE11A',
            '#cbb415',
            '#988710',
            '#655a0a',
            '#322d05',
          ],
        },
      }}
    >
      <AppShell padding="md" navbar={{ width: 280, breakpoint: 'sm' }}>
        <AppShell.Navbar p="md" style={{ backgroundColor: '#007030' }}>
          <Group mb="lg">
            <Badge color="yellow" variant="filled" size="lg" style={{ color: '#007030' }}>
              UO AI Data
            </Badge>
          </Group>
          <Text size="xs" tt="uppercase" fw={700} c="yellow" mb="xs">
            Course Modules
          </Text>
          {modules.map((mod) => {
            const Icon = moduleIcons[mod.id];
            return (
              <NavLink
                key={mod.id}
                label={mod.title}
                component="a"
                href={mod.href}
                target="_blank"
                leftSection={<Icon size={20} stroke={1.5} />}
                mb="xs"
                style={{
                  color: '#FEE11A',
                  borderRadius: 8,
                }}
                styles={{
                  root: {
                    '&:hover': {
                      backgroundColor: 'rgba(254, 225, 26, 0.1)',
                    },
                  },
                }}
              />
            );
          })}
        </AppShell.Navbar>
        <AppShell.Main>
          <Container size="lg">
            <Hero />
            <Primer />
            <Models />
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
