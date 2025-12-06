// Constants
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
export const MIN_IMAGE_RESOLUTION = { width: 512, height: 512 };
export const ALLOWED_ASPECT_RATIOS = [
  { label: "1:1", value: 1 },
  { label: "5:4", value: 1.25 },
  { label: "4:5", value: 0.8 },
];
export const ASPECT_RATIO_TOLERANCE = 0.1; // 10%
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

export const getImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };

    img.onerror = (error) => {
      URL.revokeObjectURL(imageUrl);
      reject(error);
    };

    img.src = imageUrl;
  });

export const validateImageAttributes = async (file) => {
  try {
    const { width, height } = await getImageDimensions(file);

    if (width < MIN_IMAGE_RESOLUTION.width || height < MIN_IMAGE_RESOLUTION.height) {
      return {
        valid: false,
        error: `Image resolution must be at least ${MIN_IMAGE_RESOLUTION.width}x${MIN_IMAGE_RESOLUTION.height}.`,
      };
    }

    const aspectRatio = width / height;
    const closestRatioMatch = ALLOWED_ASPECT_RATIOS.reduce((closest, ratio) => {
      const diff = Math.abs(aspectRatio - ratio.value);
      if (!closest || diff < closest.diff) {
        return { ratio, diff };
      }
      return closest;
    }, null);

    const withinTolerance =
      closestRatioMatch &&
      Math.abs(aspectRatio - closestRatioMatch.ratio.value) / closestRatioMatch.ratio.value <= ASPECT_RATIO_TOLERANCE;

    if (!withinTolerance) {
      const allowedLabels = ALLOWED_ASPECT_RATIOS.map((ratio) => ratio.label).join(", ");
      return {
        valid: false,
        error: `Image aspect ratio must be close to ${allowedLabels} (±${ASPECT_RATIO_TOLERANCE * 100}%).`,
      };
    }

    return { valid: true, dimensions: { width, height }, matchedRatio: closestRatioMatch?.ratio };
  } catch (error) {
    console.error("Failed to validate image dimensions", error);
    return { valid: false, error: "Unable to read image dimensions. Please try another file." };
  }
};
