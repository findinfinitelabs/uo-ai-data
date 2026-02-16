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
  IconServer,
  IconRocket,
  IconCloud,
  IconBrandAws,
} from '@tabler/icons-react';

// Import content components
import DeploymentGuideContent from './ai-setup/DeploymentGuideContent';

// Sub-page configuration
const subPages = {
  'deployment': {
    title: 'Infrastructure Deployment',
    subtitle: 'Deploy complete AI infrastructure on AWS',
    icon: IconRocket,
    color: 'blue',
    content: <DeploymentGuideContent />,
  },
};

const subPageOrder = ['deployment'];

export default function Module4Page() {
  const { subPage } = useParams();

  // If no subpage, show the overview with links
  if (!subPage) {
    return (
      <Container size="lg" py="xl">
        <Breadcrumbs mb="lg">
          <Anchor component={Link} to="/" size="sm">
            Home
          </Anchor>
          <Text size="sm">Module 4: Using AI</Text>
        </Breadcrumbs>

        <Paper
          shadow="md"
          radius="lg"
          p="xl"
          mb="xl"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Group gap="md" mb="md">
            <ThemeIcon color="white" size={56} radius="xl" variant="light">
              <IconServer size={28} />
            </ThemeIcon>
            <Box>
              <Badge color="white" variant="light" size="lg" mb="xs">
                MODULE 4
              </Badge>
              <Title order={1} c="white">
                Using AI
              </Title>
            </Box>
          </Group>
          <Text size="lg" c="white" opacity={0.95}>
            Set up your AI learning environment using AWS Bedrock (school login) or run models locally on your Mac.
          </Text>
        </Paper>

        <Title order={2} mb="lg">
          Getting Started
        </Title>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="xl">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon size={40} color="blue" radius="md">
                <IconCloud size={24} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="lg">
                  Cloud Option
                </Text>
                <Text size="sm" c="dimmed">
                  AWS Bedrock
                </Text>
              </Box>
            </Group>
            <Text size="sm" mb="md">
              Use your UO credentials to access powerful cloud-hosted models like Claude 3, Llama 3, and Mistral.
            </Text>
            <Text size="sm" mb="xs" fw={600}>
              ✓ No local setup required
            </Text>
            <Text size="sm" mb="xs" fw={600}>
              ✓ Access to latest models
            </Text>
            <Text size="sm" mb="xs" fw={600}>
              ✓ UO SSO authentication
            </Text>
            <Text size="sm" c="orange">
              ⚠ Requires internet connection
            </Text>
          </Card>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <ThemeIcon size={40} color="green" radius="md">
                <IconRocket size={24} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="lg">
                  Local Option
                </Text>
                <Text size="sm" c="dimmed">
                  Ollama on Mac
                </Text>
              </Box>
            </Group>
            <Text size="sm" mb="md">
              Run open-source models directly on your MacBook for complete privacy and offline access.
            </Text>
            <Text size="sm" mb="xs" fw={600}>
              ✓ 100% private—data stays local
            </Text>
            <Text size="sm" mb="xs" fw={600}>
              ✓ No API costs
            </Text>
            <Text size="sm" mb="xs" fw={600}>
              ✓ Works offline
            </Text>
            <Text size="sm" c="orange">
              ⚠ Requires 8GB+ RAM
            </Text>
          </Card>
        </SimpleGrid>

        <Divider my="xl" />

        <Title order={2} mb="lg">
          Topics
        </Title>

        <SimpleGrid cols={{ base: 1, md: 1 }} spacing="md" mb="xl">
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
                to={`/module-4/${key}`}
                style={{ textDecoration: 'none', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Group>
                  <ThemeIcon size={48} radius="md" color={page.color}>
                    <Icon size={28} />
                  </ThemeIcon>
                  <Box style={{ flex: 1 }}>
                    <Text fw={600} size="lg">
                      {page.title}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {page.subtitle}
                    </Text>
                  </Box>
                  <IconArrowRight size={20} style={{ opacity: 0.5 }} />
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>

        <Divider my="xl" />

        <Group justify="space-between">
          <Button
            component={Link}
            to="/module-3"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Previous Module: Ethical AI
          </Button>
          <Button
            component={Link}
            to="/module-5"
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
          >
            Next Module: Synthetic Data
          </Button>
        </Group>
      </Container>
    );
  }

  // Show the selected subpage content
  const currentPage = subPages[subPage];
  if (!currentPage) {
    return (
      <Container size="lg" py="xl">
        <Text>Page not found</Text>
      </Container>
    );
  }

  const currentIndex = subPageOrder.indexOf(subPage);
  const prevPage = currentIndex > 0 ? subPageOrder[currentIndex - 1] : null;
  const nextPage =
    currentIndex < subPageOrder.length - 1 ? subPageOrder[currentIndex + 1] : null;

  const Icon = currentPage.icon;

  return (
    <Container size="lg" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/" size="sm">
          Home
        </Anchor>
        <Anchor component={Link} to="/module-4" size="sm">
          Module 4: Using AI
        </Anchor>
        <Text size="sm">{currentPage.title}</Text>
      </Breadcrumbs>

      <Paper shadow="sm" radius="md" p="xl" mb="xl" withBorder>
        <Group gap="md" mb="md">
          <ThemeIcon color={currentPage.color} size={56} radius="md">
            <Icon size={28} />
          </ThemeIcon>
          <Box>
            <Title order={1}>{currentPage.title}</Title>
            <Text c="dimmed">{currentPage.subtitle}</Text>
          </Box>
        </Group>
      </Paper>

      <Paper shadow="sm" radius="md" p="xl" mb="xl">
        {currentPage.content}
      </Paper>

      <Divider my="xl" />

      <Group justify="space-between">
        {prevPage ? (
          <Button
            component={Link}
            to={`/module-4/${prevPage}`}
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            {subPages[prevPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/module-3"
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
          >
            Previous Module: Ethical AI
          </Button>
        )}

        {nextPage ? (
          <Button
            component={Link}
            to={`/module-4/${nextPage}`}
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
          >
            {subPages[nextPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/module-5"
            variant="filled"
            rightSection={<IconArrowRight size={16} />}
          >
            Next Module: Synthetic Data
          </Button>
        )}
      </Group>
    </Container>
  );
}
