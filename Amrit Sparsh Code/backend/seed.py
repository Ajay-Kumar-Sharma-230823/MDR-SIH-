# backend/seed.py
from backend.database import SessionLocal, engine
from backend.models import (
    Base, User, StaffProfile,
    Patient, MDRDetails, LabReport,
    PatientContact, Antibiotic,Equipment
)

import backend.models as models
import datetime
import json



# --------------------------------------------------------------------
# Create tables and open session
# --------------------------------------------------------------------
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# --------------------------------------------------------------------
# 1) Seed Users + Staff Profiles (unchanged)
# --------------------------------------------------------------------
users = [
    {"email": "krish@gmail.com", "password": "krishna123", "role": "Doctor"},
    {"email": "anurag@gmail.com", "password": "anurag123", "role": "Nurse"}
]

profiles = {
    "krish@gmail.com": {
        "full_name": "Dr. Krishna Dhingra",
        "department": "Infectious Diseases",
        "designation": "Senior Consultant",
        "gender": "Male",
        "dob": "02 Jan 1999",
        "phone": "9999999999",
        "emergency_contact": "8888888888",
        "employee_id": "EMP-1001",
        "shift": "09:00 AM - 05:00 PM",
        "abha": "10-2222-3333-4444",
    },
    "anurag@gmail.com": {
        "full_name": " Anurag Gupta",
        "department": "ICU",
        "designation": "Registered Nurse",
        "gender": "Male",
        "dob": "08 Feb 1998",
        "phone": "7777777777",
        "emergency_contact": "6666666666",
        "employee_id": "EMP-2002",
        "shift": "07:00 AM - 03:00 PM",
        "abha": "10-5555-6666-7777",
    }
}

for u in users:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if not existing:
        new_user = User(**u)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Add profile
        p = profiles[u["email"]]
        new_profile = StaffProfile(user_id=new_user.id, **p)
        db.add(new_profile)

db.commit()
print("✔ Users + Profiles ensured")

# --------------------------------------------------------------------
# 2) Seed master list of Antibiotics (Option A approach)
# --------------------------------------------------------------------
antibiotics = [
    {"name": "Meropenem", "antibiotic_class": "Carbapenem"},
    {"name": "Imipenem", "antibiotic_class": "Carbapenem"},
    {"name": "Ertapenem", "antibiotic_class": "Carbapenem"},
    {"name": "Piperacillin-Tazobactam", "antibiotic_class": "Beta-lactam/BLI"},
    {"name": "Amoxicillin-Clavulanate", "antibiotic_class": "Beta-lactam/BLI"},
    {"name": "Ceftriaxone", "antibiotic_class": "Cephalosporin"},
    {"name": "Cefotaxime", "antibiotic_class": "Cephalosporin"},
    {"name": "Cefepime", "antibiotic_class": "Cephalosporin"},
    {"name": "Ceftazidime", "antibiotic_class": "Cephalosporin"},
    {"name": "Colistin", "antibiotic_class": "Polymyxin"},
    {"name": "Polymyxin B", "antibiotic_class": "Polymyxin"},
    {"name": "Tigecycline", "antibiotic_class": "Glycylcycline"},
    {"name": "Doxycycline", "antibiotic_class": "Tetracycline"},
    {"name": "Ciprofloxacin", "antibiotic_class": "Fluoroquinolone"},
    {"name": "Levofloxacin", "antibiotic_class": "Fluoroquinolone"},
    {"name": "Gentamicin", "antibiotic_class": "Aminoglycoside"},
    {"name": "Amikacin", "antibiotic_class": "Aminoglycoside"},
    {"name": "Linezolid", "antibiotic_class": "Oxazolidinone"},
    {"name": "Vancomycin", "antibiotic_class": "Glycopeptide"},
    {"name": "Teicoplanin", "antibiotic_class": "Glycopeptide"},
    {"name": "Azithromycin", "antibiotic_class": "Macrolide"},
    {"name": "Clarithromycin", "antibiotic_class": "Macrolide"},
    {"name": "Trimethoprim-Sulfamethoxazole", "antibiotic_class": "Sulfonamide"},
    {"name": "Nitrofurantoin", "antibiotic_class": "Nitrofuran"}
]

for ab in antibiotics:
    exists = db.query(Antibiotic).filter(Antibiotic.name == ab["name"]).first()
    if not exists:
        db.add(Antibiotic(**ab))

db.commit()
print("✔ Antibiotics seeded/ensured!")

# --------------------------------------------------------------------
# 3) Seed 30 patients across 5 wards (6 per ward).
#    Each patient: Patient + MDRDetails + LabReport + PatientContact(s)
#    NOTE: We intentionally DO NOT set AI-calculated fields (severity, spread risk etc.)
# --------------------------------------------------------------------
today = datetime.date.today()
now = datetime.datetime.now()

# helper to build AST panels (list of dicts)
def make_ast(entries):
    """
    entries: list of tuples (antibiotic, result, mic, zone)
    returns JSON string for ast_panel_json
    """
    panel = []
    for ab, res, mic, zone in entries:
        panel.append({
            "antibiotic": ab,
            "result": res,
            "mic": mic,       # string or numeric
            "zone": zone      # numeric mm or None
        })
    return json.dumps(panel)

# Patient templates (realistic variety). We'll create 30 distinct patients.
patients_data = [
    # ICU-1 (6 patients)
    {
        "full_name": "Rajesh Kumar",
        "age": 68,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=6),
        "admission_time": datetime.time(9, 15),
        "reason": "Hospital-acquired pneumonia (post-op)",
        "ward": "ICU-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Hospital-acquired (HAI)",
            "infection_site": "Lungs",
            "sample_type": "Sputum",
            "collection_date": (today - datetime.timedelta(days=5)),
            "collection_time": datetime.time(8, 30),
            "sample_id": "LAB-ICU1-001",
            "time_to_processing_hrs": 2.0,
            "ast": make_ast([
                ("Meropenem", "R", ">=16", 10),
                ("Piperacillin-Tazobactam", "R", "32", 9),
                ("Cefepime", "R", ">=32", 8),
                ("Ciprofloxacin", "R", "8", 10),
                ("Amikacin", "I", "16", 13),
                ("Colistin", "S", "0.5", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "NDM",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "WGS pending"
        },
        "lab": {
            "sample_type": "Sputum",
            "sample_id": "LAB-ICU1-001",
            "lab_report_date": (today - datetime.timedelta(days=4)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=5), datetime.time(8,30)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=5), datetime.time(10,30)),
            "organism_detected": "Klebsiella pneumoniae",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Lactose fermenter",
            "infection_site": "Lungs",
            "infection_source": "Hospital-acquired",
            "lab_notes": "Mucoid colonies on MacConkey",
            "ast": None,  # will use ast_panel_json below
            "esbl_markers": "",
            "carbapenemase": "NDM",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Sunita Devi", "visitor_role": "Wife", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=3, hours=2), "duration_minutes": 15}
        ]
    },
    {
        "full_name": "Meena Sharma",
        "age": 57,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=3),
        "admission_time": datetime.time(14, 45),
        "reason": "Severe sepsis, ICU admission",
        "ward": "ICU-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Hospital-acquired (HAI)",
            "infection_site": "Blood",
            "sample_type": "Blood",
            "collection_date": (today - datetime.timedelta(days=3)),
            "collection_time": datetime.time(15, 0),
            "sample_id": "LAB-ICU1-002",
            "time_to_processing_hrs": 1.0,
            "ast": make_ast([
                ("Meropenem", "S", "0.5", 25),
                ("Piperacillin-Tazobactam", "S", "8", 20),
                ("Ceftriaxone", "R", "32", 10),
                ("Ciprofloxacin", "R", "4", 12),
                ("Gentamicin", "S", "1", 22),
                ("Colistin", "S", "0.5", None)
            ]),
            "esbl_markers": "CTX-M",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "ESBL positive"
        },
        "lab": {
            "sample_type": "Blood",
            "sample_id": "LAB-ICU1-002",
            "lab_report_date": (today - datetime.timedelta(days=2)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=3), datetime.time(15,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=3), datetime.time(16,30)),
            "organism_detected": "Escherichia coli",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Non-lactose fermenter",
            "infection_site": "Blood",
            "infection_source": "Hospital-acquired",
            "lab_notes": "Colony morphology suggestive of E. coli",
            "ast": None,
            "esbl_markers": "CTX-M",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "PCR CTX-M positive"
        },
        "contacts": [
            {"visitor_name": "Ramesh Sharma", "visitor_role": "Husband", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=2), "duration_minutes": 20}
        ]
    },
    {
        "full_name": "Sunil Patel",
        "age": 45,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=10),
        "admission_time": datetime.time(6, 10),
        "reason": "Trauma with open fracture - post-op ICU",
        "ward": "ICU-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Hospital-acquired (HAI)",
            "infection_site": "Wound",
            "sample_type": "Wound swab",
            "collection_date": (today - datetime.timedelta(days=2)),
            "collection_time": datetime.time(11, 0),
            "sample_id": "LAB-ICU1-003",
            "time_to_processing_hrs": 3.5,
            "ast": make_ast([
                ("Meropenem", "R", "8", 12),
                ("Piperacillin-Tazobactam", "R", "64", 8),
                ("Ceftazidime", "R", "32", 9),
                ("Ciprofloxacin", "R", "16", 10),
                ("Amikacin", "R", "64", 8),
                ("Colistin", "S", "1", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "OXA-48",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "Carbapenemase detected - OXA-48"
        },
        "lab": {
            "sample_type": "Wound swab",
            "sample_id": "LAB-ICU1-003",
            "lab_report_date": (today - datetime.timedelta(days=1)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(11,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(14,30)),
            "organism_detected": "Acinetobacter baumannii",
            "gram_stain": "Gram-negative coccobacilli",
            "growth_pattern": "Non-fermenter",
            "infection_site": "Wound",
            "infection_source": "Hospital-acquired",
            "lab_notes": "Small dry colonies on blood agar",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "OXA-48",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Rita Patel", "visitor_role": "Sister", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=4), "duration_minutes": 12}
        ]
    },
    {
        "full_name": "Anita Deshmukh",
        "age": 72,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=1),
        "admission_time": datetime.time(20, 0),
        "reason": "Severe COPD exacerbation",
        "ward": "ICU-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Unknown",
            "infection_source": "Community-acquired",
            "infection_site": "Lungs",
            "sample_type": "Sputum",
            "collection_date": (today - datetime.timedelta(days=1)),
            "collection_time": datetime.time(21, 30),
            "sample_id": "LAB-ICU1-004",
            "time_to_processing_hrs": 1.2,
            "ast": make_ast([
                ("Meropenem", "S", "0.25", 28),
                ("Ceftriaxone", "S", "1", 26),
                ("Ciprofloxacin", "I", "1", 18),
                ("Gentamicin", "S", "2", 20),
                ("Amikacin", "S", "1", 24),
                ("Colistin", "S", "0.5", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "lab": {
            "sample_type": "Sputum",
            "sample_id": "LAB-ICU1-004",
            "lab_report_date": (today),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=1), datetime.time(21,30)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=1), datetime.time(22,45)),
            "organism_detected": "Haemophilus influenzae",
            "gram_stain": "Gram-negative coccobacilli",
            "growth_pattern": "Fastidious growth",
            "infection_site": "Lungs",
            "infection_source": "Community-acquired",
            "lab_notes": "Small colonies on chocolate agar",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Suresh Deshmukh", "visitor_role": "Son", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=1), "duration_minutes": 10}
        ]
    },
    {
        "full_name": "Vikram Singh",
        "age": 62,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=12),
        "admission_time": datetime.time(2, 5),
        "reason": "Sepsis - post urinary tract infection",
        "ward": "ICU-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Community-acquired",
            "infection_site": "Urine / Blood",
            "sample_type": "Urine",
            "collection_date": (today - datetime.timedelta(days=11)),
            "collection_time": datetime.time(3, 0),
            "sample_id": "LAB-ICU1-005",
            "time_to_processing_hrs": 2.0,
            "ast": make_ast([
                ("Ceftriaxone", "R", "32", 10),
                ("Ciprofloxacin", "R", "8", 11),
                ("Gentamicin", "I", "8", 14),
                ("Amikacin", "S", "2", 22),
                ("Meropenem", "S", "0.5", 24),
                ("Colistin", "S", "1", None)
            ]),
            "esbl_markers": "CTX-M",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "lab": {
            "sample_type": "Urine",
            "sample_id": "LAB-ICU1-005",
            "lab_report_date": (today - datetime.timedelta(days=10)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=11), datetime.time(3,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=11), datetime.time(5,0)),
            "organism_detected": "Escherichia coli (ESBL)",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Lactose fermenter",
            "infection_site": "Urinary tract",
            "infection_source": "Community-acquired",
            "lab_notes": "Probable ESBL producer",
            "ast": None,
            "esbl_markers": "CTX-M",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Geeta Singh", "visitor_role": "Wife", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=7), "duration_minutes": 20}
        ]
    },

    # ICU-2 (6 patients)
    {
        "full_name": "Priya Nair",
        "age": 39,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=4),
        "admission_time": datetime.time(10, 0),
        "reason": "Ventilator-associated pneumonia",
        "ward": "ICU-2",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Hospital-acquired",
            "infection_site": "Lungs",
            "sample_type": "Endotracheal aspirate",
            "collection_date": (today - datetime.timedelta(days=3)),
            "collection_time": datetime.time(9, 0),
            "sample_id": "LAB-ICU2-001",
            "time_to_processing_hrs": 2.5,
            "ast": make_ast([
                ("Ceftazidime", "R", "32", 10),
                ("Cefepime", "R", "32", 9),
                ("Meropenem", "R", "16", 11),
                ("Amikacin", "R", "64", 7),
                ("Colistin", "S", "1", None),
                ("Tigecycline", "S", "0.5", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "KPC",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "KPC positive on PCR"
        },
        "lab": {
            "sample_type": "Endotracheal aspirate",
            "sample_id": "LAB-ICU2-001",
            "lab_report_date": (today - datetime.timedelta(days=2)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=3), datetime.time(9,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=3), datetime.time(12,0)),
            "organism_detected": "Klebsiella pneumoniae (KPC)",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Mucoid colonies",
            "infection_site": "Lungs",
            "infection_source": "Hospital-acquired",
            "lab_notes": "Sustained growth on chromogenic media",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "KPC",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Asha Nair", "visitor_role": "Mother", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=1), "duration_minutes": 8}
        ]
    },
    {
        "full_name": "Mohit Verma",
        "age": 50,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=2),
        "admission_time": datetime.time(7, 30),
        "reason": "Complicated UTI, AKI",
        "ward": "ICU-2",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Unknown",
            "infection_source": "Community-acquired",
            "infection_site": "Urine",
            "sample_type": "Urine",
            "collection_date": (today - datetime.timedelta(days=2)),
            "collection_time": datetime.time(8, 0),
            "sample_id": "LAB-ICU2-002",
            "time_to_processing_hrs": 1.5,
            "ast": make_ast([
                ("Ceftriaxone", "R", "32", 10),
                ("Piperacillin-Tazobactam", "S", "8", 20),
                ("Ciprofloxacin", "R", "4", 12),
                ("Amikacin", "S", "2", 22),
                ("Meropenem", "S", "0.25", 28),
                ("Colistin", "S", "1", None)
            ]),
            "esbl_markers": "TEM",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "TEM detected"
        },
        "lab": {
            "sample_type": "Urine",
            "sample_id": "LAB-ICU2-002",
            "lab_report_date": (today - datetime.timedelta(days=1)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(8,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(10,0)),
            "organism_detected": "Escherichia coli",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Lactose fermenter",
            "infection_site": "Urinary tract",
            "infection_source": "Community-acquired",
            "lab_notes": "Strong growth",
            "ast": None,
            "esbl_markers": "TEM",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Sonal Verma", "visitor_role": "Wife", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=1, hours=3), "duration_minutes": 25}
        ]
    },
    {
        "full_name": "Aditya Roy",
        "age": 29,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=1),
        "admission_time": datetime.time(11, 10),
        "reason": "Post-surgical infection after appendectomy",
        "ward": "ICU-2",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Unknown",
            "infection_source": "Hospital-acquired",
            "infection_site": "Wound",
            "sample_type": "Wound swab",
            "collection_date": (today - datetime.timedelta(days=1)),
            "collection_time": datetime.time(12, 0),
            "sample_id": "LAB-ICU2-003",
            "time_to_processing_hrs": 2.2,
            "ast": make_ast([
                ("Ceftriaxone", "S", "1", 24),
                ("Ciprofloxacin", "S", "0.5", 28),
                ("Gentamicin", "S", "1", 26),
                ("Meropenem", "S", "0.125", 30),
                ("Amikacin", "S", "1", 28),
                ("Colistin", "S", "0.5", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "lab": {
            "sample_type": "Wound swab",
            "sample_id": "LAB-ICU2-003",
            "lab_report_date": (today),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=1), datetime.time(12,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=1), datetime.time(14,30)),
            "organism_detected": "Staphylococcus aureus (non-MRSA)",
            "gram_stain": "Gram-positive cocci",
            "growth_pattern": "Beta-hemolytic colonies",
            "infection_site": "Wound",
            "infection_source": "Hospital-acquired",
            "lab_notes": "Catalase positive",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Nisha Roy", "visitor_role": "Wife", "visit_datetime": datetime.datetime.now() - datetime.timedelta(hours=6), "duration_minutes": 15}
        ]
    },
    {
        "full_name": "Geeta Malhotra",
        "age": 81,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=20),
        "admission_time": datetime.time(4, 0),
        "reason": "Severe UTI, recurrent",
        "ward": "ICU-2",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Community-acquired",
            "infection_site": "Urine",
            "sample_type": "Urine",
            "collection_date": (today - datetime.timedelta(days=19)),
            "collection_time": datetime.time(5, 0),
            "sample_id": "LAB-ICU2-004",
            "time_to_processing_hrs": 4.0,
            "ast": make_ast([
                ("Ceftriaxone", "R", "32", 9),
                ("Ciprofloxacin", "R", "8", 10),
                ("Gentamicin", "I", "8", 14),
                ("Amikacin", "I", "8", 13),
                ("Meropenem", "S", "0.5", 23),
                ("Colistin", "S", "1", None)
            ]),
            "esbl_markers": "CTX-M, TEM",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "Multiple ESBL markers"
        },
        "lab": {
            "sample_type": "Urine",
            "sample_id": "LAB-ICU2-004",
            "lab_report_date": (today - datetime.timedelta(days=18)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=19), datetime.time(5,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=19), datetime.time(9,30)),
            "organism_detected": "Escherichia coli (ESBL)",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Lactose fermenter",
            "infection_site": "Urinary tract",
            "infection_source": "Community-acquired",
            "lab_notes": "Suspected multi-ESBL",
            "ast": None,
            "esbl_markers": "CTX-M, TEM",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Rakesh Malhotra", "visitor_role": "Son", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=10), "duration_minutes": 30}
        ]
    },

    # General-1 (6 patients)
    {
        "full_name": "Rohit Mehra",
        "age": 34,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=2),
        "admission_time": datetime.time(13, 20),
        "reason": "Lower respiratory tract infection",
        "ward": "General-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Unknown",
            "infection_source": "Community-acquired",
            "infection_site": "Lungs",
            "sample_type": "Sputum",
            "collection_date": (today - datetime.timedelta(days=2)),
            "collection_time": datetime.time(14, 0),
            "sample_id": "LAB-GEN1-001",
            "time_to_processing_hrs": 1.0,
            "ast": make_ast([
                ("Ceftriaxone", "S", "1", 24),
                ("Ciprofloxacin", "S", "0.5", 30),
                ("Gentamicin", "S", "1", 26),
                ("Meropenem", "S", "0.125", 30),
                ("Amikacin", "S", "1", 28),
                ("Colistin", "S", "0.5", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "lab": {
            "sample_type": "Sputum",
            "sample_id": "LAB-GEN1-001",
            "lab_report_date": (today - datetime.timedelta(days=1)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(14,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(15,30)),
            "organism_detected": "Streptococcus pneumoniae",
            "gram_stain": "Gram-positive cocci",
            "growth_pattern": "Alpha-hemolytic colonies",
            "infection_site": "Lungs",
            "infection_source": "Community-acquired",
            "lab_notes": "Optochin sensitive",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Amit Mehra", "visitor_role": "Brother", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=2), "duration_minutes": 10}
        ]
    },
    {
        "full_name": "Nisha Kaur",
        "age": 26,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=1),
        "admission_time": datetime.time(9, 40),
        "reason": "Urinary tract infection",
        "ward": "General-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Unknown",
            "infection_source": "Community-acquired",
            "infection_site": "Urine",
            "sample_type": "Urine",
            "collection_date": (today - datetime.timedelta(days=1)),
            "collection_time": datetime.time(9, 50),
            "sample_id": "LAB-GEN1-002",
            "time_to_processing_hrs": 0.8,
            "ast": make_ast([
                ("Nitrofurantoin", "S", "32", 25),
                ("Trimethoprim-Sulfamethoxazole", "S", "0.5", 24),
                ("Ciprofloxacin", "S", "0.25", 30),
                ("Ceftriaxone", "S", "0.5", 28),
                ("Amikacin", "S", "1", 26),
                ("Meropenem", "S", "0.125", 30)
            ]),
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "lab": {
            "sample_type": "Urine",
            "sample_id": "LAB-GEN1-002",
            "lab_report_date": (today),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=1), datetime.time(9,50)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=1), datetime.time(11,0)),
            "organism_detected": "Escherichia coli",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Lactose fermenter",
            "infection_site": "Urinary tract",
            "infection_source": "Community-acquired",
            "lab_notes": "Typical urinary isolate",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Suman Kaur", "visitor_role": "Mother", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=1), "duration_minutes": 12}
        ]
    },
    {
        "full_name": "Karan Johar",
        "age": 48,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=8),
        "admission_time": datetime.time(18, 20),
        "reason": "Chronic wound infection",
        "ward": "General-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Hospital-acquired",
            "infection_site": "Wound",
            "sample_type": "Wound swab",
            "collection_date": (today - datetime.timedelta(days=7)),
            "collection_time": datetime.time(12, 0),
            "sample_id": "LAB-GEN1-003",
            "time_to_processing_hrs": 6.0,
            "ast": make_ast([
                ("Cefepime", "R", "32", 10),
                ("Ciprofloxacin", "R", "8", 12),
                ("Amikacin", "R", "64", 8),
                ("Meropenem", "I", "4", 15),
                ("Colistin", "S", "1", None),
                ("Linezolid", "S", "1", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "NDM",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "Carbapenemase positive"
        },
        "lab": {
            "sample_type": "Wound swab",
            "sample_id": "LAB-GEN1-003",
            "lab_report_date": (today - datetime.timedelta(days=6)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=7), datetime.time(12,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=7), datetime.time(18,0)),
            "organism_detected": "Klebsiella pneumoniae (NDM)",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Mucoid",
            "infection_site": "Wound",
            "infection_source": "Hospital-acquired",
            "lab_notes": "",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "NDM",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Sunita Johar", "visitor_role": "Wife", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=5), "duration_minutes": 20}
        ]
    },
    {
        "full_name": "Deepa Reddy",
        "age": 54,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=3),
        "admission_time": datetime.time(8, 0),
        "reason": "Cellulitis",
        "ward": "General-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Unknown",
            "infection_source": "Community-acquired",
            "infection_site": "Skin",
            "sample_type": "Skin swab",
            "collection_date": (today - datetime.timedelta(days=3)),
            "collection_time": datetime.time(9, 0),
            "sample_id": "LAB-GEN1-004",
            "time_to_processing_hrs": 2.0,
            "ast": make_ast([
                ("Ceftriaxone", "S", "1", 24),
                ("Ciprofloxacin", "S", "0.5", 28),
                ("Amikacin", "S", "1", 26),
                ("Linezolid", "S", "1", None),
                ("Vancomycin", "S", "1", None),
                ("Colistin", "S", "0.5", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "mecA",  # indicates MRSA in some contexts; here we show one MRSA-like entry
            "vre_markers": "",
            "genomic_notes": "mecA detected"
        },
        "lab": {
            "sample_type": "Skin swab",
            "sample_id": "LAB-GEN1-004",
            "lab_report_date": (today - datetime.timedelta(days=2)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=3), datetime.time(9,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=3), datetime.time(12,0)),
            "organism_detected": "Staphylococcus aureus (MRSA)",
            "gram_stain": "Gram-positive cocci",
            "growth_pattern": "Golden colonies",
            "infection_site": "Skin",
            "infection_source": "Community-acquired",
            "lab_notes": "mecA positive by PCR",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "mecA",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Raj Reddy", "visitor_role": "Husband", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=2), "duration_minutes": 15}
        ]
    },

    # Surgery-1 (6 patients)
    {
        "full_name": "Shyam Sunder",
        "age": 60,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=7),
        "admission_time": datetime.time(7, 45),
        "reason": "Post-op wound infection after CABG",
        "ward": "Surgery-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Hospital-acquired",
            "infection_site": "Wound",
            "sample_type": "Wound swab",
            "collection_date": (today - datetime.timedelta(days=6)),
            "collection_time": datetime.time(10, 0),
            "sample_id": "LAB-SURG1-001",
            "time_to_processing_hrs": 3.0,
            "ast": make_ast([
                ("Cefepime", "R", "32", 9),
                ("Meropenem", "R", "8", 12),
                ("Amikacin", "R", "64", 8),
                ("Colistin", "S", "1", None),
                ("Linezolid", "S", "1", None),
                ("Vancomycin", "S", "1", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "NDM",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "NDM detected"
        },
        "lab": {
            "sample_type": "Wound swab",
            "sample_id": "LAB-SURG1-001",
            "lab_report_date": (today - datetime.timedelta(days=5)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=6), datetime.time(10,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=6), datetime.time(15,0)),
            "organism_detected": "Klebsiella pneumoniae (NDM)",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Mucoid",
            "infection_site": "Wound",
            "infection_source": "Hospital-acquired",
            "lab_notes": "",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "NDM",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Laxmi Sunder", "visitor_role": "Wife", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=5), "duration_minutes": 20}
        ]
    },
    {
        "full_name": "Tanya Kapoor",
        "age": 33,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=2),
        "admission_time": datetime.time(16, 30),
        "reason": "Post laparoscopic cholecystectomy infection",
        "ward": "Surgery-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Unknown",
            "infection_source": "Hospital-acquired",
            "infection_site": "Abdomen/wound",
            "sample_type": "Wound swab",
            "collection_date": (today - datetime.timedelta(days=1)),
            "collection_time": datetime.time(17, 0),
            "sample_id": "LAB-SURG1-002",
            "time_to_processing_hrs": 2.0,
            "ast": make_ast([
                ("Ceftriaxone", "S", "1", 24),
                ("Ciprofloxacin", "S", "0.5", 28),
                ("Gentamicin", "S", "1", 26),
                ("Meropenem", "S", "0.125", 30),
                ("Amikacin", "S", "1", 28),
                ("Colistin", "S", "0.5", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "lab": {
            "sample_type": "Wound swab",
            "sample_id": "LAB-SURG1-002",
            "lab_report_date": (today),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=1), datetime.time(17,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=1), datetime.time(19,30)),
            "organism_detected": "Escherichia coli",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Lactose fermenter",
            "infection_site": "Surgical wound",
            "infection_source": "Hospital-acquired",
            "lab_notes": "",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Pooja Kapoor", "visitor_role": "Mother", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=1), "duration_minutes": 18}
        ]
    },
    {
        "full_name": "Manish Gupta",
        "age": 70,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=15),
        "admission_time": datetime.time(5, 0),
        "reason": "Surgical site infection - orthopedics",
        "ward": "Surgery-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Hospital-acquired",
            "infection_site": "Bone / Deep tissue",
            "sample_type": "Tissue sample",
            "collection_date": (today - datetime.timedelta(days=14)),
            "collection_time": datetime.time(6, 0),
            "sample_id": "LAB-SURG1-003",
            "time_to_processing_hrs": 3.0,
            "ast": make_ast([
                ("Cefepime", "R", "32", 9),
                ("Meropenem", "R", "16", 12),
                ("Gentamicin", "R", "16", 11),
                ("Amikacin", "R", "32", 10),
                ("Colistin", "S", "1", None),
                ("Linezolid", "S", "1", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "KPC",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "KPC positive"
        },
        "lab": {
            "sample_type": "Tissue sample",
            "sample_id": "LAB-SURG1-003",
            "lab_report_date": (today - datetime.timedelta(days=13)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=14), datetime.time(6,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=14), datetime.time(10,0)),
            "organism_detected": "Pseudomonas aeruginosa (KPC)",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Non-fermenter",
            "infection_site": "Bone tissue",
            "infection_source": "Hospital-acquired",
            "lab_notes": "",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "KPC",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Sushma Gupta", "visitor_role": "Daughter", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=12), "duration_minutes": 30}
        ]
    },
    {
        "full_name": "Priyanka Luthra",
        "age": 44,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=6),
        "admission_time": datetime.time(10, 10),
        "reason": "Surgical wound erythema",
        "ward": "Surgery-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Unknown",
            "infection_source": "Hospital-acquired",
            "infection_site": "Wound",
            "sample_type": "Wound swab",
            "collection_date": (today - datetime.timedelta(days=5)),
            "collection_time": datetime.time(11, 0),
            "sample_id": "LAB-SURG1-004",
            "time_to_processing_hrs": 2.0,
            "ast": make_ast([
                ("Ceftriaxone", "S", "1", 24),
                ("Ciprofloxacin", "S", "0.5", 28),
                ("Gentamicin", "S", "1", 26),
                ("Meropenem", "S", "0.125", 30),
                ("Amikacin", "S", "1", 28),
                ("Colistin", "S", "0.5", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "lab": {
            "sample_type": "Wound swab",
            "sample_id": "LAB-SURG1-004",
            "lab_report_date": (today - datetime.timedelta(days=4)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=5), datetime.time(11,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=5), datetime.time(13,30)),
            "organism_detected": "Escherichia coli",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Lactose fermenter",
            "infection_site": "Surgical wound",
            "infection_source": "Hospital-acquired",
            "lab_notes": "",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Rohit Luthra", "visitor_role": "Husband", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=4), "duration_minutes": 20}
        ]
    },

    # Isolation-1 (6 patients)
    {
        "full_name": "Alok Das",
        "age": 55,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=9),
        "admission_time": datetime.time(3, 30),
        "reason": "Bloodstream infection, surveillance isolation",
        "ward": "Isolation-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Hospital-acquired",
            "infection_site": "Blood",
            "sample_type": "Blood",
            "collection_date": (today - datetime.timedelta(days=8)),
            "collection_time": datetime.time(4, 0),
            "sample_id": "LAB-ISO1-001",
            "time_to_processing_hrs": 2.0,
            "ast": make_ast([
                ("Meropenem", "R", ">=16", 9),
                ("Ciprofloxacin", "R", "8", 10),
                ("Amikacin", "R", "32", 11),
                ("Colistin", "S", "1", None),
                ("Tigecycline", "S", "0.5", None),
                ("Linezolid", "S", "1", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "NDM",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "NDM positive"
        },
        "lab": {
            "sample_type": "Blood",
            "sample_id": "LAB-ISO1-001",
            "lab_report_date": (today - datetime.timedelta(days=7)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=8), datetime.time(4,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=8), datetime.time(6,0)),
            "organism_detected": "Klebsiella pneumoniae (NDM)",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Mucoid",
            "infection_site": "Blood",
            "infection_source": "Hospital-acquired",
            "lab_notes": "",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "NDM",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Maya Das", "visitor_role": "Wife", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=6), "duration_minutes": 12}
        ]
    },
    {
        "full_name": "Ritu Sen",
        "age": 66,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=11),
        "admission_time": datetime.time(22, 10),
        "reason": "Vancomycin-resistant Enterococci colonization",
        "ward": "Isolation-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Colonized (VRE)",
            "infection_source": "Hospital-acquired",
            "infection_site": "Stool / Rectal swab",
            "sample_type": "Rectal swab",
            "collection_date": (today - datetime.timedelta(days=10)),
            "collection_time": datetime.time(9, 0),
            "sample_id": "LAB-ISO1-002",
            "time_to_processing_hrs": 2.0,
            "ast": make_ast([
                ("Vancomycin", "R", ">=64", None),
                ("Linezolid", "S", "1", None),
                ("Doxycycline", "I", "4", None),
                ("Gentamicin", "R", "16", 12),
                ("Tigecycline", "S", "0.5", None),
                ("Colistin", "S", "1", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "vanA",
            "genomic_notes": "vanA positive"
        },
        "lab": {
            "sample_type": "Rectal swab",
            "sample_id": "LAB-ISO1-002",
            "lab_report_date": (today - datetime.timedelta(days=9)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=10), datetime.time(9,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=10), datetime.time(11,30)),
            "organism_detected": "Enterococcus faecium (VRE)",
            "gram_stain": "Gram-positive cocci",
            "growth_pattern": "Gamma-hemolytic",
            "infection_site": "Colonization",
            "infection_source": "Hospital-acquired",
            "lab_notes": "vanA detected by PCR",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "vanA",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Amit Sen", "visitor_role": "Son", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=8), "duration_minutes": 10}
        ]
    },
    {
        "full_name": "Bina Rao",
        "age": 49,
        "gender": "Female",
        "admission_date": today - datetime.timedelta(days=3),
        "admission_time": datetime.time(14, 0),
        "reason": "Skin and soft tissue infection",
        "ward": "Isolation-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Unknown",
            "infection_source": "Community-acquired",
            "infection_site": "Skin",
            "sample_type": "Swab",
            "collection_date": (today - datetime.timedelta(days=2)),
            "collection_time": datetime.time(15, 0),
            "sample_id": "LAB-ISO1-003",
            "time_to_processing_hrs": 1.5,
            "ast": make_ast([
                ("Ceftriaxone", "S", "1", 25),
                ("Ciprofloxacin", "S", "0.5", 28),
                ("Linezolid", "S", "1", None),
                ("Vancomycin", "S", "1", None),
                ("Colistin", "S", "0.5", None),
                ("Doxycycline", "S", "1", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "lab": {
            "sample_type": "Skin swab",
            "sample_id": "LAB-ISO1-003",
            "lab_report_date": (today - datetime.timedelta(days=1)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(15,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=2), datetime.time(16,30)),
            "organism_detected": "Staphylococcus epidermidis",
            "gram_stain": "Gram-positive cocci",
            "growth_pattern": "Coagulase-negative",
            "infection_site": "Skin",
            "infection_source": "Community-acquired",
            "lab_notes": "",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Ramesh Rao", "visitor_role": "Husband", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=2), "duration_minutes": 10}
        ]
    },
    {
        "full_name": "Kabir Khan",
        "age": 37,
        "gender": "Male",
        "admission_date": today - datetime.timedelta(days=18),
        "admission_time": datetime.time(1, 0),
        "reason": "Chronic osteomyelitis - isolation for MDR status",
        "ward": "Isolation-1",
        "assigned_doctor": "Dr. Krishna Dhingra",
        "mdr": {
            "mdr_status": "Suspected MDR",
            "infection_source": "Hospital-acquired",
            "infection_site": "Bone",
            "sample_type": "Bone biopsy",
            "collection_date": (today - datetime.timedelta(days=17)),
            "collection_time": datetime.time(10, 0),
            "sample_id": "LAB-ISO1-004",
            "time_to_processing_hrs": 3.5,
            "ast": make_ast([
                ("Cefepime", "R", "32", 9),
                ("Meropenem", "R", "16", 10),
                ("Colistin", "S", "1", None),
                ("Linezolid", "S", "1", None),
                ("Amikacin", "R", "32", 10),
                ("Tigecycline", "S", "0.5", None)
            ]),
            "esbl_markers": "",
            "carbapenemase": "KPC",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": "KPC positive"
        },
        "lab": {
            "sample_type": "Bone biopsy",
            "sample_id": "LAB-ISO1-004",
            "lab_report_date": (today - datetime.timedelta(days=16)),
            "collection_datetime": datetime.datetime.combine(today - datetime.timedelta(days=17), datetime.time(10,0)),
            "processing_datetime": datetime.datetime.combine(today - datetime.timedelta(days=17), datetime.time(14,0)),
            "organism_detected": "Pseudomonas aeruginosa (KPC)",
            "gram_stain": "Gram-negative bacilli",
            "growth_pattern": "Non-fermenter",
            "infection_site": "Bone",
            "infection_source": "Hospital-acquired",
            "lab_notes": "",
            "ast": None,
            "esbl_markers": "",
            "carbapenemase": "KPC",
            "mrsa_marker": "",
            "vre_markers": "",
            "genomic_notes": ""
        },
        "contacts": [
            {"visitor_name": "Zeba Khan", "visitor_role": "Wife", "visit_datetime": datetime.datetime.now() - datetime.timedelta(days=15), "duration_minutes": 25}
        ]
    }
]

# Now iterate patients_data and create objects in DB
created_patients = 0
for pdata in patients_data:
    # Create Patient with nested MDRDetails, LabReport and Contacts
    m = pdata["mdr"]
    lab = pdata["lab"]

    # Prepare MDRDetails object
    mdr_obj = MDRDetails(
        mdr_status = m.get("mdr_status"),
        infection_source = m.get("infection_source"),
        infection_site = m.get("infection_site"),
        sample_type = m.get("sample_type"),
        collection_date = m.get("collection_date"),
        collection_time = m.get("collection_time"),
        sample_id = m.get("sample_id"),
        time_to_processing_hrs = m.get("time_to_processing_hrs"),
        ast_panel_json = m.get("ast"),
        esbl_markers = m.get("esbl_markers"),
        carbapenemase = m.get("carbapenemase"),
        mrsa_marker = m.get("mrsa_marker"),
        vre_markers = m.get("vre_markers"),
        genomic_notes = m.get("genomic_notes")
        # severity_level, mdr_spread_risk, clinical_notes left NULL for AI
    )

    # Prepare LabReport object (single report)
    lab_report_obj = LabReport(
        sample_type = lab.get("sample_type"),
        sample_id = lab.get("sample_id"),
        lab_report_date = lab.get("lab_report_date"),
        collection_datetime = lab.get("collection_datetime"),
        processing_datetime = lab.get("processing_datetime"),
        organism_detected = lab.get("organism_detected"),
        gram_stain = lab.get("gram_stain"),
        growth_pattern = lab.get("growth_pattern"),
        infection_site = lab.get("infection_site"),
        infection_source = lab.get("infection_source"),
        lab_notes = lab.get("lab_notes"),
        ast_panel_json = m.get("ast"),   # same AST stored here as well
        esbl_markers = lab.get("esbl_markers"),
        carbapenemase = lab.get("carbapenemase"),
        mrsa_marker = lab.get("mrsa_marker"),
        vre_markers = lab.get("vre_markers"),
        genomic_notes = lab.get("genomic_notes")
        # risk fields left NULL
    )

    # Prepare contact objects
    contact_objs = []
    for c in pdata.get("contacts", []):
        contact_objs.append(PatientContact(
            visitor_name = c["visitor_name"],
            visitor_role = c.get("visitor_role"),
            visit_datetime = c["visit_datetime"],
            duration_minutes = c.get("duration_minutes"),
            notes = c.get("notes", "")
        ))

    # Create Patient with nested relationships
    patient_obj = Patient(
        full_name = pdata["full_name"],
        age = pdata.get("age"),
        gender = pdata.get("gender"),
        admission_date = pdata.get("admission_date"),
        admission_time = pdata.get("admission_time"),
        reason = pdata.get("reason"),
        ward = pdata.get("ward"),
        assigned_doctor = pdata.get("assigned_doctor"),
        uploaded_files = None,
        mdr_details = mdr_obj,
        lab_reports = [lab_report_obj],
        contacts = contact_objs
    )

    db.add(patient_obj)
    # flush per batch to get incremental ids if needed
    try:
        db.flush()
        created_patients += 1
    except Exception as e:
        db.rollback()
        print("Error adding patient", pdata["full_name"], ":", str(e))

# Final commit and close
db.commit()


INITIAL_EQUIPMENT = [
    {"id": "EQ-001", "name": "Bed",           "type": "Furniture"},
    {"id": "EQ-002", "name": "Bed Sheet",     "type": "Linen"},
    {"id": "EQ-003", "name": "O2 Mask",       "type": "Respiratory"},
    {"id": "EQ-004", "name": "BP Machine",    "type": "Monitoring"},
    {"id": "EQ-005", "name": "Thermometer",   "type": "Monitoring"},
    {"id": "EQ-006", "name": "Glucometer",    "type": "Diagnostic"},
    {"id": "EQ-007", "name": "Ventilator",    "type": "Respiratory"},
    {"id": "EQ-008", "name": "Surgical Kit",  "type": "Surgical"},
]

def seed_equipment():
    db = SessionLocal()
    print("🌱 Seeding equipment...")

    for eq in INITIAL_EQUIPMENT:
        exists = db.query(models.Equipment).filter(models.Equipment.id == eq["id"]).first()
        if not exists:
            new_eq = models.Equipment(
                id=eq["id"],
                name=eq["name"],
                type=eq["type"]
            )
            db.add(new_eq)
            print(f"   ➕ Added {eq['id']} - {eq['name']}")
        else:
            print(f"   ✔ Already exists: {eq['id']}")
if __name__ == "__main__":
    seed_equipment()
    db.commit()

    db.close()
print(f"✔ Seed complete: {created_patients} patients added, plus users/profiles and antibiotics.  🌱 Equipment seed completed!")