from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, StaffProfile
from backend.schemas import LoginRequest, LoginResponse, StaffProfileOut
from fastapi import Body

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):

    # Fetch user by email
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Compare plain text password (you can add hashing later)
    if user.password != request.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Get associated staff profile
    profile = db.query(StaffProfile).filter(StaffProfile.user_id == user.id).first()

    # Convert SQLAlchemy model → Pydantic schema
    profile_out = StaffProfileOut.model_validate(profile) if profile else None

    
    # ⭐ ADD THIS
    if profile_out:
        profile_out.user_email = user.email

    # Generate fake token (replace with JWT later)
    token = "token_123456789"

    # Return updated full login response
    return LoginResponse(
        success=True,
        message="Login successful",
        token=token,
        role=user.role,
        profile=profile_out
    )

@router.post("/register")
def register(
    full_name: str = Body(...),
    email: str = Body(...),
    password: str = Body(...),
    gender: str = Body(None),
    dob: str = Body(None),
    phone: str = Body(None),
    department: str = Body(None),
    designation: str = Body(None),
    employee_id: str = Body(None),
    shift: str = Body(None),
    abha: str = Body(None),
    emergency_contact: str = Body(None),
    db: Session = Depends(get_db)
):

    # 1️⃣ CHECK IF EMAIL ALREADY USED
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2️⃣ CREATE USER ENTRY
    new_user = User(
        email=email,
        password=password,   # plain text as per your current system
        role="Doctor"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 3️⃣ CREATE STAFF PROFILE
    profile = StaffProfile(
        user_id=new_user.id,
        full_name=full_name,
        gender=gender,
        dob=dob,
        phone=phone,
        department=department,
        designation=designation,
        employee_id=employee_id,
        shift=shift,
        abha=abha,
        emergency_contact=emergency_contact
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "success": True,
        "message": "Account created successfully. Please login."
    }