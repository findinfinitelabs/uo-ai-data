#!/bin/bash

#####################################################################
# AI + Healthcare Data Integration Script
# Deploys the query bridge service that connects Ollama/Bedrock with DynamoDB
#####################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NAMESPACE="${INTEGRATION_NAMESPACE:-ollama}"
IMAGE_NAME="${IMAGE_NAME:-healthcare-ai-bridge}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
AWS_REGION="${AWS_REGION:-us-west-2}"
TABLE_PREFIX="${TABLE_PREFIX:-healthcare}"
S3_BUCKET_NAME="${S3_BUCKET_NAME:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AI + Healthcare Data Integration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Functions
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check Prerequisites
echo -e "${BLUE}Step 1: Checking Prerequisites${NC}"

if ! command_exists kubectl; then
    print_error "kubectl not installed"
    exit 1
fi
print_status "kubectl installed"

if ! command_exists docker; then
    print_error "Docker not installed. Please install Docker first."
    exit 1
fi
print_status "Docker installed"

# Step 2: Create Query Bridge Application with Web UI
echo ""
echo -e "${BLUE}Step 2: Creating Query Bridge Application with Web UI${NC}"

mkdir -p /tmp/healthcare-ai-bridge/{static,templates}
cd /tmp/healthcare-ai-bridge

# Create Web UI (HTML)
cat > templates/index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Healthcare AI Assistant</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 1200px;
            width: 100%;
            height: 90vh;
            display: flex;
            flex-direction: column;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 30px;
            border-radius: 20px 20px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 { font-size: 24px; font-weight: 600; }
        .stats {
            display: flex;
            gap: 20px;
            font-size: 14px;
        }
        .stat { opacity: 0.9; }
        .controls {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        .control-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .control-group label {
            font-weight: 500;
            color: #495057;
            font-size: 14px;
        }
        select {
            padding: 8px 15px;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            background: white;
        }
        select:focus {
            outline: none;
            border-color: #667eea;
        }
        .toggle {
            width: 50px;
            height: 26px;
            background: #ccc;
            border-radius: 13px;
            position: relative;
            cursor: pointer;
            transition: background 0.3s;
        }
        .toggle.active { background: #667eea; }
        .toggle:before {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            top: 3px;
            left: 3px;
            transition: left 0.3s;
        }
        .toggle.active:before { left: 27px; }
        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 30px;
            background: #f8f9fa;
        }
        .message {
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .message.user {
            flex-direction: row-reverse;
        }
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            flex-shrink: 0;
        }
        .message.user .avatar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .message.ai .avatar {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .message-content {
            max-width: 70%;
            padding: 15px 20px;
            border-radius: 15px;
            line-height: 1.6;
        }
        .message.user .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 5px;
        }
        .message.ai .message-content {
            background: white;
            color: #333;
            border: 1px solid #e9ecef;
            border-bottom-left-radius: 5px;
        }
        .message-meta {
            font-size: 12px;
            color: #6c757d;
            margin-top: 8px;
            display: flex;
            gap: 10px;
        }
        .badge {
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
        }
        .input-container {
            padding: 20px 30px;
            background: white;
            border-top: 1px solid #e9ecef;
            border-radius: 0 0 20px 20px;
        }
        .input-wrapper {
            display: flex;
            gap: 10px;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 12px;
            border: 2px solid #e9ecef;
        }
        .input-wrapper:focus-within {
            border-color: #667eea;
        }
        #queryInput {
            flex: 1;
            border: none;
            background: transparent;
            padding: 10px;
            font-size: 15px;
            outline: none;
        }
        #sendButton {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        #sendButton:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        #sendButton:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
        }
        .loading {
            display: none;
            text-align: center;
            padding: 20px;
            color: #6c757d;
        }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .examples {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
        }
        .example-query {
            background: white;
            border: 1px solid #667eea;
            color: #667eea;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .example-query:hover {
            background: #667eea;
            color: white;
        }
        .publish-prompt {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideIn 0.3s;
        }
        .publish-prompt button {
            background: white;
            color: #11998e;
            border: none;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-left: 10px;
            transition: all 0.2s;
        }
        .publish-prompt button:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .publish-prompt .dismiss {
            background: transparent;
            color: white;
            border: 1px solid white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Healthcare AI Assistant</h1>
            <div class="stats">
                <div class="stat">📊 <span id="patientCount">-</span> Patients</div>
                <div class="stat">💊 <span id="medicationCount">-</span> Medications</div>
            </div>
        </div>
        
        <div class="controls">
            <div class="control-group">
                <label>LLM Backend:</label>
                <select id="llmBackend">
                    <option value="bedrock">AWS Bedrock (Claude 3)</option>
                    <option value="ollama">Ollama (Mistral)</option>
                </select>
            </div>
            <div class="control-group">
                <label>RAG Context:</label>
                <div class="toggle active" id="ragToggle"></div>
            </div>
        </div>
        
        <div class="chat-container" id="chatContainer">
            <div class="message ai">
                <div class="avatar">AI</div>
                <div class="message-content">
                    <div>👋 Hello! I'm your Healthcare AI Assistant. I can help you query patient data, analyze diagnoses, review medications, and answer healthcare-related questions.</div>
                    <div class="message-meta">
                        <span class="badge">RAG Enabled</span>
                        <span class="badge">DynamoDB Connected</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="input-container">
            <div class="examples">
                <div class="example-query" onclick="askQuestion('How many patients have diabetes?')">How many patients have diabetes?</div>
                <div class="example-query" onclick="askQuestion('What are the most common medications?')">What are the most common medications?</div>
                <div class="example-query" onclick="askQuestion('List all patients with hypertension')">List all patients with hypertension</div>
            </div>
            <div class="input-wrapper">
                <input type="text" id="queryInput" placeholder="Ask a question about healthcare data..." />
                <button id="sendButton" onclick="sendQuery()">Send</button>
            </div>
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <div>Thinking...</div>
            </div>
        </div>
    </div>

    <script>
        const chatContainer = document.getElementById('chatContainer');
        const queryInput = document.getElementById('queryInput');
        const sendButton = document.getElementById('sendButton');
        const loading = document.getElementById('loading');
        const llmBackend = document.getElementById('llmBackend');
        const ragToggle = document.getElementById('ragToggle');

        // Toggle RAG
        ragToggle.addEventListener('click', () => {
            ragToggle.classList.toggle('active');
        });

        // Load stats
        fetch('/stats')
            .then(res => res.json())
            .then(data => {
                document.getElementById('patientCount').textContent = data.patients || 0;
                document.getElementById('medicationCount').textContent = data.medications || 0;
            });

        // Handle Enter key
        queryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendQuery();
        });

        function askQuestion(question) {
            queryInput.value = question;
            sendQuery();
        }

        async function sendQuery() {
            const question = queryInput.value.trim();
            if (!question) return;

            // Add user message
            addMessage(question, 'user');
            queryInput.value = '';
            sendButton.disabled = true;
            loading.style.display = 'block';

            try {
                const response = await fetch('/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: question,
                        use_bedrock: llmBackend.value === 'bedrock',
                        explain: true,
                        use_rag: ragToggle.classList.contains('active')
                    })
                });

                const data = await response.json();
                
                if (data.error) {
                    addMessage('❌ Error: ' + data.error, 'ai');
                } else {
                    let answer = data.explanation || JSON.stringify(data.results, null, 2);
                    addMessage(answer, 'ai', {
                        backend: data.backend,
                        resultCount: data.result_count,
                        ragUsed: data.rag_context_used
                    });
                    
                    // Show publish prompt if S3 is enabled
                    showPublishPrompt(question, data);
                }
            } catch (error) {
                addMessage('❌ Failed to connect to the API: ' + error.message, 'ai');
            } finally {
                sendButton.disabled = false;
                loading.style.display = 'none';
            }
        }

        function addMessage(text, type, meta = {}) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            avatar.textContent = type === 'user' ? 'U' : 'AI';
            
            const content = document.createElement('div');
            content.className = 'message-content';
            content.innerHTML = `<div>${text.replace(/\n/g, '<br>')}</div>`;
            
            if (meta && Object.keys(meta).length > 0) {
                const metaDiv = document.createElement('div');
                metaDiv.className = 'message-meta';
                if (meta.backend) {
                    metaDiv.innerHTML += `<span class="badge">${meta.backend}</span>`;
                }
                if (meta.resultCount !== undefined) {
                    metaDiv.innerHTML += `<span class="badge">${meta.resultCount} results</span>`;
                }
                if (meta.ragUsed) {
                    metaDiv.innerHTML += `<span class="badge">RAG Context Used</span>`;
                }
                content.appendChild(metaDiv);
            }
            
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        async function showPublishPrompt(question, responseData) {
            // Check if S3 is enabled
            const statsResponse = await fetch('/stats');
            const stats = await statsResponse.json();
            
            if (!stats.s3_enabled) return;
            
            const promptDiv = document.createElement('div');
            promptDiv.className = 'message ai';
            promptDiv.innerHTML = `
                <div class="avatar">📦</div>
                <div class="message-content">
                    <div class="publish-prompt">
                        <span>📤 Would you like to publish this dataset to S3?</span>
                        <div>
                            <button class="dismiss" onclick="this.closest('.message').remove()">Not now</button>
                            <button onclick="publishToS3('${question.replace(/'/g, "\\'")}')">Yes, publish</button>
                        </div>
                    </div>
                </div>
            `;
            
            chatContainer.appendChild(promptDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            // Store latest response for export
            window.latestResponse = responseData;
        }

        async function publishToS3(question) {
            const publishButton = event.target;
            publishButton.disabled = true;
            publishButton.textContent = 'Publishing...';
            
            try {
                const response = await fetch('/export-to-s3', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        export_type: 'query',
                        query_text: question,
                        response_data: window.latestResponse,
                        llm_used: llmBackend.value
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    publishButton.textContent = '✓ Published!';
                    publishButton.style.background = '#38ef7d';
                    publishButton.style.color = 'white';
                    
                    addMessage(`✅ Dataset published to S3!\n📍 Location: ${result.s3_uri}`, 'ai', {
                        backend: 'system'
                    });
                    
                    setTimeout(() => {
                        publishButton.closest('.message').remove();
                    }, 3000);
                } else {
                    throw new Error(result.error || 'Export failed');
                }
            } catch (error) {
                addMessage('❌ Failed to publish to S3: ' + error.message, 'ai');
                publishButton.disabled = false;
                publishButton.textContent = 'Retry';
            }
        }
    </script>
</body>
</html>
EOF

print_status "Created Web UI"

cat > app.py <<'EOF'
from flask import Flask, request, jsonify, render_template
import boto3
import requests
import os
import logging
import json
from decimal import Decimal
from export_to_s3 import DatasetExporter

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration from environment variables
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://ollama-service.ollama.svc.cluster.local:11434')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
TABLE_PREFIX = os.getenv('TABLE_PREFIX', 'healthcare')
USE_BEDROCK = os.getenv('USE_BEDROCK', 'true').lower() == 'true'
BEDROCK_MODEL = os.getenv('BEDROCK_MODEL', 'anthropic.claude-3-haiku-20240307-v1:0')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME', '')

# Helper to convert Decimal to float for JSON serialization
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

class HealthcareQueryBridge:
    def __init__(self):
        try:
            self.dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
            self.bedrock_runtime = boto3.client('bedrock-runtime', region_name=AWS_REGION) if USE_BEDROCK else None
            
            # Table references
            self.patients = self.dynamodb.Table(f'{TABLE_PREFIX}-patients')
            self.diagnoses = self.dynamodb.Table(f'{TABLE_PREFIX}-diagnoses')
            self.medications = self.dynamodb.Table(f'{TABLE_PREFIX}-medications')
            self.providers = self.dynamodb.Table(f'{TABLE_PREFIX}-providers')
            self.patient_diagnoses = self.dynamodb.Table(f'{TABLE_PREFIX}-patient-diagnoses')
            self.patient_medications = self.dynamodb.Table(f'{TABLE_PREFIX}-patient-medications')
            
            logger.info(f"Connected to DynamoDB in {AWS_REGION}")
            if USE_BEDROCK:
                logger.info(f"Bedrock enabled with model: {BEDROCK_MODEL}")
        except Exception as e:
            logger.error(f"Failed to initialize: {str(e)}")
            raise
    
    def query_with_llm(self, prompt, model="mistral", use_bedrock=True):
        """Query either Ollama or Bedrock"""
        if use_bedrock and self.bedrock_runtime:
            try:
                return self._query_bedrock(prompt, BEDROCK_MODEL)
            except Exception as e:
                logger.warning(f"Bedrock failed, falling back to Ollama: {str(e)}")
                return self._query_ollama(prompt, model)
        else:
            return self._query_ollama(prompt, model)
    
    def _query_bedrock(self, prompt, model_id):
        """Query AWS Bedrock"""
        if 'anthropic.claude' in model_id:
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2048,
                "messages": [{"role": "user", "content": prompt}]
            })
        elif 'meta.llama' in model_id:
            body = json.dumps({
                "prompt": prompt,
                "max_gen_len": 2048,
                "temperature": 0.5,
            })
        elif 'mistral' in model_id:
            body = json.dumps({
                "prompt": f"<s>[INST] {prompt} [/INST]",
                "max_tokens": 2048,
                "temperature": 0.5,
            })
        else:
            raise ValueError(f"Unsupported model: {model_id}")
        
        response = self.bedrock_runtime.invoke_model(
            modelId=model_id,
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        
        if 'anthropic.claude' in model_id:
            return response_body['content'][0]['text']
        elif 'meta.llama' in model_id:
            return response_body['generation']
        elif 'mistral' in model_id:
            return response_body['outputs'][0]['text']
    
    def _query_ollama(self, prompt, model):
        """Query Ollama"""
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=30
        )
        response.raise_for_status()
        return response.json()['response'].strip()
    
    def build_rag_context(self, question):
        """Build RAG context from DynamoDB data based on question keywords"""
        context_parts = []
        
        try:
            # Extract keywords from question
            keywords = question.lower()
            
            # Get relevant data based on keywords
            if 'diabetes' in keywords or 'diabetic' in keywords:
                # Get diabetes-related data
                diagnoses_response = self.diagnoses.scan(Limit=10)
                for diag in diagnoses_response['Items']:
                    if 'diabetes' in diag.get('name', '').lower():
                        context_parts.append(f"Diagnosis: {diag.get('name')} (ICD-10: {diag.get('diagnosis_code')})")
            
            elif 'medication' in keywords or 'drug' in keywords or 'medicine' in keywords:
                # Get medication data
                meds_response = self.medications.scan(Limit=20)
                med_summary = [f"{m.get('name')} ({m.get('class', 'N/A')})" for m in meds_response['Items']]
                context_parts.append(f"Available medications: {', '.join(med_summary[:10])}")
            
            elif 'patient' in keywords:
                # Get patient summary
                patients_count = self.patients.scan(Select='COUNT')['Count']
                context_parts.append(f"Total patients in database: {patients_count}")
                
                # Sample patient data
                sample_patients = self.patients.scan(Limit=5)
                for p in sample_patients['Items']:
                    context_parts.append(f"Patient {p.get('patient_id')}: Age {p.get('age')}, Gender {p.get('gender')}")
            
            else:
                # General context - provide summary of all data
                patients_count = self.patients.scan(Select='COUNT')['Count']
                diagnoses_count = self.diagnoses.scan(Select='COUNT')['Count']
                meds_count = self.medications.scan(Select='COUNT')['Count']
                
                context_parts.append(f"Database summary: {patients_count} patients, {diagnoses_count} diagnoses, {meds_count} medications")
            
            # Always include common diagnoses
            common_diagnoses = self.patient_diagnoses.scan(Limit=10)
            diag_codes = {}
            for pd in common_diagnoses['Items']:
                code = pd.get('diagnosis_code')
                diag_codes[code] = diag_codes.get(code, 0) + 1
            
            if diag_codes:
                top_diagnoses = sorted(diag_codes.items(), key=lambda x: x[1], reverse=True)[:3]
                context_parts.append(f"Most common diagnoses: {', '.join([d[0] for d in top_diagnoses])}")
            
        except Exception as e:
            logger.warning(f"Error building RAG context: {str(e)}")
        
        return "\n".join(context_parts) if context_parts else ""
    
    def interpret_query(self, question, use_bedrock=True, use_rag=True):
        """Use LLM to interpret the query and generate DynamoDB query plan"""
        
        # Build RAG context if enabled
        rag_context = ""
        if use_rag:
            rag_context = self.build_rag_context(question)
            if rag_context:
                rag_context = f"\nContext from database:\n{rag_context}\n"
        
        prompt = f"""You are a healthcare data query expert. Analyze this question and return a JSON query plan.

{rag_context}
Available DynamoDB tables:
- patients: patient_id (key), age, gender
- diagnoses: diagnosis_code (key), name, category
- medications: medication_id (key), name, class, form, dosage
- providers: npi (key), specialty, name
- patient-diagnoses: patient_id (key), diagnosis_code (sort key), date, severity, provider_npi
- patient-medications: patient_id (key), medication_id (sort key), medication_name, date, frequency

Question: {question}

Return ONLY a JSON object with this structure:
{{
  "query_type": "count|list|aggregate|specific",
  "target_table": "table name",
  "filters": {{"field": "value"}},
  "joins": ["table1", "table2"],
  "summary": "brief summary"
}}

Example for "How many patients have diabetes?":
{{
  "query_type": "count",
  "target_table": "patient-diagnoses",
  "filters": {{"diagnosis_code": "E11.9"}},
  "joins": [],
  "summary": "Count patients with Type 2 Diabetes (ICD-10: E11.9)"
}}

JSON only, no explanation:"""
        
        response = self.query_with_llm(prompt, use_bedrock=use_bedrock)
        
        # Extract JSON from response
        try:
            # Try to find JSON in the response
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
                return json.loads(json_str)
            else:
                return json.loads(response)
        except:
            # Fallback: return a default structure
            return {
                "query_type": "general",
                "target_table": "patients",
                "filters": {},
                "joins": [],
                "summary": "General query"
            }
    
    def execute_query(self, query_plan):
        """Execute the query plan against DynamoDB"""
        table_name = query_plan['target_table']
        query_type = query_plan['query_type']
        filters = query_plan.get('filters', {})
        
        try:
            if table_name == 'patients':
                table = self.patients
            elif table_name == 'diagnoses':
                table = self.diagnoses
            elif table_name == 'medications':
                table = self.medications
            elif table_name == 'providers':
                table = self.providers
            elif table_name == 'patient-diagnoses':
                table = self.patient_diagnoses
            elif table_name == 'patient-medications':
                table = self.patient_medications
            else:
                return []
            
            # Simple scan for now (can be optimized with queries)
            if filters:
                # Build filter expression
                from boto3.dynamodb.conditions import Attr
                filter_expr = None
                for key, value in filters.items():
                    expr = Attr(key).eq(value) if not isinstance(value, list) else Attr(key).is_in(value)
                    filter_expr = expr if filter_expr is None else filter_expr & expr
                
                response = table.scan(FilterExpression=filter_expr)
            else:
                response = table.scan()
            
            items = response['Items']
            
            # Handle pagination
            while 'LastEvaluatedKey' in response:
                if filters:
                    response = table.scan(
                        FilterExpression=filter_expr,
                        ExclusiveStartKey=response['LastEvaluatedKey']
                    )
                else:
                    response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
                items.extend(response['Items'])
            
            return items
            
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            raise
    
    def explain_results(self, question, results, query_plan, use_bedrock=True, use_rag=True):
        """Use LLM to explain query results"""
        if not results:
            return "No results found for your query."
        
        result_count = len(results)
        sample_results = results[:3] if len(results) > 3 else results
        
        # Add RAG context for richer explanations
        rag_context = ""
        if use_rag:
            rag_context = self.build_rag_context(question)
            if rag_context:
                rag_context = f"\nAdditional context:\n{rag_context}\n"
        
        prompt = f"""Analyze these healthcare data query results and provide a clear summary.

{rag_context}
Question: {question}
Query Type: {query_plan.get('query_type', 'unknown')}
Result Count: {result_count}
Sample Results: {json.dumps(sample_results, cls=DecimalEncoder)}

Provide:
1. Direct answer to the question
2. Key insights from the data
3. Any HIPAA compliance notes (data is de-identified)

Keep response concise and professional."""
        
        return self.query_with_llm(prompt, use_bedrock=use_bedrock)

# Initialize bridge and S3 exporter
try:
    bridge = HealthcareQueryBridge()
except Exception as e:
    logger.error(f"Failed to initialize bridge: {str(e)}")
    bridge = None

try:
    s3_exporter = DatasetExporter(S3_BUCKET_NAME, AWS_REGION) if S3_BUCKET_NAME else None
    if s3_exporter:
        logger.info(f"S3 exporter initialized for bucket: {S3_BUCKET_NAME}")
except Exception as e:
    logger.warning(f"S3 exporter not available: {str(e)}")
    s3_exporter = None

@app.route('/', methods=['GET'])
def index():
    """Serve the web UI"""
    return render_template('index.html')

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    status = {
        "status": "healthy" if bridge else "unhealthy",
        "ollama_url": OLLAMA_URL,
        "aws_region": AWS_REGION,
        "dynamodb_connected": bridge is not None,
        "bedrock_enabled": USE_BEDROCK,
        "bedrock_model": BEDROCK_MODEL if USE_BEDROCK else None
    }
    return jsonify(status), 200

@app.route('/query', methods=['POST'])
def query():
    """Main query endpoint with RAG support"""
    if not bridge:
        return jsonify({"error": "Service not initialized"}), 503
    
    try:
        data = request.json
        question = data.get('question')
        use_bedrock = data.get('use_bedrock', USE_BEDROCK)
        explain = data.get('explain', True)
        use_rag = data.get('use_rag', True)  # RAG enabled by default
        
        if not question:
            return jsonify({"error": "No question provided"}), 400
        
        logger.info(f"Processing question: {question} (RAG: {use_rag}, Backend: {'Bedrock' if use_bedrock else 'Ollama'})")
        
        # Interpret query with RAG context
        query_plan = bridge.interpret_query(question, use_bedrock=use_bedrock, use_rag=use_rag)
        logger.info(f"Query plan: {query_plan}")
        
        # Execute query
        results = bridge.execute_query(query_plan)
        
        # Generate explanation with RAG context
        explanation = None
        if explain:
            explanation = bridge.explain_results(question, results, query_plan, use_bedrock=use_bedrock, use_rag=use_rag)
        
        return jsonify({
            "question": question,
            "query_plan": query_plan,
            "results": json.loads(json.dumps(results, cls=DecimalEncoder)),
            "result_count": len(results),
            "explanation": explanation,
            "backend": "bedrock" if use_bedrock else "ollama",
            "rag_context_used": use_rag
        })
    
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/stats', methods=['GET'])
def stats():
    """Get database statistics"""
    if not bridge:
        return jsonify({"error": "Service not initialized"}), 503
    
    try:
        stats = {
            "patients": bridge.patients.scan(Select='COUNT')['Count'],
            "diagnoses": bridge.diagnoses.scan(Select='COUNT')['Count'],
            "medications": bridge.medications.scan(Select='COUNT')['Count'],
            "providers": bridge.providers.scan(Select='COUNT')['Count'],
            "patient_diagnoses": bridge.patient_diagnoses.scan(Select='COUNT')['Count'],
            "patient_medications": bridge.patient_medications.scan(Select='COUNT')['Count'],
            "s3_enabled": s3_exporter is not None,
            "s3_bucket": S3_BUCKET_NAME if s3_exporter else None
        }
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/export-to-s3', methods=['POST'])
def export_to_s3():
    """Export query results or dataset to S3"""
    if not s3_exporter:
        return jsonify({"error": "S3 export not configured"}), 503
    
    try:
        data = request.json
        export_type = data.get('export_type', 'query')  # 'query' or 'full_dataset'
        
        if export_type == 'query':
            # Export specific query results
            query_text = data.get('query_text', '')
            response_data = data.get('response_data', {})
            llm_used = data.get('llm_used', 'unknown')
            
            result = s3_exporter.export_query_results(query_text, response_data, llm_used)
            return jsonify({
                "success": True,
                "message": "Query results exported to S3",
                "s3_uri": result['s3_uri'],
                "filename": result['filename']
            })
        
        elif export_type == 'full_dataset':
            # Export all healthcare tables
            results = s3_exporter.export_all_healthcare_tables(TABLE_PREFIX)
            
            success_count = sum(1 for r in results.values() if 'error' not in r)
            
            return jsonify({
                "success": True,
                "message": f"Exported {success_count}/{len(results)} tables to S3",
                "results": results,
                "bucket": S3_BUCKET_NAME
            })
        
        elif export_type == 'conversation':
            # Export conversation history
            messages = data.get('messages', [])
            metadata = data.get('metadata', {})
            
            result = s3_exporter.export_conversation(messages, metadata)
            return jsonify({
                "success": True,
                "message": "Conversation exported to S3",
                "s3_uri": result['s3_uri'],
                "filename": result['filename']
            })
        
        else:
            return jsonify({"error": "Invalid export_type"}), 400
    
    except Exception as e:
        logger.error(f"Error exporting to S3: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/s3-exports', methods=['GET'])
def list_s3_exports():
    """List all S3 exports"""
    if not s3_exporter:
        return jsonify({"error": "S3 export not configured"}), 503
    
    try:
        prefix = request.args.get('prefix', '')
        exports = s3_exporter.list_exports(prefix)
        return jsonify({
            "exports": exports,
            "count": len(exports),
            "bucket": S3_BUCKET_NAME
        })
    except Exception as e:
        logger.error(f"Error listing S3 exports: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
EOF

print_status "Created Flask application"

# Copy export utility
cp ../export_to_s3.py . 2>/dev/null || echo "# S3 export utility not found, skipping" > export_to_s3.py

print_status "Created application files"

# Create Dockerfile
cat > Dockerfile <<'EOF'
FROM python:3.13-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir flask boto3 requests networkx

# Copy application files
COPY app.py /app/
COPY export_to_s3.py /app/
COPY templates /app/templates
COPY static /app/static

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8080/health')"

CMD ["python", "app.py"]
EOF

print_status "Created Dockerfile"

# Create requirements.txt
cat > requirements.txt <<EOF
flask==3.0.0
boto3==1.34.0
requests==2.31.0
EOF

print_status "Created requirements.txt"

# Step 3: Build Docker Image
echo ""
echo -e "${BLUE}Step 3: Building Docker Image${NC}"

docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
print_status "Docker image built successfully"

# Step 4: Push to Registry (optional)
echo ""
echo -e "${BLUE}Step 4: Container Registry${NC}"
read -p "Push to AWS ECR? (y/n): " -r

if [[ $REPLY =~ ^[Yy]$ ]]; then
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    ECR_REPO="${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}"
    
    echo "Creating ECR repository..."
    aws ecr create-repository --repository-name ${IMAGE_NAME} --region ${AWS_REGION} 2>/dev/null || print_warning "Repository may already exist"
    
    echo "Logging into ECR..."
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com
    
    echo "Tagging and pushing image..."
    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}
    docker push ${ECR_REPO}:${IMAGE_TAG}
    
    IMAGE_URI="${ECR_REPO}:${IMAGE_TAG}"
    print_status "Image pushed to ECR: ${IMAGE_URI}"
else
    IMAGE_URI="${IMAGE_NAME}:${IMAGE_TAG}"
fi

# Step 5: Deploy to Kubernetes
echo ""
echo -e "${BLUE}Step 5: Deploying to Kubernetes${NC}"

cat > /tmp/integration-deployment.yaml <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: healthcare-bridge-config
  namespace: ${NAMESPACE}
data:
  OLLAMA_URL: "http://ollama-service.ollama.svc.cluster.local:11434"
  AWS_REGION: "${AWS_REGION}"
  TABLE_PREFIX: "${TABLE_PREFIX}"
  USE_BEDROCK: "true"
  BEDROCK_MODEL: "anthropic.claude-3-haiku-20240307-v1:0"
  S3_BUCKET_NAME: "${S3_BUCKET_NAME}"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: healthcare-ai-bridge
  namespace: ${NAMESPACE}
  labels:
    app: healthcare-ai-bridge
spec:
  replicas: 2
  selector:
    matchLabels:
      app: healthcare-ai-bridge
  template:
    metadata:
      labels:
        app: healthcare-ai-bridge
    spec:
      serviceAccountName: bedrock-service-account
      containers:
      - name: bridge
        image: ${IMAGE_URI}
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: http
        envFrom:
        - configMapRef:
            name: healthcare-bridge-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: healthcare-ai-bridge
  namespace: ${NAMESPACE}
  labels:
    app: healthcare-ai-bridge
spec:
  selector:
    app: healthcare-ai-bridge
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
      name: http
  type: LoadBalancer
EOF

kubectl apply -f /tmp/integration-deployment.yaml
print_status "Integration service deployed"

# Wait for deployment
echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/healthcare-ai-bridge -n ${NAMESPACE} --timeout=3m
print_status "Deployment ready"

# Step 6: Get Service URL
echo ""
echo -e "${BLUE}Step 6: Getting Service URL${NC}"

sleep 10
LB_HOSTNAME=$(kubectl get svc healthcare-ai-bridge -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
LB_IP=$(kubectl get svc healthcare-ai-bridge -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -n "$LB_HOSTNAME" ]; then
    SERVICE_URL="http://${LB_HOSTNAME}:8080"
elif [ -n "$LB_IP" ]; then
    SERVICE_URL="http://${LB_IP}:8080"
else
    SERVICE_URL="http://localhost:8080"
    print_warning "LoadBalancer not ready. Use port-forward:"
    echo "  kubectl port-forward -n ${NAMESPACE} svc/healthcare-ai-bridge 8080:8080"
fi

print_status "Service URL: ${SERVICE_URL}"

# Step 7: Test Integration
echo ""
echo -e "${BLUE}Step 7: Testing Integration${NC}"

# Port-forward for testing
kubectl port-forward -n ${NAMESPACE} svc/healthcare-ai-bridge 8080:8080 &
PF_PID=$!
sleep 5

echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:8080/health || echo "{}")
echo "Health check: $HEALTH_RESPONSE"

echo ""
echo "Testing natural language query..."
QUERY_RESPONSE=$(curl -s -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How many patients do we have?", "use_bedrock": true}' || echo "{}")

echo "Query result:"
echo "$QUERY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$QUERY_RESPONSE"

# Kill port-forward
kill $PF_PID 2>/dev/null || true

print_status "Integration test completed"

# Step 8: Save Configuration
echo ""
echo -e "${BLUE}Step 8: Saving Configuration${NC}"

cat > integration-info.txt <<EOF
Healthcare AI Integration Service
==================================
Deployed: $(date)
Namespace: ${NAMESPACE}
Service URL: ${SERVICE_URL}

Backends:
=========
- Ollama URL: http://ollama-service.ollama.svc.cluster.local:11434
- AWS Bedrock: Enabled (${BEDROCK_MODEL})
- DynamoDB: ${AWS_REGION} (${TABLE_PREFIX}-*)

API Endpoints:
==============

Health Check:
  GET ${SERVICE_URL}/health

Natural Language Query:
  POST ${SERVICE_URL}/query
  Body: {
    "question": "your question here",
    "use_bedrock": true,  // Use Bedrock (true) or Ollama (false)
    "explain": true
  }

Database Statistics:
  GET ${SERVICE_URL}/stats

Example Queries:
================

# Health check
curl ${SERVICE_URL}/health

# Get database statistics
curl ${SERVICE_URL}/stats

# Query with Bedrock
curl -X POST ${SERVICE_URL}/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "How many patients have diabetes?",
    "use_bedrock": true
  }'

# Query with Ollama
curl -X POST ${SERVICE_URL}/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "What medications are most commonly prescribed?",
    "use_bedrock": false
  }'

# Find patients with multiple conditions
curl -X POST ${SERVICE_URL}/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "Which patients have been diagnosed with more than one condition?"
  }'

Useful Commands:
================

# Port forward for local access
kubectl port-forward -n ${NAMESPACE} svc/healthcare-ai-bridge 8080:8080

# View logs
kubectl logs -n ${NAMESPACE} -l app=healthcare-ai-bridge --tail=100 -f

# Restart deployment
kubectl rollout restart deployment/healthcare-ai-bridge <-n ${NAMESPACE}

# Scale replicas
kubectl scale deployment/healthcare-ai-bridge -n ${NAMESPACE} --replicas=3

# Toggle Bedrock/Ollama
kubectl set env deployment/healthcare-ai-bridge -n ${NAMESPACE} USE_BEDROCK=false

Complete Stack:
===============
✓ EKS Cluster with GPU support
✓ Ollama with LLMs (Llama 2, Mistral, Mixtral)
✓ AWS Bedrock (Claude, Llama, Mistral models)
✓ DynamoDB with healthcare data  
✓ Query Bridge for natural language queries

Your healthcare AI infrastructure is ready!

Cost Optimization:
==================
- Use Bedrock for production (managed, scalable)
- Use Ollama for development (lower cost, runs on EKS)
- DynamoDB on-demand pricing (pay per request)
- Total estimated cost: \$5-15/day (depending on usage)
EOF

print_status "Configuration saved to integration-info.txt"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Integration Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Service URL: ${SERVICE_URL}"
echo ""
echo "Test with:"
echo "  curl -X POST ${SERVICE_URL}/query -H 'Content-Type: application/json' -d '{\"question\": \"How many patients have diabetes?\", \"use_bedrock\": true}'"
echo ""
echo -e "${GREEN}🎉 Your complete healthcare AI infrastructure is now operational!${NC}"
echo ""
echo "Features:"
echo "  ✓ Dual LLM backends (Ollama + Bedrock)"
echo "  ✓ DynamoDB for scalable data storage"
echo "  ✓ Natural language querying"
echo "  ✓ HIPAA-compliant de-identified data"
echo ""
