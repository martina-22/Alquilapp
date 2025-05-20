from flask import Blueprint

vehiculos_bp = Blueprint('vehiculos', __name__)

@vehiculos_bp.route('/ping')
def ping_vehiculos():
    return "Vehículos activo"
