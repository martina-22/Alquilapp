import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { VerReserva } from './components/VerReservas';
import { ReservaForm } from './components/ReservaForm';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reserva" element={<ReservaForm />} />
       <Route path="/verreservas" element={<VerReserva />} />


        

      </Routes>
    </BrowserRouter>
  );
}

export default App;
