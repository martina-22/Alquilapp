from extensions import db


class Extra(db.Model):
    __tablename__ = 'extra'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Text, nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    precio = db.Column(db.Float, nullable=False)

    reservas_asociadas = db.relationship("ReservaExtra", back_populates="extra")
