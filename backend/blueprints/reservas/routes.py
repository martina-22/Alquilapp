from flask import Blueprint, request, jsonify
from services.reservas_service import iniciar_reserva, obtener_reservas_por_usuario, obtener_reserva_por_id,cancelar_reserva
from datetime import date, datetime
from models import Reserva
from extensions import db
from sqlalchemy.orm import joinedload
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import Blueprint, jsonify, request, make_response
from models.reserva import Reserva
from models.usuario import Usuario
from models.vehiculo import Vehiculo
from models.sucursal import Sucursal
from models.politica_cancelacion import PoliticaCancelacion
from flask_cors import CORS

from services.mailer import send_email_notification
reservas_bp = Blueprint("reservas", __name__)
CORS(reservas_bp, supports_credentials=True, origins=["http://localhost:5173"])

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity


@reservas_bp.route('/ver', methods=['GET', 'OPTIONS'])
def ver_reservas():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    return ver_reservas_protegido()


@jwt_required()
def ver_reservas_protegido():
    user_id = get_jwt_identity()

    # 💡 Agregamos joinedload para traer el estado junto con la reserva
    reservas = (
        Reserva.query
        .options(joinedload(Reserva.estado))
        .filter_by(usuario_id=user_id)
        .all()
    )

    response = jsonify([reserva.to_dict() for reserva in reservas])
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response


@reservas_bp.route("/iniciar", methods=["POST", "OPTIONS"])
def iniciar_reserva_endpoint():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

    try:
        data = request.get_json()

        # ✅ Usamos el servicio que contiene la lógica de validación y estado
        reserva_creada = iniciar_reserva(data)

        response = jsonify(reserva_creada.to_dict())
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

@reservas_bp.route('/simular-pago/<int:reserva_id>', methods=['POST'])
def simular_pago(reserva_id):
    # Carga la reserva y sus relaciones CON joinedload, pero SIN Reserva.estado
    # La imagen de la DB muestra 'estado' como una columna en 'reserva'
    reserva = Reserva.query.options(
        joinedload(Reserva.usuario),
        joinedload(Reserva.vehiculo).joinedload(Vehiculo.politica),
        joinedload(Reserva.vehiculo).joinedload(Vehiculo.sucursal)
        # ELIMINA joinedload(Reserva.estado) de aquí, ya que el error era por esta línea
    ).get(reserva_id)

    if not reserva:
        return jsonify({"message": "Reserva no encontrada"}), 404

    # Usa el campo 'pagada' para la condición principal
    # Y el campo 'estado' (string) para actualizar el estado textual en la misma tabla
    if not reserva.pagada: # Si el campo 'pagada' es False (o 0)
        reserva.pagada = True # Marca como pagada
        reserva.estado_id = 2

        db.session.commit()

        # --- Recopilar datos para la notificación ---
        reserva_data = {
            'id': reserva.id,
            'fecha_inicio': reserva.fecha_inicio.strftime('%d/%m/%Y') if reserva.fecha_inicio else 'N/A',
            'fecha_fin': reserva.fecha_fin.strftime('%d/%m/%Y') if reserva.fecha_fin else 'N/A',
            'monto_total': f"${reserva.monto_total:.2f}",
            'estado_pago': "Confirmado", #  Estado de pago fijo para la simulación

            'usuario_nombre': reserva.usuario.nombre if reserva.usuario else 'N/A',
            'usuario_apellido': reserva.usuario.apellido if reserva.usuario else 'N/A',
            'usuario_email': reserva.usuario.email if reserva.usuario else 'N/A',

            'vehiculo_marca': reserva.vehiculo.marca if reserva.vehiculo else 'N/A',
            'vehiculo_modelo': reserva.vehiculo.modelo if reserva.vehiculo else 'N/A',
            'vehiculo_anio': reserva.vehiculo.anio if reserva.vehiculo else 'N/A',
            'vehiculo_patente': reserva.vehiculo.patente if reserva.vehiculo else 'N/A',
            'vehiculo_categoria': reserva.vehiculo.categoria if reserva.vehiculo else 'N/A',
            'vehiculo_precio_dia': f"${reserva.vehiculo.precio_dia:.2f}" if reserva.vehiculo else 'N/A',

            'sucursal_nombre': reserva.vehiculo.sucursal.nombre if reserva.vehiculo and reserva.vehiculo.sucursal else 'N/A',
            'sucursal_direccion': reserva.vehiculo.sucursal.direccion if reserva.vehiculo and reserva.vehiculo.sucursal else 'N/A',

            'politica_descripcion': reserva.vehiculo.politica.descripcion if reserva.vehiculo and reserva.vehiculo.politica else 'N/A',
            'politica_penalizacion_dias': reserva.vehiculo.politica.penalizacion_dias if reserva.vehiculo and reserva.vehiculo.politica else 'N/A',
            'politica_porcentaje_penalizacion': f"{reserva.vehiculo.politica.porcentaje_penalizacion:.0f}%" if reserva.vehiculo and reserva.vehiculo.politica else 'N/A',
        }

        # --- Construir el cuerpo del correo (HTML) ---
        email_body = f"""
        <html>
        <body>
            <h2>¡Tu reserva ha sido confirmada con éxito!</h2>
            <p>Estimado/a {reserva_data['usuario_nombre']} {reserva_data['usuario_apellido']},</p>
            <p>Nos complace informarte que tu reserva ha sido confirmada y pagada.</p>

            <h3>Detalles de tu Reserva:</h3>
            <ul>
                <li><strong>ID de Reserva:</strong> {reserva_data['id']}</li>
                <li><strong>Fecha de Inicio:</strong> {reserva_data['fecha_inicio']}</li>
                <li><strong>Fecha de Fin:</strong> {reserva_data['fecha_fin']}</li>
                <li><strong>Monto Total Pagado:</strong> {reserva_data['monto_total']}</li>
                <li><strong>Estado del Pago:</strong> {reserva_data['estado_pago']}</li>
            </ul>

            <h3>Detalles del Vehículo:</h3>
            <ul>
                <li><strong>Marca:</strong> {reserva_data['vehiculo_marca']}</li>
                <li><strong>Modelo:</strong> {reserva_data['vehiculo_modelo']}</li>
                <li><strong>Año:</strong> {reserva_data['vehiculo_anio']}</li>
                <li><strong>Patente:</strong> {reserva_data['vehiculo_patente']}</li>
                <li><strong>Categoría:</strong> {reserva_data['vehiculo_categoria']}</li>
                <li><strong>Precio por Día:</strong> {reserva_data['vehiculo_precio_dia']}</li>
            </ul>

            <h3>Detalles de la Sucursal de Retiro/Devolución:</h3>
            <ul>
                <li><strong>Nombre:</strong> {reserva_data['sucursal_nombre']}</li>
                <li><strong>Dirección:</strong> {reserva_data['sucursal_direccion']}</li>
                </ul>

            <h3>Política de Cancelación:</h3>
            <ul>
                <li><strong>Descripción:</strong> {reserva_data['politica_descripcion']}</li>
                <li><strong>Días de penalización:</strong> {reserva_data['politica_penalizacion_dias']}</li>
                <li><strong>Porcentaje de penalización:</strong> {reserva_data['politica_porcentaje_penalizacion']}</li>
            </ul>

            <p>Gracias por tu confianza. ¡Que tengas un excelente viaje!</p>
            <p>Atentamente,</p>
            <p>El equipo de TuAlquilerDeAutos</p>
        </body>
        </html>
        """

        # --- Enviar la notificación por correo ---
        if reserva_data['usuario_email'] and send_email_notification(
            reserva_data['usuario_email'],
            f"Confirmación de Reserva #{reserva_data['id']} - TuAlquilerDeAutos",
            email_body
        ):
            return jsonify({"message": f"Reserva {reserva_id} marcada como pagada. Notificación enviada."}), 200
        else:
            return jsonify({"message": f"Reserva {reserva_id} marcada como pagada, pero falló el envío de la notificación por correo."}), 200
    else:
        return jsonify({"message": "La reserva ya está pagada o no está en estado pendiente de pago para esta simulación."}), 400