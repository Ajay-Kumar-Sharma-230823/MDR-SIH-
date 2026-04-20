# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend import notifications
from backend import newsfeed
from backend import chatbot 
from backend.ai_engine import router as ai_router
from backend.MDR_Tracking.photo_tracking import router as mdr_router



from pydantic import BaseModel
import os

from backend.database import Base, engine
import backend.models  # ensures all models are imported so create_all works

from backend import auth
from backend import patients
from backend import lab  # new router

# ensure uploads directory exists and mount it
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", "lab_reports")
os.makedirs(UPLOAD_DIR, exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Amrit Sparsh Backend")
app.include_router(notifications.router)





app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount uploads so files can be served
app.mount("/uploads/lab_reports", StaticFiles(directory=UPLOAD_DIR), name="lab_uploads")
# =======================================================
# MOUNT MDR TRACKING STATIC FILES  (HTML, CSS, JS, Video)
# =======================================================
MDR_STATIC = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          "static", "mdr_tracking")

app.mount(
    "/mdr-tracking-static",
    StaticFiles(directory=MDR_STATIC),
    name="mdr-static"
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(lab.router)
app.include_router(newsfeed.router)
app.include_router(chatbot.router)
app.include_router(ai_router)
app.include_router(mdr_router)

                   
@app.get("/")
def root():
    return {"message": "Backend running"}

class Frame(BaseModel):
    image: str


@app.post("/cv/detect")
async def detect_cough_and_motion(frame: Frame):
    # Placeholder endpoint: actual CV processing lives elsewhere
    # Return a simple JSON response so the route is valid and the app can start.
    return {"detail": "cv detection not implemented"}