from flask import Flask
from flask_cors import CORS
from extensions import db  # Importa la instancia única de db



def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost:3306/alquiler_autos'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'clave_secreta_para_sesiones'

    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
    db.init_app(app)  # Registra la app con SQLAlchemy

    from blueprints.auth.routes import auth_bp
    from blueprints.vehiculos.routes import vehiculos_bp
    from blueprints.admin.routes import admin_bp
    from blueprints.reservas.routes import reservas_bp
    from blueprints.usuario.routes import usuarios_bp
    from blueprints.pagos.routes import pagos_bp

    app.register_blueprint(pagos_bp, url_prefix="/pagos")
    app.register_blueprint(reservas_bp, url_prefix='/reservas')
    app.register_blueprint(usuarios_bp, url_prefix='/usuarios')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(vehiculos_bp, url_prefix='/vehiculos')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    

    return app
app = create_app()
if __name__ == '__main__':
    
    app.run(debug=True)
