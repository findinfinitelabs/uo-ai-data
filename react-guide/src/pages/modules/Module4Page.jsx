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
  const STORAGE_KEY = 'module4TimelineProgress';

  const steps = useMemo(
    () => [
      {
        title: 'Log in to AWS Innovation Sandbox',
        detail: (
          <Text size="sm">
            Open{' '}
            <Anchor href="https://d-9267f25f0e.awsapps.com/start/#/?tab=applications" target="_blank">
              Innovation Sandbox <IconExternalLink size={12} />
            </Anchor>{' '}
            and sign in.
          </Text>
        ),
      },
      {
        title: 'Get your AWS account ID',
        detail: (
          <Text size="sm">
            Open{' '}
            <Anchor href="https://d1xn1vzs9anoa4.cloudfront.net/" target="_blank">
              account lookup page <IconExternalLink size={12} />
            </Anchor>{' '}
            and copy your account ID.
          </Text>
        ),
      },
      {
        title: 'Confirm your account ID',
        detail: (
          <Text size="sm">
            Example account ID is <Code>631285163678</Code>. Your value may be different.
          </Text>
        ),
      },
      {
        title: 'Click Login to account',
        detail: <Text size="sm">In the AWS app portal, choose <Code>Login to account</Code>.</Text>,
      },
      {
        title: 'Select your role',
        detail: <Text size="sm">Choose the role assigned to your class access.</Text>,
      },
      {
        title: 'Open VS Code terminal in deployment-scripts',
        detail: (
          <Box>
            <Text size="sm" mb="xs">In VS Code, open terminal and move to the deployment folder:</Text>
            <Code block>cd deployment-scripts</Code>
          </Box>
        ),
      },
      {
        title: 'Run AWS SSO configuration',
        detail: <Code block>aws configure sso</Code>,
      },
      {
        title: 'SSO Session Name',
        detail: <Text size="sm">Use <Code>Winter 2026 Data and AI Training</Code>.</Text>,
      },
      {
        title: 'Start URL',
        detail: <Text size="sm">Use <Code>https://d-9267f25f0e.awsapps.com/start</Code>.</Text>,
      },
      {
        title: 'SSO Region',
        detail: <Text size="sm">Use <Code>us-west-2</Code>.</Text>,
      },
      {
        title: 'Registration scope',
        detail: <Text size="sm">Accept the default scope value.</Text>,
      },
      {
        title: 'Choose account',
        detail: <Text size="sm">When account options appear, select the account you logged into.</Text>,
      },
      {
        title: 'Choose role users',
        detail: <Text size="sm">Select <Code>users</Code> for role selection.</Text>,
      },
      {
        title: 'Default region',
        detail: <Text size="sm">Use <Code>us-west-2</Code> as the default AWS region.</Text>,
      },
      {
        title: 'Output format',
        detail: <Text size="sm">Accept the default output format option.</Text>,
      },
      {
        title: 'Identity check',
        detail: (
          <Text size="sm">
            Your AWS identity may appear as an email or student-number-style value. That variation is expected across students.
          </Text>
        ),
      },
      {
        title: 'Run deployment',
        detail: (
          <Box>
            <Text size="sm" mb="xs">From <Code>deployment-scripts</Code>, run:</Text>
            <Code block>./deploy-all.sh</Code>
          </Box>
        ),
      },
      {
        title: 'Provide credentials when prompted',
        detail: <Text size="sm">During deployment, enter any required credentials to continue.</Text>,
      },
    ],
    []
  );

  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  const totalSteps = steps.length;
  const completedCount = Object.keys(completedSteps).length;
  const progress = Math.round((completedCount / totalSteps) * 100);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(STORAGE_KEY);
      if (!savedProgress) {
        return;
      }

      const parsed = JSON.parse(savedProgress);
      if (typeof parsed.activeStep === 'number') {
        const clampedStep = Math.max(0, Math.min(parsed.activeStep, totalSteps - 1));
        setActiveStep(clampedStep);
      }

      if (parsed.completedSteps && typeof parsed.completedSteps === 'object') {
        const sanitizedCompleted = Object.entries(parsed.completedSteps).reduce((acc, [key, value]) => {
          const index = Number(key);
          if (Number.isInteger(index) && index >= 0 && index < totalSteps && value === true) {
            acc[index] = true;
          }
          return acc;
        }, {});
        setCompletedSteps(sanitizedCompleted);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [totalSteps]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeStep,
        completedSteps,
      })
    );
  }, [activeStep, completedSteps]);

  const markCompleteAndContinue = () => {
    setCompletedSteps((prev) => ({ ...prev, [activeStep]: true }));
    if (activeStep < totalSteps - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex === activeStep) {
      markCompleteAndContinue();
      return;
    }

    if (stepIndex < activeStep) {
      setActiveStep(stepIndex);
    }
  };

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
