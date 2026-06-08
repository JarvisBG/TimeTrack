from sqlalchemy import Column, Integer, String, Date, Time, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # 'admin' ou 'gestionnaire'

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    matricule = Column(String, unique=True, index=True, nullable=False)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    telephone = Column(String)
    poste = Column(String, nullable=False)
    date_embauche = Column(Date)
    photo = Column(String, nullable=True) # Chemin ou URL de la photo
    qr_code = Column(String, unique=True) # Chaine unique encodée dans le QR

    attendances = relationship("Attendance", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    heure_arrivee = Column(Time, nullable=False)
    heure_depart = Column(Time, nullable=True)
    retard = Column(Float, default=0.0) # Retard en minutes ou heures
    heures_travaillees = Column(Float, default=0.0)

    employee = relationship("Employee", back_populates="attendances")