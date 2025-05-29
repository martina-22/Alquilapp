from extensions import db


class Empleado(db.Model):
    __tablename__ = 'empleado'
    id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)
    numero_empleado = db.Column(db.String(255))
    sucursal_id = db.Column(db.Integer, db.ForeignKey('sucursal.id'))

    usuario = db.relationship('Usuario', back_populates='empleado')
