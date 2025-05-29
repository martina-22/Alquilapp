# models/usuario.py

from extensions import db


class Usuario(db.Model):
    __tablename__ = 'usuario'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Text)
    apellido = db.Column(db.Text)
    dni = db.Column(db.Integer)
    fecha_nacimiento = db.Column(db.Date)
    telefono = db.Column(db.Integer)
    email = db.Column(db.String(255))
    contrasena = db.Column(db.String(255))
    es_admin = db.Column(db.Boolean)
    es_empleado = db.Column(db.Boolean)

    administrador = db.relationship('Administrador', uselist=False,
                                    back_populates='usuario')
    empleado = db.relationship('Empleado', uselist=False,
                               back_populates='usuario')
    reservas = db.relationship('Reserva', back_populates='usuario')
