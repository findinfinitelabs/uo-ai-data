import { useState } from 'react';
import NotesEditor from '../components/NotesEditor';

type PromptDef = { title: string; prompt: string };

const datasetPrompts: PromptDef[] = [
  {
    title: 'Identify the Datasets You Need',
    prompt:
      'Here are the feature scenarios for my product: [paste your feature scenarios]\n\nFor each scenario, identify what data must exist for the scenario to run. List every unique dataset needed across all scenarios. For each dataset:\n  - Dataset name\n  - What it represents (customers, vehicles, transactions, interactions, etc.)\n  - The key fields it must contain\n  - Which feature scenario(s) depend on it\n  - Estimated volume for a realistic pilot (e.g., 500 customers, 2,000 vehicle records)\n\nReturn the result as a table: Dataset Name | Description | Key Fields | Used In Scenario | Pilot Volume',
  },
  {
    title: 'Generate a Synthetic Dataset',
    prompt:
      'Generate a realistic synthetic dataset for: [dataset name and description from the previous step]\n\nThe dataset should have these fields: [list fields]\n\nGenerate 20 rows of realistic sample data. Use these constraints:\n  - Customer names should be diverse and fictional\n  - Vehicle VINs should follow the standard 17-character format\n  - Dates should fall within the last 24 months\n  - Financial values should be realistic for US automotive retail\n  - Any AI scores or recommendations should fall within a plausible range (0–100 or percentage)\n\nOutput the data as a CSV with a header row. After the data, list any assumptions you made about value ranges or formats.',
  },
  {
    title: 'Add Metadata to Each Record',
    prompt:
      'Here is my dataset: [paste dataset name and fields]\n\nHere are the regulatory findings for my product: [paste your regulation-to-field mapping from the Evaluate Regulations step]\n\nAdd a metadata block to each record in this dataset. Each record should include these additional fields:\n  - data_classification: one of Public | Internal | Confidential | Restricted\n  - contains_pii: true or false\n  - contains_phi: true or false\n  - contains_financial: true or false\n  - retention_days: number of days this record must be retained under applicable regulations\n  - encryption_required: true or false\n  - consent_collected: true or false (whether user consent was obtained for this data)\n  - data_source: where this data originates (user_input | crm_system | vehicle_database | third_party | ai_generated)\n  - sensitivity_score: 1 (public) to 5 (highly sensitive) — justify your score\n\nReturn the updated dataset as CSV including all original fields plus the new metadata columns. Then explain the classification decisions you made.',
  },
  {
    title: 'Validate Dataset Against Feature Scenarios',
    prompt:
      'Here are my feature scenarios: [paste your feature scenarios]\n\nHere are my datasets with metadata: [paste your datasets]\n\nFor each feature scenario, validate that the required data exists:\n  1. Does the dataset contain the fields this scenario needs?\n  2. Are the data types and value ranges correct for the scenario to work?\n  3. Are there enough records for the scenario to produce a meaningful result?\n  4. Does any field in this scenario require consent that is not captured?\n  5. Is there a data gap — a field the scenario needs that no dataset provides?\n\nReturn a validation report: for each scenario, PASS or FAIL each check, and list any data gaps or fixes needed before the scenario can be tested.',
  },
  {
    title: 'Create a Data Dictionary',
    prompt:
      'Based on all of the datasets and metadata I have defined: [paste all datasets]\n\nCreate a data dictionary for this product. For every field across all datasets, document:\n  - Field name\n  - Dataset / table it belongs to\n  - Data type (string, integer, boolean, date, enum, etc.)\n  - Description: what this field means in plain language\n  - Example value\n  - Allowed values or range (if applicable)\n  - Whether it is required or optional\n  - data_classification (Public | Internal | Confidential | Restricted)\n  - PII / PHI / Financial flag\n  - Regulation(s) that govern this field\n\nFormat the output as a Markdown table that could be included in a technical specification document.',
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <button className="design-prompt-copy" onClick={handleCopy}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function CreateDataPage() {
  return (
    <div>
      <section className="training-hero">
        <div className="training-hero-text">
          <h2>Create Data</h2>
          <p className="training-hero-sub">
            Identify the datasets your feature scenarios require, generate realistic synthetic data, add
            regulatory metadata to every record, and validate your data against your specs.
          </p>
        </div>
        <div className="hero-due-box">
          <span>May 8</span>
        </div>
      </section>

      <div className="design-page-body">
        <p className="design-phase-intro">
          Run these prompts in order. Each step builds on the previous one — by the end you will have
          synthetic datasets with full regulatory metadata and a data dictionary that documents every field
          in your product. Use the outputs from <strong>Evaluate Regulations</strong> and{' '}
          <strong>Create Functional Specifications</strong> as inputs here.
        </p>

        <h3 className="design-section-heading">Prompts — run in order</h3>
        <div className="design-prompts-list">
          {datasetPrompts.map((p, i) => (
            <div key={p.title} className="design-prompt-block">
              <div className="design-prompt-header">
                <span className="design-prompt-num">{i + 1}</span>
                <span className="design-prompt-title">{p.title}</span>
                <CopyButton text={p.prompt} />
              </div>
              <p className="design-prompt-text">{p.prompt}</p>
            </div>
          ))}
        </div>

        <h3 className="design-section-heading">Notes</h3>
        <NotesEditor defaultFileName="specs:create-data" title="Dataset Design & Data Dictionary" />
      </div>
    </div>
  );
}
