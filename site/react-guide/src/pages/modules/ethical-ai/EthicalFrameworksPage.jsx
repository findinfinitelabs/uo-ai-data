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
  List,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconShieldCheck,
  IconWorld,
  IconScale,
  IconBulb,
  IconCircleCheck,
  IconExternalLink,
} from '@tabler/icons-react';

// Import content components
import MajorFrameworksContent from './frameworks/MajorFrameworksContent';
import FrameworkComparisonContent from './frameworks/FrameworkComparisonContent';
import PracticalApplicationContent from './frameworks/PracticalApplicationContent';
import CommonPitfallsContent from './frameworks/CommonPitfallsContent';
import styles from './EthicalAI.module.css';

// Sub-page configuration
const subPages = {
  'major-frameworks': {
    title: 'Major Frameworks',
    subtitle: 'EU AI Act, IEEE, OECD, and NIST standards',
    icon: IconWorld,
    color: 'blue',
    content: <MajorFrameworksContent />,
  },
  'comparison': {
    title: 'Framework Comparison',
    subtitle: 'Understanding legal status and scope',
    icon: IconScale,
    color: 'teal',
    content: <FrameworkComparisonContent />,
  },
  'practical-application': {
    title: 'Practical Application',
    subtitle: 'Implementing frameworks in your projects',
    icon: IconBulb,
    color: 'orange',
    content: <PracticalApplicationContent />,
  },
  'common-pitfalls': {
    title: 'Common Pitfalls',
    subtitle: 'Mistakes to avoid and compliance checklist',
    icon: IconCircleCheck,
    color: 'green',
    content: <CommonPitfallsContent />,
  },
};

const subPageOrder = ['major-frameworks', 'comparison', 'practical-application', 'common-pitfalls'];

export default function EthicalFrameworksPage() {
  const { frameworkSubPage } = useParams();

  // If no sub-page, show the overview with links
  if (!frameworkSubPage) {
    return (
      <Container size="lg" py="xl">
        <Breadcrumbs mb="lg">
          <Anchor component={Link} to="/" size="sm">
            Home
          </Anchor>
          <Anchor component={Link} to="/ethical-ai" size="sm">
            Module 3: Ethical AI
          </Anchor>
          <Text size="sm">Ethical Frameworks</Text>
        </Breadcrumbs>

        <Paper
          shadow="md"
          radius="lg"
          p="xl"
          mb="xl"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
          }}
        >
          <Group gap="md" mb="md">
            <ThemeIcon color="white" size={56} radius="xl" variant="light">
              <IconShieldCheck size={28} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="white" opacity={0.9} tt="uppercase" fw={700} mb={4}>
                MODULE 3 - ETHICAL AI
              </Text>
              <Title order={1} c="white">
                Ethical Frameworks
              </Title>
            </Box>
          </Group>
          <Text size="lg" c="white" opacity={0.95}>
            Navigate the landscape of ethical AI frameworks, from voluntary guidelines to legally binding regulations.
          </Text>
        </Paper>

        {/* Introduction */}
        <Text size="lg" mb="lg">
          Ethical AI frameworks provide structured approaches to building responsible AI systems. 
          Understanding these frameworks—from voluntary guidelines to legally binding regulations—helps 
          data scientists navigate the complex landscape of AI ethics and ensure compliance.
        </Text>

        {/* Real-World Case Study */}
        <Paper p="lg" radius="md" className={styles.caseStudyCard} mb="xl">
          <Group mb="md">
            <Badge color="blue" size="lg" variant="filled">CASE STUDY</Badge>
            <Text fw={700} size="lg">EU AI Act Enforcement: Clearview AI (2022-2024)</Text>
          </Group>
          
          <Text mb="md">
            Clearview AI, a facial recognition company, scraped billions of images from social media 
            to build a facial recognition database sold to law enforcement. Multiple EU data protection 
            authorities found the company in violation of GDPR and emerging AI regulations.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
            <Box>
              <Text fw={600} c="red.7" mb="xs">Violations Identified</Text>
              <List size="sm" spacing="xs">
                <List.Item>No legal basis for data collection (GDPR Art. 6)</List.Item>
                <List.Item>No consent from individuals whose faces were used</List.Item>
                <List.Item>Processing of biometric data without explicit consent</List.Item>
                <List.Item>Failed to respond to data subject access requests</List.Item>
                <List.Item>No transparency about data processing</List.Item>
              </List>
            </Box>
            <Box>
              <Text fw={600} c="orange.7" mb="xs">Consequences</Text>
              <List size="sm" spacing="xs">
                <List.Item>€20 million fine from Italian DPA (2022)</List.Item>
                <List.Item>€20 million fine from Greek DPA (2022)</List.Item>
                <List.Item>£7.5 million fine from UK ICO (2022)</List.Item>
                <List.Item>Ordered to delete all EU citizen data</List.Item>
                <List.Item>Banned from operating in multiple countries</List.Item>
              </List>
            </Box>
          </SimpleGrid>

          <Text size="sm" c="dimmed" fs="italic">
            <Text span fw={600}>Lesson: </Text>
            {"Even if technology is innovative, it must comply with existing data protection laws and emerging AI-specific regulations. \"Move fast and break things\" doesn't work with AI ethics."}
          </Text>
        </Paper>

        <Divider my="xl" />

        <Title order={2} mb="lg">
          Explore Framework Topics
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
                to={`/ethical-ai/frameworks/${key}`}
                style={{ textDecoration: 'none', cursor: 'pointer' }}
                className={styles.frameworkCard}
              >
                <Group mb="md">
                  <ThemeIcon color={page.color} size={50} radius="xl">
                    <Icon size={26} />
                  </ThemeIcon>
                  <Box>
                    <Badge color={page.color} variant="light" size="sm">
                      TOPIC {index + 1}
                    </Badge>
                    <Title order={4}>{page.title}</Title>
                  </Box>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  {page.subtitle}
                </Text>
                <Text size="sm" c={page.color} fw={600}>
                  Learn More →
                </Text>
              </Card>
            );
          })}
        </SimpleGrid>

        <Divider my="xl" />

        <Group justify="space-between">
          <Button
            component={Link}
            to="/ethical-ai/bias-detection"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Previous: Bias Detection
          </Button>
          <Button
            component={Link}
            to="/ethical-ai/documentation"
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
          >
            Next: Documenting Decisions
          </Button>
        </Group>
      </Container>
    );
  }

  // Check if the subpage exists
  const currentPage = subPages[frameworkSubPage];
  if (!currentPage) {
    return (
      <Container size="lg" py="xl">
        <Title order={2} mb="md">
          Page Not Found
        </Title>
        <Text mb="md">{"The requested framework page doesn't exist."}</Text>
        <Button component={Link} to="/ethical-ai/frameworks" mt="md">
          Back to Frameworks Overview
        </Button>
      </Container>
    );
  }

  // Find the index of the current page for navigation
  const currentIndex = subPageOrder.indexOf(frameworkSubPage);
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
        <Anchor component={Link} to="/ethical-ai/frameworks" size="sm">
          Ethical Frameworks
        </Anchor>
        <Text size="sm">{currentPage.title}</Text>
      </Breadcrumbs>

      <Paper
        shadow="md"
        radius="lg"
        p="xl"
        mb="xl"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
        }}
      >
        <Group gap="md" mb="md">
          <ThemeIcon color="white" size={56} radius="xl" variant="light">
            <Icon size={28} />
          </ThemeIcon>
          <Box>
            <Text size="xs" c="white" opacity={0.9} tt="uppercase" fw={700} mb={4}>
              MODULE 3 - ETHICAL FRAMEWORKS
            </Text>
            <Title order={1} c="white">
              {currentPage.title}
            </Title>
          </Box>
        </Group>
        <Text size="lg" c="white" opacity={0.95}>
          {currentPage.subtitle}
        </Text>
      </Paper>

      {/* Render the current page content */}
      <Box mb="xl">{currentPage.content}</Box>

      <Divider my="xl" />

      <Group justify="space-between">
        {prevPage ? (
          <Button
            component={Link}
            to={`/ethical-ai/frameworks/${prevPage}`}
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Previous: {subPages[prevPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/ethical-ai/frameworks"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Overview
          </Button>
        )}

        {nextPage ? (
          <Button
            component={Link}
            to={`/ethical-ai/frameworks/${nextPage}`}
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
          >
            Next: {subPages[nextPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/ethical-ai/documentation"
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
          >
            Next: Documenting Decisions
          </Button>
        )}
      </Group>
    </Container>
  );
}
