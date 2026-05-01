#!/usr/bin/env bash
###############################################################################
# deploy-dynamodb.sh
#
# Generates Lithia Motors synthetic data and deploys it to DynamoDB.
# Run from the site/ directory after activating the Python venv.
#
# Usage:
#   ./deployment-scripts/deploy-dynamodb.sh [--records N] [--profile PROFILE]
#
# Options:
#   --records N      Number of vehicle records to generate (default: 200)
#   --profile NAME   AWS CLI profile to use (default: uo-innovation)
#   --region NAME    AWS region (default: us-west-2)
#
# Requirements:
#   - Python venv activated  (source venv/bin/activate)
#   - AWS SSO login done     (aws sso login --profile uo-innovation)
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

RECORDS=200
PROFILE="uo-innovation"
REGION="us-west-2"

for arg in "$@"; do
    case $arg in
        --records=*) RECORDS="${arg#*=}" ;;
        --records)   shift; RECORDS="$1" ;;
        --profile=*) PROFILE="${arg#*=}" ;;
        --profile)   shift; PROFILE="$1" ;;
        --region=*)  REGION="${arg#*=}" ;;
        --region)    shift; REGION="$1" ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="$(dirname "$SCRIPT_DIR")"
cd "$SITE_DIR"

echo -e "${BOLD}${CYAN}========================================${NC}"
echo -e "${BOLD}${CYAN}Lithia DynamoDB Deploy${NC}"
echo -e "${BOLD}${CYAN}========================================${NC}"
echo ""
echo -e "  Profile : ${BOLD}$PROFILE${NC}"
echo -e "  Region  : ${BOLD}$REGION${NC}"
echo -e "  Records : ${BOLD}$RECORDS vehicles${NC}"
echo ""

# ── 1. Verify AWS login ───────────────────────────────────────────────────────
echo -e "${BLUE}Checking AWS login...${NC}"
if ! aws sts get-caller-identity --profile "$PROFILE" --output text > /dev/null 2>&1; then
    echo -e "${YELLOW}Session expired or not logged in. Opening AWS SSO login...${NC}"
    aws sso login --profile "$PROFILE"
    echo -e "${CYAN}Return here once you've signed in. Re-running check...${NC}"
    if ! aws sts get-caller-identity --profile "$PROFILE" --output text > /dev/null 2>&1; then
        echo -e "${RED}✗ AWS login failed. Please run: aws sso login --profile $PROFILE${NC}"
        exit 1
    fi
fi

ACCOUNT=$(aws sts get-caller-identity --profile "$PROFILE" --query Account --output text)
echo -e "${GREEN}✓ Logged in — account: $ACCOUNT${NC}"
echo ""

# ── 2. Verify Python / boto3 ─────────────────────────────────────────────────
echo -e "${BLUE}Checking Python environment...${NC}"

PYTHON_BIN=""
for candidate in python3 python; do
    if command -v "$candidate" >/dev/null 2>&1; then
        PYTHON_BIN="$candidate"
        break
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    echo -e "${RED}✗ Python not found. Activate the venv first:${NC}"
    echo -e "   ${BOLD}source venv/bin/activate${NC}"
    exit 1
fi

if ! "$PYTHON_BIN" -c "import boto3" 2>/dev/null; then
    echo -e "${YELLOW}boto3 not found — installing...${NC}"
    "$PYTHON_BIN" -m pip install boto3 --quiet
fi

echo -e "${GREEN}✓ Python ready: $($PYTHON_BIN --version)${NC}"
echo ""

# ── 3. Generate + upload ──────────────────────────────────────────────────────
echo -e "${BLUE}Generating Lithia synthetic data and uploading to DynamoDB...${NC}"
echo ""

AWS_PROFILE="$PROFILE" AWS_DEFAULT_REGION="$REGION" \
    "$PYTHON_BIN" module-5-synthetic-data/generators/generate_lithia_data.py \
        --records "$RECORDS" \
        --upload

echo ""
echo -e "${BOLD}${CYAN}========================================${NC}"
echo -e "${GREEN}${BOLD}✓ Deploy complete!${NC}"
echo -e "${BOLD}${CYAN}========================================${NC}"
echo ""
echo -e "DynamoDB tables created/updated:"
echo -e "  ${BOLD}lithia-vehicles${NC}  — vehicle inventory"
echo -e "  ${BOLD}lithia-leads${NC}     — customer CRM leads"
echo ""
echo -e "View in AWS Console:"
echo -e "  ${CYAN}https://console.aws.amazon.com/dynamodb/home?region=${REGION}#tables${NC}"
echo ""
