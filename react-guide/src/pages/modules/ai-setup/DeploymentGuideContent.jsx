import React from 'react';
import { Card, Title, Text, List, ThemeIcon, Alert, Code, Stack, Timeline, Badge, Stepper, Group, Box, Divider, Grid } from '@mantine/core';
import {
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconTerminal,
  IconCloud,
  IconRocket,
  IconDatabase,
  IconNetwork,
  IconBrandAws,
  IconKey,
  IconServer,
  IconInfoCircle,
  IconLock,
  IconSettings,
  IconBrandDocker,
  IconPlug,
} from '@tabler/icons-react';

export default function DeploymentGuideContent() {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <Stack gap="xl">
      {/* Header */}
      <Box>
        <Title order={1} mb="md">
          Healthcare AI Infrastructure Deployment
        </Title>
        <Text size="lg" c="dimmed">
          Step-by-step guide to deploy your complete AI infrastructure on AWS
        </Text>
      </Box>

      {/* Overview Alert */}
      <Alert icon={<IconInfoCircle />} title="What You'll Deploy" color="blue" variant="light">
        <List size="sm" spacing="xs">
          <List.Item>EKS Cluster with GPU support (1x g4dn.xlarge node)</List.Item>
          <List.Item>Ollama LLM service (self-hosted AI models)</List.Item>
          <List.Item>AWS Bedrock access (managed Claude, Llama, Mistral models)</List.Item>
          <List.Item>DynamoDB tables for healthcare data</List.Item>
          <List.Item>Neo4j graph database (optional, cost-effective alternative to Neptune)</List.Item>
          <List.Item>Integration service connecting all components</List.Item>
          <List.Item>S3 storage for dataset publishing</List.Item>
        </List>
      </Alert>

      {/* Cost & Time */}
      <Group grow>
        <Alert icon={<IconClock />} title="Deployment Time" color="orange" variant="light">
          <Text size="sm">Total: 40-60 minutes</Text>
          <Text size="xs" c="dimmed" mt="xs">
            • EKS Cluster: 20-30 min
            <br />
            • Ollama: 10-15 min
            <br />
            • Other services: 10-15 min
          </Text>
        </Alert>
        <Alert icon={<IconBrandAws />} title="Estimated Cost" color="yellow" variant="light">
          <Text size="sm">~$15-20/day (~$470-540/month)</Text>
          <Text size="xs" c="dimmed" mt="xs">
            GPU node: $12.64/day
            <br />
            General node: $2.40/day
            <br />
            DynamoDB + Neo4j: ~$3/month
          </Text>
        </Alert>
      </Group>

      {/* Prerequisites */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Prerequisites
        </Title>
        <List
          spacing="md"
          size="sm"
          icon={
            <ThemeIcon color="blue" size={24} radius="xl">
              <IconCheck size={16} />
            </ThemeIcon>
          }
        >
          <List.Item>
            <Text fw={600}>AWS Innovation Sandbox Access</Text>
            <Text size="sm" c="dimmed">
              You need SSO credentials from your instructor
            </Text>
          </List.Item>
          <List.Item>
            <Text fw={600}>Command Line Tools Installed</Text>
            <List withPadding size="sm" mt="xs">
              <List.Item>AWS CLI v2</List.Item>
              <List.Item>kubectl (Kubernetes CLI)</List.Item>
              <List.Item>eksctl (EKS cluster management)</List.Item>
              <List.Item>Docker Desktop</List.Item>
            </List>
          </List.Item>
          <List.Item>
            <Text fw={600}>Your Student ID</Text>
            <Text size="sm" c="dimmed">
              You'll enter this during deployment for resource tagging
            </Text>
          </List.Item>
        </List>
      </Card>

      {/* Step-by-Step Deployment */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Step-by-Step Deployment
        </Title>

        <Grid gutter="xl">
          {/* Left Column: Stepper Navigation */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stepper active={activeStep} onStepClick={setActiveStep} orientation="vertical">
              <Stepper.Step
                label="Setup AWS Credentials"
                description="Configure AWS SSO authentication"
                icon={<IconKey size={18} />}
              />
              <Stepper.Step
                label="Start Deployment Script"
                description="Launch the automated deployment"
                icon={<IconTerminal size={18} />}
              />
              <Stepper.Step
                label="EKS Cluster Creation"
                description="20-30 minutes - Kubernetes cluster with GPU"
                icon={<IconCloud size={18} />}
              />
              <Stepper.Step
                label="Install Ollama"
                description="10-15 minutes - Self-hosted LLM engine"
                icon={<IconRocket size={18} />}
              />
              <Stepper.Step
                label="Configure AWS Bedrock"
                description="2-3 minutes - Managed AI models"
                icon={<IconBrandAws size={18} />}
              />
              <Stepper.Step
                label="Setup Data Storage"
                description="5-10 minutes - DynamoDB + Neo4j"
                icon={<IconDatabase size={18} />}
              />
              <Stepper.Step
                label="Deploy Integration Service"
                description="5-10 minutes - Flask API + web UI"
                icon={<IconNetwork size={18} />}
              />
              <Stepper.Step
                label="Configure S3 Storage"
                description="2-3 minutes - Dataset publishing"
                icon={<IconServer size={18} />}
              />
            </Stepper>
          </Grid.Col>

          {/* Right Column: Step Content */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Box>
              {/* Step 0: Setup AWS Credentials */}
              {activeStep === 0 && (
                <Stack gap="md">
                  <Text size="sm">Configure your AWS Innovation Sandbox access:</Text>
                  <Code block>
                    {`# Run the setup wizard
cd deployment-scripts
./setup-aws-credentials.sh

# Follow the prompts:
# 1. Enter SSO start URL (from instructor)
# 2. Choose region: us-west-2
# 3. Select your role: LCBPEGA_IsbAdminsPS
# 4. Name your profile (e.g., dataai-christol)`}
                  </Code>
                  
                  <Divider label="What's Happening" labelPosition="center" my="md" />
                  
                  <Alert icon={<IconLock />} title="AWS SSO Authentication Flow" color="blue" variant="light">
                    <Stack gap="xs">
                      <Text size="sm">
                        <strong>1. SSO Login:</strong> Opens your browser to authenticate with AWS Identity Center
                      </Text>
                      <Text size="sm">
                        <strong>2. Credential Caching:</strong> Stores temporary credentials (~/.aws/sso/cache/)
                      </Text>
                      <Text size="sm">
                        <strong>3. Profile Configuration:</strong> Creates named profile in ~/.aws/config
                      </Text>
                      <Text size="sm">
                        <strong>4. Environment File:</strong> Generates deployment-scripts/.env with:
                      </Text>
                      <Code block mt="xs">
                        {`AWS_PROFILE=dataai-christol
AWS_REGION=us-west-2
AWS_ACCOUNT_ID=547741150715
RESOURCE_GROUP=dataai-account547741150715-christol`}
                      </Code>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconSettings />} title="Why This Matters" color="grape" variant="light">
                    <Text size="sm">
                      All deployment scripts source this .env file to authenticate API calls. The profile uses
                      temporary STS tokens (valid 8 hours) with admin permissions scoped to your Innovation Sandbox account.
                    </Text>
                  </Alert>
                </Stack>
              )}

              {/* Step 1: Start Deployment */}
              {activeStep === 1 && (
                <Stack gap="md">
                  <Text size="sm">Run the master deployment script:</Text>
                  <Code block>
                    {`# Set your AWS profile
export AWS_PROFILE=dataai-christol  # Use your profile name

# Start deployment
./deploy-all.sh`}
                  </Code>
                  <Text size="sm" fw={600}>
                    You'll be prompted for:
                  </Text>
                  <List size="sm">
                    <List.Item>
                      <strong>Student ID:</strong> Your UO email username (e.g., christol)
                    </List.Item>
                    <List.Item>
                      <strong>Deployment confirmation:</strong> Type "yes" to proceed
                    </List.Item>
                    <List.Item>
                      <strong>Graph database choice:</strong> Select option 2 (Neo4j recommended)
                    </List.Item>
                    <List.Item>
                      <strong>EKS deployment:</strong> Type "yes" to create cluster
                    </List.Item>
                  </List>

                  <Divider label="What's Happening" labelPosition="center" my="md" />

                  <Alert icon={<IconSettings />} title="Deploy-All.sh Orchestration" color="cyan" variant="light">
                    <Stack gap="xs">
                      <Text size="sm">
                        <strong>Phase 1:</strong> Validates prerequisites (AWS CLI, kubectl, eksctl, docker)
                      </Text>
                      <Text size="sm">
                        <strong>Phase 2:</strong> Loads .env configuration and verifies AWS credentials
                      </Text>
                      <Text size="sm">
                        <strong>Phase 3:</strong> Tests AWS connectivity with `aws sts get-caller-identity`
                      </Text>
                      <Text size="sm">
                        <strong>Phase 4:</strong> Creates resource tagging strategy using your Student ID
                      </Text>
                      <Text size="sm">
                        <strong>Phase 5:</strong> Sequentially calls deployment scripts:
                      </Text>
                      <List size="xs" mt={4}>
                        <List.Item>1-deploy-eks-cluster.sh</List.Item>
                        <List.Item>2-install-ollama.sh</List.Item>
                        <List.Item>2b-setup-bedrock.sh</List.Item>
                        <List.Item>3-setup-knowledge-graph.sh OR 3c-install-neo4j-graph.sh</List.Item>
                        <List.Item>4-deploy-integration.sh</List.Item>
                        <List.Item>5-setup-s3-storage.sh</List.Item>
                      </List>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconInfoCircle />} title="Resource Tagging" color="green" variant="light">
                    <Text size="sm">
                      All AWS resources are tagged with <Code>ResourceGroup: dataai-account[ID]-[studentID]</Code> to
                      track costs, manage permissions, and enable automated cleanup.
                    </Text>
                  </Alert>
                </Stack>
              )}

              {/* Step 2: EKS Cluster */}
              {activeStep === 2 && (
                <Stack gap="md">
                  <Badge color="blue" variant="light" leftSection={<IconClock size={14} />}>
                    20-30 minutes
                  </Badge>
                  <Text size="sm">
                    Creating production-grade Kubernetes cluster in AWS:
                  </Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Creates VPC with public/private subnets</List.Item>
                    <List.Item>Deploys EKS control plane (Kubernetes 1.30)</List.Item>
                    <List.Item>Launches node groups:
                      <List withPadding size="xs" mt={4}>
                        <List.Item>1x g4dn.xlarge (GPU for AI workloads)</List.Item>
                        <List.Item>1x t3.medium (general purpose)</List.Item>
                      </List>
                    </List.Item>
                    <List.Item>Enables OIDC provider for IAM integration</List.Item>
                    <List.Item>Installs core addons (VPC CNI, CoreDNS, kube-proxy)</List.Item>
                  </List>

                  <Divider label="What's Happening Behind the Scenes" labelPosition="center" my="md" />

                  <Alert icon={<IconCloud />} title="CloudFormation Stack Creation" color="blue" variant="light">
                    <Text size="sm" fw={600} mb="xs">4 Parallel CloudFormation Stacks:</Text>
                    <List size="sm" spacing={4}>
                      <List.Item>
                        <strong>Stack 1 - VPC:</strong> Creates custom VPC (172.31.0.0/16) with 3 public + 3 private subnets across availability zones, Internet Gateway, NAT Gateways, and route tables
                      </List.Item>
                      <List.Item>
                        <strong>Stack 2 - EKS Control Plane:</strong> Managed Kubernetes API servers, etcd cluster, and AWS-managed control plane (runs in AWS VPC, not visible to you)
                      </List.Item>
                      <List.Item>
                        <strong>Stack 3 - GPU Node Group:</strong> EC2 Auto Scaling Group with g4dn.xlarge instances (NVIDIA T4 Tensor Core GPU, 4 vCPU, 16GB RAM)
                      </List.Item>
                      <List.Item>
                        <strong>Stack 4 - General Node Group:</strong> t3.medium instances for system pods (2 vCPU, 4GB RAM)
                      </List.Item>
                    </List>
                  </Alert>

                  <Alert icon={<IconSettings />} title="Infrastructure Configuration" color="violet" variant="light">
                    <Stack gap="xs">
                      <Text size="sm">
                        <strong>Cluster Name:</strong> <Code>ollama-ai-cluster</Code>
                      </Text>
                      <Text size="sm">
                        <strong>Kubernetes Version:</strong> 1.30 (latest stable)
                      </Text>
                      <Text size="sm">
                        <strong>OIDC Provider:</strong> Enabled for IRSA (IAM Roles for Service Accounts) - allows pods to assume IAM roles without credentials
                      </Text>
                      <Text size="sm">
                        <strong>Networking:</strong> VPC CNI plugin for native AWS networking (each pod gets a VPC IP)
                      </Text>
                      <Text size="sm">
                        <strong>GPU Support:</strong> NVIDIA device plugin DaemonSet automatically installed to schedule AI workloads on GPU nodes
                      </Text>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconInfoCircle />} color="green" variant="light">
                    <Text size="sm">
                      <strong>Monitoring Progress:</strong> AWS CloudFormation continues working even if eksctl times out.
                      Check AWS Console → CloudFormation to see real-time stack status. GPU provisioning takes longest (25-30 min).
                    </Text>
                  </Alert>
                </Stack>
              )}

              {/* Step 3: Ollama Installation */}
              {activeStep === 3 && (
                <Stack gap="md">
                  <Badge color="violet" variant="light" leftSection={<IconClock size={14} />}>
                    10-15 minutes
                  </Badge>
                  <Text size="sm">Deploying Ollama for running open-source AI models:</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Creates Kubernetes namespace: <Code>ollama</Code></List.Item>
                    <List.Item>Deploys Ollama pod with GPU access</List.Item>
                    <List.Item>Downloads Llama 3 8B model (~4.7GB)</List.Item>
                    <List.Item>Creates LoadBalancer service for external access</List.Item>
                    <List.Item>AWS provisions Network Load Balancer (takes 3-5 min)</List.Item>
                  </List>

                  <Divider label="What's Happening Behind the Scenes" labelPosition="center" my="md" />

                  <Alert icon={<IconRocket />} title="Kubernetes Deployment Process" color="violet" variant="light">
                    <List size="sm" spacing={4}>
                      <List.Item>
                        <strong>Step 1:</strong> Creates <Code>ollama</Code> namespace for resource isolation
                      </List.Item>
                      <List.Item>
                        <strong>Step 2:</strong> kubectl applies deployment.yaml with:
                        <List withPadding size="xs" mt={4}>
                          <List.Item>Container image: <Code>ollama/ollama:latest</Code></List.Item>
                          <List.Item>Resource limits: 1 GPU, 8GB RAM, 4 CPU cores</List.Item>
                          <List.Item>Node selector: targets g4dn.xlarge GPU node</List.Item>
                          <List.Item>Volume mount for model storage (10GB PVC)</List.Item>
                        </List>
                      </List.Item>
                      <List.Item>
                        <strong>Step 3:</strong> Kubernetes scheduler places pod on GPU node
                      </List.Item>
                      <List.Item>
                        <strong>Step 4:</strong> Ollama container starts, detects NVIDIA GPU via device plugin
                      </List.Item>
                      <List.Item>
                        <strong>Step 5:</strong> Executes <Code>ollama pull llama3</Code> (downloads 4.7GB model from Ollama registry)
                      </List.Item>
                      <List.Item>
                        <strong>Step 6:</strong> Creates LoadBalancer service → AWS provisions Network Load Balancer in VPC
                      </List.Item>
                    </List>
                  </Alert>

                  <Alert icon={<IconSettings />} title="Model Loading Details" color="orange" variant="light">
                    <Stack gap="xs">
                      <Text size="sm">
                        <strong>Llama 3 8B Model:</strong> 8 billion parameters, quantized to 4-bit (Q4_0 format)
                      </Text>
                      <Text size="sm">
                        <strong>GPU Acceleration:</strong> NVIDIA T4 provides ~30-50 tokens/second inference speed
                      </Text>
                      <Text size="sm">
                        <strong>Model Storage:</strong> Models cached in PersistentVolume survive pod restarts
                      </Text>
                      <Text size="sm">
                        <strong>API Endpoint:</strong> Exposed on port 11434 (REST API compatible with OpenAI format)
                      </Text>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconAlertCircle />} color="yellow" variant="light">
                    <Text size="sm">
                      <strong>Download Time Varies:</strong> Model download is 4.7GB - may take 5-10 minutes depending on network speed.
                      Check progress: <Code>kubectl logs -n ollama deployment/ollama -f</Code>
                    </Text>
                  </Alert>
                </Stack>
              )}

              {/* Step 4: AWS Bedrock */}
              {activeStep === 4 && (
                <Stack gap="md">
                  <Badge color="orange" variant="light" leftSection={<IconClock size={14} />}>
                    2-3 minutes
                  </Badge>
                  <Text size="sm">Setting up AWS Bedrock for managed AI models:</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Creates IAM policy for Bedrock API access</List.Item>
                    <List.Item>Creates IAM role with IRSA (IAM Roles for Service Accounts)</List.Item>
                    <List.Item>Links role to kubernetes service account</List.Item>
                    <List.Item>Verifies access to recommended models:
                      <List withPadding size="xs" mt={4}>
                        <List.Item>Claude 3 Sonnet/Haiku (Anthropic)</List.Item>
                        <List.Item>Llama 3 70B (Meta)</List.Item>
                        <List.Item>Mistral 7B</List.Item>
                      </List>
                    </List.Item>
                  </List>

                  <Divider label="What's Happening Behind the Scenes" labelPosition="center" my="md" />

                  <Alert icon={<IconLock />} title="IRSA (IAM Roles for Service Accounts)" color="orange" variant="light">
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>How Pods Get AWS Permissions (No Hardcoded Credentials!):</Text>
                      <List size="sm" spacing={4}>
                        <List.Item>
                          <strong>1. Create IAM Policy:</strong> Defines <Code>bedrock:InvokeModel</Code> permissions for Claude, Llama, Mistral model ARNs
                        </List.Item>
                        <List.Item>
                          <strong>2. Create IAM Role:</strong> Trust policy allows OIDC provider (EKS cluster) to assume role
                        </List.Item>
                        <List.Item>
                          <strong>3. Annotate ServiceAccount:</strong> <Code>eks.amazonaws.com/role-arn: arn:aws:iam::547741150715:role/bedrock-access</Code>
                        </List.Item>
                        <List.Item>
                          <strong>4. Pod Inherits Role:</strong> When pod uses this ServiceAccount, EKS mutating webhook injects AWS credentials as environment variables
                        </List.Item>
                        <List.Item>
                          <strong>5. AWS SDK Auto-Authenticates:</strong> boto3/AWS SDK reads credentials from pod environment → assumes role → calls Bedrock API
                        </List.Item>
                      </List>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconBrandAws />} title="Bedrock Model Access" color="blue" variant="light">
                    <Text size="sm" mb="xs">
                      <strong>Available Foundation Models (pre-enabled in Innovation Sandbox):</strong>
                    </Text>
                    <List size="sm" spacing={4}>
                      <List.Item>
                        <strong>Claude 3.5 Sonnet:</strong> <Code>anthropic.claude-3-5-sonnet-20240620-v1:0</Code>
                        <br /><Text size="xs" c="dimmed">Best for complex reasoning, coding, analysis (~$3/M input tokens)</Text>
                      </List.Item>
                      <List.Item>
                        <strong>Claude 3 Haiku:</strong> <Code>anthropic.claude-3-haiku-20240307-v1:0</Code>
                        <br /><Text size="xs" c="dimmed">Fast responses, cost-effective (~$0.25/M input tokens)</Text>
                      </List.Item>
                      <List.Item>
                        <strong>Llama 3 70B:</strong> <Code>meta.llama3-70b-instruct-v1:0</Code>
                        <br /><Text size="xs" c="dimmed">Open-source, strong performance, no per-token cost</Text>
                      </List.Item>
                    </List>
                  </Alert>

                  <Alert icon={<IconInfoCircle />} title="Why Use Bedrock?" color="green" variant="light">
                    <Text size="sm">
                      Bedrock provides managed, serverless access to frontier models without GPU costs. Pay only for tokens processed.
                      Scales instantly to millions of requests. Complements local Ollama for cost-effective hybrid deployment.
                    </Text>
                  </Alert>
                </Stack>
              )}

              {/* Step 5: Data Storage */}
              {activeStep === 5 && (
                <Stack gap="md">
                  <Badge color="teal" variant="light" leftSection={<IconClock size={14} />}>
                    5-10 minutes
                  </Badge>
                  <Text size="sm" fw={600}>
                    DynamoDB Tables (3-5 min):
                  </Text>
                  <List size="sm" spacing="xs">
                    <List.Item>healthcare-patients (patient records)</List.Item>
                    <List.Item>healthcare-diagnoses (diagnosis codes)</List.Item>
                    <List.Item>healthcare-medications (prescriptions)</List.Item>
                    <List.Item>healthcare-providers (doctors/clinics)</List.Item>
                    <List.Item>healthcare-patient-diagnoses (relationships)</List.Item>
                    <List.Item>healthcare-patient-medications (prescriptions)</List.Item>
                  </List>
                  
                  <Text size="sm" fw={600} mt="md">
                    Neo4j Graph Database (3-5 min):
                  </Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Deploys Neo4j Community Edition StatefulSet</List.Item>
                    <List.Item>Creates persistent volume for data storage</List.Item>
                    <List.Item>Exposes web browser and Bolt protocol</List.Item>
                    <List.Item>Credentials: neo4j / healthcare2024</List.Item>
                  </List>

                  <Divider label="What's Happening Behind the Scenes" labelPosition="center" my="md" />

                  <Alert icon={<IconDatabase />} title="DynamoDB Table Creation" color="teal" variant="light">
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>AWS API Calls (3-5 minutes total):</Text>
                      <List size="sm" spacing={4}>
                        <List.Item>
                          <strong>CreateTable API:</strong> 6 parallel API calls for each table
                        </List.Item>
                        <List.Item>
                          <strong>Billing Mode:</strong> PAY_PER_REQUEST (on-demand) - no provisioned capacity, scales automatically
                        </List.Item>
                        <List.Item>
                          <strong>Schema:</strong> Each table has partition key (<Code>patient_id</Code>, <Code>diagnosis_id</Code>, etc.)
                        </List.Item>
                        <List.Item>
                          <strong>Encryption:</strong> Server-side encryption at rest (AWS-managed keys)
                        </List.Item>
                        <List.Item>
                          <strong>Point-in-Time Recovery:</strong> Enabled for data protection (7-day backups)
                        </List.Item>
                        <List.Item>
                          <strong>Tags:</strong> ResourceGroup tag applied for cost tracking
                        </List.Item>
                      </List>
                      <Text size="xs" c="dimmed" mt="xs">
                        Tables are immediately available after ~60-90 seconds but may show "CREATING" status briefly
                      </Text>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconServer />} title="Neo4j Kubernetes Deployment" color="cyan" variant="light">
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>StatefulSet vs Deployment (Why StatefulSet?):</Text>
                      <List size="sm" spacing={4}>
                        <List.Item>
                          <strong>Stable Network Identity:</strong> Pod always named <Code>neo4j-0</Code> (not random)
                        </List.Item>
                        <List.Item>
                          <strong>Persistent Volume Claim:</strong> Creates EBS volume (20GB gp3) that persists across pod restarts
                        </List.Item>
                        <List.Item>
                          <strong>Ordered Deployment:</strong> Waits for volume mount before starting database
                        </List.Item>
                        <List.Item>
                          <strong>Headless Service:</strong> <Code>neo4j-service</Code> provides stable DNS for Bolt protocol (port 7687)
                        </List.Item>
                      </List>
                      <Text size="sm" mt="md">
                        <strong>Neo4j Browser:</strong> Web UI exposed on port 7474 for visual graph exploration
                      </Text>
                      <Text size="sm">
                        <strong>Data Model:</strong> Graph stores patient-diagnosis-provider relationships as nodes and edges (vs DynamoDB's flat tables)
                      </Text>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconInfoCircle />} color="blue" variant="light">
                    <Text size="sm">
                      <strong>Hybrid Storage Strategy:</strong> DynamoDB for fast lookups and scalability (~$3/mo for dataset).
                      Neo4j for complex relationship queries and graph analytics (~$2/mo vs Neptune's $216/mo).
                    </Text>
                  </Alert>
                </Stack>
              )}

              {/* Step 6: Integration Service */}
              {activeStep === 6 && (
                <Stack gap="md">
                  <Badge color="grape" variant="light" leftSection={<IconClock size={14} />}>
                    5-10 minutes
                  </Badge>
                  <Text size="sm">Building and deploying the integration layer:</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Builds Docker image with Flask API</List.Item>
                    <List.Item>Pushes to AWS ECR (Elastic Container Registry)</List.Item>
                    <List.Item>Deploys to Kubernetes with connections to:
                      <List withPadding size="xs" mt={4}>
                        <List.Item>Ollama (local models)</List.Item>
                        <List.Item>Bedrock (managed models)</List.Item>
                        <List.Item>DynamoDB (healthcare data)</List.Item>
                        <List.Item>Neo4j (graph relationships)</List.Item>
                      </List>
                    </List.Item>
                    <List.Item>Creates web UI for querying data with AI</List.Item>
                    <List.Item>Exposes LoadBalancer on port 8080</List.Item>
                  </List>

                  <Divider label="What's Happening Behind the Scenes" labelPosition="center" my="md" />

                  <Alert icon={<IconBrandDocker />} title="Docker Build & Registry Push" color="grape" variant="light">
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>Container Image Build Process (3-4 minutes):</Text>
                      <List size="sm" spacing={4}>
                        <List.Item>
                          <strong>1. Create Dockerfile:</strong> Multi-stage build with Python 3.11 slim base
                        </List.Item>
                        <List.Item>
                          <strong>2. Install Dependencies:</strong>
                          <List withPadding size="xs" mt={4}>
                            <List.Item><Code>flask</Code> - Web framework for REST API</List.Item>
                            <List.Item><Code>boto3</Code> - AWS SDK for Bedrock + DynamoDB</List.Item>
                            <List.Item><Code>neo4j</Code> - Python driver for graph queries</List.Item>
                            <List.Item><Code>requests</Code> - HTTP client for Ollama API</List.Item>
                            <List.Item><Code>langchain</Code> - LLM orchestration framework</List.Item>
                          </List>
                        </List.Item>
                        <List.Item>
                          <strong>3. Build Image:</strong> <Code>docker build -t healthcare-ai-bridge:latest .</Code>
                        </List.Item>
                        <List.Item>
                          <strong>4. Tag for ECR:</strong> <Code>547741150715.dkr.ecr.us-west-2.amazonaws.com/healthcare-ai-bridge:latest</Code>
                        </List.Item>
                        <List.Item>
                          <strong>5. Push to ECR:</strong> Creates private repository if doesn't exist, pushes layers (~500MB)
                        </List.Item>
                      </List>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconPlug />} title="Service Integration Architecture" color="blue" variant="light">
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>How Components Connect:</Text>
                      <List size="sm" spacing={4}>
                        <List.Item>
                          <strong>Ollama Connection:</strong> HTTP client → <Code>ollama-service.ollama.svc.cluster.local:11434</Code> (in-cluster DNS)
                        </List.Item>
                        <List.Item>
                          <strong>Bedrock Connection:</strong> boto3 client → Uses IRSA role from ServiceAccount → Calls us-west-2 Bedrock API
                        </List.Item>
                        <List.Item>
                          <strong>DynamoDB Connection:</strong> boto3 resource → PAY_PER_REQUEST tables → Query/Scan operations
                        </List.Item>
                        <List.Item>
                          <strong>Neo4j Connection:</strong> Bolt driver → <Code>neo4j-service.neo4j.svc.cluster.local:7687</Code> → Cypher query execution
                        </List.Item>
                      </List>
                      <Text size="sm" mt="md">
                        <strong>API Endpoints Exposed:</strong>
                      </Text>
                      <List size="sm" spacing={2}>
                        <List.Item><Code>GET /health</Code> - Health check</List.Item>
                        <List.Item><Code>POST /query</Code> - Natural language query with AI model selection</List.Item>
                        <List.Item><Code>GET /graph</Code> - Neo4j relationship visualization</List.Item>
                        <List.Item><Code>POST /export</Code> - Export dataset to S3</List.Item>
                      </List>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconSettings />} title="Deployment Configuration" color="violet" variant="light">
                    <Stack gap="xs">
                      <Text size="sm">
                        <strong>Replicas:</strong> 2 pods for high availability (LoadBalancer distributes traffic)
                      </Text>
                      <Text size="sm">
                        <strong>Resource Limits:</strong> 512MB RAM, 0.5 CPU per pod
                      </Text>
                      <Text size="sm">
                        <strong>Environment Variables:</strong> Injected from ConfigMap (service URLs, region) + ServiceAccount (AWS credentials)
                      </Text>
                      <Text size="sm">
                        <strong>LoadBalancer:</strong> AWS provisions Network Load Balancer → forwards port 8080 → pods
                      </Text>
                    </Stack>
                  </Alert>
                </Stack>
              )}

              {/* Step 7: S3 Storage */}
              {activeStep === 7 && (
                <Stack gap="md">
                  <Badge color="pink" variant="light" leftSection={<IconClock size={14} />}>
                    2-3 minutes
                  </Badge>
                  <Text size="sm">Setting up S3 for dataset exports:</Text>
                  <List size="sm" spacing="xs">
                    <List.Item>Creates S3 bucket with versioning</List.Item>
                    <List.Item>Configures bucket policy for secure access</List.Item>
                    <List.Item>Enables CORS for web uploads</List.Item>
                    <List.Item>Links to integration service for dataset exports</List.Item>
                  </List>

                  <Divider label="What's Happening Behind the Scenes" labelPosition="center" my="md" />

                  <Alert icon={<IconServer />} title="S3 Bucket Configuration" color="pink" variant="light">
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>Bucket Setup (2-3 minutes):</Text>
                      <List size="sm" spacing={4}>
                        <List.Item>
                          <strong>Bucket Name:</strong> <Code>healthcare-ai-datasets-[account-id]-[student-id]</Code> (globally unique)
                        </List.Item>
                        <List.Item>
                          <strong>Versioning:</strong> Enabled to track dataset changes over time
                        </List.Item>
                        <List.Item>
                          <strong>Encryption:</strong> Server-side encryption (SSE-S3) for data at rest
                        </List.Item>
                        <List.Item>
                          <strong>Public Access:</strong> Blocked by default (private bucket)
                        </List.Item>
                        <List.Item>
                          <strong>Lifecycle Policy:</strong> Moves old versions to Glacier after 90 days (cost savings)
                        </List.Item>
                      </List>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconSettings />} title="CORS & Access Configuration" color="blue" variant="light">
                    <Stack gap="xs">
                      <Text size="sm" fw={600}>Cross-Origin Resource Sharing (CORS):</Text>
                      <Text size="sm">
                        Allows web UI to upload datasets directly from browser to S3
                      </Text>
                      <Code block mt="xs">
                        {`{
  "AllowedOrigins": ["http://localhost:8080", "*.elb.amazonaws.com"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"]
}`}
                      </Code>
                      <Text size="sm" mt="md">
                        <strong>Bucket Policy:</strong> Grants integration service IAM role PutObject/GetObject permissions
                      </Text>
                    </Stack>
                  </Alert>

                  <Alert icon={<IconInfoCircle />} title="Dataset Publishing Workflow" color="green" variant="light">
                    <Text size="sm">
                      Integration service exports synthetic data from DynamoDB → formats as CSV/JSON → uploads to S3 →
                      generates pre-signed URLs for sharing. Students can download datasets for local analysis or model training.
                    </Text>
                  </Alert>
                </Stack>
              )}
            </Box>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Accessing Your Infrastructure */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Accessing Your Infrastructure
        </Title>

        <Timeline active={3} bulletSize={24} lineWidth={2}>
          <Timeline.Item bullet={<IconTerminal size={14} />} title="Update Kubeconfig">
            <Text size="sm" mt="xs">
              Connect kubectl to your cluster:
            </Text>
            <Code block mt="xs">
              {`aws eks update-kubeconfig --region us-west-2 --name ollama-ai-cluster

# Verify connection
kubectl get nodes`}
            </Code>
          </Timeline.Item>

          <Timeline.Item bullet={<IconServer size={14} />} title="Get Service URLs">
            <Text size="sm" mt="xs">
              Find your LoadBalancer endpoints:
            </Text>
            <Code block mt="xs">
              {`# Ollama endpoint
kubectl get svc ollama-service -n ollama

# Integration service endpoint  
kubectl get svc healthcare-ai-bridge -n ollama

# Neo4j endpoint
kubectl get svc neo4j-service -n neo4j`}
            </Code>
          </Timeline.Item>

          <Timeline.Item bullet={<IconRocket size={14} />} title="Or Use Port Forwarding">
            <Text size="sm" mt="xs">
              For immediate local access:
            </Text>
            <Code block mt="xs">
              {`# Ollama on localhost:11434
kubectl port-forward -n ollama svc/ollama-service 11434:11434

# Integration on localhost:8080
kubectl port-forward -n ollama svc/healthcare-ai-bridge 8080:8080

# Neo4j browser on localhost:7474
kubectl port-forward -n neo4j svc/neo4j-service 7474:7474 7687:7687`}
            </Code>
          </Timeline.Item>

          <Timeline.Item bullet={<IconCheck size={14} />} title="Test Your Deployment">
            <Text size="sm" mt="xs">
              Verify everything works:
            </Text>
            <Code block mt="xs">
              {`# Test Ollama
curl http://localhost:11434/api/tags

# Test integration with Bedrock
curl -X POST http://localhost:8080/query \\
  -H 'Content-Type: application/json' \\
  -d '{"question": "How many patients have diabetes?", "use_bedrock": true}'

# Open Neo4j browser
# Visit http://localhost:7474
# Username: neo4j
# Password: healthcare2024`}
            </Code>
          </Timeline.Item>
        </Timeline>
      </Card>

      {/* Using the Infrastructure */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Using Your AI Infrastructure
        </Title>

        <Stack gap="lg">
          <Box>
            <Title order={3} size="h4" mb="sm">
              1. Web Interface
            </Title>
            <Text size="sm" mb="xs">
              Open the integration service in your browser:
            </Text>
            <Code block>http://localhost:8080</Code>
            <List size="sm" mt="sm">
              <List.Item>Query healthcare data using natural language</List.Item>
              <List.Item>Switch between Ollama (local) and Bedrock (managed) models</List.Item>
              <List.Item>View graph relationships in Neo4j</List.Item>
              <List.Item>Export datasets to S3</List.Item>
            </List>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="sm">
              2. Query with AI Models
            </Title>
            <Text size="sm" mb="xs">
              Example queries to try:
            </Text>
            <List size="sm">
              <List.Item>"List all patients diagnosed with Type 2 Diabetes"</List.Item>
              <List.Item>"What medications are prescribed for hypertension?"</List.Item>
              <List.Item>"Show me the top 5 diagnoses by patient count"</List.Item>
              <List.Item>"Which providers have treated the most patients?"</List.Item>
            </List>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="sm">
              3. Explore Graph Relationships
            </Title>
            <Text size="sm" mb="xs">
              Open Neo4j browser and run Cypher queries:
            </Text>
            <Code block>
              {`// Find patient treatment networks
MATCH (p:Patient)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
      -[:TREATED_BY]->(prov:Provider)
RETURN p, d, prov LIMIT 100

// Medication co-prescription patterns
MATCH (m1:Medication)<-[:PRESCRIBED]-(p:Patient)
      -[:PRESCRIBED]->(m2:Medication)WHERE id(m1) < id(m2)
RETURN m1.name, m2.name, count(p) as patients
ORDER BY patients DESC LIMIT 10`}
            </Code>
          </Box>

          <Box>
            <Title order={3} size="h4" mb="sm">
              4. Access DynamoDB Data
            </Title>
            <Text size="sm" mb="xs">
              Query tables directly with AWS CLI:
            </Text>
            <Code block>
              {`# List all tables
aws dynamodb list-tables --region us-west-2

# Scan patients table
aws dynamodb scan --table-name healthcare-patients --region us-west-2

# Query specific patient
aws dynamodb get-item --table-name healthcare-patients \\
  --key '{"patient_id": {"S": "P001"}}' --region us-west-2`}
            </Code>
          </Box>
        </Stack>
      </Card>

      {/* Cleanup */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Cleanup (When Finished)
        </Title>
        <Alert icon={<IconAlertCircle />} title="Important: Clean Up Resources" color="red" variant="light" mb="md">
          Always delete resources when done to avoid ongoing charges (~$15-20/day)
        </Alert>
        
        <Text size="sm" mb="xs">
          Run the cleanup script:
        </Text>
        <Code block>
          {`cd deployment-scripts
./cleanup.sh

# This will remove:
# - EKS cluster and all nodes
# - DynamoDB tables
# - S3 buckets
# - IAM policies and roles
# - ECR repositories`}
        </Code>

        <Alert icon={<IconInfoCircle />} color="blue" variant="light" mt="md">
          <Text size="sm">
            The cleanup script is safe - it will ask for confirmation before deleting each resource group
          </Text>
        </Alert>
      </Card>

      {/* Troubleshooting */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Troubleshooting
        </Title>

        <Stack gap="md">
          <Box>
            <Text size="sm" fw={600}>
              EKS cluster creation times out
            </Text>
            <Text size="sm" c="dimmed">
              CloudFormation may still be working. Check AWS Console → CloudFormation to see stack status.
              GPU node groups can take 25-30 minutes.
            </Text>
          </Box>

          <Box>
            <Text size="sm" fw={600}>
              "Not connected to Kubernetes cluster" errors
            </Text>
            <Code size="sm">aws eks update-kubeconfig --region us-west-2 --name ollama-ai-cluster</Code>
          </Box>

          <Box>
            <Text size="sm" fw={600}>
              LoadBalancer stuck in "pending" state
            </Text>
            <Text size="sm" c="dimmed">
              AWS provisions load balancers asynchronously. Can take 5-10 minutes. Use port-forward meanwhilefor immediate access.
            </Text>
          </Box>

          <Box>
            <Text size="sm" fw={600}>
              Ollama model download fails
            </Text>
            <Text size="sm" c="dimmed">
              Check pod logs: <Code>kubectl logs -n ollama deployment/ollama -f</Code>
              <br />
              Large model files may require stable network connection
            </Text>
          </Box>

          <Box>
            <Text size="sm" fw={600}>
              AWS credential errors
            </Text>
            <Text size="sm" c="dimmed">
              Run <Code>aws sso login --profile dataai-christol</Code> to refresh SSO session
            </Text>
          </Box>
        </Stack>
      </Card>

      {/* Resources */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={2} mb="md">
          Additional Resources
        </Title>
        <List size="sm" spacing="sm">
          <List.Item>
            <strong>Innovation Sandbox Guide:</strong>{' '}
            <Code>deployment-scripts/INNOVATION-SANDBOX-GUIDE.md</Code>
          </List.Item>
          <List.Item>
            <strong>Pre-Deployment Checklist:</strong>{' '}
            <Code>deployment-scripts/PRE-DEPLOYMENT-CHECKLIST.md</Code>
          </List.Item>
          <List.Item>
            <strong>Neo4j vs Neptune Comparison:</strong>{' '}
            <Code>deployment-scripts/NEO4J-VS-NEPTUNE.md</Code>
          </List.Item>
          <List.Item>
            <strong>Deployment Logs:</strong>{' '}
            <Code>deployment-scripts/deployment-*.log</Code>
          </List.Item>
        </List>
      </Card>
    </Stack>
  );
}
