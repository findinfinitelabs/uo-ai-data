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
  IconScale,
  IconChartBar,
  IconGavel,
  IconFileText,
  IconUsers,
} from '@tabler/icons-react';

// Import content components
import {
  DocumentingDecisionsContent,
  HumanInLoopContent,
  styles,
} from './ethical-ai';
import BiasDetectionPage from './ethical-ai/BiasDetectionPage';
import EthicalFrameworksPage from './ethical-ai/EthicalFrameworksPage';

// Sub-page configuration
const subPages = {
  'bias-detection': {
    title: 'Bias Detection & Mitigation',
    subtitle: 'Identify and address unfair biases in AI systems',
    icon: IconChartBar,
    color: 'red',
    // Handled by BiasDetectionPage component
  },
  'frameworks': {
    title: 'Ethical AI Frameworks',
    subtitle: 'IEEE, EU AI Act, OECD, and NIST guidelines',
    icon: IconGavel,
    color: 'blue',
    // Handled by EthicalFrameworksPage component
  },
  'documentation': {
    title: 'Documenting AI Decisions',
    subtitle: 'Model cards, datasheets, and audit trails',
    icon: IconFileText,
    color: 'green',
    content: <DocumentingDecisionsContent />,
  },
  'human-in-loop': {
    title: 'Human-in-the-Loop Design',
    subtitle: 'Keeping humans central to AI decisions',
    icon: IconUsers,
    color: 'grape',
    content: <HumanInLoopContent />,
  },
};

const subPageOrder = ['bias-detection', 'frameworks', 'documentation', 'human-in-loop'];

export default function EthicalAIPage() {
  const { subPage, biasSubPage, frameworkSubPage } = useParams();

  // Special handling for bias-detection pages (nested routing)
  if (subPage === 'bias-detection' || biasSubPage) {
    return <BiasDetectionPage />;
  }

  // Special handling for frameworks pages (nested routing)
  if (subPage === 'frameworks' || frameworkSubPage) {
    return <EthicalFrameworksPage />;
  }

  // If no subpage, show the overview with links
  if (!subPage) {
    return (
      <Container size="lg" py="xl">
        <Breadcrumbs mb="lg">
          <Anchor component={Link} to="/" size="sm">
            Home
          </Anchor>
          <Text size="sm">Module 3: Ethical AI</Text>
        </Breadcrumbs>

        <Paper
          shadow="md"
          radius="lg"
          p="xl"
          mb="xl"
          className={styles.hero}
        >
          <Group gap="md" mb="md">
            <ThemeIcon color="grape" size={56} radius="xl">
              <IconScale size={28} />
            </ThemeIcon>
            <Box>
              <Badge color="grape" variant="filled" size="lg" mb="xs">
                MODULE 3
              </Badge>
              <Title order={1}>Ethical AI</Title>
            </Box>
          </Group>
          <Text size="lg" maw={700}>
            Build AI systems that are fair, transparent, and accountable. Learn to detect and 
            mitigate bias, navigate regulatory frameworks, document your decisions, and keep 
            humans in control.
          </Text>
        </Paper>

        <Title order={2} mb="lg">
          {"What You'll Learn"}
        </Title>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
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
                component={Link}
                to={`/ethical-ai/${key}`}
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                className={styles.frameworkCard}
              >
                <Group mb="md">
                  <ThemeIcon color={page.color} size={50} radius="xl">
                    <Icon size={26} />
                  </ThemeIcon>
                  <Box>
                    <Badge color={page.color} variant="light" size="sm">
                      LESSON {index + 1}
                    </Badge>
                    <Title order={4}>{page.title}</Title>
                  </Box>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  {page.subtitle}
                </Text>
                <Text size="sm" c={page.color} fw={600}>
                  Start Learning →
                </Text>
              </Card>
            );
          })}
        </SimpleGrid>

        <Divider my="xl" />

        <Paper p="lg" radius="md" bg="gray.0">
          <Group>
            <ThemeIcon color="grape" size={40} radius="xl">
              <IconScale size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={600}>Core Principle</Text>
              <Text size="sm" c="dimmed">
                AI should augment human decision-making, not replace it—especially in high-stakes 
                healthcare contexts. Every lesson in this module reinforces this principle.
              </Text>
            </Box>
          </Group>
        </Paper>
      </Container>
    );
  }

  // Check if the subpage exists
  const currentPage = subPages[subPage];
  if (!currentPage) {
    return (
      <Container size="lg" py="xl">
        <Title order={2} mb="md">
          Page Not Found
        </Title>
        <Text mb="md">{"The requested ethical AI page doesn't exist."}</Text>
        <Button component={Link} to="/ethical-ai" mt="md">
          Back to Ethical AI Overview
        </Button>
      </Container>
    );
  }

  // Find the index of the current page for navigation
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
        <Anchor component={Link} to="/ethical-ai" size="sm">
          Module 3: Ethical AI
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
              MODULE 3
            </Badge>
            <Title order={1}>{currentPage.title}</Title>
          </Box>
        </Group>
        <Text size="lg" maw={700}>
          {currentPage.subtitle}
        </Text>
      </Paper>

      {/* Render the content component */}
      {currentPage.content}

      {/* Navigation buttons */}
      <Divider my="xl" />
      <Group justify="space-between">
        {prevPage ? (
          <Button
            component={Link}
            to={`/ethical-ai/${prevPage}`}
            variant="outline"
            leftSection={<IconArrowLeft size={16} />}
          >
            Previous: {subPages[prevPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/ethical-ai"
            variant="outline"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Overview
          </Button>
        )}
        {nextPage ? (
          <Button
            component={Link}
            to={`/ethical-ai/${nextPage}`}
            rightSection={<IconArrowRight size={16} />}
          >
            Next: {subPages[nextPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/module-4"
            rightSection={<IconArrowRight size={16} />}
          >
            Next Module: Using AI
          </Button>
        )}
      </Group>
    </Container>
  );
}
