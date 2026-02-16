import React from 'react';
import { Card, Title, Text, List, ThemeIcon, Alert, Code, Stack, Timeline, Badge, Stepper, Group, Box } from '@mantine/core';
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

        <Stepper active={activeStep} onStepClick={setActiveStep} orientation="vertical" breakpoint="sm">
          {/* Step 0: Setup AWS Credentials */}
          <Stepper.Step
            label="Setup AWS Credentials"
            description="Configure AWS SSO authentication"
            icon={<IconKey size={18} />}
          >
            <Stack gap="md" mt="md">
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
              <Alert icon={<IconInfoCircle />} color="blue" variant="light">
                This creates a <Code>.env</Code> file with all your AWS configuration
              </Alert>
            </Stack>
          </Stepper.Step>

          {/* Step 1: Start Deployment */}
          <Stepper.Step
            label="Start Deployment Script"
            description="Launch the automated deployment"
            icon={<IconTerminal size={18} />}
          >
            <Stack gap="md" mt="md">
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
            </Stack>
          </Stepper.Step>

          {/* Step 2: EKS Cluster */}
          <Stepper.Step
            label="EKS Cluster Creation"
            description="20-30 minutes - Kubernetes cluster with GPU"
            icon={<IconCloud size={18} />}
          >
            <Stack gap="md" mt="md">
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
              <Alert icon={<IconInfoCircle />} color="green" variant="light">
                <Text size="sm">
                  <strong>What's happening:</strong> AWS CloudFormation is creating 4 stacks in parallel.
                  You can monitor progress in the AWS Console → CloudFormation.
                </Text>
              </Alert>
            </Stack>
          </Stepper.Step>

          {/* Step 3: Ollama Installation */}
          <Stepper.Step
            label="Install Ollama"
            description="10-15 minutes - Self-hosted LLM engine"
            icon={<IconRocket size={18} />}
          >
            <Stack gap="md" mt="md">
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
              <Alert icon={<IconAlertCircle />} color="yellow" variant="light">
                <Text size="sm">
                  Model download is large - may take longer on slower connections
                </Text>
              </Alert>
            </Stack>
          </Stepper.Step>

          {/* Step 4: AWS Bedrock */}
          <Stepper.Step
            label="Configure AWS Bedrock"
            description="2-3 minutes - Managed AI models"
            icon={<IconBrandAws size={18} />}
          >
            <Stack gap="md" mt="md">
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
            </Stack>
          </Stepper.Step>

          {/* Step 5: Data Storage */}
          <Stepper.Step
            label="Setup Data Storage"
            description="5-10 minutes - DynamoDB + Neo4j"
            icon={<IconDatabase size={18} />}
          >
            <Stack gap="md" mt="md">
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

              <Alert icon={<IconInfoCircle />} color="blue" variant="light">
                <Text size="sm">
                  <strong>Why Neo4j?</strong> Cost-effective alternative to AWS Neptune (~$2/mo vs $216/mo)
                </Text>
              </Alert>
            </Stack>
          </Stepper.Step>

          {/* Step 6: Integration Service */}
          <Stepper.Step
            label="Deploy Integration Service"
            description="5-10 minutes - Flask API + web UI"
            icon={<IconNetwork size={18} />}
          >
            <Stack gap="md" mt="md">
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
            </Stack>
          </Stepper.Step>

          {/* Step 7: S3 Storage */}
          <Stepper.Step
            label="Configure S3 Storage"
            description="2-3 minutes - Dataset publishing"
            icon={<IconServer size={18} />}
          >
            <Stack gap="md" mt="md">
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
            </Stack>
          </Stepper.Step>
        </Stepper>
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
