from datetime import datetime, time, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.models import Employee, Attendance

# --- CONFIGURATION MÉTIER ---
# Heure de début de journée standard (ex: 08h00)
STANDARD_START_TIME = time(8, 0)
# Délai minimum entre une arrivée et un départ pour éviter les doubles scans accidentels (ex: 5 minutes)
MINIMUM_MINUTES_BETWEEN_SCANS = 5

def calculate_delay(arrivee: time) -> float:
    """Calcule le retard en heures décimales (ex: 1.5 pour 1h30 de retard)."""
    dt_start = datetime.combine(datetime.today(), STANDARD_START_TIME)
    dt_arrivee = datetime.combine(datetime.today(), arrivee)
    
    if dt_arrivee > dt_start:
        delta = dt_arrivee - dt_start
        return round(delta.total_seconds() / 3600.0, 2)
    return 0.0

def calculate_work_hours(arrivee: time, depart: time) -> float:
    """Calcule le temps de travail en heures décimales."""
    dt_arrivee = datetime.combine(datetime.today(), arrivee)
    dt_depart = datetime.combine(datetime.today(), depart)
    
    if dt_depart > dt_arrivee:
        delta = dt_depart - dt_arrivee
        return round(delta.total_seconds() / 3600.0, 2)
    return 0.0

def process_scan(db: Session, qr_data: str):
    """
    Logique principale exécutée lors du scan d'un QR Code.
    Détermine s'il s'agit d'une arrivée ou d'un départ.
    """
    # 1. Identifier l'employé à partir des données du QR Code
    employee = db.query(Employee).filter(Employee.qr_code == qr_data).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="QR Code invalide ou employé introuvable."
        )

    now = datetime.now()
    today = now.date()
    current_time = now.time()

    # 2. Chercher s'il y a déjà un pointage pour cet employé aujourd'hui
    attendance = db.query(Attendance).filter(
        Attendance.employee_id == employee.id, 
        Attendance.date == today
    ).first()

    # CAS A : Aucun pointage aujourd'hui -> C'est une ARRIVÉE
    if not attendance:
        retard_heures = calculate_delay(current_time)
        
        new_attendance = Attendance(
            employee_id=employee.id,
            date=today,
            heure_arrivee=current_time,
            retard=retard_heures
        )
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)
        
        return {
            "action": "Arrivée",
            "employee": f"{employee.prenom} {employee.nom}",
            "time": current_time.strftime("%H:%M:%S"),
            "message": "Arrivée enregistrée avec succès."
        }

    # CAS B : Un pointage existe, mais pas d'heure de départ -> C'est un DÉPART
    if attendance.heure_depart is None:
        # Sécurité anti-doublon (vérifier que l'arrivée ne vient pas tout juste d'avoir lieu)
        dt_arrivee = datetime.combine(today, attendance.heure_arrivee)
        if now < dt_arrivee + timedelta(minutes=MINIMUM_MINUTES_BETWEEN_SCANS):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pointage trop rapproché. Veuillez patienter avant d'enregistrer votre départ."
            )

        attendance.heure_depart = current_time
        attendance.heures_travaillees = calculate_work_hours(attendance.heure_arrivee, current_time)
        
        db.commit()
        db.refresh(attendance)
        
        return {
            "action": "Départ",
            "employee": f"{employee.prenom} {employee.nom}",
            "time": current_time.strftime("%H:%M:%S"),
            "heures_travaillees": attendance.heures_travaillees,
            "message": "Départ enregistré avec succès."
        }

    # CAS C : L'heure de départ est déjà enregistrée
    # Si l'employé scanne à nouveau en fin de journée, on met à jour son heure de départ (il est parti plus tard)
    attendance.heure_depart = current_time
    attendance.heures_travaillees = calculate_work_hours(attendance.heure_arrivee, current_time)
    
    db.commit()
    db.refresh(attendance)
    
    return {
        "action": "Mise à jour Départ",
        "employee": f"{employee.prenom} {employee.nom}",
        "time": current_time.strftime("%H:%M:%S"),
        "heures_travaillees": attendance.heures_travaillees,
        "message": "Heure de départ mise à jour."
    }

def get_today_attendances(db: Session):
    """Récupère tous les pointages du jour."""
    today = datetime.now().date()
    return db.query(Attendance).filter(Attendance.date == today).all()