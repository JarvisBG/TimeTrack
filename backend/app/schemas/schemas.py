from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, time

# ==========================================
# SCHÉMAS UTILISATEURS (Authentification)
# ==========================================

class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    # Permet à Pydantic de lire les données issues de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHÉMAS EMPLOYÉS
# ==========================================

class EmployeeBase(BaseModel):
    matricule: str
    nom: str
    prenom: str
    telephone: Optional[str] = None
    poste: str
    date_embauche: Optional[date] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    poste: Optional[str] = None
    photo: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    photo: Optional[str] = None
    qr_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHÉMAS PRÉSENCES (Pointage)
# ==========================================

class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    heure_arrivee: time

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    heure_depart: time
    retard: Optional[float] = 0.0
    heures_travaillees: Optional[float] = 0.0

class AttendanceResponse(AttendanceBase):
    id: int
    heure_depart: Optional[time] = None
    retard: float
    heures_travaillees: float

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHÉMAS DE SÉCURITÉ (Tokens JWT)
# ==========================================

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None