import { Routes, Route } from 'react-router-dom';
import RegistroUsuarioForm from './pages/RegistroUsuarioForm';
import LoginForm from './pages/LoginForm';
import Logout from './pages/Logout';

export default function App() {
  return (
    <Routes>
      <Route path="/registro" element={<RegistroUsuarioForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="*" element={<RegistroUsuarioForm />} />
    </Routes>
  );
}