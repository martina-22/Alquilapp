
from models.sucursal import Sucursal
from flask import Blueprint, jsonify, request # noqa
from flask_jwt_extended import jwt_required, get_jwt_identity # noqa
from models.sucursal import Sucursal
from extensions import db # noqa
sucursales_bp = Blueprint('sucursal', __name__)


@sucursales_bp.route('/', methods=['GET'])
def obtener_sucursales():
    sucursales = Sucursal.query.all()
    data = [
        {"id": s.id, "nombre": s.nombre, "localidad": s.localidad}
        for s in sucursales
    ]
    return jsonify(data)

@sucursales_bp.route('/all', methods=['GET'])
def get_all_sucursales():
    sucursales = Sucursal.query.all()
    return jsonify([{
        "id": sucursal.id,
        "localidad": sucursal.localidad,
        "direccion": sucursal.direccion,
        "telefono": sucursal.telefono,
        "nombre": sucursal.nombre
    } for sucursal in sucursales]), 200