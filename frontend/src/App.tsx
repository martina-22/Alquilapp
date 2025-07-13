import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VerReserva } from './pages/VerReservas';
import { ReservaForm } from './pages/ReservaForm';
import CrearVehiculoForm from './pages/CrearVehiculoForm';
import VerFlotaCompleta from './pages/VerFlotaCompleta';
import ModificarVehiculo from './pages/ModificarVehiculo';
import EliminarVehiculo from './pages/EliminarVehiculo';
import RegistroUsuarioForm from './pages/RegistroUsuarioForm';
import LoginForm from './pages/LoginForm';
import Logout from './pages/Logout';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import VehiculosDisponibles from './pages/VehiclesPage';
import ReporteSemanal from './pages/ReporteSemanal';
import Reportes from './pages/Reportes';
import RegistrarEmpleadoForm from './pages/RegistrarEmpleadoForm';
import GestionEmpleados from './pages/GestionEmpleados';
import ListadoEmpleadosActivos from './pages/ListadoEmpleadosActivos';
import ModificarEmpleadoForm from './pages/ModificarEmpleadoForm';
import AltaEmpleado from './pages/AltaEmpleado';
import CrearSucursal from './pages/CrearSucursal';
import GestionSucursales from './pages/GestionSucursales';
import ModificarSucursalForm from './pages/ModificarSucursalForm';
import HomeAdmin from './pages/HomeAdmin';
import GestionFlota from './pages/GestionFlota';
import ListadoSucursales from './pages/ListadoSucursales';
import AltaSucursal from './pages/AltaSucursal';
import AltaVehiculo from './pages/AltaVehiculo';
import VerReservasEmpleado from './pages/VerReservasEmpleado';
import ForgotPassword from './pages/ForgotPassword';
import RecuperarCuenta from './pages/RecuperarCuenta';
import HomeEmpleado from './pages/HomeEmpleado';
import ReservasActivasEmpleado from './pages/ReservasActivasEmpleado';
import ReservaEmpleado from './pages/ReservaEmpleado';
import EditarReservaEmpleado from './pages/EditarReservaEmpleado';
//import DetalleReservaEmpleado from './pages/DetalleReservaEmpleado';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reservar" element={<ReservaForm />} />
       <Route path="/verreservas" element={<VerReserva />} />
       <Route path="/registro" element={<RegistroUsuarioForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/registrar" element={<RegistroUsuarioForm />} />
      <Route path="/crear-vehiculo" element={<CrearVehiculoForm />} />
      <Route path="/ver-flota" element={<VerFlotaCompleta />} />
      <Route path="/modificar-vehiculo" element={<ModificarVehiculo />} />
      <Route path="/eliminar-vehiculo" element={<EliminarVehiculo />} />
      <Route path="/Eliminar" element={<EliminarVehiculo/>} />
      <Route path="/profile" element={<ProfilePage/>} />
      <Route path="/edit-profile" element={<EditProfile/>} />
      <Route path="/VehiculosDisponibles" element={<VehiculosDisponibles/>} />
      <Route path="/" element={<Home/>} />
      <Route path="/reporte_semanal" element={<ReporteSemanal/>} />
      <Route path="/reportes" element={<Reportes/>} />
      <Route path="/reservasEmpleado" element={<VerReservasEmpleado/>} />
      <Route path="/GestionEmpleados" element={<GestionEmpleados/>} />
      <Route path="/ListadoEmpleadosActivos" element={<ListadoEmpleadosActivos/>} />
      <Route path="/modificar-empleado/:id" element={<ModificarEmpleadoForm />} />
      <Route path="/AltaEmpleado" element={<AltaEmpleado />} />
      <Route path="/CrearSucursal" element={<CrearSucursal />} />
      <Route path="/GestionSucursales" element={<GestionSucursales/>} />
      <Route path="/ModificarSucursalForm" element={<ModificarSucursalForm/>} />
      <Route path="/HomeAdmin" element={<HomeAdmin />} />
      <Route path="/GestionFlota" element={<GestionFlota />} />
      <Route path="/ListadoSucursales" element={<ListadoSucursales />} />
      <Route path="/AltaSucursal" element={<AltaSucursal />} />
      <Route path="/AltaVehiculo" element={<AltaVehiculo />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/recuperarCuenta" element={<RecuperarCuenta />} />
      <Route path="/RegistrarEmpleadoForm" element={<RegistrarEmpleadoForm />} />
      <Route path="/HomeEmpleado" element={<HomeEmpleado />} />
      <Route path="/ReservasActivasEmpleado" element={<ReservasActivasEmpleado />} />
      <Route path="/ReservaEmpleado" element={<ReservaEmpleado />} />
      <Route path="/EditarReservaEmpleado" element={<EditarReservaEmpleado />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
