from extensions import db

class PoliticaCancelacion(db.Model):
    __tablename__ = 'politica_cancelacion'
    id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.Text)
    penalizacion_dias = db.Column(db.Integer)
    porcentaje_penalizacion = db.Column(db.Float)

    vehiculos = db.relationship('Vehiculo', back_populates='politica')
