// Constants
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
export const STATUSES = ["active", "inactive", "discontinued"];
export const MARKETPLACE_OPTIONS = ["tokopedia", "shopee", "lazada", "tiktok", "bukalapak"];
// export const OFFLINE_MAP_TYPES = ["google-map", "waze", "apple-maps", "custom"];

// Format dates to ISO strings for API
export const formatDateForApi = (dateValue) => {
  if (!dateValue) return "";

  // If dateValue is already a date object (react-hook-form might convert it)
  if (dateValue instanceof Date) {
    // Format to YYYY-MM-DD
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const day = String(dateValue.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00Z`;
  }

  // If dateValue is a string, ensure it's in the right format
  if (typeof dateValue === "string") {
    // If it already contains time information, strip it
    const datePart = dateValue.split("T")[0];
    // Ensure the string is in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return `${datePart}T00:00:00Z`;
    }
  }

  // Fallback - attempt to create a new date and format it
  try {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      // Check if date is valid
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}T00:00:00Z`;
    }
  } catch (e) {
    console.error("Error formatting date:", e);
  }

  return ""; // Return empty string if all else fails
};

export const formatMarketplace = (marketplace) => {
  if (!marketplace || !Array.isArray(marketplace) || marketplace.length === 0) {
    return "";
  }
  const marketplaceObject = {};
  marketplace.forEach((item) => {
    if (item.key && item.value) {
      marketplaceObject[item.key] = item.value;
    }
  });
  return JSON.stringify(marketplaceObject);
};

// Get color info by ID
export const getColorById = (colors, colorId) => {
  return colors.find((color) => color.id === parseInt(colorId));
};

export const formatOffline = (offline) => {
  if (!offline || !Array.isArray(offline) || offline.length === 0) {
    return "";
  }
  return JSON.stringify(
    offline
      .map((item) => ({
        name: item.name?.trim(),
        // type: item.type,
        url: item.url,
        address: item.address?.trim() || "",
        // phone: item.phone?.trim() || "",
        // hours: item.hours?.trim() || "",
        is_active: item.is_active !== undefined ? item.is_active : true,
      }))
      // .filter((item) => item.name && item.type && item.url);
      .filter((item) => item.name && item.url)
  );
};

export const parseGambar = (gambar) => {
  if (!gambar) return {};
  const gambarObject = {};
  gambar.forEach((file, index) => {
    if (file instanceof File) {
      gambarObject[`gambar[${index}]`] = file;
    }
  });
  return gambarObject;
};
