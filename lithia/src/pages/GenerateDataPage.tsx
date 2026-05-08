import { useState, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldDef = {
  name: string;         // dot-notation path for nested fields, e.g. "compliance.title_status"
  type: 'S' | 'N' | 'BOOL' | 'uuid' | 'timestamp' | 'enum' | 'range' | 'name_first' | 'name_last' | 'email' | 'phone' | 'address' | 'company';
  values?: string[];    // for enum
  min?: number;         // for range/N
  max?: number;         // for range/N
  decimals?: number;    // for range
  isKey?: boolean;
};

type SchemaField = { name: string; type: string; [k: string]: unknown };

// ─── Fake-data helpers (no external lib) ─────────────────────────────────────

const FIRST_NAMES = ['James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda','William','Barbara','David','Elizabeth','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Christopher','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Dorothy','Paul','Kimberly','Andrew','Emily','Kenneth','Donna','Joshua','Michelle','Kevin','Carol','Brian','Amanda','George','Melissa','Timothy','Deborah'];
const LAST_NAMES = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts'];
const COMPANIES = ['Acme Corp','BlueStar LLC','Horizon Group','Summit Solutions','Pinnacle Inc','Apex Ventures','Cardinal Industries','Meridian Co','Catalyst Group','Nexus Partners','Vantage Corp','Keystone LLC','Stellar Systems','Frontier Solutions','Zenith Co'];
const STREETS = ['Main St','Oak Ave','Maple Dr','Cedar Ln','Pine Rd','Elm St','Washington Blvd','Park Ave','Lake Dr','River Rd','Highland Ave','Forest Way','Sunset Blvd','Valley Rd','Hillside Dr'];
const CITIES = ['Portland','Eugene','Salem','Beaverton','Bend','Medford','Springfield','Corvallis','Albany','Gresham'];
const STATES = ['OR','WA','CA','ID','NV','AZ'];

let _seed = Date.now();
function rng() { _seed = (_seed * 1664525 + 1013904223) & 0xffffffff; return ((_seed >>> 0) / 0x100000000); }
function pick<T>(arr: T[]): T { return arr[Math.floor(rng() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(rng() * (max - min + 1)) + min; }
function randFloat(min: number, max: number, dec = 2) { return parseFloat((rng() * (max - min) + min).toFixed(dec)); }
function uuid4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const v = c === 'x' ? Math.floor(rng() * 16) : (Math.floor(rng() * 4) + 8);
    return v.toString(16);
  });
}
function timestamp() {
  const base = new Date('2020-01-01').getTime();
  const end  = new Date('2026-01-01').getTime();
  return new Date(base + rng() * (end - base)).toISOString();
}
function email(first: string, last: string) {
  const domains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com'];
  return `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1,999)}@${pick(domains)}`;
}
function phone() {
  return `${randInt(200,999)}-${randInt(200,999)}-${randInt(1000,9999)}`;
}
function address() {
  return `${randInt(100,9999)} ${pick(STREETS)}, ${pick(CITIES)}, ${pick(STATES)} ${randInt(97000,97999)}`;
}

function generateValue(field: FieldDef): unknown {
  switch (field.type) {
    case 'uuid':       return uuid4();
    case 'timestamp':  return timestamp();
    case 'name_first': return pick(FIRST_NAMES);
    case 'name_last':  return pick(LAST_NAMES);
    case 'email': {
      const f = pick(FIRST_NAMES); const l = pick(LAST_NAMES);
      return email(f, l);
    }
    case 'phone':      return phone();
    case 'address':    return address();
    case 'company':    return pick(COMPANIES);
    case 'enum':       return pick(field.values ?? ['a', 'b', 'c']);
    case 'range':      return randFloat(field.min ?? 0, field.max ?? 100, field.decimals ?? 2);
    case 'N':          return randInt(field.min ?? 0, field.max ?? 1000);
    case 'BOOL':       return rng() > 0.5;
    case 'S':
    default:           return `${field.name.split('.').pop()}-${uuid4().slice(0, 8)}`;
  }
}

// Set a value at a dot-notation path, creating nested objects as needed
function setNested(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function generateRecord(fields: FieldDef[]): Record<string, unknown> {
  const rec: Record<string, unknown> = {};
  for (const f of fields) {
    setNested(rec, f.name, generateValue(f));
  }
  return rec;
}

// ─── Schema inference from uploaded JSON ─────────────────────────────────────

// Recursively flatten a record into dot-notation paths with their leaf values
function flattenPaths(obj: Record<string, unknown>, prefix = ''): Array<{ path: string; value: unknown }> {
  const out: Array<{ path: string; value: unknown }> = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length > 0) {
      out.push(...flattenPaths(v as Record<string, unknown>, p));
    } else {
      out.push({ path: p, value: v });
    }
  }
  return out;
}

function inferFieldType(fullPath: string, val: unknown): FieldDef {
  const name = fullPath.split('.').pop()!;
  const lname = name.toLowerCase();
  const lpath = fullPath.toLowerCase();
  if (lname === 'id' || lpath.endsWith('_id') || lpath.endsWith('.id')) return { name: fullPath, type: 'uuid', isKey: lname === 'id' && !fullPath.includes('.') };
  if (lname.includes('email')) return { name: fullPath, type: 'email' };
  if (lname.includes('phone') || lname.includes('tel')) return { name: fullPath, type: 'phone' };
  if (lname.includes('address') || lname.includes('street')) return { name: fullPath, type: 'address' };
  if ((lname.includes('first') && lname.includes('name')) || lname === 'first_name' || lname === 'firstname') return { name: fullPath, type: 'name_first' };
  if ((lname.includes('last') && lname.includes('name')) || lname === 'last_name' || lname === 'lastname') return { name: fullPath, type: 'name_last' };
  if (lname.includes('company') || lname.includes('employer') || lname.includes('org')) return { name: fullPath, type: 'company' };
  if (lname.includes('created') || lname.includes('updated') || lname.includes('timestamp') || lname === 'date' || lname.endsWith('_at') || lname.endsWith('_date')) return { name: fullPath, type: 'timestamp' };
  if (typeof val === 'boolean') return { name: fullPath, type: 'BOOL' };
  if (typeof val === 'number') {
    const isFloat = !Number.isInteger(val);
    return { name: fullPath, type: 'range', min: Math.max(0, Math.floor(val * 0.1)), max: Math.ceil(val * 3), decimals: isFloat ? 2 : 0 };
  }
  if (typeof val === 'string') {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}/.test(val)) return { name: fullPath, type: 'uuid' };
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return { name: fullPath, type: 'timestamp' };
    if (/^\d{3}-\d{3}-\d{4}$/.test(val)) return { name: fullPath, type: 'phone' };
    if (val.includes('@')) return { name: fullPath, type: 'email' };
  }
  return { name: fullPath, type: 'S' };
}

// Scan up to 100 records, flatten all, union all paths — catches every field even if sparse
function inferFromRecords(records: Record<string, unknown>[]): FieldDef[] {
  const pathMap = new Map<string, unknown>(); // path → first non-null sample value
  const sample = records.slice(0, 100);
  for (const rec of sample) {
    for (const { path, value } of flattenPaths(rec)) {
      if (!pathMap.has(path) && value !== null && value !== undefined) pathMap.set(path, value);
    }
  }
  return Array.from(pathMap.entries()).map(([path, val]) => inferFieldType(path, val));
}

// Parse a JSON Schema object {type:'object', properties:{...}} recursively
function inferFromJsonSchema(schema: Record<string, unknown>, prefix = ''): FieldDef[] {
  const props = (schema.properties ?? schema.fields ?? schema.attributes) as Record<string, Record<string, unknown>> | undefined;
  if (!props) return [];
  const out: FieldDef[] = [];
  for (const [k, def] of Object.entries(props)) {
    const path = prefix ? `${prefix}.${k}` : k;
    const t = ((def.type as string) ?? 'string').toLowerCase();
    if ((t === 'object' || def.properties) && def.properties) {
      out.push(...inferFromJsonSchema(def, path));
    } else {
      // map JSON Schema types to our types
      const mapped = t === 'number' || t === 'integer' ? 'range'
        : t === 'boolean' ? 'BOOL'
        : 'S';
      const field = inferFieldType(path, t === 'number' ? 0 : t === 'boolean' ? false : '');
      if (mapped === 'range' && field.type === 'S') out.push({ ...field, type: 'range', min: 0, max: 100000, decimals: t === 'integer' ? 0 : 2 });
      else out.push(field);
    }
  }
  return out;
}

function inferFromSchemaArray(arr: SchemaField[]): FieldDef[] {
  return arr.map((f) => {
    const rawType = (f.type as string || 'S').toUpperCase();
    const isKey = !!(f.key || f.isKey || f.pk || f.partition_key || f.primary_key);
    // Use smart inference first, then fall back to explicit DynamoDB type
    const inferred = inferFieldType(f.name, rawType === 'N' ? 0 : rawType === 'BOOL' ? false : '');
    if (isKey) inferred.isKey = true;
    if (rawType === 'N' && inferred.type === 'S') return { ...inferred, type: 'range' as const, min: 0, max: 100000, decimals: 2 };
    if (rawType === 'BOOL' && inferred.type === 'S') return { ...inferred, type: 'BOOL' as const };
    return inferred;
  });
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

function DropZone({ onFile, busy }: { onFile: (f: File) => void; busy: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  function handle(f: File) { if (!busy) onFile(f); }
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
      onClick={() => ref.current?.click()}
      style={{
        border: `2px dashed ${over ? '#007030' : '#ccc'}`,
        background: over ? '#f0fff4' : '#fafafa',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        cursor: busy ? 'default' : 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <input ref={ref} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Drop your schema JSON here</p>
      <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#666' }}>or click to browse — accepts a single JSON record, array of records, or a schema array with <code>name</code> + <code>type</code> fields</p>
    </div>
  );
}

// ─── Field type badge ─────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  uuid: '#6c3483', timestamp: '#1a5276', email: '#117a65', phone: '#784212',
  address: '#1f618d', name_first: '#2e7d32', name_last: '#2e7d32', company: '#6d4c41',
  enum: '#ad1457', range: '#e65100', S: '#455a64', N: '#455a64', BOOL: '#455a64',
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span style={{
      display: 'inline-block', background: TYPE_COLORS[type] ?? '#555', color: '#fff',
      fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 2, letterSpacing: '0.04em',
    }}>{type.toUpperCase()}</span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GenerateDataPage() {
  const [fields, setFields]           = useState<FieldDef[]>([]);
  const [tableName, setTableName]     = useState('my-table');
  const [count, setCount]             = useState(20000);
  const [generating, setGenerating]   = useState(false);
  const [progress, setProgress]       = useState(0);
  const [records, setRecords]         = useState<Record<string, unknown>[] | null>(null);
  const [schemaFile, setSchemaFile]   = useState('');
  const [parseErr, setParseErr]       = useState('');
  const [showScript, setShowScript]   = useState(false);

  // ── parse uploaded file ──
  function handleFile(file: File) {
    setParseErr('');
    setRecords(null);
    setProgress(0);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const parsed = JSON.parse(raw);
        setSchemaFile(file.name);
        let inferred: FieldDef[] = [];

        if (Array.isArray(parsed)) {
          const first = parsed[0];
          if (first && typeof first === 'object') {
            // Schema array: [{name, type}, ...]
            const isSchemaArr = (first as Record<string,unknown>).name !== undefined && (first as Record<string,unknown>).type !== undefined
              && typeof (first as Record<string,unknown>).name === 'string' && typeof (first as Record<string,unknown>).type === 'string';
            if (isSchemaArr) {
              inferred = inferFromSchemaArray(parsed as SchemaField[]);
            } else {
              // Array of data records — scan ALL records to union every field
              inferred = inferFromRecords(parsed as Record<string, unknown>[]);
            }
          }
        } else if (typeof parsed === 'object' && parsed !== null) {
          const obj = parsed as Record<string, unknown>;
          // JSON Schema format: {type:'object', properties:{...}}
          if (obj.properties || obj.fields || obj.attributes) {
            inferred = inferFromJsonSchema(obj);
          } else {
            // Single data record — flatten it fully
            inferred = inferFromRecords([obj]);
          }
        }

        if (!inferred.length) { setParseErr('Could not infer any fields from this file.'); return; }
        // Ensure exactly one key field
        if (!inferred.some((f) => f.isKey)) inferred[0].isKey = true;
        setFields(inferred);
      } catch {
        setParseErr('Invalid JSON — could not parse the file.');
      }
    };
    reader.readAsText(file);
  }

  // ── generate records in chunks to keep UI responsive ──
  async function handleGenerate() {
    if (!fields.length) return;
    setGenerating(true);
    setProgress(0);
    setRecords(null);
    _seed = Date.now();

    const CHUNK = 500;
    const all: Record<string, unknown>[] = [];
    let i = 0;

    function processChunk() {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const end = Math.min(i + CHUNK, count);
          while (i < end) { all.push(generateRecord(fields)); i++; }
          setProgress(Math.round((i / count) * 100));
          resolve();
        }, 0);
      });
    }

    while (i < count) await processChunk();

    setRecords(all);
    setGenerating(false);
    setProgress(100);
  }

  // ── download as JSON ──
  function downloadJSON() {
    if (!records) return;
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${tableName || 'records'}-${records.length}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ── download as JSONL ──
  function downloadJSONL() {
    if (!records) return;
    const blob = new Blob([records.map((r) => JSON.stringify(r)).join('\n')], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${tableName || 'records'}-${records.length}.jsonl`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ── field editor helpers ──
  function updateField(idx: number, patch: Partial<FieldDef>) {
    setFields((prev) => prev.map((f, i) => i === idx ? { ...f, ...patch } : f));
  }
  function removeField(idx: number) {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  }
  function addField() {
    setFields((prev) => [...prev, { name: `field${prev.length + 1}`, type: 'S' }]);
  }

  const keyField = fields.find((f) => f.isKey);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#007030', marginBottom: '0.25rem' }}>
        🏭 Data Generator
      </h1>
      <p style={{ color: '#555', fontSize: '0.95rem', margin: '0 0 1.5rem', lineHeight: 1.7 }}>
        Upload a JSON schema or sample record. The generator infers realistic field types and produces DynamoDB-compatible records — no AI, no external APIs, runs entirely in your browser.
      </p>

      {/* How it works banner */}
      <div style={{ background: '#f0f7ff', border: '1px solid #c2d9f5', padding: '0.9rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.88rem', lineHeight: 1.7 }}>
        <strong>How it works:</strong> Drop a JSON file (a single record, an array of records, or a schema like <code>[{`{"name":"id","type":"S"}`}]</code>). The tool infers a type for each field, lets you review and edit the mapping, then generates up to 100,000 records instantly in your browser.
        Values are realistic fakes — UUIDs, names, emails, phone numbers, timestamps, numeric ranges — and are safe for DynamoDB upload.
        <strong style={{ marginLeft: '0.3rem' }}>Want to run this offline?</strong> Scroll down for the standalone Python script.
      </div>

      {/* Step 1 — upload */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.6rem', color: '#222' }}>
          <span style={{ background: '#007030', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, marginRight: '0.5rem' }}>1</span>
          Upload your schema
        </h2>
        <DropZone onFile={handleFile} busy={generating} />
        {parseErr && <p style={{ color: '#c0392b', fontSize: '0.86rem', marginTop: '0.5rem' }}>✗ {parseErr}</p>}
        {schemaFile && !parseErr && (
          <p style={{ color: '#007030', fontSize: '0.84rem', marginTop: '0.4rem', fontWeight: 700 }}>✓ Loaded: {schemaFile} — {fields.length} fields inferred</p>
        )}
      </div>

      {/* Step 2 — review fields */}
      {fields.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.6rem', color: '#222' }}>
            <span style={{ background: '#007030', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, marginRight: '0.5rem' }}>2</span>
            Review &amp; edit field types
          </h2>
          {!keyField && (
            <div style={{ background: '#fff8e1', border: '1px solid #f4c95d', padding: '0.6rem 0.9rem', marginBottom: '0.75rem', fontSize: '0.86rem' }}>
              ⚠️ No partition key selected. Mark one field as <strong>Key (PK)</strong> — DynamoDB requires a primary key.
            </div>
          )}
          <div style={{ border: '1px solid #e0e0e0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#444' }}>Field Name</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#444' }}>Generator Type</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#444' }}>Options</th>
                  <th style={{ padding: '0.5rem 0.5rem', textAlign: 'center', fontWeight: 700, color: '#444', width: 60 }}>Key (PK)</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: f.isKey ? '#f0fff4' : 'transparent' }}>
                    <td style={{ padding: '0.45rem 0.75rem', fontFamily: 'monospace', fontWeight: f.isKey ? 700 : 400 }}>
                      <input
                        value={f.name}
                        onChange={(e) => updateField(i, { name: e.target.value })}
                        style={{ fontFamily: 'monospace', fontSize: '0.86rem', border: '1px solid #ddd', padding: '0.2rem 0.4rem', width: '100%', boxSizing: 'border-box' }}
                      />
                    </td>
                    <td style={{ padding: '0.45rem 0.75rem' }}>
                      <select
                        value={f.type}
                        onChange={(e) => updateField(i, { type: e.target.value as FieldDef['type'] })}
                        style={{ fontSize: '0.84rem', border: '1px solid #ddd', padding: '0.2rem 0.4rem' }}
                      >
                        <optgroup label="Identity">
                          <option value="uuid">UUID (unique ID)</option>
                          <option value="timestamp">Timestamp (ISO 8601)</option>
                        </optgroup>
                        <optgroup label="People">
                          <option value="name_first">First Name</option>
                          <option value="name_last">Last Name</option>
                          <option value="email">Email Address</option>
                          <option value="phone">Phone Number</option>
                          <option value="address">Street Address</option>
                          <option value="company">Company Name</option>
                        </optgroup>
                        <optgroup label="Values">
                          <option value="enum">Enum (pick from list)</option>
                          <option value="range">Number Range</option>
                          <option value="BOOL">Boolean (true/false)</option>
                        </optgroup>
                        <optgroup label="DynamoDB native">
                          <option value="S">String (random)</option>
                          <option value="N">Integer</option>
                        </optgroup>
                      </select>
                      <span style={{ marginLeft: '0.4rem' }}><TypeBadge type={f.type} /></span>
                    </td>
                    <td style={{ padding: '0.45rem 0.75rem' }}>
                      {f.type === 'enum' && (
                        <input
                          placeholder="comma-separated values"
                          value={(f.values ?? []).join(',')}
                          onChange={(e) => updateField(i, { values: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })}
                          style={{ fontSize: '0.82rem', border: '1px solid #ddd', padding: '0.2rem 0.4rem', width: 200 }}
                        />
                      )}
                      {(f.type === 'range' || f.type === 'N') && (
                        <span style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', fontSize: '0.82rem' }}>
                          <input type="number" placeholder="min" value={f.min ?? ''} onChange={(e) => updateField(i, { min: Number(e.target.value) })} style={{ width: 70, border: '1px solid #ddd', padding: '0.2rem 0.35rem', fontSize: '0.82rem' }} />
                          <span>–</span>
                          <input type="number" placeholder="max" value={f.max ?? ''} onChange={(e) => updateField(i, { max: Number(e.target.value) })} style={{ width: 70, border: '1px solid #ddd', padding: '0.2rem 0.35rem', fontSize: '0.82rem' }} />
                          {f.type === 'range' && <input type="number" placeholder="dec" value={f.decimals ?? 2} onChange={(e) => updateField(i, { decimals: Number(e.target.value) })} style={{ width: 50, border: '1px solid #ddd', padding: '0.2rem 0.35rem', fontSize: '0.82rem' }} title="decimal places" />}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.45rem 0.5rem' }}>
                      <input
                        type="radio"
                        name="pkfield"
                        checked={!!f.isKey}
                        onChange={() => setFields((prev) => prev.map((x, xi) => ({ ...x, isKey: xi === i })))}
                        style={{ accentColor: '#007030', width: 16, height: 16, cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => removeField(i)} title="Remove field" style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addField} style={{ marginTop: '0.6rem', background: 'none', border: '1px solid #007030', color: '#007030', fontSize: '0.84rem', fontWeight: 700, padding: '0.3rem 0.8rem', cursor: 'pointer' }}>+ Add Field</button>
        </div>
      )}

      {/* Step 3 — configure + generate */}
      {fields.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: '#222' }}>
            <span style={{ background: '#007030', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800, marginRight: '0.5rem' }}>3</span>
            Configure &amp; generate
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '0.85rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DynamoDB Table Name</span>
              <input
                value={tableName}
                onChange={(e) => setTableName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                style={{ padding: '0.4rem 0.6rem', border: '1px solid #ccc', fontSize: '0.9rem', width: 220 }}
                placeholder="e.g. lithia-customers"
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Record Count</span>
              <input
                type="number"
                min={1}
                max={100000}
                value={count}
                onChange={(e) => setCount(Math.min(100000, Math.max(1, parseInt(e.target.value) || 1)))}
                style={{ padding: '0.4rem 0.6rem', border: '1px solid #ccc', fontSize: '0.9rem', width: 130 }}
              />
            </label>
            <button
              onClick={handleGenerate}
              disabled={generating || !keyField}
              style={{
                background: generating || !keyField ? '#aaa' : '#007030',
                color: '#FEE11A', border: 'none', padding: '0.5rem 1.5rem',
                fontWeight: 800, fontSize: '0.95rem',
                cursor: generating || !keyField ? 'not-allowed' : 'pointer',
              }}
            >
              {generating ? '⏳ Generating…' : `▶ Generate ${count.toLocaleString()} Records`}
            </button>
          </div>

          {/* Progress bar */}
          {generating && (
            <div style={{ margin: '0.5rem 0', background: '#eee', borderRadius: 2, overflow: 'hidden', height: 8 }}>
              <div style={{ height: '100%', background: '#007030', width: `${progress}%`, transition: 'width 0.2s' }} />
            </div>
          )}
          {generating && <p style={{ fontSize: '0.84rem', color: '#555', margin: '0.25rem 0 0' }}>{progress}% — generating {count.toLocaleString()} records…</p>}
        </div>
      )}

      {/* Step 4 — download */}
      {records && (
        <div style={{ marginBottom: '2rem', padding: '1rem 1.25rem', background: '#f0fff4', border: '2px solid #007030' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.6rem', color: '#007030' }}>
            ✓ {records.length.toLocaleString()} records generated
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#555', margin: '0 0 0.8rem', lineHeight: 1.7 }}>
            <strong>JSON</strong> — upload directly to DynamoDB via the <em>Create Data</em> page.<br />
            <strong>JSONL</strong> — one record per line, used by the training data prepare script.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={downloadJSON}
              style={{ background: '#007030', color: '#FEE11A', border: 'none', padding: '0.5rem 1.4rem', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer' }}
            >⬇ Download JSON</button>
            <button
              onClick={downloadJSONL}
              style={{ background: '#1a5276', color: '#fff', border: 'none', padding: '0.5rem 1.4rem', fontWeight: 800, fontSize: '0.92rem', cursor: 'pointer' }}
            >⬇ Download JSONL</button>
          </div>

          {/* Preview */}
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#555', marginBottom: '0.3rem' }}>Preview (first 3 records):</p>
            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '0.75rem 1rem', fontSize: '0.78rem', overflowX: 'auto', maxHeight: 240, margin: 0 }}>
              {JSON.stringify(records.slice(0, 3), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Standalone Python script */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#222' }}>🐍 Standalone Python Script</h2>
          <button
            onClick={() => setShowScript((s) => !s)}
            style={{ background: 'none', border: '1px solid #ccc', fontSize: '0.84rem', padding: '0.25rem 0.7rem', cursor: 'pointer', color: '#555' }}
          >{showScript ? '▲ Hide' : '▼ Show script'}</button>
          {showScript && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(PYTHON_SCRIPT(fields, tableName, count));
              }}
              style={{ background: '#007030', color: '#FEE11A', border: 'none', fontSize: '0.82rem', padding: '0.25rem 0.75rem', cursor: 'pointer', fontWeight: 700 }}
            >Copy to clipboard</button>
          )}
        </div>
        <p style={{ fontSize: '0.88rem', color: '#555', margin: '0 0 0.75rem', lineHeight: 1.7 }}>
          No browser required — run this on your laptop with <code>python3 generate.py</code>. Requires only Python 3.8+ standard library (no pip installs). Generates the same schema with the same DynamoDB-compatible types.
        </p>
        {showScript && fields.length > 0 && (
          <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1rem 1.25rem', fontSize: '0.8rem', overflowX: 'auto', maxHeight: 520, margin: 0, lineHeight: 1.7 }}>
            {PYTHON_SCRIPT(fields, tableName, count)}
          </pre>
        )}
        {showScript && fields.length === 0 && (
          <p style={{ color: '#888', fontSize: '0.88rem' }}>Upload a schema above first — the script will be generated based on your field definitions.</p>
        )}
      </div>
    </div>
  );
}

// ─── Python script generator ─────────────────────────────────────────────────

function PYTHON_SCRIPT(fields: FieldDef[], tableName: string, count: number): string {
  const keyField = fields.find((f) => f.isKey) ?? fields[0];

  // Generate a Python expression for a field value
  function pyValue(f: FieldDef): string {
    const leaf = f.name.split('.').pop()!;
    switch (f.type) {
      case 'uuid':       return 'str(uuid.uuid4())';
      case 'timestamp':  return 'rand_timestamp()';
      case 'name_first': return 'random.choice(FIRST_NAMES)';
      case 'name_last':  return 'random.choice(LAST_NAMES)';
      case 'email':      return 'rand_email()';
      case 'phone':      return 'rand_phone()';
      case 'address':    return 'rand_address()';
      case 'company':    return 'random.choice(COMPANIES)';
      case 'BOOL':       return 'random.random() > 0.5';
      case 'enum':       return `random.choice(${JSON.stringify(f.values ?? ['a', 'b', 'c'])})`;
      case 'range':      return `round(random.uniform(${f.min ?? 0}, ${f.max ?? 100}), ${f.decimals ?? 2})`;
      case 'N':          return `random.randint(${f.min ?? 0}, ${f.max ?? 1000})`;
      default:           return `f"${leaf}-{uuid.uuid4().hex[:8]}"`;
    }
  }

  // Build nested dict structure from dot-notation paths
  // Group fields by top-level key so we emit nested dicts cleanly
  type NestedNode = { [k: string]: NestedNode | string };
  const tree: NestedNode = {};
  for (const f of fields) {
    const parts = f.name.split('.');
    let node: NestedNode = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]] as NestedNode;
    }
    node[parts[parts.length - 1]] = pyValue(f);
  }

  function renderDict(node: NestedNode, indent: string): string {
    const lines: string[] = ['{'];
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'string') {
        lines.push(`${indent}    "${k}": ${v},`);
      } else {
        lines.push(`${indent}    "${k}": ${renderDict(v as NestedNode, indent + '    ')},`);
      }
    }
    lines.push(`${indent}}`);
    return lines.join('\n');
  }

  const recordBody = renderDict(tree, '    ');

  return `#!/usr/bin/env python3
"""
Standalone DynamoDB-compatible data generator
Table  : ${tableName}
Fields : ${fields.map((f) => f.name).join(', ')}
Output : ${tableName}-${count}.json  (DynamoDB-ready JSON array)

Usage:
  python3 generate.py
  python3 generate.py --count 5000 --out my-data.json

Requirements: Python 3.8+ standard library only (no pip installs needed)
"""
import uuid, json, random, argparse
from datetime import datetime, timedelta, timezone

# ─── Fake-data pools ──────────────────────────────────────────────────────────
FIRST_NAMES = [
    'James','Mary','John','Patricia','Robert','Jennifer','Michael','Linda',
    'William','Barbara','David','Elizabeth','Richard','Susan','Joseph','Jessica',
    'Thomas','Sarah','Charles','Karen','Christopher','Lisa','Daniel','Nancy',
    'Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley',
]
LAST_NAMES = [
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
    'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson',
    'Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson',
    'White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
]
COMPANIES = [
    'Acme Corp','BlueStar LLC','Horizon Group','Summit Solutions','Pinnacle Inc',
    'Apex Ventures','Cardinal Industries','Meridian Co','Catalyst Group','Nexus Partners',
]
STREETS = ['Main St','Oak Ave','Maple Dr','Cedar Ln','Pine Rd','Elm St','Washington Blvd','Park Ave']
CITIES  = ['Portland','Eugene','Salem','Beaverton','Bend','Medford','Springfield','Corvallis']
STATES  = ['OR','WA','CA','ID','NV']
DOMAINS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com']

# ─── Helpers ──────────────────────────────────────────────────────────────────
def rand_timestamp():
    base = datetime(2020, 1, 1, tzinfo=timezone.utc)
    delta = timedelta(seconds=random.randint(0, 6 * 365 * 24 * 3600))
    return (base + delta).isoformat()

def rand_email():
    f = random.choice(FIRST_NAMES).lower()
    l = random.choice(LAST_NAMES).lower()
    return f"{f}.{l}{random.randint(1, 999)}@{random.choice(DOMAINS)}"

def rand_phone():
    return f"{random.randint(200,999)}-{random.randint(200,999)}-{random.randint(1000,9999)}"

def rand_address():
    return f"{random.randint(100,9999)} {random.choice(STREETS)}, {random.choice(CITIES)}, {random.choice(STATES)} {random.randint(97000,97999)}"

# ─── Record builder ───────────────────────────────────────────────────────────
def make_record():
    return ${recordBody}

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Generate ${tableName} records")
    parser.add_argument("--count", type=int, default=${count}, help="Number of records to generate")
    parser.add_argument("--out",   type=str, default="${tableName}-${count}.json", help="Output file path")
    args = parser.parse_args()

    print(f"Generating {args.count:,} records for table '${tableName}'...")
    records = [make_record() for _ in range(args.count)]

    with open(args.out, "w") as f:
        json.dump(records, f, indent=2)

    print(f"✓ Written {len(records):,} records → {args.out}")
    print(f"  Partition key : ${keyField?.name ?? 'id'}")
    print(f"  Fields        : ${fields.map((f) => f.name).join(', ')}")
    print()
    print("To upload to DynamoDB:")
    print(f"  aws dynamodb batch-write-item --request-items file://${tableName}-batch.json")
    print("  (or use the 'Create Data' page in the app to upload the JSON file directly)")

if __name__ == "__main__":
    main()
`;
}
