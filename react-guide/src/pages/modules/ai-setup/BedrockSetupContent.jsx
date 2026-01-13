import React, { useState } from 'react';
import {
  Title,
  Text,
  Paper,
  ThemeIcon,
  Group,
  Box,
  Alert,
  List,
  Card,
  Code,
  Divider,
  Anchor,
  Badge,
  Stack,
  Button,
  Checkbox,
  Stepper,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCloud,
  IconCircleCheck,
  IconBulb,
  IconAlertCircle,
  IconExternalLink,
  IconBrandAws,
  IconSchool,
  IconLogin,
  IconKey,
  IconCheck,
  IconCopy,
  IconRocket,
  IconShieldCheck,
} from '@tabler/icons-react';
import styles from './AISetup.module.css';

const CANVAS_AWS_URL = 'https://canvas.uoregon.edu';
const AWS_BEDROCK_CONSOLE = 'https://console.aws.amazon.com/bedrock';

const BedrockSetupContent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  const markStepComplete = (step) => {
    setCompletedSteps(prev => ({ ...prev, [step]: true }));
    if (step === activeStep && activeStep < 4) {
      setActiveStep(prev => prev + 1);
    }
  };

  const isStepComplete = (step) => completedSteps[step] === true;

  return (
    <>
      {/* Canvas SSO Section */}
      <Paper
        shadow="md"
        p="xl"
        radius="lg"
        mb="xl"
        className={styles.canvasCard}
      >
        <Group gap="md" mb="md">
          <ThemeIcon color="red" size={48} radius="xl">
            <IconSchool size={24} />
          </ThemeIcon>
          <Box>
            <Title order={3}>Access AWS via Canvas</Title>
            <Text c="dimmed" size="sm">
              Use your UO credentials to access AWS Academy
            </Text>
          </Box>
        </Group>

        <Alert icon={<IconBulb size={16} />} color="blue" mb="md">
          <Text size="sm">
            <Text span fw={600}>Good news!</Text> As a UO student, you have free access to AWS through 
            Canvas. No credit card or personal AWS account required.
          </Text>
        </Alert>

        <List spacing="sm" size="sm" mb="md">
          <List.Item icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
            Log into <Anchor href={CANVAS_AWS_URL} target="_blank">Canvas <IconExternalLink size={12} /></Anchor> with your UO credentials
          </List.Item>
          <List.Item icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
            Navigate to <Text span fw={600}>AWS Academy Learner Lab</Text> in your courses
          </List.Item>
          <List.Item icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
            Click <Text span fw={600}>"Start Lab"</Text> to launch your AWS environment
          </List.Item>
          <List.Item icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
            Click the <Text span fw={600}>AWS Console</Text> link when it turns green
          </List.Item>
        </List>

        <Button 
          component="a"
          href={CANVAS_AWS_URL}
          target="_blank"
          leftSection={<IconLogin size={16} />}
          rightSection={<IconExternalLink size={14} />}
          color="red"
        >
          Open Canvas
        </Button>
      </Paper>

      <Divider my="xl" label="Setup Steps" labelPosition="center" />

      {/* Interactive Stepper */}
      <Stepper 
        active={activeStep} 
        onStepClick={setActiveStep}
        orientation="vertical"
        mb="xl"
      >
        <Stepper.Step 
          label="Enable Bedrock Models" 
          description="Request access to foundation models"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Once in the AWS Console, you need to enable the AI models you want to use.
            </Text>
            
            <List spacing="sm" size="sm" mb="md" type="ordered">
              <List.Item>
                In the AWS Console search bar, type <Code>Bedrock</Code> and select it
              </List.Item>
              <List.Item>
                Click <Text span fw={600}>"Model access"</Text> in the left sidebar
              </List.Item>
              <List.Item>
                Click <Text span fw={600}>"Manage model access"</Text>
              </List.Item>
              <List.Item>
                Select the models you want to enable:
                <List size="xs" mt="xs" withPadding>
                  <List.Item><Badge size="sm" color="blue">Claude 3 Sonnet</Badge> - Best for healthcare text analysis</List.Item>
                  <List.Item><Badge size="sm" color="orange">Amazon Titan</Badge> - Good general purpose</List.Item>
                  <List.Item><Badge size="sm" color="green">Llama 3</Badge> - Open source option</List.Item>
                </List>
              </List.Item>
              <List.Item>
                Click <Text span fw={600}>"Request model access"</Text> and wait for approval (usually instant)
              </List.Item>
            </List>

            <Checkbox
              label="I have enabled at least one model in Bedrock"
              checked={isStepComplete(0)}
              onChange={() => markStepComplete(0)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Test in Bedrock Playground" 
          description="Send your first prompt"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Test that your models are working using the built-in playground.
            </Text>

            <List spacing="sm" size="sm" mb="md" type="ordered">
              <List.Item>
                In Bedrock, click <Text span fw={600}>"Playgrounds"</Text> → <Text span fw={600}>"Text"</Text>
              </List.Item>
              <List.Item>
                Select a model from the dropdown (e.g., Claude 3 Sonnet)
              </List.Item>
              <List.Item>
                Enter this test prompt:
                <Paper p="sm" bg="gray.0" radius="sm" mt="xs">
                  <Text size="xs" ff="monospace">
                    Create a simple JSON schema for a patient appointment record with fields for patient_id, date, time, and reason.
                  </Text>
                </Paper>
              </List.Item>
              <List.Item>
                Click <Text span fw={600}>"Run"</Text> and verify you get a response
              </List.Item>
            </List>

            <Checkbox
              label="I successfully tested a prompt in Bedrock Playground"
              checked={isStepComplete(1)}
              onChange={() => markStepComplete(1)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Get API Credentials" 
          description="For programmatic access"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              To use Bedrock from Python code, you need API credentials.
            </Text>

            <Alert icon={<IconShieldCheck size={16} />} color="yellow" mb="md">
              <Text size="sm">
                In AWS Academy, credentials are temporary and refresh when you restart your lab.
              </Text>
            </Alert>

            <List spacing="sm" size="sm" mb="md" type="ordered">
              <List.Item>
                In your AWS Academy Learner Lab, click <Text span fw={600}>"AWS Details"</Text>
              </List.Item>
              <List.Item>
                Click <Text span fw={600}>"Show"</Text> next to AWS CLI credentials
              </List.Item>
              <List.Item>
                Copy the credentials block - it looks like:
                <Paper p="sm" bg="dark.7" radius="sm" mt="xs">
                  <Code block style={{ fontSize: 11 }} c="green.4">
{`[default]
aws_access_key_id=ASIA...
aws_secret_access_key=abc123...
aws_session_token=IQoJb3J...`}
                  </Code>
                </Paper>
              </List.Item>
              <List.Item>
                Create/update <Code>~/.aws/credentials</Code> with these values
              </List.Item>
            </List>

            <Checkbox
              label="I have copied my AWS credentials"
              checked={isStepComplete(2)}
              onChange={() => markStepComplete(2)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Install Boto3" 
          description="AWS SDK for Python"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Install the AWS SDK to call Bedrock from Python.
            </Text>

            <Stack gap="sm" mb="md">
              <Group gap="xs">
                <Code>pip install boto3</Code>
                <CopyButton value="pip install boto3">
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied!' : 'Copy'}>
                      <ActionIcon size="sm" variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Stack>

            <Text size="sm" mb="sm" fw={500}>Test your setup:</Text>
            <Paper p="sm" bg="dark.7" radius="sm" mb="md">
              <Code block style={{ fontSize: 11 }} c="green.4">
{`import boto3

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

response = bedrock.invoke_model(
    modelId='anthropic.claude-3-sonnet-20240229-v1:0',
    body='{"anthropic_version":"bedrock-2023-05-31","max_tokens":256,"messages":[{"role":"user","content":"Hello!"}]}'
)

print(response['body'].read().decode())`}
              </Code>
            </Paper>

            <Checkbox
              label="I have installed boto3 and tested the connection"
              checked={isStepComplete(3)}
              onChange={() => markStepComplete(3)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Ready to Build!" 
          description="Start your AI project"
          completedIcon={<IconRocket size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm" className={styles.awsGradient}>
            <Group gap="sm" mb="md">
              <ThemeIcon color="orange" size="lg" radius="xl">
                <IconRocket size={20} />
              </ThemeIcon>
              <Text fw={600}>Your Bedrock Environment is Ready!</Text>
            </Group>

            <Text size="sm" mb="md">
              You can now use AWS Bedrock to:
            </Text>

            <List spacing="xs" size="sm" mb="md">
              <List.Item>Generate healthcare data specifications</List.Item>
              <List.Item>Analyze patient data patterns (with synthetic data)</List.Item>
              <List.Item>Build conversational AI for clinical workflows</List.Item>
              <List.Item>Create embeddings for semantic search</List.Item>
            </List>

            <Button 
              component="a"
              href={AWS_BEDROCK_CONSOLE}
              target="_blank"
              leftSection={<IconBrandAws size={16} />}
              rightSection={<IconExternalLink size={14} />}
              color="orange"
            >
              Open Bedrock Console
            </Button>
          </Paper>
        </Stepper.Step>
      </Stepper>

      {/* Progress Summary */}
      <Paper p="md" withBorder radius="md">
        <Group justify="space-between">
          <Text size="sm" fw={500}>Setup Progress</Text>
          <Badge 
            color={Object.keys(completedSteps).length === 4 ? 'teal' : 'blue'} 
            size="lg"
          >
            {Object.keys(completedSteps).length} / 4 Complete
          </Badge>
        </Group>
      </Paper>
    </>
  );
};

export default BedrockSetupContent;
