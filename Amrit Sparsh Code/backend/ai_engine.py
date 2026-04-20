# backend/ai_engine.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models, schemas
from backend.ai_utils import (
    parse_ast_list, rule_based_antibiotic_prediction, calculate_mdr_probability,
    calculate_severity_level, calculate_spread_risk, generate_high_risk_alerts,
    detect_outbreak_candidates, gene_flags
)
from typing import List, Dict, Any
import json
import joblib


router = APIRouter(prefix="/ai", tags=["AI Engine"])

# -----------------------
# Helper: fetch patient + latest lab_reports + mdr_details
# -----------------------
def fetch_patient_bundle(db: Session, patient_id: int) -> Dict[str, Any]:
    p = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")

    # patient-level fields
    patient_out = {
        "id": p.id,
        "patient": p.full_name,
        "age": p.age,
        "gender": p.gender,
        "ward": p.ward,
        "doctor": p.assigned_doctor,
        "reason": p.reason,
        "admission_date": str(p.admission_date) if p.admission_date else None
    }

    # MDR details
    mdr = {}
    if p.mdr_details:
        m = p.mdr_details
        mdr = {
            "mdr_status": m.mdr_status,
            "infection_source": m.infection_source,
            "infection_site": m.infection_site,
            "sample_type": m.sample_type,
            "collection_date": str(m.collection_date) if m.collection_date else None,
            "sample_id": m.sample_id,
            "time_to_processing_hrs": m.time_to_processing_hrs,
            "ast_panel": parse_ast_list(m.ast_panel_json),
            "esbl_markers": m.esbl_markers,
            "carbapenemase": m.carbapenemase,
            "mrsa_marker": m.mrsa_marker,
            "vre_markers": m.vre_markers,
            "genomic_notes": m.genomic_notes,
            "severity_level": m.severity_level,
            "mdr_spread_risk": m.mdr_spread_risk,
            "clinical_notes": m.clinical_notes,
            "ward": p.ward
        }

    # Lab reports (if any) - include last 10 for outbreak detection
    reports = []
    for r in (p.lab_reports or [])[-10:]:
        reports.append({
            "id": r.id,
            "sample_type": r.sample_type,
            "sample_id": r.sample_id,
            "lab_report_date": str(r.lab_report_date) if r.lab_report_date else None,
            "organism_detected": r.organism_detected,
            "infection_site": r.infection_site,
            "ast_panel": parse_ast_list(r.ast_panel_json),
            "esbl_markers": r.esbl_markers,
            "carbapenemase": r.carbapenemase,
            "mrsa_marker": r.mrsa_marker,
            "vre_markers": r.vre_markers,
            "genomic_notes": r.genomic_notes
        })

    bundle = {
        **patient_out,
        "mdr_details": mdr if mdr else None,
        "lab_reports": reports
    }
    return bundle

# -----------------------
# AI Predict endpoint
# -----------------------
@router.get("/predict/{patient_id}")
def predict_for_patient(patient_id: int, db: Session = Depends(get_db)):
    """
    Returns JSON with antibiotic predictions, MDR probability, severity, spread risk,
    alerts, and outbreak detection hints.
    """
    bundle = fetch_patient_bundle(db, patient_id)

    if not bundle.get("mdr_details"):
        return {"error": "Insufficient data for complete prediction", "patient": bundle}

    mdr = bundle["mdr_details"]
    ast_panel = mdr.get("ast_panel") or []

    # gene flags
    genes = gene_flags(mdr)

    # Antibiotic predictions (rule-based + placeholder for ML)
    antibiotic_predictions = rule_based_antibiotic_prediction(ast_panel, genes)

    # MDR probability (0-100)
    mdr_probability = calculate_mdr_probability(ast_panel, {**mdr, "ward": bundle.get("ward")})

    # Severity level
    severity = calculate_severity_level(mdr, ast_panel)

    # Spread risk 0-10
    spread_risk = calculate_spread_risk(mdr, ast_panel)

    # High risk alerts
    alerts = generate_high_risk_alerts(mdr, ast_panel)

    # Outbreak detection (compare with other recent reports in the system)
    # For now we pick recent lab reports from DB to compare signatures (lightweight)
    recent_reports = []
    # Fetch a few latest lab reports across the DB (non-blocking simple query)
    all_reports = db.query(models.LabReport).order_by(models.LabReport.created_at.desc()).limit(50).all()
    for r in all_reports:
        recent_reports.append({
            "id": r.id,
            "ast_panel": parse_ast_list(r.ast_panel_json),
            "esbl_markers": r.esbl_markers,
            "carbapenemase": r.carbapenemase,
            "mrsa_marker": r.mrsa_marker,
            "vre_markers": r.vre_markers
        })

    outbreak_hint = detect_outbreak_candidates(recent_reports, {
        "id": mdr.get("sample_id") or -1,
        "ast_panel": ast_panel,
        "esbl_markers": mdr.get("esbl_markers"),
        "carbapenemase": mdr.get("carbapenemase")
    })

    # Clinical insights (non-prescriptive)
    insights = []
    if any(a["type"] == "CARBAPENEMASE" for a in alerts):
        insights.append("Carbapenem resistance markers present; recommend contact precautions and infectious disease review.")
    if any(a["type"] == "VRE" for a in alerts):
        insights.append("VRE marker present; use strict contact precautions and consider cohorting.")
    if any(a["type"] == "MRSA" for a in alerts):
        insights.append("Possible MRSA; review decolonization and contact measures.")

    if not insights:
        insights.append("No immediate high-risk genomic alerts detected. Continue standard precautions; review AST for therapy decisions.")

    response = {
        "patient": bundle.get("patient"),
        "age": bundle.get("age"),
        "gender": bundle.get("gender"),
        "ward": bundle.get("ward"),
        "mdr_details": {
            "mdr_status": mdr.get("mdr_status"),
            "infection_site": mdr.get("infection_site"),
            "sample_type": mdr.get("sample_type"),
            "ast_panel": ast_panel,
            "esbl_markers": mdr.get("esbl_markers"),
            "carbapenemase": mdr.get("carbapenemase"),
            "mrsa_marker": mdr.get("mrsa_marker"),
            "vre_markers": mdr.get("vre_markers"),
            "genomic_notes": mdr.get("genomic_notes")
        },
        "antibiotic_predictions": antibiotic_predictions,
        "mdr_probability": mdr_probability,
        "severity_level": severity,
        "spread_risk_score": spread_risk,
        "high_risk_alerts": alerts,
        "clinical_insights": insights,
        "outbreak_hint": outbreak_hint
    }

    return {    "patient_name": bundle.get("patient"),
        "patient_id": bundle.get("id"),

        "mdr_probability": float(mdr_probability),
        "severity_level": severity,
        "spread_risk_score": float(spread_risk),
        "antibiotic_predictions": antibiotic_predictions,

        "clinical_insights": insights,
        "high_risk_alerts": alerts,
        "outbreak_hint": outbreak_hint}

# -----------------------
# Generic chat-like query endpoint (accepts a plain prompt + optional patient_id)
# -----------------------
@router.post("/query")
def ai_query(payload: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Accepts JSON:
    { "prompt": "Analyze MDR risk", "patient_id": 123 }
    Returns the same structured prediction for recognized commands.
    """
    prompt = (payload.get("prompt") or "").lower()
    patient_id = payload.get("patient_id")
    patient_email = payload.get("user_email")

    # Basic routing of prompt to predict
    if any(k in prompt for k in ["predict antibiotic", "predict antibiotics", "antibiotic for", "analyze mdr", "analyze resistance", "mdr risk"]):
        if not patient_id:
            return {"error": "Please provide patient_id for MDR analysis", "help": ["Use patient_id in payload to request patient-specific analysis."]}
        return predict_for_patient(patient_id, db)

    # If user asked to "list alerts" or similar
    if "alerts" in prompt or "high risk" in prompt:
        alerts = db.query(models.Notification).order_by(models.Notification.created_at.desc()).limit(50).all()
        out = [{"patient": a.patient_name, "ward": a.ward, "risk": a.risk_level} for a in alerts]
        return {"alerts": out}

    # default help
    return {"help": ["I can: 'Predict antibiotics for patient_id', 'Analyze MDR risk for patient_id', 'List alerts'."], "error": "Command not recognized."}

