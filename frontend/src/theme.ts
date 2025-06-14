// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#30BBCB',           // celeste moderno del logo
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3A2C64',           // ✅ nuevo violeta oscuro de la imagen
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAFAFB',        // blanco limpio
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E1E1E',        // texto fuerte
      secondary: '#4E4E4E',      // texto auxiliar
    },
    divider: '#ECECEC',
  },

  typography: {
    fontFamily: 'Poppins, Roboto, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h5: {
      fontWeight: 600,
      fontSize: '1.4rem',
      color: '#1E1E1E',
    },
    button: {
      fontWeight: 500,
      fontSize: '0.95rem',
      textTransform: 'none',
    },
    body1: {
      fontSize: '1rem',
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          padding: '10px 18px',
          boxShadow: 'none',
          fontWeight: 500,
        },
        containedSecondary: {
          backgroundColor: '#3A2C64',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#2B2645', // un tono más oscuro para el hover
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.05)',
          padding: '1.5rem',
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          borderRadius: 8,
          '& fieldset': {
            borderColor: '#D3C7EA',
          },
          '&:hover fieldset': {
            borderColor: '#3A2C64',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#30BBCB',
            boxShadow: '0 0 0 1px #30BBCB',
          },
        },
        input: {
          padding: '12px',
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#7C7C7C',
          fontWeight: 400,
          '&.Mui-focused': {
            color: '#30BBCB',
          },
        },
      },
    },
  },
});

export default theme;
