
from models.vehiculo import Vehiculo
from flask import Blueprint, request, jsonify, make_response
from app import db
from models.sucursal import Sucursal
from models.politica_cancelacion import PoliticaCancelacion
from models import Vehiculo, EstadoVehiculo, PoliticaCancelacion, Sucursal
from flask_cors import CORS
from sqlalchemy.orm import joinedload
from flask_cors import cross_origin
from datetime import datetime
from flask_jwt_extended import jwt_required
import re

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


@vehiculos_bp.route('/inactivos', methods=['GET'])
def listar_vehiculos_inactivos():
    vehiculos_inactivos = Vehiculo.query.filter_by(activo=False).all()

    if not vehiculos_inactivos:
        return jsonify({"message": "No hay vehículos inactivos", "vehiculos": []}), 200

    vehiculos_list = []
    for v in vehiculos_inactivos:
        vehiculos_list.append({
            "id": v.id,
            "patente": v.patente,
            "marca": v.marca,
            "modelo": v.modelo,
            "anio": v.anio,
            "categoria": v.categoria,
            "precio_por_dia": v.precio_dia
        })

    return jsonify({"vehiculos": vehiculos_list}), 200

@vehiculos_bp.route('/recuperar/<patente>', methods=['PATCH'])
def recuperar_vehiculo(patente):
    vehiculo = Vehiculo.query.filter_by(patente=patente).first()

    if not vehiculo:
        return jsonify({"message": "Vehículo no encontrado"}), 404

    if vehiculo.activo:
        return jsonify({"message": f"El vehículo con matrícula {patente} ya está activo"}), 400

    vehiculo.activo = True
    db.session.commit()

    return jsonify({"message": f"Vehículo con matrícula {patente} reactivado correctamente"}), 200

@vehiculos_bp.route('/flota-por-sucursal', methods=['GET'])
def flota_por_sucursal():
    sucursales = Sucursal.query.options(db.joinedload(Sucursal.vehiculos)).all()

    resultado = []
    for sucursal in sucursales:
        vehiculos_activos = [
            {
                "marca": v.marca,
                "modelo": v.modelo,
                "anio": v.anio,
                "categoria": v.categoria,
                "capacidad": v.capacidad,
                "matricula": v.patente,
                "precio_por_dia": v.precio_dia,
                "estado": v.estado.nombre if v.estado else "Sin estado"
            }
            for v in sucursal.vehiculos if v.activo
        ]

        resultado.append({
            "sucursal_id": sucursal.id,
            "sucursal_nombre": sucursal.nombre,
            "localidad": sucursal.localidad,
            "vehiculos": vehiculos_activos
        })

    return jsonify({"sucursales": resultado}), 200

@vehiculos_bp.route('/estados', methods=['GET'])
def obtener_estados():
    estados = EstadoVehiculo.query.all()
    estados_list = [{"id": e.id, "nombre": e.nombre} for e in estados]
    return jsonify(estados_list), 200

@vehiculos_bp.route('/modificar/<string:patente>', methods=['PUT'])
@jwt_required()
def modificar_vehiculo_put_patente(patente):
    data = request.get_json()

    campos_obligatorios = [
        'patente', 'marca', 'modelo', 'anio', 'capacidad',
        'categoria', 'precio_dia', 'localidad', 'politica_cancelacion', 'estado'
    ]
    if not all(campo in data and data[campo] for campo in campos_obligatorios):
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    patente_input = data['patente'].strip().upper()
    if not re.match(r'^[A-Z]{3}\d{3}$|^[A-Z]{2}\d{3}[A-Z]{2}$', patente_input):
        return jsonify({"error": "Formato de patente inválido"}), 400

    anio_actual = datetime.now().year
    if not re.match(r'^\d{4}$', data['anio']) or int(data['anio']) > anio_actual:
        return jsonify({"error": f"El año debe tener 4 dígitos y no ser mayor a {anio_actual}"}), 400

    if not re.match(r'^[1-9][0-9]*$', data['capacidad']):
        return jsonify({"error": "La capacidad debe ser un número entero positivo"}), 400

    if not re.match(r'^[1-9][0-9]*$', data['precio_dia']):
        return jsonify({"error": "El precio debe ser un número entero positivo"}), 400

    vehiculo = Vehiculo.query.filter_by(patente=patente.upper(), activo=True).first()
    if not vehiculo:
        return jsonify({"error": "Vehículo no encontrado"}), 404

    estado = EstadoVehiculo.query.get(data['estado'])
    if not estado:
        return jsonify({"error": "Estado de vehículo inválido"}), 400

    if patente_input != patente.upper():
        existente = Vehiculo.query.filter(
            db.func.upper(Vehiculo.patente) == patente_input,
            Vehiculo.id != vehiculo.id
        ).first()
        if existente:
            if existente.activo:
                return jsonify({"error": "Ya existe otro vehículo activo con esa patente"}), 400
            else:
                return jsonify({
                    "error": f"La patente '{existente.patente}' ya existe pero el vehículo está eliminado. "
                             "Puedes recuperarlo desde la sección de vehículos inactivos."
                }), 400

    try:
        vehiculo.patente = patente_input
        vehiculo.marca = data['marca'].strip()
        vehiculo.modelo = data['modelo'].strip()
        vehiculo.anio = int(data['anio'])
        vehiculo.capacidad = int(data['capacidad'])
        vehiculo.categoria = data['categoria']
        vehiculo.precio_dia = float(data['precio_dia'])
        vehiculo.sucursal_id = int(data['localidad'])
        vehiculo.politica_cancelacion_id = int(data['politica_cancelacion'])
        vehiculo.estado_id = int(data['estado'])  # ✅ ACTUALIZAR EL ESTADO

        db.session.commit()
        return jsonify({"message": "Vehículo actualizado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar el vehículo", "detalle": str(e)}), 500

@vehiculos_bp.route('/check-patente/<string:patente>', methods=['GET'])
def check_patente(patente):
    vehiculo = Vehiculo.query.filter_by(patente=patente).first()
    if not vehiculo:
        return jsonify({'status': 'available'}), 200
    if vehiculo.activo:
        return jsonify({'status': 'exists_active'}), 200
    else:
        return jsonify({'status': 'exists_inactive'}), 200

@vehiculos_bp.route('/<string:patente>', methods=['GET'])
def obtener_vehiculo_por_patente(patente):
    vehiculo = Vehiculo.query.filter_by(patente=patente.upper(), activo=True).first()
    if not vehiculo:
        return jsonify({"error": "Vehículo no encontrado"}), 404

    return jsonify({
        "patente": vehiculo.patente,
        "marca": vehiculo.marca,
        "modelo": vehiculo.modelo,
        "anio": str(vehiculo.anio),
        "capacidad": str(vehiculo.capacidad),
        "categoria": vehiculo.categoria,
        "precio_dia": str(int(vehiculo.precio_dia)),
        "localidad": str(vehiculo.sucursal.id) if vehiculo.sucursal else '',
        "politica_cancelacion": str(vehiculo.politica_cancelacion.id) if vehiculo.politica_cancelacion else '',
        "estado": str(vehiculo.estado.id) if vehiculo.estado else '',
    }), 200

