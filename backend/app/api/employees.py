from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin
from app.schemas import schemas
from app.services import employee_service, qr_service

router = APIRouter()

@router.post("/", response_model=schemas.EmployeeResponse)
def create_new_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db), current_user = Depends(get_current_admin)):
    """Crée un employé (Réservé aux admins)."""
    return employee_service.create_employee(db=db, employee=employee)

@router.get("/", response_model=List[schemas.EmployeeResponse])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Récupère la liste des employés."""
    return employee_service.get_employees(db, skip=skip, limit=limit)

@router.get("/{employee_id}/qrcode")
def get_employee_qr_code(employee_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Génère et renvoie l'image du QR Code d'un employé à la volée."""
    employee = employee_service.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employé introuvable")
    
    # On récupère l'image générée en mémoire (BytesIO)
    img_buffer = qr_service.generate_qr_image(employee.qr_code)
    
    # StreamingResponse permet d'envoyer l'image directement au navigateur Web
    return StreamingResponse(img_buffer, media_type="image/png")