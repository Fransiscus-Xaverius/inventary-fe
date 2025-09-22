/**
 * Utility functions for formatting values in the application
 */

/**
 * Formats a number as Indonesian Rupiah (IDR)
 * @param {number|string} value - The value to format
 * @returns {string} Formatted currency string or "-" for invalid values
 */
export const formatCurrency = (value) => {
  // Check if value is a valid number
  const numValue = Number(value);
  if (isNaN(numValue) || value === null || value === undefined) {
    console.log("Invalid value for currency formatting:", value);
    return "-"; // Return dash for invalid numbers
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

/**
 * Formats a date with Indonesian locale
 * @param {Date|string} value - The date to format
 * @param {boolean} withTime - Whether to include time in the format
 * @returns {string} Formatted date string or "-" for invalid dates
 */
export const formatDate = (value, withTime = false) => {
  if (!value) return "-";

  try {
    // Try to parse the date - if it's already a Date object or a valid date string
    const date = new Date(value);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "numeric",
      hour: withTime ? "2-digit" : undefined,
      minute: withTime ? "2-digit" : undefined,
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error, value);
    return "-";
  }
};
