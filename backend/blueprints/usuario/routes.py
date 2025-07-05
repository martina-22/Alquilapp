from flask import Blueprint, jsonify, request
from models.usuario import Usuario
from models.empleado import Empleado
from extensions import db

usuarios_bp = Blueprint("usuarios_bp", __name__)

# --- Funciones auxiliares reutilizables ---

def obtener_usuario_empleado(id):
    usuario = Usuario.query.get(id)
    empleado = Empleado.query.get(id)
    if not usuario or not usuario.es_empleado:
        return None, None
    return usuario, empleado

def formatear_empleado(usuario: Usuario, empleado: Empleado):
    return {
        'id': usuario.id,
        'nombre': usuario.nombre,
        'apellido': usuario.apellido,
        'email': usuario.email,
        'telefono': usuario.telefono,
        'numero_empleado': empleado.numero_empleado,
        'sucursal_id': empleado.sucursal_id
    }

# --- Endpoints ---

# Obtener nombre y apellido de un usuario por ID
@usuarios_bp.route("/<int:id>", methods=["GET"])
def obtener_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify({
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido
    })


# Listar empleados activos
@usuarios_bp.route('/empleados/activos', methods=['GET'])
def listar_empleados_activos():
    empleados = Empleado.query.all()
    datos = []
    for e in empleados:
        usuario = Usuario.query.get(e.id)
        if usuario and usuario.activo:
            datos.append(formatear_empleado(usuario, e))
    return jsonify(datos), 200


# Listar empleados inactivos
@usuarios_bp.route('/empleados/inactivos', methods=['GET'])
def listar_empleados_inactivos():
    empleados = Empleado.query.all()
    datos = []
    for e in empleados:
        usuario = Usuario.query.get(e.id)
        if usuario and not usuario.activo:
            datos.append(formatear_empleado(usuario, e))
    return jsonify(datos), 200


# Baja lógica usando DELETE (cambia activo a False)
@usuarios_bp.route('/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario or not usuario.es_empleado or not usuario.activo:
        return jsonify({'message': 'Empleado no encontrado o ya eliminado'}), 404

    usuario.activo = False
    db.session.commit()
    return jsonify({'message': 'Empleado dado de baja correctamente'}), 200


# Alta lógica (reactivar empleado)
@usuarios_bp.route('/empleados/<int:id>/alta', methods=['PATCH'])
def dar_alta_empleado(id):
    usuario = Usuario.query.get(id)
    if not usuario or not usuario.es_empleado:
        return jsonify({'message': 'Empleado no encontrado'}), 404

    if usuario.activo:
        return jsonify({'message': 'El empleado ya está activo'}), 400

    usuario.activo = True
    db.session.commit()
    return jsonify({'message': 'Empleado dado de alta correctamente'}), 200


@usuarios_bp.route('/empleados/<int:id>/modificar', methods=['PATCH'])
def modificar_empleado(id):
    usuario, empleado = obtener_usuario_empleado(id)
    if not usuario:
        return jsonify({'message': 'Empleado no encontrado'}), 404

    data = request.get_json()

    # Validar duplicado de email si se está cambiando
    nuevo_email = data.get('email')
    if nuevo_email and nuevo_email != usuario.email:
        if Usuario.query.filter(Usuario.email == nuevo_email, Usuario.id != usuario.id).first():
            return jsonify({'message': 'El email ya está registrado por otro usuario'}), 400

    usuario.nombre = data.get('nombre', usuario.nombre)
    usuario.apellido = data.get('apellido', usuario.apellido)
    usuario.dni = data.get('dni', usuario.dni)
    usuario.fecha_nacimiento = data.get('fecha_nacimiento', usuario.fecha_nacimiento)
    usuario.telefono = data.get('telefono', usuario.telefono)
    usuario.email = nuevo_email or usuario.email

    if empleado:
        empleado.sucursal_id = data.get('sucursal_id', empleado.sucursal_id)

    db.session.commit()
    return jsonify({'message': 'Empleado modificado correctamente'}), 200



# Obtener datos completos de un empleado por su número de empleado
@usuarios_bp.route('/empleados/buscar/<numero_empleado>', methods=['GET'])
def obtener_datos_empleado(numero_empleado):
    empleado = Empleado.query.filter_by(numero_empleado=numero_empleado).first()
    if not empleado:
        return jsonify({'message': 'Empleado no encontrado'}), 404

    usuario = Usuario.query.get(empleado.id)
    if not usuario:
        return jsonify({'message': 'Usuario no encontrado'}), 404

    return jsonify({
        'id': usuario.id,
        'nombre': usuario.nombre,
        'apellido': usuario.apellido,
        'dni': usuario.dni,
        'fecha_nacimiento': usuario.fecha_nacimiento.isoformat() if usuario.fecha_nacimiento else None,
        'telefono': usuario.telefono,
        'email': usuario.email,
        'numero_empleado': empleado.numero_empleado,
        'sucursal_id': empleado.sucursal_id
    }), 200
