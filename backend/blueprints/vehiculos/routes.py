from flask import Blueprint, request, jsonify
from app import db
from models.vehiculo import Vehiculo
from models.sucursal import Sucursal
from models.estado_vehiculo import EstadoVehiculo
from models.politica_cancelacion import PoliticaCancelacion

vehiculos_bp = Blueprint('vehiculos', __name__)

@vehiculos_bp.route('/ping')
def ping_vehiculos():
    return "Vehículos activo"

@vehiculos_bp.route('/crear', methods=['POST'])
def crear_vehiculo():
    data = request.get_json()

    if Vehiculo.query.filter_by(patente=data['patente']).first():
        return jsonify({'message': 'La matrícula ya está previamente registrada en el sistema'}), 400

    sucursal = Sucursal.query.get(data['localidad'])
    if not sucursal:
        return jsonify({'message': 'La sucursal seleccionada no existe'}), 400

    politica = PoliticaCancelacion.query.get(data['politica_cancelacion'])
    if not politica:
        return jsonify({'message': 'La política de cancelación seleccionada no existe'}), 400

    nuevo_vehiculo = Vehiculo(
        patente=data['patente'],
        marca=data['marca'],
        modelo=data['modelo'],
        anio=data['anio'],
        capacidad=data['capacidad'],
        categoria=data['categoria'],
        precio_dia=data['precio_dia'],
        sucursal_id=data['localidad'],
        politica_cancelacion_id=data['politica_cancelacion'],
        estado_vehiculo=1  # ← Corrección aplicada
    )

    db.session.add(nuevo_vehiculo)
    db.session.commit()

    return jsonify({'message': f"Vehículo con matrícula {data['patente']} registrado con éxito"}), 201

@vehiculos_bp.route('/flota', methods=['GET'])
def ver_flota_completa():
    vehiculos = Vehiculo.query.all()

    if not vehiculos:
        return jsonify({"message": "No hay vehículos registrados en la flota", "vehiculos": []}), 200

    flota = []
    for v in vehiculos:
        estado = v.estado
        politica = v.politica
        sucursal = v.sucursal

        flota.append({
            "marca": v.marca,
            "modelo": v.modelo,
            "anio": v.anio,
            "tipo": v.categoria,
            "matricula": v.patente,
            "localidad": str(sucursal.id) if sucursal else None,
            "localidad_nombre": sucursal.nombre if sucursal else None,
            "capacidad": v.capacidad,
            "politica_cancelacion": str(politica.id) if politica else None,
            "politica_cancelacion_nombre": politica.descripcion if politica else None,
            "precio_por_dia": v.precio_dia,
            "estado": str(estado.id) if estado else None,
            "estado_nombre": estado.nombre if estado else None
        })

    return jsonify({"vehiculos": flota}), 200

@vehiculos_bp.route('/modificar', methods=['PUT'])
def modificar_vehiculo():
    data = request.get_json()
    patente = data.get('patente')

    vehiculo = Vehiculo.query.filter_by(patente=patente).first()
    if not vehiculo:
        return jsonify({'message': 'No se encontró un vehículo con la matrícula ingresada'}), 404

    vehiculo.marca = data.get('marca', vehiculo.marca)
    vehiculo.modelo = data.get('modelo', vehiculo.modelo)
    vehiculo.anio = data.get('anio', vehiculo.anio)
    vehiculo.capacidad = data.get('capacidad', vehiculo.capacidad)
    vehiculo.categoria = data.get('categoria', vehiculo.categoria)
    vehiculo.precio_dia = data.get('precio_dia', vehiculo.precio_dia)
    vehiculo.sucursal_id = data.get('localidad', vehiculo.sucursal_id)
    vehiculo.politica_cancelacion_id = data.get('politica_cancelacion', vehiculo.politica_cancelacion_id)
    vehiculo.estado_vehiculo = data.get('estado', vehiculo.estado_vehiculo)

    db.session.commit()
    return jsonify({'message': f"Vehículo con matrícula {patente} actualizado con éxito"}), 200

@vehiculos_bp.route('/eliminar/<patente>', methods=['DELETE'])
def eliminar_vehiculo(patente):
    vehiculo = Vehiculo.query.filter_by(patente=patente).first()
    if not vehiculo:
        return jsonify({'message': 'No se encontró ningún vehículo con la matrícula ingresada'}), 404

    db.session.delete(vehiculo)
    db.session.commit()
    return jsonify({'message': f"Vehículo con matrícula {patente} eliminado correctamente"}), 200
