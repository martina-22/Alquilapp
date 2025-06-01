from flask import Blueprint, request, jsonify
from services.reservas_service import iniciar_reserva, obtener_reservas_por_usuario, obtener_reserva_por_id,cancelar_reserva
from datetime import date, datetime
from models import Reserva
from extensions import db
from sqlalchemy.orm import joinedload
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

@reservas_bp.route("/ver/<int:usuario_id>", methods=["GET"])
def ver_reservas(usuario_id):
    reservas = Reserva.query.filter_by(usuario_id=usuario_id).all()
    return jsonify([
        {
            "id": r.id,
            "vehiculo_id": r.vehiculo_id,
            "fecha_inicio": r.fecha_inicio.isoformat(),
            "fecha_fin": r.fecha_fin.isoformat(),
            "hora_retiro": r.hora_retiro.strftime("%H:%M") if r.hora_retiro else None,
            "hora_devolucion": r.hora_devolucion.strftime("%H:%M") if r.hora_devolucion else None,
            "estado_id": r.estado_id,
            "estado_nombre": r.estado.nombre if r.estado else "Desconocido",
            "pagada": r.pagada,
            "monto_total": r.monto_total
        }
        for r in reservas
    ])




@reservas_bp.route("/detalle/<int:reserva_id>", methods=["GET"])
def ver_detalle_reserva(reserva_id):
    reserva = obtener_reserva_por_id(reserva_id)
    if not reserva:
        return jsonify({"error": "Reserva no encontrada"}), 404

    reserva_serializada = {
        "id": reserva.id,
        "usuario_id": reserva.usuario_id,
        "vehiculo_id": reserva.vehiculo_id,
        "fecha_inicio": reserva.fecha_inicio.isoformat(),
        "fecha_fin": reserva.fecha_fin.isoformat(),
        "estado_id": reserva.estado_id,
        "pagada": reserva.pagada,
        "monto_total": reserva.monto_total
    }

    return jsonify(reserva_serializada)



@reservas_bp.route("/cancelar/<int:reserva_id>", methods=["PUT"])
def cancelar_reserva(reserva_id):
    reserva = Reserva.query.options(joinedload(Reserva.estado)).get(reserva_id)
    if not reserva:
        return jsonify({"error": "Reserva no encontrada"}), 404

    hoy = date.today()
    if reserva.estado_id == 3:
        return jsonify({"error": "La reserva ya está cancelada"}), 400

    if reserva.fecha_inicio <= hoy:
        return jsonify({"error": "No se puede cancelar una reserva que ya comenzó o finalizó"}), 400

    reserva.estado_id = 3  # Cancelada
    db.session.commit()

    return jsonify({
        "id": reserva.id,
        "vehiculo_id": reserva.vehiculo_id,
        "fecha_inicio": reserva.fecha_inicio.isoformat(),
        "fecha_fin": reserva.fecha_fin.isoformat(),
        "estado_id": reserva.estado_id,
        "estado_nombre": reserva.estado.nombre,
        "pagada": reserva.pagada,
        "monto_total": reserva.monto_total
    })



def obtener_reservas_por_usuario(usuario_id):
    return (
        Reserva.query
        .options(joinedload(Reserva.estado))  # Trae el objeto estado con su nombre
        .filter_by(usuario_id=usuario_id)
        .all()
    )
