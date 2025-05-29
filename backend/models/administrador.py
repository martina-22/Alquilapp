from extensions import db


class Administrador(db.Model):
    __tablename__ = 'administrador'
    id = db.Column(db.Integer, db.ForeignKey('usuario.id'), primary_key=True)

    usuario = db.relationship('Usuario', back_populates='administrador')
