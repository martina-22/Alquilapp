from flask import Blueprint, jsonify
from models.usuario import Usuario

usuarios_bp = Blueprint("usuarios_bp", __name__)

@usuarios_bp.route("/<int:id>", methods=["GET"])
def obtener_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido
    })
