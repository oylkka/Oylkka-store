import colorNamer from 'color-namer';

type ColorInfo = {
  name: string;
  slug: string;
  hex: string;
};

/**
 * Generates a human-readable color name and slug from a hex color code.
 * Uses the color-namer library to find the closest named color.
 *
 * @param hex - Hex color code (e.g. "#FF0000", "FF0000", "#fff")
 * @returns ColorInfo with name, slug, and normalized hex, or null if invalid
 *
 * @example
 * generateColorFromHex('#FF0000')
 * // => { name: 'Red', slug: 'red', hex: '#FF0000' }
 *
 * generateColorFromHex('#FF5733')
 * // => { name: 'Orange Red', slug: 'orange-red', hex: '#FF5733' }
 */
export function generateColorFromHex(hex: string): ColorInfo | null {
  // Normalize: allow with or without #, lowercase 3-digit
  let normalized = hex.trim();
  if (!normalized.startsWith('#')) {
    normalized = `#${normalized}`;
  }

  // Validate hex format
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  if (!hexRegex.test(normalized)) {
    return null;
  }

  // Expand 3-digit hex to 6-digit
  if (normalized.length === 4) {
    const r = normalized[1];
    const g = normalized[2];
    const b = normalized[3];
    normalized = `#${r}${r}${g}${g}${b}${b}`;
  }

  try {
    // color-namer returns { html: [{ name, hex, distance }], ... }
    const result = colorNamer(normalized) as unknown as {
      html: Array<{ name: string; hex: string; distance: number }>;
    };
    const named = result.html[0];

    if (!named) {
      return null;
    }

    const name = named.name;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      name,
      slug,
      hex: normalized.toUpperCase(),
    };
  } catch {
    return null;
  }
}

/**
 * Validates whether a string is a valid hex color code.
 */
export function isValidHex(value: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}
