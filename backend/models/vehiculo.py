from extensions import db


class Vehiculo(db.Model):
    __tablename__ = 'vehiculo'

    id = db.Column(db.Integer, primary_key=True)
    patente = db.Column(db.String(20), unique=True, nullable=False)
    marca = db.Column(db.String(50), nullable=False)
    modelo = db.Column(db.String(50), nullable=False)
    anio = db.Column(db.Integer, nullable=False)
    capacidad = db.Column(db.Integer, nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    precio_dia = db.Column(db.Float, nullable=False)
    sucursal_id = db.Column(db.Integer, db.ForeignKey('sucursal.id'))
    politica_cancelacion_id = db.Column(db.Integer, db.ForeignKey('politica_cancelacion.id'))
    estado_id = db.Column(db.Integer, db.ForeignKey('estado_vehiculo.id'))
    activo = db.Column(db.Boolean, default=True)


    sucursal = db.relationship("Sucursal", back_populates="vehiculos")
    politica_cancelacion = db.relationship("PoliticaCancelacion", back_populates="vehiculos")
    estado = db.relationship("EstadoVehiculo", back_populates="vehiculos")
    reservas = db.relationship("Reserva", back_populates="vehiculo")
