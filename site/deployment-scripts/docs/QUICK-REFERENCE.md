# Healthcare AI Infrastructure - Quick Reference

## 🚀 Deployment

```bash
# One command to deploy everything
./deploy-all.sh

# Or step by step:
./1-deploy-eks-cluster.sh        # 20-30 min
./2-install-ollama.sh            # 10-15 min
./2b-setup-bedrock.sh            # 2-3 min (NEW!)
./3-setup-knowledge-graph.sh     # 3-5 min (DynamoDB)
./4-deploy-integration.sh        # 5-10 min
```

## 🔍 Service Access

### Port Forwarding

```bash
# Ollama (Self-hosted LLM)
kubectl port-forward -n ollama svc/ollama-service 11434:11434

# Integration API
kubectl port-forward -n ollama svc/healthcare-ai-bridge 8080:8080
```

### LoadBalancer URLs

```bash
# Get service URLs
kubectl get svc -n ollama

# Ollama
OLLAMA_URL=$(kubectl get svc ollama-service -n ollama -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "http://${OLLAMA_URL}:11434"

# Integration API
API_URL=$(kubectl get svc healthcare-ai-bridge -n ollama -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "http://${API_URL}:8080"
```

## 💬 Natural Language Queries

### Using Bedrock (Managed)

```bash
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How many patients have diabetes?",
    "use_bedrock": true
  }'
```

### Using Ollama (Self-hosted)

```bash
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Which medications are most commonly prescribed?",
    "use_bedrock": false
  }'
```

### Query Examples

```bash
# Patient counts
curl -X POST http://localhost:8080/query \
  -d '{"question": "How many patients do we have?", "use_bedrock": true}'

# Diagnosis analysis
curl -X POST http://localhost:8080/query \
  -d '{"question": "What are the most common diagnoses?", "use_bedrock": true}'

# Medication patterns
curl -X POST http://localhost:8080/query \
  -d '{"question": "List all hypertension medications", "use_bedrock": false}'

# Provider statistics
curl -X POST http://localhost:8080/query \
  -d '{"question": "How many cardiologists do we have?", "use_bedrock": true}'
```

## 📊 Health & Statistics

### Health Check

```bash
curl http://localhost:8080/health
```

### Database Statistics

```bash
curl http://localhost:8080/stats
```

## 🤖 Direct LLM Access

### Ollama API

```bash
# Generate text
curl http://localhost:11434/api/generate \
  -d '{
    "model": "mistral",
    "prompt": "Explain HIPAA compliance",
    "stream": false
  }'

# List models
curl http://localhost:11434/api/tags
```

### Bedrock API

```bash
# List available models
aws bedrock list-foundation-models \
  --region us-east-1 \
  --query 'modelSummaries[*].[modelId,modelName]' \
  --output table

# Invoke model (Python)
python3 test-bedrock.py
```

## 🗄️ DynamoDB Direct Access

### List Tables

```bash
aws dynamodb list-tables --region us-east-1
```

### Query Tables

```bash
# Count patients
aws dynamodb scan \
  --table-name healthcare-patients \
  --select COUNT \
  --region us-east-1

# Get sample patient
aws dynamodb scan \
  --table-name healthcare-patients \
  --limit 1 \
  --region us-east-1

# Query patient diagnoses
aws dynamodb query \
  --table-name healthcare-patient-diagnoses \
  --key-condition-expression "patient_id = :pid" \
  --expression-attribute-values '{":pid": {"S": "PAT001"}}' \
  --region us-east-1
```

### Table Schemas

```bash
# Describe table
aws dynamodb describe-table \
  --table-name healthcare-patients \
  --region us-east-1
```

## ⚙️ Configuration

### Switch LLM Backend

```bash
# Enable Bedrock
kubectl set env deployment/healthcare-ai-bridge -n ollama USE_BEDROCK=true

# Use Ollama only
kubectl set env deployment/healthcare-ai-bridge -n ollama USE_BEDROCK=false

# Change Bedrock model
kubectl set env deployment/healthcare-ai-bridge -n ollama \
  BEDROCK_MODEL=meta.llama3-70b-instruct-v1:0

# Restart to apply
kubectl rollout restart deployment/healthcare-ai-bridge -n ollama
```

### Scale Resources

```bash
# Scale Ollama replicas
kubectl scale deployment/ollama -n ollama --replicas=3

# Scale EKS nodes
eksctl scale nodegroup \
  --cluster=ollama-ai-cluster \
  --name=ai-compute-nodes \
  --nodes=3
```

## 📝 Logs & Debugging

### View Logs

```bash
# Integration API logs
kubectl logs -n ollama -l app=healthcare-ai-bridge --tail=100 -f

# Ollama logs
kubectl logs -n ollama -l app=ollama --tail=100 -f

# Get events
kubectl get events -n ollama --sort-by='.lastTimestamp'
```

### Pod Status

```bash
# Check all pods
kubectl get pods -n ollama

# Describe pod
kubectl describe pod -n ollama <pod-name>

# Exec into pod
kubectl exec -it -n ollama <pod-name> -- bash
```

## 🧪 Testing

### Test Bedrock Connectivity

```bash
python3 test-bedrock.py
```

### Test DynamoDB

```bash
python3 populate-healthcare-data.py  # Re-populate data
```

### Test Complete Stack

```bash
./verify-deployment.sh
```

## 🗑️ Cleanup

### Quick Cleanup

```bash
./cleanup.sh
```

### Manual Cleanup

```bash
# Delete EKS cluster
eksctl delete cluster \
  --name=ollama-ai-cluster \
  --region=us-east-1

# Delete DynamoDB tables
for table in patients diagnoses medications providers patient-diagnoses patient-medications; do
  aws dynamodb delete-table \
    --table-name healthcare-$table \
    --region us-east-1
done

# Delete Bedrock IAM resources
aws iam detach-role-policy \
  --role-name BedrockAccessRole \
  --policy-arn $(aws iam list-policies --query 'Policies[?PolicyName==`BedrockAccessPolicy`].Arn' --output text)
aws iam delete-role --role-name BedrockAccessRole
aws iam delete-policy \
  --policy-arn $(aws iam list-policies --query 'Policies[?PolicyName==`BedrockAccessPolicy`].Arn' --output text)
```

## 🔧 Common Issues

### Bedrock "Access Denied"

```bash
# Request model access in AWS Console
# https://console.aws.amazon.com/bedrock → Model access

# Check IAM role
kubectl get sa bedrock-service-account -n ollama -o yaml
aws iam get-role --role-name BedrockAccessRole
```

### DynamoDB "Table Not Found"

```bash
# List tables
aws dynamodb list-tables --region us-east-1

# Re-create tables
./3-setup-knowledge-graph.sh
```

### Integration API Not Responding

```bash
# Check pod status
kubectl get pods -n ollama -l app=healthcare-ai-bridge

# Check logs
kubectl logs -n ollama -l app=healthcare-ai-bridge --tail=50

# Restart deployment
kubectl rollout restart deployment/healthcare-ai-bridge -n ollama
```

### Ollama Out of Memory

```bash
# Check resource usage
kubectl top pods -n ollama

# Scale down to smaller model
kubectl exec -n ollama <pod-name> -- ollama list
kubectl exec -n ollama <pod-name> -- ollama rm mixtral  # Remove large models
```

## 💰 Cost Optimization

### Development Mode (Low Cost)

```bash
# Use Ollama only, scale to 1 node
eksctl scale nodegroup \
  --cluster=ollama-ai-cluster \
  --name=ai-compute-nodes \
  --nodes=1

kubectl scale deployment/ollama -n ollama --replicas=1
kubectl set env deployment/healthcare-ai-bridge -n ollama USE_BEDROCK=false
```

### Production Mode (High Availability)

```bash
# Use Bedrock, scale Ollama for redundancy
kubectl scale deployment/ollama -n ollama --replicas=2
kubectl set env deployment/healthcare-ai-bridge -n ollama USE_BEDROCK=true
```

### Serverless Mode (Variable Cost)

```bash
# Use Bedrock only, scale down Ollama
kubectl scale deployment/ollama -n ollama --replicas=0
kubectl set env deployment/healthcare-ai-bridge -n ollama USE_BEDROCK=true
```

## 📚 Information Files

After deployment, check these files:

- `cluster-info.txt` - EKS cluster details
- `ollama-info.txt` - Ollama model list and commands
- `bedrock-info.txt` - Bedrock models and configuration
- `dynamodb-info.txt` - Table schemas and query examples
- `integration-info.txt` - API documentation
- `deployment-summary.txt` - Complete deployment summary
- `deployment-*.log` - Detailed deployment logs

## 🎯 Quick Start Example

```bash
# 1. Deploy everything
./deploy-all.sh

# 2. Wait for completion (~40-60 minutes)

# 3. Port forward API
kubectl port-forward -n ollama svc/healthcare-ai-bridge 8080:8080 &

# 4. Test with Bedrock
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How many patients have diabetes?", "use_bedrock": true}'

# 5. Test with Ollama
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"question": "List all medications for hypertension", "use_bedrock": false}'

# 6. Check stats
curl http://localhost:8080/stats

# 7. When done, cleanup
./cleanup.sh
```

## 📞 Need Help?

1. Run `./verify-deployment.sh` for diagnostics
2. Check `*-info.txt` files for detailed commands
3. Review logs: `kubectl logs -n ollama -l app=healthcare-ai-bridge`
4. Check pod status: `kubectl get pods -n ollama`
5. View events: `kubectl get events -n ollama --sort-by='.lastTimestamp'`
