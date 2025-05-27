from flask import Flask
from flask_cors import CORS
from flask_mail import Mail
from extensions import db, jwt  # Asegurate de tener extensions.py con db y jwt correctamente definidos

mail = Mail()  # Instancia global de Flask-Mail

def create_app():
    app = Flask(__name__)

    # Configuración de la app
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://alquilapp:alquilapp123@localhost:3306/alquiler_autos'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'alquilapp123'
    app.config['JWT_SECRET_KEY'] = 'supersecretojwt123'  # Reemplazalo con una clave segura

    # Configuración de Flask-Mail
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

    # CORS para permitir frontend en Vite (React)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    # Middleware CORS para headers adicionales
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE')
        return response

    # Blueprints
    from blueprints.auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/auth")

    return app

# Punto de entrada
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
