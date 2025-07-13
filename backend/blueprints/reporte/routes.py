from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import joinedload
from datetime import datetime

from models.reserva import Reserva
from flask_cors import CORS

reporte_bp = Blueprint('reporte', __name__)
CORS(reporte_bp, supports_credentials=True, origins=["http://localhost:5173"])

@reporte_bp.route('/vehiculos-reservados-por-fecha', methods=['GET', 'OPTIONS'])
def vehiculos_reservados_opciones():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    return vehiculos_reservados_protegido()

@jwt_required()
def vehiculos_reservados_protegido():
    try:
        desde_str = request.args.get('desde')
        hasta_str = request.args.get('hasta')
        
        if not desde_str or not hasta_str:
            return jsonify({"error": "Parámetros 'desde' y 'hasta' son requeridos"}), 400
        
        desde = datetime.strptime(desde_str, "%Y-%m-%d")
        hasta = datetime.strptime(hasta_str, "%Y-%m-%d")
        
        reservas = Reserva.query.options(joinedload(Reserva.vehiculo)).filter(
            Reserva.fecha_inicio >= desde,
            Reserva.fecha_inicio <= hasta
        ).all()
        
        vehiculos_dict = {}
        for reserva in reservas:
            v = reserva.vehiculo
            if v and v.id not in vehiculos_dict:
                vehiculos_dict[v.id] = {
                    "id": v.id,
                    "marca": v.marca,
                    "modelo": v.modelo,
                    "patente": v.patente,
                    "anio": v.anio,
                    "categoria": v.categoria,
                    "precio_dia": v.precio_dia,
                    "fecha_creacion": v.fecha_creacion.strftime("%Y-%m-%d") if v.fecha_creacion else None
                }

        response = jsonify({"vehiculos": list(vehiculos_dict.values())})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
