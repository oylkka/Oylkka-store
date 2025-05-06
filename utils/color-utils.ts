// Color name mapping
export const COLOR_NAMES: Record<string, string> = {
  '#000000': 'Black',
  '#FFFFFF': 'White',
  '#FF0000': 'Red',
  '#0000FF': 'Blue',
  '#008000': 'Green',
  '#FFFF00': 'Yellow',
  '#FFA500': 'Orange',
  '#800080': 'Purple',
  '#FFC0CB': 'Pink',
  '#A52A2A': 'Brown',
  '#808080': 'Gray',
  '#008080': 'Teal',
  '#800000': 'Maroon',
  '#000080': 'Navy',
  '#808000': 'Olive',
  '#C0C0C0': 'Silver',
};

// Get color name from hex code
export const getColorName = (hexCode: string): string => {
  return COLOR_NAMES[hexCode.toUpperCase()] || hexCode;
};

// Determine if a color is light or dark
export const isLightColor = (color: string): boolean => {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = Number.parseInt(hex.substr(0, 2), 16);
  const g = Number.parseInt(hex.substr(2, 2), 16);
  const b = Number.parseInt(hex.substr(4, 2), 16);

  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};
