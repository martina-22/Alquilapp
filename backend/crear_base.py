from app import app
from extensions import db

# Asegurate de importar todos los modelos para que SQLAlchemy los detecte
import models.usuario
import models.administrador
import models.sucursal
import models.politica_cancelacion
import models.estado_reserva
import models.estado_vehiculo
import models.vehiculo
import models.reserva
import models.reserva # noqa

with app.app_context():
    db.drop_all()   # 🔥 Elimina todas las tablas
    db.create_all()  # 🛠 Las vuelve a crear según tus modelos
    print("✔ Base de datos reiniciada y tablas creadas correctamente.")
