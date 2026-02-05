import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  List,
  ThemeIcon,
  Badge,
  Group,
  Box,
  Divider,
  Card,
  Button,
  Modal,
  SimpleGrid,
  Anchor,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconBrain,
  IconBook2,
  IconAdjustments,
  IconRobot,
  IconArrowRight,
  IconFileText,
  IconServer,
  IconShieldCheck,
  IconScale,
  IconDatabase,
  IconTargetArrow,
  IconLock,
  IconTestPipe,
  IconSparkles,
  IconUsers,
  IconBuildingFactory2,
  IconHeartRateMonitor,
} from '@tabler/icons-react';
import { modules } from '../data/modules';

const moduleIcons = {
  'module-1': IconFileText,
  'module-2': IconShieldCheck,
  'module-3': IconScale,
  'module-4': IconServer,
  'module-5': IconDatabase,
  'case-study': IconBuildingFactory2,
  'case-study-health': IconHeartRateMonitor,
};

function Hero() {
  return (
    <Paper shadow="md" radius="lg" p="lg" className="hero">
      <Badge color="green" variant="filled" size="lg" mb="sm" className="hero-badge">
        University of Oregon Data &amp; AI
      </Badge>
      <Title order={1} mb="xs" className="hero-title">
        Introduction
      </Title>
      <Text size="lg" mb="lg" className="hero-subtitle">
        Start with solid specs, respect privacy, build ethically, and practice with synthetic data.
      </Text>
      
      <Text size="sm" fw={600} mb="sm" c="dimmed">
        How AI Components Work Together
      </Text>
      <Group gap="xs" align="stretch" wrap="wrap">
        <Paper 
          p="sm" 
          radius="md" 
          withBorder 
          style={{ flex: '1 1 120px', minWidth: 120, borderColor: 'var(--mantine-color-green-4)', background: 'var(--mantine-color-green-0)' }}
        >
          <Group gap="xs" mb={4}>
            <ThemeIcon color="green" size="sm" radius="xl">
              <IconBrain size={12} />
            </ThemeIcon>
            <Text size="xs" fw={700} c="green">Model</Text>
          </Group>
          <Text size="xs" c="dimmed">Your AI &quot;wellness advisor&quot;</Text>
        </Paper>

        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <IconArrowRight size={16} color="var(--mantine-color-gray-5)" />
        </Box>

        <Paper 
          p="sm" 
          radius="md" 
          withBorder 
          style={{ flex: '1 1 120px', minWidth: 120, borderColor: 'var(--mantine-color-blue-4)', background: 'var(--mantine-color-blue-0)' }}
        >
          <Group gap="xs" mb={4}>
            <ThemeIcon color="blue" size="sm" radius="xl">
              <IconFileText size={12} />
            </ThemeIcon>
            <Text size="xs" fw={700} c="blue">Prompt</Text>
          </Group>
          <Text size="xs" c="dimmed">Describe your lifestyle</Text>
        </Paper>

        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <IconArrowRight size={16} color="var(--mantine-color-gray-5)" />
        </Box>

        <Paper 
          p="sm" 
          radius="md" 
          withBorder 
          style={{ flex: '1 1 120px', minWidth: 120, borderColor: 'var(--mantine-color-teal-4)', background: 'var(--mantine-color-teal-0)' }}
        >
          <Group gap="xs" mb={4}>
            <ThemeIcon color="teal" size="sm" radius="xl">
              <IconBook2 size={12} />
            </ThemeIcon>
            <Text size="xs" fw={700} c="teal">RAG</Text>
          </Group>
          <Text size="xs" c="dimmed">Pull in health profile</Text>
        </Paper>

        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <IconArrowRight size={16} color="var(--mantine-color-gray-5)" />
        </Box>

        <Paper 
          p="sm" 
          radius="md" 
          withBorder 
          style={{ flex: '1 1 120px', minWidth: 120, borderColor: 'var(--mantine-color-grape-4)', background: 'var(--mantine-color-grape-0)' }}
        >
          <Group gap="xs" mb={4}>
            <ThemeIcon color="grape" size="sm" radius="xl">
              <IconAdjustments size={12} />
            </ThemeIcon>
            <Text size="xs" fw={700} c="grape">Fine-tune</Text>
          </Group>
          <Text size="xs" c="dimmed">Learn from new data</Text>
        </Paper>
      </Group>
    </Paper>
  );
}

const aiBasics = [
  {
    id: 'inference',
    title: 'Inference',
    icon: IconBrain,
    summary: 'Ask the model questions directly; no new learning happens.',
    details: (
      <>
        <Text size="md" mb="sm">
          <Text span fw={700} c="green">Inference</Text> is the simplest way to use an AI model.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>How it works:</Text> You send a <Text span fw={600} c="dark">prompt</Text> (question or instruction), and the model generates a response based on its pre-trained knowledge.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Key point:</Text> The model does <Text span fw={600} c="red.6">not</Text> learn or remember anything from your conversation—each request is independent.
        </Text>
        <Text size="md" c="dimmed">
          <Text span fw={600}>Best for:</Text> General Q&A, text generation, and quick tasks.
        </Text>
      </>
    ),
  },
  {
    id: 'rag',
    title: 'RAG (Retrieval-Augmented Generation)',
    icon: IconBook2,
    summary: 'Fetch supporting snippets from your data, then let the model answer grounded in those snippets.',
    details: (
      <>
        <Text size="md" mb="sm">
          <Text span fw={700} c="green">RAG</Text> combines search with generation for more accurate answers.
        </Text>
        <Text size="md" mb="sm" fw={600}>How it works:</Text>
        <List size="sm" mb="sm" withPadding>
          <List.Item><Text span fw={600}>Step 1:</Text> Your system retrieves relevant documents or snippets from a knowledge base</List.Item>
          <List.Item><Text span fw={600}>Step 2:</Text> The model uses those snippets as context to generate a grounded answer</List.Item>
        </List>
        <Text size="md" mb="sm">
          <Text span fw={600} c="green">Benefits:</Text> Reduces hallucinations and lets the model work with <Text span fw={600}>up-to-date</Text> or <Text span fw={600}>domain-specific</Text> information it was never trained on.
        </Text>
        <Text size="md" c="dimmed">
          <Text span fw={600}>Example:</Text> Clinical guidelines, internal documentation, or your own research papers.
        </Text>
      </>
    ),
  },
  {
    id: 'fine-tuning',
    title: 'Fine-Tuning',
    icon: IconAdjustments,
    summary: 'Teach the model patterns with your examples (e.g., synthetic clinical notes to answers).',
    details: (
      <>
        <Text size="md" mb="sm">
          <Text span fw={700} c="green">Fine-tuning</Text> adapts a pre-trained model to your specific task by training it on your own dataset.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Example:</Text> Fine-tune a model on pairs of clinical notes and structured summaries so it learns your formatting and terminology.
        </Text>
        <Text size="md" mb="sm" fw={600}>Trade-offs:</Text>
        <List size="sm" mb="sm" withPadding>
          <List.Item><Text span c="green">✓</Text> Significantly improves accuracy for specialized tasks</List.Item>
          <List.Item><Text span c="orange">⚠</Text> Requires more effort and compute resources</List.Item>
        </List>
        <Text size="md" c="red.7" fw={600}>
          ⚠ Always use synthetic or de-identified data to avoid privacy issues.
        </Text>
      </>
    ),
  },
  {
    id: 'action-models',
    title: 'Small vs Large Action Models',
    icon: IconRobot,
    summary: 'Choose between lightweight local models and powerful cloud-hosted models.',
    details: (
      <>
        <Text size="lg" fw={700} c="green" mb="xs">Small Action Models (SAMs)</Text>
        <Text size="md" mb="sm">
          Compact models (<Text span fw={600}>1–7B parameters</Text>) that run locally on your laptop or edge device.
        </Text>
        <List size="sm" mb="md" withPadding>
          <List.Item><Text span c="green">✓</Text> <Text span fw={600}>Privacy:</Text> Data stays on your device</List.Item>
          <List.Item><Text span c="green">✓</Text> <Text span fw={600}>Low latency:</Text> No network round-trip</List.Item>
          <List.Item><Text span c="green">✓</Text> <Text span fw={600}>No API costs:</Text> Run unlimited queries</List.Item>
        </List>
        <Text size="sm" c="dimmed" mb="md">Examples: Phi-3 Mini, Mistral 7B</Text>

        <Text size="lg" fw={700} c="blue" mb="xs">Large Action Models (LAMs)</Text>
        <Text size="md" mb="sm">
          Massive models (<Text span fw={600}>70B+ parameters</Text>) hosted in the cloud, like GPT-4 or Claude.
        </Text>
        <List size="sm" mb="md" withPadding>
          <List.Item><Text span c="green">✓</Text> <Text span fw={600}>Complex reasoning:</Text> Multi-step tasks</List.Item>
          <List.Item><Text span c="green">✓</Text> <Text span fw={600}>Nuanced understanding:</Text> Subtle language</List.Item>
          <List.Item><Text span c="orange">⚠</Text> Requires API calls and incurs costs</List.Item>
          <List.Item><Text span c="orange">⚠</Text> Data sent externally</List.Item>
        </List>

        <Divider my="sm" />
        <Text size="md" fw={600}>
          💡 Many production systems combine both: <Text span c="green">SAMs</Text> for quick local processing and <Text span c="blue">LAMs</Text> for complex queries.
        </Text>
      </>
    ),
  },
];

const courseObjectives = [
  {
    icon: IconTargetArrow,
    title: 'Define Clear Data Specifications',
    description: 'Learn to create precise data schemas, quality rules, and field definitions that keep AI projects consistent and reproducible.',
    percentage: 15,
    level: 'Basic',
    levelColor: 'green',
    time: '1 hr',
  },
  {
    icon: IconLock,
    title: 'Apply Privacy & Compliance Standards',
    description: 'Understand HIPAA, de-identification protocols, and data handling policies essential for healthcare AI applications.',
    percentage: 20,
    level: 'Experienced',
    levelColor: 'blue',
    time: '1.5 hrs',
  },
  {
    icon: IconScale,
    title: 'Build Ethical AI Systems',
    description: 'Evaluate bias, fairness, and transparency in AI models using structured assessment frameworks.',
    percentage: 15,
    level: 'Experienced',
    levelColor: 'blue',
    time: '1 hr',
  },
  {
    icon: IconTestPipe,
    title: 'Generate & Validate Synthetic Data',
    description: 'Create realistic synthetic datasets that preserve statistical properties while protecting patient privacy.',
    percentage: 25,
    level: 'Advanced',
    levelColor: 'grape',
    time: '2 hrs',
  },
  {
    icon: IconSparkles,
    title: 'Use AI Tools Effectively',
    description: 'Master inference, RAG, and fine-tuning techniques using both cloud APIs and local models.',
    percentage: 15,
    level: 'Basic',
    levelColor: 'green',
    time: '1.5 hrs',
  },
  {
    icon: IconUsers,
    title: 'Collaborate on Real-World Projects',
    description: 'Apply your skills to healthcare use cases with hands-on exercises and team-based challenges.',
    percentage: 10,
    level: 'Advanced',
    levelColor: 'grape',
    time: '1 hr',
  },
];

function CourseObjectives() {
  return (
    <>
      <Title order={3} mb="md" className="section-title">
        Course Objectives
      </Title>
      <Text size="md" mb="lg" c="dimmed">
        This course prepares you to lead AI initiatives in your organization. By mastering data specifications, 
        privacy compliance, and ethical AI practices, you&apos;ll gain the confidence to evaluate AI solutions, 
        communicate effectively with technical teams, and make informed decisions that drive business value 
        while protecting your organization from risk.
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="xl">
        {courseObjectives.map((obj, index) => {
          const Icon = obj.icon;
          return (
            <Paper
              key={index}
              p="lg"
              radius="md"
              withBorder
              className="objective-card"
            >
              <Group justify="space-between" align="flex-start" mb="sm">
                <ThemeIcon color="green" size={40} radius="xl" variant="light">
                  <Icon size={22} />
                </ThemeIcon>
                <Box
                  p="xs"
                  style={{
                    background: 'var(--mantine-color-green-0)',
                    borderRadius: 'var(--mantine-radius-md)',
                    minWidth: 50,
                    textAlign: 'center',
                  }}
                >
                  <Text fw={700} size="lg" c="green" lh={1}>
                    {obj.percentage}%
                  </Text>
                </Box>
              </Group>
              <Text className="objective-card-title" size="md">
                {obj.title}
              </Text>
              <Text size="sm" className="objective-card-description">
                {obj.description}
              </Text>
              <Group gap="xs" mt="auto" pt="sm">
                <Badge size="sm" color={obj.levelColor} variant="light">
                  {obj.level}
                </Badge>
                <Badge size="sm" color="gray" variant="outline">
                  ⏱ {obj.time}
                </Badge>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>
    </>
  );
}

function Primer() {
  const [opened, setOpened] = useState(null);

  const openModal = (item) => setOpened(item);
  const closeModal = () => setOpened(null);

  return (
    <>
      <Modal
        opened={opened !== null}
        onClose={closeModal}
        size="lg"
        radius="md"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        title={null}
        padding="xl"
      >
        {opened && (
          <>
            <Group gap="md" mb="lg">
              <ThemeIcon color="green" size={48} radius="xl">
                <opened.icon size={24} />
              </ThemeIcon>
              <Box>
                <Text fw={700} size="xl">
                  {opened.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {opened.summary}
                </Text>
              </Box>
            </Group>
            <Divider mb="md" />
            <Box>
              {opened.details}
            </Box>
          </>
        )}
      </Modal>

      <Title order={3} mb="md" className="section-title">
        AI Basics We Use
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="lg">
        {aiBasics.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="ai-basics-card"
            >
              <Group mb="sm">
                <ThemeIcon color="green" size={40} radius="xl">
                  <Icon size={22} />
                </ThemeIcon>
                <Text fw={600} size="lg">
                  {item.title}
                </Text>
              </Group>
              <Text size="sm" c="dimmed" className="ai-basics-card-summary">
                {item.summary}
              </Text>
              <Button
                variant="light"
                color="green"
                fullWidth
                mt="md"
                onClick={() => openModal(item)}
              >
                Learn More
              </Button>
            </Card>
          );
        })}
      </SimpleGrid>
    </>
  );
}

const modelCards = [
  {
    name: 'Mistral 7B',
    size: '7B',
    tag: 'General',
    tagColor: 'green',
    desc: 'Strong baseline; good with LoRA/QLoRA',
    link: 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2',
    overview: (
      <>
        <Text size="md" mb="sm">
          <Text span fw={700} c="green">Mistral 7B Instruct</Text> is a powerful general-purpose language model from Mistral AI.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Why it&apos;s great for learning:</Text> It strikes an excellent balance between capability and resource requirements, making it ideal for experimenting with fine-tuning techniques like <Text span fw={600}>LoRA</Text> and <Text span fw={600}>QLoRA</Text>.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Best for:</Text> General Q&amp;A, text generation, code assistance, and as a foundation for domain-specific fine-tuning.
        </Text>
        <Text size="sm" c="dimmed">
          Runs well on MacBooks with 16GB+ RAM using 4-bit quantization.
        </Text>
      </>
    ),
  },
  {
    name: 'Phi-3 Mini',
    size: '3.8B',
    tag: 'Lightweight',
    tagColor: 'blue',
    desc: 'Very light; runs on modest RAM',
    link: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct',
    overview: (
      <>
        <Text size="md" mb="sm">
          <Text span fw={700} c="blue">Phi-3 Mini</Text> is Microsoft&apos;s compact yet surprisingly capable model.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Why it&apos;s great for learning:</Text> With only 3.8B parameters, it runs on machines with <Text span fw={600}>8GB RAM</Text> or less. Perfect for students without high-end hardware.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Best for:</Text> Structured Q&amp;A, reasoning tasks, and educational exercises where speed matters more than maximum capability.
        </Text>
        <Text size="sm" c="dimmed">
          Excellent for rapid prototyping and testing prompts before scaling up.
        </Text>
      </>
    ),
  },
  {
    name: 'Llama 3',
    size: '8B',
    tag: 'Popular',
    tagColor: 'grape',
    desc: 'Widely supported; good instruction-following',
    link: 'https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct',
    overview: (
      <>
        <Text size="md" mb="sm">
          <Text span fw={700} c="grape">Llama 3 8B</Text> is Meta&apos;s latest open-source model with broad community support.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Why it&apos;s great for learning:</Text> The large ecosystem means tons of tutorials, tools, and community resources. Many frameworks have first-class Llama 3 support.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Best for:</Text> Instruction-following, conversational AI, and projects where you want maximum compatibility with existing tools.
        </Text>
        <Text size="sm" c="dimmed">
          Works great with Ollama, llama.cpp, and most popular inference frameworks.
        </Text>
      </>
    ),
  },
  {
    name: 'BioMistral',
    size: '7B',
    tag: 'Biomedical',
    tagColor: 'teal',
    desc: 'Clinical terminology; use synthetic data',
    link: 'https://huggingface.co/BioMistral/BioMistral-7B',
    overview: (
      <>
        <Text size="md" mb="sm">
          <Text span fw={700} c="teal">BioMistral</Text> is a biomedical-tuned version of Mistral, trained on medical literature.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Why it&apos;s great for learning:</Text> Understands clinical terminology, medical concepts, and healthcare workflows out of the box—no fine-tuning needed for basic medical NLP tasks.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Best for:</Text> Medical text processing, clinical note analysis, and healthcare-related AI projects.
        </Text>
        <Text size="sm" c="red.6" fw={600}>
          ⚠ Always use synthetic or de-identified data—never real patient information.
        </Text>
      </>
    ),
  },
  {
    name: 'Meditron',
    size: '7B',
    tag: 'Clinical',
    tagColor: 'cyan',
    desc: 'Clinical text; use 4-5 bit quantized',
    link: 'https://huggingface.co/epfl-llm/meditron-7b',
    overview: (
      <>
        <Text size="md" mb="sm">
          <Text span fw={700} c="cyan">Meditron</Text> from EPFL is specifically designed for clinical and medical applications.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Why it&apos;s great for learning:</Text> Built on Llama 2 and fine-tuned on curated medical data, it excels at clinical-style text generation and medical reasoning.
        </Text>
        <Text size="md" mb="sm">
          <Text span fw={600}>Best for:</Text> Clinical documentation, medical Q&A, and healthcare AI research projects.
        </Text>
        <Text size="sm" c="dimmed">
          Use 4-5 bit quantized versions for laptop deployment. Pairs well with RAG for medical knowledge retrieval.
        </Text>
      </>
    ),
  },
];

function Models() {
  const [openedModel, setOpenedModel] = useState(null);

  return (
    <>
      <Modal
        opened={openedModel !== null}
        onClose={() => setOpenedModel(null)}
        size="lg"
        radius="md"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        title={null}
        padding="xl"
      >
        {openedModel && (
          <>
            <Group gap="md" mb="lg">
              <Badge size="lg" variant="light" color={openedModel.tagColor}>
                {openedModel.tag}
              </Badge>
              <Box>
                <Text fw={700} size="xl">
                  {openedModel.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {openedModel.size} parameters
                </Text>
              </Box>
            </Group>
            <Divider mb="md" />
            <Box mb="lg">
              {openedModel.overview}
            </Box>
            <Button
              component="a"
              href={openedModel.link}
              target="_blank"
              variant="light"
              color="green"
              fullWidth
            >
              View Model Specs on Hugging Face →
            </Button>
          </>
        )}
      </Modal>

      <Title order={3} mb="md" className="section-title">
        Models to Try
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Mac-friendly & downloadable — great for local experimentation
      </Text>
      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="sm" mb="lg">
        {modelCards.map((model) => (
          <Card
            key={model.name}
            shadow="xs"
            padding="sm"
            radius="md"
            withBorder
            className="model-card"
          >
            <Group gap="xs" mb={4}>
              <Text fw={600} size="sm">
                {model.name}
              </Text>
              <Badge size="xs" variant="light" color={model.tagColor}>
                {model.tag}
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" className="model-card-desc">
              {model.desc}
            </Text>
            <Group gap="xs" mt="auto" pt="xs">
              <Badge size="xs" variant="outline" color="gray">
                {model.size}
              </Badge>
              <Anchor
                size="xs"
                component="button"
                onClick={() => setOpenedModel(model)}
              >
                Learn More
              </Anchor>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}

function ModuleCards() {
  return (
    <>
      <Title order={3} mb="md" className="section-title" style={{ borderColor: 'var(--mantine-color-blue-6)', color: 'var(--mantine-color-blue-7)' }}>
        Course Modules
      </Title>
      <Text size="md" mb="lg" c="dimmed">
        Each module features interactive study materials, hands-on exercises, quizzes, and dynamic learning 
        experiences designed to reinforce concepts through practice. You&apos;ll work through puzzles, build 
        real specifications, and apply your knowledge to realistic healthcare scenarios—all at your own pace 
        with immediate feedback to accelerate your learning.
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="lg">
        {modules.map((mod) => {
          const Icon = moduleIcons[mod.id];
          const isCaseStudy = mod.isCaseStudy;
          const themeColor = isCaseStudy ? 'green' : 'blue';
          return (
            <Card
              key={mod.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              className="ai-basics-card"
              style={{ 
                borderLeftColor: isCaseStudy ? 'var(--uo-green)' : 'var(--mantine-color-blue-4)', 
                borderLeftWidth: 3 
              }}
            >
              <Group mb="sm">
                <ThemeIcon color={themeColor} size={40} radius="xl">
                  <Icon size={22} />
                </ThemeIcon>
                <Box>
                  {!isCaseStudy && (
                    <Badge size="xs" color={themeColor} variant="light" mb={4}>
                      {mod.id.replace('-', ' ').toUpperCase()}
                    </Badge>
                  )}
                  <Text fw={600} size="md" lh={1.2}>
                    {mod.title}
                  </Text>
                </Box>
              </Group>
              <Text size="sm" c="dimmed" className="ai-basics-card-summary">
                {mod.summary}
              </Text>
              <Button
                component={Link}
                to={`/${mod.id}`}
                variant="light"
                color={themeColor}
                fullWidth
                mt="md"
                rightSection={<IconArrowRight size={16} />}
              >
                {isCaseStudy ? 'View Case Study' : 'Explore Module'}
              </Button>
            </Card>
          );
        })}
      </SimpleGrid>
    </>
  );
}

export default function HomePage() {
  return (
    <Container size="lg">
      <Hero />
      <Divider my="xl" />
      <CourseObjectives />
      <Divider my="xl" />
      <ModuleCards />
      <Divider my="xl" />
      <Primer />
      <Divider my="xl" />
      <Models />
    </Container>
  );
}
