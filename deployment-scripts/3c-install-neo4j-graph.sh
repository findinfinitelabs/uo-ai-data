#!/bin/bash

#####################################################################
# Neo4j Graph Database Installation for EKS
# Deploys Neo4j Community Edition to your EKS cluster
# Free, open-source alternative to AWS Neptune
#####################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NAMESPACE="${NEO4J_NAMESPACE:-neo4j}"
STORAGE_SIZE="${NEO4J_STORAGE_SIZE:-10Gi}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-healthcare2024}"
NEO4J_VERSION="${NEO4J_VERSION:-5.15.0}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Neo4j Graph Database Installation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Installing Neo4j Community Edition (FREE)${NC}"
echo -e "${GREEN}Alternative to AWS Neptune - runs in EKS${NC}"
echo ""

# Functions
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Verify Prerequisites
echo -e "${BLUE}Step 1: Verifying Prerequisites${NC}"

if ! command_exists kubectl; then
    print_error "kubectl is not installed"
    exit 1
fi
print_status "kubectl installed"

if ! kubectl cluster-info &>/dev/null; then
    print_error "Not connected to any Kubernetes cluster"
    echo "Run: aws eks update-kubeconfig --region us-east-1 --name ollama-ai-cluster"
    exit 1
fi
print_status "Connected to Kubernetes cluster"

if ! command_exists helm; then
    print_error "Helm is not installed"
    echo "Install with: brew install helm"
    exit 1
fi
print_status "Helm installed"

# Step 2: Create Namespace
echo ""
echo -e "${BLUE}Step 2: Creating Namespace${NC}"

if kubectl get namespace ${NAMESPACE} &>/dev/null; then
    print_warning "Namespace ${NAMESPACE} already exists"
else
    kubectl create namespace ${NAMESPACE}
    print_status "Namespace ${NAMESPACE} created"
fi

# Step 3: Create Persistent Volume Claim
echo ""
echo -e "${BLUE}Step 3: Creating Persistent Storage${NC}"

cat > /tmp/neo4j-pvc.yaml <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: neo4j-data
  namespace: ${NAMESPACE}
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3
  resources:
    requests:
      storage: ${STORAGE_SIZE}
EOF

kubectl apply -f /tmp/neo4j-pvc.yaml
print_status "Persistent volume claim created (${STORAGE_SIZE})"

# Wait for PVC to bind
echo "Waiting for PVC to bind..."
kubectl wait --for=jsonpath='{.status.phase}'=Bound pvc/neo4j-data -n ${NAMESPACE} --timeout=60s || true
print_status "Storage ready"

# Step 4: Deploy Neo4j
echo ""
echo -e "${BLUE}Step 4: Deploying Neo4j${NC}"

cat > /tmp/neo4j-deployment.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: neo4j-auth
  namespace: ${NAMESPACE}
type: Opaque
stringData:
  NEO4J_AUTH: neo4j/${NEO4J_PASSWORD}
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: neo4j
  namespace: ${NAMESPACE}
  labels:
    app: neo4j
spec:
  serviceName: neo4j
  replicas: 1
  selector:
    matchLabels:
      app: neo4j
  template:
    metadata:
      labels:
        app: neo4j
    spec:
      containers:
      - name: neo4j
        image: neo4j:${NEO4J_VERSION}-community
        ports:
        - containerPort: 7474
          name: http
        - containerPort: 7687
          name: bolt
        env:
        - name: NEO4J_AUTH
          valueFrom:
            secretKeyRef:
              name: neo4j-auth
              key: NEO4J_AUTH
        - name: NEO4J_ACCEPT_LICENSE_AGREEMENT
          value: "yes"
        - name: NEO4J_server_memory_heap_initial__size
          value: "512m"
        - name: NEO4J_server_memory_heap_max__size
          value: "2G"
        - name: NEO4J_server_memory_pagecache_size
          value: "512m"
        - name: NEO4J_dbms_security_procedures_unrestricted
          value: "apoc.*"
        - name: NEO4J_dbms_security_procedures_allowlist
          value: "apoc.*"
        volumeMounts:
        - name: neo4j-data
          mountPath: /data
        - name: neo4j-logs
          mountPath: /logs
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        livenessProbe:
          httpGet:
            path: /
            port: 7474
          initialDelaySeconds: 60
          periodSeconds: 10
          timeoutSeconds: 5
        readinessProbe:
          httpGet:
            path: /
            port: 7474
          initialDelaySeconds: 30
          periodSeconds: 5
          timeoutSeconds: 3
      volumes:
      - name: neo4j-data
        persistentVolumeClaim:
          claimName: neo4j-data
      - name: neo4j-logs
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: neo4j-service
  namespace: ${NAMESPACE}
  labels:
    app: neo4j
spec:
  selector:
    app: neo4j
  ports:
    - protocol: TCP
      port: 7474
      targetPort: 7474
      name: http
    - protocol: TCP
      port: 7687
      targetPort: 7687
      name: bolt
  type: LoadBalancer
  sessionAffinity: ClientIP
EOF

kubectl apply -f /tmp/neo4j-deployment.yaml
print_status "Neo4j deployment created"

# Step 5: Wait for Deployment
echo ""
echo -e "${BLUE}Step 5: Waiting for Neo4j to be Ready${NC}"
echo "This may take 2-3 minutes..."

kubectl rollout status statefulset/neo4j -n ${NAMESPACE} --timeout=5m
print_status "Neo4j is running"

# Step 6: Verify Service
echo ""
echo -e "${BLUE}Step 6: Verifying Service${NC}"

echo "Waiting for LoadBalancer to be ready..."
sleep 30

LB_HOSTNAME=$(kubectl get svc neo4j-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
LB_IP=$(kubectl get svc neo4j-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -n "$LB_HOSTNAME" ]; then
    NEO4J_HTTP_URL="http://${LB_HOSTNAME}:7474"
    NEO4J_BOLT_URL="bolt://${LB_HOSTNAME}:7687"
    print_status "Neo4j Browser accessible at: $NEO4J_HTTP_URL"
elif [ -n "$LB_IP" ]; then
    NEO4J_HTTP_URL="http://${LB_IP}:7474"
    NEO4J_BOLT_URL="bolt://${LB_IP}:7687"
    print_status "Neo4j Browser accessible at: $NEO4J_HTTP_URL"
else
    print_warning "LoadBalancer not ready yet. Check with: kubectl get svc -n ${NAMESPACE}"
    NEO4J_HTTP_URL="http://localhost:7474"
    NEO4J_BOLT_URL="bolt://localhost:7687"
fi

# Step 7: Create Python Import Script
echo ""
echo -e "${BLUE}Step 7: Creating Data Import Script${NC}"

cat > healthcare_neo4j_loader.py <<'EOFPYTHON'
#!/usr/bin/env python3
"""
Healthcare Knowledge Graph Loader for Neo4j
Imports data from DynamoDB into Neo4j graph database
"""

from neo4j import GraphDatabase
import boto3
import sys
from decimal import Decimal

class HealthcareGraphLoader:
    def __init__(self, uri, username, password, aws_region='us-west-2', table_prefix='healthcare'):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))
        self.dynamodb = boto3.resource('dynamodb', region_name=aws_region)
        self.table_prefix = table_prefix
        
    def close(self):
        self.driver.close()
    
    def clear_database(self):
        """Clear all nodes and relationships"""
        with self.driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
            print("✓ Database cleared")
    
    def create_indexes(self):
        """Create indexes for better query performance"""
        with self.driver.session() as session:
            # Patient index
            session.run("CREATE INDEX patient_id IF NOT EXISTS FOR (p:Patient) ON (p.patient_id)")
            # Diagnosis index
            session.run("CREATE INDEX diagnosis_code IF NOT EXISTS FOR (d:Diagnosis) ON (d.code)")
            # Medication index
            session.run("CREATE INDEX medication_id IF NOT EXISTS FOR (m:Medication) ON (m.medication_id)")
            print("✓ Indexes created")
    
    def load_patients(self):
        """Load patient nodes from DynamoDB"""
        table = self.dynamodb.Table(f'{self.table_prefix}-patients')
        response = table.scan()
        
        with self.driver.session() as session:
            for item in response['Items']:
                session.run("""
                    MERGE (p:Patient {patient_id: $patient_id})
                    SET p.age = $age,
                        p.gender = $gender,
                        p.state = $state
                """, 
                    patient_id=item['patient_id'],
                    age=int(item.get('age', 0)),
                    gender=item.get('gender', 'Unknown'),
                    state=item.get('state', 'Unknown')
                )
        
        print(f"✓ Loaded {len(response['Items'])} patients")
    
    def load_diagnoses(self):
        """Load diagnosis nodes from DynamoDB"""
        table = self.dynamodb.Table(f'{self.table_prefix}-diagnoses')
        response = table.scan()
        
        with self.driver.session() as session:
            for item in response['Items']:
                session.run("""
                    MERGE (d:Diagnosis {code: $code})
                    SET d.name = $name,
                        d.category = $category
                """,
                    code=item['diagnosis_code'],
                    name=item.get('name', ''),
                    category=item.get('category', 'General')
                )
        
        print(f"✓ Loaded {len(response['Items'])} diagnoses")
    
    def load_medications(self):
        """Load medication nodes from DynamoDB"""
        table = self.dynamodb.Table(f'{self.table_prefix}-medications')
        response = table.scan()
        
        with self.driver.session() as session:
            for item in response['Items']:
                session.run("""
                    MERGE (m:Medication {medication_id: $med_id})
                    SET m.name = $name,
                        m.class = $class,
                        m.form = $form
                """,
                    med_id=item['medication_id'],
                    name=item.get('name', ''),
                    class_=item.get('class', 'General'),
                    form=item.get('form', 'Tablet')
                )
        
        print(f"✓ Loaded {len(response['Items'])} medications")
    
    def load_patient_diagnoses(self):
        """Load patient-diagnosis relationships"""
        table = self.dynamodb.Table(f'{self.table_prefix}-patient-diagnoses')
        response = table.scan()
        
        with self.driver.session() as session:
            for item in response['Items']:
                session.run("""
                    MATCH (p:Patient {patient_id: $patient_id})
                    MATCH (d:Diagnosis {code: $code})
                    MERGE (p)-[r:DIAGNOSED_WITH]->(d)
                    SET r.date = $date,
                        r.severity = $severity
                """,
                    patient_id=item['patient_id'],
                    code=item['diagnosis_code'],
                    date=item.get('date', ''),
                    severity=item.get('severity', 'Unknown')
                )
        
        print(f"✓ Loaded {len(response['Items'])} diagnosis relationships")
    
    def load_patient_medications(self):
        """Load patient-medication relationships"""
        table = self.dynamodb.Table(f'{self.table_prefix}-patient-medications')
        response = table.scan()
        
        with self.driver.session() as session:
            for item in response['Items']:
                session.run("""
                    MATCH (p:Patient {patient_id: $patient_id})
                    MATCH (m:Medication {medication_id: $med_id})
                    MERGE (p)-[r:PRESCRIBED]->(m)
                    SET r.date = $date,
                        r.frequency = $frequency
                """,
                    patient_id=item['patient_id'],
                    med_id=item['medication_id'],
                    date=item.get('date', ''),
                    frequency=item.get('frequency', 'Unknown')
                )
        
        print(f"✓ Loaded {len(response['Items'])} medication relationships")
    
    def load_all(self):
        """Load all data into Neo4j"""
        print("\n🔄 Loading healthcare data into Neo4j...")
        print("=" * 50)
        
        self.clear_database()
        self.create_indexes()
        
        print("\nLoading nodes...")
        self.load_patients()
        self.load_diagnoses()
        self.load_medications()
        
        print("\nLoading relationships...")
        self.load_patient_diagnoses()
        self.load_patient_medications()
        
        print("\n" + "=" * 50)
        print("✅ Data import complete!")
        
        # Get stats
        with self.driver.session() as session:
            result = session.run("MATCH (n) RETURN count(n) as node_count")
            node_count = result.single()['node_count']
            
            result = session.run("MATCH ()-[r]->() RETURN count(r) as rel_count")
            rel_count = result.single()['rel_count']
            
            print(f"\nGraph Statistics:")
            print(f"  Nodes: {node_count}")
            print(f"  Relationships: {rel_count}")

if __name__ == '__main__':
    import os
    
    # Get Neo4j connection details
    uri = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
    username = os.getenv('NEO4J_USERNAME', 'neo4j')
    password = os.getenv('NEO4J_PASSWORD', 'healthcare2024')
    
    print(f"Connecting to Neo4j at {uri}...")
    
    loader = HealthcareGraphLoader(uri, username, password)
    
    try:
        loader.load_all()
    finally:
        loader.close()
    
    print("\n📊 Access Neo4j Browser to explore your graph!")
    print(f"   URL: {uri.replace('bolt://', 'http://').replace(':7687', ':7474')}")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
EOFPYTHON

chmod +x healthcare_neo4j_loader.py
print_status "Data import script created"

# Step 8: Create Sample Queries File
echo ""
echo -e "${BLUE}Step 8: Creating Sample Cypher Queries${NC}"

cat > neo4j_sample_queries.cypher <<'EOFCYPHER'
// Healthcare Knowledge Graph - Sample Cypher Queries
// Use these in Neo4j Browser to explore your data

// =================================================
// BASIC QUERIES
// =================================================

// 1. Count all nodes by type
MATCH (n)
RETURN labels(n) as NodeType, count(*) as Count
ORDER BY Count DESC;

// 2. Count all relationships
MATCH ()-[r]->()
RETURN type(r) as RelationshipType, count(*) as Count
ORDER BY Count DESC;

// 3. View sample patients
MATCH (p:Patient)
RETURN p
LIMIT 10;

// =================================================
// PATIENT QUERIES
// =================================================

// 4. Find patients with specific diagnosis (e.g., Type 2 Diabetes)
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: 'E11.9'})
RETURN p.patient_id, p.age, p.gender, d.name
LIMIT 10;

// 5. Get full patient profile (diagnoses and medications)
MATCH (p:Patient {patient_id: 'P00000001'})
OPTIONAL MATCH (p)-[d:DIAGNOSED_WITH]->(diag:Diagnosis)
OPTIONAL MATCH (p)-[m:PRESCRIBED]->(med:Medication)
RETURN p, collect(DISTINCT diag) as diagnoses, collect(DISTINCT med) as medications;

// 6. Patients with multiple conditions (comorbidities)
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis)
WITH p, count(d) as diagnosis_count
WHERE diagnosis_count >= 3
RETURN p.patient_id, p.age, p.gender, diagnosis_count
ORDER BY diagnosis_count DESC
LIMIT 20;

// =================================================
// DIAGNOSIS QUERIES
// =================================================

// 7. Most common diagnoses
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis)
RETURN d.code, d.name, count(p) as patient_count
ORDER BY patient_count DESC
LIMIT 10;

// 8. Find common comorbidities (diagnoses that occur together)
MATCH (d1:Diagnosis)<-[:DIAGNOSED_WITH]-(p:Patient)-[:DIAGNOSED_WITH]->(d2:Diagnosis)
WHERE d1.code < d2.code
WITH d1, d2, count(p) as co_occurrence
WHERE co_occurrence > 2
RETURN d1.code, d1.name, d2.code, d2.name, co_occurrence
ORDER BY co_occurrence DESC
LIMIT 20;

// 9. Age distribution for specific diagnosis
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: 'I10'})
RETURN 
  CASE 
    WHEN p.age < 30 THEN '18-29'
    WHEN p.age < 40 THEN '30-39'
    WHEN p.age < 50 THEN '40-49'
    WHEN p.age < 60 THEN '50-59'
    WHEN p.age < 70 THEN '60-69'
    ELSE '70+'
  END as age_group,
  count(*) as patient_count
ORDER BY age_group;

// =================================================
// MEDICATION QUERIES
// =================================================

// 10. Most commonly prescribed medications
MATCH (p:Patient)-[:PRESCRIBED]->(m:Medication)
RETURN m.name, m.class, count(p) as prescription_count
ORDER BY prescription_count DESC
LIMIT 10;

// 11. Medications for specific diagnosis
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: 'E11.9'})
MATCH (p)-[:PRESCRIBED]->(m:Medication)
RETURN m.name, count(p) as patient_count
ORDER BY patient_count DESC
LIMIT 10;

// 12. Polypharmacy patients (5+ medications)
MATCH (p:Patient)-[:PRESCRIBED]->(m:Medication)
WITH p, count(m) as med_count
WHERE med_count >= 5
RETURN p.patient_id, p.age, med_count
ORDER BY med_count DESC
LIMIT 20;

// =================================================
// ADVANCED QUERIES
// =================================================

// 13. Shortest path between two diagnoses
MATCH path = shortestPath(
  (d1:Diagnosis {code: 'E11.9'})-[*]-(d2:Diagnosis {code: 'I10'})
)
RETURN path
LIMIT 5;

// 14. Find similar patients (same diagnoses)
MATCH (p1:Patient {patient_id: 'P00000001'})-[:DIAGNOSED_WITH]->(d:Diagnosis)<-[:DIAGNOSED_WITH]-(p2:Patient)
WHERE p1 <> p2
WITH p2, collect(d.name) as shared_diagnoses, count(d) as similarity
ORDER BY similarity DESC
LIMIT 10
RETURN p2.patient_id, p2.age, p2.gender, similarity, shared_diagnoses;

// 15. Diagnosis network visualization
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis)
WITH d, count(p) as patient_count
WHERE patient_count > 5
MATCH (d)<-[:DIAGNOSED_WITH]-(p:Patient)-[:DIAGNOSED_WITH]->(d2:Diagnosis)
WHERE d.code < d2.code AND d2.code IN [d3.code WHERE (p2)-[:DIAGNOSED_WITH]->(d3) AND count(p2) > 5]
RETURN d, d2, count(p) as shared_patients
ORDER BY shared_patients DESC
LIMIT 50;

// =================================================
// DATA QUALITY CHECKS
// =================================================

// 16. Patients without diagnoses
MATCH (p:Patient)
WHERE NOT (p)-[:DIAGNOSED_WITH]->()
RETURN p.patient_id, p.age, p.gender;

// 17. Patients without medications
MATCH (p:Patient)
WHERE NOT (p)-[:PRESCRIBED]->()
RETURN p.patient_id, p.age, p.gender;

// 18. Orphan diagnoses (not linked to patients)
MATCH (d:Diagnosis)
WHERE NOT ()-[:DIAGNOSED_WITH]->(d)
RETURN d.code, d.name;

// =================================================
// EXPORT QUERIES
// =================================================

// 19. Export patient summary as JSON
MATCH (p:Patient)
OPTIONAL MATCH (p)-[:DIAGNOSED_WITH]->(d:Diagnosis)
OPTIONAL MATCH (p)-[:PRESCRIBED]->(m:Medication)
RETURN p.patient_id, 
       p.age, 
       p.gender,
       collect(DISTINCT d.code) as diagnosis_codes,
       collect(DISTINCT m.name) as medications
LIMIT 100;

// 20. Graph statistics
CALL {
  MATCH (p:Patient) RETURN count(p) as patients
  UNION
  MATCH (d:Diagnosis) RETURN count(d) as diagnoses
  UNION
  MATCH (m:Medication) RETURN count(m) as medications
  UNION
  MATCH ()-[r:DIAGNOSED_WITH]->() RETURN count(r) as diagnosis_rels
  UNION
  MATCH ()-[r:PRESCRIBED]->() RETURN count(r) as prescription_rels
}
RETURN *;
EOFCYPHER

print_status "Sample queries saved to neo4j_sample_queries.cypher"

# Step 9: Save Configuration
echo ""
echo -e "${BLUE}Step 9: Saving Configuration${NC}"

cat > neo4j-info.txt <<EOF
Neo4j Graph Database Information
=================================
Namespace: ${NAMESPACE}
Storage: ${STORAGE_SIZE}
Version: ${NEO4J_VERSION}
Deployed: $(date)

Browser URL: ${NEO4J_HTTP_URL}
Bolt URL: ${NEO4J_BOLT_URL}
Username: neo4j
Password: ${NEO4J_PASSWORD}

Useful Commands:
================

# Access Neo4j Browser (in your web browser)
${NEO4J_HTTP_URL}

# View Neo4j logs
kubectl logs -n ${NAMESPACE} statefulset/neo4j --tail=100

# Port forward for local access
kubectl port-forward -n ${NAMESPACE} svc/neo4j-service 7474:7474 7687:7687

# Import healthcare data from DynamoDB
python3 healthcare_neo4j_loader.py

# Install Python dependencies for loader
pip3 install neo4j boto3

# Connect programmatically (Python)
from neo4j import GraphDatabase

driver = GraphDatabase.driver(
    "${NEO4J_BOLT_URL}",
    auth=("neo4j", "${NEO4J_PASSWORD}")
)

# Execute Cypher query
with driver.session() as session:
    result = session.run("MATCH (n) RETURN count(n)")
    print(result.single()[0])

# Execute sample queries
cat neo4j_sample_queries.cypher
# Copy/paste queries into Neo4j Browser

Cost Comparison:
================
AWS Neptune: \$0.10/hour + \$0.20/hour for instances = ~\$216/month minimum
Neo4j on EKS: Only pay for EKS storage (${STORAGE_SIZE} @ \$0.10/GB/month) = ~\$1-2/month

Next Steps:
===========
1. Open Neo4j Browser: ${NEO4J_HTTP_URL}
2. Login with credentials above
3. Run data import: python3 healthcare_neo4j_loader.py
4. Try sample queries from neo4j_sample_queries.cypher
5. Build AI queries using Cypher language
EOF

print_status "Configuration saved to neo4j-info.txt"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Neo4j Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Browser URL: ${NEO4J_HTTP_URL}"
echo "Bolt URL: ${NEO4J_BOLT_URL}"
echo "Username: neo4j"
echo "Password: ${NEO4J_PASSWORD}"
echo ""
echo "To load healthcare data:"
echo "  pip3 install neo4j boto3"
echo "  python3 healthcare_neo4j_loader.py"
echo ""
echo "Next: Run ./4-deploy-integration.sh"
echo ""
