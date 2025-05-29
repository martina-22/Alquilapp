from extensions import db


class Extra(db.Model):
    __tablename__ = 'extras'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Text)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Float)

    reservas = db.relationship('ReservaExtra', back_populates='extra')
