import React, { useEffect, useMemo, useState } from 'react';
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
  Button,
  Anchor,
  Breadcrumbs,
  Alert,
  Stepper,
  List,
  Code,
  Progress,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconServer,
  IconRocket,
  IconAlertCircle,
  IconCircleCheck,
  IconLogin,
  IconTerminal2,
  IconBrandAws,
  IconExternalLink,
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
          Complete this interactive setup timeline for AWS Innovation Sandbox SSO and deployment.
        </Text>
      </Paper>

      <Alert icon={<IconAlertCircle />} color="orange" variant="light" mb="xl">
        <Text fw={600} mb="xs">
          ⚠️ Complete each step in order
        </Text>
        <Text size="sm">
          Click the current step, do the action, then select <Code>Mark complete &amp; continue</Code>. The timeline advances automatically.
        </Text>
      </Alert>

      <Paper withBorder radius="md" p="lg" mb="xl">
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <IconLogin size={18} />
            <Text fw={600}>Module 4 Setup Timeline</Text>
          </Group>
          <Text size="sm" c="dimmed">
            {completedCount} / {totalSteps} complete
          </Text>
        </Group>
        <Progress value={progress} size="lg" radius="xl" mb="md" />

        <Stepper
          active={activeStep}
          onStepClick={handleStepClick}
          orientation="vertical"
          allowNextStepsSelect={false}
          iconSize={28}
        >
          {steps.map((step, index) => (
            <Stepper.Step
              key={step.title}
              label={`Step ${index + 1}`}
              description={step.title}
              completedIcon={<IconCircleCheck size={16} />}
              icon={index === 6 || index === 15 ? <IconTerminal2 size={16} /> : index === 16 ? <IconBrandAws size={16} /> : undefined}
            >
              <Paper withBorder radius="md" p="md" mt="xs">
                <Text fw={600} mb="xs">
                  {step.title}
                </Text>
                {step.detail}
                <Divider my="md" />
                <Button
                  size="xs"
                  onClick={markCompleteAndContinue}
                  disabled={Boolean(completedSteps[index]) || activeStep !== index}
                  leftSection={completedSteps[index] ? <IconCircleCheck size={14} /> : null}
                >
                  {completedSteps[index] ? 'Completed' : 'Mark complete & continue'}
                </Button>
              </Paper>
            </Stepper.Step>
          ))}
        </Stepper>
      </Paper>

      <Paper withBorder radius="md" p="lg" mb="xl">
        <Text fw={600} mb="sm">Quick checklist</Text>
        <List spacing="xs" size="sm">
          <List.Item>Innovation Sandbox login successful</List.Item>
          <List.Item>AWS account and role selected correctly</List.Item>
          <List.Item><Code>aws configure sso</Code> completed with <Code>us-west-2</Code></List.Item>
          <List.Item><Code>./deploy-all.sh</Code> executed from <Code>deployment-scripts</Code></List.Item>
        </List>
      </Paper>

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
