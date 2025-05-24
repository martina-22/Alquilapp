from app import db
class Empleado(db.Model):
    __tablename__ = 'empleado'

    id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)
    numero_empleado = db.Column(db.String(50), nullable=False)
    sucursal_id = db.Column(db.Integer, db.ForeignKey('sucursal.id'))

    usuario = db.relationship("Usuario", back_populates="empleado")
    sucursal = db.relationship("Sucursal", back_populates="empleados")
