from extensions import db
from models.estado_reserva import EstadoReserva
from datetime import time

class Reserva(db.Model):
    __tablename__ = 'reserva'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    vehiculo_id = db.Column(db.Integer, db.ForeignKey('vehiculo.id'))
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    hora_retiro = db.Column(db.Time, nullable=True)         # NUEVO
    hora_devolucion = db.Column(db.Time, nullable=True)     # NUEVO
    estado_id = db.Column(db.Integer, db.ForeignKey('estado_reserva.id'))
    pagada = db.Column(db.Boolean, default=False)
    monto_total = db.Column(db.Float, nullable=False)

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
