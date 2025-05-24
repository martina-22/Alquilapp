from app import db

class Administrador(db.Model):
    __tablename__ = 'administrador'

    id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)
    sucursal_id = db.Column(db.Integer, db.ForeignKey('sucursal.id'), nullable=False)

    sucursal = db.relationship('Sucursal', back_populates='administradores')
    usuario = db.relationship('Usuario', back_populates='administrador')

