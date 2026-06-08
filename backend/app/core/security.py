from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# Clé secrète pour signer les tokens (À garder secrète en production, idéalement dans un .env)
SECRET_KEY = "TimeTrack_Super_Secret_Key_Change_Me_In_Production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600 # Le token expire après 10 heures (une journée de travail)

# Configuration de Passlib pour utiliser l'algorithme de hachage bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe en clair correspond au hash de la base de données."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Génère un hash sécurisé à partir d'un mot de passe en clair."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Génère le Token JWT contenant les informations de l'utilisateur."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    # Création du token encodé
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt