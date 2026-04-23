import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NotesEditor from '../components/NotesEditor';

// ─── Phase definitions ──────────────────────────────────────────
const PHASES = [
  { id: 0, label: 'Connect to Database', icon: '🔌' },
  { id: 1, label: 'Create Datasets',      icon: '📊' },
  { id: 2, label: 'Train AI Model',       icon: '🤖' },
];

const DB_OPTIONS = [
  { value: 'dynamodb',   label: 'AWS DynamoDB (course dataset)' },
  { value: 'postgres',   label: 'PostgreSQL' },
  { value: 'mysql',      label: 'MySQL' },
  { value: 'csv',        label: 'CSV / Flat File' },
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

// ─── Phase 2 — Create Datasets ─────────────────────────────────
type ColDef = { name: string; type: string; note?: string };
type UploadStep = { id: string; label: string; cmd: string; status: StepStatus; detail: string };
type ValidationIssue = { record: number; field: string; message: string; severity: 'error' | 'warn' };
type TableDataset = {
  name: string; open: boolean;
  schemaStatus: 'empty' | 'parsed' | 'locked' | 'error';
  schemaFile: string; columns: ColDef[]; schemaErr: string; schemaSteps: UploadStep[];
  tableKey?: string; // actual partition key attribute name from DynamoDB describe-table
  dataStatus: 'empty' | 'parsed' | 'uploading' | 'done' | 'error';
  dataFile: string; records: Record<string, unknown>[]; dataErr: string;
  recordsWritten: number; dataSteps: UploadStep[];
  dataIssues: ValidationIssue[];
  previewRows?: Record<string, unknown>[];
  previewLoading?: boolean;
  previewErr?: string;
  previewOpen?: boolean;
};

/** Parse a raw boto3/Python error string into a student-friendly explanation */
function parseUploadError(raw: string): { headline: string; hint: string } {
  const l = raw.toLowerCase();
  if (l.includes('serializationexception') || (l.includes('float') && l.includes('decimal')))
    return { headline: 'Type serialization error', hint: 'A field value could not be converted to a DynamoDB type. Common causes: a Number (N) column contains a non-numeric string, or a value is Python None / NaN. Fix the data file or change the column type in the schema table above.' };
  if (l.includes('validationexception') && l.includes('does not match the schema'))
    return { headline: 'Key does not match table schema', hint: 'The record\'s primary key field name or type doesn\'t match what DynamoDB expects for this table. Check that your data file uses the exact same key attribute name as defined when the table was created (it\'s case-sensitive), and that the value type matches (String vs Number).' };
  if (l.includes('validationexception') && l.includes('empty val'))
    return { headline: 'Empty string in key or attribute', hint: 'DynamoDB rejects empty strings ("") as primary key values. Check your data for records where the key field is blank. If other columns are empty, convert them to null or remove them.' };
  if (l.includes('validationexception'))
    return { headline: 'DynamoDB validation failed', hint: 'One or more records failed DynamoDB validation. Common causes: the primary key field is missing or its name doesn\'t match the table\'s key schema (case-sensitive), a value type doesn\'t match the key definition, or the key field is empty.' };
  if (l.includes('resourcenotfoundexception'))
    return { headline: 'Table not found', hint: 'The DynamoDB table doesn\'t exist in this region. Go to Phase 1 to verify the table name and region, then recreate it if needed.' };
  if (l.includes('accessdeniedexception') || l.includes('not authorized'))
    return { headline: 'AWS permission denied', hint: 'Your SSO session may have expired or your profile doesn\'t have write access. Click Disconnect, reconnect, and try again.' };
  if (l.includes('provisionedthroughputexceeded') || l.includes('throttling'))
    return { headline: 'AWS rate limit hit', hint: 'The upload was throttled. Wait a few seconds and click Upload again — the batch writer will retry automatically.' };
  if (l.includes('itemcollectionsizelimitexceeded'))
    return { headline: 'Partition too large', hint: 'A single partition key value has exceeded the 10 GB DynamoDB limit. Split your data across more partition key values.' };
  if (l.includes('python') && l.includes('typeerror'))
    return { headline: 'Python type error', hint: 'A record field has a Python type that boto3 cannot serialize (e.g. a nested object mixed with a primitive). Check the data file for inconsistent value types in the same column.' };
  return { headline: 'Upload failed', hint: 'The data file may not match what DynamoDB expects. Common fixes: ensure the primary key field name exactly matches the table\'s key schema (case-sensitive), the key value is not empty, and Number columns only contain numeric values.' };
}

/** Pre-validate records against the schema and return per-field issues */
function validateRecords(records: Record<string, unknown>[], columns: ColDef[], tableKey?: string): ValidationIssue[] {
  if (!records.length) return [];
  const issues: ValidationIssue[] = [];

  // Use the real DynamoDB partition key if known; otherwise guess from schema columns
  const pkCol = tableKey
    ? ({ name: tableKey, type: columns.find((c) => c.name === tableKey)?.type ?? 'S' } as ColDef)
    : columns.find((c) => ['id','_id','pk'].includes(c.name) || c.name.endsWith('_id') || c.name.endsWith('Id')) ?? columns[0];

  // Only sample up to 100 records for speed
  const sample = records.slice(0, 100);
  const fieldTally: Record<string, number> = {};

  // Early check: if the partition key doesn't appear in ANY record, show a targeted error
  if (pkCol && !sample.some((r) => pkCol.name in r)) {
    const firstKeys = Object.keys(sample[0] ?? {}).slice(0, 6).join(', ');
    issues.push({ record: 0, field: pkCol.name, message: `Partition key "${pkCol.name}" is not present in any record. Your data file has fields: ${firstKeys}${Object.keys(sample[0] ?? {}).length > 6 ? ', …' : ''}. Rename one of those to "${pkCol.name}" or update the table's key in DynamoDB.`, severity: 'error' });
    return issues;
  }

  function tally(key: string, issue: ValidationIssue) {
    fieldTally[key] = (fieldTally[key] ?? 0) + 1;
    if (fieldTally[key] <= 3) issues.push(issue);
    if (fieldTally[key] === 4) issues.push({ ...issue, record: -1, message: `… and more records with this issue on "${issue.field}"` });
  }

  for (let i = 0; i < sample.length; i++) {
    const rec = sample[i];
    // Primary key checks
    const pkVal = rec[pkCol.name];
    if (pkVal === undefined || pkVal === null) {
      tally(`pk-missing`, { record: i + 1, field: pkCol.name, message: `Primary key "${pkCol.name}" is missing`, severity: 'error' });
    } else if (pkVal === '') {
      tally(`pk-empty`, { record: i + 1, field: pkCol.name, message: `Primary key "${pkCol.name}" is an empty string — DynamoDB rejects empty key values`, severity: 'error' });
    }
    // Type mismatch checks for top-level scalar columns
    for (const col of columns) {
      if (col.name.includes('.') || col.name.includes('[')) continue; // skip nested
      const val = rec[col.name];
      if (val === undefined) {
        tally(`missing-${col.name}`, { record: i + 1, field: col.name, message: `Field "${col.name}" is missing from this record`, severity: 'warn' });
      } else if (col.type === 'N' && val !== null && typeof val === 'string' && isNaN(Number(val))) {
        tally(`type-${col.name}`, { record: i + 1, field: col.name, message: `Field "${col.name}" is type N (Number) but value "${String(val).slice(0, 30)}" is not numeric`, severity: 'error' });
      } else if (col.type === 'S' && val !== null && typeof val !== 'string') {
        tally(`type-${col.name}`, { record: i + 1, field: col.name, message: `Field "${col.name}" is type S (String) but value is a ${typeof val}`, severity: 'warn' });
      }
    }
  }
  return issues.slice(0, 25);
}

function inferDynType(val: unknown): string {
  if (typeof val === 'string')  return 'S';
  if (typeof val === 'number')  return 'N';
  if (typeof val === 'boolean') return 'BOOL';
  if (Array.isArray(val))       return 'L';
  if (val === null)             return 'NULL';
  if (typeof val === 'object')  return 'M';
  return 'S';
}
function friendlyType(t: string): string {
  const m: Record<string, string> = { S: 'String', N: 'Number', BOOL: 'Boolean', L: 'List', M: 'Map', NULL: 'Null', B: 'Binary' };
  return m[t] ?? t;
}

/** Flatten a record object into dot-notation ColDef list, max depth 4 */
function flattenRecord(obj: Record<string, unknown>, prefix = '', depth = 0): ColDef[] {
  const MAX_DEPTH = 4;
  const cols: ColDef[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && depth < MAX_DEPTH) {
      // nested object — recurse
      const sub = flattenRecord(v as Record<string, unknown>, fullKey, depth + 1);
      if (sub.length) { cols.push(...sub); continue; }
    }
    if (Array.isArray(v) && v.length > 0 && v[0] !== null && typeof v[0] === 'object' && depth < MAX_DEPTH) {
      // array of objects — show first element's fields with [] suffix
      const sub = flattenRecord(v[0] as Record<string, unknown>, `${fullKey}[]`, depth + 1);
      if (sub.length) { cols.push(...sub); continue; }
    }
    const type = inferDynType(v);
    const note = Array.isArray(v) ? `array of ${v.length > 0 && typeof v[0] === 'object' ? 'objects' : 'values'}` : (type === 'M' ? 'nested object' : undefined);
    cols.push({ name: fullKey, type, note });
  }
  return cols;
}

/** Detect if the raw JSON is a top-level wrapper object (e.g. {"inventory":[...]}) and unwrap it */
function unwrapTopLevel(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    const keys = Object.keys(obj);
    // If single key whose value is a non-empty array of objects, unwrap
    if (keys.length === 1 && Array.isArray(obj[keys[0]]) && (obj[keys[0]] as unknown[]).length > 0 && typeof (obj[keys[0]] as unknown[])[0] === 'object') {
      return obj[keys[0]];
    }
    // Common schema wrapper keys
    const sub = obj.fields ?? obj.columns ?? obj.properties ?? obj.schema ?? obj.items ?? obj.data ?? obj.records;
    if (sub && (Array.isArray(sub) || typeof sub === 'object')) return sub;
  }
  return raw;
}

function parseSchemaFromJson(raw: unknown): ColDef[] {
  // Unwrap any top-level wrapper first (e.g. {"inventory": [...]})
  const unwrapped = unwrapTopLevel(raw);

  // Explicit column-definition list: [{name, type}] or [{field, dataType}]
  if (Array.isArray(unwrapped) && unwrapped.length > 0 && typeof unwrapped[0] === 'object') {
    const first = unwrapped[0] as Record<string, unknown>;
    if ('name' in first || 'field' in first) {
      return (unwrapped as Record<string, unknown>[])
        .map((r) => ({ name: String(r.name ?? r.field ?? ''), type: String(r.type ?? r.dataType ?? 'S').toUpperCase() }))
        .filter((c) => c.name);
    }
    // Array of data records — flatten first record
    return flattenRecord(first);
  }

  // Array of plain strings
  if (Array.isArray(unwrapped) && typeof unwrapped[0] === 'string') {
    return (unwrapped as string[]).map((n) => ({ name: n, type: 'S' }));
  }

  // Plain object — flatten directly
  if (unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped)) {
    return flattenRecord(unwrapped as Record<string, unknown>);
  }

  return [];
}

function StatusBadge({ label, done, active, error }: { label: string; done: boolean; active: boolean; error: boolean }) {
  const bg    = error ? '#fff0f0' : done ? '#f0fff0' : active ? '#fff8f0' : '#f5f5f5';
  const color = error ? '#c0392b' : done ? '#007030' : active ? '#e67e22' : '#aaa';
  const icon  = error ? '✗' : done ? '✓' : active ? '…' : '○';
  return <span style={{ background: bg, color, border: `1px solid ${color}40`, padding: '0.15rem 0.5rem', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{icon} {label}</span>;
}

function SectionHeader({ num, label, done, children }: { num: number; label: string; done: boolean; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: done ? '#007030' : '#e8e8e8', color: done ? '#FEE11A' : '#666', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>{done ? '✓' : num}</span>
      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#333' }}>{label}</span>
      {children}
    </div>
  );
}

function FileDropZone({ label, accept, onFile }: { label: string; accept: string; onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      onClick={() => inputRef.current?.click()}
      style={{ border: `2px dashed ${dragging ? '#007030' : '#ccc'}`, padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', background: dragging ? '#f0fff0' : '#fafafa', transition: 'border-color 0.15s, background 0.15s', marginBottom: '0.25rem' }}
    >
      <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) { onFile(f); e.target.value = ''; } }} />
      <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>📂 {label}</p>
    </div>
  );
}

function StepPanel({ steps }: { steps: UploadStep[] }) {
  const ICON:  Record<StepStatus, string> = { pending: '○', running: '⏳', done: '✓', error: '✗' };
  const COLOR: Record<StepStatus, string> = { pending: '#aaa', running: '#e67e22', done: '#007030', error: '#c0392b' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '0.5rem 0 0.75rem' }}>
      {steps.map((s, i) => (
        <div key={s.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
            <span style={{ color: COLOR[s.status], fontWeight: 800, fontSize: '0.85rem', width: 16, flexShrink: 0 }}>{ICON[s.status]}</span>
            <span style={{ fontSize: '0.83rem', fontWeight: 700, color: '#333' }}>Step {i + 1} — {s.label}</span>
            {s.detail && <span style={{ fontSize: '0.76rem', color: COLOR[s.status], marginLeft: '0.3rem' }}>{s.detail}</span>}
          </div>
          <pre style={{ margin: '0 0 0 1.25rem', fontSize: '0.73rem', background: s.status === 'running' ? '#fff8f0' : s.status === 'done' ? '#f0fff0' : s.status === 'error' ? '#fff0f0' : '#f5f5f5', border: `1px solid ${s.status === 'running' ? '#e67e22' : s.status === 'done' ? '#cce8cc' : s.status === 'error' ? '#e8cccc' : '#ddd'}`, padding: '0.45rem 0.7rem', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#333', lineHeight: 1.55 }}>{s.cmd}</pre>
        </div>
      ))}
    </div>
  );
}

function DatasetPhase() {
  const LS_KEY = 'uo-ai-dataset-phase';

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as { profile: string; region: string; datasets: TableDataset[] };
    } catch { return null; }
  }

  const saved = loadFromStorage();
  const [dsProfile, setDsProfile] = useState(saved?.profile ?? 'uo-innovation');
  const [dsRegion,  setDsRegion]  = useState(saved?.region  ?? 'us-west-2');
  const [connStatus, setConnStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>(saved?.datasets?.length ? 'connected' : 'idle');
  const [connErr,    setConnErr]    = useState('');
  const [ssoExpired, setSsoExpired] = useState(false);
  const [datasets,   setDatasets]   = useState<TableDataset[]>(saved?.datasets ?? []);

  // Persist profile, region, and dataset state (columns, upload status) to localStorage
  useEffect(() => {
    try {
      // Only persist the schema/data config — strip large records arrays to avoid quota issues
      const slim = datasets.map((d) => ({ ...d, records: [] }));
      localStorage.setItem(LS_KEY, JSON.stringify({ profile: dsProfile, region: dsRegion, datasets: slim }));
    } catch { /* quota exceeded — ignore */ }
  }, [dsProfile, dsRegion, datasets]);

  async function loadTables() {
    setConnStatus('loading'); setConnErr(''); setSsoExpired(false);
    try {
      const authRes  = await fetch(`/api/aws-info?profile=${dsProfile}`);
      const authJson = await authRes.json();
      if (!authJson.ok && authJson.ssoExpired) { setSsoExpired(true); setConnStatus('error'); return; }
      if (!authJson.ok) throw new Error(authJson.error || 'Auth failed');
      const tabRes  = await fetch(`/api/dynamodb-tables?profile=${dsProfile}&region=${dsRegion}`);
      const tabJson = await tabRes.json();
      if (!tabJson.ok) throw new Error(tabJson.error || 'Could not list tables');
      const names: string[] = tabJson.data?.TableNames ?? [];
      setDatasets(names.map((n) => ({ name: n, open: false, schemaStatus: 'empty', schemaFile: '', columns: [], schemaErr: '', schemaSteps: [], dataStatus: 'empty', dataFile: '', records: [], dataErr: '', recordsWritten: 0, dataSteps: [], dataIssues: [] })));
      setConnStatus('connected');
    } catch (e: unknown) { setConnErr((e as Error).message); setConnStatus('error'); }
  }

  function toggleOpen(name: string) { setDatasets((prev) => prev.map((d) => d.name === name ? { ...d, open: !d.open } : d)); }
  function updateDs(name: string, patch: Partial<TableDataset>) { setDatasets((prev) => prev.map((d) => d.name === name ? { ...d, ...patch } : d)); }

  function handleSchemaFile(tableName: string, file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw     = JSON.parse(e.target?.result as string);
        const columns = parseSchemaFromJson(raw);
        if (!columns.length) throw new Error('Could not find any columns in this file');
        const schemaSteps: UploadStep[] = [
          { id: 'parse',    label: 'Parse schema file',            cmd: `# Reading: ${file.name}\n# ${columns.length} column${columns.length !== 1 ? 's' : ''} detected`, status: 'done', detail: `${columns.length} columns` },
          { id: 'map',      label: 'Map to DynamoDB types',        cmd: `# DynamoDB attribute type mapping:\n${columns.map((c) => `#   ${c.name.padEnd(20)} → ${c.type} (${friendlyType(c.type)})`).join('\n')}`, status: 'done', detail: 'types mapped' },
          { id: 'describe', label: 'Verify table exists in AWS',   cmd: `aws dynamodb describe-table \\\n  --profile ${dsProfile} --region ${dsRegion} \\\n  --table-name ${tableName}`, status: 'pending', detail: '' },
        ];
        updateDs(tableName, { schemaStatus: 'parsed', schemaFile: file.name, columns, schemaErr: '', schemaSteps });
        fetch(`/api/dynamodb-table-describe?profile=${dsProfile}&region=${dsRegion}&table=${encodeURIComponent(tableName)}`)
          .then((r) => r.json())
          .then((json) => {
            const keySchema: { AttributeName: string; KeyType: string }[] = json.data?.Table?.KeySchema ?? [];
            const partitionKey = keySchema.find((k: { KeyType: string }) => k.KeyType === 'HASH')?.AttributeName;
            setDatasets((prev) => prev.map((d) => d.name !== tableName ? d : {
              ...d,
              schemaStatus: json.ok ? 'locked' : 'error',
              schemaErr: json.ok ? '' : (json.error ?? 'Table not found'),
              tableKey: json.ok && partitionKey ? partitionKey : d.tableKey,
              schemaSteps: d.schemaSteps.map((s) => s.id === 'describe' ? { ...s, status: json.ok ? 'done' : 'error', detail: json.ok ? `Table active · key: ${partitionKey ?? '?'} · ${json.data?.Table?.ItemCount ?? 0} records` : (json.error ?? 'Error') } : s),
            }));
          })
          .catch(() => { setDatasets((prev) => prev.map((d) => d.name !== tableName ? d : { ...d, schemaStatus: 'error', schemaErr: 'Network error', schemaSteps: d.schemaSteps.map((s) => s.id === 'describe' ? { ...s, status: 'error', detail: 'Network error' } : s) })); });
      } catch (err: unknown) { updateDs(tableName, { schemaStatus: 'error', schemaErr: (err as Error).message, columns: [], schemaSteps: [] }); }
    };
    reader.readAsText(file);
  }

  function handleDataFile(tableName: string, file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let records: Record<string, unknown>[];
        if (file.name.toLowerCase().endsWith('.csv')) {
          const lines = text.split(/\r?\n/).filter((l) => l.trim());
          if (lines.length < 2) throw new Error('CSV file must have a header row and at least one data row');
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
          records = lines.slice(1).map((line) => {
            const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|(?<=,)$|^(?=,))/g) ?? line.split(',');
            const out: Record<string, unknown> = {};
            headers.forEach((h, i) => {
              const raw = (vals[i] ?? '').trim().replace(/^"|"$/g, '');
              // Coerce numeric strings to numbers
              out[h] = raw === '' ? '' : isNaN(Number(raw)) || raw === '' ? raw : Number(raw);
            });
            return out;
          });
        } else {
          const raw = JSON.parse(text);
          records = Array.isArray(raw) ? raw : (raw.items ?? raw.data ?? raw.records ?? [raw]);
        }
        if (!records.length) throw new Error('No records found in file');
        const ds = datasets.find((d) => d.name === tableName);
        const dataIssues = validateRecords(records, ds?.columns ?? [], ds?.tableKey);
        const hasErrors  = dataIssues.some((x) => x.severity === 'error');
        const dataSteps: UploadStep[] = [
          { id: 'parse',    label: 'Parse data file',                  cmd: `# Reading: ${file.name}\n# ${records.length} record${records.length !== 1 ? 's' : ''} found`, status: 'done', detail: `${records.length} records` },
          { id: 'validate', label: 'Validate records',                  cmd: ds?.columns.length ? `# Checking records against schema:\n${ds.columns.map((c) => `#   ${c.name}`).join('\n')}\n# ${dataIssues.length === 0 ? 'All records validated ✓' : `${dataIssues.filter((x) => x.severity === 'error').length} error(s), ${dataIssues.filter((x) => x.severity === 'warn').length} warning(s) found`}` : `# ${records.length} records ready for upload`, status: hasErrors ? 'error' : dataIssues.length ? 'done' : 'done', detail: hasErrors ? `${dataIssues.filter((x) => x.severity === 'error').length} errors` : dataIssues.length ? `${dataIssues.length} warnings` : 'all valid' },
          { id: 'write',    label: 'Write to DynamoDB (batch_writer)',  cmd: `import boto3\nsession = boto3.Session(profile_name='${dsProfile}')\ndb = session.resource('dynamodb', region_name='${dsRegion}')\ntable = db.Table('${tableName}')\n\n# Writing ${records.length} records in batches of 25\nwith table.batch_writer() as batch:\n    for item in records:  # ${records.length} items\n        batch.put_item(Item=item)`, status: 'pending', detail: '' },
          { id: 'confirm',  label: 'Confirm records written',           cmd: `aws dynamodb scan \\\n  --profile ${dsProfile} --region ${dsRegion} \\\n  --table-name ${tableName} \\\n  --select COUNT --output json`, status: 'pending', detail: '' },
        ];
        updateDs(tableName, { dataStatus: 'parsed', dataFile: file.name, records, dataErr: '', dataSteps, dataIssues });
      } catch (err: unknown) { updateDs(tableName, { dataStatus: 'error', dataErr: (err as Error).message, records: [], dataSteps: [], dataIssues: [] }); }
    };
    reader.readAsText(file);
  }

  async function runDataUpload(tableName: string) {
    const ds = datasets.find((d) => d.name === tableName);
    if (!ds || !ds.records.length) return;
    updateDs(tableName, { dataStatus: 'uploading' });
    setDatasets((prev) => prev.map((d) => d.name !== tableName ? d : { ...d, dataSteps: d.dataSteps.map((s) => s.id === 'write' ? { ...s, status: 'running' } : s) }));
    try {
      const res  = await fetch('/api/dynamodb-batch-write', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile: dsProfile, region: dsRegion, table: tableName, items: ds.records }) });
      const json = await res.json();
      const errMsg = json.error || 'Write failed';
      if (!json.ok) throw new Error(errMsg);
      const written = json.data?.written ?? ds.records.length;
      setDatasets((prev) => prev.map((d) => d.name !== tableName ? d : { ...d, dataSteps: d.dataSteps.map((s) => { if (s.id === 'write') return { ...s, status: 'done', detail: `${written} records written` }; if (s.id === 'confirm') return { ...s, status: 'running' }; return s; }) }));
      const countRes  = await fetch(`/api/dynamodb-table-count?profile=${dsProfile}&region=${dsRegion}&table=${encodeURIComponent(tableName)}`);
      const countJson = await countRes.json();
      const finalCount = countJson.ok ? (countJson.data?.Count ?? written) : written;
      setDatasets((prev) => prev.map((d) => d.name !== tableName ? d : { ...d, dataStatus: 'done', recordsWritten: finalCount, dataSteps: d.dataSteps.map((s) => s.id === 'confirm' ? { ...s, status: 'done', detail: `${finalCount} total in table`, cmd: s.cmd + `\n# → ${finalCount} records confirmed in DynamoDB` } : s) }));
    } catch (e: unknown) {
      setDatasets((prev) => prev.map((d) => d.name !== tableName ? d : { ...d, dataStatus: 'error', dataErr: (e as Error).message, dataIssues: d.dataIssues, dataSteps: d.dataSteps.map((s) => s.id === 'write' && s.status === 'running' ? { ...s, status: 'error', detail: parseUploadError((e as Error).message).headline } : s) }));
    }
  }

  return (
    <div className="ai-phase-body">
      <p className="design-phase-intro">
        Your tables are set up. Now upload a <strong>JSON schema</strong> for each table to lock in
        the column structure, then upload your <strong>synthetic data</strong> to populate it.
        Every step shows the exact AWS command being run.
      </p>

      {/* Mini connect */}
      {connStatus !== 'connected' && (
        <div className="ai-connect-card">
          <h3 className="ai-connect-heading">
            Load Your Tables
            <InfoBubble>
              <strong>Why do I need to connect again?</strong>
              <p style={{ margin: '0.4rem 0 0' }}>This phase loads the list of DynamoDB tables you created in Phase 1 so you can upload data for each one.</p>
              <p style={{ margin: '0.5rem 0 0' }}>Use the same <strong>profile</strong> (<code>uo-innovation</code>) and <strong>region</strong> (<code>us-west-2</code>) as Phase 1.</p>
            </InfoBubble>
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AWS Profile</span>
              <input value={dsProfile} onChange={(e) => setDsProfile(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #ccc', fontSize: '0.9rem', width: 180 }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</span>
              <input value={dsRegion} onChange={(e) => setDsRegion(e.target.value)} style={{ padding: '0.4rem 0.6rem', border: '1px solid #ccc', fontSize: '0.9rem', width: 140 }} />
            </label>
            <button onClick={loadTables} disabled={connStatus === 'loading'} style={{ background: '#007030', color: '#FEE11A', border: 'none', padding: '0.45rem 1.25rem', fontWeight: 800, fontSize: '0.9rem', cursor: connStatus === 'loading' ? 'not-allowed' : 'pointer' }}>
              {connStatus === 'loading' ? '⏳ Loading…' : '🔌 Load Tables from DynamoDB'}
            </button>
          </div>
          {ssoExpired && (
            <div style={{ padding: '0.75rem 1rem', background: '#fffbea', border: '1px solid #f4c95d' }}>
              <p style={{ fontWeight: 700, margin: '0 0 0.3rem' }}>🌐 AWS SSO session expired — login opened in your browser</p>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#555' }}>Complete sign-in then click <strong>Load Tables from DynamoDB</strong> again.</p>
            </div>
          )}
          {connStatus === 'error' && !ssoExpired && <p style={{ color: '#c0392b', fontSize: '0.86rem', margin: 0 }}>✗ {connErr}</p>}
        </div>
      )}

      {connStatus === 'connected' && (
        <>
          <div className="ai-connected-banner" style={{ marginBottom: '1.5rem' }}>
            <span className="ai-connected-dot">●</span>
            <strong>Connected</strong>
            <span className="ai-connected-sub">{dsProfile} · {dsRegion} · {datasets.length} table{datasets.length !== 1 ? 's' : ''}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setConnStatus('idle'); setDatasets([]); }} style={{ background: 'none', border: '1px solid #ccc', cursor: 'pointer', fontSize: '0.78rem', padding: '0.2rem 0.6rem', color: '#555' }}>Disconnect</button>
              <button onClick={() => { if (window.confirm('Clear all saved schema and upload progress?')) { localStorage.removeItem('uo-ai-dataset-phase'); setDatasets([]); setConnStatus('idle'); } }} style={{ background: 'none', border: '1px solid #e67e22', cursor: 'pointer', fontSize: '0.78rem', padding: '0.2rem 0.6rem', color: '#e67e22' }}>↺ Clear Saved State</button>
            </div>
          </div>

          {datasets.length === 0 ? (
            <p style={{ color: '#888', fontSize: '0.88rem' }}>No tables found in {dsRegion}. Go to <strong>Phase 1</strong> to create your tables first.</p>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 11, top: 20, bottom: 20, width: 2, background: '#e0e0e0', zIndex: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {datasets.map((ds) => {
                  const schemaOk  = ds.schemaStatus === 'locked';
                  const dataOk    = ds.dataStatus   === 'done';
                  const inProg    = !dataOk && (ds.open || ds.schemaStatus !== 'empty' || ds.dataStatus !== 'empty');
                  const dotBorder = dataOk ? '#007030' : inProg ? '#e67e22' : '#ccc';
                  return (
                    <div key={ds.name} style={{ position: 'relative', paddingLeft: 36 }}>
                      <div style={{ position: 'absolute', left: 4, top: 15, width: 16, height: 16, borderRadius: '50%', background: dataOk ? '#007030' : 'transparent', border: `2.5px solid ${dotBorder}`, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dataOk && <span style={{ color: '#fff', fontSize: '0.58rem', fontWeight: 900 }}>✓</span>}
                      </div>
                      <div style={{ border: `1px solid ${ds.open ? '#007030' : '#e0e0e0'}`, background: '#fff', transition: 'border-color 0.15s' }}>
                        <button onClick={() => toggleOpen(ds.name)} style={{ width: '100%', background: ds.open ? '#f5fff5' : '#fafafa', border: 'none', borderBottom: ds.open ? '1px solid #e0e0e0' : 'none', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', textAlign: 'left' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.92rem', color: '#222', flex: 1 }}>{ds.name}</span>
                          <span style={{ display: 'flex', gap: '0.4rem' }}>
                            <StatusBadge label="Schema" done={schemaOk} active={ds.schemaStatus === 'parsed'} error={ds.schemaStatus === 'error'} />
                            <StatusBadge label="Data"   done={dataOk}   active={ds.dataStatus === 'parsed' || ds.dataStatus === 'uploading'} error={ds.dataStatus === 'error'} />
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#bbb' }}>{ds.open ? '▲' : '▼'}</span>
                        </button>

                        {ds.open && (
                          <div style={{ padding: '1rem 1rem 1.25rem' }}>

                            {/* ── SCHEMA ── */}
                            <SectionHeader num={1} label="Define Schema" done={schemaOk}>
                              <InfoBubble>
                                <strong>What is a schema?</strong>
                                <p style={{ margin: '0.4rem 0 0' }}>A schema lists the <em>columns</em> (attributes) your records will have and their data types.</p>
                                <p style={{ margin: '0.5rem 0 0' }}>DynamoDB is schema-less — only the primary key has a declared type — but defining a schema here lets the app validate your data before writing it.</p>
                                <p style={{ margin: '0.5rem 0 0' }}>Accepted JSON formats:</p>
                                <ul style={{ paddingLeft: '1.1rem', margin: '0.25rem 0 0', fontSize: '0.78rem' }}>
                                  <li><code>[&#123;"name":"id","type":"S"&#125;]</code> — explicit list</li>
                                  <li><code>[&#123;"id":"abc","make":"Toyota"&#125;]</code> — a sample record (types inferred)</li>
                                  <li><code>&#123;"columns":["id","name"]&#125;</code> — names only</li>
                                </ul>
                              </InfoBubble>
                            </SectionHeader>

                            {ds.schemaStatus === 'empty' && <FileDropZone label="Drop JSON schema file here or click to browse" accept=".json" onFile={(f) => handleSchemaFile(ds.name, f)} />}
                            {ds.schemaSteps.length > 0 && <StepPanel steps={ds.schemaSteps} />}

                            {(ds.schemaStatus === 'parsed' || ds.schemaStatus === 'locked') && ds.columns.length > 0 && (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                  <span style={{ fontSize: '0.82rem', color: ds.schemaStatus === 'locked' ? '#007030' : '#e67e22', fontWeight: 700 }}>
                                    {ds.schemaStatus === 'locked' ? '✓' : '…'} {ds.columns.length} columns detected
                                  </span>
                                  {ds.schemaStatus === 'locked' && <span style={{ fontSize: '0.76rem', color: '#aaa' }}>— edit types below if needed</span>}
                                  <button
                                    onClick={() => updateDs(ds.name, { schemaStatus: 'empty', columns: [], schemaFile: '', schemaSteps: [] })}
                                    style={{ marginLeft: 'auto', background: 'none', border: '1px solid #ccc', fontSize: '0.73rem', color: '#888', padding: '0.2rem 0.55rem', cursor: 'pointer' }}
                                  >↺ Reset Schema</button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', marginBottom: '0.5rem' }}>
                                  <thead><tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                    <th style={{ padding: '0.35rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#444' }}>Column (dot path)</th>
                                    <th style={{ padding: '0.35rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#444', width: 140 }}>
                                    DynamoDB Type
                                    <InfoBubble>
                                      <strong>Does changing the type update DynamoDB?</strong>
                                      <p style={{ margin: '0.4rem 0 0' }}>No — DynamoDB is <em>schema-less</em>. Only the primary key attribute type is declared at table creation. All other attributes can hold any type and DynamoDB does not enforce them.</p>
                                      <p style={{ margin: '0.5rem 0 0' }}>Changing the type here updates your <strong>local schema config only</strong> — it is used to validate your data before upload and to document the intended types for your team. No AWS call is made.</p>
                                      <p style={{ margin: '0.5rem 0 0' }}>Your changes are saved automatically in your browser (<code>localStorage</code>) and will persist across page reloads and navigation.</p>
                                    </InfoBubble>
                                  </th>
                                    <th style={{ padding: '0.35rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#444', width: 90 }}>Friendly</th>
                                    <th style={{ padding: '0.35rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#444' }}>Note</th>
                                  </tr></thead>
                                  <tbody>{ds.columns.map((c, i) => (
                                    <tr key={c.name} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                      <td style={{ padding: '0.3rem 0.75rem', fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>{c.name}</td>
                                      <td style={{ padding: '0.2rem 0.5rem' }}>
                                        <select
                                          value={c.type}
                                          onChange={(e) => updateDs(ds.name, {
                                            columns: ds.columns.map((col) => col.name === c.name ? { ...col, type: e.target.value } : col),
                                          })}
                                          style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#007030', fontWeight: 700, border: '1px solid #cce8cc', padding: '0.15rem 0.3rem', background: '#f0fff0', width: '100%', cursor: 'pointer' }}
                                        >
                                          {['S','N','BOOL','L','M','NULL','B'].map((t) => (
                                            <option key={t} value={t}>{t} — {friendlyType(t)}</option>
                                          ))}
                                        </select>
                                      </td>
                                      <td style={{ padding: '0.3rem 0.75rem', color: '#666' }}>{friendlyType(c.type)}</td>
                                      <td style={{ padding: '0.3rem 0.75rem', color: '#999', fontSize: '0.76rem', fontStyle: 'italic' }}>{c.note ?? ''}</td>
                                    </tr>
                                  ))}</tbody>
                                </table>
                              </>
                            )}
                            {ds.schemaStatus === 'error' && (
                              <div style={{ marginBottom: '0.5rem' }}>
                                <p style={{ color: '#c0392b', fontSize: '0.83rem', margin: '0 0 0.3rem' }}>✗ {ds.schemaErr}</p>
                                <button onClick={() => updateDs(ds.name, { schemaStatus: 'empty', columns: [], schemaFile: '', schemaSteps: [] })} style={{ background: 'none', border: '1px solid #ccc', fontSize: '0.8rem', color: '#555', padding: '0.3rem 0.75rem', cursor: 'pointer' }}>Try again</button>
                              </div>
                            )}

                            {/* ── DATA ── */}
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed #eee' }}>
                              <SectionHeader num={2} label="Upload Synthetic Data" done={dataOk}>
                                <InfoBubble>
                                  <strong>What data format should I use?</strong>
                                  <p style={{ margin: '0.4rem 0 0' }}>Upload a <strong>JSON</strong> array or a <strong>CSV</strong> file. Column names must match your schema.</p>
                                  <p style={{ margin: '0.4rem 0 0', fontWeight: 700 }}>JSON:</p>
                                  <pre style={{ background: '#f5f5f5', padding: '0.4rem', fontSize: '0.75rem', margin: '0.2rem 0 0', overflowX: 'auto' }}>{`[\n  {"id": "1", "make": "Toyota"},\n  {"id": "2", "make": "Honda"}\n]`}</pre>
                                  <p style={{ margin: '0.5rem 0 0', fontWeight: 700 }}>CSV:</p>
                                  <pre style={{ background: '#f5f5f5', padding: '0.4rem', fontSize: '0.75rem', margin: '0.2rem 0 0', overflowX: 'auto' }}>{`id,make\n1,Toyota\n2,Honda`}</pre>
                                  <p style={{ margin: '0.5rem 0 0' }}>Numeric CSV values are auto-coerced to numbers. Records are written using Python <code>boto3</code> <code>batch_writer</code> in batches of 25.</p>
                                </InfoBubble>
                              </SectionHeader>

                              {ds.dataStatus === 'empty' && <FileDropZone label="Drop JSON or CSV file here or click to browse" accept=".json,.csv" onFile={(f) => handleDataFile(ds.name, f)} />}
                              {ds.dataSteps.length > 0 && <StepPanel steps={ds.dataSteps} />}

                              {/* Validation issues panel */}
                              {ds.dataStatus === 'parsed' && ds.dataIssues.length > 0 && (() => {
                                const errors = ds.dataIssues.filter((x) => x.severity === 'error');
                                const warns  = ds.dataIssues.filter((x) => x.severity === 'warn');
                                return (
                                  <div style={{ margin: '0.5rem 0', padding: '0.75rem 1rem', background: errors.length ? '#fff4f4' : '#fffbea', border: `1px solid ${errors.length ? '#e8b4b4' : '#f4c95d'}` }}>
                                    <p style={{ fontWeight: 700, margin: '0 0 0.4rem', fontSize: '0.85rem', color: errors.length ? '#c0392b' : '#b7770a' }}>
                                      {errors.length ? `⚠ ${errors.length} error${errors.length > 1 ? 's' : ''} found` : `ℹ ${warns.length} warning${warns.length > 1 ? 's' : ''}`}
                                      {errors.length ? ' — fix these before uploading' : ' — review before uploading'}
                                    </p>
                                    <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', lineHeight: 1.7 }}>
                                      {ds.dataIssues.map((issue, idx) => (
                                        <li key={idx} style={{ color: issue.severity === 'error' ? '#c0392b' : '#888' }}>
                                          {issue.record > 0 && <span style={{ fontFamily: 'monospace', marginRight: '0.35rem', opacity: 0.7 }}>row {issue.record}:</span>}
                                          {issue.message}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })()}

                              {ds.dataStatus === 'parsed' && (() => {
                                const hasErrors = ds.dataIssues.some((x) => x.severity === 'error');
                                return (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#555' }}>{ds.records.length} records ready</span>
                                    <button
                                      onClick={() => runDataUpload(ds.name)}
                                      style={{ background: hasErrors ? '#aaa' : '#007030', color: '#FEE11A', border: 'none', padding: '0.45rem 1.25rem', fontWeight: 800, fontSize: '0.88rem', cursor: hasErrors ? 'not-allowed' : 'pointer', opacity: hasErrors ? 0.7 : 1 }}
                                      disabled={hasErrors}
                                      title={hasErrors ? 'Fix the errors above before uploading' : undefined}
                                    >▶ Upload to DynamoDB</button>
                                    {hasErrors && <span style={{ fontSize: '0.78rem', color: '#c0392b' }}>Fix errors above first</span>}
                                    <button onClick={() => updateDs(ds.name, { dataStatus: 'empty', records: [], dataFile: '', dataSteps: [], dataIssues: [] })} style={{ background: 'none', border: '1px solid #ccc', fontSize: '0.8rem', color: '#555', padding: '0.3rem 0.75rem', cursor: 'pointer' }}>Reset</button>
                                  </div>
                                );
                              })()}
                              {ds.dataStatus === 'uploading' && <p style={{ fontSize: '0.86rem', color: '#e67e22', margin: '0.25rem 0' }}>⏳ Uploading to DynamoDB…</p>}
                              {ds.dataStatus === 'done' && (() => {
                                async function loadPreview() {
                                  updateDs(ds.name, { previewLoading: true, previewErr: undefined });
                                  try {
                                    const r = await fetch(`/api/dynamodb-table-scan?profile=${dsProfile}&region=${dsRegion}&table=${encodeURIComponent(ds.name)}&limit=50`);
                                    const j = await r.json();
                                    if (!j.ok) throw new Error(j.error || 'Scan failed');
                                    updateDs(ds.name, { previewRows: j.data?.items ?? [], previewOpen: true, previewLoading: false });
                                  } catch (e: unknown) { updateDs(ds.name, { previewLoading: false, previewErr: (e as Error).message, previewOpen: true }); }
                                }
                                const cols = ds.previewRows?.length
                                  ? Object.keys(ds.previewRows[0]).filter((k) => typeof ds.previewRows![0][k] !== 'object' || ds.previewRows![0][k] === null).slice(0, 10)
                                  : [];
                                return (
                                  <div style={{ marginTop: '0.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <span style={{ fontSize: '0.82rem', color: '#007030', fontWeight: 700 }}>✓ {ds.recordsWritten.toLocaleString()} records in DynamoDB</span>
                                      <button
                                        onClick={() => ds.previewOpen ? updateDs(ds.name, { previewOpen: false }) : loadPreview()}
                                        style={{ background: '#007030', color: '#FEE11A', border: 'none', fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.65rem', cursor: 'pointer' }}
                                      >{ds.previewLoading ? '⏳ Loading…' : ds.previewOpen ? '▲ Hide Data' : '▼ View Data'}</button>
                                      <button onClick={() => updateDs(ds.name, { dataStatus: 'empty', records: [], dataFile: '', dataSteps: [], dataIssues: [], recordsWritten: 0, previewRows: undefined, previewOpen: false })} style={{ background: 'none', border: '1px solid #ccc', fontSize: '0.73rem', color: '#888', padding: '0.15rem 0.45rem', cursor: 'pointer' }}>Re-upload</button>
                                    </div>
                                    {ds.previewOpen && (
                                      <div style={{ marginTop: '0.75rem', overflowX: 'auto', border: '1px solid #ddd' }}>
                                        {ds.previewErr && <p style={{ color: '#c0392b', padding: '0.5rem', fontSize: '0.82rem', margin: 0 }}>✗ {ds.previewErr}</p>}
                                        {ds.previewRows && ds.previewRows.length > 0 && (
                                          <>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                              <thead>
                                                <tr style={{ background: '#007030', color: '#FEE11A' }}>
                                                  {cols.map((c) => <th key={c} style={{ padding: '0.4rem 0.6rem', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{c}</th>)}
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {ds.previewRows.map((row, ri) => (
                                                  <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #eee' }}>
                                                    {cols.map((c) => {
                                                      const v = row[c];
                                                      return <td key={c} style={{ padding: '0.35rem 0.6rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#333' }} title={String(v ?? '')}>{v === null || v === undefined ? <em style={{ color: '#aaa' }}>null</em> : String(v)}</td>;
                                                    })}
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                            <p style={{ margin: 0, padding: '0.3rem 0.6rem', fontSize: '0.73rem', color: '#888', background: '#f5f5f5', borderTop: '1px solid #eee' }}>
                                              Showing {ds.previewRows.length} of {ds.recordsWritten} records · {cols.length < Object.keys(ds.previewRows[0]).length ? `${cols.length} of ${Object.keys(ds.previewRows[0]).length} columns shown (nested objects omitted)` : `${cols.length} columns`}
                                            </p>
                                          </>
                                        )}
                                        {ds.previewRows && ds.previewRows.length === 0 && <p style={{ padding: '0.5rem', fontSize: '0.82rem', color: '#888', margin: 0 }}>No records found in table.</p>}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                              {ds.dataStatus === 'error' && (() => {
                                const parsed = parseUploadError(ds.dataErr);
                                return (
                                  <div style={{ marginTop: '0.5rem', padding: '0.75rem 1rem', background: '#fff4f4', border: '1px solid #e8b4b4' }}>
                                    <p style={{ fontWeight: 800, margin: '0 0 0.25rem', fontSize: '0.88rem', color: '#c0392b' }}>✗ {parsed.headline}</p>
                                    <p style={{ margin: '0 0 0.6rem', fontSize: '0.83rem', color: '#555', lineHeight: 1.6 }}>{parsed.hint}</p>
                                    <details style={{ fontSize: '0.75rem' }}>
                                      <summary style={{ cursor: 'pointer', color: '#888', marginBottom: '0.3rem' }}>Show raw error</summary>
                                      <pre style={{ margin: 0, background: '#f5f5f5', padding: '0.5rem', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#c0392b', border: '1px solid #eee' }}>{ds.dataErr}</pre>
                                    </details>
                                    <button onClick={() => updateDs(ds.name, { dataStatus: 'empty', records: [], dataFile: '', dataSteps: [], dataIssues: [] })} style={{ marginTop: '0.6rem', background: 'none', border: '1px solid #ccc', fontSize: '0.8rem', color: '#555', padding: '0.3rem 0.75rem', cursor: 'pointer' }}>↺ Try again</button>
                                  </div>
                                );
                              })()}
                            </div>

                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <NotesEditor defaultFileName="ai:datasets" title="Dataset Notes" />
    </div>
  );
}

// ─── Phase 3 — Train AI Model ───────────────────────────────────

type LogLine = { text: string; err?: boolean };

const LITHIA_TABLES = ['lithia-vehicles', 'lithia-financing', 'lithia-insurance', 'lithia-members', 'lithia-services', 'lithia-member-financing', 'lithia-member-insurance', 'lithia-member-rentals'];

const PREPARE_CMD = (tables: string[]) =>
`python scripts/prepare_data.py \\
  --source dynamodb \\
  --profile uo-innovation \\
  --tables ${tables.join(' ')} \\
  --output-dir data/processed`;

const TRAIN_CMD =
`python scripts/train.py \\
  --config configs/lora_config.yaml \\
  --data data/processed/train.jsonl \\
  --output models/lithia-lora`;

const INFERENCE_CMD =
`python scripts/inference.py \\
  --model models/lithia-lora`;

function LogPanel({ lines, logRef }: { lines: LogLine[]; logRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div ref={logRef} style={{ background: '#1a1a1a', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.7, padding: '0.6rem 0.85rem', maxHeight: '320px', overflowY: 'auto', marginTop: '0.5rem', border: '1px solid #333' }}>
      {lines.length === 0 && <span style={{ color: '#666' }}>Waiting for output…</span>}
      {lines.map((l, i) => (
        <div key={i} style={{ color: l.err ? '#f48771' : '#d4d4d4', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{l.text}</div>
      ))}
    </div>
  );
}

type ChatMessage = { role: 'user' | 'assistant'; text: string; loading?: boolean };

function TrainPhase() {
  const [selectedTables, setSelectedTables] = useState<string[]>(['lithia-vehicles']);
  const [confirmed, setConfirmed] = useState(false);
  const [stepStatus, setStepStatus] = useState<Record<string, 'idle' | 'running' | 'done' | 'error'>>({});
  const [stepLogs, setStepLogs] = useState<Record<string, LogLine[]>>({});
  const [logsOpen, setLogsOpen] = useState<Record<string, boolean>>({});
  const esRef = useRef<Record<string, EventSource | null>>({});
  const logElRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  function appendLog(id: string, line: LogLine) {
    setStepLogs((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), line] }));
    setTimeout(() => { const el = logElRef.current[id]; if (el) el.scrollTop = el.scrollHeight; }, 0);
  }

  function runScript(id: string) {
    esRef.current[id]?.close();
    setStepLogs((prev) => ({ ...prev, [id]: [] }));
    setStepStatus((prev) => ({ ...prev, [id]: 'running' }));
    setLogsOpen((prev) => ({ ...prev, [id]: true }));

    const params = new URLSearchParams({ script: id, profile: 'uo-innovation', region: 'us-west-2' });
    if (id === 'prepare') params.set('tables', selectedTables.join(','));

    const es = new EventSource(`/api/train-stream?${params}`);
    esRef.current[id] = es;
    es.addEventListener('line', (e) => { const d = JSON.parse((e as MessageEvent).data); appendLog(id, { text: d.text, err: d.err }); });
    es.addEventListener('done', () => { setStepStatus((prev) => ({ ...prev, [id]: 'done' })); es.close(); });
    es.addEventListener('fail', (e) => {
      try { const d = JSON.parse((e as MessageEvent).data); appendLog(id, { text: `Process exited with code ${d.code}`, err: true }); } catch {}
      setStepStatus((prev) => ({ ...prev, [id]: 'error' })); es.close();
    });
    es.onerror = () => { appendLog(id, { text: 'Connection error — is the api-server running?', err: true }); setStepStatus((prev) => ({ ...prev, [id]: 'error' })); es.close(); };
  }

  function sendPrompt() {
    const q = chatInput.trim();
    if (!q || chatBusy) return;
    setChatInput('');
    setChatBusy(true);
    setChatMessages((prev) => [...prev, { role: 'user', text: q }, { role: 'assistant', text: '', loading: true }]);
    setTimeout(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 0);

    const params = new URLSearchParams({ prompt: q, profile: 'uo-innovation', region: 'us-west-2', tables: selectedTables.join(',') });
    const es = new EventSource(`/api/infer-prompt?${params}`);
    let buf = '';
    es.addEventListener('token', (e) => {
      const d = JSON.parse((e as MessageEvent).data);
      buf += d.text;
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', text: buf, loading: true };
        return updated;
      });
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    const finish = () => {
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', text: buf || '(no response)', loading: false };
        return updated;
      });
      setChatBusy(false);
      es.close();
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    es.addEventListener('done', finish);
    es.addEventListener('fail', (e) => {
      try { const d = JSON.parse((e as MessageEvent).data); buf = d.message || 'Error running inference.'; } catch { buf = 'Error running inference.'; }
      finish();
    });
    es.onerror = () => { buf = buf || 'Connection error — is the api-server running?'; finish(); };
  }

  const runSteps = [
    { id: 'setup',    num: 2, title: 'Set up Python environment (one-time)', desc: 'Creates a local virtual environment (.venv-train) and installs all required packages — PyTorch, Transformers, PEFT, accelerate, boto3, and more. Works automatically on Windows, macOS, and Linux. Run this once before anything else.', cmd: 'python3 -m venv .venv-train && pip install -r requirements.txt', disabled: false },
    { id: 'download', num: 3, title: 'Download base model (~2.2 GB, one-time)', desc: 'Downloads TinyLlama 1.1B from HuggingFace and caches it to disk. Only needed once — subsequent runs skip the download.', cmd: 'python scripts/download_model.py', disabled: false },
    { id: 'prepare',  num: 4, title: 'Prepare training data', desc: `Scans your selected DynamoDB table${selectedTables.length !== 1 ? 's' : ''} and converts each record into instruction–response pairs formatted for TinyLlama's chat template. Output saved to data/processed/train.jsonl.`, cmd: PREPARE_CMD(selectedTables), disabled: !confirmed },
    { id: 'train',    num: 5, title: 'Fine-tune TinyLlama with LoRA', desc: 'Freezes TinyLlama\'s 1.1B weights, injects small trainable LoRA adapter matrices, and trains only those (~4M params, ~0.4% of model). Runs on CPU — expect 30–90 min. Watch the loss number fall each epoch.', cmd: TRAIN_CMD, disabled: !confirmed },
    { id: 'infer',    num: 6, title: 'Verify with inference', desc: 'Loads the trained LoRA adapter on top of TinyLlama and runs sample dealership prompts to confirm the model learned from your data.', cmd: INFERENCE_CMD, disabled: !confirmed },
  ];

  const statusIcon: Record<string, string> = { idle: '○', running: '⏳', done: '✓', error: '✗' };
  const statusColor: Record<string, string> = { idle: '#888', running: '#e67e22', done: '#007030', error: '#c0392b' };

  return (
    <div className="ai-phase-body">

      {/* Concept intro cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ padding: '1rem 1.1rem', background: '#f0f7ff', border: '1px solid #c2d9f5' }}>
          <p style={{ fontWeight: 800, margin: '0 0 0.5rem', fontSize: '1rem', color: '#1a4a7a' }}>🧠 What is TinyLlama?</p>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.8, color: '#333' }}>
            TinyLlama is an open-source language model with <strong>1.1 billion parameters</strong> — numerical weights trained on 3 trillion tokens of text. "Parameters" are the values the model uses to predict the next word; more parameters means more capacity to understand nuance. At 1.1B it is small enough to run on a laptop CPU (no GPU needed) while still understanding industry-specific language when fine-tuned on your data.
          </p>
        </div>
        <div style={{ padding: '1rem 1.1rem', background: '#f5f0ff', border: '1px solid #d4c2f5' }}>
          <p style={{ fontWeight: 800, margin: '0 0 0.5rem', fontSize: '1rem', color: '#4a1a7a' }}>⚡ What is LoRA?</p>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.8, color: '#333' }}>
            LoRA (<strong>Low-Rank Adaptation</strong>) is a fine-tuning method that avoids retraining all 1.1B weights. Instead it inserts tiny <em>adapter matrices</em> alongside the frozen model — only ~4 million parameters are trained (~0.4%). This slashes memory, compute, and time by orders of magnitude. The output is a small adapter file (~10 MB) that snaps onto the base model, turning a general assistant into a Lithia Motors domain expert.
          </p>
        </div>
      </div>

      {/* Step 1 — Select tables */}
      <div style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', background: '#f9f9f9', border: `1px solid ${confirmed ? '#007030' : '#ddd'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
          <span style={{ background: confirmed ? '#007030' : '#555', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>{confirmed ? '✓' : '1'}</span>
          <strong style={{ fontSize: '1rem' }}>Select tables to train on</strong>
          {confirmed && <span style={{ fontSize: '0.88rem', color: '#007030', fontWeight: 700 }}>{selectedTables.join(', ')}</span>}
        </div>
        {!confirmed && (
          <>
            <p style={{ fontSize: '0.9rem', color: '#555', margin: '0 0 0.65rem', lineHeight: 1.7 }}>Choose which DynamoDB tables to pull training data from. Each record becomes instruction–response pairs that teach TinyLlama about your dealership domain.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.7rem' }}>
              {LITHIA_TABLES.map((t) => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.88rem', cursor: 'pointer', padding: '0.3rem 0.75rem', border: `1px solid ${selectedTables.includes(t) ? '#007030' : '#ccc'}`, background: selectedTables.includes(t) ? '#e8f5ee' : '#fff', userSelect: 'none' }}>
                  <input type="checkbox" checked={selectedTables.includes(t)} onChange={() => setSelectedTables((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])} style={{ accentColor: '#007030' }} />
                  {t}
                </label>
              ))}
            </div>
            <button onClick={() => setConfirmed(true)} disabled={!selectedTables.length} style={{ background: selectedTables.length ? '#007030' : '#aaa', color: '#FEE11A', border: 'none', padding: '0.5rem 1.25rem', fontWeight: 800, fontSize: '0.92rem', cursor: selectedTables.length ? 'pointer' : 'not-allowed' }}>
              ✓ Confirm Selection
            </button>
          </>
        )}
        {confirmed && <button onClick={() => setConfirmed(false)} style={{ background: 'none', border: '1px solid #ccc', fontSize: '0.85rem', color: '#555', padding: '0.25rem 0.7rem', cursor: 'pointer', marginTop: '0.25rem' }}>Change tables</button>}
      </div>

      {/* Steps 2–5 — run buttons + live log */}
      {runSteps.map(({ id, num, title, desc, cmd, disabled }) => {
        const st = stepStatus[id] ?? 'idle';
        const lg = stepLogs[id] ?? [];
        const open = logsOpen[id] ?? false;
        return (
          <div key={id} style={{ marginBottom: '1.1rem', padding: '1rem 1.25rem', background: '#f9f9f9', border: `1px solid ${st === 'done' ? '#007030' : st === 'error' ? '#e8b4b4' : '#ddd'}`, opacity: disabled ? 0.45 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ background: st === 'done' ? '#007030' : st === 'error' ? '#c0392b' : '#555', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800, flexShrink: 0 }}>{num}</span>
              <strong style={{ fontSize: '1rem', flex: 1 }}>{title}</strong>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: statusColor[st] }}>{statusIcon[st]} {st}</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#555', margin: '0 0 0.6rem', lineHeight: 1.7 }}>{desc}</p>
            <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '0.55rem 0.85rem', fontFamily: 'monospace', fontSize: '0.83rem', marginBottom: '0.6rem', whiteSpace: 'pre-wrap' }}>
              <span style={{ color: '#888' }}>$ </span>{cmd}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => runScript(id)}
                disabled={disabled || st === 'running'}
                style={{ background: disabled || st === 'running' ? '#aaa' : '#007030', color: '#FEE11A', border: 'none', padding: '0.45rem 1.1rem', fontWeight: 800, fontSize: '0.9rem', cursor: disabled || st === 'running' ? 'not-allowed' : 'pointer' }}
              >
                {st === 'running' ? '⏳ Running…' : st === 'done' ? '↺ Re-run' : '▶ Run'}
              </button>
              {lg.length > 0 && (
                <button onClick={() => setLogsOpen((p) => ({ ...p, [id]: !p[id] }))} style={{ background: 'none', border: '1px solid #ccc', fontSize: '0.85rem', color: '#555', padding: '0.3rem 0.7rem', cursor: 'pointer' }}>
                  {open ? '▲ Hide log' : `▼ Show log (${lg.length} lines)`}
                </button>
              )}
            </div>
            {open && <LogPanel lines={lg} logRef={(el) => { logElRef.current[id] = el; }} />}
          </div>
        );
      })}

      {/* Chat panel — shown once inference has run at least once */}
      {(stepStatus['infer'] === 'done' || stepStatus['infer'] === 'error' || chatMessages.length > 0) && (
        <div style={{ marginTop: '1.5rem', border: '1px solid #007030', background: '#f9fff9' }}>
          <div style={{ padding: '0.75rem 1.25rem', background: '#007030', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>💬</span>
            <strong style={{ color: '#FEE11A', fontSize: '1rem' }}>Ask your Lithia AI</strong>
            <span style={{ color: '#a8d8a8', fontSize: '0.85rem', marginLeft: '0.25rem' }}>— powered by your fine-tuned TinyLlama model</span>
          </div>

          {/* Message history */}
          <div style={{ padding: '0.75rem 1.25rem', maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {chatMessages.length === 0 && (
              <p style={{ color: '#888', fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>Ask anything about your dealership data — inventory, pricing, financing, service records…</p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  borderRadius: '0',
                  background: m.role === 'user' ? '#007030' : '#fff',
                  color: m.role === 'user' ? '#FEE11A' : '#222',
                  border: m.role === 'user' ? 'none' : '1px solid #ddd',
                  fontWeight: m.role === 'user' ? 600 : 400,
                }}>
                  {m.text || (m.loading ? <span style={{ color: '#888' }}>Thinking…</span> : '')}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input row */}
          <div style={{ padding: '0.65rem 1.25rem', borderTop: '1px solid #c5e8c5', display: 'flex', gap: '0.5rem', background: '#fff' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPrompt(); } }}
              placeholder="Ask a question about your data…"
              disabled={chatBusy}
              style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.9rem', border: '1px solid #ccc', outline: 'none', fontFamily: 'inherit', background: chatBusy ? '#f5f5f5' : '#fff' }}
            />
            <button
              onClick={sendPrompt}
              disabled={chatBusy || !chatInput.trim()}
              title="Send"
              style={{ background: chatBusy || !chatInput.trim() ? '#aaa' : '#007030', color: '#FEE11A', border: 'none', padding: '0.5rem 0.9rem', cursor: chatBusy || !chatInput.trim() ? 'not-allowed' : 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}
            >
              {chatBusy ? '⏳' : '✈'}
            </button>
          </div>
        </div>
      )}

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
        {phase === 1 && <DatasetPhase />}
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
