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
  IconCloud,
  IconCpu,
  IconBrandAws,
  IconServer,
  IconTerminal2,
} from '@tabler/icons-react';

// Import content components from the ai-setup module
import {
  AWSAccountSetupContent,
  BedrockSetupContent,
  LocalLLMContent,
  SageMakerContent,
  styles,
} from './ai-setup';

// Sub-page configuration
const subPages = {
  'aws-account': {
    title: 'AWS Account Setup',
    subtitle: 'Create your AWS account and activate AI services',
    icon: IconCloud,
    color: 'blue',
    content: <AWSAccountSetupContent />,
  },
  'bedrock': {
    title: 'AWS Bedrock Setup',
    subtitle: 'Access foundation models via AWS API',
    icon: IconBrandAws,
    color: 'orange',
    content: <BedrockSetupContent />,
  },
  'local-llm': {
    title: 'Local LLM Setup',
    subtitle: 'Run AI models on your own computer',
    icon: IconTerminal2,
    color: 'violet',
    content: <LocalLLMContent />,
  },
  'sagemaker': {
    title: 'AWS SageMaker Setup',
    subtitle: 'Train and deploy custom ML models',
    icon: IconServer,
    color: 'teal',
    content: <SageMakerContent />,
  },
};

const subPageOrder = ['aws-account', 'bedrock', 'local-llm', 'sagemaker'];

export default function AISetupPage() {
  const { subPage } = useParams();

  // If no subpage, show the overview with links
  if (!subPage) {
    return (
      <Container size="lg" py="xl">
        <Breadcrumbs mb="lg">
          <Anchor component={Link} to="/" size="sm">
            Home
          </Anchor>
          <Text size="sm">AI Environment Setup</Text>
        </Breadcrumbs>

        <Paper
          shadow="md"
          radius="lg"
          p="xl"
          mb="xl"
          className={styles.hero}
        >
          <Group gap="md" mb="md">
            <ThemeIcon color="blue" size={56} radius="xl">
              <IconCloud size={28} />
            </ThemeIcon>
            <Box>
              <Badge color="blue" variant="filled" size="lg" mb="xs">
                AI SETUP
              </Badge>
              <Title order={1}>AI Environment Setup</Title>
            </Box>
          </Group>
          <Text size="lg" c="dimmed">
            Choose how you want to run AI models for this course. You can use 
            cloud-based options through AWS (free via Canvas) or run models 
            locally on your own computer.
          </Text>
        </Paper>

        <Title order={3} mb="md">Choose Your Setup Path</Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mb="xl">
          {subPageOrder.map((key) => {
            const page = subPages[key];
            const Icon = page.icon;
            return (
              <Card
                key={key}
                component={Link}
                to={`/ai-setup/${key}`}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ textDecoration: 'none' }}
              >
                <Group gap="sm" mb="sm">
                  <ThemeIcon color={page.color} size="lg" radius="xl">
                    <Icon size={20} />
                  </ThemeIcon>
                  <Text fw={600}>{page.title}</Text>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  {page.subtitle}
                </Text>
                <Button 
                  variant="light" 
                  color={page.color} 
                  fullWidth
                  rightSection={<IconArrowRight size={14} />}
                >
                  Get Started
                </Button>
              </Card>
            );
          })}
        </SimpleGrid>

        <Divider my="xl" />

        <Paper p="lg" withBorder radius="md">
          <Title order={4} mb="sm">Which Option Should I Choose?</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Box>
              <Text fw={600} size="sm" c="orange" mb="xs">AWS Bedrock</Text>
              <Text size="sm">
                Best for quick access to powerful models like Claude 3 via API. 
                No GPU required. Great for generating data specs and text analysis.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="violet" mb="xs">Local LLM</Text>
              <Text size="sm">
                Best for privacy and offline work. Runs on your laptop (8GB+ RAM recommended). 
                No cloud costs or data privacy concerns.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="teal" mb="xs">AWS SageMaker</Text>
              <Text size="sm">
                Best for custom model training and deployment. More complex setup 
                but offers full ML pipeline capabilities.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="blue" mb="xs">Not Sure?</Text>
              <Text size="sm">
                Start with <Text span fw={600}>Bedrock</Text> - it is the fastest way to get started 
                and works with your Canvas AWS access.
              </Text>
            </Box>
          </SimpleGrid>
        </Paper>
      </Container>
    );
  }

  // Get the current subpage configuration
  const currentPage = subPages[subPage];
  if (!currentPage) {
    return (
      <Container size="lg" py="xl">
        <Text>Page not found</Text>
        <Button component={Link} to="/ai-setup" mt="md">
          Back to AI Setup
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

  const Icon = currentPage.icon;

  return (
    <Container size="lg" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/" size="sm">
          Home
        </Anchor>
        <Anchor component={Link} to="/ai-setup" size="sm">
          AI Environment Setup
        </Anchor>
        <Text size="sm">{currentPage.title}</Text>
      </Breadcrumbs>

      <Paper
        shadow="md"
        radius="lg"
        p="xl"
        mb="xl"
        className={styles.hero}
      >
        <Group gap="md" mb="md">
          <ThemeIcon color={currentPage.color} size={56} radius="xl">
            <Icon size={28} />
          </ThemeIcon>
          <Box>
            <Badge color={currentPage.color} variant="filled" size="lg" mb="xs">
              AI SETUP
            </Badge>
            <Title order={1}>{currentPage.title}</Title>
          </Box>
        </Group>
        <Text size="lg" c="dimmed">
          {currentPage.subtitle}
        </Text>
      </Paper>

      {/* Main Content */}
      {currentPage.content}

      {/* Navigation */}
      <Divider my="xl" />
      <Group justify="space-between">
        {prevPage ? (
          <Button
            component={Link}
            to={`/ai-setup/${prevPage}`}
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            {subPages[prevPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/ai-setup"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Overview
          </Button>
        )}
        {nextPage && (
          <Button
            component={Link}
            to={`/ai-setup/${nextPage}`}
            rightSection={<IconArrowRight size={16} />}
          >
            {subPages[nextPage].title}
          </Button>
        )}
      </Group>
    </Container>
  );
}
