import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NotesEditor from '../components/NotesEditor';
import PromptCard from '../components/PromptCard';

// ─── Phase definitions ──────────────────────────────────────────
const PHASES = [
  { id: 0, label: 'Connect to Database', icon: '🔌' },
  { id: 1, label: 'Explore Your Data',   icon: '🔍' },
  { id: 2, label: 'Train AI Model',      icon: '🤖' },
];

const DB_OPTIONS = [
  { value: 'dynamodb',   label: 'AWS DynamoDB (course dataset)' },
  { value: 'postgres',   label: 'PostgreSQL' },
  { value: 'mysql',      label: 'MySQL' },
  { value: 'csv',        label: 'CSV / Flat File' },
];

const INSIGHT_PROMPTS = [
  {
    label: 'Prompt 1 — Summarise the Dataset',
    content:
      'I have connected a database containing Lithia Motors customer and vehicle records. ' +
      'Please give me a plain-English summary of what data fields exist, what time range is covered, ' +
      'and what the record volume looks like. Flag any fields that appear to be null or sparse.',
  },
  {
    label: 'Prompt 2 — Find Patterns & Trends',
    content:
      'Looking at this dataset, what are the most significant patterns or trends you can identify? ' +
      'Focus on customer behaviour, vehicle service frequency, and any geographic or demographic clusters. ' +
      'Present your findings as bullet points with a one-line explanation for each.',
  },
  {
    label: 'Prompt 3 — Surface Anomalies',
    content:
      'Are there any outliers, anomalies, or data quality issues in this dataset? ' +
      'List each anomaly, explain why it stands out, and suggest whether it is a data error ' +
      'or a legitimate business signal worth investigating.',
  },
  {
    label: 'Prompt 4 — Generate Business Insights',
    content:
      'Based on the patterns in this dataset, what are the top 3 actionable business insights ' +
      'that Lithia Motors could act on in the next quarter? For each insight explain: ' +
      '(1) what the data shows, (2) what the business opportunity is, and (3) how to measure success.',
  },
  {
    label: 'Prompt 5 — Connect to Your Product Concept',
    content:
      'Given the AI product concept our team defined in the Product Design phase, ' +
      'which fields and patterns in this dataset are most relevant to validating or challenging that concept? ' +
      'Suggest specific queries or visualisations that would help us build the business case.',
  },
];

// ─── Phase 1 — Connect to Database ─────────────────────────────
function ConnectPhase() {
  const [selectedDb, setSelectedDb] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');

  function handleConnect() {
    if (!selectedDb) return;
    setStatus('connecting');
    // Simulated auth handshake — real connection is handled by Lovable/API Gateway
    setTimeout(() => setStatus('connected'), 1800);
  }

  return (
    <div className="ai-phase-body">
      <p className="design-phase-intro">
        Before exploring your data, connect to the database that holds your Lithia Motors dataset.
        Authentication is handled securely through your course environment — you do not need to
        manage credentials yourself.
      </p>

      <div className="ai-connect-card">
        <h3 className="ai-connect-heading">Step 1 — Choose Your Database</h3>
        <p className="ai-connect-hint">
          Select the data source your team will be working with. For the course dataset, choose
          <strong> AWS DynamoDB (course dataset)</strong>.
        </p>

        <div className="ai-db-options">
          {DB_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`ai-db-option ${selectedDb === opt.value ? 'ai-db-option--selected' : ''}`}
            >
              <input
                type="radio"
                name="db"
                value={opt.value}
                checked={selectedDb === opt.value}
                onChange={() => { setSelectedDb(opt.value); setStatus('idle'); }}
                className="ai-db-radio"
              />
              <span className="ai-db-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {selectedDb && status !== 'connected' && (
        <div className="ai-connect-card ai-connect-card--auth">
          <h3 className="ai-connect-heading">Step 2 — Authenticate</h3>
          <p className="ai-connect-hint">
            Click below to authenticate with your course credentials. You will be redirected to
            your institution's single sign-on, then returned here automatically.
          </p>
          <button
            type="button"
            className={`ai-auth-btn ${status === 'connecting' ? 'ai-auth-btn--loading' : ''}`}
            onClick={handleConnect}
            disabled={status === 'connecting'}
          >
            {status === 'connecting' ? '⏳ Connecting…' : '🔐 Connect & Authenticate'}
          </button>
        </div>
      )}

      {status === 'connected' && (
        <div className="ai-connected-banner">
          <span className="ai-connected-dot">●</span>
          <strong>Connected</strong> — {DB_OPTIONS.find((o) => o.value === selectedDb)?.label}
          <span className="ai-connected-sub">
            Your database is ready. Move to Phase 2 to start exploring your data.
          </span>
        </div>
      )}

      <NotesEditor defaultFileName="ai:connect" title="Database Connection Notes" />
    </div>
  );
}

// ─── Phase 2 — Explore Your Data ───────────────────────────────
type ChatMessage = { role: 'user' | 'assistant'; text: string };

const TOOL_LINKS = [
  {
    name: 'Lovable',
    url: 'https://lovable.dev',
    icon: '💜',
    desc: 'AI-powered app builder — connect your data and build interfaces visually.',
  },
  {
    name: 'Base44',
    url: 'https://base44.com',
    icon: '🟦',
    desc: 'No-code platform for building data-driven apps with your database.',
  },
];

const PLACEHOLDER_REPLIES = [
  "Great question! Based on the Lithia Motors dataset, I can see several patterns worth exploring. Try connecting your database in Phase 1 first so I can give you live answers.",
  "That's a useful angle. Once your DynamoDB connection is active, I'll be able to query the actual records and return real insights here.",
  "I'd look at the service frequency fields and cross-reference with the customer segment data. Connect your database in Phase 1 to get live results.",
  "Interesting — that pattern could indicate a seasonal trend or a data quality issue. Authenticate your data source first and I'll dig deeper.",
];

function ExplorePhase() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hi! I'm your data exploration assistant. Ask me anything about your Lithia Motors dataset — like \"What are the top customer segments?\" or \"Are there any anomalies in the service records?\" Connect your database in Phase 1 for live answers, or ask away and I'll guide you.",
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const replyIndex = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setThinking(true);
    setTimeout(() => {
      const reply = PLACEHOLDER_REPLIES[replyIndex.current % PLACEHOLDER_REPLIES.length];
      replyIndex.current += 1;
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setThinking(false);
    }, 1100 + Math.random() * 600);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function loadPrompt(content: string) {
    setInput(content);
  }

  return (
    <div className="ai-phase-body">
      {/* Tool links */}
      <div className="ai-tool-bar">
        <span className="ai-tool-bar-label">Open in:</span>
        {TOOL_LINKS.map((t) => (
          <a
            key={t.name}
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ai-tool-link"
            title={t.desc}
          >
            {t.icon} {t.name} ↗
          </a>
        ))}
      </div>

      <p className="design-phase-intro">
        Ask questions about your data in the chat below, or use the starter prompts to guide your
        exploration. Copy a prompt into the chat or take it straight into Lovable or Base44.
      </p>

      {/* Chat window */}
      <div className="ai-chat-wrap">
        <div className="ai-chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`ai-chat-msg ai-chat-msg--${m.role}`}>
              <span className="ai-chat-avatar">{m.role === 'assistant' ? '🤖' : '🧑'}</span>
              <div className="ai-chat-bubble">{m.text}</div>
            </div>
          ))}
          {thinking && (
            <div className="ai-chat-msg ai-chat-msg--assistant">
              <span className="ai-chat-avatar">🤖</span>
              <div className="ai-chat-bubble ai-chat-bubble--thinking">
                <span className="ai-chat-dot" /><span className="ai-chat-dot" /><span className="ai-chat-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="ai-chat-input-row">
          <textarea
            className="ai-chat-input"
            rows={2}
            placeholder="Ask a question about your data… (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="ai-chat-send"
            onClick={sendMessage}
            disabled={!input.trim() || thinking}
          >
            Send ↑
          </button>
        </div>
      </div>

      {/* Starter prompts */}
      <h3 className="ai-prompts-heading">Starter Prompts</h3>
      <p className="ai-prompts-sub">Click a prompt to load it into the chat, or copy it to use in Lovable / Base44.</p>
      {INSIGHT_PROMPTS.map((p) => (
        <div key={p.label} className="ai-prompt-row">
          <PromptCard label={p.label} content={p.content} tone="prompt" />
          <button
            type="button"
            className="ai-use-prompt-btn"
            onClick={() => loadPrompt(p.content)}
          >
            ↑ Ask in chat
          </button>
        </div>
      ))}

      <NotesEditor defaultFileName="ai:insights" title="Data Insights & Findings" />
    </div>
  );
}

// ─── Phase 3 — Train AI Model ───────────────────────────────────
function TrainPhase() {
  const [trainStatus, setTrainStatus] = useState<'idle' | 'pending'>('idle');

  return (
    <div className="ai-phase-body">
      <p className="design-phase-intro">
        In this phase you will trigger a fine-tuning run on <strong>Ollama</strong> hosted via
        <strong> AWS Bedrock</strong>. The model will be trained on insights drawn from your
        Lithia Motors dataset, producing a specialised AI that understands your product domain.
      </p>

      <div className="ai-train-card">
        <div className="ai-train-icon">🤖</div>
        <h3 className="ai-train-heading">AWS Bedrock — Model Training</h3>
        <ul className="ai-train-details">
          <li><span>Runtime</span><strong>Ollama (llama3)</strong></li>
          <li><span>Host</span><strong>AWS Bedrock (course environment)</strong></li>
          <li><span>Dataset</span><strong>Lithia Motors — synthetic patient/vehicle corpus</strong></li>
          <li><span>Status</span><strong className={trainStatus === 'pending' ? 'ai-train-status--active' : 'ai-train-status--idle'}>{trainStatus === 'pending' ? '⏳ Training queued…' : '○ Not started'}</strong></li>
        </ul>

        <div className="ai-train-notice">
          <strong>Note:</strong> Bedrock configuration will be completed by your instructor before
          this session. You only need to press the button below to submit your dataset for training.
          The process runs in the background — your instructor will notify you when the model is ready.
        </div>

        <button
          type="button"
          className={`ai-train-btn ${trainStatus === 'pending' ? 'ai-train-btn--active' : ''}`}
          onClick={() => setTrainStatus('pending')}
          disabled={trainStatus === 'pending'}
        >
          {trainStatus === 'pending' ? '⏳ Training Queued — Check Back Soon' : '🚀 Begin Model Training on AWS Bedrock'}
        </button>
      </div>

      <NotesEditor defaultFileName="ai:training" title="Model Training Notes" />
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function InnovationFrameworkPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const phase = Number(searchParams.get('phase') ?? '0');

  function goTo(p: number) {
    setSearchParams({ phase: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div>
      <section className="training-hero">
        <div className="training-hero-text">
          <h2>AI Design</h2>
          <p className="training-hero-sub">
            Connect to your data, uncover insights with AI, and kick off model training —
            no technical setup required.
          </p>
        </div>
      </section>

      {/* Phase tab bar */}
      <div className="ai-phase-tabs">
        {PHASES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`ai-phase-tab ${phase === p.id ? 'ai-phase-tab--active' : ''}`}
            onClick={() => goTo(p.id)}
          >
            <span className="ai-phase-tab-icon">{p.icon}</span>
            <span className="ai-phase-tab-label">
              <span className="ai-phase-tab-num">Phase {p.id + 1}</span>
              {p.label}
            </span>
          </button>
        ))}
      </div>

      <div className="design-page-body">
        <h2 className="design-phase-title">
          {PHASES[phase].icon} Phase {phase + 1} — {PHASES[phase].label}
        </h2>

        {phase === 0 && <ConnectPhase />}
        {phase === 1 && <ExplorePhase />}
        {phase === 2 && <TrainPhase />}

        {/* Prev / Next */}
        <div className="ai-phase-nav">
          {phase > 0 && (
            <button type="button" className="step-btn" onClick={() => goTo(phase - 1)}>
              ← Phase {phase} — {PHASES[phase - 1].label}
            </button>
          )}
          {phase < PHASES.length - 1 && (
            <button type="button" className="step-btn ai-phase-nav-next" onClick={() => goTo(phase + 1)}>
              Phase {phase + 2} — {PHASES[phase + 1].label} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
