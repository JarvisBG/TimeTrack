from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.models import User
from app.schemas.schemas import Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    """Endpoint de connexion pour obtenir le Token JWT."""
    # Chercher l'utilisateur
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # Vérifier l'utilisateur et le mot de passe
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Créer le token contenant le nom et le rôle
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    
    return {"access_token": access_token, "token_type": "bearer"}