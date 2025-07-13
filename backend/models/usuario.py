from extensions import db
from datetime import datetime
class Usuario(db.Model):
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Text, nullable=False)
    apellido = db.Column(db.Text, nullable=False)
    dni = db.Column(db.Integer, unique=True, nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    telefono = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    contrasena = db.Column(db.String(100), nullable=False)
    es_admin = db.Column(db.Boolean, default=False)
    es_empleado = db.Column(db.Boolean, default=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.now)
    activo = db.Column(db.Boolean, default=True, nullable=False)
    rol = db.Column(db.Integer, nullable=False, default=3)
    
    reservas = db.relationship("Reserva", back_populates="usuario")
    administrador = db.relationship('Administrador', back_populates='usuario', uselist=False)
    empleado = db.relationship("Empleado", back_populates="usuario", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "dni": self.dni,
            "fecha_nacimiento": self.fecha_nacimiento.isoformat() if self.fecha_nacimiento else None,
            "telefono": self.telefono,
            "email": self.email,
            "es_admin": self.es_admin,
            "es_empleado": self.es_empleado,
            "fecha_registro": self.fecha_registro.isoformat() if self.fecha_registro else None
        }

