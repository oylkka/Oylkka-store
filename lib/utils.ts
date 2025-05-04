import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string | null): string {
  if (!name) {
    return '';
  }
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  } // Handles single-word names
  return `${words[0][0].toUpperCase()}${words[words.length - 1][0].toUpperCase()}`; // Handles multi-word names
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cleanFormData<T extends Record<string, any>>(
  data: T
): Partial<T> {
  const cleanedData: Partial<T> = {};

  for (const key in data) {
    const value = data[key];

    if (typeof value === 'string') {
      if (value.trim() !== '') {
        cleanedData[key] = value;
      }
    } else if (Array.isArray(value)) {
      cleanedData[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      // Narrow the type before checking instanceof
      if ((value as File) instanceof File) {
        cleanedData[key] = value;
      } else {
        const nested = cleanFormData(value);
        if (Object.keys(nested).length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cleanedData[key] = nested as any;
        }
      }
    } else if (value !== undefined && value !== null) {
      cleanedData[key] = value;
    }
  }

  return cleanedData;
}
