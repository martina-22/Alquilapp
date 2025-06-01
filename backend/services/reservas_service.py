from sqlalchemy import and_, or_, func
from models.reserva import Reserva
from models.estado_reserva import EstadoReserva
from models.vehiculo import Vehiculo
from extensions import db
from datetime import datetime

def iniciar_reserva(data):
    try:
        usuario_id = data.get("usuario_id")
        vehiculo_id = int(data.get("vehiculo_id"))
        fecha_inicio_str = data.get("fecha_inicio")
        fecha_fin_str = data.get("fecha_fin")

        if not all([usuario_id, vehiculo_id, fecha_inicio_str, fecha_fin_str]):
            raise Exception("Faltan datos obligatorios")

        fecha_inicio = datetime.strptime(fecha_inicio_str, "%Y-%m-%d").date()
        fecha_fin = datetime.strptime(fecha_fin_str, "%Y-%m-%d").date()

        reservas_existentes = Reserva.query.filter(
            Reserva.vehiculo_id == vehiculo_id,
            Reserva.estado_id != 3,
            or_(
                and_(func.date(Reserva.fecha_inicio) <= fecha_inicio, func.date(Reserva.fecha_fin) >= fecha_inicio),
                and_(func.date(Reserva.fecha_inicio) <= fecha_fin, func.date(Reserva.fecha_fin) >= fecha_fin),
                and_(func.date(Reserva.fecha_inicio) >= fecha_inicio, func.date(Reserva.fecha_fin) <= fecha_fin)
            )
        ).all()

        if reservas_existentes:
            raise Exception("El vehículo ya está reservado en esas fechas")

        vehiculo = Vehiculo.query.get(vehiculo_id)
        if not vehiculo:
            raise Exception("Vehículo no encontrado")

        dias = (fecha_fin - fecha_inicio).days + 1
        monto_total = dias * vehiculo.precio_dia

        pagada = data.get("pagada", False)
        estado_id = 2 if pagada else data.get("estado_id", 1)

        nueva_reserva = Reserva(
            usuario_id=usuario_id,
            vehiculo_id=vehiculo_id,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado_id=estado_id,
            pagada=pagada,
            monto_total=monto_total
        )

        db.session.add(nueva_reserva)
        db.session.commit()
        return nueva_reserva

    except Exception as e:
        print("❌ Error al iniciar reserva:", str(e))
        raise e


def obtener_reservas_por_usuario(usuario_id):
    return Reserva.query.filter_by(usuario_id=usuario_id).all()

def obtener_reserva_por_id(reserva_id):
    return Reserva.query.get(reserva_id)

def cancelar_reserva(reserva_id):
    reserva = Reserva.query.get(reserva_id)
    if not reserva:
        raise Exception("Reserva no encontrada")

    if reserva.estado_id == 3:
        raise Exception("La reserva ya está cancelada")

    reserva.estado_id = 3
    db.session.commit()
    return reserva
