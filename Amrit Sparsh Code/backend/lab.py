# backend/lab.py
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
import os
import shutil
import json
import datetime
from typing import List

router = APIRouter(prefix="/lab", tags=["Lab"])

# ensure uploads folder exists inside backend/uploads/lab_reports
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "lab_reports")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/search")
def search_patients(q: str = "", db: Session = Depends(get_db)):
    q = (q or "").strip()
    if not q:
        return []
    # simple search by name or ward
    results = db.query(models.Patient).filter(
        (models.Patient.full_name.ilike(f"%{q}%")) |
        (models.Patient.ward.ilike(f"%{q}%"))
    ).limit(25).all()

    # return minimal info required by frontend
    out = []
    for p in results:
        out.append({
            "id": p.id,
            "name": p.full_name,
            "ward": p.ward or ""
        })
    return out


@router.get("/{patient_id}/reports")
def get_reports(patient_id: int, db: Session = Depends(get_db)):
    reports = db.query(models.LabReport).filter(models.LabReport.patient_id == patient_id).order_by(models.LabReport.created_at.desc()).all()
    out = []
    for r in reports:
        # prepare files list
        files_out = []
        for f in r.files:
            file_url = f"/uploads/lab_reports/{os.path.basename(f.file_path)}" if f.file_path else None
            files_out.append({
                "id": f.id,
                "file_name": f.file_name,
                "file_url": file_url,
                "file_size": f.file_size,
                "uploaded_at": f.uploaded_at
            })

        ast_panel = None
        if r.ast_panel_json:
            try:
                ast_panel = json.loads(r.ast_panel_json)
            except:
                ast_panel = None

        out.append({
            "id": r.id,
            "patient_id": r.patient_id,
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
            "ast_panel": ast_panel,
            "esbl_markers": r.esbl_markers,
            "carbapenemase": r.carbapenemase,
            "mrsa_marker": r.mrsa_marker,
            "vre_markers": r.vre_markers,
            "genomic_notes": r.genomic_notes,
            "severity_level": r.severity_level,
            "spread_risk_score": r.spread_risk_score,
            "antibiotic_failure_probability": r.antibiotic_failure_probability,
            "predicted_cluster": r.predicted_cluster,
            "files": files_out,
            "created_at": r.created_at,
            "updated_at": r.updated_at
        })
    return out


@router.post("/{patient_id}/upload")
def upload_lab_report(
    patient_id: int,
    # form fields
    sample_type: str = Form(None),
    sample_id: str = Form(None),
    lab_report_date: str = Form(None),
    collection_datetime: str = Form(None),
    processing_datetime: str = Form(None),
    organism_detected: str = Form(None),
    lab_notes: str = Form(None),
    esbl_markers: str = Form(None),
    carbapenemase: str = Form(None),
    vre_markers: str = Form(None),
    mrsa_marker: str = Form(None),
    genomic_notes: str = Form(None),
    ast_json: str = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    # Validate patient exists
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Parse dates safely
    def parse_iso_or_none(s):
        if not s:
            return None
        try:
            # accept ISO string
            return datetime.datetime.fromisoformat(s.replace("Z", "+00:00"))
        except:
            try:
                # attempt many common formats
                return datetime.datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
            except:
                try:
                    return datetime.datetime.strptime(s, "%Y-%m-%d")
                except:
                    return None

    lab_date = None
    try:
        if lab_report_date:
            lab_date = datetime.date.fromisoformat(lab_report_date)
    except:
        lab_date = None

    collection_dt = parse_iso_or_none(collection_datetime)
    processing_dt = parse_iso_or_none(processing_datetime)

    # create report record
    rep = models.LabReport(
        patient_id = patient_id,
        sample_type = sample_type,
        sample_id = sample_id,
        lab_report_date = lab_date,
        collection_datetime = collection_dt,
        processing_datetime = processing_dt,
        organism_detected = organism_detected,
        lab_notes = lab_notes,
        esbl_markers = esbl_markers,
        carbapenemase = carbapenemase,
        vre_markers = vre_markers,
        mrsa_marker = mrsa_marker,
        genomic_notes = genomic_notes,
        ast_panel_json = ast_json or None
    )

    db.add(rep)
    db.commit()
    db.refresh(rep)

    # Save file if present
    if file:
        safe_name = f"{rep.id}_{int(datetime.datetime.utcnow().timestamp())}_{file.filename}"
        dest_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        fsize = os.path.getsize(dest_path)

        file_rec = models.LabFile(
            report_id = rep.id,
            file_name = file.filename,
            file_path = dest_path,
            file_size = fsize,
            content_type = file.content_type
        )
        db.add(file_rec)
        db.commit()
        db.refresh(file_rec)

    return {"success": True, "report_id": rep.id}
