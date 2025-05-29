# blueprints/vehiculos/routes.py
from flask import Blueprint, request, jsonify
from models import Vehiculo, EstadoVehiculo, PoliticaCancelacion, Sucursal
from extensions import db

vehiculos_bp = Blueprint('vehiculos', __name__)

@vehiculos_bp.route('/ping')
def ping_vehiculos():
    return "Vehículos activo"

@vehiculos_bp.route('/', methods=['GET'])
@vehiculos_bp.route('', methods=['GET'])
def get_vehiculos():
    categoria_filtro = request.args.get('categoria')

    query = Vehiculo.query

    if categoria_filtro:
        query = query.filter(Vehiculo.categoria == categoria_filtro)

    # Usar .options(db.joinedload()) para cargar la relación de cada Vehiculo
    vehiculos = query.options(db.joinedload(Vehiculo.politica)).all()

    vehiculos_list = []
    for vehiculo in vehiculos:
        # Aquí construyes el diccionario con todos los datos que quieres enviar al frontend
        vehiculo_data = {
            'id': vehiculo.id,
            'patente': vehiculo.patente,
            'marca': vehiculo.marca,
            'modelo': vehiculo.modelo,
            'anio': vehiculo.anio,
            'capacidad': vehiculo.capacidad,
            'categoria': vehiculo.categoria,
            'precio_dia': vehiculo.precio_dia,
            'sucursal_id': vehiculo.sucursal_id,
            'politica_cancelacion_id': vehiculo.politica_cancelacion_id,
            'estado_id': vehiculo.estado_id,
        }

        # Detalles de la política de cancelación si existen!
        if vehiculo.politica:
            vehiculo_data['politica_cancelacion_details'] = {
                'id': vehiculo.politica.id,
                'descripcion': vehiculo.politica.descripcion,
                'penalizacion_dias': vehiculo.politica.penalizacion_dias,
                'porcentaje_penalizacion': vehiculo.politica.porcentaje_penalizacion
            }
        else:
            vehiculo_data['politica_cancelacion_details'] = None

        vehiculos_list.append(vehiculo_data)

    return jsonify(vehiculos_list), 200