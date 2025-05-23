from models.reserva import Reserva
from models.vehiculo import Vehiculo
from app import db
from datetime import datetime

def crear_reserva(usuario_id, vehiculo_id, fecha_inicio_str, fecha_fin_str):
    fecha_inicio = datetime.strptime(fecha_inicio_str, '%Y-%m-%d').date()
    fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d').date()

    dias = (fecha_fin - fecha_inicio).days
    if dias <= 0:
        return {"error": "Fechas inválidas"}, 400

    vehiculo = Vehiculo.query.get(vehiculo_id)
    if not vehiculo:
        return {"error": "Vehículo no encontrado"}, 404

    # Verificar solapamientos
    reservas_solapadas = Reserva.query.filter(
        Reserva.vehiculo_id == vehiculo_id,
        Reserva.estado.in_(['pendiente', 'confirmada']),
        Reserva.fecha_inicio <= fecha_fin,
        Reserva.fecha_fin >= fecha_inicio
    ).all()

    if reservas_solapadas:
        return {"error": "El vehículo ya está reservado en ese período"}, 409

    monto_total = vehiculo.precio_dia * dias

    reserva = Reserva(
        usuario_id=usuario_id,
        vehiculo_id=vehiculo_id,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        estado='pendiente',
        pagada=False,
        monto_total=monto_total
    )

    db.session.add(reserva)
    db.session.commit()

    return {"mensaje": "Reserva creada", "reserva_id": reserva.id}, 201
