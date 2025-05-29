# blueprints/sucursal/routes.py

from flask import Blueprint, jsonify, request # noqa
from flask_jwt_extended import jwt_required, get_jwt_identity # noqa
from models.sucursal import Sucursal
from extensions import db # noqa

sucursal_bp = Blueprint('sucursal', __name__)


@sucursal_bp.route('/all', methods=['GET'])
def get_all_sucursales():
    sucursales = Sucursal.query.all()
    return jsonify([{
        "id": sucursal.id,
        "localidad": sucursal.localidad,
        "direccion": sucursal.direccion,
        "telefono": sucursal.telefono,
        "nombre": sucursal.nombre
    } for sucursal in sucursales]), 200
