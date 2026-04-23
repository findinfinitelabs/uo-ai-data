import json, uuid, random

makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Hyundai", "Kia", "Nissan", "Subaru", "Mazda", "Volkswagen", "Jeep", "Ram"]
models = {
    "Toyota":       ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra", "4Runner"],
    "Honda":        ["Accord", "Civic", "CR-V", "Pilot", "Ridgeline", "Passport"],
    "Ford":         ["F-150", "Mustang", "Explorer", "Escape", "Bronco", "Edge"],
    "Chevrolet":    ["Silverado", "Equinox", "Tahoe", "Traverse", "Colorado", "Malibu"],
    "BMW":          ["3 Series", "5 Series", "X3", "X5", "7 Series", "M4"],
    "Mercedes-Benz":["C-Class", "E-Class", "GLC", "GLE", "S-Class", "A-Class"],
    "Audi":         ["A4", "A6", "Q5", "Q7", "A3", "e-tron"],
    "Hyundai":      ["Elantra", "Tucson", "Santa Fe", "Sonata", "Palisade"],
    "Kia":          ["Telluride", "Sportage", "Sorento", "Soul", "Forte", "K5"],
    "Nissan":       ["Altima", "Rogue", "Sentra", "Pathfinder", "Frontier", "Armada"],
    "Subaru":       ["Outback", "Forester", "Impreza", "Crosstrek", "Legacy"],
    "Mazda":        ["CX-5", "Mazda3", "CX-9", "CX-50", "MX-5 Miata"],
    "Volkswagen":   ["Jetta", "Passat", "Tiguan", "Atlas", "Golf"],
    "Jeep":         ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator"],
    "Ram":          ["1500", "2500", "3500", "ProMaster"],
}
styles = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Convertible", "Van", "Wagon"]
title_statuses = ["clean", "salvage", "rebuilt", "lien"]
recall_statuses = ["none", "open", "resolved"]

VIN_CHARS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789"

def random_vin():
    return "".join(random.choices(VIN_CHARS, k=17))

records = []
for _ in range(100):
    make  = random.choice(makes)
    model = random.choice(models[make])
    year  = random.randint(2015, 2026)
    base  = round(random.uniform(18000, 95000), 2)
    msrp  = round(base * random.uniform(1.02, 1.15), 2)
    record = {
        "id":    str(uuid.uuid4()),
        "type":  "vehicle",
        "vin":   random_vin(),
        "year":  year,
        "make":  make,
        "model": model,
        "style": random.choice(styles),
        "cost":  base,
        "msrp":  msrp,
        "compliance": {
            "title_status":       random.choices(title_statuses, weights=[85, 5, 7, 3])[0],
            "emissions_compliant": random.random() > 0.05,
            "safety_certified":    random.random() > 0.03,
            "recall_status":       random.choices(recall_statuses, weights=[70, 15, 15])[0],
        }
    }
    records.append(record)

out = "/Users/findinfinitelabs/DevApps/uo-ai-data/datasets/vehicle-inventory/vehicle_inventory_100.json"
with open(out, "w") as f:
    json.dump(records, f, indent=2)

print(f"Written {len(records)} records to {out}")
