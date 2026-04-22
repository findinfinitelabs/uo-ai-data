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

// ─── InfoBubble ──────────────────────────────────────────────────────────────
function InfoBubble({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '0.4rem', verticalAlign: 'middle' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Show help"
        style={{
          width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #007030',
          background: open ? '#007030' : '#fff', color: open ? '#FEE11A' : '#007030',
          cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800, lineHeight: 1,
          padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >?</button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 999,
          background: '#fff', border: '1px solid #007030', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          padding: '0.75rem 1rem', width: 320, fontSize: '0.83rem', lineHeight: 1.6, color: '#333',
        }}>
          {children}
          <button
            onClick={() => setOpen(false)}
            style={{ marginTop: '0.5rem', display: 'block', background: 'none', border: 'none', color: '#007030', cursor: 'pointer', fontSize: '0.78rem', padding: 0, fontWeight: 700 }}
          >Close ✕</button>
        </div>
      )}
    </span>
  );
}

// ─── Phase 1 — Connect to Database ─────────────────────────────
type AwsIdentity = { UserId: string; Account: string; Arn: string };
type TableRow = { name: string; count: number | null; deleting: boolean; editing: boolean; editVal: string; renaming: boolean };

type StepStatus = 'pending' | 'running' | 'done' | 'error';
type RenameOp = {
  oldName: string;
  newName: string;
  phase: 'preview' | 'running' | 'done' | 'error';
  steps: { id: string; label: string; cmd: string; status: StepStatus; detail: string }[];
  error?: string;
};

function ConnectPhase() {
  const DEFAULT_REGION = 'us-west-2';

  const [selectedDb, setSelectedDb] = useState('');
  const [status, setStatus]         = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMsg, setErrorMsg]     = useState('');
  const [ssoPolling, setSsoPolling] = useState(false);
  const [identity, setIdentity]     = useState<AwsIdentity | null>(null);

  // profile picker
  const [profiles, setProfiles]     = useState<string[]>([]);
  const [profile, setProfile]       = useState('uo-innovation');
  const [region, setRegion]         = useState(DEFAULT_REGION);

  // table manager
  const [tables, setTables]         = useState<TableRow[]>([]);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [deletingAll, setDeletingAll]     = useState(false);
  const [renameOp, setRenameOp]           = useState<RenameOp | null>(null);

  // create form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState('');
  const [newKey, setNewKey]         = useState('id');
  const [creating, setCreating]     = useState(false);
  const [createErr, setCreateErr]   = useState('');

  // ── fetch profiles on DB select ──
  async function loadProfiles() {
    try {
      const res  = await fetch('/api/aws-profiles');
      const json = await res.json();
      if (json.ok && json.data?.length) {
        setProfiles(json.data);
        if (!json.data.includes(profile)) setProfile(json.data[0]);
      }
    } catch { /* keep default */ }
  }

  // ── fetch counts for every table row ──
  async function fetchCounts(rows: TableRow[], prof: string, reg: string) {
    setLoadingCounts(true);
    const updated = await Promise.all(
      rows.map(async (r) => {
        try {
          const res  = await fetch(`/api/dynamodb-table-count?profile=${prof}&region=${reg}&table=${encodeURIComponent(r.name)}`);
          const json = await res.json();
          return { ...r, count: json.ok ? (json.data?.Count ?? 0) : null };
        } catch {
          return { ...r, count: null };
        }
      })
    );
    setTables(updated);
    setLoadingCounts(false);
  }

  // ── main connect ──
  async function handleConnect() {
    if (!selectedDb) return;
    setStatus('connecting');
    setErrorMsg('');
    setSsoPolling(false);
    setIdentity(null);
    setTables([]);

    if (selectedDb !== 'dynamodb') {
      setTimeout(() => setStatus('connected'), 1200);
      return;
    }

    try {
      const idRes  = await fetch(`/api/aws-info?profile=${profile}`);
      const idJson = await idRes.json();

      if (!idJson.ok && idJson.ssoExpired) {
        setSsoPolling(true);
        setStatus('error');
        return;
      }
      if (!idJson.ok) throw new Error(idJson.error || 'Could not verify AWS identity');

      const tabRes  = await fetch(`/api/dynamodb-tables?profile=${profile}&region=${region}`);
      const tabJson = await tabRes.json();
      if (!tabJson.ok) throw new Error(tabJson.error || 'Could not list DynamoDB tables');

      const names: string[] = tabJson.data?.TableNames ?? [];
      const rows: TableRow[] = names.map((n) => ({ name: n, count: null, deleting: false, editing: false, editVal: n, renaming: false }));
      setIdentity(idJson.data as AwsIdentity);
      setTables(rows);
      setSsoPolling(false);
      setStatus('connected');
      fetchCounts(rows, profile, region);
    } catch (e: unknown) {
      setErrorMsg((e as Error).message);
      setSsoPolling(false);
      setStatus('error');
    }
  }

  // ── refresh table list + counts ──
  async function refreshTables() {
    const tabRes  = await fetch(`/api/dynamodb-tables?profile=${profile}&region=${region}`);
    const tabJson = await tabRes.json();
    if (!tabJson.ok) return;
    const rows: TableRow[] = (tabJson.data?.TableNames ?? []).map((n: string) => ({ name: n, count: null, deleting: false, editing: false, editVal: n, renaming: false }));
    setTables(rows);
    fetchCounts(rows, profile, region);
  }

  // ── rename table ──
  function buildRenamePreview(oldName: string, newName: string): RenameOp {
    return {
      oldName, newName, phase: 'preview',
      steps: [
        {
          id: 'describe',
          label: 'Read schema from old table',
          cmd: `aws dynamodb describe-table \\
  --profile ${profile} --region ${region} \\
  --table-name ${oldName}`,
          status: 'pending', detail: '',
        },
        {
          id: 'create',
          label: 'Create new table with same key schema',
          cmd: `aws dynamodb create-table \\
  --profile ${profile} --region ${region} \\
  --table-name ${newName} \\
  --attribute-definitions <from step 1> \\
  --key-schema <from step 1> \\
  --billing-mode PAY_PER_REQUEST`,
          status: 'pending', detail: '',
        },
        {
          id: 'copy',
          label: 'Copy all records to new table',
          cmd: `# Python scan + batch_writer loop\npython3 -c "\nimport boto3\ndb = boto3.resource('dynamodb', region_name='${region}')\nsrc = db.Table('${oldName}')\ndst = db.Table('${newName}')\nfor page in src.scan()['Items']:\n    dst.put_item(Item=page)\n"`,
          status: 'pending', detail: '',
        },
        {
          id: 'delete',
          label: 'Delete old table',
          cmd: `aws dynamodb delete-table \\
  --profile ${profile} --region ${region} \\
  --table-name ${oldName}`,
          status: 'pending', detail: '',
        },
      ],
    };
  }

  function setStep(op: RenameOp, id: string, status: StepStatus, detail = '') {
    return {
      ...op,
      steps: op.steps.map((s) => s.id === id ? { ...s, status, detail } : s),
    };
  }

  function startEditRename(name: string) {
    setTables((prev) => prev.map((x) => x.name === name ? { ...x, editing: true, editVal: name } : x));
    setRenameOp(null);
  }

  function cancelRename(name: string) {
    setTables((prev) => prev.map((x) => x.name === name ? { ...x, editing: false, editVal: name } : x));
    setRenameOp(null);
  }

  function previewRename(oldName: string, rawNew: string) {
    const newName = rawNew.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setTables((prev) => prev.map((x) => x.name === oldName ? { ...x, editing: false } : x));
    if (!newName || newName === oldName) return;
    setRenameOp(buildRenamePreview(oldName, newName));
  }

  async function runRename() {
    if (!renameOp) return;
    let op: RenameOp = { ...renameOp, phase: 'running' };
    setRenameOp(op);
    setTables((prev) => prev.map((t) => t.name === op.oldName ? { ...t, renaming: true } : t));

    try {
      // Step 1 — describe
      op = setStep(op, 'describe', 'running');
      setRenameOp({ ...op });
      const descRes  = await fetch(`/api/dynamodb-table-describe?profile=${profile}&region=${region}&table=${encodeURIComponent(op.oldName)}`);
      const descJson = await descRes.json();
      if (!descJson.ok) throw new Error(`Describe failed: ${descJson.error}`);
      const tableDesc = descJson.data.Table;
      const attrDefs  = JSON.stringify(tableDesc.AttributeDefinitions);
      const keySchema = JSON.stringify(tableDesc.KeySchema);
      op = setStep(op, 'describe', 'done', `Found ${tableDesc.AttributeDefinitions.length} attribute(s)`);
      // fill in real cmd
      op = { ...op, steps: op.steps.map((s) => s.id === 'create' ? { ...s, cmd: s.cmd.replace('<from step 1>', attrDefs).replace('<from step 1>', keySchema) } : s) };
      setRenameOp({ ...op });

      // Step 2 — create
      op = setStep(op, 'create', 'running');
      setRenameOp({ ...op });
      const createRes  = await fetch('/api/dynamodb-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, region, name: op.newName, key: tableDesc.KeySchema[0].AttributeName }),
      });
      const createJson = await createRes.json();
      if (!createJson.ok) throw new Error(`Create failed: ${createJson.error}`);
      op = setStep(op, 'create', 'done', `Table "${op.newName}" created`);
      setRenameOp({ ...op });

      // Step 3 — copy
      op = setStep(op, 'copy', 'running');
      setRenameOp({ ...op });
      const copyRes  = await fetch('/api/dynamodb-table-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, region, source: op.oldName, destination: op.newName }),
      });
      const copyJson = await copyRes.json();
      if (!copyJson.ok) throw new Error(`Copy failed: ${copyJson.error}`);
      op = setStep(op, 'copy', 'done', `${copyJson.data?.copied ?? 0} records copied`);
      setRenameOp({ ...op });

      // Step 4 — delete old
      op = setStep(op, 'delete', 'running');
      setRenameOp({ ...op });
      await fetch(`/api/dynamodb-table?profile=${profile}&region=${region}&table=${encodeURIComponent(op.oldName)}`, { method: 'DELETE' });
      op = setStep(op, 'delete', 'done', `Table "${op.oldName}" deleted`);
      op = { ...op, phase: 'done' };
      setRenameOp({ ...op });

      // Update table list
      setTables((prev) => prev.map((t) =>
        t.name === op.oldName ? { ...t, name: op.newName, editVal: op.newName, renaming: false } : t
      ));
    } catch (e: unknown) {
      op = { ...op, phase: 'error', error: (e as Error).message };
      setRenameOp({ ...op });
      setTables((prev) => prev.map((t) => t.name === op.oldName ? { ...t, renaming: false } : t));
    }
  }

  // ── delete one table ──
  async function handleDelete(name: string) {
    setTables((prev) => prev.map((t) => t.name === name ? { ...t, deleting: true } : t));
    await fetch(`/api/dynamodb-table?profile=${profile}&region=${region}&table=${encodeURIComponent(name)}`, { method: 'DELETE' });
    setTables((prev) => prev.filter((t) => t.name !== name));
  }

  // ── delete all ──
  async function handleDeleteAll() {
    if (!window.confirm(`Delete ALL ${tables.length} tables? This cannot be undone.`)) return;
    setDeletingAll(true);
    await Promise.all(tables.map((t) =>
      fetch(`/api/dynamodb-table?profile=${profile}&region=${region}&table=${encodeURIComponent(t.name)}`, { method: 'DELETE' })
    ));
    setTables([]);
    setDeletingAll(false);
  }

  // ── create table ──
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const slug = newName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!slug) { setCreateErr('Enter a table name'); return; }
    setCreating(true);
    setCreateErr('');
    const res  = await fetch('/api/dynamodb-table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, region, name: slug, key: newKey.trim() || 'id' }),
    });
    const json = await res.json();
    setCreating(false);
    if (!json.ok) { setCreateErr(json.error || 'Create failed'); return; }
    setNewName(''); setNewKey('id'); setShowCreate(false);
    refreshTables();
  }

  function friendlyUser(arn: string) {
    const parts = arn.split('/');
    return parts[parts.length - 1] ?? arn;
  }

  return (
    <div className="ai-phase-body">
      <p className="design-phase-intro">
        Connect to the database that holds your dataset. Choose <strong>AWS DynamoDB</strong> to
        verify your credentials and manage your tables directly from here.
      </p>

      {/* Step 1 — choose DB type */}
      <div className="ai-connect-card">
        <h3 className="ai-connect-heading">
          Step 1 — Choose Your Database
          <InfoBubble>
            <strong>Which database should I pick?</strong>
            <ul style={{ paddingLeft: '1.1rem', margin: '0.4rem 0 0' }}>
              <li><strong>AWS DynamoDB</strong> — the course environment. Your team's synthetic data lives here. Requires an active AWS SSO session.</li>
              <li><strong>PostgreSQL / MySQL</strong> — use if you have your own relational database set up outside of AWS.</li>
              <li><strong>CSV / Flat File</strong> — upload a spreadsheet or export file directly without a live database connection.</li>
            </ul>
            <p style={{ margin: '0.5rem 0 0' }}>For this course, always start with <strong>AWS DynamoDB</strong>.</p>
          </InfoBubble>
        </h3>
        <div className="ai-db-options">
          {DB_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`ai-db-option ${selectedDb === opt.value ? 'ai-db-option--selected' : ''}`}
            >
              <input
                type="radio" name="db" value={opt.value}
                checked={selectedDb === opt.value}
                onChange={() => {
                  setSelectedDb(opt.value);
                  setStatus('idle');
                  setIdentity(null);
                  setTables([]);
                  if (opt.value === 'dynamodb') loadProfiles();
                }}
                className="ai-db-radio"
              />
              <span className="ai-db-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Step 2 — profile + region + connect */}
      {selectedDb && status !== 'connected' && (
        <div className="ai-connect-card ai-connect-card--auth">
          <h3 className="ai-connect-heading">
            Step 2 — Connect
            <InfoBubble>
              <strong>How authentication works</strong>
              <p style={{ margin: '0.4rem 0 0' }}>The app uses your local AWS CLI profile to verify your identity — no passwords are stored here.</p>
              <ol style={{ paddingLeft: '1.1rem', margin: '0.4rem 0 0' }}>
                <li>Select your <strong>AWS Profile</strong> (<code>uo-innovation</code> is recommended for this course).</li>
                <li>Select the <strong>Region</strong> where your tables live (<code>us-west-2</code> by default).</li>
                <li>Click <strong>Connect &amp; Authenticate</strong>.</li>
              </ol>
              <p style={{ margin: '0.5rem 0 0' }}>If your session has expired, the app will automatically open the AWS SSO login page in a new browser tab. Come back and click <strong>Try Again</strong> once you've signed in.</p>
            </InfoBubble>
          </h3>

          {selectedDb === 'dynamodb' && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: 180 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AWS Profile</span>
                <select
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid #ccc', fontSize: '0.9rem' }}
                >
                  {(profiles.length ? profiles : ['uo-innovation']).map((p) => (
                    <option key={p} value={p}>{p === 'uo-innovation' ? `★ ${p} (course)` : p === 'uo-innovation' ? `★ ${p} (course)` : p}</option>
                  ))}
                </select>
                {profile === 'uo-innovation' && (
                  <span style={{ fontSize: '0.72rem', color: '#007030', fontWeight: 700 }}>★ Recommended for this course</span>
                )}
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: 160 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</span>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', border: '1px solid #ccc', fontSize: '0.9rem' }}
                >
                  {['us-east-1','us-east-2','us-west-1','us-west-2','eu-west-1','ap-southeast-1'].map((r) => (
                    <option key={r} value={r}>{r === 'us-west-2' ? `★ ${r} (course)` : r}</option>
                  ))}
                </select>
                {region === 'us-west-2' && (
                  <span style={{ fontSize: '0.72rem', color: '#007030', fontWeight: 700 }}>★ Recommended for this course</span>
                )}
              </label>
            </div>
          )}

          <button
            type="button"
            className={`ai-auth-btn ${status === 'connecting' ? 'ai-auth-btn--loading' : ''}`}
            onClick={handleConnect}
            disabled={status === 'connecting'}
          >
            {status === 'connecting' ? '⏳ Connecting…' : '🔐 Connect & Authenticate'}
          </button>

          {ssoPolling && (
            <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#fffbea', border: '1px solid #f4c95d' }}>
              <p style={{ fontWeight: 700, margin: '0 0 0.4rem', fontSize: '0.92rem' }}>🌐 AWS SSO login opened in your browser</p>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#555' }}>
                Complete sign-in in the browser tab that just opened, then click <strong>Try Again</strong>.
              </p>
              <button type="button" className="ai-auth-btn" onClick={handleConnect}>🔄 Try Again</button>
            </div>
          )}

          {status === 'error' && !ssoPolling && (
            <p style={{ marginTop: '0.75rem', color: '#c0392b', fontSize: '0.86rem' }}>✗ {errorMsg}</p>
          )}
        </div>
      )}

      {/* Step 3 — connected */}
      {status === 'connected' && (
        <>
          {/* connected banner with profile switcher */}
          <div className="ai-connected-banner">
            <span className="ai-connected-dot">●</span>
            <strong>Connected</strong>
            <span className="ai-connected-sub">{profile} · {region}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={profile}
                onChange={(e) => { setProfile(e.target.value); setStatus('idle'); setIdentity(null); setTables([]); }}
                style={{ padding: '0.2rem 0.5rem', border: '1px solid #ccc', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                {(profiles.length ? profiles : ['uo-innovation']).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                onClick={() => { setStatus('idle'); setIdentity(null); setTables([]); }}
                style={{ background: 'none', border: '1px solid #ccc', cursor: 'pointer', fontSize: '0.78rem', padding: '0.2rem 0.6rem', color: '#555' }}
              >Disconnect</button>
            </div>
          </div>

          {/* account details */}
          {identity && (
            <div className="ai-connect-card" style={{ marginTop: '1rem' }}>
              <h3 className="ai-connect-heading">AWS Account</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <tbody>
                  {[
                    ['Account ID', identity.Account],
                    ['User / Role', friendlyUser(identity.Arn)],
                    ['ARN', identity.Arn],
                    ['Region', region],
                    ['Profile', profile],
                  ].map(([label, val]) => (
                    <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.4rem 0.75rem 0.4rem 0', color: '#666', fontWeight: 600, whiteSpace: 'nowrap', width: 110 }}>{label}</td>
                      <td style={{ padding: '0.4rem 0', fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.83rem' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* table manager */}
          <div className="ai-connect-card" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <h3 className="ai-connect-heading" style={{ margin: 0 }}>
                DynamoDB Tables
                <InfoBubble>
                  <strong>Managing your tables</strong>
                  <ul style={{ paddingLeft: '1.1rem', margin: '0.4rem 0 0' }}>
                    <li><strong>+ New Table</strong> — creates a new empty DynamoDB table. You specify the name and primary key.</li>
                    <li><strong>Rename</strong> — creates a new table with the new name, copies all records across, then deletes the old table. A step-by-step preview shows the exact commands before anything runs.</li>
                    <li><strong>Delete</strong> — permanently removes a table and all its data. This cannot be undone.</li>
                    <li><strong>Delete All</strong> — removes every table shown. A confirmation prompt appears first.</li>
                    <li><strong>↻ Refresh</strong> — re-fetches the table list and record counts from AWS.</li>
                  </ul>
                  <p style={{ margin: '0.5rem 0 0' }}>Record counts are fetched live using a DynamoDB <code>Scan</code> with <code>SELECT COUNT</code> — this is fast but may cost a small amount on large tables.</p>
                </InfoBubble>
                <span style={{ marginLeft: '0.5rem', fontSize: '0.78rem', fontWeight: 400, color: '#666' }}>
                  {tables.length} in {region}
                </span>
              </h3>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => { setShowCreate((s) => !s); setCreateErr(''); }}
                  style={{ background: '#007030', color: '#FEE11A', border: 'none', padding: '0.3rem 0.9rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >+ New Table</button>
                {tables.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    disabled={deletingAll}
                    style={{ background: 'none', border: '1px solid #c0392b', color: '#c0392b', padding: '0.3rem 0.9rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >{deletingAll ? 'Deleting…' : 'Delete All'}</button>
                )}
                <button
                  onClick={refreshTables}
                  style={{ background: 'none', border: '1px solid #ccc', color: '#555', padding: '0.3rem 0.7rem', fontSize: '0.82rem', cursor: 'pointer' }}
                >↻ Refresh</button>
              </div>
            </div>

            {/* create form */}
            {showCreate && (
              <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'flex-end', padding: '0.75rem', background: '#f5f5f5', border: '1px solid #ddd', marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555' }}>Table Name</span>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. lithia-vehicles"
                    style={{ padding: '0.35rem 0.6rem', border: '1px solid #ccc', fontSize: '0.88rem', width: 200 }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555' }}>Primary Key</span>
                  <input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="e.g. id"
                    style={{ padding: '0.35rem 0.6rem', border: '1px solid #ccc', fontSize: '0.88rem', width: 120 }}
                  />
                </label>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ background: '#007030', color: '#FEE11A', border: 'none', padding: '0.4rem 1rem', fontWeight: 700, fontSize: '0.88rem', cursor: creating ? 'not-allowed' : 'pointer' }}
                >{creating ? 'Creating…' : 'Create'}</button>
                <button type="button" onClick={() => setShowCreate(false)} style={{ background: 'none', border: '1px solid #ccc', padding: '0.4rem 0.7rem', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                {createErr && <span style={{ color: '#c0392b', fontSize: '0.82rem', width: '100%' }}>✗ {createErr}</span>}
              </form>
            )}

            {/* table list */}
            {tables.length === 0 ? (
              <p style={{ fontSize: '0.86rem', color: '#888', padding: '0.5rem 0' }}>
                No tables found in {region}. Click <strong>+ New Table</strong> or go to <strong>Create Data</strong> to deploy your first tables.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.5rem 0.4rem 0', fontWeight: 700, color: '#444' }}>Table Name</th>
                    <th style={{ padding: '0.4rem 0.5rem', fontWeight: 700, color: '#444', width: 100, textAlign: 'right' }}>Records</th>
                    <th style={{ width: 120 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((t) => (
                    <tr key={t.name} style={{ borderBottom: '1px solid #f0f0f0', opacity: (t.deleting || t.renaming) ? 0.5 : 1 }}>
                      <td style={{ padding: '0.45rem 0.5rem 0.45rem 0' }}>
                        {t.editing ? (
                          <input
                            autoFocus
                            value={t.editVal}
                            onChange={(e) => setTables((prev) => prev.map((x) => x.name === t.name ? { ...x, editVal: e.target.value } : x))}
                            onBlur={() => previewRename(t.name, t.editVal)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') previewRename(t.name, t.editVal);
                              if (e.key === 'Escape') cancelRename(t.name);
                            }}
                            style={{ fontFamily: 'monospace', fontSize: '0.86rem', padding: '0.2rem 0.4rem', border: '1px solid #007030', width: '100%', boxSizing: 'border-box' }}
                          />
                        ) : (
                          <span style={{ fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {t.renaming ? <span style={{ color: '#aaa' }}>↻ renaming…</span> : t.name}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.45rem 0.5rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#555' }}>
                        {loadingCounts && t.count === null
                          ? <span style={{ color: '#aaa' }}>…</span>
                          : t.count === null
                          ? <span style={{ color: '#aaa' }}>—</span>
                          : t.count.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.45rem 0', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                          {!t.editing && !t.renaming && (
                            <button
                              onClick={() => startEditRename(t.name)}
                              disabled={t.deleting}
                              style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.2rem 0.5rem', fontSize: '0.78rem', cursor: 'pointer' }}
                            >Rename</button>
                          )}
                          <button
                            onClick={() => handleDelete(t.name)}
                            disabled={t.deleting || t.renaming || t.editing}
                            style={{ background: 'none', border: '1px solid #ddd', color: '#c0392b', padding: '0.2rem 0.5rem', fontSize: '0.78rem', cursor: 'pointer' }}
                          >{t.deleting ? '…' : 'Delete'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Rename operation panel ── */}
          {renameOp && (() => {
            const STEP_ICON: Record<StepStatus, string> = {
              pending: '○',
              running: '⏳',
              done: '✓',
              error: '✗',
            };
            const STEP_COLOR: Record<StepStatus, string> = {
              pending: '#aaa',
              running: '#e67e22',
              done: '#007030',
              error: '#c0392b',
            };
            return (
              <div style={{ marginTop: '1rem', border: '2px solid #007030', background: '#f8fff8' }}>
                {/* header */}
                <div style={{ background: '#007030', color: '#FEE11A', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                    Rename: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.1rem 0.4rem' }}>{renameOp.oldName}</code>
                    {' → '}
                    <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.1rem 0.4rem' }}>{renameOp.newName}</code>
                    <InfoBubble>
                      <strong>Why 4 steps?</strong>
                      <p style={{ margin: '0.4rem 0 0' }}>DynamoDB does not support renaming a table in place. Instead the app:</p>
                      <ol style={{ paddingLeft: '1.1rem', margin: '0.4rem 0 0' }}>
                        <li><strong>Reads the schema</strong> of the old table (key names and types).</li>
                        <li><strong>Creates</strong> a new table with the new name using the same schema.</li>
                        <li><strong>Copies</strong> every record from the old table to the new one using a Python <code>scan</code> + <code>batch_writer</code> loop.</li>
                        <li><strong>Deletes</strong> the old table once all data has been moved.</li>
                      </ol>
                      <p style={{ margin: '0.5rem 0 0' }}>Nothing is deleted until the copy is confirmed complete. You can cancel before clicking <strong>Run Rename</strong>.</p>
                    </InfoBubble>
                  </span>
                  {renameOp.phase === 'preview' && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.78rem', opacity: 0.85 }}>Review the 4 steps below, then confirm</span>
                  )}
                  {renameOp.phase === 'done' && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.82rem' }}>✓ Complete</span>
                  )}
                </div>

                {/* steps */}
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {renameOp.steps.map((s, i) => (
                    <div key={s.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '1rem', color: STEP_COLOR[s.status], fontWeight: 700, width: 18 }}>{STEP_ICON[s.status]}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#333' }}>Step {i + 1} — {s.label}</span>
                        {s.detail && <span style={{ fontSize: '0.78rem', color: '#007030', marginLeft: '0.4rem' }}>{s.detail}</span>}
                        {s.status === 'running' && (
                          <span style={{ fontSize: '0.75rem', color: '#e67e22', marginLeft: '0.4rem', animation: 'pulse 1s infinite' }}>running…</span>
                        )}
                      </div>
                      <pre style={{
                        margin: '0 0 0 1.5rem',
                        fontSize: '0.76rem',
                        background: s.status === 'running' ? '#fff8f0' : s.status === 'done' ? '#f0fff0' : '#f5f5f5',
                        border: `1px solid ${s.status === 'running' ? '#e67e22' : s.status === 'done' ? '#007030' : '#ddd'}`,
                        padding: '0.5rem 0.75rem',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        color: '#333',
                        lineHeight: 1.5,
                      }}>{s.cmd}</pre>
                    </div>
                  ))}
                </div>

                {/* error */}
                {renameOp.phase === 'error' && renameOp.error && (
                  <div style={{ margin: '0 1rem 0.75rem', padding: '0.6rem 0.75rem', background: '#fff0f0', border: '1px solid #c0392b', color: '#c0392b', fontSize: '0.84rem' }}>
                    ✗ {renameOp.error}
                  </div>
                )}

                {/* actions */}
                <div style={{ padding: '0 1rem 0.75rem', display: 'flex', gap: '0.6rem' }}>
                  {renameOp.phase === 'preview' && (
                    <>
                      <button
                        onClick={runRename}
                        style={{ background: '#007030', color: '#FEE11A', border: 'none', padding: '0.45rem 1.25rem', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}
                      >▶ Run Rename</button>
                      <button
                        onClick={() => { setRenameOp(null); }}
                        style={{ background: 'none', border: '1px solid #ccc', padding: '0.45rem 0.9rem', fontSize: '0.88rem', cursor: 'pointer', color: '#555' }}
                      >Cancel</button>
                    </>
                  )}
                  {(renameOp.phase === 'done' || renameOp.phase === 'error') && (
                    <button
                      onClick={() => setRenameOp(null)}
                      style={{ background: 'none', border: '1px solid #ccc', padding: '0.45rem 0.9rem', fontSize: '0.88rem', cursor: 'pointer', color: '#555' }}
                    >Dismiss</button>
                  )}
                </div>
              </div>
            );
          })()}
        </>
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
