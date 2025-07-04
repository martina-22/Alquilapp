from extensions import db


class ReservaExtra(db.Model):
    __tablename__ = 'reserva_extra'

    reserva_id = db.Column(db.Integer, db.ForeignKey('reserva.id'), primary_key=True)
    extra_id = db.Column(db.Integer, db.ForeignKey('extra.id'), primary_key=True)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)

    reserva = db.relationship("Reserva", back_populates="extras_asociados")
    extra = db.relationship("Extra", back_populates="reservas_asociadas")
