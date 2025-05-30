// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import CrearVehiculoForm from './pages/CrearVehiculoForm';
import VerFlotaCompleta from './pages/VerFlotaCompleta';
import ModificarVehiculo from './pages/ModificarVehiculo';
import EliminarVehiculo from './pages/EliminarVehiculo';



export default function App() {
  return (
    <Routes>
      <Route path="/crear-vehiculo" element={<CrearVehiculoForm />} />
      <Route path="/ver-flota" element={<VerFlotaCompleta />} />
      <Route path="/modificar-vehiculo" element={<ModificarVehiculo />} />
      <Route path="/eliminar-vehiculo" element={<EliminarVehiculo />} />
      <Route path="*" element={<EliminarVehiculo/>} />
    </Routes>
  );
}
