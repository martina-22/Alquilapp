from flask import Flask, jsonify
from flask_cors import CORS
from flask_mail import Mail
from extensions import db, jwt


mail = Mail()

def create_app():
    app = Flask(__name__)

    # Configuraciones base
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost:3306/alquiler_autos'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'alquilapp123'
    app.config['JWT_SECRET_KEY'] = 'supersecretojwt123'
    app.config["JWT_ERROR_MESSAGE_KEY"] = "message"
    app.config["PROPAGATE_EXCEPTIONS"] = True

    # Configuración de correo
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    #app.config['MAIL_USERNAME'] = 'anitaormellob@gmail.com'
    app.config['MAIL_USERNAME'] = 'martigarcia.1407@gmail.com'
    app.config['MAIL_PASSWORD'] = 'gfozycyoevisofnm'
    app.config['MAIL_DEFAULT_SENDER'] = 'martigarcia.1407@gmail.com'

    # ✅ Habilitar CORS correctamente (sin duplicar headers)
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}})

    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    

    # Registrar Blueprints
    from blueprints.auth.routes import auth_bp
    from blueprints.vehiculos.routes import vehiculos_bp
    from blueprints.reservas.routes import reservas_bp
    from blueprints.usuario.routes import usuarios_bp
    from blueprints.pagos.routes import pagos_bp
    from blueprints.sucursal.routes import sucursales_bp
    from blueprints.reporte.routes import reporte_bp

    app.register_blueprint(reporte_bp, url_prefix="/reporte")
    app.register_blueprint(sucursales_bp, url_prefix="/sucursales")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(vehiculos_bp, url_prefix="/vehiculos")
    app.register_blueprint(reservas_bp, url_prefix="/reservas")
    app.register_blueprint(usuarios_bp, url_prefix="/usuarios")
    app.register_blueprint(pagos_bp, url_prefix="/pagos")

    return app



# Entry point
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
