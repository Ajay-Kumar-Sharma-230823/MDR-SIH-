# backend/patients.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models, schemas
from fastapi.encoders import jsonable_encoder

import json

router = APIRouter(prefix="/patients", tags=["Patients"])

# --------------------------------------------------------
# SEARCH PATIENTS
# --------------------------------------------------------
@router.get("/search")
def search_patients(query: str = "", db: Session = Depends(get_db)):
    """
    Search patients by name, doctor, or ABHA.
    Returns small result list for UI.
    """
    q = (query or "").strip().lower()
    if not q:
        return {"results": []}

    results = []
    patients = db.query(models.Patient).all()

    for p in patients:
        full = (p.full_name or "").lower()
        doc = (p.assigned_doctor or "").lower()
        abha = (getattr(p, "abha", "") or "").lower()

        # starts-with search for accuracy
        if full.startswith(q) or doc.startswith(q) or abha.startswith(q):
            results.append({
                "id": p.id,
                "full_name": p.full_name,
                "age": p.age,
                "gender": p.gender,
                "ward": p.ward,
                "assigned_doctor": p.assigned_doctor,
                "abha": getattr(p, "abha", None),
                "mdr_status": p.mdr_details.mdr_status if p.mdr_details else None
            })

    return {"results": results}


# --------------------------------------------------------
# CREATE PATIENT
# --------------------------------------------------------
# --------------------------------------------------------
# CREATE PATIENT
# --------------------------------------------------------
@router.post("", response_model=schemas.PatientOut)
def create_patient(data: schemas.PatientCreate, db: Session = Depends(get_db)):

    patient = models.Patient(
        full_name=data.full_name,
        age=data.age,
        gender=data.gender,
        admission_date=data.admission_date,
        admission_time=data.admission_time,
        reason=data.reason,
        ward=data.ward,
        assigned_doctor=data.assigned_doctor,
        uploaded_files=json.dumps(data.uploaded_files) if data.uploaded_files else None
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    # ------------- MDR DETAILS -------------
    if data.mdr_details:
        print("MDR DETAILS RECEIVED:", data.mdr_details)
        md = data.mdr_details

        # HIGH RISK → Create Notification + Send Email
        if md.mdr_status and "high" in md.mdr_status.lower():

        
            # Create alert in DB
            new_alert = models.Notification(
                patient_id=patient.id,
                patient_name=patient.full_name,
                ward=patient.ward,
                risk_level="HIGH RISK",
                is_read=False
            )
            db.add(new_alert)
            db.commit()

            # SEND HTML EMAIL
            import smtplib
            from email.message import EmailMessage

            doctor_email = "krishnadhingra063@gmail.com"  # fixed doctor email
            sender_email = "sparshamrit78@gmail.com"        # hospital Gmail

            msg = EmailMessage()
            msg["Subject"] = "⚠ HIGH RISK PATIENT ALERT — Amrit Sparsh"
            msg["From"] = sender_email
            msg["To"] = doctor_email

            html_body = f"""
            <html>
            <body style="font-family: Arial; padding: 10px;">
                <h2 style="color: red;">⚠ HIGH RISK PATIENT ALERT</h2>
                <p>A new patient has been flagged as <strong>HIGH RISK</strong> in the hospital.</p>

                <table border="1" cellpadding="6" style="border-collapse: collapse;">
                    <tr><th>Patient Name</th><td>{patient.full_name}</td></tr>
                    <tr><th>Ward</th><td>{patient.ward}</td></tr>
                    <tr><th>Status</th><td style="color:red;">HIGH RISK</td></tr>
                </table>

                <br>
                <p>Please take immediate clinical precautionary measures.</p>
                <br>
                <p>
                    Regards,<br>
                    <strong>Amrit Sparsh Infection Control System</strong><br>
                    (Automated Hospital Alert)
                </p>
            </body>
            </html>
            """

            msg.add_alternative(html_body, subtype="html")

            try:
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                    smtp.login(sender_email, "bmda zijy wzej odmu")
                    smtp.send_message(msg)
                print("High-Risk Email sent successfully!")
            except Exception as e:
                print("Email failed, but patient saved successfully:", e)

        # NORMAL MDR DATA LOGIC (unchanged)
        ast_json = None
        if md.ast_panel:
            ast_json = json.dumps([entry.dict() for entry in md.ast_panel])

        mdr_record = models.MDRDetails(
            patient_id=patient.id,
            mdr_status=md.mdr_status,
            infection_source=md.infection_source,
            infection_site=md.infection_site,
            sample_type=md.sample_type,
            collection_date=md.collection_date,
            collection_time=md.collection_time,
            sample_id=md.sample_id,
            time_to_processing_hrs=md.time_to_processing_hrs,
            ast_panel_json=ast_json,
            esbl_markers=md.esbl_markers,
            carbapenemase=md.carbapenemase,
            mrsa_marker=md.mrsa_marker,
            vre_markers=md.vre_markers,
            genomic_notes=md.genomic_notes,
            severity_level=md.severity_level,
            mdr_spread_risk=md.mdr_spread_risk,
            clinical_notes=md.clinical_notes
        )

        db.add(mdr_record)
        db.commit()
        db.refresh(mdr_record)

    db.refresh(patient)
    return convert_patient(patient)



# --------------------------------------------------------
# GET ALL PATIENTS
# --------------------------------------------------------
@router.get("", response_model=list[schemas.PatientOut])
def list_patients(db: Session = Depends(get_db)):
    pts = db.query(models.Patient).all()
    return jsonable_encoder([convert_patient(p) for p in pts])


# --------------------------------------------------------
# GET ONE PATIENT
# --------------------------------------------------------
@router.get("/{patient_id}", response_model=schemas.PatientOut)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not p:
        raise HTTPException(404, "Patient not found")
    return jsonable_encoder(convert_patient(p))



# --------------------------------------------------------
# INTERNAL CONVERTER TO MATCH SCHEMA OUTPUT
# --------------------------------------------------------
def convert_patient(p: models.Patient):

    # Fix uploaded files
    uploaded = None
    if p.uploaded_files:
        try:
            uploaded = json.loads(p.uploaded_files)
        except:
            uploaded = None

    # --- MDR DETAILS ---
    mdr = None
    if p.mdr_details:
        try:
            ast_list = json.loads(p.mdr_details.ast_panel_json) if p.mdr_details.ast_panel_json else None
        except:
            ast_list = None

        mdr = {
            "mdr_status": p.mdr_details.mdr_status,
            "infection_source": p.mdr_details.infection_source,
            "infection_site": p.mdr_details.infection_site,
            "sample_type": p.mdr_details.sample_type,
            "collection_date": p.mdr_details.collection_date,
            "collection_time": p.mdr_details.collection_time,
            "sample_id": p.mdr_details.sample_id,
            "time_to_processing_hrs": p.mdr_details.time_to_processing_hrs,
            "ast_panel": ast_list,
            "esbl_markers": p.mdr_details.esbl_markers,
            "carbapenemase": p.mdr_details.carbapenemase,
            "mrsa_marker": p.mdr_details.mrsa_marker,
            "vre_markers": p.mdr_details.vre_markers,
            "genomic_notes": p.mdr_details.genomic_notes,
            "severity_level": p.mdr_details.severity_level,
            "mdr_spread_risk": p.mdr_details.mdr_spread_risk,
            "clinical_notes": p.mdr_details.clinical_notes
        }

    # --- LAB REPORTS ---
    lab_reports = []
    for r in p.lab_reports:
        try:
            ast_json = json.loads(r.ast_panel_json) if r.ast_panel_json else None
        except:
            ast_json = None

        lab_reports.append({
            "id": r.id,
            "patient_id": p.id,
            "sample_type": r.sample_type,
            "sample_id": r.sample_id,
            "lab_report_date": r.lab_report_date,
            "collection_datetime": r.collection_datetime,
            "processing_datetime": r.processing_datetime,
            "organism_detected": r.organism_detected,
            "gram_stain": r.gram_stain,
            "growth_pattern": r.growth_pattern,
            "infection_site": r.infection_site,
            "infection_source": r.infection_source,
            "lab_notes": r.lab_notes,
            "ast_panel": ast_json,
            "esbl_markers": r.esbl_markers,
            "carbapenemase": r.carbapenemase,
            "mrsa_marker": r.mrsa_marker,
            "vre_markers": r.vre_markers,
            "genomic_notes": r.genomic_notes,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
            "files": []
        })

    # --- CONTACTS ---
    contacts = [
        {
            "id": c.id,
            "patient_id": p.id,
            "visitor_name": c.visitor_name,
            "visitor_role": c.visitor_role,
            "visit_datetime": c.visit_datetime,
            "duration_minutes": c.duration_minutes,
            "notes": c.notes,
            "created_at": c.created_at,
            "updated_at": c.updated_at
        }
        for c in p.contacts
    ]

    return {
        "id": p.id,
        "full_name": p.full_name,
        "age": p.age,
        "gender": p.gender,
        "admission_date": p.admission_date,
        "admission_time": p.admission_time,
        "reason": p.reason,
        "ward": p.ward,
        "assigned_doctor": p.assigned_doctor,
        "uploaded_files": uploaded,
        "mdr_details": mdr,
        "lab_reports": lab_reports,
        "contacts": contacts,
        "created_at": p.created_at,
        "updated_at": p.updated_at
    }


# ---------------------------
# GET ALL VISITORS FOR A PATIENT
# ---------------------------
@router.get("/{patient_id}/contacts", response_model=list[schemas.ContactOut])
def get_patient_contacts(patient_id: int, db: Session = Depends(get_db)):
    # Ensure patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    contacts = (
        db.query(models.PatientContact)
        .filter(models.PatientContact.patient_id == patient_id)
        .order_by(models.PatientContact.visit_datetime.desc())
        .all()
    )

    return contacts


# ---------------------------
# ADD NEW VISITOR CONTACT
# ---------------------------
@router.post("/{patient_id}/contacts", response_model=schemas.ContactOut)
def add_contact(patient_id: int, data: schemas.ContactCreate, db: Session = Depends(get_db)):

    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    visit_time = data.visit_datetime or datetime.utcnow()

    new_contact = models.PatientContact(
        patient_id=patient_id,
        visitor_name=data.visitor_name,
        visitor_role=data.visitor_role,
        visit_datetime=visit_time,
        duration_minutes=data.duration_minutes,
        notes=data.notes,
        mobile_number=data.mobile_number
    )

    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    return new_contact


# ---------------------------
# UPDATE EXISTING VISIT
# ---------------------------
@router.put("/contacts/{contact_id}", response_model=schemas.ContactOut)
def update_contact(contact_id: int, data: schemas.ContactCreate, db: Session = Depends(get_db)):

    contact = db.query(models.PatientContact).filter(models.PatientContact.id == contact_id).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Update only fields that are provided
    if data.visitor_name is not None:
        contact.visitor_name = data.visitor_name

    if data.visitor_role is not None:
        contact.visitor_role = data.visitor_role

    if data.visit_datetime is not None:
        contact.visit_datetime = data.visit_datetime

    if data.duration_minutes is not None:
        contact.duration_minutes = data.duration_minutes

    if data.notes is not None:
        contact.notes = data.notes

    db.commit()
    db.refresh(contact)

    return contact

import requests

ULTRA_URL = "https://api.ultramsg.com/instance154819/messages/chat"
ULTRA_TOKEN = "2cnt2tj5rprlpvsf"

def send_whatsapp(phone, message):
    phone = str(phone).replace("+91", "").strip()

    payload = {
        "token": ULTRA_TOKEN,
        "to": f"91{phone}",
        "body": message,
        "priority": "high"
    }

    try:
        response = requests.post(ULTRA_URL, data=payload)
        print("WhatsApp Response:", response.text)
        return response.json()
    except Exception as e:
        print("WhatsApp send failed:", e)
        return None
        
@router.post("/{patient_id}/trigger-sos")
def trigger_sos(patient_id: int, db: Session = Depends(get_db)):

    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    contacts = db.query(models.PatientContact).filter(
        models.PatientContact.patient_id == patient_id
    ).all()

    if not contacts:
        return {"success": False, "message": "No visitors found"}

    sent_to = []

    for c in contacts:
        if c.mobile_number:

            # Create visitor-specific message
            alert_message = f"""
⚠ MDR CONTACT ALERT ⚠

Dear User,

Our system has detected that you recently came into contact with an MDR (Multi-Drug Resistant) patient.

🧑‍⚕ Patient Details You Visited
• Name: {patient.full_name}
• Age: {patient.age}
• Gender: {patient.gender}
• Doctor: {patient.assigned_doctor}

📝 Your Visit Information
• Role: {c.visitor_role}
• Visit Time: {c.visit_datetime}

As a precaution, you are strongly advised to visit the nearest hospital immediately and get your medical tests done.

This is an urgent safety notification issued in your interest.  
👉 Please take action at the earliest.

— Team Amrit Sparsh
"""

            send_whatsapp(c.mobile_number, alert_message)
            sent_to.append(c.mobile_number)

    return {
        "success": True,
        "message": f"SOS sent to {len(sent_to)} contacts",
        "numbers": sent_to
    }
