from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from extensions import db, jwt  # Asegurate de tener esto bien definido

mail = Mail()  # Instancia global de Flask-Mail

def create_app():
    app = Flask(__name__)

    # Configuración base
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://alquilapp:alquilapp123@localhost:3306/alquiler_autos'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'alquilapp123'
    app.config['JWT_SECRET_KEY'] = 'supersecretojwt123'

    # Configuración de correo
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'anitaormellob@gmail.com'
    app.config['MAIL_PASSWORD'] = 'sjxnsktixsdxigib'
    app.config['MAIL_DEFAULT_SENDER'] = 'anitaormellob@gmail.com'

    # Inicialización de extensiones
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # CORS para frontend en Vite (puerto 5173)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    # Middleware CORS para métodos y headers
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE')
        return response

    # Registro de Blueprints
    from blueprints.auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/auth")

    from blueprints.vehiculos.routes import vehiculos_bp
    app.register_blueprint(vehiculos_bp, url_prefix="/vehiculos")

    from blueprints.sucursal.routes import sucursales_bp
    app.register_blueprint(sucursales_bp)

    return app

# Ejecutar la aplicación
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
