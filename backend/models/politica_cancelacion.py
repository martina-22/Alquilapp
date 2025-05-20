from app import db

class PoliticaCancelacion(db.Model):
    __tablename__ = 'politica_cancelacion'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    descripcion = db.Column(db.Text, nullable=False)
    penalizacion_dias = db.Column(db.Integer, nullable=False)
    porcentaje_penalizacion = db.Column(db.Float, nullable=False)

    vehiculos = db.relationship('Vehiculo', backref='politica_cancelacion', lazy=True)
