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
  Card,
  Button,
  Anchor,
  Breadcrumbs,
  SimpleGrid,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconFileText,
  IconBulb,
  IconDatabase,
  IconWand,
  IconTrophy,
  IconBrandAws,
  IconExternalLink,
} from '@tabler/icons-react';

// Import content components from the data-specs module
import {
  WhyDataMattersContent,
  CreatingSpecsContent,
  PromptToSpecContent,
  DataSpecsQuiz,
  styles,
} from './data-specs';

// Sub-page configuration
const subPages = {
  'why-data-matters': {
    title: 'Why Data Specifications Matter',
    subtitle: 'Understanding the foundation of successful AI projects',
    icon: IconBulb,
    content: <WhyDataMattersContent />,
  },
  'creating-specs': {
    title: 'Creating Data Specifications',
    subtitle: 'A step-by-step guide to building robust data specs',
    icon: IconDatabase,
    content: <CreatingSpecsContent />,
  },
  'prompt-to-spec': {
    title: 'Prompt to Data Spec Converter',
    subtitle: 'Use AI to generate data specifications from natural language',
    icon: IconWand,
    content: <PromptToSpecContent />,
  },
  'quiz': {
    title: 'Data Specs Challenge',
    subtitle: 'Test your knowledge with AI-graded questions',
    icon: IconTrophy,
    content: <DataSpecsQuiz />,
  },
};

const subPageOrder = ['why-data-matters', 'creating-specs', 'prompt-to-spec', 'quiz'];

export default function DataSpecsPage() {
  const { subPage } = useParams();

  // If no subpage, show the overview with links
  if (!subPage) {
    return (
      <Container size="lg" py="xl">
        <Breadcrumbs mb="lg">
          <Anchor component={Link} to="/" size="sm">
            Home
          </Anchor>
          <Text size="sm">Data Specifications</Text>
        </Breadcrumbs>

        <Paper
          shadow="md"
          radius="lg"
          p="xl"
          mb="xl"
          className={styles.hero}
        >
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
            Define fields, schemas, and quality rules so prompts, RAG docs, and
            fine-tune sets stay consistent.
          </Text>
        </Paper>

        <Title order={3} mb="md" className={styles.sectionTitle}>
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
                className={styles.moduleCard}
                style={{ display: 'flex', flexDirection: 'column' }}
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
                <Text size="sm" c="dimmed" style={{ flex: 1 }}>
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

          {/* Bedrock Card - Extra Credit */}
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className={styles.moduleCard}
            style={{ borderColor: 'var(--mantine-color-orange-4)', display: 'flex', flexDirection: 'column' }}
          >
            <Group mb="sm">
              <ThemeIcon color="orange" size={40} radius="xl">
                <IconBrandAws size={22} />
              </ThemeIcon>
              <Badge size="sm" color="orange" variant="light">
                Extra Credit
              </Badge>
            </Group>
            <Text fw={600} size="lg" mb="xs">
              Amazon Bedrock Getting Started
            </Text>
            <Text size="sm" c="dimmed" style={{ flex: 1 }}>
              Learn the fundamentals of Amazon Bedrock and foundation models with this free AWS Skill Builder course.
            </Text>
            <Button
              component="a"
              href="https://skillbuilder.aws/learn/63KTRM86DQ/amazon-bedrock-getting-started/SC2Y3HMAUE"
              target="_blank"
              variant="light"
              color="orange"
              fullWidth
              mt="md"
              rightSection={<IconExternalLink size={16} />}
            >
              Start AWS Course
            </Button>
          </Card>

          {/* SageMaker Card - Extra Credit */}
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className={styles.moduleCard}
            style={{ borderColor: 'var(--mantine-color-blue-4)', display: 'flex', flexDirection: 'column' }}
          >
            <Group mb="sm">
              <ThemeIcon color="blue" size={40} radius="xl">
                <IconBrandAws size={22} />
              </ThemeIcon>
              <Badge size="sm" color="blue" variant="light">
                Extra Credit
              </Badge>
            </Group>
            <Text fw={600} size="lg" mb="xs">
              Introduction to Amazon SageMaker
            </Text>
            <Text size="sm" c="dimmed" style={{ flex: 1 }}>
              Explore machine learning workflows with SageMaker in this free AWS Skill Builder course.
            </Text>
            <Button
              component="a"
              href="https://skillbuilder.aws/learn/E1TZFJG8AG/introduction-to-amazon-sagemaker/GK2ESQYCR3"
              target="_blank"
              variant="light"
              color="blue"
              fullWidth
              mt="md"
              rightSection={<IconExternalLink size={16} />}
            >
              Start AWS Course
            </Button>
          </Card>
        </SimpleGrid>

        <Group justify="flex-start" mt="xl">
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
        <Text c="dimmed" mb="md">
          The requested page does not exist.
        </Text>
        <Button
          component={Link}
          to="/module-1"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Data Specifications
        </Button>
      </Container>
    );
  }

  const currentIndex = subPageOrder.indexOf(subPage);
  const prevPage = currentIndex > 0 ? subPageOrder[currentIndex - 1] : null;
  const nextPage =
    currentIndex < subPageOrder.length - 1
      ? subPageOrder[currentIndex + 1]
      : null;

  return (
    <Container size="lg" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/" size="sm">
          Home
        </Anchor>
        <Anchor component={Link} to="/module-1" size="sm">
          Data Specifications
        </Anchor>
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
