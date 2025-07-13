from app import create_app
import pandas as pd
from extensions import db
from models.sucursal import Sucursal
from models.politica_cancelacion import PoliticaCancelacion
from models.estado_vehiculo import EstadoVehiculo
from models.estado_reserva import EstadoReserva
from models.extra import Extra
from models.vehiculo import Vehiculo
from models.usuario import Usuario
from datetime import date

app = create_app()
csv_path = "C:/Users/marti/Downloads/vehiculos_listado_150.csv"
df = pd.read_csv(csv_path)

with app.app_context():
    db.create_all()

    # 1. Insertar estados del vehículo
    estados_vehiculo = ["Disponible", "Reservado", "En mantenimiento"]
    for nombre in estados_vehiculo:
        if not EstadoVehiculo.query.filter_by(nombre=nombre).first():
            db.session.add(EstadoVehiculo(nombre=nombre))
    db.session.commit()

    # 2. Insertar estados de reserva
    estados_reserva = ["pendiente", "confirmada", "cancelada","finalizada"]
    for nombre in estados_reserva:
        if not EstadoReserva.query.filter_by(nombre=nombre).first():
            db.session.add(EstadoReserva(nombre=nombre))
    db.session.commit()

    # 3. Insertar extra
    extra_base = [
        ("GPS", "Sistema de navegación satelital", 2500),
        ("Silla para bebé", "Butaca homologada para niños", 3200),
        ("Conductor adicional", "Permite agregar otro conductor", 1500)
    ]
    for nombre, desc, precio in extra_base:
        if not Extra.query.filter_by(nombre=nombre).first():
            db.session.add(Extra(nombre=nombre, descripcion=desc, precio=precio))
    db.session.commit()
   
    # 4. Cargar vehículos
    for _, row in df.iterrows():
        # Crear o buscar sucursal
        sucursal = Sucursal.query.filter_by(localidad=row["Localidad"]).first()
        if not sucursal:
            sucursal = Sucursal(
                localidad=row["Localidad"],
                direccion="Dirección automática",
                telefono="0000000000",
                nombre=f"Sucursal {row['Localidad']}"
            )
            db.session.add(sucursal)
            db.session.commit()

        # Crear o buscar política de cancelación
        desc = row["Política de cancelación"]
        politica = PoliticaCancelacion.query.filter_by(descripcion=desc).first()
        if not politica:
            if desc == "Sin devolución":
                dias, porcentaje = 0, 100.0
            elif desc == "100% de devolución":
                dias, porcentaje = 2, 0.0
            else:
                dias, porcentaje = 1, 20.0
            politica = PoliticaCancelacion(
                descripcion=desc,
                penalizacion_dias=dias,
                porcentaje_penalizacion=porcentaje
            )
            db.session.add(politica)
            db.session.commit()

        # Buscar estado "Disponible"
        estado = EstadoVehiculo.query.filter_by(nombre="Disponible").first()

        
        # Crear vehículo
        vehiculo = Vehiculo(
            patente=row["Patente"],
            marca=row["Marca"],
            modelo=row["Modelo"],
            anio=int(row["Año"]),
            capacidad=int(row["Cantidad máxima de personas"]),
            categoria=row["Categoría de vehículo"],
            precio_dia=float(row["Precio por día"]),
            sucursal_id=sucursal.id,
            politica_cancelacion_id=politica.id,
            estado_id=estado.id
        )
        db.session.add(vehiculo)

    db.session.commit()
    print("✔ Base cargada correctamente con estados, sucursales, políticas, estado_reserva, extra y vehículos.")
