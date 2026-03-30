# Architecture Changes Summary

## Overview

The deployment package has been updated to use AWS Bedrock (managed LLMs) and DynamoDB
(serverless database) instead of Neo4j (graph database). Ollama remains as a self-hosted LLM option.

## Key Changes

### 1. Data Layer: Neo4j → DynamoDB

**Why**: Cost reduction, simpler management, serverless scaling

| Aspect | Before (Neo4j) | After (DynamoDB) |
|--------|---------------|------------------|
| **Cost** | ~$50+/month | ~$5/month |
| **Setup Time** | 15-20 minutes | 3-5 minutes |
| **Maintenance** | Self-managed on EKS | Fully managed by AWS |
| **Scalability** | Manual | Automatic |
| **Billing** | Fixed (pvols + nodes) | Pay-per-request |

**Tables Created:**

- `healthcare-patients` - Patient demographics
- `healthcare-diagnoses` - ICD-10 diagnosis codes
- `healthcare-medications` - Medication catalog
- `healthcare-providers` - Healthcare providers (NPI)
- `healthcare-patient-diagnoses` - Patient diagnosis relationships
- `healthcare-patient-medications` - Patient medication relationships

### 2. LLM Layer: Added AWS Bedrock

**Why**: Managed service, no infrastructure, pay-per-use, access to latest models

| Aspect | Ollama (Self-hosted) | Bedrock (Managed) |
|--------|---------------------|-------------------|
| **Cost** | Fixed (~$25/day GPU) | Variable ($0.0008-$0.003/1K tokens) |
| **Idle Cost** | Full GPU cost | $0 |
| **Maintenance** | Self-managed | Fully managed |
| **Models** | Llama 2, Mistral, Mixtral | Claude 3, Llama 3, Mistral |
| **Scaling** | Limited by nodes | Automatic |
| **Best For** | Dev, high-volume | Production, variable load |

**Available Bedrock Models:**

- `anthropic.claude-3-haiku-20240307-v1:0` - Fast, cost-effective
- `anthropic.claude-3-sonnet-20240229-v1:0` - Balanced performance
- `meta.llama3-70b-instruct-v1:0` - Meta's latest
- `mistral.mistral-7b-instruct-v0:2` - Efficient instruction following

### 3. Integration API: Enhanced with Dual LLM Support

**Changes:**

- Added Bedrock runtime client (boto3)
- Added DynamoDB client (boto3) replacing Neo4j GraphDatabase
- Natural language → DynamoDB query generation
- Model selection API (Ollama vs Bedrock)
- IRSA (IAM Roles for Service Accounts) for AWS access

## Files Modified

### Scripts

✅ **deploy-all.sh** - Added Bedrock step, updated references
✅ **2b-setup-bedrock.sh** - NEW: Bedrock IAM/IRSA setup
✅ **3-setup-knowledge-graph.sh** - REWRITTEN: DynamoDB instead of Neo4j
✅ **4-deploy-integration.sh** - REWRITTEN: Dual LLM + DynamoDB support
⚠️  **cleanup.sh** - Needs DynamoDB/Bedrock cleanup (TODO)
⚠️  **verify-deployment.sh** - Needs DynamoDB/Bedrock checks (TODO)

### Configuration

✅ **config.env.example** - Updated for DynamoDB/Bedrock settings
✅ **README.md** - Comprehensive update with new architecture

### Helper Scripts Generated

✅ **populate-healthcare-data.py** - DynamoDB data population
✅ **test-bedrock.py** - Bedrock connectivity testing

## Deployment Steps (Updated)

```bash
# Step 1: EKS Cluster (unchanged)
./1-deploy-eks-cluster.sh        # ~20-30 minutes

# Step 2: Ollama (unchanged)
./2-install-ollama.sh            # ~10-15 minutes

# Step 2b: AWS Bedrock (NEW)
./2b-setup-bedrock.sh            # ~2-3 minutes

# Step 3: DynamoDB (changed from Neo4j)
./3-setup-knowledge-graph.sh     # ~3-5 minutes (was 15-20)

# Step 4: Integration API (enhanced)
./4-deploy-integration.sh        # ~5-10 minutes
```

**Total Time**: ~40-60 minutes (down from 60-90 minutes)

## Cost Comparison

### Before (Neo4j + Ollama)

```
GPU Nodes (2x g4dn.xlarge):  $25.25/day
General Node (t3.large):      $2.00/day
EBS Volumes:                  $0.40/day
LoadBalancers (3x):           $1.80/day
-------------------------------------------
Total:                        ~$29.45/day
```

### After (DynamoDB + Ollama + Bedrock)

```
GPU Nodes (2x g4dn.xlarge):  $25.25/day
General Node (t3.large):      $2.00/day
EBS Volumes:                  $0.13/day (reduced)
LoadBalancers (2x):           $1.20/day
DynamoDB (on-demand):         $0.17/day (low usage)
Bedrock (pay-per-use):        $1-5/day (variable)
-------------------------------------------
Total:                        ~$29-34/day
```

**Key Differences:**

- **DynamoDB**: ~$5/month vs ~$50+/month for Neo4j
- **Bedrock**: Pay only for what you use, $0 when idle
- **Flexibility**: Can disable Ollama GPU nodes and use only Bedrock for production
- **Development**: Can use Ollama for dev (fixed cost), Bedrock for production (variable)

## API Changes

### New Query Endpoint

```bash
# Choose LLM backend
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How many patients have diabetes?",
    "use_bedrock": true,  # true = Bedrock, false = Ollama
    "explain": true
  }'
```

### Health Check Shows Both Backends

```bash
curl http://localhost:8080/health
```

Response:

```json
{
  "status": "healthy",
  "ollama_url": "http://ollama-service...",
  "bedrock_enabled": true,
  "bedrock_model": "anthropic.claude-3-haiku...",
  "dynamodb_connected": true,
  "aws_region": "us-east-1"
}
```

### Statistics Endpoint

```bash
curl http://localhost:8080/stats
```

Response:

```json
{
  "patients": 100,
  "diagnoses": 15,
  "medications": 50,
  "providers": 20,
  "patient_diagnoses": 200,
  "patient_medications": 300
}
```

## Migration Guide

### If You Have Existing Neo4j Deployment

1. **Export Neo4j Data** (if needed):

   ```bash
   # From Neo4j browser or cypher-shell
   MATCH (n) RETURN n
   ```

2. **Deploy New DynamoDB Setup**:

   ```bash
   ./3-setup-knowledge-graph.sh
   ```

3. **Deploy Enhanced Integration**:

   ```bash
   ./4-deploy-integration.sh
   ```

4. **Cleanup Old Neo4j** (optional):

   ```bash
   helm uninstall neo4j-healthcare -n neo4j
   kubectl delete namespace neo4j
   kubectl delete pvc -n neo4j --all
   ```

## Configuration Updates Needed

### config.env Changes

```bash
# REMOVED
NEO4J_NAMESPACE="neo4j"
NEO4J_PASSWORD="..."
NEO4J_STORAGE="50Gi"

# ADDED
BEDROCK_REGION="us-east-1"
BEDROCK_MODEL="anthropic.claude-3-haiku-20240307-v1:0"
USE_BEDROCK="true"
TABLE_PREFIX="healthcare"
BILLING_MODE="PAY_PER_REQUEST"
```

## Testing

### Test Bedrock Access

```bash
python3 test-bedrock.py
```

### Test DynamoDB Tables

```bash
aws dynamodb list-tables --region us-east-1
aws dynamodb scan --table-name healthcare-patients --limit 5 --region us-east-1
```

### Test Integration with Both Backends

```bash
# Test with Bedrock
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How many patients?", "use_bedrock": true}'

# Test with Ollama
curl -X POST http://localhost:8080/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How many patients?", "use_bedrock": false}'
```

## Remaining TODOs

1. ⚠️  **cleanup.sh** - Add DynamoDB table deletion and Bedrock IAM cleanup
2. ⚠️  **verify-deployment.sh** - Add DynamoDB and Bedrock health checks
3. 📝 Consider adding CloudWatch dashboards for DynamoDB metrics
4. 📝 Consider adding Bedrock usage tracking/alerting
5. 📝 Document data migration scripts for existing Neo4j users

## Benefits Summary

✅ **Lower Infrastructure Costs**: ~$20/month savings on database  
✅ **Faster Deployment**: 20-minute reduction in setup time  
✅ **Dual LLM Options**: Self-hosted (Ollama) + Managed (Bedrock)  
✅ **Serverless Data**: DynamoDB auto-scales, no maintenance  
✅ **Production Ready**: Bedrock provides enterprise-grade LLMs  
✅ **Development Friendly**: Ollama for fast iteration  
✅ **Pay-per-Use**: Only pay for Bedrock/DynamoDB when used  
✅ **Simpler Architecture**: Less components to manage  

## Questions?

Check these files for details:

- `bedrock-info.txt` - Bedrock model access and usage
- `dynamodb-info.txt` - DynamoDB table schemas and queries
- `integration-info.txt` - API documentation and examples
- `README.md` - Complete documentation
