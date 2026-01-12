export const modules = [
  {
    id: 'module-1',
    title: 'Module 1: Data Specifications',
    summary:
      'Define fields, schemas, and quality rules so prompts, RAG docs, and fine-tune sets stay consistent.',
    href: './module-1-specifications/README.md',
    children: [
      {
        label: 'AI Basics',
        href: './module-1-specifications/README.md#ai-quick-primer-why-this-matters-here',
      },
      {
        label: 'Starter Models',
        href: './module-1-specifications/README.md#starter-models-to-experiment-with-downloadable',
      },
      { label: 'Examples', href: './module-1-specifications/examples/' },
    ],
  },
  {
    id: 'module-2',
    title: 'Module 2: Regulations & Compliance',
    summary:
      'HIPAA/GDPR basics, de-identification, and safe handling of synthetic healthcare data.',
    href: './module-2-regulations/README.md',
    children: [
      {
        label: 'HIPAA Checklist',
        href: './module-2-regulations/compliance-templates/hipaa-compliance-checklist.md',
      },
      {
        label: 'De-identification',
        href: './module-2-regulations/compliance-templates/deidentification-protocol.md',
      },
      {
        label: 'Data Handling Policy',
        href: './module-2-regulations/compliance-templates/data-handling-policy.md',
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Module 3: Ethical AI',
    summary: 'Fairness, transparency, and accountability practices for healthcare AI systems.',
    href: './module-3-ethical-ai/README.md',
    children: [
      {
        label: 'Ethical Framework',
        href: './module-3-ethical-ai/ethics-frameworks/ethical-ai-framework.md',
      },
      {
        label: 'Bias Assessment',
        href: './module-3-ethical-ai/ethics-frameworks/bias-assessment-checklist.md',
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Module 4: Synthetic Data',
    summary:
      'Generate and validate synthetic health and dental datasets for privacy-preserving experimentation.',
    href: './module-4-synthetic-data/README.md',
    children: [
      { label: 'Generators', href: './module-4-synthetic-data/generators/README.md' },
      { label: 'Patient Data', href: './module-4-synthetic-data/datasets/patient-health/' },
      { label: 'Dental Records', href: './module-4-synthetic-data/datasets/dental-records/' },
    ],
  },
];
