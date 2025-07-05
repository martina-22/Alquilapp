from extensions import db
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
    activo = db.Column(db.Boolean, default=True, nullable=False)

    reservas = db.relationship("Reserva", back_populates="usuario")
    administrador = db.relationship('Administrador', back_populates='usuario', uselist=False)
    empleado = db.relationship("Empleado", back_populates="usuario", uselist=False)
