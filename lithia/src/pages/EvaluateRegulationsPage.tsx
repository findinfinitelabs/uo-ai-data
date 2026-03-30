import { useState } from 'react';
import NotesEditor from '../components/NotesEditor';

type PromptDef = { title: string; prompt: string };

const prompts: PromptDef[] = [
  {
    title: 'Identify Applicable Regulations',
    prompt:
      'I am building a digital AI product for Lithia Motors. Here is what the product does:\n\n[Describe your product — what data it collects, who uses it, what the AI feature does, and what decisions or recommendations it makes]\n\nLithia Motors operates dealerships across the United States and collects customer, financial, and vehicle data.\n\nBased on this description, identify every regulation, compliance framework, or data protection law that may apply to this product. For each one:\n  1. Name the regulation (e.g., GDPR, CCPA, SOC 2, GLBA, FTC Safeguards Rule, NHTSA, state privacy laws)\n  2. Explain why it applies to this specific product\n  3. Rate the compliance risk: High, Medium, or Low — with a one-sentence justification\n  4. List the top 2 obligations this regulation places on the product or its data\n\nReturn results as a table with columns: Regulation | Why It Applies | Risk | Key Obligations',
  },
  {
    title: 'Map Regulations to Data Fields',
    prompt:
      'Here are the regulations that apply to my product: [paste your regulation list from the previous prompt]\n\nHere are the data schemas I have designed: [paste your schemas — field names and types]\n\nFor each data field, identify:\n  - Which regulation(s) govern that field\n  - The data classification (Public, Internal, Confidential, Restricted)\n  - Whether the field contains PII, PHI, financial data, or behavioral data\n  - The required retention period under the applicable regulation\n  - Whether this field must be encrypted at rest, encrypted in transit, or both\n\nReturn results as a table with columns: Field Name | Table | Regulation(s) | Classification | Data Type | Retention | Encryption Required',
  },
  {
    title: 'Suggest Metadata Schema Changes',
    prompt:
      'Based on these regulatory findings: [paste your regulation-to-field mapping]\n\nSuggest specific changes to my data schemas to support compliance. For each change:\n  1. Identify the field or table being changed\n  2. Describe the change (add a new metadata attribute, rename a field, add an index, split a table, etc.)\n  3. Explain which regulation requires it and why\n  4. Write the updated DynamoDB attribute definition including the new metadata fields\n\nAt minimum, add these metadata attributes where applicable:\n  - data_classification: (Public | Internal | Confidential | Restricted)\n  - contains_pii: (true | false)\n  - contains_phi: (true | false)\n  - contains_financial: (true | false)\n  - retention_days: (number)\n  - encryption_required: (true | false)\n  - consent_collected: (true | false)\n  - data_source: (where this data came from)\n  - last_reviewed: (ISO date)\n\nOutput the updated schema with these fields added, plus a brief explanation of each addition.',
  },
  {
    title: 'Generate a Compliance Action Plan',
    prompt:
      'Based on the regulatory evaluation and schema changes above, create a 30-day compliance action plan for my product team.\n\nProduct description: [paste your product description]\nRegulations identified: [paste your regulation list]\nSchema changes required: [paste your schema changes]\n\nFor each regulation, list:\n  - The specific action items the team must complete before launch\n  - Who is responsible (engineer, product manager, legal, data steward)\n  - The deadline category: Before MVP, Before Pilot, Before Launch\n  - A done definition — what does "compliant" look like for this item\n\nFormat this as a prioritized action checklist grouped by deadline category.',
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

export default function EvaluateRegulationsPage() {
  return (
    <div>
      <section className="training-hero">
        <div className="training-hero-text">
          <h2>Evaluate Regulations</h2>
          <p className="training-hero-sub">
            Identify which regulations apply to your product, map them to your data fields, and generate
            the metadata schema changes needed to stay compliant.
          </p>
        </div>
        <div className="hero-due-box">
          <span>May 8</span>
        </div>
      </section>

      <div className="design-page-body">
        <p className="design-phase-intro">
          Use these prompts in sequence. Start by describing your product to identify applicable regulations,
          then map those regulations to your data fields, generate schema metadata changes, and finish with
          a concrete compliance action plan your team can execute.
        </p>

        <h3 className="design-section-heading">Prompts — run in order</h3>
        <div className="design-prompts-list">
          {prompts.map((p, i) => (
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
        <NotesEditor defaultFileName="specs:regulations" title="Regulation Evaluation & Metadata Changes" />
      </div>
    </div>
  );
}
