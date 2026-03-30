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
  IconCpu,
  IconDownload,
  IconTerminal2,
  IconCheck,
  IconCopy,
  IconRocket,
  IconBrandApple,
  IconDeviceDesktop,
  IconBrain,
  IconHeartRateMonitor,
} from '@tabler/icons-react';
import styles from './AISetup.module.css';

const OLLAMA_URL = 'https://ollama.ai';
const LM_STUDIO_URL = 'https://lmstudio.ai';

const LocalLLMContent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);

  const markStepComplete = (step) => {
    setCompletedSteps(prev => ({ ...prev, [step]: true }));
    if (step === activeStep && activeStep < 4) {
      setActiveStep(prev => prev + 1);
    }
  };

  const isStepComplete = (step) => completedSteps[step] === true;

  const recommendedModels = [
    { 
      name: 'Llama 3.2', 
      size: '3B / 8B', 
      memory: '4-8 GB',
      useCase: 'General purpose, code generation',
      command: 'ollama run llama3.2',
      color: 'blue',
    },
    { 
      name: 'Mistral', 
      size: '7B', 
      memory: '8 GB',
      useCase: 'Fast inference, instruction following',
      command: 'ollama run mistral',
      color: 'orange',
    },
    { 
      name: 'Phi-3', 
      size: '3.8B', 
      memory: '4 GB',
      useCase: 'Efficient, good for Mac laptops',
      command: 'ollama run phi3',
      color: 'violet',
    },
    { 
      name: 'Meditron', 
      size: '7B', 
      memory: '8 GB',
      useCase: 'Medical/clinical text analysis',
      command: 'ollama run meditron',
      color: 'teal',
      healthcare: true,
    },
    { 
      name: 'BioMistral', 
      size: '7B', 
      memory: '8 GB',
      useCase: 'Biomedical NLP tasks',
      command: 'ollama run biomistral',
      color: 'green',
      healthcare: true,
    },
  ];

  return (
    <>
      {/* Why Local LLMs */}
      <Alert icon={<IconBulb size={16} />} color="violet" mb="xl">
        <Text size="sm">
          <Text span fw={600}>Why run models locally?</Text> Full privacy (no data leaves your machine), 
          no API costs, works offline, and great for learning how LLMs actually work.
        </Text>
      </Alert>

      {/* Tool Selection */}
      <Title order={4} mb="md">Choose Your Tool</Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
        <Card 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          withBorder
          onClick={() => setSelectedTool('ollama')}
          style={{ 
            cursor: 'pointer',
            borderColor: selectedTool === 'ollama' ? 'var(--mantine-color-blue-5)' : undefined,
            borderWidth: selectedTool === 'ollama' ? 2 : 1,
          }}
        >
          <Group gap="sm" mb="sm">
            <ThemeIcon color="blue" size="lg" radius="xl">
              <IconTerminal2 size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={600}>Ollama</Text>
              <Text size="xs" c="dimmed">Command-line focused</Text>
            </Box>
            {selectedTool === 'ollama' && (
              <ThemeIcon color="blue" size="sm" radius="xl" ml="auto">
                <IconCheck size={12} />
              </ThemeIcon>
            )}
          </Group>
          <List size="xs" spacing={4}>
            <List.Item>Best for developers</List.Item>
            <List.Item>Easy model management</List.Item>
            <List.Item>API compatible with OpenAI</List.Item>
            <List.Item>Mac, Windows, Linux</List.Item>
          </List>
          <Button 
            component="a"
            href={OLLAMA_URL}
            target="_blank"
            variant="light"
            size="xs"
            mt="md"
            fullWidth
            rightSection={<IconExternalLink size={12} />}
          >
            Download Ollama
          </Button>
        </Card>

        <Card 
          shadow="sm" 
          padding="lg" 
          radius="md" 
          withBorder
          onClick={() => setSelectedTool('lmstudio')}
          style={{ 
            cursor: 'pointer',
            borderColor: selectedTool === 'lmstudio' ? 'var(--mantine-color-grape-5)' : undefined,
            borderWidth: selectedTool === 'lmstudio' ? 2 : 1,
          }}
        >
          <Group gap="sm" mb="sm">
            <ThemeIcon color="grape" size="lg" radius="xl">
              <IconDeviceDesktop size={20} />
            </ThemeIcon>
            <Box>
              <Text fw={600}>LM Studio</Text>
              <Text size="xs" c="dimmed">GUI application</Text>
            </Box>
            {selectedTool === 'lmstudio' && (
              <ThemeIcon color="grape" size="sm" radius="xl" ml="auto">
                <IconCheck size={12} />
              </ThemeIcon>
            )}
          </Group>
          <List size="xs" spacing={4}>
            <List.Item>User-friendly interface</List.Item>
            <List.Item>Visual model browser</List.Item>
            <List.Item>Built-in chat UI</List.Item>
            <List.Item>Mac (Apple Silicon), Windows</List.Item>
          </List>
          <Button 
            component="a"
            href={LM_STUDIO_URL}
            target="_blank"
            variant="light"
            color="grape"
            size="xs"
            mt="md"
            fullWidth
            rightSection={<IconExternalLink size={12} />}
          >
            Download LM Studio
          </Button>
        </Card>
      </SimpleGrid>

      <Divider my="xl" label="Setup Steps (Ollama)" labelPosition="center" />

      {/* Interactive Stepper for Ollama */}
      <Stepper 
        active={activeStep} 
        onStepClick={setActiveStep}
        orientation="vertical"
        mb="xl"
      >
        <Stepper.Step 
          label="Install Ollama" 
          description="Download and install on your system"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Download Ollama for your operating system:
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="md">
              <Button 
                component="a"
                href="https://ollama.ai/download/mac"
                target="_blank"
                variant="light"
                leftSection={<IconBrandApple size={16} />}
              >
                macOS
              </Button>
              <Button 
                component="a"
                href="https://ollama.ai/download/windows"
                target="_blank"
                variant="light"
                color="blue"
                leftSection={<IconDeviceDesktop size={16} />}
              >
                Windows
              </Button>
              <Button 
                component="a"
                href="https://ollama.ai/download/linux"
                target="_blank"
                variant="light"
                color="orange"
                leftSection={<IconTerminal2 size={16} />}
              >
                Linux
              </Button>
            </SimpleGrid>

            <Text size="sm" mb="sm">Or install via command line (macOS/Linux):</Text>
            <Group gap="xs" mb="md">
              <Code>curl -fsSL https://ollama.ai/install.sh | sh</Code>
              <CopyButton value="curl -fsSL https://ollama.ai/install.sh | sh">
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied!' : 'Copy'}>
                    <ActionIcon size="sm" variant="subtle" onClick={copy}>
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>

            <Checkbox
              label="I have installed Ollama"
              checked={isStepComplete(0)}
              onChange={() => markStepComplete(0)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Download a Model" 
          description="Pull your first LLM"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Open Terminal and run one of these commands to download a model:
            </Text>

            <Stack gap="sm" mb="md">
              <Group gap="xs">
                <Code>ollama pull llama3.2</Code>
                <CopyButton value="ollama pull llama3.2">
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied!' : 'Copy'}>
                      <ActionIcon size="sm" variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
                <Badge size="xs" color="blue">Recommended</Badge>
              </Group>
              <Group gap="xs">
                <Code>ollama pull phi3</Code>
                <CopyButton value="ollama pull phi3">
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied!' : 'Copy'}>
                      <ActionIcon size="sm" variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
                <Badge size="xs" color="violet">Small & Fast</Badge>
              </Group>
              <Group gap="xs">
                <Code>ollama pull meditron</Code>
                <CopyButton value="ollama pull meditron">
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied!' : 'Copy'}>
                      <ActionIcon size="sm" variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
                <Badge size="xs" color="teal" leftSection={<IconHeartRateMonitor size={10} />}>Healthcare</Badge>
              </Group>
            </Stack>

            <Alert icon={<IconAlertCircle size={14} />} color="yellow" mb="md">
              <Text size="xs">
                First download may take 5-15 minutes depending on your internet speed and model size.
              </Text>
            </Alert>

            <Checkbox
              label="I have downloaded at least one model"
              checked={isStepComplete(1)}
              onChange={() => markStepComplete(1)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Test the Model" 
          description="Chat with your local LLM"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Run your model and test it with a prompt:
            </Text>

            <Stack gap="sm" mb="md">
              <Group gap="xs">
                <Code>ollama run llama3.2</Code>
                <CopyButton value="ollama run llama3.2">
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

            <Text size="sm" mb="sm">Try this test prompt:</Text>
            <Paper p="sm" bg="gray.0" radius="sm" mb="md">
              <Text size="xs">
                Create a simple JSON schema for a patient appointment record with fields for patient_id, date, time, and reason.
              </Text>
            </Paper>

            <Text size="sm" mb="sm">Type <Code>/bye</Code> to exit the chat.</Text>

            <Checkbox
              label="I successfully chatted with my local model"
              checked={isStepComplete(2)}
              onChange={() => markStepComplete(2)}
              color="teal"
            />
          </Paper>
        </Stepper.Step>

        <Stepper.Step 
          label="Use from Python" 
          description="Integrate with your code"
          completedIcon={<IconCircleCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="sm">
            <Text size="sm" mb="md">
              Use the Ollama Python library to call your local model:
            </Text>

            <Stack gap="sm" mb="md">
              <Group gap="xs">
                <Code>pip install ollama</Code>
                <CopyButton value="pip install ollama">
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

            <Text size="sm" mb="sm" fw={500}>Python example:</Text>
            <Paper p="sm" bg="dark.7" radius="sm" mb="md">
              <Code block style={{ fontSize: 11 }} c="green.4">
{`import ollama

response = ollama.chat(
    model='llama3.2',
    messages=[
        {
            'role': 'user',
            'content': 'Create a JSON schema for patient records'
        }
    ]
)

print(response['message']['content'])`}
              </Code>
            </Paper>

            <Text size="sm" mb="sm" fw={500}>Or use OpenAI-compatible API:</Text>
            <Paper p="sm" bg="dark.7" radius="sm" mb="md">
              <Code block style={{ fontSize: 11 }} c="green.4">
{`from openai import OpenAI

client = OpenAI(
    base_url='http://localhost:11434/v1',
    api_key='ollama'  # required but unused
)

response = client.chat.completions.create(
    model='llama3.2',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)

print(response.choices[0].message.content)`}
              </Code>
            </Paper>

            <Checkbox
              label="I successfully called my local model from Python"
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
          <Paper p="md" withBorder radius="md" mt="sm" className={styles.localGradient}>
            <Group gap="sm" mb="md">
              <ThemeIcon color="violet" size="lg" radius="xl">
                <IconRocket size={20} />
              </ThemeIcon>
              <Text fw={600}>Your Local LLM Environment is Ready!</Text>
            </Group>

            <Text size="sm" mb="md">
              You can now use local LLMs to:
            </Text>

            <List spacing="xs" size="sm" mb="md">
              <List.Item>Process sensitive healthcare data with full privacy</List.Item>
              <List.Item>Experiment without API costs</List.Item>
              <List.Item>Work offline in secure environments</List.Item>
              <List.Item>Fine-tune models on your own data</List.Item>
            </List>
          </Paper>
        </Stepper.Step>
      </Stepper>

      <Divider my="xl" label="Recommended Models" labelPosition="center" />

      {/* Model Recommendations Table */}
      <Table striped highlightOnHover withTableBorder withColumnBorders mb="xl">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Model</Table.Th>
            <Table.Th>Size</Table.Th>
            <Table.Th>RAM Needed</Table.Th>
            <Table.Th>Best For</Table.Th>
            <Table.Th>Command</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {recommendedModels.map((model) => (
            <Table.Tr key={model.name}>
              <Table.Td>
                <Group gap="xs">
                  <Badge color={model.color} size="sm">{model.name}</Badge>
                  {model.healthcare && (
                    <ThemeIcon size="xs" color="teal" variant="light">
                      <IconHeartRateMonitor size={10} />
                    </ThemeIcon>
                  )}
                </Group>
              </Table.Td>
              <Table.Td><Text size="sm">{model.size}</Text></Table.Td>
              <Table.Td><Text size="sm">{model.memory}</Text></Table.Td>
              <Table.Td><Text size="xs">{model.useCase}</Text></Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Code style={{ fontSize: 10 }}>{model.command}</Code>
                  <CopyButton value={model.command}>
                    {({ copied, copy }) => (
                      <ActionIcon size="xs" variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={10} /> : <IconCopy size={10} />}
                      </ActionIcon>
                    )}
                  </CopyButton>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Progress Summary */}
      <Paper p="md" withBorder radius="md">
        <Group justify="space-between">
          <Text size="sm" fw={500}>Setup Progress</Text>
          <Badge 
            color={Object.keys(completedSteps).length === 4 ? 'teal' : 'violet'} 
            size="lg"
          >
            {Object.keys(completedSteps).length} / 4 Complete
          </Badge>
        </Group>
      </Paper>
    </>
  );
};

export default LocalLLMContent;
