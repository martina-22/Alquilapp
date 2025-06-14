
from models.vehiculo import Vehiculo
from flask import Blueprint, request, jsonify
from app import db
from models.sucursal import Sucursal
from models.politica_cancelacion import PoliticaCancelacion
from models import Vehiculo, EstadoVehiculo, PoliticaCancelacion, Sucursal
from flask_cors import CORS
from sqlalchemy.orm import joinedload
from flask_cors import cross_origin
vehiculos_bp = Blueprint("vehiculos_bp", __name__)
CORS(vehiculos_bp, supports_credentials=True, origins=["http://localhost:5173"])


@vehiculos_bp.route("/<int:id>", methods=["GET"])
def obtener_vehiculo(id):
    vehiculo = Vehiculo.query.get(id)
    if not vehiculo:
        return jsonify({"error": "Vehículo no encontrado"}), 404
    return jsonify({
        "id": vehiculo.id,
        "modelo": vehiculo.modelo,
        "marca": vehiculo.marca,  
        "precio_dia": vehiculo.precio_dia
    })

@vehiculos_bp.route('/', methods=['GET'])
@vehiculos_bp.route('', methods=['GET'])
def get_vehiculos():
    categoria_filtro = request.args.get('categoria')

    query = Vehiculo.query

    if categoria_filtro:
        query = query.filter(Vehiculo.categoria == categoria_filtro)

    # Usar .options(db.joinedload()) para cargar la relación de cada Vehiculo
    vehiculos = query.options(joinedload(Vehiculo.politica_cancelacion)).all()


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
        if vehiculo.politica_cancelacion:
            vehiculo_data['politica_cancelacion_details'] = {
                'id': vehiculo.politica_cancelacion.id,
                'descripcion': vehiculo.politica_cancelacion.descripcion,
                'penalizacion_dias': vehiculo.politica_cancelacion.penalizacion_dias,
                'porcentaje_penalizacion': vehiculo.politica_cancelacion.porcentaje_penalizacion
            }
        else:
            vehiculo_data['politica_cancelacion_details'] = None

        vehiculos_list.append(vehiculo_data)

    return jsonify(vehiculos_list), 200

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
        estado_id=1  # ← Corrección aplicada
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
        politica = v.politica_cancelacion
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
@vehiculos_bp.route('/modificar', methods=['PUT', 'OPTIONS'])
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def modificar_vehiculo():
    if request.method == "OPTIONS":
        return '', 204  # ✅ para que el preflight de CORS no falle

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
    vehiculo.estado_id = data.get('estado_id', vehiculo.estado_id)  # ✅ CORREGIDO

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