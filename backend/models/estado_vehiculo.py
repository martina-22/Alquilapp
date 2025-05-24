from extensions import db

class EstadoVehiculo(db.Model):
    __tablename__ = 'estado_vehiculo'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)

    vehiculos = db.relationship("Vehiculo", back_populates="estado")
