
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

# Listar sucursales inactivas
@sucursales_bp.route('/inactivas', methods=['GET'])
def get_sucursales_inactivas():
    inactivas = Sucursal.query.filter_by(activo=False).all()
    return jsonify([{
        "id": s.id,
        "nombre": s.nombre,
        "localidad": s.localidad,
        "direccion": s.direccion,
        "telefono": s.telefono
    } for s in inactivas]), 200

# Crear nueva sucursal
@sucursales_bp.route('/crear', methods=['POST'])
@jwt_required()
def crear_sucursal():
    data = request.get_json()

    campos_requeridos = ['nombre', 'localidad', 'direccion', 'telefono']
    if not all(campo in data and data[campo] for campo in campos_requeridos):
        return jsonify({"error": "Faltan campos requeridos"}), 400

    # Validar nombre único (case-insensitive)
    nombre_existente = Sucursal.query.filter(
        db.func.lower(Sucursal.nombre) == data['nombre'].strip().lower()
    ).first()
    if nombre_existente:
        if nombre_existente.activo:
            return jsonify({"error": "Ya existe una sucursal activa con ese nombre"}), 400
        else:
            return jsonify({
                "error": f"La sucursal '{nombre_existente.nombre}' ya existe pero está eliminada. "
                        "Puedes recuperarla en la sección de sucursales inactivas."
            }), 400
    
    nueva_sucursal = Sucursal(
        nombre=data['nombre'].strip(),
        localidad=data['localidad'].strip(),
        direccion=data['direccion'].strip(),
        telefono=data['telefono'].strip(),
        activo=True
    )

    try:
        db.session.add(nueva_sucursal)
        db.session.commit()
        return jsonify({"mensaje": "Sucursal creada exitosamente", "id": nueva_sucursal.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear la sucursal", "detalle": str(e)}), 500

# Obtener detalles de una sucursal específica
@sucursales_bp.route('/<int:sucursal_id>', methods=['GET'])
def obtener_sucursal(sucursal_id):
    sucursal = Sucursal.query.get(sucursal_id)
    if not sucursal or not sucursal.activo:
        return jsonify({"error": "Sucursal no encontrada"}), 404

    return jsonify({
        "id": sucursal.id,
        "nombre": sucursal.nombre,
        "localidad": sucursal.localidad,
        "direccion": sucursal.direccion,
        "telefono": sucursal.telefono
    }), 200

# Eliminar (baja lógica)
@sucursales_bp.route('/eliminar/<int:sucursal_id>', methods=['DELETE'])
@jwt_required()
def eliminar_sucursal(sucursal_id):
    sucursal = Sucursal.query.get(sucursal_id)

    if not sucursal:
        return jsonify({"error": "Sucursal no encontrada"}), 404

    # Bloquear eliminación si hay empleados activos
    empleados_activos = [e for e in sucursal.empleados if e.usuario and e.usuario.activo]
    if empleados_activos:
        return jsonify({
            "error": f"No se puede eliminar la sucursal '{sucursal.nombre}' porque tiene {len(empleados_activos)} empleado(s) activo(s) asignado(s)"
        }), 400

    # Bloquear eliminación si hay vehículos activos
    vehiculos_activos = [v for v in sucursal.vehiculos if v.activo]
    if vehiculos_activos:
        return jsonify({
            "error": f"No se puede eliminar la sucursal '{sucursal.nombre}' porque tiene {len(vehiculos_activos)} vehículo(s) activo(s) asignado(s)"
        }), 400


    try:
        sucursal.activo = False
        db.session.commit()
        return jsonify({"mensaje": f"Sucursal '{sucursal.nombre}' desactivada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al desactivar la sucursal", "detalle": str(e)}), 500

@sucursales_bp.route('/asignados/<int:sucursal_id>', methods=['GET'])
@jwt_required()
def obtener_asignaciones_de_sucursal(sucursal_id):
    sucursal = Sucursal.query.get(sucursal_id)

    if not sucursal:
        return jsonify({"error": "Sucursal no encontrada"}), 404

    # Filtrar empleados activos
    empleados_activos = [e for e in sucursal.empleados if e.usuario and e.usuario.activo]

    # Filtrar vehículos activos
    vehiculos_activos = [v for v in sucursal.vehiculos if v.activo]

    return jsonify({
        "empleados": len(empleados_activos),
        "vehiculos": len(vehiculos_activos)
    }), 200


# Reactivar una sucursal desactivada
@sucursales_bp.route('/recuperar/<int:sucursal_id>', methods=['PATCH'])
@jwt_required()
def reactivar_sucursal(sucursal_id):
    sucursal = Sucursal.query.get(sucursal_id)
    if not sucursal:
        return jsonify({"error": "Sucursal no encontrada"}), 404

    if sucursal.activo:
        return jsonify({"error": "La sucursal ya está activa"}), 400

    try:
        sucursal.activo = True
        db.session.commit()
        return jsonify({"mensaje": f"Sucursal '{sucursal.nombre}' reactivada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al reactivar la sucursal", "detalle": str(e)}), 500

@sucursales_bp.route('/actualizar/<int:sucursal_id>', methods=['PUT'])
@jwt_required()
def actualizar_sucursal(sucursal_id):
    data = request.get_json()

    campos_requeridos = ['nombre', 'localidad', 'direccion', 'telefono']
    if not all(campo in data and data[campo].strip() for campo in campos_requeridos):
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    if not data['telefono'].strip().isdigit() and not data['telefono'].strip().startswith('+'):
        return jsonify({"error": "Número de teléfono inválido"}), 400

    sucursal = Sucursal.query.get(sucursal_id)
    if not sucursal or not sucursal.activo:
        return jsonify({"error": "Sucursal no encontrada"}), 404

    # Validar nombre único (case-insensitive) en otras sucursales
    nombre_existente = Sucursal.query.filter(
        db.func.lower(Sucursal.nombre) == data['nombre'].strip().lower(),
        Sucursal.id != sucursal_id
    ).first()

    if nombre_existente:
        if nombre_existente.activo:
            return jsonify({"error": "Ya existe otra sucursal activa con ese nombre"}), 400
        else:
            return jsonify({
                "error": f"La sucursal '{nombre_existente.nombre}' ya existe pero está eliminada. "
                        "Puedes recuperarla en la sección de sucursales inactivas."
            }), 400

    try:
        sucursal.nombre = data['nombre'].strip()
        sucursal.localidad = data['localidad'].strip()
        sucursal.direccion = data['direccion'].strip()
        sucursal.telefono = data['telefono'].strip()

        db.session.commit()
        return jsonify({"message": "Sucursal actualizada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar la sucursal", "detalle": str(e)}), 500