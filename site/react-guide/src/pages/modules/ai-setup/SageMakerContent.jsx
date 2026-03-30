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
  SimpleGrid,
  Table,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconBulb,
  IconAlertCircle,
  IconExternalLink,
  IconBrandAws,
  IconSchool,
  IconLogin,
  IconCheck,
  IconCopy,
  IconRocket,
  IconShieldCheck,
  IconServer,
  IconCode,
  IconUpload,
  IconChartLine,
  IconSettings,
} from '@tabler/icons-react';
import styles from './AISetup.module.css';

const CANVAS_AWS_URL = 'https://canvas.uoregon.edu';
const AWS_SAGEMAKER_CONSOLE = 'https://console.aws.amazon.com/sagemaker';

const SageMakerContent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  const markStepComplete = (step) => {
    setCompletedSteps(prev => ({ ...prev, [step]: true }));
    if (step === activeStep && activeStep < 5) {
      setActiveStep(prev => prev + 1);
    }
  };

  const isStepComplete = (step) => completedSteps[step] === true;

  return (
    <>
      {/* When to Use SageMaker */}
      <Alert icon={<IconBulb size={16} />} color="teal" mb="xl">
        <Text size="sm">
          <Text span fw={600}>When to use SageMaker vs Bedrock:</Text> Use SageMaker when you need to 
          train/fine-tune custom models, deploy your own models, or need more control over infrastructure. 
          Use Bedrock for quick access to pre-trained foundation models via API.
        </Text>
      </Alert>

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

        <List spacing="sm" size="sm" mb="md">
          <List.Item icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
            Log into <Anchor href={CANVAS_AWS_URL} target="_blank">Canvas <IconExternalLink size={12} /></Anchor> with your UO credentials
          </List.Item>
          <List.Item icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
            Navigate to <Text span fw={600}>AWS Academy Learner Lab</Text> in your courses
          </List.Item>
          <List.Item icon={<ThemeIcon color="green" size={20} radius="xl"><IconCircleCheck size={12} /></ThemeIcon>}>
            Click <Text span fw={600}>&quot;Start Lab&quot;</Text> to launch your AWS environment
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

      <Divider my="xl" label="SageMaker Options" labelPosition="center" />

      {/* SageMaker Options */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group gap="sm" mb="sm">
            <ThemeIcon color="cyan" size="lg" radius="xl">
              <IconCode size={20} />
            </ThemeIcon>
            <Text fw={600}>SageMaker Studio</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="sm">
            JupyterLab-based IDE for ML development. Best for interactive experimentation.
          </Text>
          <Badge color="cyan" variant="light">Recommended for Learning</Badge>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group gap="sm" mb="sm">
            <ThemeIcon color="orange" size="lg" radius="xl">
              <IconServer size={20} />
            </ThemeIcon>
            <Text fw={600}>Notebook Instances</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="sm">
            Managed Jupyter notebooks with pre-installed ML libraries.
          </Text>
          <Badge color="orange" variant="light">Quick Start</Badge>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group gap="sm" mb="sm">
            <ThemeIcon color="teal" size="lg" radius="xl">
              <IconUpload size={20} />
            </ThemeIcon>
            <Text fw={600}>JumpStart</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="sm">
            Pre-trained models ready to deploy with one click.
          </Text>
          <Badge color="teal" variant="light">Fastest Setup</Badge>
        </Card>
      </SimpleGrid>

      <Divider my="xl" label="Setup Steps" labelPosition="center" />

      {/* Interactive Stepper */}
      <Stepper 
        active={activeStep} 
        onStepClick={setActiveStep}
        orientation="vertical"
        mb="xl"
      >
        <Stepper.Step 
          label="Open SageMaker" 
          description="Navigate to the service"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              After launching your AWS Academy lab:
            </Text>

            <List spacing="sm" size="sm" mb="md" type="ordered">
              <List.Item>
                In the AWS Console search bar, type <Code>SageMaker</Code> and select it
              </List.Item>
              <List.Item>
                You will see the SageMaker dashboard with options on the left sidebar
              </List.Item>
            </List>

            <Alert icon={<IconShieldCheck size={14} />} color="yellow" mb="md">
              <Text size="xs">
                AWS Academy labs have some SageMaker features restricted. Notebook Instances and JumpStart 
                work best in the lab environment.
              </Text>
            </Alert>

            <Checkbox
              label="I have opened SageMaker in the AWS Console"
              checked={isStepComplete(0)}
              onChange={() => markStepComplete(0)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Create Notebook Instance" 
          description="Launch a Jupyter environment"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Create a managed Jupyter notebook for ML experimentation:
            </Text>

            <List spacing="sm" size="sm" mb="md" type="ordered">
              <List.Item>
                In the left sidebar, click <Text span fw={600}>&quot;Notebook&quot;</Text> → <Text span fw={600}>&quot;Notebook instances&quot;</Text>
              </List.Item>
              <List.Item>
                Click <Text span fw={600}>&quot;Create notebook instance&quot;</Text>
              </List.Item>
              <List.Item>
                Configure the notebook:
                <List size="xs" mt="xs" withPadding>
                  <List.Item><Text span fw={500}>Name:</Text> <Code>healthcare-ai-notebook</Code></List.Item>
                  <List.Item><Text span fw={500}>Instance type:</Text> <Code>ml.t3.medium</Code> (good for learning)</List.Item>
                  <List.Item><Text span fw={500}>IAM role:</Text> Create a new role or use existing</List.Item>
                </List>
              </List.Item>
              <List.Item>
                Click <Text span fw={600}>&quot;Create notebook instance&quot;</Text>
              </List.Item>
              <List.Item>
                Wait for status to change to <Badge color="green" size="xs">InService</Badge> (5-10 minutes)
              </List.Item>
            </List>

            <Checkbox
              label="I have created a notebook instance"
              checked={isStepComplete(1)}
              onChange={() => markStepComplete(1)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Open JupyterLab" 
          description="Access your notebook"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Once your instance is running:
            </Text>

            <List spacing="sm" size="sm" mb="md" type="ordered">
              <List.Item>
                Find your notebook instance in the list
              </List.Item>
              <List.Item>
                Click <Text span fw={600}>&quot;Open JupyterLab&quot;</Text> in the Actions column
              </List.Item>
              <List.Item>
                JupyterLab will open in a new tab with pre-installed ML libraries
              </List.Item>
            </List>

            <Text size="sm" mb="sm" fw={500}>Pre-installed packages include:</Text>
            <Group gap="xs" mb="md">
              <Badge size="sm" variant="outline">pandas</Badge>
              <Badge size="sm" variant="outline">numpy</Badge>
              <Badge size="sm" variant="outline">scikit-learn</Badge>
              <Badge size="sm" variant="outline">tensorflow</Badge>
              <Badge size="sm" variant="outline">pytorch</Badge>
              <Badge size="sm" variant="outline">transformers</Badge>
            </Group>

            <Checkbox
              label="I have opened JupyterLab"
              checked={isStepComplete(2)}
              onChange={() => markStepComplete(2)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Deploy a JumpStart Model" 
          description="One-click model deployment"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              SageMaker JumpStart provides pre-trained models ready to deploy:
            </Text>

            <List spacing="sm" size="sm" mb="md" type="ordered">
              <List.Item>
                In the left sidebar, click <Text span fw={600}>&quot;JumpStart&quot;</Text> → <Text span fw={600}>&quot;Foundation models&quot;</Text>
              </List.Item>
              <List.Item>
                Browse available models or search for specific ones:
                <List size="xs" mt="xs" withPadding>
                  <List.Item><Badge size="xs" color="blue">Llama 3</Badge> - Open source, great for text generation</List.Item>
                  <List.Item><Badge size="xs" color="violet">Falcon</Badge> - Efficient inference</List.Item>
                  <List.Item><Badge size="xs" color="teal">BERT</Badge> - Text classification, embeddings</List.Item>
                </List>
              </List.Item>
              <List.Item>
                Click on a model to see details and deployment options
              </List.Item>
              <List.Item>
                Click <Text span fw={600}>&quot;Deploy&quot;</Text> to create an endpoint
              </List.Item>
            </List>

            <Alert icon={<IconAlertCircle size={14} />} color="yellow" mb="md">
              <Text size="xs">
                Deployed endpoints incur costs while running. Remember to delete endpoints when not in use!
              </Text>
            </Alert>

            <Checkbox
              label="I have explored JumpStart models"
              checked={isStepComplete(3)}
              onChange={() => markStepComplete(3)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Call Your Endpoint" 
          description="Use the deployed model"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Once your model is deployed, call it from Python:
            </Text>

            <Text size="sm" mb="sm" fw={500}>Python code to invoke your endpoint:</Text>
            <Paper p="sm" bg="dark.7" radius="sm" mb="md">
              <Code block style={{ fontSize: 11 }} c="green.4">
{`import boto3
import json

runtime = boto3.client('sagemaker-runtime', region_name='us-east-1')

endpoint_name = 'your-endpoint-name'  # From JumpStart deployment

payload = {
    "inputs": "Create a data specification for patient records",
    "parameters": {
        "max_new_tokens": 256,
        "temperature": 0.7
    }
}

response = runtime.invoke_endpoint(
    EndpointName=endpoint_name,
    ContentType='application/json',
    Body=json.dumps(payload)
)

result = json.loads(response['Body'].read().decode())
print(result)`}
              </Code>
            </Paper>

            <Checkbox
              label="I understand how to call a SageMaker endpoint"
              checked={isStepComplete(4)}
              onChange={() => markStepComplete(4)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Ready to Build!" 
          description="Start your ML project"
          completedIcon={<IconRocket size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm" className={styles.sagemakerGradient}>
            <Group gap="sm" mb="md">
              <ThemeIcon color="teal" size="lg" radius="xl">
                <IconRocket size={20} />
              </ThemeIcon>
              <Text fw={600}>Your SageMaker Environment is Ready!</Text>
            </Group>

            <Text size="sm" mb="md">
              You can now use SageMaker to:
            </Text>

            <List spacing="xs" size="sm" mb="md">
              <List.Item>Train custom ML models on your data</List.Item>
              <List.Item>Fine-tune foundation models for healthcare tasks</List.Item>
              <List.Item>Deploy models as scalable API endpoints</List.Item>
              <List.Item>Run distributed training for large models</List.Item>
              <List.Item>Use AutoML to find the best model automatically</List.Item>
            </List>

            <Button 
              component="a"
              href={AWS_SAGEMAKER_CONSOLE}
              target="_blank"
              leftSection={<IconBrandAws size={16} />}
              rightSection={<IconExternalLink size={14} />}
              color="teal"
            >
              Open SageMaker Console
            </Button>
          </Paper>
        </Stepper.Step>
      </Stepper>

      {/* Comparison Table */}
      <Divider my="xl" label="Bedrock vs SageMaker" labelPosition="center" />

      <Table striped highlightOnHover withTableBorder withColumnBorders mb="xl">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Feature</Table.Th>
            <Table.Th>Bedrock</Table.Th>
            <Table.Th>SageMaker</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td><Text size="sm" fw={500}>Best For</Text></Table.Td>
            <Table.Td><Text size="sm">Quick API access to foundation models</Text></Table.Td>
            <Table.Td><Text size="sm">Custom model training & deployment</Text></Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td><Text size="sm" fw={500}>Setup Time</Text></Table.Td>
            <Table.Td><Badge color="green" size="sm">Minutes</Badge></Table.Td>
            <Table.Td><Badge color="yellow" size="sm">Hours</Badge></Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td><Text size="sm" fw={500}>Customization</Text></Table.Td>
            <Table.Td><Text size="sm">Prompt engineering, RAG</Text></Table.Td>
            <Table.Td><Text size="sm">Full fine-tuning, custom architectures</Text></Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td><Text size="sm" fw={500}>Pricing</Text></Table.Td>
            <Table.Td><Text size="sm">Pay per token</Text></Table.Td>
            <Table.Td><Text size="sm">Pay for compute time</Text></Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td><Text size="sm" fw={500}>Learning Curve</Text></Table.Td>
            <Table.Td><Badge color="green" size="sm">Low</Badge></Table.Td>
            <Table.Td><Badge color="orange" size="sm">Medium-High</Badge></Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>

      {/* Progress Summary */}
      <Paper p="md" withBorder radius="md">
        <Group justify="space-between">
          <Text size="sm" fw={500}>Setup Progress</Text>
          <Badge 
            color={Object.keys(completedSteps).length === 5 ? 'teal' : 'cyan'} 
            size="lg"
          >
            {Object.keys(completedSteps).length} / 5 Complete
          </Badge>
        </Group>
      </Paper>
    </>
  );
};

export default SageMakerContent;
