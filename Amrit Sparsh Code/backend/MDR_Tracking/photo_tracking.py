import os
import uuid
import shutil
from typing import List, Dict

from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel

# =====================================================
#  Convert standalone FastAPI → Router for main backend
# =====================================================

router = APIRouter(prefix="/mdr-tracking", tags=["MDR Tracking"])

# ================== Paths & Folders ==================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "patient_images")
VIDEO_DIR = os.path.join(BASE_DIR, "static", "videos")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

# =====================================================
#  NO static mounts here — they will be mounted in main.py
# =====================================================


# ================== Models ==================

class GraphNode(BaseModel):
    id: str
    x: int
    y: int
    label: str
    sublabel: str
    risk: str
    score: int


class GraphEdge(BaseModel):
    from_: str
    to: str
    risk: str

    class Config:
        fields = {"from_": "from"}


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class AnalysisRequest(BaseModel):
    image_id: str


class AnalysisResponse(BaseModel):
    status: str
    handshake_video_url: str
    exposures: List[Dict]


# ================== Utility ==================

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}


def save_upload_file(upload_file: UploadFile, destination_folder: str) -> str:
    """Save file with unique name and return absolute path."""
    ext = os.path.splitext(upload_file.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    image_id = str(uuid.uuid4())
    filename = f"{image_id}{ext}"
    dest_path = os.path.join(destination_folder, filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return dest_path


# ================== API Endpoints ==================

@router.get("/api/health")
def health_check():
    return {"status": "ok", "message": "MDR Tracking Module Active"}


@router.post("/api/upload-patient-image")
async def upload_patient_image(file: UploadFile = File(...)):
    """Upload patient image for MDR analysis."""
    saved_path = save_upload_file(file, UPLOAD_DIR)

    rel_path = os.path.relpath(saved_path, BASE_DIR).replace("\\", "/")
    image_url = f"/{rel_path}"

    image_id = os.path.splitext(os.path.basename(saved_path))[0]

    return {
        "status": "stored",
        "image_id": image_id,
        "image_url": image_url
    }


@router.get("/api/graph", response_model=GraphResponse)
def get_graph():
    """Static MDR contact graph."""
    nodes = [
        GraphNode(id="R", x=180, y=200, label="Radhika", sublabel="MDR+ Patient", risk="high", score=9),
        GraphNode(id="U", x=380, y=120, label="Ujala", sublabel="Exposed", risk="medium", score=7),
        GraphNode(id="S", x=380, y=280, label="Staff 3A", sublabel="Nurse", risk="low", score=3),
    ]

    edges = [
        GraphEdge(from_="R", to="U", risk="high"),
        GraphEdge(from_="U", to="S", risk="medium"),
    ]

    return GraphResponse(nodes=nodes, edges=edges)


@router.post("/api/run-analysis", response_model=AnalysisResponse)
def run_analysis(req: AnalysisRequest):
    """Return exposure events + handshake video URL."""
    # Check if uploaded image exists
    found = any(fname.startswith(req.image_id) for fname in os.listdir(UPLOAD_DIR))
    if not found:
        raise HTTPException(status_code=404, detail="Image ID not found")

    # Static video path
    video_rel = "/mdr-tracking-static/mdr_handshake.mp4"
    full_video_path = os.path.join(VIDEO_DIR, "mdr_handshake.mp4")

    if not os.path.exists(full_video_path):
        raise HTTPException(
            status_code=500,
            detail="Handshake video missing. Place mdr_handshake.mp4 in backend/static/mdr_tracking/"
        )

    exposures = [
        {"source": "Radhika", "target": "Ujala", "type": "handshake", "risk": "high",
         "location": "Ward 3A", "time_offset_seconds": 35},
        {"source": "Ujala", "target": "Staff 3A", "type": "close proximity", "risk": "medium",
         "location": "Nurses station", "time_offset_seconds": 120},
    ]

    return AnalysisResponse(
        status="processed",
        handshake_video_url=video_rel,
        exposures=exposures
    )
