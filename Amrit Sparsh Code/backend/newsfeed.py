# backend/newsfeed.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
from datetime import datetime

router = APIRouter(prefix="/newsfeed", tags=["Newsfeed"])
DEFAULT_HOSPITAL_LOCATION = "Indore – Amrit Sparsh Hospital"

def format_dt(dt):
    if not dt:
        return None
    return dt.strftime("%d %b %Y \u2022 %I:%M %p")  # Example: 30 Nov 2025 • 10:42 AM

@router.get("/high-alerts")
def get_high_alerts(db: Session = Depends(get_db)):

    alerts = db.query(models.Notification).order_by(
        models.Notification.created_at.desc()
    ).all()

    output = []

    for alert in alerts:

        # Fetch patient linked to notification
        patient = db.query(models.Patient).filter(
            models.Patient.id == alert.patient_id
        ).first()

        # Fetch MDR details
        mdr = patient.mdr_details if patient and patient.mdr_details else None

        # Build risk score
        if mdr and mdr.mdr_spread_risk is not None:
            raw = mdr.mdr_spread_risk
            risk_score = int(raw * 100) if 0 <= raw <= 1 else int(raw)
        else:
            risk_score = 90 if alert.risk_level == "HIGH RISK" else None

        # Detection time formatting
        det_dt = None
        if mdr and mdr.collection_date:
            try:
                time_part = mdr.collection_time or datetime.min.time()
                det_dt = datetime.combine(mdr.collection_date, time_part)
            except:
                det_dt = None

        output.append({
            "id": alert.id,
            "risk_level": alert.risk_level,
            "risk_score": risk_score,

            "patient": {
                "name": patient.full_name if patient else alert.patient_name,
                "age": patient.age if patient else None,
                "ward": patient.ward if patient else alert.ward,
            },

            "mdr": {
                "organism": (mdr.infection_source if (mdr and mdr.infection_source) else None),
                "severity": mdr.severity_level if mdr else None,
                "detection_time": format_dt(det_dt) if det_dt else None
            },

            "alert_reason": None,   # you do not store this yet
            "ai_insight": None,     # also not stored yet
            "location": DEFAULT_HOSPITAL_LOCATION

        })

    return {"alerts": output}
