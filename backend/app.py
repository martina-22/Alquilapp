from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from extensions import db, mail

app = Flask(__name__)

# --- Configuración de la aplicación ---
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI=mysql+pymysql://user:password@host/database
SECRET_KEY=una_clave_secreta_muy_larga_y_aleatoria
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# --- CONFIGURACIÓN DE FLASK-MAIL ---
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = '***'  # cambiar
app.config['MAIL_PASSWORD'] = '***' # <-- cambiar
app.config['MAIL_DEFAULT_SENDER'] = '***'  # <-- cambiar

# --- Configuración de CORS ---
# Permite solicitudes desde tu frontend React en el puerto que se esté ejecutando.
# 'http://localhost:5173' debe ser la URL exacta de tu frontend.
# 'resources={r"/*": ...}' aplica esta configuración a todas las rutas.
# 'methods' especifica los verbos HTTP permitidos.
# 'allow_headers'-> crucial para enviar encabezados como 'Content-Type' o 'Authorization'.
CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:5173", # cambiar segun el puerto
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# --- Inicialización de extensiones ---
db.init_app(app)
mail.init_app(app)

# --- Importación de Blueprints ---
from blueprints.auth.routes import auth_bp
from blueprints.vehiculos.routes import vehiculos_bp
from blueprints.admin.routes import admin_bp
from blueprints.reservas.routes import reservas_bp
from blueprints.sucursal.routes import sucursal_bp

# --- Registro de Blueprints ---
app.register_blueprint(reservas_bp, url_prefix='/reservas')
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(vehiculos_bp, url_prefix='/vehiculos')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(sucursal_bp, url_prefix='/sucursales')

# --- Punto de entrada para ejecutar la aplicación ---
if __name__ == '__main__':
    # 'debug=True' desactívar después
    app.run(debug=True, port=5000)  # Se puede especificar el puerto acá
