# Claude Skills for Healthcare AI Training

This directory contains Claude AI skills that provide specialized knowledge and best practices for the UO AI Data training repository.

## Available Skills

### 1. [Inline CSS](no-inline-css/SKILLS.md)
**Purpose:** React/JSX styling guidelines for the react-guide application

**Topics:**
- When to use inline styles vs CSS files
- Mantine component styling best practices
- Dynamic styling patterns

**Use when:** Working on the React frontend application

---

### 2. [Synthetic Data Generation](synthetic-data-generation/SKILLS.md)
**Purpose:** Creating realistic synthetic healthcare datasets

**Topics:**
- Data realism and privacy preservation principles
- Medical code standards (ICD-10, CDT, LOINC)
- Validation requirements and quality checks
- Output formats (JSON, CSV)
- Common generation patterns (dates, weighted selection, correlations)

**Use when:** Generating synthetic patient records, dental data, or other healthcare datasets

---

### 3. [AWS Deployment](aws-deployment/SKILLS.md)
**Purpose:** Deploying healthcare AI infrastructure on AWS Innovation Studio

**Topics:**
- SSO/federated account authentication
- EKS cluster deployment with GPU nodes
- AWS Bedrock integration
- DynamoDB setup and configuration
- Cost estimation and optimization
- Monitoring and troubleshooting

**Use when:** Deploying to AWS, setting up cloud infrastructure, or managing AWS resources

---

### 4. [HIPAA Compliance](hipaa-compliance/SKILLS.md)
**Purpose:** Healthcare data privacy and de-identification

**Topics:**
- Protected Health Information (PHI) definition
- Safe Harbor method (18 HIPAA identifiers)
- De-identification implementation
- Synthetic data privacy practices
- HIPAA compliance checklist
- Testing and validation

**Use when:** Working with healthcare data, implementing privacy controls, or teaching data protection

---

### 5. [LLM Fine-Tuning](llm-fine-tuning/SKILLS.md)
**Purpose:** Fine-tuning language models for healthcare applications

**Topics:**
- Model selection (StableLM, Mistral, Llama)
- LoRA and QLoRA configuration
- Training data preparation
- Hyperparameter optimization
- Monitoring and evaluation
- Export and deployment
- Troubleshooting common issues

**Use when:** Training custom models, optimizing LLMs, or implementing parameter-efficient fine-tuning

---

### 6. [Data Validation](data-validation/SKILLS.md)
**Purpose:** Quality assurance for synthetic healthcare datasets

**Topics:**
- Schema validation
- Statistical validation (ranges, distributions, outliers)
- Consistency validation (internal logic, temporal order)
- Quality validation (completeness, duplicates)
- Validation report generation
- Automated validation pipelines

**Use when:** Validating generated datasets, ensuring data quality, or creating validation scripts

---

### 7. [Neo4j Deployment](neo4j-deployment/SKILLS.md)
**Purpose:** Deploy Neo4j graph database as a cost-effective Neptune alternative

**Topics:**
- Neo4j vs Neptune cost comparison
- EKS deployment with persistent storage
- Healthcare knowledge graph schema
- Cypher query language
- DynamoDB to Neo4j data loading
- Python integration and LLM RAG patterns

**Use when:** Deploying graph databases, querying healthcare relationships, or building knowledge graphs

---

## How Skills Work

Claude AI uses these skill files to understand:

1. **Best practices** for this specific project
2. **Domain-specific knowledge** (healthcare, AWS, etc.)
3. **Code patterns** and conventions to follow
4. **Common pitfalls** to avoid
5. **Quick reference** commands and examples

## Skill Structure

Each skill follows this format:

```markdown
# Skill Name

## Overview
Brief description of skill purpose

## Core Concepts
Key principles and guidelines

## Implementation
Code examples and patterns

## Best Practices
✅ Do / ❌ Don't recommendations

## Troubleshooting
Common issues and solutions

## Quick Reference
Commands and code snippets
```

## Using Skills

Skills are automatically loaded when working in this repository. Claude references them to:

- Generate code following project conventions
- Provide accurate healthcare AI guidance
- Write deployment scripts correctly
- Validate data using proper standards
- Implement HIPAA-compliant practices

## Contributing New Skills

To add a new skill:

1. Create directory: `.claude/skills/your-skill-name/`
2. Create file: `SKILLS.md` with comprehensive guidance
3. Update this README with skill description
4. Include code examples and best practices
5. Add troubleshooting section

### Skill Topic Ideas

Potential future skills to add:

- **Ethical AI Assessment** - Bias detection and fairness evaluation
- **Knowledge Graph Design** - Neptune/DynamoDB graph modeling
- **React Testing** - Testing strategies for the guide application
- **Clinical Terminology** - Medical vocabulary and coding systems
- **MLOps Practices** - Model versioning, monitoring, deployment
- **Security Hardening** - Additional AWS security configurations
- **Performance Optimization** - GPU utilization, batch processing
- **Data Pipeline Design** - ETL processes for healthcare data

## Skill Maintenance

- Review and update skills quarterly
- Add new examples as patterns emerge
- Remove deprecated practices
- Incorporate feedback from users
- Keep aligned with latest AWS/healthcare standards

---

**Last Updated:** February 16, 2026  
**Skills Count:** 7  
**Repository:** [github.com/findinfinitelabs/uo-ai-data](https://github.com/findinfinitelabs/uo-ai-data)
