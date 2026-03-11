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
            session.run("CREATE INDEX patient_id IF NOT EXISTS FOR (p:Patient) ON (p.patient_id)")
            session.run("CREATE INDEX diagnosis_code IF NOT EXISTS FOR (d:Diagnosis) ON (d.code)")
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
                # The original code passed `class_=...` as a Python
                # keyword argument, but the Cypher query referenced
                # `$class`. Python does not allow `class` as a keyword
                # argument name (reserved word), and the parameter name
                # mismatch would cause a Neo4j ParameterNotFoundException
                # at runtime. Fixed by passing params as a dict so the
                # key can be the string "drug_class" and the Cypher
                # placeholder updated to match.
                session.run("""
                    MERGE (m:Medication {medication_id: $med_id})
                    SET m.name = $name,
                        m.drug_class = $drug_class,
                        m.form = $form
                """, {
                    'med_id': item['medication_id'],
                    'name': item.get('name', ''),
                    'drug_class': item.get('class', 'General'),
                    'form': item.get('form', 'Tablet')
                })

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
        print("\nLoading healthcare data into Neo4j...")
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
        print("Data import complete!")

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

    uri = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
    username = os.getenv('NEO4J_USERNAME', 'neo4j')
    password = os.getenv('NEO4J_PASSWORD', 'healthcare2024')
    aws_region = os.getenv('AWS_REGION', 'us-west-2')
    table_prefix = os.getenv('TABLE_PREFIX', 'healthcare')

    print(f"Connecting to Neo4j at {uri}...")

    loader = HealthcareGraphLoader(uri, username, password, aws_region, table_prefix)

    try:
        loader.load_all()
    finally:
        loader.close()

    print("\nAccess Neo4j Browser to explore your graph!")
    print(f"   URL: {uri.replace('bolt://', 'http://').replace(':7687', ':7474')}")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
