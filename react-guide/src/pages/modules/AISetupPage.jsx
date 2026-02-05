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
  Code,
  Alert,
  Timeline,
  List,
  Stack,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCloud,
  IconBrandAws,
  IconServer,
  IconDatabase,
  IconBrain,
  IconCheck,
  IconCopy,
  IconAlertCircle,
  IconInfoCircle,
  IconRocket,
  IconNetwork,
} from '@tabler/icons-react';

// Code block component with copy functionality
const CodeBlock = ({ children, language = 'bash' }) => {
  return (
    <Box pos="relative" mb="md">
      <CopyButton value={children}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? 'Copied' : 'Copy'} position="left">
            <ActionIcon
              pos="absolute"
              top={8}
              right={8}
              variant="subtle"
              onClick={copy}
              style={{ zIndex: 1 }}
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
      <Code block style={{ paddingTop: '2rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {children}
      </Code>
    </Box>
  );
};

// EKS Deployment Content
const EKSDeploymentContent = () => (
  <Stack gap="lg">
    <Alert icon={<IconInfoCircle size={16} />} title="Prerequisites" color="blue">
      <List size="sm">
        <List.Item>AWS Innovation Sandbox account access</List.Item>
        <List.Item>AWS CLI installed and configured</List.Item>
        <List.Item>kubectl CLI tool installed</List.Item>
        <List.Item>eksctl CLI tool installed</List.Item>
        <List.Item>Minimum IAM permissions: EKS, EC2, VPC, IAM</List.Item>
      </List>
    </Alert>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 1: Configure AWS CLI</Title>
      <Text mb="sm">Set up your AWS Innovation Sandbox credentials:</Text>
      <CodeBlock>
{`aws configure

# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 2: Install kubectl and eksctl</Title>
      <Text mb="sm" fw={600}>Install kubectl:</Text>
      <CodeBlock>
{`# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify
kubectl version --client`}
      </CodeBlock>

      <Text mb="sm" mt="md" fw={600}>Install eksctl:</Text>
      <CodeBlock>
{`# macOS
brew install eksctl

# Linux
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Verify  
eksctl version`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 3: Create EKS Cluster Configuration</Title>
      <Text mb="sm">Create a configuration file for your AI-optimized cluster:</Text>
      <Text size="sm" c="dimmed" mb="sm">Save this as <Code>eks-ollama-cluster.yaml</Code></Text>
      <CodeBlock>
{`apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: ollama-ai-cluster
  region: us-east-1
  version: "1.28"

vpc:
  cidr: "10.0.0.0/16"
  nat:
    gateway: HighlyAvailable

managedNodeGroups:
  - name: ai-compute-nodes
    instanceType: g4dn.xlarge
    minSize: 1
    maxSize: 3
    desiredCapacity: 2
    volumeSize: 100
    ssh:
      allow: true
    labels:
      workload: ai-inference

  - name: general-nodes
    instanceType: t3.large
    minSize: 1
    maxSize: 2
    desiredCapacity: 1
    volumeSize: 50

iam:
  withOIDC: true

addons:
  - name: vpc-cni
  - name: coredns
  - name: kube-proxy`}
      </CodeBlock>

      <Text mb="sm" mt="md">Deploy the cluster (takes 15-20 minutes):</Text>
      <CodeBlock>
{`eksctl create cluster -f eks-ollama-cluster.yaml

# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name ollama-ai-cluster

# Verify cluster
kubectl get nodes
kubectl get namespaces`}
      </CodeBlock>

      <Alert icon={<IconAlertCircle size={16} />} color="orange" mt="md">
        <strong>Cost Note:</strong> g4dn.xlarge instances have GPU capabilities but incur higher costs. 
        Monitor your Innovation Sandbox budget. For testing, you can use t3.xlarge instead.
      </Alert>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 4: Install NVIDIA Device Plugin</Title>
      <Text mb="sm">Enable GPU support in your cluster:</Text>
      <CodeBlock>
{`kubectl create -f https://raw.githubusercontent.com/NVIDIA/k8s-device-plugin/v0.14.0/nvidia-device-plugin.yml

# Verify GPU nodes
kubectl get nodes -o json | jq '.items[].status.allocatable."nvidia.com/gpu"'`}
      </CodeBlock>
    </Paper>
  </Stack>
);

// Ollama Installation Content
const OllamaInstallationContent = () => (
  <Stack gap="lg">
    <Alert icon={<IconRocket size={16} />} title="What is Ollama?" color="violet">
      Ollama is a lightweight framework for running large language models locally. 
      We'll deploy it on EKS to create a scalable, private AI infrastructure.
    </Alert>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 1: Create Ollama Namespace</Title>
      <CodeBlock>
{`kubectl create namespace ollama
kubectl config set-context --current --namespace=ollama`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 2: Create Persistent Volume</Title>
      <Text mb="sm">Save as <Code>ollama-pvc.yaml</Code>:</Text>
      <CodeBlock>
{`apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ollama-models
  namespace: ollama
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: 50Gi`}
      </CodeBlock>
      <Text mb="sm" mt="md">Apply the configuration:</Text>
      <CodeBlock>
{`kubectl apply -f ollama-pvc.yaml
kubectl get pvc -n ollama`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 3: Deploy Ollama</Title>
      <Text mb="sm">Save as <Code>ollama-deployment.yaml</Code>:</Text>
      <CodeBlock>
{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: ollama
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
      - name: ollama
        image: ollama/ollama:latest
        ports:
        - containerPort: 11434
          name: http
        env:
        - name: OLLAMA_HOST
          value: "0.0.0.0:11434"
        volumeMounts:
        - name: ollama-models
          mountPath: /root/.ollama
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
            nvidia.com/gpu: "1"
          limits:
            memory: "8Gi"
            cpu: "4"
            nvidia.com/gpu: "1"
      volumes:
      - name: ollama-models
        persistentVolumeClaim:
          claimName: ollama-models
      nodeSelector:
        workload: ai-inference
---
apiVersion: v1
kind: Service
metadata:
  name: ollama-service
  namespace: ollama
spec:
  selector:
    app: ollama
  ports:
    - protocol: TCP
      port: 11434
      targetPort: 11434
  type: LoadBalancer`}
      </CodeBlock>

      <Text mb="sm" mt="md">Deploy and verify:</Text>
      <CodeBlock>
{`kubectl apply -f ollama-deployment.yaml
kubectl rollout status deployment/ollama -n ollama
kubectl get svc ollama-service -n ollama`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 4: Pull AI Models</Title>
      <Text mb="sm">Download models into your Ollama deployment:</Text>
      <CodeBlock>
{`# Get pod name
POD_NAME=$(kubectl get pods -n ollama -l app=ollama -o jsonpath='{.items[0].metadata.name}')

# Pull Llama 2 (7B - good starting point)
kubectl exec -n ollama $POD_NAME -- ollama pull llama2

# Pull Mistral (excellent for instructions)
kubectl exec -n ollama $POD_NAME -- ollama pull mistral

# Pull Mixtral (larger, more powerful)
kubectl exec -n ollama $POD_NAME -- ollama pull mixtral

# List models
kubectl exec -n ollama $POD_NAME -- ollama list

# Test
kubectl exec -n ollama $POD_NAME -- ollama run llama2 "What is a knowledge graph?"`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 5: Test Ollama API</Title>
      <CodeBlock>
{`# Port-forward to test locally
kubectl port-forward -n ollama svc/ollama-service 11434:11434 &

# Test API
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Why is healthcare data compliance important?",
  "stream": false
}'

# Get external URL
OLLAMA_URL=$(kubectl get svc ollama-service -n ollama -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Ollama URL: http://$OLLAMA_URL:11434"`}
      </CodeBlock>
    </Paper>
  </Stack>
);

// Knowledge Graph Content
const KnowledgeGraphContent = () => (
  <Stack gap="lg">
    <Alert icon={<IconDatabase size={16} />} title="Knowledge Graph Overview" color="teal">
      A knowledge graph stores relationships between healthcare entities (patients, diagnoses, 
      treatments) enabling powerful AI-driven insights and queries.
    </Alert>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Option 1: Deploy Neo4j on EKS</Title>
      <Text size="sm" c="dimmed" mb="sm">
        Neo4j is a popular graph database with excellent Cypher query language.
      </Text>
      
      <CodeBlock>
{`# Create namespace
kubectl create namespace neo4j

# Add Helm repo
helm repo add neo4j https://helm.neo4j.com/neo4j
helm repo update

# Install Neo4j
helm install neo4j-healthcare neo4j/neo4j \\
  --namespace neo4j \\
  --set neo4j.password=YourSecurePassword123! \\
  --set volumes.data.mode=defaultStorageClass \\
  --set volumes.data.defaultStorageClass.requests.storage=50Gi \\
  --set services.neo4j.type=LoadBalancer

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=neo4j -n neo4j --timeout=300s

# Get service
kubectl get svc -n neo4j`}
      </CodeBlock>

      <Text mt="md" mb="sm" fw={600}>Access Neo4j Browser:</Text>
      <CodeBlock>
{`# Port-forward
kubectl port-forward -n neo4j svc/neo4j-healthcare 7474:7474 7687:7687

# Navigate to: http://localhost:7474
# Username: neo4j
# Password: YourSecurePassword123!`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Option 2: AWS Neptune (Managed)</Title>
      <Text size="sm" c="dimmed" mb="sm">
        AWS Neptune is a fully managed graph database service.
      </Text>
      
      <CodeBlock>
{`# Create Neptune cluster
aws neptune create-db-cluster \\
  --db-cluster-identifier healthcare-kg \\
  --engine neptune \\
  --master-username admin \\
  --master-user-password YourSecurePassword123! \\
  --vpc-security-group-ids sg-xxxxx

# Create instance
aws neptune create-db-instance \\
  --db-instance-identifier healthcare-kg-1 \\
  --db-instance-class db.r5.large \\
  --engine neptune \\
  --db-cluster-identifier healthcare-kg

# Get endpoint
aws neptune describe-db-clusters \\
  --db-cluster-identifier healthcare-kg \\
  --query 'DBClusters[0].Endpoint'`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 2: Create Healthcare Schema</Title>
      <Text mb="sm">Install the Neo4j Python driver and populate with healthcare data:</Text>
      <CodeBlock>
{`pip install neo4j

# Create populate_kg.py with the following code:
# from neo4j import GraphDatabase
# 
# driver = GraphDatabase.driver("bolt://localhost:7687", 
#                               auth=("neo4j", "YourSecurePassword123!"))
#
# with driver.session() as session:
#     # Create sample patients
#     session.run("CREATE (p1:Patient {id: 'P001', age: 45})")
#     # Create diagnoses
#     session.run("CREATE (d1:Diagnosis {code: 'E11.9', name: 'Type 2 Diabetes'})")
#     # Create relationships
#     session.run("MATCH (p:Patient {id: 'P001'}), (d:Diagnosis {code: 'E11.9'}) CREATE (p)-[:DIAGNOSED_WITH]->(d)")
#
# driver.close()`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 3: Query Examples</Title>
      <Text mb="sm">Example Cypher queries for healthcare insights:</Text>
      <CodeBlock>
{`// Find patients with multiple conditions
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis)
WITH p, COUNT(d) as condition_count
WHERE condition_count > 1
RETURN p.id, condition_count
ORDER BY condition_count DESC;

// Find common medication combinations
MATCH (p:Patient)-[:PRESCRIBED]->(m1:Medication)
MATCH (p)-[:PRESCRIBED]->(m2:Medication)
WHERE m1.name < m2.name
RETURN m1.name, m2.name, COUNT(p) as patient_count
ORDER BY patient_count DESC LIMIT 10;

// Find patients by diagnosis category
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {category: 'Cardiovascular'})
RETURN p.id, d.name;`}
      </CodeBlock>
    </Paper>
  </Stack>
);

// Integration Content
const IntegrationContent = () => (
  <Stack gap="lg">
    <Alert icon={<IconBrain size={16} />} title="AI-Powered Knowledge Graph Queries" color="indigo">
      Connect Ollama to your knowledge graph to enable natural language queries over healthcare data.
    </Alert>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 1: Create Query Bridge Service</Title>
      <Text mb="sm">Create a Flask service that translates natural language to Cypher queries.</Text>
      <Text size="sm" c="dimmed" mb="sm">Save as <Code>kg-query-bridge.py</Code>:</Text>
      <CodeBlock>
{`from flask import Flask, request, jsonify
from neo4j import GraphDatabase
import requests

app = Flask(__name__)

OLLAMA_URL = "http://ollama-service.ollama.svc.cluster.local:11434"
NEO4J_URI = "bolt://neo4j-healthcare.neo4j.svc.cluster.local:7687"

class KGQueryBridge:
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, 
                                          auth=("neo4j", "YourSecurePassword123!"))
    
    def generate_cypher(self, question):
        prompt = f"Convert to Cypher: {question}"
        response = requests.post(f"{OLLAMA_URL}/api/generate", 
                               json={"model": "mixtral", "prompt": prompt})
        return response.json()['response']
    
    def execute_query(self, cypher):
        with self.driver.session() as session:
            result = session.run(cypher)
            return [dict(record) for record in result]

bridge = KGQueryBridge()

@app.route('/query', methods=['POST'])
def query():
    question = request.json.get('question')
    cypher = bridge.generate_cypher(question)
    results = bridge.execute_query(cypher)
    return jsonify({"question": question, "cypher": cypher, "results": results})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 2: Deploy Query Bridge</Title>
      <Text mb="sm">Create Dockerfile:</Text>
      <CodeBlock>
{`FROM python:3.11-slim
WORKDIR /app
RUN pip install flask neo4j requests
COPY kg-query-bridge.py .
EXPOSE 8080
CMD ["python", "kg-query-bridge.py"]`}
      </CodeBlock>

      <Text mb="sm" mt="md">Build and push:</Text>
      <CodeBlock>
{`docker build -t kg-query-bridge:latest .

# Push to ECR
aws ecr create-repository --repository-name kg-query-bridge
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker tag kg-query-bridge:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/kg-query-bridge:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/kg-query-bridge:latest`}
      </CodeBlock>

      <Text mb="sm" mt="md">Deploy to Kubernetes (save as <Code>query-bridge.yaml</Code>):</Text>
      <CodeBlock>
{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: kg-query-bridge
  namespace: ollama
spec:
  replicas: 2
  selector:
    matchLabels:
      app: kg-query-bridge
  template:
    metadata:
      labels:
        app: kg-query-bridge
    spec:
      containers:
      - name: bridge
        image: YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/kg-query-bridge:latest
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: kg-query-bridge
  namespace: ollama
spec:
  selector:
    app: kg-query-bridge
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
  type: LoadBalancer`}
      </CodeBlock>

      <CodeBlock>
{`kubectl apply -f query-bridge.yaml
kubectl get svc kg-query-bridge -n ollama`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 3: Test Natural Language Queries</Title>
      <CodeBlock>
{`# Port-forward
kubectl port-forward -n ollama svc/kg-query-bridge 8080:8080 &

# Test queries
curl -X POST http://localhost:8080/query \\
  -H "Content-Type: application/json" \\
  -d '{"question": "How many patients have diabetes?"}'

curl -X POST http://localhost:8080/query \\
  -H "Content-Type: application/json" \\
  -d '{"question": "What medications are prescribed for hypertension?"}'`}
      </CodeBlock>
    </Paper>

    <Paper p="lg" withBorder>
      <Title order={3} mb="md">Step 4: Advanced - RAG with Knowledge Graph</Title>
      <Text mb="sm">Use Retrieval-Augmented Generation for enhanced answers:</Text>
      <Text size="sm" c="dimmed" mb="md">
        Query the knowledge graph first, then use those results as context for the LLM to provide 
        comprehensive, data-backed answers.
      </Text>
      
      <List size="sm">
        <List.Item>Query knowledge graph for relevant patient/treatment data</List.Item>
        <List.Item>Pass graph results as context to Ollama</List.Item>
        <List.Item>LLM analyzes patterns and provides insights</List.Item>
        <List.Item>Maintains HIPAA compliance with de-identified data</List.Item>
      </List>

      <Text mt="md" mb="sm" fw={600}>Example RAG Implementation:</Text>
      <CodeBlock>
{`# Step 1: Query knowledge graph for context
kg_results = execute_cypher_query("MATCH (p:Patient)-[r]->(d:Diagnosis) RETURN p, d")

# Step 2: Use results as context for Ollama
ollama_prompt = f"Based on this data: {kg_results}, answer: {user_question}"
ollama_response = call_ollama_api(ollama_prompt)

# Step 3: Return comprehensive answer with citations
return {
    "answer": ollama_response,
    "sources": kg_results,
    "confidence": "high"
}`}
      </CodeBlock>
    </Paper>
  </Stack>
);

// Sub-page configuration
const subPages = {
  'eks-deployment': {
    title: 'EKS Cluster Deployment',
    subtitle: 'Deploy Kubernetes cluster in AWS Innovation Sandbox',
    icon: IconCloud,
    color: 'blue',
    content: <EKSDeploymentContent />,
  },
  'ollama-installation': {
    title: 'Ollama Installation',
    subtitle: 'Install and configure Ollama on your EKS cluster',
    icon: IconRocket,
    color: 'violet',
    content: <OllamaInstallationContent />,
  },
  'knowledge-graph': {
    title: 'Knowledge Graph Setup',
    subtitle: 'Create healthcare knowledge graph with Neo4j or Neptune',
    icon: IconNetwork,
    color: 'teal',
    content: <KnowledgeGraphContent />,
  },
  'integration': {
    title: 'AI + Knowledge Graph Integration',
    subtitle: 'Connect Ollama to your knowledge graph for AI-powered queries',
    icon: IconBrain,
    color: 'indigo',
    content: <IntegrationContent />,
  },
};

const subPageOrder = ['eks-deployment', 'ollama-installation', 'knowledge-graph', 'integration'];

export default function AISetupPage() {
  const { subPage } = useParams();

  // If no subpage, show the overview
  if (!subPage) {
    return (
      <Container size="lg" py="xl">
        <Breadcrumbs mb="lg">
          <Anchor component={Link} to="/" size="sm">
            Home
          </Anchor>
          <Text size="sm">AI Setup Guide</Text>
        </Breadcrumbs>

        <Paper
          shadow="md"
          radius="lg"
          p="xl"
          mb="xl"
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Group gap="md" mb="md">
            <ThemeIcon color="white" size={56} radius="xl" variant="white">
              <IconBrandAws size={28} color="#667eea" />
            </ThemeIcon>
            <Box>
              <Badge color="white" variant="filled" size="lg" mb="xs" style={{ color: '#667eea' }}>
                DEPLOYMENT GUIDE
              </Badge>
              <Title order={1}>EKS + Ollama + Knowledge Graph</Title>
            </Box>
          </Group>
          <Text size="lg">
            Deploy a complete AI infrastructure in AWS Innovation Sandbox: EKS cluster with Ollama 
            for running LLMs, and a knowledge graph for healthcare data insights.
          </Text>
        </Paper>

        <Alert icon={<IconInfoCircle size={16} />} title="What You'll Build" color="blue" mb="xl">
          <List size="sm">
            <List.Item><strong>EKS Cluster:</strong> Kubernetes environment running in AWS</List.Item>
            <List.Item><strong>Ollama on EKS:</strong> Self-hosted LLMs (Llama 2, Mistral, Mixtral) with GPU support</List.Item>
            <List.Item><strong>Knowledge Graph:</strong> Neo4j or AWS Neptune storing healthcare relationships</List.Item>
            <List.Item><strong>AI Integration:</strong> Natural language queries over your healthcare data</List.Item>
          </List>
        </Alert>

        <Paper p="lg" withBorder radius="md" mb="xl">
          <Title order={3} mb="md">Why This Architecture?</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Box>
              <Text fw={600} size="sm" c="blue" mb="xs">🔒 Data Privacy</Text>
              <Text size="sm">
                Keep sensitive healthcare data within your AWS environment. No external API calls 
                means full HIPAA compliance control.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="violet" mb="xs">📈 Scalability</Text>
              <Text size="sm">
                EKS automatically scales your AI workloads. Handle one query or thousands 
                simultaneously with Kubernetes orchestration.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="teal" mb="xs">🧠 Graph-Powered Insights</Text>
              <Text size="sm">
                Knowledge graphs reveal  hidden relationships in patient data—comorbidities, 
                treatment patterns, and risk factors.
              </Text>
            </Box>
            <Box>
              <Text fw={600} size="sm" c="orange" mb="xs">💰 Cost Control</Text>
              <Text size="sm">
                Run your own models instead of paying per-token API fees. Innovation Sandbox 
                credits let you experiment freely.
              </Text>
            </Box>
          </SimpleGrid>
        </Paper>

        <Title order={3} mb="md">Deployment Steps</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="xl">
          {subPageOrder.map((key) => {
            const page = subPages[key];
            const Icon = page.icon;
            return (
              <Card
                key={key}
                component={Link}
                to={`/ai-setup/${key}`}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ textDecoration: 'none' }}
              >
                <Group gap="sm" mb="sm">
                  <ThemeIcon color={page.color} size="lg" radius="xl">
                    <Icon size={20} />
                  </ThemeIcon>
                  <Text fw={600}>{page.title}</Text>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  {page.subtitle}
                </Text>
                <Button 
                  variant="light" 
                  color={page.color} 
                  fullWidth
                  rightSection={<IconArrowRight size={14} />}
                >
                  Start Setup
                </Button>
              </Card>
            );
          })}
        </SimpleGrid>

        <Divider my="xl" />

        <Paper p="lg" withBorder radius="md">
          <Title order={4} mb="md">⏱️ Time Estimates</Title>
          <Timeline active={4} bulletSize={24} lineWidth={2}>
            <Timeline.Item bullet={<IconCloud size={12} />} title="EKS Cluster Deployment">
              <Text c="dimmed" size="sm">20-30 minutes (mostly automated)</Text>
            </Timeline.Item>
            <Timeline.Item bullet={<IconRocket size={12} />} title="Ollama Installation">
              <Text c="dimmed" size="sm">10-15 minutes (download models)</Text>
            </Timeline.Item>
            <Timeline.Item bullet={<IconNetwork size={12} />} title="Knowledge Graph Setup">
              <Text c="dimmed" size="sm">15-20 minutes (database + schema)</Text>
            </Timeline.Item>
            <Timeline.Item bullet={<IconBrain size={12} />} title="AI Integration">
              <Text c="dimmed" size="sm">20-30 minutes (bridge service + testing)</Text>
            </Timeline.Item>
          </Timeline>
          <Text size="sm" fw={600} mt="md" c="blue">
            Total: ~60-90 minutes for complete setup
          </Text>
        </Paper>
      </Container>
    );
  }

  // Get the current subpage configuration
  const currentPage = subPages[subPage];
  if (!currentPage) {
    return (
      <Container size="lg" py="xl">
        <Text>Page not found</Text>
        <Button component={Link} to="/ai-setup" mt="md">
          Back to AI Setup
        </Button>
      </Container>
    );
  }

  const currentIndex = subPageOrder.indexOf(subPage);
  const prevPage = currentIndex > 0 ? subPageOrder[currentIndex - 1] : null;
  const nextPage =
    currentIndex < subPageOrder.length - 1
      ? subPageOrder[currentIndex + 1]
      : null;

  const Icon = currentPage.icon;

  return (
    <Container size="lg" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/" size="sm">
          Home
        </Anchor>
        <Anchor component={Link} to="/ai-setup" size="sm">
          AI Setup Guide
        </Anchor>
        <Text size="sm">{currentPage.title}</Text>
      </Breadcrumbs>

      <Paper
        shadow="md"
        radius="lg"
        p="xl"
        mb="xl"
        style={{ 
          background: `linear-gradient(135deg, var(--mantine-color-${currentPage.color}-6) 0%, var(--mantine-color-${currentPage.color}-8) 100%)`,
          color: 'white'
        }}
      >
        <Group gap="md" mb="md">
          <ThemeIcon color="white" size={56} radius="xl" variant="white" style={{ color: `var(--mantine-color-${currentPage.color}-6)` }}>
            <Icon size={28} />
          </ThemeIcon>
          <Box>
            <Badge color="white" variant="filled" size="lg" mb="xs" style={{ color: `var(--mantine-color-${currentPage.color}-6)` }}>
              STEP {currentIndex + 1} OF {subPageOrder.length}
            </Badge>
            <Title order={1}>{currentPage.title}</Title>
          </Box>
        </Group>
        <Text size="lg">
          {currentPage.subtitle}
        </Text>
      </Paper>

      {/* Main Content */}
      {currentPage.content}

      {/* Navigation */}
      <Divider my="xl" />
      <Group justify="space-between">
        {prevPage ? (
          <Button
            component={Link}
            to={`/ai-setup/${prevPage}`}
            variant="light"
            color={currentPage.color}
            leftSection={<IconArrowLeft size={16} />}
          >
            Previous: {subPages[prevPage].title}
          </Button>
        ) : (
          <Button
            component={Link}
            to="/ai-setup"
            variant="light"
            color={currentPage.color}
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Overview
          </Button>
        )}
        {nextPage && (
          <Button
            component={Link}
            to={`/ai-setup/${nextPage}`}
            color={subPages[nextPage].color}
            rightSection={<IconArrowRight size={16} />}
          >
            Next: {subPages[nextPage].title}
          </Button>
        )}
      </Group>
    </Container>
  );
}
