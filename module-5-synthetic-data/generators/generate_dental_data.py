"""
Synthetic Dental Records Generator

This script generates synthetic dental examination records for educational purposes.
All data is completely fictional and does not represent real patients.
"""

import random
import json
from datetime import datetime, timedelta
import csv
import os

# Seed for reproducibility
random.seed(42)

# Configuration
NUM_VISITS = 100

# Dental procedure codes (CDT)
PROCEDURES = [
    {"code": "D0120", "description": "Periodic oral evaluation", "cost": 75},
    {"code": "D0150", "description": "Comprehensive oral evaluation", "cost": 125},
    {
        "code": "D0210",
        "description": "Intraoral complete series of radiographic images",
        "cost": 150,
    },
    {"code": "D0220", "description": "Intraoral periapical first radiographic image", "cost": 40},
    {"code": "D1110", "description": "Prophylaxis - adult", "cost": 100},
    {"code": "D2140", "description": "Amalgam - one surface", "cost": 150},
    {"code": "D2150", "description": "Amalgam - two surfaces", "cost": 200},
    {"code": "D2160", "description": "Amalgam - three surfaces", "cost": 250},
    {"code": "D2330", "description": "Resin-based composite - one surface", "cost": 175},
    {"code": "D2740", "description": "Crown - porcelain/ceramic", "cost": 1200},
    {"code": "D3310", "description": "Endodontic therapy, anterior tooth", "cost": 800},
    {"code": "D7140", "description": "Extraction, erupted tooth", "cost": 200},
]

TOOTH_CONDITIONS = [
    "healthy",
    "caries",
    "filling",
    "crown",
    "bridge",
    "implant",
    "missing",
    "root_canal",
    "crack",
    "chip",
]

TOOTH_SURFACES = ["occlusal", "mesial", "distal", "buccal", "lingual", "incisal"]

CHIEF_COMPLAINTS = [
    "Routine checkup",
    "Tooth pain",
    "Sensitivity to cold",
    "Bleeding gums",
    "Broken tooth",
    "Lost filling",
    "Cosmetic consultation",
]

ORAL_HYGIENE_RATINGS = ["excellent", "good", "fair", "poor"]


def generate_visit_id(index):
    """Generate unique visit ID"""
    return f"V{index:010d}"


def generate_patient_id():
    """Generate patient ID (reference to health records)"""
    return f"P{random.randint(1, 99999999):08d}"


def generate_provider_id():
    """Generate dentist ID"""
    return f"D{random.randint(100000, 999999):06d}"


def generate_visit_date():
    """Generate visit date within last 2 years"""
    days_ago = random.randint(0, 730)
    return (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")


def generate_teeth_assessment():
    """Generate assessment for individual teeth"""
    assessments = []

    # Number of adult teeth is 32 (28 without wisdom teeth)
    num_teeth = 32

    # Most teeth are healthy
    num_issues = random.randint(0, 5)

    if num_issues > 0:
        teeth_with_issues = random.sample(range(1, num_teeth + 1), num_issues)

        for tooth_num in teeth_with_issues:
            condition = random.choice(TOOTH_CONDITIONS[1:])  # Exclude 'healthy'

            assessment = {"tooth_number": tooth_num, "condition": condition}

            # Add surface if relevant
            if condition in ["caries", "filling", "crack", "chip"]:
                assessment["surface"] = random.choice(TOOTH_SURFACES)

            # Add notes occasionally
            if random.random() < 0.3:
                assessment["notes"] = f"Monitor {condition}"

            assessments.append(assessment)

    return assessments


def generate_periodontal_screening():
    """Generate periodontal screening data"""
    psr_code = random.randint(0, 4)
    bleeding = psr_code >= 2  # More likely to bleed with higher PSR

    screening = {"psr_code": psr_code, "bleeding_on_probing": bleeding}

    # Add detailed pocket depths for some patients
    if psr_code >= 3:
        pocket_depths = []
        # Check random sample of teeth
        teeth_to_check = random.sample(range(1, 33), random.randint(4, 8))

        for tooth_num in teeth_to_check:
            # 6 measurements per tooth
            measurements = [random.randint(1, 6) for _ in range(6)]
            pocket_depths.append({"tooth_number": tooth_num, "measurements": measurements})

        screening["pocket_depths"] = pocket_depths

    return screening


def generate_treatment_plan(teeth_assessment):
    """Generate treatment plan based on assessment"""
    treatments = []

    for tooth in teeth_assessment:
        condition = tooth["condition"]
        tooth_num = tooth["tooth_number"]

        # Determine appropriate treatment
        if condition == "caries":
            # Filling needed
            proc = random.choice([PROCEDURES[5], PROCEDURES[6], PROCEDURES[7], PROCEDURES[8]])
            treatments.append(
                {
                    "procedure_code": proc["code"],
                    "description": proc["description"],
                    "tooth_number": tooth_num,
                    "priority": "high" if random.random() < 0.3 else "medium",
                    "estimated_cost": proc["cost"],
                }
            )
        elif condition == "crack":
            # May need crown
            treatments.append(
                {
                    "procedure_code": PROCEDURES[9]["code"],
                    "description": PROCEDURES[9]["description"],
                    "tooth_number": tooth_num,
                    "priority": "medium",
                    "estimated_cost": PROCEDURES[9]["cost"],
                }
            )
        elif condition == "chip":
            # Composite restoration
            treatments.append(
                {
                    "procedure_code": PROCEDURES[8]["code"],
                    "description": PROCEDURES[8]["description"],
                    "tooth_number": tooth_num,
                    "priority": "low",
                    "estimated_cost": PROCEDURES[8]["cost"],
                }
            )

    return treatments


def generate_procedures_performed():
    """Generate procedures performed during visit"""
    procedures = []

    # Always do evaluation
    procedures.append(
        {
            "procedure_code": PROCEDURES[0]["code"],
            "description": PROCEDURES[0]["description"],
            "anesthesia_used": False,
        }
    )

    # Usually do cleaning
    if random.random() < 0.8:
        procedures.append(
            {
                "procedure_code": PROCEDURES[4]["code"],
                "description": PROCEDURES[4]["description"],
                "anesthesia_used": False,
            }
        )

    # Sometimes x-rays
    if random.random() < 0.4:
        procedures.append(
            {
                "procedure_code": PROCEDURES[2]["code"],
                "description": PROCEDURES[2]["description"],
                "anesthesia_used": False,
            }
        )

    # Occasionally fillings or other work
    if random.random() < 0.2:
        proc = random.choice(PROCEDURES[5:9])
        procedures.append(
            {
                "procedure_code": proc["code"],
                "description": proc["description"],
                "tooth_number": random.randint(1, 32),
                "anesthesia_used": True,
            }
        )

    return procedures


def generate_imaging():
    """Generate imaging records"""
    images = []

    if random.random() < 0.5:
        # Bitewings
        images.append(
            {
                "image_type": "bitewing",
                "image_id": f"IMG{random.randint(100000, 999999)}",
                "findings": random.choice(
                    ["No cavities detected", "Interproximal caries on #14", "Normal"]
                ),
            }
        )

    if random.random() < 0.3:
        # Panoramic
        images.append(
            {
                "image_type": "panoramic",
                "image_id": f"IMG{random.randint(100000, 999999)}",
                "findings": "Normal bone levels, no pathology detected",
            }
        )

    return images


def generate_dental_visit():
    """Generate a complete synthetic dental visit record"""
    visit_index = random.randint(1, 9999999999)
    visit_id = generate_visit_id(visit_index)
    patient_id = generate_patient_id()
    provider_id = generate_provider_id()
    visit_date = generate_visit_date()

    chief_complaint = random.choice(CHIEF_COMPLAINTS)
    teeth_assessment = generate_teeth_assessment()
    periodontal = generate_periodontal_screening()
    oral_hygiene = random.choice(ORAL_HYGIENE_RATINGS)
    treatment_plan = generate_treatment_plan(teeth_assessment)
    procedures = generate_procedures_performed()
    imaging = generate_imaging()

    # Next appointment recommendation
    next_apt = None
    if random.random() < 0.8:
        days_forward = random.choice([180, 365])  # 6 months or 1 year
        next_apt = {
            "recommended_date": (datetime.now() + timedelta(days=days_forward)).strftime(
                "%Y-%m-%d"
            ),
            "reason": "Routine checkup and cleaning",
        }

    return {
        "patient_id": patient_id,
        "visit_id": visit_id,
        "visit_date": visit_date,
        "provider_id": provider_id,
        "examination": {
            "chief_complaint": chief_complaint,
            "teeth_assessment": teeth_assessment,
            "periodontal_screening": periodontal,
            "oral_hygiene_index": oral_hygiene,
        },
        "treatment_plan": treatment_plan,
        "procedures_performed": procedures,
        "imaging": imaging,
        "next_appointment": next_apt,
    }


def main():
    """Generate synthetic dental visit dataset"""
    print(f"Generating {NUM_VISITS} synthetic dental visit records...")

    visits = []
    for i in range(NUM_VISITS):
        visit = generate_dental_visit()
        visits.append(visit)

    # Create output directory if it doesn't exist
    os.makedirs("datasets/dental-records", exist_ok=True)

    # Save as JSON
    json_file = "datasets/dental-records/synthetic_dental_visits.json"
    with open(json_file, "w") as f:
        json.dump(visits, f, indent=2)
    print(f"Saved JSON to {json_file}")

    # Save as CSV (flattened version)
    csv_file = "datasets/dental-records/synthetic_dental_visits.csv"
    with open(csv_file, "w", newline="") as f:
        fieldnames = [
            "visit_id",
            "patient_id",
            "visit_date",
            "provider_id",
            "chief_complaint",
            "num_teeth_issues",
            "psr_code",
            "bleeding_on_probing",
            "oral_hygiene_index",
            "num_treatments_planned",
            "num_procedures_performed",
            "num_images",
            "next_appointment_scheduled",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for visit in visits:
            row = {
                "visit_id": visit["visit_id"],
                "patient_id": visit["patient_id"],
                "visit_date": visit["visit_date"],
                "provider_id": visit["provider_id"],
                "chief_complaint": visit["examination"]["chief_complaint"],
                "num_teeth_issues": len(visit["examination"]["teeth_assessment"]),
                "psr_code": visit["examination"]["periodontal_screening"]["psr_code"],
                "bleeding_on_probing": visit["examination"]["periodontal_screening"][
                    "bleeding_on_probing"
                ],
                "oral_hygiene_index": visit["examination"]["oral_hygiene_index"],
                "num_treatments_planned": len(visit["treatment_plan"]),
                "num_procedures_performed": len(visit["procedures_performed"]),
                "num_images": len(visit["imaging"]),
                "next_appointment_scheduled": visit["next_appointment"] is not None,
            }
            writer.writerow(row)
    print(f"Saved CSV to {csv_file}")

    print(f"\nGeneration complete! Created {NUM_VISITS} synthetic dental visit records.")
    print("Note: All data is synthetic and for educational purposes only.")


if __name__ == "__main__":
    main()
