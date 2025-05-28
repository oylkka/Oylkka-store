import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * The function `getInitials` takes a name as input and returns the initials of the name in uppercase.
 * @param {string | null} [name] - The `getInitials` function takes an optional `name` parameter of
 * type string or null. It returns the initials of the name provided. If the name is null or an empty
 * string, it returns an empty string. If the name is a single word, it returns the initial letter of
 * that
 * @returns The `getInitials` function returns the initials of a given name. If the name is null or
 * empty, it returns an empty string. If the name is a single word, it returns the uppercase initial of
 * that word. If the name consists of multiple words, it returns the uppercase initials of the first
 * and last words.
 */
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

/**
 * The `cleanFormData` function in TypeScript filters out empty strings and undefined/null values from
 * an object while preserving the structure.
 * @param {T} data - The `cleanFormData` function takes an object `data` as input and returns a new
 * object with only the non-empty, non-null, and non-undefined values from the original object. The
 * function iterates over each key-value pair in the input object and applies certain conditions to
 * determine whether the value
 * @returns The `cleanFormData` function returns a cleaned version of the input data object `T`, where
 * only non-empty strings, arrays, non-null objects, and non-undefined values are included. The
 * returned value is of type `Partial<T>`, which means it contains a subset of the properties of the
 * original data object `T`.
 */
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
      // Check for Date objects first
      if ((value as object) instanceof Date) {
        cleanedData[key] = value;
      }
      // Then check for File objects
      else if ((value as File) instanceof File) {
        cleanedData[key] = value;
      }
      // Handle other objects recursively
      else {
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
export function formatDisplayName(
  user?: { name?: string | null; username?: string | null } | null
): string {
  return user?.name || user?.username || 'Unknown User';
}
