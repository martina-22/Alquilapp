from extensions import db

class EstadoVehiculo(db.Model):
    __tablename__ = 'estado_vehiculo'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Text)

    vehiculos = db.relationship('Vehiculo', back_populates='estado')
