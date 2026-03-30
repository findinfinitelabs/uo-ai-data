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
  IconChartBar,
  IconChartDots,
  IconEye,
  IconShield,
  IconAlertTriangle,
  IconExternalLink,
  IconUsers,
  IconScale,
} from '@tabler/icons-react';

// Import content components
import TailsProblemContent from './bias-detection/TailsProblemContent';
import BiasDetectionStrategiesContent from './bias-detection/BiasDetectionStrategiesContent';
import BiasMitigationContent from './bias-detection/BiasMitigationContent';
import CommonPitfallsContent from './bias-detection/CommonPitfallsContent';
import styles from './EthicalAI.module.css';

// Sub-page configuration
const subPages = {
  'tails-problem': {
    title: 'The Tails Problem',
    subtitle: 'Where bias hides in tail distributions',
    icon: IconChartDots,
    color: 'orange',
    content: <TailsProblemContent />,
  },
  'detection-strategies': {
    title: 'Detection Strategies',
    subtitle: 'How to identify bias in your models',
    icon: IconEye,
    color: 'blue',
    content: <BiasDetectionStrategiesContent />,
  },
  'mitigation': {
    title: 'Bias Mitigation',
    subtitle: 'Techniques to reduce unfair bias',
    icon: IconShield,
    color: 'green',
    content: <BiasMitigationContent />,
  },
  'common-pitfalls': {
    title: 'Common Pitfalls',
    subtitle: 'Mistakes to avoid',
    icon: IconAlertTriangle,
    color: 'red',
    content: <CommonPitfallsContent />,
  },
};

const subPageOrder = ['tails-problem', 'detection-strategies', 'mitigation', 'common-pitfalls'];

export default function BiasDetectionPage() {
  const { biasSubPage } = useParams();

  // If no sub-page, show the overview with links
  if (!biasSubPage) {
    return (
      <Container size="lg" py="xl">
        <Breadcrumbs mb="lg">
          <Anchor component={Link} to="/" size="sm">
            Home
          </Anchor>
          <Anchor component={Link} to="/ethical-ai" size="sm">
            Module 3: Ethical AI
          </Anchor>
          <Text size="sm">Bias Detection & Mitigation</Text>
        </Breadcrumbs>

        <Paper
          shadow="md"
          radius="lg"
          p="xl"
          mb="xl"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
          }}
        >
          <Group gap="md" mb="md">
            <ThemeIcon color="white" size={56} radius="xl" variant="light">
              <IconChartBar size={28} />
            </ThemeIcon>
            <Box>
              <Text size="xs" c="white" opacity={0.9} tt="uppercase" fw={700} mb={4}>
                MODULE 3 - ETHICAL AI
              </Text>
              <Title order={1} c="white">
                Bias Detection & Mitigation
              </Title>
            </Box>
          </Group>
          <Text size="lg" c="white" opacity={0.95}>
            Learn to identify and address unfair biases in AI systems, especially those hidden in tail distributions.
          </Text>
        </Paper>

        {/* Introduction */}
        <Text size="lg" mb="lg">
          Bias in AI systems can lead to unfair outcomes that disproportionately affect certain groups. 
          Learning to detect and mitigate bias is essential for any data scientist or developer working with AI, 
          especially in high-stakes domains like healthcare.
        </Text>

        {/* Real-World Case Study */}
        <Paper p="lg" radius="md" className={styles.caseStudyCard} mb="xl">
          <Group mb="md">
            <Badge color="blue" size="lg" variant="filled">CASE STUDY</Badge>
            <Text fw={700} size="lg">{"Amazon's AI Recruiting Tool (2018)"}</Text>
          </Group>
          
          <Text mb="md">
            {"Amazon developed an AI-powered recruiting tool to automate resume screening. The system was trained on 10 years of historical hiring data—which predominantly reflected male candidates in technical roles. The algorithm learned to penalize resumes containing words like \"women's\" (as in \"women's chess club captain\") and downgraded graduates of all-women's colleges."}
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
            <Box>
              <Text fw={600} c="red.7" mb="xs">What Went Wrong</Text>
              <List size="sm" spacing="xs">
                <List.Item>Training data reflected historical hiring bias</List.Item>
                <List.Item>No demographic parity testing before deployment</List.Item>
                <List.Item>Proxy variables (college names, activities) encoded gender</List.Item>
                <List.Item>Lack of diverse perspectives in development team</List.Item>
              </List>
            </Box>
            <Box>
              <Text fw={600} c="green.7" mb="xs">How It Was Discovered</Text>
              <List size="sm" spacing="xs">
                <List.Item>Internal audit revealed gender disparities</List.Item>
                <List.Item>Comparison of recommendations vs. actual performance</List.Item>
                <List.Item>Pattern analysis on rejected candidates</List.Item>
                <List.Item>Employee whistleblowing to leadership</List.Item>
              </List>
            </Box>
          </SimpleGrid>

          <Text size="sm" c="dimmed" fs="italic">
            <Text span fw={600}>Source: </Text>
            {"Reuters. (2018). \"Amazon scraps secret AI recruiting tool that showed bias against women.\""}
            <Anchor href="https://www.reuters.com/article/us-amazon-com-jobs-automation-insight-idUSKCN1MK08G" target="_blank" ml="xs">
              Read Article <IconExternalLink size={12} />
            </Anchor>
          </Text>
        </Paper>

        {/* Types of Bias */}
        <Title order={2} mb="md">Types of Bias to Watch For</Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mb="xl">
          <Card shadow="xs" padding="md" radius="md" withBorder>
            <ThemeIcon color="red" size={40} radius="xl" mb="sm">
              <IconUsers size={20} />
            </ThemeIcon>
            <Text fw={600}>Selection Bias</Text>
            <Text size="sm" c="dimmed">
              {"Training data doesn't represent the full population. Example: Medical AI trained only on data from academic medical centers misses patterns common in community hospitals."}
            </Text>
          </Card>
          
          <Card shadow="xs" padding="md" radius="md" withBorder>
            <ThemeIcon color="orange" size={40} radius="xl" mb="sm">
              <IconChartBar size={20} />
            </ThemeIcon>
            <Text fw={600}>Measurement Bias</Text>
            <Text size="sm" c="dimmed">
              Features are measured differently across groups. Example: Pain assessment tools validated 
              primarily on white patients may underestimate pain in Black patients.
            </Text>
          </Card>
          
          <Card shadow="xs" padding="md" radius="md" withBorder>
            <ThemeIcon color="grape" size={40} radius="xl" mb="sm">
              <IconScale size={20} />
            </ThemeIcon>
            <Text fw={600}>Historical Bias</Text>
            <Text size="sm" c="dimmed">
              Past discrimination is encoded in data. Example: Loan approval models trained on historical 
              data perpetuate redlining patterns.
            </Text>
          </Card>
        </SimpleGrid>

        <Divider my="xl" />

        <Title order={2} mb="lg">
          Deep Dive Topics
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
                to={`/ethical-ai/bias-detection/${key}`}
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
            to="/ethical-ai"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Ethical AI
          </Button>
          <Button
            component={Link}
            to="/ethical-ai/frameworks"
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
          >
            Next: Ethical Frameworks
          </Button>
        </Group>
      </Container>
    );
  }

  // Check if the subpage exists
  const currentPage = subPages[biasSubPage];
  if (!currentPage) {
    return (
      <Container size="lg" py="xl">
        <Title order={2} mb="md">
          Page Not Found
        </Title>
        <Text mb="md">{"The requested bias detection page doesn't exist."}</Text>
        <Button component={Link} to="/ethical-ai/bias-detection" mt="md">
          Back to Bias Detection Overview
        </Button>
      </Container>
    );
  }

  // Find the index of the current page for navigation
  const currentIndex = subPageOrder.indexOf(biasSubPage);
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
        <Anchor component={Link} to="/ethical-ai/bias-detection" size="sm">
          Bias Detection & Mitigation
        </Anchor>
        <Text size="sm">{currentPage.title}</Text>
      </Breadcrumbs>

      <Paper
        shadow="md"
        radius="lg"
        p="xl"
        mb="xl"
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
        }}
      >
        <Group gap="md" mb="md">
          <ThemeIcon color="white" size={56} radius="xl" variant="light">
            <Icon size={28} />
          </ThemeIcon>
          <Box>
            <Text size="xs" c="white" opacity={0.9} tt="uppercase" fw={700} mb={4}>
              MODULE 3 - BIAS DETECTION
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

      <Paper shadow="sm" radius="md" p="xl" mb="xl">
        {currentPage.content}
      </Paper>

      <Divider my="xl" />

      <Group justify="space-between">
        {prevPage ? (
          <Button
            component={Link}
            to={`/ethical-ai/bias-detection/${prevPage}`}
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            {subPages[prevPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/ethical-ai/bias-detection"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Overview
          </Button>
        )}

        {nextPage ? (
          <Button
            component={Link}
            to={`/ethical-ai/bias-detection/${nextPage}`}
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
          >
            {subPages[nextPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/ethical-ai/frameworks"
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
          >
            Next: Ethical Frameworks
          </Button>
        )}
      </Group>
    </Container>
  );
}
