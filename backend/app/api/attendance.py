from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas import schemas
from app.services import attendance_service

router = APIRouter()

@router.post("/scan")
def scan_qr_code(qr_data: dict, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Traite le scan d'un QR code. 
    Attend un JSON du type : {"qr_code": "EMP-123-ABCDEF"}
    """
    code = qr_data.get("qr_code")
    return attendance_service.process_scan(db, qr_data=code)

@router.get("/today", response_model=List[schemas.AttendanceResponse])
def read_today_attendances(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Récupère les pointages d'aujourd'hui pour l'historique."""
    return attendance_service.get_today_attendances(db)