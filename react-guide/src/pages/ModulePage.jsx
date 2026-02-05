import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Anchor,
  Breadcrumbs,
  SimpleGrid,
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconArrowLeft,
  IconCircleCheck,
  IconExternalLink,
  IconFileText,
  IconServer,
  IconShieldCheck,
  IconScale,
  IconDatabase,
} from '@tabler/icons-react';
import { modules } from '../data/modules';

// Ethical Pillars data with definitions and violation examples
const ethicalPillarsData = {
  fairness: {
    title: 'Fairness',
    icon: IconScale,
    color: 'green',
    shortDesc: 'Equal treatment across demographics',
    definition: 'Fairness in AI means ensuring that algorithmic systems do not discriminate against individuals or groups based on protected characteristics such as race, gender, age, or socioeconomic status. It requires that AI models perform equally well across different demographic groups and that outcomes are equitable.',
    violationTitle: 'Optum Algorithm Racial Bias (2019)',
    violationDesc: 'A widely-used healthcare algorithm developed by Optum was found to systematically discriminate against Black patients. The algorithm used healthcare costs as a proxy for health needs, but because Black patients historically had less access to healthcare, they incurred lower costs. As a result, Black patients had to be significantly sicker than white patients to receive the same level of care recommendations. The bias affected an estimated 200 million patients annually.',
    citation: 'Obermeyer, Z., Powers, B., Vogeli, C., & Mullainathan, S. (2019). Dissecting racial bias in an algorithm used to manage the health of populations. Science, 366(6464), 447-453.',
    citationUrl: 'https://www.science.org/doi/10.1126/science.aax2342',
  },
  transparency: {
    title: 'Transparency',
    icon: IconFileText,
    color: 'blue',
    shortDesc: 'Explainable decisions and processes',
    definition: 'Transparency in AI requires that the decision-making processes of algorithmic systems be understandable and explainable to stakeholders. This includes clear documentation of how models work, what data they use, their limitations, and how decisions are made. Patients and healthcare providers should be able to understand why an AI system made a particular recommendation.',
    violationTitle: 'IBM Watson for Oncology (2018)',
    violationDesc: 'IBM\'s Watson for Oncology was marketed globally as an AI system to recommend cancer treatments. However, investigations revealed that the system\'s recommendations were based on a small number of synthetic cases rather than real patient data, and doctors had no visibility into how recommendations were generated. In some cases, Watson suggested treatments that were unsafe or inappropriate. The lack of transparency about how the system worked led to patient safety concerns.',
    citation: 'Ross, C., & Swetlitz, I. (2018). IBM\'s Watson supercomputer recommended "unsafe and incorrect" cancer treatments, internal documents show. STAT News.',
    citationUrl: 'https://www.statnews.com/2018/07/25/ibm-watson-recommended-unsafe-incorrect-treatments/',
  },
  accountability: {
    title: 'Accountability',
    icon: IconShieldCheck,
    color: 'grape',
    shortDesc: 'Clear ownership and oversight',
    definition: 'Accountability in AI means establishing clear lines of responsibility for AI system outcomes. Organizations must be able to identify who is responsible when AI systems cause harm, implement governance structures for AI oversight, and have mechanisms for redress when things go wrong. This includes audit trails, human oversight requirements, and clear policies for when AI recommendations should be overridden.',
    violationTitle: 'Horizon Health Faulty Sepsis Algorithm (2021)',
    violationDesc: 'Epic Systems\' sepsis prediction algorithm, deployed across hundreds of hospitals, was found to miss most sepsis cases while generating many false alarms. Despite evidence of poor performance, hospitals continued using it because no clear accountability existed for monitoring AI performance. The lack of oversight meant the algorithm operated for years without proper validation, potentially contributing to preventable patient deaths.',
    citation: 'Wong, A., et al. (2021). External Validation of a Widely Implemented Proprietary Sepsis Prediction Model in Hospitalized Patients. JAMA Internal Medicine, 181(8), 1065-1070.',
    citationUrl: 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2781307',
  },
  safety: {
    title: 'Safety',
    icon: IconCircleCheck,
    color: 'teal',
    shortDesc: 'Robust testing and monitoring',
    definition: 'Safety in AI requires rigorous testing, validation, and continuous monitoring to ensure that AI systems do not cause harm. This includes pre-deployment testing across diverse populations, ongoing performance monitoring, mechanisms to detect and respond to failures, and fail-safe designs that default to human judgment in uncertain situations.',
    violationTitle: 'Babylon Health Chatbot Misdiagnosis (2020)',
    violationDesc: 'Babylon Health\'s AI-powered symptom checker app was found to provide potentially dangerous medical advice. In tests, the chatbot failed to identify serious conditions including heart attacks and meningitis, instead suggesting less urgent care. The company had marketed the app as being as accurate as doctors, but independent testing revealed significant safety gaps. The app was being used by millions of NHS patients in the UK.',
    citation: 'Fraser, H., Coiera, E., & Wong, D. (2018). Safety of patient-facing digital symptom checkers. The Lancet, 392(10161), 2263-2264.',
    citationUrl: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(18)32819-8/fulltext',
  },
};

// Ethical Pillar Card Component with Modal
function EthicalPillarCard({ pillarKey }) {
  const [opened, { open, close }] = useDisclosure(false);
  const pillar = ethicalPillarsData[pillarKey];
  const Icon = pillar.icon;

  return (
    <>
      <Modal opened={opened} onClose={close} title={pillar.title} size="lg" centered>
        <Box>
          <Group mb="md">
            <ThemeIcon color={pillar.color} size={50} radius="xl">
              <Icon size={26} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="xl">{pillar.title}</Text>
              <Badge color={pillar.color} variant="light">{pillar.shortDesc}</Badge>
            </Box>
          </Group>

          <Divider my="md" />

          <Text fw={600} size="lg" mb="xs">Definition</Text>
          <Text size="sm" mb="lg" c="dimmed">{pillar.definition}</Text>

          <Paper p="md" bg="red.0" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-red-3)' }}>
            <Badge color="red" variant="filled" mb="sm">Real-World Violation</Badge>
            <Text fw={600} size="md" mb="xs">{pillar.violationTitle}</Text>
            <Text size="sm" mb="md">{pillar.violationDesc}</Text>
            <Text size="xs" c="dimmed" fs="italic" mb="xs">
              <Text span fw={600}>Citation: </Text>
              {pillar.citation}
            </Text>
            <Anchor href={pillar.citationUrl} target="_blank" size="xs">
              View Source <IconExternalLink size={12} style={{ marginLeft: 4 }} />
            </Anchor>
          </Paper>
        </Box>
      </Modal>

      <Card 
        shadow="xs" 
        padding="md" 
        radius="md" 
        withBorder 
        onClick={open}
        style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-xs)';
        }}
      >
        <ThemeIcon color={pillar.color} size={40} radius="xl" mb="sm">
          <Icon size={20} />
        </ThemeIcon>
        <Text fw={600}>{pillar.title}</Text>
        <Text size="sm" c="dimmed">{pillar.shortDesc}</Text>
        <Text size="xs" c={pillar.color} mt="xs">Click to learn more →</Text>
      </Card>
    </>
  );
}

// Ethical Pillars Grid Component
function EthicalPillarsGrid() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      <EthicalPillarCard pillarKey="fairness" />
      <EthicalPillarCard pillarKey="transparency" />
      <EthicalPillarCard pillarKey="accountability" />
      <EthicalPillarCard pillarKey="safety" />
    </SimpleGrid>
  );
}

const moduleIcons = {
  'module-1': IconFileText,
  'module-2': IconShieldCheck,
  'module-3': IconScale,
  'module-4': IconServer,
  'module-5': IconDatabase,
};

// Module content components
const moduleContent = {
  'module-1': {
    title: 'Data Specifications',
    subtitle: 'Define fields, schemas, and quality rules so prompts, RAG docs, and fine-tune sets stay consistent.',
    sections: [
      {
        title: 'Overview',
        content: (
          <>
            <Text size="md" mb="md">
              Good data specifications are the foundation of any successful AI project. This module covers
              how to define clear data requirements, create schemas, and establish quality rules.
            </Text>
            <Text size="md" mb="md">
              <Text span fw={600}>Why it matters:</Text> Whether you&apos;re writing prompts, building RAG systems,
              or fine-tuning models, consistent data specifications ensure reproducible results.
            </Text>
          </>
        ),
      },
      {
        title: 'What You\'ll Learn',
        content: (
          <List size="md" spacing="sm" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
            <List.Item>How to create data dictionaries for healthcare datasets</List.Item>
            <List.Item>JSON Schema design for patient and clinical data</List.Item>
            <List.Item>Data quality rules and validation strategies</List.Item>
            <List.Item>Mapping real-world requirements to structured formats</List.Item>
          </List>
        ),
      },
      {
        title: 'Key Resources',
        content: (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={600} mb="xs">Data Dictionary Template</Text>
              <Text size="sm" c="dimmed" mb="sm">
                A reusable template for documenting fields, types, and constraints.
              </Text>
              <Badge color="green" variant="light">Template</Badge>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={600} mb="xs">Patient Health Schema</Text>
              <Text size="sm" c="dimmed" mb="sm">
                JSON Schema example for patient health records.
              </Text>
              <Badge color="blue" variant="light">Example</Badge>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={600} mb="xs">Dental Record Schema</Text>
              <Text size="sm" c="dimmed" mb="sm">
                JSON Schema for dental visit documentation.
              </Text>
              <Badge color="blue" variant="light">Example</Badge>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={600} mb="xs">Data Requirements Template</Text>
              <Text size="sm" c="dimmed" mb="sm">
                Checklist for gathering data requirements from stakeholders.
              </Text>
              <Badge color="green" variant="light">Template</Badge>
            </Card>
          </SimpleGrid>
        ),
      },
    ],
  },
  'module-2': {
    title: 'Regulations & Compliance',
    subtitle: 'HIPAA/GDPR basics, de-identification, and safe handling of synthetic healthcare data.',
    sections: [
      {
        title: 'Overview',
        content: (
          <>
            <Text size="md" mb="md">
              Healthcare data is among the most regulated in the world. This module covers the essential
              compliance requirements you need to understand when working with AI in healthcare contexts.
            </Text>
            <Text size="md" mb="md" c="red.7" fw={600}>
              ⚠ Important: Always use synthetic or properly de-identified data for AI experimentation.
              Never use real patient data without proper authorization and safeguards.
            </Text>
          </>
        ),
      },
      {
        title: 'Key Regulations',
        content: (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Badge color="blue" variant="filled" mb="sm">USA</Badge>
              <Title order={5} mb="xs">HIPAA</Title>
              <Text size="sm" c="dimmed">
                Health Insurance Portability and Accountability Act. Protects patient health information (PHI)
                and establishes standards for electronic healthcare transactions.
              </Text>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Badge color="grape" variant="filled" mb="sm">EU</Badge>
              <Title order={5} mb="xs">GDPR</Title>
              <Text size="sm" c="dimmed">
                General Data Protection Regulation. Applies to any EU citizen data and includes strict
                consent and data handling requirements.
              </Text>
            </Card>
          </SimpleGrid>
        ),
      },
      {
        title: 'What You\'ll Learn',
        content: (
          <List size="md" spacing="sm" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
            <List.Item>HIPAA Safe Harbor de-identification method (18 identifiers)</List.Item>
            <List.Item>Expert Determination method for statistical de-identification</List.Item>
            <List.Item>Data handling policies for AI projects</List.Item>
            <List.Item>Compliance checklists for healthcare AI development</List.Item>
          </List>
        ),
      },
    ],
  },
  'module-3': {
    title: 'Ethical AI',
    subtitle: 'Fairness, transparency, and accountability practices for healthcare AI systems.',
    sections: [
      {
        title: 'Overview',
        content: (
          <>
            <Text size="md" mb="md">
              AI systems in healthcare can have life-or-death implications. This module covers the ethical
              frameworks and practices needed to build responsible AI systems.
            </Text>
            <Text size="md" mb="md">
              <Text span fw={600}>Core principle:</Text> AI should augment human decision-making, not replace it,
              especially in high-stakes healthcare contexts.
            </Text>
          </>
        ),
      },
      {
        title: 'Ethical Pillars',
        content: <EthicalPillarsGrid />,
      },
      {
        title: 'What You\'ll Learn',
        content: (
          <List size="md" spacing="sm" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
            <List.Item>Bias detection and mitigation strategies</List.Item>
            <List.Item>Ethical AI frameworks (IEEE, EU AI Act principles)</List.Item>
            <List.Item>Documenting AI system decisions and limitations</List.Item>
            <List.Item>Human-in-the-loop design patterns</List.Item>
          </List>
        ),
      },
    ],
  },
  'module-4': {
    title: 'AI Environment Setup',
    subtitle: 'Set up your AI learning environment using AWS Bedrock (school login) or run models locally on your Mac.',
    sections: [
      {
        title: 'Choose Your Path',
        content: (
          <>
            <Text size="md" mb="md">
              You have two options for running AI models in this course. Choose based on your preferences
              and hardware capabilities.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Badge color="blue" variant="filled" mb="sm">Cloud Option</Badge>
                <Title order={4} mb="sm">AWS Bedrock</Title>
                <Text size="sm" c="dimmed" mb="md">
                  Use your UO credentials to access powerful cloud-hosted models like Claude 3.
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item><Text span c="green">✓</Text> No local setup required</List.Item>
                  <List.Item><Text span c="green">✓</Text> Access to latest models</List.Item>
                  <List.Item><Text span c="green">✓</Text> UO SSO authentication</List.Item>
                  <List.Item><Text span c="orange">⚠</Text> Requires internet connection</List.Item>
                </List>
              </Card>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Badge color="green" variant="filled" mb="sm">Local Option</Badge>
                <Title order={4} mb="sm">Ollama (Mac)</Title>
                <Text size="sm" c="dimmed" mb="md">
                  Run open-source models directly on your MacBook for complete privacy.
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item><Text span c="green">✓</Text> 100% private—data stays local</List.Item>
                  <List.Item><Text span c="green">✓</Text> No API costs</List.Item>
                  <List.Item><Text span c="green">✓</Text> Works offline</List.Item>
                  <List.Item><Text span c="orange">⚠</Text> Requires 8GB+ RAM</List.Item>
                </List>
              </Card>
            </SimpleGrid>
          </>
        ),
      },
      {
        title: 'Quick Start',
        content: (
          <>
            <Title order={5} mb="sm" c="blue">AWS Bedrock (5 minutes)</Title>
            <List size="sm" mb="lg" type="ordered">
              <List.Item>Go to AWS Bedrock Console</List.Item>
              <List.Item>Sign in with UO credentials</List.Item>
              <List.Item>Navigate to Playgrounds → Chat</List.Item>
              <List.Item>Select Claude 3 Haiku and start prompting</List.Item>
            </List>

            <Title order={5} mb="sm" c="green">Ollama Local (10 minutes)</Title>
            <Paper p="md" bg="gray.0" radius="md" mb="md">
              <Text size="sm" ff="monospace" mb="xs"># Install Ollama</Text>
              <Text size="sm" ff="monospace" mb="md">brew install ollama</Text>
              <Text size="sm" ff="monospace" mb="xs"># Download a model</Text>
              <Text size="sm" ff="monospace" mb="md">ollama pull phi3:mini</Text>
              <Text size="sm" ff="monospace" mb="xs"># Start chatting</Text>
              <Text size="sm" ff="monospace">ollama run phi3:mini</Text>
            </Paper>
          </>
        ),
      },
      {
        title: 'Model Recommendations by RAM',
        content: (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Badge color="blue" variant="light" mb="sm">8GB RAM</Badge>
              <Text fw={600}>Phi-3 Mini</Text>
              <Text size="sm" c="dimmed">3.8B parameters, fast inference</Text>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Badge color="green" variant="light" mb="sm">16GB RAM</Badge>
              <Text fw={600}>Mistral 7B</Text>
              <Text size="sm" c="dimmed">Great balance of speed & quality</Text>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Badge color="grape" variant="light" mb="sm">32GB+ RAM</Badge>
              <Text fw={600}>Llama 3 8B</Text>
              <Text size="sm" c="dimmed">Full precision, best quality</Text>
            </Card>
          </SimpleGrid>
        ),
      },
    ],
  },
  'module-5': {
    title: 'Synthetic Data',
    subtitle: 'Generate and validate synthetic health and dental datasets for privacy-preserving experimentation.',
    sections: [
      {
        title: 'Overview',
        content: (
          <>
            <Text size="md" mb="md">
              Synthetic data allows you to experiment with realistic healthcare data without privacy concerns.
              This module covers how to generate, validate, and use synthetic datasets effectively.
            </Text>
            <Text size="md" mb="md">
              <Text span fw={600} c="green">Key benefit:</Text> Train and test AI models without ever touching
              real patient data, eliminating compliance risks while maintaining statistical validity.
            </Text>
          </>
        ),
      },
      {
        title: 'Available Datasets',
        content: (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Badge color="teal" variant="filled" mb="sm">Healthcare</Badge>
              <Title order={5} mb="xs">Synthetic Patients</Title>
              <Text size="sm" c="dimmed" mb="md">
                1,000+ synthetic patient records with demographics, diagnoses, and medications.
              </Text>
              <Group gap="xs">
                <Badge size="sm" variant="outline">CSV</Badge>
                <Badge size="sm" variant="outline">JSON</Badge>
              </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Badge color="cyan" variant="filled" mb="sm">Dental</Badge>
              <Title order={5} mb="xs">Dental Visits</Title>
              <Text size="sm" c="dimmed" mb="md">
                Synthetic dental visit records with procedures, findings, and treatment plans.
              </Text>
              <Group gap="xs">
                <Badge size="sm" variant="outline">CSV</Badge>
                <Badge size="sm" variant="outline">JSON</Badge>
              </Group>
            </Card>
          </SimpleGrid>
        ),
      },
      {
        title: 'What You\'ll Learn',
        content: (
          <List size="md" spacing="sm" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
            <List.Item>Using Python generators to create synthetic healthcare data</List.Item>
            <List.Item>Validating synthetic data for statistical realism</List.Item>
            <List.Item>Customizing generators for specific use cases</List.Item>
            <List.Item>Best practices for synthetic data in AI training</List.Item>
          </List>
        ),
      },
    ],
  },
};

export default function ModulePage() {
  const { moduleId } = useParams();
  const module = modules.find((m) => m.id === moduleId);
  const content = moduleContent[moduleId];
  const Icon = moduleIcons[moduleId];

  if (!module || !content) {
    return (
      <Container size="lg" py="xl">
        <Title order={2}>Module Not Found</Title>
        <Text c="dimmed" mb="md">The requested module does not exist.</Text>
        <Button component={Link} to="/" leftSection={<IconArrowLeft size={16} />}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/" size="sm">Home</Anchor>
        <Text size="sm">{content.title}</Text>
      </Breadcrumbs>

      <Paper shadow="md" radius="lg" p="xl" mb="xl" className="hero">
        <Group gap="md" mb="md">
          <ThemeIcon color="green" size={56} radius="xl">
            <Icon size={28} />
          </ThemeIcon>
          <Box>
            <Badge color="green" variant="filled" size="lg" mb="xs">
              {module.id.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
            <Title order={1}>{content.title}</Title>
          </Box>
        </Group>
        <Text size="lg" c="dimmed">{content.subtitle}</Text>
      </Paper>

      {content.sections.map((section, index) => (
        <Box key={index} mb="xl">
          <Title order={3} mb="md" className="section-title">
            {section.title}
          </Title>
          {section.content}
          {index < content.sections.length - 1 && <Divider mt="xl" />}
        </Box>
      ))}

      <Divider my="xl" />

      <Group justify="space-between">
        <Button
          component={Link}
          to="/"
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Home
        </Button>
        {module.children && module.children.length > 0 && (
          <Group gap="xs">
            <Text size="sm" c="dimmed">Resources:</Text>
            {module.children.map((child) => (
              <Button
                key={child.label}
                component="a"
                href={child.href}
                target="_blank"
                variant="light"
                size="xs"
                rightSection={<IconExternalLink size={14} />}
              >
                {child.label}
              </Button>
            ))}
          </Group>
        )}
      </Group>
    </Container>
  );
}
