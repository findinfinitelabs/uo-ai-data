const REPO_BASE = 'https://github.com/findinfinitelabs/uo-ai-data/blob/main';

export const modules = [
  {
    id: 'module-1',
    title: 'Data Specifications',
    summary:
      'Define fields, schemas, and quality rules so prompts, RAG docs, and fine-tune sets stay consistent.',
    href: `${REPO_BASE}/module-1-specifications/README.md`,
    children: [
      {
        label: 'AI Basics',
        href: `${REPO_BASE}/module-1-specifications/README.md#ai-quick-primer-why-this-matters-here`,
      },
      {
        label: 'Starter Models',
        href: `${REPO_BASE}/module-1-specifications/README.md#starter-models-to-experiment-with-downloadable`,
      },
      { label: 'Examples', href: `${REPO_BASE}/module-1-specifications/examples` },
    ],
  },
  {
    id: 'module-2',
    title: 'AI Environment Setup',
    summary:
      'Set up your AI learning environment using AWS Bedrock (school login) or run models locally on your Mac.',
    href: `${REPO_BASE}/module-2-ai-setup/README.md`,
    children: [
      {
        label: 'AWS Bedrock Setup',
        href: `${REPO_BASE}/module-2-ai-setup/aws-bedrock/README.md`,
      },
      {
        label: 'Local Setup (Ollama)',
        href: `${REPO_BASE}/module-2-ai-setup/local-setup/README.md`,
      },
      {
        label: 'Quick Start Guide',
        href: `${REPO_BASE}/module-2-ai-setup/quickstart.md`,
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Regulations & Compliance',
    summary:
      'HIPAA/GDPR basics, de-identification, and safe handling of synthetic healthcare data.',
    href: `${REPO_BASE}/module-3-regulations/README.md`,
    children: [
      {
        label: 'HIPAA Checklist',
        href: `${REPO_BASE}/module-3-regulations/compliance-templates/hipaa-compliance-checklist.md`,
      },
      {
        label: 'De-identification',
        href: `${REPO_BASE}/module-3-regulations/compliance-templates/deidentification-protocol.md`,
      },
      {
        label: 'Data Handling Policy',
        href: `${REPO_BASE}/module-3-regulations/compliance-templates/data-handling-policy.md`,
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Ethical AI',
    summary: 'Fairness, transparency, and accountability practices for healthcare AI systems.',
    href: `${REPO_BASE}/module-4-ethical-ai/README.md`,
    children: [
      {
        label: 'Ethical Framework',
        href: `${REPO_BASE}/module-4-ethical-ai/ethics-frameworks/ethical-ai-framework.md`,
      },
      {
        label: 'Bias Assessment',
        href: `${REPO_BASE}/module-4-ethical-ai/ethics-frameworks/bias-assessment-checklist.md`,
      },
    ],
  },
  {
    id: 'module-5',
    title: 'Synthetic Data',
    summary:
      'Generate and validate synthetic health and dental datasets for privacy-preserving experimentation.',
    href: `${REPO_BASE}/module-5-synthetic-data/README.md`,
    children: [
      { label: 'Generators', href: `${REPO_BASE}/module-5-synthetic-data/generators/README.md` },
      { label: 'Patient Data', href: `${REPO_BASE}/module-5-synthetic-data/datasets/patient-health` },
      { label: 'Dental Records', href: `${REPO_BASE}/module-5-synthetic-data/datasets/dental-records` },
    ],
  },
  {
    id: 'case-study',
    title: 'Pape Machinery Case Study',
    summary:
      'Apply AI to identify lost sales opportunities for implements and tractors, and generate insights from synthetic dealership data.',
    href: `${REPO_BASE}/case-study-pape/README.md`,
    isCaseStudy: true,
    children: [
      { label: 'Problem Overview', href: `${REPO_BASE}/case-study-pape/problem-overview.md` },
      { label: 'Synthetic Sales Data', href: `${REPO_BASE}/case-study-pape/data` },
      { label: 'AI Insights', href: `${REPO_BASE}/case-study-pape/insights.md` },
    ],
  },
];
