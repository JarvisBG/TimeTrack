from app.core.database import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash

def create_super_admin():
    db = SessionLocal()
    try:
        # Vérifie si l'utilisateur admin existe déjà
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            print("L'utilisateur 'admin' existe déjà dans la base de données.")
            return

        # Création du nouvel administrateur
        # Mot de passe en clair choisi : admin123
        hashed_password = get_password_hash("admin123")
        new_admin = User(
            username="admin", 
            password_hash=hashed_password, 
            role="admin"
        )
        
        db.add(new_admin)
        db.commit()
        print("✅ Succès ! L'utilisateur 'admin' a été créé.")
        print("👉 Identifiant : admin")
        print("👉 Mot de passe : admin123")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création : {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()