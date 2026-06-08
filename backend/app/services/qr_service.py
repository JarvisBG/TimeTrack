import qrcode
from io import BytesIO

def generate_qr_image(data: str) -> BytesIO:
    """
    Génère une image QR code en mémoire (BytesIO) à partir d'une chaîne de caractères.
    Cette méthode évite de stocker physiquement des images sur le disque du serveur.
    """
    # Configuration du QR Code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H, # Haute correction pour faciliter le scan
        box_size=10,
        border=4,
    )
    
    # Ajout de la donnée unique de l'employé
    qr.add_data(data)
    qr.make(fit=True)

    # Création de l'image (Noir sur fond blanc)
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Sauvegarde de l'image dans un buffer en mémoire (comme un fichier virtuel)
    buf = BytesIO()
    img.save(buf, format="PNG")
    
    # On remet le curseur au début du fichier virtuel pour pouvoir le lire
    buf.seek(0)
    
    return buf