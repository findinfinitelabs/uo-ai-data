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
  IconPlug,
  IconRobot,
} from '@tabler/icons-react';

// Import content components from the ai-setup module
import {
  AWSAccountSetupContent,
  BedrockSetupContent,
  LocalLLMContent,
  SageMakerContent,
  MCPContent,
  AgentContent,
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
  'mcp': {
    title: 'Model Context Protocol (MCP)',
    subtitle: 'Connect AI models to external data and tools',
    icon: IconPlug,
    color: 'pink',
    content: <MCPContent />,
  },
  'agents': {
    title: 'AI Agents',
    subtitle: 'Build autonomous AI systems that complete tasks',
    icon: IconRobot,
    color: 'indigo',
    content: <AgentContent />,
  },
};

const subPageOrder = ['aws-account', 'bedrock', 'local-llm', 'sagemaker', 'mcp', 'agents'];

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

        {/* Why Deploy or Use AI Models section */}
        <Paper p="lg" withBorder radius="md" mb="xl">
          <Title order={3} mb="md">Why Deploy or Use AI Models?</Title>
          <Text size="md" mb="md">
            As a business professional, you might wonder: <Text span fw={600} fs="italic">&quot;Why would I need to 
            deploy or use AI models directly?&quot;</Text> Here&apos;s why this matters:
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
            <Box>
              <Text fw={600} size="sm" c="green" mb="xs">📊 Data Analysis at Scale</Text>
              <Text size="sm">
                Process thousands of documents, extract insights from customer feedback, 
                or analyze market trends—tasks that would take humans weeks.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="blue" mb="xs">🔧 Custom Business Solutions</Text>
              <Text size="sm">
                Build AI tools tailored to your company&apos;s needs—customer support bots, 
                report generators, or inventory forecasting systems.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="violet" mb="xs">🔒 Privacy &amp; Control</Text>
              <Text size="sm">
                Keep sensitive data in-house by running models locally or in your own 
                cloud environment instead of sending data to third parties.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="orange" mb="xs">💡 Competitive Advantage</Text>
              <Text size="sm">
                Companies that can leverage AI effectively move faster. Understanding 
                AI deployment gives you skills to lead digital transformation.
              </Text>
            </Box>
          </SimpleGrid>
          <Text size="sm" c="dimmed">
            This module covers multiple approaches—from simple API calls to building 
            autonomous agents—so you can choose the right tool for each business problem.
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
              <Text fw={600} size="sm" c="pink" mb="xs">MCP (Model Context Protocol)</Text>
              <Text size="sm">
                Best for connecting AI to your data sources. Lets Claude access 
                files, databases, and APIs securely.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="indigo" mb="xs">AI Agents</Text>
              <Text size="sm">
                Best for autonomous task completion. Agents can reason, use tools, 
                and complete multi-step workflows on their own.
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
