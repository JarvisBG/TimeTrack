import io
from datetime import date
from sqlalchemy.orm import Session
import openpyxl
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from app.models.models import Attendance

def generate_daily_excel(db: Session, target_date: date) -> io.BytesIO:
    """Génère un fichier Excel des présences du jour."""
    attendances = db.query(Attendance).filter(Attendance.date == target_date).all()
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"Présences_{target_date.strftime('%Y-%m-%d')}"
    
    # En-têtes des colonnes
    headers = ["Matricule", "Nom", "Prénom", "Heure Arrivée", "Heure Départ", "Retard (h)", "Heures Travaillées"]
    ws.append(headers)
    
    # Remplissage des données
    for att in attendances:
        emp = att.employee
        ws.append([
            emp.matricule,
            emp.nom,
            emp.prenom,
            att.heure_arrivee.strftime("%H:%M") if att.heure_arrivee else "",
            att.heure_depart.strftime("%H:%M") if att.heure_depart else "Non pointé",
            att.retard,
            att.heures_travaillees
        ])
        
    # Sauvegarde en mémoire
    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)
    return stream

def generate_daily_pdf(db: Session, target_date: date) -> io.BytesIO:
    """Génère un rapport PDF stylisé des présences du jour."""
    attendances = db.query(Attendance).filter(Attendance.date == target_date).all()
    
    stream = io.BytesIO()
    doc = SimpleDocTemplate(stream, pagesize=letter)
    elements = []
    
    # Styles de base
    styles = getSampleStyleSheet()
    title = Paragraph(f"<b>Rapport Journalier des Présences - {target_date.strftime('%d/%m/%Y')}</b>", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 20)) # Espace vide
    
    # Données du tableau (La première ligne = les en-têtes)
    data = [["Matricule", "Employé", "Arrivée", "Départ", "Retard", "Heures"]]
    
    for att in attendances:
        emp = att.employee
        data.append([
            emp.matricule,
            f"{emp.nom} {emp.prenom}",
            att.heure_arrivee.strftime("%H:%M") if att.heure_arrivee else "",
            att.heure_depart.strftime("%H:%M") if att.heure_depart else "-",
            f"{att.retard} h" if att.retard > 0 else "0",
            f"{att.heures_travaillees} h"
        ])
        
    # Création et stylisation du tableau avec ReportLab
    table = Table(data, colWidths=[80, 150, 70, 70, 60, 70])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e3a8a")), # Bleu foncé moderne
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f3f4f6")), # Gris clair
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    # Retour au début du fichier virtuel
    stream.seek(0)
    return stream