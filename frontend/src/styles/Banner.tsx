import { Box, Typography } from "@mui/material";
import React from "react";

const BannerSection: React.FC = () => { // Define el tipo para el componente
  return (
    <Box
    sx={{
        py: { xs: 3, md: 4 },
        textAlign: 'center',
        width: '100%',
        bgcolor: 'secondary.main',
        backgroundImage: 'url("../../public/icons/image.png")',
        backgroundSize: 'cover', // Cubre todo el área del Box
        backgroundPosition: 'center', // Centra la imagen en el Box
        backgroundRepeat: 'no-repeat', // Evita que la imagen se repita
        minHeight: { xs: '200px', md: '300px' }, // Define una altura mínima para que la imagen sea visible
        display: 'flex', // Centra el contenido vertical y horizontalmente
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }}
    >
      <Typography
        variant="h3"
        component="h2"
        sx={{
          fontWeight: 'bold',
          color: 'background.default',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)', // Sombra para mejorar la legibilidad
          mb: 3, // Margen inferior para separar del segundo texto
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
        }}
      >
        Viajes inolvidables
      </Typography>
      <Typography
        variant="h5" // Tamaño un poco más pequeño
        component="p"
        sx={{
          fontWeight: 'normal',
          color: 'background.default',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 1)', // Sombra para mejorar la legibilidad
          fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }
        }}
      >
        autos a tu medida.
      </Typography>
    </Box>
  );
};

export default BannerSection;