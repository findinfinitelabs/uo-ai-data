/**
 * Lightweight local API server for the Lithia dev environment.
 * Proxied by Vite at /api/* → http://localhost:3002
 *
 * Endpoints:
 *   GET    /api/aws-profiles
 *   GET    /api/aws-info?profile=&region=
 *   GET    /api/dynamodb-tables?profile=&region=
 *   GET    /api/dynamodb-table-count?profile=&region=&table=
 *   POST   /api/dynamodb-table   body: {profile, region, name, key}
 *   DELETE /api/dynamodb-table?profile=&region=&table=
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// module-6-llm-training lives next to lithia/ under site/
const MODULE_DIR = path.resolve(__dirname, '..', 'site', 'module-6-llm-training');

const PORT = 3002;

const SSO_EXPIRED_PATTERNS = [
  'token has expired',
  'refresh failed',
  'sso session',
  'not authorized',
  'refreshaccesstoken',
  'getrolecredentials',
];

function isSsoExpired(msg) {
  const lower = msg.toLowerCase();
  return SSO_EXPIRED_PATTERNS.some((p) => lower.includes(p));
}

function triggerSsoLogin(profile) {
  console.log(`[api-server] SSO token expired — launching: aws sso login --profile ${profile}`);
  const child = spawn('aws', ['sso', 'login', '--profile', profile], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}

function runCmd(cmd) {
  try {
    const stdout = execSync(cmd, { encoding: 'utf8', timeout: 15000 });
    return { ok: true, data: JSON.parse(stdout) };
  } catch (err) {
    const msg = err.stderr ? err.stderr.toString() : err.message;
    return { ok: false, error: msg.trim(), ssoExpired: isSsoExpired(msg) };
  }
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const profile = url.searchParams.get('profile') || 'uo-innovation';
  const region  = url.searchParams.get('region')  || 'us-west-2';

  // ── GET /api/aws-profiles ─────────────────────────────────────
  if (url.pathname === '/api/aws-profiles' && req.method === 'GET') {
    try {
      // Named profiles from `aws configure list-profiles`
      const raw = execSync('aws configure list-profiles', { encoding: 'utf8', timeout: 5000 });
      const profiles = raw.trim().split('\n').filter(Boolean);

      // Only return actual named profiles — SSO session names are not usable
      // as --profile values and will cause "config profile not found" errors.
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, data: profiles }));
    } catch (err) {
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, data: ['LCBPEGA_IsbAdminsPS-547741150715'] }));
    }

  // ── GET /api/aws-setup ─────────────────────────────────────────
  // Writes the UO course AWS profile to ~/.aws/config (idempotent) and
  // opens the SSO login browser tab. Students never need to run aws configure.
  } else if (url.pathname === '/api/aws-setup' && req.method === 'GET') {
    const SSO_START_URL  = 'https://d-9267f25f0e.awsapps.com/start';
    const SSO_REGION     = 'us-west-2';
    const SSO_ACCOUNT_ID = '547741150715';
    const SSO_ROLE_NAME  = 'LCBPEGA_IsbAdminsPS';
    const PROFILE_NAME   = 'uo-innovation';
    const SESSION_NAME   = 'uo-innovation';
    try {
      const configPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.aws', 'config');
      const awsDir = path.dirname(configPath);
      if (!fs.existsSync(awsDir)) fs.mkdirSync(awsDir, { recursive: true });
      let config = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : '';
      if (!config.includes(`[sso-session ${SESSION_NAME}]`)) {
        config += `\n[sso-session ${SESSION_NAME}]\nsso_start_url = ${SSO_START_URL}\nsso_region = ${SSO_REGION}\nsso_registration_scopes = sso:account:access\n`;
      }
      if (!config.includes(`[profile ${PROFILE_NAME}]`)) {
        config += `\n[profile ${PROFILE_NAME}]\nsso_session = ${SESSION_NAME}\nsso_account_id = ${SSO_ACCOUNT_ID}\nsso_role_name = ${SSO_ROLE_NAME}\nregion = ${SSO_REGION}\noutput = json\n`;
      }
      fs.writeFileSync(configPath, config, 'utf8');
      triggerSsoLogin(PROFILE_NAME);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, profile: PROFILE_NAME }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }

  // ── GET /api/aws-info ─────────────────────────────────────────
  } else if (url.pathname === '/api/aws-info' && req.method === 'GET') {
    const result = runCmd(`aws sts get-caller-identity --profile "${profile}" --output json`);
    if (!result.ok && result.ssoExpired) triggerSsoLogin(profile);
    res.writeHead(result.ok ? 200 : 202);
    res.end(JSON.stringify(result));

  // ── GET /api/dynamodb-tables ──────────────────────────────────
  } else if (url.pathname === '/api/dynamodb-tables' && req.method === 'GET') {
    const result = runCmd(`aws dynamodb list-tables --profile "${profile}" --region "${region}" --output json`);
    if (!result.ok && result.ssoExpired) triggerSsoLogin(profile);
    res.writeHead(result.ok ? 200 : result.ssoExpired ? 202 : 502);
    res.end(JSON.stringify(result));

  // ── GET /api/dynamodb-table-count ─────────────────────────────
  } else if (url.pathname === '/api/dynamodb-table-count' && req.method === 'GET') {
    const table = url.searchParams.get('table') || '';
    if (!table) { res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'table param required' })); return; }
    const result = runCmd(
      `aws dynamodb scan --profile "${profile}" --region "${region}" --table-name "${table}" --select COUNT --output json`
    );
    res.writeHead(result.ok ? 200 : 502);
    res.end(JSON.stringify(result));

  // ── POST /api/dynamodb-table ──────────────────────────────────
  } else if (url.pathname === '/api/dynamodb-table' && req.method === 'POST') {
    const body = await readBody(req);
    const { profile: p = profile, region: r = region, name, key = 'id' } = body;
    if (!name) { res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'name required' })); return; }
    const result = runCmd(
      `aws dynamodb create-table --profile "${p}" --region "${r}" ` +
      `--table-name "${name}" ` +
      `--attribute-definitions AttributeName=${key},AttributeType=S ` +
      `--key-schema AttributeName=${key},KeyType=HASH ` +
      `--billing-mode PAY_PER_REQUEST --output json`
    );
    res.writeHead(result.ok ? 200 : 502);
    res.end(JSON.stringify(result));

  // ── GET /api/dynamodb-table-describe ───────────────────────
  } else if (url.pathname === '/api/dynamodb-table-describe' && req.method === 'GET') {
    const table = url.searchParams.get('table') || '';
    if (!table) { res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'table param required' })); return; }
    const result = runCmd(`aws dynamodb describe-table --profile "${profile}" --region "${region}" --table-name "${table}" --output json`);
    res.writeHead(result.ok ? 200 : 502);
    res.end(JSON.stringify(result));

  // ── POST /api/dynamodb-table-copy ────────────────────────────
  } else if (url.pathname === '/api/dynamodb-table-copy' && req.method === 'POST') {
    const body = await readBody(req);
    const { profile: p = profile, region: r = region, source, destination } = body;
    if (!source || !destination) { res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'source and destination required' })); return; }
    try {
      const out = execSync(
        `python3 -c "
import boto3, json
db = boto3.resource('dynamodb', region_name='${r}')
src = db.Table('${source}')
dst = db.Table('${destination}')
total = 0
lastKey = None
while True:
    kwargs = {'ExclusiveStartKey': lastKey} if lastKey else {}
    resp = src.scan(**kwargs)
    items = resp.get('Items', [])
    if items:
        with dst.batch_writer() as bw:
            for item in items: bw.put_item(Item=item)
        total += len(items)
    lastKey = resp.get('LastEvaluatedKey')
    if not lastKey: break
print(json.dumps({'copied': total}))
"`,
        { encoding: 'utf8', timeout: 120000, env: { ...process.env, AWS_PROFILE: p } }
      );
      const copied = JSON.parse(out.trim()).copied;
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, data: { copied } }));
    } catch (err) {
      res.writeHead(502);
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }

  // ── POST /api/dynamodb-table-rename ─────────────────────────
  } else if (url.pathname === '/api/dynamodb-table-rename' && req.method === 'POST') {
    const body = await readBody(req);
    const { profile: p = profile, region: r = region, oldName, newName } = body;
    if (!oldName || !newName) { res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'oldName and newName required' })); return; }

    // 1. Describe old table to get key schema
    const descResult = runCmd(`aws dynamodb describe-table --profile "${p}" --region "${r}" --table-name "${oldName}" --output json`);
    if (!descResult.ok) { res.writeHead(502); res.end(JSON.stringify(descResult)); return; }
    const tableDesc = descResult.data.Table;
    const attrDefs  = JSON.stringify(tableDesc.AttributeDefinitions);
    const keySchema = JSON.stringify(tableDesc.KeySchema);

    // 2. Create new table with same key schema
    const createResult = runCmd(
      `aws dynamodb create-table --profile "${p}" --region "${r}" ` +
      `--table-name "${newName}" ` +
      `--attribute-definitions '${attrDefs}' ` +
      `--key-schema '${keySchema}' ` +
      `--billing-mode PAY_PER_REQUEST --output json`
    );
    if (!createResult.ok) { res.writeHead(502); res.end(JSON.stringify(createResult)); return; }

    // 3. Wait for new table to be active
    runCmd(`aws dynamodb wait table-exists --profile "${p}" --region "${r}" --table-name "${newName}"`);

    // 4. Copy all items (scan + batch-write via inline python)
    try {
      execSync(
        `python3 -c "
import boto3, json
db = boto3.resource('dynamodb', region_name='${r}')
src = db.Table('${oldName}')
dst = db.Table('${newName}')
lastKey = None
while True:
    kwargs = {'ExclusiveStartKey': lastKey} if lastKey else {}
    resp = src.scan(**kwargs)
    items = resp.get('Items', [])
    if items:
        with dst.batch_writer() as bw:
            for item in items: bw.put_item(Item=item)
    lastKey = resp.get('LastEvaluatedKey')
    if not lastKey: break
"`,
        { encoding: 'utf8', timeout: 60000, env: { ...process.env, AWS_PROFILE: p } }
      );
    } catch { /* copy failed — still attempt delete */ }

    // 5. Delete old table
    runCmd(`aws dynamodb delete-table --profile "${p}" --region "${r}" --table-name "${oldName}" --output json`);

    res.writeHead(200);
    res.end(JSON.stringify({ ok: true }));

  // ── POST /api/dynamodb-batch-write ─────────────────────────
  } else if (url.pathname === '/api/dynamodb-batch-write' && req.method === 'POST') {
    const body = await readBody(req);
    const { profile: p = profile, region: r = region, table, items } = body;
    if (!table || !Array.isArray(items)) {
      res.writeHead(400);
      res.end(JSON.stringify({ ok: false, error: 'table and items[] required' }));
      return;
    }
    const tmpFile = `/tmp/dynamo_bw_${Date.now()}_${Math.random().toString(36).slice(2)}.json`;
    try {
      fs.writeFileSync(tmpFile, JSON.stringify(items));
      const out = execSync(
        `python3 -c "
import boto3, json
from decimal import Decimal

def to_dynamo(obj):
    if isinstance(obj, list):
        return [to_dynamo(i) for i in obj]
    if isinstance(obj, dict):
        return {k: to_dynamo(v) for k, v in obj.items()}
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, int):
        return Decimal(obj)
    return obj

session = boto3.Session(profile_name='${p}')
db = session.resource('dynamodb', region_name='${r}')
tbl = db.Table('${table}')
with open('${tmpFile}') as f:
    records = json.load(f)
total = 0
with tbl.batch_writer() as bw:
    for record in records:
        bw.put_item(Item=to_dynamo(record))
        total += 1
print(json.dumps({'written': total}))
"`,
        { encoding: 'utf8', timeout: 120000, env: { ...process.env, AWS_PROFILE: p } }
      );
      const result = JSON.parse(out.trim());
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, data: result }));
    } catch (err) {
      const detail = (err.stderr ? err.stderr.toString() : '') || err.message;
      res.writeHead(502);
      res.end(JSON.stringify({ ok: false, error: detail.trim() }));
    } finally {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }

  // ── GET /api/dynamodb-table-scan ──────────────────────────────
  } else if (url.pathname === '/api/dynamodb-table-scan' && req.method === 'GET') {
    const table = url.searchParams.get('table') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    if (!table) { res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'table param required' })); return; }
    const tmpFile = `/tmp/dynamo_scan_${Date.now()}_${Math.random().toString(36).slice(2)}.json`;
    try {
      const out = execSync(
        `python3 -c "
import boto3, json
from decimal import Decimal

def deser(obj):
    if isinstance(obj, list): return [deser(i) for i in obj]
    if isinstance(obj, dict): return {k: deser(v) for k, v in obj.items()}
    if isinstance(obj, Decimal): return float(obj)
    return obj

session = boto3.Session(profile_name='${profile}')
db = session.resource('dynamodb', region_name='${region}')
tbl = db.Table('${table}')
resp = tbl.scan(Limit=${limit})
items = deser(resp.get('Items', []))
print(json.dumps({'items': items, 'count': resp.get('Count', 0), 'scannedCount': resp.get('ScannedCount', 0)}))
"`,
        { encoding: 'utf8', timeout: 20000 }
      );
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, data: JSON.parse(out.trim()) }));
    } catch (err) {
      const detail = (err.stderr ? err.stderr.toString() : '') || err.message;
      res.writeHead(502);
      res.end(JSON.stringify({ ok: false, error: detail.trim() }));
    } finally {
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }

  // ── GET /api/train-stream (SSE) ──────────────────────────────
  } else if (url.pathname === '/api/train-stream' && req.method === 'GET') {
    const script  = url.searchParams.get('script') || '';  // setup|download|prepare|train|infer
    const tables  = (url.searchParams.get('tables') || '').split(',').filter(Boolean);
    const isWin   = process.platform === 'win32';

    // Pick python: prefer .venv-train inside module dir
    const venvBin  = path.join(MODULE_DIR, '.venv-train', 'bin', 'python');
    const venvWin  = path.join(MODULE_DIR, '.venv-train', 'Scripts', 'python.exe');
    const venvPip  = isWin
      ? path.join(MODULE_DIR, '.venv-train', 'Scripts', 'pip.exe')
      : path.join(MODULE_DIR, '.venv-train', 'bin', 'pip');
    const python   = fs.existsSync(venvBin) ? venvBin : fs.existsSync(venvWin) ? venvWin : (isWin ? 'python' : 'python3');
    const sysPy    = isWin ? 'python' : 'python3';

    const sseHeaders = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    };

    function sse(event, data) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
    function streamLines(chunk, isErr) {
      chunk.toString().split(/\r?\n/).forEach((line) => { if (line.trim()) sse('line', { text: line, err: isErr }); });
    }
    function spawnStreamed(cmd, args, opts) {
      const child = spawn(cmd, args, { ...opts, env: { ...process.env } });
      child.stdout.on('data', (c) => streamLines(c, false));
      child.stderr.on('data', (c) => streamLines(c, true));
      child.on('error', (err) => { sse('fail', { code: -1, message: err.message }); res.end(); });
      req.on('close', () => { try { child.kill(); } catch {} });
      return child;
    }

    // ── setup: create .venv-train + pip install -r requirements.txt ─
    if (script === 'setup') {
      res.writeHead(200, sseHeaders);
      sse('line', { text: `Platform : ${process.platform}`, err: false });
      sse('line', { text: `Python   : ${sysPy}`, err: false });
      sse('line', { text: 'Creating virtual environment (.venv-train)...', err: false });
      const createVenv = spawnStreamed(sysPy, ['-m', 'venv', '.venv-train'], { cwd: MODULE_DIR });
      createVenv.on('close', (code1) => {
        if (code1 !== 0) { sse('fail', { code: code1 }); res.end(); return; }
        sse('line', { text: 'Virtual environment created.', err: false });
        sse('line', { text: 'Installing packages from requirements.txt (this takes a few minutes)...', err: false });
        const install = spawnStreamed(venvPip, ['install', '-r', 'requirements.txt'], { cwd: MODULE_DIR });
        install.on('close', (code2) => { sse(code2 === 0 ? 'done' : 'fail', { code: code2 }); res.end(); });
      });
      return;
    }

    const scriptMap = {
      download: { file: 'scripts/download_model.py', args: [] },
      prepare:  { file: 'scripts/prepare_data.py',   args: ['--source', 'dynamodb', '--profile', profile, '--region', region, '--tables', ...tables, '--output-dir', 'data/processed'] },
      train:    { file: 'scripts/train.py',           args: ['--config', 'configs/lora_config.yaml', '--data', 'data/processed/train.jsonl', '--output', 'models/lithia-lora'] },
      infer:    { file: 'scripts/inference.py',       args: ['--model', 'models/lithia-lora'] },
    };

    if (!scriptMap[script]) { res.writeHead(400); res.end(JSON.stringify({ ok: false, error: `Unknown script: ${script}` })); return; }
    const { file, args } = scriptMap[script];

    res.writeHead(200, sseHeaders);

    const child = spawnStreamed(python, [file, ...args], { cwd: MODULE_DIR });
    child.on('close', (code) => { sse(code === 0 ? 'done' : 'fail', { code }); res.end(); });

  // ── GET /api/infer-prompt (SSE — single prompt to fine-tuned model) ─
  } else if (url.pathname === '/api/infer-prompt' && req.method === 'GET') {
    const prompt = url.searchParams.get('prompt') || '';
    const tables = (url.searchParams.get('tables') || '').split(',').filter(Boolean);
    if (!prompt) { res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'prompt param required' })); return; }

    const isWin  = process.platform === 'win32';
    const venvBin = path.join(MODULE_DIR, '.venv-train', 'bin', 'python');
    const venvWin = path.join(MODULE_DIR, '.venv-train', 'Scripts', 'python.exe');
    const python  = fs.existsSync(venvBin) ? venvBin : fs.existsSync(venvWin) ? venvWin : (isWin ? 'python' : 'python3');

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    function sse(event, data) { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); }

    const args = ['scripts/inference.py', '--model', 'models/lithia-lora', '--prompt', prompt, '--max-tokens', '200'];
    if (tables.length) args.push('--tables', ...tables, '--region', region);

    const child = spawn(python, args, { cwd: MODULE_DIR, env: { ...process.env, AWS_PROFILE: profile } });
    let answering = false;
    let buf = '';

    child.stdout.on('data', (chunk) => {
      chunk.toString().split(/\r?\n/).forEach((line) => {
        if (!line.trim()) return;
        // Lines before "A:" are status — skip them
        if (!answering && line.startsWith('A: ')) {
          answering = true;
          buf = line.slice(3);
          sse('token', { text: buf });
        } else if (answering) {
          sse('token', { text: '\n' + line });
        }
      });
    });
    child.stderr.on('data', () => {}); // suppress loading messages
    child.on('close', (code) => { sse(code === 0 ? 'done' : 'fail', { code }); res.end(); });
    child.on('error', (err) => { sse('fail', { code: -1, message: err.message }); res.end(); });
    req.on('close', () => { try { child.kill(); } catch {} });

  // ── DELETE /api/dynamodb-table ────────────────────────────────
  } else if (url.pathname === '/api/dynamodb-table' && req.method === 'DELETE') {
    const table = url.searchParams.get('table') || '';
    if (!table) { res.writeHead(400); res.end(JSON.stringify({ ok: false, error: 'table param required' })); return; }
    const result = runCmd(
      `aws dynamodb delete-table --profile "${profile}" --region "${region}" --table-name "${table}" --output json`
    );
    res.writeHead(result.ok ? 200 : 502);
    res.end(JSON.stringify(result));

  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ ok: false, error: 'Not found' }));
  }
});

server.listen(PORT, () =>
  console.log(`[api-server] AWS API bridge listening on http://localhost:${PORT}`)
);
