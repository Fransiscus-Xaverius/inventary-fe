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

// ============================================================================
// UNIFIED IMAGE ARRAY UTILITIES
// ============================================================================

/**
 * Type guard to check if an image entry is an existing URL (string)
 * @param {string | File | null} entry - The image array entry
 * @returns {boolean} - True if the entry is an existing URL string
 */
export const isExistingImageUrl = (entry) => {
  return typeof entry === "string" && entry.length > 0;
};

/**
 * Type guard to check if an image entry is a new File upload
 * @param {string | File | null} entry - The image array entry
 * @returns {boolean} - True if the entry is a File object
 */
export const isNewImageFile = (entry) => {
  return entry instanceof File;
};

/**
 * Type guard to check if an image entry is null (deleted main image)
 * @param {string | File | null} entry - The image array entry
 * @returns {boolean} - True if the entry is null
 */
export const isDeletedImageSlot = (entry) => {
  return entry === null;
};

/**
 * Validate the unified images array before submission
 * @param {Array<string | File | null>} images - The unified images array
 * @returns {{ valid: boolean, errors: string[] }} - Validation result with error messages
 */
export const validateImagesArray = (images) => {
  const errors = [];

  // Check if images array exists and has at least one item
  if (!images || !Array.isArray(images) || images.length === 0) {
    errors.push("At least one image is required.");
    return { valid: false, errors };
  }

  // Check if main image (index 0) exists and is not null
  if (images[0] === null || images[0] === undefined) {
    errors.push("Main image is required.");
  }

  // Check for null/undefined values in the array (shouldn't happen for index 1+ due to shifting)
  for (let i = 1; i < images.length; i++) {
    if (images[i] === null || images[i] === undefined) {
      errors.push("Please fill all empty image slots.");
      break; // Only show this error once
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Remove an image from the additional images (index 1+) and shift remaining images backward
 * @param {Array<string | File | null>} images - The unified images array
 * @param {number} indexToRemove - The index to remove (must be >= 1)
 * @returns {Array<string | File | null>} - New array with the image removed and others shifted
 */
export const removeAdditionalImage = (images, indexToRemove) => {
  if (indexToRemove < 1) {
    console.warn("removeAdditionalImage should only be used for index >= 1. Use setMainImageToNull for index 0.");
    return images;
  }

  const newImages = [...images];
  // Remove the item at indexToRemove and shift everything after it backward
  newImages.splice(indexToRemove, 1);
  return newImages;
};

/**
 * Set the main image (index 0) to null when deleted
 * @param {Array<string | File | null>} images - The unified images array
 * @returns {Array<string | File | null>} - New array with index 0 set to null
 */
export const setMainImageToNull = (images) => {
  const newImages = [...images];
  newImages[0] = null;
  return newImages;
};

/**
 * Set or replace an image at a specific index
 * @param {Array<string | File | null>} images - The unified images array
 * @param {number} index - The index to set
 * @param {string | File} value - The new value (URL or File)
 * @returns {Array<string | File | null>} - New array with the updated value
 */
export const setImageAtIndex = (images, index, value) => {
  const newImages = [...images];
  // Ensure the array is long enough
  while (newImages.length <= index) {
    newImages.push(null);
  }
  newImages[index] = value;
  return newImages;
};

/**
 * Add a new image to the end of the array (for additional images)
 * @param {Array<string | File | null>} images - The unified images array
 * @param {File} file - The new file to add
 * @returns {Array<string | File | null>} - New array with the file appended
 */
export const addImageToEnd = (images, file) => {
  return [...images, file];
};

/**
 * Transform the unified images array into FormData format for backend submission
 * 
 * API Contract for Backend:
 * -------------------------
 * The FormData will contain:
 * 
 * 1. `images_metadata` (JSON string): Describes the final array structure
 *    Example: [
 *      { "index": 0, "type": "existing", "url": "/uploads/product/abc.jpg" },
 *      { "index": 1, "type": "new" },
 *      { "index": 2, "type": "existing", "url": "/uploads/product/def.jpg" },
 *      { "index": 3, "type": "new" }
 *    ]
 * 
 * 2. `images_new_0`, `images_new_1`, etc. (File objects): 
 *    The actual file uploads, keyed by their target index in the final array.
 *    Only indices with "type": "new" in metadata will have corresponding files.
 * 
 * Backend Logic:
 * - Parse `images_metadata` to understand the final array structure
 * - For "existing" entries: Keep the image at that URL (or copy/move as needed)
 * - For "new" entries: Look for `images_new_{index}` file and save it
 * - The final `gambar` field in the database should be the ordered array of URLs
 * 
 * @param {Array<string | File | null>} images - The unified images array
 * @returns {{ metadata: object[], files: object }} - Metadata array and files object
 */
export const transformImagesForSubmission = (images) => {
  if (!images || !Array.isArray(images)) {
    return { metadata: [], files: {} };
  }

  const metadata = [];
  const files = {};

  images.forEach((entry, index) => {
    if (isExistingImageUrl(entry)) {
      metadata.push({
        index,
        type: "existing",
        url: entry,
      });
    } else if (isNewImageFile(entry)) {
      metadata.push({
        index,
        type: "new",
      });
      files[`images_new_${index}`] = entry;
    }
    // Skip null entries (shouldn't be submitted, validation should catch this)
  });

  return { metadata, files };
};

/**
 * Get the preview URL for an image entry (for display in UI)
 * @param {string | File | null} entry - The image array entry
 * @returns {string | null} - The URL to display, or null if no image
 */
export const getImagePreviewUrl = (entry) => {
  if (isExistingImageUrl(entry)) {
    return entry; // Return the URL directly
  }
  if (isNewImageFile(entry)) {
    return URL.createObjectURL(entry);
  }
  return null;
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
