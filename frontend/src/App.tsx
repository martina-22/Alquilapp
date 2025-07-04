import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VerReserva } from './pages/VerReservas';
import { ReservaForm } from './pages/ReservaForm';
import CrearVehiculoForm from './pages/CrearVehiculoForm';
import VerFlotaCompleta from './pages/VerFlotaCompleta';
import ModificarVehiculo from './pages/ModificarVehiculo';
import EliminarVehiculo from './pages/EliminarVehiculo';
import RegistroUsuarioForm from './pages/RegistroUsuarioForm';
import VerUsuarios from './pages/VerUsuarios';
import LoginForm from './pages/LoginForm';
import Logout from './pages/Logout';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import VehiculosDisponibles from './pages/VehiclesPage';
import ForgotPassword from './pages/ForgotPassword';

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
        <Route path="/vehiculos" element={<VehiculosDisponibles/>} />
        <Route path="/ver-usuarios" element={<VerUsuarios />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home/>} />
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
