from flask import Blueprint, request, jsonify
from services.reservas_service import iniciar_reserva

reservas_bp = Blueprint("reservas", __name__)

@reservas_bp.route("/iniciar", methods=["POST"])
def crear_reserva():
    data = request.get_json()
    try:
        reserva = iniciar_reserva(data)
        return jsonify({
            "id": reserva.id,
            "estado": "pendiente",
            "pagada": reserva.pagada,
            "monto_total": reserva.monto_total
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400