from flask import Blueprint, request, jsonify, session
from datetime import datetime, date
from models.usuario import Usuario
from flask_mail import Message
from extensions import mail
import bcrypt
import random
from extensions import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/ping')
def ping_auth():
    return "Auth activo"

def calcular_edad(fecha_nac):
    today = date.today()
    return today.year - fecha_nac.year - ((today.month, today.day) < (fecha_nac.month, fecha_nac.day))

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Correo ya registrado en el sistema'}), 400

    try:
        fecha_nac = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Formato de fecha inválido, debe ser YYYY-MM-DD'}), 400

    if calcular_edad(fecha_nac) < 18:
        return jsonify({'message': 'El usuario debe ser mayor de edad'}), 400

    if len(data['contrasena']) < 8:
        return jsonify({'message': 'La contraseña debe tener al menos 8 caracteres'}), 400

    hashed_password = bcrypt.hashpw(data['contrasena'].encode('utf-8'), bcrypt.gensalt())

    nuevo_usuario = Usuario(
        nombre=data['nombre'],
        apellido=data['apellido'],
        dni=data['dni'],
        fecha_nacimiento=fecha_nac,
        telefono=data['telefono'],
        email=data['email'],
        contrasena=hashed_password.decode('utf-8'),
        es_admin=False,
        es_empleado=False
    )

    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({'message': 'Usuario registrado con éxito'}), 201

codigos_2fa = {}

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = Usuario.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Los datos ingresados son incorrectos'}), 404

    if not bcrypt.checkpw(password.encode('utf-8'), user.contrasena.encode('utf-8')):
        return jsonify({'message': 'Los datos ingresados son incorrectos'}), 401

    if user.es_admin:
        codigo = str(random.randint(1000, 9999))
        codigos_2fa[email] = codigo
        print(f"[DEBUG] Código de verificación enviado a {email}: {codigo}")  # 🔴 eliminar esto

        # ✅ Enviar mail a dirección estática
        msg = Message(
            subject="Código de verificación",
            recipients=["anitaormellob@gmail.com"],  # dirección fija
            body=f"El código de verificación es: {codigo}"
        )
        mail.send(msg)

        return jsonify({
            "message": "Se ha enviado un código de verificación",
            "require_2fa": True
        }), 200

    session['usuario_id'] = user.id
    return jsonify({'message': 'Inicio de sesión exitoso'}), 200

@auth_bp.route('/verificar-2fa', methods=['POST'])
def verificar_2fa():
    data = request.get_json()
    email = data.get('email')
    codigo_ingresado = data.get('codigo')

    codigo_valido = codigos_2fa.get(email)
    if not codigo_valido:
        return jsonify({"message": "No se ha solicitado código de verificación para este usuario"}), 400

    if codigo_ingresado != codigo_valido:
        return jsonify({"message": "Código de verificación incorrecto"}), 401

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    del codigos_2fa[email]
    session['usuario_id'] = usuario.id
    return jsonify({"message": "Inicio de sesión exitoso"}), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('usuario_id', None)
    return jsonify({'message': 'Sesión cerrada exitosamente'}), 200

@auth_bp.route('/me', methods=['GET'])
def me():
    usuario_id = session.get('usuario_id')
    if not usuario_id:
        return jsonify({'message': 'No hay sesión activa'}), 401

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({'message': 'Usuario no encontrado'}), 404

    return jsonify({
        'email': usuario.email,
        'es_admin': usuario.es_admin,
        'es_empleado': usuario.es_empleado
    }), 200
