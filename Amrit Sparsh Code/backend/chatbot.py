# backend/chatbot.py

import re
import json
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

# =============================================================
# CONTEXT STORE
# =============================================================
CTX: Dict[str, Dict[str, Any]] = {}


def set_ctx(user, key, value):
    CTX.setdefault(user, {})
    CTX[user][key] = value


def get_ctx(user, key):
    return CTX.get(user, {}).get(key)


# =============================================================
# CLEAN TEXT
# =============================================================
def clean(text: str) -> str:
    t = (text or "").lower()
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


# =============================================================
# STRONG PATIENT MATCHING
# =============================================================
def match_patient(query: str, db: Session):

    if not query or len(query.strip()) < 2:
        return None

    q = query.lower().strip()
    q_tokens = q.split()
    best = None
    best_score = 0

    patients = db.query(models.Patient).all()

    for p in patients:
        name = (p.full_name or "").lower()
        if not name:
            continue

        # exact match
        if q == name:
            return p

        # substring match
        if q in name:
            score = 0.95
        else:
            # token overlap
            name_tokens = name.split()
            overlap = len(set(q_tokens) & set(name_tokens))
            score = overlap / max(1, len(q_tokens))

            # same starting letter → boost
            if name.startswith(q[0]):
                score += 0.10

        if score > best_score:
            best = p
            best_score = score

    return best if best_score >= 0.20 else None


# =============================================================
# INTENT DETECTION WITH HINDI SUPPORT
# =============================================================

INTENT_MAP = {
    "labs": [
        "lab", "labs", "report", "reports", "culture", "micro", "test",
        "nateeja", "result", "parinam"
    ],
    "ast": ["ast", "antibiotic", "susceptibility"],
    "details": [
        "details", "info", "profile", "about", "summary", "umra",
        "age", "gender", "ling", "ward", "bed"
    ],
    "visitors": ["visitor", "visitors", "visit", "contacts"],
    "mdr": [
        "mdr", "infection", "resistant", "esbl", "carbapenemase",
        "mrsa", "vre", "superbug"
    ],
    "alerts": ["alert", "alerts", "risk", "critical", "high"],
    
    # ⭐ FIX → comma added here
    "select": ["show", "open", "select", "patient", "dikhao", "dikhado", "dekhna"],

    # ⭐ Now this line is valid
    "list_patients": ["list", "all patients", "patients", "search", "find"]
}


HINDI_POSSESSIVE = ["ka", "ke", "ki"]


def detect_intent(text: str):
    words = text.split()

    # -------- SPECIAL PRIORITY INTENTS --------
    # list patients variations
    if "list" in words and "patients" in words:
        return "list_patients"
    if "patients" in words and "list" in words:
        return "list_patients"
    if "all" in words and "patients" in words:
        return "list_patients"
    if text.startswith("list patients"):
        return "list_patients"
    if "under" in words and "patients" in words:
        return "list_patients"
    if "ward" in words and "patients" in words:
        return "list_patients"

    # Hindi versions
    if "saare" in words and "patients" in words:
        return "list_patients"

    # -------- normal intents remain --------
    for intent, keys in INTENT_MAP.items():
        for k in keys:
            if k in text:
                return intent

    return None

# =============================================================
# REQUEST MODEL
# =============================================================
class ChatPrompt(BaseModel):
    prompt: str
    user_email: Optional[str] = None


# =============================================================
# RESPONSE BUILDERS
# =============================================================

def build_mdr_details(m: models.MDRDetails):
    if not m:
        return None

    try:
        ast_list = json.loads(m.ast_panel_json) if m.ast_panel_json else None
    except:
        ast_list = None

    return {
        "mdr_status": m.mdr_status,
        "infection_source": m.infection_source,
        "infection_site": m.infection_site,
        "sample_type": m.sample_type,
        "collection_date": m.collection_date,
        "collection_time": m.collection_time,
        "sample_id": m.sample_id,
        "processing_hours": m.time_to_processing_hrs,
        "ast_panel": ast_list,
        "esbl_markers": m.esbl_markers,
        "carbapenemase": m.carbapenemase,
        "mrsa_marker": m.mrsa_marker,
        "vre_markers": m.vre_markers,
        "severity_level": m.severity_level,
        "mdr_spread_risk": m.mdr_spread_risk,
        "clinical_notes": m.clinical_notes,
    }


def build_lab_reports(patient: models.Patient, db: Session):
    reps = db.query(models.LabReport).filter_by(patient_id=patient.id).all()
    out = []

    for r in reps:
        try:
            ast = json.loads(r.ast_panel_json) if r.ast_panel_json else None
        except:
            ast = None

        out.append({
            "sample_type": r.sample_type,
            "sample_id": r.sample_id,
            "organism_detected": r.organism_detected,
            "infection_site": r.infection_site,
            "infection_source": r.infection_source,
            "growth_pattern": r.growth_pattern,
            "gram_stain": r.gram_stain,
            "ast_panel": ast,
            "esbl_markers": r.esbl_markers,
            "carbapenemase": r.carbapenemase,
            "mrsa_marker": r.mrsa_marker,
            "vre_markers": r.vre_markers,
            "notes": r.lab_notes,
            "date": r.lab_report_date,
        })

    return out


def build_visitors(patient, db):
    visits = db.query(models.PatientContact).filter_by(patient_id=patient.id).all()
    return [{
        "name": v.visitor_name,
        "role": v.visitor_role,
        "time": v.visit_datetime,
        "notes": v.notes
    } for v in visits]

def find_patient_by_name(prompt: str, db: Session):
    prompt_lower = prompt.lower()
    patients = db.query(models.Patient).all()
    for p in patients:
        if p.full_name.lower() in prompt_lower:
            return p
    return None
# =============================================================
# MAIN CHAT ENDPOINT
# =============================================================
@router.post("/query")
def ai_chat(data: ChatPrompt, db: Session = Depends(get_db)):

    if not data.user_email:
        return {"error": "Please login again."}

    user = data.user_email
    text = clean(data.prompt)
    tokens = text.split()


    # ============================================================
    # ML FIRST: Try advanced ML intent + patient detection
    # ============================================================
    try:
        from backend.ml_adapter import try_ml_first
        ml_output = try_ml_first(data.prompt, db)
    except:
        ml_output = None

    if ml_output:
        intent = ml_output["intent"]
        patient = ml_output["patient"] or None
            # ML WARD HANDLING (NEW)
    if "ward" in ml_output:
        ward_query = ml_output["ward"].lower()

        pts = db.query(models.Patient).all()
        results = []

        for p in pts:
            w = (p.ward or "").lower()
            if ward_query.replace("-", "") in w.replace("-", ""):
                results.append({
                    "id": p.id,
                    "name": p.full_name,
                    "age": p.age,
                    "gender": p.gender,
                    "ward": p.ward,
                    "doctor": p.assigned_doctor
                })

        return {"patients": results}

        # If ML requires patient but none found → fallback to rule-based
        if intent in ["antibiotic_prediction", "analysis"] and not patient:
            ml_output = None
        else:
            # ML handles antibiotic prediction directly
            if intent in ["antibiotic_prediction", "analysis"]:
                from backend.ai_engine import predict_for_patient
                return predict_for_patient(patient.id, db)

            # otherwise allow existing code to use ML intent + patient override

    # Extract name candidates
    skip_words = set([
        "show", "open", "select", "give", "me",
        "details", "detail", "info", "labs", "lab", "report","reports",
        "visitors","visitor","contacts","contact",
        "ka","ke","ki","please","plz","for","of","the"
    ])

    candidates = [t for t in tokens if t not in skip_words]

    last_patient_id = get_ctx(user, "patient_id")
    last_patient = db.query(models.Patient).filter_by(id=last_patient_id).first() if last_patient_id else None

    # ---------------------------------------------------------
    # STOP patient matching for list/search queries (VERY IMPORTANT)
    # ---------------------------------------------------------
    blocked_words = ["list", "patients", "all", "search", "find", "under", "ward"]

    if any(w in text.split() for w in blocked_words):
        skip_patient_match = True
    else:
        skip_patient_match = False

    # ---------------------------------------------------------
    # PATIENT MATCHING (runs only if NOT a list/search intent)
    # ---------------------------------------------------------
    patient = None
    if not skip_patient_match:
        for c in candidates:
            p = match_patient(c, db)
            if p:
                patient = p
                break

    if not patient:
        patient = last_patient



    intent = detect_intent(text)
    # ML Intent Classification
    from backend.ml_engine import ml_intent
    ml_pred = ml_intent(text)
    if ml_pred:
        intent = ml_pred
    # =========================================================
    # 🔥 ROUTE COMPLEX CLINICAL QUESTIONS TO AI ENGINE (ML)
    # =========================================================
    if any(k in text.lower() for k in [
        "predict antibiotic", "predict antibiotics",
        "suggest antibiotic", "antibiotic for",
        "mdr risk", "mdr probability", "mdr chance",
        "resistance", "severity", "spread",
        "high-risk", "ndm", "oxa", "esbl", "mrsa", "vre",
        "infection control",
        "evaluate patient", "evaluate", "full analysis", "analysis"
    ]):
        
        from backend.ai_engine import predict_for_patient
        # Force patient detection from text
        name_patient = find_patient_by_name(text, db)
        # ❗ USE EXISTING MATCHED PATIENT (very important)
        if not patient:
            return {"error": "Patient not found. Please select or mention the patient."}

        # 🔥 CALL AI ENGINE FOR FULL ML ANALYSIS
        return predict_for_patient(patient.id, db)
    
    # 🌟 SELECT PATIENT
    if intent == "select":
        if not patient:
            return {"error": "Patient not found"}
        set_ctx(user, "patient_id", patient.id)
        return {"message": f"Selected patient: {patient.full_name}"}

    # 🌟 PATIENT DETAILS (expanded)
    if intent == "details":
        if not patient:
            return {"error": "Patient not found"}
        set_ctx(user, "patient_id", patient.id)

        return {
            "patient": patient.full_name,
            "age": patient.age,
            "gender": patient.gender,
            "ward": patient.ward,
            "doctor": patient.assigned_doctor,
            "reason": patient.reason,
            "admission_date": patient.admission_date,
            "mdr_details": build_mdr_details(patient.mdr_details)
        }

    # 🌟 LAB REPORTS
    if intent == "labs":
        if not patient:
            return {"error": "Patient not found"}
        set_ctx(user, "patient_id", patient.id)

        return {
            "patient": patient.full_name,
            "lab_reports": build_lab_reports(patient, db)
        }

    # 🌟 AST PANEL REQUEST
    if intent == "ast":
        if not patient:
            return {"error": "Patient not found"}

        reports = build_lab_reports(patient, db)
        for r in reports:
            if r["ast_panel"]:
                return {
                    "patient": patient.full_name,
                    "ast_panel": r["ast_panel"]
                }

        return {"error": "AST panel not found for this patient"}

    # 🌟 MDR INFO REQUEST
    if intent == "mdr":
        if not patient:
            return {"error": "Patient not found"}

        return {
            "patient": patient.full_name,
            "mdr_details": build_mdr_details(patient.mdr_details)
        }

    # 🌟 VISITORS
    if intent == "visitors":
        if not patient:
            return {"error": "Patient not found"}

        return {
            "patient": patient.full_name,
            "visitors": build_visitors(patient, db)
        }

    # 🌟 ALERTS
    if intent == "alerts":
        alerts = db.query(models.Notification).all()
        return [{
            "patient": a.patient_name,
            "ward": a.ward,
            "risk": a.risk_level
        } for a in alerts]
    
        # =====================================================
    # WARD-NORMALIZATION PATCH (ADD ONLY, NO LOGIC CHANGED)
    # =====================================================
    clean_text = text.replace("ward", "").replace("icu", "").strip()
    clean_text = clean_text.replace("-", "").replace(" ", "")
    # Example: "ab 12" or "ab-12" -> "ab12"
    # =========================================================
    # LIST PATIENTS
    # =========================================================
    if intent == "list_patients":

        q = text.replace("list", "").replace("patients", "").replace("all", "").strip()

        # normalize ward query
        q_norm = text.replace("ward", "").replace("icu", "").strip()
        q_norm = q_norm.replace("-", "").replace(" ", "")

        pts = db.query(models.Patient).all()
        results = []

        for p in pts:
            name = (p.full_name or "").lower()
            ward = (p.ward or "").lower()
            doc = (p.assigned_doctor or "").lower()

            ward_norm = ward.replace("-", "").replace(" ", "")

            if not q:
                results.append(p)
                continue

            # NEW → normalized ward match
            if q_norm and q_norm in ward_norm:
                results.append(p)
                continue

            # EXISTING MATCH CONDITIONS (unchanged)
            if q in name or q in ward or q in doc:
                results.append(p)
        return {
            "patients": [
                {
                    "id": p.id,
                    "name": p.full_name,
                    "age": p.age,
                    "gender": p.gender,
                    "ward": p.ward,
                    "doctor": p.assigned_doctor
                } for p in results
            ]
        }
    


    # 🌟 FALLBACK — Now includes Hindi + Examples
    return {
        "error": "मैं आपकी बात नहीं समझ पाया।",
        "help": [
            "Examples:",
            "• 'ujala ka ast result dikhado'",
            "• 'show jay zala details'",
            "• 'krishna ke reports'",
            "• 'shashwat ka mdr status'",
            "• 'give me labs for ujala'",
            "• 'alerts'",
        ]
    }
