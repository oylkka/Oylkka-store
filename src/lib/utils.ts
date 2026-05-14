import { type ClassValue, clsx } from 'clsx';
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
