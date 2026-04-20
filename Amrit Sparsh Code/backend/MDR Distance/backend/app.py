import os
import uuid
import shutil
from typing import List, Dict

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# ================== FastAPI app ==================

app = FastAPI(title="Amrit Sparsh MDR Backend")

# CORS (frontend se request allow karne ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # demo ke liye open; production me specific domain do
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== Paths & Folders ==================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "patient_images")
VIDEO_DIR = os.path.join(BASE_DIR, "static", "videos")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

# static files mount (video + uploads serve karne ke liye)
app.mount("/uploads", StaticFiles(directory=os.path.join(BASE_DIR, "uploads")), name="uploads")
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")


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
        fields = {"from_": "from"}  # JSON key "from", python field "from_"


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class AnalysisRequest(BaseModel):
    image_id: str  # jo upload ke response me mila tha


class AnalysisResponse(BaseModel):
    status: str
    handshake_video_url: str
    exposures: List[Dict]


# ================== Utility ==================

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}


def save_upload_file(upload_file: UploadFile, destination_folder: str) -> str:
    """File ko disk par store kare, unique naam ke saath. Returns ABSOLUTE path."""
    ext = os.path.splitext(upload_file.filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    image_id = str(uuid.uuid4())
    filename = f"{image_id}{ext}"
    dest_path = os.path.join(destination_folder, filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return dest_path


# ================== Endpoints ==================

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "MDR backend is running"}


@app.post("/api/upload-patient-image")
async def upload_patient_image(file: UploadFile = File(...)):
    """
    MDR patient (Radhika) ki image upload karo.
    Image disk par save hogi, aur hum image_id + URL return karenge.
    """
    try:
        saved_path = save_upload_file(file, UPLOAD_DIR)
    except HTTPException as e:
        raise e

    rel_path = os.path.relpath(saved_path, BASE_DIR).replace("\\", "/")
    image_url = f"/{rel_path}"  # e.g. /uploads/patient_images/uuid.jpg

    image_id = os.path.splitext(os.path.basename(saved_path))[0]

    return {
        "status": "stored",
        "image_id": image_id,
        "image_url": image_url
    }


@app.get("/api/graph", response_model=GraphResponse)
def get_graph():
    """
    Demo graph: Radhika (MDR+) -> Ujala (exposed) -> Staff.
    Frontend ab is data se graph draw kar sakta hai.
    """
    nodes = [
        GraphNode(
            id="R",
            x=180,
            y=200,
            label="Radhika",
            sublabel="MDR+ Patient",
            risk="high",
            score=9
        ),
        GraphNode(
            id="U",
            x=380,
            y=120,
            label="Ujala",
            sublabel="Exposed",
            risk="medium",
            score=7
        ),
        GraphNode(
            id="S",
            x=380,
            y=280,
            label="Staff 3A",
            sublabel="Nurse",
            risk="low",
            score=3
        ),
    ]

    edges = [
        GraphEdge(from_="R", to="U", risk="high"),
        GraphEdge(from_="U", to="S", risk="medium"),
    ]

    return GraphResponse(nodes=nodes, edges=edges)


@app.post("/api/run-analysis", response_model=AnalysisResponse)
def run_analysis(req: AnalysisRequest):
    """
    Yahan original system me tum face recognition + MDR logic chalaoge.
    Abhi ke liye hum static demo kar rahe hain:
    - Assume jo patient image aayi hai, woh Radhika hai
    - Handshake video se Radhika -> Ujala exposure detect ho gaya
    """

    # Verify image id exists (optional simple check)
    found = False
    for fname in os.listdir(UPLOAD_DIR):
        if fname.startswith(req.image_id):
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Image ID not found. Upload first.")

    # handshake video ka URL (relative)
    handshake_video_rel = "/static/videos/mdr_handshake.mp4"
    full_video_path = os.path.join(VIDEO_DIR, "mdr_handshake.mp4")
    if not os.path.exists(full_video_path):
        # agar video nahi mila to bhi graceful message
        raise HTTPException(
            status_code=500,
            detail="Handshake video (mdr_handshake.mp4) not found on server. Place it in backend/static/videos/"
        )

    # Fake exposures
    exposures = [
        {
            "source": "Radhika",
            "target": "Ujala",
            "type": "handshake",
            "risk": "high",
            "location": "Ward 3A",
            "time_offset_seconds": 35
        },
        {
            "source": "Ujala",
            "target": "Staff 3A",
            "type": "close proximity",
            "risk": "medium",
            "location": "Nurses station",
            "time_offset_seconds": 120
        }
    ]

    return AnalysisResponse(
        status="processed",
        handshake_video_url=handshake_video_rel,
        exposures=exposures
    )
