from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date

from app.core.database import get_db
from app.api.deps import get_current_user
from app.services import analytics_service, report_service

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Récupère les statistiques Pandas pour le tableau de bord React."""
    return analytics_service.get_dashboard_stats(db)

@router.get("/reports/daily/excel")
def download_daily_excel(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Télécharge le rapport Excel du jour."""
    file_buffer = report_service.generate_daily_excel(db, date.today())
    return StreamingResponse(
        file_buffer, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=Presences_{date.today()}.xlsx"}
    )

@router.get("/reports/daily/pdf")
def download_daily_pdf(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Télécharge le rapport PDF stylisé du jour."""
    file_buffer = report_service.generate_daily_pdf(db, date.today())
    return StreamingResponse(
        file_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Rapport_{date.today()}.pdf"}
    )