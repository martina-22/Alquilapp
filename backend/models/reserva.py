from app import db
from models.estado_reserva import EstadoReserva

class Reserva(db.Model):
    __tablename__ = 'reserva'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    vehiculo_id = db.Column(db.Integer, db.ForeignKey('vehiculo.id'))
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    estado_id = db.Column(db.Integer, db.ForeignKey('estado_reserva.id'))
    pagada = db.Column(db.Boolean, default=False)
    monto_total = db.Column(db.Float, nullable=False)

    usuario = db.relationship("Usuario", back_populates="reservas")
    vehiculo = db.relationship("Vehiculo", back_populates="reservas")
    estado = db.relationship("EstadoReserva", back_populates="reservas")
    extras_asociados = db.relationship("ReservaExtra", back_populates="reserva", cascade="all, delete-orphan")

