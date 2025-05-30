from flask import Blueprint, jsonify
from models.sucursal import Sucursal

sucursales_bp = Blueprint('sucursales', __name__)

@sucursales_bp.route('/sucursales', methods=['GET'])
def obtener_sucursales():
    sucursales = Sucursal.query.all()
    data = [
        {"id": s.id, "nombre": s.nombre, "localidad": s.localidad}
        for s in sucursales
    ]
    return jsonify(data)
