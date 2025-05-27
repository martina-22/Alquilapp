from extensions import db

class Sucursal(db.Model):
    __tablename__ = 'sucursal'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    localidad = db.Column(db.Text, nullable=False)
    direccion = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    nombre = db.Column(db.Text, nullable=False)

    vehiculos = db.relationship('Vehiculo', backref='sucursal', lazy=True)
