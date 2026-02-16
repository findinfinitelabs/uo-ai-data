import React from 'react';
import { Link } from 'react-router-dom';
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
  Alert,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconServer,
  IconRocket,
  IconCloud,
  IconAlertCircle,
} from '@tabler/icons-react';

export default function Module4Page() {
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

      <Alert icon={<IconAlertCircle />} color="orange" variant="light" mb="xl">
        <Text fw={600} mb="xs">
          ⚠️ AWS Environment Setup Required
        </Text>
        <Text size="sm">
          Before continuing with this module, you must complete the{' '}
          <Anchor component={Link} to="/aws-setup" fw={600}>
            AWS Environment Setup
          </Anchor>{' '}
          to deploy your infrastructure. This is available in the navigation sidebar under "Your Progress."
        </Text>
      </Alert>

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

      <Group justify="space-between">
        <Button
          component={Link}
          to="/ethical-ai"
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
