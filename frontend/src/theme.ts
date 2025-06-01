// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#45e5ff', // celeste brillante
    },
    secondary: {
      main: '#832a9b', // violeta intenso
    },
    background: {
      default: '#0f0c29', // fondo general oscuro
      paper: '#240b3a',    // tarjetas
    },
    text: {
      primary: '#ffffff',
      secondary: '#bdbdbd',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
