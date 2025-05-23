from app import db

class Vehiculo(db.Model):
    __tablename__ = 'vehiculo'
    id = db.Column(db.Integer, primary_key=True)
    patente = db.Column(db.String(255))
    marca = db.Column(db.String(255))
    modelo = db.Column(db.String(255))
    anio = db.Column(db.Integer)
    capacidad = db.Column(db.Integer)
    categoria = db.Column(db.String(255))
    precio_dia = db.Column(db.Float)
    sucursal_id = db.Column(db.Integer, db.ForeignKey('sucursal.id'))
    politica_cancelacion_id = db.Column(db.Integer, db.ForeignKey('politica_cancelacion.id'))
    estado_vehiculo = db.Column(db.Integer, db.ForeignKey('estado_vehiculo.id'))

    reservas = db.relationship('Reserva', back_populates='vehiculo')
    estado = db.relationship('EstadoVehiculo', back_populates='vehiculos')
    politica = db.relationship('PoliticaCancelacion', back_populates='vehiculos')
