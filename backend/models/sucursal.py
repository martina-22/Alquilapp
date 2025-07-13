from extensions import db

class Sucursal(db.Model):
    __tablename__ = 'sucursal'

    id = db.Column(db.Integer, primary_key=True)
    localidad = db.Column(db.Text, nullable=False)
    direccion = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)

    vehiculos = db.relationship("Vehiculo", back_populates="sucursal")
    empleados = db.relationship("Empleado", back_populates="sucursal")
    administradores = db.relationship('Administrador', back_populates='sucursal', lazy=True)
    activo = db.Column(db.Boolean, default=True)