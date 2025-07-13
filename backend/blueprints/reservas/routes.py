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
from models.reserva_extra import ReservaExtra
from models.politica_cancelacion import PoliticaCancelacion
from flask_cors import CORS, cross_origin
import traceback
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

def actualizar_estado_si_corresponde(reserva):
    if reserva.fecha_fin < datetime.now() and reserva.estado != 'finalizada':
        reserva.estado = 'finalizada'
        db.session.commit()
        
@jwt_required()
def ver_reservas_protegido():
    user_id = get_jwt_identity()

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
@reservas_bp.route('/todas', methods=['GET', 'OPTIONS'])
def ver_todas_las_reservas():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    return ver_todas_las_reservas_protegido()

@jwt_required()
def ver_todas_las_reservas_protegido():
    reservas = (
        Reserva.query
        .options(joinedload(Reserva.usuario), joinedload(Reserva.vehiculo), joinedload(Reserva.estado))
        .order_by(Reserva.estado_id.asc(), Reserva.fecha_inicio.desc())
        .all()
    )

    resultado = [reserva.to_dict() for reserva in reservas]

    response = jsonify(resultado)
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200
@reservas_bp.route('/filtrar', methods=['GET', 'OPTIONS'])
def filtrar_reservas_por_estado():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    return filtrar_reservas_por_estado_protegido()

@jwt_required()
def filtrar_reservas_por_estado_protegido():
    estado_id = request.args.get("estado_id")

    if not estado_id:
        return jsonify({"error": "Debe proporcionar un estado_id en la query string"}), 400

    reservas = (
        Reserva.query
        .options(joinedload(Reserva.usuario), joinedload(Reserva.vehiculo), joinedload(Reserva.estado))
        .filter_by(estado_id=int(estado_id))
        .order_by(Reserva.fecha_inicio.desc())
        .all()
    )

    resultado = [reserva.to_dict() for reserva in reservas]

    response = jsonify(resultado)
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200


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
    
@reservas_bp.route("/vehiculos-reservados-por-fecha", methods=["GET"])
@jwt_required()
def vehiculos_reservados_por_fecha():
    try:
        desde_str = request.args.get("desde")
        hasta_str = request.args.get("hasta")

        if not desde_str or not hasta_str:
            return jsonify({"error": "Faltan fechas"}), 400

        # Convertir a datetime
        desde = datetime.strptime(desde_str, "%Y-%m-%d")
        hasta = datetime.strptime(hasta_str, "%Y-%m-%d")
        hasta = hasta.replace(hour=23, minute=59, second=59)  # incluir todo el día

        reservas = (
            Reserva.query
            .filter(Reserva.fecha_inicio >= desde, Reserva.fecha_inicio <= hasta)
            .options(joinedload(Reserva.vehiculo), joinedload(Reserva.usuario))
            .all()
        )
        return jsonify([r.to_dict_completo() for r in reservas]), 200

    except ValueError:
        return jsonify({"error": "Formato de fecha inválido. Usa YYYY-MM-DD"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reservas_bp.route("/reporte/reservas-por-dia", methods=["GET"])
@jwt_required()
def reservas_por_dia():
    try:
        desde_str = request.args.get("desde")
        hasta_str = request.args.get("hasta")

        desde = datetime.strptime(desde_str, "%Y-%m-%d")
        hasta = datetime.strptime(hasta_str, "%Y-%m-%d")

        resultados = (
            db.session.query(
                db.func.date(Reserva.fecha_inicio).label('fecha'),
                db.func.count().label('cantidad')
            )
            .filter(Reserva.fecha_inicio >= desde, Reserva.fecha_inicio <= hasta)
            .group_by(db.func.date(Reserva.fecha_inicio))
            .order_by('fecha')
            .all()
        )

        return jsonify([
            {"dia": fecha.strftime("%A"), "cantidad": cantidad}
            for fecha, cantidad in resultados
        ])
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@reservas_bp.route('/reporte/vehiculos-mas-reservados', methods=['GET'])
@jwt_required()
def vehiculos_mas_reservados():
    try:
        resultado = (
            db.session.query(Vehiculo.modelo, db.func.count(Reserva.id).label('reservas'))
            .join(Reserva)
            .group_by(Vehiculo.modelo)
            .order_by(db.desc('reservas'))
            .limit(5)
            .all()
        )

        return jsonify([{"modelo": r[0], "reservas": r[1]} for r in resultado])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@reservas_bp.route('/reporte/vehiculos-menos-reservados', methods=['GET'])
@jwt_required()
def vehiculos_menos_reservados():
    try:
        resultado = (
            db.session.query(Vehiculo.modelo, db.func.count(Reserva.id).label('reservas'))
            .join(Reserva)
            .group_by(Vehiculo.modelo)
            .order_by('reservas')
            .limit(5)
            .all()
        )

        return jsonify([{"modelo": r[0], "reservas": r[1]} for r in resultado])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@reservas_bp.route('/reporte/reservas-por-categoria', methods=['GET'])
@jwt_required()
def reservas_por_categoria():
    try:
        total = db.session.query(db.func.count(Reserva.id)).scalar()

        resultado = (
            db.session.query(Vehiculo.categoria, db.func.count(Reserva.id).label('cantidad'))
            .join(Reserva)
            .group_by(Vehiculo.categoria)
            .all()
        )

        return jsonify([
            {
                "categoria": categoria,
                "porcentaje": round((cantidad / total) * 100, 2)
            }
            for categoria, cantidad in resultado
        ])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reservas_bp.route("/agregar-extra", methods=["POST"])
@jwt_required()
def agregar_extra_a_reserva():
    data = request.get_json()
    reserva_id = data.get("reserva_id")
    extra_id = data.get("extra_id")

    if not reserva_id or not extra_id:
        return jsonify({"error": "Faltan datos"}), 400

    reserva_extra_existente = db.session.query(ReservaExtra).filter_by(
        reserva_id=reserva_id,
        extra_id=extra_id
    ).first()

    if reserva_extra_existente:
        return jsonify({"message": "Este extra ya está agregado a la reserva"}), 200

    nueva_asociacion = ReservaExtra(reserva_id=reserva_id, extra_id=extra_id)
    db.session.add(nueva_asociacion)
    db.session.commit()

    return jsonify({"message": "Extra agregado correctamente a la reserva"}), 200

@reservas_bp.route("/marcar-devuelto/<int:reserva_id>", methods=["PUT"])
@jwt_required()
def marcar_vehiculo_como_devuelto(reserva_id):
    reserva = Reserva.query.get(reserva_id)
    if not reserva:
        return jsonify({"error": "Reserva no encontrada"}), 404

    if reserva.estado_id == 4:  # Suponiendo que 4 es "devuelto" o "finalizada"
        return jsonify({"message": "Ya fue marcada como devuelta"}), 200

    reserva.estado_id = 4  # Actualiza al estado correspondiente
    db.session.commit()

    return jsonify({"message": "Vehículo marcado como devuelto"}), 200

@reservas_bp.route("/modificar-sucursal/<int:reserva_id>", methods=["PUT"])
@jwt_required()
def modificar_sucursal_reserva(reserva_id):
    data = request.get_json()
    nueva_sucursal_id = data.get("sucursal_id")

    reserva = Reserva.query.get(reserva_id)
    if not reserva:
        return jsonify({"error": "Reserva no encontrada"}), 404

    if not nueva_sucursal_id:
        return jsonify({"error": "ID de nueva sucursal requerido"}), 400

    reserva.vehiculo.sucursal_id = nueva_sucursal_id
    db.session.commit()

    return jsonify({"message": "Sucursal modificada correctamente"}), 200
@reservas_bp.route('/activas', methods=['GET'])
@jwt_required()
@cross_origin(origins='http://localhost:5173', supports_credentials=True)
def ver_reservas_activas():
    reservas = (
        Reserva.query
        .filter(Reserva.estado_id == 2)
        .options(
            joinedload(Reserva.usuario),
            joinedload(Reserva.vehiculo).joinedload(Vehiculo.sucursal),
            joinedload(Reserva.estado)
        )
        .all()
    )
    return jsonify([r.to_dict_completo() for r in reservas])



from datetime import datetime

def iniciar_reserva(data):
    try:
        # Convertir fecha y hora a datetime
        fecha_inicio_str = f"{data['fecha_inicio']} {data['hora_retiro']}"
        fecha_fin_str = f"{data['fecha_fin']} {data['hora_devolucion']}"

        fecha_inicio = datetime.strptime(fecha_inicio_str, "%Y-%m-%d %H:%M")
        fecha_fin = datetime.strptime(fecha_fin_str, "%Y-%m-%d %H:%M")

        reserva = Reserva(
            usuario_id=data["usuario_id"],
            vehiculo_id=data["vehiculo_id"],
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            hora_retiro=data["hora_retiro"],
            hora_devolucion=data["hora_devolucion"],
            pagada=data.get("pagada", False),
            fecha_reserva=datetime.now().date()
        )

        db.session.add(reserva)
        db.session.commit()

        if data.get("extras"):
            extra = ReservaExtra(reserva_id=reserva.id, descripcion=data["extras"])
            db.session.add(extra)
            db.session.commit()

        return reserva
    except Exception as e:
        print("❌ Error en iniciar_reserva:", e)
        raise

@reservas_bp.route('/publicas', methods=['GET', 'OPTIONS'])
def ver_reservas_publicas():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    reservas = (
        Reserva.query
        .options(
            joinedload(Reserva.usuario),
            joinedload(Reserva.vehiculo),
            joinedload(Reserva.estado),
            joinedload(Reserva.extras_asociados)
        )
        .order_by(Reserva.fecha_inicio.desc())
        .all()
    )

    resultado = [r.to_dict_completo() for r in reservas]

    response = jsonify(resultado)
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response, 200
