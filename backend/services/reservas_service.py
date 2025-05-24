from sqlalchemy import and_, or_
from models.reserva import Reserva
from models.estado_reserva import EstadoReserva
from models.vehiculo import Vehiculo  # Asegurate de importar el modelo
from extensions import db
from datetime import datetime

def iniciar_reserva(data):
    fecha_inicio = datetime.strptime(data["fecha_inicio"], "%Y-%m-%d").date()
    fecha_fin = datetime.strptime(data["fecha_fin"], "%Y-%m-%d").date()
    vehiculo_id = data["vehiculo_id"]

    # Verificar solapamiento con otras reservas del mismo vehículo
    reservas_existentes = Reserva.query.filter(
        Reserva.vehiculo_id == vehiculo_id,
        Reserva.estado_id != 3,  # 3 = cancelada
        or_(
            and_(Reserva.fecha_inicio <= fecha_inicio, Reserva.fecha_fin >= fecha_inicio),
            and_(Reserva.fecha_inicio <= fecha_fin, Reserva.fecha_fin >= fecha_fin),
            and_(Reserva.fecha_inicio >= fecha_inicio, Reserva.fecha_fin <= fecha_fin)
        )
    ).all()

    if reservas_existentes:
        raise Exception("El vehículo ya está reservado en esas fechas")

    # Obtener el vehículo
    vehiculo = Vehiculo.query.get(vehiculo_id)
    if not vehiculo:
        raise Exception("Vehículo no encontrado")

    # Calcular días y monto total
    dias = (fecha_fin - fecha_inicio).days + 1  # incluye ambos días
    monto_total = dias * vehiculo.precio_dia

    # Crear la reserva
    nueva_reserva = Reserva(
        usuario_id=data["usuario_id"],
        vehiculo_id=vehiculo_id,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        estado_id=data.get("estado_id", 1),
        pagada=False,
        monto_total=monto_total
    )

    db.session.add(nueva_reserva)
    db.session.commit()
    return nueva_reserva
