# backend/schemas.py
from pydantic import BaseModel
from pydantic import ConfigDict
from typing import Optional, List
from datetime import date, time, datetime

# -------------------------
# LOGIN SCHEMAS (KEEP SAME) 
# -------------------------

class StaffProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None
    user_id: int | None = None
    user_email: str | None = None
    full_name: str | None = None
    department: str | None = None
    designation: str | None = None
    gender: str | None = None
    dob: str | None = None
    phone: str | None = None
    emergency_contact: str | None = None
    employee_id: str | None = None
    shift: str | None = None
    abha: str | None = None
    hospital_name: str | None = None



class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None
    role: Optional[str] = None
    profile: StaffProfileOut | None = None

# -------------------------
# PATIENT + MDR SCHEMAS
# -------------------------
class ASTEntry(BaseModel):
    antibiotic: str
    result: Optional[str] = None
    mic: Optional[str] = None
    zone: str | int | None = None


class MDRDetailsCreate(BaseModel):
    mdr_status: Optional[str]
    infection_source: Optional[str]
    infection_site: Optional[str]

    sample_type: Optional[str]
    collection_date: Optional[date]
    collection_time: Optional[time]
    sample_id: Optional[str]
    time_to_processing_hrs: Optional[float]

    ast_panel: Optional[List[ASTEntry]]

    esbl_markers: Optional[str]
    carbapenemase: Optional[str]
    mrsa_marker: Optional[str]
    vre_markers: Optional[str]
    genomic_notes: Optional[str]

    severity_level: Optional[str]
    mdr_spread_risk: Optional[float]
    clinical_notes: Optional[str]


class PatientCreate(BaseModel):
    full_name: str
    age: Optional[int]
    gender: Optional[str]

    admission_date: Optional[date]
    admission_time: Optional[time]
    reason: Optional[str]

    ward: Optional[str]
    assigned_doctor: Optional[str]

    uploaded_files: Optional[List[dict]]

    mdr_details: Optional[MDRDetailsCreate]


class MDRDetailsOut(MDRDetailsCreate):
    ast_panel: Optional[List[ASTEntry]]



# -------------------------
# NEW: Lab report schemas
# -------------------------
class LabFileOut(BaseModel):
    id: int
    file_name: str
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class LabReportOut(BaseModel):
    id: int
    patient_id: int
    sample_type: Optional[str] = None
    sample_id: Optional[str] = None
    lab_report_date: Optional[date] = None
    collection_datetime: Optional[datetime] = None
    processing_datetime: Optional[datetime] = None
    organism_detected: Optional[str] = None
    gram_stain: Optional[str] = None
    growth_pattern: Optional[str] = None
    infection_site: Optional[str] = None
    infection_source: Optional[str] = None
    lab_notes: Optional[str] = None

    ast_panel: Optional[list[ASTEntry]] = None
    esbl_markers: Optional[str] = None
    carbapenemase: Optional[str] = None
    mrsa_marker: Optional[str] = None
    vre_markers: Optional[str] = None
    genomic_notes: Optional[str] = None

    # FIXED — THESE MUST BE OPTIONAL
    severity_level: Optional[str] = None
    spread_risk_score: Optional[int] = None
    antibiotic_failure_probability: Optional[float] = None
    predicted_cluster: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    files: Optional[list] = None

    class Config:
        orm_mode = True


class ContactCreate(BaseModel):
    visitor_name: str
    visitor_role: Optional[str] = None
    visit_datetime: Optional[datetime] = None   # if not provided, server will set now
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    mobile_number: Optional[str] = None  

class ContactOut(BaseModel):
    id: int
    patient_id: int
    visitor_name: str
    visitor_role: Optional[str] = None
    visit_datetime: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    mobile_number: Optional[str] = None  
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class PatientOut(BaseModel):
    id: int
    full_name: str
    age: Optional[int]
    gender: Optional[str]

    admission_date: Optional[date]
    admission_time: Optional[time]
    reason: Optional[str]

    ward: Optional[str]
    assigned_doctor: Optional[str]

    uploaded_files: Optional[List[dict]]

    mdr_details: Optional[MDRDetailsOut]
    lab_reports: list[LabReportOut] | None = None
    contacts: list[ContactOut] | None = None

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
        
class EquipmentCreate(BaseModel):
    id: str
    name: str
    type: str | None = None

class EquipmentUsageCreate(BaseModel):
    equipment_id: str
    patient_id: int

class GraphNodeCreate(BaseModel):
    id: str
    label: str
    type: str
    risk: str | None = None

class GraphLinkCreate(BaseModel):
    source_id: str
    target_id: str


