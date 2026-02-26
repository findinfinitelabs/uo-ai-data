#!/bin/bash

#####################################################################
# Knowledge Graph Setup (NetworkX)
# Creates in-memory knowledge graph from DynamoDB healthcare data
# Uses NetworkX - no additional infrastructure required!
#####################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
TABLE_PREFIX="${TABLE_PREFIX:-healthcare}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Knowledge Graph Setup (NetworkX)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Using in-memory graph (NetworkX) - no additional AWS services!${NC}"
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

# Step 1: Create Knowledge Graph Library
echo -e "${BLUE}Step 1: Creating Knowledge Graph Library${NC}"

cat > healthcare_knowledge_graph.py <<'EOFPYTHON'
#!/usr/bin/env python3
"""
Healthcare Knowledge Graph using NetworkX
Builds graph from DynamoDB data in-memory for fast querying
"""

import networkx as nx
import boto3
import json
from decimal import Decimal
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

class HealthcareKnowledgeGraph:
    def __init__(self, aws_region='us-east-1', table_prefix='healthcare'):
        self.aws_region = aws_region
        self.table_prefix = table_prefix
        self.graph = nx.MultiDiGraph()  # Directed graph with multiple edges
        self.dynamodb = boto3.resource('dynamodb', region_name=aws_region)
        
        # Initialize tables
        self.patients = self.dynamodb.Table(f'{table_prefix}-patients')
        self.diagnoses = self.dynamodb.Table(f'{table_prefix}-diagnoses')
        self.medications = self.dynamodb.Table(f'{table_prefix}-medications')
        self.providers = self.dynamodb.Table(f'{table_prefix}-providers')
        self.patient_diagnoses = self.dynamodb.Table(f'{table_prefix}-patient-diagnoses')
        self.patient_medications = self.dynamodb.Table(f'{table_prefix}-patient-medications')
        
        logger.info("Healthcare Knowledge Graph initialized")
    
    def build_graph(self):
        """Build the complete knowledge graph from DynamoDB"""
        logger.info("Building knowledge graph from DynamoDB...")
        
        # Add nodes
        self._add_patient_nodes()
        self._add_diagnosis_nodes()
        self._add_medication_nodes()
        self._add_provider_nodes()
        
        # Add edges (relationships)
        self._add_diagnosis_relationships()
        self._add_medication_relationships()
        
        logger.info(f"Graph built: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges")
        return {
            'nodes': self.graph.number_of_nodes(),
            'edges': self.graph.number_of_edges()
        }
    
    def _add_patient_nodes(self):
        """Add patient nodes"""
        response = self.patients.scan()
        for item in response['Items']:
            self.graph.add_node(
                item['patient_id'],
                type='Patient',
                age=int(item.get('age', 0)),
                gender=item.get('gender', 'Unknown')
            )
    
    def _add_diagnosis_nodes(self):
        """Add diagnosis nodes"""
        response = self.diagnoses.scan()
        for item in response['Items']:
            self.graph.add_node(
                f"DIAG_{item['diagnosis_code']}",
                type='Diagnosis',
                code=item['diagnosis_code'],
                name=item.get('name', ''),
                category=item.get('category', 'General')
            )
    
    def _add_medication_nodes(self):
        """Add medication nodes"""
        response = self.medications.scan()
        for item in response['Items']:
            self.graph.add_node(
                f"MED_{item['medication_id']}",
                type='Medication',
                medication_id=item['medication_id'],
                name=item.get('name', ''),
                drug_class=item.get('class', 'General'),
                form=item.get('form', 'Tablet')
            )
    
    def _add_provider_nodes(self):
        """Add provider nodes"""
        response = self.providers.scan()
        for item in response['Items']:
            self.graph.add_node(
                f"PROV_{item['npi']}",
                type='Provider',
                npi=item['npi'],
                name=item.get('name', ''),
                specialty=item.get('specialty', 'General')
            )
    
    def _add_diagnosis_relationships(self):
        """Add patient-diagnosis edges"""
        response = self.patient_diagnoses.scan()
        for item in response['Items']:
            self.graph.add_edge(
                item['patient_id'],
                f"DIAG_{item['diagnosis_code']}",
                type='DIAGNOSED_WITH',
                date=item.get('date', ''),
                severity=item.get('severity', 'Unknown'),
                provider=item.get('provider_npi', '')
            )
    
    def _add_medication_relationships(self):
        """Add patient-medication edges"""
        response = self.patient_medications.scan()
        for item in response['Items']:
            self.graph.add_edge(
                item['patient_id'],
                f"MED_{item['medication_id']}",
                type='PRESCRIBED',
                date=item.get('date', ''),
                frequency=item.get('frequency', 'Unknown'),
                medication_name=item.get('medication_name', '')
            )
    
    def find_patients_with_diagnosis(self, diagnosis_code: str) -> List[str]:
        """Find all patients with a specific diagnosis"""
        diag_node = f"DIAG_{diagnosis_code}"
        if diag_node not in self.graph:
            return []
        return list(self.graph.predecessors(diag_node))
    
    def find_patient_diagnoses(self, patient_id: str) -> List[Dict]:
        """Get all diagnoses for a patient"""
        if patient_id not in self.graph:
            return []
        
        diagnoses = []
        for successor in self.graph.successors(patient_id):
            if self.graph.nodes[successor]['type'] == 'Diagnosis':
                edge_data = self.graph.get_edge_data(patient_id, successor)
                diagnoses.append({
                    'code': self.graph.nodes[successor]['code'],
                    'name': self.graph.nodes[successor]['name'],
                    'category': self.graph.nodes[successor]['category'],
                    'date': list(edge_data.values())[0].get('date', ''),
                    'severity': list(edge_data.values())[0].get('severity', '')
                })
        return diagnoses
    
    def find_patient_medications(self, patient_id: str) -> List[Dict]:
        """Get all medications for a patient"""
        if patient_id not in self.graph:
            return []
        
        medications = []
        for successor in self.graph.successors(patient_id):
            if self.graph.nodes[successor]['type'] == 'Medication':
                edge_data = self.graph.get_edge_data(patient_id, successor)
                medications.append({
                    'name': self.graph.nodes[successor]['name'],
                    'class': self.graph.nodes[successor]['drug_class'],
                    'form': self.graph.nodes[successor]['form'],
                    'date': list(edge_data.values())[0].get('date', ''),
                    'frequency': list(edge_data.values())[0].get('frequency', '')
                })
        return medications
    
    def find_common_comorbidities(self, diagnosis_code: str, limit: int = 5) -> List[Dict]:
        """Find diagnoses commonly co-occurring with a given diagnosis"""
        patients = self.find_patients_with_diagnosis(diagnosis_code)
        if not patients:
            return []
        
        # Count other diagnoses among these patients
        comorbidity_counts = {}
        for patient in patients:
            for diag in self.find_patient_diagnoses(patient):
                if diag['code'] != diagnosis_code:
                    key = diag['code']
                    if key not in comorbidity_counts:
                        comorbidity_counts[key] = {
                            'code': diag['code'],
                            'name': diag['name'],
                            'count': 0
                        }
                    comorbidity_counts[key]['count'] += 1
        
        # Sort by count
        sorted_comorbidities = sorted(
            comorbidity_counts.values(),
            key=lambda x: x['count'],
            reverse=True
        )
        return sorted_comorbidities[:limit]
    
    def find_medication_patterns(self, limit: int = 10) -> List[Dict]:
        """Find common medication combinations"""
        # Count medications per patient
        med_combinations = {}
        for node in self.graph.nodes():
            if self.graph.nodes[node]['type'] == 'Patient':
                meds = [m['name'] for m in self.find_patient_medications(node)]
                if len(meds) > 1:
                    # Sort to make combinations consistent
                    med_combo = tuple(sorted(meds))
                    med_combinations[med_combo] = med_combinations.get(med_combo, 0) + 1
        
        # Sort by frequency
        sorted_combos = sorted(
            med_combinations.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return [
            {'medications': list(combo), 'count': count}
            for combo, count in sorted_combos[:limit]
        ]
    
    def find_shortest_path(self, start_node: str, end_node: str) -> List[str]:
        """Find shortest path between two nodes"""
        try:
            return nx.shortest_path(self.graph, start_node, end_node)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []
    
    def get_node_neighbors(self, node_id: str, depth: int = 1) -> Dict:
        """Get all neighbors within specified depth"""
        if node_id not in self.graph:
            return {}
        
        neighbors = {'nodes': [], 'edges': []}
        visited = set()
        queue = [(node_id, 0)]
        
        while queue:
            current, current_depth = queue.pop(0)
            if current in visited or current_depth > depth:
                continue
            
            visited.add(current)
            node_data = dict(self.graph.nodes[current])
            node_data['id'] = current
            neighbors['nodes'].append(node_data)
            
            if current_depth < depth:
                for successor in self.graph.successors(current):
                    if successor not in visited:
                        queue.append((successor, current_depth + 1))
                        # Add edge info
                        edge_data = self.graph.get_edge_data(current, successor)
                        neighbors['edges'].append({
                            'source': current,
                            'target': successor,
                            'data': list(edge_data.values())[0] if edge_data else {}
                        })
        
        return neighbors
    
    def get_graph_stats(self) -> Dict:
        """Get graph statistics"""
        patient_nodes = [n for n, d in self.graph.nodes(data=True) if d['type'] == 'Patient']
        diagnosis_nodes = [n for n, d in self.graph.nodes(data=True) if d['type'] == 'Diagnosis']
        medication_nodes = [n for n, d in self.graph.nodes(data=True) if d['type'] == 'Medication']
        provider_nodes = [n for n, d in self.graph.nodes(data=True) if d['type'] == 'Provider']
        
        return {
            'total_nodes': self.graph.number_of_nodes(),
            'total_edges': self.graph.number_of_edges(),
            'patients': len(patient_nodes),
            'diagnoses': len(diagnosis_nodes),
            'medications': len(medication_nodes),
            'providers': len(provider_nodes),
            'density': nx.density(self.graph),
            'is_connected': nx.is_weakly_connected(self.graph)
        }
    
    def export_for_visualization(self) -> Dict:
        """Export graph in format suitable for D3.js visualization"""
        nodes = []
        links = []
        
        for node_id, node_data in self.graph.nodes(data=True):
            nodes.append({
                'id': node_id,
                **node_data
            })
        
        for source, target, edge_data in self.graph.edges(data=True):
            links.append({
                'source': source,
                'target': target,
                **edge_data
            })
        
        return {'nodes': nodes, 'links': links}

# Singleton instance
_graph_instance = None

def get_knowledge_graph(aws_region='us-east-1', table_prefix='healthcare'):
    """Get or create knowledge graph instance"""
    global _graph_instance
    if _graph_instance is None:
        _graph_instance = HealthcareKnowledgeGraph(aws_region, table_prefix)
        _graph_instance.build_graph()
    return _graph_instance
EOFPYTHON

print_status "Created healthcare_knowledge_graph.py"

# Step 2: Create Test Script
echo ""
echo -e "${BLUE}Step 2: Creating Test Script${NC}"

cat > test_knowledge_graph.py <<'EOFTEST'
#!/usr/bin/env python3
"""Test the knowledge graph functionality"""

from healthcare_knowledge_graph import get_knowledge_graph
import json

print("="*60)
print("Healthcare Knowledge Graph Test")
print("="*60)

# Initialize graph
print("\nInitializing knowledge graph...")
kg = get_knowledge_graph()

# Get stats
print("\nGraph Statistics:")
stats = kg.get_graph_stats()
for key, value in stats.items():
    print(f"  {key}: {value}")

# Test queries
print("\nTest Queries:")
print("-" * 60)

# Find patients with diabetes (example diagnosis code)
print("\n1. Patients with specific diagnosis:")
patients = kg.find_patients_with_diagnosis('E11.9')
print(f"   Found {len(patients)} patients")
if patients:
    print(f"   Example: {patients[0]}")

# Find patient details
if patients:
    patient_id = patients[0]
    print(f"\n2. Diagnoses for patient {patient_id}:")
    diagnoses = kg.find_patient_diagnoses(patient_id)
    for diag in diagnoses[:3]:
        print(f"   - {diag['name']} ({diag['code']})")
    
    print(f"\n3. Medications for patient {patient_id}:")
    meds = kg.find_patient_medications(patient_id)
    for med in meds[:3]:
        print(f"   - {med['name']} ({med['frequency']})")

# Find comorbidities
print("\n4. Common comorbidities:")
comorbidities = kg.find_common_comorbidities('E11.9', limit=3)
for combo in comorbidities:
    print(f"   - {combo['name']}: {combo['count']} patients")

# Medication patterns
print("\n5. Common medication patterns:")
patterns = kg.find_medication_patterns(limit=3)
for pattern in patterns:
    print(f"   - {', '.join(pattern['medications'])}: {pattern['count']} patients")

print("\n" + "="*60)
print("✓ Knowledge graph test completed!")
print("="*60)
EOFTEST

chmod +x test_knowledge_graph.py
print_status "Created test_knowledge_graph.py"

# Step 3: Install Dependencies
echo ""
echo -e "${BLUE}Step 3: Installing Dependencies${NC}"

pip3 install networkx boto3 --quiet 2>/dev/null || pip install networkx boto3 --quiet
print_status "Installed networkx and boto3"

# Step 4: Run Test
echo ""
echo -e "${BLUE}Step 4: Testing Knowledge Graph${NC}"

python3 test_knowledge_graph.py

# Step 5: Save Configuration
echo ""
echo -e "${BLUE}Step 5: Saving Configuration${NC}"

cat > knowledge-graph-info.txt <<EOF
Healthcare Knowledge Graph (NetworkX)
======================================

Type: In-Memory Graph Database
Library: NetworkX (Python)
Storage: DynamoDB (data source)

Files Created:
--------------
- healthcare_knowledge_graph.py : Main graph library
- test_knowledge_graph.py       : Test script
- knowledge-graph-info.txt      : This file

Python Usage:
-------------
from healthcare_knowledge_graph import get_knowledge_graph

# Initialize (automatically builds from DynamoDB)
kg = get_knowledge_graph()

# Get statistics
stats = kg.get_graph_stats()
print(f"Nodes: {stats['total_nodes']}, Edges: {stats['total_edges']}")

# Find patients with specific diagnosis
patients = kg.find_patients_with_diagnosis('E11.9')  # Diabetes

# Get patient's diagnoses and medications
diagnoses = kg.find_patient_diagnoses('P001')
medications = kg.find_patient_medications('P001')

# Find comorbidities
comorbidities = kg.find_common_comorbidities('E11.9', limit=5)

# Find medication patterns
patterns = kg.find_medication_patterns(limit=10)

# Find shortest path between nodes
path = kg.find_shortest_path('P001', 'DIAG_E11.9')

# Get neighbors (relationship exploration)
neighbors = kg.get_node_neighbors('P001', depth=2)

# Export for visualization
viz_data = kg.export_for_visualization()

Query Examples:
---------------
1. All patients with diabetes:
   kg.find_patients_with_diagnosis('E11.9')

2. Patient's complete medical profile:
   diagnoses = kg.find_patient_diagnoses('P001')
   medications = kg.find_patient_medications('P001')

3. Common disease combinations:
   kg.find_common_comorbidities('E11.9')

4. Medication co-prescriptions:
   kg.find_medication_patterns()

5. Relationship exploration:
   kg.get_node_neighbors('P001', depth=2)

Integration with Flask:
----------------------
Add to your Flask app (e.g., 4-deploy-integration.sh):

```python
from healthcare_knowledge_graph import get_knowledge_graph

# On app startup
app = Flask(__name__)
kg = get_knowledge_graph()

@app.route('/graph-query', methods=['POST'])
def graph_query():
    data = request.json
    query_type = data.get('query_type')
    
    if query_type == 'patient_profile':
        patient_id = data.get('patient_id')
        return jsonify({
            'diagnoses': kg.find_patient_diagnoses(patient_id),
            'medications': kg.find_patient_medications(patient_id)
        })
    
    elif query_type == 'comorbidities':
        diagnosis_code = data.get('diagnosis_code')
        return jsonify(kg.find_common_comorbidities(diagnosis_code))
    
    elif query_type == 'neighbors':
        node_id = data.get('node_id')
        depth = data.get('depth', 1)
        return jsonify(kg.get_node_neighbors(node_id, depth))
```

Cost & Performance:
-------------------
- Cost: FREE (no additional AWS services)
- Speed: Very fast (in-memory operations)
- Scalability: Good for <100k nodes
- Persistence: Rebuild from DynamoDB on restart

Advantages:
-----------
✅ No additional AWS infrastructure
✅ No monthly costs
✅ Fast in-memory queries
✅ Easy to integrate with Python
✅ No VPC/security group complexity
✅ NetworkX is a mature, well-documented library

Limitations:
------------
- Graph is rebuilt on each app restart (~few seconds)
- Limited by available RAM
- Single-server (not distributed)
- No automatic persistence (uses DynamoDB as source of truth)

For production with larger datasets or persistence requirements, 
consider migrating to Neo4j or Amazon Neptune in the future.
EOF

print_status "Saved knowledge-graph-info.txt"

# Summary
echo ""
echo "================================================================"
echo -e "${GREEN}✓ Knowledge Graph Setup Complete!${NC}"
echo "================================================================"
echo ""
echo "Created Files:"
echo "  • healthcare_knowledge_graph.py  - Graph library"
echo "  • test_knowledge_graph.py        - Test script"
echo "  • knowledge-graph-info.txt       - Usage guide"
echo ""
echo "Graph Statistics:"
python3 -c "
from healthcare_knowledge_graph import get_knowledge_graph
import json
kg = get_knowledge_graph()
stats = kg.get_graph_stats()
print(f\"  Nodes: {stats['total_nodes']}\")
print(f\"  Edges: {stats['total_edges']}\")
print(f\"  Patients: {stats['patients']}\")
print(f\"  Diagnoses: {stats['diagnoses']}\")
print(f\"  Medications: {stats['medications']}\")
" 2>/dev/null || echo "  (Run test_knowledge_graph.py to see statistics)"
echo ""
echo "Next Steps:"
echo "  1. Integrate into Flask app (4-deploy-integration.sh)"
echo "  2. Add graph query endpoints"
echo "  3. Update web UI with graph visualization"
echo ""
echo "Usage:"
echo "  python3 test_knowledge_graph.py"
echo "  python3 -c 'from healthcare_knowledge_graph import get_knowledge_graph; kg = get_knowledge_graph()'"
echo ""
echo "Cost: FREE (no additional AWS services)"
echo ""
echo "================================================================"
Amazon Neptune Knowledge Graph
===============================
Created: $(date)

Connection Details:
===================
Cluster ID:       ${NEPTUNE_CLUSTER_ID}
Writer Endpoint:  ${NEPTUNE_ENDPOINT}:8182
Reader Endpoint:  ${NEPTUNE_READER_ENDPOINT}:8182
Instance Class:   ${NEPTUNE_INSTANCE_CLASS}
Region:           ${AWS_REGION}

Gremlin Endpoint:
=================
wss://${NEPTUNE_ENDPOINT}:8182/gremlin

Graph Structure:
================
Vertices (Nodes):
  - Patient: patient_id, age, gender
  - Diagnosis: diagnosis_code, name, category
  - Medication: medication_id, name, class, form
  - Provider: npi, name, specialty

Edges (Relationships):
  - DIAGNOSED_WITH: Patient → Diagnosis (date, severity)
  - PRESCRIBED: Patient → Medication (date, frequency)

Sample Gremlin Queries:
=======================

# Count all patients
g.V().hasLabel('Patient').count()

# Find patients with diabetes
g.V().hasLabel('Diagnosis').has('name', containing('Diabetes'))
  .in('DIAGNOSED_WITH').values('patient_id')

# Find common medication combinations
g.V().hasLabel('Patient')
  .outE('PRESCRIBED').inV()
  .groupCount().by('name').order(local).by(values, desc).limit(local, 5)

# Find patients with multiple conditions
g.V().hasLabel('Patient')
  .where(outE('DIAGNOSED_WITH').count().is(gt(1)))
  .project('patient', 'diagnosis_count')
    .by('patient_id')
    .by(outE('DIAGNOSED_WITH').count())

# Path query: Patient → Diagnosis → Other Patients with same diagnosis
g.V().has('Patient', 'patient_id', 'PAT001')
  .out('DIAGNOSED_WITH')
  .in('DIAGNOSED_WITH')
  .path()

Testing from EKS Pod:
=====================

# Create a test pod
kubectl run -it neptune-test --image=python:3.13 --rm --restart=Never -- bash

# Inside the pod
pip install gremlinpython
python3

from gremlin_python.driver import client
endpoint = '${NEPTUNE_ENDPOINT}'
neptune_client = client.Client(f'wss://{endpoint}:8182/gremlin', 'g')
result = neptune_client.submit('g.V().count()').all().result()
print(f"Total vertices: {result[0]}")

Access from Integration App:
=============================
The integration app will automatically use Neptune for:
- Complex relationship queries
- Path finding between entities
- Pattern matching
- Graph analytics

Environment variables needed:
export NEPTUNE_ENDPOINT=${NEPTUNE_ENDPOINT}
export NEPTUNE_PORT=8182

Cost Information:
=================
Instance: ${NEPTUNE_INSTANCE_CLASS}
Estimated cost: ~\$0.096/hour (~\$2.30/day)
Storage: \$0.10/GB-month
I/O: \$0.20 per million requests

Total monthly estimate: ~\$70-75 for small dataset

Backup and Maintenance:
=======================
# Create manual snapshot
aws neptune create-db-cluster-snapshot \\
  --db-cluster-identifier ${NEPTUNE_CLUSTER_ID} \\
  --db-cluster-snapshot-identifier ${NEPTUNE_CLUSTER_ID}-snapshot-\$(date +%Y%m%d) \\
  --region ${AWS_REGION}

# Re-sync data from DynamoDB
python3 sync-dynamodb-to-neptune.py

Cleanup:
========
# Delete instance
aws neptune delete-db-instance \\
  --db-instance-identifier ${NEPTUNE_CLUSTER_ID}-instance-1 \\
  --region ${AWS_REGION}

# Delete cluster (after instance is deleted)
aws neptune delete-db-cluster \\
  --db-cluster-identifier ${NEPTUNE_CLUSTER_ID} \\
  --skip-final-snapshot \\
  --region ${AWS_REGION}

# Delete subnet group
aws neptune delete-db-subnet-group \\
  --db-subnet-group-name neptune-healthcare-subnet-group \\
  --region ${AWS_REGION}

# Delete security group
aws ec2 delete-security-group \\
  --group-id ${NEPTUNE_SG_ID} \\
  --region ${AWS_REGION}
EOF

print_status "Configuration saved to neptune-info.txt"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Neptune Knowledge Graph Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Writer Endpoint: ${NEPTUNE_ENDPOINT}:8182"
echo "Reader Endpoint: ${NEPTUNE_READER_ENDPOINT}:8182"
echo ""
echo "Your healthcare data has been transformed into a knowledge graph!"
echo "Use Gremlin queries to explore relationships and patterns."
echo ""
echo "See neptune-info.txt for queries and examples."
echo ""
