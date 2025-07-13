from extensions import db
from models.estado_reserva import EstadoReserva

from datetime import datetime

class Reserva(db.Model):
    __tablename__ = 'reserva'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    vehiculo_id = db.Column(db.Integer, db.ForeignKey('vehiculo.id'))
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    hora_retiro = db.Column(db.Time, nullable=True)
    hora_devolucion = db.Column(db.Time, nullable=True)
    estado_id = db.Column(db.Integer, db.ForeignKey('estado_reserva.id'), default=1)
    pagada = db.Column(db.Boolean, default=False)
    monto_total = db.Column(db.Float, nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.now)
    
    usuario = db.relationship("Usuario", back_populates="reservas")
    vehiculo = db.relationship("Vehiculo", back_populates="reservas")
    estado = db.relationship("EstadoReserva", back_populates="reservas")
    extras_asociados = db.relationship("ReservaExtra", back_populates="reserva", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "vehiculo_id": self.vehiculo_id,
            "fecha_inicio": self.fecha_inicio.isoformat(),
            "fecha_fin": self.fecha_fin.isoformat(),
            "hora_retiro": self.hora_retiro.strftime("%H:%M") if self.hora_retiro else None,
            "hora_devolucion": self.hora_devolucion.strftime("%H:%M") if self.hora_devolucion else None,
            "estado": self.estado.nombre if self.estado else None,
            "pagada": self.pagada,
            "monto_total": self.monto_total,
            "extras": [extra.to_dict() for extra in self.extras_asociados]
        }

    def to_dict_completo(self):
        return {
            "id": self.id,
            "fecha_inicio": self.fecha_inicio.isoformat(),
            "fecha_fin": self.fecha_fin.isoformat(),
            "hora_retiro": self.hora_retiro.strftime("%H:%M") if self.hora_retiro else None,
            "hora_devolucion": self.hora_devolucion.strftime("%H:%M") if self.hora_devolucion else None,
            "pagada": self.pagada,
            "monto_total": self.monto_total,
            "estado": self.estado.nombre if self.estado else None,
            "usuario": {
                "id": self.usuario.id,
                "nombre": self.usuario.nombre,
                "apellido": self.usuario.apellido,
                "email": self.usuario.email
            } if self.usuario else None,
            "vehiculo": {
                "id": self.vehiculo.id,
                "modelo": self.vehiculo.modelo,
                "marca": self.vehiculo.marca,
                "anio": self.vehiculo.anio,
                "patente": self.vehiculo.patente
            } if self.vehiculo else None,
            "vehiculo_nombre": f"{self.vehiculo.marca} {self.vehiculo.modelo}" if self.vehiculo else "Vehículo no disponible",
            "extras": [extra.to_dict() for extra in self.extras_asociados]
        }

