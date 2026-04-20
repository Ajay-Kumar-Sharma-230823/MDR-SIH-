# backend/models.py
from sqlalchemy import Column, Integer, String, Date, Time, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base
from sqlalchemy import Boolean 
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="Doctor")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)

    admission_date = Column(Date, nullable=True)
    admission_time = Column(Time, nullable=True)
    reason = Column(Text, nullable=True)

    ward = Column(String, nullable=True)
    assigned_doctor = Column(String, nullable=True)

    uploaded_files = Column(Text, nullable=True)  # JSON string of file metadata

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    mdr_details = relationship(
        "MDRDetails",
        uselist=False,
        back_populates="patient",
        cascade="all, delete-orphan"
    )

    # Relation to lab reports (new)
    lab_reports = relationship("LabReport", back_populates="patient", cascade="all, delete-orphan")

    contacts = relationship(
        "PatientContact",
        back_populates="patient",
        cascade="all, delete-orphan"
    )

class PatientContact(Base):
    __tablename__ = "patient_contacts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)

    visitor_name = Column(String, nullable=False)
    visitor_role = Column(String, nullable=True)    # e.g., Son, Nurse, Ward boy, Doctor
    visit_datetime = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    mobile_number = Column(String, nullable=True)     
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # relationship back to patient
    patient = relationship("Patient", back_populates="contacts")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    patient_name = Column(String, nullable=False)
    ward = Column(String, nullable=True)
    risk_level = Column(String, default="HIGH RISK")  # static for now
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class MDRDetails(Base):
    __tablename__ = "mdr_details"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"))

    # MDR Basic
    mdr_status = Column(String, nullable=True)
    infection_source = Column(String, nullable=True)
    infection_site = Column(String, nullable=True)

    # Microbiology
    sample_type = Column(String, nullable=True)
    collection_date = Column(Date, nullable=True)
    collection_time = Column(Time, nullable=True)
    sample_id = Column(String, nullable=True)
    time_to_processing_hrs = Column(Float, nullable=True)

    # AST stored as JSON string
    ast_panel_json = Column(Text, nullable=True)

    # Gene markers
    esbl_markers = Column(String, nullable=True)
    carbapenemase = Column(String, nullable=True)
    mrsa_marker = Column(String, nullable=True)
    vre_markers = Column(String, nullable=True)
    genomic_notes = Column(Text, nullable=True)

    # Severity
    severity_level = Column(String, nullable=True)
    mdr_spread_risk = Column(Float, nullable=True)
    clinical_notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="mdr_details")


class StaffProfile(Base):
    __tablename__ = "staff_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    full_name = Column(String, nullable=False)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)
    shift = Column(String, nullable=True)
    abha = Column(String, nullable=True)
    hospital_name = Column(String, default="Amrit Sparsh Healthcare")

    user = relationship("User")


# -------------------------
# NEW: Lab models (Option A)
# -------------------------
class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)

    # basic metadata
    sample_type = Column(String, nullable=True)
    sample_id = Column(String, nullable=True)
    lab_report_date = Column(Date, nullable=True)

    collection_datetime = Column(DateTime, nullable=True)
    processing_datetime = Column(DateTime, nullable=True)

    organism_detected = Column(String, nullable=True)
    gram_stain = Column(String, nullable=True)
    growth_pattern = Column(String, nullable=True)
    infection_site = Column(String, nullable=True)
    infection_source = Column(String, nullable=True)
    lab_notes = Column(Text, nullable=True)

    # AST stored as JSON text
    ast_panel_json = Column(Text, nullable=True)

    # gene markers
    esbl_markers = Column(String, nullable=True)
    carbapenemase = Column(String, nullable=True)
    mrsa_marker = Column(String, nullable=True)
    vre_markers = Column(String, nullable=True)
    genomic_notes = Column(Text, nullable=True)

    # risk / analytics fields (optional)
    severity_level = Column(String, nullable=True)
    spread_risk_score = Column(Float, nullable=True)
    antibiotic_failure_probability = Column(Float, nullable=True)
    predicted_cluster = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="lab_reports")
    files = relationship("LabFile", back_populates="report", cascade="all, delete-orphan")


class LabFile(Base):
    __tablename__ = "lab_files"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("lab_reports.id", ondelete="CASCADE"))
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)   # server relative path
    file_size = Column(Integer, nullable=True)
    content_type = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("LabReport", back_populates="files")

# -------------------------
# NEW: Antibiotics Table
# -------------------------
class Antibiotic(Base):
    __tablename__ = "antibiotics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    antibiotic_class = Column(String, nullable=True)  # e.g., Carbapenem, Cephalosporin, Fluoroquinolone

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(String, primary_key=True)   # Example: EQ-001
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)

    usages = relationship("EquipmentUsage", back_populates="equipment")
    
class EquipmentUsage(Base):
    __tablename__ = "equipment_usage"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(String, ForeignKey("equipment.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    equipment = relationship("Equipment", back_populates="usages")
    patient = relationship("Patient")

class ExposureNode(Base):
    __tablename__ = "exposure_nodes"
    id = Column(String, primary_key=True)   # e.g. "N-abc123", "P-101", "EQ-001"
    label = Column(String)
    type = Column(String)   # Patient / Staff / Equipment / Visitor / Other
    risk = Column(String)   # HIGH / MODERATE / LOW / CENTRAL

class ExposureLink(Base):
    __tablename__ = "exposure_links"
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String, ForeignKey("exposure_nodes.id", ondelete="CASCADE"), nullable=False)
    target_id = Column(String, ForeignKey("exposure_nodes.id", ondelete="CASCADE"), nullable=False)
