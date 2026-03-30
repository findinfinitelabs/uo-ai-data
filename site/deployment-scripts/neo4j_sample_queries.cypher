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
MATCH (p:Patient {patient_id: 'ANON001'})
OPTIONAL MATCH (p)-[d:DIAGNOSED_WITH]->(diag:Diagnosis)
OPTIONAL MATCH (p)-[m:PRESCRIBED]->(med:Medication)
RETURN p, collect(DISTINCT diag) as diagnoses, collect(DISTINCT med) as medications;

// 6. Patients with multiple conditions (comorbidities)
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis)
WITH p, count(d) as diagnosis_count
WHERE diagnosis_count >= 2
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
WHERE co_occurrence >= 1
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
RETURN m.name, m.drug_class, count(p) as prescription_count
ORDER BY prescription_count DESC
LIMIT 10;

// 11. Medications for specific diagnosis
MATCH (p:Patient)-[:DIAGNOSED_WITH]->(d:Diagnosis {code: 'E11.9'})
MATCH (p)-[:PRESCRIBED]->(m:Medication)
RETURN m.name, count(p) as patient_count
ORDER BY patient_count DESC
LIMIT 10;

// 12. Polypharmacy patients (2+ medications)
MATCH (p:Patient)-[:PRESCRIBED]->(m:Medication)
WITH p, count(m) as med_count
WHERE med_count >= 2
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
MATCH (p1:Patient {patient_id: 'ANON001'})-[:DIAGNOSED_WITH]->(d:Diagnosis)<-[:DIAGNOSED_WITH]-(p2:Patient)
WHERE p1 <> p2
WITH p2, collect(d.name) as shared_diagnoses, count(d) as similarity
ORDER BY similarity DESC
LIMIT 10
RETURN p2.patient_id, p2.age, p2.gender, similarity, shared_diagnoses;

// =================================================
// DATA QUALITY CHECKS
// =================================================

// 15. Patients without diagnoses
MATCH (p:Patient)
WHERE NOT (p)-[:DIAGNOSED_WITH]->()
RETURN p.patient_id, p.age, p.gender;

// 16. Patients without medications
MATCH (p:Patient)
WHERE NOT (p)-[:PRESCRIBED]->()
RETURN p.patient_id, p.age, p.gender;

// 17. Orphan diagnoses (not linked to any patient)
MATCH (d:Diagnosis)
WHERE NOT ()-[:DIAGNOSED_WITH]->(d)
RETURN d.code, d.name;

// =================================================
// EXPORT QUERIES
// =================================================

// 18. Export patient summary
MATCH (p:Patient)
OPTIONAL MATCH (p)-[:DIAGNOSED_WITH]->(d:Diagnosis)
OPTIONAL MATCH (p)-[:PRESCRIBED]->(m:Medication)
RETURN p.patient_id,
       p.age,
       p.gender,
       collect(DISTINCT d.code) as diagnosis_codes,
       collect(DISTINCT m.name) as medications
LIMIT 100;

// 19. Graph statistics
MATCH (p:Patient) WITH count(p) as patients
MATCH (d:Diagnosis) WITH patients, count(d) as diagnoses
MATCH (m:Medication) WITH patients, diagnoses, count(m) as medications
MATCH ()-[r:DIAGNOSED_WITH]->() WITH patients, diagnoses, medications, count(r) as diag_rels
MATCH ()-[r:PRESCRIBED]->() WITH patients, diagnoses, medications, diag_rels, count(r) as med_rels
RETURN patients, diagnoses, medications, diag_rels, med_rels;
