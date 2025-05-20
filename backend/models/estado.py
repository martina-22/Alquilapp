from app import db

class Estado(db.Model):
    __tablename__ = 'estado'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(50), nullable=False)

    vehiculos = db.relationship('Vehiculo', backref='estado', lazy=True)
