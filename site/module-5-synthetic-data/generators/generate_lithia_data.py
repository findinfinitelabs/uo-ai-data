"""
Lithia Motors Synthetic Data Generator

Generates synthetic vehicle inventory and customer interaction records
for the UO AI Data Class. All data is completely fictional.

Output:
  datasets/lithia/vehicles.json       — vehicle inventory records
  datasets/lithia/leads.json          — customer lead / CRM records

Usage:
    python generate_lithia_data.py [--records N] [--upload]

    --records N   Number of vehicle records to generate (default: 200)
    --upload      Upload to DynamoDB after generating
                  (requires AWS profile 'uo-innovation' to be logged in)
"""

import argparse
import csv
import json
import os
import random
import uuid
from datetime import datetime, timedelta

random.seed(42)

# ── Vehicle data ─────────────────────────────────────────────────────────────

MAKES_MODELS = {
    "Toyota":       ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra"],
    "Honda":        ["Accord", "Civic", "CR-V", "Pilot", "Ridgeline"],
    "Ford":         ["F-150", "Mustang", "Explorer", "Escape", "Bronco"],
    "Chevrolet":    ["Silverado", "Equinox", "Tahoe", "Traverse", "Colorado"],
    "BMW":          ["3 Series", "5 Series", "X3", "X5", "M4"],
    "Mercedes-Benz":["C-Class", "E-Class", "GLC", "GLE", "S-Class"],
    "Audi":         ["A4", "A6", "Q5", "Q7", "e-tron"],
    "Hyundai":      ["Elantra", "Tucson", "Santa Fe", "Sonata", "Palisade"],
    "Kia":          ["Telluride", "Sportage", "Sorento", "Soul", "Forte"],
    "Nissan":       ["Altima", "Rogue", "Sentra", "Pathfinder", "Frontier"],
    "Subaru":       ["Outback", "Forester", "Crosstrek", "Impreza"],
    "Jeep":         ["Wrangler", "Grand Cherokee", "Compass", "Gladiator"],
    "Ram":          ["1500", "2500", "3500", "ProMaster"],
    "Volkswagen":   ["Jetta", "Tiguan", "Atlas", "Taos"],
    "Mazda":        ["CX-5", "Mazda3", "CX-50", "MX-5 Miata"],
}

STYLES       = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible", "Van", "Wagon"]
COLORS       = ["White", "Black", "Silver", "Gray", "Red", "Blue", "Green", "Brown", "Beige"]
CONDITIONS   = ["New", "Used", "Certified Pre-Owned"]
TRANSMISSIONS= ["Automatic", "Manual", "CVT"]
DRIVETRAINS  = ["FWD", "RWD", "AWD", "4WD"]
TITLE_STATUS = ["clean", "salvage", "rebuilt", "lien"]
RECALL_STATUS= ["none", "open", "resolved"]
DEALERSHIPS  = [
    "Lithia Toyota of Springfield",
    "Lithia Honda of Medford",
    "Lithia Ford Lincoln of Roseburg",
    "Lithia Chevrolet of Redding",
    "Lithia Subaru of Eugene",
    "Lithia Jeep Ram of Bend",
    "Lithia BMW of Tucson",
    "Lithia Nissan of Fresno",
]

VIN_CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"


def random_vin():
    return "".join(random.choices(VIN_CHARS, k=17))


def random_date(days_back=365):
    delta = timedelta(days=random.randint(0, days_back))
    return (datetime.now() - delta).strftime("%Y-%m-%d")


def generate_vehicle():
    make  = random.choice(list(MAKES_MODELS.keys()))
    model = random.choice(MAKES_MODELS[make])
    year  = random.randint(2015, 2026)
    cond  = random.choices(CONDITIONS, weights=[30, 50, 20])[0]
    base  = round(random.uniform(18_000, 95_000), 2)
    msrp  = round(base * random.uniform(1.02, 1.15), 2)
    miles = 0 if cond == "New" else random.randint(5_000, 120_000)

    return {
        "id":           str(uuid.uuid4()),
        "type":         "vehicle",
        "vin":          random_vin(),
        "year":         year,
        "make":         make,
        "model":        model,
        "style":        random.choice(STYLES),
        "color":        random.choice(COLORS),
        "condition":    cond,
        "mileage":      miles,
        "transmission": random.choice(TRANSMISSIONS),
        "drivetrain":   random.choice(DRIVETRAINS),
        "cost":         base,
        "msrp":         msrp,
        "list_price":   round(msrp * random.uniform(0.97, 1.03), 2),
        "days_on_lot":  random.randint(0, 180),
        "dealership":   random.choice(DEALERSHIPS),
        "received_date":random_date(400),
        "compliance": {
            "title_status":       random.choices(TITLE_STATUS, weights=[85, 5, 7, 3])[0],
            "emissions_compliant": random.random() > 0.05,
            "safety_certified":    random.random() > 0.03,
            "recall_status":       random.choices(RECALL_STATUS, weights=[70, 15, 15])[0],
        },
    }


# ── Lead / CRM data ───────────────────────────────────────────────────────────

LEAD_SOURCES = ["Website", "Walk-in", "Phone", "Referral", "AutoTrader", "Cars.com", "CarGurus"]
LEAD_STATUSES= ["new", "contacted", "appointment_set", "visited", "sold", "lost"]
INTEREST     = ["purchase", "lease", "trade-in", "service"]
SALESPERSON_NAMES = [
    "Jordan Lee", "Taylor Kim", "Alex Martinez", "Sam Patel",
    "Casey Robinson", "Morgan Davis", "Riley Chen", "Drew Thompson",
]


def random_phone():
    return f"({random.randint(200,999)}) {random.randint(200,999)}-{random.randint(1000,9999)}"


def generate_lead():
    status = random.choices(LEAD_STATUSES, weights=[10, 25, 20, 20, 15, 10])[0]
    created = random_date(90)
    return {
        "id":           str(uuid.uuid4()),
        "type":         "lead",
        "source":       random.choice(LEAD_SOURCES),
        "status":       status,
        "interest":     random.choice(INTEREST),
        "dealership":   random.choice(DEALERSHIPS),
        "salesperson":  random.choice(SALESPERSON_NAMES),
        "created_date": created,
        "last_contact": random_date(30),
        "vehicle_interest": {
            "make":      random.choice(list(MAKES_MODELS.keys())),
            "condition": random.choice(CONDITIONS),
            "budget_min": round(random.uniform(15_000, 40_000), 2),
            "budget_max": round(random.uniform(40_001, 100_000), 2),
        },
        "converted": status == "sold",
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate Lithia Motors synthetic data")
    parser.add_argument("--records", type=int, default=200, help="Number of vehicle records")
    parser.add_argument("--upload",  action="store_true", help="Upload to DynamoDB after generating")
    args = parser.parse_args()

    os.makedirs("datasets/lithia", exist_ok=True)

    # Vehicles
    vehicles = [generate_vehicle() for _ in range(args.records)]
    v_path = "datasets/lithia/vehicles.json"
    with open(v_path, "w") as f:
        json.dump(vehicles, f, indent=2)
    print(f"✓ Generated {len(vehicles)} vehicle records → {v_path}")

    # Leads (half as many)
    leads = [generate_lead() for _ in range(args.records // 2)]
    l_path = "datasets/lithia/leads.json"
    with open(l_path, "w") as f:
        json.dump(leads, f, indent=2)
    print(f"✓ Generated {len(leads)} lead records → {l_path}")

    if args.upload:
        upload_to_dynamodb(vehicles, leads)


def upload_to_dynamodb(vehicles, leads):
    try:
        import boto3
        from decimal import Decimal
    except ImportError:
        print("✗ boto3 not installed. Run: pip install boto3")
        return

    profile = os.environ.get("AWS_PROFILE", "uo-innovation")
    region  = os.environ.get("AWS_DEFAULT_REGION", "us-west-2")

    print(f"\nUploading to DynamoDB (profile={profile}, region={region})...")

    session = boto3.Session(profile_name=profile, region_name=region)
    ddb     = session.resource("dynamodb")

    def ensure_table(name, key="id"):
        client = session.client("dynamodb")
        existing = [t for t in client.list_tables()["TableNames"] if t == name]
        if not existing:
            print(f"  Creating table: {name}")
            client.create_table(
                TableName=name,
                AttributeDefinitions=[{"AttributeName": key, "AttributeType": "S"}],
                KeySchema=[{"AttributeName": key, "KeyType": "HASH"}],
                BillingMode="PAY_PER_REQUEST",
            )
            waiter = client.get_waiter("table_exists")
            waiter.wait(TableName=name)
            print(f"  ✓ Table ready: {name}")
        else:
            print(f"  ✓ Table exists: {name}")
        return ddb.Table(name)

    def to_decimal(obj):
        if isinstance(obj, list):  return [to_decimal(i) for i in obj]
        if isinstance(obj, dict):  return {k: to_decimal(v) for k, v in obj.items()}
        if isinstance(obj, float): return Decimal(str(obj))
        if isinstance(obj, int):   return Decimal(obj)
        return obj

    def batch_write(table, records):
        with table.batch_writer() as bw:
            for rec in records:
                bw.put_item(Item=to_decimal(rec))

    v_table = ensure_table("lithia-vehicles")
    batch_write(v_table, vehicles)
    print(f"  ✓ Uploaded {len(vehicles)} vehicles → lithia-vehicles")

    l_table = ensure_table("lithia-leads")
    batch_write(l_table, leads)
    print(f"  ✓ Uploaded {len(leads)} leads → lithia-leads")

    print("\n✓ DynamoDB upload complete.")
    print("  Tables: lithia-vehicles, lithia-leads")
    print(f"  Region: {region}")


if __name__ == "__main__":
    main()
