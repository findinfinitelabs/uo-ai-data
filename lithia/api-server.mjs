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
import { execSync, spawn } from 'child_process';

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
    const result = runCmd('aws configure list-profiles');
    if (result.ok) {
      // list-profiles returns plain text not JSON; re-run as text
    }
    try {
      const raw = execSync('aws configure list-profiles', { encoding: 'utf8', timeout: 5000 });
      const profiles = raw.trim().split('\n').filter(Boolean);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, data: profiles }));
    } catch (err) {
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, data: ['uo-innovation'] }));
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
