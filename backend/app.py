from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from flask_migrate import Migrate, upgrade



# Inicialización de la app y configuración básica
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost:3306/alquiler_autos'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'clave_secreta_para_sesiones'

CORS(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
# Importar blueprints
def register_blueprints(app):
    from blueprints.auth.routes import auth_bp
    from blueprints.vehiculos.routes import vehiculos_bp
    from blueprints.admin.routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(vehiculos_bp, url_prefix='/vehiculos')
    app.register_blueprint(admin_bp, url_prefix='/admin')

#register_blueprints(app)

# Punto de entrada
if __name__ == '__main__':
    with app.app_context():
        upgrade()
        
    register_blueprints(app)

    app.run(debug=True)
