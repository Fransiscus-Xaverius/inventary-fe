/**
 * Color mappings for different category types in the application
 */

/**Color mapping for different category values
 *
 * @type {Object}
 * @constant {Object} categoryColors - Mapping of category values to color hex codes
 * @property {string} defaultColor - Default fallback color for unknown categories
 * @property {string} basic
 * @property {string} premium
 * @property {string} regular
 * @property {string} pria
 * @property {string} wanita
 * @property {string} unisex
 * @property {string} jaket
 * @property {string} topi
 * @property {string} baju
 * @property {string} sepatu
 * @property {string} celana
 *
 */
export const categoryColors = {
  // Category types
  basic: "#9b59b6", // blue
  premium: "#f1c40f", // gold
  regular: "#2ecc71", // green

  // Gender types
  pria: "#3498db", // purple
  wanita: "#e91e63", // pink
  unisex: "#222222", // indigo

  // Product types
  jaket: "#e67e22", // orange
  topi: "#1abc9c", // teal
  baju: "#34495e", // dark blue
  sepatu: "#d35400", // burnt orange
  celana: "#95a5a6", // gray

  // Status
  active: "#2ecc71", // green
  inactive: "#e74c3c", // red
  discontinued: "#95a5a6", // gray
};

// Default fallback color
export const defaultColor = "#7f8c8d";

/**
 * Get the appropriate color for a category value
 * @param {string} categoryValue - The category value
 * @returns {string} - The color hex code
 */
export const getCategoryColor = (categoryValue) => {
  if (!categoryValue) return defaultColor;
  const normalizedValue = categoryValue.toLowerCase().trim();
  return categoryColors[normalizedValue] || defaultColor;
};
