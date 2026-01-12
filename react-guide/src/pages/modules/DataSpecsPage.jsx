import React from 'react';
import { Link, useParams } from 'react-router-dom';
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
  Tabs,
  Alert,
  Code,
  Blockquote,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheck,
  IconExternalLink,
  IconFileText,
  IconBulb,
  IconDatabase,
  IconWand,
  IconAlertCircle,
  IconRobot,
  IconChecklist,
  IconCode,
} from '@tabler/icons-react';

const CUSTOM_GPT_URL = 'https://chatgpt.com/g/g-678918520cb48191ae63c2f8dff07088-generative-ai-in-business';

// Sub-page content
const subPages = {
  'why-data-matters': {
    title: 'Why Data Specifications Matter',
    subtitle: 'Understanding the foundation of successful AI projects',
    icon: IconBulb,
    content: (
      <>
        <Paper shadow="sm" p="xl" radius="md" withBorder mb="xl">
          <Group gap="md" mb="md">
            <ThemeIcon color="green" size={48} radius="xl">
              <IconBulb size={24} />
            </ThemeIcon>
            <Box>
              <Title order={3}>The Foundation of AI Success</Title>
              <Text c="dimmed">Good data specifications prevent 80% of AI project failures</Text>
            </Box>
          </Group>
          <Text size="md" mb="md">
            In healthcare AI, the difference between a successful project and a costly failure often comes down to
            one thing: <Text span fw={700} c="green">how well you defined your data requirements upfront</Text>.
          </Text>
        </Paper>

        <Title order={3} mb="md" className="section-title">
          Why Most AI Projects Fail
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="red" variant="filled" mb="sm">Problem</Badge>
            <Text fw={600} mb="xs">Garbage In, Garbage Out</Text>
            <Text size="sm" c="dimmed">
              AI models are only as good as their training data. Poorly defined data leads to
              models that hallucinate, make biased predictions, or simply don't work.
            </Text>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="red" variant="filled" mb="sm">Problem</Badge>
            <Text fw={600} mb="xs">Scope Creep</Text>
            <Text size="sm" c="dimmed">
              Without clear specifications, projects expand endlessly. "Just add one more field"
              becomes a death spiral of changing requirements.
            </Text>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="red" variant="filled" mb="sm">Problem</Badge>
            <Text fw={600} mb="xs">Compliance Nightmares</Text>
            <Text size="sm" c="dimmed">
              Healthcare data without proper specifications often violates HIPAA. You can't
              de-identify data if you don't know what fields contain PHI.
            </Text>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="red" variant="filled" mb="sm">Problem</Badge>
            <Text fw={600} mb="xs">Integration Failures</Text>
            <Text size="sm" c="dimmed">
              When data formats don't match between systems, integrations break. Specifications
              ensure everyone speaks the same language.
            </Text>
          </Card>
        </SimpleGrid>

        <Title order={3} mb="md" className="section-title">
          The Solution: Data Specifications
        </Title>
        <Text size="md" mb="md">
          A <Text span fw={600}>data specification</Text> is a formal document that defines exactly what data
          you need, how it should be structured, and what rules it must follow.
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <ThemeIcon color="green" size={40} radius="xl" mb="sm">
              <IconFileText size={20} />
            </ThemeIcon>
            <Text fw={600} mb="xs">Data Dictionary</Text>
            <Text size="sm" c="dimmed">
              Defines each field: name, type, description, constraints, and examples.
            </Text>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <ThemeIcon color="blue" size={40} radius="xl" mb="sm">
              <IconCode size={20} />
            </ThemeIcon>
            <Text fw={600} mb="xs">JSON Schema</Text>
            <Text size="sm" c="dimmed">
              Machine-readable format that can automatically validate data.
            </Text>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <ThemeIcon color="grape" size={40} radius="xl" mb="sm">
              <IconChecklist size={20} />
            </ThemeIcon>
            <Text fw={600} mb="xs">Quality Rules</Text>
            <Text size="sm" c="dimmed">
              Defines acceptable values, required fields, and validation logic.
            </Text>
          </Card>
        </SimpleGrid>

        <Alert icon={<IconAlertCircle size={16} />} title="Key Insight" color="green" mb="xl">
          <Text size="sm">
            Teams that spend 2 weeks on data specifications save 2 months of rework later.
            The upfront investment always pays off.
          </Text>
        </Alert>

        <Blockquote color="green" icon={<IconBulb size={24} />} mb="xl">
          <Text size="md" fs="italic">
            "In God we trust. All others must bring data."
          </Text>
          <Text size="sm" c="dimmed" mt="xs">— W. Edwards Deming</Text>
        </Blockquote>
      </>
    ),
  },
  'creating-specs': {
    title: 'Creating Data Specifications',
    subtitle: 'A step-by-step guide to building robust data specs',
    icon: IconDatabase,
    content: (
      <>
        <Paper shadow="sm" p="xl" radius="md" withBorder mb="xl">
          <Group gap="md" mb="md">
            <ThemeIcon color="blue" size={48} radius="xl">
              <IconDatabase size={24} />
            </ThemeIcon>
            <Box>
              <Title order={3}>Building Your First Data Specification</Title>
              <Text c="dimmed">From business requirements to structured schemas</Text>
            </Box>
          </Group>
        </Paper>

        <Title order={3} mb="md" className="section-title">
          Step 1: Gather Requirements
        </Title>
        <Text size="md" mb="md">
          Before writing any specification, you need to understand what problem you're solving.
          Ask these questions:
        </Text>
        <List size="md" spacing="sm" mb="xl" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
          <List.Item><Text span fw={600}>What decision</Text> will this data support?</List.Item>
          <List.Item><Text span fw={600}>Who will use</Text> this data? (humans, AI models, both?)</List.Item>
          <List.Item><Text span fw={600}>What existing systems</Text> will this integrate with?</List.Item>
          <List.Item><Text span fw={600}>What compliance requirements</Text> apply? (HIPAA, GDPR?)</List.Item>
          <List.Item><Text span fw={600}>What's the expected volume</Text> of data?</List.Item>
        </List>

        <Title order={3} mb="md" className="section-title">
          Step 2: Define Fields
        </Title>
        <Text size="md" mb="md">
          For each piece of information, document:
        </Text>
        <Paper p="md" bg="gray.0" radius="md" mb="xl">
          <Code block>
{`{
  "field_name": "patient_age",
  "type": "integer",
  "description": "Patient's age in years at time of visit",
  "required": true,
  "constraints": {
    "minimum": 0,
    "maximum": 150
  },
  "phi_status": "quasi-identifier",
  "example": 45
}`}
          </Code>
        </Paper>

        <Title order={3} mb="md" className="section-title">
          Step 3: Create JSON Schema
        </Title>
        <Text size="md" mb="md">
          JSON Schema provides machine-readable validation. Here's a simple patient record:
        </Text>
        <Paper p="md" bg="gray.0" radius="md" mb="xl">
          <Code block>
{`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "PatientRecord",
  "type": "object",
  "required": ["patient_id", "age", "visit_date"],
  "properties": {
    "patient_id": {
      "type": "string",
      "pattern": "^P[0-9]{8}$",
      "description": "Unique patient identifier (P followed by 8 digits)"
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    },
    "visit_date": {
      "type": "string",
      "format": "date"
    },
    "diagnoses": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[A-Z][0-9]{2}(\\.[0-9]{1,2})?$"
      },
      "description": "ICD-10 diagnosis codes"
    }
  }
}`}
          </Code>
        </Paper>

        <Title order={3} mb="md" className="section-title">
          Step 4: Document Quality Rules
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
          <Card shadow="xs" padding="md" radius="md" withBorder>
            <Text fw={600} c="green" mb="xs">✓ Valid</Text>
            <List size="sm" spacing="xs">
              <List.Item>patient_id matches pattern P########</List.Item>
              <List.Item>age is between 0 and 150</List.Item>
              <List.Item>visit_date is not in the future</List.Item>
              <List.Item>diagnosis codes are valid ICD-10</List.Item>
            </List>
          </Card>
          <Card shadow="xs" padding="md" radius="md" withBorder>
            <Text fw={600} c="red" mb="xs">✗ Invalid</Text>
            <List size="sm" spacing="xs">
              <List.Item>patient_id: "12345" (missing P prefix)</List.Item>
              <List.Item>age: -5 (negative age)</List.Item>
              <List.Item>visit_date: "2030-01-01" (future date)</List.Item>
              <List.Item>diagnosis: "headache" (not ICD-10)</List.Item>
            </List>
          </Card>
        </SimpleGrid>

        <Alert icon={<IconBulb size={16} />} title="Pro Tip" color="blue" mb="xl">
          <Text size="sm">
            Start with the minimum viable specification. You can always add fields later,
            but removing fields that are already in production is painful.
          </Text>
        </Alert>
      </>
    ),
  },
  'prompt-to-spec': {
    title: 'Prompt to Data Spec Converter',
    subtitle: 'Use AI to generate data specifications from natural language',
    icon: IconWand,
    content: (
      <>
        <Paper shadow="sm" p="xl" radius="md" withBorder mb="xl" className="hero">
          <Group gap="md" mb="md">
            <ThemeIcon color="grape" size={48} radius="xl">
              <IconWand size={24} />
            </ThemeIcon>
            <Box>
              <Title order={3}>AI-Powered Specification Generator</Title>
              <Text c="dimmed">Convert your ideas into structured data specifications</Text>
            </Box>
          </Group>
          <Text size="md">
            Use our custom GPT to transform natural language descriptions into
            professional data specifications, JSON schemas, and data dictionaries.
          </Text>
        </Paper>

        <Title order={3} mb="md" className="section-title">
          How It Works
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="green" variant="filled" size="lg" mb="sm">1</Badge>
            <Text fw={600} mb="xs">Describe Your Data</Text>
            <Text size="sm" c="dimmed">
              Tell the AI what kind of data you need in plain English.
            </Text>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="green" variant="filled" size="lg" mb="sm">2</Badge>
            <Text fw={600} mb="xs">AI Generates Spec</Text>
            <Text size="sm" c="dimmed">
              The GPT creates a structured specification with fields, types, and rules.
            </Text>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="green" variant="filled" size="lg" mb="sm">3</Badge>
            <Text fw={600} mb="xs">Refine & Export</Text>
            <Text size="sm" c="dimmed">
              Ask follow-up questions, then export as JSON Schema or markdown.
            </Text>
          </Card>
        </SimpleGrid>

        <Paper shadow="md" p="xl" radius="lg" withBorder mb="xl" className="gpt-gradient-card">
          <Group justify="center" mb="lg">
            <ThemeIcon color="green" size={64} radius="xl">
              <IconRobot size={32} />
            </ThemeIcon>
          </Group>
          <Title order={3} ta="center" mb="md">
            Generative AI in Business GPT
          </Title>
          <Text size="md" ta="center" mb="lg" c="dimmed">
            Our custom GPT is trained to help you create healthcare data specifications,
            understand AI concepts, and apply them to business problems.
          </Text>
          <Group justify="center">
            <Button
              component="a"
              href={CUSTOM_GPT_URL}
              target="_blank"
              size="lg"
              color="green"
              rightSection={<IconExternalLink size={18} />}
            >
              Open GPT in ChatGPT
            </Button>
          </Group>
        </Paper>

        <Title order={3} mb="md" className="section-title">
          Example Prompts to Try
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="teal" variant="light" mb="sm">Healthcare</Badge>
            <Text size="sm" fw={500} mb="xs">Patient Visit Record</Text>
            <Paper p="sm" bg="gray.1" radius="sm">
              <Text size="xs" ff="monospace">
                "Create a data specification for tracking patient visits at a dental clinic.
                Include patient info, procedures performed, and billing codes."
              </Text>
            </Paper>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="blue" variant="light" mb="sm">Clinical</Badge>
            <Text size="sm" fw={500} mb="xs">Medication Record</Text>
            <Paper p="sm" bg="gray.1" radius="sm">
              <Text size="xs" ff="monospace">
                "I need a JSON schema for medication records. Include drug name, dosage,
                frequency, prescriber, and start/end dates."
              </Text>
            </Paper>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="grape" variant="light" mb="sm">Research</Badge>
            <Text size="sm" fw={500} mb="xs">Clinical Trial Data</Text>
            <Paper p="sm" bg="gray.1" radius="sm">
              <Text size="xs" ff="monospace">
                "Design a data dictionary for a clinical trial tracking patient outcomes,
                adverse events, and treatment assignments."
              </Text>
            </Paper>
          </Card>
          <Card shadow="xs" padding="lg" radius="md" withBorder>
            <Badge color="orange" variant="light" mb="sm">Operations</Badge>
            <Text size="sm" fw={500} mb="xs">Appointment System</Text>
            <Paper p="sm" bg="gray.1" radius="sm">
              <Text size="xs" ff="monospace">
                "Build a specification for a healthcare appointment scheduling system.
                Include provider availability, patient preferences, and reminders."
              </Text>
            </Paper>
          </Card>
        </SimpleGrid>

        <Alert icon={<IconAlertCircle size={16} />} title="Important" color="yellow" mb="xl">
          <Text size="sm">
            <Text span fw={600}>Never include real patient data</Text> in your prompts to the GPT.
            Use synthetic examples or describe the data structure without actual PHI.
          </Text>
        </Alert>

        <Title order={3} mb="md" className="section-title">
          What You'll Get
        </Title>
        <List size="md" spacing="sm" mb="xl" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
          <List.Item><Text span fw={600}>Data Dictionary</Text> — Human-readable field definitions</List.Item>
          <List.Item><Text span fw={600}>JSON Schema</Text> — Machine-readable validation rules</List.Item>
          <List.Item><Text span fw={600}>Example Records</Text> — Sample data following your spec</List.Item>
          <List.Item><Text span fw={600}>Validation Rules</Text> — Business logic for data quality</List.Item>
          <List.Item><Text span fw={600}>HIPAA Considerations</Text> — Which fields may contain PHI</List.Item>
        </List>
      </>
    ),
  },
};

const subPageOrder = ['why-data-matters', 'creating-specs', 'prompt-to-spec'];

export default function DataSpecsPage() {
  const { subPage } = useParams();

  // If no subpage, show the overview with links
  if (!subPage) {
    return (
      <Container size="lg" py="xl">
        <Breadcrumbs mb="lg">
          <Anchor component={Link} to="/" size="sm">Home</Anchor>
          <Text size="sm">Data Specifications</Text>
        </Breadcrumbs>

        <Paper shadow="md" radius="lg" p="xl" mb="xl" className="hero">
          <Group gap="md" mb="md">
            <ThemeIcon color="green" size={56} radius="xl">
              <IconFileText size={28} />
            </ThemeIcon>
            <Box>
              <Badge color="green" variant="filled" size="lg" mb="xs">
                MODULE 1
              </Badge>
              <Title order={1}>Data Specifications</Title>
            </Box>
          </Group>
          <Text size="lg" c="dimmed">
            Define fields, schemas, and quality rules so prompts, RAG docs, and fine-tune sets stay consistent.
          </Text>
        </Paper>

        <Title order={3} mb="md" className="section-title">
          Learn Data Specifications
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
          {subPageOrder.map((key, index) => {
            const page = subPages[key];
            const Icon = page.icon;
            return (
              <Card
                key={key}
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
                  <Badge size="sm" color="green" variant="light">
                    Part {index + 1}
                  </Badge>
                </Group>
                <Text fw={600} size="lg" mb="xs">
                  {page.title}
                </Text>
                <Text size="sm" c="dimmed" className="ai-basics-card-summary">
                  {page.subtitle}
                </Text>
                <Button
                  component={Link}
                  to={`/module-1/${key}`}
                  variant="light"
                  color="green"
                  fullWidth
                  mt="md"
                  rightSection={<IconArrowRight size={16} />}
                >
                  Start Learning
                </Button>
              </Card>
            );
          })}
        </SimpleGrid>

        <Divider my="xl" />

        <Title order={3} mb="md" className="section-title">
          AI Spec Generator
        </Title>
        <Paper shadow="md" p="xl" radius="lg" withBorder mb="xl" className="gpt-gradient-card">
          <Group gap="lg" align="flex-start" wrap="wrap">
            <Box className="flex-container-box">
              <Group gap="md" mb="md">
                <ThemeIcon color="green" size={48} radius="xl">
                  <IconRobot size={24} />
                </ThemeIcon>
                <Box>
                  <Text fw={700} size="lg">Generative AI in Business GPT</Text>
                  <Text size="sm" c="dimmed">Convert natural language to data specs</Text>
                </Box>
              </Group>
              <Text size="md" mb="md">
                Our custom GPT helps you create healthcare data specifications, JSON schemas, 
                and data dictionaries from plain English descriptions.
              </Text>
              <Button
                component="a"
                href={CUSTOM_GPT_URL}
                target="_blank"
                size="lg"
                color="green"
                fullWidth
                rightSection={<IconExternalLink size={18} />}
              >
                Open GPT in ChatGPT
              </Button>
            </Box>
            <Divider orientation="vertical" visibleFrom="sm" />
            <Box className="flex-container-box">
              <Text fw={600} size="sm" mb="sm" c="dimmed">TRY THESE PROMPTS:</Text>
              <SimpleGrid cols={1} spacing="xs">
                <Paper p="sm" bg="white" radius="sm" withBorder>
                  <Badge color="teal" size="xs" mb={4}>Healthcare</Badge>
                  <Text size="xs" ff="monospace">
                    "Create a data spec for patient visits at a dental clinic with procedures and billing codes"
                  </Text>
                </Paper>
                <Paper p="sm" bg="white" radius="sm" withBorder>
                  <Badge color="blue" size="xs" mb={4}>Clinical</Badge>
                  <Text size="xs" ff="monospace">
                    "Generate a JSON schema for medication records with drug, dosage, frequency"
                  </Text>
                </Paper>
                <Paper p="sm" bg="white" radius="sm" withBorder>
                  <Badge color="grape" size="xs" mb={4}>Research</Badge>
                  <Text size="xs" ff="monospace">
                    "Design a data dictionary for clinical trial outcomes and adverse events"
                  </Text>
                </Paper>
              </SimpleGrid>
              <Alert icon={<IconAlertCircle size={14} />} color="yellow" mt="sm" p="xs">
                <Text size="xs">Never include real patient data in prompts</Text>
              </Alert>
            </Box>
          </Group>
        </Paper>

        <Group justify="flex-start">
          <Button
            component={Link}
            to="/"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Home
          </Button>
        </Group>
      </Container>
    );
  }

  // Render specific subpage
  const page = subPages[subPage];

  if (!page) {
    return (
      <Container size="lg" py="xl">
        <Title order={2}>Page Not Found</Title>
        <Text c="dimmed" mb="md">The requested page does not exist.</Text>
        <Button component={Link} to="/module-1" leftSection={<IconArrowLeft size={16} />}>
          Back to Data Specifications
        </Button>
      </Container>
    );
  }

  const currentIndex = subPageOrder.indexOf(subPage);
  const prevPage = currentIndex > 0 ? subPageOrder[currentIndex - 1] : null;
  const nextPage = currentIndex < subPageOrder.length - 1 ? subPageOrder[currentIndex + 1] : null;

  return (
    <Container size="lg" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/" size="sm">Home</Anchor>
        <Anchor component={Link} to="/module-1" size="sm">Data Specifications</Anchor>
        <Text size="sm">{page.title}</Text>
      </Breadcrumbs>

      {page.content}

      <Divider my="xl" />

      <Group justify="space-between">
        {prevPage ? (
          <Button
            component={Link}
            to={`/module-1/${prevPage}`}
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            {subPages[prevPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/module-1"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Module Overview
          </Button>
        )}
        {nextPage ? (
          <Button
            component={Link}
            to={`/module-1/${nextPage}`}
            variant="light"
            color="green"
            rightSection={<IconArrowRight size={16} />}
          >
            {subPages[nextPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/module-2"
            variant="light"
            color="green"
            rightSection={<IconArrowRight size={16} />}
          >
            Next: AI Environment Setup
          </Button>
        )}
      </Group>
    </Container>
  );
}
