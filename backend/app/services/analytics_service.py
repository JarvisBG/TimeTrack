import pandas as pd
from datetime import date
from sqlalchemy.orm import Session
from app.models.models import Employee, Attendance

def get_dashboard_stats(db: Session, target_date: date = None):
    """
    Calcule les KPI du tableau de bord (Taux de présence, retards, etc.) 
    en utilisant Pandas pour une analyse performante.
    """
    if not target_date:
        target_date = date.today()
        
    # 1. Récupérer le nombre total d'employés
    total_employees = db.query(Employee).count()
    
    # Sécurité : si la base est vide
    if total_employees == 0:
        return {
            "total_employes": 0, "presents": 0, "absents": 0, 
            "taux_presence": 0.0, "taux_absence": 0.0, 
            "taux_retard": 0.0, "moyenne_heures": 0.0
        }

    # 2. Récupérer les pointages du jour
    attendances = db.query(Attendance).filter(Attendance.date == target_date).all()
    
    # S'il n'y a aucun pointage aujourd'hui
    if not attendances:
        return {
            "total_employes": total_employees, "presents": 0, "absents": total_employees,
            "taux_presence": 0.0, "taux_absence": 100.0, 
            "taux_retard": 0.0, "moyenne_heures": 0.0
        }

    # 3. Conversion des données SQLAlchemy en DataFrame Pandas
    data = [{
        "employee_id": a.employee_id,
        "retard": a.retard,
        "heures_travaillees": a.heures_travaillees
    } for a in attendances]
    
    df = pd.DataFrame(data)

    # 4. Calculs avec Pandas
    presents = len(df)
    absents = total_employees - presents
    
    # Taux globaux
    taux_presence = (presents / total_employees) * 100
    taux_absence = (absents / total_employees) * 100
    
    # Retards (compter ceux qui ont un retard > 0)
    retards_count = len(df[df['retard'] > 0])
    taux_retard = (retards_count / presents) * 100 if presents > 0 else 0.0
    
    # Moyenne d'heures travaillées (ignorer ceux qui n'ont pas encore pointé le départ : heures = 0)
    df_heures_valides = df[df['heures_travaillees'] > 0]
    moyenne_heures = df_heures_valides['heures_travaillees'].mean() if not df_heures_valides.empty else 0.0

    # 5. Retourner le dictionnaire final formaté
    return {
        "total_employes": total_employees,
        "presents": presents,
        "absents": absents,
        "taux_presence": round(taux_presence, 2),
        "taux_absence": round(taux_absence, 2),
        "taux_retard": round(taux_retard, 2),
        "moyenne_heures": round(moyenne_heures, 2)
    }