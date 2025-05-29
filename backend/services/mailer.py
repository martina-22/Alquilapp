# utils/mailer.py

from flask_mail import Message
from extensions import mail
from flask import current_app # Acceder a la configuración de la aplicación

def send_email_notification(to_email, subject, body_html):
    msg = Message(
        subject,
        recipients=[to_email],
        html=body_html,
        sender=current_app.config['MAIL_DEFAULT_SENDER'] # Remitente por defecto configurado
    )
    try:
        mail.send(msg)
        print(f"Correo enviado a {to_email} con asunto: {subject}")
        return True
    except Exception as e:
        print(f"ERROR al enviar correo a {to_email}: {e}")
        return False