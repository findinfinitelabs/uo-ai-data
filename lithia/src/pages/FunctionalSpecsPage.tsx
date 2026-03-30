import { useRef, useState } from 'react';
import NotesEditor from '../components/NotesEditor';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PromptDef = { title: string; prompt: string };

type Section = {
  id: string;
  heading: string;
  intro: string;
  prompts: PromptDef[];
};

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------
const sections: Section[] = [
  {
    id: 'feature-scenarios',
    heading: 'Feature Scenarios',
    intro:
      'Feature scenarios describe what the product does in concrete, testable terms. Write them in plain language that both developers and stakeholders can understand — each scenario should cover a single capability and state exactly what happens under specific conditions.',
    prompts: [
      {
        title: 'Generate Feature Scenarios',
        prompt:
          'I am building a digital AI product for Lithia Motors. Here is how the product works: [paste your screen flow and AI feature descriptions here].\n\nWrite 6–8 feature scenarios using this format for each:\n  Feature: [Feature name]\n  As a [user role]\n  I want to [action]\n  So that [benefit]\n\n  Scenario: [Scenario name]\n  Given [initial context or state]\n  When [user action or system event]\n  Then [expected outcome]\n\nCover at least one AI-powered feature, one data input scenario, and one error or edge case.',
      },
      {
        title: 'Validate Completeness',
        prompt:
          'Review these feature scenarios for my AI product: [paste your scenarios].\n\nIdentify any gaps — are there missing edge cases, error states, or user roles not covered? Are any scenarios too vague to be tested? Rewrite any weak scenarios so they are precise and actionable. Then suggest 2–3 additional scenarios that would strengthen the specification.',
      },
    ],
  },
  {
    id: 'use-cases',
    heading: 'Use Cases',
    intro:
      'Use cases document the step-by-step interactions between a user and the system. Unlike feature scenarios, use cases trace the full flow of a single goal — including what happens when things go wrong. They become the foundation for test plans and user documentation.',
    prompts: [
      {
        title: 'Write Primary Use Cases',
        prompt:
          'Based on this product description: [paste your product summary].\n\nWrite 3 primary use cases in this format for each:\n  Use Case: [Name]\n  Actor: [Who initiates this]\n  Precondition: [What must be true before this starts]\n  Main Flow:\n    1. [Step]\n    2. [Step] ...\n  Alternate Flow: [What happens if something goes wrong at step X]\n  Postcondition: [What is true when this succeeds]\n\nMake sure at least one use case involves the AI feature generating or recommending something to the user.',
      },
      {
        title: 'Identify Alternate & Exception Flows',
        prompt:
          'For this use case: [paste a single use case].\n\nExpand the alternate and exception flows. For each step in the main flow, ask: what could go wrong, what could the user do differently, or what external dependency could fail? Write at least 3 alternate or exception flows with their own step-by-step resolution. Then identify which flows need the most testing attention and explain why.',
      },
    ],
  },
  {
    id: 'data-schemas',
    heading: 'Data Schemas',
    intro:
      'Defining your data schemas is one of the most important technical decisions you will make. Your schemas determine what you can store, query, and feed to AI models. Upload sample datasets below — CSV or JSON files that represent the kinds of data your product will use. Then use the prompts to have AI help you design the right schema for each dataset.',
    prompts: [
      {
        title: 'Design a Data Schema',
        prompt:
          'Here is a sample of data my product will use: [paste 5–10 rows of sample data or describe the fields].\n\nThis data supports this feature: [describe the feature].\n\nDesign a data schema for storing this in DynamoDB. Include:\n  - Table name\n  - Partition key and sort key (with justification)\n  - All attributes with data types\n  - Any Global Secondary Indexes (GSIs) needed for the queries this feature requires\n  - An example JSON record\n\nThen explain the access patterns this schema supports and any limitations to be aware of.',
      },
      {
        title: 'Normalize & Relate Multiple Schemas',
        prompt:
          'I have these data schemas for my product: [paste all your schemas].\n\nIdentify relationships between these tables. Where data is duplicated, explain whether to normalize (store once and reference) or denormalize (duplicate for query speed) — and justify your choice for DynamoDB\'s single-table or multi-table design pattern. Then draw a simple entity-relationship description showing how the tables connect.',
      },
    ],
  },
  {
    id: 'compliance',
    heading: 'Compliance, Responsible AI & Regulatory Review',
    intro:
      'Before building with real data, evaluate your schemas and AI features against the regulations and ethical standards that apply to your product. Lithia Motors operates across the US with customer financial and personal data — GDPR, CCPA, SOC 2, and responsible AI principles all apply.',
    prompts: [
      {
        title: 'Evaluate for GDPR & CCPA',
        prompt:
          'Review these data schemas and features for my product: [paste schemas and AI feature descriptions].\n\nEvaluate them against GDPR and CCPA requirements. For each schema, identify:\n  - Which fields contain personally identifiable information (PII)\n  - Whether consent is required to collect this data\n  - How a user would request deletion of their data (right to erasure)\n  - How data would be exported on request (right to portability)\n  - Any fields that should be encrypted at rest or in transit\n\nOutput a compliance checklist with PASS / NEEDS WORK / FAIL for each requirement.',
      },
      {
        title: 'SOC 2 & Security Controls',
        prompt:
          'For this product that will store customer and vehicle data for Lithia Motors: [describe your product and data schemas].\n\nEvaluate the technical controls needed to meet SOC 2 Type II requirements. Cover the five Trust Services Criteria:\n  1. Security (CC6) — access controls, encryption, monitoring\n  2. Availability (A1) — uptime, disaster recovery\n  3. Processing Integrity (PI1) — accurate, complete processing\n  4. Confidentiality (C1) — protection of sensitive data\n  5. Privacy (P1–P8) — data collection, use, retention, disposal\n\nFor each criterion, list 2–3 specific controls this product should implement and flag any gaps in the current design.',
      },
      {
        title: 'Responsible AI Assessment',
        prompt:
          'Review the AI features of this product: [describe each AI feature — what it does, what data it uses, and who it affects].\n\nAssess each feature against these responsible AI principles:\n  - Fairness: Could the model produce biased outcomes for different customer groups? What data could cause this?\n  - Transparency: Can the user understand why the AI made a recommendation? Is there an explanation mechanism?\n  - Accountability: Who is responsible when the AI is wrong? Is there a human override?\n  - Privacy: Does the AI use data the user did not knowingly provide?\n  - Safety: What is the worst-case outcome if this AI feature fails or produces a bad recommendation?\n\nFor each feature, assign a risk level (Low / Medium / High) and recommend one mitigation for the highest-risk item.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
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

function PromptBlock({ prompt, index }: { prompt: PromptDef; index: number }) {
  return (
    <div className="design-prompt-block">
      <div className="design-prompt-header">
        <span className="design-prompt-num">{index + 1}</span>
        <span className="design-prompt-title">{prompt.title}</span>
        <CopyButton text={prompt.prompt} />
      </div>
      <p className="design-prompt-text">{prompt.prompt}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dataset upload
// ---------------------------------------------------------------------------
type UploadedFile = {
  id: string;
  file: File;
  datasetName: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
};

const UPLOAD_API = import.meta.env.VITE_UPLOAD_API_URL as string | undefined;

function DatasetUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLLabelElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next: UploadedFile[] = Array.from(incoming).map((f) => ({
      id: `${f.name}-${Date.now()}`,
      file: f,
      datasetName: f.name.replace(/\.[^.]+$/, ''),
      status: 'idle',
      message: '',
    }));
    setFiles((prev) => [...prev, ...next]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    dropRef.current?.classList.remove('drag-over');
    addFiles(e.dataTransfer.files);
  }

  function updateName(id: string, name: string) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, datasetName: name } : f)));
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function uploadFile(id: string) {
    const entry = files.find((f) => f.id === id);
    if (!entry) return;

    if (!UPLOAD_API) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, status: 'error', message: 'No upload API configured. Set VITE_UPLOAD_API_URL in .env.' }
            : f,
        ),
      );
      return;
    }

    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'uploading', message: '' } : f)));

    try {
      const body = new FormData();
      body.append('file', entry.file);
      body.append('dataset', entry.datasetName);

      const res = await fetch(UPLOAD_API, { method: 'POST', body });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'success', message: 'Uploaded to DynamoDB' } : f)),
      );
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'error', message: err instanceof Error ? err.message : 'Upload failed' } : f,
        ),
      );
    }
  }

  async function uploadAll() {
    const pending = files.filter((f) => f.status === 'idle' || f.status === 'error');
    for (const f of pending) {
      await uploadFile(f.id);
    }
  }

  return (
    <div className="upload-section">
      <label htmlFor="dataset-file-input" className="upload-dropzone upload-dropzone--label"
        onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add('drag-over'); }}
        onDragLeave={() => dropRef.current?.classList.remove('drag-over')}
        onDrop={handleDrop}
        ref={dropRef}
      >
        <span className="upload-dropzone-icon">⬆</span>
        <span className="upload-dropzone-text">Drop CSV or JSON files here, or click to browse</span>
        <span className="upload-dropzone-sub">You can upload multiple datasets at once</span>
        <input
          id="dataset-file-input"
          ref={inputRef}
          type="file"
          multiple
          accept=".csv,.json,.tsv"
          className="upload-file-input-hidden"
          onChange={(e) => addFiles(e.target.files)}
          title="Select dataset files"
          placeholder="Select files"
        />
      </label>

      {files.length > 0 && (
        <div className="upload-file-list">
          {files.map((f) => (
            <div key={f.id} className={`upload-file-row upload-file-row--${f.status}`}>
              <div className="upload-file-info">
                <span className="upload-file-name">{f.file.name}</span>
                <span className="upload-file-size">{(f.file.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="upload-file-controls">
                <input
                  className="upload-name-input"
                  value={f.datasetName}
                  onChange={(e) => updateName(f.id, e.target.value)}
                  placeholder="Dataset name"
                  aria-label="Dataset name"
                />
                {f.status === 'idle' || f.status === 'error' ? (
                  <button className="upload-btn" onClick={() => uploadFile(f.id)}>
                    {f.status === 'error' ? 'Retry' : 'Upload'}
                  </button>
                ) : f.status === 'uploading' ? (
                  <span className="upload-status-tag upload-status-tag--uploading">Uploading…</span>
                ) : (
                  <span className="upload-status-tag upload-status-tag--success">✓ Done</span>
                )}
                <button className="upload-remove" onClick={() => removeFile(f.id)} aria-label="Remove">✕</button>
              </div>
              {f.message && <p className="upload-message">{f.message}</p>}
            </div>
          ))}

          <div className="upload-actions">
            <button className="step-btn" onClick={uploadAll}>
              Upload All to DynamoDB
            </button>
          </div>
        </div>
      )}

      {!UPLOAD_API && (
        <p className="upload-api-note">
          ⚠ Upload API not configured. Set <code>VITE_UPLOAD_API_URL</code> in your <code>.env</code> file to enable DynamoDB uploads.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function FunctionalSpecsPage() {
  return (
    <div>
      <section className="training-hero">
        <div className="training-hero-text">
          <h2>Create Functional Specifications</h2>
          <p className="training-hero-sub">
            Define what your product does, how users interact with it, what data it needs, and whether it meets
            compliance and responsible AI standards.
          </p>
        </div>
        <div className="hero-due-box">
          <span>May 8</span>
        </div>
      </section>

      <div className="design-page-body">
        {sections.map((section) => (
          <div key={section.id} className="spec-section">
            <h2 className="spec-section-heading">{section.heading}</h2>
            <p className="design-phase-intro">{section.intro}</p>

            {section.id === 'data-schemas' && (
              <>
                <h3 className="design-section-heading">Upload Your Test Datasets</h3>
                <DatasetUploader />
              </>
            )}

            <h3 className="design-section-heading">Prompts</h3>
            <div className="design-prompts-list">
              {section.prompts.map((p, i) => (
                <PromptBlock key={p.title} prompt={p} index={i} />
              ))}
            </div>

            <h3 className="design-section-heading">Notes</h3>
            <NotesEditor defaultFileName={`specs:${section.id}`} title={section.heading} />
          </div>
        ))}
      </div>
    </div>
  );
}
