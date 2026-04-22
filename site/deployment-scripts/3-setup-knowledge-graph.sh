#!/bin/bash

# Automotive Data Storage Setup Script
# Creates student-defined DynamoDB tables for a Lithia Motors AI product

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AWS_REGION="${AWS_REGION:-us-west-2}"
TABLE_PREFIX="${TABLE_PREFIX:-lithia}"
STUDENT_ID="${STUDENT_ID:-student0001}"
RESOURCE_GROUP="${RESOURCE_GROUP:-dataai-account-student0001}"
SKIP_CONFIRMATION="${SKIP_CONFIRMATION:-false}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Automotive Data Setup (DynamoDB)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Functions
command_exists() { command -v "$1" >/dev/null 2>&1; }
print_status()   { echo -e "${GREEN}✓${NC} $1"; }
print_error()    { echo -e "${RED}✗${NC} $1"; }
print_warning()  { echo -e "${YELLOW}⚠${NC} $1"; }

# ── Step 1: Prerequisites ───────────────────────────────────────────
echo -e "${BLUE}Step 1: Checking Prerequisites${NC}"

if ! command_exists aws; then print_error "AWS CLI not installed"; exit 1; fi
print_status "AWS CLI installed"

if ! aws sts get-caller-identity --profile uo-innovation &>/dev/null; then
    print_error "AWS credentials not configured. Run: aws sso login --profile uo-innovation"
    exit 1
fi
print_status "AWS credentials configured"

if ! command_exists python3; then print_error "Python 3 not installed"; exit 1; fi
print_status "Python 3 installed"

# ── Step 2: Student defines tables ─────────────────────────────────
echo ""
echo -e "${BLUE}Step 2: Define Your DynamoDB Tables${NC}"
echo ""
echo "Think about what data your AI product needs to track."
echo ""
echo -e "${YELLOW}Suggested tables for a Lithia Motors AI product:${NC}"
echo "  vehicles    — vehicle_vin, make, model, year, price, status, location"
echo "  customers   — customer_id, name, contact, preferences, lifetime_value"
echo "  deals       — deal_id, customer_id, vehicle_vin, stage, amount, date"
echo "  service     — service_id, vehicle_vin, type, technician, date, status"
echo "  inventory   — inventory_id, vehicle_vin, location_id, days_on_lot, asking_price"
echo "  leads       — lead_id, source, customer_id, vehicle_interest, score"
echo ""
echo "Enter table names (space-separated). Press ENTER to use the defaults above."
echo ""

DEFAULT_TABLES="vehicles customers deals service inventory leads"

if [ "$SKIP_CONFIRMATION" = false ]; then
    read -r -p "Tables [${DEFAULT_TABLES}]: " USER_INPUT
    TABLE_NAMES="${USER_INPUT:-$DEFAULT_TABLES}"
else
    TABLE_NAMES="$DEFAULT_TABLES"
fi

echo ""
echo "Tables to create:"
for NAME in $TABLE_NAMES; do
    echo "  → ${TABLE_PREFIX}-${NAME}"
done
echo ""

if [ "$SKIP_CONFIRMATION" = false ]; then
    read -r -p "Create these tables? (y/n): " CONFIRM
    if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
        echo "Cancelled. Re-run and enter different table names."
        exit 0
    fi
fi

# ── Step 3: Create tables ───────────────────────────────────────────
echo ""
echo -e "${BLUE}Step 3: Creating DynamoDB Tables${NC}"

get_key() {
    case "$1" in
        vehicles)   echo "vehicle_vin"  ;;
        customers)  echo "customer_id"  ;;
        deals)      echo "deal_id"      ;;
        service)    echo "service_id"   ;;
        inventory)  echo "inventory_id" ;;
        leads)      echo "lead_id"      ;;
        *)          echo "${1}_id"      ;;
    esac
}

for NAME in $TABLE_NAMES; do
    TABLE="${TABLE_PREFIX}-${NAME}"
    KEY=$(get_key "$NAME")
    if aws dynamodb describe-table \
        --profile uo-innovation \
        --table-name "${TABLE}" \
        --region "${AWS_REGION}" &>/dev/null; then
        print_warning "Table ${TABLE} already exists — skipping"
    else
        aws dynamodb create-table \
            --profile uo-innovation \
            --table-name "${TABLE}" \
            --attribute-definitions AttributeName=${KEY},AttributeType=S \
            --key-schema AttributeName=${KEY},KeyType=HASH \
            --billing-mode PAY_PER_REQUEST \
            --region "${AWS_REGION}" \
            --tags Key=Project,Value=automotive-ai Key=Environment,Value=innovation-sandbox \
                   Key=ResourceGroup,Value="${RESOURCE_GROUP}" Key=Owner,Value="${STUDENT_ID}" \
            >/dev/null
        print_status "Created ${TABLE}  (key: ${KEY})"
    fi
done

echo ""
echo "Waiting for tables to become active..."
sleep 8
for NAME in $TABLE_NAMES; do
    aws dynamodb wait table-exists \
        --profile uo-innovation \
        --table-name "${TABLE_PREFIX}-${NAME}" \
        --region "${AWS_REGION}" 2>/dev/null || true
done
print_status "All tables active"

# ── Step 4: Generate populate script ───────────────────────────────
echo ""
echo -e "${BLUE}Step 4: Creating Automotive Data Population Script${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cat > "${SCRIPT_DIR}/populate-automotive-data.py" << 'PYEOF'
#!/usr/bin/env python3
"""
Populate DynamoDB with sample Lithia Motors-style automotive data.
Usage:
  python3 populate-automotive-data.py <region> <prefix> <table1> [table2 ...]
Example:
  AWS_PROFILE=uo-innovation python3 populate-automotive-data.py us-west-2 lithia vehicles customers deals
"""
import boto3
import sys
from decimal import Decimal

SAMPLE = {
    'vehicles': [
        {'vehicle_vin': 'VIN001', 'make': 'Toyota', 'model': 'Camry', 'year': '2023', 'price': Decimal('28500'), 'status': 'available', 'location': 'Portland'},
        {'vehicle_vin': 'VIN002', 'make': 'Ford',   'model': 'F-150', 'year': '2022', 'price': Decimal('42000'), 'status': 'sold',      'location': 'Eugene'},
        {'vehicle_vin': 'VIN003', 'make': 'Honda',  'model': 'Civic', 'year': '2024', 'price': Decimal('24900'), 'status': 'available', 'location': 'Portland'},
        {'vehicle_vin': 'VIN004', 'make': 'Toyota', 'model': 'RAV4',  'year': '2024', 'price': Decimal('35200'), 'status': 'available', 'location': 'Bend'},
        {'vehicle_vin': 'VIN005', 'make': 'Chevy',  'model': 'Tahoe', 'year': '2022', 'price': Decimal('58000'), 'status': 'available', 'location': 'Eugene'},
    ],
    'customers': [
        {'customer_id': 'CUST001', 'name': 'Alex Rivera',  'contact': 'alex@email.com',   'preferences': 'SUV, hybrid',       'lifetime_value': Decimal('85000')},
        {'customer_id': 'CUST002', 'name': 'Jordan Kim',   'contact': 'jordan@email.com', 'preferences': 'truck, diesel',     'lifetime_value': Decimal('125000')},
        {'customer_id': 'CUST003', 'name': 'Morgan Lee',   'contact': 'morgan@email.com', 'preferences': 'sedan, low mileage','lifetime_value': Decimal('42000')},
        {'customer_id': 'CUST004', 'name': 'Casey Nguyen', 'contact': 'casey@email.com',  'preferences': 'electric, compact', 'lifetime_value': Decimal('31000')},
    ],
    'deals': [
        {'deal_id': 'DEAL001', 'customer_id': 'CUST001', 'vehicle_vin': 'VIN001', 'stage': 'negotiation', 'amount': Decimal('27500'), 'date': '2026-04-10'},
        {'deal_id': 'DEAL002', 'customer_id': 'CUST002', 'vehicle_vin': 'VIN002', 'stage': 'closed',      'amount': Decimal('41000'), 'date': '2026-03-22'},
        {'deal_id': 'DEAL003', 'customer_id': 'CUST004', 'vehicle_vin': 'VIN003', 'stage': 'prospect',   'amount': Decimal('24500'), 'date': '2026-04-18'},
    ],
    'service': [
        {'service_id': 'SVC001', 'vehicle_vin': 'VIN002', 'type': 'oil change',       'technician': 'T001', 'date': '2026-04-01', 'status': 'complete'},
        {'service_id': 'SVC002', 'vehicle_vin': 'VIN001', 'type': 'tire rotation',    'technician': 'T002', 'date': '2026-04-15', 'status': 'scheduled'},
        {'service_id': 'SVC003', 'vehicle_vin': 'VIN004', 'type': 'brake inspection', 'technician': 'T001', 'date': '2026-04-20', 'status': 'in-progress'},
    ],
    'inventory': [
        {'inventory_id': 'INV001', 'vehicle_vin': 'VIN001', 'location_id': 'LOC-PDX', 'days_on_lot': Decimal('12'), 'asking_price': Decimal('28500')},
        {'inventory_id': 'INV002', 'vehicle_vin': 'VIN003', 'location_id': 'LOC-PDX', 'days_on_lot': Decimal('3'),  'asking_price': Decimal('24900')},
        {'inventory_id': 'INV003', 'vehicle_vin': 'VIN004', 'location_id': 'LOC-BND', 'days_on_lot': Decimal('28'), 'asking_price': Decimal('35200')},
        {'inventory_id': 'INV004', 'vehicle_vin': 'VIN005', 'location_id': 'LOC-EUG', 'days_on_lot': Decimal('45'), 'asking_price': Decimal('56500')},
    ],
    'leads': [
        {'lead_id': 'LEAD001', 'source': 'web',      'customer_id': 'CUST003', 'vehicle_interest': 'Honda Civic 2024', 'score': Decimal('82')},
        {'lead_id': 'LEAD002', 'source': 'referral', 'customer_id': 'CUST001', 'vehicle_interest': 'Toyota RAV4 2024', 'score': Decimal('91')},
        {'lead_id': 'LEAD003', 'source': 'walk-in',  'customer_id': 'CUST004', 'vehicle_interest': 'Electric sedan',   'score': Decimal('74')},
        {'lead_id': 'LEAD004', 'source': 'web',      'customer_id': 'CUST002', 'vehicle_interest': 'Ford F-150 2024',  'score': Decimal('88')},
    ],
}


def main():
    if len(sys.argv) < 4:
        print("Usage: python3 populate-automotive-data.py <region> <prefix> <table1> [table2 ...]")
        print("Example: AWS_PROFILE=uo-innovation python3 populate-automotive-data.py us-west-2 lithia vehicles customers deals")
        sys.exit(1)
    region, prefix, tables = sys.argv[1], sys.argv[2], sys.argv[3:]
    db = boto3.resource('dynamodb', region_name=region)
    print(f"Populating {prefix}-* tables in {region}")
    print("=" * 50)
    for name in tables:
        if name not in SAMPLE:
            print(f"  ⚠  No sample data for '{name}' — table created but left empty")
            continue
        table = db.Table(f'{prefix}-{name}')
        with table.batch_writer() as batch:
            for item in SAMPLE[name]:
                batch.put_item(Item=item)
        print(f"  ✓  {prefix}-{name}: {len(SAMPLE[name])} records")
    print("\nRecord counts:")
    for name in tables:
        try:
            count = db.Table(f'{prefix}-{name}').scan(Select='COUNT')['Count']
            print(f"  {prefix}-{name}: {count}")
        except Exception as e:
            print(f"  {prefix}-{name}: error ({e})")
    print("\nDone — tables are ready for AI queries.")


if __name__ == "__main__":
    main()
PYEOF

chmod +x "${SCRIPT_DIR}/populate-automotive-data.py"
print_status "Created populate-automotive-data.py"

# ── Step 5: Python dependencies ─────────────────────────────────────
echo ""
echo -e "${BLUE}Step 5: Installing Python Dependencies${NC}"

if python3 -m pip install boto3 --quiet 2>/dev/null; then
    print_status "boto3 installed"
else
    print_warning "Could not install boto3 automatically. Run: pip install boto3"
fi

# ── Step 6: Populate data ───────────────────────────────────────────
echo ""
echo -e "${BLUE}Step 6: Populate Sample Automotive Data${NC}"

if [ "$SKIP_CONFIRMATION" = false ]; then
    read -r -p "Populate tables with sample Lithia Motors data now? (y/n): " POPULATE
else
    POPULATE="y"
fi

if [[ $POPULATE =~ ^[Yy]$ ]]; then
    # shellcheck disable=SC2086
    if AWS_PROFILE=uo-innovation python3 "${SCRIPT_DIR}/populate-automotive-data.py" "${AWS_REGION}" "${TABLE_PREFIX}" ${TABLE_NAMES}; then
        print_status "Automotive sample data loaded"
    else
        print_warning "Population failed. Run manually:"
        echo "  AWS_PROFILE=uo-innovation python3 populate-automotive-data.py ${AWS_REGION} ${TABLE_PREFIX} ${TABLE_NAMES}"
    fi
else
    echo "To populate later:"
    echo "  AWS_PROFILE=uo-innovation python3 populate-automotive-data.py ${AWS_REGION} ${TABLE_PREFIX} ${TABLE_NAMES}"
fi

# ── Step 7: Save config ─────────────────────────────────────────────
echo ""
echo -e "${BLUE}Step 7: Saving Configuration${NC}"

{
    echo "DynamoDB Automotive Setup — ${TABLE_PREFIX}"
    echo "Region:  ${AWS_REGION}"
    echo "Created: $(date)"
    echo ""
    echo "Tables:"
    for N in ${TABLE_NAMES}; do echo "  ${TABLE_PREFIX}-${N}"; done
    echo ""
    echo "Useful commands:"
    echo "  aws dynamodb list-tables --region ${AWS_REGION} --profile uo-innovation"
    echo "  aws dynamodb scan --table-name ${TABLE_PREFIX}-vehicles --region ${AWS_REGION} --profile uo-innovation"
    echo ""
    echo "Re-populate:"
    echo "  AWS_PROFILE=uo-innovation python3 populate-automotive-data.py ${AWS_REGION} ${TABLE_PREFIX} ${TABLE_NAMES}"
    echo ""
    echo "Delete all tables:"
    for N in ${TABLE_NAMES}; do
        echo "  aws dynamodb delete-table --table-name ${TABLE_PREFIX}-${N} --region ${AWS_REGION} --profile uo-innovation"
    done
} > "${SCRIPT_DIR}/dynamodb-info.txt"

print_status "Saved dynamodb-info.txt"

# ── Summary ─────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Automotive Data Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Region:  ${AWS_REGION}"
echo "Tables:  ${TABLE_PREFIX}-{${TABLE_NAMES// /,}}"
echo ""
echo "Next: Run ./4-deploy-integration.sh to connect AI with DynamoDB"
