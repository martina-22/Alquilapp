from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.usuario import Usuario
from extensions import db

usuarios_bp = Blueprint("usuarios_bp", __name__)


@usuarios_bp.route("/<int:id>", methods=["GET"])
def obtener_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "rol": usuario.rol,
    })


@usuarios_bp.route("/", methods=["GET"])
def listar_usuarios():
    usuarios = Usuario.query.all()
    usuarios_data = []
    for usuario in usuarios:
        usuarios_data.append({
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "email": usuario.email,
            "telefono": usuario.telefono,
            "activo": usuario.activo,
            "rol": usuario.rol,
        })
    return jsonify({"usuarios": usuarios_data}), 200


@usuarios_bp.route("/<int:id>", methods=["DELETE"])
# @jwt_required() --> Descomentar para cuando el admin tenga que eliminar un perfil
def eliminar_perfil(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    usuario.activo = False
    db.session.commit()
    return jsonify({"message": "Usuario eliminado con éxito."}), 200


@usuarios_bp.route("/<int:id>/restore", methods=["POST"])
# @jwt_required() --> Descomentar para cuando el admin tenga que restaurar un perfil
def restaurar_perfil(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    usuario.activo = True
    db.session.commit()
    return jsonify({"message": "Usuario eliminado con éxito."}), 200
