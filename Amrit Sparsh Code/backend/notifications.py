from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/")
def get_notifications(db: Session = Depends(get_db)):
    alerts = (
        db.query(models.Notification)
        .order_by(models.Notification.created_at.desc())
        .all()
    )

    return [
        {
            "id": n.id,
            "patient_id": n.patient_id,
            "patient_name": n.patient_name,
            "ward": n.ward,
            "risk_level": n.risk_level,
            "is_read": n.is_read,
            "created_at": n.created_at
        }
        for n in alerts
    ]


@router.post("/mark-read/{notif_id}")
def mark_notification_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}
