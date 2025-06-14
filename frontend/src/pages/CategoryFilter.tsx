// src/components/CategoryFilter.tsx

import React from 'react';
import { Button, Box } from '@mui/material';

interface CategoryFilterProps {
  categories: string[]; // Lista de nombres de categoría (ej: "Vehículos chicos", "Medianos")
  selectedCategory: string | null; // La categoría actualmente seleccionada
  onSelectCategory: (category: string | null) => void; // Maneja la selección
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
      {/* Botón para "Mostrar todos" */}
      <Button
        variant={selectedCategory === null ? 'contained' : 'outlined'}
        onClick={() => onSelectCategory(null)}
        sx={{ px: 3, py: 1.5, fontWeight: 'bold' }}
        color='secondary'
      >
        Todas las categorías
      </Button>

      {/* Botones para cada categoría */}
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'contained' : 'outlined'}
          onClick={() => onSelectCategory(category)}
          sx={{ px: 3, py: 1.5, fontWeight: 'bold' }}
          color='secondary'
        >
          {category}
        </Button>
      ))}
    </Box>
  );
};

export default CategoryFilter;