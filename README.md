# UO AI Data Class

[![Build](https://github.com/findinfinitelabs/uo-ai-data/actions/workflows/ci.yml/badge.svg)](https://github.com/findinfinitelabs/uo-ai-data/actions/workflows/ci.yml)
[![Lint](https://img.shields.io/badge/lint-ESLint%20%7C%20Prettier%20%7C%20markdownlint-blue)](https://github.com/findinfinitelabs/uo-ai-data/actions/workflows/ci.yml)
[![Security](https://img.shields.io/badge/security-npm%20audit%20%7C%20dependency--review-green)](https://github.com/findinfinitelabs/uo-ai-data/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/python-3.11-blue)](https://python.org/)

## Data Creation and Management for AI Training

Welcome to the AI Data Class repository! This educational resource is designed to teach students how to create, manage, and utilize data for training artificial intelligence systems, with a focus on healthcare applications.

## Course Overview

This course provides a comprehensive, hands-on approach to understanding data in AI/ML contexts. Students will progress through four modules that build upon each other, starting from foundational concepts and advancing to practical synthetic data generation.

### Learning Objectives

- Understand data requirements and specifications for AI projects
- Learn healthcare data regulations and compliance (HIPAA, GDPR)
- Apply ethical AI principles to data collection and model development
- Create synthetic datasets for AI training
- Implement privacy-preserving techniques for sensitive data

### Target Audience

- Students learning AI/ML and data science
- Healthcare informatics students
- Data professionals entering healthcare AI
- Researchers working with sensitive data

## Course Structure

The course is organized into four progressive modules:

### 📋 [Module 1: Data Specifications](module-1-specifications/)

**Focus**: Defining data requirements and quality standards

Learn to:

- Create data requirement documents
- Design data schemas for healthcare applications
- Establish data quality validation rules
- Document data dictionaries and lineage

**Key Deliverables**:

- Data requirements document template
- JSON schema definitions for health and dental records
- Data dictionary template
- Quality validation rules

---

### ⚖️ [Module 2: Regulations and Compliance](module-2-regulations/)

**Focus**: Healthcare data privacy and regulatory compliance

Learn to:

- Understand HIPAA, GDPR, and healthcare privacy laws
- Implement de-identification protocols
- Create data handling policies
- Conduct privacy risk assessments

**Key Deliverables**:

- HIPAA compliance checklist
- De-identification protocol (Safe Harbor method)
- Data handling policy template
- Privacy risk assessment tools

---

### 🤝 [Module 3: Ethical AI](module-3-ethical-ai/)

**Focus**: Fairness, accountability, and transparency in AI

Learn to:

- Apply core ethical principles (beneficence, non-maleficence, autonomy, justice)
- Identify and mitigate bias in datasets and models
- Implement transparency and explainability
- Respect patient rights in AI systems

**Key Deliverables**:

- Ethical AI framework document
- Bias assessment checklist
- Fairness evaluation tools
- Patient rights statement for AI

---

### 🔬 [Module 4: Synthetic Data Creation](module-4-synthetic-data/)

**Focus**: Generating privacy-preserving synthetic datasets

Learn to:

- Understand synthetic data benefits and limitations
- Generate realistic health and dental records
- Validate synthetic data quality
- Maintain statistical properties while ensuring privacy

**Key Deliverables**:

- Synthetic patient health dataset (100+ records)
- Synthetic dental examination dataset (100+ records)
- Python data generation scripts
- Data validation tools

---

## Getting Started

### Prerequisites

- Basic understanding of data structures (JSON, CSV)
- Python 3.7+ (for Module 4 synthetic data generation)
- Text editor or IDE
- Git (for cloning this repository)

### Quick Start

1. **Clone this repository**:

   ```bash
   git clone https://github.com/findinfinitelabs/uo-ai-data.git
   cd uo-ai-data
   ```

2. **Explore the modules in order**:
   - Start with Module 1 to understand data specifications
   - Progress through Module 2 for compliance knowledge
   - Learn ethical considerations in Module 3
   - Create synthetic data in Module 4

3. **Generate synthetic data** (Module 4):

   ```bash
   cd module-4-synthetic-data
   python generators/generate_patient_data.py
   python generators/generate_dental_data.py
   ```

## Repository Structure

```txt
uo-ai-data/
├── README.md                          # This file
│
├── module-1-specifications/           # Data requirements and schemas
│   ├── README.md
│   └── examples/
│       ├── data-requirements-template.md
│       ├── patient-health-schema.json
│       ├── dental-record-schema.json
│       └── data-dictionary-template.md
│
├── module-2-regulations/              # Compliance and privacy
│   ├── README.md
│   └── compliance-templates/
│       ├── hipaa-compliance-checklist.md
│       ├── deidentification-protocol.md
│       └── data-handling-policy.md
│
├── module-3-ethical-ai/               # Ethics and fairness
│   ├── README.md
│   └── ethics-frameworks/
│       ├── ethical-ai-framework.md
│       └── bias-assessment-checklist.md
│
└── module-4-synthetic-data/           # Synthetic data generation
    ├── README.md
    ├── generators/
    │   ├── README.md
    │   ├── generate_patient_data.py
    │   └── generate_dental_data.py
    ├── datasets/
    │   ├── patient-health/
    │   ├── dental-records/
    │   └── combined/
    └── validation/
```

## Use Cases

### Educational Applications

- Teaching healthcare data standards (HL7, FHIR, ICD-10, CDT)
- Demonstrating AI/ML model training workflows
- Practicing data quality assessment
- Learning privacy-preserving techniques

### Research Applications

- Developing and testing data pipelines
- Prototyping AI models before accessing real data
- Benchmarking algorithms on standardized datasets
- Demonstrating compliance with IRB requirements

### Industry Applications

- Training staff on data privacy and security
- Developing data governance frameworks
- Testing healthcare IT systems
- Creating data quality monitoring tools

## Key Features

✅ **Progressive Learning**: Modules build on each other logically  
✅ **Practical Focus**: Templates, checklists, and working code  
✅ **Privacy-First**: All synthetic data, no real patient information  
✅ **Standards-Based**: Uses ICD-10, CDT, HIPAA standards  
✅ **Customizable**: Easy to modify for specific learning objectives  
✅ **Open Source**: Free to use and adapt for educational purposes

## Learning Path

**Recommended sequence for students**:

1. **Week 1**: Module 1 - Data Specifications
   - Study data requirements template
   - Review schema definitions
   - Create a data dictionary for a sample project

2. **Week 2**: Module 2 - Regulations
   - Review HIPAA compliance checklist
   - Practice de-identification protocol
   - Develop a data handling policy

3. **Week 3**: Module 3 - Ethical AI
   - Study ethical framework
   - Complete bias assessment exercises
   - Analyze fairness in sample datasets

4. **Week 4**: Module 4 - Synthetic Data
   - Generate synthetic datasets
   - Validate data quality
   - Train a simple AI model
   - Evaluate for bias and fairness

## Data Privacy and Ethics

### Important Notes

- **All data in this repository is synthetic and fictional**
- No real patient data is included or should be used
- Data is designed for educational purposes only
- Complies with HIPAA de-identification standards
- Safe to share without privacy concerns

### Responsible Use

Students and educators should:

- ✅ Use for learning and teaching
- ✅ Experiment with data processing techniques
- ✅ Share knowledge and insights
- ✅ Practice privacy-preserving methods
- ❌ NOT use for clinical decisions
- ❌ NOT represent as real patient data
- ❌ NOT use in production medical systems

## Contributing

This is an educational resource. Contributions that improve learning outcomes are welcome:

- Additional templates or examples
- Improved documentation
- Additional synthetic data generators
- Corrections or clarifications

## Resources

### Healthcare Data Standards

- [ICD-10 Codes](https://www.icd10data.com/)
- [CDT Dental Codes](https://www.ada.org/en/publications/cdt)
- [HL7 FHIR](https://www.hl7.org/fhir/)

### Regulations and Compliance

- [HIPAA Privacy Rule](https://www.hhs.gov/hipaa/for-professionals/privacy/index.html)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [GDPR Overview](https://gdpr.eu/)

### AI Ethics

- [WHO Ethics and Governance of AI for Health](https://www.who.int/publications/i/item/9789240029200)
- [IEEE Ethically Aligned Design](https://ethicsinaction.ieee.org/)
- [EU AI Ethics Guidelines](https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai)

### Synthetic Data

- [Synthetic Data Vault](https://sdv.dev/)
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework)

## License

This educational resource is provided for learning purposes. Please check the repository license file for specific terms.

## Support and Questions

For questions about using this educational resource:

1. Review the module README files
2. Check the provided templates and examples
3. Consult the resources section above

## Acknowledgments

This course structure draws from established best practices in:

- Healthcare data management
- AI/ML model development
- Data privacy and security
- Ethical AI frameworks

---

**Version**: 1.0  
**Last Updated**: December 2025  
**Maintained by**: FindInfinite Labs

*All data in this repository is synthetic and for educational purposes only.*
