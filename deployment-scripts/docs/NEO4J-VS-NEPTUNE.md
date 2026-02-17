# Neo4j vs Neptune - Graph Database Options

## Quick Comparison

| Feature | AWS Neptune | Neo4j on EKS | NetworkX |
|---------|-------------|--------------|----------|
| **Type** | Managed Service | Self-hosted | In-memory Library |
| **Cost** | ~$216/month minimum | ~$2-3/month | $0 (no storage) |
| **Deployment** | AWS Console | EKS (script 3c) | Python package |
| **Persistence** | ✅ Yes | ✅ Yes | ❌ No (RAM only) |
| **Query Language** | Gremlin/SPARQL | Cypher | Python API |
| **Scalability** | ✅ High | ⚠️ Medium | ❌ Single machine |
| **Maintenance** | ✅ Managed | ⚠️ Self-managed | ✅ None needed |
| **Learning Curve** | Medium-High | Low-Medium | Low |
| **Best For** | Production | Education/Dev | Prototyping |

## Recommendation for Innovation Studio

**Use Neo4j on EKS (Option 2)**

### Why?

1. **Cost-effective**: 100x cheaper than Neptune ($2 vs $216/month)
2. **Persistent**: Data survives pod restarts
3. **Easy to learn**: Cypher is intuitive (similar to SQL)
4. **Full-featured**: ACID transactions, graph algorithms, indexes
5. **Quick deployment**: 3-5 minutes with our script

### When to Use Each Option

**Choose Neptune if:**
- You have production budget
- Need high availability (99.9% SLA)
- Require multi-AZ deployment
- Want fully managed service
- Not constrained by Innovation Studio credits

**Choose Neo4j on EKS if:**
- Using AWS Innovation Studio (limited budget)
- Learning graph databases
- Building educational projects
- Want hands-on Kubernetes experience
- Need persistent graph storage

**Choose NetworkX if:**
- Quick prototyping only
- Small datasets (<10K nodes)
- Don't need persistence
- Want pure Python solution
- Testing graph algorithms

## Deployment Instructions

### Deploy Neo4j

```bash
cd deployment-scripts

# Standalone deployment
./3c-install-neo4j-graph.sh

# Or as part of full stack
./deploy-all.sh
# When prompted, choose option 2: "DynamoDB + Neo4j on EKS"
```

### Access Neo4j Browser

After deployment:

```bash
# Get the LoadBalancer URL
kubectl get svc neo4j-service -n neo4j

# Open in browser
http://<LOAD-BALANCER>:7474

# Credentials
Username: neo4j
Password: healthcare2024
```

### Load Healthcare Data

```bash
# Install Python dependencies
pip3 install neo4j boto3

# Run the import script
python3 healthcare_neo4j_loader.py

# Verify data loaded
# In Neo4j Browser, run:
MATCH (n) RETURN count(n)
```

## Sample Queries

### Basic Queries

```cypher
// Count all patients
MATCH (p:Patient) RETURN count(p)

// Find patients with diabetes
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: 'E11.9'})
RETURN p.patient_id, p.age, p.gender
LIMIT 10

// Get patient profile
MATCH (p:Patient {patient_id: 'P00000001'})
OPTIONAL MATCH (p)-[:DIAGNOSED_WITH]->(d:Diagnosis)
OPTIONAL MATCH (p)-[:PRESCRIBED]->(m:Medication)
RETURN p, collect(d) as diagnoses, collect(m) as medications
```

### Advanced Analytics

```cypher
// Find common comorbidities
MATCH (d1:Diagnosis)<-[:DIAGNOSED_WITH]-(p:Patient)-[:DIAGNOSED_WITH]->(d2:Diagnosis)
WHERE d1.code < d2.code
WITH d1, d2, count(p) as co_occurrence
WHERE co_occurrence > 5
RETURN d1.name, d2.name, co_occurrence
ORDER BY co_occurrence DESC
LIMIT 20

// Polypharmacy patients (5+ medications)
MATCH (p:Patient)-[:PRESCRIBED]->(m:Medication)
WITH p, count(m) as med_count
WHERE med_count >= 5
RETURN p.patient_id, p.age, med_count
ORDER BY med_count DESC

// Most common medications for diagnosis
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: 'E11.9'})
MATCH (p)-[:PRESCRIBED]->(m:Medication)
RETURN m.name, count(p) as prescription_count
ORDER BY prescription_count DESC
LIMIT 10
```

## Cost Breakdown

### AWS Neptune (Not Recommended)

```
Monthly Costs:
- db.t3.medium instance: $0.092/hour × 730 hours = $67.16
- db.r5.large instance: $0.206/hour × 730 hours = $150.38
- Storage: $0.10/GB/month (10GB) = $1.00
- I/O: $0.20/million requests (varies)
- Backup: $0.02/GB/month
------------------------------------------------------
Minimum Total: ~$216/month
```

### Neo4j on EKS (Recommended)

```
Monthly Costs:
- EKS Control Plane: $72/month (already counted in cluster cost)
- Storage (PVC): 10GB × $0.10/GB/month = $1.00
- Compute: Shared with Ollama pods (no additional cost)
------------------------------------------------------
Total: ~$1-2/month
```

### NetworkX (Free but Limited)

```
Monthly Costs:
- Storage: $0 (in-memory only)
- Compute: Shared with application
------------------------------------------------------
Total: $0 (but no persistence)
```

## Python Integration

### Connect to Neo4j

```python
from neo4j import GraphDatabase

# Initialize driver
driver = GraphDatabase.driver(
    "bolt://your-loadbalancer:7687",
    auth=("neo4j", "healthcare2024")
)

# Execute query
with driver.session() as session:
    result = session.run("""
        MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis)
        RETURN p.patient_id, d.name
        LIMIT 10
    """)
    
    for record in result:
        print(f"Patient {record['p.patient_id']}: {record['d.name']}")

driver.close()
```

### Build RAG with Neo4j + LLM

```python
from neo4j import GraphDatabase
import requests

class HealthcareRAG:
    def __init__(self, neo4j_uri, ollama_url):
        self.graph = GraphDatabase.driver(
            neo4j_uri, 
            auth=("neo4j", "healthcare2024")
        )
        self.ollama_url = ollama_url
    
    def query_knowledge_graph(self, patient_id):
        """Get patient context from graph"""
        with self.graph.session() as session:
            result = session.run("""
                MATCH (p:Patient {patient_id: $pid})
                OPTIONAL MATCH (p)-[:DIAGNOSED_WITH]->(d:Diagnosis)
                OPTIONAL MATCH (p)-[:PRESCRIBED]->(m:Medication)
                RETURN p, collect(d.name) as diagnoses, 
                       collect(m.name) as medications
            """, pid=patient_id)
            return result.single()
    
    def generate_summary(self, patient_id):
        """Generate patient summary using graph context"""
        # Get context from graph
        data = self.query_knowledge_graph(patient_id)
        
        # Build prompt
        prompt = f"""Based on this patient data:
- Age: {data['p']['age']}
- Gender: {data['p']['gender']}
- Diagnoses: {', '.join(data['diagnoses'])}
- Medications: {', '.join(data['medications'])}

Provide a brief clinical summary."""
        
        # Query LLM
        response = requests.post(
            f"{self.ollama_url}/api/generate",
            json={
                "model": "llama2",
                "prompt": prompt,
                "stream": False
            }
        )
        
        return response.json()['response']
```

## Troubleshooting

### Issue: Can't connect to Neo4j

```bash
# Check pod status
kubectl get pods -n neo4j
kubectl describe pod/neo4j-0 -n neo4j

# Check logs
kubectl logs -n neo4j statefulset/neo4j --tail=50

# Verify service
kubectl get svc neo4j-service -n neo4j

# Port forward for local testing
kubectl port-forward -n neo4j svc/neo4j-service 7474:7474 7687:7687
```

### Issue: Data import fails

```bash
# Check DynamoDB tables exist
aws dynamodb list-tables --region us-east-1

# Verify AWS credentials
aws sts get-caller-identity

# Test Python dependencies
python3 -c "from neo4j import GraphDatabase; import boto3; print('OK')"

# Check Neo4j credentials
# In Neo4j Browser: :server connect
```

### Issue: Queries are slow

```cypher
// Create indexes
CREATE INDEX patient_id IF NOT EXISTS FOR (p:Patient) ON (p.patient_id);
CREATE INDEX diagnosis_code IF NOT EXISTS FOR (d:Diagnosis) ON (d.code);

// Add LIMIT to queries
MATCH (p:Patient)
RETURN p
LIMIT 100  -- Always limit in development

// Use EXPLAIN to analyze
EXPLAIN MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis)
RETURN p, d
```

## Next Steps

1. **Deploy Neo4j**: Run `./3c-install-neo4j-graph.sh`
2. **Access Browser**: Open http://<LOAD-BALANCER>:7474
3. **Load Data**: Run `python3 healthcare_neo4j_loader.py`
4. **Try Queries**: Copy examples from `neo4j_sample_queries.cypher`
5. **Build Integration**: Connect Neo4j with Ollama for RAG

## Learning Resources

### Neo4j Documentation
- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/)
- [Graph Data Modeling](https://neo4j.com/developer/data-modeling/)
- [Python Driver](https://neo4j.com/docs/python-manual/)

### Healthcare Graph Examples
- [Medical Knowledge Graphs](https://neo4j.com/use-cases/life-sciences/)
- [Clinical Decision Support](https://neo4j.com/use-cases/healthcare/)

### Graph Algorithms
- [PageRank for node importance](https://neo4j.com/docs/graph-data-science/current/algorithms/page-rank/)
- [Community detection](https://neo4j.com/docs/graph-data-science/current/algorithms/louvain/)
- [Shortest path](https://neo4j.com/docs/cypher-manual/current/functions/scalar/#functions-shortestpath)

## Summary

For AWS Innovation Studio projects, **Neo4j on EKS is the best choice**:

- ✅ 100x cheaper than Neptune
- ✅ Full graph database features
- ✅ Persistent storage
- ✅ Easy to learn (Cypher)
- ✅ Perfect for education
- ✅ Quick deployment (5 minutes)

Deploy now: `./3c-install-neo4j-graph.sh`
