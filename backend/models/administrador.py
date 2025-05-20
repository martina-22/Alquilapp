from app import db

class Administrador(db.Model):
    __tablename__ = 'administrador'

    id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)
    numero_empleado = db.Column(db.String(50), unique=True, nullable=False)
    sucursal_id = db.Column(db.Integer, db.ForeignKey('sucursal.id'), nullable=False)

    sucursal = db.relationship('Sucursal', backref='administrador')
