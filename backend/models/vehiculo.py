from app import db

class Vehiculo(db.Model):
    __tablename__ = 'vehiculo'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patente = db.Column(db.String(20), nullable=False)
    marca = db.Column(db.String(50), nullable=False)
    modelo = db.Column(db.String(50), nullable=False)
    anio = db.Column(db.Integer, nullable=False)
    capacidad = db.Column(db.Integer, nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    precio_dia = db.Column(db.Float, nullable=False)

    sucursal_id = db.Column(db.Integer, db.ForeignKey('sucursal.id'), nullable=False)
    politica_cancelacion_id = db.Column(db.Integer, db.ForeignKey('politica_cancelacion.id'), nullable=False)
    estado_id = db.Column(db.Integer, db.ForeignKey('estado.id'), nullable=False)
