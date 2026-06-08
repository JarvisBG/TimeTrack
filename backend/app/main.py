from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base

# Import des différents routeurs
from app.api import auth, employees, attendance, analytics

# Création des tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TimeTrack API",
    description="API de gestion des présences par QR Code",
    version="1.0.0"
)

# Configuration CORS (Indispensable pour React)
origins = [
    "http://localhost:5173", # Port par défaut de Vite/React
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Autorise GET, POST, PUT, DELETE...
    allow_headers=["*"], # Autorise l'envoi de Tokens JWT
)

# Intégration des routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentification"])
app.include_router(employees.router, prefix="/api/employees", tags=["Employés"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Pointages"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analyses & Rapports"])

@app.get("/")
def read_root():
    return {"message": "L'API TimeTrack est en ligne et sécurisée !"}