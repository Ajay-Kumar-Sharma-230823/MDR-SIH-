# backend/ai_utils.py
from typing import List, Dict, Any, Optional
import math
import json
from collections import Counter
from backend.ml_engine import ml_predict_antibiotic

# --------------------------
# Utility parsers & helpers
# --------------------------

def parse_ast_list(ast_panel_json: Optional[str]) -> List[Dict[str, Any]]:
    if not ast_panel_json:
        return []
    if isinstance(ast_panel_json, str):
        try:
            return json.loads(ast_panel_json)
        except:
            return []
    return ast_panel_json

def gene_flags(mdr_record: Dict[str, Any]) -> Dict[str, bool]:
    return {
        "esbl": bool(mdr_record.get("esbl_markers")),
        "ndm": ("ndm" in (mdr_record.get("carbapenemase") or "").lower()),
        "oxa48": ("oxa" in (mdr_record.get("carbapenemase") or "").lower()),
        "kpc": ("kpc" in (mdr_record.get("carbapenemase") or "").lower()),
        "mecA": bool(mdr_record.get("mrsa_marker")),
        "van": bool(mdr_record.get("vre_markers"))
    }

# --------------------------
# Antibiotic prediction
# --------------------------
def rule_based_antibiotic_prediction(ast_panel: List[Dict[str, Any]], genes: Dict[str, bool]) -> List[Dict[str, Any]]:
    """
    Simple, conservative rule-based predictions combining lab AST (S/I/R, MIC, zone)
    and gene flags. Mark each antibiotic: HIGHLY EFFECTIVE / PARTIALLY EFFECTIVE / INEFFECTIVE.
    Replace or augment with ML model at the TODO below.
    """
    # baseline mapping: if AST has explicit S/I/R use it, else infer
    out = []
    for entry in ast_panel:
        ab = entry.get("antibiotic") or entry.get("antibiotic_name") or "Unknown"
        result = (entry.get("result") or "").strip().upper()
        mic = entry.get("mic")
        zone = entry.get("zone")

        if result == "S":
            pred = "HIGHLY EFFECTIVE"
            reason = "Lab reports susceptible (S)."
        elif result == "I":
            pred = "PARTIALLY EFFECTIVE"
            reason = "Intermediate susceptibility (I) reported."
        elif result == "R":
            pred = "INEFFECTIVE"
            reason = "Lab reports resistant (R)."
        else:
            # guess from gene markers for common classes
            if genes.get("ndm") or genes.get("oxa48") or genes.get("kpc"):
                # carbapenemase → carbapenems ineffective
                if "carbapenem" in ab.lower() or "meropenem" in ab.lower() or "imipenem" in ab.lower():
                    pred = "INEFFECTIVE"
                    reason = "Carbapenemase gene present (likely carbapenem resistance)."
                else:
                    pred = "PARTIALLY EFFECTIVE"
                    reason = "No AST result; carbapenemase genes present — caution advised."
            elif genes.get("esbl"):
                if any(x in ab.lower() for x in ["penicillin", "ceph", "cef", "ampicillin", "amoxicillin"]):
                    pred = "INEFFECTIVE"
                    reason = "ESBL genes present (likely resistance to penicillins/cephalosporins)."
                else:
                    pred = "PARTIALLY EFFECTIVE"
                    reason = "ESBL marker present; use caution."
            elif genes.get("mecA"):
                if "oxacillin" in ab.lower() or "flucloxacillin" in ab.lower() or "methicillin" in ab.lower() or "cefoxitin" in ab.lower():
                    pred = "INEFFECTIVE"
                    reason = "mecA marker → methicillin resistance likely."
                else:
                    pred = "PARTIALLY EFFECTIVE"
                    reason = "mecA present — suspect MRSA."
            elif genes.get("van"):
                if "vancomycin" in ab.lower() or "teicoplanin" in ab.lower():
                    pred = "INEFFECTIVE"
                    reason = "VRE marker present — glycopeptide resistance likely."
                else:
                    pred = "PARTIALLY EFFECTIVE"
                    reason = "VRE marker present — caution advised."
            else:
                pred = "Insufficient data"
                reason = "No AST result and no high-confidence gene inference."
                        # --- ML Antibiotic Prediction Override ---
            from backend.ml_engine import ml_predict_antibiotic
            ml_result = ml_predict_antibiotic(entry)

            if ml_result:
                pred = {
                    "S": "HIGHLY EFFECTIVE",
                    "I": "PARTIALLY EFFECTIVE",
                    "R": "INEFFECTIVE"
                }.get(ml_result, pred)
                reason += " (ML enhanced)"
            # --- END ML PATCH ---

        out.append({
            "antibiotic": ab,
            "prediction": pred,
            "result": result if result else None,
            "mic": mic,
            "zone": zone,
            "explanation": reason
        })

    # -----------------------
    # TODO: Replace or complement above with ML model call:
    # e.g. predictions = ml_model.predict_antibiotic_effectiveness(patient_features, ast_features)
    # then merge predictions into out[].
    # -----------------------

    return out

# --------------------------
# MDR probability scoring
# --------------------------
def calculate_mdr_probability(ast_panel: List[Dict[str, Any]], mdr_record: Dict[str, Any]) -> float:
    """
    Returns 0-100 probability. This is a conservative rule-of-thumb scorer.
    Replace with ML model in the TODO when available.
    """
    base = 5.0

    # gene contributions
    genes = gene_flags(mdr_record)
    if genes["ndm"]:
        base += 40
    if genes["oxa48"] or genes["kpc"]:
        base += 35
    if genes["esbl"]:
        base += 20
    if genes["mecA"]:
        base += 25
    if genes["van"]:
        base += 25

    # AST resistance count
    r_count = sum(1 for a in ast_panel if (a.get("result") or "").upper() == "R")
    base += min(40, r_count * 6)  # each R adds to risk

    # sample type and ward heuristics (higher for ICU / blood)
    sample = (mdr_record.get("sample_type") or "").lower()
    ward = (mdr_record.get("ward") or "").lower()
    if "blood" in sample or "sterile" in sample:
        base += 10
    if "ic" in ward:
        base += 10
    # --- ML MDR Probability Override ---
    from backend.ml_engine import ml_mdr_probability

    ml_score = ml_mdr_probability({
        "r_count": r_count,
        "esbl": 1 if genes["esbl"] else 0,
        "ndm": 1 if genes["ndm"] else 0,
        "oxa": 1 if genes["oxa48"] else 0,
        "kpc": 1 if genes["kpc"] else 0,
        "mrsa": 1 if genes["mecA"] else 0,
        "vre": 1 if genes["van"] else 0,
        "sample_blood": 1 if "blood" in sample else 0,
        "icu": 1 if "ic" in ward else 0,
    })

    if ml_score:
        base = (base + ml_score) / 2
    # --- END ML PATCH ---

    score = min(100.0, base)
    # -----------------------
    # TODO: Optionally call ML model here:
    # model_score = ml_model.predict_mdr_probability(features)
    # final = blend( score, model_score )
    # -----------------------
    return round(score, 1)

# --------------------------
# Severity level
# --------------------------
def calculate_severity_level(mdr_record: Dict[str, Any], ast_panel: List[Dict[str, Any]]) -> str:
    genes = gene_flags(mdr_record)
    r_count = sum(1 for a in ast_panel if (a.get("result") or "").upper() == "R")
    organism = (mdr_record.get("organism_detected") or "").lower()

    score = 0
    if genes["ndm"] or genes["oxa48"] or genes["kpc"]:
        score += 3
    if genes["van"] or genes["mecA"]:
        score += 2
    if r_count >= 4:
        score += 2
    if "klebsiella" in organism or "pseudomonas" in organism or "acinetobacter" in organism:
        score += 1

    if score >= 5:
        return "High"
    elif score >= 2:
        return "Moderate"
    else:
        return "Low"

# --------------------------
# Spread risk
# --------------------------
def calculate_spread_risk(mdr_record: Dict[str, Any], ast_panel: List[Dict[str, Any]]) -> float:
    genes = gene_flags(mdr_record)
    ward = (mdr_record.get("ward") or "").lower()
    score = 0.0
    if "ic" in ward:
        score += 3.0
    if genes["ndm"] or genes["oxa48"] or genes["kpc"]:
        score += 3.0
    if genes["esbl"]:
        score += 1.5
    r_count = sum(1 for a in ast_panel if (a.get("result") or "").upper() == "R")
    score += min(4.0, r_count * 0.6)
    # ---------------- ML ENHANCEMENT ----------------
    from backend.ml_engine import ml_predict_spread
    ml_spread = ml_predict_spread({
        "r_count": r_count,
        "ndm": 1 if genes["ndm"] else 0,
        "oxa": 1 if genes["oxa48"] else 0,
        "kpc": 1 if genes["kpc"] else 0,
        "esbl": 1 if genes["esbl"] else 0
    })
    if ml_spread:
        score = (score + ml_spread) / 2
    # ------------------------------------------------

    return round(min(10.0, score), 1)

# --------------------------
# High risk alerts generator
# --------------------------
def generate_high_risk_alerts(mdr_record: Dict[str, Any], ast_panel: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    alerts = []
    genes = gene_flags(mdr_record)
    if genes["ndm"] or genes["oxa48"] or genes["kpc"]:
        alerts.append({"type": "CARBAPENEMASE", "message": "Carbapenemase gene detected (NDM/OXA/KPC). Isolation recommended."})
    if genes["van"]:
        alerts.append({"type": "VRE", "message": "VRE marker detected (vanA/vanB). Contact precautions recommended."})
    if genes["mecA"]:
        alerts.append({"type": "MRSA", "message": "mecA detected — MRSA suspected. Review precautions."})

    r_count = sum(1 for a in ast_panel if (a.get("result") or "").upper() == "R")
    if r_count >= 6:
        alerts.append({"type": "MULTI_RESISTANT", "message": f"Organism resistant to {r_count} antibiotics."})

    if r_count >= 3:
        alerts.append({"type": "MULTI_R", "message": f"Multiple resistant pattern ({r_count} R results). Consider ID consult."})

    return alerts

# --------------------------
# Outbreak detection (lightweight)
# --------------------------
def detect_outbreak_candidates(recent_reports: List[Dict[str, Any]], target_report: Dict[str, Any], similarity_threshold: float=0.75) -> Optional[str]:
    """
    Lightweight detection: compares gene markers + top resistance profile across recent_reports
    Returns a textual cluster name when similarity crosses threshold OR None.
    Replace with clustering ML when available.
    """
    # Build signature for each report: sorted genes + top 3 R antibiotics
    def signature(r):
        genes = [
            ("NDM" if "ndm" in (r.get("carbapenemase") or "").lower() else ""),
            ("OXA-48" if "oxa" in (r.get("carbapenemase") or "").lower() else ""),
            (r.get("esbl_markers") or "").upper(),
            (r.get("mrsa_marker") or "").upper(),
            (r.get("vre_markers") or "").upper()
        ]
        r_ants = [a.get("antibiotic") for a in (r.get("ast_panel") or []) if (a.get("result") or "").upper() == "R"]
        top_r = tuple(sorted(r_ants)[:3])
        return (tuple(sorted([g for g in genes if g])), top_r)

    target_sig = signature(target_report)
    same = 0
    for r in recent_reports:
        if r.get("id") == target_report.get("id"):
            continue
        if signature(r) == target_sig:
            same += 1

    # if multiple matches found, mention cluster
    if same >= 2:
        return "Pattern resembles local MDR cluster (similar genes + resistance profile). Monitor nearby patients."
    return None
