// prettier.config.mjs
export default {
  printWidth: 80, // Limits lines to 80 characters for better readability
  tabWidth: 2, // Consistent indentation level with ESLint settings
  singleQuote: true, // Use single quotes for strings, matching ESLint rules
  trailingComma: 'es5', // Trailing commas where valid in ES5 (objects, arrays, etc.)
  semi: true, // Enforce semicolons at the end of statements
  bracketSpacing: true, // Print spaces between brackets in object literals
  arrowParens: 'always', // Always include parentheses around arrow function arguments
  endOfLine: 'lf', // Enforce LF line endings to avoid cross-platform issues
  quoteProps: 'as-needed', // Only quote object properties where required
  plugins: ['prettier-plugin-tailwindcss'],
};
