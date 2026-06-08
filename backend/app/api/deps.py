from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.models import User
from app.schemas.schemas import TokenData

# Indique à FastAPI où se trouve la route de connexion (que nous créerons plus tard)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    """
    Récupère l'utilisateur connecté à partir de son token JWT.
    Si le token est invalide ou expiré, rejette la requête.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants ou token expiré.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Décodage du token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    # Recherche de l'utilisateur dans la base de données
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dépendance supplémentaire pour vérifier si l'utilisateur est un Administrateur.
    À utiliser sur les routes sensibles (ex: suppression d'employés).
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Privilèges insuffisants. Accès réservé aux administrateurs."
        )
    return current_user