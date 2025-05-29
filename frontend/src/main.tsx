import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importa React Router


// Importa tus componentes de página
import HomePage from './pages/Home.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import EditProfile from './pages/EditProfile.tsx'
import VehiclesPage from './pages/VehiclesPage.tsx'
// import LoginPage from './pages/LoginPage.tsx';
// Importa cualquier otra página que vayas a tener

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// tema personalizado
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#6f42c1', // Violeta fuerte
    },
    secondary: {
      main: '#cbb6ea', // Violeta claro (acento)
    },
    background: {
      default: '#f9f7fc', // Fondo general
      paper: '#ffffff', // Fondo de tarjetas/papel
    },
    text: {
      primary: '#333333', // Texto principal
      secondary: '#666666', // Texto secundario
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'system-ui',
      'Avenir',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none', // Para que los botones no estén en mayúsculas
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Ajustar bordes de Paper/Tarjetas
        },
      },
    },
    MuiOutlinedInput: { // Para TextField, Select con variant="outlined"
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      {/* Envuelve tu aplicación con Router */}
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/vehiculos" element={<VehiclesPage />} />
          {/*  Route para otras páginas */}
        </Routes>
      </Router>
    </ThemeProvider>
  </React.StrictMode>,
);