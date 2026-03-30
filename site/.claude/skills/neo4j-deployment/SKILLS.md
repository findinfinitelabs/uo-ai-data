# Neo4j Graph Database Deployment Skill

## Overview

Guidelines for deploying Neo4j Community Edition as a cost-effective alternative to AWS Neptune for healthcare knowledge graphs in AWS Innovation Studio environments.

## Why Neo4j Instead of Neptune?

### Cost Comparison

**AWS Neptune:**
- Minimum cost: $0.10/hour (db.t3.medium) + $0.20/hour (additional instances)
- Storage: $0.10/GB/month + $0.20/GB/month I/O
- **Total: ~$216/month minimum**
- ❌ Too expensive for educational/Innovation Studio budgets

**Neo4j on EKS:**
- Only pay for: EKS storage (PVC)
- Storage cost: 10GB @ $0.10/GB/month = **~$1-2/month**
- No additional database costs (Community Edition is free)
- ✅ **100x cheaper than Neptune**

### Feature Comparison

| Feature | Neptune | Neo4j Community |
|---------|---------|-----------------|
| Graph database | ✅ | ✅ |
| ACID transactions | ✅ | ✅ |
| Query language | Gremlin/SPARQL | **Cypher** (easier) |
| High availability | ✅ | ⚠️ (Enterprise only) |
| Cost | $$$ | **Free** |
| Managed service | ✅ | ❌ (you manage) |
| K8s deployment | ❌ | ✅ |

## Installation

### Prerequisites

Ensure you have:
- EKS cluster running (from script 1)
- kubectl configured
- Helm installed
- DynamoDB tables created (script 3)

### Deploy Neo4j

```bash
cd deployment-scripts

# Deploy Neo4j to EKS
./3c-install-neo4j-graph.sh

# With custom configuration
export NEO4J_PASSWORD="your-secure-password"
export NEO4J_STORAGE_SIZE="20Gi"
./3c-install-neo4j-graph.sh
```

### What Gets Deployed

1. **Namespace:** `neo4j` (isolated from other workloads)
2. **Persistent Volume:** 10GB (configurable) for graph storage
3. **StatefulSet:** Neo4j Community Edition v5.15
4. **Service:** LoadBalancer exposing ports 7474 (HTTP) and 7687 (Bolt)
5. **Secret:** Authentication credentials
6. **Import Script:** Python script to load data from DynamoDB

### Access Neo4j

After deployment:

```bash
# Get the LoadBalancer URL
kubectl get svc neo4j-service -n neo4j

# Access Neo4j Browser (web interface)
# Open in browser: http://<LOAD-BALANCER>:7474

# Login credentials
Username: neo4j
Password: healthcare2024  # or your custom password
```

## Data Model

### Healthcare Knowledge Graph Schema

```cypher
// Node types
(:Patient {patient_id, age, gender, state})
(:Diagnosis {code, name, category})
(:Medication {medication_id, name, class, form})
(:Provider {npi, name, specialty})

// Relationship types
(Patient)-[:DIAGNOSED_WITH {date, severity}]->(Diagnosis)
(Patient)-[:PRESCRIBED {date, frequency}]->(Medication)
(Patient)-[:TREATED_BY]->(Provider)
```

### Example Graph Structure

```
(Patient:P001) -[DIAGNOSED_WITH]-> (Diagnosis:E11.9 "Type 2 Diabetes")
               -[PRESCRIBED]-> (Medication:Metformin)
               -[PRESCRIBED]-> (Medication:Insulin)
               
(Patient:P002) -[DIAGNOSED_WITH]-> (Diagnosis:E11.9 "Type 2 Diabetes")
               -[DIAGNOSED_WITH]-> (Diagnosis:I10 "Hypertension")
               -[PRESCRIBED]-> (Medication:Metformin)
               -[PRESCRIBED]-> (Medication:Lisinopril)
```

## Loading Data

### From DynamoDB to Neo4j

```bash
# Install Python dependencies
pip3 install neo4j boto3

# Run the import script
python3 healthcare_neo4j_loader.py

# With custom connection
export NEO4J_URI="bolt://your-loadbalancer:7687"
export NEO4J_PASSWORD="your-password"
python3 healthcare_neo4j_loader.py
```

### Import Process

The loader script:
1. Connects to DynamoDB tables
2. Clears existing Neo4j data
3. Creates indexes for performance
4. Loads nodes (Patients, Diagnoses, Medications)
5. Creates relationships (DIAGNOSED_WITH, PRESCRIBED)
6. Reports statistics

### Manual Import (Cypher)

```cypher
// Create a patient
CREATE (p:Patient {
  patient_id: 'P00000001',
  age: 45,
  gender: 'female',
  state: 'Oregon'
})

// Create a diagnosis
CREATE (d:Diagnosis {
  code: 'E11.9',
  name: 'Type 2 diabetes mellitus',
  category: 'Endocrine'
})

// Create relationship
MATCH (p:Patient {patient_id: 'P00000001'})
MATCH (d:Diagnosis {code: 'E11.9'})
CREATE (p)-[r:DIAGNOSED_WITH {
  date: '2024-01-15',
  severity: 'moderate'
}]->(d)
```

## Cypher Query Language

### Basic Queries

```cypher
// Count all nodes
MATCH (n)
RETURN count(n)

// Find patients with diabetes
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: 'E11.9'})
RETURN p.patient_id, p.age, p.gender

// Get patient's full profile
MATCH (p:Patient {patient_id: 'P00000001'})
OPTIONAL MATCH (p)-[:DIAGNOSED_WITH]->(d:Diagnosis)
OPTIONAL MATCH (p)-[:PRESCRIBED]->(m:Medication)
RETURN p, collect(d) as diagnoses, collect(m) as medications
```

### Advanced Queries

```cypher
// Find common comorbidities
MATCH (d1:Diagnosis)<-[:DIAGNOSED_WITH]-(p:Patient)-[:DIAGNOSED_WITH]->(d2:Diagnosis)
WHERE d1.code < d2.code
WITH d1, d2, count(p) as co_occurrence
WHERE co_occurrence > 5
RETURN d1.name, d2.name, co_occurrence
ORDER BY co_occurrence DESC

// Shortest path between diagnoses
MATCH path = shortestPath(
  (d1:Diagnosis {code: 'E11.9'})-[*]-(d2:Diagnosis {code: 'I10'})
)
RETURN path

// Find similar patients
MATCH (p1:Patient {patient_id: 'P00000001'})-[:DIAGNOSED_WITH]->(d:Diagnosis)<-[:DIAGNOSED_WITH]-(p2:Patient)
WHERE p1 <> p2
WITH p2, collect(d.name) as shared_diagnoses, count(d) as similarity
ORDER BY similarity DESC
LIMIT 10
RETURN p2.patient_id, similarity, shared_diagnoses
```

### Healthcare-Specific Queries

```cypher
// Polypharmacy patients (5+ medications)
MATCH (p:Patient)-[:PRESCRIBED]->(m:Medication)
WITH p, count(m) as med_count
WHERE med_count >= 5
RETURN p.patient_id, p.age, med_count
ORDER BY med_count DESC

// Age distribution by diagnosis
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: 'I10'})
RETURN 
  CASE 
    WHEN p.age < 40 THEN '18-39'
    WHEN p.age < 60 THEN '40-59'
    ELSE '60+'
  END as age_group,
  count(*) as patient_count

// Most common medications for diagnosis
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: 'E11.9'})
MATCH (p)-[:PRESCRIBED]->(m:Medication)
RETURN m.name, count(p) as prescription_count
ORDER BY prescription_count DESC
LIMIT 10
```

## Python Integration

### Connect from Python

```python
from neo4j import GraphDatabase

# Connection
uri = "bolt://your-loadbalancer:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "healthcare2024"))

# Execute query
def find_patients_with_diagnosis(tx, diagnosis_code):
    result = tx.run("""
        MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: $code})
        RETURN p.patient_id, p.age, p.gender
    """, code=diagnosis_code)
    return list(result)

# Use in session
with driver.session() as session:
    patients = session.execute_read(find_patients_with_diagnosis, "E11.9")
    for patient in patients:
        print(patient)

driver.close()
```

### Query Builder Class

```python
class HealthcareGraphQuery:
    def __init__(self, uri, username, password):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))
    
    def find_comorbidities(self, diagnosis_code, min_count=5):
        """Find common comorbidities"""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (d1:Diagnosis {code: $code})<-[:DIAGNOSED_WITH]-(p:Patient)
                      -[:DIAGNOSED_WITH]->(d2:Diagnosis)
                WHERE d1.code <> d2.code
                WITH d2, count(p) as co_occurrence
                WHERE co_occurrence >= $min_count
                RETURN d2.code, d2.name, co_occurrence
                ORDER BY co_occurrence DESC
            """, code=diagnosis_code, min_count=min_count)
            return [dict(record) for record in result]
    
    def patient_summary(self, patient_id):
        """Get complete patient summary"""
        with self.driver.session() as session:
            result = session.run("""
                MATCH (p:Patient {patient_id: $patient_id})
                OPTIONAL MATCH (p)-[d:DIAGNOSED_WITH]->(diag:Diagnosis)
                OPTIONAL MATCH (p)-[m:PRESCRIBED]->(med:Medication)
                RETURN p.patient_id as patient_id,
                       p.age as age,
                       p.gender as gender,
                       collect(DISTINCT {
                         code: diag.code,
                         name: diag.name,
                         date: d.date
                       }) as diagnoses,
                       collect(DISTINCT {
                         name: med.name,
                         frequency: m.frequency
                       }) as medications
            """, patient_id=patient_id)
            return result.single()
    
    def close(self):
        self.driver.close()
```

## LLM Integration

### Using Neo4j with LLMs

```python
from neo4j import GraphDatabase
import requests

class HealthcareGraphRAG:
    """Retrieval-Augmented Generation with Neo4j"""
    
    def __init__(self, neo4j_uri, ollama_url):
        self.graph = GraphDatabase.driver(neo4j_uri, auth=("neo4j", "healthcare2024"))
        self.ollama_url = ollama_url
    
    def query_graph(self, cypher_query):
        """Execute Cypher query"""
        with self.graph.session() as session:
            result = session.run(cypher_query)
            return [dict(record) for record in result]
    
    def generate_response(self, question):
        """Generate response using graph context"""
        
        # 1. Extract entities from question (simple keyword matching)
        entities = self.extract_entities(question)
        
        # 2. Query graph for relevant data
        context = self.get_context(entities)
        
        # 3. Generate response with LLM
        prompt = f"""Based on the following healthcare data:
{context}

Answer this question: {question}

Provide a clear, factual answer based only on the data provided."""
        
        response = requests.post(
            f"{self.ollama_url}/api/generate",
            json={
                "model": "llama2",
                "prompt": prompt,
                "stream": False
            }
        )
        
        return response.json()['response']
    
    def extract_entities(self, question):
        """Simple entity extraction"""
        # TODO: Implement proper NER
        entities = {
            'diagnosis_codes': [],
            'patient_ids': []
        }
        return entities
    
    def get_context(self, entities):
        """Retrieve relevant graph data"""
        context_parts = []
        
        if entities['diagnosis_codes']:
            for code in entities['diagnosis_codes']:
                data = self.query_graph(f"""
                    MATCH (d:Diagnosis {{code: '{code}'}})
                    OPTIONAL MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d)
                    RETURN d.name as diagnosis,
                           count(p) as patient_count
                """)
                context_parts.append(str(data))
        
        return "\n".join(context_parts)
```

## Performance Optimization

### Create Indexes

```cypher
// Create indexes for common queries
CREATE INDEX patient_id IF NOT EXISTS FOR (p:Patient) ON (p.patient_id);
CREATE INDEX diagnosis_code IF NOT EXISTS FOR (d:Diagnosis) ON (d.code);
CREATE INDEX medication_id IF NOT EXISTS FOR (m:Medication) ON (m.medication_id);

// Check existing indexes
SHOW INDEXES;
```

### Query Optimization Tips

```cypher
// ✅ Good: Use indexed properties in WHERE
MATCH (p:Patient {patient_id: 'P00000001'})
RETURN p

// ❌ Bad: Filter after match (no index use)
MATCH (p:Patient)
WHERE p.patient_id = 'P00000001'
RETURN p

// ✅ Good: Limit early
MATCH (p:Patient)
RETURN p
LIMIT 100

// ✅ Good: Use EXPLAIN to analyze
EXPLAIN MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis)
RETURN p, d
LIMIT 10
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check Neo4j status
kubectl get pods -n neo4j
kubectl logs -n neo4j statefulset/neo4j --tail=50

# Check service
kubectl get svc neo4j-service -n neo4j

# Port forward for local access
kubectl port-forward -n neo4j svc/neo4j-service 7474:7474 7687:7687
```

### Backup

```bash
# Backup Neo4j data
kubectl exec -n neo4j statefulset/neo4j -- \
  neo4j-admin dump --database=neo4j --to=/tmp/neo4j-backup.dump

# Copy backup locally
kubectl cp neo4j/neo4j-0:/tmp/neo4j-backup.dump ./neo4j-backup-$(date +%Y%m%d).dump
```

### Resource Monitoring

```cypher
// Database statistics
CALL dbms.queryJmx("org.neo4j:instance=kernel#0,name=Store sizes")
YIELD attributes
RETURN attributes.TotalStoreSize;

// Query performance
CALL dbms.listQueries()
YIELD queryId, query, elapsedTimeMillis, allocatedBytes
WHERE elapsedTimeMillis > 1000
RETURN queryId, query, elapsedTimeMillis;
```

## Troubleshooting

### Common Issues

**Issue: Can't connect to Neo4j**
```bash
# Check pod status
kubectl get pods -n neo4j

# Check logs
kubectl logs -n neo4j statefulset/neo4j

# Verify service
kubectl get svc -n neo4j
```

**Issue: Out of memory**
```bash
# Increase heap size in deployment
NEO4J_server_memory_heap_max__size: "4G"

# Or scale up pod resources
resources:
  limits:
    memory: "8Gi"
```

**Issue: Query timeout**
```cypher
// Add query timeout
CALL {
  MATCH (p:Patient)
  RETURN p
  LIMIT 1000
}
IN TRANSACTIONS OF 100 ROWS;
```

## Best Practices

### ✅ Do

- Use indexes on frequently queried properties
- Limit query results
- Use parameterized queries (防SQL injection)
- Back up data regularly
- Monitor query performance
- Use transactions for writes
- Document your schema

### ❌ Don't

- Load entire graph into memory
- Create unbounded relationships
- Skip index creation
- Use string concatenation for queries
- Forget to close driver connections
- Query without LIMIT in production
- Mix graph and relational thinking

## Cost Optimization

### Storage Management

```cypher
// Find large subgraphs
MATCH (n)
RETURN labels(n), count(n) as node_count, 
       avg(size(properties(n))) as avg_properties
ORDER BY node_count DESC;

// Delete old relationships
MATCH ()-[r:DIAGNOSED_WITH]->()
WHERE r.date < '2020-01-01'
DELETE r;
```

### Scaling Strategies

**Vertical scaling** (increase pod resources):
```yaml
resources:
  requests:
    memory: "4Gi"
    cpu: "2"
  limits:
    memory: "8Gi"
    cpu: "4"
```

**Data partitioning** (split by patient cohorts):
```cypher
// Partition by state
MATCH (p:Patient {state: 'Oregon'})
RETURN p
```

## Quick Reference

### Essential Commands

```bash
# Deploy Neo4j
./3c-install-neo4j-graph.sh

# Load data
python3 healthcare_neo4j_loader.py

# Access browser
http://<LOAD-BALANCER>:7474

# Port forward
kubectl port-forward -n neo4j svc/neo4j-service 7474:7474 7687:7687

# Check status
kubectl get all -n neo4j

# View logs
kubectl logs -n neo4j statefulset/neo4j

# Delete deployment
kubectl delete namespace neo4j
```

### Essential Cypher

```cypher
// Count nodes
MATCH (n) RETURN count(n);

// Find patients
MATCH (p:Patient) RETURN p LIMIT 10;

// Patient profile
MATCH (p:Patient {patient_id: 'P00000001'})
OPTIONAL MATCH (p)-[]->(related)
RETURN p, related;

// Clear database
MATCH (n) DETACH DELETE n;
```
