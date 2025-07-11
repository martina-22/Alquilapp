from extensions import db

class EstadoReserva(db.Model):
    __tablename__ = 'estado_reserva'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)

    reservas = db.relationship("Reserva", back_populates="estado")

