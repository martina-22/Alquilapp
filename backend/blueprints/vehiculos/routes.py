from flask import Blueprint, jsonify
from models.vehiculo import Vehiculo

vehiculos_bp = Blueprint("vehiculos_bp", __name__)

@vehiculos_bp.route("/<int:id>", methods=["GET"])
def obtener_vehiculo(id):
    vehiculo = Vehiculo.query.get(id)
    if not vehiculo:
        return jsonify({"error": "Vehículo no encontrado"}), 404
    return jsonify({
        "id": vehiculo.id,
        "modelo": vehiculo.modelo,
        "marca": vehiculo.marca,  
        "precio_dia": vehiculo.precio_dia
    })
