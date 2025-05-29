from flask import Blueprint

print("Importando admin routes")
admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/ping')
def ping_admin():
    return "Admin activo"
