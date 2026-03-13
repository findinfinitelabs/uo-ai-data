# AWS SSO Configuration Reference (Non-Sensitive)

This guide captures the full `aws configure sso` flow for this course without storing any secrets.

## What Is Safe to Store

These values are safe to document and share:

- SSO Start URL
- SSO region
- profile name
- account ID
- role name
- default AWS region
- output format

Do **not** store access keys, session tokens, browser auth cookies, or copied credential exports.

## Course Baseline

- SSO Start URL: `https://d-9267f25f0e.awsapps.com/start`
- SSO Region: `us-west-2`
- Registration scope: default (`sso:account:access`)
- Default AWS Region: `us-west-2`
- Output format: default or `json`

## Student Identity Notes

- Each student may see a different identity format in AWS SSO and STS output.
- `UserId` / `Arn` can include an email (example: `christol@uoregon.edu`) or another identifier.
- This is normal and should not be hardcoded in scripts or docs.
- The important values for setup are: account selection, role selection, and profile name.

## Interactive Setup (Recommended)

Run:

```bash
aws configure sso
```

Suggested prompt responses:

1. **SSO session name**: `Winter 2026 Data and AI Training`
2. **SSO start URL**: `https://d-9267f25f0e.awsapps.com/start`
3. **SSO region**: `us-west-2`
4. **Registration scopes**: accept default
5. **Select account**: choose your assigned account
6. **Select role**: choose your assigned role (example: `users` or `LCBPEGA_IsbAdminsPS`)
7. **Default client region**: `us-west-2`
8. **Output format**: accept default
9. **Profile name**: recommended `uo-innovation` for class consistency (you may use another name, but then set `AWS_PROFILE` to match)

Then authenticate:

```bash
aws sso login --profile uo-innovation
```

Verify:

```bash
aws sts get-caller-identity --profile uo-innovation
```

## Optional Alternate Profile Name

If you choose a different profile name, export it before deployment:

```bash
export AWS_PROFILE=YOUR_PROFILE_NAME
```

PowerShell:

```powershell
$env:AWS_PROFILE = "YOUR_PROFILE_NAME"
```

## How This Repo Uses Profile Values

- `deploy-all.sh` uses `AWS_PROFILE` when present.
- If `AWS_PROFILE` is missing, it attempts `uo-innovation` when available.
- Child scripts rely on the environment profile, so keep `AWS_PROFILE` set in the same terminal session.

## Troubleshooting

### `AWS credentials are not configured`

Run:

```bash
aws sso login --profile uo-innovation
```

And verify:

```bash
aws sts get-caller-identity --profile uo-innovation
```

### `Not connected to any Kubernetes cluster`

If cluster creation succeeded, refresh kubeconfig:

```bash
aws eks update-kubeconfig --region us-west-2 --name ollama-ai-cluster
```
