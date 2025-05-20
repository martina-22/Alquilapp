import pandas as pd
from app import app, db
from models.sucursal import Sucursal
from models.politica_cancelacion import PoliticaCancelacion
from models.estado import Estado
from models.vehiculo import Vehiculo

# Ruta al CSV
csv_path = "C:/Users/marti/Downloads/vehiculos_listado_150.csv"
df = pd.read_csv(csv_path)

# Estados estándar
estados_def = ["Disponible", "Reservado", "En mantenimiento"]

with app.app_context():
    # ✅ Crear tablas si no existen
    db.create_all()

    # 1. Insertar estados (si no existen)
    for nombre_estado in estados_def:
        if not Estado.query.filter_by(nombre=nombre_estado).first():
            db.session.add(Estado(nombre=nombre_estado))
    db.session.commit()

    for _, row in df.iterrows():
        # 2. Crear o buscar sucursal
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

        # 3. Crear o buscar política de cancelación
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

        # 4. Buscar estado "Disponible"
        estado = Estado.query.filter_by(nombre="Disponible").first()

        # 5. Crear vehículo
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
    print("✔ Base cargada correctamente con estados, sucursales, políticas y vehículos.")
