import React, { useState } from 'react';
import {
  Title,
  Text,
  Paper,
  Stepper,
  Group,
  ThemeIcon,
  Badge,
  Box,
  List,
  Code,
  Table,
  Alert,
  Accordion,
  Anchor,
  CopyButton,
  Button,
  Tooltip,
  ActionIcon,
  Divider,
} from '@mantine/core';
import {
  IconUserPlus,
  IconCreditCard,
  IconShieldCheck,
  IconCloud,
  IconTerminal,
  IconCheck,
  IconCopy,
  IconAlertCircle,
  IconInfoCircle,
  IconExternalLink,
  IconBrandAws,
} from '@tabler/icons-react';

const CodeBlock = ({ children }) => (
  <Box pos="relative">
    <CopyButton value={children}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? 'Copied!' : 'Copy'} position="left">
          <ActionIcon
            pos="absolute"
            top={8}
            right={8}
            variant="subtle"
            color={copied ? 'teal' : 'gray'}
            onClick={copy}
          >
            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
    <Code block p="md" style={{ whiteSpace: 'pre-wrap' }}>
      {children}
    </Code>
  </Box>
);

export default function AWSAccountSetupContent() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <>
      <Paper p="lg" withBorder radius="md" mb="xl" bg="orange.0">
        <Group gap="md" mb="sm">
          <ThemeIcon color="orange" size="xl" radius="xl">
            <IconBrandAws size={24} />
          </ThemeIcon>
          <Box>
            <Title order={3}>🎓 Start Here: AWS Skill Builder</Title>
            <Text size="sm" c="dimmed">Free official training from AWS</Text>
          </Box>
        </Group>
        <Text size="sm" mb="md">
          Before setting up your own account, complete the official <strong>Amazon Bedrock Getting Started</strong> course 
          on AWS Skill Builder. This free course will teach you the fundamentals.
        </Text>
        <Button
          component="a"
          href="https://skillbuilder.aws/learn/63KTRM86DQ/amazon-bedrock-getting-started/SC2Y3HMAUE"
          target="_blank"
          color="orange"
          rightSection={<IconExternalLink size={16} />}
        >
          Open AWS Skill Builder Course
        </Button>
      </Paper>

      <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="lg">
        <Text size="sm">
          <strong>UO Students:</strong> You may already have AWS access through Canvas! 
          Check with your instructor before creating a personal account.
        </Text>
      </Alert>

      <Stepper 
        active={activeStep} 
        onStepClick={setActiveStep} 
        orientation="vertical"
        size="sm"
      >
        {/* Step 1: Create Account */}
        <Stepper.Step
          label="Create AWS Account"
          description="Sign up for a new AWS account"
          icon={<IconUserPlus size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="md">
            <Title order={4} mb="md">1.1 Go to AWS Sign Up</Title>
            <List spacing="sm" mb="lg">
              <List.Item>
                Open your browser and go to{' '}
                <Anchor href="https://aws.amazon.com" target="_blank">
                  aws.amazon.com <IconExternalLink size={12} style={{ verticalAlign: 'middle' }} />
                </Anchor>
              </List.Item>
              <List.Item>Click the <strong>&quot;Create an AWS Account&quot;</strong> button (top right)</List.Item>
            </List>

            <Title order={4} mb="md">1.2 Enter Account Information</Title>
            <List spacing="sm" mb="lg">
              <List.Item><strong>Email address:</strong> Use a personal email you check regularly</List.Item>
              <List.Item><strong>AWS account name:</strong> Choose something memorable (e.g., &quot;MyAILearning&quot;)</List.Item>
              <List.Item>Click <strong>&quot;Verify email address&quot;</strong></List.Item>
              <List.Item>Check your email for the verification code and enter it</List.Item>
            </List>

            <Title order={4} mb="md">1.3 Complete Sign Up</Title>
            <List spacing="sm">
              <List.Item>Create a strong password (12+ characters)</List.Item>
              <List.Item>Select <strong>&quot;Personal&quot;</strong> for account type</List.Item>
              <List.Item>Fill in contact information</List.Item>
              <List.Item>Choose <strong>&quot;Basic support - Free&quot;</strong></List.Item>
            </List>

            <Alert icon={<IconAlertCircle size={16} />} color="yellow" mt="lg">
              Account activation takes 1-5 minutes. You&apos;ll receive a confirmation email.
            </Alert>
          </Paper>
        </Stepper.Step>

        {/* Step 2: Add Payment Method */}
        <Stepper.Step
          label="Add Payment Method"
          description="Required but won't be charged"
          icon={<IconCreditCard size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="md">
            <Title order={4} mb="md">Payment Information</Title>
            <List spacing="sm" mb="lg">
              <List.Item>Enter a valid credit or debit card</List.Item>
              <List.Item>
                <Text span c="green" fw={600}>Don&apos;t worry:</Text> You won&apos;t be charged if you stay within the Free Tier
              </List.Item>
              <List.Item>AWS may place a temporary $1 authorization hold to verify the card</List.Item>
            </List>

            <Title order={4} mb="md">Set Up Billing Alerts</Title>
            <Text size="sm" mb="sm">Avoid surprises! Create a budget alert:</Text>
            <List spacing="sm" type="ordered">
              <List.Item>Go to <strong>Billing Dashboard</strong> → <strong>Budgets</strong></List.Item>
              <List.Item>Click <strong>&quot;Create budget&quot;</strong></List.Item>
              <List.Item>Select <strong>&quot;Zero spend budget&quot;</strong> (alerts if you exceed Free Tier)</List.Item>
              <List.Item>Enter your email for notifications</List.Item>
            </List>
          </Paper>
        </Stepper.Step>

        {/* Step 3: Create IAM User */}
        <Stepper.Step
          label="Create IAM User"
          description="Secure access without using root"
          icon={<IconShieldCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="md">
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="lg">
              <strong>Never use your root account for daily work!</strong> Create an IAM user instead.
            </Alert>

            <Title order={4} mb="md">3.1 Create a New User</Title>
            <List spacing="sm" type="ordered" mb="lg">
              <List.Item>In the AWS Console, search for <strong>&quot;IAM&quot;</strong></List.Item>
              <List.Item>Click <strong>Users</strong> → <strong>Create user</strong></List.Item>
              <List.Item>User name: <Code>ai-developer</Code></List.Item>
              <List.Item>✅ Check <strong>&quot;Provide user access to the AWS Management Console&quot;</strong></List.Item>
              <List.Item>Select <strong>&quot;I want to create an IAM user&quot;</strong></List.Item>
              <List.Item>Create a password</List.Item>
            </List>

            <Title order={4} mb="md">3.2 Set Permissions</Title>
            <List spacing="sm" mb="lg">
              <List.Item>Select <strong>&quot;Attach policies directly&quot;</strong></List.Item>
              <List.Item>Search for and check:
                <List withPadding mt="xs">
                  <List.Item>✅ <Code>AmazonBedrockFullAccess</Code></List.Item>
                  <List.Item>✅ <Code>AmazonSageMakerFullAccess</Code></List.Item>
                  <List.Item>✅ <Code>IAMUserChangePassword</Code></List.Item>
                </List>
              </List.Item>
              <List.Item>Click <strong>Create user</strong></List.Item>
            </List>

            <Title order={4} mb="md">3.3 Create Access Keys (for API/CLI)</Title>
            <List spacing="sm" type="ordered">
              <List.Item>Click on your new user name</List.Item>
              <List.Item>Go to <strong>Security credentials</strong> tab</List.Item>
              <List.Item>Click <strong>Create access key</strong></List.Item>
              <List.Item>Select <strong>&quot;Command Line Interface (CLI)&quot;</strong></List.Item>
              <List.Item><strong>Download the .csv file</strong> - you won&apos;t see these again!</List.Item>
            </List>
          </Paper>
        </Stepper.Step>

        {/* Step 4: Activate Bedrock */}
        <Stepper.Step
          label="Activate Bedrock"
          description="Enable foundation models"
          icon={<IconCloud size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="md">
            <Title order={4} mb="md">4.1 Navigate to Bedrock</Title>
            <List spacing="sm" type="ordered" mb="lg">
              <List.Item>Sign in with your <strong>IAM user</strong> (not root!)</List.Item>
              <List.Item>Search for <strong>&quot;Bedrock&quot;</strong> in the console</List.Item>
              <List.Item>Select region: <Code>us-east-1</Code> (N. Virginia) for best model availability</List.Item>
            </List>

            <Title order={4} mb="md">4.2 Request Model Access</Title>
            <List spacing="sm" type="ordered" mb="lg">
              <List.Item>Click <strong>Model access</strong> in the sidebar</List.Item>
              <List.Item>Click <strong>Manage model access</strong></List.Item>
              <List.Item>Select the models you want:</List.Item>
            </List>

            <Table mb="lg" withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Model</Table.Th>
                  <Table.Th>Why Use It</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td><Badge color="green">✓</Badge> Claude 3 Haiku</Table.Td>
                  <Table.Td>Fast, cheap, great for testing</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Badge color="green">✓</Badge> Claude 3.5 Sonnet</Table.Td>
                  <Table.Td>Best balance of speed/quality</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Badge color="green">✓</Badge> Llama 3.1 8B Instruct</Table.Td>
                  <Table.Td>Open source, no extra cost</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Badge color="green">✓</Badge> Mistral 7B Instruct</Table.Td>
                  <Table.Td>Open source, lightweight</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>

            <List spacing="sm" type="ordered" start={4}>
              <List.Item>Click <strong>Request model access</strong></List.Item>
              <List.Item>Accept the End User License Agreement (EULA)</List.Item>
              <List.Item>Wait for status to change to <Badge color="green">Access granted</Badge></List.Item>
            </List>

            <Divider my="lg" />

            <Title order={4} mb="md">4.3 Test in the Playground</Title>
            <List spacing="sm" type="ordered">
              <List.Item>Go to <strong>Playgrounds</strong> → <strong>Chat</strong></List.Item>
              <List.Item>Select a model (e.g., Claude 3 Haiku)</List.Item>
              <List.Item>Try this prompt:</List.Item>
            </List>
            <CodeBlock>What are three benefits of using synthetic data for machine learning?</CodeBlock>
            <List spacing="sm" type="ordered" start={4}>
              <List.Item>Click <strong>Run</strong> - if you get a response, Bedrock is working! 🎉</List.Item>
            </List>
          </Paper>
        </Stepper.Step>

        {/* Step 5: Activate SageMaker */}
        <Stepper.Step
          label="Activate SageMaker"
          description="Set up ML development environment"
          icon={<IconBrandAws size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="md">
            <Title order={4} mb="md">5.1 Create SageMaker Domain</Title>
            <List spacing="sm" type="ordered" mb="lg">
              <List.Item>Search for <strong>&quot;SageMaker&quot;</strong> in the console</List.Item>
              <List.Item>Click <strong>Studio</strong> in the sidebar</List.Item>
              <List.Item>Click <strong>&quot;Create a SageMaker Domain&quot;</strong></List.Item>
              <List.Item>Select <strong>&quot;Set up for single user (Quick setup)&quot;</strong></List.Item>
              <List.Item>Keep the default domain name</List.Item>
              <List.Item>For execution role, select <strong>&quot;Create a new role&quot;</strong></List.Item>
              <List.Item>For S3 buckets, choose <strong>&quot;Any S3 bucket&quot;</strong></List.Item>
              <List.Item>Click <strong>Submit</strong> - wait 5-10 minutes</List.Item>
            </List>

            <Title order={4} mb="md">5.2 Launch SageMaker Studio</Title>
            <List spacing="sm">
              <List.Item>Once the domain is ready, click <strong>Open Studio</strong></List.Item>
              <List.Item>This opens a JupyterLab-like environment</List.Item>
              <List.Item>You can now create notebooks and run ML code!</List.Item>
            </List>

            <Alert icon={<IconInfoCircle size={16} />} color="blue" mt="lg">
              <strong>Tip:</strong> Try <strong>JumpStart</strong> in Studio to deploy pre-trained models with one click!
            </Alert>
          </Paper>
        </Stepper.Step>

        {/* Step 6: Install CLI */}
        <Stepper.Step
          label="Install AWS CLI"
          description="Access AWS from your terminal"
          icon={<IconTerminal size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="md">
            <Title order={4} mb="md">6.1 Install AWS CLI</Title>
            
            <Accordion variant="separated" mb="lg">
              <Accordion.Item value="macos">
                <Accordion.Control icon={<Text>🍎</Text>}>macOS</Accordion.Control>
                <Accordion.Panel>
                  <CodeBlock>{`# Using Homebrew (recommended)
brew install awscli

# Or download directly
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /`}</CodeBlock>
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="windows">
                <Accordion.Control icon={<Text>🪟</Text>}>Windows</Accordion.Control>
                <Accordion.Panel>
                  <Text size="sm" mb="sm">
                    Download and run the installer from:
                  </Text>
                  <Anchor href="https://awscli.amazonaws.com/AWSCLIV2.msi" target="_blank">
                    AWS CLI MSI Installer <IconExternalLink size={12} />
                  </Anchor>
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="linux">
                <Accordion.Control icon={<Text>🐧</Text>}>Linux</Accordion.Control>
                <Accordion.Panel>
                  <CodeBlock>{`curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install`}</CodeBlock>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>

            <Title order={4} mb="md">6.2 Configure AWS CLI</Title>
            <Text size="sm" mb="sm">Run the configuration wizard:</Text>
            <CodeBlock>aws configure</CodeBlock>
            <Text size="sm" mt="md" mb="sm">Enter when prompted:</Text>
            <CodeBlock>{`AWS Access Key ID: YOUR_ACCESS_KEY_ID
AWS Secret Access Key: YOUR_SECRET_ACCESS_KEY
Default region name: us-east-1
Default output format: json`}</CodeBlock>

            <Title order={4} mt="lg" mb="md">6.3 Verify Installation</Title>
            <CodeBlock>{`# Check version
aws --version

# Test authentication
aws sts get-caller-identity`}</CodeBlock>
          </Paper>
        </Stepper.Step>

        {/* Step 7: Test Setup */}
        <Stepper.Step
          label="Test Your Setup"
          description="Verify everything works"
          icon={<IconCheck size={18} />}
        >
          <Paper p="md" withBorder radius="md" mt="md">
            <Title order={4} mb="md">7.1 Install Python SDK</Title>
            <CodeBlock>pip install boto3</CodeBlock>

            <Title order={4} mt="lg" mb="md">7.2 Test Bedrock API</Title>
            <Text size="sm" mb="sm">Create a file called <Code>test_bedrock.py</Code>:</Text>
            <CodeBlock>{`import boto3
import json

# Create Bedrock runtime client
bedrock = boto3.client(
    'bedrock-runtime',
    region_name='us-east-1'
)

# Test with Claude 3 Haiku
response = bedrock.invoke_model(
    modelId='anthropic.claude-3-haiku-20240307-v1:0',
    body=json.dumps({
        'anthropic_version': 'bedrock-2023-05-31',
        'max_tokens': 500,
        'messages': [
            {
                'role': 'user',
                'content': 'Explain what Amazon Bedrock is in 2 sentences.'
            }
        ]
    })
)

# Parse and print response
result = json.loads(response['body'].read())
print("✅ Bedrock is working!\\n")
print(result['content'][0]['text'])`}</CodeBlock>

            <Text size="sm" mt="md" mb="sm">Run it:</Text>
            <CodeBlock>python test_bedrock.py</CodeBlock>

            <Alert icon={<IconCheck size={16} />} color="green" mt="lg">
              If you see a response from Claude, your AWS setup is complete! 🎉
            </Alert>
          </Paper>
        </Stepper.Step>
      </Stepper>

      <Divider my="xl" />

      {/* Cost Information */}
      <Paper p="lg" withBorder radius="md">
        <Title order={4} mb="md">💰 Cost Estimates for Learning</Title>
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Activity</Table.Th>
              <Table.Th>Estimated Cost</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Bedrock: 100 Claude Haiku queries</Table.Td>
              <Table.Td><Text c="green" fw={600}>~$0.05</Text></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Bedrock: 100 Claude Sonnet queries</Table.Td>
              <Table.Td><Text c="green" fw={600}>~$0.50</Text></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>SageMaker Studio: 10 hours/month</Table.Td>
              <Table.Td><Text c="green" fw={600}>Free (first 2 months)</Text></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Deploying a model on SageMaker</Table.Td>
              <Table.Td><Text c="orange" fw={600}>$0.50-5.00/hour</Text></Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <Text size="sm" c="dimmed" mt="md">
          💡 <strong>Tip:</strong> Use Bedrock for learning—it&apos;s pay-per-use and very affordable for experimentation.
        </Text>
      </Paper>
    </>
  );
}
