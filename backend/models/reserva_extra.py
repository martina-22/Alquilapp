from app import db
class ReservaExtra(db.Model):
    __tablename__ = 'reserva_extra'
    reserva_id = db.Column(db.Integer, db.ForeignKey('reserva.id'), primary_key=True)
    extra_id = db.Column(db.Integer, db.ForeignKey('extras.id'), primary_key=True)
    cantidad = db.Column(db.Integer)
    precio_unitario = db.Column(db.Float)

    reserva = db.relationship('Reserva', back_populates='extras')
    extra = db.relationship('Extra', back_populates='reservas')
