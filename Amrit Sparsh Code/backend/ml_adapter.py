import re
from typing import Optional, Dict, Any
from difflib import get_close_matches

from backend import models
from backend.ml_engine import ml_intent

CONFIDENCE_THRESHOLD = 0.55

# -------------------------------------------------------
# TEXT NORMALIZER
# -------------------------------------------------------
def normalize(text: str) -> str:
    if not text:
        return ""
    t = text.lower()
    t = re.sub(r"[^a-z0-9\s\-]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

# -------------------------------------------------------
# WARD DETECTION ENGINE
# -------------------------------------------------------
def extract_ward(prompt: str) -> Optional[str]:
    """
    Detect ward-like text:
    • icu-1 / icu 1 / ICU1
    • general-1 / general 1
    • surgery-1
    • isolation-1
    • ab-12 / ab 12 / AB12
    """

    t = normalize(prompt)

    patterns = [
        r"(icu[\s\-]*\d+)",
        r"(general[\s\-]*\d+)",
        r"(surgery[\s\-]*\d+)",
        r"(isolation[\s\-]*\d+)",
        r"(ab[\s\-]*\d+)"
    ]

    for pat in patterns:
        m = re.search(pat, t)
        if m:
            raw = m.group(1).upper()
            raw = raw.replace(" ", "")
            raw = raw.replace("--", "-")
            # convert AB12 → AB-12
            raw = re.sub(r"([A-Z]+)(\d+)", r"\1-\2", raw)
            return raw

    return None


# -------------------------------------------------------
# PATIENT NAME MATCHING
# -------------------------------------------------------
def extract_name_candidates(text: str):
    skip = set([
        "show","open","select","give","me","details","detail","info",
        "labs","lab","report","reports","visitors","visitor","contacts",
        "contact","ka","ke","ki","please","plz","for","of","the",
        "patient","patients","ward","icu","general","isolation","surgery"
    ])

    tokens = normalize(text).split()
    candidates = [t for t in tokens if t not in skip and len(t) > 1]

    combined = []
    for i in range(len(candidates)):
        for L in (1, 2, 3):
            if i + L <= len(candidates):
                combined.append(" ".join(candidates[i:i+L]))

    return sorted(combined, key=lambda x: -len(x))


def match_patient_fuzzy(name_candidate: str, db):
    if not name_candidate:
        return None

    name_candidate = normalize(name_candidate)
    patients = db.query(models.Patient).all()
    db_names = [(p, (p.full_name or "").lower()) for p in patients if p.full_name]

    # exact or substring
    for p, nm in db_names:
        if name_candidate == nm or name_candidate in nm:
            return p

    # fuzzy
    name_list = [nm for _, nm in db_names]
    matches = get_close_matches(name_candidate, name_list, n=1, cutoff=0.6)
    if matches:
        found = matches[0]
        for p, nm in db_names:
            if nm == found:
                return p
    return None


# -------------------------------------------------------
# MAIN ML FIRST LOGIC (WITH WARD SUPPORT)
# -------------------------------------------------------
def try_ml_first(prompt: str, db) -> Optional[Dict[str, Any]]:

    if not prompt:
        return None

    clean_text = normalize(prompt)

    # ----------------------------  
    # NEW: WARD DETECTION ALWAYS FIRST
    # ----------------------------
    ward = extract_ward(prompt)
    if ward:
        return {
            "intent": "list_patients",
            "intent_conf": 0.99,
            "patient": None,
            "ward": ward
        }

    # ----------------------------
    # ML INTENT
    # ----------------------------
    ml_result = ml_intent(clean_text)
    if not ml_result:
        return None

    intent = str(ml_result).strip()
    intent_conf = 0.70

    if intent_conf < CONFIDENCE_THRESHOLD:
        return None

    # ----------------------------
    # PATIENT MATCHING (ONLY IF REQUIRED)
    # ----------------------------
    intents_requiring_patient = {
        "details", "labs", "ast", "mdr",
        "visitors", "antibiotic_prediction",
        "severity", "spread", "analysis"
    }

    matched_patient = None
    if intent in intents_requiring_patient:
        for cand in extract_name_candidates(prompt):
            p = match_patient_fuzzy(cand, db)
            if p:
                matched_patient = p
                break

        if not matched_patient:
            return None

    return {
        "intent": intent,
        "intent_conf": intent_conf,
        "patient": matched_patient
    }
