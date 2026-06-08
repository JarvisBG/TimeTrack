import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.models import Employee
from app.schemas.schemas import EmployeeCreate, EmployeeUpdate

def get_employee(db: Session, employee_id: int):
    """Récupère un employé spécifique par son ID."""
    return db.query(Employee).filter(Employee.id == employee_id).first()

def get_employee_by_matricule(db: Session, matricule: str):
    """Vérifie si un matricule existe déjà."""
    return db.query(Employee).filter(Employee.matricule == matricule).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100):
    """Récupère la liste de tous les employés (avec pagination)."""
    return db.query(Employee).offset(skip).limit(limit).all()

def create_employee(db: Session, employee: EmployeeCreate):
    """Création d'un employé et génération de sa donnée QR unique."""
    # 1. Vérifier que le matricule est unique
    if get_employee_by_matricule(db, matricule=employee.matricule):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Un employé avec ce matricule existe déjà."
        )
    
    # 2. Générer l'identifiant unique pour le QR Code
    # Format : EMP-[matricule]-[chaine_aleatoire]
    unique_qr_data = f"EMP-{employee.matricule}-{uuid.uuid4().hex[:6].upper()}"

    # 3. Créer l'employé
    db_employee = Employee(
        matricule=employee.matricule,
        nom=employee.nom,
        prenom=employee.prenom,
        telephone=employee.telephone,
        poste=employee.poste,
        date_embauche=employee.date_embauche,
        qr_code=unique_qr_data  # On stocke la chaîne unique
    )
    
    # 4. Sauvegarder dans la base de données
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, employee_id: int, employee_update: EmployeeUpdate):
    """Mise à jour des informations d'un employé."""
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employé introuvable.")

    # Mettre à jour uniquement les champs fournis (exclude_unset=True)
    update_data = employee_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_employee, key, value)

    db.commit()
    db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: int):
    """Suppression d'un employé."""
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employé introuvable.")
    
    db.delete(db_employee)
    db.commit()
    return {"message": "Employé supprimé avec succès."}