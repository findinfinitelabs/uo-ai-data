# Module 1: Data Specifications

## Learning Objectives
- Understand the importance of data specifications in AI/ML projects
- Learn to define data requirements for healthcare datasets
- Create structured data schemas for health and dental records
- Establish data quality standards and validation rules

## Overview
This module introduces students to the foundational concepts of data specifications. Before collecting or creating data for AI training, it's crucial to define what data you need, how it should be structured, and what quality standards it must meet.

## AI quick primer (why this matters here)
- AI model = pattern-learning engine that predicts the next best token/answer based on what it has seen during training.
- Analogy: the model is a chef; your prompt is the ingredient list; the response is the dish. Better ingredients (data specs) make better meals.
- Modes we will use:
   - Inference: asking the chef to make a dish from the ingredients you provide right now.
   - Retrieval-Augmented Generation (RAG): giving the chef a mini-cookbook (retrieved docs) alongside the ingredients so answers stay grounded in your data.
   - Fine-tuning: teaching the chef new recipes with your own examples so it adapts to your style and domain.
- Why it fits Module 1: clear data specifications (fields, formats, quality rules) make prompts, RAG documents, and fine-tuning datasets consistent and safe.

## Starter models to experiment with (downloadable)
- Mistral 7B Instruct (permissive, strong general baseline; good with small LoRA fine-tunes).
- Phi-3 Mini 3.8B Instruct (very lightweight; runs on modest hardware; solid for structured Q&A).
- Llama 3 8B Instruct (good instruction following; widely supported in tooling and quantizations).
- BioMistral 7B (biomedical-tuned; better with clinical terminology; keep use synthetic/non-PHI).
- Meditron 7B (biomedical-tuned; stronger on clinical-style text; use 4–5 bit quantized builds for laptops).

## Topics Covered
1. **Data Requirements Analysis**
   - Identifying necessary data fields for health/dental AI applications
   - Understanding data types and their appropriate use cases
   
2. **Schema Definition**
   - Designing data schemas for patient health records
   - Defining relationships between different data entities
   
3. **Data Quality Standards**
   - Completeness, accuracy, consistency, and timeliness
   - Validation rules and constraints
   
4. **Documentation Standards**
   - Creating data dictionaries
   - Documenting data lineage and provenance

## Deliverables
- Data requirements document for a health/dental AI project
- Schema definition files (JSON/YAML)
- Data quality validation rules
- Data dictionary template

## Resources
See the `examples/` directory for sample specifications and templates.
