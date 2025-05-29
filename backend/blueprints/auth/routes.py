# blueprints/auth/routes.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity # noqa
from models.usuario import Usuario
from extensions import db


auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/ping')
def ping_auth():
    return "Auth activo"


@auth_bp.route('/profile', methods=['GET'])
# @jwt_required()
def profile():
    user_id = 1  # get_jwt_identity()  # obtener el ID de usuario autenticado
    # Por ahora, usamos un ID fijo para pruebas
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({
        "nombre": user.nombre,
        "apellido": user.apellido,
        "email": user.email,
        "dni": user.dni,
        "telefono": user.telefono,
        "fecha_nacimiento": user.fecha_nacimiento.isoformat()
    })


@auth_bp.route('/profile', methods=['PUT'])
# @jwt_required()
def update_profile():
    user_id = 1  # usar get_jwt_identity()
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()

    # Obtener el email del request (si se proporciona), sino usar el actual
    new_email = data.get('email', user.email)

    # 2. Verificar si el email ha cambiado y si el nuevo email ya está en uso por otro usuario
    if new_email and new_email != user.email:
        # Buscar si existe OTRO usuario con el nuevo email
        existing_user_with_new_email = Usuario.query.filter(
            Usuario.email == new_email,
            Usuario.id != user_id # Excluir al usuario actual
        ).first()

        if existing_user_with_new_email:
            return jsonify({"message": "Este email ya está registrado por otro usuario."}), 409 # 409 Conflict

    user.nombre = data.get('nombre', user.nombre)
    user.apellido = data.get('apellido', user.apellido)
    user.email = data.get('email', user.email)
    user.dni = data.get('dni', user.dni)
    user.telefono = data.get('telefono', user.telefono)
    user.fecha_nacimiento = data.get('fecha_nacimiento', user.fecha_nacimiento)
    db.session.commit()
    return jsonify({"message": "Perfil actualizado correctamente"})
