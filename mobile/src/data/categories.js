// Categorias do glossário
export const categories = [
  { id: 'giria', label: 'Gíria' },
  { id: 'meme', label: 'Meme' },
  { id: 'abreviacao', label: 'Abreviação' },
  { id: 'tendencia', label: 'Tendência' },
  { id: 'comportamento', label: 'Comportamento digital' },
];

export function getCategory(id) {
  return categories.find((category) => category.id === id);
}
