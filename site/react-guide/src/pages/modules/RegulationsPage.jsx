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
  IconShieldCheck,
  IconScale,
  IconFileText,
  IconCircleCheck,
} from '@tabler/icons-react';

// Import content components from the regulations module
import {
  SafeHarborPage,
  ExpertDeterminationPage,
  DataHandlingPage,
  ComplianceChecklistPage,
} from './regulations';

// Sub-page configuration
const subPages = {
  'safe-harbor': {
    title: 'Safe Harbor Method',
    subtitle: 'HIPAA de-identification using the 18 identifier removal method',
    icon: IconShieldCheck,
    color: 'blue',
    content: <SafeHarborPage />,
    type: 'assignment',
  },
  'expert-determination': {
    title: 'Expert Determination',
    subtitle: 'Statistical de-identification and risk analysis',
    icon: IconScale,
    color: 'indigo',
    content: <ExpertDeterminationPage />,
    type: 'quiz',
  },
  'data-handling': {
    title: 'Data Handling Policies',
    subtitle: 'Comprehensive policies for the complete data lifecycle',
    icon: IconFileText,
    color: 'cyan',
    content: <DataHandlingPage />,
    type: 'assignment',
  },
  'compliance-checklist': {
    title: 'Compliance Checklist',
    subtitle: 'Interactive checklist for healthcare AI development',
    icon: IconCircleCheck,
    color: 'grape',
    content: <ComplianceChecklistPage />,
    type: 'interactive',
  },
};

const RegulationsHomePage = () => {
  return (
    <Container size="xl" py="xl">
      <Box mb="xl">
        <Group mb="md">
          <ThemeIcon size={50} radius="md" color="green">
            <IconShieldCheck size={30} />
          </ThemeIcon>
          <Box>
            <Title order={1}>Regulations & Compliance for Healthcare AI</Title>
            <Text c="dimmed">HIPAA, GDPR, de-identification methods, and compliance frameworks</Text>
          </Box>
        </Group>
      </Box>

      <Paper p="lg" mb="xl" withBorder bg="blue.0">
        <Title order={2} mb="md">Overview</Title>
        <Text mb="md">
          Healthcare AI projects must comply with strict regulations to protect patient privacy and ensure data security. 
          This module covers the essential compliance frameworks, de-identification methods, and best practices for building 
          HIPAA-compliant AI systems.
        </Text>
        <Text fw={600} mb="xs">What You will Learn:</Text>
        <Text size="sm">
          • HIPAA Safe Harbor and Expert Determination de-identification methods
          <br />
          • Data handling policies across the entire lifecycle
          <br />
          • Compliance checklists for healthcare AI development
          <br />
          • Real-world patient journey examples showing identifier usage
        </Text>
      </Paper>

      <Title order={2} mb="md">Choose a Topic</Title>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {Object.entries(subPages).map(([key, page]) => {
          const PageIcon = page.icon;
          const typeColors = {
            quiz: 'orange',
            assignment: 'green',
            interactive: 'violet',
          };
          const typeLabels = {
            quiz: 'Quiz',
            assignment: 'Assignment',
            interactive: 'Interactive',
          };
          return (
            <Card
              key={key}
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              component={Link}
              to={`/regulations/${key}`}
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <Group mb="xs" justify="space-between">
                <ThemeIcon size={60} radius="md" color={page.color} variant="light">
                  <PageIcon size={30} />
                </ThemeIcon>
                <Badge size="lg" color={typeColors[page.type]} variant="filled">
                  {typeLabels[page.type]}
                </Badge>
              </Group>
              <Box mb="md">
                <Text fw={600} size="lg" mb="xs">{page.title}</Text>
                <Text size="sm" c="dimmed">{page.subtitle}</Text>
              </Box>
              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  color={page.color}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Learn More
                </Button>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>
    </Container>
  );
};

const RegulationsPage = () => {
  const { subPage } = useParams();

  // If no subpage is specified, show the home page
  if (!subPage) {
    return <RegulationsHomePage />;
  }

  const currentPage = subPages[subPage];

  if (!currentPage) {
    return (
      <Container size="lg" py="xl">
        <Text>Page not found</Text>
      </Container>
    );
  }

  const PageIcon = currentPage.icon;

  // Get navigation order
  const pageKeys = Object.keys(subPages);
  const currentIndex = pageKeys.indexOf(subPage);
  const prevPage = currentIndex > 0 ? pageKeys[currentIndex - 1] : null;
  const nextPage = currentIndex < pageKeys.length - 1 ? pageKeys[currentIndex + 1] : null;

  return (
    <>
      <Container size="xl" py="md">
        <Breadcrumbs mb="md">
          <Anchor component={Link} to="/">Home</Anchor>
          <Anchor component={Link} to="/regulations">Regulations & Compliance</Anchor>
          <Text>{currentPage.title}</Text>
        </Breadcrumbs>
      </Container>

      {currentPage.content}

      <Container size="xl" py="xl">
        <Divider my="xl" />
        <Group justify="space-between">
          {prevPage ? (
            <Button
              component={Link}
              to={`/regulations/${prevPage}`}
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
            >
              Previous: {subPages[prevPage].title}
            </Button>
          ) : (
            <Box />
          )}
          {nextPage ? (
            <Button
              component={Link}
              to={`/regulations/${nextPage}`}
              variant="light"
              rightSection={<IconArrowRight size={16} />}
            >
              Next: {subPages[nextPage].title}
            </Button>
          ) : (
            <Box />
          )}
        </Group>
      </Container>
    </>
  );
};

export default RegulationsPage;
